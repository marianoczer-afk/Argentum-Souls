import {TrainingMeasurement} from './experiments/measurement.js';
import {experimentFromSearch} from './experiments/a32.js';
import {statGain} from './progression/stat-gain.js';
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
    oscillator.frequency.setValueAtTime(kind==='level'?1320:kind==='miss'?170:block?1050+run*120:sword?1000+run*160:kind==='perfect'?740:510,audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind==='level'?1760:kind==='miss'?90:block?600+run*80:sword?220+run*70:500,audio.currentTime+.065);
    gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .08);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .09);
  } catch { /* Sound is optional; training remains playable. */ }
}
const experiment=experimentFromSearch(location.search);
const measuring=experiment.rhythm!=='control'||experiment.xpVariant!=='X0'||new URLSearchParams(location.search).get('measure')==='1';
const measurement=measuring?new TrainingMeasurement({...experiment,viewport:{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio},build:document.querySelector('meta[name="souls-build"]')?.content}):null;
if(measuring){const badge=document.createElement('details');badge.className='notice';badge.id='experimentStatus';const summary=document.createElement('summary');summary.textContent=`A.3.2 experimental · ${experiment.rhythm} · XP ${experiment.xpVariant} · Medición local`;badge.append(summary);const backup=document.createElement('button');backup.className='btn small';backup.textContent='Exportar copia Souls';backup.onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='argentum-souls-a32-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);backup.blur();};const report=document.createElement('button');report.className='btn small';report.textContent='Exportar medición';report.onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(measurement.export(),null,2)],{type:'application/json'}));a.href=url;a.download='argentum-souls-a32-measurement.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);report.blur();};badge.append(' · ',backup,' ',report);window.ArgentumSoulsExperiment=Object.freeze({exportMeasurement:()=>measurement.export()});root.querySelector('header').insertAdjacentElement('afterend',badge);}
const training = mountTraining({experiment,measurement,
  root,getTraining:mode=>({level:state.stats[mode],room:state.room,station:state.stations[mode]}), getMission:mode=>state.missions[mode],getRecord:mode=>state.comboRecords[mode], getProgress: mode=>({level:state.stats[mode],xp:state.xp[mode],required:xpRequired(state.stats[mode])}),
  reward(mode, earned) {
    const xp=earned.xp;
    if (!canMutate()) return { xp: 0 };
    const before=structuredClone(state),levels=awardTraining(state,mode,{...earned,xp});save();progressDirty=true;return{xp,levelUp:levels?{from:before.stats[mode],to:state.stats[mode],detail:statGain(before,state,mode)}:null};
  }, onSave: save, feedback, canMutate,
});
const arena = mountArena(state,save,economy.render,canMutate,root,feedback);
let view = 'train';
root.querySelectorAll('.tab').forEach(button => button.onclick = () => {
  view = button.dataset.view;
  root.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
  root.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === view));
  training.setView(view);arena.setView(view==='arena'); if (view === 'arena') arena.render(); if (view === 'shop') economy.render(); button.blur();
});
// Fixed simulation steps keep collision windows consistent across frame rates.
// Clamp gaps and discard hidden-tab time rather than fast-forwarding missed objects.
let previous = performance.now(), accumulator = 0;
const step = 1 / 120;
function frame(now) {
  const wallElapsed=Math.max(0,(now-previous)/1000),elapsed=Math.min(.1,wallElapsed); previous = now;
  if (!document.hidden) {
    accumulator += elapsed;
    while (accumulator >= step) {
      training.update(step); if (view === 'arena') arena.update(step);
      accumulator -= step;
    }
    if (progressDirty) { economy.renderProgress(); progressDirty = false; }
    if(view==='train')measurement?.sample(training.engine,wallElapsed);
    training.draw();if(view==='arena')arena.draw();
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

mountSettings({root,onOpen:()=>{training.pause();arena.pause();},getSaveStatus:()=>saves.status});

const mobile=matchMedia('(max-width: 899px), (max-height: 520px)');
function panels(){for(const id of ['inventoryPanel','attributesPanel'])root.querySelector('#'+id).open=!mobile.matches;}panels();mobile.addEventListener('change',panels);
for(const id of ['inventoryPanel','attributesPanel'])root.querySelector('#'+id).addEventListener('toggle',e=>{if(mobile.matches&&e.target.open){training.pause();arena.pause();}});
