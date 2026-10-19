import { CHIP_FUNCTIONS } from './chip-functions.js';
import { SIGNAL_TRACE_STEPS } from './signal-trace.js';

function button(text, action, signal) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.addEventListener('click', action, { signal });
  return element;
}

export function createChipUI({ container, onSelect, onAction = () => {} }) {
  const abort = new AbortController();
  let selected = null;
  let visible = false;
  let lastKey = null;
  let ready = false;
  let microState = { lid: 'closed', section: 'assembled', trace: 'idle', traceStep: 0 };
  const title = document.createElement('h2');
  title.textContent = '芯片 01 / 16 · 放大功能示意';
  const note = document.createElement('p');
  note.setAttribute('aria-live', 'polite');
  const actions = document.createElement('div');
  actions.className = 'chip-actions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', '芯片微观动作');
  const actionButtons = new Map();
  const addAction = (id, text, type) => {
    const element = button(text, () => onAction({ type: id === 'trace' ? (microState.trace === 'playing' ? 'PAUSE_TRACE' : 'START_TRACE') : type }), abort.signal);
    element.dataset.chipAction = id;
    actionButtons.set(id, element);
    actions.append(element);
  };
  addAction('lid', '开盖', 'OPEN_LID');
  addAction('section', '剖面', 'TOGGLE_SECTION');
  addAction('trace', '追踪信号', 'START_TRACE');
  addAction('step', '单步', 'STEP_TRACE');
  addAction('reset', '复位微观视图', 'RESET_MICRO');
  const traceStatus = document.createElement('p');
  traceStatus.className = 'chip-trace-status';
  traceStatus.setAttribute('role', 'status');
  traceStatus.setAttribute('aria-live', 'polite');
  const nav = document.createElement('div');
  nav.className = 'chip-functions';
  const detail = document.createElement('div');
  detail.className = 'chip-function-detail';
  detail.setAttribute('aria-live', 'polite');
  const warning = document.createElement('p');
  warning.className = 'chip-warning';
  warning.textContent = '芯片内部：教学重建，非历史版图。置换表属于软件搜索层。';
  const source = document.createElement('a');
  source.href = '/#references';
  source.textContent = '查阅 S1 / S2 / S8 史料索引 ↗';
  const buttons = CHIP_FUNCTIONS.map((f, index) => {
    const element = button(`0${index + 1} ${f.title}`, () => select(index), abort.signal);
    element.dataset.chipFunction = f.id;
    nav.append(element);
    return element;
  });
  container.append(title, note, actions, traceStatus, nav, detail, warning, source);

  function select(index) {
    selected = Number.isInteger(index) && index >= 0 && index < CHIP_FUNCTIONS.length ? index : null;
    onSelect(selected);
    buttons.forEach((element, i) => element.setAttribute('aria-pressed', String(i === selected)));
    detail.replaceChildren();
    if (selected === null) {
      detail.textContent = '选择一个功能区，查看它的输入、处理、输出与依据。';
      return;
    }
    const f = CHIP_FUNCTIONS[selected];
    for (const [label, value] of [['输入', f.input], ['处理', f.action], ['输出', f.output], ['示例', f.example], ['依据', f.source], ['边界', f.boundary]]) {
      const paragraph = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label} / `;
      paragraph.append(strong, document.createTextNode(value));
      detail.append(paragraph);
    }
  }

  function selectById(id) {
    const index = CHIP_FUNCTIONS.findIndex(f => f.id === id);
    select(index < 0 ? null : index);
  }

  function renderActions() {
    const open = microState.lid === 'open';
    const cutaway = microState.section === 'cutaway';
    const playing = microState.trace === 'playing';
    const lid = actionButtons.get('lid');
    const section = actionButtons.get('section');
    const trace = actionButtons.get('trace');
    lid.textContent = open ? '关闭封装' : '开盖';
    lid.setAttribute('aria-pressed', String(open));
    section.textContent = cutaway ? '立体' : '剖面';
    section.setAttribute('aria-pressed', String(cutaway));
    trace.textContent = playing ? '暂停' : '追踪信号';
    trace.setAttribute('aria-pressed', String(playing));
    actionButtons.get('step').disabled = !ready || !open || microState.trace === 'complete';
    trace.disabled = !ready || !open;
    section.disabled = !ready || !open;
    const stepIndex = Math.min(SIGNAL_TRACE_STEPS.length - 1, Math.max(0, Number(microState.traceStep) || 0));
    const stepLabel = SIGNAL_TRACE_STEPS[stepIndex]?.label ?? '等待输入';
    traceStatus.textContent = microState.trace === 'complete' ? `信号路径已完成 · 5 / 5 · ${stepLabel}` : `信号路径 ${Math.min(5, stepIndex + 1)} / 5 · ${playing ? '播放中' : '待命'} · ${stepLabel}`;
  }

  function setMicroState(next) {
    microState = next && typeof next === 'object' ? next : microState;
    renderActions();
  }

  select(null);
  renderActions();
  return {
    select,
    selectById,
    setMicroState,
    update({ station, progress, teaching, microState: nextState } = {}) {
      if (nextState) setMicroState(nextState);
      const show = station === 3 && !teaching;
      const key = `${show}/${progress >= 5.999}`;
      if (key === lastKey) return;
      lastKey = key;
      ready = progress >= 5.999;
      container.hidden = !show;
      document.getElementById('controls')?.classList.toggle('micro-controls', show);
      if (show !== visible) {
        visible = show;
        if (!show) select(null);
      }
      [...actionButtons.values(), ...buttons].forEach(element => { element.disabled = progress < 5.999; });
      renderActions();
      note.textContent = progress < 5.999 ? '正在放大，微观动作就位后可操作。' : '放大功能示意。开盖、剖面和信号路径都可复位。';
    },
    dispose() { abort.abort(); container.replaceChildren(); }
  };
}
