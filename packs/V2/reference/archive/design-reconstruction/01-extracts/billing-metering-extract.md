---
document_id: BILLING-EXTRACT-2026-02-20
version: 1
date: 2026-02-20
format: Comprehensive Billing/Metering/Quota Domain Extraction
sources:
  - CHAT-EXPORT-ANALYSIS.md (Discovery 3 — pricing model)
  - DECISION-REGISTER.md (DEC-025, DEC-036, DEC-045)
  - BACKLOG.md (BL-012, BL-013)
  - INTERACTION-POINTS.md (EXT-003, DB-004, DB-005, UF-004)
  - LIBRARY-REFERENCE.md (LIB-08 Stripe SDK)
  - dify-analysis/31-billing-and-feature-management.md (Dify billing patterns)
  - DIFY-ANALYSIS-SUMMARY.md (billing comparison)
---

# Billing, Metering & Quota Domain — Complete Extraction

## Executive Summary

This extraction consolidates all billing, metering, quota enforcement, and Stripe integration patterns from reverse-engineering analysis of Superagent, Dify, and the NYQST platform. The goal is to provide a complete specification for implementing v1 billing without reimplementation risk.

**Key findings:**
- **Pricing unit:** 1 run = 1 AI generation message (not 1 chat, not 1 token)
- **Superagent model:** $20/month = 200 runs/month, $0.50/run overage, reads are free
- **Billing approach:** Port working Stripe code from `okestraai/DocuIntelli`
- **Budget enforcement:** In-graph LangGraph state accumulator with $2/run hard limit (DEC-045)
- **Per-run cost tracking:** LiteLLM proxy + Langfuse self-hosted for observability
- **Webhook security:** Raw body requirement for Stripe signature verification (LIB-08 gotcha)

---

## 1. Pricing Model

### 1.1 Superagent Pricing (Observed from Chat Export, 2026-02-16)

**Tier: Pro Plan**
- **Monthly cost:** $20/month
- **Included runs:** 200 runs/month
- **Overage rate:** $0.50 per additional run
- **Free reads:** Report reads and previews do not incur charges
- **Trial:** 30-day free trial, no credit card required

**Definition of "run":**
- 1 run = 1 AI generation message (confirmed from DEC-025)
- Clarification follow-ups count as separate runs
- Retries do NOT double-bill (tracked via `retry_attempts` field)

**Implied tiers (from DIFY-ANALYSIS-SUMMARY.md comparison):**
| Tier | Monthly Cost | Runs/Month | Overage |
|------|-------------|-----------|---------|
| Sandbox | Free | 10-50 | N/A (assumed blocked) |
| Professional | $20 | 200 | $0.50/run |
| Team/Enterprise | $X | X | Custom |

*Note: Only Pro was visible in chat export; Sandbox and Team inferred from Dify pattern and "30-day trial" language.*

**Source:** CHAT-EXPORT-ANALYSIS.md, Discovery 3

---

## 2. Database Schema

### 2.1 Complete Models

#### Subscription Table

```python
# SQLAlchemy async model (Python)
from datetime import datetime
from typing import Literal
from sqlalchemy import Column, String, Integer, DateTime, Enum, Boolean, Float

class Subscription(Base):
    """
    Billing subscription for a tenant/workspace.
    Maps to Stripe customer + subscription.
    """
    __tablename__ = "subscriptions"

    # Primary key
    id = Column(String(36), primary_key=True)  # UUID
    tenant_id = Column(String(36), ForeignKey("tenant.id"), index=True)

    # Stripe integration
    stripe_customer_id = Column(String(255), unique=True, index=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)

    # Plan and status
    plan_name = Column(String(50), default="sandbox")  # sandbox, professional, team
    billing_interval = Column(Enum("month", "year"), default="month")

    # Status lifecycle
    status = Column(
        Enum("active", "canceled", "past_due", "incomplete", "unpaid"),
        default="active"
    )

    # Entitlements (denormalized for fast lookup, sourced from Stripe)
    monthly_runs_limit = Column(Integer, default=10)  # 10 for sandbox, 200 for pro
    is_trial = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime)

    # Dates
    started_at = Column(DateTime, default=datetime.utcnow)
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    canceled_at = Column(DateTime, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="subscription")
    usage_records = relationship("UsageRecord", back_populates="subscription", cascade="all, delete-orphan")
```

**Design notes:**
- Stripe customer ID is unique index for idempotent webhook handling
- `status` maps to Stripe subscription state
- `monthly_runs_limit` is denormalized from Stripe plan metadata for fast quota checks
- `is_trial` and `trial_ends_at` track trial state (important for UX signaling)
- Relationships enable cascading queries: `subscription.usage_records` for monthly aggregation

**Source:** DEC-036 (port from DocuIntelli), DB-004 (INTERACTION-POINTS)

---

#### UsageRecord Table

```python
class UsageRecord(Base):
    """
    Per-run usage tracking. One record per AI generation message.
    Used for quota enforcement and invoice line item generation.
    """
    __tablename__ = "usage_records"

    # Primary key
    id = Column(String(36), primary_key=True)  # UUID

    # Foreign keys
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), index=True)
    tenant_id = Column(String(36), ForeignKey("tenant.id"), index=True)
    run_id = Column(String(36), ForeignKey("runs.id"), index=True, nullable=True)
    message_id = Column(String(36), nullable=True)  # ChatMessage.id from Superagent mapping

    # Usage metrics
    feature_name = Column(String(100), default="research_run")  # research_run, report_generation, etc.
    quantity = Column(Integer, default=1)  # Usually 1 for research runs

    # Cost tracking (populated by LangGraph state + Langfuse)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost_cents = Column(Integer, default=0)  # Cost in cents (e.g., 42 = $0.42)

    # Billing event tracking
    status = Column(
        Enum("pending", "billed", "refunded"),
        default="pending"
    )
    billing_event_id = Column(String(255), nullable=True)  # Stripe invoice line item ID

    # Metadata for audit
    metadata = Column(JSON, default={})  # {"run_type": "website", "model": "gpt-4o-mini", ...}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subscription = relationship("Subscription", back_populates="usage_records")
    run = relationship("Run", back_populates="usage_records")
    tenant = relationship("Tenant")
```

**Design notes:**
- `quantity=1` for current MVP; future: batched operations may use quantity > 1
- `cost_cents` stored as integer to avoid float precision issues (standard practice for money)
- `status` tracks billing lifecycle: pending → billed (in invoice) → refunded (if needed)
- `metadata` is JSON for audit trail (what model was used, deliverable type, etc.)
- Indexed on `tenant_id` and `created_at` for monthly billing queries: `SELECT SUM(cost_cents) FROM usage_records WHERE tenant_id = X AND created_at >= month_start`
- Indexed on `subscription_id` for quota checks during run creation

**Source:** DB-005 (INTERACTION-POINTS), DEC-025 (billing unit definition)

---

### 2.2 Relationships and Access Patterns

```
Tenant (1) ---< (N) Subscription
Subscription (1) ---< (N) UsageRecord
Run (1) ---< (N) UsageRecord
```

**Key queries:**

```python
# Quota check during run creation (BL-013 quota middleware)
async def check_quota(tenant_id: str, session: AsyncSession) -> bool:
    """
    Check if tenant can create a new run.
    Returns True if usage < monthly_limit.
    """
    # Get current subscription
    sub = await session.execute(
        select(Subscription)
        .where(Subscription.tenant_id == tenant_id)
        .where(Subscription.status == "active")
    )
    subscription = sub.scalar_one_or_none()

    if not subscription:
        return False  # No active subscription

    # Count this month's runs
    current_month_start = datetime(now.year, now.month, 1)
    usage = await session.execute(
        select(func.count(UsageRecord.id))
        .where(UsageRecord.subscription_id == subscription.id)
        .where(UsageRecord.created_at >= current_month_start)
    )
    used_runs = usage.scalar() or 0

    return used_runs < subscription.monthly_runs_limit
```

```python
# Invoice generation (monthly batch job)
async def generate_monthly_invoice(tenant_id: str, month: datetime):
    """
    Create invoice line items for all usage in a month.
    """
    subscription = await get_active_subscription(tenant_id)

    # Query usage records for the month
    month_start = datetime(month.year, month.month, 1)
    month_end = month_start + timedelta(days=32)  # Safe range

    records = await session.execute(
        select(UsageRecord)
        .where(UsageRecord.subscription_id == subscription.id)
        .where(UsageRecord.created_at >= month_start)
        .where(UsageRecord.created_at < month_end)
        .where(UsageRecord.status == "pending")  # Not yet billed
    )

    total_runs = len(records)
    included_runs = subscription.monthly_runs_limit
    overage_runs = max(0, total_runs - included_runs)

    # Base subscription charge (already paid)
    base_charge = 2000  # $20.00 in cents for Pro

    # Overage charge
    overage_charge = overage_runs * 50  # $0.50 per run in cents

    total_charge = base_charge + overage_charge

    # Create Stripe invoice via BillingService.create_invoice()
    # Mark all records as billed
    for record in records:
        record.status = "billed"

    await session.commit()
```

---

## 3. Stripe Integration

### 3.1 Webhook Handler (FastAPI)

**Key gotcha from LIB-08:**
> Webhook signature verification requires the **raw bytes** body, not a parsed JSON dict.

```python
# src/intelli/api/v1/billing.py

from fastapi import APIRouter, Request, HTTPException
from stripe import Webhook, SignatureVerificationError, StripeClient
import os

billing_router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")

stripe_client = StripeClient(api_key=STRIPE_API_KEY)

@billing_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle Stripe webhook events: subscription updates, payment failures, etc.

    CRITICAL: Must read raw body for signature verification.
    """
    # Read raw body (required for signature verification)
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    # Verify signature
    try:
        event = Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Bad signature: {str(e)}")

    # Route event type
    if event.type == "customer.subscription.updated":
        await handle_subscription_updated(event, db)
    elif event.type == "customer.subscription.deleted":
        await handle_subscription_canceled(event, db)
    elif event.type == "invoice.payment_failed":
        await handle_payment_failed(event, db)
    elif event.type == "invoice.paid":
        await handle_invoice_paid(event, db)

    return {"status": "received"}


async def handle_subscription_updated(event: dict, db: AsyncSession):
    """
    Update local subscription record from Stripe event.
    Handles plan changes, billing interval changes, trial end, etc.
    """
    subscription_data = event["data"]["object"]
    stripe_sub_id = subscription_data["id"]
    stripe_customer_id = subscription_data["customer"]

    # Find subscription by Stripe ID
    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == stripe_sub_id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        # Edge case: webhook arrived before subscription record created
        # Look up by customer ID instead
        result = await db.execute(
            select(Subscription).where(
                Subscription.stripe_customer_id == stripe_customer_id
            )
        )
        subscription = result.scalar_one()

    # Update from Stripe data
    subscription.status = subscription_data["status"]
    subscription.current_period_start = datetime.fromtimestamp(
        subscription_data["current_period_start"]
    )
    subscription.current_period_end = datetime.fromtimestamp(
        subscription_data["current_period_end"]
    )

    # Extract plan info from metadata (must be set during Stripe setup)
    plan_metadata = subscription_data["metadata"]
    subscription.plan_name = plan_metadata.get("plan_name", "sandbox")
    subscription.monthly_runs_limit = int(
        plan_metadata.get("monthly_runs_limit", 10)
    )

    if "trial_end" in subscription_data:
        subscription.trial_ends_at = datetime.fromtimestamp(
            subscription_data["trial_end"]
        )

    await db.commit()


async def handle_subscription_canceled(event: dict, db: AsyncSession):
    """
    Revoke access when subscription is canceled.
    User can still view past data but cannot create new runs.
    """
    subscription_data = event["data"]["object"]
    stripe_sub_id = subscription_data["id"]

    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == stripe_sub_id
        )
    )
    subscription = result.scalar_one()

    subscription.status = "canceled"
    subscription.canceled_at = datetime.utcnow()

    await db.commit()


async def handle_payment_failed(event: dict, db: AsyncSession):
    """
    Log payment failure. Could trigger email, account freeze, etc.
    """
    invoice_data = event["data"]["object"]
    subscription_id = invoice_data.get("subscription")

    if not subscription_id:
        return  # Not tied to a subscription

    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == subscription_id
        )
    )
    subscription = result.scalar_one_or_none()

    if subscription:
        subscription.status = "past_due"
        await db.commit()

        # TODO: Send email notification, check if we should freeze account


async def handle_invoice_paid(event: dict, db: AsyncSession):
    """
    Update paid status when invoice is successfully paid.
    """
    invoice_data = event["data"]["object"]
    subscription_id = invoice_data.get("subscription")

    if not subscription_id:
        return

    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == subscription_id
        )
    )
    subscription = result.scalar_one_or_none()

    if subscription and subscription.status == "past_due":
        subscription.status = "active"
        await db.commit()
```

**Design notes:**
- FastAPI `await request.body()` gives raw bytes for signature verification
- Do NOT parse JSON first, then re-encode — it changes the signature
- Use `Webhook.construct_event()` from `stripe` module (v11+)
- Event routing by `event.type` allows modular handler functions
- Idempotency: webhook may be retried; handler should be idempotent (check `where stripe_sub_id == X`)

**Source:** LIB-08 (Stripe SDK, gotchas section), INTERACTION-POINTS.md (EXT-003, UF-004)

---

### 3.2 Checkout Session Creation

```python
@billing_router.post("/checkout")
async def create_checkout_session(
    request_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    current_tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a Stripe checkout session for plan upgrade.

    POST /api/v1/billing/checkout
    {
        "plan_name": "professional",
        "billing_interval": "month",
        "success_url": "https://app.example.com/billing/success",
        "cancel_url": "https://app.example.com/billing/cancel"
    }
    """
    # Validate plan exists in Stripe
    if request_data.plan_name not in STRIPE_PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    plan_config = STRIPE_PLANS[request_data.plan_name][request_data.billing_interval]

    # Get or create Stripe customer
    result = await db.execute(
        select(Subscription).where(
            Subscription.tenant_id == current_tenant_id
        )
    )
    subscription = result.scalar_one_or_none()

    if subscription and subscription.stripe_customer_id:
        stripe_customer_id = subscription.stripe_customer_id
    else:
        # Create new customer
        customer = stripe_client.v1.customers.create(params={
            "email": current_user.email,
            "metadata": {
                "tenant_id": current_tenant_id,
                "account_id": current_user.id,
            }
        })
        stripe_customer_id = customer.id

    # Create checkout session
    session = stripe_client.v1.checkout.sessions.create(params={
        "mode": "subscription",
        "customer": stripe_customer_id,
        "line_items": [
            {
                "price": plan_config["stripe_price_id"],
                "quantity": 1,
            }
        ],
        "success_url": request_data.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": request_data.cancel_url,
        "metadata": {
            "plan_name": request_data.plan_name,
            "billing_interval": request_data.billing_interval,
            "tenant_id": current_tenant_id,
        }
    })

    return {"checkout_url": session.url}
```

**Design notes:**
- Price IDs are configured in Stripe dashboard, stored in env or config
- Metadata is critical for webhook handler to know which plan/interval was selected
- Session success URL includes `{CHECKOUT_SESSION_ID}` placeholder
- Success handler should verify session status before updating subscription

---

### 3.3 Stripe Plan Configuration

```python
# src/intelli/config/stripe_config.py

STRIPE_PLANS = {
    "sandbox": {
        "month": {
            "stripe_price_id": "price_xxx_sandbox_month",
            "amount_cents": 0,
            "monthly_runs_limit": 10,
        },
        "year": {
            "stripe_price_id": "price_xxx_sandbox_year",
            "amount_cents": 0,
            "monthly_runs_limit": 10,
        },
    },
    "professional": {
        "month": {
            "stripe_price_id": "price_xxx_pro_month",
            "amount_cents": 2000,  # $20.00
            "monthly_runs_limit": 200,
        },
        "year": {
            "stripe_price_id": "price_xxx_pro_year",
            "amount_cents": 20000,  # $200.00 (10% discount)
            "monthly_runs_limit": 200,
        },
    },
    "team": {
        "month": {
            "stripe_price_id": "price_xxx_team_month",
            "amount_cents": 5000,  # $50.00
            "monthly_runs_limit": 1000,
        },
        "year": {
            "stripe_price_id": "price_xxx_team_year",
            "amount_cents": 50000,  # $500.00
            "monthly_runs_limit": 1000,
        },
    },
}

# Metadata attached to each price in Stripe:
# {
#   "plan_name": "professional",
#   "monthly_runs_limit": "200",
#   "overage_rate_cents": "50"
# }
```

**Critical setup steps in Stripe:**
1. Create products for each plan (Sandbox, Professional, Team)
2. Create prices with metadata: `plan_name`, `monthly_runs_limit`, `overage_rate_cents`
3. Set webhook endpoint: `POST https://api.example.com/api/v1/billing/webhooks/stripe`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 4. Budget Enforcement (DEC-045)

### 4.1 Per-Run $2 Hard Limit in LangGraph State

**Location:** ResearchAssistantGraph input state + conditional edge

```python
# src/intelli/agents/graphs/research_orchestrator.py

from langgraph.graph import StateGraph
from langgraph.types import Send
from pydantic import BaseModel

class RunState(BaseModel):
    """Full state for a research run."""
    run_id: str
    tenant_id: str
    user_query: str

    # Budget tracking (added in DEC-045)
    accumulated_cost_cents: int = 0  # Total cost so far in cents
    max_cost_cents: int = 200  # $2.00 hard limit

    # ... other fields: messages, retrieved_docs, etc.


async def check_budget_exceeded(state: RunState) -> str:
    """
    Conditional edge: check if we've exceeded per-run budget.
    If yes, route to END node and emit BUDGET_EXCEEDED event.
    """
    if state.accumulated_cost_cents >= state.max_cost_cents:
        return "budget_exceeded"  # Route to END
    return "continue"  # Route to next node


async def planner_node(state: RunState) -> RunState:
    """Plan the research approach."""
    # ... decompose query into tasks ...
    return state


async def research_node(state: RunState, config: RunnableConfig) -> RunState:
    """
    Execute one research workstream (web search, retrieval, etc.).
    Track cost and update state.
    """
    # Get LLM cost from LiteLLM + Langfuse
    llm_cost_cents = await get_llm_cost_from_langfuse(state.run_id)

    state.accumulated_cost_cents += llm_cost_cents

    # Check budget before continuing to next node
    if state.accumulated_cost_cents >= state.max_cost_cents:
        # Emit budget exceeded event
        await emit_runeven(RunEventType.BUDGET_EXCEEDED, state.run_id, {
            "accumulated_cost_cents": state.accumulated_cost_cents,
            "limit_cents": state.max_cost_cents,
        })

    return state


async def synthesizer_node(state: RunState) -> RunState:
    """Synthesize findings into deliverable."""
    # Check budget before synthesis
    if state.accumulated_cost_cents >= state.max_cost_cents:
        # Truncate synthesis or skip
        state.is_truncated = True

    # ... synthesis logic ...
    return state


# Graph assembly
builder = StateGraph(RunState)
builder.add_node("planner", planner_node)
builder.add_node("research", research_node)
builder.add_node("synthesizer", synthesizer_node)

# Conditional edge: check budget
builder.add_conditional_edges(
    "research",
    check_budget_exceeded,
    {
        "budget_exceeded": END,
        "continue": "synthesizer",
    }
)

builder.set_entry_point("planner")
builder.add_edge("planner", "research")
builder.add_edge("synthesizer", END)

graph = builder.compile(checkpointer=postgres_saver)
```

**Design notes:**
- `accumulated_cost_cents` is integer to avoid float precision issues
- $2.00 hard limit (200 cents) is per-run, not per-query
- LiteLLM auto-tracks token usage via Langfuse callbacks (see section 4.2)
- Conditional edge `check_budget_exceeded` prevents next node from executing
- If budget exceeded mid-synthesis, emit event and truncate output
- User sees in UI: "This analysis was truncated due to cost limit"

**Source:** DEC-045 (resolved OQ-004), resolves open question on "LLM cost budget per research run"

---

### 4.2 Cost Tracking via LiteLLM + Langfuse

**Architecture:**

```
LangGraph ResearchAssistantGraph
    ↓
LangChain ChatOpenAI (via LangGraph nodes)
    ↓
LiteLLM proxy layer (wraps ChatOpenAI)
    ↓ (callback)
Langfuse self-hosted (MIT)
    ↓ (REST API query)
FastAPI endpoint queries Langfuse for cost
```

**Setup:**

```python
# src/intelli/agents/callbacks.py

from langfuse import Langfuse
from langchain_core.callbacks import BaseCallbackHandler
import httpx

# Langfuse self-hosted (DEC-045: not LangSmith)
langfuse_client = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host="https://langfuse.example.com",  # Self-hosted
)


async def get_llm_cost_from_langfuse(run_id: str) -> int:
    """
    Query Langfuse REST API for cumulative cost of a run.
    Returns cost in cents.
    """
    # Langfuse REST API: GET /api/public/traces?name={run_id}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://langfuse.example.com/api/public/traces",
            params={"name": run_id},
            auth=(LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY),
        )
        response.raise_for_status()
        traces = response.json()["data"]

    # Sum costs across all spans in the trace
    total_cost = sum(
        span.get("costUSD", 0) * 100  # Convert to cents
        for trace in traces
        for span in trace.get("spans", [])
    )

    return int(total_cost)


class LangfuseCallback(BaseCallbackHandler):
    """
    Callback handler that sends LLM calls to Langfuse.
    LiteLLM already does this via environment variables.
    This is optional redundancy.
    """
    def on_llm_end(self, response, *, run_id=None, **kwargs):
        # LiteLLM has already sent usage to Langfuse
        pass
```

**LiteLLM Configuration:**

```python
# src/intelli/config/llm_config.py

import litellm
from litellm import Router

litellm.set_verbose(False)

# Enable Langfuse callbacks
os.environ["LANGFUSE_PUBLIC_KEY"] = os.getenv("LANGFUSE_PUBLIC_KEY")
os.environ["LANGFUSE_SECRET_KEY"] = os.getenv("LANGFUSE_SECRET_KEY")
os.environ["LANGFUSE_HOST"] = "https://langfuse.example.com"

# Use LiteLLM as a proxy for cost tracking
# All LLM calls go through LiteLLM → Langfuse
llm_router = Router(
    model_list=[
        {
            "model_name": "gpt-4o-mini",
            "litellm_params": {
                "model": "gpt-4o-mini",
                "api_key": os.getenv("OPENAI_API_KEY"),
            }
        }
    ]
)
```

**Why Langfuse (not LangSmith)?**
- **License:** Langfuse is MIT (self-hosted), LangSmith is proprietary SaaS
- **Cost:** Self-hosted is one-time infrastructure, no per-run fees
- **Integration:** Works with any LLM provider via LiteLLM proxy
- **Budget enforcement:** Langfuse REST API allows querying costs to enforce hard limits

**Source:** DEC-042 (LiteLLM multi-provider), DEC-045 (Langfuse self-hosted budget), LIB-08 (Stripe integration notes)

---

## 5. Quota Enforcement Middleware

### 5.1 FastAPI Middleware (BL-013)

```python
# src/intelli/api/middleware/quota_middleware.py

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

class QuotaEnforcementMiddleware(BaseHTTPMiddleware):
    """
    Check quota before allowing run creation.
    Applied to POST /api/v1/runs endpoint.
    """

    async def dispatch(self, request: Request, call_next):
        # Only check for run creation
        if request.url.path == "/api/v1/runs" and request.method == "POST":
            # Extract tenant_id from JWT or request
            tenant_id = request.headers.get("X-Tenant-ID")
            if not tenant_id:
                return await call_next(request)  # Skip if no tenant

            # Check quota
            can_run = await self.check_quota(tenant_id)
            if not can_run:
                raise HTTPException(
                    status_code=429,
                    detail="Monthly run limit exceeded. Upgrade your plan or try again next month.",
                )

        return await call_next(request)

    async def check_quota(self, tenant_id: str) -> bool:
        """
        Check if tenant can create a new run this month.
        """
        from sqlalchemy import select, func
        from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
        from datetime import datetime

        async with AsyncSession(engine) as session:
            # Get active subscription
            result = await session.execute(
                select(Subscription)
                .where(Subscription.tenant_id == tenant_id)
                .where(Subscription.status == "active")
            )
            subscription = result.scalar_one_or_none()

            if not subscription:
                return False  # No active subscription

            # Count this month's runs
            now = datetime.utcnow()
            month_start = datetime(now.year, now.month, 1)

            count_result = await session.execute(
                select(func.count(UsageRecord.id))
                .where(UsageRecord.subscription_id == subscription.id)
                .where(UsageRecord.created_at >= month_start)
            )
            used_runs = count_result.scalar() or 0

            return used_runs < subscription.monthly_runs_limit
```

**Alternative: Decorator approach**

```python
# src/intelli/api/dependencies.py

from functools import wraps
from fastapi import Depends, HTTPException

async def check_billing_quota(tenant_id: str = Depends(get_current_tenant), db: AsyncSession = Depends(get_db)):
    """Dependency for quota checking."""
    # Query subscription and usage
    sub = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    )
    subscription = sub.scalar_one_or_none()

    if not subscription or subscription.status != "active":
        raise HTTPException(status_code=402, detail="No active subscription")

    # Check quota
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    usage = await db.execute(
        select(func.count(UsageRecord.id))
        .where(UsageRecord.subscription_id == subscription.id)
        .where(UsageRecord.created_at >= month_start)
    )
    used_runs = usage.scalar() or 0

    if used_runs >= subscription.monthly_runs_limit:
        raise HTTPException(status_code=429, detail="Quota exceeded")

    return subscription


# Usage in router
@app.post("/api/v1/runs")
async def create_run(
    request: RunRequest,
    subscription: Subscription = Depends(check_billing_quota),
    db: AsyncSession = Depends(get_db),
):
    # Create run...
    pass
```

**Design notes:**
- Quota check happens BEFORE graph execution
- 429 status code (Too Many Requests) signals quota exhaustion
- Return value includes subscription for followup checks (e.g., overage rate)
- For middleware: simpler, applies to all endpoints; for decorator: more granular control

**Source:** BL-013 (BACKLOG), INTERACTION-POINTS.md (DB-004/DB-005)

---

## 6. Usage Tracking

### 6.1 Recording Usage After Run Completion

```python
# src/intelli/agents/graphs/research_orchestrator.py

async def record_usage_after_run(
    run_id: str,
    tenant_id: str,
    final_state: RunState,
    db: AsyncSession,
):
    """
    After graph completes, create UsageRecord for this run.
    Called from the API endpoint after graph.ainvoke() returns.
    """
    # Get subscription
    sub = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    )
    subscription = sub.scalar_one()

    # Query Langfuse for total cost of this run
    total_cost_usd = await get_run_cost_from_langfuse(run_id)
    cost_cents = int(total_cost_usd * 100)

    # Create usage record
    usage_record = UsageRecord(
        id=str(uuid4()),
        subscription_id=subscription.id,
        tenant_id=tenant_id,
        run_id=run_id,
        feature_name="research_run",
        quantity=1,
        input_tokens=final_state.total_input_tokens,
        output_tokens=final_state.total_output_tokens,
        total_tokens=final_state.total_input_tokens + final_state.total_output_tokens,
        cost_cents=cost_cents,
        status="pending",  # Will be marked "billed" during monthly invoice
        metadata={
            "run_type": "website",  # or "report", "slides", etc.
            "deliverable_type": final_state.deliverable_type,
            "model": "gpt-4o-mini",
            "request_duration_seconds": (
                final_state.completed_at - final_state.created_at
            ).total_seconds(),
        },
    )

    db.add(usage_record)
    await db.commit()
```

**Integration point in API:**

```python
# src/intelli/api/v1/runs.py

@runs_router.post("/runs")
async def start_run(
    request: RunRequest,
    current_user: User = Depends(get_current_user),
    current_tenant_id: str = Depends(get_current_tenant),
    subscription: Subscription = Depends(check_billing_quota),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a run and execute the research orchestrator graph.
    """
    # Create Run record
    run = Run(
        id=str(uuid4()),
        tenant_id=current_tenant_id,
        user_id=current_user.id,
        status="running",
        config=request.config,
    )
    db.add(run)
    await db.commit()

    # Execute graph
    try:
        final_state = await graph.ainvoke(
            {
                "run_id": run.id,
                "tenant_id": current_tenant_id,
                "user_query": request.query,
                "accumulated_cost_cents": 0,
                "max_cost_cents": 200,  # $2 hard limit
            },
            config={"configurable": {"thread_id": run.id}},
        )

        # Record usage
        await record_usage_after_run(run.id, current_tenant_id, final_state, db)

        # Update run status
        run.status = "completed"
        run.completed_at = datetime.utcnow()
        await db.commit()

        return {"run_id": run.id, "status": "completed"}

    except Exception as e:
        run.status = "error"
        run.error_message = str(e)
        await db.commit()

        # Still record usage even on error (for accurate billing)
        await record_usage_after_run(run.id, current_tenant_id, final_state, db)

        raise
```

**Design notes:**
- Usage record created AFTER graph completes, not before
- Cost pulled from Langfuse REST API (not recalculated)
- `metadata` field captures run context for analytics
- Usage record status: `pending` → `billed` during monthly invoice batch job
- Even failed runs incur charges (user got partial results or they hit budget limit)

**Source:** DEC-025 (billing unit), Dify pattern (message-level cost tracking)

---

## 7. Monthly Billing & Invoice Generation

### 7.1 Batch Job (arq + FastAPI)

```python
# src/intelli/workers/billing_worker.py

import arq
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import select, func

async def generate_monthly_invoices(ctx):
    """
    Cron job: Run on the 1st of each month at 00:00 UTC.
    Generate invoices for all active subscriptions.
    """
    async_engine = ctx["engine"]

    async with AsyncSession(async_engine) as session:
        # Get all active subscriptions
        result = await session.execute(
            select(Subscription).where(Subscription.status == "active")
        )
        subscriptions = result.scalars().all()

        # Process each subscription
        for subscription in subscriptions:
            await generate_invoice_for_subscription(session, subscription)

        await session.commit()


async def generate_invoice_for_subscription(
    session: AsyncSession,
    subscription: Subscription,
):
    """
    Generate a single invoice for a subscription.
    """
    # Determine billing period
    now = datetime.utcnow()
    if subscription.current_period_end:
        period_end = subscription.current_period_end
        period_start = subscription.current_period_start
    else:
        # Fallback: use calendar month
        period_end = datetime(now.year, now.month, 1) + timedelta(days=32)
        period_end = period_end.replace(day=1)
        period_start = period_end.replace(day=1) - timedelta(days=1)
        period_start = period_start.replace(day=1)

    # Query usage records for this period
    result = await session.execute(
        select(UsageRecord)
        .where(UsageRecord.subscription_id == subscription.id)
        .where(UsageRecord.created_at >= period_start)
        .where(UsageRecord.created_at < period_end)
        .where(UsageRecord.status == "pending")
    )
    pending_records = result.scalars().all()

    if not pending_records:
        return  # No usage this month

    # Calculate charges
    total_runs = len(pending_records)
    included_runs = subscription.monthly_runs_limit
    overage_runs = max(0, total_runs - included_runs)

    # Base charge (from plan)
    plan_config = STRIPE_PLANS[subscription.plan_name][subscription.billing_interval]
    base_charge_cents = plan_config["amount_cents"]

    # Overage charge ($0.50 per run)
    overage_charge_cents = overage_runs * 50

    # Total
    total_charge_cents = base_charge_cents + overage_charge_cents

    # Create Stripe invoice
    from stripe import StripeClient
    stripe_client = StripeClient(api_key=os.getenv("STRIPE_API_KEY"))

    invoice = stripe_client.v1.invoices.create(params={
        "customer": subscription.stripe_customer_id,
        "collection_method": "charge_automatically",
        "auto_advance": True,  # Finalize and send email
        "description": f"Research runs invoice for {period_start.strftime('%B %Y')}",
        "metadata": {
            "subscription_id": subscription.id,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
        },
    })

    # Add line items
    stripe_client.v1.invoices.line_items.create(
        params={
            "invoice": invoice.id,
            "type": "invoiceitem",
            "customer": subscription.stripe_customer_id,
            "amount": base_charge_cents,
            "currency": "usd",
            "description": f"Subscription: {subscription.plan_name} ({total_runs} runs)",
            "metadata": {
                "runs_count": str(total_runs),
                "included_runs": str(included_runs),
            },
        }
    )

    if overage_charge_cents > 0:
        stripe_client.v1.invoices.line_items.create(
            params={
                "invoice": invoice.id,
                "type": "invoiceitem",
                "customer": subscription.stripe_customer_id,
                "amount": overage_charge_cents,
                "currency": "usd",
                "description": f"Overage: {overage_runs} additional runs @ $0.50/run",
                "metadata": {
                    "overage_runs": str(overage_runs),
                },
            }
        )

    # Finalize invoice
    stripe_client.v1.invoices.finalize_invoice(invoice.id)

    # Mark usage records as billed
    for record in pending_records:
        record.status = "billed"
        record.billing_event_id = invoice.id

    await session.commit()


# arq worker settings
class WorkerSettings:
    functions = [generate_monthly_invoices]
    cron_jobs = [
        # Run at 00:00 UTC on the 1st of each month
        cron(generate_monthly_invoices, hour=0, minute=0, day=1, unique=True)
    ]
    redis_settings = RedisSettings(host="redis", port=6379)
    max_jobs = 1
    job_timeout = 3600  # 1 hour
```

**Webhook handler to finalize invoice:**

```python
async def handle_invoice_paid(event: dict, db: AsyncSession):
    """
    Mark usage records as paid when invoice is successfully charged.
    """
    invoice_data = event["data"]["object"]
    invoice_id = invoice_data["id"]

    # Find all usage records linked to this invoice
    result = await db.execute(
        select(UsageRecord)
        .where(UsageRecord.billing_event_id == invoice_id)
    )
    records = result.scalars().all()

    # Update status
    for record in records:
        if invoice_data["status"] == "paid":
            record.status = "paid"
        elif invoice_data["status"] == "open":
            record.status = "billed"

    await db.commit()
```

**Design notes:**
- Invoice generation is idempotent: run it multiple times safely
- Line items created separately for base + overage for clarity in Stripe dashboard
- Usage records marked as `billed` when invoice created, not when paid
- `auto_advance: True` finalizes invoice and sends email automatically
- Webhook confirms payment, updates status to `paid`

**Source:** DEC-025 (billing unit), DEC-036 (port from DocuIntelli), Dify patterns

---

## 8. Webhook Security Deep Dive (LIB-08 Gotcha)

### 8.1 The Raw Body Requirement

```python
# WRONG: Parsing JSON first changes the signature
@app.post("/webhooks/stripe")
async def webhook_handler_wrong(request: Request):
    """This will FAIL signature verification."""
    # Parsing changes the body encoding
    payload_dict = await request.json()
    sig = request.headers["Stripe-Signature"]

    # Stripe's signature was computed on the original bytes
    # But payload_dict is now Python dict, not bytes
    event = Webhook.construct_event(payload_dict, sig, WEBHOOK_SECRET)  # FAILS!
```

```python
# CORRECT: Read raw bytes for signature verification
@app.post("/webhooks/stripe")
async def webhook_handler_correct(request: Request):
    """This will succeed."""
    # Get raw body (before JSON parsing)
    payload = await request.body()
    sig = request.headers.get("Stripe-Signature", "")

    # Webhook.construct_event validates signature over the raw bytes
    try:
        event = Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # NOW you can access the event dict
    subscription = event["data"]["object"]
```

### 8.2 Signature Verification Implementation

```python
from stripe import Webhook, SignatureVerificationError

def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> dict:
    """
    Verify Stripe webhook signature and return parsed event.

    Raises SignatureVerificationError if signature is invalid or timestamp is old.
    """
    try:
        # Stripe checks:
        # 1. Signature format (v1=<hash>)
        # 2. HMAC-SHA256 matches expected value
        # 3. Timestamp is recent (within 5 minutes)
        event = Webhook.construct_event(payload, signature, secret)
        return event
    except SignatureVerificationError as e:
        # Log suspicious activity
        logger.warning(f"Invalid Stripe webhook signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")
```

### 8.3 Timestamp Validation

Stripe includes a timestamp in the signature header: `t=<unix_timestamp>,v1=<hash>`

The `Webhook.construct_event()` method:
1. Extracts the timestamp
2. Verifies it's within 5 minutes of the current time
3. Prevents replay attacks

**To be extra safe:**

```python
import time

@app.post("/webhooks/stripe")
async def stripe_webhook_with_timestamp_check(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    # Extract timestamp from signature header
    # Format: "t=1234567890,v1=signature_hash"
    timestamp_str = sig_header.split(",")[0].split("=")[1]
    timestamp = int(timestamp_str)

    # Ensure timestamp is recent (within 5 minutes)
    current_time = int(time.time())
    if abs(current_time - timestamp) > 300:  # 5 minutes
        logger.warning(f"Webhook timestamp too old: {timestamp}")
        raise HTTPException(status_code=400, detail="Webhook timestamp too old")

    try:
        event = Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Bad signature")

    return {"status": "received"}
```

**Source:** LIB-08 (Stripe Python SDK gotchas), INTERACTION-POINTS.md (UF-004)

---

## 9. Competitive Analysis: Dify vs. NYQST Billing

### 9.1 Dify's Billing Architecture

**Edition tiers:**
- **SELF_HOSTED:** No billing (self-serve license or free)
- **CLOUD:** External billing API integration
- **ENTERPRISE:** License-based with workspace limits

**Dify's approach:**
```python
class BillingService:
    def get_info(tenant_id) -> BillingInfo:
        """Fetch subscription, quotas, usage from external Billing API"""
        # GET /subscription/info
        # Returns: enabled, plan, quotas, usage

    def get_tenant_feature_plan_usage_info(tenant_id) -> UsageInfo:
        """Get current month usage"""
        # GET /tenant-feature-usage/info

    def update_tenant_feature_plan_usage(tenant_id, feature_key, delta):
        """Increment usage (called per operation)"""
        # POST /tenant-feature-usage/usage
        # delta: positive (consume), negative (refund)
```

**Key differences from our approach:**
| Aspect | Dify | NYQST |
|--------|------|-------|
| **Billing integration** | External API calls | Direct Stripe API |
| **Usage tracking** | Per-operation callbacks | Per-run batch |
| **Quota source** | Billing API response | Local DB subscription |
| **Cost tracking** | Via external API | Via LiteLLM + Langfuse |
| **Deployment model** | CLOUD edition specific | Integrated in platform |

**Dify's advantage:**
- Decoupled: billing service can be swapped without changing app code
- Multi-tenant: supports multiple billing providers (Stripe, Paddle, etc.)

**Dify's disadvantage:**
- Extra latency: every quota check requires HTTP call to external service
- Dependency risk: if billing API down, cannot create new runs

**Our approach (NYQST):**
- Coupled to Stripe, but simpler integration
- No external dependency during run creation (just local DB check)
- Billing data lives in app DB, not external service

**Recommendation:** Start with our direct Stripe approach for v1 (simpler). If multi-provider support needed later, add abstraction layer (BillingService interface) without changing core logic.

---

### 9.2 Dify's Rate Limiting

Dify implements dual-layer rate limiting:

**Layer 1: Quota check (per-tenant per-month)**
```python
# Quota from billing API
quota = BillingService.get_knowledge_rate_limit(tenant_id)
# Returns: {"enabled": bool, "limit": 10, "subscription_plan": str}

# Check in Redis with sliding window
redis_client.zadd(rate_limit_key, {current_time: current_time})
redis_client.zremrangebyscore(rate_limit_key, 0, current_time - 60000)
request_count = redis_client.zcard(rate_limit_key)

if request_count > quota.limit:
    raise RateLimitError()
```

**Layer 2: Annotation import concurrency limit**
- Short-term: 5 requests per minute
- Long-term: 20 requests per hour
- Concurrent job limit: max N simultaneous imports

**Our approach (NYQST):**
- Layer 1: Monthly quota checked at run creation (subscription.monthly_runs_limit)
- Layer 2: Per-run budget limit ($2) enforced in LangGraph state
- No concurrency limits yet (can add if needed)

**Dify's approach is more granular** but also more complex. For our use case (research runs, not rapid-fire API calls), our approach is sufficient. Can upgrade if needed.

---

## 10. Port Strategy from DocuIntelli

### 10.1 What to Take

**From okestraai/DocuIntelli (working Stripe integration):**

1. **Webhook handler structure**
   ```python
   # Take: event type routing pattern
   if event.type == "customer.subscription.updated":
       ...
   ```

2. **Subscription model**
   ```python
   # Take: Stripe customer + subscription linking
   class Subscription:
       stripe_customer_id: str
       stripe_subscription_id: str
       status: str
   ```

3. **Usage tracking pattern**
   ```python
   # Take: post-operation cost recording
   class UsageRecord:
       subscription_id: str
       cost_cents: int
       status: str  # pending → billed → paid
   ```

4. **Checkout session creation**
   ```python
   # Take: price lookup, session config, success URL handling
   ```

5. **Invoice generation batch job**
   ```python
   # Take: monthly cron, aggregation logic, line item creation
   ```

### 10.2 What to Redesign

1. **Cost tracking:** DocuIntelli may use fixed prices; we use LiteLLM + Langfuse for dynamic cost
2. **Budget enforcement:** We add LangGraph-level state accumulator (DocuIntelli may not have this)
3. **Quota mechanism:** We use subscription.monthly_runs_limit; adjust for our model
4. **Webhook security:** Verify we use raw body for signature verification (may be an issue in DocuIntelli)

### 10.3 Porting Steps

```bash
# 1. Examine DocuIntelli billing code
git clone https://github.com/okestraai/DocuIntelli.git
cd DocuIntelli
find . -name "*billing*" -o -name "*stripe*"  # Inspect structure

# 2. Copy key files
cp okestraai/DocuIntelli/src/billing.py src/intelli/services/billing.py
cp okestraai/DocuIntelli/src/models/subscription.py src/intelli/models/

# 3. Adapt models to our schema
# - Rename fields if needed (e.g., account_id → tenant_id)
# - Update relationships (link to our Run, not their Task)

# 4. Adapt webhook handler
# - Copy event routing
# - Update state field names
# - Ensure raw body usage for signature

# 5. Test against live Stripe
# - Use stripe-cli for local webhook testing
# - Verify signature verification works
```

**Stripe CLI test webhook:**

```bash
# In one terminal: start local server
python -m uvicorn src.intelli.api.main:app --reload

# In another: send test webhook
stripe trigger payment_intent.succeeded \
  --stripe-account=acct_xxx

# Or use webhooks endpoint
stripe listen --forward-to localhost:8000/api/v1/billing/webhooks/stripe
```

---

## 11. Reusable Code Patterns

### 11.1 FastAPI Webhook Handler Template

```python
from fastapi import APIRouter, Request, HTTPException
from stripe import Webhook, SignatureVerificationError
import logging

logger = logging.getLogger(__name__)

webhook_router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@webhook_router.post("/stripe")
async def handle_stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Template for Stripe webhook handling.
    """
    # 1. Verify signature
    payload = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    try:
        event = Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except SignatureVerificationError as e:
        logger.error(f"Bad Stripe signature: {e}")
        raise HTTPException(status_code=400, detail="Bad signature")

    # 2. Route by event type
    handlers = {
        "customer.subscription.updated": handle_subscription_updated,
        "customer.subscription.deleted": handle_subscription_canceled,
        "invoice.payment_failed": handle_payment_failed,
        "invoice.paid": handle_invoice_paid,
    }

    handler = handlers.get(event["type"])
    if not handler:
        logger.info(f"Unhandled event type: {event['type']}")
        return {"status": "ignored"}

    # 3. Call handler
    try:
        await handler(event, db)
    except Exception as e:
        logger.exception(f"Error handling {event['type']}: {e}")
        raise HTTPException(status_code=500, detail="Internal error")

    # 4. Return success (idempotent)
    return {"status": "received"}
```

### 11.2 Quota Middleware Template

```python
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import HTTPException

class QuotaEnforcementMiddleware(BaseHTTPMiddleware):
    """
    Template for quota enforcement.
    Check subscription before allowing resource-consuming operations.
    """

    async def dispatch(self, request: Request, call_next):
        # 1. Identify protected endpoint
        if not self.is_protected_endpoint(request):
            return await call_next(request)

        # 2. Extract tenant context
        tenant_id = self.get_tenant_id(request)
        if not tenant_id:
            return await call_next(request)

        # 3. Check quota
        allowed = await self.check_quota(tenant_id)
        if not allowed:
            raise HTTPException(status_code=429, detail="Quota exceeded")

        # 4. Proceed
        return await call_next(request)

    def is_protected_endpoint(self, request: Request) -> bool:
        return request.url.path == "/api/v1/runs" and request.method == "POST"

    def get_tenant_id(self, request: Request) -> str:
        return request.headers.get("X-Tenant-ID")

    async def check_quota(self, tenant_id: str) -> bool:
        # Implement your quota logic here
        pass
```

### 11.3 LangGraph Budget Accumulator

```python
from pydantic import BaseModel

class RunState(BaseModel):
    accumulated_cost_cents: int = 0
    max_cost_cents: int = 200  # $2

    def add_cost(self, cost_cents: int):
        self.accumulated_cost_cents += cost_cents

    def is_budget_exceeded(self) -> bool:
        return self.accumulated_cost_cents >= self.max_cost_cents

# Usage in node
async def llm_node(state: RunState) -> RunState:
    # Execute LLM
    cost = await get_llm_cost(state.run_id)
    state.add_cost(cost)

    if state.is_budget_exceeded():
        # Emit event, stop processing
        pass

    return state
```

### 11.4 Usage Recording Post-Run

```python
async def finalize_run(
    run_id: str,
    tenant_id: str,
    final_state: RunState,
    db: AsyncSession,
):
    """
    Template for recording usage after a run completes.
    """
    # 1. Get subscription
    sub = await db.execute(
        select(Subscription).where(Subscription.tenant_id == tenant_id)
    )
    subscription = sub.scalar_one()

    # 2. Query cost from observability platform
    cost_usd = await get_observability_cost(run_id)  # Langfuse or equivalent
    cost_cents = int(cost_usd * 100)

    # 3. Create usage record
    usage = UsageRecord(
        subscription_id=subscription.id,
        run_id=run_id,
        cost_cents=cost_cents,
        status="pending",
    )
    db.add(usage)

    # 4. Commit
    await db.commit()
```

---

## 12. Implementation Roadmap (BL-012 & BL-013)

### Phase 1: Database & Models (Week 1)
- [ ] Migration 0005c: Create subscriptions + usage_records tables
- [ ] Define Subscription and UsageRecord Pydantic models
- [ ] Add relationships to Tenant and Run models

### Phase 2: Stripe Integration (Week 2)
- [ ] Set up Stripe account and get API keys
- [ ] Implement webhook handler with signature verification
- [ ] Implement checkout session creation endpoint
- [ ] Test with stripe-cli locally

### Phase 3: Budget Enforcement (Week 2-3)
- [ ] Add cost accumulator to RunState
- [ ] Implement LiteLLM + Langfuse integration for cost tracking
- [ ] Add budget check conditional edge in graph
- [ ] Implement quota check middleware on /api/v1/runs

### Phase 4: Usage Tracking (Week 3)
- [ ] Record UsageRecord after run completion
- [ ] Link to subscription and run
- [ ] Implement cost query from Langfuse REST API

### Phase 5: Billing Batch Job (Week 4)
- [ ] Implement monthly invoice generation cron job
- [ ] Stripe invoice + line item creation
- [ ] Mark usage records as billed
- [ ] Handle webhook for invoice paid

### Phase 6: Testing (Week 4)
- [ ] Contract tests: verify invoice line items match expected math
- [ ] Integration tests: create checkout, complete subscription, generate invoice
- [ ] E2E tests: full flow from trial signup to paid invoice
- [ ] Stripe test mode validation

---

## 13. Configuration (Environment Variables)

```bash
# Stripe
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_TEST_API_KEY=sk_test_xxxxx  (optional for testing)

# Langfuse (self-hosted)
LANGFUSE_PUBLIC_KEY=pk_xxxxx
LANGFUSE_SECRET_KEY=sk_xxxxx
LANGFUSE_HOST=https://langfuse.example.com

# LiteLLM
LITELLM_VERBOSE=false
OPENAI_API_KEY=sk-xxxxx

# Redis (for quota rate limiting, optional)
REDIS_URL=redis://localhost:6379/0

# Pricing
SANDBOX_MONTHLY_RUNS_LIMIT=10
PROFESSIONAL_MONTHLY_RUNS_LIMIT=200
PROFESSIONAL_MONTHLY_PRICE_CENTS=2000  # $20
OVERAGE_PRICE_CENTS=50  # $0.50
```

---

## 14. Summary & Next Steps

**Key decisions captured:**
- ✅ Pricing unit: 1 run = 1 AI generation (DEC-025)
- ✅ Budget limit: $2/run hard limit in LangGraph state (DEC-045)
- ✅ Stripe integration: Direct API, port from DocuIntelli (DEC-036)
- ✅ Cost tracking: LiteLLM + Langfuse self-hosted (DEC-042, DEC-045)
- ✅ Webhook security: Raw body for signature verification (LIB-08)
- ✅ Database schema: Subscriptions + UsageRecords (DB-004, DB-005)
- ✅ Quota enforcement: Middleware + LangGraph conditional edge (BL-013)
- ✅ Usage tracking: Post-run batch recording (DEC-025)
- ✅ Invoice generation: Monthly cron job with overage calculation

**Files to create/modify:**
1. Migration 0005c: `subscriptions` + `usage_records` tables
2. `src/intelli/models/billing.py`: Subscription, UsageRecord models
3. `src/intelli/api/v1/billing.py`: Stripe webhook handler, checkout endpoint
4. `src/intelli/api/middleware/quota.py`: Quota enforcement middleware
5. `src/intelli/agents/graphs/budget.py`: Budget accumulator in RunState
6. `src/intelli/workers/billing_worker.py`: Monthly invoice generation cron
7. `src/intelli/config/stripe_config.py`: Plan configuration

**Ready to implement:** This extraction provides complete specification for BL-012 and BL-013 without reinvention risk.

---

*Extraction complete. Date: 2026-02-20. All sources cited. Ready for implementation.*
