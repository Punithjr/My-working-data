'use strict';
// Local-only status bridge. No office records or database files are served.
// Intentionally no cloud connection or automatic synchronization.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { timingSafeEqual } = require('node:crypto');
const host = '127.0.0.1';
const port = Number(process.env.BEO_BRIDGE_PORT || 31948);
const token = process.env.BEO_BRIDGE_TOKEN || '';
const root = process.env.BEO_DATA_ROOT;
if (!root || !path.isAbsolute(root)) throw Error('BEO_DATA_ROOT must be an absolute existing office data directory');
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw Error('Office data directory missing; refusing to create or replace data');
if (token.length < 32) throw Error('BEO_BRIDGE_TOKEN must contain at least 32 characters');
function valid(provided) {
  const a=Buffer.from(provided || ''),b=Buffer.from(token);
  return a.length===b.length && timingSafeEqual(a,b);
}
const server=http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (!valid((req.headers.authorization || '').replace(/^Bearer /i,''))) {
    res.writeHead(401,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Unauthorized'}));
  }
  if (req.method!=='GET' || req.url!=='/health') {
    res.writeHead(404);return res.end();
  }
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true,mode:'office-local',storageConfigured:true,syncEnabled:false}));
});
if(require.main===module) server.listen(port,host,()=>console.log('Office bridge listening on loopback only:',port));
module.exports={server,valid};
