import {Training,strengthKey,MODES} from '../src/training/model.js';
import {difficultyTarget,tuning} from '../src/training/balance.js';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const rows=[];
for(const combo of [0,10,25,50,100,150,200])for(const mode of Object.keys(MODES)){
 let seed=1042;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const e=new Training({random});e.start(mode);const d=difficultyTarget(combo),p=tuning(mode,d);
 let maxObjects=0,bursts=0,spawns=0,maxSpeed=0,minArrivalGap=Infinity,lastArrival=-Infinity;const seen=new Set();
 // Fixture holds combo/intensity constant; all objects, collisions and grading are real.
 for(let tick=0;tick<120*120;tick++){
  const s=e.session;s.combo=combo;s.difficulty=d;
  if(mode==='str')for(const o of [...s.objects]){if(o.type==='star')e.input('ArrowLeft');else if(Math.abs(o.x-350)<24)e.input(strengthKey(o.lane));}
  if(mode==='def') {const o=[...s.objects].sort((a,b)=>a.arrival-b.arrival)[0];if(o)e.setPointer(o.x,o.y);}
  if(mode==='acc')for(const o of [...s.objects])if(o.age>.25)e.click(o.x,o.y);
  if(mode==='dodge'){const o=s.objects[0];if(o&&!o.resolved&&o.age>=o.windup*.68)e.input({low:'ArrowUp',high:'ArrowDown',left:'ArrowRight',right:'ArrowLeft'}[o.kind]);}
  if(mode==='crit'){const c=s.critical;if(c.stage==='ready')e.input(' ');else if(c.stage==='air'&&c.clock>=.1)e.input(' ');}
  e.update(1/120);maxObjects=Math.max(maxObjects,s.objects.length);
  for(const o of s.objects){maxSpeed=Math.max(maxSpeed,Math.hypot(o.vx??0,o.vy??0));if(seen.has(o.id))continue;seen.add(o.id);spawns++;bursts+=o.burst?1:0;if(mode==='def'){minArrivalGap=Math.min(minArrivalGap,o.arrival-lastArrival);lastArrival=o.arrival;}}
 }
 assert.equal(e.session.misses,0,`${mode} combo ${combo}: solver must complete fair sequences`);
 if(mode==='def')assert.ok(minArrivalGap>=.26-1e-8);
 rows.push({combo,mode,intensity:+d.toFixed(4),parameters:p,simulation:{seconds:120,spawns,bursts,maxObjects,maxSpeed:+maxSpeed.toFixed(2),minArrivalGap:Number.isFinite(minArrivalGap)?+minArrivalGap.toFixed(4):null,hits:e.session.hits,misses:e.session.misses}});
}
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/balance-a1.json',import.meta.url),JSON.stringify(rows,null,2));
const f=n=>n.toFixed(3);
let md='# Balance medido — Entrega A.1\n\nCada fila simula 120 segundos, con semilla 1042 y combo/intensidad fijados como fixture. El solucionador usa entradas del motor; todos los objetos y ventanas se ejecutan. No representa la velocidad de una persona ni calibra la curva definitiva de XP. 35 escenarios, sin fallos del solucionador.\n\n';
md+='|Combo|Intensidad|Fuerza px/s / intervalo / ráfaga|Defensa viaje / intervalo / ráfaga|Precisión radio / vida / movimiento / intervalo / pareja|Esquiva anticipación / Bien / Perfecto|Crítico salto / aire / amague|\n|---:|---:|---|---|---|---|---|\n';
for(const combo of [0,10,25,50,100,150,200]){
 const d=difficultyTarget(combo),s=tuning('str',d),b=tuning('def',d),a=tuning('acc',d),v=tuning('dodge',d),c=tuning('crit',d);
 md+=`|${combo}|${f(d)}|${f(s.speed)} ±15 / ${f(s.interval)} s / ${(s.pairChance*100).toFixed(1)}%|${f(b.travel)} s / ${f(b.interval)} s / ${(b.pairChance*100).toFixed(1)}%|${a.radius}–${a.radius+3} px / ${f(a.life)}–${f(a.life+.12)} s / ${f(a.motion)} px/s / ${f(a.interval)} s / ${(a.pairChance*100).toFixed(1)}%|${f(v.windup)} s / ${f(.2*v.windup)}–${f(v.windup+.08)} s / ${f(.62*v.windup)}–${f(.8*v.windup)} s|${f(c.ready)} s / ${f(c.air)} s / ${(c.fakeChance*100).toFixed(1)}%|\n`;
}
md+='\nIntervalos normales: variación ±10%. Ráfagas: segundo objeto después de 0,17–0,21 s en Fuerza, 0,28–0,34 s en Defensa y 0,30–0,36 s en Precisión. Defensa conserva al menos 0,26 s entre impactos, con viaje mínimo 1,4 s. La velocidad depende del borde de entrada: se mide en el JSON, no es uniforme por dirección. Fuerza reordena llegadas si harían falta cortes en alturas distintas con menos de 0,17 s de separación; las velocidades pueden bajar para conservar esa distancia.\n\nPrecisión: diámetro físico mínimo previsto 50 px con ajuste por escala (radio máximo 110 px del mundo); Perfecto dentro de 16% del radio. Movimiento vertical hasta la mitad del horizontal. Separación mínima entre círculos: 30 px durante el movimiento; no se superponen. Esquiva: línea visible desde el nacimiento; antes del 20% es Fallo, del 20% al 62% es Bien, del 62% al 80% Perfecto y después Bien hasta +80 ms. Resultado al golpe; ejecución recta de 140 ms. Crítico: ventana Perfecta aérea 75–200 ms; máximo tres amagues consecutivos; las ventanas se fijan al mostrar cada señal.\n\nDificultad = min(1, log(1+combo/40)/log(6)), subida máxima 0,25/s y recuperación 0,55/s. A cero vuelve accesible en un máximo de 1,82 s. El tiempo de sesión no altera el objetivo.\n';
md+='\n## Tasas medidas en la simulación\n\n|Combo|Modo|Objetos/s (o aciertos/s en Esquiva/Crítico)|Ráfagas|Velocidad máxima px/s|Menor separación de impactos Defensa|\n|---:|---|---:|---:|---:|---:|\n';
for(const r of rows){const m=r.simulation;md+=`|${r.combo}|${r.mode}|${f((['dodge','crit'].includes(r.mode)?m.hits:m.spawns)/120)}|${m.bursts}|${m.maxSpeed}|${m.minArrivalGap??'—'}|\n`;}
await writeFile(new URL('../docs/BALANCE_A1.md',import.meta.url),md);
console.log('PASS 35 seeded simulations × 120 seconds; zero solver misses. Wrote docs/BALANCE_A1.md and artifacts/balance-a1.json');
