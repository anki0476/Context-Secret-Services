import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Reference-driven prop kit: teal glaze, coral upholstery, lavender cardboard,
// warm wood, brass hardware and modeled icing. No external model service.
export function buildPartyProps(scene,textPlane){
 const mat=(color,roughness=.45,extra={})=>new T.MeshPhysicalMaterial({color,roughness,...extra});
 const teal=mat(0x079d99,.22,{clearcoat:.65}),coral=mat(0xff694e,.85),gold=mat(0xdca740,.25,{metalness:.78}),cream=mat(0xffe7c0,.35),pink=mat(0xf73980,.29,{clearcoat:.35}),orange=mat(0xff814d,.38),lavender=mat(0x9663db,.8),dark=mat(0x223342,.65),leafM=[mat(0x299b47,.52),mat(0x75c638,.48),mat(0xb2dc43,.5)];
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=kind==='wood'?'#dc913d':'#a0a0a0';x.fillRect(0,0,512,512);for(let i=0;i<512;i++){x.strokeStyle=kind==='wood'?`rgba(102,48,12,${.04+(i%7)*.012})`:`rgba(240,240,240,${i%2?.12:.04})`;x.lineWidth=kind==='wood'?1+(i%3):1;x.beginPath();for(let j=0;j<=512;j+=8){const y=i+Math.sin(j*.017+i*.035)*8+Math.sin(j*.041+i*.01)*3;j?x.lineTo(j,y):x.moveTo(j,y);}x.stroke();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=kind==='wood'?T.SRGBColorSpace:T.NoColorSpace;return t;}
 const grain=texture('wood'),weave=texture('fabric');weave.repeat.set(5,5);coral.bumpMap=weave;coral.bumpScale=.012;
 const wood=mat(0xffffff,.33,{map:grain,clearcoat:.25});
 const mesh=(geo,m,p)=>{const o=new T.Mesh(geo,m);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const group=(x,y,z,p=scene)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 const box=(w,h,d,m,x,y,z,p,r=.06)=>{const o=mesh(new RoundedBoxGeometry(w,h,d,4,Math.min(r,w*.3,h*.3,d*.3)),m,p);o.position.set(x,y,z);return o;};
 const cyl=(r,h,m,x,y,z,p)=>{const o=mesh(new T.CylinderGeometry(r,r,h,64),m,p);o.position.set(x,y,z);return o;};
 const sphere=(r,m,x,y,z,p,s=[1,1,1])=>{const o=mesh(new T.SphereGeometry(r,20,14),m,p);o.position.set(x,y,z);o.scale.set(...s);return o;};
 const lathe=(profile,m,p)=>mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),64),m,p);
 const tube=(points,r,m,p)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),32,r,8,false),m,p);
 const ring=(r,t,m,x,y,z,p)=>{const o=mesh(new T.TorusGeometry(r,t,8,64),m,p);o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o;};
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sx=shadowCanvas.getContext('2d'),gradient=sx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(35,20,64,.34)');gradient.addColorStop(1,'rgba(35,20,64,0)');sx.fillStyle=gradient;sx.fillRect(0,0,128,128);const contact=new T.CanvasTexture(shadowCanvas);
 for(const [x,z,w,d] of [[0,0,4.7,4.7],[-2.8,-.3,1.6,1.5],[2.7,-.1,1.6,1.5],[-1.7,2.8,1.6,1.5],[3.7,-2.8,2,1.5],[4.05,1.6,1.8,1.5]]){const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:contact,transparent:true,depthWrite:false}));o.rotation.x=-Math.PI/2;o.position.set(x,.081,z);scene.add(o);}
 const table=group(0,0,0);lathe([[0,.12],[.85,.12],[.94,.18],[.92,.25],[.66,.31],[.35,.65],[.3,1.15],[.56,1.52]],teal,table);
 for(let i=0;i<18;i++){const theta=i*Math.PI*2/18;tube([[Math.cos(theta)*.82,.25,Math.sin(theta)*.82],[Math.cos(theta)*.38,.65,Math.sin(theta)*.38],[Math.cos(theta)*.32,1.16,Math.sin(theta)*.32],[Math.cos(theta)*.54,1.5,Math.sin(theta)*.54]],.025,teal,table);}
 lathe([[0,1.55],[2.04,1.55],[2.13,1.58],[2.15,1.65],[2.13,1.72],[2.04,1.75],[0,1.75]],wood,table);ring(2.10,.018,gold,0,1.58,0,table);
 function chair(x,z,rot){const g=group(x,0,z);g.rotation.y=rot;box(.99,.22,.94,coral,0,.92,0,g,.1);box(.93,.08,.88,cream,0,.81,0,g);
  for(const xx of [-.37,.37])for(const zz of [-.33,.33])tube([[xx*1.2,.1,zz*1.2],[xx*.95,.48,zz],[xx,.84,zz]],.052,teal,g);
  for(let i=0;i<7;i++){const t=(i-3)/3,seg=box(.16,.77-Math.abs(t)*.14,.17,coral,t*.40,1.38,-.34+Math.abs(t)*.13,g,.075);seg.rotation.z=-t*.22;seg.rotation.x=-.13;}
  tube([[-.44,1.04,-.20],[-.42,1.58,-.32],[0,1.82,-.42],[.42,1.58,-.32],[.44,1.04,-.20]],.025,cream,g);
 }chair(-2.8,-.3,Math.PI/2);chair(2.7,-.1,-Math.PI/2);chair(-1.7,2.8,Math.PI*.8);
 const cake=group(-.35,1.77,.35);lathe([[0,0],[.55,0],[.58,.04],[.3,.11],[.32,.18],[1.03,.21],[1.07,.26],[1.02,.30],[0,.30]],teal,cake);
 // An executive farewell cake: one understated ivory tier on a dark board.
 const chocolate=mat(0x35231f,.36),ivory=mat(0xf8edcf,.48);
 lathe([[0,.30],[.91,.30],[.94,.33],[.94,.38],[0,.38]],chocolate,cake);
 lathe([[0,.38],[.82,.38],[.86,.42],[.86,.89],[.82,.93],[0,.93]],ivory,cake);
 ring(.855,.013,gold,0,.45,0,cake);ring(.82,.012,gold,0,.925,0,cake);
 // Fine vertical chocolate combing, kept on the lower edge.
 for(let i=0;i<48;i++){const a=i*Math.PI/24;tube([[Math.cos(a)*.86,.39,Math.sin(a)*.86],[Math.cos(a)*.86,.43,Math.sin(a)*.86]],.004,chocolate,cake);}
 const face=box(1.12,.39,.045,chocolate,0,.69,.88,cake,.035);
 const label=textPlane('GOOD RIDDANCE',1.06,.25,{bg:'#35231f',fg:'#f4db9e',size:94},cake);label.position.set(0,.69,.905);

 for(const x of [-.52,.52]){const curl=tube([[x,.95,-.15],[x+.10,1.07,-.20],[x+.17,1.09,-.10],[x+.10,1.02,0]],.025,chocolate,cake);}
 function plate(x,y,z,p,r=.28){lathe([[0,0],[r*.7,0],[r,.045],[r,.06],[r*.7,.025],[0,.025]],cream,group(x,y,z,p));ring(r,.009,gold,x,y+.055,z,p);}
 function can(x,y,z,p,col=0x7b5ee8){const g=group(x,y,z,p);lathe([[.09,0],[.11,.02],[.12,.05],[.12,.28],[.105,.31],[.1,.32]],mat(col,.3,{metalness:.35,clearcoat:.6}),g);cyl(.1,.013,gold,0,.32,0,g);ring(.102,.008,gold,0,.328,0,g);const t=ring(.025,.007,dark,0,.34,0,g);t.scale.z=.6;return g;}
 for(const [x,z]of [[1.35,.75],[-1.35,-.5]]){plate(x,1.77,z,scene);tube([[x+.37,1.81,z-.16],[x+.37,1.81,z+.17]],.018,gold,scene);}can(1.4,1.77,-.7,scene);can(-1.15,1.77,-.9,scene,0xff814d);
 const trolley=group(3.7,0,-2.8);for(const y of [.50,1.43]){box(1.5,.10,.87,teal,0,y,0,trolley,.045);for(const z of [-.4,.4])box(1.44,.09,.035,teal,0,y+.08,z,trolley,.012);for(const x of [-.70,.70])box(.035,.09,.78,teal,x,y+.08,0,trolley,.012);}
 for(const x of [-.64,.64])for(const z of [-.33,.33]){tube([[x,.25,z],[x,1.55,z]],.035,gold,trolley);const w=cyl(.11,.07,dark,x,.16,z,trolley);w.rotation.z=Math.PI/2;sphere(.035,gold,x+.045,.16,z,trolley);}
 tube([[.65,1.47,-.35],[.65,1.90,-.35],[.65,1.97,0],[.65,1.90,.35],[.65,1.47,.35]],.035,gold,trolley);
 for(let i=0;i<4;i++){plate(-.33,1.49+i*.065,0,trolley,.26);plate(-.28,.56+i*.06,0,trolley,.25);}
 const cloche=group(.32,1.49,0,trolley);lathe([[0,0],[.32,0],[.34,.035],[.31,.06],[.29,.18],[.23,.29],[.1,.36],[0,.37]],gold,cloche);sphere(.055,gold,0,.41,0,cloche);
 const receipt=textPlane('QUAY BAKERY\nORDER #0417\n17 NOV',.42,.68,{bg:'#fff1d6',fg:'#5a405e',size:92},trolley);receipt.position.set(.16,1.15,.46);box(.12,.045,.025,gold,.16,1.51,.47,trolley,.008);
 const packing=group(4.05,.12,1.6);box(1.3,.10,1,lavender,0,.04,0,packing);for(const x of [-.62,.62])box(.075,.5,1,lavender,x,.28,0,packing);for(const z of [-.47,.47])box(1.3,.5,.07,lavender,0,.28,z,packing);const lid=group(0,.55,-.5,packing);lid.rotation.x=Math.PI/2;box(1.32,.90,.065,lavender,0,.43,0,lid);box(1.22,.78,.025,mat(0xb18be5,.9),0,.43,.045,lid);
 for(let i=0;i<6;i++){const paper=box(.48,.014,.6,mat(0xff9a78,.95),-.4+i*.16,.25+(i%2)*.06,0,packing,.004);paper.rotation.set(.15*(i%3),i*.4,.2);}
 const gift=group(0,.32,.03,packing);gift.rotation.x=-Math.PI/2+.22;const cookie=sphere(.47,cream,0,0,0,gift,[1,.62,.08]);const wt=textPlane('WELCOME\nBACK',.77,.40,{bg:'#ffe7c0',fg:'#941b42',size:105},gift);wt.position.z=.045;
 function plant(x,z,s=1){const g=group(x,.10,z);g.scale.setScalar(s);lathe([[0,0],[.23,0],[.31,.07],[.38,.25],[.37,.48],[.31,.58],[.30,.60],[.27,.60],[.29,.52]],mat(0xffc52d,.24,{clearcoat:.7}),g);cyl(.28,.025,mat(0x42324a,.95),0,.52,0,g);
  for(let k=0;k<9;k++){const a=k*2.4,len=.65+(k%3)*.16,rad=.39+(k%2)*.17;const points=[],vs=[],ids=[];for(let j=0;j<=12;j++){const t=j/12,r=rad*t,h=.54+len*Math.sin(t*Math.PI*.68),w=Math.sin(t*Math.PI)*.13;const p=[Math.cos(a)*r,h,Math.sin(a)*r];points.push(p);for(const side of [-1,0,1])vs.push(p[0]+Math.cos(a+Math.PI/2)*w*side,p[1]+(side===0?.035:0),p[2]+Math.sin(a+Math.PI/2)*w*side);if(j)for(let q=0;q<2;q++){const b=(j-1)*3+q;ids.push(b,b+3,b+1,b+1,b+3,b+4);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vs,3));geo.setIndex(ids);geo.computeVertexNormals();const m=leafM[k%3];m.side=T.DoubleSide;mesh(geo,m,g);tube(points,.007,leafM[2],g);}
 }for(const p of [[-5.7,-4,1.8],[5.6,-4.2,1.5],[-5.8,3.8,1.4],[4.8,3.8,1.3],[-3.5,-4,1.1]])plant(...p);
 return {teal,gold,wood,cream,lavender,plant,packingLid:lid};
}
