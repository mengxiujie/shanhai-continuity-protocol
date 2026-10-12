# Client brief video — operational capture and evidence plan

Status: **historical capture plan; 69-second narrated public-origin read-only verifier demo is now hosted separately**. The Founder confirmed that the original 2026-10-12 wallet run was not screen-recorded. The new film uses read-only replay and fresh receipt verification as a clearly labeled evidence walkthrough. The 2026-10-11 MP4 is an earlier preference-case visualization and must not be relabeled as this scenario. Owner-supplied rules require a publicly playable video no longer than three minutes showing actual operation and Monad interaction. See `PORTAL_FIELD_MAP.md` for the current hosted URL and remaining acceptance risk.

## Editorial principle

The main story is not “we can write an announcement.” It is: **a corrected brief cannot be used under an obsolete grant; the new version needs a separate approval before work continues.** The announcement is a deterministic proof that the approved version reached Agent B. Do not present it as AI writing quality.

## Filmable surfaces already available

1. Local brief workbench at the running `npm run sprint:brief` address, retaining the original service/session while needed. Its last V2 consent is revoked; do not make it appear currently active. The original interactive wallet steps were not captured on video.
2. [Read-only four-outcome replay](../apps/demo/brief-evidence.html), which recomputes two original export hashes and shows recorded fields, gate deltas and five transaction links. Its “Re-check five receipts on Monad now” button performs a fresh read-only RPC check; observed result on 2026-10-12: `PASS · 5/5` with matching block hashes. Clicking/scrolling this page is operation of the verifier/replay, **not** a fresh wallet transaction or re-execution of historical gates.
3. MonadScan transaction pages for the five actual state transactions, plus read-only RPC receipt verification. These show real Monad interaction; chain inclusion alone does not attest Agent B's local counters.
4. Source and tests: `npm run verify:brief-evidence`, `npm test`, and the independent recipient code. Terminal commands must be filmed from an actual run, not painted into frames.

## Recommended 105–125 second cut

| Time target | Actual picture to capture | English narration cue | On-screen truth label |
|---|---|---|---|
| 0–13s | Brief replay: Friday versus Saturday, one task | “The event moved. Which version may the next agent receive?” | Fixed fictional brief |
| 13–27s | Workbench/executed scope and selected item; no wallet secrets | “The client shares one approved brief, not every planning note.” | Recorded testnet scenario; scope selected by owner |
| 27–43s | MonadScan register/grant transactions and registry; separate B process code or terminal | “Monad holds the versioned grant. Encrypted content stays off-chain; sender and recipient check independently.” | Five state tx; same test wallet, independent local B |
| 43–57s | Replay V1 ACTIVE and Friday announcement, block and deltas | “The Friday brief reaches Agent B. The announcement is a fixed template filled from the decrypted fields.” | Recorded ACTIVE; deterministic template, not model output |
| 57–72s | Actual V2 publish transaction, replay VERSION_STALE with zero deltas | “After correction, the old request is refused before another delivery.” | Recorded VERSION_STALE; no new downstream execution |
| 72–91s | Actual V2 grant transaction, replay V2 ACTIVE and Saturday announcement | “A new approval is needed. Only then does Saturday at three reach the recipient.” | Separate V2 consent; recorded ACTIVE |
| 91–105s | Revoke transaction, replay REVOKED with zero deltas | “Revoke it, and the next request stops. Previously delivered plaintext cannot be recalled.” | Recorded REVOKED; future access only |
| 105–120s | Two hash-MATCH exports; click the live receipt-check button and show `5/5 PASS`; code/contract/evidence link | “Five chain transactions, four gate outcomes, two original exports—open for inspection.” | Fresh read-only RPC; archived gate outcomes; external model NOT_MEASURED |

These timings are targets; measure the final narration and trim before claiming duration. A screen recording of clicking/scrolling the read-only replay plus real MonadScan pages is a truthful operational demonstration of inspection, but **not a recording of the original wallet-signing run**. If rules or judging require live wallet operations on camera, capture a separate new transaction/run with an independent disposable testnet asset and label it as a new run; do not splice it into the October 12 original sequence or claim it occurred then.

## No-original-recording cut (selected)

1. Begin with a title card: `Recorded Monad testnet run · 12 Oct 2026 / Read-only evidence walkthrough · filmed later`. Keep this disclosure visible when the replay first appears.
2. Screen-record the browser actually loading `apps/demo/brief-evidence.html`. Show both archived-export hashes as `MATCH`, then scroll through V1 `ACTIVE`, old V1 `VERSION_STALE`, V2 `ACTIVE`, and V2 `REVOKED`. Pause long enough to read each outcome and its execution delta.
3. In the same recording, click `Re-check five receipts on Monad now` and wait for the live `5/5 PASS`. This is a **new read-only RPC check**, not a new transaction. Open one or more MonadScan links so the on-chain source is legible.
4. Record an actual terminal run of `npm run verify:brief-evidence` and `npm run verify:brief-live` if there is room. Do not animate fabricated terminal output or hide any failure.
5. End with `Fixed fictional brief · deterministic announcement · real model behavior NOT_MEASURED · previously delivered plaintext cannot be recalled` and a short link/QR to the repo evidence page when a usable public judging URL exists.

The five stills and their SHA-256 provenance are in `HACK-001_VIDEO_REVIEW_2026-10-12_BRIEF/CAPTURE_MANIFEST.md` beside this repo. They are supplemental cutaways, not the uninterrupted capture. The separately recorded public-origin walkthrough, rather than these stills, underlies the current hosted demo.

## Capture and edit QA

- Show the address bar or source label for MonadScan transactions; do not show recovery phrases, PIN, private keys, browser notifications, unrelated accounts or personal materials.
- Keep the two raw-file hashes visibly marked `MATCH`; make `Friday 19:00 → Saturday 15:00`, `VERSION_STALE`, separate V2 consent and `REVOKED` readable at ordinary playback speed.
- Preserve the page-reload/two-export boundary with a 2–3 second card or clear footer. A single montage must not imply one uninterrupted original recording.
- No model-output footage or generated voice should be represented as actual model behavior. Audio synthesis for narration is separate from the product gateway.
- Verify MP4 duration ≤180 seconds, audio intelligibility, captions, screen legibility and a public logged-out playback URL before submission. Until then, status is **VIDEO PENDING**.
