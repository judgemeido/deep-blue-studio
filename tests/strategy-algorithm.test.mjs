import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTeachingTree, runTeachingSearch, stepSearch, describeSearchEvent } from '../src/strategy/algorithm.js';

test('teaching tree is deterministic and has stable node ids', () => {
  const first = buildTeachingTree();
  const second = buildTeachingTree();
  assert.deepEqual(first, second);
  const ids = [];
  const walk = node => { ids.push(node.id); (node.children || []).forEach(walk); };
  walk(first);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids[0], 'root');
});

test('minimax and alpha-beta agree while alpha-beta visits fewer teaching nodes', () => {
  const tree = buildTeachingTree();
  const minimax = runTeachingSearch(tree, { strategy: 'minimax' });
  const alphaBeta = runTeachingSearch(tree, { strategy: 'alphabeta' });
  assert.equal(minimax.value, alphaBeta.value);
  assert.ok(alphaBeta.visitedNodes < minimax.visitedNodes);
  const prune = alphaBeta.events.find(event => event.type === 'prune');
  assert.ok(prune);
  assert.ok(prune.skippedIds.includes('right-b'));
  assert.match(describeSearchEvent(prune), /剪枝/);
});

test('search playback clamps at both ends and returns one event at a time', () => {
  const result = runTeachingSearch(buildTeachingTree(), { strategy: 'alphabeta' });
  let playback = { events: result.events, index: -2 };
  playback = stepSearch(playback);
  assert.equal(playback.index, 0);
  assert.ok(playback.event);
  for (let i = 0; i < result.events.length + 5; i += 1) playback = stepSearch(playback);
  assert.equal(playback.index, result.events.length);
  assert.equal(playback.event, null);
});
