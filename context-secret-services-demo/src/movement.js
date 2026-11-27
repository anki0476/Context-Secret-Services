import {dummyCrates} from './crate-progress.js';
// Ground-plane collision proxies include room for the detective's body.
export const WALK_BOUNDS = {minX:-5.95,maxX:5.95,minZ:-4.28,maxZ:4.65};
const circles = [
  [0,0,2.48], [-2.8,-.3,.72], [2.7,-.1,.72], [-1.7,2.8,.72],
  [1.9,-1.75,.5], [4.5,-.15,.7], [-5.7,-4,.8], [5.6,-4.2,.72],
  [-5.8,3.8,.68], [4.8,3.8,.64], [-3.5,-4,.56]
];
const rectangles = [
  ...dummyCrates.map(c=>[c.x-.72,c.x+.72,c.z-.64,c.z+.64]),
  [-4.2,-2.2,-3.5,-2.08], // phone console
  [2.7,4.7,-3.55,-2.05], // catering trolley
  [3.1,5, .8,2.4], // pastry box
  [-3.6,-1.6,.53,2.06], // cold storage
  [-6.5,-4.7,-1.4,-.2] // welcome banner
];
export function canStand(x,z){
  if(x<WALK_BOUNDS.minX||x>WALK_BOUNDS.maxX||z<WALK_BOUNDS.minZ||z>WALK_BOUNDS.maxZ)return false;
  if(circles.some(([cx,cz,r])=>(x-cx)**2+(z-cz)**2<r*r))return false;
  return !rectangles.some(([left,right,back,front])=>x>left&&x<right&&z>back&&z<front);
}
export function moveOnTerrace(position,dx,dz){
  let {x,z}=position;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));
  for(let i=0;i<steps;i++){
    const nx=x+dx/steps,nz=z+dz/steps;
    if(canStand(nx,nz)){x=nx;z=nz;}
    else{ // Slide along furniture rather than sticking on contact.
      if(canStand(nx,z))x=nx;
      if(canStand(x,nz))z=nz;
    }
  }
  return {x,z};
}
export function cameraRelativeMovement(x,y,cameraX,cameraZ){
  const distance=Math.hypot(cameraX,cameraZ)||1;
  const rx=cameraZ/distance,rz=-cameraX/distance;
  const amount=Math.max(1,Math.hypot(x,y));
  return {x:(rx*x+cameraX/distance*y)/amount,z:(rz*x+cameraZ/distance*y)/amount};
}
