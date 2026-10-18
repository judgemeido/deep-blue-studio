import { createDetailsKeyboard } from './details-keyboard.js';
import { createChipUI } from './chip-ui.js';
import { createTeachingUI } from '../teaching/teaching-ui.js';
import { createModel } from './model.js';
import { createScene } from './scene.js';
import { createState,selectStation,advance,resetState } from './state.js';
import contract from '../../docs/MODEL_CONTRACT.json';
const $=id=>document.getElementById(id);
const lessons=[
 {object:'双柜集群',title:'两个柜子，一套系统。',description:'30 个搜索节点协作处理不同的搜索任务。这里先看清整机，再沿着一个节点走进去。',observe:'从棋桌看向双柜。进入节点后，柜门打开，蓝色节点沿正面抽出。',boundary:'每柜 15 节点仅为教学布局，不代表历史槽位映射。',next:'进入节点'},
 {object:'单个搜索节点',title:'先让门，再抽出节点。',description:'柜门让开通道，教学性断连后，选中节点沿正面完整抽出。它仍是原来那一个节点。',observe:'节点离柜后才能移开外盖。下一步观察通用 CPU 和两张专用卡。',boundary:'连接器与运动结构是教学重建，不是历史维修程序。',next:'展开板卡'},
 {object:'象棋加速卡',title:'通用调度，专用计算。',description:'节点内有一个 P2SC 和两张加速卡。每张卡上 8 颗象棋芯片；选中卡先拔出，再转向。',observe:'外盖已让位，第二张卡留在原位。两排四颗，共 8 颗芯片。',boundary:'PCB 排布和器件形状为示意，未复刻历史板卡。',next:'放大芯片'},
 {object:'芯片 · 放大功能示意',title:'分工，深入到硅片。',description:'切换到独立放大层，认识着法生成、评估、搜索控制，以及走法栈与重复检测的分工。',observe:'蓝 / 生成 · 琥珀 / 评估 · 绿 / 搜索控制 · 紫 / 栈与重复检测。',boundary:'放大功能示意，非实际版图；颜色不代表真实物理边界。',next:'已到芯片层'}
];
const media=matchMedia('(prefers-reduced-motion: reduce)');
let state=createState({reducedMotion:media.matches}),scene,model,raf=0,lastTime=null,disposed=false,lastMoving=null,chipUI;
const cleanup=[];const detailsKeyboard=createDetailsKeyboard();cleanup.push(()=>detailsKeyboard.dispose());
function listen(target,name,fn){target.addEventListener(name,fn);cleanup.push(()=>target.removeEventListener(name,fn));}
function updateUI(){
 const l=lessons[state.station];$('title').textContent=l.title;$('description').textContent=l.description;$('observe').textContent=l.observe;$('boundary').textContent=l.boundary;
 $('object-label').textContent=l.object;$('step').textContent=`0${state.station+1} / 04`;
 $('next').replaceChildren(document.createTextNode(l.next),Object.assign(document.createElement('span'),{textContent:'→'}));
 $('next').disabled=state.station===3;$('previous').disabled=state.station===0;
 document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.station)===state.station)));
}
function choose(index){state=selectStation(state,index);scene?.focus(state.station);updateUI();}
function reset(){state=resetState(state);scene?.focus(0,'perspective');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='perspective')));document.getElementById('view-label').textContent='整体观察';lastTime=null;updateUI();}
function showError(error){$('error').hidden=false;$('error-message').textContent=`无法创建或继续使用 WebGL 场景。请启用浏览器硬件加速后重新加载，或先查看资料与分镜。${error?.message?'（'+error.message+'）':''}`;document.querySelectorAll('main button').forEach(b=>{if(!b.closest('#error'))b.disabled=true;});}
for(const [id,content] of [['show-model',false],['show-content',true]])listen(document.getElementById(id),'click',()=>{document.body.classList.toggle('content-view',content);document.getElementById('show-model').setAttribute('aria-pressed',String(!content));document.getElementById('show-content').setAttribute('aria-pressed',String(content));});
updateUI();
const teaching=createTeachingUI({container:document.getElementById('teaching-panel'),onStation:choose,reducedMotion:media.matches});
try{
 model=createModel(contract);scene=createScene($('scene'),model);
 chipUI=createChipUI({container:document.getElementById('chip-inspector'),onSelect:index=>model.selectRegion(index)});
 scene.onRegionSelect(index=>{chipUI.select(index);if(matchMedia('(max-width:850px)').matches)document.getElementById('show-content').click();});
 document.querySelectorAll('[data-station]').forEach(b=>listen(b,'click',()=>choose(Number(b.dataset.station))));
 document.querySelectorAll('[data-view]').forEach(b=>listen(b,'click',()=>{
  scene.focus(state.station,b.dataset.view);document.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('view-label').textContent=b.textContent+'观察';
 }));
 listen($('next'),'click',()=>choose(state.station+1));listen($('previous'),'click',()=>choose(state.station-1));listen($('reset'),'click',reset);
 listen(media,'change',()=>{teaching.setReducedMotion(media.matches);state={...state,reducedMotion:media.matches};state=selectStation(state,state.station);lastTime=null;});
 listen(document,'visibilitychange',()=>{teaching.pause();lastTime=null;if(!document.hidden&&!disposed&&!raf)raf=requestAnimationFrame(frame);});
 listen($('scene'),'webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;showError(new Error('图形上下文已丢失'));});
 function frame(time){raf=0;if(disposed||document.hidden){lastTime=null;return;}const dt=lastTime===null?0:(time-lastTime)/1000;lastTime=time;state=advance(state,dt);teaching.tick(dt);chipUI?.update({station:state.station,progress:state.progress,teaching:document.querySelector("main").classList.contains("teaching-mode")});
  const moving=Math.abs(state.progress-state.target)>1e-6;if(moving!==lastMoving){$('motion-status').textContent=moving?'拆解 / 复原中':'已就位';lastMoving=moving;}
  try{scene.render(state);}catch(error){showError(error);return;}
  raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);
}catch(error){scene?.dispose();if(!scene)model?.dispose();showError(error);}
listen(window,'pagehide',event=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(raf);cleanup.forEach(fn=>fn());teaching.dispose();chipUI?.dispose();scene?.dispose();});
