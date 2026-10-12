# External reproduction feedback — blank participant form

**Status: NOT YET RUN.** This is a blank template, not evidence of an external test. Replace only the fields describing work you actually performed; leave everything else `NOT RUN` or `UNKNOWN`. No personal name, employer, contact details, wallet, private key, recovery phrase or account token is required.

## Scope and independence

```text
Participant alias (optional):
Run date/time and timezone:
Relationship to project (contributor / mentor / external developer / other):
Did you contribute to this implementation before this test? UNKNOWN
Assistance received during this run (none / written guide / live help; describe):
Goal or existing application you wanted to test (no confidential details):
```

Check only what you actually completed:

- [ ] Browser-only read-only verification.
- [ ] Local reproduction of the repository's checks.
- [ ] Local execution of the repository's synthetic handoff example.
- [ ] A change or integration in an application I control (describe below).

Running our example is not, by itself, an integration into your application. Being willing to try it is not adoption. Help from the author should be recorded, not concealed.

## Environment and source

```text
Commit from git rev-parse HEAD: NOT RECORDED
OS and shell: NOT RECORDED
Node version: NOT RECORDED
npm version: NOT RECORDED
Browser/version (if relevant): NOT RECORDED
Source access: NOT ATTEMPTED
Dependency installation: NOT RUN
Network/RPC provider (redact secrets; optional):
Local modifications before/during test (none / describe):
```

## Actual results

Use `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, or `UNKNOWN`. Include the relevant output, screenshot or error under the table. Do not fill PASS from this template or from someone else's screenshot.

| Check | Result | Actual observation / output reference |
|---|---|---|
| Open public read-only page without login | NOT RUN | |
| Click fresh five-receipt re-check | NOT RUN | |
| Clone/access source | NOT RUN | |
| `npm ci` | NOT RUN | |
| `npm run verify:brief-evidence` | NOT RUN | |
| `npm run verify:brief-live` | NOT RUN | |
| `node examples/brief-handoff.mjs` (optional) | NOT RUN | |
| `npm test` (optional) | NOT RUN | |
| `npm run test:process` (optional) | NOT RUN | |
| `npm ci --prefix contracts` (optional) | NOT RUN | |
| `npm run compile:contract` (optional) | NOT RUN | |

```text
Commands actually run, with relevant output/errors:
NOT RECORDED

Retries and changes made between attempts:
NOT RECORDED

Any mismatch or unexpected downstream work:
NOT RECORDED
```

Keep failures as well as successful retries. Redact credentials, local personal paths and confidential application data. A receipt-check success establishes matching on-chain receipts; it does not independently establish archived off-chain execution counters.

## Effort and friction

```text
Approximate active minutes spent (or NOT MEASURED): NOT MEASURED
Waiting/network time, if measured: NOT MEASURED
First confusing or blocking step:
What required help or a code change:
What was easy to verify:
What you still cannot verify:
One change that would make this easier to use:
```

## Application relevance — not a required endorsement

```text
Did you only inspect/run this repository, or connect your own application? NOT RUN
If integrated: application/task (non-confidential description):
What component or boundary you actually connected:
Code, test or output you can share (optional):
Was any actual application workflow completed? UNKNOWN
Why would you choose this over your existing permissions/database/workflow?
Why would you NOT choose it?
Interest in a further trial: YES / NO / UNSURE / NOT ANSWERED
Conditions required for a further trial:
```

## Permission to use your feedback

Defaults remain **NO** unless you explicitly change them. These are separate choices; declining publicity does not invalidate the test.

```text
May the team include this feedback privately in hackathon judging materials? NO
May the team publish an anonymized factual summary of this run? NO
May the team publish a direct quote? NO
If yes, exact quote approved:
May the team identify you publicly by the alias supplied above? NO
Any restrictions or details to remove:
```

Do not send secrets as proof of execution. The team should distinguish your browser check, independent local reproduction, assisted test and actual integration in any subsequent claim.
