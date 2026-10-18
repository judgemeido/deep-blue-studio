import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraPose } from '../src/prototype/scene.js';
test('camera has finite distinct sightline for all directions and transition boundaries',()=>{
 for(const view of ['perspective','front','side','top'])for(let p=0;p<=6;p+=0.02){const c=cameraPose(p,view);assert.ok([...c.target.toArray(),...c.position.toArray()].every(Number.isFinite));assert.ok(c.target.distanceTo(c.position)>0.4);}
 const a=cameraPose(3),b=cameraPose(3+1e-7);assert.ok(a.position.distanceTo(b.position)<1e-5);
});
