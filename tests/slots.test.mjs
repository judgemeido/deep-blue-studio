import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { readFileSync } from 'node:fs';
import { createModel } from '../src/prototype/model.js';
import { samplePose } from '../src/prototype/motion.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('assembled selected node fits its slot without penetrating neighboring nodes',()=>{
 const m=createModel(contract);m.applyPose(samplePose(0));const selected=new Box3().setFromObject(m.parts.node);
 for(const n of m.parts.nodes){if(n===m.parts.node)continue;const other=new Box3().setFromObject(n);assert.equal(selected.intersectsBox(other),false,`neighbor slot ${m.parts.nodes.indexOf(n)}`);}
 m.dispose();
});
