# Judge guide — 60 seconds

## The problem

An AI recipient may hold a brief that was once approved but has since been corrected or revoked. Copying context is not the same as retaining permission to receive it again.

## What this build demonstrates

The fixed-fictional Lens Club brief was approved for Friday, corrected to Saturday, separately re-approved, and then revoked. The recorded outcomes are:

1. V1 Friday brief: `ACTIVE` and delivered.
2. Old V1 after publishing V2: `VERSION_STALE`; no new envelope fetch, decryption, context assembly or gateway call in the recorded reference execution.
3. Separately approved V2 Saturday brief: `ACTIVE` and delivered.
4. V2 after revocation: `REVOKED`; no new downstream execution in the recorded reference execution.

Five state transactions were confirmed on Monad Testnet: register V1, grant V1, publish V2, grant V2 and revoke V2.

## Verify it

1. Open the [public evidence verifier](https://mengxiujie.github.io/shanhai-continuity-proof/).
2. Inspect the four recorded outcomes.
3. Click **Re-check five receipts on Monad now**. Expected result: `5/5 PASS`.

For local verification:

```bash
npm ci
npm run verify:brief-evidence
npm run verify:brief-live
```

## Where the proof stops

- Fresh RPC checks independently confirm transaction inclusion, success and archived block alignment. They do not prove off-chain non-execution.
- The no-fetch/no-decrypt/no-context/no-gateway result comes from the archived browser exports and project instrumentation.
- The same test wallet signed Owner and request operations.
- Agent B used a separate local process and ephemeral key, not a separate machine or administrative trust domain.
- The announcement used a deterministic template, not a live AI model.
- Revocation governs later releases; it cannot recall plaintext already delivered.
- This is not a production security audit, customer pilot or adoption claim.

## Why a shared registry

Inside one organization, a database ACL may be simpler. The protocol targets cross-tool or cross-organization handoffs where the recipient needs to read the same minimal authorization record independently rather than accept the sender platform's latest assertion.

See [ADOPTION.md](ADOPTION.md) for the intended integration point and current market-evidence boundary.
