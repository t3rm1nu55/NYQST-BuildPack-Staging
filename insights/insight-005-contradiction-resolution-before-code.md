# Insight 005: Resolve Contradictions Before Writing Code

## Context
Cross-reference review found 15 contradictions across 6 agent outputs + synthesis.

## Learning
When multiple documents/agents contribute to a plan, internal contradictions are inevitable. These MUST be resolved before implementation begins. Key contradiction types:
- Data model conflicts (plan storage: events vs tables)
- Naming collisions (BL-024 double assignment)
- Count discrepancies (38 vs 45 GAP items)
- HTTP semantics (402 vs 429 status codes)
- Process definition conflicts (4-step vs 6-step update rule)

Unresolved contradictions cause: blocked sprints, rework, team confusion, architectural drift.

## Evidence
- 8 critical items requiring resolution in V3
- Plan storage contradiction affects migration content, BL-007, entire planning UI
- Entity storage contradiction is a fundamental data model decision

## Reuse
Any multi-source synthesis. Always run a cross-reference integrity audit before locking.
