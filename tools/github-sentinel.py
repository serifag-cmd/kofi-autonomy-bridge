#!/usr/bin/env python3
"""Unlimited Labs GitHub Sentinel: read-only repository audit plus deduplicated CI alerts."""
from __future__ import annotations
import json, os, subprocess, sys, urllib.error, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

repo = os.environ.get("GITHUB_REPOSITORY", "")
token = os.environ.get("GITHUB_TOKEN", "")
event = os.environ.get("GITHUB_EVENT_NAME", "unknown")
now = datetime.now(timezone.utc)
findings: list[str] = []

def api(path: str, method: str = "GET", body=None):
    if not token or not repo:
        return None
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/{path.lstrip('/')}",
        data=data, method=method,
        headers={"Accept":"application/vnd.github+json","Authorization":f"Bearer {token}",
                 "X-GitHub-Api-Version":"2022-11-28","User-Agent":"UL-GitHub-Sentinel"}
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw = response.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise

tracked = subprocess.check_output(["git","ls-files","-z"]).decode(errors="replace").split("\0")
tracked = [p for p in tracked if p]
workflow_files = [p for p in tracked if p.startswith(".github/workflows/") and p.endswith((".yml",".yaml"))]
test_files = [p for p in tracked if any(part in p.lower() for part in ("/test", "/tests/", ".test.", ".spec."))]
manifests = [p for p in tracked if p.endswith(("package.json","pyproject.toml","Cargo.toml","go.mod"))]
if not Path("README.md").exists():
    findings.append("Repository root has no README.md.")
if not workflow_files:
    findings.append("No GitHub Actions workflow is tracked.")
if manifests and not test_files:
    findings.append("A build manifest exists but no obvious tracked test file was found; confirm test coverage.")

runs_payload = api("actions/runs?per_page=20")
runs = (runs_payload or {}).get("workflow_runs", [])
recent_failures = []
cutoff = now - timedelta(days=14)
for run in runs:
    if run.get("conclusion") == "failure":
        stamp = run.get("updated_at") or run.get("created_at")
        try:
            if datetime.fromisoformat(stamp.replace("Z","+00:00")) >= cutoff:
                recent_failures.append(run)
        except Exception:
            continue
if recent_failures:
    findings.append(f"{len(recent_failures)} failed workflow run(s) in the latest 20 runs during the last 14 days.")

lines = [
    "# Unlimited Labs GitHub Sentinel",
    "",
    f"- Repository: `{repo}`",
    f"- Checked (UTC): {now.isoformat(timespec='seconds')}",
    f"- Trigger: `{event}`",
    f"- Tracked files: {len(tracked)}",
    f"- Workflow definitions: {len(workflow_files)}",
    f"- Test-like files: {len(test_files)}",
    f"- Build manifests: {len(manifests)}",
    f"- Recent failed runs: {len(recent_failures)}",
    "",
    "## Findings",
]
lines += [f"- {x}" for x in findings] if findings else ["- No sentinel findings."]
if recent_failures:
    lines += ["", "## Failed workflow runs"]
    for run in recent_failures[:10]:
        lines.append(f"- [{run.get('name') or run.get('path')}]({run.get('html_url')}): {run.get('display_title')} — {run.get('updated_at')}")
report = "\n".join(lines) + "\n"
Path("sentinel-report.md").write_text(report, encoding="utf-8")
Path("sentinel-report.json").write_text(json.dumps({
    "repository":repo,"checked_at":now.isoformat(),"trigger":event,
    "tracked_files":len(tracked),"workflow_files":workflow_files,
    "test_files":test_files,"manifests":manifests,
    "recent_failed_runs":[{"name":r.get("name"),"title":r.get("display_title"),"url":r.get("html_url"),"updated_at":r.get("updated_at")} for r in recent_failures],
    "findings":findings
}, indent=2), encoding="utf-8")

# Open one deduplicated issue for recent CI failures; no code, branch, release or deployment writes.
if recent_failures and token and event != "pull_request":
    title = "Sentinel alert: recent GitHub Actions failures"
    issues = api("issues?state=open&per_page=100") or []
    existing = next((i for i in issues if i.get("title") == title and "pull_request" not in i), None)
    body = report + "\nThis alert is generated automatically. Resolve the failing workflow(s), then the next sentinel run will re-check the repository."
    if not existing:
        api("issues", "POST", {"title":title,"body":body})
    else:
        # Avoid noisy repeated comments; the open issue remains the single alert record.
        pass

print(report)
