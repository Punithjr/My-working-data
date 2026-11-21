# Security policy — BEO Bhadravathi E-Office

**Production security review is not complete. Do not enter or synchronize real office records into a publicly accessible instance of this repository.**

## Supported deployment status

| Environment | Status |
| --- | --- |
| Windows desktop installer | CI packaging has succeeded; clean-machine security and restore validation pending |
| Offline local office data | Development/testing only until caseworker authorization and recovery drills pass |
| Public website / cloud API | Not approved for real office data |
| Hybrid Cloud–Office sync | Not implemented; keep disabled |

## High-priority findings

1. Legacy backend routes need centralized, server-verified Case Worker authorization; frontend localStorage, headers and self-declared roles are not proof of identity.
2. Default passwords and non-cryptographic session markers must be removed before public deployment. Existing user records must be migrated safely, not deleted.
3. The repository historically tracks files under `data/` and `BEO_EOFFICE/` even though these paths are ignored for new untracked files. This is a potential records/privacy exposure. Confirm their sensitivity and preserve a protected offline copy before planning any git index/history cleanup.
4. The new CI commit guard prevents certain future office-data file changes; **it does not remove historical files** and is not a substitute for a full secret scan.
5. The local backup runner is append-only and does not transmit data. Run with the app closed. Set up scheduling and an independent restore test before relying on it.

## Handling a suspected exposure

- Do not paste employee details, database bytes, or credentials into public issues, logs, or chat.
- Restrict access to affected repository/environment while the owner determines scope and preserves secure copies.
- Rotate any exposed credentials and review Git history with a qualified maintainer before cleanup.
- Maintain integrity of the original OfficeData and the audit trail; do not perform destructive resets.

## Minimum release checks

All sensitive routes reject anonymous/non-caseworker calls, secure authentication succeeds for authorized users, safe backup and restore pass on clean Windows, offline drafts survive restarts, no office records leave the approved storage, and deployment is explicitly signed off.

See [Production Readiness](docs/PRODUCTION-READINESS.md) and GitHub issues #3–#8 for open work. Report vulnerabilities privately to the repository owner rather than opening a public issue containing sensitive evidence.
