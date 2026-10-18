export const STATIONS=Object.freeze([0,3,5,6]);
export function createState({reducedMotion=false}={}){return {progress:0,target:0,station:0,reducedMotion};}
export function selectStation(state,index){
  const station=Number.isFinite(index)?Math.max(0,Math.min(3,Math.round(index))):0;
  const target=STATIONS[station];
  return {...state,station,target,progress:state.reducedMotion?target:state.progress};
}
export function advance(state,deltaSeconds){
  const dt=Number.isFinite(deltaSeconds)?Math.max(0,Math.min(0.05,deltaSeconds)):0;
  const diff=state.target-state.progress;
  const toTime=p=>p<=5?p:5+(p-5)*2;
  const fromTime=t=>t<=5?t:5+(t-5)/2;
  const currentTime=toTime(state.progress),targetTime=toTime(state.target);
  return {...state,progress:state.reducedMotion?state.target:fromTime(currentTime+Math.sign(diff)*Math.min(Math.abs(targetTime-currentTime),dt))};
}
export function resetState(state){return createState({reducedMotion:state.reducedMotion});}
