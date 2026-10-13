# Portal-ready English field copy · candidate, not entered

This text is for the authenticated Metropolis submission form. It uses the executed fixed-fictional Lens Club brief, not real users or live model output. It may be shortened after actual field validation, but the caveats must remain intact.

## Project name · ≤120 characters

Shanhai Continuity Protocol

## Tagline · ≤200 characters

Correct the brief. Re-approve its version. Then let the next AI agent continue.

## Describe the problem, solution and usefulness · ≤8,000 characters

AI agents are increasingly handed context from earlier conversations and other tools. But a copied brief is not necessarily a current, authorized brief. A client may correct a date, approve one item while withholding private notes, or revoke a recipient's permission. If an agent simply receives the latest file—or continues under an old grant—it can act on the wrong information or exceed the owner's chosen scope.

Shanhai Continuity Protocol is a narrow, user-controlled handoff for that moment. The owner selects a source-labeled item and an exact recipient, scope, version and expiry. The content stays encrypted off-chain; a ConsentRegistry on Monad Testnet holds the minimum authorization state. A wallet-signed, one-time request identifies the caller. The sender checks the chain before releasing an encrypted envelope; an independent local Agent B process checks again before decrypting and assembling its context. A correction does not automatically inherit an earlier grant, and a revoked grant blocks a subsequent request.

We executed this with a fixed fictional event brief. Lens Club first approves Friday, 19:00, Harbor Studio, while excluding a private planning note and an unapproved free-admission suggestion. Agent B receives only the approved item and fills a deterministic Friday announcement template. The owner corrects the schedule to Saturday, 15:00. An old V1 request returns VERSION_STALE with zero new envelope fetch, decryption, context assembly or gateway work. Only after a separate V2 grant does Agent B receive Saturday and update the template. After revocation, a new V2 request returns REVOKED with zero new downstream work.

Five state transactions were confirmed on Monad Testnet and independently re-read from public RPC. Two unchanged original browser exports preserve the four gate outcomes; their SHA-256 hashes and the transaction receipts are checked by the reproducible verifier. The public evidence page lets judges re-check the five receipts live. The value demonstrated is a testable authorization boundary for agent handoffs—not AI writing quality.

This is a prototype using fictional material. The same test wallet signed owner and request operations, while Agent B ran in a separate local process. The announcement is a fixed template; no external model was called. Revocation prevents future access but cannot recall plaintext already delivered. Chain checks are snapshots, not atomic guarantees against later state changes. We do not claim a production security audit, real-user adoption or revenue.

The pre-existing Shanhai product context is disclosed in the repository. The hackathon-period work is the protocol implementation, Monad integration, independent recipient process, browser workbench, executed testnet scenarios, evidence tooling and verification. AI tools assisted research, coding and review; the owner made authorization and submission decisions.

## Who are your first users, and how will you reach them? · ≤8,000 characters

Our first intended users are small teams and developers building AI assistants that hand client-approved briefs between people, tools or agents—especially where a correction or withdrawal must change what the next recipient may use. The Lens Club example is a fictional developer scenario, not evidence of customer adoption.

The near-term route is developer discovery rather than a broad consumer launch: publish a runnable reference implementation, a narrow HTTPS evidence demo, exact Monad transaction links and a reproducible verifier; show the corrected-brief workflow to agent builders through the hackathon and open-source developer channels; then invite a small number of teams with an existing handoff problem to try it and report where the boundary helps or adds too much friction. We will record source, task, completion, integration effort and repeated use separately. No external users, pilots or distribution metrics are claimed in this submission.

Our first real-user test would ask a team to bring a non-sensitive, ordinary brief that actually changes, compare its existing handoff workflow with this protocol, and see whether the recipient avoids using a stale or unapproved version without unacceptable setup or signing burden. If the extra checks do not deliver practical value, we should simplify or stop rather than treat testnet correctness as product-market fit.

## Steps to try your product · ≤8,000 characters

Open the HTTPS product URL supplied in this form. No login or wallet is needed for the public read-only evidence view. It loads two unchanged browser exports from the founder-operated Monad Testnet run and recomputes their SHA-256 hashes; both should show MATCH. Scroll through the four recorded outcomes: V1 ACTIVE (Friday), old V1 VERSION_STALE, separately approved V2 ACTIVE (Saturday), then V2 REVOKED. The denied cards show zero new envelope fetch, decryption, context assembly and gateway calls in the project's own instrumentation.

Click “Re-check five receipts on Monad now.” The page makes fresh, read-only public RPC calls on Monad Testnet (chain ID 10143) and should show 5/5 successful receipts with block hashes matching the archived export. The linked transactions and deployed ConsentRegistry can also be inspected in MonadScan. This click is not a new transaction or fresh Agent B execution. The browser replay does not call a live AI model.

For full local reproduction, use the source repository's README and run `npm run verify:brief-evidence`, `npm run verify:brief-live` and `npm test`. Running a new wallet transaction sequence requires a separate disposable Monad Testnet wallet and test MON; do not use real assets or personal material. The original owner-operated sequence was not screen-recorded, and the two original exports were split by a page reload after V2 receipt recovery.

## Verified live product URL

https://mengxiujie.github.io/shanhai-continuity-proof/

This is a public, read-only evidence verifier that actually calls Monad Testnet RPC. It is not a hosted wallet-signing workbench. The portal's interpretation of “live product” remains a judging risk.

## Founder-tested YouTube video URLs

- Working verifier demo, 69 seconds: https://youtu.be/nTZoqwLfsjo
- Separate project pitch, 70 seconds: https://youtu.be/hig7qjxeCFQ

The Founder reports both YouTube links playable without login. Tool-side YouTube fetching failed, so independent playback and portal-field validation remain unverified. The earlier self-hosted copies remain archival fallbacks; their direct MP4 links later returned 403 to an external command-line check and should not be the primary video entries. The demo is a post-run read-only verifier operation, not original wallet footage. Judge acceptance remains uncertain.

## Unfilled until portal action

- Repository URL: `https://github.com/mengxiujie/shanhai-continuity-protocol`. Organizer account `MonadMetropolis` has a pending `write` invitation; acceptance and actual reviewer access are not yet confirmed.
- Logo upload, both YouTube links, remaining form fields and final portal submission receipt are not yet confirmed entered or accepted.
