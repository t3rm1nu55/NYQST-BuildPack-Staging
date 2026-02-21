# CI/CD and release

NYQST should treat releases like a real product:
- predictable CI
- staging deploys
- migrations discipline

---

## CI pipelines (recommended)

### Pipeline: ci.yml (default)
Triggers: push + pull_request

Jobs:
1) Backend lint + unit
   - ruff check
   - ruff format --check
   - mypy (as configured)
   - pytest -m unit

2) Backend integration
   - start services (Postgres/Redis/MinIO/OpenSearch)
   - run migrations
   - pytest -m integration

3) Contracts
   - validate JSON schemas
   - validate fixtures against schemas
   - ensure TS types compile

4) Frontend
   - npm install
   - typecheck
   - vitest

### Pipeline: e2e.yml
Triggers: nightly + on release branch

- start full stack
- run Playwright suite

### Pipeline: live.yml (manual)
Triggers: workflow_dispatch only

- runs provider tests (LLM/web/Stripe) with real secrets

---

## Release process

- main is always releasable
- release branches:
  - cut from main
  - run e2e + load smoke
- tagging:
  - semantic version (or date-based)

---

## Migration discipline

- migrations are reviewed like code
- all migrations are reversible where possible
- every migration includes:
  - upgrade
  - downgrade
  - data backfill notes (if needed)
- CI includes a migration check:
  - apply to fresh DB
  - run minimal queries
  - downgrade

---

## Staging and production deployment

Minimum:
- container image for API and worker
- config via environment variables
- secrets from secret manager
- rolling deploy with health checks

Deliverables:
- deployment runbook
- rollback runbook
- backup/restore runbook

