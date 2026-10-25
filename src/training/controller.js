import { Training, MODES } from './model.js';
import { TrainingRenderer } from './render.js';
export function mountTraining({ reward, onSave, feedback = () => {}, canMutate = () => true }) {
  const $ = id => document.getElementById(id), canvas = $('cv');
  const engine = new Training({ reward, feedback });
  const renderer = new TrainingRenderer(canvas);
  let selected = 'str', view = 'train';
  const actions = document.createElement('div'); actions.className = 'souls-touch';
  actions.innerHTML = '<button type="button" data-key="ArrowLeft">← Medio / Izq.</button><button type="button" data-key="ArrowUp">↑ Alto / Salto</button><button type="button" data-key="ArrowDown">↓ Bajo / Agacharse</button><button type="button" data-key="ArrowRight">→ Estrella / Der.</button><button type="button" data-key=" ">⚡ Acción</button>';
  $('scene').insertAdjacentElement('afterend', actions);
  const mission = document.createElement('div'); mission.id = 'soulsMission'; mission.className = 'notice'; mission.setAttribute('aria-live', 'polite'); actions.insertAdjacentElement('afterend', mission);
  const pause = document.createElement('button'); pause.id = 'pause'; pause.className = 'btn'; pause.textContent = '⏸ Pausar'; $('stop').insertAdjacentElement('afterend', pause);
  function syncModes() {
    $('modes').innerHTML = Object.entries(MODES).map(([key, m]) => `<button class="mode ${key === selected ? 'active' : ''}" data-mode="${key}"><span class="emoji">${m.icon}</span>${m.name}</button>`).join('');
    $('modes').querySelectorAll('button').forEach(button => button.onclick = () => {
      if (engine.session?.running) stop();
      selected = button.dataset.mode; engine.session = null;
      $('overlay').classList.remove('hidden');
      $('overlay').innerHTML = `<div><h3>${MODES[selected].name}</h3><p>Entrená sin límite. Cada acierto suma experiencia; salir conserva lo ganado.</p></div>`;
      $('result').textContent = 'Elegí empezar cuando estés listo.';
      syncModes(); update(); renderer.draw(engine, selected);
    });
    $('instructions').textContent = MODES[selected].desc; $('guide').textContent = MODES[selected].guide;
    canvas.style.cursor = selected === 'acc' ? 'none' : 'default';
    actions.hidden = ['def', 'acc'].includes(selected);
    actions.querySelectorAll('[data-key]').forEach(button => { button.hidden = selected === 'crit' ? button.dataset.key !== ' ' : button.dataset.key === ' '; });
  }
  function stop() {
    if (!engine.session?.running) return;
    engine.stop(); const saved = onSave();
    const s = engine.session;
    $('overlay').classList.remove('hidden');
    $('overlay').innerHTML = `<div><h3>${saved.status === 'saved' ? 'Sesión guardada' : saved.status === 'memory' ? 'Progreso solo en memoria' : 'No se pudo guardar'}</h3><p>+${s.xp} experiencia · +${s.gold} monedas · mejor combo ×${s.best}</p><p>${saved.message}</p></div>`;
    $('result').textContent = `Conservás lo ganado: ${s.hits} aciertos, ${s.perfect} perfectos y ${s.misses} fallos.`;
    update();
  }
  function update() {
    const s = engine.session, time = Math.floor(s?.time ?? 0);
    $('timer').textContent = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
    $('score').textContent = s?.score ?? 0; $('combo').textContent = s?.combo ?? 0; $('perfect').textContent = s?.perfect ?? 0;
    mission.textContent = s ? `🎖 ${s.missionDone ? 'MISIÓN COMPLETA · +15 monedas' : `MISIÓN · Aciertos ${Math.min(12, s.hits)}/12 · Mejor combo ${Math.min(5, s.best)}/5`} | +${s.xp} XP · +${s.gold} monedas` : '🎖 Misión por sesión: 12 aciertos y combo ×5. El entrenamiento continúa al completarla.';
    pause.disabled = !canMutate() || !s?.running; pause.textContent = s?.paused ? '▶ Continuar' : '⏸ Pausar';
    $('start').disabled = !canMutate() || !!s?.running; $('stop').disabled = !s?.running;
  }
  $('start').onclick = () => {
    if (!canMutate()) return;
    $('start').blur(); engine.start(selected); $('overlay').classList.add('hidden');
    $('result').textContent = 'Entrenamiento continuo. Cada acierto suma experiencia; salir conserva lo ganado.'; update();
  };
  $('stop').onclick = stop;
  pause.onclick = () => { if (!canMutate()) return; pause.blur(); engine.pause(!engine.session?.paused); update(); };
  const isTyping = target => target instanceof Element && !!target.closest('input,textarea,select,[contenteditable="true"],button');
  document.addEventListener('keydown', event => {
    if (!canMutate() || view !== 'train' || isTyping(event.target)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    if (event.repeat) return;
    engine.input(event.key); update();
  });
  actions.querySelectorAll('button').forEach(button => button.addEventListener('pointerdown', event => {
    event.preventDefault(); if (!canMutate()) return; engine.input(button.dataset.key); update();
  }));
  function point(event) {
    const r = canvas.getBoundingClientRect();
    return { x: (event.clientX - r.left) * canvas.width / r.width, y: (event.clientY - r.top) * canvas.height / r.height };
  }
  canvas.addEventListener('pointermove', event => { const p = point(event); engine.setPointer(p.x, p.y); });
  canvas.addEventListener('pointerdown', event => {
    if (!canMutate()) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    const p = point(event); engine.click(p.x, p.y); update();
  });
  function autoPause() { if (engine.active) { engine.pause(true); onSave(); update(); } }
  window.addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
  syncModes(); update(); renderer.draw(engine, selected);
  return {
    engine,
    syncAccess(result) {
      if (!canMutate()) engine.pause(true);
      if (engine.session && !engine.session.running) {
        $('overlay').querySelector('h3').textContent = result.status === 'saved' ? 'Sesión guardada' : result.status === 'memory' ? 'Progreso solo en memoria' : 'No se pudo guardar';
        $('overlay').querySelector('p:last-child').textContent = result.message;
      }
      update();
    },
    setView(value) { view = value; if (value !== 'train') autoPause(); },
    update(dt) { if (canMutate() && view === 'train') { engine.update(dt); } },
    draw() { if (view === 'train') { renderer.draw(engine, selected); update(); } },
  };
}
