// Delegate because the teaching explanation is recreated as playback advances.
export function createDetailsKeyboard(doc=document){
 const abort=new AbortController();
 const selector='aside details, .teaching-panel details';
 const current=()=>[...doc.querySelectorAll('aside details[open], .teaching-panel details[open]')].at(-1);
 const focusables=details=>[...details.querySelectorAll('summary, a[href], button, input, select, textarea, [tabindex]')].filter(n=>!n.disabled&&n.tabIndex>=0&&n.getAttribute('aria-hidden')!=='true'&&n.getClientRects().length);
 function toggle(event){
  const details=event.target;if(!details.matches?.(selector))return;
  const summary=details.querySelector('summary');
  if(details.open){details.setAttribute('role','dialog');details.setAttribute('aria-modal','true');details.setAttribute('aria-label',summary.textContent);if(!details.contains(doc.activeElement))summary.focus({preventScroll:true});}
  else{details.removeAttribute('role');details.removeAttribute('aria-modal');details.removeAttribute('aria-label');summary.focus({preventScroll:true});}
 }
 function keydown(event){
  const details=current();if(!details)return;
  if(event.key==='Escape'){event.preventDefault();details.open=false;details.querySelector('summary').focus({preventScroll:true});return;}
  if(event.key!=='Tab')return;
  const nodes=focusables(details),first=nodes[0],last=nodes.at(-1);if(!first)return;
  if(!details.contains(doc.activeElement)||(!event.shiftKey&&doc.activeElement===last)||(event.shiftKey&&doc.activeElement===first)){
   event.preventDefault();(event.shiftKey?last:first).focus({preventScroll:true});
  }
 }
 function focusin(event){const details=current();if(details&&!details.contains(event.target))details.querySelector('summary').focus({preventScroll:true});}
 for(const [type,fn]of [['toggle',toggle],['keydown',keydown],['focusin',focusin]])doc.addEventListener(type,fn,{capture:true,signal:abort.signal});
 return {dispose(){abort.abort();}};
}
