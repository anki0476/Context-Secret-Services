import {characterAnimation} from './character-animation.js';
import './characters.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const canvas=document.querySelector('#studio'),status=document.querySelector('#status');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,40);camera.position.set(2.5,1.6,4);const orbit=new OrbitControls(camera,canvas);orbit.target.set(0,.97,0);orbit.enableDamping=true;orbit.minDistance=.7;orbit.maxDistance=6;orbit.maxPolarAngle=Math.PI*.52;
scene.add(new THREE.HemisphereLight(0xe8f6ff,0xa194a7,2));
for(const [color,intensity,x,y,z] of [[0xffdfc2,3,-3,5,4],[0x9dddf5,2,3,2,-2]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(x,y,z);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.normalBias=.015;scene.add(light);}
const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.06,80),new THREE.MeshStandardMaterial({color:0xd0d5e8,roughness:.8}));plinth.position.y=-.035;plinth.receiveShadow=true;scene.add(plinth);
let actor,motion,walking=false,request=0;const loader=new GLTFLoader();
async function choose(name){const ticket=++request;status.hidden=false;status.textContent='Loading the character…';try{const gltf=await loader.loadAsync('/models/'+name+'.glb');if(ticket!==request)return;if(actor)scene.remove(actor);actor=gltf.scene;scene.add(actor);actor.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});motion=characterAnimation(gltf);status.hidden=true;}catch{status.textContent='The character could not load. Please refresh to retry.';}}
document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-model]').forEach(x=>x.classList.toggle('selected',x===b));choose(b.dataset.model);});
document.querySelector('#walk').onclick=e=>{walking=!walking;e.target.setAttribute('aria-pressed',String(walking));e.target.textContent=walking?'Stand':'Walk';motion?.update(0,walking?1:0);};
document.querySelector('#inspect-pose').onclick=()=>motion?.inspect();
const clock=new THREE.Clock();function tick(){requestAnimationFrame(tick);const dt=Math.min(clock.getDelta(),.05),w=canvas.clientWidth,h=canvas.clientHeight;if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}motion?.update(dt,walking?1:0);orbit.update();renderer.render(scene,camera);}choose('calico-detective');tick();
