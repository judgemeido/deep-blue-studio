import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const root = new URL('../',import.meta.url);
const data=JSON.parse(await readFile(new URL('review/data.json',root),'utf8'));
const contract=JSON.parse(await readFile(new URL('docs/MODEL_CONTRACT.json',root),'utf8'));
const sourceIds=new Set(data.sources.map(s=>s.id));
assert.equal(sourceIds.size,data.sources.length,'Source IDs must be unique');
for(const s of data.sources){assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.locator&&s.limit&&s.use);}
for(const c of data.claims){assert.ok(['confirmed','qualified','schematic','pending'].includes(c.status));assert.ok(c.decision);if(['confirmed','qualified'].includes(c.status))assert.ok(c.sources.length>0);for(const id of c.sources)assert.ok(sourceIds.has(id),`${c.id}: unknown source ${id}`);}
const cfg=Object.fromEntries(Object.entries(contract.configuration).map(([k,v])=>[k,v.value]));
assert.equal(cfg.searchNodeCount*cfg.cardsPerNode*cfg.chipsPerCard,cfg.chessChipCount,'Chip total must match node/card hierarchy');
assert.equal(cfg.cpusPerNode,1);assert.equal(cfg.cardsPerNode,2);assert.equal(cfg.chipsPerCard,8);
const completed=new Set();for(const action of contract.motionSequence){for(const dependency of action.dependsOn)assert.ok(completed.has(dependency),`Motion dependency ${dependency} must precede ${action.id}`);completed.add(action.id);}
assert.equal(data.steps.length,5);assert.equal(data.shots.length,6);
for(const item of [...data.steps,...data.shots])await access(new URL('review/assets/'+item.asset,root));
for(const s of data.shots)assert.ok(s.camera&&s.action&&s.question&&s.guard&&s.evidence);
const docs=['README.md','docs/PROJECT_PLAN.md','docs/P0_REVIEW_GUIDE.md','docs/FACTS_AND_REFERENCES.md','docs/STORYBOARD.md','docs/P0_ACCEPTANCE.md'];for(const path of docs)await access(new URL(path,root));
const html=await readFile(new URL('review/index.html',root),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const value=match[1];if(!/^(https?:|data:)/.test(value))await access(new URL('review/'+value,root));}
console.log(`PASS: ${data.claims.length} claims / ${data.sources.length} sources / ${data.steps.length} teaching steps / ${data.shots.length} shots; configuration, motion dependencies, documents and local assets verified.`);
