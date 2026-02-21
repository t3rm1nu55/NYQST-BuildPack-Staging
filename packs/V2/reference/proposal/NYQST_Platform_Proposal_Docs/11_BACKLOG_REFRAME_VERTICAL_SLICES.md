# Backlog reframe (vertical slices that actually ship)

Your wave plan is coherent, but it is optimized for “build all primitives” rather than “ship one end-to-end capability early”.

This doc reframes the work into vertical slices that reduce integration risk.

Key idea:
- Every milestone must produce a demo that a non-developer can understand.
- You don’t earn “progress” until the UI shows it end-to-end.

---

## 1) Vertical Slice Gates (VSG)

### VSG-0: Baseline runs + tests documented
Exit criteria:
- platform runs locally
- migrations apply
- basic chat works
- tests baseline known

### VSG-1: Event bus correctness (P0 patchset)
Exit criteria:
- event sequencing deterministic under concurrency
- SSE reconnect/backfill works
- worker starts and processes jobs
- cancellation endpoint works (even if limited)

### VSG-2: Orchestrator + PlanViewer end-to-end (Wave 1 partial)
Exit criteria:
- user sends a message
- PLAN_CREATED appears quickly
- tasks update and complete
- run completes successfully
- UI can refresh and still show correct plan/task state

### VSG-3: One deliverable end-to-end (report) with preview
Exit criteria:
- report preview streams
- final report artifact stored
- ReportPanel renders real artifact
- sources panel shows at least web sources or KB sources

### VSG-4: Second deliverable end-to-end (website OR slides)
Exit criteria:
- website bundle stored
- iframe preview works
- companion report via worker works (if website)

### VSG-5: Billing + quota enforcement
Exit criteria:
- subscription exists per tenant
- run usage recorded
- quota blocks new runs
- Stripe webhook works in test mode

### VSG-6: Export (PDF/DOCX)
Exit criteria:
- export endpoints return files reliably
- charts render server-side (kaleido) or degrade gracefully

---

## 2) Re-ordering recommendations (compatible with your plan)

### 2.1 Move SSE reconnect semantics into Wave 0

Treat SSE backfill as part of “contracts”:
- it’s not “frontend polish”; it is core correctness.

### 2.2 Do not start website/slides until VSG-3 is passed

Report pipeline is the hardest “structured output + rendering” problem.
If it works, other deliverables follow.

### 2.3 Billing can proceed in parallel but must not block core demo

Billing is a separate track. Keep it behind feature flag until core demo works.

### 2.4 Citation binding should be staged

Stage 1:
- show sources list (WEB_PAGE entities)
Stage 2:
- inline citations link to sources
Stage 3:
- citation correctness checks

Don’t block core deliverable preview on perfect citation binding.

---

## 3) Milestone mapping to your Wave plan

P0:
- patchset

Wave 0:
- migrations 0005a/b/c
- event schema (BL-002) + SSE backfill
- markup schema/healer
- deliverable selector UI

Wave 1:
- orchestrator (BL-001)
- PlanViewer
- minimal progress overlay
- minimal report renderer fixture

Gate: VSG-2

Wave 2:
- report generation (BL-005)
- tool integration (BL-003 integration)
- data brief integration
- clarification flow

Gate: VSG-3

Wave 3:
- report renderer integration
- sources panel enhancements
- website preview
- citation binding
- exports

Billing:
- can run alongside but shipped only when it doesn’t destabilize the core.

---

## 4) Definition of Done (milestone-level)

Every milestone demo must:
- run locally from scratch
- have a “golden run” saved
- support refresh without losing state
- have tests for its contracts

This is how you avoid “integration week”.

