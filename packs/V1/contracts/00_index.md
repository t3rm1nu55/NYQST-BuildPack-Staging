# Contracts index

Contracts in this folder are the coordination layer between:
- backend services
- frontend screens
- workflows/apps
- automated tests

They should be treated like public APIs.

Versioning:
- Every contract has `contract_version`.
- Backward-compatible additions increment minor.
- Breaking changes increment major.

---

## Files

- `app.schema.json` — App definition, versioning, inputs, outputs mapping, triggers
- `context_pack.schema.json` — Context pack definition used by apps/workflows
- `bundle.schema.json` — Bundles + versions + ingest outputs
- `run_event.schema.json` — Event envelopes for streaming and run timelines
- `evidence.schema.json` — Evidence object with provenance
- `insight.schema.json` — Insight lifecycle and evidence linkage
- `crm.schema.json` — CRM entities, relationships, timeline events
- `model.schema.json` — Domain models, rules, validation runs, diffs
- `workflow.schema.json` — Workflow definition, triggers, node runs

