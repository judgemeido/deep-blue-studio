import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, metalness: options.metalness ?? 0.25, roughness: options.roughness ?? 0.48, transparent: options.transparent ?? false, opacity: options.opacity ?? 1, depthWrite: options.depthWrite ?? true });
}
function mesh(parent, geometry, mat, position = [0, 0, 0], name = '') {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position); object.name = name; object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
}
function tube(parent, points, mat, radius = 0.018, name = '') {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const object = mesh(parent, new THREE.TubeGeometry(curve, 16, radius, 6, false), mat, [0, 0, 0], name); object.userData.curve = curve; return object;
}
function group(parent, name, position = [0, 0, 0]) { const object = new THREE.Group(); object.name = name; object.position.set(...position); parent.add(object); return object; }

function buildBoard(root, mats) {
  const board = group(root, 'board', [-2.1, 0, 0]);
  mesh(board, new RoundedBoxGeometry(4.35, 0.22, 4.35, 4, 0.12), mats.table, [0, 0.25, 0], 'board-table');
  const squares = group(board, 'chessboard-squares', [0, 0.4, 0]);
  const squareGeometry = new THREE.BoxGeometry(0.51, 0.055, 0.51);
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) {
    const square = mesh(squares, squareGeometry, (row + col) % 2 ? mats.ivory : mats.slate, [(col - 3.5) * 0.52, 0, (row - 3.5) * 0.52], `square-${row + 1}-${col + 1}`);
    square.userData.square = `${String.fromCharCode(97 + col)}${row + 1}`;
  }
  const pieces = group(board, 'chess-pieces', [0, 0.46, 0]);
  const pieceGeometry = new THREE.CylinderGeometry(0.14, 0.2, 0.48, 18);
  const pieceTop = new THREE.SphereGeometry(0.13, 16, 10);
  const pieceSpecs = [[0, 1, 1], [1, 1, 1], [4, 6, -1], [6, 6, -1], [3, 3, 1], [4, 4, -1], [5, 2, 1]];
  pieceSpecs.forEach(([col, row, side], index) => {
    const piece = group(pieces, `piece-${index + 1}`, [(col - 3.5) * 0.52, 0, (row - 3.5) * 0.52]);
    mesh(piece, pieceGeometry, side > 0 ? mats.pieceLight : mats.pieceDark, [0, 0.27, 0], 'piece-body');
    mesh(piece, pieceTop, side > 0 ? mats.pieceLight : mats.pieceDark, [0, 0.53, 0], 'piece-crown');
  });
  const arrows = group(board, 'candidate-arrows', [0, 0.82, 0]);
  const arrowMat = mats.signalBlue.clone(); arrowMat.transparent = true; arrowMat.opacity = 0.94;
  [[-1.82, -0.78, 0.78, 1.3], [0.26, 0.78, 1.3, 1.3], [-0.78, 1.3, -0.26, 0.26]].forEach(([x1, z1, x2, z2], index) => {
    const line = tube(arrows, [[x1, 0, z1], [x2, 0, z2]], arrowMat, 0.028, `candidate-${index + 1}`);
    line.userData.baseOpacity = arrowMat.opacity;
  });
  arrows.visible = false;
  return board;
}

function buildSearchTree(root, mats, tree) {
  const searchTree = group(root, 'search-tree', [1.35, 0.45, 2.35]);
  const nodes = new Map();
  const nodeGeometry = new THREE.SphereGeometry(0.14, 20, 14);
  const nodeMats = { max: mats.signalBlue, min: mats.signalGold, leaf: mats.ivory };
  const place = { root: [0, 2.5, 0], left: [-1.5, 1.35, 0], right: [1.5, 1.35, 0], 'left-a': [-2.15, 0.2, 0], 'left-b': [-0.85, 0.2, 0], 'right-a': [0.85, 0.2, 0], 'right-b': [2.15, 0.2, 0] };
  const walk = (node, parent) => {
    const position = place[node.id] || [0, 0, 0]; nodes.set(node.id, position);
    if (parent) {
      const branchMaterial = node.id === 'right-b' ? mats.line.clone() : (node.children ? (node.role === 'MIN' ? mats.signalGold : mats.signalBlue) : mats.line);
      if (node.id === 'right-b') { branchMaterial.transparent = true; branchMaterial.opacity = 0.22; }
      tube(searchTree, [place[parent.id], position], branchMaterial, 0.018, `branch-${parent.id}-${node.id}`);
    }
    const nodeMaterial = node.id === 'right-b' ? nodeMats.leaf.clone() : (node.children ? nodeMats[node.role.toLowerCase()] : nodeMats.leaf);
    if (node.id === 'right-b') { nodeMaterial.transparent = true; nodeMaterial.opacity = 0.22; }
    const item = mesh(searchTree, nodeGeometry, nodeMaterial, position, `search-node-${node.id}`); item.userData.nodeId = node.id; item.userData.value = node.value;
    (node.children || []).forEach(child => walk(child, node));
  };
  walk(tree, null);
  const labels = group(searchTree, 'tree-labels');
  ['MAX', 'MIN', 'MIN', '3', '5', '2', '9'].forEach((label, index) => {
    const id = ['root', 'left', 'right', 'left-a', 'left-b', 'right-a', 'right-b'][index];
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeLabelTexture(label, index < 3 ? '#9ecaf0' : '#ffe0a3'), transparent: true }));
    sprite.name = `tree-label-${index}`; sprite.position.set(place[id][0], place[id][1] + 0.26, 0.08); sprite.scale.set(0.72, 0.28, 1); labels.add(sprite);
  });
  labels.getObjectByName('tree-label-6').material.opacity = 0.25;
  const prune = group(searchTree, 'pruned-branch');
  const pruneMaterial = mats.line.clone(); pruneMaterial.transparent = true; pruneMaterial.opacity = 0.28; pruneMaterial.dashSize = 0.08; pruneMaterial.gapSize = 0.07;
  tube(prune, [place.right, place['right-b']], pruneMaterial, 0.028, 'prune-right-b'); prune.visible = false;
  searchTree.visible = false;
  return searchTree;
}

function makeLabelTexture(text, color) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 64; const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(8,17,25,.84)'; context.roundRect(2, 2, 156, 60, 12); context.fill(); context.fillStyle = color; context.font = 'bold 28px ui-monospace,monospace'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 80, 32);
  return new THREE.CanvasTexture(canvas);
}

function buildCabinets(root, mats) {
  const cabinets = group(root, 'cabinets', [3.1, 0, -1.8]);
  const nodes = group(cabinets, 'parallel-nodes');
  for (let cabinetIndex = 0; cabinetIndex < 2; cabinetIndex += 1) {
    const cabinet = group(cabinets, `cabinet-${cabinetIndex + 1}`, [cabinetIndex * 1.95, 1.85, 0]);
    mesh(cabinet, new RoundedBoxGeometry(1.62, 3.7, 1.1, 5, 0.08), mats.paint, [0, 0, 0], 'cabinet-shell');
    mesh(cabinet, new RoundedBoxGeometry(1.38, 3.25, 0.06, 3, 0.025), mats.mesh, [0, -0.02, 0.56], 'vent-door');
    for (let row = 0; row < 20; row += 1) for (let col = 0; col < 6; col += 1) mesh(cabinet, new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), mats.metal, [(col - 2.5) * 0.17, (row - 9.5) * 0.14, 0.6], `vent-${row}-${col}`);
    for (let shelf = 0; shelf < 5; shelf += 1) {
      const rail = group(cabinet, `rail-${shelf + 1}`, [0, -1.25 + shelf * 0.6, -0.35]);
      mesh(rail, new THREE.BoxGeometry(1.24, 0.035, 0.08), mats.metal, [0, 0, 0], 'left-rail'); mesh(rail, new THREE.BoxGeometry(1.24, 0.035, 0.08), mats.metal, [0, 0, 0.7], 'right-rail');
      const card = group(rail, `card-${shelf + 1}`, [0, 0.08, 0.12]); mesh(card, new RoundedBoxGeometry(1.12, 0.05, 0.62, 3, 0.025), mats.card, [0, 0, 0], 'accelerator-card');
      for (let chip = 0; chip < 8; chip += 1) mesh(card, new RoundedBoxGeometry(0.17, 0.035, 0.15, 2, 0.02), mats.chip, [((chip % 4) - 1.5) * 0.27, 0.05, (Math.floor(chip / 4) - 0.5) * 0.25], `chip-${chip + 1}`);
      nodes.add(card);
    }
    const fastener = new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16);
    [[-0.63, -1.68, 0.6], [0.63, -1.68, 0.6], [-0.63, 1.68, 0.6], [0.63, 1.68, 0.6]].forEach((position, index) => mesh(cabinet, fastener, mats.metal, position, `fastener-${index + 1}`));
  }
  nodes.visible = false;
  cabinets.visible = false;
  return { cabinets, nodes };
}

function buildChip(root, mats) {
  const chip = group(root, 'chip-cutaway', [3.25, 1.7, 0.3]);
  const packageGroup = group(chip, 'package-layers');
  mesh(packageGroup, new RoundedBoxGeometry(2.15, 0.2, 1.75, 5, 0.09), mats.package, [0, 0, 0], 'package-body');
  mesh(packageGroup, new RoundedBoxGeometry(1.96, 0.1, 1.56, 4, 0.05), mats.substrate, [0, 0.14, 0], 'substrate');
  mesh(packageGroup, new RoundedBoxGeometry(1.75, 0.08, 1.32, 4, 0.04), mats.die, [0, 0.23, 0], 'bare-die');
  mesh(packageGroup, new RoundedBoxGeometry(2.03, 0.08, 0.48, 3, 0.04), mats.lid, [0, 0.4, -0.57], 'lid-section');
  const pins = group(chip, 'pins'); const pinGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.24);
  for (let i = 0; i < 18; i += 1) { const x = -0.85 + i * 0.1; mesh(pins, pinGeometry, mats.pin, [x, -0.12, 0.98], `pin-front-${i}`); mesh(pins, pinGeometry, mats.pin, [x, -0.12, -0.98], `pin-back-${i}`); }
  const wires = group(chip, 'bond-wires');
  for (let i = 0; i < 10; i += 1) { const x = -0.55 + i * 0.12; tube(wires, [[x, 0.32, -0.45], [x * 1.45, 0.72, -0.8], [x * 1.7, 0.2, -0.96]], mats.wire, 0.014, `bond-wire-${i + 1}`); tube(wires, [[x, 0.32, 0.45], [x * 1.45, 0.72, 0.8], [x * 1.7, 0.2, 0.96]], mats.wire, 0.014, `bond-wire-${i + 11}`); }
  const zones = group(chip, 'functional-zones');
  const zoneSpecs = [['move-generation', -0.55, 0.34, -0.34, mats.signalBlue], ['position-evaluation', 0.12, 0.34, -0.34, mats.signalGold], ['search-control', -0.55, 0.34, 0.2, mats.signalGreen], ['repetition-stack', 0.12, 0.34, 0.2, mats.signalPurple]];
  zoneSpecs.forEach(([name, x, y, z, color]) => { const zoneMat = color.clone(); zoneMat.transparent = true; zoneMat.opacity = 0.78; mesh(zones, new RoundedBoxGeometry(0.52, 0.025, 0.31, 2, 0.02), zoneMat, [x, y, z], `zone-${name}`); });
  const traceLayer = group(chip, 'chip-traces'); const traceMat = mats.signalBlue.clone(); traceMat.transparent = true; traceMat.opacity = 0.55;
  for (let i = 0; i < 7; i += 1) tube(traceLayer, [[-0.7 + i * 0.2, 0.29, -0.55], [-0.35 + i * 0.14, 0.31, 0], [0.65 - i * 0.1, 0.31, 0.55]], traceMat, 0.009, `trace-${i + 1}`);
  const sectionPlane = mesh(chip, new THREE.BoxGeometry(0.025, 0.9, 1.5), mats.section, [0.74, 0.42, 0], 'section-plane');
  chip.visible = false; return chip;
}

function buildSignals(root, mats) {
  const signals = group(root, 'signals'); const pulseMat = mats.signalGold.clone(); pulseMat.transparent = true; pulseMat.opacity = 0.9;
  const signalPaths = [
    [[-0.5, 1.1, 0], [0.6, 1.4, 1.2], [1.5, 2.3, 2.1]],
    [[1.5, 2.3, 2.1], [2.6, 2.2, 0.5], [3.2, 1.8, -1.4]],
    [[3.2, 1.8, -1.4], [2.5, 1.4, -0.4], [3.25, 1.7, 0.3]],
  ];
  signalPaths.forEach((points, index) => { const line = tube(signals, points, index === 1 ? mats.signalGreen : mats.signalBlue, 0.026, `signal-segment-${index + 1}`); line.userData.basePoints = points; });
  const pulse = mesh(signals, new THREE.SphereGeometry(0.085, 16, 12), pulseMat, [-0.5, 1.1, 0], 'signal-pulse'); pulse.renderOrder = 20; signals.visible = false; return signals;
}

export function createAlgorithmModel({ tree } = {}) {
  const root = new THREE.Group(); root.name = 'deep-blue-strategy-exhibit'; root.userData.logicalChipCount = 480;
  const mats = {
    table: material(0x5a4636, { roughness: 0.62 }), ivory: material(0xd9d0b7, { roughness: 0.42 }), slate: material(0x31505c, { roughness: 0.54 }), pieceLight: material(0xd5b477, { metalness: 0.2, roughness: 0.3 }), pieceDark: material(0x171d22, { metalness: 0.45, roughness: 0.28 }), paint: material(0x18232b, { metalness: 0.62, roughness: 0.34 }), mesh: material(0x21323a, { metalness: 0.48, roughness: 0.58 }), metal: material(0xb4c0c3, { metalness: 0.86, roughness: 0.22 }), card: material(0x244c4a, { metalness: 0.18, roughness: 0.42 }), chip: material(0x9b9e91, { metalness: 0.5, roughness: 0.3 }), package: material(0x25313a, { metalness: 0.5, roughness: 0.46 }), substrate: material(0xb59655, { metalness: 0.72, roughness: 0.3 }), die: material(0x14232c, { metalness: 0.2, roughness: 0.32 }), lid: material(0x667681, { metalness: 0.68, roughness: 0.24, transparent: true, opacity: 0.8 }), pin: material(0xd6aa5e, { metalness: 0.9, roughness: 0.18 }), wire: material(0xe5bb71, { metalness: 0.85, roughness: 0.2 }), line: material(0x8496a0, { metalness: 0.2, roughness: 0.54 }), section: material(0x75d3f0, { transparent: true, opacity: 0.13, depthWrite: false }), signalBlue: material(0x6ec5eb, { metalness: 0.2, roughness: 0.26 }), signalGold: material(0xe7b36a, { metalness: 0.2, roughness: 0.26 }), signalGreen: material(0x8cd49f, { metalness: 0.2, roughness: 0.26 }), signalPurple: material(0xbb9fe8, { metalness: 0.2, roughness: 0.26 }),
  };
  const board = buildBoard(root, mats); const searchTree = buildSearchTree(root, mats, tree || { id: 'root', role: 'MAX', children: [] }); const cabinetData = buildCabinets(root, mats); const chipCutaway = buildChip(root, mats); const signals = buildSignals(root, mats);
  const parts = { board, searchTree, cabinets: cabinetData.cabinets, parallelNodes: cabinetData.nodes, chipCutaway, signals };
  const recordOrder = { 'board-decision': 1, 'candidate-moves': 2, minimax: 3, 'alpha-beta': 4, 'parallel-search': 5, 'chip-echo': 6 };
  let activeRecord = 'board-decision'; let currentProgress = 0; const basePositions = new Map(Object.entries(parts).map(([key, object]) => [key, object.position.clone()]));
  function applyProgress(progress) {
    currentProgress = clamp(progress); const stage = recordOrder[activeRecord] || 1;
    parts.board.visible = stage <= 2; parts.board.getObjectByName('candidate-arrows').visible = stage >= 2; parts.searchTree.visible = stage === 3 || stage === 4; parts.searchTree.getObjectByName('pruned-branch').visible = stage >= 4; parts.cabinets.visible = stage >= 5; parts.parallelNodes.visible = stage >= 5; parts.chipCutaway.visible = stage >= 6; parts.signals.visible = stage === 2 || stage >= 5;
    const reveal = smooth(currentProgress); const chipReveal = stage >= 6 ? smooth((currentProgress - 0.18) / 0.6) : 0;
    parts.board.getObjectByName('candidate-arrows').children.forEach(item => { if (item.material) item.material.opacity = stage >= 2 ? 0.3 + reveal * 0.7 : 0; });
    parts.searchTree.scale.setScalar(0.82 + reveal * 0.18); parts.cabinets.scale.setScalar(0.94 + reveal * 0.06); parts.chipCutaway.scale.setScalar(0.84 + chipReveal * 0.16);
    parts.chipCutaway.getObjectByName('package-layers').children.forEach(item => { if (item.material?.transparent) item.material.opacity = item.name === 'lid-section' ? 0.8 - chipReveal * 0.7 : item.material.opacity; });
    const pulse = parts.signals.getObjectByName('signal-pulse'); pulse.position.set(-0.5 + currentProgress * 3.6, 1.1 + Math.sin(currentProgress * Math.PI) * 0.9, currentProgress * 0.4); pulse.material.opacity = stage >= 2 ? 0.4 + reveal * 0.6 : 0;
  }
  return { root, parts, setRecord(id) { if (recordOrder[id]) activeRecord = id; applyProgress(0); }, applyProgress, reset() { activeRecord = 'board-decision'; Object.entries(parts).forEach(([key, object]) => { object.position.copy(basePositions.get(key)); object.scale.setScalar(1); }); applyProgress(0); }, getState() { return { recordId: activeRecord, progress: currentProgress }; }, dispose() { const geometries = new Set(); const materials = new Set(); root.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); }); geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); } };
}
