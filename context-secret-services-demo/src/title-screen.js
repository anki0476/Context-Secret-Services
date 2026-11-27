import {showSupport} from './support.js';
import {showInvestigations} from './community.js';
import './title-screen.css';
import {setMusicVolume,getMusicVolume,isMusicEnabled,toggleMusic} from './soundtrack.js';

export function createTitleScreen({app,reducedMotion}){
  const screen=document.createElement('section');screen.id='title-screen';screen.hidden=true;screen.setAttribute('aria-label','Main menu');
  screen.innerHTML=`<div class="title-atmosphere"></div><div class="title-content"><div class="title-logo-slot"></div><p class="title-case">CASE 001 <span>✦</span> THE COMEBACK CAKE</p><nav aria-label="Game menu"><button data-menu="start">Start Game</button><button data-menu="settings">Settings</button><button data-menu="players">View Other Players Investigations</button><button data-menu="exit">Exit</button></nav><p class="title-motto">Every picture has a missing piece.</p></div>`;
  const settings=document.createElement('dialog');settings.className='menu-dialog';settings.innerHTML=`<span class="eyebrow">FIELD PREFERENCES</span><h2>Settings</h2><button data-setting="music" class="secondary" aria-pressed="true">Background Music: On</button><label>Music volume <input type="range" min="0" max="100" value="40" aria-label="Music volume"></label><label><input type="checkbox"> Reduce motion</label><button class="secondary" data-support>Feedback &amp; support</button><button class="primary" data-back-menu>Back to menu</button>`;
  const players=document.createElement('dialog');players.className='menu-dialog';players.innerHTML=`<span class="eyebrow">COMMUNITY CASE FILES</span><h2>Other investigations</h2><p>No shared investigations are available in this demo yet.</p><p>Player reports will appear here when community sharing is connected.</p><button class="primary">Back to menu</button>`;
  document.body.append(screen,settings,players);
  const logo=document.querySelector('.brand img'),brand=logo.parentElement,slot=screen.querySelector('.title-logo-slot');
  let active=false,resolveStart,starting=false,placeholder;
  let wait;
  settings.querySelector('[data-support]').onclick=showSupport;
  const musicSetting=settings.querySelector('[data-setting=music]');
  const syncMusicSetting=()=>{musicSetting.textContent=`Background Music: ${isMusicEnabled()?'On':'Off'}`;musicSetting.setAttribute('aria-pressed',String(isMusicEnabled()));settings.querySelector('input[type=range]').value=getMusicVolume()*100;};
  musicSetting.onclick=async()=>{await toggleMusic();syncMusicSetting();};
  settings.querySelector('input[type=range]').oninput=e=>{setMusicVolume(Number(e.target.value)/100);syncMusicSetting();};
  settings.querySelector('input[type=checkbox]').onchange=e=>document.getElementById('reduce-motion').checked=e.target.checked;
  settings.querySelector('[data-back-menu]').onclick=()=>settings.close();players.querySelector('button').onclick=()=>players.close();
  screen.querySelector('[data-menu=settings]').onclick=()=>{syncMusicSetting();settings.querySelector('input[type=checkbox]').checked=reducedMotion();settings.showModal();};
  screen.querySelector('[data-menu=players]').onclick=showInvestigations;
  screen.querySelector('[data-menu=exit]').onclick=()=>location.reload();
  screen.querySelector('[data-menu=start]').onclick=async()=>{
    if(starting)return;starting=true;screen.querySelectorAll('button').forEach(b=>b.disabled=true);
    const from=logo.getBoundingClientRect();
    document.body.classList.remove('menu-active');
    const to=placeholder.getBoundingClientRect();
    document.body.append(logo);Object.assign(logo.style,{position:'fixed',zIndex:'1200',margin:'0',left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',transform:'none',background:'none',objectFit:'contain'});
    screen.classList.add('leaving');
    try{await logo.animate([{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'}],{duration:reducedMotion()?0:900,easing:'cubic-bezier(.22,.75,.18,1)',fill:'forwards'}).finished;}
    finally{logo.getAnimations().forEach(a=>a.cancel());logo.removeAttribute('style');placeholder.replaceWith(logo);screen.hidden=true;app.inert=false;active=false;resolveStart();}
  };
  function show(){active=true;starting=false;wait=new Promise(resolve=>resolveStart=resolve);screen.classList.remove('leaving');screen.querySelectorAll('button').forEach(b=>b.disabled=false);const r=logo.getBoundingClientRect();placeholder=document.createElement('span');placeholder.className='title-logo-placeholder';placeholder.style.width=r.width+'px';placeholder.style.height=r.height+'px';logo.replaceWith(placeholder);slot.append(logo);screen.hidden=false;document.body.classList.add('menu-active');app.inert=true;}
  function ready(){app.inert=true;screen.querySelector('[data-menu=start]').focus();return wait;}
  return {show,ready,get active(){return active;}};
}

