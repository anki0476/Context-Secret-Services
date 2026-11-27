import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReport,galleryReport} from '../src/community-reports.js';
const postId='t3_abc';
function comment(overrides={}){return {id:'t1_def',postId,parentId:postId,approved:true,authorName:'Detective',body:makeReport('The cake has terrible timing.'),...overrides};}
test('only approved live top-level reports from this case enter the gallery',()=>{
  assert.equal(galleryReport(comment(),postId).caption,'The cake has terrible timing.');
  for(const overrides of [{approved:false},{edited:true},{removed:true},{spam:true},{authorName:'[deleted]'},{postId:'t3_other'},{parentId:'t1_reply'},{body:'ordinary discussion'},{id:'invalid'}])assert.equal(galleryReport(comment(overrides),postId),null);
});
test('caption bounds and spoiler wrappers survive hostile Markdown',()=>{
  assert.throws(()=>makeReport(' '));assert.throws(()=>makeReport('a'.repeat(181)));
  const parsed=galleryReport(comment({body:makeReport('Hello!<\n<script>bad</script> >!')}),postId);
  assert.ok(parsed);assert.ok(!/[<>|\r\n]/.test(parsed.caption));
  assert.equal(galleryReport(comment({body:makeReport('a').replace('>!a!<','unwrapped spoiler')}),postId),null);
});
test('links are derived from validated Reddit IDs, never supplied content',()=>{
  assert.equal(galleryReport(comment({url:'https://evil.example'}),postId).url,'https://www.reddit.com/comments/abc/comment/def/');
});
