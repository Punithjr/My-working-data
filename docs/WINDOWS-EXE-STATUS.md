# Windows .exe Desktop setup — implementation and safe rollout

## Source changes
- Electron shell: `desktop/main.cjs`, localhost-only local server, data root `app.getPath('userData')/OfficeData`.
- Server supports `BEO_DATA_ROOT`, `BEO_WEB_DIST`, `BEO_PORT` and `BEO_DESKTOP`.
- `server/sqliteStorage.ts` and `server/db.ts` use configurable local data root for selected databases and JSON stores.
- `desktop/backup.cjs` supports **manual** copy-and-hash backup and restore to an **empty** destination while the app is closed.
- Windows NSIS workflow `.github/workflows/windows-desktop.yml` builds an EXE artifact if checks pass.

## Critical limitations / work pending
- The installer has NOT been built or tested successfully yet. `better-sqlite3` native module compatibility, Electron Node child process and packaged dependency resolution require a real Windows CI run.
- `server.ts` still imports `vite` at top level and uses runtime dependencies that need packaging audit; production start may fail if dependencies are omitted.
- Existing `server.ts` uses `process.cwd()` in a few places; remaining data writes and all frontend Firebase/cloud integrations require review to guarantee **all** data is local.
- Loopback-only binding does NOT itself provide authenticated protection from other programs on the same PC. Audit all API endpoints and enforce caseworker authorization.
- Existing tracked office data in Git history have NOT been removed or deleted. Do not run destructive Git history rewrites without a verified secure backup.
- Old data must be migrated from previous `data/` and `BEO_EOFFICE/` directories into the new PC user-data folder using a copy-and-verify procedure. Do not move/delete originals before validation.
- Backup script is manual, not scheduled or encrypted. Do not run it while the application is open; do not keep confidential backup folders on shared unencrypted storage.
- Bundled PDFs, installer code signing, full offline validation, installation/uninstallation, printing, import/export, restore, and upgrade tests remain pending.

## Build workflow
GitHub > Actions > Windows desktop installer > Run workflow. A successful run publishes the setup executable as an Actions artifact (not automatically as a public release).

## No data deletion
No user office record has been intentionally deleted as part of this change.
