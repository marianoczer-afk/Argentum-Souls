export const MODES = {
  str: { name: 'Fuerza', icon: '🗡️', desc: 'Cortá manzanas altas, medias y bajas. Una trayectoria puede cortar varias. Las estrellas aparecen detrás.', guide: '↑ / W: corte alto · → / D: corte medio · ↓ / S: corte bajo · ← / A: estrella. Encadená pulsaciones; no hay recarga.' },
  def: { name: 'Defensa', icon: '🛡️', desc: 'Orientá el escudo hacia cada proyectil cuando llegue al círculo de impacto.', guide: 'Mové el mouse o arrastrá el dedo alrededor del guerrero. El escudo responde directamente al puntero.' },
  acc: { name: 'Precisión', icon: '🎯', desc: 'Apuntá y dispará a los blancos antes de que se desvanezcan. El centro da un perfecto.', guide: 'Mouse o toque: acertá dentro del blanco. El arco acompaña la mira; cada disparo deja una trayectoria. Perfecto solo muy cerca del centro. Desde combo 15 se mueven; desde 25 pueden aparecer parejas.' },
  dodge: { name: 'Esquiva', icon: '💨', desc: 'Preparación → señal → destello perfecto → golpe. Reaccioná a la señal, no antes.', guide: '↑: saltá el barrido bajo · ↓: agachate ante el alto · →: evitá izquierda · ←: evitá derecha. La señal muestra la tecla necesaria.' },
  crit: { name: 'Crítico', icon: '✨', desc: '☠ Calavera: esperá. ❗ Exclamación: saltá. ⚡ En el aire: pulsá otra vez para golpear.', guide: 'ESPACIO, Enter o clic. Pulsar un amague, adelantarse al aviso aéreo o dejar pasar una señal rompe el combo.' },
};
const DIRS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
export const WORLD = Object.freeze({ width: 1200, height: 720, heroX: 330, heroY: 490, hitX: 350, centerX: 600, centerY: 390 });
export const LANES = [350, 450, 550];
export const strengthKey = lane => ['ArrowUp', 'ArrowRight', 'ArrowDown'][lane];
export function dodgePhase(cue) {
  const p = cue.age / cue.windup;
  return p < .3 ? 'prepare' : p < .62 ? 'signal' : p < .8 ? 'perfect' : p < 1 ? 'late' : 'strike';
}
const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// The simulation owns time; rendering and DOM events never choose game outcomes.
export class Training {
  constructor({ random = Math.random, reward = () => {}, feedback = () => {} } = {}) {
    this.random = random; this.reward = reward; this.feedback = feedback;
    this.pointer = { x: 750, y: 390 }; this.scale = 1; this.session = null; this.nextId = 1;
  }
  range(a, b) { return a + this.random() * (b - a); }
  get difficulty() {
    const s = this.session;
    return s?.difficulty ?? 0;
  }
  start(mode) {
    if (!MODES[mode]) throw new Error('Unknown discipline');
    this.session = { mode, running: true, paused: false, time: 0, combo: 0, best: 0,
      hits: 0, perfect: 0, misses: 0, score: 0, xp: 0, gold: 0, spawn: .45,
      starTimer: 7, objects: [], effects: [], attacks: [], pose: null, dummy: 0,
      missionDone: false, difficulty: 0, feedback: null, defBag: [], lastSector: -1, pairPending: 0, critical: { stage: 'wait', clock: 0, delay: .7 } };
    return this.session;
  }
  stop() { if (this.session) { this.session.running = false; this.session.paused = false; } }
  pause(value) { if (this.session?.running) this.session.paused = value; }
  get active() { return this.session?.running && !this.session.paused; }
  setScale(scale) { this.scale = Math.max(.15, scale); }
  setPointer(x, y) { this.pointer = { x, y }; }
  effect(kind, x, y, extra = {}) {
    const effects = this.session.effects;
    effects.push({ kind, x, y, age: 0, duration: .45, ...extra });
    if (effects.length > 120) effects.splice(0, effects.length - 120);
  }
  pose(kind, duration = .26, direction = 1) { this.session.pose = { kind, age: 0, duration, direction }; }
  good(perfect, x, y) {
    const s = this.session;
    s.hits++; s.combo++; s.best = Math.max(s.best, s.combo); s.perfect += perfect ? 1 : 0;
    s.score += perfect ? 5 : 3;
    const xp = (perfect ? 3 : 2) * (1 + Math.min(4, Math.floor(s.combo / 10)));
    const gold = s.hits % 5 === 0 ? 1 : 0;
    const granted = this.reward(s.mode, { xp, gold });
    s.xp += granted?.xp ?? xp; s.gold += gold;
    this.effect('hit', x, y, { perfect });
    this.effect('label', x, y - 30, { text: perfect ? '¡PERFECTO!' : '¡BIEN!', color: perfect ? '#ffe783' : '#b9f3d0', duration: .65 });
    s.feedback = { text: perfect ? '¡PERFECTO!' : '¡BIEN!', tone: perfect ? 'perfect' : 'good', life: .8 };
    this.feedback(perfect ? 'perfect' : 'hit');
    if (!s.missionDone && s.hits >= 12 && s.best >= 5) {
      s.missionDone = true; s.gold += 15;
      this.reward(s.mode, { xp: 0, gold: 15 });
      this.effect('label', 600, 200, { text: 'MISIÓN COMPLETA · +15 monedas', color: '#ffe783', duration: 1.8 });
    }
  }
  bad(x = 350, y = 390, reason = 'FALLO') {
    const s = this.session; s.combo = 0; s.misses++;
    this.effect('miss', x, y, { duration: .22 });
    this.effect('label', x, y - 30, { text: reason, color: '#ffc5bb', duration: .5 });
    s.feedback = { text: reason==='FALLO'?'FALLO':`FALLO · ${reason}`, tone: 'miss', life: 1.4 };
    this.feedback('miss');
  }
  spawnObject() {
    const s = this.session, d = this.difficulty;
    const object = { id: this.nextId++, age: 0 };
    s.dummy = .25;
    if (s.mode === 'str') {
      const lane = Math.floor(this.random() * 3), y = LANES[lane];
      const speed = this.range(265, 305) + d * 160;
      const launchY = y + this.range(-45, 45);
      Object.assign(object, { type: 'apple', lane, x: 1080, y: launchY, vx: -speed, vy: (y - launchY) * speed / 730, r: 17 });
    } else if (s.mode === 'def') {
      if (!s.defBag.length) {
        s.defBag = Array.from({length: 8}, (_, i) => i);
        for (let i = 7; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [s.defBag[i],s.defBag[j]] = [s.defBag[j],s.defBag[i]]; }
        if (s.defBag.at(-1) === s.lastSector) [s.defBag[0],s.defBag[7]] = [s.defBag[7],s.defBag[0]];
      }
      const sector = s.defBag.pop(); s.lastSector = sector;
      const a = sector * TAU / 8 + this.range(-.07, .07);
      const radius = Math.min(550 / Math.max(.001, Math.abs(Math.cos(a))), 220 / Math.max(.001, Math.abs(Math.sin(a))));
      const travel = 2.5 - d * .4, speed = (radius - 85) / travel;
      Object.assign(object, { type: 'apple', sector, arrival: s.time + travel, x: 600 + Math.cos(a)*radius, y: 390+Math.sin(a)*radius, vx:-Math.cos(a)*speed, vy:-Math.sin(a)*speed, r:17 });
    } else if (s.mode === 'acc') {
      const base = clamp(22 / this.scale, 28, 90), r = this.range(base, base+4);
      let spot;
      const clear=(x,y)=>s.objects.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+r+45);
      for(let attempt=0;attempt<50;attempt++){
        const x=this.range(160+r,1140-r),y=this.range(180+r,590-r);
        if(clear(x,y)){spot={x,y};break;}
      }
      if(!spot)for(const y of [290,480])for(const x of [270,525,780,1035])if(!spot&&clear(x,y))spot={x,y};
      if(!spot)return; // Retry a later spawn rather than cover another target.
      const {x,y}=spot;
      const life = this.range(1.6,1.85)-d*.4, moving = s.combo >= 15;
      Object.assign(object, { type:'target', x,y,r, life,maxLife:life, vx:moving?this.range(-70,70)*d:0, vy:moving?this.range(-45,45)*d:0 });
    } else if (s.mode === 'dodge') {
      const kind = ['low', 'high', 'left', 'right'][Math.floor(this.random() * 4)];
      Object.assign(object, { type: 'cue', kind, windup: 1.65 - d * .4, resolved: false });
    } else return;
    s.objects.push(object);
  }
  hitStrength() {
    const s = this.session;
    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (o.type !== 'apple') continue;
      if (s.attacks.some(a => a.lane === o.lane && Math.abs(o.x - WORLD.hitX) < 115 && Math.abs(o.y - LANES[a.lane]) < 40)) {
        s.objects.splice(i, 1); s.attacks.forEach(a => { if (a.lane === o.lane) a.hit = true; });
        this.good(Math.abs(o.x - WORLD.hitX) < 35, o.x, o.y);
      }
    }
  }
  input(key) {
    if (!this.active) return;
    key = String(key).toLowerCase();
    const s = this.session, dir = DIRS[key];
    if (s.mode === 'str' && dir) {
      if (dir === 'left') {
        this.pose('back');
        const i = s.objects.findIndex(o => o.type === 'star');
        if (i >= 0) { const [star] = s.objects.splice(i, 1); this.good(true, star.x, star.y); }
      } else {
        const lane = { up: 0, right: 1, down: 2 }[dir];
        this.pose(lane === 0 ? 'high' : lane === 2 ? 'low' : 'slash');
        s.attacks.push({ lane, age: 0, duration: .1, hit: false });
        this.effect('slash', WORLD.hitX, LANES[lane], { duration: .22 });
        this.hitStrength();
      }
    } else if (s.mode === 'dodge' && dir) {
      const cue = s.objects[0];
      if (!cue || cue.resolved) return;
      const needed = {low:'up',high:'down',left:'right',right:'left'}[cue.kind];
      const phase = dodgePhase(cue);
      cue.resolved = true;
      if (dir === needed && phase !== 'prepare' && cue.age <= cue.windup + .1) {
        cue.outcome = phase === 'perfect' ? 'perfect' : 'good';
        this.pose(dir==='up'?'jump':dir==='down'?'crouch':'dash',Math.max(.55,cue.windup-cue.age+.3),dir==='left'?-1:1);
        this.good(phase==='perfect',400,390);
      } else {
        cue.outcome='miss'; this.pose('hurt');
        this.bad(350,390,phase==='prepare'?'Muy pronto: esperá la señal':dir!==needed?'Dirección incorrecta':'Demasiado tarde');
      }
    } else if (s.mode === 'crit' && [' ', 'enter', 'click'].includes(key)) {
      const c = s.critical;
      if (c.stage === 'ready') { c.stage = 'jump'; c.clock = 0; this.pose('jump', .8); }
      else if (c.stage === 'air') {
        this.good(c.clock >= .08 && c.clock <= .32, 800, 350);
        c.strikeX = 610 + c.clock * 40; c.strikeY = 350 + c.clock * 20;
        c.stage = 'impact'; c.clock = 0; this.pose('critical', .35);
        this.effect('slash', 800, 350, { duration: .3 });
      } else if (['fake', 'wait', 'jump'].includes(c.stage)) {
        this.bad(); this.resetCritical(.5); this.pose('hurt');
      }
    }
  }
  click(x, y) {
    this.setPointer(x, y);
    if (!this.active) return;
    const s = this.session;
    if (s.mode === 'crit') return this.input('click');
    if (s.mode !== 'acc') return;
    this.pose('shoot', .22);
    this.effect('arrow', x, y, { duration: .18 });
    const hits = s.objects.filter(o => Math.hypot(x - o.x, y - o.y) <= o.r).sort((a, b) => Math.hypot(x - a.x, y - a.y) - Math.hypot(x - b.x, y - b.y));
    const o = hits[0];
    if (o) { s.objects.splice(s.objects.indexOf(o), 1); this.good(Math.hypot(x - o.x, y - o.y) < o.r * .16, x, y); }
    else this.bad(x, y);
  }
  resetCritical(delay) { this.session.critical = { stage: 'wait', clock: 0, delay }; }
  tickCritical(dt) {
    const c = this.session.critical, d = this.difficulty;
    c.clock += dt;
    if (c.stage === 'wait' && c.clock >= c.delay) { c.stage = this.random() < .3 ? 'fake' : 'ready'; c.clock = 0; }
    else if (c.stage === 'fake' && c.clock >= .85 - d * .2) this.resetCritical(this.range(.3, .6));
    else if (c.stage === 'ready' && c.clock >= .95 - d * .25) { this.bad(); this.resetCritical(.45); }
    else if (c.stage === 'jump' && c.clock >= .32) { c.stage = 'air'; c.clock = 0; }
    else if (c.stage === 'air' && c.clock >= .62 - d * .15) { this.bad(); this.resetCritical(.45); }
    else if (c.stage === 'impact' && c.clock >= .35) this.resetCritical(this.range(.25, .55));
  }
  update(dt) {
    if (!this.active || !Number.isFinite(dt) || dt <= 0) return;
    const s = this.session, d = this.difficulty;
    const target = clamp(s.combo / 80,0,1), rate = target < s.difficulty ? .55 : .25;
    s.difficulty += clamp(target-s.difficulty,-rate*dt,rate*dt);
    if(s.feedback){s.feedback.life-=dt;if(s.feedback.life<=0)s.feedback=null;}
    s.time += dt; s.spawn -= dt; s.dummy = Math.max(0, s.dummy - dt);
    if (s.pose) { s.pose.age += dt; if (s.pose.age >= s.pose.duration) s.pose = null; }
    s.effects.forEach(e => { e.age += dt; }); s.effects = s.effects.filter(e => e.age < e.duration);
    if (s.mode === 'crit') { this.tickCritical(dt); return; }
    if (s.spawn <= 0 && (s.mode !== 'dodge' || !s.objects.length) && (s.mode !== 'acc' || s.objects.length < 4)) {
      this.spawnObject();
      if(s.mode==='acc' && s.combo>=25 && s.objects.length<4)s.pairPending=.22;
      const interval = { str: .85-d*.4, def: 1-d*.44, acc: .95-d*.3, dodge: .5 }[s.mode];
      s.spawn += interval * this.range(.85, 1.15);
    }
    if(s.mode==='acc' && s.pairPending>0){s.pairPending-=dt;if(s.pairPending<=0 && s.objects.length<4)this.spawnObject();}
    if (s.mode === 'str') {
      s.starTimer -= dt;
      if (s.starTimer <= 0) {
        s.objects.push({ id: this.nextId++, type: 'star', x: 160, y: 330, life: 2.1, age: 0 });
        s.starTimer = this.range(6, 9);
      }
    }
    for (const o of s.objects) {
      o.age += dt;
      if(o.type==='star'){o.x=160+95*clamp(o.age/2.1,0,1);o.y=330-55*Math.sin(o.age/2.1*Math.PI);}
      if (o.vx !== undefined) { o.x += o.vx * dt; o.y += o.vy * dt; }
      if (o.life !== undefined) o.life -= dt;
      if (o.type === 'target') {
        if (o.x < o.r + 140 || o.x > 1140 - o.r) o.vx *= -1;
        if (o.y < o.r + 170 || o.y > 600 - o.r) o.vy *= -1;
      }
    }
    if (s.mode === 'str') this.hitStrength();
    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (s.mode === 'def') {
        const dx = o.x - 600, dy = o.y - 390, distance = Math.hypot(dx, dy);
        const aim = Math.atan2(this.pointer.y - 390, this.pointer.x - 600), angle = Math.atan2(dy, dx);
        const diff = Math.abs(Math.atan2(Math.sin(angle - aim), Math.cos(angle - aim)));
        if (distance <= 88 && distance > 50 && diff < .43) {
          s.objects.splice(i, 1); this.good(diff < .16, o.x, o.y); this.pose('block', .18); continue;
        }
        if (distance < 50) { s.objects.splice(i, 1); this.bad(600, 390); this.pose('hurt'); }
      } else if(o.type==='cue'){
        if(!o.resolved && o.age>=o.windup+.1){o.resolved=true;o.outcome='miss';this.bad(350,390,'No esquivaste a tiempo');this.pose('hurt');}
        if(o.age>=o.windup+.32){s.objects.splice(i,1);s.spawn=.5-d*.15;}
      } else if ((o.life !== undefined && o.life <= 0) || (s.mode === 'str' && o.type === 'apple' && o.x < 245)) {
        s.objects.splice(i, 1); this.bad(o.x ?? 350, o.y ?? 390, o.type==='star'?'Estrella perdida':'Objeto perdido'); this.pose('hurt');
      }
    }
    for (let i = s.attacks.length - 1; i >= 0; i--) {
      const a = s.attacks[i]; a.age += dt;
      if (a.age >= a.duration) { s.attacks.splice(i, 1); }
    }
  }
}
