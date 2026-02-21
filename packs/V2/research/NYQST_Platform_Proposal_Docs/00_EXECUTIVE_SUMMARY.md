# Executive summary

Your plan is unusually good for an agent platform build. It has explicit dependencies, wave gating, and a real “contracts first” backbone (events, schemas, primitives). That’s the right shape.

The failure modes are not in the big ideas; they’re in a handful of low-level mechanics that will quietly destroy execution speed:

1) **Event ordering + catch-up**: multi-agent fan-out means concurrent event writers; if event sequencing is not strictly correct and reconnect semantics are not defined, the UI will show missing tasks, duplicated steps, and “random” failures.

2) **Background execution semantics**: you intend to use arq for async entity creation + co-generation; arq has pessimistic execution semantics (jobs may run more than once) and WorkerSettings loading quirks. You need idempotency and correct worker registration before you rely on it.

3) **Contract drift**: you already identified “4 surfaces” for event types. Without automated codegen/contract tests, drift will happen and burn a week later.

4) **UX failure handling**: plan UI components exist (PlanViewer, SourcesPanel, RunTimeline). What’s missing is the *user experience of failure* (rate limit, partial data, budget stop, clarification pause, cancellation, background job failure). Without that, the product feels unreliable even when the backend is “working”.

5) **Over-integration too early**: billing + export + websites + slides + citations + meta-reasoning is a lot. You need a deliberate vertical slice gate after Wave 1 to prove “orchestrator + streaming UI + one deliverable” before adding the rest.

This doc bundle provides:

- A patchset that fixes the highest-risk mechanics early.
- A professional reference architecture: event-sourced run log + durable checkpoints + tool/provider abstraction + skills.
- A pragmatic delivery plan (vertical slices) that reduces integration risk without contradicting your decisions.
- Deep standards: testing, CI, code review, observability, security.

Key design principles (non-negotiable):

- **Persist first, notify second**: LISTEN/NOTIFY is a wake-up signal, never the source of truth. UI must be able to reconnect and backfill from DB deterministically.
- **Every background job is idempotent**: assume it will run twice.
- **Contracts are code-generated**: do not hand-maintain TS mirrors of Pydantic.
- **UI is event-driven**: state is derived from RunEvents; UI components must be able to rebuild from history.
- **Make the “fast feel” a feature**: latency is product. Streaming, progress, and stable status are core.

Suggested execution reframe:

- P0: Patchset + “foundation contracts”.
- Wave 0: Contracts + minimal UI scaffolding.
- Wave 1: Orchestrator + PlanViewer + minimal report preview (Vertical Slice Gate).
- Wave 2: Full report + website + slides (co-gen) + tools integration.
- Wave 3: Citations + exports + billing polish + hardening.

For details, go to `01_GAP_ANALYSIS_AND_PATCHSET.md`.

