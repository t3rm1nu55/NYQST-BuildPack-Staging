# Pack overview

This pack is written for parallel delivery by multiple agents/developers.

Key principle: **contracts first, vertical slices second, hardening last**.

The product is organized around four “work objects”:

1) **Projects**  
   Everything lives in a project: docs/bundles, CRM entities, apps, workflows, models, dashboards, runs, and audit.

2) **Documents (Bundles + Versions)**  
   Canonical record of source material. Everything downstream (extraction, evidence, insights, model fields) must link back to a specific bundle version.

3) **Studio (Notebook + Infinite Canvas)**  
   Where users do analysis. Notebook is narrative; canvas is spatial analysis with blocks, links, diffs, and embedded app outputs.

4) **Apps**  
   A saved configured unit of work (Dify-style). Apps run agents/analyses/workflows with a context pack and produce artifacts.

Supporting systems:
- **CRM** (entities, timelines, relationships)
- **Intelligence** (evidence, insights, context packs)
- **Models + Validation** (domain models, rules, validations, deltas)
- **Dashboards** (provenance-first KPIs and exception drilldowns)
- **Workflows** (n8n-like orchestration + triggers + schedules)
- **Agents + Skills** (MCP tools, skill registry, evals)
- **Billing/Quota** (optional early, required for production)
- **Production hardening** (security, observability, performance, deployment)

What to do first:
- Get the repo to a known-good baseline.
- Lock contracts (schemas + event types + API surfaces).
- Build one thin vertical slice that proves the UX: Project → App → Run → Output pinned to Studio → audit run log.

