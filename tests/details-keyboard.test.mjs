import test from 'node:test';
import assert from 'node:assert/strict';
import {createDetailsKeyboard} from '../src/prototype/details-keyboard.js';
function fixture(){
 const listeners={};const doc={activeElement:null,addEventListener(type,fn){listeners[type]=fn;}};
 const make=()=>({focus(){doc.activeElement=this;},getClientRects(){return [1];},closest(){return details;},getAttribute(){return null;},tabIndex:0});
 const summary=make(),link=make();
 const attrs=new Map();
 const details={open:true,querySelector:()=>summary,querySelectorAll:()=>[summary,link],contains:n=>n===summary||n===link,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),closest(){return this;},matches:()=>true};
 doc.querySelectorAll=()=>details.open?[details]:[];
 const ui=createDetailsKeyboard(doc);
 return {doc,details,summary,link,attrs,ui,emit(type,event){listeners[type](event);}};
}
test('opening focuses summary, Tab cycles, Escape closes and returns focus',()=>{
 const f=fixture();f.emit('toggle',{target:f.details});assert.equal(f.doc.activeElement,f.summary);
 assert.equal(f.attrs.get('aria-modal'),'true');
 let prevented=false;f.link.focus();f.emit('keydown',{key:'Tab',shiftKey:false,preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(f.doc.activeElement,f.summary);
 f.emit('keydown',{key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(f.doc.activeElement,f.link);
 f.emit('keydown',{key:'Escape',preventDefault(){}});assert.equal(f.details.open,false);assert.equal(f.doc.activeElement,f.summary);
 f.emit('toggle',{target:f.details});assert.equal(f.attrs.has('aria-modal'),false);
 f.ui.dispose();
});
test('focus cannot escape open explanation and collapsed details do not trap keys',()=>{
 const f=fixture();f.emit('toggle',{target:f.details});
 f.doc.activeElement={};f.emit('focusin',{target:f.doc.activeElement});assert.equal(f.doc.activeElement,f.summary);
 f.details.open=false;let prevented=false;f.emit('keydown',{key:'Tab',preventDefault(){prevented=true;}});assert.equal(prevented,false);
 f.ui.dispose();
});
