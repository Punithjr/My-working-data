# PENSION-STATE only pension module

- Show only PENSION-STATE, not PENSION-UGC. Do not expose MASTER FILE as a separate pension option.
- Match the supplied PENSION-STATE Excel calculation formulas and validate results against the workbook before deployment.
- Allow caseworker edits to employee, service, pay, DA, leave, and pension inputs, with recalculation.
- Allow explicit manual corrections with reason and history; preserve the original computed values.
- Save and reopen revisions, print and export updated proposals, and preserve existing employee and case records.
- Require employee-by-employee confirmation when importing multi-employee Excel files. Never commit private case data into source control.
- Keep caseworker-only access and do not add an approval workflow.

This document records requirements only; implementation and tests are pending.
