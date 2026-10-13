# Judge guide — start here

**A correction does not inherit the old approval.** Shanhai binds a context grant to a recipient, scope and explicit version, so a later request cannot silently reuse approval after the owner publishes a correction.

## The first 60 seconds

1. Open the [public read-only demo](https://mengxiujie.github.io/shanhai-continuity-proof/). No login or wallet is needed.
2. Follow the four recorded results: **Friday approved → old version refused → Saturday separately approved → revoked access refused.** The fictional Lens Club event moves from Friday at 19:00 to Saturday at 15:00; the venue stays the same. Only the approved brief reaches the recipient in the recorded successful requests.
3. Click **Re-check five receipts on Monad now**. A successful fresh RPC check displays `5/5 successful receipts and block hashes match the archive`. A timeout or mismatch is a failed or incomplete check; keep the actual result.

The five transactions register V1, grant V1, publish V2, grant V2 and revoke V2 on Monad Testnet. This browser page re-checks their receipts and displays the earlier execution evidence. It does not initiate a new wallet transaction or run a new recipient process.

## Run the handoff locally

To exercise the reference runtime yourself, open the source directory containing `package.json` with **Node.js 24+**, then run:

```bash
npm ci
node examples/brief-handoff.mjs
```

The [example](examples/brief-handoff.mjs) starts a local synthetic RPC server and a separate recipient process, signs requests with a generated test identity, and runs the four lifecycle cases. Expected final result: `PASS 4/4 local mock lifecycle outcomes.` It uses the actual handoff runtime with mocked registry state; no wallet extension, test coins or AI account is required. Dependency installation needs internet access. See the [Quickstart](docs/DEVELOPER_QUICKSTART.md) for source access, verification commands and troubleshooting.

## Three checks, three different conclusions

| Check | How to run it | What a pass establishes |
|---|---|---|
| Archived evidence | `npm run verify:brief-evidence` | The two original exports, hashes, fixture commitments, recorded transactions and four recorded outcomes are consistent. This does not freshly execute their historical off-chain work. |
| Fresh public-chain receipts | Browser button above, or `npm run verify:brief-live` | All five transaction receipts are successful and match the archived blocks. This does not independently prove the off-chain counters. |
| Fresh local handoff | `node examples/brief-handoff.mjs` | The reference runtime and recipient process execute the four cases against local mock registry state. This does not execute Solidity or new public-chain transactions. |

## What the execution evidence means

In the archived run, `VERSION_STALE` and `REVOKED` requests recorded one chain check and **zero new envelope fetches, decryptions, context assemblies or gateway calls**. These counters are project instrumentation; transaction receipts alone cannot prove off-chain non-execution.

The sender checks the registry before releasing ciphertext; the recipient checks again before decrypting and assembling context. These checks are snapshots: a change between them can mean ciphertext has arrived before the recipient refuses to decrypt. Revocation governs later requests through this path; it cannot recall delivered plaintext or force a recipient to forget it.

The testnet run used one wallet for Owner and requester. Agent B ran in a separate local process with an ephemeral key, not a separate administrative trust domain. Announcements came from a deterministic template. Real-model behavior is `NOT_MEASURED`; no production security audit or external adoption is claimed.

## Who would build on this?

The intended adopter is a developer handing client-approved briefs between tools or teams that need to independently check the same grant state. A single organization controlling both sides may be better served by database permissions. The remaining question is whether shared verification is worth the signing and integration cost for a real handoff.

Read [ADOPTION.md](ADOPTION.md) for the proposed workflow, current integration seam and external validation criteria. Running our example is reproduction; connecting it to an independently operated application's handoff is a separate integration experiment.
