export function createPlayback(events){return {events,index:0,playing:false,elapsed:0};}
export function resetPlayback(state,events=state.events){return createPlayback(events);}
export function stepPlayback(state){const index=Math.min(state.events.length,state.index+1);return {...state,index,elapsed:0,playing:index<state.events.length&&state.playing};}
export function tickPlayback(state,dt,{hidden=false,reducedMotion=false}={}){
 if(hidden||reducedMotion)return {...state,playing:false,elapsed:0};
 if(!state.playing)return state;
 const elapsed=state.elapsed+(Number.isFinite(dt)?Math.max(0,Math.min(.05,dt)):0);
 return elapsed>=.65?stepPlayback(state):{...state,elapsed};
}
