import test from 'node:test';
import assert from 'node:assert/strict';
import { samplePose } from '../src/prototype/motion.js';
import { createState, selectStation, advance, resetState } from '../src/prototype/state.js';
test('mechanical prerequisites and extraction before rotation hold across the trajectory', () => {
  for (let p=0;p<=6;p+=0.01) {
    const pose=samplePose(p);
    if(p<=1) assert.equal(pose.nodeZ,0);
    if(p<=3) assert.equal(pose.coverY,0);
    if(p<=4) assert.equal(pose.cardY,0);
    if(p<=4.65) assert.equal(pose.cardAngle,0);
    if(p<6) assert.equal(pose.microVisible,false);
    assert.ok(Object.values(pose).every(v=>typeof v==='boolean'||Number.isFinite(v)));
  }
  assert.equal(samplePose(6).microVisible,true);
  assert.equal(samplePose(2).disconnected,true);
  assert.equal(samplePose(0).doorAngle,0);
});
test('latest target replaces old requests and reversing is continuous',()=>{
  let s=selectStation(createState(),3);
  for(let i=0;i<40;i++) s=advance(s,0.05);
  const before=s.progress;
  s=selectStation(s,0);
  assert.equal(s.progress,before);
  assert.ok(advance(s,0.05).progress<before);
  s=selectStation(selectStation(s,3),1);
  assert.equal(s.target,3);
});
test('reset is drift-free, reduced motion has identical final poses, background delta is capped',()=>{
  for(let i=0;i<100;i++){
    let s=selectStation(createState(),3);
    for(let j=0;j<150;j++) s=advance(s,0.05);
    assert.equal(s.progress,6);
    assert.deepEqual(resetState(s),createState());
    assert.deepEqual(samplePose(s.progress),samplePose(selectStation(createState({reducedMotion:true}),3).progress));
  }
  const s=selectStation(createState(),3);
  assert.deepEqual(advance(s,120),advance(s,0.05));
});
test('nonfinite input and out-of-range stations never propagate NaN',()=>{
  assert.deepEqual(samplePose(NaN),samplePose(0));
  assert.deepEqual(samplePose(-2),samplePose(0));
  assert.deepEqual(samplePose(99),samplePose(6));
  assert.equal(selectStation(createState(),99).target,6);
  assert.equal(selectStation(createState(),NaN).target,0);
  assert.equal(advance(selectStation(createState(),3),NaN).progress,0);
});
