'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'beo-bridge-test-'));
process.env.BEO_DATA_ROOT=root;
process.env.BEO_BRIDGE_TOKEN='test-token-with-at-least-32-characters-1234';
const {server}=require('./office-bridge.cjs');
test('bridge requires bearer token and does not expose office data',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  const noAuth=await fetch(base+'/health');
  assert.equal(noAuth.status,401);
  const headers={Authorization:'Bearer '+process.env.BEO_BRIDGE_TOKEN};
  const health=await fetch(base+'/health',{headers});
  assert.equal(health.status,200);
  const body=await health.json();
  assert.equal(body.syncEnabled,false);
  const data=await fetch(base+'/data/beo_eoffice.sqlite',{headers});
  assert.equal(data.status,404);
  const write=await fetch(base+'/health',{method:'POST',headers});
  assert.equal(write.status,404);
 }finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true})}
});
