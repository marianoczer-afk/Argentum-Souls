import {newMissionProgress,normalizeMission,advanceMission,missionText} from '../progression/missions.js';
import {SHIELD,SWORD,DODGE,shieldContact,swordPosition,dodgePerfect,dodgeWindow} from './geometry.js';
import {COMBO_MILESTONES, difficultyTarget, tuning} from './balance.js';
export const MODES = {
  str: { name: 'Fuerza', icon: '🗡️', desc:'Cortá lanzamientos altos, directos y bajos. La estrella trasera es un bonus opcional.', guide: '↑ / W: corte alto · → / D: corte medio · ↓ / S: corte bajo · ← / A: estrella. Encadená pulsaciones. En celular: encima = alto, derecha = medio, debajo = bajo, detrás/izquierda = estrella opcional.' },
  def: { name: 'Defensa', icon: '🛡️', desc: 'Orientá el escudo hacia cada proyectil cuando llegue al círculo de impacto.', guide: 'Mové el mouse o arrastrá el dedo alrededor del guerrero. El escudo responde directamente al puntero.' },
  acc: { name: 'Precisión', icon: '🎯', desc: 'Apuntá y dispará a los blancos antes de que se desvanezcan. El centro da un perfecto.', guide: 'Mouse o toque: acertá dentro del blanco. El arco acompaña la mira; cada disparo deja una trayectoria. Perfecto solo muy cerca del centro. Movimiento leve desde combo 10; las parejas aparecen gradualmente.' },
  dodge: { name: 'Esquiva', icon: '💨', desc: 'Preparación → señal → destello perfecto → golpe. Reaccioná a la señal, no antes.', guide:'↑ / W: saltar patada · ↓ / S: agacharse ante cabezazo · ← / A: retroceder ante el brazo. En celular: arriba para saltar, abajo para agacharse y centro para retroceder. El círculo blanco coincide con Perfecto.' },
  crit: { name: 'Crítico', icon: '✨', desc:'Aviso rojo: esperá. Aviso dorado: saltá. En el aire: pulsá otra vez para golpear.', guide: 'ESPACIO, Enter o clic. Pulsar un amague, adelantarse al aviso aéreo o dejar pasar una señal rompe el combo.' },
};
const DIRS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
export const WORLD = Object.freeze({ width: 1200, height: 720, heroX: 330, heroY: 490, hitX: 350, centerX: 600, centerY: 390 });
export const LANES = [350, 450, 550];
export const strengthKey = lane => ['ArrowUp', 'ArrowRight', 'ArrowDown'][lane];
export function dodgePhase(cue) {
  if(dodgePerfect(cue))return 'perfect';
  const p=cue.age/cue.windup;
  return p<.12?'direction':p<.3?'prepare':cue.age<dodgeWindow(cue).start?'signal':cue.age<=cue.windup+DODGE.late?'late':'strike';
}

export function cuePresentation(s){
  if(!s)return null;
  if(s.mode==='dodge')return null;
  if(s.mode==='crit'){
    const {stage,clock}=s.critical,p=tuning('crit',s.difficulty);
    return{text:{wait:'Observá al muñeco',fake:'! ROJO · NO PULSES',ready:'❗ AHORA · SALTÁ',jump:'Esperá el aviso aéreo',air:clock>=p.perfectStart&&clock<=p.perfectEnd?'★ PERFECTO · GOLPEÁ':'✦ AHORA · GOLPEÁ',impact:s.critical.lastPerfect?'¡PERFECTO!':'¡BIEN!'}[stage],tone:stage==='fake'?'miss':stage==='air'&&clock>=p.perfectStart&&clock<=p.perfectEnd?'perfect':stage};
  }
  return null;
}
const TAU = Math.PI * 2;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// The simulation owns time; rendering and DOM events never choose game outcomes.
export class Training {
  constructor({ random = Math.random, reward = () => {}, feedback = () => {}, getRecord = () => 0,getMission } = {}) {
    this.localMissions={};this.getMission=getMission??(mode=>this.localMissions[mode]??newMissionProgress());this.getRecord=getRecord;this.records={};this.random = random; this.reward = reward; this.feedback = feedback;
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
      errors:0,recovery:false,pendingHurt:0,hurtFlash:0,missionRecord:normalizeMission(this.getMission(mode)),missionFlash:0,missionCompleted:0,hits:0, perfect: 0, misses: 0, score: 0, xp: 0, gold: 0, spawn: .45,
      starTimer:7,phrase:{left:0,factor:1},burstRemaining:0,pendingSword:null,perfectRun:0,bestPerfectRun:0,lastPerfect:-99,impactId:0,mastery:null,throwCue:null, objects: [], effects: [], attacks: [], pose: null, dummy: 0,
      rewardedThrough:Math.max(this.records[mode]??0,this.getRecord(mode)),notice:null,milestone:0,milestoneId:0,laneBag:[],lastLane:-1,lastStrengthArrival:-99,fakeStreak:0,lastArrival:-99, missionDone: false, difficulty: 0, feedback: null, defBag: [], lastSector: -1, pairPending: 0, critical: { stage: 'wait', clock: 0, delay: .7 } };
    return this.session;
  }
  stop() { if (this.session) { this.session.running=false;this.session.paused=false;this.session.recovery=false; } }
  pause(value) { if (this.session?.running) this.session.paused = value; }
  get active() { return this.session?.running && !this.session.paused&&!this.session.recovery; }
  resumeRecovery(){const s=this.session;if(!s?.recovery)return false;s.recovery=false;s.errors=0;s.objects=[];s.attacks=[];s.pendingSword=null;s.spawn=.9;s.starTimer=7;s.critical={stage:'wait',clock:0,delay:.9};s.difficulty=0;s.pose=null;s.pendingHurt=0;return true;}
  missionLabel(){return missionText(this.session.mode,this.session.missionRecord);}
  setScale(scale) { this.scale = Math.max(.15, scale); }
  setPointer(x, y) { this.pointer = { x, y }; }
  effect(kind, x, y, extra = {}) {
    const effects = this.session.effects;
    effects.push({ kind, x, y, age: 0, duration: .45, ...extra });
    if (effects.length > 120) effects.splice(0, effects.length - 120);
  }
  pose(kind, duration = .26, direction = 1) { this.session.pose = { kind, age: 0, duration, direction }; }
  good(perfect,x,y,details={}) {
    const s = this.session;
    if(s.recovery)return;s.errors=0;
    s.hits++; s.combo++; s.best = Math.max(s.best, s.combo); s.perfect += perfect ? 1 : 0;
    s.score += perfect ? 5 : 3;
    const bonus=s.combo>s.rewardedThrough?(COMBO_MILESTONES[s.combo]??0):0;
    s.rewardedThrough=Math.max(s.rewardedThrough,s.combo);this.records[s.mode]=s.rewardedThrough;
    const mission=advanceMission(s.missionRecord,s.mode,{perfect,combo:s.combo,...details});this.localMissions[s.mode]=structuredClone(s.missionRecord);
    const xp=(perfect?3:2)+Math.min(3,Math.floor(s.combo/50))+bonus+(mission?.xp??0);
    const gold=(s.hits%5===0?1:0)+(mission?.gold??0);
    const granted = this.reward(s.mode, { xp, gold, combo:s.combo,kind:'hit',bonus,mission,missionState:structuredClone(s.missionRecord) });
    s.xp += granted?.xp ?? xp; s.gold += gold;
    this.effect('hit', x, y, { perfect });
    this.effect('label', x, y - 30, { text: perfect ? '¡PERFECTO!' : '¡BIEN!', color: perfect ? '#ffe783' : '#b9f3d0', duration: .65 });
    s.feedback = { text: perfect ? '¡PERFECTO!' : '¡BIEN!', tone: perfect ? 'perfect' : 'good', life: .8 };
    const chainWindow=s.mode==='def'?.8:.65;
    s.perfectRun=perfect?(s.time-s.lastPerfect<=chainWindow?s.perfectRun+1:1):0;
    if(perfect)s.lastPerfect=s.time;s.bestPerfectRun=Math.max(s.bestPerfectRun,s.perfectRun);s.impactId++;
    if(s.perfectRun>=2&&['str','def'].includes(s.mode)){
      s.mastery={count:s.perfectRun,life:.4};
      this.effect('chain',s.mode==='def'?600:330,430,{duration:.18,count:s.perfectRun});
      if(s.perfectRun>=3)this.effect('label',600,260,{text:`¡CADENA PERFECTA ×${s.perfectRun}!`,color:'#fff4a1',duration:.65});
    }
    this.feedback(perfect?'perfect':'hit',{mode:s.mode,run:s.perfectRun});
    if(COMBO_MILESTONES[s.combo]){s.milestone=s.combo;s.milestoneId++;}
    if(bonus){s.notice={text:`★ COMBO ${s.combo} · +${bonus} XP extra`,life:2};this.effect('label',600,230,{text:s.notice.text,color:'#fff0a4',duration:1.5});}
    if(mission){s.missionDone=true;s.missionCompleted++;s.missionFlash=2;s.notice={text:`¡MISIÓN ${mission.index} COMPLETADA! · +${mission.xp} XP · +${mission.gold} monedas`,life:2};this.effect('label',600,230,{text:s.notice.text,color:'#ffe783',duration:1.5});}
  }

  bad(x = 350, y = 390, reason = 'FALLO') {
    const s=this.session;if(s.recovery)return;s.errors++;s.recovery=s.errors>=3;s.combo=0; s.misses++;s.perfectRun=0;s.mastery=null;
    this.effect('miss', x, y, { duration: .22 });
    this.effect('label', x, y - 30, { text: reason, color: '#ffc5bb', duration: .5 });
    s.feedback = { text: reason==='FALLO'?'FALLO':`FALLO · ${reason}`, tone: 'miss', life: 1.4 };
    this.feedback('miss');
  }
  spawnObject(burst=false) {
    const s = this.session, d = this.difficulty, p=tuning(s.mode,d,this.scale);
    const object = { id: this.nextId++, age: 0,burst };
    s.dummy = .25;
    if (s.mode === 'str') {
      if(!s.laneBag.length){s.laneBag=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(this.random()*(i+1));[s.laneBag[i],s.laneBag[j]]=[s.laneBag[j],s.laneBag[i]];}}
      const lane=burst&&this.random()<.35&&s.lastLane>=0?s.lastLane:s.laneBag.pop(),y=LANES[lane];
      let speed=clamp(p.speed*(1+(1-s.phrase.factor)*.35)+this.range(-p.speedJitter,p.speedJitter),240,600);
      const launchX=1000,launchY=lane===2?500:450;
      const arrival=Math.max(s.time+(launchX-WORLD.hitX)/speed,s.lastStrengthArrival+p.minActionGap);
      speed=(launchX-WORLD.hitX)/(arrival-s.time);s.lastStrengthArrival=arrival;s.lastLane=lane;
      s.throwCue={lane,age:0};
      Object.assign(object,{type:'apple',lane,x:launchX,y:launchY,startX:launchX,startY:launchY,arc:lane===0?-165:lane===2?-12:0,vx:-speed,vy:0,r:17,arrival});
    } else if (s.mode === 'def') {
      if (!s.defBag.length) {
        s.defBag = Array.from({length:16}, (_, i) => i);
        for (let i = 15; i > 0; i--) { const j = Math.floor(this.random() * (i + 1)); [s.defBag[i],s.defBag[j]] = [s.defBag[j],s.defBag[i]]; }
        if (s.defBag.at(-1) === s.lastSector) [s.defBag[0],s.defBag[15]]=[s.defBag[15],s.defBag[0]];
      }
      const sector = s.defBag.pop(); s.lastSector = sector;
      const a = sector*TAU/16+this.range(-.1,.1);
      // Start the entire apple outside the 1200×720 canvas, in every sector.
      const cx=Math.cos(a),sy=Math.sin(a);
      const radius=Math.min((628+(this.viewportOffset??0))/Math.max(.001,Math.abs(cx)),(sy>=0?358:418)/Math.max(.001,Math.abs(sy)));
      const turn=s.lastAngle===undefined?0:Math.abs(Math.atan2(Math.sin(a-s.lastAngle),Math.cos(a-s.lastAngle)));
      const gap=Math.max(p.minArrivalGap,.18+turn/Math.PI*.2);
      const arrival=Math.max(s.time+Math.max(1.02,p.travel*(1+(s.phrase.factor-1)*.25)),s.lastArrival+gap),travel=arrival-s.time;s.lastAngle=a;
      s.lastArrival=arrival;const speed=(radius-(SHIELD.radius+SHIELD.depth/2+17))/travel;
      Object.assign(object,{type:'apple',sector,arrival,x:600+cx*radius,y:390+sy*radius,vx:-cx*speed,vy:-sy*speed,r:17,originX:600+cx*radius,originY:390+sy*radius});
    } else if (s.mode === 'acc') {
      const sizeRoll=this.random(),depth=sizeRoll<.15?'far':sizeRoll<.5?'mid':'near';
      const r=p.radius*(depth==='far'?.82:depth==='mid'?1.08:1.36)+this.range(0,3);
      let spot;
      const clear=(x,y)=>s.objects.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+r+45);
      for(let attempt=0;attempt<50;attempt++){
        const x=this.range(160+r,1140-r),y=this.range(180+r,590-r);
        if(clear(x,y)){spot={x,y};break;}
      }
      if(!spot)for(const cy of [290,480])for(const cx of [270,525,780,1035]){const x=clamp(cx,160+r,1140-r),y=clamp(cy,180+r,590-r);if(!spot&&clear(x,y))spot={x,y};}
      if(!spot)return; // Retry a later spawn rather than cover another target.
      const {x,y}=spot;
      const life=p.life+this.range(0,.12),motion=p.motion;
      Object.assign(object, { type:'target',depth, x,y,r, life,maxLife:life, vx:motion*(this.random()<.5?-1:1),vy:motion*this.range(-.5,.5) });
    } else if (s.mode === 'dodge') {
      if(!s.dodgeBag?.length){s.dodgeBag=['low','high','mid'];for(let i=2;i>0;i--){const j=Math.floor(this.random()*(i+1));[s.dodgeBag[i],s.dodgeBag[j]]=[s.dodgeBag[j],s.dodgeBag[i]];}}
      const kind=s.dodgeBag.pop();
      Object.assign(object,{type:'cue',kind,windup:p.windup*this.range(.95,1.05),perfectBefore:p.perfectBefore,perfectAfter:p.perfectAfter,resolved:false});
    } else return;
    s.objects.push(object);
  }
  phraseFactor(){
    const phrase=this.session.phrase;
    if(phrase.left--<=0){phrase.left=2+Math.floor(this.random()*4);const options=[.82,1,1.16];let next=options[Math.floor(this.random()*3)];if(next===phrase.factor)next=options[(options.indexOf(next)+1)%3];phrase.factor=next;}
    return phrase.factor;
  }
  startSword(dir){
    const s=this.session;
    const lane={up:0,right:1,down:2,left:-1}[dir];
    s.attacks=[{lane,age:0,duration:SWORD.active,hit:false}];s.pendingSword=null;
    this.pose(lane<0?'back':lane===0?'high':lane===2?'low':'slash',SWORD.animation);
    s.effects=s.effects.filter(e=>e.kind!=='slash');
    if(lane>=0)this.effect('slash',WORLD.hitX,LANES[lane],{duration:.12});
    else {const i=s.objects.findIndex(o=>o.type==='star');if(i>=0){const [star]=s.objects.splice(i,1);this.good(true,star.x,star.y,{special:1});}}
  }
  hitStrength() {
    const s = this.session;
    for (let i = s.objects.length - 1; i >= 0; i--) {
      const o = s.objects[i];
      if (o.type !== 'apple') continue;
      if (s.attacks.some(a => a.lane === o.lane && Math.abs(o.x - WORLD.hitX) < 115 && Math.abs(o.y - LANES[a.lane]) < 40)) {
        s.objects.splice(i, 1); s.attacks.forEach(a => { if (a.lane === o.lane) a.hit = true; });
        this.good(Math.abs(o.x-WORLD.hitX)<35,o.x,o.y,{special:s.attacks.some(a=>a.lane===o.lane&&a.cuts>0)?1:0});s.attacks.forEach(a=>{if(a.lane===o.lane)a.cuts=(a.cuts??0)+1;});
      }
    }
  }
  input(key) {
    if (!this.active) return;
    key = String(key).toLowerCase();
    const s = this.session, dir = DIRS[key];
    if (s.mode === 'str' && dir) {
      if(s.attacks[0]&&s.attacks[0].age<SWORD.commit){s.pendingSword=dir;return;}
      this.startSword(dir);
    } else if (s.mode === 'dodge' && dir) {
      const cue = s.objects[0];
      if (!cue || cue.resolved) return;
      const needed = {low:'up',high:'down',mid:'left'}[cue.kind];
      const phase = dodgePhase(cue);
      cue.resolved=true;cue.action=dir;
      this.pose(dir==='up'?'jump':dir==='down'?'crouch':'dash',Math.max(.4,cue.windup-cue.age+.3),dir==='left'?-1:1);s.pose.evade=true;
      if (dir === needed && cue.age >= cue.windup*DODGE.early && cue.age <= cue.windup+DODGE.late) {
        cue.outcome = phase === 'perfect' ? 'perfect' : 'good';
        cue.perfect=dodgePerfect(cue);
      } else {
        cue.outcome='miss';
        cue.reason=cue.age<cue.windup*.2?'Muy pronto: esperá la señal':dir!==needed?'Dirección incorrecta':'Demasiado tarde';
        s.feedback={text:cue.reason,tone:'miss',life:1.3};
      }
    } else if (s.mode === 'crit' && [' ', 'enter', 'click'].includes(key)) {
      const c = s.critical;
      if (c.stage === 'ready') { c.stage = 'jump'; c.clock = 0; this.pose('jump',.7); }
      else if (c.stage === 'air') {
        const p=tuning('crit',this.difficulty);c.lastPerfect=c.clock>=p.perfectStart&&c.clock<=p.perfectEnd;this.good(c.lastPerfect,800,350);
        c.strikeX = 610 + c.clock * 40; c.strikeY = 350 + c.clock * 20;
        c.stage = 'impact'; c.clock = 0; this.pose('critical', .35);
        this.effect('slash', 800, 350, { duration: .3 });
      } else if (['fake', 'wait', 'jump'].includes(c.stage)) {
        this.bad(600,260,c.stage==='fake'?'Era un amague: no pulses':c.stage==='jump'?'Golpe aéreo demasiado pronto':'Esperá la señal');this.resetCritical(.5);this.pose('hurt');
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
    if (o) { s.objects.splice(s.objects.indexOf(o), 1); this.good(Math.hypot(x-o.x,y-o.y)<o.r*.16,x,y,{special:o.depth==='far'?1:0}); }
    else this.bad(x, y);
  }
  resetCritical(delay) { this.session.critical = { stage: 'wait', clock: 0, delay }; }
  tickCritical(dt) {
    const s=this.session,c=s.critical,p=tuning('crit',this.difficulty);
    c.clock+=dt;
    if(c.stage==='wait'&&c.clock>=c.delay){c.stage=s.fakeStreak<3&&this.random()<p.fakeChance?'fake':'ready';s.fakeStreak=c.stage==='fake'?s.fakeStreak+1:0;c.clock=0;c.limit=(c.stage==='fake'?p.fake:p.ready)*this.range(.94,1.06);}
    else if(c.stage==='fake'&&c.clock>=(c.limit??p.fake)){const before=s.xp;this.good(false,900,270,{special:1});s.feedback={text:`¡AMAGUE LEÍDO! · +${s.xp-before} XP`,tone:'good',life:1};this.resetCritical(this.range(p.waitMin,p.waitMax)*this.phraseFactor());}
    else if(c.stage==='ready'&&c.clock>=(c.limit??p.ready)){this.bad(900,270,'Perdiste la señal de salto');this.resetCritical(.4);}
    else if(c.stage==='jump'&&c.clock>=.32){c.stage='air';c.clock=0;c.limit=p.air*this.range(.96,1.04);}
    else if(c.stage==='air'&&c.clock>=(c.limit??p.air)){this.bad(700,300,'Perdiste el golpe aéreo');this.resetCritical(.4);}
    else if(c.stage==='impact'&&c.clock>=.35)this.resetCritical(this.range(p.waitMin,p.waitMax)*this.phraseFactor());
  }

  update(dt) {
    if (!this.active || !Number.isFinite(dt) || dt <= 0) return;
    const s = this.session, d = this.difficulty, p=tuning(s.mode,d,this.scale);
    const target = difficultyTarget(s.combo), rate = target < s.difficulty ? .55 : .25;
    s.difficulty += clamp(target-s.difficulty,-rate*dt,rate*dt);
    s.missionFlash=Math.max(0,s.missionFlash-dt);s.hurtFlash=Math.max(0,s.hurtFlash-dt);if(s.pendingHurt>0){s.pendingHurt-=dt;if(s.pendingHurt<=0)this.pose('hurt');}
    if(s.throwCue){s.throwCue.age+=dt;if(s.throwCue.age>.22)s.throwCue=null;}
    if(s.mastery){s.mastery.life-=dt;if(s.mastery.life<=0)s.mastery=null;}
    if(s.notice){s.notice.life-=dt;if(s.notice.life<=0)s.notice=null;}
    if(s.feedback){s.feedback.life-=dt;if(s.feedback.life<=0)s.feedback=null;}
    s.time += dt; s.spawn -= dt; s.dummy = Math.max(0, s.dummy - dt);
    if (s.pose) { s.pose.age += dt; if (s.pose.age >= s.pose.duration) s.pose = null; }
    s.effects.forEach(e => { e.age += dt; }); s.effects = s.effects.filter(e => e.age < e.duration);
    if (s.mode === 'crit') { this.tickCritical(dt); return; }
    if (s.spawn <= 0 && (s.mode !== 'dodge' || !s.objects.length) && (s.mode !== 'acc' || s.objects.length < 4)) {
      this.spawnObject();
      if(['str','def','acc'].includes(s.mode)&&this.random()<p.pairChance){s.pairPending=p.pairGap;s.burstRemaining=s.mode!=='acc'&&this.random()<p.tripleChance?2:1;}
      s.spawn+=Math.max(p.minInterval,p.interval*this.phraseFactor()*this.range(.92,1.08));
      if(s.burstRemaining>0)s.spawn=Math.max(s.spawn,p.pairGap*s.burstRemaining+.18);
    }
    if(s.pairPending>0){s.pairPending-=dt;if(s.pairPending<=0){if(s.mode!=='acc'||s.objects.length<4)this.spawnObject(true);if(--s.burstRemaining>0)s.pairPending=p.pairGap;}}
    if (s.mode === 'str') {
      s.starTimer -= dt;
      if (s.starTimer <= 0) {
        s.objects.push({ id: this.nextId++, type: 'star', x: 220, y: 445, life: 2.1, age: 0 });
        s.starTimer = this.range(6, 9);
      }
    }
    for (const o of s.objects) {
      o.age += dt;
      if(o.type==='star'){o.x=220+45*clamp(o.age/2.1,0,1);o.y=445-12*Math.sin(o.age/2.1*Math.PI);}
      if(o.vx!==undefined){
        const nx=o.x+o.vx*dt,ny=o.y+o.vy*dt;
        if(o.type==='target'&&s.objects.some(other=>other!==o&&other.type==='target'&&Math.hypot(nx-other.x,ny-other.y)<o.r+other.r+30)){o.vx*=-1;o.vy*=-1;}
        else {o.x=nx;o.y=ny;}
        if(o.startX!==undefined){const t=clamp((o.startX-o.x)/(o.startX-WORLD.hitX),0,1);o.y=swordPosition(o);}
      }
      if (o.life !== undefined) o.life -= dt;
      if (o.type === 'target') {
        if(o.x<o.r+140||o.x>1140-o.r){o.x=clamp(o.x,o.r+140,1140-o.r);o.vx*=-1;}
        if(o.y<o.r+170||o.y>600-o.r){o.y=clamp(o.y,o.r+170,600-o.r);o.vy*=-1;}
      }
    }
    if (s.mode === 'str') this.hitStrength();
    for (let i = s.objects.length - 1; i >= 0; i--) {
      if(s.recovery)return;const o=s.objects[i];
      if (s.mode === 'def') {
        const distance=Math.hypot(o.x-SHIELD.x,o.y-SHIELD.y),contact=shieldContact(o,this.pointer);
        if(contact){s.objects.splice(i,1);s.blockAngle=Math.atan2(this.pointer.y-390,this.pointer.x-600);this.good(contact.perfect,o.x,o.y,{special:contact.perfect?1:0});this.effect('block',600+Math.cos(s.blockAngle)*76,390+Math.sin(s.blockAngle)*76,{duration:.12});this.pose('block',.13,s.blockAngle);continue;}
        if(distance<SHIELD.radius)o.passedShield=true;
        if(distance<=SHIELD.bodyRadius+(o.r??17)){s.objects.splice(i,1);this.bad(600,390,'Superó el escudo');this.pose('hurt');}
      } else if(o.type==='cue'){
        if(!o.resolved&&o.age>=o.windup+DODGE.late){o.resolved=true;o.outcome='miss';o.reason='No esquivaste a tiempo';this.pose('hurt');}
        if(o.resolved&&!o.awarded&&o.age>=dodgeWindow(o).end){o.awarded=true;if(o.outcome==='miss'){this.bad(DODGE.heroX,DODGE.heroY-90,o.reason);s.pendingHurt=.14;s.hurtFlash=.28;}else this.good(o.perfect,DODGE.heroX,DODGE.heroY-90,{technique:o.kind});}
        if(o.age>=o.windup+DODGE.recover){s.objects.splice(i,1);s.spawn=p.interval*this.phraseFactor()*this.range(.85,1.1);}
      } else if ((o.life !== undefined && o.life <= 0) || (s.mode === 'str' && o.type === 'apple' && o.x < 245)) {
        s.objects.splice(i,1);if(o.type==='star')continue;this.bad(o.x ?? 350, o.y ?? 390, o.type==='star'?'Estrella perdida':'Objeto perdido'); this.pose('hurt');
      }
    }
    for (let i = s.attacks.length - 1; i >= 0; i--) {
      const a = s.attacks[i]; a.age += dt;
      if(s.pendingSword&&a.age>=SWORD.commit){this.startSword(s.pendingSword);break;}
      if (a.age >= a.duration) { s.attacks.splice(i, 1); }
    }
  }
}
