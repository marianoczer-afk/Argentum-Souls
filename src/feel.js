/* Souls Lab: animaciones, misiones y arenas experimentales.
   No lee ni modifica el guardado v7 de Argentum Idle. */
(function(){
'use strict';
const lab={arenaWaves:3,sound:true,pose:'',poseLeft:0,sparks:[],slashes:[],lastHit:-9999,hits:0,missionDone:false,flash:0,audio:null};
window.SoulsLab=lab;
S.stations=Object.assign({str:0,def:0,acc:0,dodge:0,crit:0},S.stations||{});
MODES.crit.desc='Calavera = amague: NO toques. Exclamación = pulsá para saltar. En el aire pulsá una segunda vez para conectar el crítico.';
MODES.crit.guide='☠ Esperá sin tocar. ❗ Pulsá ESPACIO o clic. ⚡ En el aire, pulsá de nuevo. Si tocás un amague, perdés el combo.';
MODES.str.desc='Cortá las manzanas que llegan desde tres alturas con ↑, ← o ↓. Cada espadazo barre una zona y puede romper varias. Una estrella a tu espalda se recoge con →.';
MODES.dodge.desc='Reaccioná a la señal del muñeco: el guerrero salta, se agacha o hace un dash lateral.';
showGuide();
const style=document.createElement('style');
style.textContent='.souls-touch{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:10px 0}.souls-touch button{min-width:80px;min-height:44px;border:1px solid #c79854;background:#4a3b31;color:#ffe9bc;border-radius:9px;font-weight:700;touch-action:manipulation}.souls-touch button:active{background:#c99149;color:#21160f;transform:translateY(2px)}.souls-arena-select{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:10px 0 14px}#soulsMission{border-color:#a88752;color:#f6dc9e;font-weight:650}';
document.head.appendChild(style);
const missions={str:'Cortá 12 objetos y alcanzá combo x5',def:'Bloqueá 12 manzanas y alcanzá combo x5',acc:'Acertá 12 blancos y alcanzá combo x5',dodge:'Esquivá 12 ataques y alcanzá combo x5',crit:'Conectá 12 críticos y alcanzá combo x5'};
const mission=document.createElement('div');mission.className='notice';mission.id='soulsMission';mission.setAttribute('aria-live','polite');$('scene').insertAdjacentElement('afterend',mission);
const touch=document.createElement('div');touch.className='souls-touch';
touch.innerHTML='<button type="button" data-key="ArrowLeft">← Izq.</button><button type="button" data-key="ArrowUp">↑ Arriba</button><button type="button" data-key="ArrowDown">↓ Abajo</button><button type="button" data-key="ArrowRight">→ Der.</button><button type="button" data-key=" ">⚡ Acción</button>';
mission.insertAdjacentElement('afterend',touch);
touch.querySelectorAll('button').forEach(function(b){b.addEventListener('pointerdown',function(e){e.preventDefault();inputAction(b.dataset.key);});});
const audioBtn=document.createElement('button');audioBtn.className='btn';audioBtn.type='button';audioBtn.textContent='🔊 Sonido: sí';
audioBtn.onclick=function(){lab.sound=!lab.sound;audioBtn.textContent=lab.sound?'🔊 Sonido: sí':'🔇 Sonido: no';};
$('stop').insertAdjacentElement('afterend',audioBtn);
function renderMission(){mission.textContent='🎖 MISIÓN · '+missions[mode]+' | Aciertos '+lab.hits+'/12 | Mejor combo '+(T?.best||0)+'/5'+(lab.missionDone?' ✓ COMPLETA':'');}
renderMission();
function tone(freq,duration,type){
 if(!lab.sound)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  if(!lab.audio)lab.audio=new C();
  if(lab.audio.state==='suspended')lab.audio.resume();
  const o=lab.audio.createOscillator(),g=lab.audio.createGain();
  o.type=type||'triangle';o.frequency.setValueAtTime(freq,lab.audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(100,freq*.6),lab.audio.currentTime+duration);
  g.gain.setValueAtTime(.05,lab.audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,lab.audio.currentTime+duration);
  o.connect(g);g.connect(lab.audio.destination);o.start();o.stop(lab.audio.currentTime+duration);
 }catch(e){/* Audio opcional */}
}
function burst(x,y,color,n){
 const count=n||9;
 for(let i=0;i<count;i++){
  const a=Math.PI*2*i/count+Math.random()*.5,v=75+Math.random()*135;
  lab.sparks.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-35,life:.35+Math.random()*.19,max:.54,color:color||'#ffe09c'});
 }
 if(lab.sparks.length>120)lab.sparks.splice(0,lab.sparks.length-120);
}
function pose(name,time){lab.pose=name;lab.poseLeft=time||.3;}
const baseGood=good;
good=function(perfect){
 baseGood(perfect);lab.hits++;
 if(mode==='def'){pose('block',.19);burst(500,260,'#c3edff',7);}
 if(mode==='acc')burst(pointer.x,pointer.y,'#ffe6a1',11);
 if(mode==='crit'){pose('slash',.28);burst(540,218,'#f6ec9a',15);}
 tone(perfect?720:520,.09);renderMission();
};
const baseBad=bad;
bad=function(){baseBad();lab.flash=.16;tone(190,.12,'sawtooth');renderMission();};
const baseStart=startTrain;
startTrain=function(){
 lab.hits=0;lab.missionDone=false;lab.pose='';lab.poseLeft=0;lab.sparks.length=0;lab.slashes.length=0;lab.lastHit=-9999;
 baseStart();renderMission();
};
$('start').onclick=startTrain;
const baseEnd=endTrain;
endTrain=function(cancel){
 if(!T?.running)return;
 const completed=!cancel&&lab.hits>=12&&T.best>=5,station=S.stations[mode]||0;
 baseEnd(cancel);
 if(!cancel){
  const bonusLevels=Math.min(station,Math.max(0,100-S.stats[mode]));
  S.stats[mode]+=bonusLevels;
  const gold=completed?35+station*10:0;S.coins+=gold;lab.missionDone=completed;
  if(bonusLevels||gold){
   $('result').textContent+=(bonusLevels?' · +'+bonusLevels+' niveles por estación':'')+(gold?' · +'+gold+' monedas por misión':'');
   $('overlay').querySelector('p').textContent=$('result').textContent;
   save();renderStats();
  }
 }
 renderMission();
};
$('stop').onclick=function(){endTrain(true);};
const baseInput=inputAction;
inputAction=function(key){
 if(!T?.running)return;
 const dir={arrowup:'up',w:'up',arrowleft:'left',a:'left',arrowdown:'down',s:'down',arrowright:'right',d:'right'}[String(key).toLowerCase()];
 if(mode==='str'&&dir){
  if(dir==='right'){
   const idx=T.objects.findIndex(function(o){return o.type==='star';});
   if(idx<0){bad();return;}
   const star=T.objects.splice(idx,1)[0];pose('back',.27);burst(star.x,star.y,'#f9da74',15);good(true);return;
  }
  const lane={up:0,left:1,down:2}[dir];if(lane===undefined)return;
  const y=[185,280,380][lane],hits=[];
  for(let i=T.objects.length-1;i>=0;i--){
   const o=T.objects[i];
   if(o.type==='apple'&&Math.abs(o.x-285)<118&&Math.abs(o.y-y)<35){hits.push(o);T.objects.splice(i,1);}
  }
  pose(dir==='down'?'low':dir==='up'?'high':'slash',.3);
  lab.slashes.push({x:312,y:y,life:.24,max:.24});
  if(!hits.length){bad();return;}
  hits.forEach(function(o){burst(o.x,o.y,'#ffdc8c',11);good(Math.abs(o.x-285)<43);});
  const now=performance.now();
  if(now-lab.lastHit<420){T.score+=2;toast={text:'⚡ ¡CADENA!',color:'#fff4a5',t:.45};}
  lab.lastHit=now;updateHUD();return;
 }
 if(mode==='dodge'&&dir){
  const o=T.objects[0];
  if(o&&dir===({low:'up',high:'down',left:'right',right:'left'}[o.kind]))
   pose(dir==='up'?'jump':dir==='down'?'low':'dash',.35);
 }
 baseInput(key);
};
const basePressCritical=pressCritical;
pressCritical=function(){
 if(T?.running&&mode==='crit'){
  if(T.critStage==='ready')pose('jump',.4);
  if(T.critStage==='air')pose('slash',.32);
 }
 basePressCritical();
};
const baseTick=tick;
tick=function(dt){
 baseTick(dt);lab.poseLeft=Math.max(0,lab.poseLeft-dt);lab.flash=Math.max(0,lab.flash-dt);
 for(let i=lab.sparks.length-1;i>=0;i--){
  const p=lab.sparks[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;
  if(p.life<=0)lab.sparks.splice(i,1);
 }
 for(let i=lab.slashes.length-1;i>=0;i--){lab.slashes[i].life-=dt;if(lab.slashes[i].life<=0)lab.slashes.splice(i,1);}
};
const baseHero=drawHero;
drawHero=function(x,y){
 const active=lab.poseLeft>0&&T?.running,progress=active?lab.poseLeft/.35:0;
 let dx=0,dy=0;
 if(active){
  if(lab.pose==='jump'||lab.pose==='high')dy=-22*Math.sin(Math.PI*Math.min(1,1-progress));
  if(lab.pose==='low')dy=17;
  if(lab.pose==='dash')dx=33*(1-progress);
  if(lab.pose==='slash')dx=23*(1-progress);
  if(lab.pose==='back')dx=-22*(1-progress);
 }
 if(active&&(lab.pose==='dash'||lab.pose==='slash'||lab.pose==='back')){
  ctx.save();ctx.globalAlpha=.14*progress;baseHero(x-dx*.7,y+dy);ctx.restore();
 }
 baseHero(x+dx,y+dy);
 ctx.save();ctx.strokeStyle='#8a8052';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(x+dx-21,y+dy-83);ctx.lineTo(x+dx-9,y+dy-92);ctx.lineTo(x+dx+8,y+dy-88);ctx.stroke();
 ctx.fillStyle='#fff09a';ctx.fillRect(x+dx+12,y+dy-66,7,3);
 if(active&&['slash','high','low','back'].includes(lab.pose)){
  ctx.strokeStyle='#fff1ba';ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(x+dx+39,y+dy-24,lab.pose==='low'?60:76,-1.2,lab.pose==='low'?.45:.65);ctx.stroke();
  ctx.strokeStyle='#fffcdf';ctx.lineWidth=2;ctx.stroke();
 }
 ctx.restore();
};
const baseDummy=drawDummy;
drawDummy=function(x,y){
 baseDummy(x,y);ctx.save();ctx.strokeStyle='#584038';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(x-22,y-88);ctx.lineTo(x-7,y-85);ctx.moveTo(x+7,y-85);ctx.lineTo(x+22,y-88);ctx.stroke();
 ctx.fillStyle='#9c5344';ctx.fillRect(x-10,y-43,20,6);ctx.restore();
};
const baseRoom=drawRoom;
drawRoom=function(){
 baseRoom();ctx.save();ctx.strokeStyle='#95664a';ctx.globalAlpha=.23;ctx.lineWidth=2;
 for(let i=0;i<14;i++){const x=170+(i*73)%540,y=64+(i*57)%275;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14,y);ctx.lineTo(x+17,y-4);ctx.stroke();}
 ctx.strokeStyle='#694b3d';ctx.globalAlpha=.42;
 for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(720,0);ctx.lineTo(720-i*12,75);ctx.moveTo(720,0);ctx.lineTo(790,30+i*9);ctx.stroke();}
 for(let j=1;j<=4;j++){ctx.beginPath();ctx.arc(720,0,15+j*15,0,Math.PI*.8);ctx.stroke();}
 ctx.restore();
};
const baseDraw=draw;
draw=function(){
 baseDraw();ctx.save();
 for(const p of lab.sparks){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x-3,p.y-3,6,6);}
 for(const s of lab.slashes){
  ctx.globalAlpha=Math.max(0,s.life/s.max)*.9;ctx.strokeStyle='#fff1b7';ctx.lineWidth=11;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(s.x,s.y,80,-.9,.85);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke();
 }
 if(lab.flash>0){ctx.globalAlpha=lab.flash*1.15;ctx.fillStyle='#ff3f34';ctx.fillRect(0,0,900,506);}
 ctx.restore();
};
ENEMIES.push({name:'Veterano de hierro',icon:'🛡️',hp:275,atk:24});
ENEMIES.push({name:'Señor de la arena',icon:'🐉',hp:380,atk:30});
const choose=document.createElement('div');choose.className='souls-arena-select';
choose.innerHTML='<strong>Rivales por arena:</strong><button class="btn primary" type="button" data-waves="3">3 rivales</button><button class="btn" type="button" data-waves="5">5 rivales</button><span class="muted">El último es el jefe.</span>';
$('arena').querySelector('h2').insertAdjacentElement('afterend',choose);
choose.querySelectorAll('[data-waves]').forEach(function(b){
 b.onclick=function(){
  lab.arenaWaves=Number(b.dataset.waves);
  choose.querySelectorAll('[data-waves]').forEach(function(el){el.classList.toggle('primary',el===b);});
  A=null;$('log').innerHTML='';renderArena();
 };
});
$('arena').querySelector('aside .panel').insertAdjacentHTML('beforeend','<p>4. 🛡️ Veterano de hierro</p><p>5. 🐉 Señor de la arena</p>');
const baseDeal=deal;
deal=function(d){
 if(lab.arenaWaves===3){baseDeal(d);return;}
 if(!A||A.over)return;
 animateFighter('heroFigure','swing');animateFighter('enemyFigure','struck');
 A.enemy=Math.max(0,A.enemy-d);combatLog('🗡️ Infligís '+Math.round(d)+' de daño.');
 if(A.enemy<=0){
  A.wave++;
  if(A.wave>=lab.arenaWaves){
   A.over=true;const gold=180+S.wins*35;S.wins++;S.coins+=gold;
   combatLog('🏆 ¡Victoria! Derrotaste a los cinco. +'+gold+' monedas.');save();renderStats();
  }else{A.hero=Math.min(maxHP(),A.hero+Math.round(maxHP()*.12));nextEnemy();}
 }
 renderArena();
};
const baseRenderArena=renderArena;
renderArena=function(){
 baseRenderArena();
 if(A){
  $('enemyName').textContent=A.over&&A.wave>=lab.arenaWaves?'¡Campeón!':ENEMIES[Math.min(A.wave,ENEMIES.length-1)].name;
  $('arenaStatus').textContent=A.over?'Desafío terminado. Podés iniciar otro.':'Rival '+(A.wave+1)+' de '+lab.arenaWaves+' · Ataques automáticos activos';
 }
};
const baseNext=nextEnemy;
nextEnemy=function(){baseNext();if(A.wave===lab.arenaWaves-1)combatLog('👑 ¡JEFE DE ARENA!');};
const baseShop=renderShop;
renderShop=function(){
 baseShop();let holder=$('soulsStations');
 if(!holder){holder=document.createElement('div');holder.id='soulsStations';$('shopList').insertAdjacentElement('afterend',holder);}
 holder.innerHTML='<h2 style="margin-top:22px">🏋️ Estaciones de entrenamiento</h2><p class="muted">Cada mejora suma un nivel adicional del atributo al completar una sesión.</p><div class="shopgrid">'+
 Object.keys(MODES).map(function(k){
  const lv=S.stations[k],cost=45*(lv+1)*(lv+1);
  return '<div class="shopitem"><b>'+MODES[k].icon+' '+MODES[k].name+' · Estación Nv '+lv+'</b><p>Bonificación: +'+lv+' niveles por sesión</p><button class="btn" data-station="'+k+'" '+(S.coins<cost?'disabled':'')+'>Mejorar · '+cost+' 🪙</button></div>';
 }).join('')+'</div>';
 holder.querySelectorAll('[data-station]').forEach(function(b){
  b.onclick=function(){
   const k=b.dataset.station,lv=S.stations[k],cost=45*(lv+1)*(lv+1);
   if(S.coins<cost)return;S.coins-=cost;S.stations[k]++;save();renderStats();
  };
 });
};
renderStats();
window.ArgentumSoulsBridge={schema:'souls-lab-prototype-v1',exportProgress:function(){
 return JSON.parse(JSON.stringify({stats:S.stats,gear:S.gear,stations:S.stations,coins:S.coins,arenaWins:S.wins}));
}};
})();