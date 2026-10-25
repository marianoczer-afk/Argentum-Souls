import test from 'node:test';
import assert from 'node:assert/strict';
import { Training, MODES, LANES } from '../src/training/model.js';
import { heroTransform } from '../src/training/render.js';
import { loadState, persist, awardTraining, SAVE_KEY } from '../src/state.js';
const advance = (engine, seconds) => { for (let i = 0; i < Math.round(seconds * 120); i++) engine.update(1 / 120); };
const apple = (id, lane, x) => ({ id, type: 'apple', lane, x, y: LANES[lane], vx: -300, vy: 0, age: 0 });

test('all five disciplines remain active after ten minutes, with bounded difficulty and objects', () => {
  for (const mode of Object.keys(MODES)) {
    const engine = new Training({ random: () => .6 }); engine.start(mode); advance(engine, 600);
    assert.equal(engine.session.running, true, mode);
    assert.ok(engine.session.time > 599, mode);
    assert.ok(engine.difficulty >= .8 && engine.difficulty <= 1, mode);
    assert.ok(engine.session.objects.length < 20, mode);
    assert.ok(engine.session.effects.length <= 120, mode);
  }
});
test('difficulty accelerates spawning and speed without a duration denominator', () => {
  const a = new Training({ random: () => .5 }); a.start('str'); a.spawnObject();
  const earlySpeed = -a.session.objects[0].vx;
  a.session.time = 300; a.spawnObject();
  assert.ok(-a.session.objects[1].vx > earlySpeed);
  assert.ok(-a.session.objects[1].vx <= 465);
});
test('one sword sweep cuts multiple nearby apples and chains without cooldown', () => {
  const rewards = [], engine = new Training({ reward: (_, r) => rewards.push(r) }); engine.start('str');
  engine.session.objects = [apple(1, 0, 290), apple(2, 0, 335), apple(3, 1, 290)];
  engine.input('ArrowUp'); assert.equal(engine.session.hits, 2);
  engine.input('ArrowLeft'); assert.equal(engine.session.hits, 3);
  assert.equal(engine.session.combo, 3); assert.equal(rewards.length, 3);
  assert.equal(engine.session.objects.length, 0);
});
test('a sweep can catch an incoming apple during its active window; empty attacks break combo', () => {
  const engine = new Training(); engine.start('str'); engine.session.combo = 4;
  engine.session.objects = [apple(1, 0, 412)]; engine.input('w');
  advance(engine, .08); assert.equal(engine.session.hits, 1);
  engine.input('s'); advance(engine, .12);
  assert.equal(engine.session.combo, 0); assert.equal(engine.session.misses, 1);
});
test('rear stars are distinct from apple lanes', () => {
  const engine = new Training(); engine.start('str');
  engine.session.objects = [{ id: 1, type: 'star', x: 105, y: 225, age: 0, life: 1.5 }];
  engine.input('d'); assert.equal(engine.session.perfect, 1);
  engine.input('d'); assert.equal(engine.session.combo, 0);
});
test('defense blocks at impact when aimed and misses the opposite side', () => {
  const engine = new Training(); engine.start('def'); engine.setPointer(700, 270);
  engine.session.objects = [{ id: 1, type: 'apple', x: 535, y: 270, vx: -200, vy: 0, age: 0 }];
  advance(engine, .02); assert.equal(engine.session.hits, 1);
  engine.session.objects = [{ id: 2, type: 'apple', x: 402, y: 270, vx: 200, vy: 0, age: 0 }];
  advance(engine, .02); assert.equal(engine.session.misses, 1);
});
test('precision center hit gives perfect, off-target shot breaks combo', () => {
  const engine = new Training(); engine.start('acc');
  engine.session.objects = [{ id: 1, type: 'target', x: 500, y: 240, r: 30, age: 0, life: 2, maxLife: 2, vx: 0, vy: 0 }];
  engine.click(500, 240); assert.equal(engine.session.perfect, 1);
  assert.ok(engine.session.effects.some(e => e.kind === 'arrow'));
  engine.click(850, 440); assert.equal(engine.session.combo, 0);
});
test('every dodge cue maps to a different directional movement', () => {
  for (const [kind, key, pose] of [['low', 'ArrowUp', 'jump'], ['high', 'ArrowDown', 'crouch'], ['left', 'ArrowRight', 'dash'], ['right', 'ArrowLeft', 'dash']]) {
    const engine = new Training(); engine.start('dodge');
    engine.session.objects = [{ id: 1, type: 'cue', kind, age: .65, windup: 1 }];
    engine.input(key); assert.equal(engine.session.hits, 1); assert.equal(engine.session.pose.kind, pose);
  }
});
test('critical fake must be ignored and real cue requires two separated inputs', () => {
  const engine = new Training(); engine.start('crit');
  engine.session.critical = { stage: 'fake', clock: 0, delay: 0 };
  engine.input(' '); assert.equal(engine.session.misses, 1);
  engine.session.critical = { stage: 'fake', clock: 0, delay: 0 };
  advance(engine, .9); assert.equal(engine.session.misses, 1);
  engine.session.critical = { stage: 'ready', clock: 0, delay: 0 };
  engine.input(' '); assert.equal(engine.session.critical.stage, 'jump');
  advance(engine, .42); assert.equal(engine.session.critical.stage, 'air');
  engine.input('click'); assert.equal(engine.session.hits, 1); assert.equal(engine.session.critical.stage, 'impact');
  engine.input(' '); assert.equal(engine.session.hits, 1, 'impact cannot be farmed');
});
test('early second critical input or a missed cue resets combo', () => {
  const engine = new Training(); engine.start('crit'); engine.session.combo = 7;
  engine.session.critical = { stage: 'ready', clock: 0, delay: 0 };
  engine.input(' '); engine.input(' '); assert.equal(engine.session.combo, 0);
  engine.session.critical = { stage: 'ready', clock: 0, delay: 0 };
  advance(engine, 1); assert.equal(engine.session.misses, 2);
});
test('pausing freezes simulation, events and effects, stopping never removes earned XP', () => {
  const engine = new Training(); engine.start('str');
  engine.session.objects = [apple(1, 1, 300)]; engine.input('a');
  const snapshot = structuredClone(engine.session); engine.pause(true); advance(engine, 60); engine.input('a');
  assert.equal(engine.session.time, snapshot.time); assert.equal(engine.session.hits, 1);
  engine.stop(); assert.equal(engine.session.xp, snapshot.xp); assert.equal(engine.session.running, false);
});
test('combos reward more XP and a mission grants its bonus once without ending training', () => {
  const rewards = [], engine = new Training({ reward: (_, r) => rewards.push(r) }); engine.start('str');
  for (let i = 0; i < 20; i++) engine.good(true, 300, 280);
  const hits = rewards.filter(r => r.xp > 0);
  assert.ok(hits[19].xp > hits[0].xp);
  assert.equal(rewards.filter(r => r.gold === 15).length, 1);
  assert.equal(engine.session.running, true);
});
test('poses have different visible paths and settle to rest', () => {
  const p = kind => heroTransform({ kind, age: .15, duration: .3, direction: -1 });
  assert.ok(p('jump').y < -80); assert.ok(p('crouch').scaleY < .7);
  assert.ok(p('dash').x < -70); assert.notEqual(p('slash').sword, -.5);
  assert.deepEqual(heroTransform(null), { x: 0, y: 0, scaleY: 1, sword: -.5 });
});
test('old Souls saves retain levels, coins, gear, wins, and stations; only Souls key is read', () => {
  const keys = [];
  const state = loadState({ getItem(key) { keys.push(key); return JSON.stringify({ coins: 55, wins: 3, stats: { str: 100 }, gear: { sword: 2 }, stations: { str: 1 } }); } });
  assert.deepEqual(keys, [SAVE_KEY]); assert.equal(state.stats.str, 100); assert.equal(state.coins, 55);
  assert.equal(state.gear.sword, 2); assert.equal(state.stations.str, 1); assert.equal(state.wins, 3);
  awardTraining(state, 'str', { xp: 420, gold: 2 }); assert.equal(state.stats.str, 101); assert.equal(state.coins, 57);
  let stored; assert.equal(persist(state, { setItem(key, value) { stored = value; } }), true);
  assert.equal(loadState({ getItem() { return stored; } }).stats.str, 101);
});
test('bad storage is recoverable and write denial is surfaced', () => {
  const state = loadState({ getItem() { throw new Error('denied'); } }); assert.equal(state.coins, 0);
  assert.equal(persist(state, { setItem() { throw new Error('quota'); } }), false);
});
