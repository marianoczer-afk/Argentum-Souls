import {Combat} from '../src/combat/model.js';
import {ARENAS,REGIONS} from '../src/combat/regions.js';
import {loadState,xpRequired} from '../src/state.js';
import {claimArena} from '../src/progression/arena-progress.js';
import {equipmentCost} from '../src/progression/equipment.js';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
export function simulateBattle(state,id,seed=1,active=true){let n=seed,waveStart=0;const waveTimes=[];const c=new Combat({state,arena:id,random:()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32;}});while(!c.over&&c.time<180){if(active){c.use('slash');if(c.hero<c.heroStats.hp*.65)c.use('heal');if(c.enemyAttack?.charged||c.hero<c.heroStats.hp*.5)c.use('shield');}const wave=c.wave,phase=c.phase,kills=c.kills;c.update(1/30);if(c.kills>kills)waveTimes[wave]=c.time-waveStart;if(c.wave> wave&&c.phase==='fight')waveStart=c.time;}return{waveTimes,win:c.phase==='victory',seconds:c.time,kills:c.kills,hp:c.hero};}
const profiles=[
 {name:'Equilibrado',stats:{str:75,def:75,acc:75,dodge:75,crit:75},gear:8},
 {name:'Fuerza y crítico',stats:{str:100,def:35,acc:65,dodge:40,crit:90},gear:8},
 {name:'Defensa y esquiva',stats:{str:55,def:100,acc:65,dodge:100,crit:45},gear:8},
 {name:'Equipo fuerte',stats:{str:50,def:50,acc:50,dodge:50,crit:50},gear:14},
 {name:'Intermedio',stats:{str:40,def:40,acc:40,dodge:40,crit:40},gear:4},
];
const rows=[];
for(const profile of profiles){const state=loadState({getItem:()=>null});Object.assign(state.stats,profile.stats);for(const k in state.gear)state.gear[k]=profile.gear;
 for(const a of ARENAS){let wins=0,time=0,kills=0;const waveTotals=[0,0,0,0],waveSamples=[0,0,0,0];for(let seed=1;seed<=12;seed++){const r=simulateBattle(state,a.id,seed);wins+=r.win;time+=r.seconds;kills+=r.kills;for(let w=0;w<4;w++)if(r.waveTimes[w]){waveTotals[w]+=r.waveTimes[w];waveSamples[w]++;}}rows.push({profile:profile.name,arena:a.id,region:a.region,boss:a.regionalBoss,winRate:wins/12,seconds:time/12,kills:kills/12,waveSeconds:waveTotals.map((n,w)=>waveSamples[w]?n/waveSamples[w]:null)});}
}
const route=loadState({getItem:()=>null});Object.assign(route.stats,profiles[0].stats);for(const key in route.gear)route.gear[key]=8;let rewardTotal=0;
for(let id=1;id<=100;id++){assert.ok(simulateBattle(route,id,41).win,`all arenas must resolve as four real fights: ${id}`);const reward=claimArena(route,id);assert.ok(reward);rewardTotal+=reward.gold;assert.equal(claimArena(route,id),null);}
assert.equal(route.arena.completed,100);
const xpTo=level=>{let xp=0;for(let i=0;i<level;i++)xp+=xpRequired(i);return xp;};
const estimates=profiles.slice(0,4).map(p=>{const xp=Object.values(p.stats).reduce((n,l)=>n+xpTo(l),0);let gearCost=0;for(const slot of Object.keys(route.gear))for(let level=0;level<p.gear;level++)gearCost+=equipmentCost(slot,level);return{...p,xp,gearCost,hours:{learning:xp/(8*3600),practiced:xp/(15*3600),expert:xp/(26*3600)}};});
const mono=[];
for(const key of ['str','def','acc','dodge','crit']){const state=loadState({getItem:()=>null});state.stats[key]=120;for(const k in state.gear)state.gear[k]=8;let wins=0,time=0;for(let seed=1;seed<=30;seed++){const r=simulateBattle(state,100,seed);wins+=r.win;time+=r.seconds;}mono.push({attribute:key,level:120,xp:xpTo(120),winRate:wins/30,seconds:time/30});}
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/arena-balance.json',import.meta.url),JSON.stringify({seeds:12,rows,estimates,rewardTotal,mono},null,2));
let md='# Balance de cien arenas — A.3.1\n\nSimulación reproducible: 100 arenas × 5 perfiles × 12 semillas (6000 combates de cuatro rivales). Mismo motor que el navegador, paso de 1/30 s, límite del simulador 180 s; el juego no decide un ganador de antemano. Habilidades automáticas de la política: especial disponible, cura al bajar de 65% de HP y guardia ante carga o vida inferior a 50%. No son sesiones humanas. Cada semilla resuelve todos los impactos y transiciones.\n\n';
md+='|Perfil|1|10|25|50|75|90|100|Tiempo medio arena 100|\n|---|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for(const p of profiles){const row=id=>rows.find(r=>r.profile===p.name&&r.arena===id);md+=`|${p.name}|${[1,10,25,50,75,90,100].map(id=>(row(id).winRate*100).toFixed(0)+'%').join('|')}|${row(100).seconds.toFixed(1)} s|\n`;}
md+='\n## Regiones y jefes\n\n|Región|Arena final|Jefe|Victoria equilibrada|Tiempo|\n|---|---:|---|---:|---:|\n';for(const r of REGIONS){const row=rows.find(a=>a.profile===profiles[0].name&&a.arena===r.id*10);md+=`|${r.name}|${r.id*10}|${r.boss}|${(row.winRate*100).toFixed(0)}%|${row.seconds.toFixed(1)} s|\n`;}
md+='\n## Duración de los cuatro rivales en arena 100\n\nSegundos de combate por rival derrotado (excluye transición; derrotas parciales solo aportan encuentros ya terminados).\n\n|Perfil|Inicial|Intermedio|Élite|Jefe|\n|---|---:|---:|---:|---:|\n';for(const p of profiles){const r=rows.find(r=>r.profile===p.name&&r.arena===100);md+=`|${p.name}|${r.waveSeconds.map(n=>n===null?'—':n.toFixed(1)).join('|')}|\n`;}
md+=`\nLas primeras victorias entregan ${rewardTotal} monedas y diez mejoras de equipo. Se conserva la economía de premios y costes de equipo/estaciones de A.3; la sala compite por esas monedas. Las antiguas horas a 15 XP/s quedan sustituidas por el [balance nuevo de combos, sala y estaciones](BALANCE_A31_XP.md). No se afirma mantener la duración de 255 h con recompensas por combo crecientes.\n`;
md+='\n## Concentrar todo en un atributo\n\nCada sonda usa un solo atributo a 120, los demás a cero, equipo 8 y 30 semillas en arena 100. Su presupuesto de XP se aproxima al de los cinco atributos a 75.\n\n|Atributo único|Probabilidad de victoria|Tiempo medio|\n|---|---:|---:|\n';for(const m of mono)md+=`|${m.attribute}|${(m.winRate*100).toFixed(0)}%|${m.seconds.toFixed(1)} s|\n`;
md+='\nLa referencia de seis meses laborables a dos horas diarias equivale a unas 260 horas. Ese objetivo histórico debe recalibrarse con la nueva XP de A.3.1; los perfiles extremos y la tasa efectiva producen diferencias amplias. La vía de equipo reduce necesidades de entrenamiento, pero necesita más monedas y pierde eficiencia después de calidad 8; debe vigilarse con partidas reales, no declararse perfectamente equilibrada. Las probabilidades son muestras de 12 semillas, no porcentajes exactos de toda la población. No se exige nivel 100 en ninguna combinación ni se usa un nivel global. Todas las fórmulas se centralizan en combat/balance.js, progression/equipment.js y state.js.\n';
await writeFile(new URL('../docs/ARENA_BALANCE.md',import.meta.url),md);console.log('PASS 6000 arena simulations + 150 single-attribute probes, full 1–100 progression, idempotent rewards; wrote docs/ARENA_BALANCE.md');
