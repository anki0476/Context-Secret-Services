import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocomotion} from '../src/locomotion.js';
import {moveOnTerrace,canStand} from '../src/movement.js';
test('movement accelerates gradually, brakes promptly, and reset cancels momentum',()=>{
 const motor=createLocomotion();const first=motor.step({x:1,z:0},1/60);
 assert.ok(first.dx>0&&first.dx<1.75/60);
 for(let i=0;i<60;i++)motor.step({x:1,z:0},1/60);
 let drift=0;for(let i=0;i<30;i++)drift+=motor.step({x:0,z:0},1/60).dx;
 assert.ok(drift<.1);assert.equal(motor.step({x:0,z:0},1/60).dx,0);
 motor.step({x:1,z:1},.05);motor.reset();assert.deepEqual(motor.step({x:0,z:0},.05),{dx:0,dz:0});
});
test('smoothed motion still respects furniture and keeps diagonal speed bounded',()=>{
 const motor=createLocomotion();let position={x:0,z:3};
 for(let i=0;i<200;i++){const d=motor.step({x:0,z:-1},1/60);position=moveOnTerrace(position,d.dx,d.dz);assert.ok(canStand(position.x,position.z));}
 assert.ok(position.z>=2.48);
 motor.reset();for(let i=0;i<60;i++){const d=motor.step({x:1,z:1},1/60);assert.ok(Math.hypot(d.dx,d.dz)<=1.75/60);}
});
