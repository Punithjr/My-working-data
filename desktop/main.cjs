const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
let child; let window;
const PORT = 31947;
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }
app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
const root = () => path.join(app.getPath('userData'), 'OfficeData');
function ping() { return new Promise(resolve => { const req=http.get('http://127.0.0.1:'+PORT+'/',res=>{res.resume();resolve(res.statusCode<500)});req.on('error',()=>resolve(false));req.setTimeout(1000,()=>{req.destroy();resolve(false)}); }); }
function checkPort(port) {
 return new Promise(resolve => {
  const probe=net.createServer();
  probe.once('error',error=>resolve(error.code || 'PORT_ERROR'));
  probe.listen({host:'127.0.0.1',port,exclusive:true},()=>probe.close(()=>resolve(null)));
 });
}
function classifyBackendError(output) {
 if (/better_sqlite3\.node|better-sqlite3|ERR_DLOPEN_FAILED|NODE_MODULE_VERSION|invalid ELF header|not a valid Win32 application/i.test(output)) return 'SQLITE_NATIVE_MODULE';
 if (/EADDRINUSE|address already in use/i.test(output)) return 'PORT_IN_USE';
 if (/MODULE_NOT_FOUND|Cannot find module|ERR_MODULE_NOT_FOUND/i.test(output)) return 'BACKEND_DEPENDENCY_MISSING';
 if (/SQLITE_CANTOPEN|SQLITE_READONLY|SQLITE_CORRUPT/i.test(output)) return 'SQLITE_STORAGE_ERROR';
 return 'BACKEND_STARTUP_UNKNOWN';
}
async function start() {
 const dataRoot=root();fs.mkdirSync(dataRoot,{recursive:true});
 const logFile=path.join(dataRoot,'desktop-startup.log');
 const log=(message)=>{try{fs.appendFileSync(logFile,new Date().toISOString()+' '+message+os.EOL);}catch(_){/* logging must never prevent startup */}};
 log('Starting desktop app; executable='+process.execPath+' resources='+process.resourcesPath);
 const server=path.join(process.resourcesPath,'backend','server.cjs');
 if(!fs.existsSync(server)){dialog.showErrorBox('BEO E-Office','Installer backend is missing. Existing office records are unchanged.');app.quit();return;}
 const dist=path.join(process.resourcesPath,'web');
 const portError=await checkPort(PORT);
 if(portError){
  log('Port preflight failed: '+portError+' port='+PORT);
  dialog.showErrorBox('BEO E-Office','Local server port '+PORT+' is unavailable ('+portError+'). Close the other application using this port and retry.\\nDiagnostic log: '+logFile+'\\nNo office records were deleted.');
  app.quit();return;
 }
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
  child=spawn(executable,[server],{cwd:app.getAppPath(),windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,ELECTRON_RUN_AS_NODE:'1',NODE_ENV:'production',BEO_DESKTOP:'1',BEO_DATA_ROOT:dataRoot,BEO_WEB_DIST:dist,BEO_PORT:String(PORT),NODE_PATH:path.join(app.getAppPath(),'node_modules')}});
 } catch(error) { launchError=error; }
 if(launchError){dialog.showErrorBox('BEO E-Office','Unable to launch local server: '+launchError.message+'\\nOffice records are unchanged.');app.quit();return;}
 let backendOutput='';
 const capture=(stream,data)=>{const chunk=String(data);backendOutput=(backendOutput+chunk).slice(-16000);log('server '+stream+': '+chunk.slice(0,4000));};
 child.stdout.on('data',data=>capture('stdout',data));
 child.stderr.on('data',data=>capture('stderr',data));
 let childExit=null;
 child.on('error',(error)=>{
  log('spawn error: '+error.stack);
  launchError=error;
  dialog.showErrorBox('BEO E-Office','Unable to launch local server ('+error.code+'): '+error.message+'\\nRepair or reinstall the desktop application. Office records are unchanged.');
  app.quit();
 });
 child.on('exit',(code,signal)=>{childExit={code,signal};log('server exited code='+code+' signal='+signal);if(code!==0&&window&&!window.isDestroyed())dialog.showErrorBox('BEO E-Office','Local server stopped unexpectedly. Startup log: '+logFile);});
 let ready=false;for(let i=0;i<60;i++){if(launchError||childExit)break;if(await ping()){ready=true;break;}await new Promise(r=>setTimeout(r,500));}
 if(launchError)return;
 if(!ready){const category=classifyBackendError(backendOutput);log('Server did not become ready; category='+category+' exit='+JSON.stringify(childExit));dialog.showErrorBox('BEO E-Office','Local server could not start ('+category+'). No office records were deleted.\nDiagnostic log: '+logFile+'\nPlease share the log after removing personal information.');app.quit();return;}
 window=new BrowserWindow({width:1200,height:800,minWidth:800,minHeight:600,show:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.once('ready-to-show',()=>window.show());
 window.loadURL('http://127.0.0.1:'+PORT);
 window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('http://127.0.0.1:'+PORT+'/'))event.preventDefault();});
 window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))require('electron').shell.openExternal(url);return {action:'deny'};});
}
app.whenReady().then(start);
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{if(child&&!child.killed)child.kill();});
