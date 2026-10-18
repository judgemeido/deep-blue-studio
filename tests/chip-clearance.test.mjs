import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Box3,Vector3 } from 'three';
import { createModel } from '../src/prototype/model.js';
import { samplePose } from '../src/prototype/motion.js';
import { fitCameraPose } from '../src/prototype/scene.js';
const contract=JSON.parse(readFileSync(new URL('../docs/MODEL_CONTRACT.json',import.meta.url)));
test('magnified package clears visible physical hardware before growing; camera stays outside',()=>{
 const m=createModel(contract);
 for(let i=1;i<=200;i++){
  const p=5+i/200;m.applyPose(samplePose(p));
  if(!m.parts.micro.visible)continue;
  const microBox=new Box3().setFromObject(m.parts.micro);
  const camera=fitCameraPose(p,'perspective',1.2).position;
  assert.equal(microBox.clone().expandByScalar(0.05).containsPoint(camera),false,`camera at ${p}`);
  if(!m.parts.physical.visible)continue;
  m.parts.physical.traverse(o=>{
   if(!o.isMesh||o===m.parts.chips[0]||o.material.opacity<0.1)return;
   const b=new Box3().setFromObject(o);
   const overlap=microBox.clone().intersect(b);
   if(overlap.isEmpty())return;
   const size=overlap.getSize(new Vector3());
   assert.ok(Math.min(size.x,size.y,size.z)<0.001,`visible hardware penetration at ${p}: ${size.x},${size.y},${size.z}`);
  });
 }
 m.dispose();
});
