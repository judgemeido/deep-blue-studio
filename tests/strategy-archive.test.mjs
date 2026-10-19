import test from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGY_RECORDS, CAMERA_PRESETS, ALGORITHM_CLAIMS } from '../src/strategy/archive-data.js';

test('strategy archive has six ordered, sourced records', () => {
  assert.equal(STRATEGY_RECORDS.length, 6);
  assert.deepEqual(STRATEGY_RECORDS.map(record => record.id), [
    'board-decision', 'candidate-moves', 'minimax', 'alpha-beta', 'parallel-search', 'chip-echo',
  ]);
  for (const record of STRATEGY_RECORDS) {
    assert.match(record.label, /\S/);
    assert.match(record.title, /\S/);
    assert.match(record.description, /\S/);
    assert.match(record.boundary, /\S/);
    assert.ok(record.source && record.source.id && record.source.url);
  }
});

test('camera presets and algorithm claims expose explicit teaching boundaries', () => {
  assert.deepEqual(Object.keys(CAMERA_PRESETS), ['overview', 'board', 'tree', 'node', 'chip']);
  assert.ok(ALGORITHM_CLAIMS.every(claim => claim.isTeachingData === true));
  assert.ok(ALGORITHM_CLAIMS.some(claim => claim.id === 'throughput-conditional'));
});
