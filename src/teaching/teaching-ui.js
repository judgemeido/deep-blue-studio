import {makeTeachingTree,runSearch} from './search.js';
import {scheduleTasks} from './scheduler.js';
import {createPlayback,stepPlayback,tickPlayback} from './playback.js';
const chapters=[
 ['机器接到一个问题。','棋盘只是输入的参照。接下来用一棵小树，看看机器怎样比较可能性。','观察棋桌与双柜：人的知识定义评分，硬件负责计算。'],
 ['自己选大，对手选小。','MAX 希望评分更高，MIN 代表对手选择更低的分支。逐步访问叶子，把结果往上带。','蓝圈是当前节点；实线表示已访问。叶分数为教学给定值，不来自棋盘引擎。'],
 ['少算，但不改答案。','在同一棵树上切换完整搜索与剪枝。已不可能改善祖先选择的分支，可以跳过。','虚线节点被剪枝，灰色节点尚未访问；最终统计与当前回放进度分开显示。'],
 ['把任务分给不同节点。','把左右两个根子树作为独立任务，观察 1、4、8 个虚拟工作者如何分工。','只有两个任务，多出来的工作者会空闲；并行不意味着无限加速。'],
 ['分工，一直深入到芯片。','现在从整机进入节点、板卡和芯片，连接刚才的计算过程与物理硬件。','P2SC 负责通用软件工作，专用象棋芯片承担特定搜索与评估任务。']
];
export function createTeachingUI({container,onStation,onMicroAction=()=>{},reducedMotion=false}){
 let active=false,lesson=0,strategy='minimax',reverse=false,workers=1,tree,result,playback,reduced=reducedMotion;
 const abort=new AbortController();let renderAbort=new AbortController();let advancedOpen=false;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.addEventListener('click',fn,{signal:renderAbort.signal});return b;};
 const launch=document.getElementById('teaching-toggle');
 function rebuild(){tree=makeTeachingTree({reverse});result=runSearch(tree,{strategy});playback=createPlayback(result.events);}
 function changeLesson(n){lesson=Math.max(0,Math.min(4,n));strategy=lesson===2?'alphabeta':'minimax';rebuild();onStation(lesson===4?3:0);render();}
 function setActive(value,{station=0,content=value}={}){
  active=value;pause();container.hidden=!active;
  document.querySelector('main').classList.toggle('teaching-mode',active);
  document.body.classList.toggle('content-view',content);
  document.getElementById('show-content').setAttribute('aria-pressed',String(content));
  document.getElementById('show-model').setAttribute('aria-pressed',String(!content));
  launch.textContent=active?'返回自由观察':'开始五步教学';launch.setAttribute('aria-expanded',String(active));
  if(active){changeLesson(0);container.tabIndex=-1;container.focus();}
  else {onStation(station);if(content){const controls=document.getElementById('controls');controls.tabIndex=-1;controls.focus({preventScroll:true});}else launch.focus({preventScroll:true});}
 }
 function toggle(){setActive(!active);}
 launch.addEventListener('click',toggle,{signal:abort.signal});
 function pause(){if(playback)playback={...playback,playing:false,elapsed:0};if(active)render();}
 function treeDiagram(host){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 640 265');svg.setAttribute('role','img');svg.setAttribute('aria-label','教学博弈树：MAX 与 MIN 交替，8 个叶子评分');
  const events=playback.events.slice(0,playback.index),visited=new Set(events.filter(e=>e.type==='enter').map(e=>e.nodeId)),pruned=new Set(events.filter(e=>e.type==='prune').flatMap(e=>e.skippedIds)),evaluated=new Set(events.filter(e=>e.type==='evaluate').map(e=>e.nodeId)),current=events.at(-1)?.nodeId;
  const draw=(n,x,y,span,depth)=>{
   if(n.children)n.children.forEach((child,i)=>{const xx=x+(i===0?-1:1)*span;const line=document.createElementNS(ns,'line');for(const [k,v]of Object.entries({x1:x,y1:y,x2:xx,y2:y+65}))line.setAttribute(k,v);svg.append(line);draw(child,xx,y+65,span/2,depth+1);});
   const g=document.createElementNS(ns,'g');g.setAttribute('class',[visited.has(n.id)?'visited':'',pruned.has(n.id)?'pruned':'',current===n.id?'current':''].join(' '));
   const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r',18);g.append(circle);
   const text=document.createElementNS(ns,'text');text.setAttribute('x',x);text.setAttribute('y',y+4);text.textContent=n.children?(depth%2?'MIN':'MAX'):String(n.value);g.append(text);
   const label=document.createElementNS(ns,'text');label.setAttribute('x',x);label.setAttribute('y',y+32);label.setAttribute('class','node-id');label.textContent=pruned.has(n.id)?'跳过':evaluated.has(n.id)?'已评估':n.id;g.append(label);svg.append(g);
  };draw(tree,320,25,155,0);host.append(svg);const scores=[];const collect=n=>n.children?n.children.forEach(collect):scores.push(`${n.id}=${n.value}`);collect(tree);host.append(el("p",`叶分数（教学给定）：${scores.join("，")}`,"leaf-values"));
 }
 function render(){try{renderContent();}catch(error){playback={...playback,playing:false};container.replaceChildren(el("h2","教学暂时无法计算"),el("p",error.message),button("重新载入教学",()=>{reverse=false;strategy="minimax";rebuild();render();}));}}
 function renderContent(){
  if(!active)return;const previousDetails=container.querySelector('details');if(previousDetails)advancedOpen=previousDetails.open;const explanationFocused=previousDetails?.contains(document.activeElement);const focusText=container.contains(document.activeElement)?document.activeElement.textContent:null;renderAbort.abort();renderAbort=new AbortController();container.replaceChildren();
  const top=el('div',undefined,'teaching-heading');top.append(el('span',`LEARNING LAB / 0${lesson+1} OF 05`),el('span','教学数据 · 非历史搜索日志'));container.append(top);
  const journey=el('nav',undefined,'teaching-journey');journey.setAttribute('aria-label','五步教学');['接到棋局','展开搜索','理解剪枝','分派计算','进入芯片'].forEach((label,i)=>{const b=button(`${i+1} ${label}`,()=>changeLesson(i));b.setAttribute('aria-current',String(i===lesson));journey.append(b);});container.append(journey);
  container.append(el('h2',chapters[lesson][0]),el('p',chapters[lesson][1]),el('p',`看哪里：${chapters[lesson][2]}`,'teaching-observe'));
  if(lesson===1||lesson===2){
   const tools=el('div',undefined,'teaching-tools');
   if(lesson===2)for(const [key,label]of [['minimax','完整搜索'],['alphabeta','Alpha-Beta 剪枝']]){const b=button(label,()=>{strategy=key;rebuild();render();});b.setAttribute('aria-pressed',String(strategy===key));tools.append(b);}
   tools.append(button(reverse?'恢复原始顺序':'反转着法顺序',()=>{reverse=!reverse;rebuild();render();}));container.append(tools);
   const graph=el('div',undefined,'search-tree');treeDiagram(graph);container.append(graph);
   const prefix=playback.events.slice(0,playback.index),event=prefix.at(-1),count=prefix.filter(e=>e.type==='enter').length,leaves=prefix.filter(e=>e.type==='evaluate').length;
   const status=el('p',event?describe(event):'尚未开始。点击“单步访问”或“播放”。','search-status');status.setAttribute('role','status');container.append(status,el('p',`当前：访问 ${count} 个节点 / 评估 ${leaves} 个叶子　·　事件 ${playback.index} / ${result.events.length}`,'search-count'));
   const controls=el('div',undefined,'teaching-tools');controls.append(button('单步访问',()=>{playback=stepPlayback({...playback,playing:false});render();}),button(playback.playing?'暂停':'播放',()=>{if(reduced)return;if(playback.index===playback.events.length)playback=createPlayback(result.events);playback={...playback,playing:!playback.playing};render();}),button('搜索重来',()=>{rebuild();render();}));if(reduced){controls.children[1].disabled=true;container.append(el('p','减少动态效果已开启：请使用单步访问。'));}container.append(controls);
   const a=runSearch(tree),b=runSearch(tree,{strategy:'alphabeta'});container.append(el('p',`完整运行结果：两者根值均为 ${a.value}，选择 ${a.bestChildId}。完整搜索 ${a.visitedNodes} 节点 / ${a.evaluatedLeaves} 叶；剪枝 ${b.visitedNodes} 节点 / ${b.evaluatedLeaves} 叶。`,'comparison'));
   const details=el('details');details.open=advancedOpen;details.append(el('summary','剪枝依据与高级界限'));const prunes=prefix.filter(e=>e.type==='prune');details.append(el('p',prunes.length?prunes.map(e=>`${e.nodeId}：${e.reason} 跳过 ${e.skippedIds.join('、')}`).join('\n'):'当前回放尚未发生剪枝。α 是 MAX 已能保证的下界，β 是 MIN 已能保证的上界。'));container.append(details);
  }
  if(lesson===3){
   const tools=el('div',undefined,'teaching-tools');[1,4,8].forEach(n=>{const b=button(`${n} 个工作者`,()=>{workers=n;render();});b.setAttribute('aria-pressed',String(n===workers));tools.append(b);});container.append(tools);
   const tasks=tree.children.map(n=>({id:n.id,cost:runSearch(n).visitedNodes})),schedule=scheduleTasks(tasks,workers);
   const chart=el('div',undefined,'schedule');for(let i=0;i<workers;i++){const row=el('div',undefined,'worker-row');row.append(el('span',`W${i+1}`));const jobs=schedule.assignments.filter(a=>a.worker===i),track=el('div',undefined,'worker-track');jobs.forEach(a=>{const bar=el('span',`${a.id} · ${a.start}–${a.end}`);bar.style.left=`${a.start/schedule.makespan*100}%`;bar.style.width=`${(a.end-a.start)/schedule.makespan*100}%`;track.append(bar);});if(!jobs.length)track.append(el('small','空闲'));row.append(track);chart.append(row);}container.append(chart,el('p',`完成时间 ${schedule.makespan} 逻辑单位；${schedule.idleWorkers.length} 个空闲工作者。`,'comparison'),el('p','逻辑调度示意，非真实测速。两个子树独立全搜索，不共享剪枝界限。虚拟工作者不是历史 30 节点或 480 颗芯片。','teaching-observe'));
  }
  if(lesson===4){const tools=el('div',undefined,'teaching-tools');[['看节点',1],['看板卡',2],['看芯片',3]].forEach(([label,index])=>tools.append(button(label,()=>{onStation(index);if(matchMedia("(max-width:850px)").matches)document.getElementById("show-model").click();})));tools.append(button('探索芯片四种分工',()=>setActive(false,{station:3,content:true})),button('开盖查看',()=>{setActive(false,{station:3,content:true});onMicroAction({type:'OPEN_LID'});}),button('追踪一次信号',()=>{setActive(false,{station:3,content:true});onMicroAction({type:'OPEN_LID'});onMicroAction({type:'START_TRACE'});}));container.append(tools,el('p','观察上方三维场景：板卡和放大功能区为教学重建，不代表真实版图。'));}
  const bottom=el('div',undefined,'teaching-tools teaching-bottom');const back=button('← 教学上一步',()=>changeLesson(lesson-1));back.disabled=lesson===0;const next=button(lesson===4?'完成教学，返回自由观察':'教学下一步 →',()=>lesson===4?toggle():changeLesson(lesson+1));bottom.append(back,next);container.append(bottom);if(explanationFocused)container.querySelector('summary')?.focus({preventScroll:true});else if(focusText){const match=[...container.querySelectorAll("button")].find(b=>b.textContent===focusText&&!b.disabled);match?.focus({preventScroll:true});}
 }
 function describe(e){if(e.type==='enter')return `访问 ${e.nodeId}：${e.max?'MAX 选择更大值':'MIN 选择更小值'}。`;if(e.type==='evaluate')return `评估叶 ${e.nodeId}：给定分值 ${e.value}。`;if(e.type==='return')return `${e.nodeId} 回传 ${e.value}，选择 ${e.bestChildId}。`;if(e.type==='prune')return `${e.nodeId}：${e.reason}`;return `${e.nodeId} 更新界限：α=${e.alpha}，β=${e.beta}。`;}
 rebuild();return {tick(dt){if(!active)return;const next=tickPlayback(playback,dt,{hidden:document.hidden,reducedMotion:reduced});const changed=next.index!==playback.index||next.playing!==playback.playing;playback=next;if(changed)render();},pause,setReducedMotion(value){reduced=value;pause();},dispose(){abort.abort();renderAbort.abort();container.replaceChildren();}};
}
