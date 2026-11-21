# Online website + offline support deployment plan

## Current implementation status
- React/Vite PWA builds an installable app shell. PWA caching is **not** offline persistence for office records.
- Express backend and better-sqlite3 require a persistent Node hosting environment. Static-only GitHub Pages hosting cannot run this backend.
- No public production deployment or offline record synchronization has been verified.
- Do not publish real office records or employee details to a test deployment.

## Deployment architecture
1. Host the Vite-built frontend and Express API under the **same HTTPS origin** (reverse proxy), e.g. https://office.example.gov.in and https://office.example.gov.in/api. The hostname is illustrative, not a deployed URL.
2. Run `npm run lint`, `npm run build`, then `npm start` in a persistent Node runtime. Configure the proxy to serve `dist/` static files and forward API routes to Express. Confirm exact server routes before production rollout.
3. Store SQLite DB, attachments and backups on a **persistent mounted volume**, outside build/release directories. Never rely on ephemeral container filesystem. Confirm the app's actual storage environment variables before setting them.
4. Protect all data APIs with server-validated caseworker authentication and authorization, HTTPS, access logging, request limits and CSRF protections as appropriate. Frontend login alone is not sufficient. Do not expose SQLite or backup files as public static assets.
5. Configure automated encrypted backups, restore drills, retention and access controls. Migrate existing office data only after verified backups.
6. Set up domain, HTTPS certificates, secrets in the host's secret manager, monitoring and a staged deployment before production.

## Offline support stages
- Stage A (implemented partially): PWA assets can be cached; browser may open the application shell without network after first online visit. API requests must not receive cached HTML fallback.
- Stage B (NOT implemented): IndexedDB-based local queue for letter/file edits, attachment handling, draft exports, offline caseworker session policy, visible unsynced count.
- Stage C (NOT implemented): authenticated idempotent sync endpoint, per-record revisions, conflict resolution, audit trail, retries, server validation, and tests. Do not silently overwrite newer server data.
- Stage D (NOT implemented): backup/restore, multi-device consistency and offline-to-online recovery testing.

## Required acceptance tests
1. Online caseworker login, create docket, create/edit letter, print/export, sign out.
2. Disconnect network, reload PWA, confirm shell opens; verify records are **not** falsely reported saved/synced.
3. Reconnect, verify authorized operations and no duplicated records.
4. Two-device simultaneous edits: reject or resolve conflicts, never silent last-write-wins.
5. Backup/restore test with synthetic records; verify no real office data is lost.
6. Verify server-side access checks on every sensitive API endpoint and no public exposure of data.

## Important limitations
- A service worker cannot run SQLite server APIs offline in the browser.
- Offline drafts require explicit IndexedDB and sync implementation; until then, do not promise offline editing.
- Keep Windows desktop offline mode as a separate local-first option until web offline sync is fully tested.
