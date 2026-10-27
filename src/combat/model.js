import {ARENAS} from './regions.js';
import {COMBAT,heroStats,enemyStats} from './balance.js';
export const ABILITIES=Object.freeze({slash:{name:'Doble golpe',cooldown:COMBAT.slashCooldown},shield:{name:'Guardia',cooldown:COMBAT.guardCooldown},heal:{name:'Curar',cooldown:COMBAT.healCooldown}});
export function attackMotion(attack,reach){if(!attack)return 0;const t=attack.time,w=attack.windup;return t<w?-.025*reach*Math.sin(t/w*Math.PI):t<w+.14?Math.sin((t-w)/.14*Math.PI/2)*reach:Math.max(0,1-(t-w-.14)/.22)*reach;}
export class Combat {
 constructor({state,arena=1,random=Math.random,onVictory=()=>{},feedback=()=>{}}){
  this.arena=ARENAS[arena-1];if(!this.arena)throw Error('Arena inválida');
  this.random=random;this.onVictory=onVictory;this.feedback=feedback;this.heroStats=heroStats(state);
  this.hero=this.heroStats.hp;this.phase='fight';this.wave=0;this.time=0;this.transition=0;this.paused=false;this.guard=0;this.cooldowns={slash:0,shield:0,heal:0};this.heroClock=.4;this.enemyClock=.9;this.heroAttack=null;this.enemyAttack=null;this.effects=[];this.log=[];this.settled=false;this.special=1;this.kills=0;this.heroHurt=0;this.enemyHurt=0;this.enemyTurns=0;this.spawnEnemy();
 }
 syncBuild(state){if(this.over)return;const next=heroStats(state);this.hero=Math.min(next.hp,this.hero+Math.max(0,next.hp-this.heroStats.hp));this.heroStats=next;}
 spawnEnemy(){this.enemyInfo=this.arena.enemies[this.wave];this.enemyStats=enemyStats(this.arena.id,this.wave,this.enemyInfo.archetype,this.arena.regionalBoss);this.enemy=this.enemyStats.hp;this.enemyClock=.75;this.enemyAttack=null;this.heroAttack=null;this.enemyTurns=0;this.enemyGuard=0;this.event(`${this.wave===3?'JEFE · ':''}${this.enemyInfo.name}`);}
 event(text){this.log.unshift(text);this.log.length=Math.min(this.log.length,30);}
 effect(text,target,color='#ffdd91'){this.effects.push({text,target,color,age:0});this.feedback('hit',{mode:'arena'});}
 get over(){return this.phase==='victory'||this.phase==='defeat';}
 use(key){if(this.over||this.paused||this.phase!=='fight'||!ABILITIES[key]||this.cooldowns[key]>0)return false;
  this.cooldowns[key]=ABILITIES[key].cooldown;
  if(key==='slash'){this.special=2.6;if(!this.heroAttack)this.heroClock=0;this.event('Doble golpe preparado');}
  if(key==='shield'){this.guard=COMBAT.guardDuration;this.event('Guardia activa · daño reducido');}
  if(key==='heal'){const healed=Math.min(this.heroStats.hp-this.hero,this.heroStats.hp*COMBAT.healFraction);this.hero+=healed;this.effect(`+${Math.round(healed)}`,'hero','#a8f0b8');this.event(`Curación +${Math.round(healed)}`);}
  return true;
 }
 heroHit(special){
  const h=this.heroStats,e=this.enemyStats;
  if(this.random()>=Math.min(.99,h.hit-e.evade+(special>1?.12:0))){this.effect('FALLO','enemy','#d5d4cf');return;}
  const critical=this.random()<h.crit,armor=e.armor+(this.enemyGuard>0?.3:0);
  const damage=Math.max(1,h.attack*special*(critical?h.critMultiplier:1)*(1-Math.min(.7,armor))*(.92+this.random()*.16));
  this.enemy=Math.max(0,this.enemy-damage);this.enemyHurt=.18;this.effect(`${critical?'★ ':''}${Math.round(damage)}`,'enemy',critical?'#fff4a1':'#ffdbb5');this.event(`Infligís ${Math.round(damage)}${critical?' crítico':''}`);
 }
 enemyHit(charged){
  const h=this.heroStats,e=this.enemyStats;
  if(this.random()<h.evade){this.effect('ESQUIVA','hero','#c4e8ff');return;}
  const rage=1+Math.min(1.5,Math.max(0,this.time-75)/100),pierce=e.archetype==='mystic'?.72:1;
  const damage=Math.max(1,e.attack*(charged?2:1)*(1-h.armor*pierce)*(this.guard>0?COMBAT.guardMultiplier:1)*rage*(.9+this.random()*.2));
  this.hero=Math.max(0,this.hero-damage);this.heroHurt=.2;this.effect(`${Math.round(damage)}`,'hero','#ffb6a2');this.event(`Recibís ${Math.round(damage)}${charged?' · golpe cargado':''}`);
  if(e.archetype==='mystic'&&this.enemyTurns%3===0){const healed=Math.min(e.hp-this.enemy,e.hp*.06);this.enemy+=healed;this.effect(`+${Math.round(healed)}`,'enemy','#aff1c1');}
 }
 update(dt){
  if(this.paused||!Number.isFinite(dt)||dt<=0)return;
  this.effects.forEach(e=>e.age+=dt);this.effects=this.effects.filter(e=>e.age<.85);this.heroHurt=Math.max(0,this.heroHurt-dt);this.enemyHurt=Math.max(0,this.enemyHurt-dt);
  if(this.over){this.transition+=dt;return;}this.time+=dt;
  for(const key in this.cooldowns)this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);this.guard=Math.max(0,this.guard-dt);this.enemyGuard=Math.max(0,this.enemyGuard-dt);
  if(this.phase==='transition'){this.transition-=dt;if(this.transition<=0){this.wave++;this.hero=Math.min(this.heroStats.hp,this.hero+this.heroStats.hp*COMBAT.betweenHeal);this.phase='fight';this.spawnEnemy();}return;}
  this.heroClock-=dt;this.enemyClock-=dt;
  if(!this.heroAttack&&this.heroClock<=0){this.heroAttack={time:0,windup:.2,hit:false,special:this.special};this.special=1;this.heroClock=this.heroStats.interval;}
  if(!this.enemyAttack&&this.enemyClock<=0){this.enemyTurns++;const charged=this.enemyStats.boss&&this.enemyTurns%3===0;this.enemyAttack={time:0,windup:charged?.72:.34,hit:false,charged};const enraged=this.enemyStats.boss&&this.enemy<this.enemyStats.hp*.45;this.enemyClock=this.enemyStats.interval*(enraged?.8:1);if(this.enemyStats.archetype==='armored'&&this.enemyTurns%3===1)this.enemyGuard=.8;}
  if(this.heroAttack){const a=this.heroAttack;a.time+=dt;if(!a.hit&&a.time>=a.windup+.14){a.hit=true;this.heroHit(a.special);}if(a.time>=a.windup+.36)this.heroAttack=null;}
  if(this.enemy<=0){this.kills++;this.heroAttack=null;this.enemyAttack=null;
   if(this.wave===3){this.phase='victory';this.transition=0;if(!this.settled){this.settled=true;this.reward=this.onVictory(this.arena.id);this.event('¡Arena completada!');}}
   else {this.phase='transition';this.transition=.8;this.event('Rival derrotado · siguiente encuentro');}return;
  }
  if(this.enemyAttack){const a=this.enemyAttack;a.time+=dt;if(!a.hit&&a.time>=a.windup+.14){a.hit=true;this.enemyHit(a.charged);}if(a.time>=a.windup+.36)this.enemyAttack=null;}
  if(this.hero<=0){this.phase='defeat';this.transition=0;this.heroAttack=null;this.enemyAttack=null;this.event('Derrota · conservás todo tu progreso');}
 }
}
