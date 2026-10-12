# Adoption hypothesis

## First intended developer

A small team building an AI workflow that hands a client-approved brief from one person, tool or agent to another. Corrections and withdrawals must affect what the next recipient may receive.

The Lens Club scenario is a fixed-fictional fixture, not customer adoption. Its general task is:

```text
client approves brief A
        -> recipient may receive A
client corrects A into B
        -> the old approval no longer authorizes a new delivery
client separately approves B
        -> recipient may receive B
client revokes B
        -> later delivery is denied
```

## Integration point

The reference sender checks the registry before releasing an encrypted envelope. The separately running recipient checks the registry again before decrypting and assembling context. A developer would place this boundary immediately before a client-approved brief is handed to the next tool or agent.

The [quickstart](docs/DEVELOPER_QUICKSTART.md) and [local runtime example](examples/brief-handoff.mjs) expose this seam using existing reference code. An adopting team could reuse request signing and nonce binding, scope/content commitment checks, envelope encryption and the recipient's second check, together with their failure fixtures. That is a reuse proposition, not a measured reduction in integration time or proof of adoption. The reference is not yet a stable packaged SDK.

## Why not build a database permission table?

For a single team controlling both sides, a database may be the right answer. A shared registry becomes relevant when different applications or organizations need to verify the same minimum grant state without making the sender platform the final authority over its own access decision.

This prototype has not yet established that the benefit outweighs wallet, signing and integration friction. That is the main adoption question for external developer testing.

## Evidence today

- One founder-operated testnet run with fixed-fictional material.
- Five confirmed Monad Testnet state transactions.
- Four recorded gate outcomes across V1 and V2.
- Public read-only receipt verifier and reproducible local evidence checks.
- No external integration, independent developer reproduction, customer pilot, production use, retention, revenue or willingness-to-pay evidence yet.

## Next validation

Ask an external developer to clone the repository, run the two evidence checks, identify a real handoff workflow, and report setup time and blocking friction. A reproduction is not an integration; an expression of interest is not adoption.
