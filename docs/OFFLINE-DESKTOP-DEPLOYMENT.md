# Offline-first desktop deployment — BEO Bhadravathi

## Requirement
GitHub stores application source code, non-sensitive configuration templates and build workflows only. Real office data must remain on the user's PC after installation. The app must operate offline for normal caseworker tasks.

## Recommended implementation
- Package the existing React + Express + SQLite application as a Windows desktop installer (Electron or Tauri with a carefully designed local backend). No installer is currently confirmed built.
- Move mutable paths from `process.cwd()/data` and `process.cwd()/BEO_EOFFICE` to the OS user-data folder (e.g. `%LOCALAPPDATA%/BEO-Bhadravathi-EOffice/`), **outside** the installation directory and source checkout. Never put live records in `public`, `dist`, or a Git repository.
- Store SQLite databases and their WAL/SHM sidecars, office letters, scans, pension cases, imported employee/school spreadsheets, circular PDFs and audit logs under the local data root. Restrict access by OS permissions and use application-level access controls.
- Disable remote Firebase/API dependencies for offline-critical operations, or explicitly implement a local authentication/data layer. No real data should sync to GitHub or cloud services.
- Provide a local document library and import workflow; only legally redistributable official PDF content may be bundled in the installer.
- Backup both databases and attachments together using a consistent SQLite backup/snapshot, versioned manifests, integrity checks, and restore verification; support USB/external drive backup. Protect backups.
- Updates must preserve the local data folder; test migration and rollback on a copy before production use.
- For Windows deployment, test install/uninstall, first run, airplane-mode operation, login, print/PDF, edit/save, pension calculations, local file access, backup/restore, and upgrade without data loss.

## Security warning
Prior repository inspection showed tracked files under `data/` and `BEO_EOFFICE/`. Adding these paths to `.gitignore` **does not untrack existing files or remove them from Git history**. Do not delete local copies. First make and verify a protected backup; then remove tracked copies from the Git index, review repository access, and consider history rewriting and credential rotation if any confidential data was exposed.

## Status
- [x] `.gitignore` updated to block accidental *new* commits of local data.
- [ ] Audit and safely untrack already committed records; assess repository history exposure.
- [ ] Implement user-data path migration and local-only runtime.
- [ ] Package Windows installer.
- [ ] Test offline workflow and local-only data storage.
- [ ] Test backup/restore and upgrade.
- [ ] Publish installer and Kannada user guide.

This document is a deployment plan, not a claim that the desktop software is complete.
