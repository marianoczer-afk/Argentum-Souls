import { readFile, writeFile, readdir, mkdir, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
const source=await readFile(new URL('src/index.html',root),'utf8');
const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const hash=createHash('sha256'), modules=[];
hash.update(await readFile(new URL('scripts/build.mjs',root))); // Asset addressing is part of the release identity.
async function digest(dir){for(const item of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=new URL(item.name+(item.isDirectory()?'/':''),dir);hash.update(item.name);if(item.isDirectory())await digest(file);else {hash.update(await readFile(file));if(item.name.endsWith('.js'))modules.push('./'+file.pathname.slice(new URL('src/',root).pathname.length));}}}
await digest(new URL('src/',root));const build=hash.digest('hex').slice(0,12);
let commit='sin-git',dirty=true;
try{commit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();dirty=!process.env.GITHUB_SHA&&!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim();}catch{}
const version=process.env.GITHUB_RUN_NUMBER?`${pkg.version.split('.').slice(0,2).join('.')}.${process.env.GITHUB_RUN_NUMBER}`:`${pkg.version}-dev.${build.slice(0,7)}`;
const info={version,commit,build,dirty};
if(!source.includes('name="souls-build" content=""'))throw new Error('Missing build metadata placeholder');
const encoded=JSON.stringify(info).replaceAll('&','&amp;').replaceAll('"','&quot;');
// Resolve every module (including transitive imports) to this source version.
// A fresh HTML document must never reuse a previous release's module graph.
const imports=Object.fromEntries(modules.map(file=>['./src/'+file.slice(2),'./src/'+file.slice(2)+'?v='+build]));
const importMap='<script type="importmap">'+JSON.stringify({imports})+'</script>';
const output=source.replace('name="souls-build" content=""','name="souls-build" content="'+encoded+'"').replace('href="./styles.css"','href="./src/styles.css?v='+build+'"').replace('src="./app.js"','src="./src/app.js?v='+build+'"').replace('</head>',importMap+'</head>');
await writeFile(new URL('index.html',root),output);
await mkdir(new URL('dist/',root),{recursive:true});await cp(new URL('src/',root),new URL('dist/src/',root),{recursive:true});await writeFile(new URL('dist/index.html',root),output);
await writeFile(new URL('dist/.nojekyll',root),'');
console.log(`Built A.3.2 · Laboratorio experimental ${version} · commit ${commit.slice(0,7)}${dirty?'+local':''} · ${build}`);
