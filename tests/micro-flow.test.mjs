import test from 'node:test';
import assert from 'node:assert/strict';
import { createTeachingUI } from '../src/teaching/teaching-ui.js';

class Element {
  constructor(tag, doc) { this.tagName = tag; this.doc = doc; this.children = []; this.listeners = {}; this.classList = { toggle() {} }; }
  set textContent(value) { this.text = value; }
  get textContent() { return this.text ?? this.children.map(child => child.textContent).join(''); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  click() { this.listeners.click?.(); }
  setAttribute() {}
  focus() { this.doc.activeElement = this; }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  querySelectorAll(tag) { return this.children.flatMap(child => [...(child.tagName === tag ? [child] : []), ...child.querySelectorAll(tag)]); }
  querySelector(tag) { return this.querySelectorAll(tag)[0] ?? null; }
}

test('fifth teaching step can enter chip actions without an intermediate station request', () => {
  const previous = globalThis.document;
  const previousMatchMedia = globalThis.matchMedia;
  const doc = { activeElement: null };
  doc.createElement = tag => new Element(tag, doc);
  doc.createElementNS = (_, tag) => new Element(tag, doc);
  const ids = Object.fromEntries(['teaching-toggle', 'show-content', 'show-model', 'controls'].map(id => [id, new Element('button', doc)]));
  const main = new Element('main', doc); doc.body = new Element('body', doc);
  doc.getElementById = id => ids[id]; doc.querySelector = () => main;
  globalThis.document = doc;
  globalThis.matchMedia = () => ({ matches: false });
  const stations = []; const actions = []; let ui;
  try {
    const container = new Element('section', doc);
    ui = createTeachingUI({ container, onStation: index => stations.push(index), onMicroAction: action => actions.push(action) });
    ids['teaching-toggle'].click();
    const button = label => container.querySelectorAll('button').find(node => node.textContent === label);
    stations.length = 0;
    button('5 进入芯片').click();
    button('开盖查看').click();
    assert.equal(stations.includes(0), false);
    assert.equal(stations.at(-1), 3);
    assert.deepEqual(actions, [{ type: 'OPEN_LID' }]);
    button('追踪一次信号').click();
    assert.deepEqual(actions.slice(-2), [{ type: 'OPEN_LID' }, { type: 'START_TRACE' }]);
  } finally {
    ui?.dispose();
    globalThis.document = previous;
    globalThis.matchMedia = previousMatchMedia;
  }
});
