# Adoption hypothesis

## A specific first workflow

Our first intended adopter is a developer building an assistant for a small agency or operations team that receives **client-approved briefs from another tool or team**. For example, a client approves the date and venue for an event announcement, keeps internal planning notes private, then changes the date before a downstream assistant requests the brief again.

The recipient needs to answer a narrow question before receiving content: **may this recipient receive this scope and this version now?** In the proposed workflow:

1. The client approves a selected brief for a recipient and purpose.
2. The next tool receives that approved version and can prepare its output.
3. The client publishes a correction; the old grant no longer permits another delivery.
4. A separate grant permits the corrected version.
5. Revocation blocks a later request through the reference delivery path.

Lens Club is the fixed-fictional demonstration of this workflow. It is not a customer or evidence that event organizers want the product. The implementation responds to explicit published versions; it does not automatically detect semantic changes or infer whether a client has changed their mind.

## Where a developer connects it

Place the authorization boundary where an application would otherwise export a client-approved brief to the next tool or agent. The sender checks the Monad registry before releasing an encrypted envelope. The separately running recipient checks again before decryption and context assembly. The downstream application consumes an approved result; a denied request produces no new application result.

The source-level seam is [`createSprintRuntime`](protocol/reference/owner-web/sprint-runtime.mjs). The [local example](examples/brief-handoff.mjs) shows how to supply the document, allowed item IDs and registry/request parameters, obtain a `createChallenge()`, submit a signed declaration through `continueWithSignature(...)`, and `close()` the runtime. It uses the real reference runtime with **local mock registry state**. The [Quickstart](docs/DEVELOPER_QUICKSTART.md) gives the runnable steps and their boundaries.

Potential reuse includes request signing and nonce binding, scope/content commitment checks, encrypted delivery, recipient re-checks and failure fixtures. This is currently a reference implementation, not a published stable SDK. Reduced integration effort has not been measured.

## Why use a shared registry — and when not to

A shared Monad registry lets cooperating tools read the same minimum grant state without each tool maintaining a conflicting copy or relying solely on the sending platform's current assertion. Private content stays encrypted off-chain. This architectural reason applies to shared registries generally; the prototype does not establish a Monad-specific performance advantage.

A database permission table is likely simpler when one trusted organization controls both endpoints and already operates the authorization service. If the task only needs a one-time export and later delivery never occurs, the lifecycle controls may provide little benefit. The protocol also cannot recall plaintext already delivered, force arbitrary recipients to comply, or hide all metadata of public grants.

The adoption hypothesis is therefore specific: **for some cross-tool handoffs, independently checking current, version-bound approval will be useful enough to justify signing, chain access and integration overhead.** We have not yet established that trade-off with an external application.

## Evidence today

- One founder-operated testnet run using fixed-fictional material, with five confirmed state transactions and four recorded gate outcomes.
- A public read-only receipt verifier, local archive checks and a runnable local mock lifecycle example.
- External testing has started according to the project owner; returned results have not yet been reviewed. No successful external reproduction or integration is claimed on that basis.
- No customer pilot, production use, retention, revenue or willingness-to-pay evidence. Third-party AI-generated or AI-run feedback is not counted as human developer feedback.

## A small validation sequence

| Step | Ask the participant to do | Evidence to retain |
|---|---|---|
| Browser check | Open the public demo, re-check receipts and explain the problem in their own words. | Actual result, time and first confusing point. This establishes usability from that environment. |
| Local reproduction, if willing | Run the archived-evidence verifier and local runtime example; record the live RPC check separately. | Source commit or ZIP identity, environment, actual outputs, elapsed time and failures. This establishes only the checks actually reproduced. |
| Application experiment | Identify a current handoff in their own tool and connect the relevant boundary. | What was connected, who controls each side, changed code or request flow, and observed behavior before and after correction/revocation. |

A useful application experiment must concern a task the developer already has. Compare it with their existing database or file-sharing workflow: setup and maintenance effort, correction handling, unintended releases and whether they choose to use it again. If existing permissions suffice, record that finding. Interest alone does not demonstrate adoption, and a reproduction of our example is not an external application integration.

We will update adoption claims only from the work actually completed and the participant's attributable feedback, with permission for any public quotation.
