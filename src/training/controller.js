import {touchAction} from './controls.js';
import { Training, MODES, WORLD, cuePresentation, clamp } from './model.js';
import { TrainingRenderer } from './render.js';
export function mountTraining({ root=document.getElementById('soulsApp'), reward, onSave, feedback=()=>{}, canMutate=()=>true, getRecord=()=>0, getProgress=()=>({level:0,xp:0,required:20}) }) {
  const $=id=>root.querySelector(`#${id}`), canvas=$('cv'), scene=$('scene');
  const engine=new Training({reward,feedback,getRecord}), renderer=new TrainingRenderer(canvas);
  let selected='str',view='train',pauseReason=null,lastMilestone=0,lastImpact=0;
  const actions=$('touchControls'),pause=$('pause');
  function begin(){if(!canMutate())return;engine.start(selected);lastMilestone=0;pauseReason=null;$('overlay').classList.add('hidden');$('result').textContent='';update();}
  function modeButtons(){
    $('modes').innerHTML=Object.entries(MODES).map(([key,m])=>`<button class="mode ${key===selected?'active':''}" data-mode="${key}" aria-pressed="${key===selected}"><span class="emoji">${m.icon}</span>${m.name}</button>`).join('');
    $('modes').querySelectorAll('button').forEach(button=>button.onclick=()=>{onSave();selected=button.dataset.mode;engine.stop();engine.session=null;modeButtons();begin();button.blur();});
    $('guide').textContent=MODES[selected].guide;canvas.style.cursor=selected==='acc'?'none':'default';
    actions.hidden=['def','acc'].includes(selected);
    actions.querySelectorAll('[data-key]').forEach(button=>{
      button.hidden=selected==='crit'?button.dataset.key!==' ':button.dataset.key===' '||(selected==='dodge'&&button.dataset.key==='ArrowRight');
      const labels=selected==='str'?{ArrowLeft:'← Estrella',ArrowUp:'↑ Alto',ArrowRight:'→ Corte',ArrowDown:'↓ Bajo'}:{ArrowLeft:'← Retroceder',ArrowUp:'↑ Saltar',ArrowDown:'↓ Agacharse'};
      button.textContent=labels[button.dataset.key]||'⚡ Acción';
    });
  }
  function exitTitle(saved){return saved.status==='saved'?'Sesión guardada':saved.status==='memory'?'Progreso solo en memoria':'No se pudo guardar';}
  function stop(){
    if(!engine.session?.running)return;engine.stop();pauseReason='exit';const saved=onSave(),s=engine.session;
    $('overlay').classList.remove('hidden');$('overlay').innerHTML=`<div><h3>${exitTitle(saved)}</h3><p>+${s.xp} XP · mejor combo ×${s.best}</p><p>${saved.message}</p></div>`;
    $('result').textContent='';update();
  }
  function update(){
    const s=engine.session,p=getProgress(selected),cue=cuePresentation(s);
    engine.showTouchHints=matchMedia('(pointer: coarse)').matches&&(s?.time??0)<3;
    $('touchHintText').hidden=!engine.showTouchHints;$('touchHintText').textContent=selected==='str'?'Tocá arriba, a la derecha, abajo o detrás del héroe':selected==='dodge'?'Arriba: saltar · abajo: agacharse · centro: retroceder':selected==='def'?'Tocá o arrastrá alrededor del héroe':selected==='acc'?'Tocá el centro del objetivo':'Dorado: tocá · rojo: esperá';
    if(s?.impactId!==lastImpact&&s?.perfectRun>=2&&['str','def'].includes(selected)){lastImpact=s.impactId;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('comboFocus').animate([{transform:'scale(1)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],{duration:160});}
    $('cueBanner').hidden=!cue;if(cue){$('cueBanner').textContent=cue.text;$('cueBanner').dataset.tone=cue.tone;}
    $('combo').textContent=s?.combo??0;$('bestCombo').textContent=Math.max(s?.best??0,getRecord(selected));$('sessionXp').textContent=s?.xp??0;
    $('attributeLevel').textContent=`${MODES[selected].name} · Nv ${p.level}`;$('attributeProgress').max=p.required;$('attributeProgress').value=p.xp;$('attributeXp').textContent=`${p.xp} / ${p.required} XP`;
    $('soulsMission').textContent=s?.missionDone?'🎖 Completa · +12 XP · +15 monedas':`🎖 Aciertos ${Math.min(12,s?.hits??0)}/12 · combo ${Math.min(5,s?.best??0)}/5`;
    $('rewardNotice').textContent=s?.notice?.text??'';
    if(s?.milestoneId&&s.milestoneId!==lastMilestone){lastMilestone=s.milestoneId;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('comboFocus').animate([{transform:'scale(1)'},{transform:'scale(1.18)',color:'#fff8bf'},{transform:'scale(1)'}],{duration:420});}
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
  scene.addEventListener('pointerdown',event=>{if(!canMutate()||event.target.closest('button,dialog,a,summary')||(selected!=='crit'&&!event.target.closest('.canvas-wrap')))return;event.preventDefault();scene.setPointerCapture(event.pointerId);const p=point(event);if(event.pointerType==='touch'&&event.target.closest('.canvas-wrap')&&['str','dodge'].includes(selected))engine.input(touchAction(selected,p.x,p.y));else engine.click(p.x,p.y);update();});
  scene.addEventListener('pointermove',event=>{if(event.pointerType==='touch'){const p=point(event);engine.setPointer(p.x,p.y);}});
  let helpWasActive=false;
  $('trainingHelp').onclick=()=>{helpWasActive=!!engine.active;pauseFor('help');$('controlsDialog').showModal();};
  $('closeControls').onclick=()=>$('controlsDialog').close();
  $('controlsDialog').addEventListener('close',()=>{if(helpWasActive&&canMutate()){engine.pause(false);pauseReason=null;update();}helpWasActive=false;$('trainingHelp').blur();});
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
