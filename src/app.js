import { awardTraining, createBridge, xpRequired } from './state.js';
import { openSaveSession } from './save-session.js';
import { mountTraining } from './training/controller.js';
import { mountEconomy } from './economy.js';
import { mountSettings } from './settings.js';
import { mountArena } from './arena.js';
const root=document.getElementById('soulsApp');
const saves = await openSaveSession();
const state = saves.state;
const save = () => saves.save();
const canMutate = () => saves.canMutate;
const economy = mountEconomy(state, save, canMutate, root);
let progressDirty = false;
let audio = null, sound = true;
const soundButton = document.createElement('button'); soundButton.className = 'btn'; soundButton.textContent = '🔊 Sonido: sí';
root.querySelector('#settingsSound').append(soundButton);
soundButton.onclick = () => { sound = !sound; soundButton.textContent = sound ? '🔊 Sonido: sí' : '🔇 Sonido: no'; soundButton.blur(); };
function feedback(kind,detail={}) {
  if (!sound) return;
  try {
    audio ||= new AudioContext(); if (audio.state === 'suspended') void audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    const run=Math.min(4,detail.run??0),sword=detail.mode==='str',block=detail.mode==='def';
    oscillator.type=sword?'sawtooth':block?'triangle':'sine';
    oscillator.frequency.setValueAtTime(kind==='miss'?170:block?1050+run*120:sword?1000+run*160:kind==='perfect'?740:510,audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind==='miss'?90:block?600+run*80:sword?220+run*70:500,audio.currentTime+.065);
    gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .08);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .09);
  } catch { /* Sound is optional; training remains playable. */ }
}
const training = mountTraining({
  root, getRecord:mode=>state.comboRecords[mode], getProgress: mode=>({level:state.stats[mode],xp:state.xp[mode],required:xpRequired(state.stats[mode])}),
  reward(mode, earned) {
    const xp = earned.xp > 0 ? earned.xp + (earned.kind==='hit'?state.stations[mode]:0) : 0;
    if (!canMutate()) return { xp: 0 };
    awardTraining(state, mode, { ...earned, xp }); save(); progressDirty = true; return { xp };
  }, onSave: save, feedback, canMutate,
});
const arena = mountArena(state, save, economy.render, canMutate, root);
let view = 'train';
root.querySelectorAll('.tab').forEach(button => button.onclick = () => {
  view = button.dataset.view;
  root.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
  root.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === view));
  training.setView(view); if (view === 'arena') arena.render(); if (view === 'shop') economy.render(); button.blur();
});
// Fixed simulation steps keep collision windows consistent across frame rates.
// Clamp gaps and discard hidden-tab time rather than fast-forwarding missed objects.
let previous = performance.now(), accumulator = 0;
const step = 1 / 120;
function frame(now) {
  const elapsed = Math.min(.1, Math.max(0, (now - previous) / 1000)); previous = now;
  if (!document.hidden) {
    accumulator += elapsed;
    while (accumulator >= step) {
      training.update(step); if (view === 'arena') arena.update(step);
      accumulator -= step;
    }
    if (progressDirty) { economy.renderProgress(); progressDirty = false; }
    training.draw();
  } else accumulator = 0;
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { previous = performance.now(); accumulator = 0; });
window.ArgentumSoulsBridge = createBridge(state);
requestAnimationFrame(frame);

// Keep status and lifecycle outside the game model, ready for a future host adapter.
const saveNotice = document.createElement('div'); saveNotice.id = 'saveStatus'; saveNotice.className = 'notice';
saveNotice.setAttribute('role', 'status');
const saveText = document.createElement('span');
const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'btn'; retry.textContent = 'Reintentar';
retry.onclick = () => { save(); retry.blur(); };
saveNotice.append(saveText, retry); root.querySelector('header').insertAdjacentElement('afterend', saveNotice);
function updateSaveStatus() {
  const result = saves.status;
  saveNotice.dataset.status = result.status;
  saveNotice.setAttribute('role', result.status === 'saved' ? 'status' : 'alert');
  saveNotice.hidden = result.status === 'saved'; saveText.textContent = result.message;
  retry.hidden = result.status !== 'error' || result.reason === 'corrupt';
  training.syncAccess(result);
  // Ownership handoff reloads the shared state object; refresh controls and totals.
  economy.render(); arena.render();
}
// Do not rebuild panels on every successful save; only status/ownership transitions.
let previousSaveStatus = '';
saves.subscribe(() => {
  const key = `${saves.status.status}:${saves.status.reason}`;
  if (key !== previousSaveStatus) { previousSaveStatus = key; updateSaveStatus(); }
});
previousSaveStatus = `${saves.status.status}:${saves.status.reason}`; updateSaveStatus();
window.addEventListener('pagehide', () => saves.close());
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });

mountSettings({root,onOpen:()=>training.pause(),getSaveStatus:()=>saves.status});
