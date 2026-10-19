import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createModel } from '../src/prototype/model.js';
import { samplePose } from '../src/prototype/motion.js';
import { checkChipAssemblyClearance } from '../src/prototype/geometry-checks.js';
import { Box3, Vector3 } from 'three';
import { fitCameraPose } from '../src/prototype/scene.js';

const contract = JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json', import.meta.url)));

test('chip clearance allows closed and open poses without layer penetration', () => {
  const model = createModel(contract);
  for (const progress of [5, 5.25, 5.5, 6]) {
    model.applyPose(samplePose(progress));
    assert.deepEqual(checkChipAssemblyClearance(model, progress, { lid: progress < 5.8 ? 'closed' : 'open', section: 'assembled' }), []);
  }
  model.dispose();
});

test('magnified package clears visible physical hardware before growing; camera stays outside', () => {
  const model = createModel(contract);
  for (let i = 1; i <= 200; i += 1) {
    const progress = 5 + i / 200;
    model.applyPose(samplePose(progress));
    if (!model.parts.micro.visible) continue;
    const microBox = new Box3().setFromObject(model.parts.micro);
    const camera = fitCameraPose(progress, 'perspective', 1.2).position;
    assert.equal(microBox.clone().expandByScalar(0.05).containsPoint(camera), false, `camera at ${progress}`);
    if (!model.parts.physical.visible) continue;
    model.parts.physical.traverse(object => {
      if (!object.isMesh || object === model.parts.chips[0] || object.material.opacity < 0.1) return;
      const box = new Box3().setFromObject(object);
      const overlap = microBox.clone().intersect(box);
      if (overlap.isEmpty()) return;
      const size = overlap.getSize(new Vector3());
      assert.ok(Math.min(size.x, size.y, size.z) < 0.001, `visible hardware penetration at ${progress}: ${size.x},${size.y},${size.z}`);
    });
  }
  model.dispose();
});

test('micro camera framing follows the cutaway assembly bounds', () => {
  const model = createModel(contract);
  model.applyPose(samplePose(6));
  const assembled = model.getMicroCameraPose('perspective', 1);
  model.applyMicroPose({ lidAngle: -1.15, sideOpacity: 0.22, cutawayOffset: 0.42, sectionPlaneOpacity: 0.7, dieOpacity: 1, wireOpacity: 1, pinOpacity: 0.55, traceProgress: 0 });
  const cutaway = model.getMicroCameraPose('perspective', 1);
  assert.ok(cutaway.target.distanceTo(assembled.target) > 0.001 || cutaway.position.distanceTo(assembled.position) > 0.001);
  model.dispose();
});
