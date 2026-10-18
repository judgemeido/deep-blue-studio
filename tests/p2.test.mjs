import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { createExhibit } from '../src/prototype/exhibit.js';
import { createCabinetDoor } from '../src/prototype/cabinet-door.js';
test('chess display includes 64 squares and 32 pieces, all outside extraction corridor',()=>{
 const e=createExhibit();assert.equal(e.parts.squares.length,64);assert.equal(e.parts.pieces.length,32);
 const bounds=new Box3().setFromObject(e.root);assert.ok(bounds.min.x>2.1,'props stay right of cabinets and node corridor');
 e.setProgress(0);assert.equal(e.root.visible,true);e.setProgress(2.5);assert.equal(e.root.visible,false);e.setProgress(0);assert.equal(e.root.visible,true);
 let disposals=0;const textures=new Set();e.root.traverse(o=>{if(o.material?.map)textures.add(o.material.map);});textures.forEach(t=>t.addEventListener('dispose',()=>disposals++));e.dispose();e.dispose();assert.equal(disposals,textures.size);
});
test('ventilated door uses actual openings, fits frame and shares instanced mesh hardware',()=>{
 const d=createCabinetDoor();const b=new Box3().setFromObject(d);
 assert.ok(b.max.x<=1.53&&b.min.x>=-0.01);assert.ok(b.max.y<=1.76&&b.min.y>=-1.76);
 let vents=0;d.traverse(o=>{if(o.isInstancedMesh)vents+=o.count;});assert.ok(vents>100);
 assert.equal(d.userData.solidPanel,false);
});
