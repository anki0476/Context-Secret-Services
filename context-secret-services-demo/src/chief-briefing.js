import './chief-briefing.css';

// Short spoken beats preserve the complete field assignment without revealing the answer.
export const chiefBriefing = [
  {topic:'The photograph', text:'Detective, the CEO is back—one week after being fired. In this photograph, he’s standing beside a party cake that says “GOOD RIDDANCE.” Quite the welcome.'},
  {topic:'The accusation', text:'The headline makes it look as though his staff are insulting him at his own welcome-back party. That cropped photograph is now a joke about the world’s least enthusiastic reunion.'},
  {topic:'The reaction', text:'Our fictional feed is having a field day: “Rehired the boss. Forgot to rehire the enthusiasm.” And: “That cake is saying what the staff are thinking.” These are invented reactions for this case, not real posts or news.'},
  {topic:'Your assignment', text:'Why is a farewell message at a return celebration? Find out when the cake was ordered, what changed, and what the photograph left outside its frame. Bring me evidence before you bring me a verdict.'},
  {topic:'Look around', text:'Walk with the joystick, WASD, or the arrow keys. Get close to an object, then choose Inspect—or press E. Some objects hold evidence; others don’t. Crates need several taps to open.'},
  {topic:'A different perspective', text:'Use Cat POV—or V—to see through your own eyes. Drag the scene or use I, J, K, and L to look around. Press V again for the overhead view. You can revisit the original photograph at any time.'},
  {topic:'Your tools', text:'Open Detective Tools—or press T. The detective lens gives you a one-second glimpse of clue regions. If you’re stuck, ask for a riddle. The complete written case briefing is in there too.'},
  {topic:'Build your case', text:'File the evidence you find. Open your case folder to review it, then Connect the clues when you have enough. The picture is only the beginning, Detective. Let’s find what’s missing.'}
];

export function createChiefGuide({reducedMotion}) {
  const dialog=document.createElement('dialog');
  dialog.id='chief-guide';dialog.setAttribute('aria-labelledby','chief-name');
  dialog.innerHTML=`<div class="chief-dialogue"><img class="chief-portrait" src="/characters/chief-marlowe.png" alt="Chief Marlowe, a silver-grey cat in a teal coat, holding a case file" width="1200" height="1312"><section class="chief-box"><header><div><span class="chief-role">BUREAU CHIEF · CONTEXT SECRET SERVICES</span><h2 id="chief-name">Chief Marlowe</h2></div><span class="chief-page"></span></header><div class="chief-topic"></div><div class="chief-speech"><p class="chief-visible" aria-hidden="true"></p><p class="chief-readable" aria-live="polite" aria-atomic="true"></p></div><footer><button class="chief-skip">Skip briefing</button><div class="chief-nav"><button class="chief-back">Back</button><button class="chief-next">Continue</button></div></footer></section></div>`;
  document.body.append(dialog);
  const visible=dialog.querySelector('.chief-visible'),readable=dialog.querySelector('.chief-readable'),next=dialog.querySelector('.chief-next'),back=dialog.querySelector('.chief-back');
  let index=0,timer=0,typing=false,closing=false;
  function finishTyping(){clearInterval(timer);typing=false;visible.textContent=chiefBriefing[index].text;}
  function render(){
    clearInterval(timer);const beat=chiefBriefing[index];
    dialog.querySelector('.chief-topic').textContent=beat.topic;
    dialog.querySelector('.chief-page').textContent=`${index+1} / ${chiefBriefing.length}`;
    back.disabled=index===0;next.textContent=index===chiefBriefing.length-1?'Begin investigation':'Continue';
    readable.textContent=beat.text;visible.textContent='';typing=!reducedMotion();
    if(!typing){finishTyping();return;}
    let length=0;timer=setInterval(()=>{length+=2;visible.textContent=beat.text.slice(0,length);if(length>=beat.text.length)finishTyping();},24);
  }
  async function close(){
    if(closing||!dialog.open)return;closing=true;finishTyping();
    if(!reducedMotion())await dialog.querySelector('.chief-dialogue').animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(35px)'}],{duration:250,easing:'ease-in',fill:'forwards'}).finished;
    dialog.close();
  }
  function advance(){if(typing){finishTyping();return;}if(index<chiefBriefing.length-1){index++;render();}else close();}
  next.onclick=advance;
  back.onclick=()=>{if(index>0){index--;render();}};
  dialog.querySelector('.chief-skip').onclick=close;
  visible.onclick=finishTyping;
  dialog.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();close();});
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();advance();}else if(event.key==='ArrowLeft'&&index>0){event.preventDefault();index--;render();}});
  dialog.addEventListener('close',()=>{clearInterval(timer);typing=false;document.body.classList.remove('chief-speaking');document.getElementById('help')?.focus();});
  return {show(){
    if(dialog.open)return;index=0;closing=false;dialog.querySelector('.chief-dialogue').getAnimations().forEach(animation=>animation.cancel());
    document.body.classList.add('chief-speaking');dialog.showModal();render();next.focus();
    if(!reducedMotion())dialog.querySelector('.chief-dialogue').animate([{opacity:0,transform:'translateY(45px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.22,.8,.22,1)'});
  }};
}
