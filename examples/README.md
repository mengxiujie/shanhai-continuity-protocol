# Minimal local handoff example

From the repository root, with Node.js 24 or later:

```sh
npm ci
node examples/brief-handoff.mjs
```

The example consumes the existing `createSprintRuntime` interface. It prepares the
fixed fictional Lens Club brief, obtains a one-time signed request, and consumes
the returned announcement only after `ACTIVE_CONTEXT_DELIVERED`. Version-stale
and revoked requests have no new application result.

Expected output includes:

```text
v1 approved: ACTIVE | Friday, 19:00 | Harbor Studio
VERSION_STALE | new downstream work=0
v2 approved: ACTIVE | Saturday, 15:00 | Harbor Studio
REVOKED | new downstream work=0
PASS 4/4 local mock lifecycle outcomes.
```

Assertions also check exact selected item IDs, exclusion of the private note and
unapproved suggestion, separate Owner/Agent B process IDs, and per-request stage
counters. A failed assertion exits nonzero. The script closes its local server
and child processes after completion or failure.

## Boundary

- The protocol projection, encrypted envelope, one-time request signature,
  receiving subprocess, decryption, and context assembly use existing code.
- Registry reads come from a mock JSON-RPC server bound to `127.0.0.1`, not Monad.
  Approval, correction, and revocation are explicit fixture mutations. No Solidity
  code or blockchain transactions are executed by this example.
- The random signing identity is ephemeral, never printed or funded. The same
  identity represents the synthetic owner and requester; separate processes do
  not establish independent administrative trust domains.
- The output is a fixed template, not a model call. Refusal controls new requests;
  it cannot recall plaintext already delivered. These assertions do not cover
  every race or malicious receiver.
- This is an in-repository developer example, **not evidence of third-party
  integration, external developer use, or production readiness**.

For the separately recorded Monad run, use `npm run verify:brief-evidence` and
`npm run verify:brief-live`; the latter performs fresh read-only receipt checks.
