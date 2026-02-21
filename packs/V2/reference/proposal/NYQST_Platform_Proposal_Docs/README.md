# NYQST Platform — Proposed Professional Build Design (Docs Bundle)

This bundle is a "10x documentation" re-write of your plan with:

- A concrete patchset (diffs) for the highest-risk correctness issues.
- A professional implementation path using LangGraph + LangChain (LCEL) + LangSmith + LangServe patterns.
- A full event/streaming contract (including resume/catch-up) and contract-test strategy.
- A pragmatic vertical-slice delivery plan that reduces integration risk.
- A UX/UI product spec that aligns with how modern agent products (SurfSense, Claude Cowork) feel fast and trustworthy.
- A tool system spec covering MCP, provider hot-swap, and "skills" (Agent Skills standard) as first-class primitives.
- Development standards: repo hygiene, PR discipline, CI/CD, versioning, observability, security, and test tiers.

Important: this is written as if a team is going to execute it. It intentionally over-documents to reduce ambiguity and prevent integration-week failures.

---

## How to use these docs

Recommended reading order:

1. `00_EXECUTIVE_SUMMARY.md`
2. `01_GAP_ANALYSIS_AND_PATCHSET.md` (apply P0 corrections before anything else)
3. `02_TARGET_ARCHITECTURE.md`
4. `03_STREAMING_AND_EVENT_BUS.md`
5. `04_ORCHESTRATION_GRAPH_DESIGN.md`
6. `05_TOOL_SYSTEM_MCP_AND_CONNECTORS.md`
7. `06_SKILLS_AND_CONTEXT_ENGINEERING.md`
8. `07_UI_UX_PRODUCT_SPEC.md`
9. `08_DEV_STANDARDS_AND_REPO_HYGIENE.md`
10. `09_TESTING_EVALS_AND_LANGSMITH.md`
11. `10_CI_CD_AND_RELEASE.md`
12. `11_BACKLOG_REFRAME_VERTICAL_SLICES.md`
13. `SUPERAGENT_PARITY_MATRIX.md`
14. `13_REFERENCE_LINKS.md`

If you only do one thing: read `01_GAP_ANALYSIS_AND_PATCHSET.md` and implement the patchset (especially event ordering + arq + SSE resume semantics). Those are existential for multi-agent fan-out + streaming UI.

---

## What this bundle assumes

- Your existing repo is the ground truth.
- Your decisions are "locked", but this bundle still calls out where a decision increases risk/cost and suggests *compatible* mitigations.
- You are building locally first (FastAPI + local worker; docker-compose only for infra).
- You want "fast product feel": streaming, reliable progress UI, clear artifacts, and predictable failure handling.

---

## Patchset

The file `PATCHSET.diff` contains concrete diffs for:

- arq worker settings registration fix (compatible with arq CLI loader semantics)
- run_event sequencing without race conditions (counter table or advisory lock approach)
- SSE resume/catch-up (Last-Event-ID / after_seq contract)
- "4 surfaces" event type rollout guardrails (PR checklist + contract tests)
- basic idempotency guards for background jobs

You should apply the patchset as a starting point, then adapt to your exact file layout.

---

## Glossary (project-local)

- Run: one agent execution (billing unit = 1 run).
- Thread: LangGraph checkpoint key (thread_id). One run may map to one thread (recommended).
- RunEvent: persisted event record that backs UI streaming, audit, and replay.
- Artifact: content-addressed object stored in S3/MinIO, referenced by manifests/pointers.
- Entity: typed artifact (Artifact.entity_type) used for citations and source surfacing.
- Skills: load-on-demand procedural knowledge (Agent Skills standard).

---

## Notes on citations

These docs include primary reference links (LangGraph docs, MCP spec, Agent Skills spec, assistant-ui docs, AI SDK stream protocol, etc.) to ground implementation details and avoid folklore.

