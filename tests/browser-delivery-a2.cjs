const assert=require('node:assert/strict'),path=require('node:path');
const {setTimeout:delay}=require('node:timers/promises');
async function ready(page){for(let i=0;i<150;i++){if(await page.evaluate(()=>!!window.ArgentumSoulsBridge))return;await delay(20);}throw Error('Application did not initialize');}
module.exports=async(browser,url,check)=>{
 const ctx=await browser.newContext({viewport:{width:1366,height:768},hasTouch:true,isMobile:true});
 await ctx.route('**/training/model.js*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\nconst start=Training.prototype.start;Training.prototype.start=function(...a){const s=start.apply(this,a);window.__training=this;return s;};'});});
 await ctx.route('**/training/render.js*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+`
const realCircle=TrainingRenderer.prototype.circle,realLabel=TrainingRenderer.prototype.label;
TrainingRenderer.prototype.circle=function(x,y,r,fill,stroke){if((x===990||x===760)&&y===270&&r===40)window.__signal={x,y,r,fill,stroke};return realCircle.call(this,x,y,r,fill,stroke)};
TrainingRenderer.prototype.label=function(text,x,y,...rest){if((x===990||x===760)&&y===283)window.__signalSymbol=text;return realLabel.call(this,text,x,y,...rest)};
const drawDummy=TrainingRenderer.prototype.dummy;
TrainingRenderer.prototype.dummy=function(x,y,s,m){const c=this.ctx,translate=c.translate,lineTo=c.lineTo;const calls=[];c.translate=function(...a){calls.push(['translate',...a]);return translate.apply(c,a)};c.lineTo=function(...a){calls.push(['lineTo',...a]);return lineTo.apply(c,a)};try{return drawDummy.call(this,x,y,s,m)}finally{c.translate=translate;c.lineTo=lineTo;if(m)window.__dummyFrame={kind:s.objects[0].kind,calls};}};
`});});
 await ctx.addInitScript(()=>{window.__tones=[];const C=window.AudioContext;window.AudioContext=class extends C{createOscillator(){const n=super.createOscillator(),set=n.frequency.setValueAtTime.bind(n.frequency);n.frequency.setValueAtTime=(v,t)=>{window.__tones.push(v);return set(v,t)};return n;}};let seed=9871;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};window.__inputs=[];document.addEventListener('pointerdown',e=>window.__inputs.push({type:e.pointerType,x:e.clientX,y:e.clientY}));});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const now=new Date('2026-10-25T00:00:00Z');await p.clock.install({time:now});await p.clock.pauseAt(now);await p.goto(url+'/Argentum-Souls/');await ready(p);
 const s=()=>p.evaluate(()=>structuredClone(window.__training.session)),progress=()=>p.evaluate(()=>window.ArgentumSoulsBridge.exportProgress());
 const mode=async m=>p.locator(`[data-mode="${m}"]`).click();
 const point=async(x,y)=>{const b=await p.locator('#cv').boundingBox(),v=await p.locator('#cv').evaluate(c=>({w:c.width,h:c.height}));return{x:b.x+(x+(v.w-1200)/2)*b.width/v.w,y:b.y+y*b.height/v.h};};
 const tap=async(x,y)=>{const q=await point(x,y);await p.touchscreen.tap(q.x,q.y);};
 const until=async(fn,max=600,step=20)=>{for(let i=0;i<max;i++){const state=await s();if(fn(state))return state;await p.clock.runFor(step);}throw Error('State not reached');};
 const screenshot=async name=>{await p.clock.runFor(20);await p.screenshot({path:path.join(__dirname,'../artifacts',`delivery-a2-${name}.png`),fullPage:true});};
 const fixture=async setup=>p.evaluate(setup);
 try{
 await check('A.2 touch: three evasions use scene zones, white ring is scored Perfect and no gesture scrolls',async()=>{
  await p.setViewportSize({width:390,height:844});const kinds=new Set();
  for(let i=0;i<12&&kinds.size<3;i++){
   await mode('dodge');const state=await until(s=>s.objects[0]?.age>=s.objects[0]?.windup+.01),cue=state.objects[0];kinds.add(cue.kind);
   assert.equal(await p.locator('#cueBanner').isVisible(),false);
   const before=await p.evaluate(()=>scrollY);await tap(...(cue.kind==='low'?[550,320]:cue.kind==='high'?[550,620]:[370,465]));assert.equal((await s()).objects[0].outcome,'perfect');assert.ok((await s()).pose);
   await until(s=>s.hits===1);assert.equal((await s()).perfect,1);assert.equal((await s()).misses,0);assert.equal(await p.evaluate(()=>scrollY),before);
  }
  assert.deepEqual([...kinds].sort(),['high','low','mid']);assert.equal(await p.locator('#touchControls').isVisible(),false);
 });
 await check('A.2 sword: one action during chord, fast directional buffering, optional star expiry preserves XP',async()=>{
  await mode('str');await fixture(()=>{const e=window.__training;e.session.spawn=999;e.session.starTimer=999;e.session.objects=[0,1,2].map(lane=>({id:lane+100,type:'apple',lane,x:350,y:[350,450,550][lane],age:0}));});
  await p.keyboard.down('ArrowUp');await p.keyboard.down('ArrowRight');await p.keyboard.down('ArrowDown');
  assert.equal((await s()).attacks.length,1);assert.equal((await s()).pendingSword,'down');await p.clock.runFor(70);assert.equal((await s()).hits,2);assert.equal((await s()).attacks.length,1);
  for(const key of ['ArrowUp','ArrowRight','ArrowDown'])await p.keyboard.up(key);
  await p.keyboard.press('ArrowRight');await p.clock.runFor(60);assert.equal((await s()).hits,3);
  const earned=await progress();await fixture(()=>{const e=window.__training;e.session.objects=[{id:999,type:'star',x:220,y:445,life:.08,age:0}];});const combo=(await s()).combo;await p.clock.runFor(130);assert.equal((await s()).combo,combo);assert.deepEqual(await progress(),earned);assert.equal((await s()).misses,0);
 });
 await check('A.2 strength: three natural launch paths, real touch cuts and perfect-chain effects respond without waiting for animation completion',async()=>{
  await mode('str');await fixture(()=>{window.__training.session.combo=75;window.__training.session.difficulty=Math.min(1,Math.log1p(75/35)/Math.log1p(150/35));});let hits=0;const lanes=new Set();
  for(let i=0;i<900;i++){
   const state=await s();for(const o of state.objects.filter(o=>o.type==='apple')){
    lanes.add(o.lane);assert.equal(o.startX,1000);assert.equal(o.startY,o.lane===2?500:450);
    if(Math.abs(o.x-350)<25){await tap(...[[330,320],[510,455],[330,620]][o.lane]);assert.ok((await s()).pose);await p.clock.runFor(10);hits++;}
   }
   if(hits>=6&&lanes.size===3)break;await p.clock.runFor(10);
  }
  assert.equal(lanes.size,3);assert.ok((await s()).hits>=3);assert.ok((await s()).perfect>=1);
  // Isolate three different lanes so a legitimate same-lane multi-cut (Good) cannot make a perfect-chain test random.
  await mode('str');await fixture(()=>{const e=window.__training;e.session.spawn=999;e.session.starTimer=999;e.session.laneBag=[2,1,0];e.spawnObject();});
  await p.clock.runFor(250);await fixture(()=>window.__training.spawnObject());await p.clock.runFor(250);await fixture(()=>window.__training.spawnObject());
  const toneStart=await p.evaluate(()=>window.__tones.length);
  for(let i=0;i<500&&(await s()).hits<3;i++){const now=await s();for(const o of now.objects)if(o.type==='apple'&&Math.abs(o.x-350)<18){await tap(...[[330,320],[510,455],[330,620]][o.lane]);await p.clock.runFor(20);}await p.clock.runFor(10);}
  assert.equal((await s()).hits,3);assert.equal((await s()).perfect,3);assert.equal((await s()).bestPerfectRun,3);const tones=await p.evaluate(start=>window.__tones.slice(start),toneStart);assert.deepEqual(tones,[1160,1320,1480]);
  assert.ok(await p.evaluate(()=>window.__inputs.some(e=>e.type==='touch')));
 });
 await check('A.2 defense: native direct aiming follows circle, actual rounded shield contact blocks and late snap fails',async()=>{
  await mode('def');await fixture(()=>{const e=window.__training;e.session.spawn=999;e.session.objects=[{id:1,type:'apple',x:705,y:390,vx:-240,vy:0,r:17,age:0}];});
  await tap(800,390);assert.ok((await p.evaluate(()=>window.__training.pointer.x))>790);await p.clock.runFor(20);assert.equal((await s()).hits,1);
  const before=await progress();await fixture(()=>{const e=window.__training;e.setPointer(400,390);e.session.objects=[{id:2,type:'apple',x:675,y:390,vx:-300,vy:0,r:17,age:0}];});await p.clock.runFor(20);await tap(800,390);await p.clock.runFor(60);assert.equal((await s()).hits,1);assert.equal((await s()).misses,1);assert.equal((await s()).combo,0);assert.deepEqual(await progress(),before);assert.match(await p.locator('#actionFeedback').innerText(),/Superó el escudo/);
  const cdp=await ctx.newCDPSession(p),a=await point(600,200),b=await point(400,390);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});assert.ok((await p.evaluate(()=>window.__training.pointer.x))<410);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 });
 await check('A.2 dodge animation: headbutt, arm and kick change actual drawn limbs; ring pixels match real grading boundaries',async()=>{
  await p.setViewportSize({width:1366,height:768});const frames={};
  for(const kind of ['high','mid','low']){
   await mode('dodge');await fixture(()=>{window.__training.session.spawn=999;window.__training.session.objects=[];});
   await p.evaluate(kind=>{window.__training.session.objects=[{id:1,type:'cue',kind,age:.9,windup:1,resolved:false}];},kind);await p.clock.runFor(20);assert.equal((await s()).objects[0].age<.94,true);
   const beforeWhite=await p.evaluate(()=>{const a=document.getElementById('cv').getContext('2d').getImageData(593+(document.getElementById('cv').width-1200)/2,389,3,3).data;for(let i=0;i<a.length;i+=4)if(a[i]>240&&a[i+1]>240&&a[i+2]>240)return true;return false;});assert.equal(beforeWhite,false);
   await p.clock.runFor(100);assert.equal(await p.locator('#cueBanner').isVisible(),false);frames[kind]=await p.evaluate(()=>window.__dummyFrame);
   const white=await p.evaluate(()=>{const d=document.getElementById('cv').getContext('2d').getImageData(593+(document.getElementById('cv').width-1200)/2,389,3,3).data;for(let i=0;i<d.length;i+=4)if(d[i]>240&&d[i+1]>240&&d[i+2]>240)return true;return false;});assert.equal(white,true);
   await p.keyboard.press({high:'ArrowDown',mid:'ArrowLeft',low:'ArrowUp'}[kind]);assert.equal((await s()).objects[0].perfect,true);await p.clock.runFor(140);assert.equal((await s()).perfect,1);
  }
  assert.notDeepEqual(frames.high.calls,frames.mid.calls);assert.notDeepEqual(frames.mid.calls,frames.low.calls);await screenshot('dodge');
 });
 await check('A.2 critical: red/gold share circular exclamation design, varied gaps, no-input reward and native air strike',async()=>{
  await mode('crit');const fake=await until(s=>s.critical.stage==='fake');assert.match(await p.locator('#cueBanner').innerText(),/ROJO/);await screenshot('critical-red');const red=await p.evaluate(()=>({shape:window.__signal,symbol:window.__signalSymbol}));assert.equal(red.symbol,'!');assert.equal(red.shape.r,40);const before=fake.hits;await p.clock.runFor(Math.ceil((fake.critical.limit-fake.critical.clock+.04)*1000));assert.equal((await s()).hits,before+1);
  await until(s=>s.critical.stage==='ready');await p.clock.runFor(20);const gold=await p.evaluate(()=>({shape:window.__signal,symbol:window.__signalSymbol}));assert.equal(gold.symbol,red.symbol);assert.equal(gold.shape.r,red.shape.r);assert.notEqual(gold.shape.fill,red.shape.fill);await tap(600,270);assert.equal((await s()).critical.stage,'jump');await p.clock.runFor(430);assert.equal((await s()).critical.stage,'air');const hits=(await s()).hits;await tap(600,270);assert.equal((await s()).hits,hits+1);assert.equal((await s()).critical.stage,'impact');
 });
 await check('A.2 help and HUD: scene touches exclude controls/menus; no duplicate help below scene; mobile targets mix size',async()=>{
  await p.setViewportSize({width:390,height:844});await mode('acc');const target=(await until(s=>s.objects.length)).objects[0];await tap(target.x,target.y);assert.equal((await s()).hits,1);const before=await progress(),miss=(await s()).misses;await p.locator('#comboFocus').tap();assert.equal((await s()).misses,miss);
  await p.locator('#trainingHelp').tap();assert.equal((await s()).paused,true);assert.equal(await p.locator('#controlsDialog').evaluate(d=>d.open),true);assert.equal(await p.locator('.scene-help').count(),0);await p.locator('#closeControls').tap();await p.clock.runFor(20);assert.equal((await s()).paused,false);assert.equal(await p.evaluate(()=>!!document.activeElement.closest('button,dialog')),false);assert.deepEqual(await progress(),before);
  await p.locator('#pause').tap();const viewBefore=await p.evaluate(()=>({scale:visualViewport.scale,scroll:scrollY}));const cdp=await ctx.newCDPSession(p),a=await point(450,400),b=await point(700,400),c=await point(380,400),d=await point(790,400);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[c,d]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.deepEqual(await p.evaluate(()=>({scale:visualViewport.scale,scroll:scrollY})),viewBefore);assert.equal(await p.evaluate(()=>getSelection().toString()),'');
  await mode('acc');await p.clock.runFor(500);await screenshot('mobile');
 });
 await check('A.2 desktop 100%: complete scene, panel and mouse controls fit common resolutions without scroll or distortion',async()=>{
  const desktop=await browser.newContext({hasTouch:false,viewport:{width:1366,height:768}}),dp=await desktop.newPage();
  try{
   await dp.goto(url+'/Argentum-Souls/');await ready(dp);
   for(const [width,height] of [[1024,600],[1280,720],[1366,768],[1440,900],[1920,1080]]){
    await dp.setViewportSize({width,height});await dp.locator('[data-mode="str"]').click();await dp.waitForTimeout(60);
    const frame=await dp.locator('#scene').boundingBox(),canvas=await dp.locator('#cv').boundingBox(),panel=await dp.locator('.training-stats').boundingBox();assert.ok(frame.y>=0&&frame.y+frame.height<=height+1,`${width}x${height}: scene fits`);assert.ok(panel.y+panel.height<=height+1);assert.ok(Math.abs(canvas.width/canvas.height-(await dp.locator('#cv').evaluate(c=>c.width/c.height)))<.01);assert.equal(await dp.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true);
    for(const id of ['combo','soulsMission','sessionXp','pause','stop']){const r=await dp.locator('#'+id).boundingBox();assert.ok(r&&r.y+r.height<=height+1);}
   }
   await dp.setViewportSize({width:1366,height:768});await dp.locator('[data-mode="str"]').click();await dp.waitForTimeout(850);await dp.screenshot({path:path.join(__dirname,'../artifacts/delivery-a2-desktop.png'),fullPage:true});
  }finally{await desktop.close();}
 });
 assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
};
