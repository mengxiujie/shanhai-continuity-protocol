# Hosted demo candidate

## Current authorization state

The repository contains a hosting candidate only. No external deployment has been performed or authorized. The GitHub Pages workflow is manual (`workflow_dispatch`) so a repository push cannot publish the demo automatically.

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
