import {nearbyObjects,LENS_DURATION,lensVisible} from './exploration.js';
import {createPOVCamera} from './pov-camera.js';
import {dummyCrates} from './crate-progress.js';
import {buildPartyProps} from './party-props.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {characterAnimation} from './character-animation.js';
import {createLocomotion} from './locomotion.js';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {moveOnTerrace,cameraRelativeMovement} from './movement.js';

const C={stone:0x737ac3,tile:0xe9d5f2,wall:0xbfc6f5,teal:0x108d9c,dark:0x254b54,wood:0xa97350,cream:0xffe8b5,pink:0xf297a1,green:0x329b52,lightgreen:0x99d946,gold:0xe6b66b};
export function createWorld(canvas,{onReady,onSelect,onTransitionEnd,onViewChange,reducedMotion=()=>false}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.91;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x91cddd);scene.fog=new THREE.Fog(0x91cddd,38,85);
 const pmrem=new THREE.PMREMGenerator(renderer),roomEnv=new RoomEnvironment(),environment=pmrem.fromScene(roomEnv,.04);scene.environment=environment.texture;scene.environmentIntensity=.28;roomEnv.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);const controls=new OrbitControls(camera,canvas);controls.enabled=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=10;controls.maxDistance=26;controls.minPolarAngle=.32;controls.maxPolarAngle=1.18;controls.target.set(0,1,0);
 const hemi=new THREE.HemisphereLight(0xd4e9ff,0x7776b2,.85);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffedda,2.5);sun.position.set(-8,16,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sun.shadow.radius=4;sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;scene.add(sun);const fill=new THREE.DirectionalLight(0x9bceef,.65);fill.position.set(10,6,-5);scene.add(fill);
 const mats=new Map();function material(color,extra={}){const key=String(color)+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.83,metalness:0,...extra}));return mats.get(key);}
 function mesh(geo,color,parent=scene,extra){const m=new THREE.Mesh(geo,typeof color==='object'?color:material(color,extra));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,color,x,y,z,parent=scene,r=.05){const m=mesh(new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/3,h/3,d/3)),color,parent);m.position.set(x,y,z);return m;}
 function cyl(rt,rb,h,color,x,y,z,parent=scene,n=16){const m=mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,parent);m.position.set(x,y,z);return m;}
 function ball(r,color,x,y,z,parent=scene,detail=1){const m=mesh(new THREE.IcosahedronGeometry(r,detail),color,parent);m.position.set(x,y,z);return m;}
 function group(x,y,z,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
 function bar(a,b,r,color,parent=scene){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),m=cyl(r,r,av.distanceTo(bv),color,0,0,0,parent,8);m.position.copy(av.clone().add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return m;}
 function textPlane(text,w,h,{bg='#fce6bc',fg='#365b58',size=60,font='bold',border=false}={},parent=scene){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);if(border){ctx.strokeStyle=fg;ctx.lineWidth=5;ctx.strokeRect(20,20,c.width-40,c.height-40);}ctx.fillStyle=fg;ctx.font=`${font} ${size}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';const lines=text.split('\n');lines.forEach((l,i)=>ctx.fillText(l,512,c.height/2+(i-(lines.length-1)/2)*size*1.3,940));const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.85,side:THREE.DoubleSide}),parent);return m;}
 // A tiny cliff-top reception, with sculpted stone foundations and a tiled open room.
 box(14,.75,10.8,C.stone,0,-.55,0,scene,.2);box(13.5,.2,10.4,C.cream,0,-.09,0,scene,.07);
 const tiles=[0xece5f5,0xc8c4e5,0xe0d6ee,0xf5e6dc];for(let x=0;x<13;x++)for(let z=0;z<10;z++)box(.98,.07,.98,tiles[(x*7+z*3)%4],x-6,.035,z-4.5,scene,.025);
 for(let i=0;i<18;i++){const a=i*Math.PI*2/18;const rock=ball(1.6, i%2?0x727db2:0x97a7c8,Math.cos(a)*5.7,-1.75,Math.sin(a)*4.15,scene,0);rock.scale.set(1,.9,1);rock.rotation.y=i;}
 // Back wall: open arched window bays, teal joinery, warm glazed panes.
 box(13.5,.8,.4,C.wall,0,.42,-5);box(13.5,.32,.55,C.cream,0,.95,-5);
 for(const x of [-6.5,-3.4,0,3.4,6.5]){box(.4,3.5,.5,C.wall,x,2.6,-5);box(.6,.2,.7,C.cream,x,4.25,-5);}
 for(const x of [-4.95,-1.7,1.7,4.95]){box(2.8,.18,.48,C.teal,x,3.85,-4.96);box(.12,2.7,.16,C.teal,x,2.35,-4.7);box(2.85,.12,.16,C.teal,x,2.6,-4.7);const pane=box(2.8,2.6,.04,0x90b6b6,x,2.35,-5.03);pane.material=material(0x6cabb1,{transparent:true,opacity:.22});for(const side of [-1,1])box(.13,2.8,.2,C.teal,x+side*1.38,2.35,-4.7);}
 box(13.8,.3,.65,C.wall,0,4.3,-5);box(13.9,.16,.75,C.cream,0,4.5,-5);
 // Low side walls preserve the investigation view; the tall entrance stands behind the host.
 box(.4,.72,10,C.wall,-6.6,.4,0);box(.65,.16,10.2,C.cream,-6.6,.84,0);box(.4,.72,6.1,C.wall,6.6,.4,-2);box(.65,.16,6.3,C.cream,6.6,.84,-2);
 box(.4,3,1,C.wall,6.6,1.6,-3.3);box(.4,3,1,C.wall,6.6,1.6,.3);box(.45,.45,4.6,C.wall,6.6,3.3,-1.5);box(.2,2.7,2.6,C.teal,6.7,1.45,-1.5);for(const z of [-2.4,-.6])box(.15,1.8,.65,0x749c9b,6.55,1.7,z);ball(.08,C.gold,6.4,1.3,-.7);
 for(let s=0;s<5;s++)box(2.6,.2*(s+1),.55,C.stone,5,-.75+s*.1,5.4-s*.5);
 // Smaller city buildings, a harbor, and distant suspended greenery establish a miniature world.
 const water=mesh(new THREE.PlaneGeometry(180,180),material(0x32c1d3,{roughness:.36,metalness:.15}));water.rotation.x=-Math.PI/2;water.position.y=-3.5;
 // Layered miniature skyline: terraces, bright shop panels and hanging gardens.
 for(let i=0;i<15;i++){
  const x=-24+(i%8)*6.5,z=-15-Math.floor(i/8)*9,h=3+(i*7%6),col=[0x708dcc,0xb17cba,0x4c9cab,0xd08d92][i%4];
  box(3.8,h,3.8,col,x,-3+h/2,z,scene,.2);box(4.1,.22,4.1,0x52628d,x,h-2.9,z);box(3.5,.15,3.4,0x70ad69,x,h-2.72,z);
  for(let level=0;level<Math.floor(h/1.25);level++){for(let q=0;q<3;q++)box(.55,.7,.05,level%2?0xffd883:0x8fe0e7,x-.95+q*.95,-2+level*1.25,z+1.94);box(4,.12,.22,0x6c6098,x,-2.5+level*1.25,z+1.98);}
  const sign=textPlane(['SODA','CAFE','HELLO','BAKERY'][i%4],1.7,.55,{bg:['#f24e9c','#00a4b9','#8464de','#ed9254'][i%4],fg:'#fff9d6',size:185});sign.position.set(x+.3,h-3.7,z+2.01);
  for(let k=0;k<5;k++){const vine=ball(.37,k%2?0x3b9860:0x9acb50,x-1.7+(k%2)*.22,h-2.8-k*.24,z+1.9,scene,1);vine.scale.set(1.4,.65,.8);}
  box(.8,.7,.8,0x606d9e,x+.8,h-2.35,z-.5,scene,.09);
 }
 // Local architectural detailing: roof garden, pilaster bands and inset tile border.
 for(const x of [-6.5,-3.4,0,3.4,6.5]){box(.44,.16,.56,0x8073b7,x,1.25,-5);box(.46,.15,.58,0x8073b7,x,3.72,-5);}
 for(let i=0;i<28;i++){const x=-6.5+i*.48;const bush=ball(.30,i%3?0x26894c:0x80be34,x,4.68,-5.05,scene,1);bush.scale.set(1.3,.65,1.2);if(i%4===0)for(let j=0;j<4;j++)ball(.25,0x37934c,x+.14*Math.sin(j),4.45-j*.20,-4.72,scene,1);}
 for(const z of [-4.4,4.4])for(let i=0;i<26;i++)box(.37,.025,.12,i%2?0x8670cc:0x11b9b2,-6.25+i*.5,.09,z);

 const propKit=buildPartyProps(scene,textPlane);
 // Stylized, deliberately non-photoreal characters with readable silhouettes.
 function person(x,z,kind){const g=group(x,.08,z);const detective=kind==='detective',skin=detective?0xbc815c:0xe5b593,coat=detective?0x214f59:0x27363b;
  for(const s of [-1,1]){box(.24,.65,.28,0x384652,s*.19,.5,0,g,.06);box(.32,.2,.49,detective?0xf0d6ae:0x28383d,s*.19,.17,.1,g,.07);}
  const torso=box(.9,.9,.5,coat,0,1.2,0,g,.16);box(.28,.52,.05,detective?0xe7a667:0x303d3e,0,1.46,.28,g);for(const s of [-1,1]){const lapel=box(.17,.42,.05,detective?0x306873:0x405052,s*.22,1.4,.29,g);lapel.rotation.z=s*.3;const arm=box(.25,.78,.27,coat,s*.54,1.18,0,g,.09);arm.rotation.z=s*.12;ball(.14,skin,s*.58,.79,.02,g);}
  const head=ball(.46,skin,0,1.98,0,g,2);head.scale.set(.91,1.07,.88);ball(.105,skin,-.43,1.98,0,g);ball(.105,skin,.43,1.98,0,g);ball(.085,skin,0,1.94,.4,g);
  for(const s of [-1,1]){ball(.043,0x243938,s*.17,2.04,.37,g,2);const brow=box(.19,.045,.05,detective?0x3b3030:0x737975,s*.17,2.17,.36,g,.01);brow.rotation.z=s*-.1;}
  const mouth=box(.14,.025,.03,0x84564a,0,1.8,.38,g,.01);for(let i=0;i<8;i++){const a=i*Math.PI/4;ball(detective?.22:.17,detective?0x3b3030:0xbac0b9,Math.cos(a)*.28,2.28+(i%3)*.025,Math.sin(a)*.21,g,1);}ball(detective?.25:.23,detective?0x3b3030:0xcbd0c3,0,2.36,-.04,g,1);
  if(detective){bar([-.36,1.65,.3],[.4,.83,.31],.045,0xb88757,g);box(.39,.37,.17,0xba8859,.37,.85,.35,g,.08);box(.1,.11,.03,C.gold,.37,.9,.45,g);for(const yy of [1.1,1.35])for(const xx of [-.16,.16])ball(.035,C.gold,xx,yy,.28,g);}
  return g;
 }
 const host=person(1.9,-1.75,'host');host.rotation.y=.15;const detective=group(-3.6,.08,2.8);detective.rotation.y=.65;
 const movingParts=detective.children.filter(m=>m.geometry?.parameters?.height===.78||m.geometry?.parameters?.height===.65);
 const limbRest=movingParts.map(m=>m.rotation.x);
 let characterMotion=null,hostMotion=null,riggedDetective=false;
 const locomotion=createLocomotion();let inspectingUntil=0,inspectionTarget=null;
 const loader=new GLTFLoader();
 const assetsReady=Promise.all([
  loader.loadAsync('/models/calico-detective.glb').then(gltf=>{
   detective.clear();gltf.scene.scale.setScalar(1.3);detective.add(gltf.scene);
   gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
   characterMotion=characterAnimation(gltf);
   riggedDetective=true;
  }),
  loader.loadAsync('/models/party-host.glb').then(gltf=>{
   host.clear();gltf.scene.scale.setScalar(1.42);host.add(gltf.scene);hostMotion=characterAnimation(gltf);hostMotion.update(0,0);
   gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  })
 ]);
 const input={x:0,y:0};let lastFrame=performance.now(),stride=0;
 function setMovement(x,y){input.x=x;input.y=y;if(x||y)walk=null;}
 // Planter boxes and little coral flowers along the parapet.
 for(const x of [-4.6,-1.6,1.6,4.6]){box(1.6,.36,.5,0xb67e60,x,1.09,-4.55);for(let i=0;i<7;i++){const xx=x-.65+i*.21;ball(.24,i%2?0x759961:0x93af69,xx,1.4,-4.55);if(i%2===0){for(let p=0;p<5;p++){const a=p*Math.PI*2/5;ball(.09,0xe99d7a,xx+Math.cos(a)*.12,1.61,-4.5+Math.sin(a)*.12);}ball(.06,0xe8c875,xx,1.67,-4.5);}}}
 // Welcome banner sits outside the initial crop, along the left side of the room.
 const banner=group(-5.55,0,-.8);box(.12,3.65,.12,C.gold,-.74,1.9,0,banner);box(.12,3.65,.12,C.gold,.74,1.9,0,banner);const bn=textPlane('WELCOME\nBACK, BOSS',1.55,1.25,{bg:'#e8b88b',fg:'#315f5b',size:125,border:true},banner);bn.position.set(0,2.9,.06);banner.rotation.y=.55;box(1.8,.13,.65,C.dark,-5.55,.12,-.8);
 // Trolley with receipt, a phone console, and packing that conceals the new sugar plaque.
 box(1.5,1,.75,C.teal,-3.2,.6,-2.8);box(1.7,.13,.95,C.wood,-3.2,1.15,-2.8);const phone=box(.34,.06,.65,0x1f303a,-3.05,1.25,-2.6);phone.rotation.y=-.3;const screen=textPlane('18:12\nHE’S BACK',.28,.5,{bg:'#bddcd0',size:110});screen.rotation.x=-Math.PI/2;screen.rotation.z=.3;screen.position.set(-3.05,1.285,-2.6);cyl(.14,.14,.28,C.cream,-3.6,1.36,-2.9);
 const storage=group(-2.6,0,1.3);box(1.3,.12,.9,0x815de1,0,.16,0,storage);
 for(const x of [-.6,.6])box(.1,.72,.9,0x815de1,x,.56,0,storage);
 for(const z of [-.4,.4])box(1.3,.72,.1,0x815de1,0,.56,z,storage);
 const storageLid=group(0,.94,-.45,storage);box(1.4,.16,1,0xc2a8ef,0,.04,.45,storageLid);box(.3,.15,.1,C.dark,0,-.05,.95,storageLid);
 const label=textPlane('COLD STORAGE\n#0417 · 17—24 NOV',1,.36,{bg:'#e9e9c6',size:82},storage);label.rotation.x=-Math.PI/2;label.position.set(0,.235,0);
 const containers={storage:{lid:storageLid,closed:0,open:-1.85},packing:{lid:propKit.packingLid,closed:Math.PI/2,open:-.37}};
 for(const crate of dummyCrates){
  const body=group(crate.x,0,crate.z);box(1.05,.12,.85,crate.color,0,.16,0,body);
  for(const x of [-.49,.49])box(.08,.65,.85,crate.color,x,.5,0,body);
  for(const z of [-.39,.39]){box(1.05,.65,.08,crate.color,0,.5,z,body);for(const x of [-.33,.33])box(.07,.64,.025,C.cream,x,.5,z+Math.sign(z)*.05,body);}
  const lid=group(0,.85,-.43,body);box(1.12,.12,.9,crate.color,0,.03,.43,lid);box(.24,.12,.04,C.gold,0,-.04,.91,lid);
  for(let i=0;i<3;i++){if(crate.id==='supplies-napkins')box(.65,.06,.42,C.cream,0,.25+i*.065,0,body);else{const roll=cyl(.11,.11,.25,crate.id==='supplies-cups'?C.cream:C.pink,-.28+i*.28,.35,0,body,24);if(crate.id==='supplies-ribbons')roll.rotation.x=Math.PI/2;}}
  containers[crate.id]={lid,closed:0,open:-1.85};
 }
 function nudgeContainer(id){const c=containers[id];if(c&&!c.opening&&!c.opened)c.pulse=0;}
 function openContainer(id){const c=containers[id];if(!c)return Promise.resolve();if(c.opened)return Promise.resolve();if(c.promise)return c.promise;c.pulse=null;c.opening=0;c.promise=new Promise(resolve=>c.resolve=resolve);return c.promise;}
 function resetContainers(){for(const c of Object.values(containers)){c.resolve?.(false);c.resolve=null;c.promise=null;c.opening=null;c.opened=false;c.pulse=null;c.lid.rotation.x=c.closed;}}
 function updateContainers(dt){for(const c of Object.values(containers)){if(c.opening!=null){c.opening+=dt;const t=Math.min(1,c.opening/(reducedMotion()?.05:.95)),e=1-Math.pow(1-t,3);c.lid.rotation.x=THREE.MathUtils.lerp(c.closed,c.open,e);if(t===1){c.opening=null;c.opened=true;c.resolve?.(true);c.resolve=null;}}else if(c.pulse!=null){c.pulse+=dt;const t=Math.min(1,c.pulse/.22);c.lid.rotation.x=c.closed-Math.sin(t*Math.PI)*(reducedMotion()?0:.065);if(t===1)c.pulse=null;}}}

 // Paper lanterns and triangular bunting make the party feel lived in.
 for(let i=0;i<7;i++){const x=-5.5+i*1.8,y=4.15-Math.sin(i/6*Math.PI)*.55;bar([x,y+.35,-3.9],[x,y,-3.9],.015,C.dark);const lantern=ball(.26,i%2?0xffbe31:0xff5987,x,y-.27,-3.9);lantern.scale.set(1,1.25,1);cyl(.12,.12,.06,C.gold,x,y-.57,-3.9);}
 for(let i=0;i<15;i++){const x=-6+i*.85,y=3.85-Math.sin(i/14*Math.PI)*.5;const flag=mesh(new THREE.ConeGeometry(.15,.32,3),i%3===0?0xffdb39:i%3===1?0xf25298:0x6f6ee2);flag.position.set(x,y,-4);flag.rotation.z=Math.PI;bar([x-.43,y+.22,-4],[x+.43,y+.2,-4],.012,C.dark);}
 // A few fine scene details reward close viewing without becoming clue noise.
 const side=group(4.5,0,-.15);cyl(.5,.5,.09,C.wood,0,1.1,0,side);cyl(.08,.18,1,C.dark,0,.55,0,side);for(let i=0;i<3;i++)cyl(.07,.06,.24,0xedd3b0,-.22+i*.22,1.27,0,side);
 const targets={receipt:new THREE.Vector3(3.7,1.9,-2.25),phone:new THREE.Vector3(-3.05,1.6,-2.6),plaque:new THREE.Vector3(4.05,1.0,1.6),crate:new THREE.Vector3(-2.6,1.4,1.3),banner:new THREE.Vector3(-5.55,3.7,-.8)};
 let lensUntil=0;const clueRings=[];for(const [id,p] of Object.entries(targets)){const ring=mesh(new THREE.TorusGeometry(.8,.045,8,48),material(0xfce0a2,{emissive:0xe7ac63,emissiveIntensity:.4}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,p.y+.18,p.z);ring.material=ring.material.clone();ring.material.transparent=true;ring.material.opacity=.85;ring.material.depthTest=false;ring.renderOrder=50;ring.visible=false;ring.userData.clue=id;clueRings.push(ring);}
 const nearRing=mesh(new THREE.TorusGeometry(.45,.018,6,40),new THREE.MeshBasicMaterial({color:0xfff0cc,transparent:true,opacity:.7,depthWrite:false}));nearRing.rotation.x=-Math.PI/2;nearRing.visible=false;
 function projectPoint(x,y,z){const p=new THREE.Vector3(x,y,z).project(camera);return {x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height,visible:p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1};}
 function nearTarget(item){nearRing.visible=Boolean(item)&&!paused&&state==='investigate';if(item){nearRing.position.set(item.fallback?detective.position.x:item.x,.14,item.fallback?detective.position.z:item.z);}}
 const photoPos=new THREE.Vector3(.95,3.45,5.7),photoTarget=new THREE.Vector3(.45,2.2,-.25),homePos=new THREE.Vector3(13,14,17),homeTarget=new THREE.Vector3(0,.8,0);
 camera.position.copy(photoPos);camera.lookAt(photoTarget);let paused=false;let state='intro',transition=null,raf,ready=false;let width=1,height=1,photoURL=null,walk=null;const clock=new THREE.Clock();
 const pov=createPOVCamera({camera,controls,detective,canvas,reducedMotion,onChange:onViewChange,enabled:()=>state==='investigate'&&!paused&&!transition});
 function resize(w=canvas.clientWidth,h=canvas.clientHeight){if(w<1||h<1)return;const nw=Math.round(w),nh=Math.round(h);if(width!==nw||height!==nh){width=nw;height=nh;renderer.setSize(width,height,false);camera.aspect=width/height;if(!pov.active&&!pov.transitioning)camera.zoom=(state==='intro'||state==='photo')?Math.max(1,camera.aspect/1.55):(camera.aspect>2?1.18:1);camera.updateProjectionMatrix();}}
 function renderOverview(w,h){resize(w,h);camera.position.copy(homePos);camera.lookAt(homeTarget);camera.zoom=.92;camera.updateProjectionMatrix();renderer.render(scene,camera);const image=canvas.toDataURL('image/jpeg',.82);camera.zoom=1;camera.updateProjectionMatrix();return image;}
 function renderPhoto(w,h){resize(w,h);camera.position.copy(photoPos);camera.lookAt(photoTarget);renderer.render(scene,camera);photoURL=canvas.toDataURL('image/png');return photoURL;}
 function animateCamera(pos,target,seconds=1.6,done){transition={start:performance.now(),duration:reducedMotion()?50:seconds*1000,from:camera.position.clone(),to:pos.clone(),fromTarget:controls.target.clone(),toTarget:target.clone(),fromFov:camera.fov,fromZoom:camera.zoom,toZoom:state==='photo'?Math.max(1,camera.aspect/1.55):1,done};controls.enabled=false;}
 function start({instant=false}={}){if(instant){state='investigate';transition=null;detective.visible=true;camera.position.copy(homePos);controls.target.copy(homeTarget);camera.lookAt(homeTarget);controls.enabled=true;resize();renderer.render(scene,camera);return;}state='opening';controls.target.copy(photoTarget);detective.visible=true;animateCamera(homePos,homeTarget,2.3,()=>{state='investigate';controls.enabled=true;onTransitionEnd?.();});}
 function returnPhoto(){if(pov.transitioning)return;pov.release();state='photo';detective.visible=false;animateCamera(photoPos,photoTarget,1.15);}
 function resume(){state='investigate';if(pov.active){transition=null;pov.request(true,{restore:true});}else{detective.visible=true;animateCamera(homePos,homeTarget,1.15,()=>{controls.enabled=true;});}}
 function home(){if(state!=='investigate')return;animateCamera(homePos,homeTarget,1,()=>{controls.enabled=true;});}
 function rotate(direction){if(state!=='investigate')return;const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),direction*.35);animateCamera(offset.add(controls.target),controls.target,.5,()=>{controls.enabled=true;});}
 function visit(id){const p=targets[id];if(!p||state!=='investigate')return;const end=new THREE.Vector3(p.x+(p.x>0?-.85:.85),.08,p.z+.7);walk={from:detective.position.clone(),to:end,start:performance.now()};}
 function project(id){const p=targets[id].clone().project(camera);return {x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height,visible:p.z<1&&Math.abs(p.x)<.95&&Math.abs(p.y)<.83};}
 function tick(){raf=requestAnimationFrame(tick);const t=clock.getElapsedTime();resize();if(paused){lastFrame=performance.now();renderer.render(scene,camera);return;}if(transition){const n=Math.min((performance.now()-transition.start)/transition.duration,1),e=n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2;camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,e);camera.lookAt(controls.target);camera.fov=THREE.MathUtils.lerp(transition.fromFov,38,e);camera.zoom=THREE.MathUtils.lerp(transition.fromZoom,transition.toZoom,e);camera.updateProjectionMatrix();if(n===1){const done=transition.done;transition=null;done?.();}}else if(controls.enabled)controls.update();
 const now=performance.now(),dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 let actualSpeed=0,turnRate=0;
 if(state==='investigate'&&!transition&&!pov.transitioning){
   let direction=cameraRelativeMovement(input.x,input.y,camera.position.x-controls.target.x,camera.position.z-controls.target.z);
   if(walk){const dx=walk.to.x-detective.position.x,dz=walk.to.z-detective.position.z,d=Math.hypot(dx,dz);if(d<.08)walk=null;direction={x:d>.08?dx/d:0,z:d>.08?dz/d:0};}
   if(now<inspectingUntil){direction={x:0,z:0};locomotion.reset();}
   const delta=locomotion.step(direction,dt);
   const next=moveOnTerrace(detective.position,delta.dx,delta.dz);
   actualSpeed=dt>0?Math.hypot(next.x-detective.position.x,next.z-detective.position.z)/dt:0;
   detective.position.x=next.x;detective.position.z=next.z;
   const look=now<inspectingUntil&&inspectionTarget?{x:inspectionTarget.x-next.x,z:inspectionTarget.z-next.z}:direction;
   if(Math.hypot(look.x,look.z)>.01&&!pov.active){const angle=Math.atan2(look.x,look.z),difference=Math.atan2(Math.sin(angle-detective.rotation.y),Math.cos(angle-detective.rotation.y));const change=difference*(1-Math.exp(-10*dt));detective.rotation.y+=change;turnRate=dt>0?change/dt:0;}
 }else{locomotion.reset();}
 const walking=actualSpeed>.02;
 if(characterMotion)characterMotion.update(dt,0,{worldSpeed:actualSpeed,turnRate,reducedMotion:reducedMotion()});
 hostMotion?.update(dt,0,{reducedMotion:reducedMotion()});
 if(!riggedDetective&&walking){stride+=dt*10;detective.position.y=.08+(reducedMotion()?0:Math.abs(Math.sin(stride))*.035);movingParts.forEach((part,i)=>{part.rotation.x=limbRest[i]+(reducedMotion()?0:Math.sin(stride)*(i%2?1:-1)*.22);});}
 else{detective.position.y=.08;movingParts.forEach((part,i)=>{part.rotation.x=limbRest[i];});}
 updateContainers(dt);
 pov.update(dt);
 clueRings.forEach((r,i)=>{r.visible=state==='investigate'&&lensVisible(performance.now(),lensUntil)&&!r.userData.filed;r.scale.setScalar(1+Math.sin(t*5+i)*.12);});renderer.render(scene,camera);if(!ready){ready=true;onReady?.();}}
 detective.visible=false;tick();
 return {inspectObject(item){inspectionTarget=item;inspectingUntil=performance.now()+(reducedMotion()?0:650);locomotion.reset();characterMotion?.inspect();return new Promise(resolve=>setTimeout(resolve,reducedMotion()?0:600));},openContainer,nudgeContainer,resetContainers,togglePOV(){return pov.request(!pov.active);},get firstPerson(){return pov.active;},get switchingView(){return pov.transitioning;},nearby(){const items=nearbyObjects(detective.position);return pov.active?items.filter(item=>projectPoint(item.x,item.y,item.z).visible).sort((a,b)=>{const pa=projectPoint(a.x,a.y,a.z),pb=projectPoint(b.x,b.y,b.z);return Math.hypot(pa.x-width/2,pa.y-height/2)-Math.hypot(pb.x-width/2,pb.y-height/2);}):items;},nearTarget,projectObject(item){return projectPoint(item.fallback?detective.position.x:item.x,item.y,item.fallback?detective.position.z:item.z);},revealClues(found){lensUntil=performance.now()+LENS_DURATION;clueRings.forEach(r=>r.userData.filed=found.has(r.userData.clue));},resetLens(){lensUntil=0;},setPaused(value){paused=value;if(value)pov.release();if(value){nearRing.visible=false;clueRings.forEach(r=>r.visible=false);}if(value){input.x=0;input.y=0;locomotion.reset();}controls.enabled=!value&&state==='investigate'&&!transition&&!pov.active&&!pov.transitioning;},resetInvestigation(){pov.reset();locomotion.reset();characterMotion?.reset();inspectingUntil=0;inspectionTarget=null;walk=null;input.x=0;input.y=0;detective.position.set(-3.6,.08,2.8);detective.rotation.y=.65;start({instant:true});},ready:assetsReady,renderOverview,renderPhoto,start,returnPhoto,resume,home,rotate,visit,project,resize,setMovement,get state(){return state;},get photoURL(){return photoURL;},get renderer(){return renderer;},dispose(){cancelAnimationFrame(raf);pov.dispose();controls.dispose();environment.dispose();renderer.dispose();}};
}


