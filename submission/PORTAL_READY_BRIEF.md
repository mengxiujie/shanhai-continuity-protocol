# Submission field copy · revision reference

**Do not paste this whole file into one field.** Copy only the paragraphs under the matching field heading, without the heading or these editing notes. It describes the fixed-fictional Lens Club run, not real users or live model output.

The owner already supplied a **Ready for judging** portal transcription and subsequently confirmed replacing Live product with the GitHub Pages URL. This document is a proposed wording refinement, not an exact export of the saved form and not proof that these refinements were entered. Current status is maintained in [STATUS](../docs/STATUS.md). The name and tagline below remain suggestions; the supplied portal snapshot used `Unsaid Shanhai` and the earlier tagline.

## Project name · ≤120 characters

Shanhai Continuity Protocol

## Tagline · ≤200 characters

Correct the brief. Re-approve its version. Then let the next AI agent continue.

## Describe the problem, solution and usefulness · ≤8,000 characters

AI agents are increasingly handed context from earlier conversations and other tools. But a copied brief is not necessarily a current, authorized brief. A client may correct a date, approve one item while withholding private notes, or revoke a recipient's permission. If an agent simply receives the latest file—or continues under an old grant—it can act on the wrong information or exceed the owner's chosen scope.

Shanhai Continuity Protocol is a narrow, user-controlled handoff for that moment. The owner selects a source-labeled item and an exact recipient, scope, version and expiry. The content stays encrypted off-chain; a ConsentRegistry on Monad Testnet holds authorization state that both sides can read. A wallet-signed, one-time request identifies the caller. The sender checks the chain before releasing an encrypted envelope; a separate local Agent B process checks again before decrypting and assembling its context. A correction does not inherit the old approval. A revoked grant blocks a subsequent request through this controlled path.

We executed this with a fixed fictional event brief. Lens Club first approves Friday, 19:00, Harbor Studio, while excluding a private planning note and an unapproved free-admission suggestion. Agent B receives only the approved item and fills a deterministic Friday announcement template. The owner corrects the schedule to Saturday, 15:00. An old V1 request returns VERSION_STALE with zero new envelope fetch, decryption, context assembly or gateway work. Only after a separate V2 grant does Agent B receive Saturday and update the template. After revocation, a new V2 request returns REVOKED with zero new downstream work.

Five state transactions were confirmed on Monad Testnet and re-read from public RPC. Two unchanged original browser exports preserve the four gate outcomes; their SHA-256 hashes and the transaction receipts are checked by the reproducible verifier. The public evidence page lets judges re-check the five receipts live. Those receipts verify chain inclusion, success and matching blocks; the off-chain execution counters remain project-instrumented, not independently attested. The value demonstrated is a testable authorization boundary for agent handoffs—not AI writing quality.

This is a prototype using fictional material. The same test wallet signed owner and request operations, while Agent B ran in a separate local process, not a separate organization. The announcement is a fixed template; no external model was called. Revocation blocks later releases through the compliant path but cannot recall plaintext already delivered. Chain checks are snapshots, not atomic guarantees against later state changes. We do not claim a production security audit, real-user adoption or revenue.

Our prior Shanhai governance work distinguishes retained information from current authority: a record can remain while its version or permission changes. That experience shaped this prototype's explicit versions, scoped grants and checks before disclosure. The event brief makes those choices inspectable in a small, reproducible scenario. We are demonstrating one executable authorization boundary, not claiming that the full governance system is automated, on-chain or already integrated into another product.

The repository discloses the pre-existing Shanhai product context separately. The hackathon-period work is the protocol implementation, Monad integration, independent recipient process, browser workbench, executed testnet scenarios, evidence tooling and verification. AI tools assisted research, coding and review; the owner made authorization and submission decisions.

## Who are your first users, and how will you reach them? · ≤8,000 characters

Our first intended adopters are developers building client-brief handoffs between tools or teams. A concrete candidate is an agency whose client approves an event brief in one tool and whose announcement assistant consumes it in another. If the client changes the date, the old approval must stop authorizing new releases; the revised brief needs its own approval. Internal planning notes stay outside the approved scope. The Lens Club example illustrates this problem with fictional data; it is not a customer or pilot.

The adoption point is immediately before a sender releases inherited context and before a recipient decrypts and assembles it. The reference bundles version-bound grants, scope selection, signed one-time requests, sender/recipient checks and reproducible lifecycle fixtures. Developers can evaluate these pieces without first building the entire handoff. It is source-level reference code, not a published stable SDK. A single trusted application with a shared database may be better served by ordinary access controls. We are testing whether a shared, independently readable authorization record is worth the additional signing and integration effort across tool boundaries.

We will reach potential adopters through the hackathon's developer and mentor channels and a runnable open-source reference. The first step is a short independent reproduction, recording failures and time spent rather than asking for an endorsement. The next step is an integration trial with a developer who already has a real handoff problem, using non-sensitive or synthetic data and comparing with their existing permissions workflow. We will measure setup effort, handling of a changed brief, repeated use and whether the developer chooses to keep the integration. Browser feedback, source reproduction, application integration and customer adoption are separate evidence levels. No completed external integration, customer adoption or revenue is claimed. If the added checks do not justify the friction, we will simplify rather than treat testnet correctness as market validation.

## Steps to try your product · ≤8,000 characters

Open the HTTPS product URL supplied in this form. No login or wallet is needed for the public read-only evidence view. It loads two unchanged browser exports from the founder-operated Monad Testnet run and recomputes their SHA-256 hashes; both should show MATCH. Scroll through the four recorded outcomes: V1 ACTIVE (Friday), old V1 VERSION_STALE, separately approved V2 ACTIVE (Saturday), then V2 REVOKED. The denied cards show zero new envelope fetch, decryption, context assembly and gateway calls in the project's own instrumentation.

Click “Re-check five receipts on Monad now.” The page makes fresh, read-only public RPC calls on Monad Testnet (chain ID 10143) and should show 5/5 successful receipts with block hashes matching the archived export. The linked transactions and deployed ConsentRegistry can also be inspected in MonadScan. This click is not a new transaction or fresh Agent B execution. The browser replay does not call a live AI model.

For local checks, start at JUDGES.md and docs/DEVELOPER_QUICKSTART.md in the source repository. Node.js 24+ and `npm ci` are required. ZIP users skip Git commands. `npm run verify:brief-evidence` checks the archive; `node examples/brief-handoff.mjs` runs four fresh reference-runtime cases against a local mock RPC, not Monad; `npm run verify:brief-live` re-reads the five public testnet receipts. The live check needs RPC connectivity. Record failed or unrun steps separately. No wallet is required for these checks.

Optional regression tests use `npm test`. Running a new wallet transaction sequence is a separate workflow requiring a disposable Monad Testnet wallet and test MON; do not use real assets or personal material. The original owner-operated sequence was not screen-recorded, and the two original exports were split by a page reload after V2 receipt recovery.

## Verified live product URL

https://mengxiujie.github.io/shanhai-continuity-proof/

This is a public, read-only evidence verifier that actually calls Monad Testnet RPC. It is not a hosted wallet-signing workbench. The portal's interpretation of “live product” remains a judging risk.

## Founder-tested YouTube video URLs

- Working verifier demo, 69 seconds: https://youtu.be/nTZoqwLfsjo
- Separate project pitch, 70 seconds: https://youtu.be/hig7qjxeCFQ

The Founder reports both YouTube links playable without login, and both appear in the supplied Ready for judging portal transcription. Tool-side YouTube fetching failed, so independent playback was not established by that check. The earlier self-hosted copies are historical, not the primary entries. The demo is a post-run read-only verifier operation, not original wallet footage. Judge acceptance remains uncertain.

## Editing notes · do not paste into the form

- Repository URL: `https://github.com/mengxiujie/shanhai-continuity-protocol`. On 2026-10-13 the owner-side GitHub API reported `write` permission for organizer account `MonadMetropolis`, with no pending invitation. The repository was still private at that check; individual judges' login access was not tested.
- The supplied portal transcription already includes project details, logo, repository URL, both videos, access instructions and Ready for judging. The owner has since confirmed changing Live product to the current URL. Do not restart a completed submission merely because this revision exists.
- Source visibility remains private until the separately authorized publication step. This public copy contains no participant feedback. Any separately authorized, private-to-judges material must remain outside the public repository; do not infer public-use permission from permission to submit a private summary.
- These copy edits do not change the portal. If selected refinements are entered there, save and inspect the resulting submission state before the deadline.
