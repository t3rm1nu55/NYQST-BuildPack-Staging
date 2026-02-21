# Modules, screens, and navigation

This is a front-end oriented map of the “production system” UX: screens, views, and how they link.

## Global navigation (left rail)

- **Projects**
- **Apps**
- **Studio**
- **Documents**
- **CRM**
- **Models**
- **Dashboards**
- **Workflows**
- **Runs**
- **Admin/Settings**

All items are scoped to the active Project, except Projects and Admin.

## Screen list (v1 production)

### 1) Projects

1. Projects list
   - search, filter, create project
2. Project home
   - pinned apps
   - recent documents
   - attention required (validation failures, extraction low confidence)
   - activity timeline (runs, uploads, changes)

### 2) Apps (Dify-style)

1. Apps gallery
   - cards: type, inputs, triggers, last run
   - filters: type/status/owner
2. App detail
   - Run tab (inputs + context toggles + run + stream + output preview)
   - Configure tab (wizard)
   - Runs tab (history)
   - Outputs tab (artifacts created)
   - Permissions tab (v1-lite)

### 3) Studio

Studio is two linked surfaces:

1. Notebook
   - pages
   - blocks (text, evidence, charts, embedded app output)
   - citations/evidence links
2. Canvas (infinite)
   - blocks: doc snippet, extraction, evidence, insight, model field, dashboard tile, app output
   - edges: “supports”, “contradicts”, “derived-from”
   - diff overlays: show changes between bundle versions and downstream impacts
   - inspector: provenance, sources, run links, version pinning

### 4) Documents

1. Bundles list
   - upload (new bundle)
   - filters (type/status/owner)
2. Bundle detail
   - versions list + compare
   - processing status
   - extracted fields preview
   - evidence highlights
3. Version diff view
   - document diff
   - extraction diff
   - model impact diff
4. Ingest pipeline run log
   - steps, metrics, errors
   - re-run, re-extract

### 5) CRM

1. Entity list (companies/people/assets/etc)
2. Entity detail
   - overview
   - relationships graph
   - timeline (events)
   - linked bundles + evidence + insights
3. CRM views (saved queries as View Apps)

### 6) Models

1. Model registry (domain models + versions)
2. Model editor
   - schema + field definitions
   - link fields to evidence requirements
3. Validation runs
   - rules
   - pass/fail + diffs
4. Model diff
   - schema diff
   - derived data deltas

### 7) Dashboards

1. Dashboard list
2. Dashboard detail
   - tiles
   - exceptions list and drilldowns
   - provenance panel: every number has evidence links

### 8) Workflows

1. Workflow list
2. Workflow builder (node canvas)
3. Workflow run log (node-by-node)
4. Triggers & schedules

### 9) Runs

1. Runs list (filter by app/workflow/bundle)
2. Run detail
   - streaming event timeline
   - artifacts produced
   - cost + tokens + duration
   - retries and errors
   - replay (optional later)

---

## Route map (example)

- /projects
- /projects/:projectId/home
- /projects/:projectId/apps
- /projects/:projectId/apps/:appId
- /projects/:projectId/studio
- /projects/:projectId/documents
- /projects/:projectId/documents/:bundleId
- /projects/:projectId/documents/:bundleId/compare/:vA/:vB
- /projects/:projectId/crm
- /projects/:projectId/crm/:entityType/:entityId
- /projects/:projectId/models
- /projects/:projectId/models/:modelId
- /projects/:projectId/dashboards
- /projects/:projectId/dashboards/:dashboardId
- /projects/:projectId/workflows
- /projects/:projectId/workflows/:workflowId
- /projects/:projectId/runs
- /projects/:projectId/runs/:runId

