import { SUPPORT_URL } from './support-url.js';
import {discussionURL} from './discussion.js';
import { context, navigateTo } from '@devvit/client';
import { landscapeLayout } from './landscape-layout.js';
import './landscape-player.css';

const player = document.getElementById('landscape-player');
const frame = document.getElementById('game-frame');
const mobileClient = ['ANDROID', 'IOS'].includes(context?.client?.name);
const touch = matchMedia('(pointer: coarse)');

function resize() {
  const { width, height } = player.getBoundingClientRect();
  const layout = landscapeLayout(width, height, mobileClient || touch.matches || width <= 600);
  frame.style.width = `${layout.width}px`;
  frame.style.height = `${layout.height}px`;
  frame.style.transform = layout.rotated ? 'rotate(90deg)' : 'none';
  frame.style.left = layout.rotated ? `${width}px` : '0';
  player.dataset.orientation = layout.rotated ? 'landscape-fallback' : 'native';
  // The nested Android WebView can report a fine pointer. Pass the host's
  // mobile/rotation decision explicitly instead of repeating that media query.
  const compact = (mobileClient || touch.matches || layout.rotated) && layout.height <= 600;
  frame.contentDocument?.documentElement.classList.toggle('mobile-hud', compact);
}

// Resizing the iframe preserves the session when the host really does rotate.
new ResizeObserver(resize).observe(player);
window.addEventListener('resize', resize);
touch.addEventListener('change', resize);
frame.addEventListener('load', resize);
window.addEventListener('message', event => {
 if(event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'css:discuss-case') return;
 const url=discussionURL(context?.postId);
 if(context) navigateTo(url); else window.open(url,'_blank','noopener,noreferrer');
});
resize();

let loadingReports=false;
window.addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='css:report-comment'){
    const post=context?.postId?.replace(/^t3_/,'');
    const url=event.data.url;
    if(typeof url!=='string'||!/^https:\/\/www\.reddit\.com\/comments\/[a-z0-9]+\/comment\/[a-z0-9]+\/$/.test(url)||!url.startsWith(`https://www.reddit.com/comments/${post}/`))return;
    navigateTo(url);return;
  }
  if(event.data?.type!=='css:reports'||typeof event.data.requestId!=='string'||event.data.requestId.length>64)return;
  const requestId=event.data.requestId;
  const reply=payload=>frame.contentWindow?.postMessage({type:'css:reports-result',requestId,...payload},location.origin);
  if(loadingReports){reply({error:'A refresh is already running. Please retry shortly.'});return;}
  loadingReports=true;
  try{const response=await fetch('/api/investigations');const data=await response.json();if(!response.ok)throw Error(data.error);reply({data});}
  catch{reply({error:'Unable to load Reddit reports. Please retry.'});}
  finally{loadingReports=false;}
});

window.addEventListener('message', event => {
  if(event.origin === location.origin && event.source === frame.contentWindow && event.data?.type === 'css:open-support') {
    if(context) navigateTo(SUPPORT_URL); else window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer');
  }
});

