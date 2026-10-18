import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Vector3} from 'three';
import {createModel} from '../src/prototype/model.js';
import {samplePose} from '../src/prototype/motion.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('card rotates rigidly around its own center outside scaled chassis',()=>{
 const m=createModel(contract),a=new Vector3(.2,0,0),b=new Vector3(0,0,.4);
 m.applyPose(samplePose(4.65));const card=m.parts.cards[0],center=card.getWorldPosition(new Vector3());const length=card.localToWorld(a.clone()).distanceTo(center);
 m.applyPose(samplePose(5));const end=card.getWorldPosition(new Vector3());
 assert.ok(center.distanceTo(end)<1e-6,'rotation must not move board center');
 assert.ok(Math.abs(card.localToWorld(a.clone()).distanceTo(end)-length)<1e-6,'rotation must not deform board');
 assert.ok(Math.abs(card.localToWorld(b.clone()).distanceTo(end)-.4)<1e-6);m.dispose();
});
test('fading hardware does not cast opaque shadows and tiny magnified layers do not self-shadow',()=>{
 const m=createModel(contract);m.applyPose(samplePose(5.2));
 m.parts.physical.traverse(o=>{if(o.isMesh&&o.material.opacity<1)assert.equal(o.castShadow,false);});
 m.parts.micro.traverse(o=>{if(o.isMesh){assert.equal(o.castShadow,false);assert.equal(o.receiveShadow,false);}});
 m.applyPose(samplePose(5));assert.equal(m.parts.cards[0].children[0].castShadow,true);m.dispose();
});
