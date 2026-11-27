import * as THREE from 'three';

const EYE_HEIGHT=1.90;
export const easeCamera=t=>t*t*t*(t*(t*6-15)+10);
export const clampPitch=p=>Math.max(-1.05,Math.min(.85,p));

// A single camera travels between the diorama and the detective's eyes.
export function createPOVCamera({camera,controls,detective,canvas,enabled,reducedMotion,onChange}){
 let active=false,flight=null,saved=null,yaw=0,pitch=-.12,targetYaw=0,targetPitch=-.12,drag=null,hasEntered=false;
 const lookKeys=new Set(),up=new THREE.Vector3(0,1,0),aim=new THREE.Vector3();
 const eye=()=>new THREE.Vector3(detective.position.x,EYE_HEIGHT+ .08,detective.position.z);
 const direction=()=>new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
 function eyeRotation(){const temporary=new THREE.PerspectiveCamera();temporary.position.copy(eye());temporary.lookAt(eye().add(direction()));return temporary.quaternion.clone();}
 const materials=new Set();
 function opacity(amount){
  detective.visible=amount>.001;
  if(!materials.size)detective.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of [].concat(o.material))materials.add(m);}});
  for(const m of materials){const transparent=amount<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=amount;}
 }
 function release(){lookKeys.clear();if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);drag=null;}
 function request(value,{restore=false}={}){
  if(flight||(!restore&&(!enabled()||active===value)))return false;
  release();controls.enabled=false;
  if(value&&!restore){saved={position:camera.position.clone(),target:controls.target.clone(),rotation:camera.quaternion.clone(),fov:camera.fov,zoom:camera.zoom};yaw=targetYaw=hasEntered?detective.rotation.y:Math.atan2(-detective.position.x,-detective.position.z);hasEntered=true;pitch=targetPitch=-.12;}
  active=value;
  const destination=value?eye():saved.position;
  flight={elapsed:0,duration:reducedMotion()?.05:1.5,from:camera.position.clone(),to:destination.clone(),fromRotation:camera.quaternion.clone(),toRotation:value?eyeRotation():saved.rotation.clone(),fromFov:camera.fov,toFov:value?68:saved.fov,fromZoom:camera.zoom,toZoom:value?1:saved.zoom};
  // Approach vertically above the cat instead of flying through the reception table.
  flight.control=new THREE.Vector3(detective.position.x,Math.max(flight.from.y,flight.to.y)+1.2,detective.position.z);
  onChange?.(active,true);return true;
 }
 function update(dt){
  if(!enabled())return;
  if(flight){
   const f=flight;f.elapsed+=dt;const t=Math.min(1,f.elapsed/f.duration),e=easeCamera(t);
   camera.position.copy(f.from).multiplyScalar((1-e)**2).addScaledVector(f.control,2*(1-e)*e).addScaledVector(f.to,e*e);
   camera.quaternion.slerpQuaternions(f.fromRotation,f.toRotation,e);
   camera.fov=THREE.MathUtils.lerp(f.fromFov,f.toFov,e);camera.zoom=THREE.MathUtils.lerp(f.fromZoom,f.toZoom,e);camera.updateProjectionMatrix();
   opacity(active?1-THREE.MathUtils.smoothstep(e,0,.3):THREE.MathUtils.smoothstep(e,.7,1));
   if(t===1){flight=null;if(!active){controls.target.copy(saved.target);controls.enabled=true;controls.update();}else{detective.rotation.y=yaw;controls.target.copy(eye().add(direction()));}onChange?.(active,false);}
  }else if(active){
   targetYaw+=(Number(lookKeys.has('KeyJ'))-Number(lookKeys.has('KeyL')))*dt*1.6;
   targetPitch=clampPitch(targetPitch+(Number(lookKeys.has('KeyI'))-Number(lookKeys.has('KeyK')))*dt*1.1);
   yaw=THREE.MathUtils.damp(yaw,targetYaw,18,dt);pitch=THREE.MathUtils.damp(pitch,targetPitch,18,dt);
   detective.rotation.y=yaw;camera.position.copy(eye());aim.copy(camera.position).add(direction());camera.up.copy(up);camera.lookAt(aim);controls.target.copy(aim);detective.visible=false;
  }
 }
 const canLook=()=>active&&!flight&&enabled();
 const down=e=>{if(!canLook()||drag||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);e.preventDefault();};
 const move=e=>{if(!drag||drag.id!==e.pointerId)return;if(!canLook()){release();return;}const scale=2.5/Math.max(320,canvas.clientHeight);targetYaw-=(e.clientX-drag.x)*scale;targetPitch=clampPitch(targetPitch-(e.clientY-drag.y)*scale);drag.x=e.clientX;drag.y=e.clientY;e.preventDefault();};
 const end=e=>{if(e.pointerId===drag?.id)release();};
 const keydown=e=>{if(!canLook()||!['KeyI','KeyJ','KeyK','KeyL'].includes(e.code)||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;e.preventDefault();lookKeys.add(e.code);};
 const keyup=e=>lookKeys.delete(e.code);
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,end);
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',release);
 return {request,update,release,get active(){return active;},get transitioning(){return !!flight;},get yaw(){return yaw;},reset(){release();active=false;hasEntered=false;flight=null;opacity(1);camera.fov=38;camera.zoom=1;camera.updateProjectionMatrix();onChange?.(false,false);},dispose(){release();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.removeEventListener(type,end);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);}};
}
