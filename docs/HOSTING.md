# Hosted demo candidate

## Current authorization state

The owner's latest instruction on 2026-10-11 is: temporarily private, reopen before submission. The repository is now PRIVATE and the GitHub Pages site configuration has been removed. Anonymous requests to the repository, Pages root, demo HTML and evidence document return HTTP 404. Keep local work private; do not present these links as currently accessible submission evidence.

The Pages workflow remains manual (`workflow_dispatch`); no scheduled reopening was created. Before submission, restore public visibility and Pages, manually deploy the verified commit, then check anonymous access again. This is a static synthetic demonstration, not a production Shanhai service or Monad contract deployment. Previously downloaded copies cannot be recalled by this change.

## Historical verified publication — subsequently withdrawn

The following success records preceded the owner's privacy instruction. They remain historical evidence, not current public availability.

- Repository: https://github.com/mengxiujie/shanhai-continuity-protocol — public/main; anonymous HTTP 200 and project title observed.
- Static walkthrough: https://mengxiujie.github.io/shanhai-continuity-protocol/ — anonymous HTTP 200.
- Initial successful workflow: https://github.com/mengxiujie/shanhai-continuity-protocol/actions/runs/38090677884 — commit `008f85be96fcd29ec47463ed7f109f47025470e2`.
- Hosted demo HTML, JavaScript and evidence document each returned anonymous HTTP 200. The workflow passed install, release audit, tests, independent-process check, compilation, build, hosting audit and deployment.
- These are publication/reproducibility observations, not an external developer's independent adoption or browser-wallet execution. Final recording, real chain evidence and portal submission are still pending.

## Build locally

```bash
npm ci
npm run audit:release
npm test
npm run build:pages
npm run audit:hosting
```

Serve the generated output:

```bash
python -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`. The root redirects to `apps/demo/index.html`.

## Reopen before submission through GitHub Pages

1. Finish the submission checkpoint, restore this repository's public visibility, and push the verified commit.
2. Recreate the GitHub Pages site; in repository Settings → Pages, select **GitHub Actions** as the source.
3. Open Actions → `deploy demo to GitHub Pages` → Run workflow.
4. Record the workflow run, deployed URL, commit SHA, and logged-out-browser result.
5. Replace `[DEMO_URL]` only after the public page is confirmed from a logged-out browser.

## Security boundary

The `dist/` directory contains only:

- the synthetic four-act demo;
- the read-only Monad evidence panel;
- client-side gate/provider modules and tests bundled as static source;
- the evidence-level document.

It must not contain `.env`, deployment records, account screenshots, internal archives, submission drafts, wallet data, personal content, or unresolved evidence-link placeholders.
