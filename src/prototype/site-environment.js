import * as THREE from 'three';

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.15,
    roughness: options.roughness ?? 0.78,
    transparent: true,
    opacity: options.opacity ?? 1
  });
}

function mesh(parent, geometry, mat, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function box(parent, width, height, depth, mat, position) {
  return mesh(parent, new THREE.BoxGeometry(width, height, depth), mat, position);
}

function setOpacity(object, value) {
  object.traverse(child => {
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(mat => {
      mat.transparent = value < 1;
      mat.opacity = value;
    });
  });
}

export function createSiteEnvironment({ contract } = {}) {
  const root = new THREE.Group();
  root.name = 'deep-blue-site-environment';
  root.userData = {
    eraTag: '1997',
    status: 'teaching-reconstruction',
    sourceIds: ['S7', 'S8'],
    boundary: '场地为 1997 工业计算展陈的教学重建，不是比赛现场平面复原。',
    props: [
      { kind: 'crt', eraTag: '1997', status: 'teaching-reconstruction', sourceIds: [] },
      { kind: 'maintenance-record', eraTag: '1997', status: 'teaching-reconstruction', sourceIds: [] },
      { kind: 'numbered-cable', eraTag: '1997', status: 'teaching-reconstruction', sourceIds: [] }
    ]
  };
  const materials = {
    floor: material(0x26343b, { roughness: 0.94 }),
    seam: material(0x111b21, { roughness: 0.98 }),
    plinth: material(0x323b40, { metalness: 0.55, roughness: 0.5 }),
    wall: material(0x34434a, { roughness: 0.88 }),
    light: material(0xc7c4ab, { roughness: 0.52, opacity: 0.7 }),
    tray: material(0x171f23, { metalness: 0.45, roughness: 0.55 }),
    vent: material(0x56666a, { metalness: 0.4, roughness: 0.57 }),
    label: material(0xc7b27e, { metalness: 0.25, roughness: 0.68 }),
    aisle: material(0xb69a67, { roughness: 0.76, opacity: 0.8 }),
    prop: material(0x887e6d, { roughness: 0.74 }),
    screen: material(0x254342, { roughness: 0.36, opacity: 0.8 })
  };
  const parts = {};

  parts.floor = new THREE.Group();
  parts.floor.name = 'site-floor';
  root.add(parts.floor);
  box(parts.floor, 12, 0.12, 8, materials.floor, [0, -0.06, 0]);
  for (let x = -5; x <= 5; x += 1) box(parts.floor, 0.012, 0.008, 7.8, materials.seam, [x, 0.006, 0]);
  for (let z = -3; z <= 3; z += 1) box(parts.floor, 11.8, 0.008, 0.012, materials.seam, [0, 0.006, z]);

  parts.plinth = new THREE.Group();
  parts.plinth.name = 'cabinet-plinths';
  root.add(parts.plinth);
  for (const x of [-0.965, 0.965]) box(parts.plinth, 1.68, 0.2, 1.9, materials.plinth, [x, 0.1, 0]);

  parts.backWall = new THREE.Group();
  parts.backWall.name = 'back-wall';
  root.add(parts.backWall);
  box(parts.backWall, 11.7, 4.9, 0.14, materials.wall, [0, 2.45, -3.65]);

  parts.sideWall = new THREE.Group();
  parts.sideWall.name = 'side-wall';
  root.add(parts.sideWall);
  box(parts.sideWall, 0.14, 4.9, 7.3, materials.wall, [-6.0, 2.45, 0]);
  box(parts.sideWall, 0.14, 4.9, 7.3, materials.wall, [6.0, 2.45, 0]);

  parts.lightSlots = new THREE.Group();
  parts.lightSlots.name = 'ceiling-light-slots';
  root.add(parts.lightSlots);
  for (const x of [-3, 0, 3]) box(parts.lightSlots, 1.8, 0.06, 0.22, materials.light, [x, 4.72, -0.4]);

  parts.cableTray = new THREE.Group();
  parts.cableTray.name = 'cable-tray';
  root.add(parts.cableTray);
  box(parts.cableTray, 4.4, 0.12, 0.24, materials.tray, [0.85, 3.9, -1.3]);
  box(parts.cableTray, 0.24, 0.12, 2.1, materials.tray, [3.0, 3.9, -0.25]);
  for (let i = 0; i < 4; i += 1) box(parts.cableTray, 0.02, 0.03, 1.8, materials.label, [1.0 + i * 0.12, 3.82, -0.3]);

  parts.ventilation = new THREE.Group();
  parts.ventilation.name = 'ventilation-grilles';
  root.add(parts.ventilation);
  for (let i = 0; i < 7; i += 1) box(parts.ventilation, 0.12, 0.62, 0.03, materials.vent, [-3.8 + i * 0.14, 1.1, -3.56]);
  for (let i = 0; i < 7; i += 1) box(parts.ventilation, 0.62, 0.12, 0.03, materials.vent, [3.55, 1.1 + i * 0.14, -3.56]);

  parts.labels = new THREE.Group();
  parts.labels.name = 'era-labels';
  root.add(parts.labels);
  box(parts.labels, 0.82, 0.24, 0.03, materials.label, [-0.965, 4.12, -0.92]);
  box(parts.labels, 0.82, 0.24, 0.03, materials.label, [0.965, 4.12, -0.92]);
  box(parts.labels, 1.42, 0.05, 0.02, materials.label, [0, 0.02, -2.4]);
  parts.labels.userData = { eraTag: '1997', status: 'teaching-reconstruction', sourceIds: ['S7'] };

  parts.aisleMarkers = new THREE.Group();
  parts.aisleMarkers.name = 'safety-aisle-markers';
  root.add(parts.aisleMarkers);
  for (const x of [-1.6, -1.15, 1.15, 1.6]) box(parts.aisleMarkers, 0.07, 0.01, 2.4, materials.aisle, [x, 0.015, 1.7]);

  const props = new THREE.Group();
  props.name = '1997-era-props';
  root.add(props);
  const crt = new THREE.Group();
  box(crt, 0.72, 0.54, 0.55, materials.prop, [0, 0.38, 0]);
  box(crt, 0.52, 0.35, 0.03, materials.screen, [0, 0.4, 0.285]);
  crt.position.set(2.65, 0, 1.15);
  props.add(crt);
  const record = new THREE.Group();
  box(record, 0.62, 0.03, 0.42, materials.label, [0, 0.02, 0]);
  box(record, 0.52, 0.012, 0.32, materials.floor, [0, 0.04, 0]);
  record.position.set(2.65, 0.01, 0.45);
  props.add(record);
  for (let i = 0; i < 3; i += 1) box(props, 0.025, 0.025, 1.2, materials.label, [1.7 + i * 0.08, 0.03, -0.4]);
  parts.labels.add(props);
  root.userData.props.forEach((prop, index) => { prop.object = index === 0 ? crt : index === 1 ? record : props.children[2]; });

  const modeOpacity = {
    overview: { walls: 0.72, structure: 1, labels: 1, props: 1 },
    structure: { walls: 0.42, structure: 0.86, labels: 0.72, props: 0.62 },
    quiet: { walls: 0.18, structure: 0.55, labels: 0.25, props: 0.25 }
  };
  let currentMode = 'overview';
  function setMode(mode = 'overview') {
    currentMode = modeOpacity[mode] ? mode : 'overview';
    const values = modeOpacity[currentMode];
    setOpacity(parts.backWall, values.walls);
    setOpacity(parts.sideWall, values.walls);
    setOpacity(parts.floor, values.structure);
    setOpacity(parts.plinth, values.structure);
    setOpacity(parts.lightSlots, values.structure);
    setOpacity(parts.cableTray, values.structure);
    setOpacity(parts.ventilation, values.structure);
    setOpacity(parts.aisleMarkers, values.structure);
    setOpacity(parts.labels, values.labels);
    setOpacity(props, values.props);
  }
  function setProgress(progress) {
    const p = Number.isFinite(progress) ? progress : 0;
    setMode(p >= 5 ? 'quiet' : p >= 3 ? 'structure' : 'overview');
  }
  setMode('overview');

  let disposed = false;
  return {
    root,
    parts,
    setProgress,
    setMode,
    get mode() { return currentMode; },
    dispose() {
      if (disposed) return;
      disposed = true;
      const geometries = new Set();
      const materialSet = new Set();
      root.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materialSet.add(object.material);
      });
      geometries.forEach(geometry => geometry.dispose());
      materialSet.forEach(mat => mat.dispose());
    }
  };
}
