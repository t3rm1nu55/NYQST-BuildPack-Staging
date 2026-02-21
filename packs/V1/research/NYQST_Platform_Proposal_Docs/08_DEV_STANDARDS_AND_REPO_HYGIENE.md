# Development standards + repo hygiene (professional velocity)

This doc is about execution speed. Not “process for process’s sake” — the goal is to prevent slowdowns later.

---

## 1) Repository structure (recommended)

Backend:
- `src/intelli/`
  - `api/` or `api/v1/` (routers)
  - `agents/` (graphs, nodes, prompts, adapters)
  - `services/` (business logic)
  - `repositories/` (DB access)
  - `db/models/` (SQLAlchemy models)
  - `schemas/` (Pydantic models)
  - `core/` (config, logging, jobs, utilities)

Frontend:
- `ui/`
  - `src/components/`
  - `src/stores/`
  - `src/types/` (generated)
  - `src/lib/` (helpers)

Contracts:
- `contracts/`
  - `run_events.json` (examples)
  - `entity_types.json`
  - `openapi.json` snapshot (optional)
  - `README.md` (how to regenerate)

Skills:
- `skills/` (Agent Skills format)

Docs:
- `docs/` (your existing plan + analysis)
- `docs/proposals/` (this bundle)

---

## 2) Code style and tooling

Backend:
- ruff (lint + format)
- mypy (or pyright) for type checking
- pytest with markers
- uv for dependency management (you already use uv)

Frontend:
- eslint + prettier
- vitest
- typecheck as a CI gate

Add `pre-commit`:
- ruff format + check
- mypy (optional local)
- eslint
- check generated files are up to date (codegen step)

---

## 3) Dependency management

Rules:
- pin LangGraph/LangChain versions
- pin OpenAI SDK / provider libs
- new dependency must justify:
  - why not existing?
  - security considerations
  - license
  - runtime footprint

Create a `DEPENDENCIES.md`:
- list of deps and why they exist
- version policy
- upgrade playbook

---

## 4) Migrations

Professional rules:
- every migration has:
  - upgrade
  - downgrade
  - tested on fresh DB
- migrations should be small and named by intent
- never rely on autogenerate without reviewing constraints and indexes
- keep “data migrations” explicit and reversible where possible

---

## 5) “Contracts are code” policy

Any API/streaming contract change requires:
- updated backend schema
- updated generated TS types
- updated sample payload fixture
- tests updated

Enforce in CI: fail if codegen output differs from committed output.

---

## 6) PR discipline

You already have a PR strategy. Tighten it with:

### 6.1 Definition of Done checklist (required in PR template)

- [ ] tests added/updated
- [ ] migrations tested up/down
- [ ] event types updated across all surfaces
- [ ] codegen updated (TS types)
- [ ] logs redact secrets
- [ ] error cases handled (at least basic)
- [ ] doc update if contract changed
- [ ] screenshots/GIF for UI changes

### 6.2 Review expectations

- 1 reviewer minimum
- “approve” means:
  - can explain the change
  - can explain the failure mode
  - knows how to roll back

### 6.3 PR size

Your “1–3 files per PR” is good, but allow exceptions for mechanical changes (codegen / refactors) that touch many files.

---

## 7) Developer experience scripts

Create a `Makefile` (or justfile) with:

- `make infra` (docker compose up)
- `make api` (uvicorn)
- `make worker` (arq)
- `make ui` (npm dev)
- `make test` (unit + integration)
- `make lint`
- `make codegen`
- `make validate` (full check)

DX principle:
- a new dev should be productive in 30 minutes.

---

## 8) Observability baseline

Even if you skip OTEL, you need:

- structured logs with:
  - run_id, thread_id, tenant_id, conversation_id
  - event_type
  - node_name
  - tool_name
- log levels:
  - DEBUG in dev
  - INFO in prod
- error codes for common failures (rate limit, timeout, schema validation)

LangSmith tracing is optional but powerful:
- https://docs.langchain.com/langsmith/observability-quickstart

---

## 9) Secrets and environment discipline

Rules:
- never commit API keys
- `.env.example` is required
- any new env var must be documented
- log redaction:
  - OpenAI keys, Stripe keys, Brave keys
  - JWT tokens
  - user PII fields

---

## 10) Release discipline (even for internal builds)

- tag milestones (M0/M1/M2…)
- changelog entries for contract changes
- migration version pinned to release
- “rollback plan”:
  - if schema breaks, revert migration (down) and redeploy

---

## 11) Professional pragmatism (how to ship)

A pragmatic plan is:

- smallest vertical slice that proves the core
- contracts locked early
- parallelize only after interfaces are stable
- invest in tooling that removes future rework (codegen, replay)

Avoid:
- building 4 deliverables before proving 1 deliverable end-to-end
- adding providers and connectors before tool boundary is stable
- “UI polish sprint” at the end (do product feel throughout)

