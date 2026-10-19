const HOTSPOTS = new Set(['moves', 'evaluate', 'control', 'stack']);
const TRACE_LAST_STEP = 4;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function createMicroState({ reducedMotion = false } = {}) {
  return {
    lid: 'closed',
    section: 'assembled',
    hotspot: null,
    trace: 'idle',
    traceStep: 0,
    reducedMotion: Boolean(reducedMotion)
  };
}

export function reduceMicroState(state, action = {}) {
  const current = state && typeof state === 'object' ? state : createMicroState();
  const type = action?.type;
  switch (type) {
    case 'OPEN_LID':
      return { ...current, lid: 'open' };
    case 'CLOSE_LID':
      return { ...current, lid: 'closed', section: 'assembled', trace: current.trace === 'playing' ? 'paused' : current.trace };
    case 'TOGGLE_SECTION':
      if (current.lid !== 'open') return current;
      return { ...current, section: current.section === 'assembled' ? 'cutaway' : 'assembled' };
    case 'SELECT_HOTSPOT':
      if (current.lid !== 'open' || !HOTSPOTS.has(action.id)) return current;
      return { ...current, hotspot: action.id };
    case 'CLEAR_HOTSPOT':
      return { ...current, hotspot: null };
    case 'START_TRACE':
      if (current.lid !== 'open') return current;
      return { ...current, trace: 'playing', traceStep: current.trace === 'complete' ? 0 : current.traceStep };
    case 'PAUSE_TRACE':
      return current.trace === 'playing' ? { ...current, trace: 'paused' } : current;
    case 'STEP_TRACE': {
      if (current.lid !== 'open' || current.trace === 'complete') return current;
      const next = Math.min(TRACE_LAST_STEP, current.traceStep + 1);
      return { ...current, traceStep: next, trace: next >= TRACE_LAST_STEP ? 'complete' : 'paused' };
    }
    case 'RESET_MICRO':
      return createMicroState({ reducedMotion: current.reducedMotion });
    case 'SET_REDUCED_MOTION':
      return { ...current, reducedMotion: Boolean(action.value) };
    default:
      return current;
  }
}

export function sampleMicroPose(state = createMicroState(), elapsed = 0) {
  const current = state && typeof state === 'object' ? state : createMicroState();
  const seconds = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const local = current.reducedMotion ? 1 : clamp(seconds / 1.2);
  const traceBase = clamp((Number.isFinite(current.traceStep) ? current.traceStep : 0) / TRACE_LAST_STEP);
  const traceProgress = current.trace === 'complete' ? 1 : clamp(traceBase + (current.trace === 'playing' ? local / TRACE_LAST_STEP : 0));
  const cutaway = current.section === 'cutaway';
  const open = current.lid === 'open';
  return {
    lidAngle: open ? -1.15 : 0,
    sideOpacity: cutaway ? 0.22 : 1,
    cutawayOffset: cutaway ? 0.42 : 0,
    sectionPlaneOpacity: cutaway ? 0.68 : 0,
    dieOpacity: open ? 1 : 0,
    wireOpacity: open ? 1 : 0,
    pinOpacity: cutaway ? 0.55 : 1,
    traceProgress,
    traceStep: Number.isFinite(current.traceStep) ? current.traceStep : 0,
    cameraFocus: (open ? 1 : 0) + (cutaway ? 2 : 0)
  };
}

export const MICRO_HOTSPOTS = Object.freeze([...HOTSPOTS]);
export const MICRO_TRACE_LAST_STEP = TRACE_LAST_STEP;
