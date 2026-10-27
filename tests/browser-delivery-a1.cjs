const assert=require('node:assert/strict');
const path=require('node:path');
module.exports=async(browser,url,check)=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true});
 await context.route('**/training/model.js*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\nconst start=Training.prototype.start;Training.prototype.start=function(...a){const s=start.apply(this,a);window.__training=this;return s;};'});});
 await context.addInitScript(()=>{let seed=762;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};const animate=Element.prototype.animate;window.motion=[];Element.prototype.animate=function(frames,options){window.motion.push({id:this.id,attribute:this.dataset.attribute,frames});return animate.call(this,frames,options);};});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const time=new Date('2026-10-25T00:00:00Z');await p.clock.install({time});await p.clock.pauseAt(time);
 const ready=async()=>{for(let i=0;i<100;i++){if(await p.evaluate(()=>!!window.ArgentumSoulsBridge))return;await new Promise(r=>setTimeout(r,20));}throw Error('not ready');};
 await p.goto(url+'/Argentum-Souls/');await ready();
 const s=()=>p.evaluate(()=>structuredClone(window.__training.session));
 const progress=()=>p.evaluate(()=>window.ArgentumSoulsBridge.exportProgress());
 const point=async(x,y)=>{const b=await p.locator('#cv').boundingBox(),v=await p.locator('#cv').evaluate(c=>({w:c.width,h:c.height}));return{x:b.x+(x+(v.w-1200)/2)*b.width/v.w,y:b.y+y*b.height/v.h};};
 const appleVisible=async o=>p.evaluate(({x,y})=>{const c=document.getElementById('cv').getContext('2d'),d=c.getImageData(Math.round(x+(document.getElementById('cv').width-1200)/2),Math.round(y),1,1).data;return d[0]>d[1]*1.3&&d[0]>100;},o);
 const click=async(x,y,touch=false)=>{const q=await point(x,y);if(touch)await p.touchscreen.tap(q.x,q.y);else await p.mouse.click(q.x,q.y);};
 const until=async(condition,limit=600)=>{for(let i=0;i<limit;i++){const state=await s();if(condition(state))return state;if(state.recovery)await p.keyboard.press('Enter');await p.clock.runFor(25);}throw Error('gameplay state not reached');};
 const mode=async m=>{await p.locator(`[data-mode="${m}"]`).click();};
 const preset=async(combo)=>p.evaluate(combo=>{const e=window.__training;e.session.combo=combo;e.session.difficulty=Math.min(1,Math.log1p(combo/40)/Math.log(6));e.session.spawn=0;e.session.starTimer=999;},combo);
 const screenshot=async name=>{await p.clock.runFor(20);return p.screenshot({path:path.join(__dirname,'../artifacts',`delivery-a1-${name}.png`),fullPage:true});};
 try{
 await check('A.1: real precision hits award growing XP, durable records, missions and level animations; miss/restart/reload cannot repeat prizes',async()=>{
  await mode('acc');
  for(let i=1;i<=25;i++){
   const target=(await until(s=>s.objects.length>0)).objects[0];const before=await s();await click(target.x,target.y,i%2===0);const after=await s();
   assert.equal(after.hits,i);assert.equal(after.combo,i);
   if(i===10){assert.equal(after.xp-before.xp,after.lastXp.amount);assert.equal(after.milestone,10);assert.ok(after.lastXp.amount>i);}
   if(i===12){assert.equal(after.xp-before.xp,after.lastXp.amount+12);assert.match(await p.locator('#rewardNotice').innerText(),/12 XP.*15 monedas/);}
   if(i===25){assert.equal(after.xp-before.xp,after.lastXp.amount);assert.equal(after.milestone,25);assert.ok(after.lastXp.amount>i);}
   await p.clock.runFor(20);
  }
  const motions=await p.evaluate(()=>window.motion);assert.ok(motions.some(m=>m.id==='comboFocus'&&m.frames.some(f=>f.transform==='scale(1.18)')));assert.ok(motions.some(m=>m.attribute==='acc'&&m.frames[0].transform==='scale(1.03)'));
  const row=p.locator('[data-attribute="acc"]');assert.match(await row.innerText(),/Nv [1-9]/);assert.equal(await row.locator('progress').getAttribute('max'),String(Math.round(20+(await progress()).stats.acc*4+6*(await progress()).stats.acc**2.3)));
  const before=await progress(),target=(await until(s=>s.objects.length)).objects[0];await click(target.x+target.r+4,target.y);assert.equal((await s()).combo,0);assert.deepEqual(await progress(),before);
  // Replaying the same attribute after reload retains the durable high-water mark.
  await p.locator('#stop').click();await p.reload();await ready();assert.equal((await progress()).comboRecords.acc,25);
  await mode('acc');assert.equal(await p.locator('#bestCombo').innerText(),'25');for(let i=0;i<10;i++){const target=(await until(s=>s.objects.length)).objects[0];const before=await s();await click(target.x,target.y);if(i===9){const after=await s(),extra=after.missionRecord.index>before.missionRecord.index?12+Math.min(168,(before.missionRecord.index-1)*4):0;assert.equal(after.xp-before.xp,after.lastXp.amount+extra);};}
  const got=await s();assert.notEqual(got.notice?.text,'★ COMBO 10 · +3 XP extra');
 });
 await check('A.1: browser samples all seven combos in all five disciplines; speed, cadence and windows change gradually',async()=>{
  const samples=[];
  for(const m of ['str','def','acc','dodge','crit'])for(const combo of [0,10,25,50,100,150,200]){
   await mode(m);await preset(combo);
   const state=await until(s=>m==='crit'?s.critical.stage!=='wait':s.objects.length>0),o=state.objects[0];
   if(m==='str')assert.ok(Math.abs(o.vx)<=600.001);
   if(m==='def')assert.ok(o.originX<0||o.originX>1200||o.originY<0||o.originY>720);
   if(m==='acc'){assert.ok(o.r>=39);if(combo>=10)assert.ok(Math.abs(o.vx)>0);}
   if(m==='dodge')assert.ok(o.windup>=.72&&o.windup<=1.16);
   if(m==='crit')assert.ok(state.critical.limit>=.5&&state.critical.limit<=.83);
   samples.push({m,combo,d:state.difficulty,interval:state.spawn,speed:Math.abs(o?.vx??0),motion:Math.abs(o?.vx??0),windup:o?.windup});
  }
  assert.ok(samples.find(r=>r.m==='str'&&r.combo===200).speed>samples.find(r=>r.m==='str'&&r.combo===0).speed+100);
  for(const m of ['str','def','acc','dodge']){const rows=samples.filter(r=>r.m===m);for(let i=1;i<rows.length;i++)assert.ok(rows[i].d>rows[i-1].d);}
 });
 await check('A.1: strength burst follows full paths to the hero; consecutive keys cut once per object and star stays behind torso',async()=>{
  await mode('str');await preset(200);
  const state=await until(s=>s.objects.some(o=>o.burst)),pair=state.objects.filter(o=>o.type==='apple');assert.ok(pair.length>=2);assert.ok(pair.some(o=>o.burst));
  assert.ok(pair.every(o=>o.x>700&&o.y>200&&o.y<650));await screenshot('strength-burst');
  await p.evaluate(()=>{const s=window.__training.session;s.spawn=999;s.pairPending=0;s.burstRemaining=0;s.starTimer=999;});
  const ids=new Set(pair.map(o=>o.id));const initialHits=(await s()).hits;let rewards=0;
  for(let i=0;i<400&&ids.size;i++){
   const now=await s();for(const id of [...ids])if(!now.objects.some(o=>o.id===id))ids.delete(id);for(const o of now.objects)if(ids.has(o.id)&&Math.abs(o.x-350)<25){assert.ok(await appleVisible(o),'actual apple pixels must reach the hero before input');const hits=(await s()).hits;await p.keyboard.press(['ArrowUp','ArrowRight','ArrowDown'][o.lane]);await p.clock.runFor(10);const latest=await s();rewards+=latest.hits-hits;for(const id of [...ids])if(!latest.objects.some(o=>o.id===id))ids.delete(id);}
   await p.clock.runFor(10);
  }
  assert.equal(ids.size,0);assert.equal((await s()).hits-initialHits,pair.length);
  await mode('str');await p.evaluate(()=>window.__training.session.spawn=999);const star=(await until(s=>s.objects.some(o=>o.type==='star'))).objects.find(o=>o.type==='star');assert.ok(star.x>=220&&star.x<270&&star.y>425&&star.y<450);
  const before=(await s()).hits;await p.keyboard.press('ArrowLeft');assert.equal((await s()).hits,before+1);await p.keyboard.press('ArrowLeft');assert.equal((await s()).hits,before+1);
 });
 await check('A.1: defense burst enters from outside, stays on a straight ray and native pointer blocks distinct arrivals',async()=>{
  await mode('def');await preset(200);await p.evaluate(()=>{const e=window.__training;e.session.spawn=999;e.spawnObject();});await p.clock.runFor(300);await p.evaluate(()=>window.__training.spawnObject(true));let state=await s();const ids=state.objects.map(o=>o.id),records=new Map(state.objects.map(o=>[o.id,o]));
  assert.ok(ids.length>=2);const arrivals=state.objects.map(o=>o.arrival).sort((a,b)=>a-b);for(let i=1;i<arrivals.length;i++)assert.ok(arrivals[i]-arrivals[i-1]>=.26-1e-7);
  await p.clock.runFor(350);await screenshot('defense-burst');const hits=state.hits;
  for(let i=0;i<250;i++){
   state=await s();const o=[...state.objects].sort((a,b)=>a.arrival-b.arrival)[0];if(o){const r=records.get(o.id);if(r){const cross=(o.x-600)*(r.originY-390)-(o.y-390)*(r.originX-600);assert.ok(Math.abs(cross)<1e-5);}
    if(o.x>30&&o.x<1170&&o.y>30&&o.y<690)assert.ok(await appleVisible(o),'defense apple must be drawn at its simulated position');
    const q=await point(600+(o.x-600)*.2,390+(o.y-390)*.2);await p.mouse.move(q.x,q.y);}
   if(ids.every(id=>!state.objects.some(o=>o.id===id)))break;await p.clock.runFor(10);
  }
  assert.ok((await s()).hits>=hits+ids.length);assert.equal((await s()).misses,0);
 });
 await check('A.1: precision visible ring distinguishes Good/Perfect/Miss and a moving pair can be shot twice by touch',async()=>{
  await mode('acc');await preset(100);let target=(await until(s=>s.objects.length)).objects[0];await click(target.x+target.r*.45,target.y,true);assert.equal((await s()).hits,1);assert.equal((await s()).perfect,0);
  target=(await until(s=>s.objects.length)).objects[0];await click(target.x,target.y,true);assert.equal((await s()).perfect,1);
  const pair=(await until(s=>s.objects.some(o=>o.burst)&&s.objects.length>=2)).objects;assert.ok(pair.every(o=>Math.abs(o.vx)>0));await screenshot('precision-pair');
  const hits=(await s()).hits;for(const o of pair)await click(o.x,o.y,true);assert.equal((await s()).hits,hits+pair.length);
  const before=await progress();await click(80,690,true);assert.equal((await s()).combo,0);assert.deepEqual(await progress(),before);
 });
 await check('A.1: straight dodge cue precedes preparation; early Good, Perfect and clear Fail grade once on execution',async()=>{
  for(const [fraction,correct,outcome] of [[.08,true,'miss'],[.24,true,'good'],[.82,true,'perfect'],[.82,false,'miss']]){
   await mode('dodge');const cue=(await until(s=>s.objects.length)).objects[0];await p.clock.runFor(Math.max(0,Math.round((cue.windup*fraction-cue.age)*1000)));
   const q=(await s()).objects[0],needed={low:'ArrowUp',high:'ArrowDown',mid:'ArrowLeft'}[q.kind];
   if(fraction===.08){await screenshot('dodge-direction');}
   await p.keyboard.press(correct?needed:needed==='ArrowDown'?'ArrowUp':'ArrowDown');assert.equal((await s()).hits,0);assert.ok((await s()).pose);
   await p.clock.runFor(Math.ceil((q.windup-q.age+.19)*1000));const resolved=await s();assert.equal(resolved.objects[0].outcome,outcome);assert.equal(resolved.hits,outcome==='miss'?0:1);assert.equal(resolved.misses,outcome==='miss'?1:0);
   const before=await progress();await p.keyboard.press(needed);assert.deepEqual(await progress(),before);if(outcome==='perfect')await screenshot('dodge-strike');
  }
 });
 await check('A.1: ignored critical fake grants one hit/XP; illuminated perfect window and late failure are visible',async()=>{
  await mode('crit');const fake=await until(s=>s.critical.stage==='fake');const hits=fake.hits;await screenshot('critical-fake');
  await p.clock.runFor(Math.ceil((fake.critical.limit-fake.critical.clock+.015)*1000));assert.equal((await s()).hits,hits+1);assert.equal((await s()).combo,fake.combo);assert.match(await p.locator('#actionFeedback').innerText(),/AMAGUE LEÍDO/);
  await until(s=>s.critical.stage==='ready');await p.keyboard.press('Space');await p.clock.runFor(430);const air=await s();assert.equal(air.critical.stage,'air');await screenshot('critical-perfect');
  const before=air.hits;await click(760,270);assert.equal((await s()).hits,before+1);assert.ok((await s()).perfect>=1);const xp=await progress();await click(760,270);assert.deepEqual(await progress(),xp);
  await until(s=>s.critical.stage==='ready');await p.keyboard.press('Space');await p.clock.runFor(850);assert.match(await p.locator('#actionFeedback').innerText(),/Perdiste el golpe aéreo/);
 });
 await check('A.3.1: right combo, centred attribute, compact five-stat right panel and controls inside scene; mobile panel collapses',async()=>{
  await mode('str');const scene=await p.locator('#scene').boundingBox(),combo=await p.locator('#comboFocus').boundingBox(),panel=await p.locator('.training-stats').boundingBox();
  assert.ok(combo.x>scene.x+scene.width*.7);const bar=await p.locator('.attribute-hud').boundingBox();assert.ok(Math.abs(bar.x+bar.width/2-(scene.x+scene.width/2))<2);assert.ok(panel.x>=scene.x+scene.width);assert.ok(panel.width<=190);assert.ok(scene.width>1000);
  assert.equal(await p.locator('#trainingStats .training-attribute').count(),5);assert.equal(await p.locator('#touchControls').count(),0);assert.equal(await p.locator('#result').innerText(),'');assert.equal(await p.locator('#guide').isVisible(),false);await screenshot('desktop');
  await p.setViewportSize({width:390,height:844});const small=await p.locator('#scene').boundingBox(),below=await p.locator('.training-stats').boundingBox();assert.ok(below.y<small.y);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(await p.locator('#attributesPanel').evaluate(e=>e.open))await p.locator('#attributesPanel>summary').tap();assert.equal(await p.locator('#trainingStats').isVisible(),false);await screenshot('mobile');
 });
 assert.deepEqual(errors,[]);
 }finally{await context.close();}
};
