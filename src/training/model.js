export const MODES = {
  str: { name: 'Fuerza', icon: '🗡️', desc: 'Cortá manzanas altas, medias y bajas. Una trayectoria puede cortar varias. Las estrellas aparecen detrás.', guide: '↑ / W: corte alto · ← / A: corte medio · ↓ / S: corte bajo · → / D: estrella. Encadená pulsaciones; no hay recarga.' },
  def: { name: 'Defensa', icon: '🛡️', desc: 'Orientá el escudo hacia cada proyectil cuando llegue al círculo de impacto.', guide: 'Mové el mouse o arrastrá el dedo alrededor del guerrero. El escudo responde directamente al puntero.' },
  acc: { name: 'Precisión', icon: '🎯', desc: 'Apuntá y dispará a los blancos antes de que se desvanezcan. El centro da un perfecto.', guide: 'Mouse o toque: acertá dentro del blanco. El arco acompaña la mira; cada disparo deja una trayectoria. Los blancos ganan movimiento y frecuencia.' },
  dodge: { name: 'Esquiva', icon: '💨', desc: 'Leé la preparación del muñeco y reaccioná antes de su golpe.', guide: '↑: saltá el barrido bajo · ↓: agachate ante el alto · →: evitá izquierda · ←: evitá derecha. La señal muestra la tecla necesaria.' },
  crit: { name: 'Crítico', icon: '✨', desc: '☠ Calavera: esperá. ❗ Exclamación: saltá. ⚡ En el aire: pulsá otra vez para golpear.', guide: 'ESPACIO, Enter o clic. Pulsar un amague, adelantarse al aviso aéreo o dejar pasar una señal rompe el combo.' },
};
const DIRS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
export const LANES = [185, 280, 380];
const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// The simulation owns time; rendering and DOM events never choose game outcomes.
export class Training {
  constructor({ random = Math.random, reward = () => {}, feedback = () => {} } = {}) {
    this.random = random; this.reward = reward; this.feedback = feedback;
    this.pointer = { x: 600, y: 270 }; this.session = null; this.nextId = 1;
  }
  range(a, b) { return a + this.random() * (b - a); }
  get difficulty() {
    const s = this.session;
    return s ? clamp((1 - Math.exp(-s.time / 100)) * .85 + Math.min(s.combo / 150, .15), 0, 1) : 0;
  }
  start(mode) {
    if (!MODES[mode]) throw new Error('Unknown discipline');
    this.session = { mode, running: true, paused: false, time: 0, combo: 0, best: 0,
      hits: 0, perfect: 0, misses: 0, score: 0, xp: 0, gold: 0, spawn: .45,
      starTimer: 7, objects: [], effects: [], attacks: [], pose: null, dummy: 0,
      missionDone: false, critical: { stage: 'wait', clock: 0, delay: .7 } };
    return this.session;
  }
  stop() { if (this.session) { this.session.running = false; this.session.paused = false; } }
  pause(value) { if (this.session?.running) this.session.paused = value; }
  get active() { return this.session?.running && !this.session.paused; }
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
    this.effect('label', x, y - 30, { text: perfect ? '¡PERFECTO!' : `×${s.combo}`, color: perfect ? '#ffe783' : '#b9f3d0', duration: .65 });
    this.feedback(perfect ? 'perfect' : 'hit');
    if (!s.missionDone && s.hits >= 12 && s.best >= 5) {
      s.missionDone = true; s.gold += 15;
      this.reward(s.mode, { xp: 0, gold: 15 });
      this.effect('label', 450, 145, { text: 'MISIÓN COMPLETA · +15 monedas', color: '#ffe783', duration: 1.8 });
    }
  }
  bad(x = 300, y = 270) {
    const s = this.session; s.combo = 0; s.misses++;
    this.effect('miss', x, y, { duration: .22 });
    this.effect('label', x, y - 30, { text: 'FALLO', color: '#ffc5bb', duration: .5 });
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
      Object.assign(object, { type: 'apple', lane, x: 810, y: launchY, vx: -speed, vy: (y - launchY) * speed / 525, r: 17 });
    } else if (s.mode === 'def') {
      const a = this.range(0, TAU), speed = 180 + d * 135;
      const radius = Math.min(460 / Math.max(.001, Math.abs(Math.cos(a))), 245 / Math.max(.001, Math.abs(Math.sin(a))));
      Object.assign(object, { type: 'apple', x: 450 + Math.cos(a) * radius, y: 270 + Math.sin(a) * radius, vx: -Math.cos(a) * speed, vy: -Math.sin(a) * speed, r: 17 });
    } else if (s.mode === 'acc') {
      const life = this.range(1.65, 2.15) - d * .5;
      Object.assign(object, { type: 'target', x: this.range(125, 810), y: this.range(135, 410), r: this.range(25, 35), life, maxLife: life, vx: this.range(-30, 30) * d, vy: this.range(-22, 22) * d });
    } else if (s.mode === 'dodge') {
      const kind = ['low', 'high', 'left', 'right'][Math.floor(this.random() * 4)];
      Object.assign(object, { type: 'cue', kind, windup: 1.15 - d * .48 });
    } else return;
    s.objects.push(object);
  }
  hitStrength() {
    const s = this.session;
    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (o.type !== 'apple') continue;
      if (s.attacks.some(a => a.lane === o.lane && Math.abs(o.x - 300) < 105 && Math.abs(o.y - LANES[a.lane]) < 40)) {
        s.objects.splice(i, 1); s.attacks.forEach(a => { if (a.lane === o.lane) a.hit = true; });
        this.good(Math.abs(o.x - 300) < 38, o.x, o.y);
      }
    }
  }
  input(key) {
    if (!this.active) return;
    key = String(key).toLowerCase();
    const s = this.session, dir = DIRS[key];
    if (s.mode === 'str' && dir) {
      if (dir === 'right') {
        this.pose('back');
        const i = s.objects.findIndex(o => o.type === 'star');
        if (i < 0) this.bad();
        else { const [star] = s.objects.splice(i, 1); this.good(true, star.x, star.y); }
      } else {
        const lane = { up: 0, left: 1, down: 2 }[dir];
        this.pose(lane === 0 ? 'high' : lane === 2 ? 'low' : 'slash');
        s.attacks.push({ lane, age: 0, duration: .1, hit: false });
        this.effect('slash', 300, LANES[lane], { duration: .22 });
        this.hitStrength();
      }
    } else if (s.mode === 'dodge' && dir) {
      const cue = s.objects[0];
      const needed = { low: 'up', high: 'down', left: 'right', right: 'left' }[cue?.kind];
      this.pose(dir === 'up' ? 'jump' : dir === 'down' ? 'crouch' : 'dash', .38, dir === 'left' ? -1 : 1);
      if (cue && dir === needed && cue.age >= .1) {
        this.good(cue.age >= cue.windup * .55, 350, 270);
        s.objects.shift(); s.spawn = .32 - this.difficulty * .13;
      } else { if (cue) s.objects.shift(); s.spawn = .5; this.bad(); }
    } else if (s.mode === 'crit' && [' ', 'enter', 'click'].includes(key)) {
      const c = s.critical;
      if (c.stage === 'ready') { c.stage = 'jump'; c.clock = 0; this.pose('jump', .8); }
      else if (c.stage === 'air') {
        this.good(c.clock >= .08 && c.clock <= .32, 570, 215);
        c.strikeX = 425 + c.clock * 40; c.strikeY = 230 + c.clock * 20;
        c.stage = 'impact'; c.clock = 0; this.pose('critical', .35);
        this.effect('slash', 570, 215, { duration: .3 });
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
    if (o) { s.objects.splice(s.objects.indexOf(o), 1); this.good(Math.hypot(x - o.x, y - o.y) < o.r * .4, x, y); }
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
    s.time += dt; s.spawn -= dt; s.dummy = Math.max(0, s.dummy - dt);
    if (s.pose) { s.pose.age += dt; if (s.pose.age >= s.pose.duration) s.pose = null; }
    s.effects.forEach(e => { e.age += dt; }); s.effects = s.effects.filter(e => e.age < e.duration);
    if (s.mode === 'crit') { this.tickCritical(dt); return; }
    if (s.spawn <= 0 && (s.mode !== 'dodge' || !s.objects.length)) {
      this.spawnObject();
      const interval = { str: .82 - d * .52, def: .9 - d * .56, acc: .95 - d * .59, dodge: .3 }[s.mode];
      s.spawn += interval * this.range(.85, 1.15);
    }
    if (s.mode === 'str') {
      s.starTimer -= dt;
      if (s.starTimer <= 0) {
        s.objects.push({ id: this.nextId++, type: 'star', x: 105, y: 225, life: 1.65, age: 0 });
        s.starTimer = this.range(6, 9);
      }
    }
    for (const o of s.objects) {
      o.age += dt;
      if (o.vx !== undefined) { o.x += o.vx * dt; o.y += o.vy * dt; }
      if (o.life !== undefined) o.life -= dt;
      if (o.type === 'target') {
        if (o.x < o.r + 70 || o.x > 850 - o.r) o.vx *= -1;
        if (o.y < o.r + 90 || o.y > 450 - o.r) o.vy *= -1;
      }
    }
    if (s.mode === 'str') this.hitStrength();
    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (s.mode === 'def') {
        const dx = o.x - 450, dy = o.y - 270, distance = Math.hypot(dx, dy);
        const aim = Math.atan2(this.pointer.y - 270, this.pointer.x - 450), angle = Math.atan2(dy, dx);
        const diff = Math.abs(Math.atan2(Math.sin(angle - aim), Math.cos(angle - aim)));
        if (distance <= 88 && distance > 50 && diff < .43) {
          s.objects.splice(i, 1); this.good(diff < .16, o.x, o.y); this.pose('block', .18); continue;
        }
        if (distance < 50) { s.objects.splice(i, 1); this.bad(450, 270); this.pose('hurt'); }
      } else if ((o.life !== undefined && o.life <= 0) || (s.mode === 'str' && o.type === 'apple' && o.x < 225) || (o.type === 'cue' && o.age >= o.windup)) {
        s.objects.splice(i, 1); this.bad(o.x ?? 300, o.y ?? 270); this.pose('hurt');
      }
    }
    for (let i = s.attacks.length - 1; i >= 0; i--) {
      const a = s.attacks[i]; a.age += dt;
      if (a.age >= a.duration) { if (!a.hit) this.bad(); s.attacks.splice(i, 1); }
    }
  }
}
