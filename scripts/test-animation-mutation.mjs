import { mkdtemp, cp, symlink, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const dir = await mkdtemp(path.join(tmpdir(), 'souls-animation-mutation-'));
const results = [];
try {
  for (const name of ['src', 'tests', 'package.json', 'index.html']) await cp(path.join(root,name),path.join(dir,name),{recursive:true});
  await symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
  const target=path.join(dir,'src/training/render.js'), source=await readFile(target,'utf8');
  assert.ok(source.includes('t = heroTransform(pose)'));
  await writeFile(target,source.replace('t = heroTransform(pose)','t = heroTransform(null)'));
  for (const [name,args,expected] of [
    ['unit',['--test','--test-name-pattern=hero\\(\\)','tests/model.test.mjs'],'rendered jump must move the body upward'],
    ['Chromium',['tests/browser.cjs'],'canvas must draw a transformed body'],
  ]) {
    const started=performance.now();
    const run=spawnSync(process.execPath,args,{cwd:dir,encoding:'utf8',timeout:90000});
    assert.equal(run.error,undefined,`${name} must execute, not time out`);
    assert.equal(run.status,1,`${name} must reject the deliberately broken animation`);
    assert.ok((run.stdout+run.stderr).includes(expected),`${name} must fail on body motion, not an unrelated error:\n${run.stdout}${run.stderr}`);
    results.push({name,expected_failure:true,exit_code:run.status,duration_ms:Math.round(performance.now()-started),assertion:expected});
    console.log(`PASS ${name}: ignored hero pose was rejected by the new assertion`);
  }
} finally { await rm(dir,{recursive:true,force:true}); }
await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/animation-mutation.json'),JSON.stringify(results,null,2));
