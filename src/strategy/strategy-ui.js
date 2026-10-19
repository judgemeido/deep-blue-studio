const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function createStrategyUI({ records, onRead = () => {}, onProgress = () => {}, onCommand = () => {}, documentRef = globalThis.document } = {}) {
  const byId = id => documentRef?.getElementById?.(id);
  const elements = {
    index: byId('archive-index'), read: byId('read-record'), timeline: byId('timeline'), play: byId('play-toggle'), forward: byId('step-forward'), back: byId('step-back'), reset: byId('reset-record'), title: byId('record-title'), description: byId('record-description'), boundary: byId('record-boundary'), label: byId('record-label'), progress: byId('progress-readout'), time: byId('record-time'), source: byId('record-source'), cursor: byId('cursor-readout'), drawer: byId('archive-drawer'), drawerToggle: byId('drawer-toggle'),
  };
  let cursorIndex = 0; let activeIndex = 0; let progress = 0; let playing = false; let disposed = false; let animationFrame = null; let previousTime = 0; const reducedMotion = Boolean(documentRef?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const current = () => records[Math.max(0, Math.min(records.length - 1, activeIndex))];
  const recordButtons = () => elements.index?.querySelectorAll?.('[data-record-index]') || documentRef?.querySelectorAll?.('[data-record-index]') || [];
  const emitProgress = () => { onProgress(progress, current()); if (elements.timeline) elements.timeline.value = String(progress); if (elements.progress) elements.progress.textContent = `${Math.round(progress * 100)}%`; if (elements.time) elements.time.textContent = `00:${String(Math.round(progress * 24)).padStart(2, '0')}`; };
  const render = () => {
    const record = current(); if (!record) return;
    if (elements.title) elements.title.textContent = record.title; if (elements.description) elements.description.textContent = record.description; if (elements.boundary) elements.boundary.textContent = record.boundary; if (elements.label) elements.label.textContent = record.label; if (elements.source) elements.source.textContent = `${record.source.id} · ${record.source.locator}。${record.note || ''}`; if (elements.cursor) elements.cursor.textContent = `游标 ${cursorIndex + 1} / ${records.length}`;
    recordButtons().forEach(button => { const index = Number(button.dataset.recordIndex); button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false'); button.setAttribute('aria-selected', index === cursorIndex ? 'true' : 'false'); button.classList?.toggle?.('is-cursor', index === cursorIndex); button.classList?.toggle?.('is-active', index === activeIndex); });
    if (elements.play) elements.play.textContent = playing ? '暂停' : '播放'; if (elements.play) elements.play.setAttribute('aria-pressed', String(playing)); emitProgress();
  };
  const setPlaying = value => { playing = Boolean(value) && !reducedMotion; render(); if (playing && !animationFrame) animationFrame = globalThis.requestAnimationFrame?.(animate); };
  const animate = time => { animationFrame = null; if (disposed || !playing) return; const delta = previousTime ? Math.min(0.1, (time - previousTime) / 1000) : 0; previousTime = time; progress = clamp(progress + delta * 0.18); emitProgress(); if (progress >= 1) { playing = false; onCommand({ type: 'COMPLETE' }); render(); } else animationFrame = globalThis.requestAnimationFrame?.(animate); };
  const moveCursor = delta => { cursorIndex = Math.max(0, Math.min(records.length - 1, cursorIndex + delta)); render(); };
  const read = () => { activeIndex = cursorIndex; progress = 0; onRead(current()); onCommand({ type: 'READ', record: current() }); render(); elements.read?.focus?.(); };
  const setProgress = value => { progress = clamp(value); emitProgress(); };
  const command = type => {
    if (type === 'PLAY_PAUSE') { setPlaying(!playing); onCommand({ type }); return; }
    if (type === 'STEP') { setPlaying(false); progress = clamp(progress + (type.delta || 0)); onCommand({ type }); emitProgress(); return; }
    if (type === 'RESET') { setPlaying(false); progress = 0; activeIndex = cursorIndex; onCommand({ type }); render(); return; }
    onCommand({ type });
  };
  const handleKey = event => { const key = event.key; if (['ArrowUp', 'ArrowDown', 'Enter', ' ', 'ArrowLeft', 'ArrowRight', 'r', 'R'].includes(key)) event.preventDefault?.(); if (key === 'ArrowUp') moveCursor(-1); else if (key === 'ArrowDown') moveCursor(1); else if (key === 'Enter') read(); else if (key === ' ') command('PLAY_PAUSE'); else if (key === 'ArrowLeft') { setPlaying(false); setProgress(progress - 0.05); onCommand({ type: 'STEP', delta: -0.05 }); } else if (key === 'ArrowRight') { setPlaying(false); setProgress(progress + 0.05); onCommand({ type: 'STEP', delta: 0.05 }); } else if (key === 'r' || key === 'R') command('RESET'); else if (key === 'Escape') elements.drawer?.classList?.remove?.('is-open'); };
  elements.index?.addEventListener?.('click', event => { const button = event.target?.closest?.('[data-record-index]'); if (button) { cursorIndex = Number(button.dataset.recordIndex); render(); } });
  elements.read?.addEventListener?.('click', read); elements.play?.addEventListener?.('click', () => command('PLAY_PAUSE')); elements.forward?.addEventListener?.('click', () => { setPlaying(false); setProgress(progress + 0.05); onCommand({ type: 'STEP', delta: 0.05 }); }); elements.back?.addEventListener?.('click', () => { setPlaying(false); setProgress(progress - 0.05); onCommand({ type: 'STEP', delta: -0.05 }); }); elements.reset?.addEventListener?.('click', () => command('RESET'));
  elements.timeline?.addEventListener?.('input', event => setProgress(Number(event.target.value))); elements.timeline?.addEventListener?.('change', event => { setProgress(Number(event.target.value)); onCommand({ type: 'SCRUB', value: progress }); }); elements.drawerToggle?.addEventListener?.('click', () => elements.drawer?.classList?.toggle?.('is-open'));
  documentRef?.addEventListener?.('keydown', handleKey); render();
  return { moveCursor, read, setProgress, setPlaying, handleKey, getState: () => ({ cursorIndex, activeIndex, progress, playing, recordId: current()?.id }), dispose() { disposed = true; if (animationFrame && globalThis.cancelAnimationFrame) cancelAnimationFrame(animationFrame); documentRef?.removeEventListener?.('keydown', handleKey); } };
}
