import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json', import.meta.url)));

test('micro chip contract names each visible layer and its evidence boundary', () => {
  assert.ok(contract.microChip, 'microChip contract is required');
  for (const key of ['package', 'substrate', 'die', 'bondWires', 'pins']) {
    const layer = contract.microChip.layers[key];
    assert.ok(layer, `missing micro layer: ${key}`);
    assert.ok(layer.status, `${key} needs a status`);
    assert.ok(Array.isArray(layer.sources), `${key} needs source ids`);
    if (layer.sources.length === 0) assert.ok(['schematic', 'pending'].includes(layer.status));
  }
});

test('micro chip contract keeps the four teaching hotspots distinct from software tables', () => {
  const hotspots = contract.microChip.hotspots;
  assert.deepEqual(Object.keys(hotspots).sort(), ['control', 'evaluate', 'moves', 'stack']);
  for (const hotspot of Object.values(hotspots)) {
    assert.ok(hotspot.label && hotspot.input && hotspot.output && hotspot.boundary);
  }
  assert.equal(contract.microChip.softwareBoundary, 'transposition-table-remains-in-search-layer');
});
