# Mapping 04: Billing, Testing & Delivery (Superagent → Intelli)

> **Date**: 2026-02-16
> **Status**: Definitive mapping — grounded in `nyqst-intelli-230126` codebase
> **Depends on**: Mappings 01-03

---

## Part A: Billing & Quotas

### What Superagent Does (Observed)

**Plan tiers**: `free | pro`
**Billing statuses**: `overdue | paid | trial`

**Usage metering** (from Zod schemas):
- `normal_message` — standard chat messages
- `super_report_message` — enhanced report generation
- `report` — report creation count
- `subscription` — subscription status

**Quota enforcement**:
- `hasExceededSuperReportMessages` / `hasExceededNormalMessages` / `hasExceededReportsBuilt` / `hasExceededReportsViewed` / `hasExceededAllCredits`
- `CreditLimitBanner` blocks actions when limits hit
- Paywall: "30 days free", "No credit card required"

**Stripe integration**:
- Checkout sessions
- Webhook handling (subscription events)
- Promo codes (`once | repeating | forever`)

### What Intelli Needs

The billing system is a **new service** — neither the intelli backend nor the older DocuIntelli repos have it wired to the current platform.

**However**: `okestraai/DocuIntelli` has a **working Stripe implementation** that can be ported:
- `stripe-checkout` edge function → adapt to FastAPI endpoint
- `stripe-webhook` edge function → adapt to FastAPI webhook route
- `useSubscription` hook → adapt to Zustand store + REST API
- `user_subscriptions` table → adapt to SQLAlchemy model

### Implementation Plan

**Backend** (`src/intelli/api/v1/billing.py` + `src/intelli/services/billing_service.py`):

```python
# New FastAPI router
POST /api/v1/billing/checkout    # Create Stripe checkout session
POST /api/v1/billing/webhook     # Stripe webhook handler
GET  /api/v1/billing/subscription  # Get current subscription
GET  /api/v1/billing/usage       # Get usage stats
POST /api/v1/billing/cancel      # Cancel subscription
```

**Database** (new tables):
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    status TEXT NOT NULL DEFAULT 'trialing',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    usage_type TEXT NOT NULL,  -- 'run', 'report', 'website', etc.
    run_id UUID REFERENCES runs(id),
    recorded_at TIMESTAMPTZ DEFAULT now()
);
```

**Quota enforcement**: Middleware on Run creation endpoints. Check usage_records count vs plan limits before allowing new Runs.

**Frontend**:
- `ui/src/stores/billingStore.ts` — subscription state, usage counts, limit checks
- `ui/src/components/billing/UpgradeModal.tsx` — Stripe checkout redirect
- `ui/src/components/billing/UsageBanner.tsx` — credit limit warnings
- Integrate limit checks into DeliverableSelector (disable types over quota)

**Timeline**: ~5-7 days (mostly porting from okestraai + adapting to FastAPI)

---

## Part B: Testing Strategy

### Philosophy (Per User Direction)

- **Real LLM calls** — minimal mocking, real integration
- **Foundation-grade** — contract + integration + E2E
- **Not extensive use-case testing** — get to production looking good, then refine
- **Budget-capped CI** — real LLM calls with a small token budget

### Test Pyramid

```
         ┌──────────┐
         │   E2E    │  3-5 core flows (Playwright, real backend)
         │  (few)   │
        ┌┴──────────┴┐
        │ Integration │  10-15 tests (real LLM, real DB, real tools)
        │  (moderate) │
       ┌┴────────────┴┐
       │   Contract    │  20-30 schemas (Pydantic validation, deterministic)
       │   (many)      │
       └──────────────┘
```

### Contract Tests (Fast, Deterministic, Always Run)

| What | Framework | Assertion |
|---|---|---|
| NYQST Markup AST schema | Pydantic | Fixture ASTs validate against MarkupNode model |
| RunEvent payloads | Pydantic | All event types serialize/deserialize correctly |
| PlanSet structured output | Pydantic | LLM output schema matches expected format |
| Healer transformations | pytest | Malformed AST fixtures → healer → valid AST |
| API request/response schemas | Pydantic | OpenAPI schema validation |
| Artifact content addressing | pytest | Same content → same SHA-256 → same artifact ID |

### Integration Tests (Real Services, Budget-Capped)

| What | Services Used | Assertion |
|---|---|---|
| Research orchestrator flow | LLM + Brave Search | Prompt → plan with ≥3 tasks → sources found → synthesis artifact created |
| Report generation | LLM | Research results → valid NYQST Markup AST → renders without error |
| Website generation | LLM | Research results → file bundle → all files stored as Artifacts → valid Manifest |
| RAG pipeline | Docling + pgvector/OpenSearch | Upload PDF → chunks indexed → query returns relevant chunks |
| Stripe webhook | Stripe test mode | Send test webhook → subscription updated in DB |
| Run event streaming | Postgres + SSE | Create run → emit events → SSE client receives all events in order |

**Budget control**: Set `max_tokens=2000` for integration test LLM calls. Use fast models (haiku/gpt-4o-mini) for CI.

### E2E Tests (Playwright, Real Everything)

| Flow | Steps | Assertions |
|---|---|---|
| **Research → Report** | Login → select "Report" → submit CRE prompt → wait for completion | Plan phases appear → tasks show progress → report renders with sections and citations |
| **Research → Website** | Login → select "Website" → submit prompt → wait for completion | Plan appears → website preview loads in iframe → deploy button works |
| **Document Upload → RAG** | Login → create notebook → upload PDF → ask question | Document processes → answer cites specific pages |
| **Billing gate** | Login as free user → exceed quota → attempt new run | UpgradeModal appears → Stripe checkout redirects |

**CI strategy**: Run contract tests on every push. Run integration tests on PR merge. Run E2E weekly or on release tags.

---

## Part C: Revised Delivery Phases (Definitive)

Grounded in the actual intelli codebase, the existing parity plan, and user decisions from the design review.

### Phase 0: Orientation & Gap Fixes (1-2 days)
- [ ] Verify `scripts/dev/validate.sh` passes on current main
- [ ] Review and update `docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md` if codebase has changed
- [ ] Set up test infrastructure (pytest fixtures, Playwright config)
- **Gate**: Dev environment boots, health checks pass, test runner works

### Phase 1: Research Orchestrator + Plan UI (2-3 weeks)
*See Mapping 01 for detailed breakdown*
- [ ] RunEvent schema extensions
- [ ] Planner LangGraph node (structured output)
- [ ] Fan-out/fan-in parallel research
- [ ] Brave Search + Jina scrape MCP tools
- [ ] PlanViewer + enhanced RunTimeline frontend components
- **Gate**: Complex prompt → plan appears → 5+ parallel tasks execute → results stream back

### Phase 2: Entity & Citation Substrate (2-4 weeks)
*Per parity plan Phase 2*
- [ ] Entity model (web pages, API data, generated content)
- [ ] Citation identifier scheme (`artifact://{sha256}`)
- [ ] Enhanced SourcesPanel (documents + web sources)
- [ ] Clickable citations → entity viewer
- **Gate**: Citations click through to source artifacts with provenance

### Phase 3: Report Deliverable (3-4 weeks)
*See Mapping 02 for detailed breakdown*
- [ ] NYQST Markup AST schema (Pydantic)
- [ ] Healer/validator
- [ ] Report generation LangGraph node
- [ ] ReportRenderer (AST → React)
- [ ] DeliverableSelector in chat composer
- [ ] Document export (PDF/DOCX)
- **Gate**: Select "Report" → full structured report with charts, citations, sections

### Phase 4: Website + Slides Deliverables (3-4 weeks)
*See Mapping 02 for detailed breakdown*
- [ ] Website generation (LLM → file bundle → Manifest → Artifact storage)
- [ ] WebsitePreview (blob: iframe)
- [ ] Website deployment integration
- [ ] Slides generation + viewer
- **Gate**: All 4 deliverable types produce viewable output

### Phase 5: Billing & Quotas (1 week)
*See Part A above*
- [ ] Port Stripe integration to FastAPI
- [ ] Subscription + usage tables
- [ ] Quota enforcement middleware
- [ ] UpgradeModal + UsageBanner frontend
- **Gate**: Free tier limits enforced, Stripe checkout works

### Phase 6: Polish & Production (1-2 weeks)
- [ ] Error handling (retry logic, timeout handling, graceful degradation)
- [ ] Loading states and progress indicators
- [ ] Responsive design audit
- [ ] E2E test suite
- [ ] Performance profiling (streaming latency, time-to-first-plan, time-to-report)
- [ ] Deploy to staging
- **Gate**: End-to-end flows feel polished, E2E tests pass, staging deployment works

### Total Estimated Timeline: 12-16 weeks

This is longer than the earlier cleanroom analysis estimated (6-8 weeks) because:
1. The research orchestrator is genuinely complex (parallel LangGraph with MCP tools)
2. The markup AST + renderer is a full rendering engine
3. Website generation is a multi-step pipeline
4. We're building on a real platform (more integration surface) vs. greenfield

**However**, Phases 1-3 can overlap with Phase 5 (billing is independent), and the existing doc intelligence + RAG infrastructure means Phase 2 is partly done.

---

## Part D: What the Cleanroom Analysis Got Right (Preserved)

Despite being based on the wrong repo, these aspects of the original analysis remain valid:

1. **Superagent feature inventory** — comprehensive and accurate
2. **GML tag documentation** — useful for designing NYQST Markup
3. **Streaming event types** — directly informed RunEvent schema extensions
4. **Data source connectors** — Brave, Jina, Polygon, etc. still the right tool choices
5. **Citation/provenance design** — correctly identified entity-backed citations as critical
6. **Deliverable type abstraction** — enum-on-Run pattern confirmed
7. **Healer concept** — LLM output repair is essential for markup reliability

What was wrong:
1. Backend language/framework (Node → Python)
2. Data model (flat SQL → content-addressed kernel)
3. Agent framework (hand-rolled → LangGraph + MCP)
4. Streaming protocol (NDJSON → AI SDK Data Stream)
5. Frontend chat library (custom → @assistant-ui)
6. Build phases (greenfield → extension of working platform)

---

## Appendix: Document Cross-References

| Document | Location | What It Covers |
|---|---|---|
| Original cleanroom analysis | `CLEANROOM-ANALYSIS.md` | Superagent reverse-engineering (still valid for feature reference) |
| Intelli build status | `docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md` | What's working today |
| Parity plan | `docs/planning/SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md` | Phase plan + capability map |
| Mapping 01 | `docs/plans/2026-02-16-MAPPING-01-RESEARCH-ORCHESTRATOR.md` | Orchestrator architecture |
| Mapping 02 | `docs/plans/2026-02-16-MAPPING-02-DELIVERABLES-ARTIFACTS.md` | Deliverables → Artifact model |
| Mapping 03 | `docs/plans/2026-02-16-MAPPING-03-UI-MODULES.md` | Frontend component mapping |
| Mapping 04 | This document | Billing, testing, delivery phases |
| GML rendering patterns | `docs/GML_REPORT_RENDERING_PATTERNS.md` | Reference for NYQST Markup design |
| Generation pipeline | `docs/GENERATION_PIPELINE.md` | How Superagent generates websites |
| Tailwind theme | `docs/TAILWIND_THEME_EXTRACTION.md` | Design tokens to match |
| JS design tokens | `docs/JS_DESIGN_TOKENS.md` | Chart schemas, streaming events |
