import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createModel } from '../src/prototype/model.js';
import { samplePose } from '../src/prototype/motion.js';
import { createState,selectStation,advance } from '../src/prototype/state.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('chip detail grows continuously from selected chip and reverses without drift',()=>{
 const m=createModel(contract);m.applyPose(samplePose(5.15));assert.equal(m.parts.micro.visible,true);
 const early=m.parts.micro.scale.x;m.applyPose(samplePose(5.6));assert.ok(m.parts.micro.scale.x>early);
 assert.equal(m.parts.physical.visible,false);assert.equal(m.parts.node.children[0].material.opacity,0);
 m.applyPose(samplePose(6));assert.equal(m.parts.micro.scale.x,1);assert.equal(m.parts.physical.visible,false);
 m.applyPose(samplePose(5));assert.equal(m.parts.micro.visible,false);assert.equal(m.parts.node.children[0].material.opacity,1);m.dispose();
});
test('last segment lasts about two seconds while mechanical segments keep original speed',()=>{
 let s=selectStation(createState(),3);s={...s,progress:5};
 for(let i=0;i<20;i++)s=advance(s,0.05);assert.ok(s.progress>5.4&&s.progress<5.6);
 for(let i=0;i<22;i++)s=advance(s,0.05);assert.equal(s.progress,6);
});
