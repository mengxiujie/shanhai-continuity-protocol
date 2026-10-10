# Hosted demo candidate

## Current authorization state

The owner explicitly authorized public release of this isolated synthetic candidate on 2026-10-11. The repository and static walkthrough are now published. The GitHub Pages workflow remains manual (`workflow_dispatch`), so a repository push cannot publish a new site build automatically. This publication is not a production Shanhai service or Monad contract deployment.

## Verified publication

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

## Publish later through GitHub Pages

1. Push the verified repository to the owner's public GitHub account.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
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
