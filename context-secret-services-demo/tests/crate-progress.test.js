import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrateProgress,CRATE_CLICKS} from '../src/crate-progress.js';
test('each crate requires distinct clicks, retains progress, and only opens after animation completes',()=>{
 const crates=createCrateProgress();
 crates.click('storage');crates.click('packing');
 assert.equal(crates.get('storage').clicks,1);
 for(let i=1;i<CRATE_CLICKS;i++)crates.click('storage');
 assert.equal(crates.get('storage').status,'opening');
 crates.click('storage');assert.equal(crates.get('storage').clicks,CRATE_CLICKS);
 crates.finish('storage');assert.equal(crates.get('storage').status,'open');
 assert.equal(crates.get('packing').clicks,1);
 assert.equal(crates.click('cake'),null);
 crates.reset();assert.equal(crates.get('storage').clicks,0);assert.equal(crates.get('packing').status,'closed');
});
