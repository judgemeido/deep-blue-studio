import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createModel } from '../src/prototype/model.js';
import { chipPointerIntent } from '../src/prototype/scene.js';

const contract = JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json', import.meta.url)));

test('chip pointer intent rejects drags and pre-chip progress', () => {
  assert.equal(chipPointerIntent({ progress: 5.99, down: [0, 0], up: [0, 0] }), null);
  assert.equal(chipPointerIntent({ progress: 6, down: [0, 0], up: [7, 0] }), null);
  assert.deepEqual(chipPointerIntent({ progress: 6, down: [0, 0], up: [3, 4] }), { clicked: true });
});

test('model hotspot selection is stable and clearable', () => {
  const model = createModel(contract);
  model.setHotspot('evaluate');
  assert.equal(model.parts.regions.filter(region => region.material.emissiveIntensity > 0).length, 1);
  assert.equal(model.parts.regions[1].material.emissiveIntensity > 0, true);
  model.clearHotspot();
  assert.equal(model.parts.regions.some(region => region.material.emissiveIntensity > 0), false);
  model.dispose();
});
