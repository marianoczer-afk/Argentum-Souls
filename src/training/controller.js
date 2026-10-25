import { Training, MODES, WORLD, clamp } from './model.js';
import { TrainingRenderer } from './render.js';
export function mountTraining({ root=document.getElementById('soulsApp'), reward, onSave, feedback=()=>{}, canMutate=()=>true, getProgress=()=>({level:0,xp:0,required:20}) }) {
  const $=id=>root.querySelector(`#${id}`), canvas=$('cv'), scene=$('scene');
  const engine=new Training({reward,feedback}), renderer=new TrainingRenderer(canvas);
  let selected='str',view='train',pauseReason=null;
  const actions=$('touchControls'),pause=$('pause');
  function begin(){if(!canMutate())return;engine.start(selected);pauseReason=null;$('overlay').classList.add('hidden');$('result').textContent='Cada acierto suma experiencia. Salir conserva lo ganado.';update();}
  function modeButtons(){
    $('modes').innerHTML=Object.entries(MODES).map(([key,m])=>`<button class="mode ${key===selected?'active':''}" data-mode="${key}" aria-pressed="${key===selected}"><span class="emoji">${m.icon}</span>${m.name}</button>`).join('');
    $('modes').querySelectorAll('button').forEach(button=>button.onclick=()=>{onSave();selected=button.dataset.mode;engine.stop();engine.session=null;modeButtons();begin();button.blur();});
    $('guide').textContent=MODES[selected].guide;canvas.style.cursor=selected==='acc'?'none':'default';
    actions.hidden=['def','acc'].includes(selected);
    actions.querySelectorAll('[data-key]').forEach(button=>{
      button.hidden=selected==='crit'?button.dataset.key!==' ':button.dataset.key===' ';
      const labels=selected==='str'?{ArrowLeft:'← Estrella',ArrowUp:'↑ Alto',ArrowRight:'→ Corte',ArrowDown:'↓ Bajo'}:{ArrowLeft:'← Izquierda',ArrowUp:'↑ Saltar',ArrowRight:'→ Derecha',ArrowDown:'↓ Agacharse'};
      button.textContent=labels[button.dataset.key]||'⚡ Acción';
    });
  }
  function exitTitle(saved){return saved.status==='saved'?'Sesión guardada':saved.status==='memory'?'Progreso solo en memoria':'No se pudo guardar';}
  function stop(){
    if(!engine.session?.running)return;engine.stop();pauseReason='exit';const saved=onSave(),s=engine.session;
    $('overlay').classList.remove('hidden');$('overlay').innerHTML=`<div><h3>${exitTitle(saved)}</h3><p>+${s.xp} XP · mejor combo ×${s.best}</p><p>${saved.message}</p></div>`;
    $('result').textContent='Elegí una disciplina para volver a entrenar.';update();
  }
  function update(){
    const s=engine.session,p=getProgress(selected);
    $('combo').textContent=s?.combo??0;$('bestCombo').textContent=s?.best??0;$('sessionXp').textContent=s?.xp??0;
    $('attributeLevel').textContent=`${MODES[selected].name} · Nv ${p.level}`;$('attributeProgress').max=p.required;$('attributeProgress').value=p.xp;$('attributeXp').textContent=`${p.xp} / ${p.required} XP`;
    $('soulsMission').textContent=s?.missionDone?'🎖 Misión completa · +15 monedas':`🎖 Aciertos ${Math.min(12,s?.hits??0)}/12 · combo ${Math.min(5,s?.best??0)}/5`;
    $('actionFeedback').textContent=s?.feedback?.text??'';$('actionFeedback').dataset.tone=s?.feedback?.tone??'';
    pause.disabled=!canMutate()||!s?.running;pause.textContent=s?.paused?'▶ Continuar':'⏸ Pausar';$('stop').disabled=!s?.running;
  }
  function pauseFor(reason){if(engine.active){engine.pause(true);pauseReason=reason;onSave();update();}}
  pause.onclick=()=>{if(!canMutate())return;engine.pause(!engine.session?.paused);pauseReason=engine.session?.paused?'manual':null;pause.blur();update();};
  $('stop').onclick=stop;
  const typing=target=>target instanceof Element&&!!target.closest('input,textarea,select,dialog,[contenteditable="true"],button');
  const keydown=event=>{if(!canMutate()||view!=='train'||typing(event.target)||root.hidden)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();if(!event.repeat){engine.input(event.key);update();}};
  document.addEventListener('keydown',keydown);
  actions.querySelectorAll('button').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();if(canMutate()){engine.input(button.dataset.key);update();}}));
  function point(event){const r=canvas.getBoundingClientRect();return{x:clamp((event.clientX-r.left)*WORLD.width/r.width,0,WORLD.width),y:clamp((event.clientY-r.top)*WORLD.height/r.height,0,WORLD.height)};}
  canvas.addEventListener('pointermove',event=>{const p=point(event);engine.setPointer(p.x,p.y);});
  scene.addEventListener('pointerdown',event=>{if(!canMutate()||event.target.closest('button'))return;event.preventDefault();scene.setPointerCapture(event.pointerId);const p=point(event);engine.click(p.x,p.y);update();});
  scene.addEventListener('pointermove',event=>{if(event.pointerType==='touch'){const p=point(event);engine.setPointer(p.x,p.y);}});
  const blur=()=>pauseFor('blur'),visibility=()=>{if(document.hidden)blur();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  const resize=()=>engine.setScale(canvas.clientWidth/WORLD.width);const observer=new ResizeObserver(resize);observer.observe(canvas);
  modeButtons();resize();begin();update();renderer.draw(engine,selected);
  return{
    engine,pause:()=>pauseFor('settings'),
    syncAccess(result){if(!canMutate())engine.pause(true);else if(!engine.session&&view==='train')begin();if(engine.session&&!engine.session.running){$('overlay').querySelector('h3').textContent=exitTitle(result);$('overlay').querySelector('p:last-child').textContent=result.message;}update();},
    setView(value){const previous=view;view=value;if(value!=='train')pauseFor('navigation');else if(previous!=='train'&&canMutate()){if(!engine.session?.running)begin();else if(pauseReason==='navigation'){engine.pause(false);pauseReason=null;}}},
    update(dt){if(canMutate()&&view==='train')engine.update(dt);},draw(){if(view==='train'){renderer.draw(engine,selected);update();}},
    destroy(){onSave();observer.disconnect();document.removeEventListener('keydown',keydown);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);},
  };
}
