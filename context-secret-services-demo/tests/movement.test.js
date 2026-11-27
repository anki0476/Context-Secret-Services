import test from 'node:test';
import assert from 'node:assert/strict';
import {canStand,moveOnTerrace,cameraRelativeMovement,WALK_BOUNDS} from '../src/movement.js';
test('detective starts on walkable ground and cannot walk through the cake table',()=>{
  assert.ok(canStand(-3.6,2.8));
  const end=moveOnTerrace({x:0,z:3},0,-8);
  assert.ok(end.z>=2.48&&end.z<2.6);
});
test('long movements cannot cross the terrace edge or tunnel through furniture',()=>{
  const edge=moveOnTerrace({x:-4.3,z:2.9},0,100);
  assert.ok(edge.z<=WALK_BOUNDS.maxZ);assert.ok(canStand(edge.x,edge.z));
  const box=moveOnTerrace({x:5.6,z:1.6},-4,0);
  assert.ok(box.x>=5);
});
test('joystick directions remain screen-relative after camera rotation and diagonal speed is capped',()=>{
  assert.deepEqual(cameraRelativeMovement(0,-1,0,10),{x:0,z:-1});
  const right=cameraRelativeMovement(1,0,10,0);
  assert.deepEqual(right,{x:0,z:-1});
  const diagonal=cameraRelativeMovement(1,1,13,17);
  assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.z)-1)<1e-10);
});
