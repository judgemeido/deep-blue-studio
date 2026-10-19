import test from 'node:test';
import assert from 'node:assert/strict';
import { createMilestoneController } from '../src/history/milestone-controller.js';

class FakeElement {
  constructor(name) {
    this.name = name;
    this.listeners = new Map();
    this.attributes = new Map();
    this.dataset = {};
    this.textContent = '';
    this.src = '';
    this.alt = '';
    this.open = false;
    this.focusCount = 0;
  }

  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  removeEventListener(type, listener) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter(item => item !== listener));
  }

  dispatch(type, event = {}) {
    const payload = { type, preventDefault() {}, ...event };
    for (const listener of this.listeners.get(type) ?? []) listener(payload);
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  focus() { this.focusCount += 1; }
}

class FakeDialog extends FakeElement {
  constructor() {
    super('dialog');
    this.parts = new Map([
      ['[data-milestone-label]', new FakeElement('label')],
      ['[data-milestone-title]', new FakeElement('title')],
      ['[data-milestone-detail]', new FakeElement('detail')],
      ['[data-milestone-image]', new FakeElement('image')],
      ['[data-milestone-caption]', new FakeElement('caption')],
      ['[data-milestone-people]', new FakeElement('people')],
      ['[data-milestone-place]', new FakeElement('place')],
      ['.dialog-close', new FakeElement('close')],
    ]);
  }

  querySelector(selector) { return this.parts.get(selector) ?? null; }
  showModal() { this.open = true; this.setAttribute('open', ''); }
  close() { this.open = false; this.removeAttribute('open'); this.dispatch('close'); }
}

class FakeRoot extends FakeElement {
  constructor(dialog, trigger) {
    super('root');
    this.dialog = dialog;
    this.trigger = trigger;
  }

  querySelector(selector) {
    if (selector === '#milestone-dialog') return this.dialog;
    if (selector === '[data-milestone-id="ch20"]') return this.trigger;
    if (selector === '[data-milestone-trigger="milestone-ch20"]') return this.trigger;
    return null;
  }

  contains(node) { return node === this.trigger || node === this.dialog; }
}

function fixture() {
  const dialog = new FakeDialog();
  const trigger = new FakeElement('trigger');
  trigger.setAttribute('data-milestone-id', 'ch20');
  trigger.closest = selector => selector === '[data-milestone-trigger]' ? trigger : null;
  const root = new FakeRoot(dialog, trigger);
  return { dialog, trigger, root };
}

const milestone = {
  chapterId: 'ch20',
  label: '重要节点 E',
  title: '六局棋让机器拥有公众的脸',
  detail: '1997 年的比赛把多年工程压缩成六局棋。',
  people: ['Garry Kasparov', 'Feng-hsiung Hsu'],
  place: '纽约市，1997 年比赛现场',
  image: 'assets/history/deep-blue-match.svg',
  imageAlt: 'Deep Blue 比赛现场教学构图',
  caption: '胜负之外，还有一支维护团队。',
};

test('milestone trigger opens dialog, fills story, and restores focus', () => {
  const { dialog, trigger, root } = fixture();
  const controller = createMilestoneController(root, [milestone]);

  root.dispatch('click', { target: trigger });

  assert.equal(dialog.open, true);
  assert.equal(dialog.querySelector('[data-milestone-title]').textContent, milestone.title);
  assert.equal(dialog.querySelector('[data-milestone-detail]').textContent, milestone.detail);
  assert.equal(dialog.querySelector('[data-milestone-people]').textContent, milestone.people.join('、'));
  assert.equal(dialog.querySelector('[data-milestone-place]').textContent, milestone.place);
  assert.equal(dialog.querySelector('[data-milestone-image]').src, milestone.image);
  assert.equal(dialog.querySelector('.dialog-close').focusCount, 1);

  controller.close();
  assert.equal(dialog.open, false);
  assert.equal(trigger.focusCount, 1);
  controller.destroy();
});

test('escape, close button, and backdrop all close the active milestone', () => {
  const { dialog, trigger, root } = fixture();
  const controller = createMilestoneController(root, [milestone]);

  controller.open('ch20');
  dialog.dispatch('keydown', { key: 'Escape' });
  assert.equal(dialog.open, false);
  assert.equal(trigger.focusCount, 1);

  controller.open('ch20');
  dialog.querySelector('.dialog-close').dispatch('click');
  assert.equal(dialog.open, false);
  assert.equal(trigger.focusCount, 2);

  controller.open('ch20');
  dialog.dispatch('click', { target: dialog });
  assert.equal(dialog.open, false);
  assert.equal(trigger.focusCount, 3);
});

test('opening a second milestone replaces the first dialog content', () => {
  const { dialog, root } = fixture();
  const second = { ...milestone, chapterId: 'ch24', title: '让数据换一条车道' };
  const controller = createMilestoneController(root, [milestone, second]);

  controller.open(milestone);
  controller.open(second);
  assert.equal(dialog.querySelector('[data-milestone-title]').textContent, second.title);
  assert.equal(dialog.dataset.milestoneId, 'ch24');
});

