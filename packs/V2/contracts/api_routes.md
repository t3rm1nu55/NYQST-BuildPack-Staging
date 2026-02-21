# API routes (v1)

This is a suggested REST surface. Adjust to match your existing repo conventions.

Conventions:
- all routes are tenant-scoped by auth
- project-scoped routes include `project_id`
- pagination: `?limit=&cursor=` (or your chosen style)
- responses include `data` and `next_cursor` when paginated
- streaming uses `/runs/{run_id}/events/stream`

---

## Projects

- GET `/projects`
- POST `/projects`
- GET `/projects/{project_id}`
- PATCH `/projects/{project_id}`

---

## Apps

- GET `/projects/{project_id}/apps`
- POST `/projects/{project_id}/apps`
- GET `/projects/{project_id}/apps/{app_id}`
- POST `/projects/{project_id}/apps/{app_id}/publish` (creates new immutable version)
- GET `/projects/{project_id}/apps/{app_id}/versions`
- GET `/projects/{project_id}/apps/{app_id}/versions/{version}`

Runs:
- POST `/projects/{project_id}/apps/{app_id}/run` → creates Run + returns `run_id`
- GET `/projects/{project_id}/apps/{app_id}/runs`
- GET `/projects/{project_id}/runs/{run_id}`

---

## Runs + events

- GET `/projects/{project_id}/runs`
- GET `/projects/{project_id}/runs/{run_id}`
- GET `/projects/{project_id}/runs/{run_id}/events`
- GET `/projects/{project_id}/runs/{run_id}/events/stream` (SSE or NDJSON)

Payload contract:
- `contracts/run_event.schema.json`

---

## Documents (bundles)

- GET `/projects/{project_id}/bundles`
- POST `/projects/{project_id}/bundles` (create bundle metadata)
- POST `/projects/{project_id}/bundles/{bundle_id}/versions` (new version + upload)
- GET `/projects/{project_id}/bundles/{bundle_id}`
- GET `/projects/{project_id}/bundles/{bundle_id}/versions`
- GET `/projects/{project_id}/bundles/{bundle_id}/versions/{v}`

Diff:
- GET `/projects/{project_id}/bundles/{bundle_id}/compare?vA=&vB=`

---

## Evidence + insights

Evidence:
- GET `/projects/{project_id}/evidence`
- POST `/projects/{project_id}/evidence`
- PATCH `/projects/{project_id}/evidence/{evidence_id}`

Insights:
- GET `/projects/{project_id}/insights`
- POST `/projects/{project_id}/insights`
- PATCH `/projects/{project_id}/insights/{insight_id}`
- POST `/projects/{project_id}/insights/{insight_id}/status` (transition)

---

## CRM

- GET `/projects/{project_id}/crm/entities?type=COMPANY`
- POST `/projects/{project_id}/crm/entities`
- GET `/projects/{project_id}/crm/entities/{entity_id}`
- PATCH `/projects/{project_id}/crm/entities/{entity_id}`

Relationships:
- POST `/projects/{project_id}/crm/entities/{entity_id}/relationships`
- GET `/projects/{project_id}/crm/entities/{entity_id}/relationships`

---

## Models + validation

- GET `/projects/{project_id}/models`
- POST `/projects/{project_id}/models`
- GET `/projects/{project_id}/models/{model_id}`
- POST `/projects/{project_id}/models/{model_id}/publish`
- POST `/projects/{project_id}/models/{model_id}/validate` → creates validation run (Run)
- GET `/projects/{project_id}/models/{model_id}/validation-runs`

---

## Dashboards

- GET `/projects/{project_id}/dashboards`
- POST `/projects/{project_id}/dashboards`
- GET `/projects/{project_id}/dashboards/{dashboard_id}`
- POST `/projects/{project_id}/dashboards/{dashboard_id}/refresh` → creates Run

---

## Workflows

- GET `/projects/{project_id}/workflows`
- POST `/projects/{project_id}/workflows`
- GET `/projects/{project_id}/workflows/{workflow_id}`
- POST `/projects/{project_id}/workflows/{workflow_id}/publish`
- POST `/projects/{project_id}/workflows/{workflow_id}/run` → creates Run
- GET `/projects/{project_id}/workflows/{workflow_id}/runs`

---

## Deliverables

- GET `/projects/{project_id}/deliverables`
- POST `/projects/{project_id}/deliverables` (start generation; creates Run)
- GET `/projects/{project_id}/deliverables/{deliverable_id}`
- GET `/projects/{project_id}/deliverables/{deliverable_id}/download` (signed url)

