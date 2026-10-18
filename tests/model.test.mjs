import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Vector3 } from 'three';
import { createModel } from '../src/prototype/model.js';
import { checkClearance } from '../src/prototype/geometry-checks.js';
import { samplePose } from '../src/prototype/motion.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('physical teaching node has one CPU, two cards and sixteen chips, with thirty total nodes',()=>{
 const m=createModel(contract);
 assert.equal(m.parts.nodes.length,30);assert.equal(m.parts.cards.length,2);assert.equal(m.parts.chips.length,16);
 assert.equal(m.parts.cpu.userData.kind,'cpu');assert.equal(m.root.userData.logicalChipCount,480);
 assert.notEqual(m.parts.micro.parent,m.parts.node);m.dispose();
});
test('sampled motion has clearance and detector catches deliberate card penetration',()=>{
 const m=createModel(contract);
 for(let i=0;i<=300;i++) assert.deepEqual(checkClearance(m,i/50),[],`collision at ${i/50}`);
 m.applyPose(samplePose(0));m.root.updateMatrixWorld(true);m.parts.cards[0].position.copy(m.parts.cards[0].parent.worldToLocal(m.parts.cards[1].getWorldPosition(new Vector3())));m.root.updateMatrixWorld(true);
 assert.ok(checkClearance(m).some(x=>x.pair==='card/card'));m.dispose();
});
test('applying absolute poses is idempotent and reset restores original matrices',()=>{
 const m=createModel(contract);const matrices=()=>{m.root.updateMatrixWorld(true);return m.parts.moving.map(o=>o.matrixWorld.elements.slice());};
 m.applyPose(samplePose(0));const original=matrices();
 for(let j=0;j<10;j++){m.applyPose(samplePose(4.8));const a=matrices();m.applyPose(samplePose(4.8));assert.deepEqual(matrices(),a);m.applyPose(samplePose(0));assert.deepEqual(matrices(),original);}
 let disposed=0;const geometries=new Set();m.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});geometries.forEach(g=>g.addEventListener('dispose',()=>disposed++));
 m.dispose();assert.equal(disposed,geometries.size);m.dispose();assert.equal(disposed,geometries.size);
});
