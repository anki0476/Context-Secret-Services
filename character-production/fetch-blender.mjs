import fs from 'node:fs/promises';
const dir=new URL('./tools/',import.meta.url),original=new URL('blender-4.5.9-windows-x64.zip',dir),out=new URL('blender-complete.zip',dir);
const size=399051129,offset=(await fs.stat(original)).size;
await fs.copyFile(original,out);const file=await fs.open(out,'r+');await file.truncate(size);
const chunks=[];for(let start=offset;start<size;start+=1024*1024)chunks.push({start,end:Math.min(size-1,start+1024*1024-1)});
let cursor=0,done=0;
async function worker(){while(cursor<chunks.length){const {start,end}=chunks[cursor++];let data;for(let attempt=0;attempt<3;attempt++){try{
 const r=await fetch('https://mirror.freedif.org/blender/release/Blender4.5/blender-4.5.9-windows-x64.zip',{headers:{Range:`bytes=${start}-${end}`},signal:AbortSignal.timeout(45000)});
 if(r.status!==206)throw new Error('Expected partial response: '+r.status);
 data=Buffer.from(await r.arrayBuffer());if(data.length!==end-start+1)throw new Error('Wrong range length');break;
 }catch(e){if(attempt===2)throw e;}}
 await file.write(data,0,data.length,start);done++;if(done%16===0)console.log(`Blender download: ${done}/${chunks.length} remaining chunks complete`);
}}
try{await Promise.all(Array.from({length:8},worker));}finally{await file.close();}
console.log('Blender archive complete');
