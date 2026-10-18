import test from 'node:test';import assert from 'node:assert/strict';
import {makeTeachingTree,runSearch} from '../src/teaching/search.js';
test('hand-computed tree returns five and same first best root move, with genuine event counts',()=>{
 for(const reverse of [false,true]){const tree=makeTeachingTree({reverse}),snapshot=JSON.stringify(tree);const a=runSearch(tree),b=runSearch(tree,{strategy:'alphabeta'});assert.equal(a.value,5);assert.equal(b.value,5);assert.equal(a.bestChildId,'L');assert.equal(a.bestChildId,b.bestChildId);assert.equal(a.evaluatedLeaves,8);assert.ok(b.evaluatedLeaves<=8);assert.equal(a.visitedNodes,15);assert.equal(JSON.stringify(tree),snapshot);for(const r of [a,b]){assert.equal(r.visitedNodes,r.events.filter(e=>e.type==='enter').length);assert.equal(r.evaluatedLeaves,r.events.filter(e=>e.type==='evaluate').length);r.events.filter(e=>e.type==='prune').forEach(e=>{assert.ok(e.alpha>=e.beta);e.skippedIds.forEach(id=>assert.ok(!r.events.some(x=>x.type==='enter'&&x.nodeId===id)));});}}
});
test('ties use first move, negative values and seeded trees agree across algorithms',()=>{
 const tie={id:'r',children:[{id:'a',value:-2},{id:'b',value:-2}]};assert.equal(runSearch(tie).bestChildId,'a');assert.equal(runSearch(tie).value,-2);
 let seed=3;for(let j=0;j<100;j++){const t=makeTeachingTree();const fill=n=>{if(n.children)n.children.forEach(fill);else{seed=(Math.imul(seed,1664525)+1013904223)>>>0;n.value=seed%41-20;}};fill(t);assert.equal(runSearch(t).value,runSearch(t,{strategy:'alphabeta'}).value);}
});
test('invalid trees and unknown strategy rejected',()=>{for(const t of [{id:'r',children:[]},{id:'r',value:NaN},{id:'r',children:[{id:'r',value:1}]}])assert.throws(()=>runSearch(t));assert.throws(()=>runSearch(makeTeachingTree(),{strategy:'fake'}));});
