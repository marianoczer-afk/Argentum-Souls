const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { mkdir, writeFile, mkdtemp, symlink, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { existsSync } = require('node:fs');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { setTimeout: delay } = require('node:timers/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..'), artifacts = path.join(root, 'artifacts');
let url;
const results = [];
const started = performance.now();
let server, browser, pagesRoot;
async function ready(page){for(let i=0;i<100;i++){if(await page.evaluate(()=>!!window.ArgentumSoulsBridge))return;await delay(20);}throw Error('Application did not initialize');}
async function inspect(page) { return page.evaluate(() => structuredClone(window.__training.session)); }
async function until(page, condition, max = 120, step = 50) {
  for (let i = 0; i < max; i++) { const s = await inspect(page); if (condition(s)) return s; await page.clock.runFor(step); }
  throw new Error('Training did not reach expected state');
}
async function canvasPoint(page, x, y, click = true) {
  const b = await page.locator('#cv').boundingBox();
  if (click) await page.mouse.click(b.x + x * b.width / 1200, b.y + y * b.height / 720);
  else await page.mouse.move(b.x + x * b.width / 1200, b.y + y * b.height / 720);
}
async function capture(page, name) { return page.locator('#cv').screenshot({ path: path.join(artifacts, `${name}.png`) }); }
async function check(name, fn) {
  const t = performance.now(); await fn();
  results.push({ name, status: 'passed', duration_ms: Math.round(performance.now() - t) }); console.log('PASS', name);
}
(async () => {
  await mkdir(artifacts, { recursive: true });
  pagesRoot = await mkdtemp(path.join(tmpdir(), 'argentum-pages-'));
  for (const file of ['src', 'index.html']) await symlink(path.join(root, file), path.join(pagesRoot, file));
  await symlink(root, path.join(pagesRoot, 'Argentum-Souls'), 'dir');
  url = await new Promise((resolve,reject)=>{
    server=spawn('python3',['-u','-m','http.server','0','--bind','127.0.0.1','--directory',pagesRoot],{stdio:['ignore','pipe','pipe']});
    let output='',error='';const timer=setTimeout(()=>reject(Error('Test server startup timed out')),10000);
    server.stderr.on('data',chunk=>{error+=chunk;});
    server.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/port (\d+)/);if(match){clearTimeout(timer);resolve(`http://127.0.0.1:${match[1]}`);}});
    server.once('error',e=>{clearTimeout(timer);reject(e);});
    server.once('exit',code=>{if(!output.match(/port (\d+)/)){clearTimeout(timer);reject(Error(`Test server exited ${code}: ${error}`));}});
  });
  const executable = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath: executable, headless: true, args: ['--no-sandbox'] });
  for (const entry of ['/', '/src/']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, hasTouch: true });
    const page = await context.newPage(), errors = [], failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (!r.ok() && !r.url().endsWith('favicon.ico')) failed.push(`${r.status()} ${r.url()}`); });
    // Test-only observation: capture the real engine, never replace outcomes or game input.
    await page.route('**/training/model.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + '\nconst originalStart = Training.prototype.start; Training.prototype.start = function(...args) { const result = originalStart.apply(this,args); window.__training = this; return result; };\n' });
    });
    await page.route('**/training/render.js*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + `
const actualHero = TrainingRenderer.prototype.hero;
TrainingRenderer.prototype.hero = function(x,y,...args) {
  const ctx=this.ctx, scale=ctx.scale, rotate=ctx.rotate;
  const sample={base:{x,y},body:null,sword:null};
  ctx.scale=function(...a){scale.apply(ctx,a); if(!sample.body){const m=ctx.getTransform();sample.body={x:m.e,y:m.f,scaleY:m.d};}};
  ctx.rotate=function(a){rotate.call(ctx,a);sample.sword=a;};
  try{return actualHero.call(this,x,y,...args);}finally{ctx.scale=scale;ctx.rotate=rotate;window.__drawnHero=sample;}
};` });
    });
    await page.addInitScript(() => { let seed = 42; Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; });
    const time = new Date('2026-10-25T00:00:00Z');
    await page.clock.install({ time }); await page.clock.pauseAt(time);
    assert.equal((await page.goto(url + entry)).status(), 200);await ready(page);
    const prefix = entry === '/' ? 'root' : 'source';
    await check(`${prefix}: keyboard sword hit changes pose and rendered frame`, async () => {
      await page.locator('.mode.active').click();
      const s = await until(page, s => s.objects.some(o => o.type === 'apple'));
      const apple = s.objects.find(o => o.type === 'apple');
      await page.clock.runFor(Math.ceil((apple.x - 350) / -apple.vx * 1000));
      const before = await capture(page, `${prefix}-strength-before`);
      await page.keyboard.press(['ArrowUp', 'ArrowRight', 'ArrowDown'][apple.lane]);
      assert.ok((await inspect(page)).hits >= 1);
      await page.clock.runFor(90);
      const after = await capture(page, `${prefix}-strength-swing`);
      assert.notDeepEqual(after, before);
      assert.ok((await inspect(page)).pose?.age > 0);
      const drawn = await page.evaluate(() => window.__drawnHero);
      assert.ok(drawn.body && (Math.hypot(drawn.body.x-drawn.base.x,drawn.body.y-drawn.base.y)>3 || Math.abs(drawn.body.scaleY-1)>.1), 'canvas must draw a transformed body, not only change game state or effects');
      if (prefix === 'root') {
        for (let i = 0; i < 16; i++) {
          await page.locator('#cv').screenshot({ path: path.join(artifacts, `strength-motion-${String(i).padStart(2, '0')}.png`) });
          await page.clock.runFor(20);
        }
      }
      await page.clock.runFor(350);
      assert.equal((await inspect(page)).pose, null);
    });
    await check(`${prefix}: continuous past 30 seconds; pause, manual exit and reload preserve XP`, async () => {
      await page.clock.runFor(35000);
      const s = await inspect(page); assert.ok(s.time > 35); assert.equal(s.running, true);
      assert.equal(await page.locator('#pause').isDisabled(), false);
      await page.locator('#pause').click(); const t = (await inspect(page)).time;
      await page.clock.runFor(3000); assert.equal((await inspect(page)).time, t);
      await page.locator('#pause').click(); await page.clock.runFor(100); assert.ok((await inspect(page)).time > t);
      const progress = await page.evaluate(() => window.ArgentumSoulsBridge.exportProgress());
      assert.ok(progress.xp.str > 0 || progress.stats.str > 0);
      await page.locator('#stop').click();
      assert.match(await page.locator('#overlay').innerText(), /Sesión guardada/);
      await page.reload(); await ready(page);
      assert.deepEqual(await page.evaluate(() => window.ArgentumSoulsBridge.exportProgress()), progress);
    });
    await check(`${prefix}: mouse shield blocks incoming projectile at impact`, async () => {
      await page.locator('[data-mode="def"]').click(); await page.locator('.mode.active').click();
      const s = await until(page, s => s.objects.length > 0), o = s.objects[0];
      const distance = Math.hypot(o.x - 600, o.y - 390), speed = Math.hypot(o.vx, o.vy);
      await canvasPoint(page, 600 + (o.x - 600) / distance * 140, 390 + (o.y - 390) / distance * 140, false);
      await page.clock.runFor(Math.ceil((distance - 83) / speed * 1000));
      assert.ok((await inspect(page)).hits >= 1);
      await capture(page, `${prefix}-defense-block`); await page.locator('#stop').click();
    });
    await check(`${prefix}: real mouse shot hits target center and displays arrow`, async () => {
      await page.locator('[data-mode="acc"]').click(); await page.locator('.mode.active').click();
      const s = await until(page, s => s.objects.length > 0), target = s.objects[0];
      await canvasPoint(page, target.x, target.y);
      assert.equal((await inspect(page)).perfect, 1);
      await page.clock.runFor(60); await capture(page, `${prefix}-accuracy-shot`);
      await canvasPoint(page, 870, 465); assert.equal((await inspect(page)).combo, 0);
      await page.locator('#stop').click();
    });
    await check(`${prefix}: keyboard dodge responds to telegraphed direction and animates`, async () => {
      await page.locator('[data-mode="dodge"]').click(); await page.locator('.mode.active').click();
      const s = await until(page, s => s.objects[0]?.age > s.objects[0]?.windup * .65), cue = s.objects[0];
      await page.keyboard.press({ low: 'ArrowUp', high: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' }[cue.kind]);
      assert.equal((await inspect(page)).hits,0);
      await page.clock.runFor(100); assert.ok((await inspect(page)).pose);
      await page.clock.runFor(Math.ceil((cue.windup-cue.age)*1000));assert.equal((await inspect(page)).hits,1);
      await capture(page, `${prefix}-dodge`); await page.locator('#stop').click();
    });
    await check(`${prefix}: skull punishes input; critical requires keyboard jump and mouse strike`, async () => {
      await page.locator('[data-mode="crit"]').click(); await page.locator('.mode.active').click();
      await until(page, s => s.critical.stage === 'fake', 400);
      const misses = (await inspect(page)).misses;
      await page.keyboard.press('Space'); assert.equal((await inspect(page)).misses, misses + 1);
      await until(page, s => s.critical.stage === 'ready', 400);
      await page.keyboard.press('Space'); assert.equal((await inspect(page)).critical.stage, 'jump');
      await page.clock.runFor(430); assert.equal((await inspect(page)).critical.stage, 'air');
      await capture(page, `${prefix}-critical-air`);
      const hitsBefore=(await inspect(page)).hits;await canvasPoint(page,600,240);assert.equal((await inspect(page)).hits,hitsBefore+1);
      await page.clock.runFor(100); await capture(page, `${prefix}-critical-strike`);
      await page.locator('#stop').click();
    });
    await check(`${prefix}: view switch pauses training; arena abilities and 3/5 selection remain playable`, async () => {
      await page.locator('.mode.active').click(); await page.clock.runFor(500);
      await page.locator('[data-view="arena"]').click(); assert.equal((await inspect(page)).paused, true);
      await page.locator('[data-waves="5"]').click(); await page.locator('#fightStart').click();
      await page.locator('#skillSlash').click(); assert.equal(await page.locator('#skillSlash').isDisabled(), true);
      assert.match(await page.locator('#log').innerText(), /Infligís/);
      await page.locator('#skillShield').click(); await page.locator('#skillHeal').click();
      await page.clock.runFor(2000); assert.match(await page.locator('#arenaStatus').innerText(), /de 5/);
      await page.locator('[data-waves="3"]').click(); await page.locator('#fightStart').click();
      assert.match(await page.locator('#arenaStatus').innerText(), /de 3/);
      await page.locator('[data-view="shop"]').click();
      assert.equal(await page.locator('[data-buy]').count(), 4); assert.equal(await page.locator('[data-station]').count(), 5);
      await page.locator('[data-view="train"]').click();
      assert.equal((await inspect(page)).paused, false);
      await page.locator('#stop').click();
    });
    await page.screenshot({ path: path.join(artifacts, `${prefix}-desktop.png`), fullPage: true });
    await check(`${prefix}: mobile layout and real touch controls`, async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('[data-mode="str"]').click(); await page.locator('.mode.active').click();
      const s = await until(page, s => s.objects.some(o => o.type === 'apple'));
      const apple = s.objects.find(o => o.type === 'apple');
      await page.clock.runFor(Math.ceil((apple.x - 350) / -apple.vx * 1000));
      await page.locator(`.souls-touch [data-key="${['ArrowUp','ArrowRight','ArrowDown'][apple.lane]}"]`).tap();
      assert.equal((await inspect(page)).hits, 1);
      await page.clock.runFor(90);
      await page.screenshot({ path: path.join(artifacts, `${prefix}-mobile.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#stop').click();
    });
    assert.deepEqual(errors, [], 'no uncaught browser errors'); assert.deepEqual(failed, [], 'all application resources load');
    await context.close();
  }
  await require('./browser-cache.cjs')(browser, url, check);
  await require('./browser-regressions.cjs')(browser, url, check);
  await require('./browser-delivery-a.cjs')(browser, url, check);
  await require('./browser-delivery-a1.cjs')(browser, url, check);
  await check('GitHub Pages: application and modules load under /Argentum-Souls/', async () => {
    const page = await browser.newPage(), errors = [], failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (!r.ok() && !r.url().endsWith('favicon.ico')) failed.push(r.url()); });
    assert.equal((await page.goto(url + '/Argentum-Souls/')).status(), 200);
    assert.equal(await page.locator('[data-mode]').count(), 5);
    await page.locator('.mode.active').click(); await page.waitForTimeout(700);
    assert.equal(await page.locator('#stop').isEnabled(), true);
    await page.locator('#stop').click();
    assert.match(await page.locator('#overlay').innerText(), /Sesión guardada/);
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    await page.close();
  });
})().catch(error => {
  results.push({ name: 'browser suite', status: 'failed', error: error.stack }); console.error(error); process.exitCode = 1;
}).finally(async () => {
  await browser?.close(); server?.kill();
  if (pagesRoot) await rm(pagesRoot, { recursive: true, force: true });
  await writeFile(path.join(artifacts, 'browser-results.json'), JSON.stringify({ started_utc: new Date(Date.now() - (performance.now() - started)).toISOString(), duration_ms: Math.round(performance.now() - started), results }, null, 2));
});
