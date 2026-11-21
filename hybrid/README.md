# Hybrid cloud website + office local database (safe foundation)

**Status:** This is a local-only bridge scaffold, **not** an internet-accessible office database or completed sync system.

## Security architecture
- Cloud website serves the UI over HTTPS; do **not** host the office SQLite database, backups, credentials or employee records in the public frontend.
- Office computer keeps SQLite and attachments in an existing persistent `BEO_DATA_ROOT`.
- The bridge listens only on `127.0.0.1:31948`, requires a long bearer token, and currently exposes only `GET /health`. No record read/write endpoints exist.
- Do **not** port-forward the bridge, publish it through a tunnel, or copy its token into frontend JavaScript. Browser clients cannot securely keep a shared bridge secret.
- A future authenticated outbound office agent should initiate a mutually authenticated, audited connection to a cloud gateway. Cloud access to office records is **not yet implemented**.
- Existing Firebase/frontend login is not sufficient proof of server-side caseworker-only access. Audit and enforce authorization on every API before enabling cloud data operations.

## Setup (local office PC, Node 22+)
1. Close the desktop app before backups or migrations. Back up OfficeData using the existing desktop backup procedure.
2. Set `BEO_DATA_ROOT` to the **existing absolute office data directory** (not a new empty folder).
3. Set `BEO_BRIDGE_TOKEN` to a random secret of 32+ characters; keep it in the OS secret store, never Git.
4. Run `node --test hybrid/office-bridge.test.cjs` (uses temporary synthetic data).
5. Run `node hybrid/office-bridge.cjs`. Only local authenticated health checks are available.

## Before cloud deployment
- Verify caseworker-only authorization at the Express backend and Firebase security rules.
- Design outbound office agent and authenticated cloud relay with per-record revision, idempotency, conflict handling and audit logs.
- Implement encrypted offline draft storage (IndexedDB) and explicit unsynced indicators. PWA app-shell caching is not database sync.
- Verify backup/restore and offline reconnect using synthetic data, including two-device conflicts.
- Obtain approved hosting, domain, HTTPS and data governance review before uploading office records.
