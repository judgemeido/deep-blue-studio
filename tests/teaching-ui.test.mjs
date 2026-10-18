import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeachingUI} from '../src/teaching/teaching-ui.js';

// Minimal DOM for testing the real teaching UI's redraw lifecycle without a browser dependency.
class Element {
 constructor(tag, doc) { this.tagName=tag; this.doc=doc; this.children=[]; this.listeners={}; this.open=false; this.classList={toggle(){}}; }
 set textContent(value) { this.text=value; }
 get textContent() { return this.text ?? this.children.map(n=>n.textContent).join(''); }
 append(...nodes) { this.children.push(...nodes); }
 replaceChildren(...nodes) { this.children=nodes; }
 setAttribute() {}
 addEventListener(name, fn) { this.listeners[name]=fn; }
 click() { this.listeners.click?.(); }
 focus() { this.doc.activeElement=this; }
 contains(node) { return this===node || this.children.some(n=>n.contains(node)); }
 querySelectorAll(tag) { return this.children.flatMap(n=>[...(n.tagName===tag?[n]:[]),...n.querySelectorAll(tag)]); }
 querySelector(tag) { return this.querySelectorAll(tag)[0] ?? null; }
}
test('advanced explanation stays open through stepping and playback redraws',()=>{
 const previous=globalThis.document;
 const doc={activeElement:null};
 doc.createElement=tag=>new Element(tag,doc);
 doc.createElementNS=(_,tag)=>doc.createElement(tag);
 const ids=Object.fromEntries(['teaching-toggle','show-content','show-model'].map(id=>[id,doc.createElement('button')]));
 const main=doc.createElement('main'); doc.body=doc.createElement('body');
 doc.getElementById=id=>ids[id]; doc.querySelector=()=>main;
 globalThis.document=doc;
 let ui;
 try {
  const container=doc.createElement('section');
  ui=createTeachingUI({container,onStation(){}});
  ids['teaching-toggle'].click();
  const click=label=>{const b=container.querySelectorAll('button').find(n=>n.textContent===label);assert.ok(b,label);b.click();};
  click('教学下一步 →');
  container.querySelector('details').open=true;
  click('单步访问');
  assert.equal(container.querySelector('details').open,true,'step must preserve expanded explanation');
  container.querySelector('summary').focus();
  ui.pause();
  assert.equal(doc.activeElement,container.querySelector('summary'),'redraw must restore explanation focus');
  click('播放');
  for(let i=0;i<15;i++)ui.tick(.05);
  assert.equal(container.querySelector('details').open,true,'playback must preserve expanded explanation');
  container.querySelector('details').open=false;
  click('暂停');
  assert.equal(container.querySelector('details').open,false,'user collapse must also persist');
 } finally { ui?.dispose();globalThis.document=previous; }
});

for (const explore of [true,false]) test(explore?'chip exploration leaves teaching directly at chip station with content visible':'ordinary completion still returns to whole machine',()=>{
 const previous=globalThis.document;
 const doc={activeElement:null};
 doc.createElement=tag=>new Element(tag,doc);doc.createElementNS=(_,tag)=>doc.createElement(tag);
 const ids=Object.fromEntries(['teaching-toggle','show-content','show-model','controls'].map(id=>[id,doc.createElement('button')]));
 const main=doc.createElement('main');doc.body=doc.createElement('body');
 const classes=new Map();main.classList.toggle=(key,value)=>classes.set(key,value);doc.body.classList.toggle=(key,value)=>classes.set(key,value);
 const attrs=new Map();for(const [id,n]of Object.entries(ids))n.setAttribute=(key,value)=>attrs.set(`${id}/${key}`,value);
 doc.getElementById=id=>ids[id];doc.querySelector=()=>main;globalThis.document=doc;
 let ui;const stations=[];
 try{
  const container=doc.createElement('section');ui=createTeachingUI({container,onStation:index=>stations.push(index)});
  ids['teaching-toggle'].click();
  const click=label=>{const b=container.querySelectorAll('button').find(n=>n.textContent===label);assert.ok(b,label);b.click();};
  click('5 进入芯片');stations.length=0;
  click(explore?'探索芯片四种分工':'完成教学，返回自由观察');
  assert.deepEqual(stations,[explore?3:0],'no intermediate whole-machine request');
  assert.equal(container.hidden,true);assert.equal(classes.get('teaching-mode'),false);
  assert.equal(classes.get('content-view'),explore);
  assert.equal(attrs.get('show-content/aria-pressed'),String(explore));
  assert.equal(attrs.get('teaching-toggle/aria-expanded'),'false');
  if(explore)assert.equal(doc.activeElement,ids.controls,'focus must leave hidden teaching panel');
 }finally{ui?.dispose();globalThis.document=previous;}
});
