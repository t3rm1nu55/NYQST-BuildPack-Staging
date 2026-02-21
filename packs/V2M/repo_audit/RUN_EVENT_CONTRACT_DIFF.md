# Run event contract diff (Build Guide v5 vs repo)

Generated: 2026-02-20

## Expected (Build Guide v5)

stream_start, stream_end, run_started, run_completed, run_failed, run_cancelled, message_delta, node_started, node_completed, node_error, node_tool_event, tool_call_started, tool_call_delta, tool_call_completed, artifact_created, artifact_version_created, artifact_ready, manifest_created, manifest_ready, pointer_moved, billing_event, error

## Current (repo DB enum)

run_started, run_paused, run_resumed, run_completed, run_failed, run_cancelled, step_started, step_completed, tool_call_started, tool_call_completed, llm_request, llm_response, retrieval_query, retrieval_result, artifact_emitted, manifest_created, pointer_moved, checkpoint, state_update, user_input, approval_requested, approval_granted, approval_denied, comment_added, error, warning

## Missing in repo (must add)

stream_start, stream_end, message_delta, node_started, node_completed, node_error, node_tool_event, tool_call_delta, artifact_created, artifact_version_created, artifact_ready, manifest_ready, billing_event

## Extra in repo (can keep as internal / deprecated)

run_paused, run_resumed, step_started, step_completed, llm_request, llm_response, retrieval_query, retrieval_result, artifact_emitted, checkpoint, state_update, user_input, approval_requested, approval_granted, approval_denied, comment_added, warning

## Migration strategy (recommended)

- Add missing event types to the enum (non-breaking).

- Introduce a strict Pydantic payload union keyed by `type` (separate from DB enum name if necessary).

- Update the run stream endpoint to emit the canonical payload shape `{type, run_id, ts, ...}` (and optionally include `seq` and `id`).

- Keep legacy event types temporarily, but mark as deprecated and stop emitting them once the new renderer is in place.
