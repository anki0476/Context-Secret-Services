import {test} from 'node:test';
import assert from 'node:assert/strict';
import {objects,nearbyObjects,lensVisible,LENS_DURATION} from '../src/exploration.js';
import {canStand} from '../src/movement.js';

test('every evidence prop is reachable from legal walking space',()=>{
 for(const item of objects.filter(o=>o.clue)){
  let reachable=false;
  for(let x=-5.9;x<6&&!reachable;x+=.2)for(let z=-4.2;z<4.7;z+=.2){
   if(canStand(x,z)&&nearbyObjects({x,z}).some(o=>o.id===item.id)){reachable=true;break;}
  }
  assert.ok(reachable,item.name+' must be accessible without walking through furniture');
 }
 assert.deepEqual(new Set(objects.filter(o=>o.clue).map(o=>o.clue)),new Set(['receipt','phone','plaque','crate','banner']));
});
test('distant evidence cannot be inspected and normal props participate in proximity',()=>{
 assert.equal(nearbyObjects({x:-5,z:4}).some(o=>o.clue==='receipt'),false);
 const near=nearbyObjects({x:-5,z:3.8});
 assert.ok(near.some(o=>o.id==='plant-2'&&!o.clue));
 assert.equal(objects.some(o=>o.id==='floor'),false);
});
test('lens reveals regions for one second and expires at the boundary',()=>{
 assert.equal(LENS_DURATION,1000);
 assert.equal(lensVisible(999,1000),true);
 assert.equal(lensVisible(1000,1000),false);
 assert.equal(lensVisible(3000,1000),false);
 assert.equal(lensVisible(0,0),false);
});
