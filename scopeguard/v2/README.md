# ScopeGuard v2 — evidence-first prototype

**Branch:** \`feat/scopeguard-evidence-first-v2\`  
**Status:** internal feature branch only. Not merged, deployed, published, or connected to the current Vercel project.

## Purpose

Replace the original keyword-only rule with an explicit comparison between the original agreement and the requested work. The tool must not claim legal certainty or classify an ambiguous request as in-scope.

## Local use

1. Download or clone this branch.
2. Open \`scopeguard/v2/index.html\` in a modern browser. The prototype has no external scripts or network calls.
3. Enter a sanitized summary of the original agreed scope and the new request.
4. Compare deliverable, volume, objective, requirements, and included revision rounds.
5. Mark material changes and optionally enter your own hours, rate, costs and risk reserve.
6. Review the result; download the JSON decision record or print/save as PDF.

## Decision rules

- **Potential change:** at least one confirmed mismatch or a material-change flag.
- **Needs clarification:** no confirmed mismatch, but at least one comparison remains unknown.
- **Likely included:** all applicable comparisons were explicitly marked included and no material-change flag was selected.

These rules are a decision-support heuristic. The user must check the signed agreement, prior approvals and actual client instructions. The tool does not interpret legal documents.

## Estimation

\`(hours × hourly rate) + (labour × risk reserve %) + external costs\`

The calculation uses only user-entered values, rejects negative/non-numeric values and caps reserve at 100%. The estimate is not a quote or contract price. Tax/VAT is not calculated.

## Privacy

- No server calls, analytics, tracking, third-party scripts or account are used by the prototype.
- Text remains in the current browser tab; it is not persisted by this app.
- The downloaded JSON contains the data the user entered. Sanitize it before sharing. Do not paste credentials, personal data or confidential client material.

## Quality checks

Run from this directory:

\`node test-core.cjs\`

The tests verify the three decision states, unknown handling, revision handling, material changes, estimate arithmetic and invalid-value rejection. Also inspect the resulting page on desktop and mobile before any production release.

## Release gate

Before any live replacement or customer-facing claim:
- independent browser QA on current Chrome, Edge, Firefox and Safari/iOS where available;
- check keyboard/screen-reader operation and form errors;
- verify the exact deployed Vercel project, team, linked Git repo and deployment target;
- verify live domain ownership and active payment/delivery mapping;
- update public listing copy only after the owner approves the tested build and release;
- reconcile the live Shopify/Stripe offer statuses and fulfilment;
- preserve the current production version and an explicit rollback target.

No release or product publication is authorized by this branch.
