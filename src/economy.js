import { MODES } from './training/model.js';
import { xpRequired } from './state.js';
const GEAR = {
  sword: { name: 'Espada templada', desc: '+5 daño por nivel', base: 35 },
  armor: { name: 'Armadura reforzada', desc: '+25 vida máxima por nivel', base: 40 },
  shield: { name: 'Escudo resistente', desc: '+3 defensa por nivel', base: 35 },
  bow: { name: 'Arco de precisión', desc: '+4 daño especial por nivel', base: 40 },
};
export function mountEconomy(state, save) {
  const $ = id => document.getElementById(id);
  const station = document.createElement('div'); station.id = 'soulsStations'; $('shopList').insertAdjacentElement('afterend', station);
  function render() {
    $('coins').textContent = state.coins.toLocaleString('es-AR');
    $('skills').innerHTML = Object.entries(MODES).map(([key, mode]) => `<div class="skillrow"><div><span>${mode.icon} ${mode.name}</span><b>Nv ${state.stats[key]}</b></div><div class="meter"><div style="width:${state.xp[key] / xpRequired(state.stats[key]) * 100}%"></div></div><small>${state.xp[key]} / ${xpRequired(state.stats[key])} XP</small></div>`).join('');
    $('arenaStats').innerHTML = `<p>🏆 Victorias: <b>${state.wins}</b></p><p>🪙 Monedas: <b>${state.coins}</b></p>` + Object.entries(MODES).map(([key, mode]) => `<p>${mode.icon} ${mode.name}: ${state.stats[key]}</p>`).join('');
    $('shopList').innerHTML = Object.entries(GEAR).map(([key, item]) => {
      const level = state.gear[key], cost = item.base * (level + 1);
      return `<div class="shopitem"><b>${item.name} · Nv ${level}</b><p>${item.desc}</p><button class="btn" data-buy="${key}" ${state.coins < cost ? 'disabled' : ''}>Mejorar · ${cost} 🪙</button></div>`;
    }).join('');
    $('shopList').querySelectorAll('[data-buy]').forEach(button => button.onclick = () => {
      const key = button.dataset.buy, cost = GEAR[key].base * (state.gear[key] + 1);
      if (state.coins < cost) return;
      state.coins -= cost; state.gear[key]++; save(); render();
    });
    station.innerHTML = '<h2>🏋️ Estaciones de entrenamiento</h2><p class="muted">Cada nivel suma experiencia a cada acierto, sin esperar al final de una sesión.</p><div class="shopgrid">' + Object.entries(MODES).map(([key, mode]) => {
      const level = state.stations[key], cost = 45 * (level + 1) ** 2;
      return `<div class="shopitem"><b>${mode.icon} ${mode.name} · Estación Nv ${level}</b><p>+${level} XP por acierto</p><button class="btn" data-station="${key}" ${state.coins < cost ? 'disabled' : ''}>Mejorar · ${cost} 🪙</button></div>`;
    }).join('') + '</div>';
    station.querySelectorAll('[data-station]').forEach(button => button.onclick = () => {
      const key = button.dataset.station, cost = 45 * (state.stations[key] + 1) ** 2;
      if (state.coins < cost) return;
      state.coins -= cost; state.stations[key]++; save(); render();
    });
  }
  render(); return { render };
}
