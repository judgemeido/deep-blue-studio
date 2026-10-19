import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createAlgorithmModel } from '../src/strategy/algorithm-model.js';
import { buildTeachingTree } from '../src/strategy/algorithm.js';

test('algorithm model exposes named exhibit layers and advanced chip geometry', () => {
  const model = createAlgorithmModel({ tree: buildTeachingTree() });
  for (const name of ['board', 'searchTree', 'cabinets', 'parallelNodes', 'chipCutaway', 'signals']) assert.ok(model.parts[name]);
  assert.ok(model.parts.board.getObjectByName('chessboard-squares').children.length >= 64);
  assert.ok(model.parts.chipCutaway.getObjectByName('bond-wires').children.length >= 8);
  assert.ok(model.parts.chipCutaway.getObjectByName('functional-zones').children.length >= 4);
  assert.equal(model.root.userData.logicalChipCount, 480);
  model.dispose();
});

test('model progress is finite, reversible, and keeps base transforms stable', () => {
  const model = createAlgorithmModel({ tree: buildTeachingTree() });
  model.setRecord('chip-echo');
  model.applyProgress(0.82);
  const before = model.parts.chipCutaway.position.clone();
  model.applyProgress(0);
  model.applyProgress(0.82);
  assert.deepEqual(model.parts.chipCutaway.position.toArray(), before.toArray());
  model.reset();
  model.root.traverse(object => {
    assert.ok(Number.isFinite(object.position.x) && Number.isFinite(object.position.y) && Number.isFinite(object.position.z));
  });
  model.dispose();
});

test('camera targets are finite and use distinct exhibit distances', async () => {
  const { CAMERA_PRESETS } = await import('../src/strategy/archive-data.js');
  const distances = Object.values(CAMERA_PRESETS).map(preset => new THREE.Vector3(...preset.position).distanceTo(new THREE.Vector3(...preset.target)));
  assert.ok(distances[0] > distances[4]);
  assert.ok(distances.every(Number.isFinite));
});
