# Focused documentation and reproduction audit — 2026-10-13

## Later documentation-only refinement — 2026-10-13

The owner reports a human developer has started testing; results are still pending. This checkpoint improves the judge route, adoption hypothesis, ZIP-aware quickstart, portal field reference and current status. It does not change runtime code, original evidence, hosted demo, portal fields or repository visibility. The separate Chinese handoff note was corrected to use the current GitHub Pages URL and explicitly keeps the in-progress tester on the same source ZIP.

- Targeted relative-link check: eight edited entry documents, 47 links, zero missing file targets.
- `node scripts/release-audit.mjs`: PASS, 144 text files scanned, zero findings. This is a limited content-pattern scan, not a security audit.
- `node scripts/verify-brief-evidence.mjs`: PASS; both original hashes unchanged, five transaction records and four gate outcomes checked.
- Frozen source ZIP: SHA-256 `BF7F2DC50FBE74857799A3C2E05CDCB87FACB6A27C08E215C1812A5AC1AE8D60`, unchanged. Its source version remains `82d2600d3bfc7f8e4f1edd64d1952434ad03b72f`.
- Field-copy lengths, excluding headings/editing notes: name 27/120; tagline 79/200; description 3,138/8,000; adoption 2,085/8,000; judge access 1,834/8,000. These are local character counts, not actual portal validation.
- `git diff --check`: used as the final pre-commit whitespace check.
- No fresh live RPC check or full runtime regression was performed for these text-only edits. The earlier results below remain dated internal evidence, not new tests or external feedback.

## Earlier focused review in this report

Scope: the current README, judge guide, adoption note, status, judge Q&A, developer guide, blank external feedback form and article draft, plus the new local example and Windows reproduction script. This is an internal review, not an external security audit or adoption test.

## Result

The current entry documents now describe the executed four-outcome brief case, expose runnable verification commands, and distinguish fresh transaction checks from archived off-chain instrumentation. Earlier preparation notes are retained under an explicit historical heading. The developer packet is prepared; no external developer result has been recorded.

Inventory: eight reviewed documents before this report. README and STATUS are navigation/status documents; JUDGES and DEVELOPER_QUICKSTART are guides; ADOPTION and TECHNICAL_ARTICLE are explanatory documents; JUDGE_QA is a reference; EXTERNAL_REPRO_FEEDBACK is intentionally a blank participant form. The skill scanner was used as an initial inventory; direct file reads supplied the custom submission scope. Code checks covered package scripts, both brief verifiers, request signing, the sender runtime and recipient process.

## Findings and fixes

### MAJ-001: stale current status [RESOLVED]

- Location: `README.md` current links/deployment sections, `docs/STATUS.md` opening, and `submission/JUDGE_QA.md` opening / question 8.
- Issue: preparation statements still described media or portal submission as pending despite the owner's newer authenticated portal transcription and media checks.
- Fix: a current status section now records Ready for judging with its evidence source; old status paragraphs remain explicitly historical. Latest brief evidence and YouTube links are in the main entry.
- Limit: the portal transcription and anonymous video playback were reported by the owner; this review did not independently operate the authenticated portal.

### MAJ-002: evidence and enforcement could be overread [RESOLVED]

- Location: `submission/JUDGE_QA.md` questions 1, 3, 5, 7, 8, 14 and 15; article and README boundaries.
- Evidence: `scripts/verify-brief-live.mjs` checks receipt success/hash/block alignment. `protocol/reference/owner-web/sprint-runtime.mjs` and `protocol/reference/agent-b/gated-process.mjs` perform snapshot reads in local processes.
- Fix: document the source of off-chain counters, same-wallet test identity, local process separation, exposed on-chain metadata and state-change race. Revocation controls subsequent releases through compliant code and does not recall delivered plaintext.
- Limit: this wording does not upgrade the prototype's production security or independently certify the instrumentation.

### MAJ-003: native command failures could still print PASS [RESOLVED]

- Location: `scripts/reproduce.ps1` native-command sequence.
- Issue: Windows PowerShell's error preference alone does not reliably stop on a nonzero native command exit. The old sequence had no explicit exit-code checks.
- Fix: check the exit code after each command and throw before later steps or the final PASS label.
- Verification: mocked commands exercised all ten successful steps; injecting exit 13 at `npm test` stopped after the sixth command and skipped the four remaining commands. This was a control-flow check; it did not reinstall dependencies or rerun the whole reproduction script.

### MIN-001: developer entry required unnecessary exploration [RESOLVED]

- Location: README quick path and new `docs/DEVELOPER_QUICKSTART.md`.
- Fix: provide exact clone/install/verifier commands, failure guidance, a runnable example using the existing runtime, and an intentionally blank feedback form. Separate browser verification, local reproduction and actual application integration.
- Limit: improved instructions are not evidence of an external developer completing them.

## Verification record

| Check | Observed result | Interpretation |
|---|---|---|
| `npm test`, initial sandbox attempt | Conformance 9/9; runtime 35/48, 13 failures with `spawn EPERM`; later suites did not run | Process restriction encountered while starting B; preserve this failure. Tool output was truncated, so no complete raw log is claimed. |
| Same `npm test` with approved process permission | Conformance 9/9, runtime 48/48, Monad gate 5/5, wallet/controller 19/19; exit 0 | Internal synthetic regression. No new public-chain transaction. |
| `node scripts/verify-brief-evidence.mjs` | PASS; both original hashes match, four gate records and five transactions checked | Archive and fixture consistency. Original files unchanged. |
| `node scripts/verify-brief-live.mjs` | PASS; 5/5 successful receipts and matching archived blocks/hashes | Fresh read-only public RPC checks. Off-chain execution remains project-instrumented. |
| `node examples/brief-handoff.mjs` | PASS 4/4 local mock lifecycle outcomes | Existing runtime, real local cryptography/signatures and recipient processes against mock registry reads. No Solidity execution or external adoption. |
| Structural document checks | Eight documents, zero structural errors/warnings | Title/non-empty/ID/placeholder checks. The feedback form is deliberately unfilled. |
| Local link check after report creation | Nine documents; 47 relative links; zero missing targets | File-target check, not remote URL playback. |
| Release-content scan | PASS; 143 text files; zero findings | Existing publication-content scanner, not a security audit. |
| `git diff --check` | PASS | Whitespace check. |

Fresh receipt block numbers: register V1 `70333807`; grant V1 `70334945`; publish V2 `70336323`; grant V2 `70340923`; revoke V2 `70348797`. Each returned success status `0x1`. This checks the existing run, not a new run.

## Open observations

- `docs/STATUS.md` source access: the GitHub API still showed a private repository and pending organizer invitation at the check. Reviewer access acceptance remains unverified; the owner intends a public release before the deadline.
- `ADOPTION.md` market evidence: developer reproduction and an application integration remain pending. The blank feedback form must not be counted as a test result.
- Hosted working-product fit: the public page is a live read-only verifier. Whether it satisfies the organizers' working-product interpretation is not resolved by documentation or a receipt PASS.

Priority: hand the quickstart to an external developer, retain their actual output and permission to cite it, then report only the work they completed. Public article posting and repository visibility changes are separate actions from this preparation.
