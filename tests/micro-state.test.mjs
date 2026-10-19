import test from 'node:test';
import assert from 'node:assert/strict';
import { createMicroState, reduceMicroState, sampleMicroPose } from '../src/prototype/micro-state.js';

test('micro state starts closed, assembled, idle and empty', () => {
  assert.deepEqual(createMicroState(), { lid: 'closed', section: 'assembled', hotspot: null, trace: 'idle', traceStep: 0, reducedMotion: false });
});

test('micro actions respect prerequisites and can be reversed', () => {
  let state = createMicroState();
  state = reduceMicroState(state, { type: 'TOGGLE_SECTION' });
  assert.equal(state.section, 'assembled');
  state = reduceMicroState(state, { type: 'OPEN_LID' });
  state = reduceMicroState(state, { type: 'TOGGLE_SECTION' });
  state = reduceMicroState(state, { type: 'SELECT_HOTSPOT', id: 'evaluate' });
  state = reduceMicroState(state, { type: 'START_TRACE' });
  assert.deepEqual(state, { lid: 'open', section: 'cutaway', hotspot: 'evaluate', trace: 'playing', traceStep: 0, reducedMotion: false });
  state = reduceMicroState(state, { type: 'PAUSE_TRACE' });
  state = reduceMicroState(state, { type: 'STEP_TRACE' });
  assert.equal(state.traceStep, 1);
  state = reduceMicroState(state, { type: 'CLOSE_LID' });
  assert.equal(state.lid, 'closed');
  state = reduceMicroState(state, { type: 'RESET_MICRO' });
  assert.equal(state.hotspot, null);
  assert.equal(state.trace, 'idle');
});

test('trace steps clamp at complete and poses stay finite under bad input', () => {
  let state = createMicroState({ reducedMotion: true });
  state = reduceMicroState(state, { type: 'OPEN_LID' });
  state = reduceMicroState(state, { type: 'START_TRACE' });
  for (let i = 0; i < 20; i += 1) state = reduceMicroState(state, { type: 'STEP_TRACE' });
  assert.equal(state.trace, 'complete');
  const pose = sampleMicroPose(state, Number.NaN);
  for (const value of Object.values(pose)) assert.equal(Number.isFinite(value), true);
  assert.deepEqual(reduceMicroState(state, { type: 'SELECT_HOTSPOT', id: 'unknown' }), state);
});

test('cutaway and trace poses expose distinct visual state for the renderer', () => {
  let opened = createMicroState();
  opened = reduceMicroState(opened, { type: 'OPEN_LID' });
  const assembled = sampleMicroPose(opened, 0);
  const cutaway = sampleMicroPose(reduceMicroState(opened, { type: 'TOGGLE_SECTION' }), 0);
  assert.ok(cutaway.cutawayOffset > assembled.cutawayOffset);
  assert.ok(cutaway.sectionPlaneOpacity > assembled.sectionPlaneOpacity);

  const stepped = reduceMicroState(opened, { type: 'STEP_TRACE' });
  const trace = sampleMicroPose(stepped, 0);
  assert.ok(trace.traceProgress > 0);
  assert.equal(trace.traceStep, 1);
});
