$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host '== Shanhai controlled clean-room reproduction =='
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
Write-Host 'REPRODUCTION PASS'
