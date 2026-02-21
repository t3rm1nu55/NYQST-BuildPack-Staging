# Repo capability matrix (observed vs Build Guide v5 target)

Generated: 2026-02-20 (Europe/London)

This matrix is intentionally blunt: it is meant to prevent us from assuming an epic is “done” just because there’s starter code.

| Capability                              | Target                                                              | Repo status   | Evidence                                                                   |
|:----------------------------------------|:--------------------------------------------------------------------|:--------------|:---------------------------------------------------------------------------|
| Agentic runtime (LangGraph) baseline    | LangGraph graph runnable; multi-node orchestrator w/ planner+fanout | Partial       | src/intelli/agents/graphs/research_assistant.py                            |
| Chat streaming (Vercel AI SDK)          | AI SDK data stream protocol, tool calling, attachments              | Present       | src/intelli/api/v1/agent.py; ui/src/providers/assistant-runtime.tsx        |
| Run ledger + events                     | Run & RunEvent persisted; canonical audit log                       | Present       | src/intelli/db/models/runs.py; src/intelli/services/runs/ledger_service.py |
| Run event streaming (run stream)        | SSE/NDJSON stream from PG LISTEN/NOTIFY                             | Present       | src/intelli/api/v1/streams.py                                              |
| Run event contract v1 (22 typed events) | 4-surface contract (DB enum + Pydantic + TS union + handler)        | Missing       | DB enum differs; UI uses generic RunEvent                                  |
| Artifact kernel (content-addressed)     | Artifact/Manifest/Pointer services with immutability                | Present       | src/intelli/services/substrate/*_service.py                                |
| Document bundles + versioning           | Bundle->versions->manifests->pointers                               | Partial       | Pointers exist; bundle/version model not explicit                          |
| Entity + citation system                | Entities per artifact + citation map + Sources panel integration    | Missing       | No entities tables/services/routes                                         |
| Context engineering / indexing          | Workspace/project-scoped indexing; hybrid search; rerank            | Partial       | OpenSearch + RAG exists; no rerank; limited context policy                 |
| MCP tool layer                          | MCP server w/ tool registry and stdio adapter                       | Partial       | src/intelli/mcp/* (tools mostly stub)                                      |
| Billing + metering                      | Usage metering; Stripe + quotas; BillingEvent run events            | Missing       | Run has token_usage/cost fields but no billing system                      |
| Multi-tenancy                           | tenant_id across core tables; RBAC/ABAC                             | Partial       | Tenant table exists; Run/Artifact missing tenant_id                        |
| Enterprise auth (SSO)                   | OIDC/SAML, SCIM, audit log                                          | Missing       | Auth is local/JWT; no SSO                                                  |
| Observability (LangSmith/OTel)          | Traces + spans; cost attribution                                    | Missing       | No langsmith/otel wiring                                                   |
| Docker + deploy                         | Dockerfile(s), prod compose/helm, env docs                          | Missing       | docker-compose.yml exists; no Dockerfile                                   |
| Frontend: Research workspace            | Deliverable selector, plan viewer, report panel, sources            | Partial       | ChatPanel + SourcesPanel exist; selector/plan/report missing               |
| Frontend: Notebooks                     | NotebookLM-like workspace w/ docs + notes + Q&A                     | Partial       | Notebooks pages exist but not NotebookLM-grade                             |
| Frontend: Projects/CRM                  | Project + client models + UI                                        | Missing       | Placeholder pages only                                                     |
| Frontend: Analysis canvas               | Infinite canvas, linking, diffing, provenance                       | Missing       | Placeholder page only                                                      |