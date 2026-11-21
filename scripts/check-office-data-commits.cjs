'use strict';
// CI guard: refuse newly changed office records. Existing tracked historical
// files require a separate owner-approved remediation; never delete data here.
const { execFileSync } = require('node:child_process');
function forbidden(file) {
  const f = String(file).replace(/\\/g, '/');
  return /^(?:data|BEO_EOFFICE|OfficeData|backups)(?:\/|$)/i.test(f)
    || /(?:^|\/)OfficeData(?:\/|$)/i.test(f)
    || /(?:^|\/)\.env(?:\.|$)/i.test(f) && !/(?:^|\/)\.env\.example$/.test(f)
    || /\.(?:sqlite(?:-(?:wal|shm))?|db(?:-(?:wal|shm))?|bak|backup|p12|pfx|pem)$/i.test(f);
}
function changedFiles() {
  const text = execFileSync('git', ['show', '--first-parent', '--pretty=format:', '--name-only', 'HEAD'], {encoding:'utf8'});
  return text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
}
if (require.main === module) {
  const bad = changedFiles().filter(forbidden);
  if (bad.length) {
    console.error('Refusing source build: this commit modifies office data, backups or secrets. Remove those changes from the commit. Paths:', bad.join(', '));
    process.exitCode = 1;
  } else console.log('Changed-file office data policy: PASS');
}
module.exports = { forbidden, changedFiles };
