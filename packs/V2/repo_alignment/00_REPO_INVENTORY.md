# Repo alignment inventory

Generated from repo snapshot: `nyqst-intelli-230126-main`.

- Python files: **103**
- UI TS/TSX files: **115**

## Top-level

- `.env.example`
- `.github`
- `.gitignore`
- `.serena`
- `CITATION_DEBUGGING_REPORT.md`
- `CLAUDE.md`
- `DESIGN-KNOWLEDGE-CONTEXT-SYSTEM.md`
- `README.md`
- `alembic.ini`
- `docker-compose.yml`
- `docs`
- `eslint.config.js`
- `index.html`
- `migrations`
- `package.json`
- `packages`
- `postcss.config.js`
- `pyproject.toml`
- `requirements`
- `research`
- `scenarios`
- `schemas`
- `scripts`
- `src`
- `tailwind.config.js`
- `tests`
- `tsconfig.json`
- `tsconfig.node.json`
- `ui`
- `uv.lock`
- `vite.config.ts`

## FastAPI routers

- `src/intelli/api/health.py` (prefix: `/health`)
- `src/intelli/api/v1/__init__.py` (prefix: `/api/v1`)
- `src/intelli/api/v1/agent.py` (prefix: `/agent`)
- `src/intelli/api/v1/artifacts.py` (prefix: `/artifacts`)
- `src/intelli/api/v1/auth.py` (prefix: `/auth`)
- `src/intelli/api/v1/conversations.py` (prefix: `/conversations`)
- `src/intelli/api/v1/health.py`
- `src/intelli/api/v1/manifests.py` (prefix: `/manifests`)
- `src/intelli/api/v1/pointers.py` (prefix: `/pointers`)
- `src/intelli/api/v1/rag.py` (prefix: `/rag`)
- `src/intelli/api/v1/runs.py` (prefix: `/runs`)
- `src/intelli/api/v1/sessions.py` (prefix: `/sessions`)
- `src/intelli/api/v1/streams.py` (prefix: `/streams`)
- `src/intelli/api/v1/tags.py` (prefix: `/tags`)

## UI pages

- `ui/src/pages/AnalysisPage.tsx`
- `ui/src/pages/ClientsPage.tsx`
- `ui/src/pages/DecisionsPage.tsx`
- `ui/src/pages/ModulePlaceholder.tsx`
- `ui/src/pages/NotebookPage.tsx`
- `ui/src/pages/NotebooksPage.tsx`
- `ui/src/pages/OverviewPage.tsx`
- `ui/src/pages/ProjectsPage.tsx`
- `ui/src/pages/ResearchPage.tsx`
- `ui/src/pages/__tests__/NotebooksPage.test.tsx`
- `ui/src/pages/__tests__/OverviewPage.test.tsx`
- `ui/src/pages/__tests__/ResearchPage.test.tsx`

## DB models

- `src/intelli/db/models/__init__.py`
- `src/intelli/db/models/auth.py`
- `src/intelli/db/models/conversations.py`
- `src/intelli/db/models/rag.py`
- `src/intelli/db/models/runs.py`
- `src/intelli/db/models/substrate.py`
- `src/intelli/db/models/tags.py`

## LangGraph / agentic runtime related code

- `src/intelli/agents/graphs/research_assistant.py`
