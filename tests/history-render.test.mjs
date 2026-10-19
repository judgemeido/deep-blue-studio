import test from 'node:test';
import assert from 'node:assert/strict';

import { renderHistoryMarkup } from '../src/history/render-history.js';

function chapter(index) {
  const id = `ch${String(index).padStart(2, '0')}`;
  return {
    id,
    act: Math.ceil(index / 8),
    period: '1950—1959',
    kicker: '一个时代的现场',
    title: `第 ${index} 节的机器与人`,
    story: ['一段足够长的叙事，描写操作员在机房里行动，声音和灯光把时间拉长。', '另一段足够长的叙事，写出技术如何改变现场，以及问题如何留下来。'],
    people: ['测试人物'],
    incident: '纸带在夜班中卡住，所有人停下来等待下一步。',
    image: `assets/history/chapter-${index}.jpg`,
    imageAlt: '测试图片',
    caption: '一张测试展签。',
  };
}

const chapters = Array.from({ length: 32 }, (_, index) => chapter(index + 1));
const milestones = [4, 8, 12, 16, 20, 24, 28, 32].map(index => ({
  chapterId: `ch${String(index).padStart(2, '0')}`,
  label: `节点 ${index}`,
  title: `第 ${index} 节的重要节点`,
  detail: '节点详情把现场、人物和技术转折连成一段可展开的故事。',
  people: ['节点人物'],
  place: '测试机房',
  image: `assets/history/milestone-${index}.jpg`,
}));

test('renders the complete chapter directory and page set from data', () => {
  const html = renderHistoryMarkup({ chapters, milestones });
  assert.equal((html.match(/data-chapter=/g) ?? []).length, 32);
  assert.equal((html.match(/data-milestone-trigger=/g) ?? []).length, 8);
  assert.equal((html.match(/data-scene-link=/g) ?? []).length, 32);
  assert.match(html, /id="history-directory"/);
  assert.match(html, /id="history-pages"/);
  assert.match(html, /id="milestone-dialog"/);
});

test('renders a drawer directory with one active act and an accessible toggle', () => {
  const html = renderHistoryMarkup({ chapters, milestones });
  assert.match(html, /data-directory-drawer/);
  assert.match(html, /data-directory-toggle/);
  assert.match(html, /aria-expanded="false"/);
  assert.equal((html.match(/data-directory-act=/g) ?? []).length, 4);
  assert.match(html, /data-directory-act="1"[^>]*data-directory-active/);
});

test('does not render removed source language as visible history content', () => {
  const html = renderHistoryMarkup({ chapters, milestones });
  assert.doesNotMatch(html, /史料|出处|参考/);
});
