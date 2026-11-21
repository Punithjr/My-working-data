const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.join(os.tmpdir(),'beo-desktop-check-'+process.pid);
test('migration preserves originals; backup and restore preserve contents',()=>{
 const old=path.join(root,'old'),dest=path.join(root,'new'),backup=path.join(root,'backup'),restored=path.join(root,'restored');
 try{
  fs.mkdirSync(path.join(old,'data'),{recursive:true});fs.mkdirSync(path.join(old,'BEO_EOFFICE','Files'),{recursive:true});
  fs.writeFileSync(path.join(old,'data','employees_store.json'),'{"test":"synthetic"}');
  fs.writeFileSync(path.join(old,'BEO_EOFFICE','Files','letter.txt'),'ನಮಸ್ಕಾರ');
  const run=(file,args)=>{const r=spawnSync(process.execPath,[path.join(__dirname,file),...args],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);};
  run('migrate.cjs',[old,dest]);
  assert.equal(fs.readFileSync(path.join(old,'data','employees_store.json'),'utf8'),'{"test":"synthetic"}');
  run('backup.cjs',['backup',backup,dest]);run('backup.cjs',['restore',backup,restored]);
  assert.equal(fs.readFileSync(path.join(restored,'BEO_EOFFICE','Files','letter.txt'),'utf8'),'ನಮಸ್ಕಾರ');
  const again=spawnSync(process.execPath,[path.join(__dirname,'migrate.cjs'),old,dest],{encoding:'utf8'});
  assert.notEqual(again.status,0,'second migration must refuse overwrites');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});


test('scheduled backup creates an independent verified snapshot without modifying office data',()=>{
 const source=path.join(root,'schedule-src'),backups=path.join(root,'schedule-backups'),restored=path.join(root,'schedule-restored');
 try{
  fs.mkdirSync(source,{recursive:true});fs.mkdirSync(backups,{recursive:true});
  fs.writeFileSync(path.join(source,'employee-synthetic.txt'),'TEST ONLY');
  const r=spawnSync(process.execPath,[path.join(__dirname,'auto-backup.cjs'),backups,source],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const entries=fs.readdirSync(backups);
  assert.equal(entries.length,1,'one snapshot per run; no overwrite');
  const target=path.join(backups,entries[0]);
  assert.ok(fs.existsSync(path.join(target,'backup-manifest.json')));
  const restore=spawnSync(process.execPath,[path.join(__dirname,'backup.cjs'),'restore',target,restored],{encoding:'utf8'});
  assert.equal(restore.status,0,restore.stderr);
  assert.equal(fs.readFileSync(path.join(restored,'employee-synthetic.txt'),'utf8'),'TEST ONLY');
  assert.equal(fs.readFileSync(path.join(source,'employee-synthetic.txt'),'utf8'),'TEST ONLY');
  const invalid=spawnSync(process.execPath,[path.join(__dirname,'auto-backup.cjs'),source,path.join(source,'inside')],{encoding:'utf8'});
  assert.notEqual(invalid.status,0,'missing or nested source must be rejected');
 }finally{fs.rmSync(source,{recursive:true,force:true});fs.rmSync(backups,{recursive:true,force:true});fs.rmSync(restored,{recursive:true,force:true});}
});
