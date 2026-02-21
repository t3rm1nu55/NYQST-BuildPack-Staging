# Coding standards and repo hygiene

The goal: agents can work in parallel without creating a merge nightmare.

---

## Non-negotiables

- Every PR ships with:
  - tests appropriate to scope
  - docs updates (or “no docs needed” justification)
  - typed interfaces (Pydantic/TypeScript)
- Contracts are versioned and reviewed like code.
- Event types and schemas are treated as public API.
- No silent failure paths (log + structured error).

---

## Python standards (backend)

- Use **SQLAlchemy 2.0 async** consistently.
- One logical layer per file:
  - API handler calls service
  - service calls repositories
  - repositories call DB
- Pydantic v2 for request/response and internal contracts.
- Prefer explicit typing on public interfaces.

Formatting/Lint/Types:
- ruff (format + lint)
- mypy (incremental adoption)
- no unused imports/vars
- avoid implicit Any on public contracts

Error handling:
- never swallow exceptions
- raise typed API errors in services
- emit RunEvents for warnings/errors when in a run context

---

## TypeScript/React standards (frontend)

- Route pages are thin; screens are composed from components.
- Global state only when necessary (Zustand).
- Every “screen” has:
  - empty state
  - loading state
  - error state
- Streamed events are handled in a single place (event store) then projected into UI stores.

Testing:
- Vitest for components/stores
- Playwright for the golden path + two major flows
- contract fixtures used in unit tests

---

## Eventing & streaming standards

- Every new event type requires:
  - backend enum update
  - payload schema (Pydantic)
  - frontend type update
  - frontend renderer update
  - fixtures update
  - contract tests update

Treat event schema changes as breaking changes unless backward compatible.

---

## PR standards

- Keep PRs small:
  - 1–3 files where possible
  - “one concept per PR”
- Naming:
  - `feature/<area>-<short-name>`
  - `fix/<area>-<short-name>`
- Include:
  - screenshots for UI changes
  - run logs for pipeline changes
  - migration output for DB changes

---

## Documentation standards

Docs are written for:
- future maintainers
- agents
- audit/trace review

Minimum per feature:
- “what it is”
- “how it works”
- “how to test”
- “how to debug”
- “contract” (schemas/events)

Avoid:
- vague statements (“should work”, “nice to have”)
- missing edge cases

---

## Production standards (baseline)

- Idempotent pipelines (re-run safe)
- Deterministic migrations
- Backups and rollback plan
- Observability hooks (metrics + traces) at boundaries:
  - API entry
  - ingestion pipeline
  - app/workflow run
  - external tool calls

