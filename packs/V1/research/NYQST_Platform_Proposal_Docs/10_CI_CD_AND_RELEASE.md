# CI/CD and release (ship without breaking yourself)

This doc defines a pragmatic CI/CD setup that supports:

- fast PR feedback
- contract drift prevention
- safe database migrations
- optional “live” validation
- versioned releases per milestone

---

## 1) CI goals

- < 10 minutes feedback on PRs
- deterministic results (avoid flakiness)
- fail early on contract drift (types/events)
- do not require paid API keys for standard CI

---

## 2) Workflow structure (recommended)

### 2.1 ci.yml (default)

Triggers:
- push to main
- PRs

Jobs:
1) Backend lint + unit
   - ruff format/check
   - pytest -m unit
2) Backend integration
   - spin up postgres (service)
   - pytest -m integration
3) Frontend
   - npm ci
   - npm run typecheck
   - npm run test
4) Contracts
   - generate OpenAPI/types
   - fail if git diff shows changes (codegen must be committed)

### 2.2 ci-live.yml (manual)

Trigger:
- workflow_dispatch

Jobs:
- run @pytest.mark.live
- optionally run 1 e2e run with real model
- budget cap enforced

---

## 3) “Contract drift” prevention

Add a CI step:

- run `make codegen`
- run `git diff --exit-code`

This forces developers to commit updated generated TS types and schema snapshots.

---

## 4) Database migrations in CI

Integration job should:
- apply migrations on a fresh DB
- run tests
- optionally test downgrade (fast check)

This catches “migration only works on dev DB” problems.

---

## 5) Release process (milestone-based)

For each milestone (M0/M1/M2/M3):
- create a tag `v0.<milestone>.<patch>`
- record:
  - migration head revision
  - API contract hash (openapi.json checksum)
  - UI build commit

This makes rollback possible.

---

## 6) Preview environments (optional but useful)

If you want professional polish:
- build a “preview UI” on every PR (Vercel, Netlify, etc.)
- point it to a staging backend

But local-first is fine until the core works.

---

## 7) Deployment options (future)

### 7.1 Keep current (FastAPI + worker)

This is simplest.

### 7.2 LangServe (optional)

LangServe can deploy runnables/chains as REST APIs:
- https://github.com/langchain-ai/langserve

Only adopt if you need:
- standardized runnable registry
- JS client
- versioned runnable deployment

### 7.3 LangSmith cloud deployment (optional)

LangChain docs mention deploying LangGraph apps via LangSmith Cloud:
- https://docs.langchain.com/langsmith/deployment-quickstart

This is a later optimization, not a v1 requirement.

---

## 8) Branch protections

- main is protected
- PR required
- CI green required
- codegen check required
- 1 reviewer required

---

## 9) PR template additions (CI alignment)

Include in PR template:
- “Does this change require schema or type generation?”
- “Does this add new event types? If yes, updated all 4 surfaces?”
- “Does this add any external integration? If yes, added live test?”

---

## 10) Release checklist

- [ ] migrations applied successfully to fresh DB
- [ ] baseline run works end-to-end
- [ ] contract tests pass
- [ ] replay tool works on a golden run
- [ ] billing/quotas not broken
- [ ] export endpoints work (if in scope)
- [ ] documentation updated

