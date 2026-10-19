const TRACE_STEPS = Object.freeze([
  { id: 'position', from: '棋盘局面', to: '候选着法', label: '局面输入 → 着法生成', functionId: 'moves', duration: 1.1 },
  { id: 'moves', from: '候选着法', to: '局面评估', label: '候选分支 → 局面评估', functionId: 'evaluate', duration: 1.1 },
  { id: 'evaluate', from: '局面评估', to: '搜索控制', label: '评分结果 → 搜索控制', functionId: 'control', duration: 1.1 },
  { id: 'control', from: '搜索控制', to: '路径记录', label: '边界判断 → 走法栈', functionId: 'stack', duration: 1.1 },
  { id: 'return', from: '路径记录', to: '主机回传', label: '搜索结果 → 主机回传', functionId: 'control', duration: 1.1 }
]);

export function createSignalTrace() {
  let current = 0;
  let disposed = false;
  return {
    steps: TRACE_STEPS.map(step => ({ ...step })),
    getStep(index) {
      if (disposed || !Number.isInteger(index) || index < 0 || index >= TRACE_STEPS.length) return null;
      return { ...TRACE_STEPS[index] };
    },
    reset() {
      current = 0;
      return this.getStep(current);
    },
    next() {
      current = Math.min(TRACE_STEPS.length - 1, current + 1);
      return this.getStep(current);
    },
    dispose() {
      disposed = true;
    }
  };
}

export const SIGNAL_TRACE_STEPS = TRACE_STEPS;
