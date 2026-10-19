import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { createChipAssembly } from '../src/prototype/chip-model.js';
import { createModel } from '../src/prototype/model.js';
import { samplePose } from '../src/prototype/motion.js';
import { fitCameraPose } from '../src/prototype/scene.js';

const contract = JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json', import.meta.url)));

test('chip assembly exposes separated package layers and unique hotspot objects', () => {
  const assembly = createChipAssembly({ contract });
  for (const key of ['packageBody', 'lid', 'substrate', 'die', 'bondWires', 'pins', 'traces', 'regions']) {
    assert.ok(assembly.parts[key], `missing part ${key}`);
  }
  assert.equal(assembly.hotspots.length, 4);
  assert.equal(new Set(assembly.hotspots.map(h => h.id)).size, 4);
  for (const hotspot of assembly.hotspots) {
    assert.ok(hotspot.object instanceof THREE.Object3D);
    assert.ok(assembly.root.getObjectById(hotspot.object.id));
  }
  assembly.dispose();
});

test('chip assembly includes a cutaway shell and five visible signal segments', () => {
  const assembly = createChipAssembly({ contract });
  assert.ok(assembly.parts.cutawayWalls.length >= 2);
  assert.equal(assembly.parts.traceSegments.length, 5);
  assert.ok(assembly.parts.tracePulse);
  assembly.parts.traceLayer.visible = false;
  assert.equal(assembly.parts.traceLayer.visible, false);
  assembly.dispose();
});

test('model keeps one detailed micro chip while preserving sixteen physical chip count', () => {
  const model = createModel(contract);
  assert.equal(model.parts.chips.length, 16);
  assert.equal(model.parts.micro.userData.detailChipCount, 1);
  assert.equal(model.root.userData.logicalChipCount, 480);
  model.dispose();
});

test('micro assembly remains outside the camera and layers reveal in order', () => {
  const model = createModel(contract);
  for (const progress of [5, 5.5, 6]) {
    model.applyPose(samplePose(progress));
    model.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model.parts.micro);
    assert.equal(box.expandByScalar(0.05).containsPoint(fitCameraPose(progress, 'perspective', 1.2).position), false);
    assert.equal(model.parts.microParts.die.visible, progress >= 5.4);
  }
  model.dispose();
});
