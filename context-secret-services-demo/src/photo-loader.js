// Vanilla adaptation of the supplied React Bits RefineFrame mosaic/sweep.
export function createPhotoLoader(frame,image,status){
 const canvas=document.createElement('canvas');canvas.className='photo-mosaic';canvas.setAttribute('aria-hidden','true');frame.append(canvas);
 const retry=document.createElement('button');retry.className='photo-retry';retry.textContent='Retry photograph';retry.hidden=true;frame.append(retry);
 let version=0,lastURL,raf,timer;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function state(value,label){frame.dataset.photoState=value;frame.setAttribute('aria-busy',String(value==='loading'||value==='refining'));status.hidden=false;status.textContent=label;retry.hidden=value!=='error';}
 state('loading','Developing photograph…');
 async function show(url){
  lastURL=url;const own=++version;cancelAnimationFrame(raf);clearTimeout(timer);state('loading','Developing photograph…');canvas.hidden=true;
  try{
   image.src=url;
   await Promise.race([image.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Photo timed out')),15000);})]);clearTimeout(timer);
   if(own!==version)return;
   state('loading','Developing photograph…');
   const w=Math.max(1,frame.clientWidth),h=Math.max(1,frame.clientHeight);canvas.width=w;canvas.height=h;canvas.hidden=false;
   const ctx=canvas.getContext('2d'),small=document.createElement('canvas'),sc=small.getContext('2d');
   const cover=Math.max(w/image.naturalWidth,h/image.naturalHeight),sw=w/cover,sh=h/cover,sx=(image.naturalWidth-sw)/2,sy=(image.naturalHeight-sh)/2;
   await new Promise(resolve=>{const start=performance.now();function tick(now){if(own!==version){resolve();return;}const t=reduced.matches?1:Math.max(0,Math.min(1,(performance.now()-start)/1800));const levels=[48,32,20,12,8,5,3,2,1];const block=levels[Math.min(8,Math.floor(t*9))];small.width=Math.max(1,Math.ceil(w/block));small.height=Math.max(1,Math.ceil(h/block));sc.drawImage(image,sx,sy,sw,sh,0,0,small.width,small.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(small,0,0,w,h);if(t<1){ctx.fillStyle='#fff4cc55';ctx.fillRect(0,(t*3%1)*h, w,2);raf=requestAnimationFrame(tick);}else resolve();}raf=requestAnimationFrame(tick);});
   if(own!==version)return;canvas.hidden=true;state('complete','Photograph ready');timer=setTimeout(()=>status.hidden=true,1200);
  }catch(error){if(own===version){canvas.hidden=true;state('error','Photograph could not load');}throw error;}
 }
 retry.onclick=e=>{e.stopPropagation();show(lastURL).then(()=>document.getElementById('enter').disabled=false).catch(()=>{});};
 return {show};
}
