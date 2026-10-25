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
    coins: Math.floor(number(raw.coins)), wins: Math.floor(number(raw.wins)),
    stats: values(ATTRIBUTES, raw.stats), xp: values(ATTRIBUTES, raw.xp),
    stations: values(ATTRIBUTES, raw.stations),
    gear: values(['sword', 'armor', 'shield', 'bow'], raw.gear),
  };
}
export function xpRequired(level) { return 20 + level * 4; }
export function awardTraining(state, mode, { xp, gold }) {
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
