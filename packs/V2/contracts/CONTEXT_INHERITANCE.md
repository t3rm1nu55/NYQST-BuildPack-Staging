# Context inheritance and precedence

Goal: allow a task/run to inherit context from higher scopes in a predictable way.

Scopes (from broad to narrow):
1) workspace
2) project
3) app
4) task/run

Precedence rules:
- Narrower scopes override broader ones when there are conflicts (task > app > project > workspace).
- Retrieval results are merged and deduplicated by entity_id/artifact_sha256.
- If two sources conflict, keep both and mark as conflicting; do not silently pick one.

ContextPack:
- id, scope_type, scope_id
- sources: artifacts, docs, notes, links, signals
- indexing status: pending/in_progress/ready/failed
- created_by, updated_by, updated_at

A run should carry:
- explicit context_pack_ids (user-selected)
- implicit inherited pack ids (from project/app/workspace)
- retrieval policy (web allowed? max sources? recency preference?)

