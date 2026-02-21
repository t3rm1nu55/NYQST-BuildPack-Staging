# V4 Consolidated Output

Files appear in this directory as V4 meta-issues are resolved. Each resolution produces consolidated versions of source artifacts from `packs/V1/`, `packs/V2/`, and `packs/V2M/`.

## How It Works

Each V4 meta-issue has a **File Artifacts** section in its close procedure that specifies:
- Which source files to read (under `packs/`)
- What decision to incorporate
- What V4 output to produce (under `v4/`)

When a V4 meta-issue is closed, its File Artifacts checklist is executed and the resulting files land here.

## Structure

```
v4/
├── README.md           ← this file
├── CHANGELOG.md        ← tracks each change with V4 issue # and rationale
├── reference/          ← consolidated reference docs (decision register, dependency graph)
└── contracts/          ← consolidated JSON schemas (if schema surface changes)
```

## Source Packs

| Pack | Path | Contents |
|------|------|----------|
| V1 | `packs/V1/` | 11 contracts, 15 planning docs, mockups, research |
| V2 | `packs/V2/` | 16 contracts (superset of V1), 15 docs, Build Guide v5, pattern files |
| V2M | `packs/V2M/` | Decision register, implementation plan, dependency graph, gap analysis |

Source files remain in place — `v4/` contains only consolidated outputs.
