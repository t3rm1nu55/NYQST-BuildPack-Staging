# Agent Dispatch Patterns

Proven patterns for using AI agents (opus/sonnet/haiku) in build pack construction.

## Tier Strategy

| Tier | Use For | Cost | Speed |
|------|---------|------|-------|
| **Opus** | Reviews, architectural decisions, contradiction resolution, meta-analysis | High | Slow |
| **Sonnet** | Investigation, implementation, auditing, file operations | Medium | Medium |
| **Haiku** | Summarization, file scanning, simple lookups | Low | Fast |

## Funnel Pattern

```
Haiku/Sonnet scans → Sonnet digs into findings → Opus validates/decides
```

Don't burn opus context on scanning. Use cheaper agents to narrow the search space.

## Parallel Dispatch

**Reviews** (lenses 1-6): Dispatch all 6 opus agents in parallel. They are independent — each reads the same input but evaluates a different lens. Meta-review (lens 7) runs after, synthesizing findings from 1-6.

**Repo audits**: One sonnet agent per repo, in parallel. Each checks file completeness and issue quality independently.

**Contradiction resolution**: One opus agent per contradiction cluster. Group related contradictions (e.g., all data model contradictions together) to maintain coherent decisions.

## Agent Prompt Structure

Good prompts for build pack agents include:

1. **Role**: "You are reviewing the V3 build pack for [specific lens]"
2. **Input**: Explicit list of files to read (paths, not content — let the agent read them)
3. **Evaluation criteria**: What "good" looks like for this lens
4. **Output format**: Score (X/10), findings table, specific recommendations
5. **Constraints**: "Do not propose changes to [X]. Focus only on [Y]."

## Context Management Rules

- **Never inline large documents** into agent prompts — give paths, let agents read
- **Never read full source files** when symbols/summaries suffice
- **Reference by path** — agents can read files themselves
- **Cap agent output** — request structured findings tables, not prose essays

## When to Use Teams vs Single Agent

| Scenario | Approach |
|----------|----------|
| 6 independent reviews | Parallel agents (one per lens) |
| File audit across 4 repos | Parallel agents (one per repo) |
| Single contradiction resolution | Single opus agent with full context |
| Epic decomposition | Single opus agent (needs holistic view) |
| Efficiency sweep | Single opus agent (needs to see all epics at once) |

## Anti-Patterns

- Using opus for file scanning (use sonnet/haiku)
- Using sonnet for architectural decisions (use opus)
- Running reviews sequentially when they're independent (parallel is 6x faster)
- Inlining 200-line documents into prompts (reference by path)
- Not specifying output format (agents produce inconsistent results)
