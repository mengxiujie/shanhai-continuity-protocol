# Stage freeze — 2026-09-22

> Status: internal engineering and submission-preparation stage complete.  
> Public release, live-chain actions and final submission remain intentionally unexecuted.

## Frozen outcome

This repository is the current publishable candidate for the Metropolis 2026 submission module. It contains:

- Shanhai Continuity Protocol 0.1.0 and conformance vectors;
- deterministic provenance, scope, bitemporal and supersession rules;
- browser encryption and independent Agent B reference flow;
- Monad Consent Registry, verifier and fail-closed gate;
- four-act judge demo and separate live-evidence panel;
- release-safety audit, clean-room reproduction scripts and manual Pages workflow;
- submission copy, video scripts, scorecard and judge Q&A.

The latest reproduced code commit is `8e9f882`. Commit `a269e13` adds the reproduction report without changing runtime code. This freeze document is a documentation-only successor.

## Verified evidence

```text
SCP conformance                 PASS 9/9
Runtime / encrypted envelope    PASS 13/13
Monad deterministic gates       PASS 5/5
Independent Agent B process     PASS
Solidity compile                PASS / solc 0.8.30 / 2554 bytes
Release scan                    PASS / 92 files / 0 findings (reproduced commit)
Hosted artifact audit           PASS / 16 files / 0 findings
Desktop and 390×844 QA          PASS
Controlled clean reproduction   PASS
```

Compiled contract artifact SHA-256:

```text
73EA412EAB9270BF89DF9F1C59EADC30107EAEF3971E1D768C2B9DCADE5A9CB5
```

## Evidence that does not yet exist

- Public GitHub repository and logged-out availability check.
- Executed GitHub Actions / GitHub Pages deployment.
- Live Monad testnet contract address and deployment transaction.
- Real `ACTIVE / VERSION_STALE / REVOKED` receipt triplet.
- Recorded final video and uploaded URL.
- Mera PRF ceremony and fresh-profile/second-device proof.
- Final portal field snapshot and successful submission receipt.
- Independent human reproduction, production security, or market validation.

## Freeze discipline

Until an external prerequisite changes, do not:

- add more frameworks, chains, bounties or product scope;
- repeat the same local conformance or clean-room exercise without a relevant code change;
- replace `NOT YET EVIDENCE` with a synthetic result;
- select the Mera bounty without its real proof;
- publish internal archives, raw portal screenshots, real personal material, credentials or wallet data;
- rewrite or backdate Git history.

## Restart triggers

Resume only when at least one of these becomes available:

1. The owner can create/access a public GitHub repository.
2. A Monad testnet wallet has test MON and can sign transactions.
3. A working passkey/PRF environment is available for the optional Mera proof.
4. The final submission form opens on 2026-10-02.
5. An organizer provides formal rules/eligibility/open-source clarification.

## Exact restart order

1. Read this file, `docs/REPRODUCTION_REPORT.md`, `docs/EVIDENCE.md`, and `submission/PORTAL_FIELD_MAP.md`.
2. Verify `git status` is clean and the expected history is present.
3. Push the existing history to a newly created empty public repository; do not create conflicting starter files.
4. Run CI, manually trigger Pages, and verify both URLs while logged out.
5. Deploy ConsentRegistry to Monad testnet and capture deployment facts.
6. Produce and export real `ACTIVE → VERSION_STALE → REVOKED` receipts.
7. Record the video using the prepared scripts and insert only verified public links.
8. Decide whether Mera proof is ready; add the bounty only if it passes.
9. Map the real portal fields, perform final red-line review, and submit before the internal deadline.

## Next decision boundary

The next stage is external evidence and final submission—not further internal architecture exploration.
