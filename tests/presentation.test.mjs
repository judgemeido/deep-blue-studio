import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {readFileSync} from 'node:fs';
import {createModel} from '../src/prototype/model.js';
import {samplePose} from '../src/prototype/motion.js';
import {cameraPose,transitionLighting} from '../src/prototype/scene.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('presented board component face points straight at default camera',()=>{
 const m=createModel(contract);m.applyPose(samplePose(5));const card=m.parts.cards[0];
 const normal=new Vector3(0,1,0).applyQuaternion(card.getWorldQuaternion(new Quaternion()));
 const direction=cameraPose(5).position.sub(card.getWorldPosition(new Vector3())).normalize();
 assert.ok(normal.dot(direction)>0.9999);m.dispose();
});
test('shadow and floor fade continuously with no endpoint jump',()=>{
 let last=transitionLighting(5);
 for(let i=1;i<=1000;i++){const next=transitionLighting(5+i/1000);assert.ok(Math.abs(next.shadow-last.shadow)<0.02);assert.ok(Math.abs(next.floor-last.floor)<0.02);last=next;}
 assert.equal(transitionLighting(5).shadow,1);assert.equal(last.shadow,0);assert.equal(last.floor,0);
});
