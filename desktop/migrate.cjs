// Copy-only migration. Run when BOTH old web app and new desktop app are CLOSED.
// Usage: node desktop/migrate.cjs <old-project-root> <new-OfficeData-root>
// Refuses overwrites, verifies SHA256 and NEVER deletes the source.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [oldArg,newArg]=process.argv.slice(2);
if(!oldArg||!newArg)throw Error('Usage: node desktop/migrate.cjs <old-project-root> <new-OfficeData-root>');
const oldRoot=path.resolve(oldArg),newRoot=path.resolve(newArg);
if(oldRoot===newRoot||newRoot.startsWith(oldRoot+path.sep)||oldRoot.startsWith(newRoot+path.sep))throw Error('Source and destination cannot overlap');
const dirs=['data','BEO_EOFFICE'];
function walk(dir,relative=''){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.isSymbolicLink())throw Error('Symlink not supported: '+e.name);const rel=path.join(relative,e.name);return e.isDirectory()?walk(path.join(dir,e.name),rel):e.isFile()?[rel]:[];});}
function hash(file){const h=crypto.createHash('sha256');h.update(fs.readFileSync(file));return h.digest('hex');}
const tasks=dirs.flatMap(dir=>walk(path.join(oldRoot,dir)).map(rel=>({from:path.join(oldRoot,dir,rel),to:path.join(newRoot,dir,rel)})));
if(!tasks.length)throw Error('No office records found; source unchanged');
for(const {to} of tasks){if(fs.existsSync(to))throw Error('Destination contains an existing file; refusing overwrite: '+to);}
let count=0;
for(const {from,to} of tasks){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);if(hash(from)!==hash(to))throw Error('Checksum mismatch: '+to);count++;}
console.log('Copied and SHA256-verified',count,'files. Original files remain untouched. Review destination before using the desktop app.');
