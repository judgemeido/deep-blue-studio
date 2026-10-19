import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignalTrace } from '../src/prototype/signal-trace.js';

test('signal trace follows the five teaching boundaries in order', () => {
  const trace = createSignalTrace();
  assert.equal(trace.steps.length, 5);
  assert.deepEqual(trace.steps.map(step => step.id), ['position', 'moves', 'evaluate', 'control', 'return']);
  assert.equal(new Set(trace.steps.map(step => step.id)).size, 5);
  for (const step of trace.steps) assert.ok(step.from && step.to && step.label && step.functionId && step.duration > 0);
  assert.equal(trace.getStep(99), null);
  trace.dispose();
});
