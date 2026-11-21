// Backup/restore helper: run while the desktop application is CLOSED.
// Example: node desktop/backup.cjs backup "C:\\Backups\\office-backup" "C:\\Users\\USER\\AppData\\Roaming\\beo-bhadravathi-eoffice\\OfficeData"
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [mode,target,source]=process.argv.slice(2);
if(!['backup','restore'].includes(mode)||!target||!source)throw Error('Usage: node desktop/backup.cjs backup <destination> <officeDataRoot> | restore <backup> <officeDataRoot>');
const resolvedTarget=path.resolve(target),resolvedSource=path.resolve(source);
if(resolvedTarget===resolvedSource||resolvedTarget.startsWith(resolvedSource+path.sep)||resolvedSource.startsWith(resolvedTarget+path.sep))throw Error('Backup and data folders must not be nested');
function files(dir,prefix=''){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const rel=path.join(prefix,e.name);return e.isDirectory()?files(path.join(dir,e.name),rel):e.isFile()?[rel]:[]});}
function digest(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
if(mode==='backup'){
 if(!fs.existsSync(resolvedSource))throw Error('Source data folder does not exist');
 if(fs.existsSync(resolvedTarget))throw Error('Backup destination already exists; choose a new folder');
 const tmp=resolvedTarget+'.partial-'+process.pid;fs.mkdirSync(tmp,{recursive:true});
 try{const records=files(resolvedSource).map(rel=>{const from=path.join(resolvedSource,rel),to=path.join(tmp,rel);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);return {path:rel,sha256:digest(to)};});
 fs.writeFileSync(path.join(tmp,'backup-manifest.json'),JSON.stringify({version:1,createdAt:new Date().toISOString(),files:records},null,2));fs.renameSync(tmp,resolvedTarget);console.log('Backup created and verified manifest:',resolvedTarget);
 }catch(e){fs.rmSync(tmp,{recursive:true,force:true});throw e;}
}else{
 if(fs.existsSync(resolvedSource)&&files(resolvedSource).length)throw Error('Restore destination is not empty; existing office records preserved');
 const manifest=JSON.parse(fs.readFileSync(path.join(resolvedTarget,'backup-manifest.json'),'utf8'));
 for(const item of manifest.files){const f=path.resolve(resolvedTarget,item.path);if(!f.startsWith(resolvedTarget+path.sep)||digest(f)!==item.sha256)throw Error('Invalid or modified backup: '+item.path);}
 fs.mkdirSync(resolvedSource,{recursive:true});
 for(const item of manifest.files){const dest=path.join(resolvedSource,item.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(resolvedTarget,item.path),dest);}
 console.log('Restore completed:',resolvedSource);
}
