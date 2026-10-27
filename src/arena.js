import {equipmentName} from './progression/equipment.js';
import {mountStage} from './stage.js';
import {Combat,ABILITIES} from './combat/model.js';
import {BattleRenderer} from './combat/render.js';
import {ARENAS,REGIONS} from './combat/regions.js';
import {heroStats} from './combat/balance.js';
import {claimArena} from './progression/arena-progress.js';
export function mountArena(state,save,renderProgress,canMutate=()=>true,root=document,feedback=()=>{}){
 const $=id=>root.querySelector('#'+id),renderer=new BattleRenderer($('battleCanvas'));let fight=null,selected=Math.min(100,state.arena.completed+1),view=false,speed=1,pausedForView=false,lastPhase='',lastMap=-1;
 function map(){if(lastMap===state.arena.completed)return;lastMap=state.arena.completed;$('arenaRegions').innerHTML=REGIONS.map(region=>`<details ${region.id===Math.min(10,Math.floor(state.arena.completed/10)+1)?'open':''}><summary style="border-color:${region.sky}">${region.id}. ${region.name}</summary><div class="arena-grid">${ARENAS.filter(a=>a.region===region.id).map(a=>`<button class="arena-node ${a.id<=state.arena.completed?'completed':''}" data-arena="${a.id}" ${a.id>state.arena.completed+1?'disabled':''} title="${a.title}">${a.id}${a.regionalBoss?' ♛':''}${a.id<=state.arena.completed?' ✓':''}</button>`).join('')}</div></details>`).join('');$('arenaRegions').querySelectorAll('[data-arena]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.arena);fight=null;$('arenaMapDialog').close();render();b.blur();});}
 function start(){if(!canMutate()||selected>Math.min(100,state.arena.completed+1))return;
  fight=new Combat({state,arena:selected,feedback,onVictory(id){if(!canMutate())return null;const reward=claimArena(state,id);const status=save();renderProgress();lastMap=-1;return reward?{...reward,status}:null;}});fight.setSpeed(speed);lastPhase='';render();}
 function render(){for(const b of root.querySelectorAll('[data-speed]')){b.classList.toggle('active',Number(b.dataset.speed)===speed);b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));}map();const a=ARENAS[selected-1],h=fight?.heroStats??heroStats(state);$('arenaTitle').textContent=`Arena ${selected} · ${a.title}`;$('arenaSelection').textContent=`${state.arena.completed}/100 completadas · ${state.wins} victorias · ${Math.floor(state.arena.completed/10)} trofeos · ${a.enemies.map(e=>e.name).join(' → ')}`;
  $('fightStart').disabled=!canMutate()||selected>Math.min(100,state.arena.completed+1)||!!fight&&!fight.over;$('fightStart').textContent=fight?.over?'Reintentar':'Iniciar arena';$('nextArena').hidden=!(fight?.phase==='victory'&&selected<100&&selected<=state.arena.completed);$('arenaMapToggle').textContent='Mapa · '+Math.min(100,state.arena.completed+1)+'/100';
  $('heroHp').style.width=`${(fight?.hero??h.hp)/h.hp*100}%`;$('heroHpText').textContent=`${Math.ceil(fight?.hero??h.hp)} / ${Math.ceil(h.hp)}`;$('enemyHp').style.width=`${fight?fight.enemy/fight.enemyStats.hp*100:100}%`;$('enemyHpText').textContent=fight?`${Math.ceil(fight.enemy)} / ${fight.enemyStats.hp}`:'Preparado';$('enemyName').textContent=fight?.enemyInfo.name??a.enemies[0].name;
  $('arenaStatus').textContent=fight?`Rival ${fight.wave+1} de 4 · ${fight.phase==='victory'?'Victoria':fight.phase==='defeat'?'Derrota':fight.phase==='transition'?'Siguiente rival…':fight.paused?'Pausa':'Combate en vivo'}`:'Derrotá cuatro rivales para desbloquear la siguiente arena.';
  for(const [key,id] of [['slash','skillSlash'],['shield','skillShield'],['heal','skillHeal']]){const cd=fight?.cooldowns[key]??0;$(id).disabled=!canMutate()||!fight||fight.over||fight.paused||fight.phase!=='fight'||cd>0;$(id).textContent=ABILITIES[key].name+(cd>0?` · ${cd.toFixed(1)}s`:'');}
  $('arenaPause').disabled=!fight||fight.over;$('arenaPause').textContent=fight?.paused?'Continuar':'Pausar';$('arenaResult').hidden=!fight?.over;
  if(fight?.over){const r=fight.reward; $('arenaResultTitle').textContent=fight.phase==='victory'?'¡VICTORIA!':'Podés volver más fuerte';$('arenaResultText').textContent=fight.phase==='defeat'?'Conservás niveles, equipo, monedas y arenas desbloqueadas.':r?`+${r.gold} monedas${r.equipment?' · '+equipmentName(r.equipment.slot,r.equipment.level):''}${r.trophy?' · Trofeo de región '+r.trophy:''}${r.regionUnlocked?' · Nueva región '+r.regionUnlocked:''} · ${r.status.message}`:'Práctica completada · esta arena ya entregó su recompensa.';}
  if(fight&&lastPhase!==`${fight.phase}:${fight.wave}:${fight.log[0]}`){lastPhase=`${fight.phase}:${fight.wave}:${fight.log[0]}`;$('log').textContent=fight.log.slice(0,6).join('\n');}
  renderer.drawBattle(fight,selected);
 }
 root.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=Number(b.dataset.speed);fight?.setSpeed(speed);b.blur();render();});
 $('fightStart').onclick=start;$('nextArena').onclick=()=>{selected=Math.min(100,selected+1);fight=null;start();};$('arenaPause').onclick=()=>{if(!canMutate()||!fight)return;fight.paused=!fight.paused;render();$('arenaPause').blur();};
 for(const [key,id] of [['slash','skillSlash'],['shield','skillShield'],['heal','skillHeal']])$(id).onclick=()=>{if(canMutate())fight?.use(key);$(id).blur();render();};
 $('arenaMapToggle').onclick=()=>{$('arenaMapDialog').showModal();if(fight&&!fight.over)fight.paused=true;render();};$('closeArenaMap').onclick=()=>$('arenaMapDialog').close();
 window.addEventListener('blur',()=>{if(fight&&!fight.over){fight.paused=true;render();}});
 const stage=mountStage({frame:$('battleScene'),canvas:$('battleCanvas'),host:$('battleHost'),height:600});
 render();return{render,update(dt){if(view&&canMutate()){fight?.syncBuild(state);fight?.advance(dt);}},draw(){if(view)render();},pause(){if(fight)fight.paused=true;},setView(active){if(!active&&fight&&!fight.over){pausedForView=!fight.paused;fight.paused=true;}if(active&&pausedForView&&fight){fight.paused=false;pausedForView=false;}view=active;render();}};
}
