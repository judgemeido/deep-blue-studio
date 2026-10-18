import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { samplePose } from './motion.js';
import { createExhibit } from './exhibit.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const lerp=(a,b,t)=>a.clone().lerp(b,t);
const targets=[new THREE.Vector3(0.65,1.8,0.1),new THREE.Vector3(-0.965,2.10,2.8),new THREE.Vector3(-1.305,2.515,2.87),new THREE.Vector3(0,2,2.8)];
const offsets=[new THREE.Vector3(7.2,4.5,11),new THREE.Vector3(3.2,2.4,4.8),new THREE.Vector3(2.1,2.5,3.4),new THREE.Vector3(2.2,3.3,3.2)];
const thresholds=[0,3,5,6];
export function cameraPose(progress,view='perspective'){
 const p=Math.max(0,Math.min(6,Number.isFinite(progress)?progress:0));
 let i=0;while(i<2&&p>thresholds[i+1])i++;
 let t=(p-thresholds[i])/(thresholds[i+1]-thresholds[i]);
 if(i===2)t=t*t*(3-2*t);
 let target=lerp(targets[i],targets[i+1],t),offset=lerp(offsets[i],offsets[i+1],t);
 if(i===2){
  const raw=p-5,smooth=n=>{const x=Math.max(0,Math.min(1,n));return x*x*(3-2*x);};
  const facing=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),offsets[2].clone().normalize());
  const chipTarget=new THREE.Vector3(-0.115,0.02,-0.32).applyQuaternion(facing).add(targets[2]);
  const lift=smooth(raw/0.22),grow=smooth((raw-0.4)/0.6);
  chipTarget.y+=0.65*lift;chipTarget.z+=0.18*lift;
  const lockedTarget=lerp(targets[2],chipTarget,smooth(raw/0.22));
  target=lerp(lockedTarget,targets[3],grow);
  const closeOffset=offsets[2].clone().normalize().multiplyScalar(1.3);
  offset=lerp(lerp(offsets[2],closeOffset,smooth(raw/0.4)),offsets[3],grow);
 }
 const length=offset.length();
 if(view==='front')offset.set(0,0,length);
 if(view==='side')offset.set(length,0,0);
 if(view==='top')offset.set(0,length,0.001);
 return {target,position:target.clone().add(offset)};
}
export function fitCameraPose(progress,view,aspect){
 const pose=cameraPose(progress,view);
 const factor=Math.max(1,1.25/Math.max(0.25,aspect));
 pose.position.sub(pose.target).multiplyScalar(factor).add(pose.target);
 return pose;
}
export function transitionLighting(progress){
 const t=Math.max(0,Math.min(1,progress-5));
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 return {shadow:1-smooth(t/0.12),floor:1-smooth((t-0.1)/0.65)};
}
export function createScene(canvas,model){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x192027);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.add(model.root);
 const exhibit=createExhibit();scene.add(exhibit.root);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,0.04);scene.environment=environment.texture;scene.environmentIntensity=0.3;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(36,1,0.05,100);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=0.09;controls.minDistance=0.4;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*0.92;controls.enablePan=true;
 scene.add(new THREE.HemisphereLight(0xe3ebee,0x494035,1.5));
 const key=new THREE.DirectionalLight(0xffedd0,3.6);key.position.set(-3,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:0.5,far:25});key.shadow.bias=-0.0004;key.shadow.normalBias=0.025;scene.add(key);
 const rim=new THREE.DirectionalLight(0xa9caed,2.0);rim.position.set(4,4,-4);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xd9e8f2,1.5);fill.position.set(1,3,7);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x151a20,roughness:0.88,metalness:0.12}));floor.rotation.x=-Math.PI/2;floor.position.y=0.035;floor.receiveShadow=true;scene.add(floor); let view='perspective',force=true,last=-1,station=0;
 const resize=()=>{const w=canvas.parentElement.clientWidth,h=canvas.parentElement.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();force=true;};
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,selectHandler=()=>{};
 const onDown=e=>{down={x:e.clientX,y:e.clientY};};
 const onUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||last<5.999)return;down=null;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(model.parts.regions,false)[0];if(hit)selectHandler(hit.object.userData.regionIndex);};
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);
 return {onRegionSelect(handler){selectHandler=handler;},focus(s,v=view){station=s;view=v;force=true;},resize,
 render(state){
  model.applyPose(samplePose(state.progress));
  if(force||Math.abs(last-state.progress)>1e-8){const pose=fitCameraPose(state.progress,view,camera.aspect);camera.position.copy(pose.position);controls.target.copy(pose.target);controls.update();last=state.progress;force=false;}
  const lighting=transitionLighting(state.progress);key.shadow.intensity=lighting.shadow;floor.material.transparent=true;floor.material.opacity=lighting.floor;floor.visible=lighting.floor>0;exhibit.setProgress(state.progress);controls.update();renderer.render(scene,camera);
 },dispose(){canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointerup",onUp);observer.disconnect();controls.dispose();exhibit.dispose();floor.geometry.dispose();floor.material.dispose();environment.dispose();key.shadow.dispose();model.dispose();renderer.dispose();}};
}
