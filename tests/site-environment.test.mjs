import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSiteEnvironment } from '../src/prototype/site-environment.js';

const contract = JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json', import.meta.url)));

test('site environment exposes a bounded 1997 exhibit room', () => {
  const site = createSiteEnvironment({ contract });
  for (const key of ['floor', 'plinth', 'backWall', 'sideWall', 'lightSlots', 'cableTray', 'ventilation', 'labels', 'aisleMarkers']) {
    assert.ok(site.parts[key], `missing site part ${key}`);
  }
  assert.equal(new Set(Object.values(site.parts).map(part => part.uuid)).size, Object.keys(site.parts).length);
  assert.ok(site.root.userData.eraTag === '1997');
  assert.ok(site.root.userData.status === 'teaching-reconstruction');
  assert.ok(site.root.userData.props.some(prop => prop.kind === 'crt'));
  assert.ok(site.root.userData.props.some(prop => prop.kind === 'maintenance-record'));
  site.dispose();
});

test('site modes change emphasis without changing world transforms', () => {
  const site = createSiteEnvironment({ contract });
  site.root.updateMatrixWorld(true);
  const before = site.parts.plinth.matrixWorld.elements.slice();
  site.setMode('structure');
  assert.equal(site.parts.plinth.matrixWorld.elements.join(','), before.join(','));
  site.setMode('quiet');
  assert.equal(site.parts.plinth.visible, true);
  assert.equal(site.parts.labels.material?.opacity ?? site.parts.labels.children[0]?.material.opacity, 0.25);
  site.setMode('overview');
  assert.equal(site.parts.labels.visible, true);
  site.dispose();
});
