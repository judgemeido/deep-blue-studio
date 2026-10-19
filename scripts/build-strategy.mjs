import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url); const out = new URL('review/strategy/', root);
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'style.css']) await copyFile(new URL(`strategy/${name}`, root), new URL(name, out));
await build({ entryPoints: [new URL('../src/strategy/main.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')], bundle: true, format: 'esm', outfile: new URL('app.js', out).pathname.replace(/^\/([A-Za-z]:)/, '$1'), minify: true, target: 'es2022' });
console.log('02 algorithm archive built → review/strategy/');
