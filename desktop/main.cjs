const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const http = require('node:http');
let child; let window;
const PORT = 31947;
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }
app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
const root = () => path.join(app.getPath('userData'), 'OfficeData');
function ping() { return new Promise(resolve => { const req=http.get('http://127.0.0.1:'+PORT+'/',res=>{res.resume();resolve(res.statusCode<500)});req.on('error',()=>resolve(false));req.setTimeout(1000,()=>{req.destroy();resolve(false)}); }); }
async function start() {
 const dataRoot=root();fs.mkdirSync(dataRoot,{recursive:true});
 const server=path.join(process.resourcesPath,'backend','server.cjs');
 if(!fs.existsSync(server)){dialog.showErrorBox('BEO E-Office','Installer backend is missing. Existing office records are unchanged.');app.quit();return;}
 const dist=path.join(process.resourcesPath,'web');
 // The installed Electron executable is used as the Node runtime. A missing or
 // quarantined executable must be handled as a launch failure, not an uncaught
 // main-process exception (spawn emits an asynchronous 'error' event).
 const executable=process.execPath;
 if(!fs.existsSync(executable)){
  dialog.showErrorBox('BEO E-Office', 'Application executable is missing: '+executable+'\\nRepair or reinstall the desktop application. Office records are unchanged.');
  app.quit();return;
 }
 let launchError=null;
 try {
  child=spawn(executable,[server],{cwd:app.getAppPath(),windowsHide:true,env:{...process.env,ELECTRON_RUN_AS_NODE:'1',NODE_ENV:'production',BEO_DESKTOP:'1',BEO_DATA_ROOT:dataRoot,BEO_WEB_DIST:dist,BEO_PORT:String(PORT),NODE_PATH:path.join(app.getAppPath(),'node_modules')}});
 } catch(error) { launchError=error; }
 if(launchError){dialog.showErrorBox('BEO E-Office','Unable to launch local server: '+launchError.message+'\\nOffice records are unchanged.');app.quit();return;}
 child.on('error',(error)=>{
  launchError=error;
  dialog.showErrorBox('BEO E-Office','Unable to launch local server ('+error.code+'): '+error.message+'\\nRepair or reinstall the desktop application. Office records are unchanged.');
  app.quit();
 });
 child.on('exit',(code)=>{if(code!==0&&window&&!window.isDestroyed())dialog.showErrorBox('BEO E-Office','Local server stopped unexpectedly. Check application logs.');});
 let ready=false;for(let i=0;i<60;i++){if(launchError)break;if(await ping()){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 if(launchError)return;
 if(!ready){dialog.showErrorBox('BEO E-Office','Local server could not start. No office records were deleted.');app.quit();return;}
 window=new BrowserWindow({width:1200,height:800,minWidth:800,minHeight:600,show:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.once('ready-to-show',()=>window.show());
 window.loadURL('http://127.0.0.1:'+PORT);
 window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('http://127.0.0.1:'+PORT+'/'))event.preventDefault();});
 window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))require('electron').shell.openExternal(url);return {action:'deny'};});
}
app.whenReady().then(start);
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{if(child&&!child.killed)child.kill();});
