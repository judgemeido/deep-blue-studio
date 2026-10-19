import { Box3,Vector3 } from 'three';
import { samplePose } from './motion.js';
export function checkClearance(model,progress){
 if(progress!==undefined)model.applyPose(samplePose(progress));
 model.root.updateMatrixWorld(true);
 const p=model.parts, pairs=[['card/card',p.cards[0],p.cards[1]],['cover/card0',p.cover,p.cards[0]],['cover/card1',p.cover,p.cards[1]]];
 // Only an extracted node can enter the door sweep; assembled front contact is intentional.
 if(p.node.position.z>0.001)pairs.push(['door/node',p.door,p.node]);
 return pairs.flatMap(([pair,a,b])=>{
  const aa=new Box3().setFromObject(a),bb=new Box3().setFromObject(b);
  const overlap=new Vector3(Math.min(aa.max.x,bb.max.x)-Math.max(aa.min.x,bb.min.x),Math.min(aa.max.y,bb.max.y)-Math.max(aa.min.y,bb.min.y),Math.min(aa.max.z,bb.max.z)-Math.max(aa.min.z,bb.min.z));
  const penetration=Math.min(overlap.x,overlap.y,overlap.z);
  return penetration>1e-6?[{pair,penetration}]:[];
 });
}

export function checkChipAssemblyClearance(model, progress, microState = {}) {
  if (progress !== undefined) model.applyPose(samplePose(progress));
  const p = model.parts;
  if (!p.microParts) return [{ pair: 'micro/missing', penetration: 1 }];
  model.root.updateMatrixWorld(true);
  const checks = [];
  const tracked = [p.microParts.packageBody, p.microParts.lid, p.microParts.substrate, p.microParts.die, p.microParts.bondWires, p.microParts.pins];
  for (const object of tracked) {
    if (!object.visible) continue;
    const box = new Box3().setFromObject(object);
    if (![...box.min, ...box.max].every(Number.isFinite)) checks.push({ pair: 'micro/non-finite', state: microState });
  }
  return checks;
}
