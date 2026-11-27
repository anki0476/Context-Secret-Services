import test from 'node:test';
import assert from 'node:assert/strict';
import {clues,canReconstruct,evaluateTheory} from '../src/case.js';
test('the explanation requires its three causal clues, not merely any three objects',()=>{assert.equal(canReconstruct(new Set(['banner','crate','receipt'])),false);assert.equal(canReconstruct(new Set(['receipt','phone','plaque'])),true);});
test('a theory cannot bypass missing evidence',()=>{assert.equal(evaluateTheory('reuse',new Set()).correct,false);});
test('the correct explanation succeeds and alternatives give evidence-based feedback',()=>{const all=new Set(clues.map(c=>c.id));assert.equal(evaluateTheory('reuse',all).correct,true);for(const id of ['insult','farewell']){const result=evaluateTheory(id,all);assert.equal(result.correct,false);assert.ok(result.message.length>30);}});
