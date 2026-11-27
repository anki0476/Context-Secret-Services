import {context, navigateTo} from '@devvit/client';
import {SUPPORT_URL} from './support-url.js';
let panel;
export function showSupport(){
 if(!panel){
  panel=document.createElement('dialog');panel.className='menu-dialog';panel.setAttribute('aria-label','Feedback and support');
  panel.innerHTML='<span class="eyebrow">AGENCY SUPPORT DESK</span><h2>Feedback & support</h2><p>Found a bug or have a suggestion? Contact the moderators of r/ContextSecretServices.</p><p>For bugs, include the case number, your device, and what happened. Avoid including passwords or other sensitive information.</p><p>This opens Reddit’s message composer. Nothing is sent until you choose Send on Reddit.</p><button class="primary" data-contact>Contact game support</button><button class="secondary" data-close>Back</button>';
  panel.style.maxHeight='85dvh';panel.style.overflowY='auto';
  document.body.append(panel);
  panel.querySelector('[data-close]').onclick=()=>panel.close();
  panel.querySelector('[data-contact]').onclick=()=>{
   if(new URLSearchParams(location.search).has('landscape-player')) parent.postMessage({type:'css:open-support'},location.origin);
   else if(context) navigateTo(SUPPORT_URL);
   else window.open(SUPPORT_URL,'_blank','noopener,noreferrer');
  };
 }
 panel.showModal();
}
