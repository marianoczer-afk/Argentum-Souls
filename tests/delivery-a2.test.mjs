import test from 'node:test';
import assert from 'node:assert/strict';
import {Training,strengthKey,dodgePhase,cuePresentation} from '../src/training/model.js';
import {SHIELD,SWORD,DODGE,shieldGeometry,shieldContact,dodgeWindow,dodgePerfect,dodgeMotion} from '../src/training/geometry.js';
import {touchAction} from '../src/training/controls.js';
import {difficultyTarget,tuning} from '../src/training/balance.js';
const advance=(e,t)=>{for(let i=0;i<Math.ceil(t*120);i++)e.update(1/120);};
const random=(seed=67)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
test('A.2 three strength paths originate at the dummy hand, arc above it or stay low, and reach their lane',()=>{
 const e=new Training({random:()=>.5});e.start('str');e.session.spawn=999;e.session.starTimer=999;const lanes=new Set();
 for(let i=0;i<3;i++){e.spawnObject();const o=e.session.objects.pop();lanes.add(o.lane);assert.equal(o.x,1000);assert.equal(o.y,o.lane===2?500:450);e.session.objects=[o];advance(e,(o.startX-350)/-o.vx/2);const mid=e.session.objects[0];assert.ok(mid);if(o.lane===0)assert.ok(mid.y<260);if(o.lane===1)assert.equal(mid.y,450);if(o.lane===2)assert.ok(mid.y>490);e.session.objects=[];}
 assert.equal(lanes.size,3);
});
test('A.2 optional star expires without miss, XP loss or combo reset',()=>{
 const e=new Training();e.start('str');e.session.spawn=999;e.session.starTimer=999;e.session.combo=17;e.session.xp=68;e.session.objects=[{id:1,type:'star',x:220,y:445,age:0,life:.05}];advance(e,.1);assert.equal(e.session.combo,17);assert.equal(e.session.misses,0);assert.equal(e.session.xp,68);assert.equal(e.session.objects.length,0);
});
test('A.2 chord selects one active sword and only one buffered direction; controls beat animation completion',()=>{
 const e=new Training();e.start('str');e.session.spawn=999;e.session.starTimer=999;
 e.session.objects=[0,1,2].map(lane=>({id:lane,type:'apple',lane,x:350,y:[350,450,550][lane],age:0}));
 e.input('ArrowUp');e.input('ArrowRight');e.input('ArrowDown');assert.equal(e.session.attacks.length,1);assert.equal(e.session.pendingSword,'down');assert.equal(e.session.pose.kind,'high');advance(e,1/120);assert.equal(e.session.hits,1);advance(e,.06);assert.equal(e.session.hits,2);assert.equal(e.session.objects[0].lane,1);assert.ok(e.session.pose.age<SWORD.animation);assert.equal(e.session.attacks.length,1);
 e.input('ArrowRight');advance(e,.06);assert.equal(e.session.hits,3);assert.equal(e.session.attacks.length,1);
});
test('A.2 circular shield uses its rendered rounded rectangle in 360 degrees; backside never blocks',()=>{
 for(let i=0;i<32;i++){const angle=i*Math.PI/16,pointer={x:600+Math.cos(angle)*200,y:390+Math.sin(angle)*200},g=shieldGeometry(pointer);assert.ok(Math.abs(Math.hypot(g.x-600,g.y-390)-SHIELD.radius)<1e-8);
  assert.ok(shieldContact({x:600+Math.cos(angle)*101,y:390+Math.sin(angle)*101,r:17},pointer));
  assert.equal(shieldContact({x:600+Math.cos(angle)*70,y:390+Math.sin(angle)*70,r:17},pointer),null);
  assert.equal(shieldContact({x:600+Math.cos(angle)*101,y:390+Math.sin(angle)*101,r:17,passedShield:true},pointer),null);
 }
 const aim={x:900,y:390};assert.equal(shieldContact({x:676,y:460,r:17},aim),null,'outside the tangent edge must miss');
});
test('A.2 apple that passes the unaligned shield hits the hero even after a late snap',()=>{
 const e=new Training();e.start('def');e.session.spawn=999;e.session.combo=9;e.session.xp=22;e.setPointer(400,390);e.session.objects=[{id:1,type:'apple',x:675,y:390,vx:-300,vy:0,r:17,age:0}];advance(e,.01);e.setPointer(900,390);advance(e,.06);assert.equal(e.session.hits,0);assert.equal(e.session.misses,1);assert.equal(e.session.combo,0);assert.equal(e.session.xp,22);assert.match(e.session.feedback.text,/Superó/);
});
test('A.2 precision mixes near/mid/far targets with rare smaller circles and no overlap on phone scale',()=>{
 const e=new Training({random:random()});e.setScale(.3);e.start('acc');let far=0,near=0;const sizes={};
 for(let i=0;i<200;i++){e.session.objects=[];e.spawnObject();const o=e.session.objects[0];sizes[o.depth]=o.r;far+=o.depth==='far';near+=o.depth==='near';assert.ok(o.r*.3*2>=44);}
 assert.ok(near>far&&far>=10&&far<50);assert.ok(sizes.near>sizes.mid&&sizes.mid>sizes.far);
 e.session.objects=[];for(let i=0;i<4;i++)e.spawnObject();e.session.spawn=999;for(let i=0;i<80;i++){e.update(1/120);for(const o of e.session.objects){assert.ok(o.x-o.r>=139&&o.y-o.r>=169);for(const p of e.session.objects)if(o!==p)assert.ok(Math.hypot(o.x-p.x,o.y-p.y)>=o.r+p.r+29);}}
});
test('A.2 white circle and Perfect grading coincide at both boundaries for every attack and combo',()=>{
 for(const combo of [0,25,50,75,100,150])for(const kind of ['high','mid','low']){
  const windup=tuning('dodge',difficultyTarget(combo)).windup,w=dodgeWindow({windup});
  for(const age of [w.start-.001,w.start,w.start+.03,w.end,w.end+.001]){
   const cue={id:1,type:'cue',kind,age,windup,resolved:false},visual=dodgeMotion(cue).perfect;
   assert.equal(visual,dodgePerfect(cue));assert.equal(dodgePhase(cue)==='perfect',visual);
   const e=new Training();e.start('dodge');e.session.spawn=999;e.session.objects=[cue];e.input({high:'ArrowDown',mid:'ArrowLeft',low:'ArrowUp'}[kind]);assert.equal(cue.perfect,visual);advance(e,Math.max(.01,w.end-age+.01));assert.equal(e.session.perfect,visual?1:0);
  }
 }
});
test('A.2 only three dodge kinds and rhythm changes without elapsed-time intensity',()=>{
 const e=new Training({random:random()});e.start('dodge');const kinds=new Set(),durations=new Set();for(let i=0;i<30;i++){e.spawnObject();const cue=e.session.objects.pop();kinds.add(cue.kind);durations.add(cue.windup.toFixed(3));}assert.deepEqual([...kinds].sort(),['high','low','mid']);assert.ok(durations.size>5);const factors=new Set();for(let i=0;i<40;i++)factors.add(e.phraseFactor());assert.equal(factors.size,3);assert.equal(e.difficulty,0);
});
test('A.2 chained perfect cuts and blocks have separate responsive feedback and no bonus economy changes',()=>{
 for(const mode of ['str','def']){const calls=[],e=new Training({feedback:(kind,detail)=>calls.push({kind,detail})});e.start(mode);for(let i=0;i<3;i++){e.good(true,350,450);e.session.time+=.3;}assert.equal(e.session.perfectRun,3);assert.equal(e.session.xp,9);assert.ok(e.session.effects.some(f=>f.kind==='chain'));assert.deepEqual(calls.map(c=>c.detail.run),[1,2,3]);assert.ok(calls.every(c=>c.detail.mode===mode));assert.equal(e.session.mastery.count,3);e.bad();assert.equal(e.session.perfectRun,0);}
});
test('A.2 critical fake and real present comparable signals and reading the red signal grants once',()=>{
 const e=new Training();e.start('crit');e.session.critical={stage:'fake',clock:0,limit:.55};assert.match(cuePresentation(e.session).text,/ROJO/);advance(e,.56);assert.equal(e.session.hits,1);const xp=e.session.xp;advance(e,.01);assert.equal(e.session.xp,xp);assert.equal(e.session.running,true);
});
test('A.2 touch zones map three attacks, optional bonus and three evasions consistently',()=>{
 assert.equal(touchAction('str',330,320),'ArrowUp');assert.equal(touchAction('str',510,455),'ArrowRight');assert.equal(touchAction('str',330,620),'ArrowDown');assert.equal(touchAction('str',160,455),'ArrowLeft');assert.equal(touchAction('dodge',550,320),'ArrowUp');assert.equal(touchAction('dodge',550,620),'ArrowDown');assert.equal(touchAction('dodge',370,465),'ArrowLeft');
});
