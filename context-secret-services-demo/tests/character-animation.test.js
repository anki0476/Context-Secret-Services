import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {characterAnimation} from '../src/character-animation.js';

async function loadModel(){
 const source=fs.readFileSync(new URL('../public/models/calico-detective.glb',import.meta.url));
 const jsonLength=source.readUInt32LE(12),json=JSON.parse(source.subarray(20,20+jsonLength).toString());
 // Texture decoding needs a browser. Keep the actual meshes, skin and animation buffers.
 delete json.images;delete json.textures;delete json.materials;
 for(const mesh of json.meshes)for(const primitive of mesh.primitives)delete primitive.material;
 const text=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(padded);
 const binary=source.subarray(20+jsonLength),out=Buffer.alloc(20+padded.length+binary.length);
 out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16);padded.copy(out,20);binary.copy(out,20+padded.length);
 return new GLTFLoader().parseAsync(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'');
}
test('export contains skinned articulated joints and three distinct animation clips',async()=>{
 const model=await loadModel();let skins=0;model.scene.traverse(o=>{if(o.isSkinnedMesh)skins++;});assert.ok(skins>0);
 for(const name of ['Idle','Walk','Inspect'])assert.ok(model.animations.find(a=>a.name===name));
 for(const name of ['ThighL','ShinL','FootL','ForearmL','Tail3'])assert.ok(model.scene.getObjectByName(name)?.isBone);
});
test('walk stance maintains foot height while advancing the planted contact backward',async()=>{
 const model=await loadModel(),mixer=new THREE.AnimationMixer(model.scene);mixer.clipAction(model.animations.find(a=>a.name==='Walk')).play();
 const foot=model.scene.getObjectByName('FootL');const positions=[];
 for(const t of [.08,.20,.36]){mixer.setTime(t);model.scene.updateMatrixWorld(true);positions.push(foot.getWorldPosition(new THREE.Vector3()));}
 assert.ok(Math.max(...positions.map(p=>p.y))-Math.min(...positions.map(p=>p.y))<.025);
 assert.ok(Math.abs(positions[2].z-positions[0].z)>.12);
});

test('rear hat brim stays head-bound instead of following the ears',async()=>{
 const model=await loadModel();let brim;
 model.scene.traverse(o=>{if(o.name.replace(/\W|_/g,'')==='Capshortrearpeak')brim=o;});
 assert.ok(brim?.isSkinnedMesh,'export includes the skinned rear hat brim');
 const joints=brim.geometry.attributes.skinIndex,weights=brim.geometry.attributes.skinWeight;
 for(let i=0;i<joints.count;i++)for(let c=0;c<4;c++){
  if(weights.getComponent(i,c)>1e-5)assert.equal(brim.skeleton.bones[joints.getComponent(i,c)].name,'Head');
 }
});
test('idle stays alive, inspect blends back, and rapid walking transitions stay finite',async()=>{
 const model=await loadModel(),motion=characterAnimation(model);const head=model.scene.getObjectByName('Head');
 const initial=head.quaternion.clone();for(let i=0;i<45;i++)motion.update(1/60,0);assert.ok(initial.angleTo(head.quaternion)>.001);
 motion.inspect();for(let i=0;i<150;i++)motion.update(1/60,0,{worldSpeed:i<30?1.5:0,turnRate:i<50?2:0});
 model.scene.traverse(o=>{assert.ok([...o.position,...o.quaternion,...o.scale].every(Number.isFinite));});
 motion.reset();motion.update(1/60,0);assert.ok(head.quaternion.length()>.99);
});
