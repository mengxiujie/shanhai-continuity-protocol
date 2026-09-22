# Three-minute technical demo

## 0:00–0:25 — Problem

“AI memory is becoming valuable, but it is usually trapped inside one account and governed by one platform. Exporting an entire history reveals too much. Copying a summary loses source and correction history. Shanhai asks a different question: can continuity travel while authority stays with the person?”

Show the hero and the core invariant.

## 0:25–0:55 — Protocol object

Show one synthetic confirmed statement and briefly point to:

- source authority;
- exact scope;
- `validTime` versus `recordedAt`;
- version and supersession;
- provenance commitment.

Voice-over: “A statement is not simply stored as truth. It carries who said it, whether the user confirmed it, when it was true, when it was recorded, and what later version superseded it.”

## 0:55–1:25 — Encryption and Monad grant

Create V1 and explain:

- browser encryption;
- personal plaintext stays off-chain;
- Monad stores only minimum authorization facts;
- Agent B has a separate key and no owner credential.

Show the envelope metadata, not any secret key.

## 1:25–1:50 — Positive path

Agent B requests continuity. Show `ACTIVE` and the `1 / 1 / 1` counters.

Voice-over: “The service does not decide by itself. Agent B independently reads the Monad grant. Only the exact active version and scope receive an envelope. Decryption and model-context construction happen locally.”

## 1:50–2:20 — Negative proofs

Publish V2 and replay V1. Then revoke.

Voice-over: “The important result is not only that authorized access works. It is that stale and revoked access stop before any content reaches the agent. Zero envelopes. Zero decryptions. Zero model calls.”

## 2:20–2:43 — Evidence

Show terminal tests and the live evidence panel:

- 9/9 protocol vectors;
- 13/13 runtime/envelope tests;
- 5/5 deterministic Monad gates;
- contract address, block, and real receipts only when available.

Explicitly label the synthetic and live evidence surfaces.

## 2:43–3:00 — Why it matters

“Shanhai is not another journaling interface. It is an open continuity primitive: a person can carry a verified fragment of themselves into another AI without giving one platform ownership of the whole story. Your memory travels. Your authority stays with you.”

End on repository, demo, contract and Track 04.
