# PENSION-STATE — Audit and Pending Implementation Checklist

Repository: `Punithjr/My-working-data`. Scope: caseworker-only pension preparation for BEO Bhadravathi.

## Confirmed in current source (2026-11-21)
- `src/components/PensionStudioView.tsx` contains an existing case-edit handler (`handleEditCase`) and save handler (`handleSavePensionCase`).
- The pension UI still exposes a 65-year retirement-age selection alongside 60-year selection; the requested STATE-only scope is not fully enforced.
- `src/utils/pensionCalculator.ts` contains an existing generic pension calculation engine; exact parity with the supplied `PENSION-STATE` worksheet has **not** been established.
- `src/components/PensionStudioView.tsx` references browser localStorage and pension-related API requests. Persistence and authorization need integration testing.
- This document is the only confirmed completed scope update. No pension calculation/UI implementation is claimed by this audit.

## P0 — required before release
- [ ] Implement **PENSION-STATE only** in the UI and calculation selection; do not offer PENSION-UGC or a standalone MASTER FILE mode.
- [ ] Map every relevant input, intermediate formula, rounding rule, output, and lookup dependency from the supplied `PENSION Calculation (1).xlsm` `PENSION-STATE` worksheet. Use MASTER FILE reference data internally only if needed.
- [ ] Compare actual results with original Excel reference cases, including retirement/service dates, VRS weightage, pension, DCRG, commutation, family pension, and EL encashment. Resolve mismatches before deployment.
- [ ] Ensure edit/save/reopen/recalculate works for existing and new pension cases, without losing prior case records.
- [ ] Keep caseworker-only authorization on both frontend and server routes. Do not introduce verification/approval steps.

## P1 — workflow completion
- [ ] Add authenticated Excel import with preview, field validation, and per-employee confirmation. The `C_M_Sulochana_unlocked.xlsx` workbook contains multiple employee-related sheets; do not map every sheet to one employee by filename.
- [ ] Add clearly labelled manual correction fields with original value, revised value, reason, date/time and actor history. Do not silently replace formula output.
- [ ] Add revision history and restore/compare capability, using existing secure case storage rather than source-controlled personal data.
- [ ] Verify printed forms and downloadable PDF/Word output reflect the **saved edited revision** and retain source form layout.
- [ ] Verify EL yearwise ledger, service data, bank/treasury details, and supporting forms as applicable to PENSION-STATE.

## P2 — quality and deployment
- [ ] Remove misleading demo approvals and fabricated verification statuses from caseworker-facing workflows without deleting existing user data.
- [ ] Test offline edits, conflict handling, online sync, backup/restore and login continuity.
- [ ] Run TypeScript lint, production build, formula parity tests, edit/import/export tests, and access-control tests.
- [ ] Document migration and rollout; do not publish real employee KGID, addresses, account numbers or pension case details in GitHub.

## Evidence / limits
This is a source-code and requirements audit, **not** a completed end-to-end application test. The uploaded Excel files have not been committed to GitHub. Checklist items remain pending until code changes and tests are independently verified.
