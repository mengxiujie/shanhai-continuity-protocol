#!/usr/bin/env bash
set -euo pipefail

echo '== Shanhai controlled clean-room reproduction =='
node --version
npm --version
npm ci
npm ci --prefix contracts
npm run audit:release
npm test
npm run test:process
npm run compile:contract
npm run build:pages
npm run audit:hosting
echo 'REPRODUCTION PASS'
