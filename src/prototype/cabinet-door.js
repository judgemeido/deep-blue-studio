import * as THREE from 'three';
import { createPaintTexture } from './surface.js';
// Open lattice, not a perforation photograph or an undocumented historical panel.
export function createCabinetDoor(){
 const root=new THREE.Group();root.userData.solidPanel=false;
 const paint=new THREE.MeshStandardMaterial({color:0x252a2d,metalness:0.42,roughness:0.63});
 paint.roughnessMap=createPaintTexture();paint.roughness=0.9;
 const trim=new THREE.MeshStandardMaterial({color:0x41474a,metalness:0.7,roughness:0.4});
 const box=(w,h,d,x,y,z,material=paint)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;};
 for(const x of [0.055,1.465])box(0.11,3.5,0.065,x,0,0);
 for(const y of [-1.70,1.70])box(1.3,0.10,0.065,0.76,y,0);
 box(1.3,0.22,0.055,0.76,1.52,0);
 const matrix=new THREE.Matrix4();
 const vertical=new THREE.InstancedMesh(new THREE.BoxGeometry(0.009,3.12,0.018),paint,65);
 for(let i=0;i<65;i++){matrix.makeTranslation(0.14+i*0.0194,-0.06,0);vertical.setMatrixAt(i,matrix);}root.add(vertical);
 const horizontal=new THREE.InstancedMesh(new THREE.BoxGeometry(1.27,0.008,0.018),paint,145);
 for(let i=0;i<145;i++){matrix.makeTranslation(0.76,-1.61+i*0.0213,0);horizontal.setMatrixAt(i,matrix);}root.add(horizontal);
 box(0.035,0.27,0.065,1.40,-0.08,0.065,trim);
 for(const y of [-1.35,1.35])box(0.035,0.18,0.08,0.02,y,0,trim);
 return root;
}
