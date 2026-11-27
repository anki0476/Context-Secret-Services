import './soundtrack.css';
const track=new Audio('/audio/evidence-of-rain.mp3');
track.preload='auto';track.loop=true;track.volume=0.4;
const toggle=document.createElement('button');
toggle.id='music-toggle';toggle.hidden=true;toggle.type='button';
document.body.append(toggle);
function sync(){const audible=!track.paused&&!track.muted;toggle.textContent=audible?'♫ On':'♫ Off';toggle.setAttribute('aria-label',audible?'Mute music':'Play music');toggle.setAttribute('aria-pressed',String(audible));}
toggle.onclick=()=>{if(track.paused){track.muted=false;track.play().then(sync).catch(sync);}else{track.muted=!track.muted;sync();}};
track.addEventListener('error',()=>{toggle.textContent='Music unavailable';toggle.disabled=true;toggle.setAttribute('aria-label','Music unavailable');});
export function startSoundtrack(){toggle.hidden=false;sync();track.play().then(sync).catch(()=>{sync();});}

export function setMusicVolume(value){track.volume=Math.max(0,Math.min(1,value));track.muted=value===0;sync();}
export function getMusicVolume(){return track.muted?0:track.volume;}

export function isMusicEnabled(){return !track.muted && !track.paused && track.volume>0;}
export async function toggleMusic(){if(isMusicEnabled()){track.muted=true;sync();}else{track.muted=false;if(!track.volume)track.volume=.4;try{await track.play();}catch{}sync();}}
