# External developer quickstart

Pick the smallest check you can finish. **Browser: no installation. Local: Node.js 24+ and npm are required.** No wallet, private key, test coins, model account or personal material is needed for the checks below. This is an invitation to test, not a report of completed external adoption. Failures and confusing steps are useful results.

If you already started from a supplied ZIP, keep that ZIP and its version for this run. A later documentation update is not a request to download a different source version or start again.

The narrow question: **after a client corrects an approved brief, does a new request using the old approval stop, and does the corrected brief require separate approval?**

## Choose what you are testing

| Level | Task | What it establishes if successful |
|---|---|---|
| A · Browser check | Open the public page and re-check five receipts | The hosted read-only verifier is usable from your environment; archived transaction receipts match fresh RPC responses. |
| B · Local reproduction | Use the supplied ZIP or public Git clone; run the selected checks below | Someone outside the project can reproduce those checks at a recorded source version. |
| C · Integration experiment | Wire the primitive into an application you control and describe the actual handoff | Only the work actually completed counts as an external integration. Running our example alone does not. |

Completing A or B is useful feedback. Neither is customer adoption, a production security audit or proof that a live AI model follows the resulting instructions.

## A · Check the public evidence page (about 5 minutes)

1. Open [the public read-only demo](https://mengxiujie.github.io/shanhai-continuity-proof/). No login or wallet is required.
2. Inspect the four recorded outcomes: Friday approved; old version refused; Saturday separately approved; revoked access refused.
3. Scroll to **Five confirmed state transactions** and click **Re-check five receipts on Monad now**.
4. A successful fresh check displays `LIVE READ-ONLY CHECK PASS` and `5/5 successful receipts and block hashes match the archive`. Record the result and check time. If the request fails, retain that failure; a recorded green screenshot is not a substitute for a fresh check.

This page verifies an earlier founder-operated run. It does not send a transaction, run a new recipient process or call an AI model. Its off-chain counters come from the project's archived instrumentation; transaction receipts do not independently prove those counters.

## B · Reproduce locally (allow 30–60 minutes including setup and feedback)

### Prerequisites and source access

- Node.js **24 or newer**, and npm. Check `node --version` before installing dependencies. If your version is lower and you do not want to change your environment, complete A and report the local prerequisite as blocked; do not spend the whole trial upgrading. Node 24+ is the declared supported runtime, not a claim that every lower version has been tested and fails.
- Initial `npm ci` needs access to the npm registry. After installation, the archive check and local mock example do not need the public Monad RPC. The separate live check does.
- **ZIP users do not need Git.** Unzip the supplied archive and open a terminal in the directory containing `package.json`. Record the source commit and ZIP hash from its accompanying handoff note. Skip both `git clone` and `git rev-parse HEAD`; a source ZIP intentionally has no `.git` directory.
- **Git users:** the repository is public. The HTTPS clone below requires no GitHub login or access invitation. If cloning fails, retain the actual error and check the URL and network; use the supplied ZIP if available, or complete A. Do not share login tokens.

Git users only:

```bash
git clone https://github.com/mengxiujie/shanhai-continuity-protocol.git
cd shanhai-continuity-protocol
git rev-parse HEAD
```

Both ZIP and Git users, from the directory containing `package.json`:

```bash
node --version
npm --version
npm ci
```

Save the source version and environment versions. Stop local execution if installation fails; mark unrun checks `NOT_RUN`, not PASS. In PowerShell, use `npm.cmd` instead of `npm` if `npm.ps1` is blocked; no execution-policy change is needed.

These checks answer three different questions:

| Check | Uses public network after installation? | What a pass means |
|---|---|---|
| `verify:brief-evidence` | No | The original archived files and recorded scenario are internally consistent. |
| `node examples/brief-handoff.mjs` | No; loopback only | A fresh reference-runtime execution passes four lifecycle cases against a **local mock RPC**, not Monad Testnet. |
| `verify:brief-live` | Yes; Monad Testnet RPC | Five archived transaction receipts match fresh public-chain reads; no new wallet or Agent B run. |

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

### 2. Run a fresh local handoff example

```bash
node examples/brief-handoff.mjs
```

Expected final label: `PASS 4/4 local mock lifecycle outcomes`. Keep the complete actual output, including any failure, rather than copying this expected label into your report.

This uses a **local synthetic RPC server**, generated test identity and the actual reference runtime. It exercises the separate recipient process and authorization lifecycle without a wallet, public RPC or testnet funds. It does not deploy or execute Solidity on Monad. Read [the example source](../examples/brief-handoff.mjs) for the source-level integration boundary and cleanup.

Running our example is reproduction, not integration into your own application. If this step is blocked, retain the error and proceed to the independent live check if practical.

### 3. Re-read the five transactions from Monad Testnet

```bash
npm run verify:brief-live
```

Expected JSON: `status: PASS`, `evidenceType: READ_ONLY_PUBLIC_RPC_TRANSACTION_CHECK`, `chainId: 10143`, `transactionCount: 5`; every result has `status: 0x1` and `match: true`.

The script reads receipts and matches each archived transaction hash, success status, block number and block hash. It does not mutate chain state, re-authorize an expired/revoked grant, or prove historical off-chain execution. Preserve the final `boundary` field with your output.

This step needs access to `https://testnet-rpc.monad.xyz` unless you explicitly select another trusted endpoint. An HTTP error or timeout may be a network/provider problem, but it is **not automatically proven to be a network problem rather than a bug**. Report the observed error and leave its cause unconfirmed. Successful offline checks still count separately; a failed live check must not be reported as 5/5 PASS.

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
| Clone returns not found / permission denied | The repository is public; check the exact URL and network, retain the error, and use the supplied ZIP or browser check if needed. Do not share credentials. |
| Node version is below 24 / unsupported runtime | Use an existing supported environment if convenient, or complete A and report the blocked prerequisite. If you upgrade and retry, record both attempts. |
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

You do not need a long report. Send five things:

1. Which steps you personally ran, and whether AI or the project owner helped.
2. Source commit/ZIP, OS and Node version, plus actual output or error for each attempted command. Mark skipped steps `NOT_RUN`.
3. Time spent and the first confusing or blocked step.
4. One real handoff task where this might help, or why your existing database/permissions are sufficient. “No relevant use case” is a valid answer.
5. Whether an anonymized summary may be included in the submission. Public name or quotation requires separate permission.

The [longer feedback form](EXTERNAL_REPRO_FEEDBACK.md) is optional. Do not send secrets or real client data. A browser check, source reproduction, external integration and customer adoption will be recorded separately; AI-generated feedback is not a human run.

The earlier [controlled clean-room report](REPRODUCTION_REPORT.md) is historical work by the same operator. It must not be relabeled as your independent reproduction.
