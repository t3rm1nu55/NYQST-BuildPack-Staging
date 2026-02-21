# Review 2: Priority & Commercial Ordering

**Reviewer**: Opus 4.6
**Overall Score: 4.5 / 10**

---

| Area | Score | Key Issue |
|---|---|---|
| Revenue-path priority | 3/10 | Lease CDs at M8; 7 milestones of platform before first revenue |
| Platform vs Product balance | 4/10 | 51% effort on non-revenue platform; 20+ GenUI primitives before 1 domain module |
| Enterprise readiness timing | 5/10 | SSO/RBAC/Audit at M6 — must split for wedge product |
| Domain module ordering | 6/10 | DocuIntelli before Lease CDs inverts feedback loop; Debt/RegSygnal parallelism missed |
| Competitive benchmarking | 5/10 | Platform parity with Dify is a losing strategy; vertical advantage is the moat |
| Effort allocation | 4/10 | LEASECD (12 issues) vs EPIC-DELIVERABLES (22 issues) is backwards |

## The Revenue Problem

Lease CDs — the wedge product — sits behind **8 milestones of platform work**:
```
M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8-LEASECD
```

What a customer needs for Lease CDs: upload PDF → extract critical dates → run calcs → export report → SSO login → basic audit trail. Six capabilities. The plan builds 216 issues of platform before any of them ship.

## Recommendation: Wave 0.5 — Lease CD MVP

Pull forward into a new milestone between M1 and M2:

| Pull Forward | From | Into |
|---|---|---|
| Document upload + ingest (C1-C3) | Track A | Wave 0.5 |
| DocIR extraction pipeline (DI-002) | M7 | Wave 0.5 |
| Lease extraction skill (LEASECD-002) | M8 | Wave 0.5 |
| Deterministic calc engine (LEASECD-003) | M8 | Wave 0.5 |
| Term review UI (basic table) | M8 | Wave 0.5 |
| Report export (Markdown/PDF) | M8 | Wave 0.5 |
| SSO/OIDC (ENT-001 only) | M6 | Wave 0.5 |
| Basic audit log (ENT-003) | M6 | Wave 0.5 |

**Demo-able product in ~8 weeks instead of ~24 weeks.**

## Effort Reallocation

Current: 51% effort on Tracks A+B (zero direct revenue), 33% on Track C (ALL revenue).

| Cut | From | To |
|---|---|---|
| EPIC-GENUI: 16 → 6 issues | Core primitives only (Table, Chart, Citation, Badge, Card, Text) | |
| EPIC-WORKFLOWS: 18 → 8 issues | Definition + runner only, defer visual builder | |
| EPIC-STUDIO: 14 → 8 issues | Notebook only, defer infinite canvas | |
| EPIC-APPS: 20 → 12 issues | Schema + runner, defer builder wizard | |
| LEASECD: 12 → 20+ issues | Calc engine alone needs 8-10 issues | |

## Enterprise Auth Split

- **ENT-Alpha** (ships with Lease CD): SSO + basic RBAC + audit log core
- **ENT-Beta** (M6): ABAC, metering, GDPR, Stripe

## Domain Module Reorder

Current: DocuIntelli → LeaseCD → Debt → RegSygnal → PropSygnal (sequential)

Correct:
1. **LeaseCD** (wedge, revenue day 1)
2. **DocuIntelli** (generalize patterns from LeaseCD)
3. **Debt || RegSygnal** (parallel, different buyers)
4. **PropSygnal** (last, most dependent on external data)

## Competitive Insight

DocuIntelli's moat is NOT platform features (Dify/n8n always ahead on breadth). The moat is the **vertical intelligence stack**: extraction with provenance, deterministic calculations, evidence-linked reporting. Every month on platform before shipping vertical product = competitors advance.

## Bottom Line

> The V3 build pack reads like an engineering plan, not a commercial plan. The question is not "what does the platform need?" but "what does the first customer need to sign a $200k check?"
