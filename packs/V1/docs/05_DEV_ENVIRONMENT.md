# Development environment specification

This defines a repeatable, agent-friendly environment.

---

## Runtime topology (local-first)

- FastAPI app running on host (uvicorn)
- Worker process running on host (arq)
- Infrastructure via Docker Compose:
  - Postgres (+ pgvector)
  - Redis
  - MinIO (S3)
  - OpenSearch (or pgvector-only if you choose)

Rationale:
- fastest dev loop
- easy debugging
- only containerize after primitives are proven

---

## Local requirements

Backend:
- Python 3.11+ (pin exact version in `.python-version`)
- `uv` for dependency management (or Poetry/pip, but pick one)
- `ruff`, `mypy`, `pytest`, `pytest-asyncio`

Frontend:
- Node 20+ (pin in `.nvmrc`)
- npm/pnpm (pick one)
- Vite + React + TypeScript
- shadcn/ui + Tailwind
- Vitest + Testing Library
- Playwright for e2e

Infrastructure:
- Docker Desktop (or Colima)
- docker compose v2

---

## Environment variables

Provide `.env.example` checked into the repo. Never commit real secrets.

Minimum:

Backend:
- DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/nyqst
- REDIS_URL=redis://localhost:6379/0
- STORAGE_BACKEND=s3
- S3_ENDPOINT_URL=http://localhost:9000
- S3_ACCESS_KEY=minioadmin
- S3_SECRET_KEY=minioadmin
- S3_BUCKET=nyqst
- INDEX_BACKEND=opensearch  # or pgvector
- OPENSEARCH_URL=http://localhost:9200
- AUTH_MODE=jwt|api_key
- JWT_SECRET=change-me
- OPENAI_API_KEY=... (dev only)

Frontend:
- VITE_API_BASE_URL=http://localhost:8000
- VITE_AUTH_MODE=jwt|api_key

---

## Scripts

Must exist:

- `scripts/dev/run.sh`  
  starts infra + backend + frontend (or points to separate terminals)

- `scripts/dev/validate.sh`  
  runs:
  - env checks
  - migrations
  - backend health
  - contract tests
  - unit + integration tests
  - UI typecheck + build

- `scripts/start-worker.sh`  
  starts arq worker with correct settings

---

## CI environments

CI runs three tiers:

1) Unit tests (no external services)
2) Integration tests (DB/Redis/MinIO/OpenSearch using services)
3) Live tests (manual trigger only; real API keys)

CI must:
- spin Postgres/Redis services for integration tests
- run migrations on a fresh DB
- run contract validation (schemas) against fixtures

---

## Pre-commit

Use pre-commit hooks to enforce:
- formatting
- linting
- type checking
- schema validation

Backend recommended:
- ruff format + ruff check
- mypy (incremental)
- pytest -m unit

Frontend recommended:
- eslint
- prettier (if used)
- tsc -p
- vitest run

