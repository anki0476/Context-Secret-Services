export function attachMovementControls({pad,thumb,enabled,onMove}){
  const held=new Set();let pointer=null,stick={x:0,y:0};
  const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  const editing=()=>/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
  function reset(){held.clear();stick={x:0,y:0};thumb.style.transform='translate(0px,0px)';pad.classList.remove('engaged');if(pointer!==null&&pad.hasPointerCapture(pointer))pad.releasePointerCapture(pointer);pointer=null;onMove(0,0);}
  function updatePointer(e){const r=pad.getBoundingClientRect(),radius=r.width*.3;let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}stick=length<.12?{x:0,y:0}:{x,y};thumb.style.transform=`translate(${x*radius}px,${y*radius}px)`;}
  pad.addEventListener('pointerdown',e=>{if(!enabled()||pointer!==null||e.button!==0)return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);pad.classList.add('engaged');updatePointer(e);});
  pad.addEventListener('pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();updatePointer(e);}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===pointer)reset();});
  window.addEventListener('keydown',e=>{if(!movementKeys.has(e.code)||!enabled()||editing()||e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();held.add(e.code);});
  window.addEventListener('keyup',e=>held.delete(e.code));
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  function frame(){if(!enabled()){if(pointer!==null||held.size||stick.x||stick.y)reset();onMove(0,0);}else{
    const x=stick.x+Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'));
    const y=stick.y+Number(held.has('KeyS')||held.has('ArrowDown'))-Number(held.has('KeyW')||held.has('ArrowUp'));
    const length=Math.max(1,Math.hypot(x,y));onMove(x/length,y/length);
  }requestAnimationFrame(frame);}frame();
  return {reset};
}
