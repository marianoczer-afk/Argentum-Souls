const assert=require('node:assert/strict');
const path=require('node:path');
module.exports=async function deliveryA(browser,url,check){
 const context=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true});
 await context.route('**/training/model.js*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\nconst start=Training.prototype.start;Training.prototype.start=function(...a){const s=start.apply(this,a);window.__training=this;return s;};'});});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const time=new Date('2026-10-25T00:00:00Z');await p.clock.install({time});await p.clock.pauseAt(time);await p.goto(url);await p.locator('[data-mode="str"]').waitFor();
 const s=()=>p.evaluate(()=>structuredClone(window.__training.session));
 async function until(condition,limit=700){for(let i=0;i<limit;i++){const current=await s();if(condition(current))return current;await p.clock.runFor(50);}assert.fail('Missing gameplay state');}
 async function point(x,y){const b=await p.locator('#cv').boundingBox();return{x:b.x+x*b.width/1200,y:b.y+y*b.height/720};}
 const screen=name=>p.screenshot({path:path.join(__dirname,'../artifacts',`delivery-a-${name}.png`),fullPage:true});
 const progress=()=>p.evaluate(()=>window.ArgentumSoulsBridge.exportProgress());
 try{
 await check('A: compact HUD, broad proportional scene and automatic training',async()=>{
  assert.equal(await p.locator('#start').count(),0);assert.equal((await s()).running,true);
  const head=await p.locator('.app-header').boundingBox(),scene=await p.locator('#scene').boundingBox(),cv=await p.locator('#cv').boundingBox();
  assert.ok(head.height<=64);assert.ok(scene.width>1050);assert.ok(cv.height>600);assert.ok(Math.abs(cv.width/cv.height-1200/720)<.01);
  for(const id of ['combo','bestCombo','sessionXp','attributeLevel','attributeProgress','soulsMission','actionFeedback'])assert.equal(await p.evaluate(id=>document.getElementById('scene').contains(document.getElementById(id)),id),true);
  assert.equal(await p.locator('#trainingStats .training-attribute').count(),5);assert.equal(await p.locator('#train .stat').count(),0);
  await p.clock.runFor(1900);await screen('desktop');
 });
 await check('A: discipline switches start immediately and preserve earned XP',async()=>{
  await p.locator('[data-mode="acc"]').click();assert.equal((await s()).running,true);
  const target=(await until(s=>s.objects.length)).objects[0],q=await point(target.x,target.y);await p.mouse.click(q.x,q.y);
  const before=await progress();assert.ok(before.xp.acc>0||before.stats.acc>0);
  await p.locator('[data-mode="def"]').click();assert.equal((await s()).mode,'def');assert.equal((await s()).running,true);assert.deepEqual(await progress(),before);
  await p.locator('[data-view="arena"]').click();assert.equal((await s()).paused,true);
  await p.locator('[data-view="train"]').click();assert.equal((await s()).paused,false);
 });
 await check('A: critical accepts scene HUD/footer taps; settings and external controls never attack',async()=>{
  await p.locator('[data-mode="crit"]').click();await until(s=>s.critical.stage==='ready');
  await p.locator('#scene .scene-hud').click();assert.equal((await s()).critical.stage,'jump');
  await p.clock.runFor(430);assert.equal((await s()).critical.stage,'air');
  const beforeHits=(await s()).hits;await p.locator('#scene .scene-footer').click();assert.equal((await s()).hits,beforeHits+1);await p.clock.runFor(90);await screen('critical');
  await until(s=>s.critical.stage==='ready');const before=await s();await p.locator('#settingsButton').click();
  assert.equal((await s()).paused,true);assert.equal((await s()).hits,before.hits);assert.equal((await s()).critical.stage,before.critical.stage);
  await screen('settings');await p.keyboard.press('Space');await p.clock.runFor(1000);assert.equal((await s()).critical.clock,before.critical.clock);
  assert.match(await p.locator('#buildVersion').innerText(),/v0\.3\./);assert.match(await p.locator('#buildCommit').innerText(),/Commit .+build .+/);
  if(await p.locator('#settingsDialog').evaluate(d=>d.open))await p.locator('#closeSettings').click();assert.equal((await s()).paused,true);await p.locator('#pause').click();assert.equal((await s()).paused,false);
 });
 await check('A: precision reaches combo 25 with moving targets then permits two consecutive shots',async()=>{
  await p.locator('[data-mode="acc"]').click();let moved=false;
  for(let i=0;i<25;i++){
   const state=await until(s=>s.objects.length>0),target=state.objects[0];if(i>=15)moved ||= Math.abs(target.vx)+Math.abs(target.vy)>0;
   const q=await point(target.x,target.y);await p.mouse.click(q.x,q.y);assert.equal((await s()).hits,i+1);assert.equal((await s()).combo,i+1);
  }
  assert.equal(moved,true);let pair;
  for(let i=0;i<100;i++){
   const state=await until(s=>s.objects.length>0);
   if(state.objects.length>=2){pair=state;break;}
   // Allow enough time for a possible partner, while keeping the first target alive.
   await p.clock.runFor(400);const next=await s();
   if(next.objects.length>=2){pair=next;break;}
   const target=next.objects[0],q=await point(target.x,target.y);await p.mouse.click(q.x,q.y);
  }
  assert.ok(pair,'gradual pair probability must produce a pair');await screen('precision-pair');const hits=pair.hits;
  for(const target of pair.objects.slice(0,2)){const q=await point(target.x,target.y);await p.mouse.click(q.x,q.y);}
  assert.equal((await s()).hits,hits+2);assert.equal((await s()).combo,pair.combo+2);
 });
 await check('A: rear star travels visibly and left collects it; empty swings preserve combo',async()=>{
  await p.locator('[data-mode="str"]').click();const star=(await until(s=>s.objects.some(o=>o.type==='star'))).objects.find(o=>o.type==='star');
  await p.clock.runFor(250);const current=(await s()).objects.find(o=>o.id===star.id);assert.ok(current.x>star.x);await screen('star');
  const before=await s();await p.keyboard.press('ArrowLeft');assert.equal((await s()).hits,before.hits+1);assert.equal((await s()).pose.kind,'back');
  const combo=(await s()).combo;await p.keyboard.press('ArrowLeft');assert.equal((await s()).combo,combo);
 });
 await check('A: dodge preparation, cue, perfect flash and execution preserve a successful response',async()=>{
  await p.locator('[data-mode="dodge"]').click();
  await until(s=>s.objects[0]?.age>.1);await screen('dodge-prepare');
  await until(s=>s.objects[0]?.age>s.objects[0]?.windup*.4);await screen('dodge-signal');
  const state=await until(s=>s.objects[0]?.age>s.objects[0]?.windup+.01),cue=state.objects[0];await screen('dodge-perfect');
  await p.keyboard.press({low:'ArrowUp',high:'ArrowDown',mid:'ArrowLeft'}[cue.kind]);
  assert.equal((await s()).perfect,0);await p.clock.runFor(Math.ceil((cue.windup-cue.age+.14)*1000));
  assert.equal((await s()).objects[0].outcome,'perfect');assert.equal((await s()).combo,1);await screen('dodge-strike');
  await p.clock.runFor(500);assert.equal((await s()).running,true);
 });
 await check('A: mobile portrait/landscape retains proportions and in-scene HUD',async()=>{
  for(const [width,height,name] of [[390,844,'mobile'],[844,390,'landscape']]){
   await p.setViewportSize({width,height});await p.locator('[data-mode="def"]').tap();await p.clock.runFor(1400);
   const cv=await p.locator('#cv').boundingBox();assert.ok(Math.abs(cv.width/cv.height-1200/720)<.01);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await screen(name);
  }
 });
 assert.deepEqual(errors,[]);
 }finally{await context.close();}
};
