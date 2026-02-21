# Review 4: MCP & Agentic Architecture Completeness

**Reviewer**: Opus 4.6
**Overall Score: 4.3 / 10**

---

| Area | Score | Critical Gap |
|---|---|---|
| MCP Completeness | 4/10 | No tool registry persistence, no custom tools, no permissions at runtime |
| Agent Architecture | 5/10 | No abort/cancel, no retry, no agent versioning, no multi-agent communication |
| Context Engineering | 4/10 | No token budget management, no context window optimization, no long-term memory |
| LLM Integration | 3/10 | Single provider only, no fallback chains, no prompt management |
| Streaming & Real-Time | 7/10 | Best area. Full SSE lifecycle. Missing: cancel API, backpressure |
| Observability | 4/10 | Langfuse not wired (GAP-025), no end-to-end trace correlation |
| Security | 3/10 | No prompt injection defense, no PII detection, no tool sandboxing |

## MCP Gaps (8 items)

| ID | Gap | Target |
|---|---|---|
| GAP-M1 | Tool registry persistence & CRUD (tools table, registration API, catalog UI) | M1 |
| GAP-M2 | Tool lifecycle (enable/disable, deprecation, health checks) | M2 |
| GAP-M3 | Tool versioning (version pinning per app/agent) | M3 |
| GAP-M4 | Runtime tool permissions (no permission check before invocation) | M1 |
| GAP-M5 | Tool discovery algorithm (GAP-018 + GAP-026: how orchestrator selects tools) | M0 design, M1 impl |
| GAP-M6 | Tool testing framework (mock tool servers for CI) | Track 0 |
| GAP-M7 | Enterprise custom tools (registration API must be designed at M1 for M5 extension) | M1 design |
| GAP-M8 | Tool error rate tracking, circuit breaker, health dashboard | Track D |

## Agent Gaps (6 items)

| ID | Gap | Target |
|---|---|---|
| GAP-A1 | Agent creation & configuration API (no agent builder UI or API) | Track B |
| GAP-A2 | Agent abort/cancel (no user-initiated cancel, no admin kill switch) | M1 |
| GAP-A3 | Agent retry & error recovery (no partial re-execution from checkpoint) | Track A |
| GAP-A4 | Agent versioning & deployment (no blue/green for graph changes) | Track D |
| GAP-A5 | Multi-agent communication (single-graph only, no agent-to-agent coordination) | M5+ design |
| GAP-A6 | Agent rollback (no mechanism to revert run outputs) | Track A |

## Context Engineering Gaps (5 items)

| ID | Gap | Target |
|---|---|---|
| GAP-C1 | Token budget management per node/tool call | M1 design, M2 impl |
| GAP-C2 | Context window optimization (no retrieval-then-rank-then-trim pipeline) | M1 |
| GAP-C3 | Long-term cross-run memory | M5+ |
| GAP-C4 | Short-term inter-node message passing beyond state dict | Track A |
| GAP-C5 | Context inheritance for child runs (parent_run_id exists, propagation unspecified) | Track A |

## LLM Gaps (7 items)

| ID | Gap | Target |
|---|---|---|
| GAP-L1 | Multi-provider support (LiteLLM not wired, GAP-024) | M1 |
| GAP-L2 | Per-node model selection | Track A |
| GAP-L3 | LLM fallback chains (no retry, no secondary provider) | M1 |
| GAP-L4 | Per-tenant rate limiting for LLM API calls | Track D |
| GAP-L5 | Platform-level prompt management (prompts are inline in code) | Track B |
| GAP-L6 | Prompt versioning & A/B testing | M5+ |
| GAP-L7 | Per-model cost attribution | Track D |

## Security Gaps (8 items)

| ID | Gap | Severity |
|---|---|---|
| GAP-SEC1 | Tool execution sandboxing (no process isolation) | HIGH |
| GAP-SEC2 | Prompt injection defense (ZERO spec across all 3 packs) | CRITICAL |
| GAP-SEC3 | PII detection & handling (redaction scope "unspecified") | HIGH |
| GAP-SEC4 | Output filtering / content safety (no hallucination guard for financial advice) | MEDIUM |
| GAP-SEC5 | Per-tenant API rate limiting (non-run endpoints) | MEDIUM |
| GAP-SEC6 | SSE stream tenant isolation (run_id guessing attack) | CRITICAL/P0 |
| GAP-SEC7 | LangGraph checkpoint tenant isolation | HIGH |
| GAP-SEC8 | Row-Level Security (PostgreSQL RLS) | MEDIUM |

## Top 5 Actions

1. **Wire Langfuse NOW (P0)** — Without observability, you cannot validate anything else
2. **Add run cancellation API (M1)** — `POST /runs/{run_id}/cancel` with LangGraph abort + SSE CANCELLED event
3. **SSE tenant isolation check (P0)** — Validate tenant_id on SSE subscription (security vulnerability TODAY)
4. **Design tool registry schema (M1)** — `tools` table + registration API so BL-003 tools aren't hard-coded
5. **Prompt injection detection middleware (M2)** — Detect suspicious patterns before LLM calls

## Bottom Line

> The happy path is a 7/10. The defensive/operational layer is a 2/10. For a regulated enterprise platform, the defensive layer IS the product.
