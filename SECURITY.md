# Security policy

## Scope

This repository is a testnet hackathon implementation. It has not received a production smart-contract or application security audit and must not be used with real personal data, production credentials, payments, or assets of value.

## Reporting

Before a public security contact is published, report a suspected vulnerability privately through the repository owner's GitHub profile. Do not open a public issue containing private keys, personal data, exploit details, or credentials.

## Non-negotiable invariants

- Personal plaintext never goes on-chain.
- The service does not receive the Agent B private key or decrypted model context.
- Any non-`ACTIVE` decision returns no envelope and creates no model request.
- Wrong-chain, malformed RPC, stale-version, revoked-grant, expired-grant, scope-mismatch, and commitment-mismatch paths fail closed.
- Revocation prevents future access; it cannot claw back plaintext that an authorized third party already obtained.

## Supported state

Only the latest commit on the default branch is intended for evaluation. A passing synthetic test suite is not evidence of a live Monad deployment or production fitness.
