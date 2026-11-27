import {context,navigateTo} from '@devvit/client';
import {openDiscussion} from './discussion.js';
import {makeReport} from './community-reports.js';
import './community.css';
let solved=false;
try{solved=sessionStorage.getItem('css:case001:solved')==='yes';}catch{}
export function unlockCommunity(){solved=true;try{sessionStorage.setItem('css:case001:solved','yes');}catch{}}
const nested=new URLSearchParams(location.search).has('landscape-player');
function loadReports(){
  if(!nested)return fetch('/api/investigations').then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error);return data;});
  return new Promise((resolve,reject)=>{
    const requestId=crypto.randomUUID();
    const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);};
    const receive=e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='css:reports-result'||e.data.requestId!==requestId)return;cleanup();e.data.error?reject(Error(e.data.error)):resolve(e.data.data);};
    const timer=setTimeout(()=>{cleanup();reject(Error('The community connection timed out. Please retry.'));},12000);
    window.addEventListener('message',receive);parent.postMessage({type:'css:reports',requestId},location.origin);
  });
}
function openComment(url){
  if(nested)parent.postMessage({type:'css:report-comment',url},location.origin);
  else if(context)navigateTo(url);else window.open(url,'_blank','noopener,noreferrer');
}
function panel(title){
  const d=document.createElement('dialog');d.className='community-dialog';
  const close=document.createElement('button');close.className='secondary';close.textContent='Close';close.onclick=()=>d.close();
  const heading=document.createElement('h2');heading.textContent=title;d.append(heading,close);
  d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();return d;
}
function paragraph(d,text){const p=document.createElement('p');p.textContent=text;d.append(p);return p;}
export function previewReport(caption){
  const d=panel('Share your investigation');let report;
  try{report=makeReport(caption);}catch(e){paragraph(d,e.message);return;}
  paragraph(d,'Your caption stays yours. Copy this report, then paste it into the case comments and press Reddit’s Post button. Nothing is published by this game.');
  const preview=document.createElement('textarea');preview.value=report;preview.readOnly=true;preview.rows=7;preview.setAttribute('aria-label','Exact Reddit comment preview');d.append(preview);
  paragraph(d,'Keep the case heading and spoiler marks. A moderator must approve your comment before it appears in the in-game gallery. Keep jokes about the fictional case; avoid harassment, hate, threats and personal information.');
  const status=paragraph(d,'');status.setAttribute('role','status');
  const copy=document.createElement('button');copy.className='primary';copy.textContent='Copy report';copy.onclick=async()=>{try{await navigator.clipboard.writeText(report);status.textContent='Copied. Open comments, paste, and choose Post when ready.';}catch{preview.focus();preview.select();status.textContent='Copy the selected report manually, then open comments.';}};
  const open=document.createElement('button');open.className='secondary';open.textContent='Open Reddit comments';open.onclick=openDiscussion;d.append(copy,open);
}
export async function showInvestigations(){
  const d=panel('Community investigations');
  if(!solved){paragraph(d,'Solve this case first to reveal other players’ captions without spoiling your investigation.');return;}
  paragraph(d,'Moderator-approved captions from this case’s latest 100 comments. Open a comment to report it, delete your own, or use moderator controls.');
  const status=paragraph(d,'Loading investigations…');status.setAttribute('role','status');
  const list=document.createElement('div');d.append(list);
  const refresh=document.createElement('button');refresh.className='secondary';refresh.textContent='Refresh reports';d.append(refresh);
  async function refreshReports(){refresh.disabled=true;list.replaceChildren();status.textContent='Loading investigations…';try{
    const {reports}=await loadReports();if(!d.open)return;
    status.textContent=reports.length?'':'No approved reports yet. Share yours after solving the case.';
    for(const report of reports){const card=document.createElement('article');const author=document.createElement('strong');author.textContent=`u/${report.author}`;const text=document.createElement('p');text.textContent=report.caption;const action=document.createElement('button');action.className='secondary';action.textContent='Open comment · report / manage';action.onclick=()=>openComment(report.url);card.append(author,text,action);list.append(card);}
  }catch(e){status.textContent=e.message || 'Unable to load reports.';}finally{refresh.disabled=false;}}
  refresh.onclick=refreshReports;await refreshReports();
}
