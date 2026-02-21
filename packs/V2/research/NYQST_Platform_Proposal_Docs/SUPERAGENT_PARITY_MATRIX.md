# Superagent parity matrix (diff-driven planning)

This file turns “Superagent parity” into an explicit tracking matrix.

Inputs from your analysis:
- Superagent has ~56 endpoints, 16 routes, 22 streaming events, 18 GML tags, 12 entity types, 10 chart types.
- NYQST currently has 11 routers, 23 RunEventType enums (needs ~10 more), and some UI primitives (CitationAwareText, SourcesPanel, RunTimeline).

Goal:
- achieve parity only where it matters for your platform primitives.
- explicitly mark what is intentionally NOT replicated.

---

## 1) Streaming events parity

Superagent-like event types you listed to add:
- PLAN_CREATED
- PLAN_TASK_UPDATED
- MESSAGE_DELTA
- REFERENCES_FOUND
- PENDING_SOURCES
- REPORT_PREVIEW_START
- REPORT_PREVIEW_DELTA
- REPORT_PREVIEW_DONE
- SUBAGENT_ACTION
- CLARIFICATION_NEEDED

NYQST current:
- has many core events (RUN_* / STEP_* / TOOL_CALL_* / LLM_CALL_* / RETRIEVAL_* / ARTIFACT_* / CHECKPOINT / STATE_UPDATE / USER_INPUT / APPROVAL_* / ERROR/WARNING)
- missing the “plan/task/progress/citations” set

Parity target:
- Wave 0: add event types + schemas + TS codegen + SSE backfill semantics
- Wave 1: use PLAN_* / SUBAGENT_ACTION in orchestrator + PlanViewer
- Wave 2: use REPORT_PREVIEW_* and CLARIFICATION_* in report + clarification flow
- Wave 3: use REFERENCES_FOUND/PENDING_SOURCES to power SourcesPanel + citation UI

Risk:
- highest risk is not adding enums; it’s reconnect/backfill correctness and schema drift.

---

## 2) Entity types parity (12-type union)

Your listed types:
- WEB_PAGE
- EXTERNAL_API_DATA
- GENERATED_CONTENT
- USER_QUERY_PART
- GENERATED_REPORT
- INTRA_ENTITY_SEARCH_RESULT
- SEARCH_PLAN
- KNOWLEDGE_BASE
- GENERATED_PRESENTATION
- EXTRACTED_ENTITY
- WEBSITE
- GENERATED_DOCUMENT

NYQST status:
- Artifact.entity_type missing now (Wave 0 adds it)
- SourcesPanel exists but likely not powered by entity queries yet

Parity target:
- Wave 0: add Artifact.entity_type + canonical enum list + tests
- Wave 1: add entity API endpoint (scaffold)
- Wave 3: citation binding integration

Risk:
- naming drift (WEB_SOURCE vs WEB_PAGE vs GENERATED_WEBSITE vs WEBSITE) — lock now.

---

## 3) GML tags + chart types parity

GML tags (18) and chart types (10) are defined in your plan.

NYQST status:
- CitationAwareText exists
- ReportPanel exists (or planned fixture)
- rehype stack planned

Parity target:
- Wave 0: MarkupDocument schema + healer in backend
- Wave 1: ReportPanel fixture renderer in frontend
- Wave 2: Report generation emits valid MarkupDocument JSON
- Wave 3: integrate real report artifacts

Risk:
- LLM output validity (healer mitigates)
- chart schema correctness (Plotly is correct choice for candlestick)

---

## 4) API endpoint parity (high level)

Superagent: 56 endpoints (unknown exact list here), including streaming, runs, artifacts, etc.

NYQST:
- routers exist for agent, artifacts, manifests, pointers, runs, streams, conversations, sessions, rag, tags, auth

Parity target:
- do not chase endpoint count
- ensure the endpoints required by your UI/UX exist:
  - run start/cancel
  - run events stream with backfill
  - resume clarification
  - artifact fetch + serve website bundle
  - export endpoints
  - billing endpoints

---

## 5) UX parity (what users will notice)

Superagent-like UX behaviors:
- plan/task breakdown visible immediately
- progress text updates frequently (“what I’m doing”)
- sources appear early and are clickable
- report preview streams section-by-section

NYQST current:
- has RunTimeline, SourcesPanel, CitationAwareText primitives
- missing explicit PlanViewer and progress overlay integration

Parity target:
- Wave 1: PlanViewer + task updates
- Wave 2: report preview streaming
- Wave 3: sources integration and citations linking

---

## 6) Parity checklist (operational)

To claim parity for a feature, require:

- backend emits events
- events persist and replay
- UI renders from replay (refresh test)
- contract tests cover schema
- a “golden run” fixture exists

This is how you avoid “looks good in one demo but breaks the next day”.

