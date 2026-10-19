import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CAMERA_PRESETS } from './archive-data.js';

const vec = values => new THREE.Vector3(...values);

export function createAlgorithmScene(canvas, model, { onBoardChoice = () => {}, onSignalSelect = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x081019); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.16; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, 0.04, 100); scene.add(model.root);
  const pmrem = new THREE.PMREMGenerator(renderer); const room = new RoomEnvironment(); const environment = pmrem.fromScene(room, 0.04); scene.environment = environment.texture; scene.environmentIntensity = 0.38; room.dispose(); pmrem.dispose();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x0c151d, roughness: 0.82, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.04; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xd9e9f1, 0x252b28, 1.35));
  const key = new THREE.DirectionalLight(0xffe1b0, 3.2); key.position.set(-5, 9, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -7, near: 0.2, far: 30 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.022; scene.add(key);
  const fill = new THREE.DirectionalLight(0x8fc9ed, 1.6); fill.position.set(7, 4, -5); scene.add(fill);
  const rim = new THREE.PointLight(0xc9a4ff, 16, 15, 2); rim.position.set(1, 4, -3); scene.add(rim);
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 2.2; controls.maxDistance = 20; controls.maxPolarAngle = Math.PI * 0.93;
  const pointer = new THREE.Vector2(); const raycaster = new THREE.Raycaster(); let pointerDown = null; let recordId = 'board-decision'; let cameraId = 'board'; let needsCamera = true; let disposed = false;
  const resize = () => { const parent = canvas.parentElement; const width = parent?.clientWidth || canvas.clientWidth || 800; const height = parent?.clientHeight || canvas.clientHeight || 600; renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); needsCamera = true; };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize); observer?.observe(canvas.parentElement || canvas); resize();
  const setCameraPreset = id => { if (!CAMERA_PRESETS[id]) return; cameraId = id; needsCamera = true; };
  const setCamera = () => { const preset = CAMERA_PRESETS[cameraId] || CAMERA_PRESETS.overview; camera.position.copy(vec(preset.position)); controls.target.copy(vec(preset.target)); controls.update(); needsCamera = false; };
  const onPointerDown = event => { pointerDown = [event.clientX, event.clientY]; };
  const onPointerUp = event => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 6) { pointerDown = null; return; }
    const rect = canvas.getBoundingClientRect(); pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([model.parts.board, model.parts.searchTree, model.parts.chipCutaway], true); const hit = hits[0]; pointerDown = null; if (!hit) return;
    if (hit.object.userData.square) onBoardChoice(hit.object.userData.square); if (hit.object.userData.nodeId) onSignalSelect(hit.object.userData.nodeId); if (hit.object.name.startsWith('zone-')) onSignalSelect(hit.object.name.slice(5));
  };
  canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointerup', onPointerUp);
  return {
    setRecord(id) { recordId = id; model.setRecord(id); setCameraPreset({ 'board-decision': 'board', 'candidate-moves': 'board', minimax: 'tree', 'alpha-beta': 'tree', 'parallel-search': 'node', 'chip-echo': 'chip' }[id] || 'overview'); },
    setCameraPreset,
    render(state = {}) { if (state.recordId && state.recordId !== recordId) this.setRecord(state.recordId); model.applyProgress(state.progress); if (needsCamera) setCamera(); controls.update(); renderer.render(scene, camera); },
    reset() { recordId = 'board-decision'; model.reset(); setCameraPreset('board'); },
    resize,
    dispose() { if (disposed) return; disposed = true; canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp); observer?.disconnect(); controls.dispose(); floor.geometry.dispose(); floor.material.dispose(); environment.dispose(); renderer.dispose(); model.dispose(); },
  };
}
