# Controlled clean-room reproduction report

> Date: 2026-09-22  
> Reproduced code commit: `8e9f882`  
> Evidence class: controlled clean environment, same operator  
> External deployment: not performed

## Method

The source was exported with `git archive` from commit `8e9f882` and expanded into a newly created temporary directory. Before execution, the directory was checked to contain neither `node_modules` nor `dist`. The repository's `scripts/reproduce.ps1` then ran the entire sequence without copying dependencies or build output from the working repository.

Source archive SHA-256:

```text
F7621235595F36B0529C6422504996B574D94837C79F20CB1364C79949034511
```

Environment:

```text
Node.js v25.2.1
npm 11.6.2
Windows / PowerShell
```

## Results

| Gate | Result |
|---|---|
| Root dependency install | PASS; 0 vulnerabilities reported |
| Contract dependency install | PASS; 9 packages installed |
| Release scan | PASS; 92 text files; 0 findings |
| SCP conformance | PASS 9/9 |
| Runtime / encrypted envelope | PASS 13/13 |
| Monad deterministic gate | PASS 5/5 |
| Independent Agent B process | PASS; separate process; denied request added 0 model calls |
| Solidity compile | PASS; solc 0.8.30; 2554-byte deployment bytecode |
| Static Pages build | PASS |
| Hosted artifact audit | PASS; 16 files; 0 findings |

## Browser verification

- Root landing redirected to the four-act demo.
- Guided flow ended at `REVOKED` with `0 envelope / 0 decrypt / 0 model calls`.
- Live evidence panel opened with `NOT YET EVIDENCE` and no fabricated live status.
- Desktop browser console contained no warning or error.
- At a 390×844 viewport, the primary action remained visible and all four metric cards were present.
- Temporary viewport was reset after the check.

## Preserved defect and retest

The first hosted build requested `/favicon.ico` from the root redirect and produced an irrelevant 404 in the server log. Commit `8e9f882` added an inline favicon to the generated landing page. A second clean archive and full reproduction passed. The final server log contained only successful requests for `/`, the demo page, CSS, JavaScript, and the gate module.

## Interpretation boundary

This is not an independent human blind test because the same operator prepared and reproduced the package. It proves that the committed build can be reconstructed without the original dependency/build directories. It does not prove public GitHub availability, GitHub Actions execution, external hosting, live Monad receipts, Mera ceremony, security audit, or production readiness.
