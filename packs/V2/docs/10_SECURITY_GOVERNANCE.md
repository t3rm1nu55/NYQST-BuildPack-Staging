# Security, safety, and governance (baseline)

This is not a compliance framework; it’s the minimum to avoid obvious failures.

---

## Threat model (practical)

Assets:
- customer documents
- extracted intelligence and models
- API keys and credentials
- audit logs and run histories

Primary threats:
- auth bypass / tenant isolation failures
- insecure document storage and sharing
- SSRF via web tools
- prompt injection leading to data exfiltration
- leaking secrets through logs/events
- unsafe plugin/skill execution

---

## Baseline controls

Auth and tenancy:
- enforce tenant_id on every query
- deny-by-default in data access layer
- audit trail for all mutations

Document storage:
- per-tenant buckets or strict prefix isolation
- signed URLs only for downloads
- encryption at rest (prod)

Tool execution:
- sandboxed HTTP client
- allowlist domains if needed
- rate limits and timeouts
- redact secrets from tool logs

Streaming events:
- never emit raw secrets
- avoid emitting full document contents in events

LLM safety:
- “context pack” is explicit, not implicit
- prevent cross-tenant context injection
- record prompt + tool calls for audit (redacted)

---

## Governance objects

- Project
- App versions
- Workflow versions
- Model versions
- Validation runs
- Evidence and insights

All are versioned and audit logged.

---

## Security testing

- SAST + dependency scanning in CI
- authz tests (tenant isolation)
- basic SSRF tests for web tools

