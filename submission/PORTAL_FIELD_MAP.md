# Portal field map

> The final portal fields are not yet visible. On 2026-10-02, record the exact field names, limits, required links, and validation behavior before editing this map.

| Expected field | Source | Status |
|---|---|---|
| Project name | `SUBMISSION_COPY.md` / Project name | READY |
| Tagline | `SUBMISSION_COPY.md` / Tagline | READY |
| Short description | `SUBMISSION_COPY.md` / Short description | READY; trim to portal limit |
| Long description | `SUBMISSION_COPY.md` / Long description | READY; map sections |
| Primary track | Trust, Identity & AI Infrastructure | SELECTED |
| Sponsor bounty | Mera PRF bounty only if proof passes | NOT SELECTED |
| Public repository | `[GITHUB_URL]` | BLOCKED: no public push |
| Hosted demo | `[DEMO_URL]` | PENDING |
| Video | `[VIDEO_URL]` | PENDING |
| Contract / transactions | evidence placeholders | BLOCKED: not deployed |
| Team | Solo team | COMPLETE |
| AI disclosure | `docs/AI_USAGE.md` | READY |
| Prior/new work | `docs/BUILD_DISCLOSURE.md` | READY |
| License | MIT | READY |

## Submission-time rule

Never fill a required URL with a local path or placeholder. If a field cannot be truthfully completed, stop and record the exact portal validation message.
