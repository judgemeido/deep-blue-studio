import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SIGNAL_TRACE_STEPS } from './signal-trace.js';

const DEFAULT_COLORS = [0x5b9fc2, 0xbca16b, 0x669e88, 0x9983b1];

function makeMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.2,
    roughness: options.roughness ?? 0.52,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true
  });
}

function addMesh(parent, geometry, material, position = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addTube(parent, points, material) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  return addMesh(parent, new THREE.TubeGeometry(curve, 8, 0.012, 5, false), material);
}

function addSignalSegment(parent, points, color) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14, depthWrite: false, depthTest: false });
  const mesh = addMesh(parent, new THREE.TubeGeometry(curve, 18, 0.032, 6, false), material);
  mesh.renderOrder = 30;
  mesh.userData.homePoints = points;
  return { mesh, curve, material };
}

export function createChipAssembly({ contract } = {}) {
  const root = new THREE.Group();
  root.name = 'micro-chip-assembly';
  root.userData.boundary = contract?.microChip?.displayLabel ?? '芯片内部：教学重建，非历史版图';

  const packageBody = new THREE.Group();
  packageBody.name = 'package-body';
  root.add(packageBody);

  const materials = {
    package: makeMaterial(0x26323a, { metalness: 0.4, roughness: 0.65 }),
    lid: makeMaterial(0x56636a, { metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.94 }),
    substrate: makeMaterial(0xb99858, { metalness: 0.65, roughness: 0.35 }),
    die: makeMaterial(0x121b24, { metalness: 0.2, roughness: 0.38 }),
    wire: makeMaterial(0xcbb371, { metalness: 0.8, roughness: 0.25 }),
    pin: makeMaterial(0xd1a866, { metalness: 0.75, roughness: 0.3 }),
    trace: makeMaterial(0x5e9db1, { metalness: 0.4, roughness: 0.32 }),
    hotspot: DEFAULT_COLORS.map(color => makeMaterial(color, { transparent: true, opacity: 0.76, depthWrite: false }))
  };

  const body = addMesh(packageBody, new RoundedBoxGeometry(2.15, 0.18, 1.8, 3, 0.06), materials.package, [0, 0, 0]);
  body.userData.layer = 'package';
  const cutawayWalls = [];
  const wallSpecs = [
    ['front-wall', new RoundedBoxGeometry(2.08, 0.28, 0.08, 2, 0.025), [0, 0.17, 0.86]],
    ['back-wall', new RoundedBoxGeometry(2.08, 0.28, 0.08, 2, 0.025), [0, 0.17, -0.86]],
    ['left-wall', new RoundedBoxGeometry(0.08, 0.28, 1.64, 2, 0.025), [-1.04, 0.17, 0]],
    ['right-wall', new RoundedBoxGeometry(0.08, 0.28, 1.64, 2, 0.025), [1.04, 0.17, 0]]
  ];
  const wallHomes = new Map();
  wallSpecs.forEach(([name, geometry, position], index) => {
    const wall = addMesh(packageBody, geometry, materials.package, position);
    wall.name = name;
    wall.userData.layer = 'package';
    wallHomes.set(wall, new THREE.Vector3(...position));
    if (index === 0 || index === 2) cutawayWalls.push(wall);
  });

  const substrate = addMesh(root, new RoundedBoxGeometry(1.65, 0.09, 1.3, 2, 0.03), materials.substrate, [0, 0.16, 0]);
  substrate.name = 'substrate';
  substrate.userData.layer = 'substrate';

  const die = addMesh(root, new RoundedBoxGeometry(0.98, 0.06, 0.76, 2, 0.02), materials.die, [0, 0.25, 0]);
  die.name = 'die';
  die.userData.layer = 'die';
  const dieCore = addMesh(root, new RoundedBoxGeometry(0.84, 0.025, 0.62, 2, 0.012), makeMaterial(0x1f3642, { metalness: 0.1, roughness: 0.34 }), [0, 0.294, 0]);
  dieCore.name = 'die-core';
  dieCore.userData.layer = 'die';

  const lid = new THREE.Group();
  lid.name = 'package-lid';
  lid.position.set(0, 0.26, -0.88);
  root.add(lid);
  const lidMesh = addMesh(lid, new RoundedBoxGeometry(2.05, 0.08, 0.72, 2, 0.04), materials.lid, [0, 0, 0.36]);
  lidMesh.userData.layer = 'package';

  const pins = new THREE.Group();
  pins.name = 'pins';
  pins.userData.layer = 'pins';
  root.add(pins);
  const pinGeometry = new THREE.BoxGeometry(0.055, 0.07, 0.24);
  for (let i = 0; i < 16; i += 1) {
    const x = -0.97 + i * 0.13;
    addMesh(pins, pinGeometry, materials.pin, [x, -0.04, 1]);
    addMesh(pins, pinGeometry, materials.pin, [x, -0.04, -1]);
  }

  const traces = new THREE.Group();
  traces.name = 'substrate-traces';
  traces.userData.layer = 'substrate';
  root.add(traces);
  const traceGeometry = new THREE.BoxGeometry(0.018, 0.012, 0.78);
  for (let i = 0; i < 7; i += 1) addMesh(traces, traceGeometry, materials.trace, [-0.48 + i * 0.16, 0.22, 0]);

  const bondWires = new THREE.Group();
  bondWires.name = 'bond-wires';
  bondWires.userData.layer = 'bondWires';
  root.add(bondWires);
  for (let i = 0; i < 8; i += 1) {
    const x = -0.42 + i * 0.12;
    addTube(bondWires, [[x, 0.3, -0.35], [x * 1.7, 0.48, -0.72], [x * 1.85, 0.25, -0.86]], materials.wire);
    addTube(bondWires, [[x, 0.3, 0.35], [x * 1.7, 0.48, 0.72], [x * 1.85, 0.25, 0.86]], materials.wire);
  }

  const sectionPlane = addMesh(root, new THREE.BoxGeometry(0.02, 0.48, 1.52), new THREE.MeshBasicMaterial({ color: 0x7ad2e8, transparent: true, opacity: 0, depthWrite: false }), [0.76, 0.35, 0]);
  sectionPlane.name = 'section-plane';
  sectionPlane.userData.layer = 'cutaway';

  const traceLayer = new THREE.Group();
  traceLayer.name = 'signal-trace-layer';
  traceLayer.userData.layer = 'teaching-overlay';
  root.add(traceLayer);
  const traceColors = [0x72c7f0, 0xf1c17a, 0x78d7a1, 0xb99aef, 0x72c7f0];
  const tracePoints = [
    [-0.42, 0.345, -0.28], [-0.19, 0.365, -0.22], [0.08, 0.38, -0.15],
    [0.25, 0.39, 0.02], [-0.04, 0.4, 0.22], [0.4, 0.41, 0.28]
  ];
  const traceSegments = traceColors.map((color, index) => {
    const segment = addSignalSegment(traceLayer, [tracePoints[index], tracePoints[index + 1]], color);
    segment.mesh.userData.signalStep = SIGNAL_TRACE_STEPS[index]?.id ?? `step-${index}`;
    segment.mesh.userData.functionId = SIGNAL_TRACE_STEPS[index]?.functionId ?? null;
    return segment;
  });
  const traceCurve = new THREE.CatmullRomCurve3(tracePoints.map(point => new THREE.Vector3(...point)));
  const tracePulseMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
  const tracePulse = addMesh(traceLayer, new THREE.SphereGeometry(0.075, 16, 12), tracePulseMaterial, tracePoints[0]);
  tracePulse.name = 'signal-pulse';
  tracePulse.renderOrder = 31;
  traceLayer.renderOrder = 30;

  const regions = [];
  const hotspots = [];
  const hotspotIds = ['moves', 'evaluate', 'control', 'stack'];
  const hotspotContract = contract?.microChip?.hotspots ?? {};
  for (let i = 0; i < hotspotIds.length; i += 1) {
    const id = hotspotIds[i];
    const region = addMesh(root, new RoundedBoxGeometry(0.42, 0.018, 0.3, 2, 0.03), materials.hotspot[i], [((i % 2) - 0.5) * 0.48, 0.31, (Math.floor(i / 2) - 0.5) * 0.34]);
    region.name = `hotspot-${id}`;
    region.userData = { ...region.userData, regionIndex: i, hotspotId: id, layer: 'teaching-overlay', pickable: true };
    regions.push(region);
    hotspots.push({
      id,
      object: region,
      label: hotspotContract[id]?.label ?? id,
      functionId: id,
      boundary: hotspotContract[id]?.boundary ?? '功能示意，不是实际裸片区域'
    });
  }

  const parts = { packageBody, cutawayWalls, lid, substrate, die, dieCore, bondWires, pins, traces, regions, sectionPlane, traceLayer, traceSegments, tracePulse };
  root.userData.parts = Object.keys(parts);
  root.userData.detailChipCount = 1;
  let disposed = false;
  return {
    root,
    parts,
    hotspots,
    materials,
    traceCurve,
    wallHomes,
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
      materialSet.forEach(material => material.dispose());
    }
  };
}
