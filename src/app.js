import { loadState, persist, awardTraining, createBridge } from './state.js';
import { mountTraining } from './training/controller.js';
import { mountEconomy } from './economy.js';
import { mountArena } from './arena.js';
const state = loadState();
let saveError = null;
function save() {
  const ok = persist(state);
  if (!ok && !saveError) {
    saveError = document.createElement('p'); saveError.className = 'notice'; saveError.setAttribute('role', 'alert');
    saveError.textContent = 'El navegador no permite guardar. Tu progreso sigue en esta pestaña; habilitá el almacenamiento antes de cerrarla.';
    document.querySelector('header').insertAdjacentElement('afterend', saveError);
  } else if (ok && saveError) { saveError.remove(); saveError = null; }
}
const economy = mountEconomy(state, save);
let audio = null, sound = true;
const soundButton = document.createElement('button'); soundButton.className = 'btn'; soundButton.textContent = '🔊 Sonido: sí';
document.getElementById('stop').insertAdjacentElement('afterend', soundButton);
soundButton.onclick = () => { sound = !sound; soundButton.textContent = sound ? '🔊 Sonido: sí' : '🔇 Sonido: no'; soundButton.blur(); };
function feedback(kind) {
  if (!sound) return;
  try {
    audio ||= new AudioContext(); if (audio.state === 'suspended') void audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.frequency.value = kind === 'miss' ? 170 : kind === 'perfect' ? 740 : 510;
    gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .08);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .09);
  } catch { /* Sound is optional; training remains playable. */ }
}
const training = mountTraining({
  reward(mode, earned) {
    const xp = earned.xp > 0 ? earned.xp + state.stations[mode] : 0;
    awardTraining(state, mode, { ...earned, xp }); save(); economy.render(); return { xp };
  }, onSave: save, feedback,
});
const arena = mountArena(state, save, economy.render);
let view = 'train';
document.querySelectorAll('.tab').forEach(button => button.onclick = () => {
  view = button.dataset.view;
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === view));
  training.setView(view); if (view === 'arena') arena.render(); button.blur();
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
    training.draw();
  } else accumulator = 0;
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { previous = performance.now(); accumulator = 0; });
window.ArgentumSoulsBridge = createBridge(state);
requestAnimationFrame(frame);
