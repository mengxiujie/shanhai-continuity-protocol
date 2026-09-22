# Publishing checklist

## Automated gate

- [ ] `npm ci`
- [ ] `npm ci --prefix contracts`
- [ ] `npm run audit:release`
- [ ] `npm test`
- [ ] `npm run test:process`
- [ ] `npm run compile:contract`
- [ ] CI passes from a clean checkout.

## Privacy and security

- [ ] No `.env`, private key, seed phrase, token, cookie, PIN, passkey output, or wallet export.
- [ ] No real user text, voice, identity record, email address, or local absolute path.
- [ ] No `raw/`, private screenshots, portal session data, or internal project archive.
- [ ] Deployment records contain public transaction facts only.
- [ ] The demo defaults to synthetic data and clearly labels synthetic versus live evidence.

## Hackathon disclosure

- [ ] `docs/BUILD_DISCLOSURE.md` matches the actual repository history.
- [ ] `docs/AI_USAGE.md` matches the tools actually used.
- [ ] `THIRD_PARTY_NOTICES.md` and lockfiles are current.
- [ ] Track and bounty claims match features demonstrated live.
- [ ] No live-deployment or Mera claim appears before its evidence exists.

## External publication — owner action

- [ ] Repository name and description approved.
- [ ] Public GitHub repository created without generating conflicting starter files.
- [ ] Local default branch pushed.
- [ ] Repository visibility checked in a logged-out browser.
- [ ] Commit history, license, README, Actions, and release links are visible.
