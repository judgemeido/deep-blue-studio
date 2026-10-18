import test from 'node:test';
import assert from 'node:assert/strict';
import { fitCameraPose } from '../src/prototype/scene.js';
test('narrow aspect pulls camera back without moving its target or direction',()=>{
 const wide=fitCameraPose(5,'perspective',1.2),narrow=fitCameraPose(5,'perspective',0.7);
 assert.deepEqual(wide.target,narrow.target);
 assert.ok(narrow.position.distanceTo(narrow.target)>wide.position.distanceTo(wide.target)*1.5);
 assert.ok(narrow.position.clone().sub(narrow.target).normalize().distanceTo(wide.position.clone().sub(wide.target).normalize())<1e-6);
});
