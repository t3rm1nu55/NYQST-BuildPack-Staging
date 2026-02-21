#!/usr/bin/env python3
"""Import 294 baseline build pack issues into NYQST-BuildPack-Staging.

Each issue gets:
- Pack-prefixed title: [V1] STORY-ORCH-001 — title
- Source label: source:v1 / source:v2 / source:v2m
- Original labels preserved
- Pack-prefixed milestone: [V1] M0 Baseline + P0 fixes
"""

import json
import subprocess
import sys
import tempfile
import time

REPO = "t3rm1nu55/NYQST-BuildPack-Staging"
DELAY = 0.5  # seconds between API calls to avoid rate limiting

# --- Label colors ---
SOURCE_COLORS = {
    "source:v1": "0E8A16",   # green
    "source:v2": "1D76DB",   # blue
    "source:v2m": "D93F0B",  # orange
}
DEFAULT_LABEL_COLOR = "ededed"


def run_gh(args, check=True):
    """Run a gh CLI command and return stdout."""
    result = subprocess.run(
        ["gh"] + args,
        capture_output=True, text=True
    )
    if check and result.returncode != 0:
        print(f"  WARN: gh {' '.join(args[:4])}... failed: {result.stderr.strip()}")
    return result


def create_labels(labels):
    """Create all labels in the staging repo."""
    print(f"\n=== Creating {len(labels)} labels ===")
    for i, label in enumerate(sorted(labels)):
        color = SOURCE_COLORS.get(label, DEFAULT_LABEL_COLOR)
        result = run_gh([
            "label", "create", label,
            "--repo", REPO,
            "--color", color,
            "--force"
        ], check=False)
        status = "OK" if result.returncode == 0 else "EXISTS/FAIL"
        if (i + 1) % 20 == 0:
            print(f"  [{i+1}/{len(labels)}] {status}: {label}")
    print(f"  Done: {len(labels)} labels processed")


def create_milestones(milestones):
    """Create all milestones in the staging repo."""
    print(f"\n=== Creating {len(milestones)} milestones ===")
    for ms in sorted(milestones):
        result = run_gh([
            "api", f"repos/{REPO}/milestones",
            "-X", "POST",
            "-f", f"title={ms}",
            "-f", "state=open"
        ], check=False)
        status = "OK" if result.returncode == 0 else "EXISTS/FAIL"
        print(f"  {status}: {ms}")
    print(f"  Done: {len(milestones)} milestones processed")


def build_body_v1(issue):
    """Build issue body from V1 JSON structure."""
    parts = []
    key = issue.get("key", "")
    if issue.get("problem"):
        parts.append(f"## Problem\n\n{issue['problem']}")
    if issue.get("solution"):
        parts.append(f"## Proposed solution\n\n{issue['solution']}")
    if issue.get("acceptance_criteria"):
        parts.append(f"## Acceptance criteria\n\n{issue['acceptance_criteria']}")
    if issue.get("test_plan"):
        parts.append(f"## Test plan\n\n{issue['test_plan']}")

    # Metadata block
    meta = []
    if issue.get("depends_on"):
        deps = issue["depends_on"]
        if isinstance(deps, list):
            deps = ", ".join(deps)
        meta.append(f"**Depends on:** {deps}")
    if issue.get("notes"):
        meta.append(f"**Notes:** {issue['notes']}")
    if meta:
        parts.append("## Metadata\n\n" + "\n".join(meta))

    parts.append(f"\n---\n*Source: V1 `{key}`*")
    return "\n\n".join(parts)


def build_body_v2(issue):
    """Build issue body from V2 JSON structure."""
    parts = []
    key = issue.get("key", "")
    if issue.get("problem"):
        parts.append(f"## Problem\n\n{issue['problem']}")
    if issue.get("solution"):
        parts.append(f"## Proposed solution\n\n{issue['solution']}")
    if issue.get("acceptance_criteria"):
        parts.append(f"## Acceptance criteria\n\n{issue['acceptance_criteria']}")
    if issue.get("test_plan"):
        parts.append(f"## Test plan\n\n{issue['test_plan']}")

    meta = []
    if issue.get("depends_on"):
        deps = issue["depends_on"]
        if isinstance(deps, list):
            deps = ", ".join(deps)
        meta.append(f"**Depends on:** {deps}")
    if issue.get("repo_alignment"):
        meta.append(f"**Repo alignment:** {issue['repo_alignment']}")
    if issue.get("repo_paths"):
        paths = issue["repo_paths"]
        if isinstance(paths, list):
            paths = ", ".join(paths)
        meta.append(f"**Repo paths:** {paths}")
    if issue.get("spec_refs"):
        refs = issue["spec_refs"]
        if isinstance(refs, list):
            refs = ", ".join(refs)
        meta.append(f"**Spec refs:** {refs}")
    if issue.get("notes"):
        meta.append(f"**Notes:** {issue['notes']}")
    if meta:
        parts.append("## Metadata\n\n" + "\n".join(meta))

    parts.append(f"\n---\n*Source: V2 `{key}`*")
    return "\n\n".join(parts)


def build_body_v2m(issue):
    """Build issue body from V2M JSON structure (body field is pre-formatted)."""
    body = issue.get("body", "") or ""
    issue_id = issue.get("id", "")

    # Add source/dependency metadata if not already in body
    meta = []
    if issue.get("blocked_by"):
        blocked = issue["blocked_by"]
        if isinstance(blocked, list):
            blocked = ", ".join(blocked)
        if blocked and f"Blocked By" not in body:
            meta.append(f"**Blocked By:** {blocked}")
    if issue.get("blocks"):
        blocks = issue["blocks"]
        if isinstance(blocks, list):
            blocks = ", ".join(blocks)
        if blocks and f"Blocks:" not in body:
            meta.append(f"**Blocks:** {blocks}")

    if meta:
        body = body + "\n\n## Dependencies\n\n" + "\n".join(meta)

    body = body + f"\n\n---\n*Source: V2M `{issue_id}`*"
    return body


def create_issues(pack_name, issues, build_body_fn, key_field="key"):
    """Create issues for one pack with rate limiting."""
    print(f"\n=== Importing {len(issues)} issues from {pack_name} ===")
    created = 0
    failed = 0

    for i, issue in enumerate(issues):
        key = issue.get(key_field, "UNKNOWN")
        orig_title = issue.get("title", "No title")
        title = f"[{pack_name}] {key} {orig_title}"

        # Labels: original + source label
        labels = list(issue.get("labels", []))
        labels.append(f"source:{pack_name.lower()}")
        label_args = []
        for label in labels:
            label_args.extend(["--label", label])

        # Milestone (pack-prefixed)
        ms = issue.get("milestone", "")
        ms_args = []
        if ms:
            ms_args = ["--milestone", f"[{pack_name}] {ms}"]

        # Body
        body = build_body_fn(issue)

        # Write body to temp file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(body)
            body_file = f.name

        # Create issue
        cmd = [
            "issue", "create",
            "--repo", REPO,
            "--title", title,
            "--body-file", body_file,
        ] + label_args + ms_args

        result = run_gh(cmd, check=False)

        if result.returncode == 0 and result.stdout.strip():
            created += 1
            if (i + 1) % 10 == 0:
                print(f"  [{i+1}/{len(issues)}] OK: {key}")
        else:
            failed += 1
            print(f"  [{i+1}/{len(issues)}] FAIL: {key} — {result.stderr.strip()[:100]}")

        time.sleep(DELAY)

    print(f"  Done: {created} created, {failed} failed out of {len(issues)}")
    return created, failed


def main():
    # Load all packs
    print("Loading source JSON files...")
    v1 = json.load(open("/Users/markforster/NYQST-BuildPacks/V1/issues/issues.json"))["issues"]
    v2 = json.load(open("/Users/markforster/NYQST-BuildPacks/V2/issues/issues.json"))["issues"]
    v2m = json.load(open("/Users/markforster/NYQST-BuildPacks/V2M/issues/export/issues.json"))
    print(f"  V1: {len(v1)}, V2: {len(v2)}, V2M: {len(v2m)} = {len(v1)+len(v2)+len(v2m)} total")

    # Collect unique labels
    all_labels = set(["source:v1", "source:v2", "source:v2m"])
    for data in [v1, v2, v2m]:
        for issue in data:
            for label in issue.get("labels", []):
                all_labels.add(label)

    # Collect milestones (pack-prefixed)
    all_milestones = set()
    for name, data in [("V1", v1), ("V2", v2), ("V2M", v2m)]:
        for issue in data:
            ms = issue.get("milestone", "")
            if ms:
                all_milestones.add(f"[{name}] {ms}")

    # Step 1: Create labels
    create_labels(all_labels)

    # Step 2: Create milestones
    create_milestones(all_milestones)

    # Step 3: Import issues (V1 first, then V2, then V2M)
    total_created = 0
    total_failed = 0

    c, f = create_issues("V1", v1, build_body_v1, key_field="key")
    total_created += c
    total_failed += f

    c, f = create_issues("V2", v2, build_body_v2, key_field="key")
    total_created += c
    total_failed += f

    c, f = create_issues("V2M", v2m, build_body_v2m, key_field="id")
    total_created += c
    total_failed += f

    print(f"\n=== COMPLETE ===")
    print(f"Total: {total_created} created, {total_failed} failed out of {len(v1)+len(v2)+len(v2m)}")


if __name__ == "__main__":
    main()
