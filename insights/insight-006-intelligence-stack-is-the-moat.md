# Insight 006: Intelligence Stack is the Competitive Moat

## Context
Meta-review identified what the V3 pack does better than any competitor.

## Learning
The evidence → insights → models → dashboards chain with stale propagation is genuinely novel. No competing platform (Dify, n8n, LangFlow) treats provenance as a first-class architectural concern. This is what makes $200k/yr defensible against ChatGPT wrappers.

Key elements:
- Evidence with confidence scores, span pointers, source typing
- Insights with lifecycle, stale flags, evidence requirements
- Models with validation rules, evidence coverage checks
- Dashboards with per-tile provenance drilldown
- Stale propagation: new doc version → stale evidence → stale insights → stale model fields → dashboard exceptions

## Reuse
When prioritizing features, protect the intelligence stack. It is the product differentiator. Platform features (workflow builder, GenUI) are table-stakes that competitors already have.
