import {CHIP_FUNCTIONS} from './chip-functions.js';
export function createChipUI({container,onSelect}){
 const abort=new AbortController();let selected=null,visible=false,lastKey=null;
 const title=document.createElement('h2');title.textContent='芯片里的四种分工';
 const note=document.createElement('p');
 const nav=document.createElement('div');nav.className='chip-functions';
 const detail=document.createElement('div');detail.className='chip-function-detail';detail.setAttribute('aria-live','polite');
 const warning=document.createElement('p');warning.className='chip-warning';warning.textContent='置换表属于软件搜索层，不是这里的硬件功能区。';
 const source=document.createElement('a');source.href='/#references';source.textContent='查阅 S1 / S2 史料索引 ↗';
 const buttons=CHIP_FUNCTIONS.map((f,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`0${i+1} ${f.title}`;b.addEventListener('click',()=>select(i),{signal:abort.signal});nav.append(b);return b;});
 container.append(title,note,nav,detail,warning,source);
 function select(index){selected=Number.isInteger(index)&&index>=0&&index<4?index:null;onSelect(selected);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));detail.replaceChildren();if(selected===null){detail.textContent='选择一个功能区，查看它的输入与输出。';return;}const f=CHIP_FUNCTIONS[selected];for(const [label,value] of [['输入',f.input],['处理',f.action],['输出',f.output],['示例',f.example],['依据',f.source]]){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+' / ';p.append(strong,document.createTextNode(value));detail.append(p);}}
 select(null);
 return {select,update({station,progress,teaching}){const show=station===3&&!teaching;const key=`${show}/${progress>=5.999}`;if(key===lastKey)return;lastKey=key;container.hidden=!show;document.getElementById('controls').classList.toggle('micro-controls',show);if(show!==visible){visible=show;if(!show)select(null);}buttons.forEach(b=>b.disabled=progress<5.999);if(show)note.textContent=progress<5.999?'正在放大，功能区就位后可选择。':'放大功能示意，非实际版图。点击色块或下方按钮。';},dispose(){abort.abort();container.replaceChildren();}};
}
