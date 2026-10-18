import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaintTexture } from '../src/prototype/surface.js';
test('paint grain repeats deterministically within bounded roughness without external assets',()=>{
 const a=createPaintTexture(),b=createPaintTexture();assert.deepEqual(a.image.data,b.image.data);
 assert.ok(a.image.data.some((v,i)=>i%4===1&&v<200));assert.ok(a.image.data.every((v,i)=>i%4===3||v>=130));
 a.dispose();b.dispose();
});
