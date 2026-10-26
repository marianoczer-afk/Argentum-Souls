import {TrainingRenderer} from '../training/render.js';
import {REGIONS,ARENAS} from './regions.js';
import {attackMotion} from './model.js';
const TAU=Math.PI*2;
export class BattleRenderer extends TrainingRenderer {
 background(region,id){const c=this.ctx;c.fillStyle=region.sky;c.fillRect(-1500,0,4200,600);c.fillStyle=region.floor;c.fillRect(-1500,450,4200,150);c.save();
  const type=region.id;c.globalAlpha=.65;
  for(let i=-2;i<12;i++){const x=i*160+(id%3)*19;
   if(type===2||type===4){c.strokeStyle=type===2?'#284d38':'#374b2a';c.lineWidth=17;c.beginPath();c.moveTo(x,460);c.lineTo(x+12,180);c.stroke();for(let j=0;j<3;j++)this.circle(x-35+j*28,170-j*20,65,type===2?'#37644a':'#5b7045');}
   else if(type===3||type===6){c.fillStyle=type===3?'#33364e':'#e1f1f2';c.beginPath();c.moveTo(x-75,type===3?0:460);c.lineTo(x+20,type===3?180:190);c.lineTo(x+95,type===3?0:460);c.fill();}
   else if(type===5){c.fillStyle='#b68b50';c.beginPath();c.moveTo(x-90,450);c.lineTo(x+35,260);c.lineTo(x+130,450);c.fill();}
   else if(type===9){this.circle(x,200+Math.sin(i)*65,40+id%25,null,'#b099ce');this.circle(x+45,140,2,'#e8d8ff');}
   else {c.fillStyle=type===8?'#393548':type===10?'#b29866':'#746d59';c.fillRect(x,140,28,310);c.fillRect(x-15,125,58,22);if(type===10){c.strokeStyle='#f0d491';c.lineWidth=6;c.beginPath();c.arc(x+80,190,80,Math.PI,0);c.stroke();}}
  }
  c.restore();c.strokeStyle='#ebd7ac66';c.lineWidth=2;c.beginPath();c.ellipse(600,505,440,55,0,0,TAU);c.stroke();if(id%10===0){for(let i=0;i<8;i++){const a=i*TAU/8;this.circle(600+Math.cos(a)*330,505+Math.sin(a)*40,5,'#f5d992');}}this.label(`${region.name.toUpperCase()} · ${id}`,600,70,23,'#fff1cc');
 }
 enemy(x,y,info,region,{hurt=0,dead=0,boss=false,regional=false}={}){const c=this.ctx,t=info.archetype,scale=t==='brute'?1.2:t==='swift'?.9:1;c.save();c.translate(x,y);c.rotate(dead?Math.min(1,dead/.6)*1.2:0);c.scale(scale*(boss?(regional?1.25:1.12):1),scale*(boss?(regional?1.25:1.12):1));c.globalAlpha=dead?Math.max(.15,1-dead):1;
  c.strokeStyle='#292d37';c.lineWidth=13;c.lineCap='round';c.beginPath();c.moveTo(-13,15);c.lineTo(-27,57);c.moveTo(12,15);c.lineTo(28,57);c.stroke();
  const color=hurt>0?'#ffe6ba':t==='mystic'?region.sky:t==='armored'?'#647b87':t==='swift'?'#647752':region.floor;
  this.round(-29,-57,60,83,12,color);this.circle(0,-82,29,hurt>0?'#fff0d2':'#c5b493','#343643');this.circle(-10,-85,4,'#292c36');this.circle(10,-85,4,'#292c36');
  c.strokeStyle='#33323b';c.lineWidth=11;c.beginPath();c.moveTo(-17,-39);c.lineTo(-49,-14);c.moveTo(20,-38);c.lineTo(50,-8);c.stroke();
  if(t==='mystic'){c.strokeStyle='#bb9a68';c.lineWidth=6;c.beginPath();c.moveTo(-53,35);c.lineTo(-53,-112);c.stroke();this.circle(-53,-112,15,'#b8b0e8');}
  else if(t==='armored'){this.round(-66,-47,36,63,9,'#a2a8a0');this.round(-54,-37,12,43,4,region.floor);}
  else {c.strokeStyle='#e5ddbd';c.lineWidth=t==='brute'?15:5;c.beginPath();c.moveTo(-49,-16);c.lineTo(-78,-95);c.stroke();if(t==='brute')this.round(-95,-110,38,30,4,'#899398');}
  if(t==='swift'){c.fillStyle=color;c.beginPath();c.moveTo(-24,-100);c.lineTo(-30,-132);c.lineTo(-5,-107);c.fill();}
  if(boss){c.fillStyle='#efd183';c.beginPath();c.moveTo(-29,-104);c.lineTo(-35,-133);c.lineTo(-12,-119);c.lineTo(0,-139);c.lineTo(13,-119);c.lineTo(32,-133);c.lineTo(26,-104);c.fill();}
  c.restore();
 }
 drawBattle(fight,selected=1){const c=this.ctx,offset=(this.canvas.width-1200)/2;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.canvas.width,600);c.translate(offset,0);const arena=fight?.arena??ARENAS[selected-1],region=REGIONS[arena.region-1];this.background(region,arena.id);
  let heroX=260+attackMotion(fight?.heroAttack,610)-(fight?.heroHurt>0?12:0),enemyX=940-attackMotion(fight?.enemyAttack,605)+(fight?.enemyHurt>0?12:0);if(enemyX-heroX<76){const mid=(heroX+enemyX)/2;heroX=mid-38;enemyX=mid+38;}
  c.save();if(fight?.phase==='defeat'){c.translate(heroX,465);c.rotate(-Math.min(1,fight.transition/.6)*1.15);this.hero(0,0,null);}
  else this.hero(heroX,465,fight?.heroAttack?{kind:'slash',age:Math.max(0,fight.heroAttack.time-fight.heroAttack.windup),duration:.36}:null);c.restore();
  this.enemy(enemyX,445,fight?.enemyInfo??arena.enemies[0],region,{hurt:fight?.enemyHurt,dead:fight?.phase==='transition'?.8-fight.transition:fight?.phase==='victory'?fight.transition:0,boss:fight?.wave===3,regional:arena.regionalBoss&&fight?.wave===3});
  if(fight?.guard>0)this.circle(heroX,420,78,null,'#bce8ff');
  if(fight?.enemyAttack?.charged){this.circle(enemyX,360,70,null,'#ffe2a0');this.label('¡GOLPE CARGADO!',600,135,23,'#fff0ac');}
  for(const e of fight?.effects??[])this.label(e.text,e.target==='hero'?heroX:enemyX,310-e.age*80,30,e.color);
  if(fight?.paused){c.fillStyle='#17232cb8';c.fillRect(-offset,0,this.canvas.width,600);this.label('PAUSA',600,300,34);}
 }
}
