import React, { useState } from 'react';
import { GOVERNMENT_REFERENCES } from '../data/governmentReferenceRegistry';
import { OFFICE_REFERENCE_BOOKS } from '../data/officeReferenceBooks';

const DB_NAME='beo-reference-pdfs-v1';
const STORE='pdfs';
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(new Error('IndexedDB ಲಭ್ಯವಿಲ್ಲ'));return;}
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
async function savePdf(key:string,file:File){
 const db=await openDb();
 try {await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(file,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}finally{db.close();}
}
async function getPdf(key:string):Promise<Blob|undefined>{
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result as Blob|undefined);req.onerror=()=>reject(req.error);});}finally{db.close();}
}
export const OfficeReferencePicker:React.FC=()=>{
 const [filter,setFilter]=useState('');
 const [message,setMessage]=useState('');
 const [offlineIds,setOfflineIds]=useState<string[]>([]);
 const entries=[
 ...GOVERNMENT_REFERENCES.map(r=>({id:r.id,title:r.title,category:r.category,url:r.url,reference:r.number?`${r.number}${r.date?', ದಿನಾಂಕ: '+r.date:''}`:r.title,notes:r.notes,kind:r.status==='verified-document'?'ಸರ್ಕಾರಿ ದಾಖಲೆ':'ಮೂಲ ಪೋರ್ಟಲ್'})),
 ...OFFICE_REFERENCE_BOOKS.map(r=>({id:'book-'+r.id,title:r.title,category:r.category,url:r.url,reference:r.title,notes:r.note,kind:'ನಿಯಮಾವಳಿ / ಪುಸ್ತಕ'}))
 ];
 const visible=entries.filter(r=>(r.title+' '+r.category+' '+r.reference).toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
 const notify=(s:string)=>setMessage(s);
 const upload=async(id:string,file?:File)=>{
  if(!file)return;
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){notify('PDF ಫೈಲ್ ಮಾತ್ರ ಸೇರಿಸಿ');return;}
  try{await savePdf(id,file);setOfflineIds(p=>[...new Set([...p,id])]);notify('ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ PDF ಆಫ್‌ಲೈನ್ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. Backup ಪ್ರತ್ಯೇಕವಾಗಿ ಇಡಿ.');}catch{notify('PDF ಸಂಗ್ರಹ ವಿಫಲ: ಸ್ಥಳಾವಕಾಶ ಅಥವಾ ಬ್ರೌಸರ್ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ');}
 };
 const offline=async(id:string)=>{
  try{const pdf=await getPdf(id);if(!pdf){notify('ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ PDF ಇನ್ನೂ ಸಂಗ್ರಹವಾಗಿಲ್ಲ');return;}
  const url=URL.createObjectURL(pdf);const a=document.createElement('a');a.href=url;a.download=id+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }catch{notify('PDF ಓದಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ');}
 };
 return <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3 font-kannada">
  <h3 className="font-bold text-lg">ಸುತ್ತೋಲೆಗಳು ಮತ್ತು ನಿಯಮಾವಳಿ ಪುಸ್ತಕಗಳು — ಪತ್ರದ ಉಲ್ಲೇಖಕ್ಕಾಗಿ</h3>
  <p className="text-xs text-stone-700">ಅಧಿಕೃತ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿದ ನಂತರ ಮಾತ್ರ ಉಲ್ಲೇಖ ಬಳಸಿ. ಉಲ್ಲೇಖ ನಕಲಿಸಿ ಪತ್ರದ ಉಲ್ಲೇಖ ಕ್ಷೇತ್ರಕ್ಕೆ ಅಂಟಿಸಿ. ಸ್ಥಳೀಯ PDF ಪ್ರತಿ ಪ್ರತಿ ಬ್ರೌಸರ್‌ಗೆ ಪ್ರತ್ಯೇಕವಾಗಿರುತ್ತದೆ; ಸಂಪೂರ್ಣ ಸರ್ಕಾರಿ ಸಂಗ್ರಹವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವುದಿಲ್ಲ.</p>
  <input aria-label="ಸುತ್ತೋಲೆ ಅಥವಾ ಪುಸ್ತಕ ಹುಡುಕಿ" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="ಸುತ್ತೋಲೆ / KCSR / ಖಜಾನೆ / ಪಿಂಚಣಿ ಹುಡುಕಿ" className="w-full border rounded p-2 bg-white"/>
  {message&&<p role="status" className="text-xs font-semibold">{message}</p>}
  <div className="max-h-80 overflow-y-auto space-y-2">
   {visible.map(r=><div key={r.id} className="rounded-lg border bg-white p-3 space-y-1">
    <div className="text-[11px] text-amber-900 font-semibold">{r.category} · {r.kind}</div>
    <div className="text-sm font-semibold">{r.title}</div>
    <div className="text-xs text-stone-600">{r.notes}</div>
    <div className="flex gap-2 flex-wrap text-xs">
     <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">ಮೂಲ ತೆರೆಯಿರಿ</a>
     <button type="button" className="underline text-blue-700" onClick={()=>navigator.clipboard.writeText(r.reference).then(()=>notify('ಉಲ್ಲೇಖ ನಕಲಿಸಲಾಗಿದೆ — ಪತ್ರದ ಉಲ್ಲೇಖ ಕ್ಷೇತ್ರಕ್ಕೆ ಅಂಟಿಸಿ')).catch(()=>notify('Copy ಸಾಧ್ಯವಾಗಿಲ್ಲ'))}>ಉಲ್ಲೇಖ Copy</button>
     <label className="cursor-pointer underline text-blue-700">Offline PDF ಸೇರಿಸಿ<input className="hidden" type="file" accept="application/pdf,.pdf" onChange={e=>{void upload(r.id,e.target.files?.[0]);e.target.value='';}}/></label>
     <button type="button" className="underline text-blue-700" onClick={()=>void offline(r.id)}>Offline PDF ಪಡೆಯಿರಿ {offlineIds.includes(r.id)?'✓':''}</button>
    </div>
   </div>)}
   {visible.length===0&&<p className="text-xs">ಹೊಂದುವ ದಾಖಲೆ ಇಲ್ಲ</p>}
  </div>
 </section>;
};
