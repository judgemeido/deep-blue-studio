import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHAPTERS, MILESTONES } from '../src/history/chapters.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('exports exactly 32 continuous chapter records grouped into four acts', () => {
  assert.equal(CHAPTERS.length, 32);
  assert.deepEqual(CHAPTERS.map(chapter => chapter.id), Array.from({ length: 32 }, (_, index) => `ch${String(index + 1).padStart(2, '0')}`));
  assert.deepEqual(
    [...new Set(CHAPTERS.map(chapter => chapter.act))],
    [1, 2, 3, 4],
  );
  for (const act of [1, 2, 3, 4]) {
    assert.equal(CHAPTERS.filter(chapter => chapter.act === act).length, 8);
  }
});

test('each chapter carries the complete narrative and image contract', () => {
  for (const chapter of CHAPTERS) {
    assert.match(chapter.period, /\S/);
    assert.match(chapter.kicker, /\S/);
    assert.match(chapter.title, /\S/);
    assert.ok(Array.isArray(chapter.story) && chapter.story.length >= 2);
    assert.ok(chapter.story.every(paragraph => paragraph.length >= 70));
    assert.ok(Array.isArray(chapter.people) && chapter.people.length >= 1 && chapter.people.length <= 3);
    assert.match(chapter.incident, /\S/);
    assert.match(chapter.image, /^assets\/history\/[\w.-]+$/);
    assert.match(chapter.imageAlt, /\S/);
    assert.match(chapter.caption, /\S/);
  }
});

test('chapters 03 and 07 use distinct local images', () => {
  const chapter03 = CHAPTERS.find(chapter => chapter.id === 'ch03');
  const chapter07 = CHAPTERS.find(chapter => chapter.id === 'ch07');
  assert.match(chapter03.image, /^assets\/history\//);
  assert.match(chapter07.image, /^assets\/history\//);
  assert.notEqual(chapter03.image, chapter07.image);
  assert.notEqual(chapter03.image, CHAPTERS[0].image);
  assert.notEqual(chapter07.image, CHAPTERS[0].image);
});

test('all chapter and milestone image paths resolve inside the local asset directory', () => {
  const paths = [...CHAPTERS, ...MILESTONES].map(record => record.image);
  for (const assetPath of paths) {
    assert.equal(existsSync(resolve(projectRoot, assetPath)), true, `missing local asset: ${assetPath}`);
  }
});

test('exports eight milestones attached every four chapters', () => {
  assert.equal(MILESTONES.length, 8);
  assert.deepEqual(
    MILESTONES.map(milestone => milestone.chapterId),
    ['ch04', 'ch08', 'ch12', 'ch16', 'ch20', 'ch24', 'ch28', 'ch32'],
  );
  for (const milestone of MILESTONES) {
    assert.match(milestone.label, /\S/);
    assert.match(milestone.title, /\S/);
    assert.match(milestone.detail, /\S/);
    assert.ok(Array.isArray(milestone.people) && milestone.people.length >= 1);
    assert.match(milestone.place, /\S/);
    assert.match(milestone.image, /^assets\/history\/[\w.-]+$/);
  }
});
