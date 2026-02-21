# Run event types (v1 extension)

This document describes the user-facing event taxonomy used to power PlanViewer, ReportPanel preview, and provenance UX.

Operational/debug events (already in repo) are still allowed (tool_call_started, llm_call_* etc). These are additional **product events**.

Envelope:
- `run_id` (uuid)
- `sequence` (int, monotonic per run)
- `event_type` (string)
- `payload` (json)

## Plan lifecycle

1) `plan_created`
Payload:
- `plan_set` (PlanSet JSON)
- `plan_version` (int)

2) `plan_task_status_changed`
Payload:
- `task_id`
- `status` (queued|running|completed|failed|skipped)
- `message` (optional)
- `timestamp`

## Report preview lifecycle

1) `report_preview_started`
Payload:
- `report_identifier`
- `format` (gml)

2) `report_preview_delta`
Payload:
- `report_identifier`
- `delta` (string) — append-only by default
- `cursor` (optional) — for replace semantics

3) `report_preview_completed`
Payload:
- `report_identifier`
- `artifact_sha256` (optional)

## Provenance lifecycle

1) `references_found`
Payload:
- `entities`: [{ entity_id, entity_type, title?, source_url?, artifact_sha256?, locator? }]

2) `citations_bound`
Payload:
- `citations`: [{ citation_id, entity_id, target: { kind: report|decision, target_id, span_id? } }]

## Deliverables lifecycle

1) `artifact_created`
Payload:
- `artifact_sha256`
- `media_type`
- `label` (human-friendly)

2) `deliverable_ready`
Payload:
- `deliverable_type` (report|website|slides|document)
- `deliverable_identifier`
- `artifacts`: [{ artifact_sha256, media_type, filename }]

