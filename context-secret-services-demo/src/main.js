import {context as redditContext, getWebViewMode, requestExpandedMode} from '@devvit/client';
import {openDiscussion} from './discussion.js';
import {unlockCommunity,previewReport,showInvestigations} from './community.js';
import {createChiefGuide} from './chief-briefing.js';
import {mountInspectionMaterials} from './inspection-materials.jsx';
import {createCrateProgress,containerIds} from './crate-progress.js';
import {mountContainerProgress} from './container-progress.jsx';
import {mountDetectiveTools} from './detective-tools.jsx';
import {createGamePanels} from './game-panels.js';
import {createTitleScreen} from './title-screen.js';
import {startSoundtrack} from './soundtrack.js';
import {mountCaseFolder} from './case-folder.jsx';
import './game-controls.css';
import {createCaseCinematic} from './case-cinematic.js';
import {createPhotoLoader} from './photo-loader.js';
import './style.css';
import './newspaper.css';
import {createWorld} from './world.js';
import {attachMovementControls} from './joystick.js';
import {clues,theories,canReconstruct,evaluateTheory} from './case.js';
const $=id=>document.getElementById(id);let found=new Set(),activeClue=null,selectedTheory=null,world,opened=false,photoMode=false,assetsReady=false;
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;$('reduce-motion').checked=prefersReduced;
const inspectionMaterials=mountInspectionMaterials($('evidence-art'),$('inspect-dialog'),()=>$('reduce-motion').checked);
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3500);}
function closeAll(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());}
document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.querySelector('.close-help').onclick=()=>$('help-dialog').close();
const chiefGuide=createChiefGuide({reducedMotion:()=>$('reduce-motion').checked});
const caseFolder=mountCaseFolder($('case-folder'),(id,rect)=>inspect(id,rect),()=>$('reduce-motion').checked);
function inspect(id,fromRect){if(!opened||photoMode||cinematic.active||titleScreen.active)return;activeClue=clues.find(c=>c.id===id);$('clue-category').textContent=activeClue.category;$('clue-title').textContent=activeClue.name;$('clue-description').textContent=activeClue.description;$('clue-quote').textContent=activeClue.quote;$('clue-thought').textContent=activeClue.thought;$('collect').textContent=found.has(id)?'Back to the investigation':'Add to case file';$('inspect-dialog').showModal();inspectionMaterials.show(activeClue);if(fromRect&&!$('reduce-motion').checked){const d=$('inspect-dialog'),r=d.getBoundingClientRect();d.animate([{transform:'translate('+(fromRect.x+fromRect.width/2-r.x-r.width/2)+'px,'+(fromRect.y+fromRect.height/2-r.y-r.height/2)+'px) scale(.18)',opacity:.3},{transform:'none',opacity:1}],{duration:550,easing:'cubic-bezier(.2,.8,.2,1)'});}}
$('collect').onclick=()=>{const id=activeClue.id;const isNew=!found.has(id);found.add(id);$('inspect-dialog').close();updateEvidence();if(isNew)toast(activeClue.short+' added to your case file');};
function updateEvidence(){caseFolder.update(clues.filter(c=>found.has(c.id)));$('theory').disabled=!canReconstruct(found);$('objective').textContent=canReconstruct(found)?'You have enough evidence. Connect the clues, or keep exploring.':'Explore objects around the party.';}
for(const t of theories){const b=document.createElement('button');b.className='theory-option';b.innerHTML='<span class="radio"></span><span></span>';b.lastElementChild.textContent=t.text;b.onclick=()=>{selectedTheory=t.id;document.querySelectorAll('.theory-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('test-theory').disabled=false;$('theory-feedback').textContent='';};$('theory-options').append(b);}
$('theory').onclick=()=>{if(canReconstruct(found))$('theory-dialog').showModal();};
$('test-theory').onclick=()=>{const result=evaluateTheory(selectedTheory,found);if(!result.correct){$('theory-feedback').textContent=result.message;return;}$('theory-dialog').close();$('result-dialog').showModal();$('objective').textContent='Case closed. The photograph was real. Its implication was wrong.';};
document.querySelectorAll('[data-caption]').forEach(b=>b.onclick=()=>{$('caption').value=b.dataset.caption;});
$('copy-report').onclick=async()=>{const text=`CONTEXT SECRET SERVICES · The Comeback Cake\n\n${$('caption').value.trim()}\n\nMissing context: a reused farewell cake and a forgotten welcome-back plaque.\nFictional case — not a news report.`;try{await navigator.clipboard.writeText(text);$('copy-report').textContent='Copied!';setTimeout(()=>$('copy-report').textContent='Copy my report',1800);}catch{const el=$('caption');el.focus();el.select();toast('Select and copy your caption manually. Clipboard access is unavailable.');}};
$('back-scene').onclick=()=>$('result-dialog').close();
const discussButton=document.createElement('button');discussButton.className='secondary';discussButton.id='discuss-case';discussButton.textContent='Discuss this case';discussButton.onclick=openDiscussion;
$('result-dialog').querySelector('.result-actions').append(discussButton);
const spoilerReminder=document.createElement('p');spoilerReminder.textContent='Discuss this case opens Reddit comments. Please mark solutions and evidence as spoilers.';spoilerReminder.style.fontSize='12px';$('result-dialog').append(spoilerReminder);
const shareButton=document.createElement('button');shareButton.className='primary';shareButton.textContent='Share my investigation';shareButton.onclick=()=>previewReport($('caption').value);
const galleryButton=document.createElement('button');galleryButton.className='secondary';galleryButton.textContent='Other investigations';galleryButton.onclick=showInvestigations;
$('result-dialog').querySelector('.result-actions').append(shareButton,galleryButton);
$('test-theory').addEventListener('click',()=>{if(evaluateTheory(selectedTheory,found).correct)unlockCommunity();});
const photoLoader=createPhotoLoader($('photo-area'),$('snapshot'),$('loading'));
function introSnapshot(){if(!assetsReady)return;const area=$('photo-area'),r=area.getBoundingClientRect();$('news-backdrop').src=world.renderOverview(1280,800);const img=world.renderPhoto(r.width,r.height);photoLoader.show(img).then(()=>$('enter').disabled=false).catch(()=>{$('enter').disabled=true;});}
const cinematic=createCaseCinematic({app:$('app'),reducedMotion:()=>$('reduce-motion').checked});
const titleScreen=createTitleScreen({app:$('app'),reducedMotion:()=>$('reduce-motion').checked});
async function enter(event){
 if(opened||!world||!assetsReady||$('enter').disabled)return;
 if(!new URLSearchParams(location.search).has('landscape-player') && redditContext && event?.isTrusted && getWebViewMode()==='inline'){requestExpandedMode(event,'game',{title:'Context Secret Services'});return;}
 startSoundtrack();
 opened=true;$('enter').disabled=true;
 try{
  await cinematic.play(async()=>{
   Object.assign($('scene-shell').style,{inset:'0',left:'0',top:'0',width:'100%',height:'100%',opacity:'1'});
   document.body.classList.add('game-active');$('game-ui').hidden=false;
   world.start({instant:true});
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  },()=>titleScreen.show());
  await titleScreen.ready();
  chiefGuide.show();
 }catch(error){console.error(error);toast('The opening sequence was interrupted. You can continue investigating.');}
}
$('enter').onclick=enter;$('photo-area').onclick=enter;
$('photo-return').onclick=()=>{if(world.switchingView)return;photoMode=!photoMode;document.body.classList.toggle('photo-mode',photoMode);$('photo-return').textContent=photoMode?'Return to scene':'View photograph';if(photoMode)world.returnPhoto();else world.resume();};
function restartGame(){closeAll();crateGeneration++;crateProgress.reset();world.resetContainers();selectedObject=null;lensCooldown=0;world.resetLens();found.clear();selectedTheory=null;updateEvidence();document.querySelectorAll('.theory-option').forEach(x=>x.classList.remove('selected'));$('test-theory').disabled=true;$('theory-feedback').textContent='';photoMode=false;document.body.classList.remove('photo-mode');$('photo-return').textContent='View photograph';if(opened){world.resetInvestigation();chiefGuide.show();}};
const panels=createGamePanels({reducedMotion:()=>$('reduce-motion').checked,onRestart:restartGame,onLaunch:async()=>{closeAll();photoMode=false;document.body.classList.remove('photo-mode');$('photo-return').textContent='View photograph';world.resume();titleScreen.show();await titleScreen.ready();chiefGuide.show();}});
$('help').onclick=()=>chiefGuide.show();
$('pause').onclick=()=>panels.showPause();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened&&!cinematic.active&&!titleScreen.active&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('tools-open')){e.preventDefault();panels.showPause();}});
try{world=createWorld($('world'),{onViewChange:(active,switching)=>{document.body.classList.toggle('first-person',active);document.body.classList.toggle('switching-view',switching);$('pov-toggle').setAttribute('aria-pressed',String(active));$('pov-toggle').textContent=active?'Overhead view':'Cat POV';$('pov-toggle').disabled=switching;$('photo-return').disabled=switching;},onTransitionEnd:()=>{toast('The whole room was here. The photograph only showed part of it.');},reducedMotion:()=>$('reduce-motion').checked});world.ready.then(()=>{assetsReady=true;introSnapshot();}).catch(error=>{console.error(error);assetsReady=true;introSnapshot();toast("Character assets could not load. Reload to retry.");});}catch(error){console.error(error);$('fatal').hidden=false;}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!opened&&world)introSnapshot();},150);});
const prompt=document.createElement('div');prompt.id='proximity-prompt';prompt.hidden=true;prompt.innerHTML='<span class="nearby-name"></span><div class="name-tag-actions"><button class="nearby-cycle" aria-label="Previous nearby object">‹</button><button class="inspect-nearby">Inspect</button><button class="nearby-cycle" aria-label="Next nearby object">›</button></div>';$('game-ui').append(prompt);

const lensStatus=document.createElement('div');lensStatus.id='lens-status';lensStatus.hidden=true;lensStatus.textContent='Lens sweep · look for the glow';$('game-ui').append(lensStatus);
const empty=document.createElement('dialog');empty.id='empty-inspection';empty.className='agency-paper';empty.innerHTML='<button class="icon-btn paper-close" aria-label="Close object inspection">×</button><span class="agency-stamp">OBJECT INSPECTION</span><h2></h2><span class="no-clue-label">NO CLUE HERE</span><p></p><button class="primary">Keep exploring</button>';document.body.append(empty);empty.querySelectorAll('button').forEach(b=>b.onclick=()=>empty.close());
const crateProgress=createCrateProgress();let crateGeneration=0;
const progressHost=document.createElement('div');progressHost.className='crate-progress';progressHost.hidden=true;prompt.insertBefore(progressHost,prompt.querySelector('.name-tag-actions'));const progressUI=mountContainerProgress(progressHost,()=>$('reduce-motion').checked);
let nearby=[],selectedObject=null,lensCooldown=0,lensTimer,objectInspectionPending=false;
const playable=()=>Boolean(world&&!world.switchingView&&opened&&!cinematic.active&&!titleScreen.active&&!photoMode&&world.state==='investigate'&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('tools-open'));
function cycleObject(delta){if(!nearby.length)return;const i=nearby.findIndex(o=>o.id===selectedObject?.id);selectedObject=nearby[(i+delta+nearby.length)%nearby.length];}
prompt.querySelector('[aria-label="Previous nearby object"]').onclick=()=>cycleObject(-1);prompt.querySelector('[aria-label="Next nearby object"]').onclick=()=>cycleObject(1);
async function inspectNearby(){if(objectInspectionPending||!playable()||!selectedObject||!world.nearby().some(o=>o.id===selectedObject.id))return;const item=selectedObject;
 if(containerIds.has(item.id)&&crateProgress.get(item.id).status!=='open'){
  if(crateProgress.get(item.id).status==='opening')return;
  const progress=crateProgress.click(item.id);world.inspectObject(item);world.nudgeContainer(item.id);
  progressUI.update(item.id,progress);
  if(progress.status!=='opening')return;
  const generation=crateGeneration,finished=await world.openContainer(item.id);
  if(generation!==crateGeneration||!finished)return;
  crateProgress.finish(item.id);
  if(!playable()||!world.nearby().some(o=>o.id===item.id))return;
 }
 const generation=crateGeneration;objectInspectionPending=true;try{await world.inspectObject(item);}finally{objectInspectionPending=false;}if(generation!==crateGeneration||!playable()||!world.nearby().some(o=>o.id===item.id))return;
 if(item.clue){inspect(item.clue);}else{empty.querySelector('h2').textContent=item.name;empty.querySelector('p').textContent=item.note;empty.showModal();}}
prompt.querySelector('.inspect-nearby').onclick=inspectNearby;
const toolsMenu=mountDetectiveTools({canOpen:playable,reducedMotion:()=>$('reduce-motion').checked,onFile:()=>caseFolder.open(),onBriefing:()=>panels.showBriefing(),onLens:()=>{
 if(performance.now()<lensCooldown){toast('Let the lens settle for '+Math.ceil((lensCooldown-performance.now())/1000)+' seconds.');return;}
 lensCooldown=performance.now()+8000;world.revealClues(found);lensStatus.hidden=false;clearTimeout(lensTimer);
 document.querySelectorAll('.lens-region').forEach(region=>region.remove());
 for(const clue of clues.filter(c=>!found.has(c.id))){const point=world.project(clue.id);if(!point.visible)continue;const region=document.createElement('span');region.className='lens-region';region.dataset.clue=clue.id;region.setAttribute('aria-hidden','true');region.style.left=point.x+'px';region.style.top=point.y+'px';$('game-ui').append(region);}
 lensTimer=setTimeout(()=>{lensStatus.hidden=true;document.querySelectorAll('.lens-region').forEach(region=>region.remove());},1000);
}});

function togglePOV(){if(!playable())return;if(world.togglePOV()&&world.firstPerson)toast('Cat’s-eye view · Drag the scene or use I J K L to look · V to switch back');}
$('pov-toggle').onclick=togglePOV;
document.addEventListener('keydown',e=>{if(e.repeat||!playable()||/INPUT|TEXTAREA/.test(document.activeElement?.tagName))return;if(e.code==='KeyV'){e.preventDefault();togglePOV();}if(e.code==='KeyE'){e.preventDefault();inspectNearby();}if(e.code==='KeyT'){e.preventDefault();toolsMenu.open();}});
function updateExploration(){
 if(world&&opened){const blocked=cinematic.active||titleScreen.active||document.body.classList.contains('tools-open')||Boolean(document.querySelector('dialog[open]'));world.setPaused(blocked);const active=playable();nearby=active?world.nearby():[];
 if(!nearby.some(o=>o.id===selectedObject?.id))selectedObject=nearby[0]||null;
 const container=selectedObject&&containerIds.has(selectedObject.id);const openingState=container?crateProgress.get(selectedObject.id):null;
 progressUI.update(container&&openingState.status!=='open'?selectedObject.id:null,openingState);prompt.querySelector('.inspect-nearby').disabled=openingState?.status==='opening';
 prompt.hidden=!selectedObject;world.nearTarget(active?selectedObject:null);
 document.querySelectorAll('.lens-region').forEach(region=>{const p=world.project(region.dataset.clue);region.hidden=!active||!p.visible;region.style.left=p.x+'px';region.style.top=p.y+'px';});
 if(selectedObject){const p=world.projectObject(selectedObject);prompt.hidden=!p.visible;prompt.querySelector('.nearby-name').textContent=selectedObject.name;prompt.style.left=p.x+'px';prompt.style.top=(p.y-14)+'px';progressHost.hidden=!(container&&openingState.status!=='open')||!p.visible;prompt.querySelectorAll('.nearby-cycle').forEach(b=>b.hidden=nearby.length<2);}

 }requestAnimationFrame(updateExploration);
}updateExploration();
attachMovementControls({pad:$('movement-pad'),thumb:$('movement-thumb'),enabled:()=>Boolean(world&&!world.switchingView&&opened&&!cinematic.active&&!titleScreen.active&&!photoMode&&world.state==='investigate'&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('tools-open')),onMove:(x,y)=>world?.setMovement(x,y)});

import './field-hud.css';

import './investigation-ui.css';


import './pov-camera.css';

