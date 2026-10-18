export function makeTeachingTree({reverse=false}={}){
 const values=[3,5,6,9,1,2,0,-1];let i=0;
 const branch=(id,depth)=>depth===3?{id,value:values[i++]}:{id,children:[branch(id+'a',depth+1),branch(id+'b',depth+1)]};
 const tree={id:'root',children:[branch('L',1),branch('R',1)]};
 if(reverse){const flip=n=>{if(n.children){n.children.reverse();n.children.forEach(flip);}};flip(tree);}return tree;
}
export function runSearch(tree,{strategy='minimax'}={}){
 if(!['minimax','alphabeta'].includes(strategy))throw Error('未知搜索策略');
 const seen=new Set();function validate(n){if(!n||typeof n.id!=='string'||seen.has(n.id))throw Error('节点标识必须唯一');seen.add(n.id);if(n.children){if(!Array.isArray(n.children)||!n.children.length)throw Error('分支不能为空');n.children.forEach(validate);}else if(!Number.isFinite(n.value))throw Error('叶评分必须为有限数');}validate(tree);
 const events=[];const emit=e=>events.push(Object.freeze(e));
 const ids=n=>[n.id,...(n.children||[]).flatMap(ids)];
 function visit(n,max,alpha,beta){
  emit({type:'enter',nodeId:n.id,max});
  if(!n.children){emit({type:'evaluate',nodeId:n.id,value:n.value});return {value:n.value,bestChildId:null};}
  let value=max?-Infinity:Infinity,bestChildId=null;
  for(let i=0;i<n.children.length;i++){
   const child=n.children[i],result=visit(child,!max,alpha,beta);
   if(bestChildId===null||(max?result.value>value:result.value<value)){value=result.value;bestChildId=child.id;}
   if(strategy==='alphabeta'){
    if(max)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);
    emit({type:'bound',nodeId:n.id,alpha,beta,value});
    if(alpha>=beta&&i<n.children.length-1){emit({type:'prune',nodeId:n.id,alpha,beta,skippedIds:Object.freeze(n.children.slice(i+1).flatMap(ids)),reason:`当前界限 α=${alpha} ≥ β=${beta}，剩余分支不能改善祖先的选择。`});break;}
   }
  }
  emit({type:'return',nodeId:n.id,value,bestChildId});return {value,bestChildId};
 }
 const result=visit(tree,true,-Infinity,Infinity);
 return {...result,events:Object.freeze(events),visitedNodes:events.filter(e=>e.type==='enter').length,evaluatedLeaves:events.filter(e=>e.type==='evaluate').length};
}
