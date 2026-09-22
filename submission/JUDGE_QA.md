# Judge Q&A

## 1. Why is this not just a database permission table?

A database controlled by Shanhai requires Agent B to trust Shanhai's latest answer and audit trail. Monad makes the minimum grant fact independently readable across organizational boundaries. The encrypted content remains off-chain; the shared trust fact does not.

## 2. Why not export the entire ChatGPT or journal history?

Whole-history export over-discloses and collapses source quality. SCP projects a specific authorized scope and preserves whether an item was user-confirmed, quoted, traceable, or inferred.

## 3. What happens after revocation?

Future access is denied before envelope delivery. The project does not falsely claim that revocation can claw back plaintext already obtained during a previously valid authorization.

## 4. Can the model decide what to remember or authorize?

No. Models may propose structure, but deterministic code and explicit user state control confirmation, scope, version, grant, revocation, and delivery. Model output has the lowest source authority unless confirmed later.

## 5. What exactly is stored on Monad?

Only minimum authorization facts: identifiers/commitments, current version, grantee, scope hash, expiry and revocation state. No personal statement, conversation, voice, biography, or model context is placed on-chain.

## 6. What makes the result portable?

The protocol object, canonical serialization, provenance commitment, scope rules and conformance vectors are agent-neutral. Agent B verifies the same object and authorization without accessing Owner cookies or private keys.

## 7. How do you prove zero model calls?

The model gateway is downstream of authorization, envelope return, local decryption and commitment checks. Tests instrument the gateway counter. Non-active and tampered paths finish before a request object is constructed.

## 8. What is live today?

The protocol, encryption flow, independent Agent B, Solidity contract, RPC reader, deterministic gate and four-act demo run locally. Live testnet deployment and receipt links must be inserted before they are claimed. The repository keeps synthetic and live evidence separate.

## 9. Is this already a validated consumer business?

No. This submission proves a technical and governance primitive. It does not prove willingness to pay, retention, or market adoption for the broader Unsaid Shanhai product.

## 10. Why Monad specifically?

The demo needs cheap, fast, independently readable state changes for grant, version and revocation. Monad lets the negative states become visible during a short product interaction while keeping the content off-chain.

## 11. Does open source remove the commercial moat?

The repository opens the interoperability primitive and demonstration, not the complete product, private corpus, operating system, user network, delivery process or accumulated user-authorized assets. Adoption of the protocol can strengthen interoperability while the product competes on trust, experience and continuity quality.

## 12. What is the largest remaining technical risk?

Production key lifecycle, browser compromise, multi-party delivery, contract/security audit and external agent behavior remain open. The current work is a testnet hackathon implementation, not production authorization.
