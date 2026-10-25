import { LANES, clamp } from './model.js';
const TAU = Math.PI * 2;
export function heroTransform(pose) {
  if (!pose) return { x: 0, y: 0, scaleY: 1, sword: -.5 };
  const p = clamp(pose.age / pose.duration, 0, 1), wave = Math.sin(p * Math.PI);
  const t = { x: 0, y: 0, scaleY: 1, sword: -.5 };
  if (['jump', 'high'].includes(pose.kind)) t.y = -wave * (pose.kind === 'jump' ? 95 : 45);
  if (['low', 'crouch'].includes(pose.kind)) { t.scaleY = 1 - wave * .42; t.y = wave * 12; }
  if (pose.kind === 'dash') t.x = wave * 85 * pose.direction;
  if (pose.kind === 'back') t.x = -wave * 55;
  if (['slash', 'high', 'low', 'critical'].includes(pose.kind)) { t.sword = -1.8 + p * 3; t.x += wave * 22; }
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
    const c = this.ctx;
    const wall = c.createLinearGradient(0, 0, 0, 506); wall.addColorStop(0, '#b77d5f'); wall.addColorStop(1, '#e0aa78');
    c.fillStyle = wall; c.fillRect(0, 0, 900, 506);
    c.fillStyle = '#8e5d49'; c.beginPath(); c.moveTo(0, 0); c.lineTo(125, 0); c.lineTo(125, 360); c.lineTo(0, 506); c.fill();
    c.fillStyle = '#a16c50'; c.beginPath(); c.moveTo(0, 506); c.lineTo(125, 360); c.lineTo(775, 360); c.lineTo(900, 506); c.fill();
    c.strokeStyle = '#684f3d'; c.lineWidth = 3; c.strokeRect(125, -5, 650, 365);
    c.fillStyle = '#f6df9c'; c.beginPath(); c.ellipse(62, 155, 31, 58, 0, Math.PI, 0); c.lineTo(93, 220); c.lineTo(31, 220); c.fill();
    c.save(); c.globalAlpha = .09; c.fillStyle = '#fff7c5'; c.beginPath(); c.moveTo(92, 150); c.lineTo(450, 506); c.lineTo(0, 506); c.fill(); c.restore();
    c.fillStyle = '#6b6450'; c.beginPath(); c.moveTo(210, 385); c.lineTo(690, 385); c.lineTo(745, 455); c.lineTo(160, 455); c.fill();
    c.strokeStyle = '#c5a56c'; c.lineWidth = 3; c.stroke();
    c.save(); c.globalAlpha = .16;
    for (let i = 0; i < 23; i++) { c.fillStyle = i % 2 ? '#614337' : '#f4d3a3'; c.fillRect(145 + (i * 137) % 600, 75 + (i * 61) % 255, 24 + i % 20, 3); }
    c.restore();
    this.round(292, 14, 316, 40, 10, '#3b3029d9');
    this.label('EL PATIO DE LOS REFLEJOS', 450, 41, 17);
    // Slow ambient light stays separate from input-driven poses.
    this.circle(88, 245 + Math.sin(time) * 2, 3, '#fbe1a590');
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
    c.save(); c.translate(-25, -18); c.rotate(t.sword);
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
      c.strokeStyle = '#fce0a0'; c.lineWidth = 8; c.beginPath(); c.moveTo(-35, -20); c.lineTo(-90 - anticipation * 55, cue.kind === 'low' ? 55 : cue.kind === 'high' ? -65 : -10); c.stroke();
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
    this.label('→', o.x, o.y + 49, 23, '#fff2b8');
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
    c.save(); c.translate(90, 405); c.rotate(Math.atan2(pointer.y - 405, pointer.x - 90));
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
      else if (e.kind === 'miss') { c.fillStyle = '#ff534c'; c.globalAlpha = (1 - p) * .16; c.fillRect(0, 0, 900, 506); }
      else if (e.kind === 'arrow') {
        const x = 95 + (e.x - 95) * p, y = 400 + (e.y - 400) * p;
        c.strokeStyle = '#fff0bf'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (e.x - 95) * .12, y - (e.y - 400) * .12); c.stroke();
      }
      c.restore();
    }
  }
  draw(engine, selected = 'str') {
    const c = this.ctx, s = engine.session, mode = s?.mode ?? selected;
    c.clearRect(0, 0, 900, 506); this.room(s?.time ?? 0);
    const objects = s?.objects ?? [];
    if (mode === 'str') {
      c.save(); c.setLineDash([7, 10]); c.strokeStyle = '#f9e4b64f'; c.lineWidth = 1;
      for (const y of LANES) { c.beginPath(); c.moveTo(240, y); c.lineTo(800, y); c.stroke(); }
      c.restore(); this.hero(285, 330, s?.pose); this.dummy(780, 320, s);
      for (const o of objects) o.type === 'star' ? this.star(o) : this.apple(o);
      this.label('↑ ALTO     ← MEDIO     ↓ BAJO     → ESTRELLA', 450, 486, 18);
    } else if (mode === 'def') {
      this.hero(450, 300, s?.pose, false);
      const a = Math.atan2(engine.pointer.y - 270, engine.pointer.x - 450);
      this.circle(450, 270, 88, null, '#e1c68b75');
      c.save(); c.translate(450, 270); c.rotate(a); this.round(64, -31, 20, 62, 7, '#b9c1b9'); this.round(69, -23, 9, 46, 4, '#386277'); c.restore();
      objects.forEach(o => this.apple(o)); this.label('ORIENTÁ EL ESCUDO HACIA EL IMPACTO', 450, 486, 18);
    } else if (mode === 'acc') { objects.forEach(o => this.target(o)); this.bow(engine.pointer, s?.pose); this.label('APUNTÁ AL CENTRO · CLIC PARA DISPARAR', 450, 486, 18); }
    else if (mode === 'dodge') {
      this.hero(290, 330, s?.pose); this.dummy(680, 320, s);
      const cue = objects[0];
      if (cue) {
        const labels = { low: 'BARRIDO BAJO · SALTÁ ↑', high: 'GOLPE ALTO · AGACHATE ↓', left: 'DESPLAZATE A LA DERECHA →', right: 'DESPLAZATE A LA IZQUIERDA ←' };
        this.round(170, 72, 560, 52, 10, '#44332be0'); this.label(labels[cue.kind], 450, 106, 23);
        this.round(240, 137, 420, 8, 4, '#76513d'); this.round(240, 137, 420 * (1 - cue.age / cue.windup), 8, 4, '#f9d99a');
      } else this.label('LEÉ LA PREPARACIÓN DEL MUÑECO', 450, 106, 22, '#493b2b');
    } else {
      const stage = s?.critical.stage ?? 'wait', clock = s?.critical.clock ?? 0;
      let x = 285, y = 330, pose = s?.pose;
      if (stage === 'jump') { x += 140 * clamp(clock / .32, 0, 1); y -= 100 * Math.sin(clamp(clock / .64, 0, 1) * Math.PI); pose = null; }
      if (stage === 'air') { x = 425 + clock * 40; y = 230 + clock * 20; pose = null; }
      if (stage === 'impact') {
        const p = clamp(clock / .35, 0, 1), startX = s.critical.strikeX ?? 430, startY = s.critical.strikeY ?? 230;
        x = (1 - p) ** 2 * startX + 2 * (1 - p) * p * 650 + p ** 2 * 285;
        y = startY + (330 - startY) * p * p;
        pose = s.pose ? { ...s.pose, kind: 'slash' } : null;
      }
      this.hero(x, y, pose); this.dummy(685, 320, s);
      const labels = { wait: 'OBSERVÁ AL MUÑECO', fake: '☠ AMAGUE · NO PULSES', ready: '❗ AHORA · SALTÁ', jump: 'PREPARÁ EL SEGUNDO TOQUE', air: '⚡ AHORA · GOLPEÁ', impact: '¡CRÍTICO CONECTADO!' };
      this.round(175, 72, 550, 52, 10, '#44332be0'); this.label(labels[stage], 450, 106, 23, stage === 'fake' ? '#ffb3a3' : '#fff0ba');
      if (['fake', 'ready', 'air'].includes(stage)) this.label({ fake: '☠', ready: '❗', air: '⚡' }[stage], stage === 'air' ? 520 : 685, 165, 45, stage === 'fake' ? '#ffa29b' : '#fff1a1');
      this.label('CALAVERA: ESPERÁ · EXCLAMACIÓN: SALTÁ · RAYO: GOLPEÁ', 450, 486, 16);
    }
    if (s) this.effects(s.effects);
    if (s?.paused) { c.fillStyle = '#17232cbf'; c.fillRect(0, 0, 900, 506); this.label('EN PAUSA · TU PROGRESO ESTÁ CONSERVADO', 450, 250, 22); }
  }
}
