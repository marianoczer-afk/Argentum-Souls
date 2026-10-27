import test from 'node:test';
import assert from 'node:assert/strict';
import {Training,LANES,strengthKey} from '../src/training/model.js';
import {tuning,difficultyTarget,COMBO_MILESTONES} from '../src/training/balance.js';
import {loadState,awardTraining} from '../src/state.js';
const advance=(e,t)=>{for(let i=0;i<Math.ceil(t*120);i++)e.update(1/120);};
function seeded(seed=42){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}
const combos=[0,10,25,50,100,150,200];
test('A.1 combo curve is continuous, perceptible early, capped and has no step at 25',()=>{
 for(let c=1;c<=150;c++){const delta=difficultyTarget(c)-difficultyTarget(c-1);assert.ok(delta>0&&delta<.018);}
 assert.equal(difficultyTarget(200),1);assert.equal(difficultyTarget(10000),1);
 for(const mode of ['str','def','acc','dodge','crit'])for(const c of combos){const p=tuning(mode,difficultyTarget(c));for(const n of Object.values(p))assert.ok(Number.isFinite(n)&&n>=-.08);}
 assert.ok(tuning('acc',difficultyTarget(24)).motion<tuning('acc',difficultyTarget(25)).motion);
});
test('A.3.1 per-hit XP replaces milestone payouts while durable attribute records survive reload',()=>{
 let state=loadState({getItem:()=>null});let granted=[];
 const make=()=>new Training({getRecord:m=>state.comboRecords[m],reward:(m,r)=>{granted.push(r);awardTraining(state,m,r);return r;}});
 let e=make();e.start('acc');for(let i=0;i<200;i++)e.good(true,600,390);
 assert.equal(granted.filter(r=>r.bonus).length,0);assert.equal(state.comboRecords.acc,200);
 const before=state.xp.acc;e.bad();assert.equal(state.xp.acc,before);
 e.start('acc');for(let i=0;i<25;i++)e.good(true,600,390);assert.equal(granted.filter(r=>r.bonus).length,0);
 state=loadState({getItem:()=>JSON.stringify(state)});e=make();e.start('acc');for(let i=0;i<25;i++)e.good(true,600,390);assert.equal(granted.filter(r=>r.bonus).length,0);
 e.start('str');for(let i=0;i<10;i++)e.good(true,350,450);assert.equal(granted.filter(r=>r.bonus).length,0);
});
test('A.1 maintaining 200 perfect hits earns more than repeatedly resetting at combo 10 or 12',()=>{
 const total=(length,repeats)=>{let xp=0;const e=new Training({reward:(_,r)=>{xp+=r.xp;}});for(let r=0;r<repeats;r++){e.start('str');for(let i=0;i<length;i++)e.good(true,350,450);}return xp/(length*repeats);};
 assert.ok(total(200,1)>total(10,20));assert.ok(total(200,1)>total(12,17));
});
test('A.1 mission gives XP and gold once, reports reward, and never removes earned XP on misses',()=>{
 const rewards=[],e=new Training({reward:(_,r)=>rewards.push(r)});e.start('str');for(let i=0;i<12;i++)e.good(true,350,450);
 assert.equal(rewards.filter(r=>r.mission?.index===1).length,1);assert.equal(rewards.find(r=>r.mission).mission.xp,12);assert.equal(rewards.find(r=>r.mission).mission.gold,15);assert.match(e.session.notice.text,/12 XP/);
 const xp=e.session.xp;e.bad();assert.equal(e.session.xp,xp);for(let i=0;i<20;i++)e.good(false,350,450);assert.equal(rewards.filter(r=>r.mission?.index===1).length,1);
});
test('A.1 defense has eight off-canvas origins and fair ordered arrivals, including burst shots',()=>{
 for(const combo of combos){const e=new Training({random:seeded()});e.start('def');e.session.combo=combo;e.session.difficulty=difficultyTarget(combo);let previous=-99;const sectors=new Set();
  for(let i=0;i<100;i++){e.session.time+=i%2?.28:.5;e.spawnObject();const o=e.session.objects.pop();sectors.add(o.sector);assert.ok(o.x<-17||o.x>1217||o.y<-17||o.y>737);assert.ok(o.arrival-previous>=.26-1e-8);assert.ok(o.arrival-e.session.time>=1.02-1e-8);previous=o.arrival;}
  assert.equal(sectors.size,16);
 }
});
test('A.1 strength bursts traverse to their lanes, stay bounded and permit consecutive and multi cuts',()=>{
 const e=new Training({random:seeded()});e.start('str');e.session.difficulty=1;e.session.spawn=999;e.session.starTimer=999;
 e.spawnObject();e.session.time+=.17;e.spawnObject(true);
 assert.equal(e.session.objects.length,2);const ids=e.session.objects.map(o=>o.id);
 for(let i=0;i<400;i++){for(const o of [...e.session.objects])if(Math.abs(o.x-350)<30)e.input(strengthKey(o.lane));e.update(1/120);}
 assert.equal(e.session.hits,ids.length);assert.equal(e.session.misses,0);
 e.session.objects=[1,2].map(id=>({id,type:'apple',x:350+(id-1)*30,y:LANES[1],lane:1,age:0}));e.input('ArrowRight');advance(e,1/120);assert.equal(e.session.hits,4);
});
test('A.1 moving paired precision targets remain disjoint and completely visible at all combo samples',()=>{
 for(const combo of combos){const e=new Training({random:seeded()});e.start('acc');e.session.combo=combo;e.session.difficulty=difficultyTarget(combo);e.session.spawn=999;
  e.spawnObject();e.spawnObject(true);
  for(let i=0;i<140;i++){e.update(1/120);for(const o of e.session.objects){assert.ok(o.x-o.r>=139&&o.x+o.r<=1141&&o.y-o.r>=169&&o.y+o.r<=601);for(const b of e.session.objects)if(o!==b)assert.ok(Math.hypot(o.x-b.x,o.y-b.y)>=o.r+b.r+29);}}
 }
});
test('A.1 dodge accepts reasonable early input, grades only at execution and resolves once',()=>{
 for(const [age,key,outcome] of [[.05,'ArrowUp','miss'],[.24,'ArrowUp','good'],[.82,'ArrowUp','perfect'],[1.05,'ArrowUp','good'],[1.02,'ArrowDown','miss']]){
  const e=new Training();e.start('dodge');e.session.spawn=999;e.session.objects=[{id:1,type:'cue',kind:'low',age,windup:1,resolved:false}];e.input(key);assert.equal(e.session.hits,0);assert.ok(e.session.pose);e.input(key);advance(e,Math.max(.01,1.13-age));
  assert.equal(e.session.hits,outcome==='miss'?0:1);assert.equal(e.session.misses,outcome==='miss'?1:0);assert.equal(e.session.perfect,outcome==='perfect'?1:0);const xp=e.session.xp;advance(e,.3);assert.equal(e.session.xp,xp);
 }
});
test('A.1 ignored fake rewards once; critical windows are bounded and missed opportunities explain why',()=>{
 const e=new Training();e.start('crit');e.session.critical={stage:'fake',clock:0,limit:.6};advance(e,.61);assert.equal(e.session.hits,1);assert.equal(e.session.combo,0);assert.equal(e.session.xp,1);assert.match(e.session.feedback.text,/AMAGUE/);advance(e,.05);assert.equal(e.session.hits,1);
 e.session.critical={stage:'air',clock:0,limit:.42};advance(e,.43);assert.match(e.session.feedback.text,/golpe aéreo/);assert.equal(e.session.combo,0);
 for(const c of combos){const p=tuning('crit',difficultyTarget(c));assert.ok(p.ready>=.58&&p.air>=.38&&p.perfectEnd-p.perfectStart>=.099);}
});
test('A.2 dodge renders three distinct actual body/limb transformations without a stretched weapon',async()=>{
 const {TrainingRenderer}=await import('../src/training/render.js');
 const frames={};
 for(const kind of ['high','mid','low']){
  const calls=[];const context=new Proxy({},{get:(_,key)=>(...args)=>{if(['translate','lineTo'].includes(key))calls.push([key,...args]);}});
  new TrainingRenderer({getContext:()=>context}).dodgeAttack({kind,age:1.12,windup:1});frames[kind]=calls;
 }
 assert.notDeepEqual(frames.high,frames.mid);assert.notDeepEqual(frames.mid,frames.low);
 assert.ok(frames.high.some(c=>c[0]==='translate'&&c[1]<-20));
 assert.ok(frames.mid.some(c=>c[0]==='lineTo'&&c[1]<-130));
 assert.ok(frames.low.some(c=>c[0]==='lineTo'&&c[1]<-90&&c[2]>=40&&c[2]<60));
});
