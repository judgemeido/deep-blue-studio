import { STRATEGY_RECORDS } from './archive-data.js';
import { buildTeachingTree, runTeachingSearch, describeSearchEvent } from './algorithm.js';
import { createAlgorithmModel } from './algorithm-model.js';
import { createAlgorithmScene } from './algorithm-scene.js';
import { createStrategyUI } from './strategy-ui.js';

const index = document.getElementById('archive-index');
STRATEGY_RECORDS.forEach((record, indexValue) => {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.recordIndex = String(indexValue); button.setAttribute('role', 'option');
  button.innerHTML = `<span>${String(record.order).padStart(2, '0')}</span><strong>${record.shortLabel} · ${record.title.replace(/[。？！].*$/, '')}</strong>`; index.append(button);
});
const model = createAlgorithmModel({ tree: buildTeachingTree() });
const scene = createAlgorithmScene(document.getElementById('scene'), model);
const searchResults = { minimax: runTeachingSearch(buildTeachingTree(), { strategy: 'minimax' }), 'alpha-beta': runTeachingSearch(buildTeachingTree(), { strategy: 'alphabeta' }) };
const cameraForRecord = { 'board-decision': 'board', 'candidate-moves': 'board', minimax: 'tree', 'alpha-beta': 'tree', 'parallel-search': 'node', 'chip-echo': 'chip' };
const markCamera = id => document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === id)));
let state = { recordId: STRATEGY_RECORDS[0].id, progress: 0 };
const ui = createStrategyUI({ records: STRATEGY_RECORDS, onRead(record) { state.recordId = record.id; state.progress = 0; scene.setRecord(record.id); const camera = cameraForRecord[record.id] || 'overview'; markCamera(camera); document.getElementById('camera-label').textContent = record.title.replace(/[。？！].*$/, ''); }, onProgress(value, record) { const readout = document.getElementById('algorithm-readout'); const result = searchResults[record.id]; if (result) { const event = result.events[Math.min(result.events.length - 1, Math.floor(value * result.events.length))]; readout.querySelector('strong').textContent = `${describeSearchEvent(event)} · 根值 ${result.value} · 已访问 ${result.visitedNodes} 节点`; } else readout.querySelector('strong').textContent = record.id === 'parallel-search' ? '任务脉冲：节点 → 板卡 → 芯片。' : record.id === 'chip-echo' ? '封装层、键合线与功能区已展开。' : value > 0 ? '信号正在沿当前记录传播。' : '等待读取当前记录'; state.progress = value; scene.render(state); }, onCommand(command) { if (command.type === 'RESET') scene.reset(); } });
scene.setRecord(state.recordId); scene.render(state);
document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-camera]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); scene.setCameraPreset(button.dataset.camera); scene.render(state); }));
document.getElementById('mobile-index').addEventListener('click', () => document.getElementById('archive-drawer').classList.add('is-open'));
document.getElementById('drawer-toggle').addEventListener('click', () => document.getElementById('archive-drawer').classList.remove('is-open'));
const renderLoop = () => { scene.render(state); requestAnimationFrame(renderLoop); }; requestAnimationFrame(renderLoop);
window.addEventListener('beforeunload', () => { ui.dispose(); scene.dispose(); });
