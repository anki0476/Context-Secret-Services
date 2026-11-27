import React,{useState,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {LuSearch,LuNotebookPen,LuScrollText} from 'react-icons/lu';
import {caseRiddle} from './case.js';
import {FaFolderClosed} from 'react-icons/fa6';
import {InviteDisclosure} from './components/InviteDisclosure.jsx';
import './exploration.css';

export function mountDetectiveTools({onLens,onFile,onBriefing,reducedMotion,canOpen}){
 const host=document.createElement('div');host.id='detective-tools-root';document.body.append(host);
 const shade=document.createElement('div');shade.id='tools-backdrop';shade.hidden=true;document.body.append(shade);
 const root=createRoot(host);let requestOpen,closing=false;
 const riddle=document.createElement('dialog');riddle.id='case-riddle';riddle.className='agency-paper';riddle.setAttribute('aria-labelledby','riddle-title');
 riddle.innerHTML='<button class="icon-btn paper-close" aria-label="Close riddle">×</button><span class="agency-stamp">A WHISPER FROM THE ARCHIVE</span><h2 id="riddle-title"></h2><blockquote class="riddle-verse"></blockquote><p class="riddle-footnote">Keep this thought with you. The room still holds the proof.</p><button class="primary riddle-return">Back to investigating</button>';
 riddle.querySelector('h2').textContent=caseRiddle.title;
 for(const line of caseRiddle.lines){const span=document.createElement('span');span.textContent=line;riddle.querySelector('blockquote').append(span);}
 document.body.append(riddle);
 function closeRiddle(){riddle.close();host.querySelector('.disclosure-trigger')?.focus();}
 riddle.querySelectorAll('button').forEach(button=>button.onclick=closeRiddle);
 riddle.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();closeRiddle();});
 function showRiddle(){riddle.showModal();if(!reducedMotion())riddle.animate([{opacity:0,transform:'translateY(18px) scale(.96)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});}
 const items=[
  {id:'lens',title:'Detective lens',description:'A one-second glimpse of clue regions.',icon:<LuSearch/>},
  {id:'riddle',title:'Get a riddle',description:'A cryptic nudge toward the missing context.',icon:<LuScrollText/>},
  {id:'file',title:'Case file',description:'Review evidence and connect the clues.',icon:<FaFolderClosed/>},
  {id:'briefing',title:'Case briefing',description:'Revisit the story behind the photograph.',icon:<LuNotebookPen/>}
 ];
 function Tools(){
  const [open,setOpen]=useState(false);
  const change=useCallback((value,action)=>{
   if(closing)return;
   if(value){
    if(!canOpen())return;
    shade.hidden=false;document.body.classList.add('tools-open');setOpen(true);
   }else{
    closing=true;setOpen(false);
    setTimeout(()=>{
     shade.hidden=true;document.body.classList.remove('tools-open');closing=false;
     if(action)action();else host.querySelector('.disclosure-trigger')?.focus();
    },reducedMotion()?0:420);
   }
  },[]);
  requestOpen=()=>change(true);
  shade.onclick=()=>change(false);
  return <InviteDisclosure title="Detective tools" badgeCount={items.length} invites={items} isOpen={open} onOpenChange={change} reducedMotion={reducedMotion()} onSelect={id=>change(false,{lens:onLens,riddle:showRiddle,file:onFile,briefing:onBriefing}[id])}/>;
 }
 flushSync(()=>root.render(<Tools/>));
 return {open(){requestOpen();}};
}

