// Scheduled, local-only, append-only snapshot. Run ONLY while the desktop app is closed.
// Usage: node desktop/auto-backup.cjs <existing-backup-parent> <existing-office-data-root>
// No network transfer, deletion, restore, or rotation is performed.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function isWithin(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
}
async function ensureDesktopClosed() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', error => reject(new Error('Office desktop port not available; refusing live backup (' + error.code + ')')));
    probe.listen({ host: '127.0.0.1', port: 31947, exclusive: true }, () => {
      probe.close(error => error ? reject(error) : resolve());
    });
  });
}
async function main(argv) {
  if (argv.length !== 2) throw new Error('Usage: node desktop/auto-backup.cjs <existing-backup-parent> <existing-office-data-root>');
  const [parent, root] = argv.map(x => path.resolve(x));
  if (!path.isAbsolute(argv[0]) || !path.isAbsolute(argv[1])) throw new Error('Absolute folder paths required');
  if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) throw new Error('Backup parent must already exist');
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error('Office data folder must already exist');
  const parentReal = fs.realpathSync(parent), rootReal = fs.realpathSync(root);
  if (isWithin(parentReal, rootReal) || isWithin(rootReal, parentReal)) throw new Error('Backup and office data directories must be separate');
  await ensureDesktopClosed();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(parentReal, 'office-' + stamp + '-' + crypto.randomBytes(4).toString('hex'));
  const result = spawnSync(process.execPath, [path.join(__dirname, 'backup.cjs'), 'backup', destination, rootReal], { encoding:'utf8', windowsHide:true });
  if (result.error || result.status !== 0) throw new Error('Backup failed: ' + (result.error?.message || result.stderr || result.status));
  const manifest = JSON.parse(fs.readFileSync(path.join(destination, 'backup-manifest.json'), 'utf8'));
  if (!Array.isArray(manifest.files)) throw new Error('Backup verification manifest invalid');
  console.log('Verified local backup:', destination, 'files:', manifest.files.length);
}
if (require.main === module) main(process.argv.slice(2)).catch(err => { console.error(err.message); process.exitCode = 1; });
module.exports = { main, isWithin };
