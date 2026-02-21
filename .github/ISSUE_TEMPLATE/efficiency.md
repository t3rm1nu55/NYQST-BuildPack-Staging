# Issue Template: Efficiency

**Title format**: `R[run]: [Efficiency description]`

**Labels**: `efficiency`, `P[1-2]`, `run:[run]`, `review:[source]`

---

## Opportunity

[What can be consolidated, simplified, or built once]

## Current State

[How many epics/issues currently build this independently]

## Proposed Approach

[Build shared primitive, cut scope, simplify v1, buy vs build]

## Estimated Savings

[Issue count reduction, effort reduction, timeline impact]

## Affected Epics

[List of epics that would use the shared primitive or benefit from the simplification]

## Deferred Scope

[If this efficiency gain involves cutting or deferring features, EVERY deferred item must be tracked here]

| Deferred Item | Cut From | Target Milestone | Tracking |
|---------------|----------|-----------------|----------|
| [item] | [epic] | [M-N or "post-v1"] | [label `deferred` / separate issue #N] |

**Label requirement**: Apply `deferred` label to this issue if any scope is being reduced.
If no scope is deferred (pure consolidation), write: "No scope reduction — work is consolidated, not cut."

## Design Requirements

[Interface spec, what varies between uses, what's shared]
