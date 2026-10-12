$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host '== Shanhai controlled clean-room reproduction =='
node --version
if ($LASTEXITCODE -ne 0) { throw "node --version failed (exit $LASTEXITCODE)." }
npm --version
if ($LASTEXITCODE -ne 0) { throw "npm --version failed (exit $LASTEXITCODE)." }
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed (exit $LASTEXITCODE)." }
npm ci --prefix contracts
if ($LASTEXITCODE -ne 0) { throw "npm ci --prefix contracts failed (exit $LASTEXITCODE)." }
npm run audit:release
if ($LASTEXITCODE -ne 0) { throw "npm run audit:release failed (exit $LASTEXITCODE)." }
npm test
if ($LASTEXITCODE -ne 0) { throw "npm test failed (exit $LASTEXITCODE)." }
npm run test:process
if ($LASTEXITCODE -ne 0) { throw "npm run test:process failed (exit $LASTEXITCODE)." }
npm run compile:contract
if ($LASTEXITCODE -ne 0) { throw "npm run compile:contract failed (exit $LASTEXITCODE)." }
npm run build:pages
if ($LASTEXITCODE -ne 0) { throw "npm run build:pages failed (exit $LASTEXITCODE)." }
npm run audit:hosting
if ($LASTEXITCODE -ne 0) { throw "npm run audit:hosting failed (exit $LASTEXITCODE)." }
Write-Host 'REPRODUCTION PASS'
