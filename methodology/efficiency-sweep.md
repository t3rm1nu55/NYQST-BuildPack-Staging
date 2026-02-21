# Efficiency Sweep

Run after any epic planning or decomposition pass. Identifies reusable patterns that save 25-40% of issues.

## When to Run

- After initial epic decomposition
- After adding new epics (Run 2)
- After shared primitive design (to check for more)
- Before locking a build pack (final check)

## What to Look For

### 1. Shared Primitives

Patterns that appear in 3+ epics. Common examples:

| Primitive | Signal | Typical Savings |
|-----------|--------|-----------------|
| Versioned Entity CRUD | Multiple epics with create/read/update/version lifecycle | 40-60 issues |
| List/Detail Screen Skeleton | Multiple frontend epics with list + search + detail pages | 20-30 issues |
| Diff Viewer | Multiple "compare two versions" requirements | 15-20 issues |
| Calculation Engine | Multiple deterministic computation + explain() requirements | 10-15 issues |
| Extraction Pipeline | Multiple "parse document → extract structured data" flows | 15-20 issues |
| Provenance Display | Multiple "show data with drilldown to evidence" UIs | 10-15 issues |

### 2. Duplicate Infrastructure

Two epics building the same underlying capability:
- Canvas frameworks (workflow builder + analysis canvas = same React Flow setup)
- Config wizards (app builder + model editor = same multi-step wizard)
- Event dispatchers (workflows + apps = same trigger mechanism)

### 3. Over-Engineering Opportunities

Features where a simpler v1 exists:
- Infinite canvas → vertical pinnable blocks
- 27 UI primitives → 8 essential ones
- Visual workflow builder → YAML/JSON + form editor
- Custom DSL → JSON-path equality checks

### 4. Build-vs-Buy

Capabilities where OSS solutions exist:
- Notifications → Novu (open-source, self-hosted)
- Workflow scheduling → Temporal.io or Inngest
- Feature flags → Unleash (open-source, self-hosted)
- Secret scanning → Gitleaks

## Process

1. List all epics with their concept decomposition
2. For each concept, check: does this pattern exist in another epic?
3. Group into primitives (3+ occurrences = candidate)
4. Estimate savings per primitive (issue count reduction)
5. Design primitive interface (what varies between uses, what's shared)
6. Update epic specs to reference primitives instead of building bespoke

## Output

- Updated primitive list with usage points
- Estimated total savings (should be 25-40% of issue count)
- Updated epic specs referencing primitives
- New insight file if the sweep found something unexpected
