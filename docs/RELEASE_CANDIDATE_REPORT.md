# Release candidate report

> Historical checkpoint: this report records the 2026-09-22 pre-deployment state. Current evidence is maintained in `EVIDENCE.md` and `STATUS.md`.

> Candidate assembled: 2026-09-22  
> External publication: not performed  
> Live Monad deployment: not performed

## Repository extraction

The candidate was extracted from the internal engineering package instead of publishing that directory wholesale. Dependency directories, internal archives, raw portal material, private screenshots, and machine-specific project files were excluded.

## Verification results

| Gate | Result |
|---|---|
| Root clean install | PASS; 0 vulnerabilities reported |
| Contract clean install | PASS; 10 packages; 0 vulnerabilities reported |
| Release audit | PASS; 80 text files scanned; 0 findings |
| SCP conformance vectors | PASS 9/9 |
| Runtime / encrypted-envelope tests | PASS 13/13 |
| Monad deterministic gate tests | PASS 5/5 |
| Independent Agent B process | PASS outside the restricted sandbox |
| Solidity compilation | PASS; solc 0.8.30; bytecode 2554 bytes |

Compiled artifact SHA-256:

```text
73EA412EAB9270BF89DF9F1C59EADC30107EAEF3971E1D768C2B9DCADE5A9CB5
```

## Preserved failure evidence

The first independent-process test inside the restricted execution sandbox failed with `spawn EPERM`. The identical command passed when child-process execution was allowed. This is recorded as an environment restriction, not erased or rewritten as an initial pass.

## Evidence boundary

This report proves that the extracted candidate installs, scans, tests, and compiles locally. It does not prove a public GitHub push, live Monad deployment, real receipt triplet, Mera ceremony, external reproducibility, security audit, or production readiness.
