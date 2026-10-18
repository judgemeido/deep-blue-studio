export const DISTANCES = Object.freeze({node:2.8,coverLift:0.85,coverSide:1.7,cardLift:0.8});
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const t=clamp(n);return t*t*(3-2*t);};
export function samplePose(progress){
  const p=Number.isFinite(progress)?Math.max(0,Math.min(6,progress)):0;
  return {doorAngle:0-Math.PI*0.58*ease(p),disconnected:p>=2,nodeZ:DISTANCES.node*ease(p-2),coverY:DISTANCES.coverLift*ease((p-3)*2),coverX:DISTANCES.coverSide*ease((p-3.5)*2),cardY:DISTANCES.cardLift*ease((p-4)/0.65),cardAngle:Math.PI/5*ease((p-4.65)/0.35),microVisible:p>=6,chipProgress:clamp(p-5)};
}
