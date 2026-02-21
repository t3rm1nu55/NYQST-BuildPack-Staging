# Contracts overview

Contracts are the coordination mechanism for parallel work.

They live in `contracts/` and must be versioned. When a contract changes:
- update the JSON schema
- update fixtures
- update backend Pydantic models
- update frontend types and reducers
- update contract tests

---

## Contract list

1) App schema
- app definition
- app versioning
- context pack
- inputs schema
- outputs mapping
- triggers

2) Bundle/version schema
- bundle metadata
- version metadata
- stored artifacts
- ingest run outputs
- extraction outputs
- diff outputs

3) Run and event schema
- run metadata (who, what, inputs)
- streaming event envelopes
- event payload types and their required fields
- ordering and idempotency rules

4) Evidence and insight schema
- evidence provenance requirements
- insight lifecycle
- stale propagation rules

5) CRM entities schema
- entity types
- relationships
- timeline event schema

6) Model/validation schema
- model definitions (versioned)
- rules
- validation runs and results
- model impact diff schema

7) Workflow schema
- nodes
- edges
- trigger definitions
- run logs per node

---

## Implementation pattern

Backend:
- Pydantic models as the source of truth
- JSON Schema exported from Pydantic (or authored directly)
- OpenAPI derived from FastAPI

Frontend:
- types generated or authored to match schemas
- reducers validate payload shape at runtime (fail fast in dev)

