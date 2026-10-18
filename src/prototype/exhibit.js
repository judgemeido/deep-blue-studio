import * as THREE from 'three';
export function createExhibit(){
 const root=new THREE.Group();root.position.set(3.22,0,0.8);
 const materials=[],geometries=[];
 const mat=(color,metalness=0.1,roughness=0.65)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.push(m);return m;};
 const wood=mat(0x6f4e35,0.05,0.75),edge=mat(0x303238,0.6,0.43),ivory=mat(0xd6c8a5),black=mat(0x232629),caseMat=mat(0xa59f8e,0.05,0.75),screenMat=mat(0x0c2425,0.1,0.28);
 screenMat.emissive.setHex(0x1a4841);screenMat.emissiveIntensity=0.25;
 const mesh=(geometry,material,x,y,z)=>{geometries.push(geometry);const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
 const box=(w,h,d,x,y,z,m)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 box(1.94,0.13,1.55,0,1.28,0,wood);box(1.85,0.045,1.46,0,1.20,0,edge);
 for(const x of [-0.79,0.79])for(const z of [-0.57,0.57])box(0.055,1.15,0.055,x,0.61,z,edge);
 const squares=[],pieces=[];
 box(1.09,0.035,1.09,-0.31,1.365,0.10,wood);
 for(let r=0;r<8;r++)for(let c=0;c<8;c++)squares.push(box(0.124,0.012,0.124,-0.745+c*0.124,1.39,-0.334+r*0.124,(r+c)%2?wood:ivory));
 // Original lathed silhouettes: no claimed brand, match position or exact historical set.
 const profiles={pawn:[[0,0],[.034,0],[.037,.014],[.023,.025],[.016,.065],[.026,.075],[.027,.09],[.016,.105],[0,.109]],rook:[[0,0],[.039,0],[.039,.016],[.024,.035],[.024,.10],[.037,.10],[.037,.13],[0,.13]],knight:[[0,0],[.038,0],[.035,.018],[.020,.055],[.027,.09],[.012,.145],[0,.145]],bishop:[[0,0],[.037,0],[.037,.014],[.020,.034],[.014,.09],[.026,.115],[.014,.147],[0,.16]],queen:[[0,0],[.04,0],[.04,.015],[.021,.04],[.015,.115],[.034,.145],[.02,.16],[0,.17]],king:[[0,0],[.04,0],[.04,.015],[.023,.04],[.016,.12],[.029,.14],[.014,.155],[.014,.18],[0,.18]]};
 const order=['rook','knight','bishop','queen','king','bishop','knight','rook'];
 for(const side of [0,1])for(let c=0;c<8;c++)for(const row of [0,1]){
  const type=row===1?'pawn':order[c],r=side===0?row:7-row;
  const geo=new THREE.LatheGeometry(profiles[type].map(([x,y])=>new THREE.Vector2(x,y)),12);
  const piece=mesh(geo,side===0?ivory:black,-0.745+c*0.124,1.402,-0.334+r*0.124);piece.userData.kind=type;pieces.push(piece);
 }
 // Compact CRT at rear-right of table; fictional neutral terminal, no borrowed branding.
 box(0.44,0.07,0.43,0.61,1.40,-0.38,caseMat);box(0.17,0.10,0.16,0.61,1.47,-0.43,caseMat);
 box(0.53,0.44,0.45,0.61,1.73,-0.42,caseMat);box(0.42,0.31,0.035,0.61,1.74,-0.18,black);
 box(0.36,0.25,0.015,0.61,1.75,-0.157,screenMat);
 const phosphor=new THREE.MeshBasicMaterial({color:0x74ae96});materials.push(phosphor);
 for(let i=0;i<5;i++)box(0.10+(i%3)*0.06,0.004,0.003,0.54,1.83-i*0.027,-0.147,phosphor);
 box(0.055,0.005,0.003,0.49,1.67,-0.147,phosphor);
 box(0.43,0.035,0.18,0.63,1.38,0.07,caseMat);
 for(let i=0;i<4;i++)box(0.36,0.008,0.015,0.63,1.404,0.015+i*0.038,edge);
 let disposed=false;
 return {root,parts:{squares,pieces},setProgress(p){root.visible=p<1.2;},dispose(){if(disposed)return;disposed=true;new Set(geometries).forEach(g=>g.dispose());new Set(materials).forEach(m=>m.dispose());}};
}
