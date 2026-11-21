'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {forbidden}=require('./check-office-data-commits.cjs');
test('blocks office data and secret files but allows sample configuration',()=>{
 for(const value of ['data/letters_store.json','BEO_EOFFICE/Files/letter.txt','OfficeData/archive.txt','backups/snapshot.zip','data/beo_eoffice.sqlite-wal','test.db','keys/service.pem','.env','.env.production','desktop\\OfficeData\\private.txt']) {
  assert.equal(forbidden(value),true,'must reject '+value);
 }
 for(const value of ['.env.example','src/App.tsx','desktop/backup.cjs','server/sqliteStorage.ts','docs/PRODUCTION-READINESS.md']){
  assert.equal(forbidden(value),false,'must allow '+value);
 }
});