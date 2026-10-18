import * as THREE from 'three';
import { cameraPose } from './scene.js';
import { createPaintTexture } from './surface.js';
import { createCabinetDoor } from './cabinet-door.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export function createModel(contract){
 const root=new THREE.Group(),physical=new THREE.Group();root.add(physical);
 const materials={};const mat=(name,color,metalness=0.2)=>materials[name]??=(new THREE.MeshStandardMaterial({color,metalness,roughness:0.62}));
 const box=(parent,w,h,d,x,y,z,material)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(0.018,w/5,h/5,d/5)),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const steel=mat('steel',0x292d30,0.42),edge=mat('edge',0x51575a,0.65),dark=mat('dark',0x101920),pcb=mat('pcb',0x25616a),chip=mat('chip',0x171f28),gold=mat('gold',0xc5a45f,0.7),blue=mat('blue',0x4d7da6);
 const paintTexture=createPaintTexture();steel.roughnessMap=paintTexture;steel.roughness=0.9;
 const nodes=[];let node,door;
 for(let c=0;c<2;c++){
  const x=(c-0.5)*1.93;
  box(physical,1.55,0.14,1.75,x,0.14,0,steel);box(physical,1.55,0.14,1.75,x,3.87,0,steel);
  for(const dx of [-0.735,0.735])box(physical,0.08,3.65,1.75,x+dx,2,0,steel);
  box(physical,1.4,3.6,0.05,x,2,-0.85,dark);
  for(let j=0;j<15;j++){
   const n=new THREE.Group();n.position.set(x,0.48+j*0.225,0);physical.add(n);nodes.push(n);
   const selected=c===0&&j===7;
   box(n,1.30,0.045,1.4,0,0,0,selected?edge:steel);
   box(n,1.3,0.17,0.045,0,0.085,0.72,selected?blue:dark);
   if(!selected){for(let k=0;k<5;k++)box(n,0.13,0.015,0.008,-0.4+k*0.17,0.09,0.748,edge);}
   else node=n;
  }
  const hinge=new THREE.Group();hinge.position.set(x-0.78,2,0.94);physical.add(hinge);
  hinge.add(createCabinetDoor());
  if(c===0)door=hinge;
 }
 const cover=box(node,1.28,0.04,1.36,0,0.31,0,edge);
 const cpu=box(node,0.24,0.07,0.24,0,0.10,-0.46,gold);cpu.userData.kind='cpu';
 const cards=[],chips=[];
 for(let k=0;k<2;k++){
  const card=new THREE.Group();card.position.set(k===0?-0.34:0.34,0.12,0.07);node.add(card);cards.push(card);
  box(card,0.49,0.025,0.94,0,0,0,pcb);
  box(node,0.49,0.045,0.05,k===0?-0.34:0.34,0.07,-0.42,dark);
  for(let j=0;j<8;j++)chips.push(box(card,0.15,0.045,0.16,(j%2-0.5)*0.23,0.04,-0.32+Math.floor(j/2)*0.21,chip));
  for(let j=0;j<8;j++)box(card,0.032,0.008,0.075,-0.20+j*0.057,-0.017,0.43,gold);
 }
 // Small original components and traces; layout is explicitly a teaching reconstruction.
 for(const card of cards){
  for(let j=0;j<12;j++)box(card,0.035,0.018,0.022,(j%2===0?1:-1)*0.225,0.021,-0.40+Math.floor(j/2)*0.15,edge);
  for(let j=0;j<6;j++)box(card,0.004,0.002,0.72,-0.065+j*0.024,0.014,0, gold);
 }
 const micro=new THREE.Group();root.add(micro);micro.position.set(0,2,2.8);
 box(micro,2.15,0.15,1.8,0,0,0,chip);box(micro,1.65,0.025,1.3,0,0.09,0,gold);
 const colors=[0x5b9fc2,0xbca16b,0x669e88,0x9983b1];
 for(let j=0;j<4;j++)box(micro,0.71,0.035,0.53,(j%2-0.5)*0.82,0.13,(Math.floor(j/2)-0.5)*0.64,mat(`function${j}`,colors[j]));
 for(let i=0;i<16;i++){box(micro,0.055,0.05,0.24,-0.97+i*0.13,-0.04,1.0,gold);box(micro,0.055,0.05,0.24,-0.97+i*0.13,-0.04,-1.0,gold);}
 node.scale.y=0.5; // Teaching chassis compressed vertically to clear the 0.225 slot pitch.
 const nodeOrigin=node.position.clone();
 // Keep the selected board's pivot in unscaled exhibit space. A rotated child of
 // node.scale.y=0.5 otherwise shears and changes apparent rotation center.
 root.updateMatrixWorld(true);
 physical.attach(cards[0]);
 const cardOrigin=cards[0].position.clone();
 const boardCenter=cardOrigin.clone().add(new THREE.Vector3(0,0.4,2.8));
 const facing=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),cameraPose(5).position.sub(boardCenter).normalize());
 const detailMaterials=new Set();micro.traverse(o=>{if(o.material){o.castShadow=false;o.receiveShadow=false;o.material=o.material.clone();o.material.transparent=true;detailMaterials.add(o.material);}});
 const originalShadows=new Map();physical.traverse(o=>{if(o.isMesh)originalShadows.set(o,o.castShadow);});
 const physicalMaterials=new Set();physical.traverse(o=>{if(o.material)physicalMaterials.add(o.material);});
 const anchor=new THREE.Vector3(),anchorRotation=new THREE.Quaternion(),detailEnd=new THREE.Vector3(0,2,2.8),identity=new THREE.Quaternion();
 const smooth=t=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
 const regions=micro.children.slice(2,6);regions.forEach((r,i)=>{r.userData.regionIndex=i;});
 const parts={regions,physical,door,node,cover,cards,chips,cpu,micro,nodes,moving:[door,node,cover,cards[0],micro]};
 root.userData.logicalChipCount=contract.configuration.searchNodeCount.value*contract.configuration.cardsPerNode.value*contract.configuration.chipsPerCard.value;
 let disposed=false;
 return {root,parts,selectRegion(index){regions.forEach((r,i)=>{r.material.emissive.copy(r.material.color);r.material.emissiveIntensity=i===index?0.45:0;});},applyPose(p){
  door.rotation.y=p.doorAngle;node.position.copy(nodeOrigin);node.position.z+=p.nodeZ;
  cover.position.set(p.coverX,0.31+p.coverY,0);
  cards[0].position.copy(cardOrigin);cards[0].position.y+=p.cardY*0.5;cards[0].position.z+=p.nodeZ;cards[0].quaternion.identity().slerp(facing,p.cardAngle/(Math.PI/5));
    const t=p.chipProgress||0;const grow=smooth((t-0.4)/0.6),fade=smooth((t-0.12)/0.18);
  root.updateMatrixWorld(true);chips[0].getWorldPosition(anchor);chips[0].getWorldQuaternion(anchorRotation);
  root.worldToLocal(anchor);anchor.y+=0.65*smooth(t/0.22);anchor.z+=0.18*smooth(t/0.22);micro.position.copy(anchor).lerp(detailEnd,grow);
  micro.quaternion.copy(anchorRotation).slerp(identity,grow);
  micro.scale.setScalar(0.035+0.965*grow);
  micro.visible=t>0.12;physical.visible=t<0.3;
  physicalMaterials.forEach(m=>{m.transparent=fade>0;m.opacity=1-fade;m.depthWrite=true;});
    physical.traverse(o=>{if(o.isMesh)o.castShadow=t<0.12&&originalShadows.get(o);});
  chips[0].visible=t<=0.12;
  detailMaterials.forEach(m=>{m.opacity=smooth((t-0.12)/0.12);m.depthWrite=true;});
  // Function blocks only emerge once the magnified package has established its scale.
  micro.children.slice(2,6).forEach(o=>{o.scale.y=0.01+0.99*smooth((t-0.6)/0.4);o.material.opacity*=smooth((t-0.6)/0.4);});
  root.updateMatrixWorld(true);
 },dispose(){if(disposed)return;disposed=true;const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});const maps=new Set();ms.forEach(m=>{if(m.roughnessMap)maps.add(m.roughnessMap);});maps.forEach(t=>t.dispose());gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}};
}
