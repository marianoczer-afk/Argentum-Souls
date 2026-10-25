import { LANES, WORLD, dodgePhase, clamp } from './model.js';
const TAU = Math.PI * 2;
export function heroTransform(pose) {
  if (!pose) return { x: 0, y: 0, scaleY: 1, sword: -.5 };
  const p = clamp(pose.age / pose.duration, 0, 1), wave = Math.sin(p * Math.PI);
  const t = { x: 0, y: 0, scaleY: 1, sword: -.5 };
  if (['jump', 'high'].includes(pose.kind)) t.y = -wave * (pose.kind === 'jump' ? 95 : 45);
  if (['low', 'crouch'].includes(pose.kind)) { t.scaleY = 1 - wave * .42; t.y = wave * 12; }
  if (pose.kind === 'dash') t.x = wave * 85 * pose.direction;
  if (pose.kind === 'back') t.x = -wave * 100;
  if (['slash', 'high', 'low', 'critical'].includes(pose.kind)) { t.sword = -.5 + p * 2.5; t.x += wave * 22; }
  if (pose.kind === 'hurt') t.x = -wave * 17;
  if (pose.kind === 'critical') t.x += wave * 30;
  return t;
}
export class TrainingRenderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); }
  circle(x, y, r, fill, stroke) {
    const c = this.ctx; c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
  }
  round(x, y, w, h, r, fill) {
    const c = this.ctx; c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill();
  }
  label(text, x, y, size = 20, color = '#fff0cf') {
    const c = this.ctx; c.fillStyle = color; c.font = `700 ${size}px system-ui`; c.textAlign = 'center'; c.fillText(text, x, y);
  }
  room(time) {
    const c=this.ctx, wall=c.createLinearGradient(0,0,0,720);
    wall.addColorStop(0,'#a9775e');wall.addColorStop(1,'#dfae7e');c.fillStyle=wall;c.fillRect(0,0,1200,720);
    c.fillStyle='#865d4c';c.beginPath();c.moveTo(0,0);c.lineTo(120,0);c.lineTo(120,540);c.lineTo(0,720);c.fill();
    c.fillStyle='#987357';c.beginPath();c.moveTo(0,720);c.lineTo(120,540);c.lineTo(1080,540);c.lineTo(1200,720);c.fill();
    c.strokeStyle='#69503e';c.lineWidth=3;c.strokeRect(120,-5,960,545);
    c.fillStyle='#f5dfaa';c.beginPath();c.ellipse(60,230,32,65,0,Math.PI,0);c.lineTo(92,320);c.lineTo(28,320);c.fill();
    c.save();c.globalAlpha=.08;c.fillStyle='#fff0b5';c.beginPath();c.moveTo(92,215);c.lineTo(600,720);c.lineTo(0,720);c.fill();c.restore();
    c.fillStyle='#65634d';c.beginPath();c.moveTo(230,560);c.lineTo(970,560);c.lineTo(1080,660);c.lineTo(130,660);c.fill();c.strokeStyle='#c7ac77';c.stroke();
    c.save();c.globalAlpha=.15;
    for(let i=0;i<35;i++){c.fillStyle=i%2?'#634739':'#f4d3a3';c.fillRect(150+(i*137)%900,80+(i*61)%410,30+i%20,3);}
    c.restore();this.circle(90,350+Math.sin(time)*2,3,'#fbe1a590');
  }
  hero(x, y, pose, shield = true) {
    const c = this.ctx, t = heroTransform(pose);
    c.save(); c.globalAlpha = .22; this.circle(x, y + 48, 31, '#2a2520'); c.restore();
    c.save(); c.translate(x + t.x, y + t.y); c.scale(1, t.scaleY);
    c.strokeStyle = '#2c353a'; c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-10, 22); c.lineTo(-20, 45); c.moveTo(9, 22); c.lineTo(20, 45); c.stroke();
    c.fillStyle = '#3c6573'; c.beginPath(); c.moveTo(-20, -38); c.lineTo(-39, 27); c.lineTo(22, 25); c.lineTo(17, -38); c.fill();
    this.round(-22, -35, 46, 62, 12, '#56616a'); this.round(-18, -28, 38, 13, 4, '#8a9b9e');
    this.circle(0, -61, 29, '#36444b', '#202e34');
    this.round(-24, -64, 49, 12, 4, '#8b9d9c'); this.round(2, -61, 19, 5, 2, '#f6d97e');
    c.fillStyle = '#b08855'; c.beginPath(); c.moveTo(-20, -83); c.lineTo(-32, -109); c.lineTo(-2, -88); c.fill();
    if (shield) { this.circle(35, -4, 25, '#9da49b', '#36444b'); this.circle(35, -4, 17, '#365d6c'); this.circle(35, -4, 5, '#d5bb75'); }
    c.save(); c.translate(25, -18); c.rotate(t.sword);
    this.round(-4, -66, 8, 67, 3, '#e9dfbd'); this.round(-14, -5, 28, 6, 2, '#b78d4e'); this.round(-4, 0, 8, 22, 2, '#675443'); c.restore();
    c.restore();
  }
  dummy(x, y, s) {
    const c = this.ctx;
    c.save(); c.translate(x, y);
    const cue = s?.objects.find(o => o.type === 'cue');
    const anticipation = cue ? clamp(cue.age / cue.windup, 0, 1) : 0;
    c.rotate(s?.dummy > 0 ? -.12 * Math.sin(s.dummy * 20) : cue ? Math.sin(anticipation * Math.PI) * .18 : 0);
    c.strokeStyle = '#664939'; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -85); c.lineTo(0, 90); c.moveTo(-48, -12); c.lineTo(48, -12); c.stroke();
    this.round(-27, -44, 54, 78, 13, '#d2c4a1'); this.circle(0, -78, 34, '#d2c4a1', '#66543e');
    this.circle(-12, -79, 4, '#526b67'); this.circle(12, -79, 4, '#526b67');
    c.strokeStyle = '#8e614c'; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -63); c.lineTo(13, -59); c.stroke();
    this.round(-38, -117, 76, 15, 3, '#37333c'); this.round(-25, -151, 50, 39, 4, '#44404b');
    this.round(-25, -122, 50, 6, 2, '#a98354');
    if (cue) {
      const phase=dodgePhase(cue), striking=phase==='strike', perfect=phase==='perfect';
      c.strokeStyle=perfect?'#fff2a5':'#d5bc88';c.lineWidth=9;
      c.beginPath();c.moveTo(-35,-20);c.lineTo(striking?-660:-100-anticipation*70,cue.kind==='low'?55:cue.kind==='high'?-80:cue.resolved&&cue.outcome!=='miss'?95:-20);c.stroke();
      if(perfect){this.circle(0,-85,48,null,'#fff0a4');this.label('✦',-70,-125,40,'#fff2a0');}
    }
    c.restore();
  }
  apple(o) {
    const c = this.ctx; c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(o.age * 6) * .18);
    c.fillStyle = '#b73d36'; c.beginPath(); c.moveTo(0, -11); c.bezierCurveTo(-22, -24, -26, 13, -5, 17); c.bezierCurveTo(4, 22, 25, 8, 17, -9); c.bezierCurveTo(10, -21, 3, -12, 0, -11); c.fill();
    c.strokeStyle = '#633f31'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -10); c.lineTo(4, -22); c.stroke();
    c.fillStyle = '#658449'; c.beginPath(); c.ellipse(10, -19, 9, 4, -.4, 0, TAU); c.fill();
    this.circle(-8, -6, 3, '#efaa83'); c.restore();
  }
  star(o) {
    const c = this.ctx; c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(o.age * 5) * .2);
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 10 : 23; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fillStyle = '#ffe58a'; c.fill(); c.strokeStyle = '#8c693c'; c.lineWidth = 2; c.stroke(); c.restore();
    this.label('★ ATRÁS · ←', o.x, o.y - 40, 22, '#fff2b8');
    this.circle(o.x-25,o.y+8,3,'#ffe58a90');this.circle(o.x-45,o.y+14,2,'#ffe58a60');
  }
  target(o) {
    const c = this.ctx, opacity = Math.min(1, o.life * 3);
    c.save(); c.globalAlpha = opacity;
    this.circle(o.x, o.y, o.r, '#efe3c9', '#6c3f30'); this.circle(o.x, o.y, o.r * .7, '#af4a3a'); this.circle(o.x, o.y, o.r * .4, '#f8ebce'); this.circle(o.x, o.y, o.r * .17, '#af4a3a');
    c.strokeStyle = '#ffde8d'; c.lineWidth = 3; c.beginPath(); c.arc(o.x, o.y, o.r + 7, -Math.PI / 2, -Math.PI / 2 + TAU * o.life / o.maxLife); c.stroke();
    c.restore();
  }
  bow(pointer, pose) {
    const c = this.ctx, shooting = pose?.kind === 'shoot', progress = shooting ? pose.age / pose.duration : 1;
    c.save(); c.translate(120, 610); c.rotate(Math.atan2(pointer.y - 610, pointer.x - 120));
    c.strokeStyle = '#503d31'; c.lineWidth = 9; c.beginPath(); c.arc(-25, 0, 90, -1.05, 1.05); c.stroke();
    c.strokeStyle = '#e6c98e'; c.lineWidth = 2; c.beginPath(); c.moveTo(20, -78); c.lineTo(shooting ? -35 + progress * 55 : -35, 0); c.lineTo(20, 78); c.stroke();
    this.round(-35, -12, 48, 24, 7, '#69513d'); c.restore();
    c.strokeStyle = '#fff4d4'; c.lineWidth = 2; c.beginPath(); c.moveTo(pointer.x - 13, pointer.y); c.lineTo(pointer.x + 13, pointer.y); c.moveTo(pointer.x, pointer.y - 13); c.lineTo(pointer.x, pointer.y + 13); c.stroke();
    this.circle(pointer.x, pointer.y, 7, null, '#fff4d4');
  }
  effects(effects) {
    const c = this.ctx;
    for (const e of effects) {
      const p = clamp(e.age / e.duration, 0, 1);
      c.save(); c.globalAlpha = 1 - p;
      if (e.kind === 'hit') {
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; this.circle(e.x + Math.cos(a) * p * 70, e.y + Math.sin(a) * p * 50 + p * p * 30, 4 * (1 - p) + 1, e.perfect ? '#fff1a1' : '#f1c086'); }
        this.circle(e.x, e.y, p * 45, null, '#ffedaa');
      } else if (e.kind === 'slash') {
        c.strokeStyle = '#fff4c6'; c.lineWidth = 12 * (1 - p) + 1; c.lineCap = 'round'; c.beginPath(); c.arc(e.x, e.y, 60 + p * 30, -1.5 + p, .6 + p); c.stroke();
      } else if (e.kind === 'label') this.label(e.text, e.x, e.y - p * 30, 20, e.color);
      else if (e.kind === 'miss') { c.fillStyle = '#ff534c'; c.globalAlpha = (1 - p) * .16; c.fillRect(0, 0, 1200, 720); }
      else if (e.kind === 'arrow') {
        const x = 120 + (e.x - 120) * p, y = 610 + (e.y - 610) * p;
        c.strokeStyle = '#fff0bf'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (e.x - 120) * .12, y - (e.y - 610) * .12); c.stroke();
      }
      c.restore();
    }
  }
  draw(engine, selected = 'str') {
    const c = this.ctx, s = engine.session, mode = s?.mode ?? selected;
    c.clearRect(0, 0, 1200, 720); this.room(s?.time ?? 0);
    const objects = s?.objects ?? [];
    if (mode === 'str') {
      c.save(); c.setLineDash([7, 10]); c.strokeStyle = '#f9e4b64f'; c.lineWidth = 1;
      for (const y of LANES) { c.beginPath(); c.moveTo(260, y); c.lineTo(1080, y); c.stroke(); }
      c.restore(); this.hero(330, 490, s?.pose); this.dummy(1050, 480, s);
      for (const o of objects) o.type === 'star' ? this.star(o) : this.apple(o);
      this.label('← ESTRELLA     ↑ ALTO     → CORTE MEDIO     ↓ BAJO',600,700,18);
    } else if (mode === 'def') {
      this.hero(600, 420, s?.pose, false);
      const a = Math.atan2(engine.pointer.y - 390, engine.pointer.x - 600);
      this.circle(600, 390, 88, null, '#e1c68b75');
      c.save(); c.translate(600, 390); c.rotate(a); this.round(64, -31, 20, 62, 7, '#b9c1b9'); this.round(69, -23, 9, 46, 4, '#386277'); c.restore();
      objects.forEach(o => this.apple(o)); this.label('SEGUÍ EL PROYECTIL · EL DESTELLO MARCA EL BLOQUEO PERFECTO',600,700,18);
    } else if (mode === 'acc') { objects.forEach(o => this.target(o)); this.bow(engine.pointer, s?.pose); this.label('CENTRO PEQUEÑO = PERFECTO · DOBLE OBJETIVO: DOS TOQUES',600,700,18); }
    else if (mode === 'dodge') {
      this.hero(330, 490, s?.pose); this.dummy(1000, 480, s);
      const cue = objects[0];
      if(cue){
        const phase=dodgePhase(cue), labels={low:'BARRIDO BAJO · SALTÁ ↑',high:'GOLPE ALTO · AGACHATE ↓',left:'ESTOCADA IZQUIERDA · DERECHA →',right:'ESTOCADA DERECHA · IZQUIERDA ←'};
        const label=cue.resolved?(cue.outcome==='miss'?'GOLPE · REVISÁ LA SEÑAL':'¡ESQUIVA LOGRADA!'):phase==='prepare'?'EL MUÑECO SE PREPARA…':phase==='perfect'?'✦ VENTANA PERFECTA · '+labels[cue.kind]:labels[cue.kind];
        this.round(210,95,780,56,12,phase==='perfect'?'#655632ee':'#3e332cdd');this.label(label,600,131,24);
        this.round(330,165,540,9,4,'#76513d');this.round(330,165,540*(1-clamp(cue.age/cue.windup,0,1)),9,4,'#f8dc9f');
      }else this.label('OBSERVÁ LA PREPARACIÓN DEL MUÑECO',600,125,24,'#493b2b');
    } else {
      const stage = s?.critical.stage ?? 'wait', clock = s?.critical.clock ?? 0;
      let x = 330, y = 490, pose = s?.pose;
      if (stage === 'jump') { x += 280 * clamp(clock / .32, 0, 1); y -= 140 * Math.sin(clamp(clock / .64, 0, 1) * Math.PI); pose = null; }
      if (stage === 'air') { x = 610 + clock * 40; y = 350 + clock * 20; pose = null; }
      if (stage === 'impact') {
        const p = clamp(clock / .35, 0, 1), startX = s.critical.strikeX ?? 620, startY = s.critical.strikeY ?? 350;
        x = (1 - p) ** 2 * startX + 2 * (1 - p) * p * 1000 + p ** 2 * 330;
        y = startY + (490 - startY) * p * p;
        pose = s.pose ? { ...s.pose, kind: 'slash' } : null;
      }
      this.hero(x, y, pose); this.dummy(900, 480, s);
      const labels = { wait: 'OBSERVÁ AL MUÑECO', fake: '☠ AMAGUE · NO PULSES', ready: '❗ AHORA · SALTÁ', jump: 'PREPARÁ EL SEGUNDO TOQUE', air: '⚡ AHORA · GOLPEÁ', impact: '¡CRÍTICO CONECTADO!' };
      this.round(250, 90, 700, 56, 10, '#44332be0'); this.label(labels[stage], 600, 127, 24, stage === 'fake' ? '#ffb3a3' : '#fff0ba');
      if (['fake', 'ready', 'air'].includes(stage)) this.label({ fake: '☠', ready: '❗', air: '⚡' }[stage], stage === 'air' ? 760 : 990, 295, 45, stage === 'fake' ? '#ffa29b' : '#fff1a1');
      this.label('CALAVERA: ESPERÁ · EXCLAMACIÓN: SALTÁ · RAYO: GOLPEÁ', 600, 700, 19);
    }
    if (s) this.effects(s.effects);
    if (s?.paused) { c.fillStyle = '#17232cbf'; c.fillRect(0, 0, 1200, 720); this.label('EN PAUSA · TU PROGRESO ESTÁ CONSERVADO', 600, 350, 24); }
  }
}
