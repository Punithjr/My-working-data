# Production readiness and pending implementation — BEO Bhadravathi E-Office

Updated: 2026-11-21. **Not production approved.** Office records must remain under the control of the BEO office. Do not upload real employee records, case files, backups or SQLite databases to GitHub or cloud storage.

## Verified CI baseline
- Windows desktop installer build #34 on commit `57dae215`: GitHub Actions SUCCESS.
- Vite app build #58 on the same commit: GitHub Actions SUCCESS.
- Later commits require fresh CI verification; successful builds are not security certification or installation tests.

## Implementation status
| Item | Current state | Release gate |
| --- | --- | --- |
| Local SQLite + Windows package | Implemented, CI built | Installer start, SQLite read/write and print tests on clean Windows |
| Caseworker-only backend security | **NOT COMPLETE** | Every `/api` data route validates server-side verified identity and active caseworker status; remove default passwords and fabricated session tokens |
| Local backup | **PARTIAL** | Append-only `desktop/auto-backup.cjs` runner with manifest; schedule, protected off-device destination, WAL-safe closed-app confirmation and restore drill pending |
| Offline editing | **PARTIAL** | IndexedDB docket-action queue exists; full letter editing, conflict resolution, and restart recovery not tested |
| Cloud–office secure sync | **DISABLED / NOT IMPLEMENTED** | Auth, encryption, consent, audit, test-only sync and sign-off before real documents |
| Production deployment | **BLOCKED** | All prior gates green, credentials hardened, tracked-data exposure remediated |

## Security findings — do not ignore
- `server.ts` currently contains legacy static/default passwords and a token format that is not cryptographically verified. Client-side sessions and user-provided role headers are not trusted authorization.
- Multiple APIs for users, letters, employees, dockets and deletion/reset require central caseworker enforcement and negative tests.
- The repository tree contains tracked files under `data/` and `BEO_EOFFICE/`, **despite .gitignore rules**. Treat these as potentially sensitive. The CI guard only prevents **future commits that change** such files; it cannot erase Git history. Confirm a separate protected copy, then plan owner-approved Git index and history cleanup with credential rotation if warranted.
- `hybrid/office-bridge.cjs` exposes a local loopback health check only. It has no cloud data transfer or real synchronization.

## Safe local backup operation
1. Close the desktop app fully, including any backend processes. Pick an existing backup parent directory **outside** the OfficeData directory, ideally on separate encrypted storage.
2. With Node installed, run:
   `node desktop/auto-backup.cjs "D:\\OfficeBackups" "C:\\Users\\<USER>\\AppData\\Roaming\\beo-bhadravathi-eoffice\\OfficeData"`
3. The tool refuses missing/nested folders and a busy desktop port. It creates a **new** timestamped backup without overwriting previous snapshots, using the existing manifest-and-checksum backup helper. It **does not schedule itself**.
4. Restore **only into an empty test directory**, with the desktop app closed:
   `node desktop/backup.cjs restore "D:\\OfficeBackups\\office-<timestamp>" "D:\\RestoreTest"`
5. Test document files and a SQLite open/read using synthetic data before trusting disaster recovery. No automatic pruning or cloud uploads are performed.

**Note:** Port check is only a precaution. Other SQLite writers might exist. Only run snapshots while all office database writers are stopped. SQLite WAL must be handled safely; never blindly copy an open SQLite database.

## Open GitHub tickets
- #1 Secure source-only commit/upload automation
- #2 PR merge automation with CI and approval
- #3 Central caseworker-only backend identity and permissions
- #4 Audit/remove exposed historical office data, without touching original offline data
- #5 Scheduled backup and restore drill
- #6 Full offline letters/editing/replay reliability
- #7 Secure cloud sync design (default disabled)
- #8 Production sign-off and rollout

## Release criteria
All sensitive APIs must reject anonymous and non-caseworker requests, no default credentials, no unapproved cloud transmission, signed-off backup/restore on separate storage, offline edit/print tests, a reproducible Windows installer smoke test, documented rollback and an owner-approved deployment checklist.
