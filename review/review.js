const $ = selector => document.querySelector(selector);
const labels = { confirmed: '史料确认', qualified: '条件说明', schematic: '教学示意', pending: '待核' };
const badge = status => `<span class="status ${status}">${labels[status]}</span>`;
const storageKey = 'deep-blue-p0-review-v1';
let data, step = 0, opinions = {};
$('.skip').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); });
function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
});
$('#preview-help').addEventListener('click', () => openDialog($('#help')));
function route() {
  const view = location.hash.slice(1), selected = ['wireframe','storyboard','references','review'].includes(view) ? view : 'wireframe';
  document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== selected; });
  document.querySelectorAll('[data-view]').forEach(link => { if (link.dataset.view === selected) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  document.title = `DEEP BLUE · P0 ${ {wireframe:'首屏线框',storyboard:'三层分镜',references:'史料参考',review:'范围与审阅'}[selected] }`;
}
window.addEventListener('hashchange', () => { route(); window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); });
route();
function sourceLinks(ids) { return `<div class="source-links">${ids.map(id => { const s=data.sources.find(s=>s.id===id); return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${id} ${s.title}">${id} ↗</a>`; }).join('')}</div>`; }
function setStep(index) {
  step = Math.max(0,Math.min(4,index)); const value=data.steps[step];
  $('#scene-illustration').src = 'assets/'+value.asset; $('#scene-illustration').alt = value.caption;
  $('#scene-caption').textContent=value.caption; $('#scene-focus').textContent=value.focus;
  $('#lesson-count').textContent=`STEP ${String(step+1).padStart(2,'0')} / 05`;
  $('#lesson-title').textContent=value.title; $('#lesson-do').textContent=value.do; $('#lesson-watch').textContent='看哪里：'+value.watch;
  $('#lesson-meaning').textContent=value.meaning; $('#lesson-next').textContent=value.action; $('#lesson-previous').disabled=step===0;
  $('#lesson-explanation').open=false;
  document.querySelectorAll('[data-step]').forEach(button=>{if(Number(button.dataset.step)===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  document.querySelectorAll('[data-layer]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.layer===value.layer)));
}
function factDetail(claim) { return `${badge(claim.status)}<p>${claim.copy}</p><p><b>建模决定：</b>${claim.decision}</p><p>${claim.locator}</p>${sourceLinks(claim.sources)}`; }
function showClaim(id) { const claim=data.claims.find(c=>c.id===id); $('#fact-dialog-title').textContent=claim.subject; $('#fact-dialog-content').innerHTML=factDetail(claim); openDialog($('#fact-dialog')); }
function renderFacts(filter='all') {
  $('#fact-list').innerHTML=data.claims.filter(c=>filter==='all'||c.status===filter).map(c=>`<article class="fact-card"><h3><span class="fact-id">${c.id}</span>${c.subject}${badge(c.status)}</h3><p>${c.copy}</p><details><summary>查看建模决定与依据</summary><p>${c.decision}</p><p>${c.locator}</p>${sourceLinks(c.sources)}</details></article>`).join('');
}
function renderReferences() {
  $('#reference-board').innerHTML=[['S7','双机柜：先锁定外壳轮廓','照片可确认黑色网孔门与白色编号。尺寸、侧面和开门机构需要进一步资料。'],['S8','裸片：观察纹理与尺度感','可用于裸片视觉研究。封装、引脚和功能区坐标不能从这张图推断。']].map(([id,title,copy])=>{const s=data.sources.find(s=>s.id===id);return `<article class="reference-card"><div class="reference-image"><div class="image-fallback">在线馆藏照片<br>若未载入，请打开原始馆藏页。</div><img src="${s.image}" alt="${s.title}" loading="lazy" referrerpolicy="no-referrer"></div><div class="reference-copy">${badge('confirmed')}<h2>${title}</h2><p>${copy}</p><p>${s.author} · ${s.locator}</p><a href="${s.url}" target="_blank" rel="noopener noreferrer">${id} 打开馆藏与原图 ↗</a></div></article>`;}).join('')+`<article class="reference-card"><div class="reference-image"><img src="assets/silhouette.svg" alt="原创柜体正面与侧面比例示意"></div><div class="reference-copy">${badge('schematic')}<h2>正面、侧面与开门假设</h2><p>正面参考馆藏轮廓；侧面、尺寸和机械细节暂为假设。P1 使用统一展示单位验证运动。</p><p>本项目原创 SVG · 非实测工程图</p><a href="assets/silhouette.svg" target="_blank" rel="noopener">打开比例线框 ↗</a></div></article>`;
  $('#reference-board').querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>img.classList.add('is-failed')));
  $('#source-count').textContent=data.sources.length+' 条来源 · 核验于 '+data.verifiedAt;
  $('#source-list').innerHTML=data.sources.map(s=>`<article id="source-${s.id}" class="source-card"><h3><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.id} / ${s.title} ↗</a></h3><p>${s.author} · ${s.year} · ${s.kind}</p><p>定位：${s.locator}<br>用于：${s.use}<br>边界：${s.limit}</p></article>`).join('');
}
function saveOpinions() {
  try { localStorage.setItem(storageKey,JSON.stringify(opinions)); $('#storage-status').textContent='审阅意见已保存在本机；可导出 JSON 用于下一轮修改。'; }
  catch { $('#storage-status').textContent='浏览器未允许本机保存。请导出 JSON 保留本次意见。'; }
  const reviewed=data.decisions.filter(d=>opinions[d.id]?.status&&opinions[d.id].status!=='pending').length;
  $('#review-summary').textContent=`已审阅 ${reviewed} / ${data.decisions.length} · 阶段通过由你确认`;
}
function renderReview() {
  $('#scope-grid').innerHTML=[['P0 / NOW','当前交付',data.scope.p0],['P1 / NEXT','下一阶段',data.scope.p1],['P2 — P5','后续范围',data.scope.later]].map(([k,t,list])=>`<article class="scope-card"><span>${k}</span><h2>${t}</h2><ul>${list.map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('');
  $('#decision-form').innerHTML=data.decisions.map(d=>`<article class="decision-card"><div><h3><span class="fact-id">${d.id}</span>${d.title}</h3><p>${d.proposal}</p><p>审阅重点：${d.check}</p></div><div class="decision-fields"><label for="status-${d.id}">你的判断</label><select id="status-${d.id}" data-decision="${d.id}" data-field="status"><option value="pending">待审阅</option><option value="accepted">方向认可</option><option value="revise">需要修改</option></select><label for="note-${d.id}">修改意见</label><textarea id="note-${d.id}" data-decision="${d.id}" data-field="note" placeholder="写下你希望保留或调整的地方"></textarea></div></article>`).join('');
  try { opinions=JSON.parse(localStorage.getItem(storageKey)||'{}'); if(!opinions||typeof opinions!=='object') opinions={}; } catch { opinions={}; }
  $('#decision-form').querySelectorAll('[data-field]').forEach(input=>{input.value=opinions[input.dataset.decision]?.[input.dataset.field]||(input.dataset.field==='status'?'pending':'');input.addEventListener('input',()=>{opinions[input.dataset.decision]??={status:'pending',note:''};opinions[input.dataset.decision][input.dataset.field]=input.value;saveOpinions();});});
  const reviewed=data.decisions.filter(d=>opinions[d.id]?.status&&opinions[d.id].status!=='pending').length;
  $('#review-summary').textContent=`已审阅 ${reviewed} / ${data.decisions.length} · 阶段通过由你确认`;
}
try {
  const response=await fetch('data.json'); if(!response.ok)throw new Error('Review data unavailable'); data=await response.json();
  $('#journey-steps').innerHTML=data.steps.map((s,i)=>`<li><button data-step="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.short}</button></li>`).join('');
  $('#journey-steps').addEventListener('click',event=>{const b=event.target.closest('[data-step]');if(b)setStep(Number(b.dataset.step));});
  $('#lesson-next').addEventListener('click',()=>setStep(step===4?0:step+1));
  $('#lesson-previous').addEventListener('click',()=>setStep(step-1)); $('#lesson-reset').addEventListener('click',()=>setStep(0));
  document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>setStep({cluster:0,node:3,chip:4}[b.dataset.layer])));
  document.querySelectorAll('[data-claim]').forEach(b=>b.addEventListener('click',()=>showClaim(b.dataset.claim)));
  $('#shot-grid').innerHTML=data.shots.map(s=>`<article class="shot-card"><img src="assets/${s.asset}" alt="${s.title}构图线框" loading="lazy"><div class="shot-copy"><div class="shot-label"><span>${s.id} / ${s.layer}</span><span>COMPOSITION</span></div><h2>${s.title}</h2><dl><div><dt>镜头</dt><dd>${s.camera}</dd></div><div><dt>动作</dt><dd>${s.action}</dd></div><div><dt>问题</dt><dd>${s.question}</dd></div></dl><details><summary>P1 检查与史料边界</summary><p>${s.guard}</p><p>${s.evidence}</p></details></div></article>`).join('');
  renderReferences(); renderFacts(); renderReview(); setStep(0);
  $('#fact-filters').addEventListener('click',event=>{const b=event.target.closest('[data-filter]');if(!b)return;$('#fact-filters').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderFacts(b.dataset.filter);});
  $('#export-review').addEventListener('click',()=>{const payload={project:'Deep Blue',phase:'P0',version:data.version,exportedAt:new Date().toISOString(),stageApproval:'由用户另行确认',decisions:data.decisions.map(d=>({id:d.id,title:d.title,status:opinions[d.id]?.status||'pending',note:opinions[d.id]?.note||''}))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='deep-blue-p0-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  document.body.dataset.ready='true';
} catch(error) { $('#load-error').hidden=false; console.error(error); }
