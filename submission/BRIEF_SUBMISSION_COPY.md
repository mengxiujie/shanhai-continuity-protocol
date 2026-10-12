# Metropolis submission copy — client-approved brief handoff

Status: **ready for portal field-length adaptation, not submitted**. Based on the two original 2026-10-12 browser exports and read-only Monad receipt rechecks. Repository is currently private, Pages off, final operational film absent. Do not substitute the 2026-10-11 preference-case hashes.

## Project name

Shanhai Continuity Protocol

## Tagline

**Correct the brief. Re-approve the version. Then let the agent continue.**

## One-line description

A user-controlled handoff for AI agents: an encrypted, source-labeled brief is delivered only when its exact recipient, scope and version remain authorized on Monad.

## Short description

An agent is asked to prepare an event announcement from a client-approved brief. Friday at 19:00 changes to Saturday at 15:00. The old agent request must not silently receive the corrected brief, nor keep using its obsolete authorization. Shanhai puts the minimum grant facts on Monad and keeps the content encrypted off-chain. In a Founder-operated Monad Testnet run, V1 was delivered, the old request was rejected after correction, V2 worked only after a separate grant, and revocation blocked a later request. Two original browser exports preserve the run; five transaction receipts were independently re-read from public RPC. The output is a deterministic template, not live AI copywriting.

## Judge-facing description

### The failure mode

AI assistants can move context between tools, but a copied brief is not the same as an authorized brief. A client can correct a date, withdraw consent, or authorize one piece of material while withholding other notes. The recipient should not have to trust the sender's private database alone for the current grant state.

### What we built

Shanhai Continuity Protocol is a narrow, open reference implementation for governed context delivery. The owner selects an exact item from a source-labeled versioned package. Its encrypted envelope stays off-chain. A Monad `ConsentRegistry` records the asset version, recipient, scope, expiry and revocation. A wallet-signed one-time request binds the caller and recipient key. Before releasing an envelope, the Owner reads the registry; an independent local Agent B process reads it again before decryption and context assembly. The receiving process then fills a fixed announcement template from the actually decrypted, approved fields.

### The executed use case

The fixed fictional “Lens Club” event brief starts at Friday 19:00, Harbor Studio. The approved scope excludes a private planning note and an unapproved suggestion to advertise free admission. The owner registers and grants V1; Agent B receives exactly one approved item and produces the Friday announcement. The owner publishes a V2 correction to Saturday 15:00; the old V1 request returns `VERSION_STALE` without new envelope fetch, decryption, context assembly or gateway work. Publishing V2 does not grant it. After a separate V2 consent, Agent B receives the Saturday brief and updates the announcement. Revoking V2 makes the next request return `REVOKED`, again with zero new downstream work.

This is one of the reasons the chain matters here: a recipient process can check the same minimum authorization record independently. It is not a claim that Monad is the only possible EVM chain, or that snapshot checks are atomic with every later use.

### Verifiable evidence

The two unmodified browser exports are [part 1](../deployment/raw-browser-evidence.brief-part1.monad-testnet.2026-10-12.json) (SHA-256 `dea1b5ce0deddf72ac8d9a116e97414f2e227e68c12f6e6cfc66285f381c63b2`) and [part 2](../deployment/raw-browser-evidence.brief-part2.monad-testnet.2026-10-12.json) (SHA-256 `17e13b028035ef5daab8a3ec272c9602d6c302476509193080ab659e8d60e5be`). The browser was reloaded after recovery of the original V2 grant receipt; no single original file spans the entire run. `npm run verify:brief-evidence` checks both hashes, common identifiers, source commitments, the five transaction records and four gate outcomes. Public Monad RPC returned `status=0x1` and matching block numbers for all five state transactions. The [read-only replay](../apps/demo/brief-evidence.html) recomputes both hashes before displaying the four outcomes; it is not itself a new execution.

Contract: [ConsentRegistry on Monad Testnet](https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0). Transactions: [register V1](https://testnet.monadscan.com/tx/0x7d4be6f6beaf502b56867896abbc67febc348e8553f515e8cb9f67a32d32eb9b), [grant V1](https://testnet.monadscan.com/tx/0xf85ae48dd0d78b2108f4dfe0b9dc14f172623a3f2f6839c5003182a0962e96e2), [publish V2](https://testnet.monadscan.com/tx/0xcc0e0afd89d55f05d3979c2ca897f1efcdef869be30423d9005f15159669e8c2), [grant V2](https://testnet.monadscan.com/tx/0x4d76dcc55a6a445493a1b24d3d76a479e8b1ed0a000ea19d7dbea7d23c80881a), [revoke V2](https://testnet.monadscan.com/tx/0xa65d821b9a127529b8fdf6d185cea29dbb35e9c3c1a477255d8269fc4df029d6).

### Scope and limitations

The test uses fictional material and the same test wallet for owner and request signing. Agent B is a separate local process, not a second external organization. No external AI model was called, so output quality and hallucination resistance remain unmeasured. Project counters describe this implementation's stages; they are not third-party attestation. A valid recipient may retain plaintext it already received, and a state change after the final chain check creates a time window. No production security audit, real-user value or market adoption is claimed.

### Hackathon-period contribution and AI disclosure

Disclose the pre-existing product context and the actual six-week implementation delta using [BUILD_DISCLOSURE.md](../docs/BUILD_DISCLOSURE.md); do not claim all historical project thinking was created during the event. AI tools assisted research, coding and review; the owner made authorization, testing and submission decisions. Details: [AI_USAGE.md](../docs/AI_USAGE.md).

## Fields that must remain blank until actually verified

Final video URL; hosted demo URL; repository-review/public-access route; authenticated portal field names and limits; final submission receipt. Do not paste local paths or unverified placeholders into the portal.
