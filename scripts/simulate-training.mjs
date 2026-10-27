import {Training,strengthKey,MODES} from '../src/training/model.js';
import {difficultyTarget,tuning} from '../src/training/balance.js';
import {DODGE,SWORD} from '../src/training/geometry.js';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const samples=[0,25,50,75,100,150],rows=[],seconds=120;
for(const combo of samples)for(const mode of Object.keys(MODES))for(const profile of ['instant','constrained']){
 let seed=1042;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const e=new Training({random});e.start(mode);const d=difficultyTarget(combo),p=tuning(mode,d),seen=new Map(),actions=new Set();
 let spawns=0,bursts=0,maxObjects=0,maxSpeed=0,minSpeed=Infinity,minGap=Infinity,lastArrival=-Infinity,lastAction=-Infinity,lastHit=-99,angle=0,lastHits=0,minLead=Infinity;
 for(let tick=0;tick<seconds*120;tick++){
  const s=e.session;s.combo=combo;s.difficulty=d;
  if(s.hits!==lastHits){lastHits=s.hits;lastHit=s.time;}
  if(mode==='str')for(const o of [...s.objects])if(o.type==='apple'&&Math.abs(o.x-350)<(profile==='instant'?24:18)&&!actions.has(o.id)&&s.time-lastAction>(profile==='instant'?0:.11)){
   e.input(strengthKey(o.lane));actions.add(o.id);lastAction=s.time;
  }
  if(mode==='def'){
   const o=[...s.objects].sort((a,b)=>a.arrival-b.arrival)[0];if(o){const target=Math.atan2(o.y-390,o.x-600),delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));
    if(profile==='instant')angle=target;else if(s.time-lastHit>=.16)angle+=Math.max(-1000*Math.PI/180/120,Math.min(1000*Math.PI/180/120,delta));
    e.setPointer(600+Math.cos(angle)*180,390+Math.sin(angle)*180);
   }
  }
  if(mode==='acc'&&s.time-lastAction>(profile==='instant'?0:.18)){
   const o=s.objects.find(o=>o.age>(profile==='instant'?.1:.18));if(o){e.click(o.x+o.r*(profile==='instant'?0:.18),o.y);lastAction=s.time;}
  }
  if(mode==='dodge'){const o=s.objects[0];if(o&&!o.resolved&&o.age>=o.windup+(profile==='instant'?.02:.1))e.input({low:'ArrowUp',high:'ArrowDown',mid:'ArrowLeft'}[o.kind]);}
  if(mode==='crit'){const c=s.critical;if(c.stage==='ready'&&c.clock>=(profile==='instant'?0:.18))e.input(' ');else if(c.stage==='air'&&c.clock>=(profile==='instant'?.1:.18))e.input(' ');}
  const before=new Map(s.objects.map(o=>[o.id,{x:o.x,y:o.y}]));e.update(1/120);maxObjects=Math.max(maxObjects,s.objects.length);
  for(const o of s.objects){
   if(o.type==='star')continue;
   const old=before.get(o.id);if(old&&o.type==='apple'){const speed=Math.hypot(o.x-old.x,o.y-old.y)*120;maxSpeed=Math.max(maxSpeed,speed);minSpeed=Math.min(minSpeed,speed);}
   if(!seen.has(o.id)){seen.set(o.id,{visible:false});spawns++;bursts+=o.burst?1:0;if(o.arrival!==undefined){minGap=Math.min(minGap,o.arrival-lastArrival);lastArrival=o.arrival;}}
   const record=seen.get(o.id);if(!record.visible&&o.type==='apple'&&o.x>=17&&o.x<=1183&&o.y>=17&&o.y<=703){record.visible=true;minLead=Math.min(minLead,o.arrival-s.time);}
  }
 }
 assert.equal(e.session.misses,0,`${profile} ${mode} combo ${combo}: failed constrained sequence`);
 if(mode==='def')assert.ok(minGap>=.28-1e-8);
 if(mode==='str')assert.ok(minGap>=.19-1e-8);
 rows.push({combo,mode,profile,intensity:+d.toFixed(4),parameters:p,seconds,spawns,bursts,maxObjects,maxSpeed:+maxSpeed.toFixed(1),minSpeed:Number.isFinite(minSpeed)?+minSpeed.toFixed(1):null,minGap:Number.isFinite(minGap)?+minGap.toFixed(3):null,minVisibleLead:Number.isFinite(minLead)?+minLead.toFixed(3):null,hits:e.session.hits,misses:e.session.misses});
}
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/balance-a3.json',import.meta.url),JSON.stringify(rows,null,2));
const f=n=>n.toFixed(3);
let md='# Balance y presupuestos de respuesta — A.3\n\nCombos 0/25/50/75/100/150, cinco modos y dos perfiles de entrada, 120 segundos por escenario (60 simulaciones, semilla 1042). Intensidad fijada como fixture; la física, las ventanas y los controles del motor son reales. Los perfiles completaron las secuencias sin fallos. La simulación usa un mundo 1200×720; el navegador puede ampliarlo horizontalmente sin deformar los actores. Esto verifica límites y compatibilidad entre controles/animaciones, no demuestra dificultad humana.\n\n';
md+='|Combo|Intensidad|Fuerza horizontal / intervalo base / prob. ráfaga|Defensa viaje base / intervalo / prob. ráfaga|Precisión radio cercano / intervalo / vida / movimiento|Esquiva anticipación base / Perfecto|Crítico salto / aire / amague|\n|---:|---:|---|---|---|---|---|\n';
for(const combo of samples){const d=difficultyTarget(combo),s=tuning('str',d),b=tuning('def',d),a=tuning('acc',d),v=tuning('dodge',d),c=tuning('crit',d);
 md+=`|${combo}|${f(d)}|${f(s.speed)} ±10 px/s / ${f(s.interval)} s / ${(s.pairChance*100).toFixed(0)}%|${f(b.travel)} s / ${f(b.interval)} s / ${(b.pairChance*100).toFixed(0)}%|${(a.radius*1.36).toFixed(1)}–${(a.radius*1.36+3).toFixed(1)} px / ${f(a.interval)} s / ${f(a.life)}–${f(a.life+.12)} s / ${f(a.motion)} px/s|${f(v.windup)} s ±10% / ${(-v.perfectBefore*1000).toFixed(0)} a +${(v.perfectAfter*1000).toFixed(0)} ms del ataque|${f(c.ready)} s ±6% / ${f(c.air)} s ±4% / ${(c.fakeChance*100).toFixed(0)}%|\n`;
}
md+='\nLas frases alternan factores 0,82/1/1,16 durante 3–6 lanzamientos, con variación de intervalo ±8%. Fuerza también varía su velocidad por frase, limitada a 240–600 px/s horizontales. La curva alta modifica la velocidad total instantánea; la tabla siguiente la mide a partir de posiciones, no solo de vx. Los tres tipos nacen en la mano del muñeco, no en el borde superior. Defensa varía el tiempo de viaje levemente por frase y nunca baja de 1,02 s. Las ráfagas de Fuerza y Defensa pueden tener tres objetos; se reserva su espacio antes de comenzar una nueva frase.\n\n';
md+='|Combo|Modo|Proyectil: velocidad total medida mín–máx px/s|Objetos/s o aciertos/s|Objetos de ráfaga|Menor intervalo de impactos|Menor aviso visible hasta contacto|\n|---:|---|---:|---:|---:|---:|---:|\n';
for(const r of rows.filter(r=>r.profile==='constrained'))md+=`|${r.combo}|${r.mode}|${r.minSpeed??'—'}–${r.maxSpeed||'—'}|${f((['dodge','crit'].includes(r.mode)?r.hits:r.spawns)/seconds)}|${r.bursts}|${r.minGap??'—'} s|${r.minVisibleLead??'—'} s|\n`;
md+='\n## Presupuestos de respuesta\n\n- Fuerza: una sola espada activa. El primer movimiento responde al pulsar; un cambio durante los primeros 45 ms guarda únicamente la última dirección. Se aplica al siguiente paso físico de 8,33 ms, conducido por requestAnimationFrame (unos 16,7 ms por frame a 60 Hz), sin esperar a la animación de 160 ms. Las llegadas se separan al menos 190 ms: quedan más de 130 ms por encima del compromiso y del paso físico. El perfil restringido limita nuevas acciones a una por 110 ms y apunta con margen de 18 px; es una prueba de capacidad, no una medición de reflejos. La ventana de acierto de 230 px dura aproximadamente 0,38–0,96 s; Perfecto (70 px) dura 0,12–0,29 s según velocidad horizontal. Los ataques pueden cortar más de una fruta en la misma altura.\n- Defensa: orientación directa, sin vuelta obligatoria. Separación de impactos `max(330−50*d ms, 180 ms + ángulo/π * 200 ms)`; para un giro de 180° hay al menos 380 ms. El perfil restringido espera 160 ms después de cada bloqueo y gira a un máximo de 1000°/s, sin teletransportar la orientación; completa ambos sentidos. Es una hipótesis de jugador entrenado que necesita validación personal. El escudo es un sector anular de radio 76, profundidad 21,4 y apertura 0,88 radianes, compartido por dibujo y colisión. Las frutas pasan a ser imbloqueables al atravesar el radio de 76 px y rompen combo al tocar el cuerpo.\n- Precisión: 50% cercanos, 35% medianos y 15% lejanos; radio base multiplicado por 1,36/1,08/0,82. Ajuste por escala táctil. Perfecto sigue dentro del 16% del radio. Perfil restringido: mínimo 180 ms entre toques, tiempo inicial de lectura 180 ms y desviación lateral del 18% del radio (Bien). No se exige perfección de píxel para mantener combo.\n- Esquiva: solo cabezazo/agacharse, brazo/retroceder y patada/saltar. Preparación visible desde el comienzo; círculo blanco y `Perfecto` comparten la misma función: empieza 75–50 ms antes y termina 135–110 ms después del inicio de ataque (210–160 ms según combo). Bien desde el 20% de anticipación hasta +230 ms. Animación corporal responde sin esperar puntuación, que se confirma al cerrar la ventana. Perfil restringido actúa 100 ms después del inicio del golpe, es decir 150–175 ms después de abrir el círculo blanco.\n- Crítico: señal roja y dorada comparten círculo y exclamación, distinguidas por color y texto. Pausas normales de 0,13–0,49 s según frase; nunca aceleran indefinidamente. Perfecto aéreo 80–180 ms; el resto de la fase aérea da Bien sin romper combo. Perfil restringido reacciona en 180 ms a ambos avisos; ignorar el rojo conserva su XP/combo una sola vez.\n\nEl perfil instantáneo sirve de control. El restringido comprueba que las secuencias toleran una latencia y cadencia limitadas; ninguno reemplaza a una persona. Las pruebas de Chromium agregan controles nativos, posiciones y píxeles dibujados, tres movimientos corporales distintos, pantalla completa y revisión visual de capturas actuales. No se afirma haber realizado una sesión humana ni una prueba en teléfono físico.\n';
await writeFile(new URL('../docs/BALANCE_A3.md',import.meta.url),md);console.log('PASS 60 balance scenarios × 120 s (instant/constrained); zero misses. docs/BALANCE_A3.md and artifacts/balance-a3.json');
