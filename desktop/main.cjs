const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const http = require('node:http');
let child; let window;
const PORT = 31947;
const root = () => path.join(app.getPath('userData'), 'OfficeData');
function ping() { return new Promise(resolve => { const req=http.get('http://127.0.0.1:'+PORT+'/',res=>{res.resume();resolve(res.statusCode<500)});req.on('error',()=>resolve(false));req.setTimeout(1000,()=>{req.destroy();resolve(false)}); }); }
async function start() {
 const dataRoot=root();fs.mkdirSync(dataRoot,{recursive:true});
 const server=path.join(process.resourcesPath,'backend','server.cjs');
 const dist=path.join(process.resourcesPath,'web');
 child=spawn(process.execPath,[server],{cwd:app.getAppPath(),windowsHide:true,env:{...process.env,ELECTRON_RUN_AS_NODE:'1',NODE_ENV:'production',BEO_DESKTOP:'1',BEO_DATA_ROOT:dataRoot,BEO_WEB_DIST:dist,BEO_PORT:String(PORT)}});
 child.on('exit',(code)=>{if(code!==0&&window&&!window.isDestroyed())dialog.showErrorBox('BEO E-Office','Local server stopped unexpectedly. Check application logs.');});
 let ready=false;for(let i=0;i<60;i++){if(await ping()){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 if(!ready){dialog.showErrorBox('BEO E-Office','Local server could not start. No office records were deleted.');app.quit();return;}
 window=new BrowserWindow({width:1350,height:900,minWidth:950,minHeight:650,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.loadURL('http://127.0.0.1:'+PORT);
 window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))require('electron').shell.openExternal(url);return {action:'deny'};});
}
app.whenReady().then(start);
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{if(child&&!child.killed)child.kill();});
