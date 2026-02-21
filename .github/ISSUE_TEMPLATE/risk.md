# Issue Template: Risk

**Title format**: `R[run]: [Risk description]`

**Labels**: `risk`, `P[1-2]`, `run:[run]`, `track:[track]`, `review:[source]`

---

## Risk Description

[What could go wrong]

## Likelihood

[Characterise the likelihood — can be qualitative ("unlikely unless we exceed 50 tenants") or categorical (Low/Medium/High). Use whatever conveys the risk best.]

## Impact

[What breaks if this risk materializes — data loss, scaling failure, vendor lock-in, customer churn]

## Current Mitigation

[What exists today, if anything]

## Proposed Mitigation

[What to do — ADR, abstraction layer, scaling path document, fallback plan]

## Effort to Mitigate

[Rough estimate — hours, days, issues]

## Trigger Condition (if observable)

[What would tell us this risk is materializing — metric threshold, customer count, load level. Omit if the risk isn't easily observable until it hits.]

## Scope Boundaries

[If mitigation involves deferring features or capping scope, define explicit in/out boundaries]

| In Scope (v1) | Out of Scope (deferred) | Target Milestone |
|---------------|------------------------|-----------------|
| [feature] | [feature] | [M-N or "post-v1"] |

If no scope boundaries apply, omit this section.
