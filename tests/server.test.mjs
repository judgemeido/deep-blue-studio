import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewServer } from '../scripts/serve.mjs';
test('P0 and prototype resources resolve, encoded traversal stays forbidden',async()=>{
 const server=createReviewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
 for(const [path,type] of [['/','text/html'],['/prototype/','text/html'],['/prototype/app.js','javascript'],['/prototype/style.css','text/css']]){
  const res=await fetch(base+path);assert.equal(res.status,200,path);assert.ok(res.headers.get('content-type').includes(type));
 }
 assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
 assert.equal((await fetch(base+'/.git/config')).status,403);
 assert.equal((await fetch(base+'/missing')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
