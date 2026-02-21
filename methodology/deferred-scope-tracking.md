# Methodology: Deferred Scope Tracking

## Principle

**"Cut" without a destination is "deleted."** Any scope reduction must explicitly track what is being deferred, where it goes, and how it's tracked. Without this, deferred items silently become permanent cuts.

## The Problem

During build pack consolidation, scope is regularly reduced through:
- Epic merges (issues from source epic may not all transfer)
- Scope cuts (issue count reduced, features deferred)
- Scope boundaries (features explicitly excluded from v1)
- Gap resolution (promoting one feature may defer another)

If the deferred items are not tracked with a destination (target milestone, backlog label, or tracking issue), they disappear from the plan entirely.

## Rules

### R1: Significant scope reductions must have a deferred items table

Any issue that removes, reduces, or defers scope beyond trivial adjustments must include:

| Deferred Item | Reason | Target Milestone | Tracking |
|---------------|--------|-----------------|----------|
| [specific item] | [why] | [M-N or "post-v1"] | [`deferred` label / issue #N] |

Use judgment on materiality — a single minor field being dropped doesn't need a table, but removing a feature, concept, or group of issues does.

### R2: Epic merges must confirm all issues transfer

Any epic-change issue (merge/split) must include:
- A migration table showing every issue/concept from the source epic and its destination
- An explicit confirmation: "All N issues accounted for — none dropped"

### R3: Use the `deferred` label

Issues that reduce scope should have the `deferred` label applied. This makes deferred scope searchable: `gh issue list --label deferred`.

### R4: Deferred items need a return destination

Give deferred items the most specific destination you can at the time. Precision improves as the plan matures:
- **M-N**: specific milestone (preferred when planning is mature enough)
- **post-v1**: first release after v1 (acceptable in early planning)
- **backlog**: no timeline, tracked for later prioritisation (acceptable in early planning)
- **cut**: intentionally removed, not coming back (also acceptable — just be explicit)

Early in planning, "post-v1" or "backlog" is fine. As runs progress, refine these to specific milestones where possible.

### R5: Audit agent checks this

The `bp-audit-repo` agent verifies:
- Issues with `efficiency` label have deferred scope sections if scope is reduced
- Issues with `epic-change` label have issue migration tables
- Issues mentioning "cut", "defer", "reduce", "drop" have tracking for deferred items
- `deferred` label exists and is applied where scope is reduced

## Anti-Patterns

| Anti-Pattern | Example | Fix |
|-------------|---------|-----|
| "Defer" without destination | "Defer: visual builder (8-10 issues)" | Add target milestone: "M6" or "post-v1" |
| "Not in v1" without return plan | "Hard boundary: no dynamic GML" | Add: "Returns at M6+ as EPIC-GENUI-ADVANCED" |
| Terse merge with no migration | "Merge Skills into Agents & MCP" | Add table showing all Skills issues → Agents & MCP |
| Implicit cut disguised as merge | "Fold Decisions into Evidence" | Confirm: all 8 Decisions issues accounted for |

## Template References

All issue templates in `Standards/templates/issue-templates/` include deferred scope sections:
- `epic-change.md` — Issue Migration table + Deferred Scope table
- `efficiency.md` — Deferred Scope table + `deferred` label requirement
- `gap.md` — Deferred Items table (optional, for when gap resolution defers other work)
- `risk.md` — Scope Boundaries table (in/out of scope for v1)
