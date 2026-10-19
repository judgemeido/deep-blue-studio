import test from 'node:test';
import assert from 'node:assert/strict';
import { createChipUI } from '../src/prototype/chip-ui.js';

class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; this.classList = { toggle() {} }; this.disabled = false; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  click() { if (!this.disabled) this.listeners.click?.(); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  querySelectorAll(selector) {
    const matches = [];
    const visit = node => { if (selector === 'button' && node.tagName === 'button') matches.push(node); node.children.forEach(visit); };
    this.children.forEach(visit);
    return matches;
  }
  textContent(value) { return value; }
}

test('chip actions expose reversible controls and update without duplicate events', () => {
  const previous = globalThis.document;
  const controls = new Element('aside');
  const doc = {
    createElement: tag => new Element(tag),
    createTextNode: text => new Element(`#text:${text}`),
    getElementById: id => id === 'controls' ? controls : null
  };
  globalThis.document = doc;
  const container = new Element('section');
  const actions = [];
  const selections = [];
  let ui;
  try {
    ui = createChipUI({ container, onSelect: value => selections.push(value), onAction: value => actions.push(value) });
    ui.update({ station: 3, progress: 6, teaching: false });
    const buttons = container.querySelectorAll('button');
    const lid = buttons.find(button => button.dataset.chipAction === 'lid');
    assert.ok(lid);
    lid.click();
    assert.deepEqual(actions, [{ type: 'OPEN_LID' }]);
    ui.setMicroState({ lid: 'open', section: 'assembled', trace: 'idle', traceStep: 0 });
    const trace = buttons.find(button => button.dataset.chipAction === 'trace');
    trace.click();
    assert.deepEqual(actions.at(-1), { type: 'START_TRACE' });
    ui.selectById('evaluate');
    assert.equal(selections.at(-1), 1);
  } finally {
    ui?.dispose();
    globalThis.document = previous;
  }
});
