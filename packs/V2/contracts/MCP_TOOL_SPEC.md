# MCP tool naming and contracts

All tools must follow `{domain}.{resource}.{action}` naming.

Examples:
- `knowledge.search_documents`
- `knowledge.fetch_page`
- `substrate.store_artifact`
- `projects.create_project`
- `crm.create_client`

Tool metadata must include:
- JSON schema for inputs
- JSON schema for outputs
- required permissions (roles/scopes)
- safe/unsafe classification (unsafe tools require explicit user confirmation or admin enablement)

Scopes:
- workspace
- project
- app
- task/run

Enablement:
Tools can be enabled at any scope; lower scopes can further restrict tools (never widen beyond parent scope).

