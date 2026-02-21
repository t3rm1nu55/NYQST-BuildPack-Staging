# Refresh Checkpoints

Execute after completing each consolidation run. Purpose: catch drift before it compounds.

## Universal Steps (every run)

1. **Re-read OBJECTIVE.md** — are we still aligned with success criteria?
2. **Update TODO.md** — mark completed items, refresh next run's items with new data
3. **Review GitHub issues** — close resolved, update descriptions if decisions changed scope
4. **Check forward impact** — did any decision invalidate an assumption in a later run?

## Run-Specific Checks

### After Run 1 (Contradictions + Structure)
- Did any structural change (merge/split) create new dependencies?
- Does the revised epic count match expectations?
- Are all contradiction decisions documented in the issue AND the decision register?

### After Run 1.5 (Reviews)
- Did cost model change pricing assumptions? If unviable → STOP before Run 2
- Did data model review find Artifact model unviable for certain entities? → Update Run 2 scope
- Did migration path reveal surprises (things that must be replaced vs extended)?

### After Run 2 (Resequencing)
- Count issues: did shared primitives actually save the predicted amount?
- Can a customer USE the product at the wedge milestone boundary?
- Run efficiency sweep: any NEW shared primitives from the added epics?
- Do the 4+ new epics have concept decomposition at same depth as existing?

### After Run 3 (Final Spec)
- Final alignment check against OBJECTIVE.md
- Create new insight files for anything learned during consolidation
- Archive: commit final state, close remaining issues
- Prepare handoff: what does the implementation team need to start coding?

## Anti-Patterns

- Skipping the OBJECTIVE.md re-read ("I know what it says") → drift
- Closing issues without documenting the decision → lost context
- Not checking forward impact → cascading invalidation in later runs
- Updating TODO but not GitHub issues → dual-source divergence
