import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
test('publication build increments version by CI run and embeds its exact commit in a standalone Pages artifact',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'souls-build-'));
 try{
  for(const name of ['src','package.json'])await cp(new URL('../'+name,import.meta.url),path.join(dir,name),{recursive:true});
  await mkdir(path.join(dir,'scripts'));await cp(new URL('../scripts/build.mjs',import.meta.url),path.join(dir,'scripts/build.mjs'));
  const metadata=async()=>{const html=await readFile(path.join(dir,'dist/index.html'),'utf8');return JSON.parse(html.match(/name="souls-build" content="([^"]+)"/)[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));};
  let first;
  for(const run of [37,38]){
   const sha=String(run%10).repeat(40);const processResult=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:dir,encoding:'utf8',env:{...process.env,GITHUB_SHA:sha,GITHUB_RUN_NUMBER:String(run)}});
   assert.equal(processResult.status,0,processResult.stderr);const info=await metadata();assert.equal(info.version,`0.3.${run}`);assert.equal(info.commit,sha);assert.equal(info.dirty,false);
   if(!first)first=info;else assert.equal(info.build,first.build,'same sources retain their content identifier');
   const html=await readFile(path.join(dir,'dist/index.html'),'utf8');
   const map=JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/)[1]);
   for(const file of ['app.js','state.js','training/model.js','training/controller.js','training/render.js'])assert.equal(map.imports['./src/'+file],'./src/'+file+'?v='+info.build);
   assert.ok(html.includes('styles.css?v='+info.build));
   assert.ok(html.includes('src="./src/app.js?v='+info.build+'"'),'module script entry itself must bypass stale cache');
   assert.ok((await readFile(path.join(dir,'dist/src/app.js'),'utf8')).includes('mountTraining'));
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
