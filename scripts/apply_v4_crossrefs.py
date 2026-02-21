#!/usr/bin/env python3
"""Apply v4:N cross-reference labels to staging issues.

For each open V4 meta-issue, creates a label `v4:N` in the staging repo
and applies it to all staging issues referenced in that meta-issue's body.
"""

import json
import subprocess
import time
import sys

STAGING_REPO = "t3rm1nu55/NYQST-BuildPack-Staging"
DELAY = 0.3  # seconds between API calls

# V4 run colors for label groups
RUN_COLORS = {
    "run1": "D93F0B",    # red — contradictions + structure
    "run1.5": "E4E669",  # yellow — reviews
    "run2": "1D76DB",    # blue — resequencing + new scope
    "run3": "0E8A16",    # green — final spec
}

V4_RUNS = {
    2: "run1", 5: "run1",
    9: "run1", 10: "run1", 11: "run1", 12: "run1",
    13: "run1", 14: "run1", 15: "run1",
    16: "run1.5", 17: "run1.5", 18: "run1.5", 45: "run1.5",
    19: "run2", 20: "run2", 21: "run2", 22: "run2", 23: "run2",
    24: "run2", 25: "run2", 26: "run2", 27: "run2", 28: "run2",
    33: "run2", 34: "run2", 35: "run2", 36: "run2", 37: "run2",
    38: "run2", 39: "run2", 40: "run2", 41: "run2", 42: "run2",
    43: "run2", 44: "run2", 46: "run2",
    29: "run3", 30: "run3", 31: "run3", 32: "run3",
}


def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True)
    return result


def main():
    mapping = json.load(open("/tmp/v4_to_staging.json"))

    # Step 1: Create labels
    labels_needed = sorted(set(f"v4:{n}" for n in mapping.keys()), key=lambda x: int(x.split(":")[1]))
    print(f"=== Creating {len(labels_needed)} labels ===")
    for label_name in labels_needed:
        v4_num = int(label_name.split(":")[1])
        run = V4_RUNS.get(v4_num, "run2")
        color = RUN_COLORS[run]
        run_gh([
            "label", "create", label_name,
            "--repo", STAGING_REPO,
            "--color", color,
            "--description", f"Affected by V4 meta-issue #{v4_num}",
            "--force"
        ])
        time.sleep(DELAY)
    print(f"  Done: {len(labels_needed)} labels created")

    # Step 2: Apply labels to staging issues
    total_applied = 0
    total_failed = 0
    total_needed = sum(len(v) for v in mapping.values())
    print(f"\n=== Applying {total_needed} cross-reference labels ===")

    for v4_num_str, staging_issues in sorted(mapping.items(), key=lambda x: int(x[0])):
        v4_num = int(v4_num_str)
        label_name = f"v4:{v4_num}"
        for staging_num in staging_issues:
            result = run_gh([
                "issue", "edit", str(staging_num),
                "--repo", STAGING_REPO,
                "--add-label", label_name
            ])
            if result.returncode == 0:
                total_applied += 1
            else:
                total_failed += 1
                print(f"  FAIL: Staging #{staging_num} ← {label_name}: {result.stderr.strip()[:80]}")
            time.sleep(DELAY)

        print(f"  v4:{v4_num}: {len(staging_issues)} issues labeled")

    print(f"\n=== COMPLETE ===")
    print(f"Total: {total_applied} applied, {total_failed} failed out of {total_needed}")


if __name__ == "__main__":
    main()
