import { build } from 'esbuild';
import { mkdir,copyFile } from 'node:fs/promises';
const out=new URL('../review/prototype/',import.meta.url);
await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css'])await copyFile(new URL('../prototype/'+name,import.meta.url),new URL(name,out));
await build({entryPoints:[new URL('../src/prototype/main.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')],bundle:true,format:'esm',outfile:new URL('app.js',out).pathname.replace(/^\/([A-Za-z]:)/,'$1'),minify:true,target:'es2022'});
console.log('P4 exhibit built → review/prototype/');
