import './case-cinematic.css';

const ART = [
  ['agency', 'Context Secret Services — the calico detective'],
  ['perspectives', 'Two perspectives on the same mystery'],
  ['missing-context', 'The context is missing'],
];
const HOLD = 3400;

// The same opening is used for pointer, keyboard, and photograph activation.
export function createCaseCinematic({app, reducedMotion}) {
  const panel = document.createElement('section');
  panel.id = 'case-cinematic';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Opening The Comeback Cake');
  panel.innerHTML = `<div class="cinema-art"></div><div class="cinema-vignette"></div>
    <div class="cinema-footer"><div class="cinema-caption"><span class="game-logo game-logo-dark" role="img" aria-label="Context Secret Services"></span><strong>The Comeback Cake</strong><span class="cinema-status" role="status">Preparing the scene…</span></div>
    <div class="cinema-actions"><div class="cinema-pages" aria-label="Slideshow images"></div><button class="cinema-skip" disabled>Continue</button></div></div>`;
  const iris = document.createElement('div');
  iris.id = 'case-iris'; iris.hidden = true; iris.setAttribute('aria-hidden', 'true');
  iris.innerHTML = `<svg width="100%" height="100%"><defs><mask id="case-iris-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect width="100%" height="100%" fill="white"/><circle cx="50%" cy="50%" r="0" fill="black"/></mask></defs><rect width="100%" height="100%" fill="#090b0b" mask="url(#case-iris-mask)"/></svg>`;
  document.body.append(panel, iris);
  const hole = iris.querySelector('circle'), skip = panel.querySelector('.cinema-skip'), status = panel.querySelector('.cinema-status');
  const slides = ART.map(([file,alt],i) => {
    const slide = document.createElement('div');slide.className='cinema-slide';
    const image = new Image();image.src=`/loading/${file}.jpg`;image.alt=alt;image.decoding='async';slide.append(image);
    panel.querySelector('.cinema-art').append(slide);
    const dot=document.createElement('span');dot.textContent=String(i+1).padStart(2,'0');panel.querySelector('.cinema-pages').append(dot);
    return {slide,image,dot};
  });
  // Fetch immediately, but start the deadline only when the opening is requested.
  // Initial WebGL compilation can otherwise use up a background decode deadline.
  async function readyArtwork(){
    return (await Promise.all(slides.map(async s=>{
      let timer;
      try{
        if(!s.image.complete || !s.image.naturalWidth){
          await Promise.race([s.image.decode(),new Promise((_,reject)=>{
            timer=setTimeout(()=>reject(Error('Artwork timeout')),15000);
          })]);
        }
        return s;
      }catch{s.slide.remove();s.dot.remove();return null;}
      finally{clearTimeout(timer);}
    }))).filter(Boolean);
  }
  let running=false, ready=false, exitRequested=false, wake;
  const requestExit=()=>{if(ready){exitRequested=true;wake?.();}};
  skip.onclick=requestExit;
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();requestExit();}if(e.key==='Tab'){e.preventDefault();skip.focus();}});
  function showSlide(items,index){
    items.forEach((s,i)=>{s.slide.classList.toggle('current',i===index);s.dot.classList.toggle('current',i===index);s.slide.setAttribute('aria-hidden',String(i!==index));});
    panel.dataset.slide=String(index+1);
  }
  async function aperture(close){
    iris.hidden=false;
    if(reducedMotion()){
      hole.setAttribute('r','0');
      await iris.animate([{opacity:close?0:1},{opacity:close?1:0}],{duration:160,fill:'forwards'}).finished;
      iris.getAnimations().forEach(a=>a.cancel());
      if(!close)iris.hidden=true;
      return;
    }
    await new Promise(resolve=>{
      const start=performance.now();
      function frame(){
        const t=Math.min(1,Math.max(0,(performance.now()-start)/720));
        const e=t*t*(3-2*t), radius=Math.hypot(innerWidth,innerHeight)*.53;
        hole.setAttribute('r',String(radius*(close?1-e:e)));
        if(t<1)requestAnimationFrame(frame);else resolve();
      }frame();
    });
    if(!close)iris.hidden=true;
  }
  async function play(prepareScene,beforeReveal=()=>{}){
    if(running)return;running=true;ready=false;exitRequested=false;
    app.inert=true;document.body.classList.add('cinematic-active');
    panel.classList.toggle('cinema-reduced',reducedMotion());
    try{
      await aperture(true);
      panel.hidden=false;
      const items=await readyArtwork();
      if(items.length)showSlide(items,0);
      const prepared=Promise.resolve().then(prepareScene).then(()=>{
        ready=true;status.textContent='Scene ready';skip.disabled=false;skip.focus();
      });
      // Start rendering the room behind the artwork; no invented loading percentage.
      await prepared;
      await aperture(false);
      let index=0;
      while(!exitRequested){
        await new Promise(resolve=>{const timer=setTimeout(done,items.length?HOLD:500);function done(){clearTimeout(timer);wake=null;resolve();}wake=done;});
        if(exitRequested||index+1>=items.length)break;
        showSlide(items,++index);
      }
      await aperture(true);
      beforeReveal();
      panel.hidden=true;
      await aperture(false);
    }finally{
      iris.hidden=true;panel.hidden=true;app.inert=false;document.body.classList.remove('cinematic-active');running=false;
    }
  }
  return {play,get active(){return running;}};
}
