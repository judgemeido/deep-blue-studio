export function scheduleTasks(tasks,workers){
 if(![1,4,8].includes(workers))throw Error('工作者数量只能为 1、4、8');
 const seen=new Set(),available=Array(workers).fill(0);
 const assignments=tasks.map(t=>{if(!t||typeof t.id!=='string'||seen.has(t.id)||!Number.isFinite(t.cost)||t.cost<=0)throw Error('任务标识须唯一且成本为正');seen.add(t.id);const worker=available.indexOf(Math.min(...available)),start=available[worker],end=start+t.cost;available[worker]=end;return {...t,worker,start,end};});
 return {assignments,idleWorkers:available.flatMap((n,i)=>n===0?[i]:[]),makespan:Math.max(0,...available)};
}
