import {normalizeMission} from './progression/missions.js';
// Independent Souls save. Never read Argentum Idle's v7 storage.
export const SAVE_KEY = 'argentum_souls_fiel_v2';
export const ATTRIBUTES = ['str', 'def', 'acc', 'dodge', 'crit'];
const zeros = () => Object.fromEntries(ATTRIBUTES.map(key => [key, 0]));
const number = value => Number.isFinite(value) && value >= 0 ? value : 0;
export function loadState(storage) {
  let raw = {};
  try { raw = JSON.parse((storage ?? globalThis.localStorage).getItem(SAVE_KEY)) || {}; } catch { /* Recover an unreadable save. */ }
  const values = (keys, source) => Object.fromEntries(keys.map(key => [key, Math.floor(number(source?.[key]))]));
  return {
    room:Math.max(1,Math.min(10,Math.floor(number(raw.room))||1)),
    coins: Math.floor(number(raw.coins)), wins: Math.floor(number(raw.wins)),
    stats: values(ATTRIBUTES, raw.stats), xp: values(ATTRIBUTES, raw.xp),
    stations: values(ATTRIBUTES, raw.stations),
    comboRecords: values(ATTRIBUTES, raw.comboRecords),
    gear: values(['sword','armor','shield','bow','helmet'],raw.gear),
    missions:Object.fromEntries(ATTRIBUTES.map(key=>[key,normalizeMission(raw.missions?.[key])])),
    arena:{completed:Math.min(100,Math.floor(number(raw.arena?.completed)))},
  };
}
export function xpRequired(level) { return Math.round(20+level*4+6*Math.max(0,level)**2.3); }
export function awardTraining(state, mode, { xp, gold, combo,missionState }) {
  if(missionState)state.missions[mode]=normalizeMission(missionState);
  if(Number.isFinite(combo)){state.comboRecords ||= zeros();state.comboRecords[mode]=Math.max(state.comboRecords[mode]??0,combo);}
  state.xp ||= zeros();
  state.xp[mode] += xp;
  let levels = 0;
  while (state.xp[mode] >= xpRequired(state.stats[mode])) {
    state.xp[mode] -= xpRequired(state.stats[mode]);
    state.stats[mode]++; levels++;
  }
  state.coins += gold;
  return levels;
}
export function createBridge(state) {
  return Object.freeze({
    schema: 'argentum-souls-progress-v1',
    exportProgress() { return structuredClone(state); },
  });
}
