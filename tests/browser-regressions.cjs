const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
async function ready(p){for(let i=0;i<100;i++){if(await p.evaluate(()=>!!window.ArgentumSoulsBridge))return;await delay(20);}throw Error('Application did not initialize');}
const KEY = 'argentum_souls_fiel_v2';
module.exports = async function regressions(browser, url, check) {
  async function context(init) {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 1000 }, hasTouch: true });
    await ctx.route('**/training/model.js*', async route => {
      const r = await route.fetch(); await route.fulfill({ response: r, body: await r.text() + '\nconst start=Training.prototype.start;Training.prototype.start=function(...a){const s=start.apply(this,a);window.__training=this;return s;};' });
    });
    if (init) await ctx.addInitScript(init);
    return ctx;
  }
  async function page(ctx) {
    const p = await ctx.newPage(); p.auditErrors = []; p.on('pageerror', e => p.auditErrors.push(e.message));
    const time = new Date('2026-10-25T00:00:00Z'); await p.clock.install({ time }); await p.clock.pauseAt(time);
    await p.goto(url); await ready(p); await p.locator('[data-mode="str"]').waitFor(); return p;
  }
  const session = p => p.evaluate(() => structuredClone(window.__training.session));
  const progress = p => p.evaluate(() => window.ArgentumSoulsBridge.exportProgress());
  const stored = p => p.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
  async function waitStatus(p, status) {
    for (let i = 0; i < 100; i++) {
      if (await p.locator('#saveStatus').getAttribute('data-status') === status) return;
      await delay(20); // Native Web Locks handoff is independent of the test clock.
    }
    assert.fail(`Save session did not become ${status}`);
  }
  async function until(p, predicate, limit = 400) {
    for (let i = 0; i < limit; i++) { const s = await session(p); if(predicate(s))return s;if(s.recovery)await p.keyboard.press('Enter'); await p.clock.runFor(50); }
    assert.fail('Missing cue or target');
  }
  async function start(p, mode, touch = false) {
    await p.locator(`[data-mode="${mode}"]`)[touch ? 'tap' : 'click']();
    await p.locator('.mode.active')[touch ? 'tap' : 'click']();
  }
  async function screenPoint(p, x, y) {
    const b=await p.locator('#cv').boundingBox(),v=await p.locator('#cv').evaluate(c=>({w:c.width,h:c.height}));return{x:b.x+(x+(v.w-1200)/2)*b.width/v.w,y:b.y+y*b.height/v.h};
  }
  async function precisionHit(p, touch = false) {
    await start(p, 'acc', touch);
    const s = await until(p, s => s.objects.length > 0), o = s.objects[0], q = await screenPoint(p, o.x, o.y);
    await p[touch ? 'touchscreen' : 'mouse'][touch ? 'tap' : 'click'](q.x, q.y);
    assert.equal((await session(p)).perfect, 1); return progress(p);
  }
  const seed = () => {
    if (!localStorage.getItem('argentum_souls_fiel_v2')) localStorage.setItem('argentum_souls_fiel_v2', '{"coins":200}');
    localStorage.setItem('audit_unrelated_v7_sentinel', 'untouched');
  };
  for (const order of ['writer-first', 'waiter-first']) await check(`two real tabs: ${order}, stale actions, handoff, close and reopen`, async () => {
    const ctx = await context(seed);
    try {
      const a = await page(ctx), b = await page(ctx);
      await waitStatus(a, 'saved'); await waitStatus(b, 'readonly');
      assert.equal(await b.locator('#pause').isDisabled(), true);
      const earned = await precisionHit(a); assert.equal(earned.xp.acc, 3);
      await a.locator('#stop').click(); await a.locator('[data-view="shop"]').click();
      await a.locator('[data-buy="sword"]').click();
      const expected = await stored(a); assert.equal(expected.coins, 165); assert.equal(expected.gear.sword, 1);
      const stale = await progress(b);
      // Force handlers as well as testing disabled UI: every mutating path must gate ownership.
      await b.locator('#pause').dispatchEvent('click');
      await b.locator('[data-view="shop"]').click();
      await b.locator('[data-buy="sword"]').dispatchEvent('click');
      await b.locator('[data-station="str"]').dispatchEvent('click');
      await b.locator('[data-view="arena"]').click(); await b.locator('#fightStart').dispatchEvent('click');
      await b.locator('#skillSlash').dispatchEvent('click');
      await b.locator('#saveStatus button').dispatchEvent('click');
      await b.evaluate(() => window.dispatchEvent(new Event('blur')));
      assert.deepEqual(await progress(b), stale); assert.deepEqual(await stored(b), expected);
      let final = expected;
      if (order === 'writer-first') {
        await a.close(); await waitStatus(b, 'saved');
        assert.deepEqual(await progress(b), expected, 'handoff must reload latest XP, gold and equipment');
        await b.locator('[data-view="train"]').click(); await precisionHit(b);
        await b.locator('#stop').click(); final = await progress(b); assert.equal(final.xp.acc, 6);
        await b.close();
      } else { await b.close(); await a.close(); }
      const c = await page(ctx); await waitStatus(c, 'saved');
      assert.deepEqual(await progress(c), final);
      assert.equal(await c.evaluate(() => localStorage.getItem('audit_unrelated_v7_sentinel')), 'untouched');
      assert.deepEqual(c.auditErrors, []); await c.close();
    } finally { await ctx.close(); }
  });
  await check('blocked localStorage property: playable memory session, accurate exit, reload warning', async () => {
    const ctx = await context(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
    try {
      const p = await page(ctx); await waitStatus(p, 'memory');
      assert.match(await p.locator('#saveStatus').innerText(), /No se conservará al cerrar/);
      assert.equal((await precisionHit(p)).xp.acc, 3);
      await p.locator('#stop').click(); assert.equal(await p.locator('#overlay h3').innerText(), 'Progreso solo en memoria');
      assert.doesNotMatch(await p.locator('#overlay').innerText(), /Sesión guardada/);
      await p.reload(); await ready(p); assert.equal((await progress(p)).xp.acc, 0); assert.deepEqual(p.auditErrors, []);
    } finally { await ctx.close(); }
  });
  await check('no Web Locks: read existing save, play only in memory, never overwrite durable data', async () => {
    const ctx = await context(() => {
      Object.defineProperty(navigator, 'locks', { value: undefined });
      if (!localStorage.getItem('argentum_souls_fiel_v2')) localStorage.setItem('argentum_souls_fiel_v2', '{"coins":40,"xp":{"acc":2}}');
    });
    try {
      const p = await page(ctx); await waitStatus(p, 'memory'); const before = await stored(p);
      assert.equal((await precisionHit(p)).xp.acc, 5); await p.locator('#stop').click();
      assert.deepEqual(await stored(p), before); await p.reload(); await ready(p); assert.equal((await progress(p)).xp.acc, 2);
      assert.deepEqual(p.auditErrors, []);
    } finally { await ctx.close(); }
  });
  await check('quota exceeded: no false save confirmation; retry persists XP and survives reopen', async () => {
    const ctx = await context(() => {
      window.quotaFull = true; const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (window.quotaFull && key === 'argentum_souls_fiel_v2') throw new DOMException('Full', 'QuotaExceededError');
        return set.call(this, key, value);
      };
    });
    try {
      const p = await page(ctx); assert.equal((await precisionHit(p)).xp.acc, 3);
      await p.locator('#stop').click(); await waitStatus(p, 'error');
      assert.equal(await p.locator('#overlay h3').innerText(), 'No se pudo guardar');
      assert.match(await p.locator('#saveStatus').innerText(), /Reintentar/); assert.equal(await stored(p), null);
      await p.locator('#saveStatus button').click(); assert.equal(await p.locator('#overlay h3').innerText(), 'No se pudo guardar');
      await p.evaluate(() => { window.quotaFull = false; }); await p.locator('#saveStatus button').click();
      await waitStatus(p, 'saved'); assert.equal(await p.locator('#overlay h3').innerText(), 'Sesión guardada');
      assert.equal((await stored(p)).xp.acc, 3); await p.close();
      const reopened = await page(ctx); assert.equal((await progress(reopened)).xp.acc, 3); assert.deepEqual(reopened.auditErrors, []);
    } finally { await ctx.close(); }
  });
  await check('touch defense: native drag orients shield and blocks for XP at impact', async () => {
    const ctx = await context();
    try {
      const p = await page(ctx); await start(p, 'def', true);
      const s = await until(p, s => s.objects.length > 0), o = s.objects[0];
      const distance = Math.hypot(o.x-600,o.y-390), speed = Math.hypot(o.vx,o.vy);
      const center = await screenPoint(p,600,390), aim = await screenPoint(p,600+(o.x-600)/distance*140,390+(o.y-390)/distance*140);
      const cdp = await ctx.newCDPSession(p);
      await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[center] });
      await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[aim] });
      await p.clock.runFor(Math.ceil((distance-83)/speed*1000));
      await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
      assert.equal((await session(p)).hits,1); assert.ok((await progress(p)).xp.def>0);
      await p.locator('#stop').tap(); assert.equal((await stored(p)).xp.def,(await progress(p)).xp.def); assert.deepEqual(p.auditErrors,[]);
    } finally { await ctx.close(); }
  });
  await check('touch precision: center earns XP once; second tap misses and resets combo', async () => {
    const ctx = await context();
    try {
      const p = await page(ctx); const earned = await precisionHit(p,true);
      const location = await p.evaluate(() => window.__training.pointer), q = await screenPoint(p,location.x,location.y);
      await p.touchscreen.tap(q.x,q.y);
      const s = await session(p); assert.equal(s.hits,1); assert.equal(s.combo,0); assert.equal(s.misses,1);
      assert.deepEqual(await progress(p),earned); await p.locator('#stop').tap(); assert.equal((await stored(p)).xp.acc,3);
    } finally { await ctx.close(); }
  });
  await check('touch critical: full jump/air strike, no repeat reward, skull breaks combo', async () => {
    const ctx = await context();
    try {
      const p = await page(ctx); await start(p,'crit',true);
      await until(p,s=>s.critical.stage==='ready'); await p.touchscreen.tap(...Object.values(await screenPoint(p,600,260)));
      assert.equal((await session(p)).critical.stage,'jump'); await p.clock.runFor(430);
      assert.equal((await session(p)).critical.stage,'air');const priorHits=(await session(p)).hits; const q=await screenPoint(p,600,230);
      await p.touchscreen.tap(q.x,q.y); assert.equal((await session(p)).hits,priorHits+1);assert.ok((await session(p)).combo>=1);
      const earned=await progress(p); assert.ok(earned.xp.crit>0);
      await p.touchscreen.tap(q.x,q.y);assert.equal((await session(p)).hits,priorHits+1);assert.deepEqual(await progress(p),earned);
      await until(p,s=>s.critical.stage==='fake');const beforeFake=await progress(p); const misses=(await session(p)).misses;
      await p.touchscreen.tap(q.x,q.y); assert.equal((await session(p)).combo,0); assert.equal((await session(p)).misses,misses+1);
      assert.deepEqual(await progress(p),beforeFake);await p.locator('#stop').tap();assert.deepEqual(await stored(p),beforeFake);
    } finally { await ctx.close(); }
  });
  await check('touch dodge: correct directional response earns XP', async () => {
    const ctx = await context();
    try {
      const p=await page(ctx);await start(p,'dodge',true);
      const s=await until(p,s=>s.objects[0]?.age>s.objects[0]?.windup*.65);
      const key={low:'ArrowUp',high:'ArrowDown',mid:'ArrowLeft'}[s.objects[0].kind];
      const z=await screenPoint(p,...(key==='ArrowUp'?[550,320]:key==='ArrowDown'?[550,620]:[370,465]));await p.touchscreen.tap(z.x,z.y);assert.equal((await session(p)).hits,0);
      await p.clock.runFor(Math.ceil((s.objects[0].windup-s.objects[0].age+.16)*1000));assert.equal((await session(p)).hits,1);
      assert.ok((await progress(p)).xp.dodge>0);await p.locator('#stop').tap();assert.deepEqual(p.auditErrors,[]);
    }finally{await ctx.close();}
  });
  await check('hit saves immediately without rebuilding the hidden shop', async () => {
    const ctx=await context();
    try{
      const p=await page(ctx);
      await p.evaluate(()=>{window.shopObserver=new MutationObserver(()=>{});window.shopObserver.observe(document.querySelector('#shopList'),{childList:true});window.shopRecords=[];window.shopObserver.disconnect();window.shopObserver=new MutationObserver(r=>window.shopRecords.push(...r));window.shopObserver.observe(document.querySelector('#shopList'),{childList:true});});
      const earned=await precisionHit(p);
      assert.equal((await stored(p)).xp.acc,earned.xp.acc,'XP is durable before the session exits');
      assert.equal(await p.evaluate(()=>window.shopRecords.length+window.shopObserver.takeRecords().length),0);
      await p.locator('#stop').click();
    }finally{await ctx.close();}
  });
};
