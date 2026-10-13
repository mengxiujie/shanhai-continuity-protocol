# External developer quickstart

This is a 30–60 minute **requested experiment**, not a report of completed external adoption. Pick the level you can finish; report failures as well as successes. No wallet, private key, test coins, model account or personal material is needed for the basic checks below.

The narrow question: **after a client corrects an approved brief, does a new request using the old approval stop, and does the corrected brief require separate approval?**

## Choose what you are testing

| Level | Task | What it establishes if successful |
|---|---|---|
| A · Browser check | Open the public page and re-check five receipts | The hosted read-only verifier is usable from your environment; archived transaction receipts match fresh RPC responses. |
| B · Local reproduction | Clone the source, run the evidence verifiers and optionally the local runtime example/tests | Someone outside the project can reproduce the selected checks at a recorded commit. |
| C · Integration experiment | Wire the primitive into an application you control and describe the actual handoff | Only the work actually completed counts as an external integration. Running our example alone does not. |

Completing A or B is useful feedback. Neither is customer adoption, a production security audit or proof that a live AI model follows the resulting instructions.

## A · Check the public evidence page (about 5 minutes)

1. Open [the public read-only demo](https://mengxiujie.github.io/shanhai-continuity-proof/). No login or wallet is required.
2. Inspect the four recorded outcomes: Friday approved; old version refused; Saturday separately approved; revoked access refused.
3. Scroll to **Five confirmed state transactions** and click **Re-check five receipts on Monad now**.
4. A successful fresh check displays `LIVE READ-ONLY CHECK PASS` and `5/5 successful receipts and block hashes match the archive`. Record the result and check time. If the request fails, retain that failure; a recorded green screenshot is not a substitute for a fresh check.

This page verifies an earlier founder-operated run. It does not send a transaction, run a new recipient process or call an AI model. Its off-chain counters come from the project's archived instrumentation; transaction receipts do not independently prove those counters.

## B · Reproduce locally (about 15–30 minutes)

### Prerequisites and source access

- Git, Node.js **24 or newer**, and npm.
- Internet access for the initial dependency installation and the live RPC check. The archived-evidence verifier runs offline after installation.
- Source access: the repository may still be private when you receive this invitation. Use your own authorized GitHub session. If access is denied, report **SOURCE_ACCESS_BLOCKED** and complete A; do not request or share someone else's login token. The same clone URL works when the owner makes the repository public.

From a terminal:

```bash
git clone https://github.com/mengxiujie/shanhai-continuity-protocol.git
cd shanhai-continuity-protocol
git rev-parse HEAD
node --version
npm --version
npm ci
```

Save the commit and environment versions in the [feedback form](EXTERNAL_REPRO_FEEDBACK.md). Stop if installation fails; do not label later checks successful when they have not run.

### 1. Verify the two original browser exports

```bash
npm run verify:brief-evidence
```

Expected JSON fields:

```text
status: PASS
evidenceType: TWO_ORIGINAL_BROWSER_EXPORTS
transactionCount: 5
gateOutcomes: ACTIVE v1, VERSION_STALE v1, ACTIVE v2, REVOKED v2
realModelBehavior: NOT_MEASURED
```

The verifier checks the exact SHA-256 hashes, fixture commitments, shared scenario/parameters, recorded transactions and four result/counter records. Two original files are intentional: the operator reloaded the browser between parts of the run. This is an **archive consistency check**, not a fresh replay of the wallet transactions or off-chain execution.

### 2. Re-read the five transactions from Monad Testnet

```bash
npm run verify:brief-live
```

Expected JSON: `status: PASS`, `evidenceType: READ_ONLY_PUBLIC_RPC_TRANSACTION_CHECK`, `chainId: 10143`, `transactionCount: 5`; every result has `status: 0x1` and `match: true`.

The script reads receipts and matches each archived transaction hash, success status, block number and block hash. It does not mutate chain state, re-authorize an expired/revoked grant, or prove historical off-chain execution. Preserve the final `boundary` field with your output.

### 3. Optional: run a fresh local handoff example

```bash
node examples/brief-handoff.mjs
```

This example uses a **local synthetic RPC server**, generated test identity and the actual reference runtime. It exercises the recipient process and authorization lifecycle without requesting a wallet or using public testnet funds. Read [the example source](../examples/brief-handoff.mjs) to see the integration boundary and cleanup, then record the exact output rather than copying an expected result into your report.

This is a reference-code reproduction. It becomes an external integration experiment only if you actually connect it to your own application's handoff and describe what you changed. Do not substitute real client data during this short trial.

### 4. Optional: regression tests and contract compilation

```bash
npm test
npm run test:process
npm ci --prefix contracts
npm run compile:contract
```

`npm test` runs protocol conformance/runtime tests, the deterministic Monad gate tests and wallet-controller tests. These use synthetic local fixtures, not new public-chain transactions. `test:process` separately exercises the local recipient process. Contract compilation needs its own dependency installation shown above; root `npm ci` does not install `solc` in `contracts/`. There are no additional protocol package dependencies to install.

Report the actual test totals, failures and compiler output from your run. A passing compiler or process exit alone is not evidence that a new testnet workflow or external integration succeeded.

## If something fails

| Symptom | Safe next step |
|---|---|
| Clone returns not found / permission denied | Check that the owner granted your account access, or wait for the public release. Do not share credentials. |
| Node version is below 24 / unsupported runtime | Use Node 24+ and retry. Record both attempts if the first one failed. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd` in place of `npm`; no permanent execution-policy change is required. |
| `npm ci` cannot reach the registry | Record the network/install error and retry when connectivity is restored. Do not delete the lockfile to claim a clean reproduction. |
| Live RPC returns HTTP error, timeout or no receipt | Record this as failed or blocked, not PASS. The archive verifier can still be run independently, but it does not replace the live check. |
| Hash, block or commitment mismatch | Preserve the output and commit. Do not edit the original JSON files or expected hashes to make the test pass. |
| A local process cannot bind a loopback port or start a child | Record the environment restriction. No public firewall opening or wallet setup is needed for the example. |

The live CLI accepts an optional `MONAD_TESTNET_RPC_URL` environment variable. If you choose another trusted **Monad Testnet** endpoint, record its provider and the reason for the retry, but redact API keys or credential-bearing URLs. Never switch to another chain to obtain a nominal pass.

## C · Find the actual application boundary

The current implementation is a source-level reference, not a published stable SDK. The narrow runtime seam is [`createSprintRuntime`](../protocol/reference/owner-web/sprint-runtime.mjs): initialize it with a document, approved item IDs and registry/request parameters; obtain a `createChallenge()`; submit a signed declaration to `continueWithSignature(...)`; always `close()` the runtime when finished. The example is the starting point, not a production integration recipe.

For an application experiment, identify exactly where your current tool releases a client-approved brief. Record which of these you actually connected: scope selection, authorization check, encrypted delivery, recipient re-check, context construction, or downstream action. If you only reviewed the API, say so. If your use case is better served by your existing database permissions, say that too.

Important limits:

- The public testnet run used the same wallet for owner and requester; the recipient ran in a separate local process, not a separate organization.
- Chain reads are snapshots. A change between checks can mean ciphertext has already arrived before the recipient refuses to decrypt.
- Revocation governs subsequent requests in the compliant path; it cannot recall plaintext already received or force an arbitrary third party to forget it.
- The fixture announcement uses a fixed template. No real-model quality, production security or real-user value has been established by these checks.

## Send back the evidence, not a verdict we prescribed

Use [EXTERNAL_REPRO_FEEDBACK.md](EXTERNAL_REPRO_FEEDBACK.md). A useful response is: what you attempted, commit/environment, actual outputs, time spent, the first confusing step, and whether this belongs in a real task you already have. An honest failure is useful. A quote or public attribution is optional and requires your separate permission.

The earlier [controlled clean-room report](REPRODUCTION_REPORT.md) is historical work by the same operator. It must not be relabeled as your independent reproduction.
