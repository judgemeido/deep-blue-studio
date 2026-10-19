import test from 'node:test';
import assert from 'node:assert/strict';
import { createStrategyUI } from '../src/strategy/strategy-ui.js';

class Element {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; this.textContent = ''; this.value = '0'; this.disabled = false; this.hidden = false; this.classList = { toggle() {}, add() {}, remove() {} }; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, event = {}) { for (const callback of this.listeners[type] || []) callback({ target: this, preventDefault() {}, ...event }); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  querySelectorAll(selector) { const result = []; const walk = node => { if (selector === '[data-record-index]' && node.dataset.recordIndex != null) result.push(node); node.children.forEach(walk); }; this.children.forEach(walk); return result; }
  focus() { this.focused = true; }
}
const records = [1, 2, 3].map((n) => ({ id: `r${n}`, label: `0${n}`, title: `记录 ${n}`, description: '说明', boundary: '边界', source: { id: 'S1', url: 'https://example.com' } }));

test('cursor movement does not activate a record until read', () => {
  const elements = new Map(['archive-index', 'read-record', 'timeline', 'play-toggle', 'step-forward', 'step-back', 'reset-record', 'record-title', 'record-description', 'record-boundary', 'record-label', 'progress-readout'].map(id => [id, new Element(id === 'timeline' ? 'input' : 'div')]));
  const index = elements.get('archive-index'); records.forEach((record, indexValue) => { const item = new Element('button'); item.dataset.recordIndex = String(indexValue); index.append(item); });
  const documentRef = { getElementById: id => elements.get(id), querySelectorAll: selector => index.querySelectorAll(selector), createElement: tag => new Element(tag), addEventListener() {} };
  const reads = []; const progress = [];
  const ui = createStrategyUI({ documentRef, records, onRead: record => reads.push(record.id), onProgress: value => progress.push(value) });
  ui.moveCursor(1); assert.equal(ui.getState().cursorIndex, 1); assert.deepEqual(reads, []);
  ui.read(); assert.deepEqual(reads, ['r2']); ui.setProgress(0.5); assert.equal(progress.at(-1), 0.5); ui.dispose();
});

test('keyboard commands share the same transport controls', () => {
  const elements = new Map(['archive-index', 'read-record', 'timeline', 'play-toggle', 'step-forward', 'step-back', 'reset-record', 'record-title', 'record-description', 'record-boundary', 'record-label', 'progress-readout'].map(id => [id, new Element(id === 'timeline' ? 'input' : 'div')]));
  const documentRef = { getElementById: id => elements.get(id), querySelectorAll: () => [], createElement: tag => new Element(tag), addEventListener() {} };
  const commands = []; const ui = createStrategyUI({ documentRef, records, onCommand: command => commands.push(command) });
  ui.handleKey({ key: 'ArrowDown', preventDefault() {} }); ui.handleKey({ key: 'Enter', preventDefault() {} }); ui.handleKey({ key: 'ArrowRight', preventDefault() {} }); ui.handleKey({ key: 'r', preventDefault() {} });
  assert.deepEqual(commands.map(command => command.type), ['READ', 'STEP', 'RESET']);
  assert.equal(commands[1].delta, 0.05); ui.dispose();
});
