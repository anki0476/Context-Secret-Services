import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeLayout } from '../src/landscape-layout.js';

test('a portrait-locked phone gets a full-size landscape viewport', () => {
  assert.deepEqual(landscapeLayout(390, 760, true), { rotated: true, width: 760, height: 390 });
});
test('a native landscape viewport is not rotated twice', () => {
  assert.deepEqual(landscapeLayout(760, 390, true), { rotated: false, width: 760, height: 390 });
});
test('desktop retains its host dimensions, including a tall window', () => {
  assert.deepEqual(landscapeLayout(900, 1000, false), { rotated: false, width: 900, height: 1000 });
});
test('rotation fills the host without clipping or stretching', () => {
  for (const [width, height] of [[320, 568], [393, 852], [430, 932], [768, 1024]]) {
    const layout = landscapeLayout(width, height, true);
    // After 90 degrees, the child corners map to these host coordinates.
    const corners = [[0, 0], [layout.width, 0], [0, layout.height], [layout.width, layout.height]]
      .map(([x, y]) => [width - y, x]);
    assert.deepEqual(corners, [[width, 0], [width, height], [0, 0], [0, height]]);
  }
});
