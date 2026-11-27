import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPOVCamera} from '../src/pov-camera.js';

test('POV smoothly reaches eye level, pauses, and restores the exact overhead framing',()=>{
 const oldWindow=globalThis.window;globalThis.window=new EventTarget();
 const canvas=new EventTarget();canvas.hasPointerCapture=()=>false;
 const camera=new THREE.PerspectiveCamera(38,1.6,.1,100);
 camera.position.set(13,14,17);camera.lookAt(0,.8,0);
 const original=camera.position.clone(),rotation=camera.quaternion.clone();
 const controls={target:new THREE.Vector3(0,.8,0),enabled:true,update(){}};
 const detective=new THREE.Group();detective.position.set(-3.6,.08,2.8);
 let enabled=true;
 const rig=createPOVCamera({camera,controls,detective,canvas,enabled:()=>enabled,reducedMotion:()=>false});
 try{
  assert.equal(rig.request(true),true);assert.equal(rig.request(false),false);
  assert.ok(camera.position.equals(original),'switch begins without a teleport');
  rig.update(.4);const midway=camera.position.clone();assert.ok(midway.y>2&&midway.y<15);
  enabled=false;rig.update(2);assert.ok(camera.position.equals(midway),'a modal pauses camera travel');
  enabled=true;rig.update(1.1);rig.update(.01);
  assert.equal(rig.transitioning,false);assert.equal(detective.visible,false);
  assert.ok(Math.abs(camera.position.y-1.98)<1e-6);assert.equal(camera.fov,68);
  detective.position.x+=.3;rig.update(.016);assert.equal(camera.position.x,detective.position.x);
  assert.equal(rig.request(false),true);rig.update(1.5);
  assert.ok(camera.position.distanceTo(original)<1e-8);assert.ok(camera.quaternion.angleTo(rotation)<1e-7);
  assert.equal(camera.fov,38);assert.equal(detective.visible,true);assert.equal(controls.enabled,true);
  assert.ok(Math.abs(detective.position.x+3.3)<1e-8,'switching view preserves the player position');
 }finally{rig.dispose();globalThis.window=oldWindow;}
});
