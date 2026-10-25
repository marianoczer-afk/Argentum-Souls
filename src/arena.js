// Preserve the playable prototype arena while training receives the first delivery.
export function mountArena(state, save, renderProgress, canMutate = () => true, root = document) {
  const $ = id => root.querySelector(`#${id}`);
  const enemies = [
    { name: 'Saqueador', icon: '🐀', hp: 85, atk: 8 },
    { name: 'Guardia duende', icon: '👺', hp: 135, atk: 13 },
    { name: 'Campeón oscuro', icon: '💀', hp: 205, atk: 19 },
    { name: 'Veterano de hierro', icon: '🛡️', hp: 275, atk: 24 },
    { name: 'Señor de la arena', icon: '🐉', hp: 380, atk: 30 },
  ];
  let fight = null, waves = 3;
  const maxHP = () => 125 + state.gear.armor * 25 + state.stats.def * 3 + state.stats.dodge;
  const log = text => { const row = document.createElement('div'); row.textContent = text; $('log').prepend(row); while ($('log').children.length > 80) $('log').lastChild.remove(); };
  const animate = (id, cls) => { const el = $(id); el.classList.remove('swing', 'struck'); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 210); };
  function next() {
    const enemy = enemies[fight.wave]; fight.enemyMax = enemy.hp + state.wins * 18;
    fight.enemy = fight.enemyMax; fight.enemyClock = 0;
    $('enemyFigure').textContent = enemy.icon;
    log(`${fight.wave === waves - 1 ? '👑 JEFE · ' : ''}Rival ${fight.wave + 1}/${waves}: ${enemy.name}`);
  }
  function render() {
    $('fightStart').disabled = !canMutate();
    const hp = fight?.hero ?? maxHP(), enemy = fight?.enemy ?? enemies[0].hp, em = fight?.enemyMax ?? enemies[0].hp;
    $('heroHp').style.width = `${Math.max(0, hp / maxHP() * 100)}%`; $('heroHpText').textContent = `${Math.round(hp)} / ${maxHP()} HP`;
    $('enemyHp').style.width = `${Math.max(0, enemy / em * 100)}%`; $('enemyHpText').textContent = `${Math.round(enemy)} / ${em} HP`;
    $('enemyName').textContent = fight?.over && fight.wave >= waves ? '¡Campeón!' : enemies[Math.min(fight?.wave ?? 0, 4)].name;
    $('arenaStatus').textContent = fight ? (fight.over ? 'Desafío terminado. Podés iniciar otro.' : `Rival ${fight.wave + 1} de ${waves} · Ataques automáticos activos`) : 'Presioná iniciar para comenzar.';
    for (const [id, key, text] of [['skillSlash', 'slash', '🗡️ Doble golpe'], ['skillShield', 'shield', '🛡️ Guardia'], ['skillHeal', 'heal', '💚 Curar']]) {
      $(id).disabled = !canMutate() || !fight || fight.over || fight.cd[key] > 0;
      $(id).textContent = text + (fight?.cd[key] > 0 ? ` (${Math.ceil(fight.cd[key])}s)` : '');
    }
  }
  function damage(amount) {
    if (!canMutate() || !fight || fight.over) return;
    animate('heroFigure', 'swing'); animate('enemyFigure', 'struck');
    fight.enemy = Math.max(0, fight.enemy - amount); log(`🗡️ Infligís ${Math.round(amount)} de daño.`);
    if (fight.enemy <= 0) {
      fight.wave++;
      if (fight.wave >= waves) {
        fight.over = true; const gold = (waves === 5 ? 180 : 120) + state.wins * 35;
        state.wins++; state.coins += gold; log(`🏆 ¡Victoria! +${gold} monedas.`); save(); renderProgress();
      } else { fight.hero = Math.min(maxHP(), fight.hero + Math.round(maxHP() * .12)); next(); }
    }
    render();
  }
  $('fightStart').onclick = () => {
    if (!canMutate()) return;
    fight = { wave: 0, hero: maxHP(), enemy: 0, enemyMax: 0, clock: 0, enemyClock: 0, cd: { slash: 0, shield: 0, heal: 0 }, guard: 0, over: false };
    $('log').innerHTML = ''; log(`⚔️ ¡Comienza el desafío de ${waves} rivales!`); next(); render();
  };
  function ability(key) {
    if (!canMutate() || !fight || fight.over || fight.cd[key] > 0) return;
    if (key === 'slash') { fight.cd.slash = 8; damage((20 + state.stats.str * 2 + state.gear.sword * 4 + state.gear.bow * 4) * 2); log('⚔️ ¡Doble golpe!'); }
    if (key === 'shield') { fight.cd.shield = 10; fight.guard = 4; log('🛡️ Guardia: reducís daño durante 4 s.'); }
    if (key === 'heal') { fight.cd.heal = 20; fight.hero = Math.min(maxHP(), fight.hero + Math.round(maxHP() * .33)); log('💚 Recuperás vida.'); }
    render();
  }
  $('skillSlash').onclick = () => ability('slash'); $('skillShield').onclick = () => ability('shield'); $('skillHeal').onclick = () => ability('heal');
  const choose = document.createElement('div'); choose.className = 'souls-arena-select';
  choose.innerHTML = '<strong>Rivales por arena:</strong><button class="btn primary" data-waves="3">3 rivales</button><button class="btn" data-waves="5">5 rivales</button>';
  $('arena').querySelector('h2').insertAdjacentElement('afterend', choose);
  choose.querySelectorAll('button').forEach(button => button.onclick = () => {
    waves = Number(button.dataset.waves); fight = null; $('log').innerHTML = '';
    choose.querySelectorAll('button').forEach(b => b.classList.toggle('primary', b === button)); render();
  });
  $('arena').querySelector('aside .panel').insertAdjacentHTML('beforeend', '<p>4. 🛡️ Veterano de hierro</p><p>5. 🐉 Señor de la arena</p>');
  function update(dt) {
    if (!canMutate() || !fight || fight.over) return;
    fight.clock += dt; fight.enemyClock += dt;
    for (const key in fight.cd) fight.cd[key] = Math.max(0, fight.cd[key] - dt);
    fight.guard = Math.max(0, fight.guard - dt);
    if (fight.clock >= 1.5) {
      fight.clock -= 1.5;
      const critical = Math.random() < Math.min(.5, .05 + state.stats.crit * .014);
      damage((12 + state.gear.sword * 5 + state.stats.str * 1.5) * (critical ? 2 : 1));
    }
    if (fight.over) return;
    if (fight.enemyClock >= 2.1) {
      fight.enemyClock -= 2.1;
      if (Math.random() < Math.min(.42, state.stats.dodge * .015)) log('💨 ¡Esquivaste el ataque!');
      else {
        const amount = Math.max(1, (enemies[fight.wave].atk + state.wins * 2 - state.gear.shield * 3 - state.stats.def * .4) * (fight.guard > 0 ? .38 : 1));
        fight.hero = Math.max(0, fight.hero - amount); animate('heroFigure', 'struck'); log(`💥 Recibís ${Math.round(amount)} de daño.`);
        if (fight.hero <= 0) { fight.over = true; log('💀 Derrota. Podés reintentar sin perder progreso.'); }
      }
    }
    render();
  }
  render(); return { update, render };
}
