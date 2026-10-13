---
title: "The brief changed. The old approval stopped working."
published: false
description: "Building versioned, revocable context handoffs for AI agents on Monad, with four recorded outcomes, five testnet transactions, and explicit evidence boundaries."
tags: [web3, ai, cryptography, showdev]
---

# The brief changed. The old approval stopped working.

An assistant is preparing an event announcement. Its client approved Friday at 19:00. Then the event moves to Saturday at 15:00.

Should the old approval still authorize the next handoff? Should approving the event brief also disclose the organizer's internal planning note? If permission is withdrawn, where does the next request stop?

These are the questions behind **Shanhai Continuity Protocol**, our Monad Metropolis prototype. Its unit of authorization is not an entire conversation. It is a selected item, for a particular recipient, scope, version and expiry.

The principle is simple: **a correction does not inherit the old approval.**

## One brief, four outcomes

We used fixed fictional material: a Lens Club photography meetup at Harbor Studio. The approved brief contained its title, schedule and venue. An internal planning note and an unapproved free-admission suggestion were outside the selected scope.

The founder-operated testnet run produced four outcomes:

| Request | Recorded result |
| --- | --- |
| Approved Friday brief | `ACTIVE`; one approved item delivered |
| Old approval after the Saturday correction | `VERSION_STALE`; request denied |
| Separately approved Saturday brief | `ACTIVE`; corrected item delivered |
| Saturday approval after revocation | `REVOKED`; request denied |

The successful recipient outputs were deliberately unremarkable: an announcement populated from the decrypted fields using a fixed template. The useful change was that Friday became Saturday only after a separate approval.

In both recorded denials, the sender performed one chain check and recorded zero additional envelope fetches, decryptions, context assemblies or gateway calls. This is evidence about where those reference executions stopped—not a claim that an arbitrary recipient can be prevented from reusing previously received plaintext.

## The boundary sits before the next handoff

The implementation combines a Solidity registry with an off-chain reference path:

1. The owner registers a content commitment and version, then issues a recipient grant with a scope hash and expiry.
2. A wallet-signed request binds the caller to the requested grant and includes a one-time nonce.
3. The sender reads Monad Testnet before releasing the encrypted envelope.
4. A separate local Agent B process reads the registry again before decrypting and assembling context.

The registry holds authorization state; the payload remains encrypted off-chain. Public metadata still includes addresses, commitments, versions and timestamps. Keeping content off-chain does not make every aspect of the relationship private.

Version checking turns a correction into an explicit authorization decision. The old grant is stale; the new version needs its own grant. Revocation similarly changes what a subsequent request may receive through this reference path.

The recipient's second read reduces the gap between the sender's check and use, but does not make them atomic. If state changes between the checks, ciphertext may already have reached Agent B before it refuses decryption. State could also change after the last read. The code does not claim to eliminate the chain-read/use race.

## What anyone can verify—and what they cannot

The [public read-only verifier](https://mengxiujie.github.io/shanhai-continuity-proof/) needs no login or wallet. It presents the four recorded results and checks the original export hashes. Clicking **Re-check five receipts on Monad now** requests fresh testnet receipts and compares their success and block information with the archive.

The five state transitions are linked individually:

1. [Register the brief](https://testnet.monadscan.com/tx/0x7d4be6f6beaf502b56867896abbc67febc348e8553f515e8cb9f67a32d32eb9b).
2. [Approve V1](https://testnet.monadscan.com/tx/0xf85ae48dd0d78b2108f4dfe0b9dc14f172623a3f2f6839c5003182a0962e96e2).
3. [Publish V2](https://testnet.monadscan.com/tx/0xcc0e0afd89d55f05d3979c2ca897f1efcdef869be30423d9005f15159669e8c2).
4. [Approve V2 separately](https://testnet.monadscan.com/tx/0x4d76dcc55a6a445493a1b24d3d76a479e8b1ed0a000ea19d7dbea7d23c80881a).
5. [Revoke V2](https://testnet.monadscan.com/tx/0xa65d821b9a127529b8fdf6d185cea29dbb35e9c3c1a477255d8269fc4df029d6).

The [ConsentRegistry deployment](https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0) is on Monad Testnet, chain ID `10143`.

These receipts establish successful chain transactions and their archived block alignment. They **do not prove off-chain non-execution**. The zero-downstream-work observations come from project instrumentation in the original exports. Their hashes preserve those records; hashes do not independently certify that instrumentation.

There are two original browser exports because the page was reloaded between the V1 and V2 stages. They are preserved separately, not rewritten into a fictional uninterrupted session. The [69-second technical video](https://youtu.be/nTZoqwLfsjo) walks through the post-run verifier. It is not a recording of the original wallet run. A [70-second pitch](https://youtu.be/hig7qjxeCFQ) explains the project.

## Why a shared registry?

For one organization controlling both sides, a database permission table may be simpler. A database can implement versioning, expiry and revocation too.

The proposed use case is a handoff between tools or organizations that need a common grant record rather than treating the sending platform's latest assertion as the final authority. Monad supplies the shared state used here; its EVM compatibility lets the reference use familiar Solidity and wallet tooling.

This build does not demonstrate a Monad-specific performance advantage or removal of every centralized dependency. The off-chain endpoints, keys, RPC access and compliant recipient implementation remain consequential. The contract cannot force software that ignores the protocol to behave.

## Current limits and the next developer test

The same test wallet signed both owner and request operations. Agent B held an ephemeral key in a separate local process, not a separate administrative trust domain. The announcement was a deterministic template: `realModelBehavior` remains `NOT_MEASURED`.

Revocation governs later release through the checked path. It cannot recall delivered plaintext. Shorter grant expiry would not erase a recipient's copy either.

We claim no production security audit, external integration, customer adoption or revenue. The repository discloses the pre-existing Shanhai context separately from the hackathon-period protocol, Monad integration, workbench and evidence tooling.

Our first intended adopters are developers handing client-approved briefs between assistants. The next test is whether another developer can reproduce the boundary and identify a real workflow where it earns its signing and integration cost.

The [source repository](https://github.com/mengxiujie/shanhai-continuity-protocol) contains the reproduction instructions; authenticated access may currently be required. With Node.js 24 or later, after cloning:

```bash
npm ci
npm run verify:brief-evidence
npm run verify:brief-live
```

The first verifier checks the archived scenario locally; the second checks receipts through public RPC. Neither sends a wallet transaction.

If your application passes approved context to another tool, try the verifier and tell us where this boundary would fit—or why your existing permission system is enough. That answer is more useful than another feature on our roadmap.
