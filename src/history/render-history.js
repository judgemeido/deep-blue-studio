const ACTS = [
  { id: 'act-one', label: '第一幕', title: '机器还没有名字', period: '1930—1959 · 计算第一次离开纸面' },
  { id: 'act-two', label: '第二幕', title: '速度成为国家工程', period: '1960—1989 · 向量、阵列与并行机房' },
  { id: 'act-three', label: '第三幕', title: '机器走进公众视线', period: '1990—2013 · 排行榜、深蓝与异构计算' },
  { id: 'act-four', label: '第四幕', title: '百亿亿次之后，问题仍在人间', period: '2014—今天 · 能效、公共服务与开放问题' },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function chapterNumber(id, fallback) {
  const number = Number.parseInt(String(id).replace(/^ch/i, ''), 10);
  return Number.isFinite(number) ? number : fallback;
}

function actId(act) {
  return ACTS[Number(act) - 1]?.id ?? `act-${act}`;
}

function renderPeople(people = []) {
  if (!people.length) return '';
  return `<ul class="chapter-people" aria-label="关键人物与群体">${people.map(person => `<li>${escapeHtml(person)}</li>`).join('')}</ul>`;
}

function renderFocus(chapter, people = []) {
  const names = people.slice(0, 2).join('、');
  return `<aside class="chapter-focus" aria-label="本节重点"><span class="focus-label">本节重点</span><div><strong>${escapeHtml(chapter.period)}</strong><b>${escapeHtml(chapter.title)}</b></div>${names ? `<p><em>相关人物</em>${escapeHtml(names)}</p>` : ''}<p><em>读完记住</em>${escapeHtml(chapter.caption)}</p></aside>`;
}

function renderMilestoneTrigger(milestone) {
  if (!milestone) return '';
  const id = `milestone-${escapeHtml(milestone.chapterId)}`;
  return `<div class="milestone-entry"><button type="button" data-milestone-trigger="${id}" data-milestone-id="${escapeHtml(milestone.chapterId)}" aria-controls="milestone-dialog"><span>${escapeHtml(milestone.label)}</span><strong>${escapeHtml(milestone.title)}</strong><b aria-hidden="true">展开故事 ↗</b></button></div>`;
}

function renderChapter(chapter, index, milestone) {
  const number = chapterNumber(chapter.id, index + 1);
  const ordinal = String(number).padStart(2, '0');
  const story = Array.isArray(chapter.story) ? chapter.story : [chapter.story];
  const storyMarkup = story.filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const people = Array.isArray(chapter.people) ? chapter.people : [];
  const image = escapeHtml(chapter.image);
  const title = escapeHtml(chapter.title);
  const id = escapeHtml(chapter.id);
  const closing = number === 32 ? ' closing' : '';
  const exhibit = number === 32 ? `<div class="exhibit-links"><a href="prototype/"><span>01</span><div><strong>进入 Deep Blue 三维展品</strong><p>从整机、节点、板卡到芯片，继续观察一台机器如何分工。</p></div><b aria-hidden="true">↗</b></a></div>` : '';
  return `<section id="${id}" class="history-section split${closing}" data-history-scene data-chapter="${id}" data-act="${escapeHtml(chapter.act)}" aria-labelledby="${id}-title"><div class="section-index"><span>${ordinal}</span><p>${escapeHtml(chapter.period)} / ${escapeHtml(chapter.kicker)}</p></div><div class="section-content"><header class="scene-heading"><h2 id="${id}-title" tabindex="-1">${title}</h2>${renderFocus(chapter, people)}</header><div class="section-prose">${storyMarkup}${renderPeople(people)}<details class="background-detail"><summary>现场细节</summary><p>${escapeHtml(chapter.incident)}</p></details>${renderMilestoneTrigger(milestone)}</div><div class="section-visual"><figure class="archive-photo"><img src="${image}" loading="lazy" decoding="async" alt="${escapeHtml(chapter.imageAlt)}"><figcaption>${escapeHtml(chapter.caption)}</figcaption></figure>${exhibit}</div></div></section>`;
}

function renderDirectory(chapters) {
  const chapterGroups = new Map();
  chapters.forEach((chapter, index) => {
    const act = Number(chapter.act);
    const items = chapterGroups.get(act) ?? [];
    items.push({ chapter, index });
    chapterGroups.set(act, items);
  });
  const acts = ACTS.map((metadata, index) => {
    const act = index + 1;
    const entries = chapterGroups.get(act) ?? [];
    const active = act === 1;
    const items = entries.map(({ chapter, index: chapterIndex }) => {
      const number = String(chapterNumber(chapter.id, chapterIndex + 1)).padStart(2, '0');
      return `<li><a href="#${escapeHtml(chapter.id)}" data-scene-link=""><span>${number}</span><strong>${escapeHtml(chapter.title)}</strong></a></li>`;
    }).join('');
    return `<section class="directory-act" data-directory-act="${act}"${active ? ' data-directory-active' : ''}${active ? '' : ' hidden'} aria-labelledby="directory-act-${act}-title"><header><span>${escapeHtml(metadata.label)}</span><strong id="directory-act-${act}-title">${escapeHtml(metadata.title)}</strong><small>${escapeHtml(metadata.period)}</small></header><ol>${items}</ol></section>`;
  }).join('');
  return `<aside class="reader-sidebar" data-directory-drawer data-directory-open="false" data-directory-current-act="1"><button type="button" class="directory-toggle" data-directory-toggle aria-expanded="false" aria-controls="history-directory"><span class="directory-toggle-icon" aria-hidden="true">☰</span><span class="directory-toggle-copy"><strong>阅读目录</strong><small data-directory-current-label>01 · 第一幕</small></span><span class="directory-toggle-label">打开目录</span></button><div class="archive-directory" id="history-directory"><div class="directory-panel-heading"><span>章节索引</span><span class="directory-count">${chapters.length} 节</span></div><nav class="chapter-nav" aria-label="历史章节">${acts}</nav><button type="button" class="directory-current" data-directory-current>回到当前节 <span aria-hidden="true">↗</span></button></div><p class="reader-note">沿目录读，<br>也沿着机器如何分工读。</p></aside>`;
}

function renderOverview(chapters) {
  return `<div class="act-overview"><p>这份档案的四段线索</p><div>${ACTS.map((act, index) => {
    const first = chapters.find(chapter => Number(chapter.act) === index + 1);
    const last = chapters.filter(chapter => Number(chapter.act) === index + 1).at(-1);
    const start = first ? String(chapterNumber(first.id, index * 8 + 1)).padStart(2, '0') : String(index * 8 + 1).padStart(2, '0');
    const end = last ? String(chapterNumber(last.id, index * 8 + 8)).padStart(2, '0') : String(index * 8 + 8).padStart(2, '0');
    return `<a href="#${act.id}"><span>${start}—${end}</span><strong>${escapeHtml(act.title)}</strong><small>${escapeHtml(act.period.split(' · ')[1] ?? act.period)}</small></a>`;
  }).join('')}</div></div>`;
}

function renderDialog() {
  return `<dialog id="milestone-dialog" class="milestone-dialog" aria-labelledby="milestone-dialog-title" aria-describedby="milestone-dialog-detail"><form method="dialog"><button type="submit" class="dialog-close" aria-label="关闭节点故事">×</button></form><p class="dialog-kicker" data-milestone-label>重要节点</p><h2 id="milestone-dialog-title" data-milestone-title>节点故事</h2><div class="dialog-body"><figure class="archive-photo"><img data-milestone-image alt=""><figcaption data-milestone-caption></figcaption></figure><div><p id="milestone-dialog-detail" data-milestone-detail></p><dl class="milestone-meta"><div><dt>人物</dt><dd data-milestone-people></dd></div><div><dt>地点</dt><dd data-milestone-place></dd></div></dl></div></div></dialog>`;
}

/**
 * Return the history page markup without requiring a browser DOM. Keeping this
 * pure makes the chapter contract testable while renderHistory handles mounting.
 */
export function renderHistoryMarkup({ chapters = [], milestones = [] } = {}) {
  const milestoneByChapter = new Map(milestones.map(milestone => [milestone.chapterId, milestone]));
  let previousAct;
  let pages = '';
  for (const [index, chapter] of chapters.entries()) {
    const act = Number(chapter.act);
    if (act !== previousAct) {
      const metadata = ACTS[act - 1] ?? { id: actId(act), label: `第 ${act} 幕`, title: '', period: '' };
      pages += `<div id="${metadata.id}" class="act-divider"><span>${escapeHtml(metadata.label)}</span><h2>${escapeHtml(metadata.title)}</h2><p>${escapeHtml(metadata.period)}</p></div>`;
      previousAct = act;
    }
    pages += renderChapter(chapter, index, milestoneByChapter.get(chapter.id));
  }
  return `${renderOverview(chapters)}<div class="archive-reader">${renderDirectory(chapters)}<div class="reader-pages" id="history-pages">${pages}</div></div>${renderDialog()}`;
}

export function renderHistory(root, options = {}) {
  if (!root) return { destroy() {} };
  const markup = renderHistoryMarkup(options);
  root.innerHTML = markup;
  return {
    destroy() {
      root.innerHTML = '';
    },
  };
}

export { ACTS };
