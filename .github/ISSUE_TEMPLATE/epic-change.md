# Issue Template: Epic Change (Merge/Split/Reorder/Re-track)

**Title format**: `R[run]: [Merge/Split/Re-track] '[epic name]' [into/from] '[epic name]'`

**Labels**: `epic-change`, `P[1-2]`, `run:[run]`, `track:[track]`, `review:[source]`

---

## Change Type

- [ ] Merge (two epics → one)
- [ ] Split (one epic → two)
- [ ] Re-track (move to different track)
- [ ] Reorder (change milestone assignment)

## Current State

[What exists now — epic names, track, milestone, issue count]

## Proposed Change

[What the new structure looks like]

## Rationale

[Why this change is needed — overlapping responsibilities, wrong track, dependencies]

## Dependency Impact

[What DAG edges change, what other epics are affected]

## Issue Migration

[Which issues move where in the new structure]

| Source Issue | Destination | Notes |
|-------------|-------------|-------|
| [issue/concept] | [target epic or "deliberately removed — reason"] | |

**Confirmation**: [ ] All issues from source epic(s) accounted for — each has a destination, is explicitly deferred, or is deliberately removed with rationale

## Deferred Scope

[If this change reduces total scope (merge that drops concepts, split that orphans items), list what's deferred]

| Deferred Item | Reason | Target Milestone | Tracking |
|---------------|--------|-----------------|----------|
| [item] | [why deferred] | [M-N or "post-v1"] | [label `deferred` / separate issue #N] |

If no scope is deferred, write: "No scope reduction — all items preserved in new structure."
