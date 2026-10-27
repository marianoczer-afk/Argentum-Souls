import {SHIELD,DODGE,shieldGeometry,dodgeMotion} from './geometry.js';
import {touchHints} from './controls.js';
import {tuning} from './balance.js';
import { LANES, clamp } from './model.js';
const TAU = Math.PI * 2;
export function heroTransform(pose) {
  if (!pose) return { x: 0, y: 0, scaleY: 1, sword: -.5 };
  const p=clamp(pose.age/pose.duration,0,1),wave=pose.evade?Math.min(1,p/.12)*Math.min(1,(1-p)/.25):Math.sin(p*Math.PI);
  const t = { x: 0, y: 0, scaleY: 1, sword: -.5 };
  if (['jump', 'high'].includes(pose.kind)) t.y = -wave * (pose.kind === 'jump' ? 95 : 45);
  if (['low', 'crouch'].includes(pose.kind)) { t.scaleY = 1 - wave * .42; t.y = wave * 12; }
  if (pose.kind === 'dash') t.x = wave * 85 * pose.direction;
  if (pose.kind === 'back') t.x = -wave * 100;
  if (['slash', 'high', 'low', 'critical'].includes(pose.kind)) { t.sword = -.5 + p * 2.5; t.x += wave * 22; }
  if(pose.kind==='block'){t.x=-Math.cos(pose.direction)*wave*5;t.y=-Math.sin(pose.direction)*wave*5;}
  if (pose.kind === 'hurt') t.x = -wave * 17;
  if (pose.kind === 'critical') t.x += wave * 30;
  if(pose.kind==='combat-prepare'){t.sword=-.5-1.1*p;t.x=-6*p;t.y=-4*Math.sin(p*Math.PI);}
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
  room(time,level=1) {
    const c=this.ctx, wall=c.createLinearGradient(0,0,0,720);
    wall.addColorStop(0,level>=7?'#635242':level>=3?'#92725a':'#a9775e');wall.addColorStop(1,level>=7?'#b49770':level>=3?'#c7a67c':'#dfae7e');c.fillStyle=wall;c.fillRect(0,0,1200,720);
    c.fillStyle='#865d4c';c.beginPath();c.moveTo(0,0);c.lineTo(120,0);c.lineTo(120,540);c.lineTo(0,720);c.fill();
    c.fillStyle='#987357';c.beginPath();c.moveTo(0,720);c.lineTo(120,540);c.lineTo(1080,540);c.lineTo(1200,720);c.fill();
    c.strokeStyle='#69503e';c.lineWidth=3;c.strokeRect(120,-5,960,545);
    c.fillStyle='#f5dfaa';c.beginPath();c.ellipse(60,230,32,65,0,Math.PI,0);c.lineTo(92,320);c.lineTo(28,320);c.fill();
    c.save();c.globalAlpha=.08;c.fillStyle='#fff0b5';c.beginPath();c.moveTo(92,215);c.lineTo(600,720);c.lineTo(0,720);c.fill();c.restore();
    c.fillStyle='#65634d';c.beginPath();c.moveTo(230,560);c.lineTo(970,560);c.lineTo(1080,660);c.lineTo(130,660);c.fill();c.strokeStyle='#c7ac77';c.stroke();
    c.save();c.globalAlpha=.15;
    for(let i=0;i<35;i++){c.fillStyle=i%2?'#634739':'#f4d3a3';c.fillRect(150+(i*137)%900,80+(i*61)%410,30+i%20,3);}
    c.restore();this.circle(90,350+Math.sin(time)*2,3,'#fbe1a590');
    // Additive room upgrades keep the same floor and actors; decoration stays above play lanes.
    c.strokeStyle='#564635';c.lineWidth=7;c.beginPath();c.moveTo(120,45);c.lineTo(1080,45);c.moveTo(180,45);c.lineTo(180,250);c.moveTo(1020,45);c.lineTo(1020,250);c.stroke();
    if(level>=3){for(const x of [215,950]){this.round(x,135,65,95,5,'#5d4935');for(let i=0;i<3;i++){c.strokeStyle='#cad0b8';c.lineWidth=4;c.beginPath();c.moveTo(x+14+i*17,210);c.lineTo(x+14+i*17,145);c.stroke();this.round(x+8+i*17,195,13,4,1,'#bfa262');}}}
    if(level>=5){for(const x of [350,800]){c.fillStyle=level>=10?'#813a36':'#354f63';c.beginPath();c.moveTo(x,70);c.lineTo(x+64,70);c.lineTo(x+64,205);c.lineTo(x+32,230);c.lineTo(x,205);c.fill();this.label('✦',x+32,155,32,'#d5b56e');}}
    if(level>=7){for(const x of [300,895]){this.round(x-6,205,12,55,2,'#5b4330');this.circle(x,195,20,'#ffc76833');this.circle(x,195,10,'#f1af48');this.circle(x,190,5,'#fff0a6');}}
    if(level>=10){this.round(490,68,220,42,5,'#34444b');this.label('SALA DE ÉLITE',600,96,21,'#f5d889');c.strokeStyle='#dac27e';c.lineWidth=3;c.strokeRect(126,50,948,480);}

  }
  hero(x, y, pose, shield = true) {
    const c = this.ctx, t = heroTransform(pose);
    c.save(); c.globalAlpha = .22; this.circle(x, y + 48, 31, '#2a2520'); c.restore();
    c.save(); c.translate(x + t.x, y + t.y); c.scale(1, t.scaleY);
    c.strokeStyle = '#2c353a'; c.lineWidth = 14; c.lineCap = 'round';
    const stride=pose?.stride??0;c.beginPath(); c.moveTo(-10, 22); c.lineTo(-20+stride*13,45-Math.abs(stride)*4); c.moveTo(9, 22); c.lineTo(20-stride*13,45-Math.abs(stride)*4); c.stroke();
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
  dummy(x, y, s, motion=null) {
    const c = this.ctx;
    c.save();c.translate(x+(motion?.step??0),y);if(motion)c.rotate(motion.torsoAngle??0);
    const cue = s?.objects.find(o => o.type === 'cue');
    c.rotate(!cue&&s?.dummy>0?-.12*Math.sin(s.dummy*20):0);
    c.strokeStyle = '#664939'; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(0,-85);c.lineTo(0,45);
    if(motion){c.moveTo(0,25);c.lineTo(24,75);c.moveTo(0,25);c.lineTo(motion.legKnee.x,motion.legKnee.y);c.lineTo(motion.legFoot.x,motion.legFoot.y);}
    else {c.lineTo(0,90);}
    c.moveTo(0,-20);c.lineTo(48,-12);c.moveTo(0,-20);if(motion){c.lineTo(motion.armElbow.x,motion.armElbow.y);c.lineTo(motion.armHand.x,motion.armHand.y);}else c.lineTo(-50,s?.throwCue?(s.throwCue.lane===2?20:-30):-12);c.stroke();
    this.round(-27,-44,54,78,13,'#d2c4a1');c.save();c.translate(motion?.headX??0,motion?.headY??0); this.circle(0, -78, 34, '#d2c4a1', '#66543e');
    this.circle(-12, -79, 4, '#526b67'); this.circle(12, -79, 4, '#526b67');
    c.strokeStyle = '#8e614c'; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -63); c.lineTo(13, -59); c.stroke();
    this.round(-38, -117, 76, 15, 3, '#37333c'); this.round(-25, -151, 50, 39, 4, '#44404b');
    this.round(-25,-122,50,6,2,'#a98354');c.restore();
    c.restore();
  }
  dodgeAttack(cue){
    const m=dodgeMotion(cue);
    this.dummy(DODGE.dummyX,DODGE.dummyY,{objects:[cue]},m);
    if(m.perfect){
      this.circle(DODGE.dummyX-95,390,41,'#ffffff28','#ffffff');
      this.label('✦',DODGE.dummyX-95,400,30,'#fff');
    }
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
    this.round(o.x-68,o.y-62,136,30,7,'#253440ee');this.label('← ATRÁS',o.x,o.y-40,20,'#fff2b8');
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
      } else if(e.kind==='chain'){
        this.circle(e.x,e.y,35+p*75,null,'#fff4b1');
        for(let i=0;i<5;i++){const a=i*TAU/5;this.circle(e.x+Math.cos(a)*(25+70*p),e.y+Math.sin(a)*(25+70*p),3,'#fff5bc');}
      } else if(e.kind==='block'){
        this.circle(e.x,e.y,8+p*26,null,'#fff4c2');
      } else if (e.kind === 'slash') {
        c.strokeStyle = '#fff4c6'; c.lineWidth = 12 * (1 - p) + 1; c.lineCap = 'round'; c.beginPath(); c.arc(e.x, e.y, 60 + p * 30, -1.5 + p, .6 + p); c.stroke();
      } else if (e.kind === 'label') this.label(e.text, e.x, e.y - p * 30, 20, e.color);
      else if (e.kind === 'miss') { c.fillStyle = '#ff534c'; c.globalAlpha = (1 - p) * .16; c.fillRect(-(this.canvas.width-1200)/2,0,this.canvas.width,720); }
      else if (e.kind === 'arrow') {
        const x = 120 + (e.x - 120) * p, y = 610 + (e.y - 610) * p;
        c.strokeStyle = '#fff0bf'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (e.x - 120) * .12, y - (e.y - 610) * .12); c.stroke();
      }
      c.restore();
    }
  }
  draw(engine, selected = 'str') {
    const c = this.ctx, s = engine.session, mode = s?.mode ?? selected;
    const offset=(this.canvas.width-1200)/2;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.canvas.width,720);c.fillStyle='#a9775e';c.fillRect(0,0,this.canvas.width,720);c.translate(offset,0);this.room(s?.time??0,engine.getTraining(mode).room??1);
    const objects = s?.objects ?? [];
    if (mode === 'str') {
      c.save(); c.setLineDash([7, 10]); c.strokeStyle = '#f9e4b64f'; c.lineWidth = 1;
      for (const y of LANES) { c.beginPath(); c.moveTo(260, y); c.lineTo(1080, y); c.stroke(); }
      c.restore(); this.hero(330, 490, s?.pose); this.dummy(1050, 480, s);
      for (const o of objects) o.type === 'star' ? this.star(o) : this.apple(o);

    } else if (mode === 'def') {
      this.hero(600, 420, s?.pose, false);
      const shield=shieldGeometry(engine.pointer);
      this.circle(SHIELD.x,SHIELD.y,SHIELD.radius,null,'#e1c68b65');
      c.save();c.translate(SHIELD.x,SHIELD.y);c.rotate(shield.angle);const outer=SHIELD.radius+SHIELD.depth/2,inner=SHIELD.radius-SHIELD.depth/2;
      c.beginPath();c.arc(0,0,outer,-SHIELD.halfAngle,SHIELD.halfAngle);c.arc(0,0,inner,SHIELD.halfAngle,-SHIELD.halfAngle,true);c.closePath();c.fillStyle=s?.pose?.kind==='block'?'#fff2b0':'#b9c1b9';c.fill();c.strokeStyle='#4d625f';c.lineWidth=2;c.stroke();c.beginPath();c.arc(0,0,SHIELD.radius,-SHIELD.halfAngle*.7,SHIELD.halfAngle*.7);c.strokeStyle='#386277';c.lineWidth=7;c.stroke();c.restore();
      objects.forEach(o=>this.apple(o));
    } else if (mode === 'acc') { objects.forEach(o => this.target(o)); this.bow(engine.pointer, s?.pose); }
    else if (mode === 'dodge') {
      const cue=objects[0];
      this.hero(DODGE.heroX,DODGE.heroY,s?.pose);
      if(cue)this.dodgeAttack(cue);else this.dummy(DODGE.dummyX,DODGE.dummyY,s);
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
      if(['fake','ready','air'].includes(stage)){
        const p=tuning('crit',engine.difficulty),perfect=stage==='air'&&clock>=p.perfectStart&&clock<=p.perfectEnd;
        const rx=stage==='air'?760:990,ry=270,fake=stage==='fake',radius=40;
        this.circle(rx,ry,radius,fake?'#66322f':'#29303bf2',fake?'#f4a39a':perfect?'#fff5a0':'#e0bd77');
        c.save();c.lineWidth=perfect?6:3;c.strokeStyle=fake?'#ef827b':perfect?'#fff5a0':'#f1bf70';c.beginPath();c.arc(rx,ry,radius-4,-Math.PI/2,-Math.PI/2+TAU*clamp(clock/(s.critical.limit??(stage==='air'?p.air:stage==='fake'?p.fake:p.ready)),0,1));c.stroke();c.restore();
        this.label(stage==='air'?(perfect?'★':'✦'):'!',rx,ry+13,perfect?39:35,fake?'#ffd0c9':'#fff1b0');
      }
    }
    if(s?.hurtFlash>0){c.fillStyle='#df5f4f44';c.fillRect(-offset,0,this.canvas.width,720);}
    if(engine.showTouchHints){for(const h of touchHints(mode)){this.circle(h.x,h.y,52,'#24384188','#f5dfa999');this.label(h.label,h.x,h.y+8,20,'#fff2ca');}}
    if (s) this.effects(s.effects);
    if (s?.paused) { c.fillStyle = '#17232cbf'; c.fillRect(-(this.canvas.width-1200)/2,0,this.canvas.width,720); this.label('EN PAUSA · TU PROGRESO ESTÁ CONSERVADO', 600, 350, 24); }
  }
}
