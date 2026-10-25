import test from 'node:test';
import assert from 'node:assert/strict';
import {Training,LANES,WORLD,dodgePhase} from '../src/training/model.js';
const advance=(e,t)=>{for(let i=0;i<Math.round(t*120);i++)e.update(1/120);};
test('air slashes and absent rear star never consume combo or XP; missed apples do',()=>{
 const e=new Training();e.start('str');e.session.spawn=999;e.session.combo=8;e.session.xp=34;
 for(const key of ['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'])e.input(key);
 advance(e,.2);assert.equal(e.session.combo,8);assert.equal(e.session.xp,34);assert.equal(e.session.misses,0);
 e.session.objects=[{id:1,type:'apple',lane:1,x:240,y:LANES[1],vx:-200,vy:0,age:0}];advance(e,.02);
 assert.equal(e.session.combo,0);assert.equal(e.session.xp,34);
});
test('right cuts an apple arriving from the right; left collects a distinct moving star',()=>{
 const e=new Training();e.start('str');e.session.objects=[{id:1,type:'apple',lane:1,x:350,y:LANES[1],vx:-300,vy:0,age:0}];
 e.input('ArrowLeft');assert.equal(e.session.hits,0);e.input('ArrowRight');assert.equal(e.session.hits,1);
 e.session.objects=[{id:2,type:'star',x:160,y:330,age:0,life:2.1}];advance(e,.3);assert.ok(e.session.objects[0].x>160);
 e.input('ArrowLeft');assert.equal(e.session.hits,2);assert.equal(e.session.objects.length,0);
});
test('difficulty targets combo only, is capped, and smoothly recovers after a miss',()=>{
 const a=new Training(),b=new Training();a.start('crit');b.start('crit');a.session.time=90000;
 assert.equal(a.difficulty,b.difficulty);
 a.session.combo=10000;a.session.critical.delay=100;advance(a,4.1);assert.equal(a.difficulty,1);
 a.bad();const high=a.difficulty;advance(a,.1);assert.ok(a.difficulty<high&&a.difficulty>0);advance(a,2);assert.equal(a.difficulty,0);
});
test('defense rotates through eight sectors with off-scene origins and separated arrivals',()=>{
 const e=new Training({random:()=>.5});e.start('def');e.session.combo=100;e.session.difficulty=1;
 const sectors=new Set(),arrivals=[];
 for(let i=0;i<8;i++){e.session.time=i*.5;e.spawnObject();const o=e.session.objects.at(-1);sectors.add(o.sector);arrivals.push(o.arrival);assert.ok(o.x<0||o.x>1200||o.y<0||o.y>720);assert.ok(Math.hypot(o.vx,o.vy)<500);}
 assert.equal(sectors.size,8);for(let i=1;i<8;i++)assert.ok(arrivals[i]-arrivals[i-1]>=.49);
});
test('precision has a small perfect center, movement starts gradually around combo 10, and pairs permit two shots',()=>{
 const e=new Training({random:()=>.7});e.start('acc');e.session.time=99999;e.spawnObject();assert.equal(e.session.objects[0].vx,0);
 let o=e.session.objects.pop();e.session.objects=[o];e.click(o.x+o.r*.3,o.y);assert.equal(e.session.hits,1);assert.equal(e.session.perfect,0);
 e.session.combo=15;e.session.difficulty=.3;e.spawnObject();assert.notEqual(e.session.objects[0].vx,0);
 e.session.objects=[];e.session.combo=25;e.session.spawn=0;e.random=()=>.1;advance(e,.4);assert.equal(e.session.objects.length,2);
 const [a,b]=e.session.objects;assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r+40);
 for(const target of [...e.session.objects])e.click(target.x,target.y);
 assert.equal(e.session.hits,3);assert.equal(e.session.objects.length,0);
});
test('dodge has ordered preparation, signal, perfect, late and strike phases',()=>{
 const e=new Training();e.start('dodge');e.session.spawn=999;
 const cue={id:1,type:'cue',kind:'low',age:0,windup:1.6,resolved:false};
 for(const [age,phase] of [[.1,'direction'],[.25,'prepare'],[.6,'signal'],[1.1,'perfect'],[1.4,'late'],[1.65,'strike']]){cue.age=age;assert.equal(dodgePhase(cue),phase);}
 cue.age=1.1;e.session.objects=[cue];e.input('ArrowUp');assert.equal(e.session.perfect,0);assert.equal(e.session.pose.kind,'jump');advance(e,.51);assert.equal(e.session.perfect,1);
 assert.equal(e.session.objects.length,1,'execution remains visible after a successful response');
 e.input('ArrowDown');assert.equal(e.session.hits,1,'resolved cue cannot award twice or punish a second tap');advance(e,.9);assert.equal(e.session.combo,1);
});
test('late valid dodge is good; too early and wrong direction provide an explicit reason',()=>{
 for(const [age,key,hits,perfect,reason] of [[1.4,'ArrowUp',1,0,null],[.1,'ArrowUp',0,0,'Muy pronto'],[1.1,'ArrowDown',0,0,'Dirección incorrecta']]){
  const e=new Training();e.start('dodge');e.session.objects=[{id:1,type:'cue',kind:'low',age,windup:1.6,resolved:false}];e.input(key);advance(e,Math.max(0,1.61-age));
  assert.equal(e.session.hits,hits);assert.equal(e.session.perfect,perfect);if(reason)assert.ok(e.session.feedback.text.includes(reason));
 }
});
test('touch-sized targets remain visibly hittable; shooting outside the visible circle is a miss',()=>{
 const e=new Training({random:()=>.5});e.setScale(.3);e.start('acc');e.spawnObject();const target=e.session.objects[0];
 assert.ok(target.r*2*.3>=44);
 e.click(target.x+target.r+1,target.y);assert.equal(e.session.hits,0);assert.equal(e.session.misses,1);
 e.click(target.x,target.y);assert.equal(e.session.perfect,1);
});
