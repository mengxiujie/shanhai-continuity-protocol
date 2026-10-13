# A correction does not inherit the old approval

*Building version-bound, revocable context authorization for AI agents on Monad*

AI memory is becoming portable.

Agents can inherit previous conversations. Personal assistants can carry context across sessions. Multi-agent systems can hand information from one model to another. User-owned context layers promise that people will no longer need to start from zero every time they switch applications.

That is real progress.

But portability leaves a harder question unanswered:

> **Just because an AI received some context before, is it still authorized to use it now?**

Those are not the same thing.

A copy can survive after the facts have changed.  
A recipient can still possess information after the owner has narrowed the intended scope.  
And an approval that was valid yesterday can remain technically usable even after the person who gave it has corrected, replaced, or withdrawn what they meant.

This is the problem we explored while building **Shanhai Continuity** on Monad.

Our starting principle is simple:

> **A correction does not inherit the old approval.**

That small rule has surprisingly large consequences for how AI continuity should be designed.

---

## Portable does not mean still authorized

Consider an intentionally ordinary example.

A user prepares an event brief.

The approved version says:

> The announcement will happen on Friday.

The user authorizes another agent to use that brief.

Later, the event moves to Saturday.

The information changes.

What happens to the old approval?

A document system might simply overwrite Friday with Saturday.

A conventional permission system might still see:

- the same owner,
- the same recipient,
- the same resource,
- and an existing grant.

But something important has changed.

The user approved one particular version of the context. They did not necessarily approve:

> whatever that context may become later.

So this:

```text
Friday v1
APPROVED

↓ content changes

Saturday v2
STILL APPROVED
```

is not the behavior we want.

Instead:

```text
Friday v1
APPROVED

↓ a new context version is explicitly created

Friday v1
VERSION_STALE

Saturday v2
NOT YET AUTHORIZED
```

Only after a fresh authorization should version 2 become usable.

This is the central idea behind Shanhai Continuity.

![Diagram showing Friday v1 as approved, a correction creating Saturday v2, the old authorization becoming VERSION_STALE, and the new version requiring fresh approval.](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/azjxkvaadjm14fgrcidy.png)

---

## From memory portability to continuity authorization

Memory portability asks:

> **How can context move between AI systems?**

Shanhai asks a different question:

> **Under what current authority may another AI continue using that context?**

That distinction matters.

User control is not only the ability to export or move information.

It also includes the ability to determine:

- which recipient may use it;
- which portion may be used;
- which version was actually approved;
- and whether that authorization still exists.

We call this layer:

## Continuity Authorization

The primitive is conceptually small:

```text
Owner
Recipient
Scope
Context Version
Authorization State
```

Private content remains encrypted and off-chain.

The authorization layer tracks the minimum state necessary to determine whether a particular handoff is still valid.

Conceptually:

```text
Authorization {
  owner
  recipient
  scope
  version
  status
  commitment
}
```

The important part is not the data structure.

It is what the grant means.

It does **not** mean:

> Agent B is allowed to know me.

It means something narrower:

> **Agent B is authorized to use this approved scope of this particular context version while this authorization remains valid.**

That gives the primitive four properties.

### Authorized

A recipient must have an explicit grant.

### Scoped

Permission for one portion of context does not imply permission for everything else.

### Version-bound

Authorization remains attached to the version that was actually approved.

### Revocable

The owner can terminate future use through the protected handoff path.

The second and third properties are especially important for AI systems.

---

## The version is part of the permission

Traditional access control often asks:

> Does principal B have permission to access resource X?

For AI continuity, that question is incomplete.

Human context evolves.

A user may:

- correct a date,
- change a priority,
- withdraw a plan,
- reduce a scope,
- replace an instruction,
- or simply decide that something previously supplied should no longer guide future work.

So the relevant question becomes:

> **Does recipient B still have permission to use scope S of version V of this context?**

The version is not metadata around the permission.

> **It is part of the permission.**

This is why `VERSION_STALE` matters.

It is not merely an implementation error code.

It represents a distinction that ordinary persistent memory systems can easily blur:

> information may still exist while the authorization attached to that particular version is no longer current.

---

## What Shanhai does — and does not — decide

There is an important boundary here.

Shanhai does not attempt to autonomously decide whether a human change is “semantically important enough” to invalidate an authorization.

That would introduce another difficult problem:

> Who decides what change in a person's life counts as material?

The current prototype does not answer that.

Instead, version creation is explicit.

When the user or application creates a new context version, authorization remains bound to the version that was actually approved.

In other words, the system proves:

```text
new version ≠ inherited approval
```

It does not claim to automatically infer when human meaning has changed.

That distinction is deliberate.

---

## Friday becomes Saturday

Our hackathon prototype uses fixed fictional material so that the authorization behavior can be tested without using real personal data.

The scenario is deliberately simple.

### Version 1 is approved

The owner approves a Friday announcement for a recipient.

The permitted scope excludes a private planning note and an unapproved suggestion.

The recipient requests the authorized context.

The request succeeds.

```text
version: v1
status: ACTIVE
decision: ALLOW
```

The approved encrypted envelope proceeds through the protected delivery path.

### The context is corrected

The event moves from Friday to Saturday.

A new context version is explicitly created.

The recipient then attempts to rely on the old authorization.

The result is:

```text
VERSION_STALE
```

But the status code itself is not the important result.

What matters is what does **not** happen next.

In the recorded run, the stale request produced:

- no new envelope fetch,
- no new decryption,
- no context assembly,
- no downstream gateway call.

That is the actual authorization boundary.

A UI that displays a red `DENIED` badge while the application continues processing the protected context would not prove very much.

For authorization to be meaningful:

> **the denial has to change execution.**

### Version 2 receives its own approval

The Saturday version does not automatically inherit the Friday approval.

The owner explicitly authorizes it.

Only then does the recipient continue.

```text
version: v2
status: ACTIVE
decision: ALLOW
```

This is the rule in executable form:

> **A correction does not inherit the old approval.**

### Authorization is revoked

Finally, the owner revokes the recipient's authorization.

A subsequent request returns:

```text
REVOKED
```

Again, the protected downstream work does not proceed.

The recipient still exists.

The context still exists.

But the protocol's permission to continue supplying that context does not.

---

## Revocation is necessary. Correction is subtler.

Revocation is easy to understand.

A user says:

> I no longer want this recipient to have access.

The more interesting case is correction.

The user may still trust the same recipient.

They may still want the same task completed.

They may still want continuity.

What they no longer want is for the recipient to act on an obsolete version of reality.

That creates a distinct condition:

```text
recipient is still valid
scope is still relevant
a previous authorization existed

but

requested version is stale
```

The correct answer is neither:

```text
ALLOW
```

nor:

```text
RECIPIENT BANNED
```

It is:

```text
VERSION_STALE
```

That is why we believe version-bound authorization deserves to be treated as a first-class primitive in AI continuity systems.

---

## Authorization must happen before disclosure

Another implementation principle became important during the prototype.

A recipient should not:

```text
fetch protected context
↓
decrypt it
↓
assemble it
↓
then ask whether access was allowed
```

By that point the authorization boundary has already failed.

The protected path should instead look like:

```text
verify
↓
ALLOW
↓
fetch
↓
decrypt
↓
assemble
```

while:

```text
verify
↓
VERSION_STALE / REVOKED
↓
STOP
```

Our current prototype checks authorization before releasing the encrypted envelope, and the independent recipient process checks the authorization state again before decrypting and assembling the context.

The design rule is simple:

> **Verify first. Disclose second.**

---

## What would falsify the boundary?

A security claim becomes more useful when the failure condition is explicit.

For this prototype, we would consider the authorization boundary broken if a protected stale or revoked request could still trigger a new:

- envelope release,
- decryption,
- context assembly,
- or downstream delivery operation.

A red status in the interface would not be sufficient evidence of enforcement.

The denial must affect computation.

So the falsifiable claim being tested is narrow:

> **Through the protected handoff path, stale or revoked authorization must stop downstream disclosure work before it occurs.**

![Shanhai Continuity architecture showing encrypted context stored off-chain, authorization state on Monad, and AI agents verifying authorization before decrypting or using inherited context.](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/6dwtxqmcxms667bgpfmz.png)

This is the property our recorded scenario was designed to test.

---

## Why Monad?

The obvious engineering question is:

> **Why not put this in PostgreSQL?**

Sometimes, you should.

If one application is the only trust domain, an application database may be entirely sufficient.

Shanhai is not claiming that every AI permission needs a blockchain.

The problem changes when context crosses independently controlled applications.

Imagine:

- a user,
- a context provider,
- Agent A,
- and Agent B

all needing a shared answer to:

> **Is this authorization still valid?**

If the final authorization record belongs exclusively to Agent B's platform, then the party requesting access also controls the state that determines whether it is allowed access.

That weakens the meaning of user-owned continuity.

Our principle is:

> **The party requesting access should not be the final authority on whether access is allowed.**

Shanhai therefore uses Monad when the authorization state needs to cross that trust boundary.

The private context itself remains encrypted and off-chain.

Monad provides a common authorization state and durable transaction evidence that independent parties can verify.

So the architecture separates two things:

```text
private human context
│
│ encrypted
▼
OFF-CHAIN
```

and:

```text
authorization state
│
▼
MONAD
```

The precise claim is therefore not:

> blockchain is always better than a database.

It is:

> **when independent applications need a shared answer to whether a cross-application authorization is still valid, that state should not belong exclusively to the application requesting access.**

That is the role Monad plays in this prototype.

Or more compactly:

> **Private content. Publicly verifiable authorization state.**

---

## Why not let every application build its own authorization layer?

They can.

For a closed application, that may be the right design.

The interoperability problem begins when a supposedly user-owned context layer crosses product boundaries.

If every AI application independently keeps a private record saying:

> I am still authorized to use this user's context,

then the user's portable context has escaped one silo only to encounter another at the authorization layer.

A shared primitive becomes useful when applications need a common answer to:

```text
owner
recipient
scope
version
current authorization status
```

without treating the requester itself as the sole authority.

This is also why the integration point can remain small.

Before inherited context is decrypted or assembled:

```text
verify(
  owner,
  recipient,
  scope,
  version
)
```

The result determines whether the protected path continues.

Conceptually:

```text
Context request
      │
      ▼
Continuity Authorization
      │
 ┌────┼────┐
 ▼    ▼    ▼
ALLOW STALE REVOKED
 │      │      │
 ▼      └──┬───┘
disclose   ▼
          STOP
```

The goal is not to build another giant AI platform.

It is to make this permission boundary composable.

---

## What the current prototype actually proves

Precision matters here.

During the Monad Metropolis build period, we executed a fixed fictional scenario against Monad Testnet.

The recorded run includes five confirmed state transactions and covers the authorization lifecycle demonstrated above:

```text
v1 authorized → ALLOW
context corrected → old grant becomes VERSION_STALE
v2 authorized → ALLOW
authorization revoked
subsequent request → REVOKED
```

The public deployment is a read-only evidence verifier.

It can re-check the recorded transaction receipts against Monad Testnet.

It does not initiate a fresh wallet-signing ceremony from the browser, and it is not presented as a production authorization network.

The prototype demonstrates:

- a version-bound authorization state tied to real Monad Testnet transactions;
- enforcement of stale and revoked authorization before protected downstream disclosure work.

It does **not** demonstrate:

- production-grade security;
- a completed security audit;
- real-user adoption;
- large-scale developer adoption;
- model quality;
- production identity separation;
- or long-term operational resilience.

The scenario uses fictional material.

The final announcement output uses a fixed template rather than a live AI model.

The owner-side and request-signing operations in this run used the same test wallet.

The recipient execution path ran in a separate local process.

Therefore this experiment does not establish independent human identities or production key separation.

The property under test is narrower:

> **authorization-state enforcement across the protected handoff path.**

That is what the evidence should be used to evaluate.

![Authorization flow comparing an ACTIVE request that proceeds through fetch, decrypt, assemble, and delivery with VERSION_STALE or REVOKED requests that stop before downstream disclosure work.](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/0u91u9ndqmd9h4hh8gj7.png)

---

## Revocation cannot make a recipient forget

Another boundary deserves to be explicit.

Once plaintext has legitimately been delivered to another system, a later blockchain transaction cannot guarantee that every existing copy disappears.

Shanhai does not claim otherwise.

Revocation means:

> **future disclosure through the protected authorization path is no longer permitted.**

It does not mean:

> remotely erase every byte previously received.

This distinction matters because “revocable AI memory” can easily become an overclaim.

The property we are building is a permission boundary, not remote mind erasure or DRM.

That narrower property is still valuable.

The existence of information and the continuing authorization to supply or process it are not the same thing.

---

## Authorization, not legal consent

We also deliberately use the term **authorization** rather than claiming to implement legal or regulatory consent.

Human consent can involve requirements around:

- notice,
- comprehension,
- voluntariness,
- capacity,
- purpose limitation,
- jurisdiction,
- and withdrawal semantics.

This prototype does not attempt to encode all of those requirements.

What it implements is narrower:

> **a technical authorization state tied to a particular recipient, scope and context version.**

That boundary lets us reason precisely about what the system currently does without claiming more than the prototype supports.

---

## Where this primitive could fit

The most relevant adopters are not necessarily general consumers.

They are developers building systems where context crosses recipients and where user intent can change over time.

Examples include:

- personal AI assistants;
- multi-agent systems;
- user-owned AI memory layers;
- enterprise agent workflows;
- and sensitive-domain AI systems where freshness and scope matter.

The integration point is concrete:

> **before inherited context is decrypted or assembled, verify whether this recipient is still authorized for this scope and this version.**

This also answers an important product question.

Why would another developer use a shared authorization primitive instead of building the same logic internally?

Because once authorization itself needs to work across applications, an application-owned authorization database recreates the silo that user-owned context is supposed to remove.

The value is not merely API convenience.

It is having an authorization state that is not exclusively controlled by the recipient asking to use the context.

---

## From owning memory to owning continuity

The broader design question is larger than this prototype.

Much of the discussion around user-owned AI focuses on possession:

> **Can I export my memory?**

That is necessary.

But possession alone does not answer:

- Who can continue using it?
- Which part?
- Which version?
- Under what current authorization?
- What happens when I change my mind?

This suggests a distinction:

> **Owning the context is not the same as owning its permission lifecycle.**

A truly user-owned context layer should eventually support both.

Portability determines where information can go.

Authorization determines whether it may still go there.

---

## A small rule with a large consequence

Shanhai Continuity can ultimately be reduced to one principle:

> **A correction does not inherit the old approval.**

From that follows:

- explicit versioning,
- fresh authorization after version change,
- stale-version rejection,
- scope-bound access,
- revocation,
- and fail-closed disclosure.

The mental model changes from:

> The AI knows this about me.

to:

> **The AI is currently authorized to use this version of this part of my context.**

That is a smaller claim.

It is also a much more controllable one.

---

## Evidence

The current prototype and recorded run can be inspected directly.

### Source repository

[Shanhai Continuity Protocol — GitHub](https://github.com/mengxiujie/shanhai-continuity-protocol)

The repository contains the hackathon implementation and the disclosure of the pre-existing Shanhai product context.

### Live evidence verifier

[Shanhai Continuity — Monad Testnet Evidence Verifier](https://shanhai-brief-proof.open-wand-0634.chatgpt.site/)

No login or wallet is required.

The page presents the recorded authorization outcomes and can re-check the five recorded transaction receipts against Monad Testnet.

### Technical demo

[Shanhai Continuity — Technical Demo](https://youtu.be/nTZoqwLfsjo)

The current demo shows the working prototype rather than a slide presentation.

### Project pitch

[Shanhai Continuity — Pitch](https://youtu.be/hig7qjxeCFQ)

### Recorded test sequence

```text
approve context v1
deliver authorized v1
create corrected context v2
reject use of stale authorization
separately authorize v2
deliver authorized v2
revoke authorization
reject subsequent access
```

Five authorization-state transactions from this recorded run are exposed through the public evidence verifier and can be re-checked against Monad Testnet.

---

## Build-window disclosure

The broader Shanhai product direction predates this hackathon.

The work described in this article concerns the Shanhai Continuity authorization prototype built during the Monad Metropolis hackathon period.

That hackathon-period work includes the protocol implementation, Monad authorization integration, independent recipient execution path, browser workbench, executed fictional test scenario, and public evidence-verification surface.

The intention of this disclosure is simple:

> the argument in this article should stand on the work actually built and tested for this submission, not on the existence of the broader pre-existing Shanhai project.

---

## What comes next

The next questions are no longer primarily about adding more protocol features.

They are about whether the primitive survives contact with other developers.

Among them:

- Can an independent developer reproduce the authorization flow quickly?
- What is the smallest usable integration API?
- Which application events should explicitly create a new context version?
- How should shared scopes be represented across different AI products?
- How should recipients be identified across ecosystems?
- Where should authorization checks sit inside existing agent frameworks?
- How should delegated or derived context inherit — or fail to inherit — authorization?
- How much friction will users tolerate when re-authorizing materially changed context?

Those questions need evidence, not speculation.

The current prototype is meant to make them testable.

---

## Conclusion

AI memory is becoming portable.

That is useful.

User-owned context is better.

But neither concept alone answers what happens after the information changes.

A system still needs to know:

> **Does this recipient remain authorized to use this particular version of this context?**

Our answer is that AI continuity should be:

> **authorized, scoped, version-bound, and revocable by the human.**

Private context can remain off-chain.

Authorization state can remain independently verifiable.

A stale or revoked grant can stop downstream disclosure rather than merely changing a label in a database.

And when a person explicitly changes the context being shared, yesterday's approval should not silently follow.

Because:

> **A correction does not inherit the old approval.**

> **The version is not metadata around the permission. It is part of the permission.**

And ultimately, the goal is not to make AI forget continuity.

It is to make continuity answerable to the person it describes.

> **An AI can continue knowing you without owning the right to know you forever.**

---

**Shanhai Continuity**  
*The permission layer for human-owned AI continuity.*

Built on Monad Testnet for the Monad Metropolis Hackathon.
