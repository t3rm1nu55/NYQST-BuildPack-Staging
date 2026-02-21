# Issue import guide

The backlog in this pack is provided as:

- `issues/issues.json` (machine readable)
- `issues/*.md` (human readable)

Each issue has:
- key
- title
- milestone
- labels
- dependencies (keys)
- acceptance criteria
- test plan

---

## Suggested import process (agent-friendly)

1) Create labels from `github/labels.yml`.
2) Create milestones from `github/MILESTONES.md`.
3) Create epic issues first (`type:epic`).
4) Create story/task issues and link them:
   - in body: “Depends on: #123”
   - or using task lists in epic description

---

## Helper scripts

- `scripts/render_gh_issue_commands.py`  
  Renders `gh issue create ...` commands from `issues.json`.

Note: dependency linking varies by org conventions. Most teams handle dependencies with:
- issue body links
- a project board
- milestone ordering

