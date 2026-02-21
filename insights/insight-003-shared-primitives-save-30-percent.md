# Insight 003: Shared Primitives Save 30% of Issues

## Context
Meta-review of 30 epics found 6 recurring patterns appearing in 5+ epics each.

## Learning
After initial epic planning, always do a sweep for shared primitives. Look for: versioned entity CRUD, list/detail screen skeletons, diff viewers, calculation engines, extraction pipelines, provenance displays. Building these as reusable frameworks saves 26-38% of total issues.

## Evidence
- Versioned Entity CRUD appears in 8 epics (40-60 issues saved)
- Extraction Skill pattern appears in 4 domain modules (15-20 issues saved)
- Total: 110-160 issues saved from 424 (26-38%)

## Reuse
Any multi-epic planning exercise. Schedule an "efficiency sweep" after first pass of epic decomposition.
