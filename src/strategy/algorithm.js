const freezeTree = node => Object.freeze({
  ...node,
  ...(node.children ? { children: Object.freeze(node.children.map(freezeTree)) } : {}),
});

export function buildTeachingTree() {
  return freezeTree({
    id: 'root', role: 'MAX', children: [
      { id: 'left', role: 'MIN', children: [{ id: 'left-a', role: 'MAX', value: 3 }, { id: 'left-b', role: 'MAX', value: 5 }] },
      { id: 'right', role: 'MIN', children: [{ id: 'right-a', role: 'MAX', value: 2 }, { id: 'right-b', role: 'MAX', value: 9 }] },
    ],
  });
}

const collectIds = node => [node.id, ...(node.children || []).flatMap(collectIds)];

export function runTeachingSearch(tree, { strategy = 'minimax' } = {}) {
  if (!['minimax', 'alphabeta'].includes(strategy)) throw new Error(`未知搜索策略: ${strategy}`);
  const ids = collectIds(tree);
  if (new Set(ids).size !== ids.length) throw new Error('节点标识必须唯一');
  const events = [];
  const emit = event => events.push(Object.freeze({ ...event, sequence: events.length }));
  const visit = (node, maximizing, alpha, beta) => {
    emit({ type: 'enter', nodeId: node.id, role: maximizing ? 'MAX' : 'MIN', alpha, beta });
    if (!node.children) {
      emit({ type: 'evaluate', nodeId: node.id, value: node.value });
      return { value: node.value, bestChildId: null };
    }
    let value = maximizing ? -Infinity : Infinity;
    let bestChildId = null;
    let nextAlpha = alpha;
    let nextBeta = beta;
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      const result = visit(child, !maximizing, nextAlpha, nextBeta);
      if (bestChildId === null || (maximizing ? result.value > value : result.value < value)) {
        value = result.value;
        bestChildId = child.id;
      }
      if (strategy === 'alphabeta') {
        if (maximizing) nextAlpha = Math.max(nextAlpha, value);
        else nextBeta = Math.min(nextBeta, value);
        emit({ type: 'bound', nodeId: node.id, alpha: nextAlpha, beta: nextBeta, value });
        if (nextAlpha >= nextBeta && index < node.children.length - 1) {
          const skippedIds = node.children.slice(index + 1).flatMap(collectIds);
          emit({ type: 'prune', nodeId: node.id, alpha: nextAlpha, beta: nextBeta, skippedIds,
            reason: `当前界限 α=${nextAlpha} ≥ β=${nextBeta}，剩余分支不能改善祖先的选择。` });
          break;
        }
      }
    }
    emit({ type: 'return', nodeId: node.id, value, bestChildId });
    return { value, bestChildId };
  };
  const result = visit(tree, true, -Infinity, Infinity);
  return Object.freeze({ ...result, strategy, events: Object.freeze(events), visitedNodes: events.filter(event => event.type === 'enter').length, evaluatedLeaves: events.filter(event => event.type === 'evaluate').length });
}

export function stepSearch(playback) {
  const events = Array.isArray(playback?.events) ? playback.events : [];
  const rawIndex = Number.isFinite(playback?.index) ? playback.index : 0;
  if (rawIndex < 0) return Object.freeze({ ...playback, events, index: 0, event: events[0] || null });
  const index = Math.max(0, Math.min(events.length, rawIndex));
  const nextIndex = Math.min(events.length, index + 1);
  return Object.freeze({ ...playback, events, index: nextIndex, event: events[index] || null });
}

export function describeSearchEvent(event) {
  if (!event) return '等待下一步。';
  if (event.type === 'enter') return `进入 ${event.role} 节点 ${event.nodeId}`;
  if (event.type === 'evaluate') return `叶节点 ${event.nodeId} 返回评价 ${event.value}`;
  if (event.type === 'bound') return `节点 ${event.nodeId} 更新界限 α=${event.alpha}，β=${event.beta}`;
  if (event.type === 'prune') return `剪枝：${event.reason}`;
  if (event.type === 'return') return `节点 ${event.nodeId} 回传 ${event.value}`;
  return '搜索事件。';
}
