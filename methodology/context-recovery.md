# Context Recovery Protocol

How to recover full working context after a session break or context compaction.

## The OBJECTIVE/PLAN/TODO Triple

Every build pack repo has 3 files at its root:

| File | Purpose | Read Order |
|------|---------|------------|
| `OBJECTIVE.md` | What we're building, success criteria, key metrics | 1st |
| `PLAN.md` | How we're getting there (runs, exit criteria, checkpoints) | 2nd |
| `TODO.md` | Where we are now (issue checklist, status table, focus) | 3rd |

**Always read in this order**: objective (why) → plan (how) → todo (where).

## Recovery Steps

1. Read OBJECTIVE.md → PLAN.md → TODO.md (all in the build pack repo root)
2. Check open issues: `gh issue list --repo <owner>/<repo> --state open`
3. Read latest review/analysis files (paths listed in OBJECTIVE.md)
4. Read insights (for methodology context)
5. Read memory file (for cross-session state)
6. Check source repos for any referenced files

## Design Principles

- **GitHub issues are the durable state** — they survive context loss, agent crashes, session breaks
- **The triple is the index** — it points to everything else
- **Issues reference by number** — all discussion uses `#N` for traceability
- **TODO.md is the only mutable file** — OBJECTIVE and PLAN change only at run boundaries

## Anti-Patterns

- Reading code files instead of the triple → context wasted on implementation detail
- Skipping OBJECTIVE.md → lose sight of success criteria
- Not checking GitHub issues → miss updates from other sessions/agents
- Reading all review files → context bloat; read summaries, drill into specifics only as needed
