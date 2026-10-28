import {mountStage,canvasPoint} from '../stage.js';
import {touchAction} from './controls.js';
import { Training, MODES, WORLD, cuePresentation, clamp } from './model.js';
import { TrainingRenderer } from './render.js';
export function mountTraining({ root=document.getElementById('soulsApp'), reward, onSave, feedback=()=>{}, canMutate=()=>true, getRecord=()=>0,getMission,getTraining,experiment={}, getProgress=()=>({level:0,xp:0,required:20}) }) {
  const $=id=>root.querySelector(`#${id}`), canvas=$('cv'), scene=$('scene');
  const engine=new Training({...experiment,reward,feedback,getRecord,getMission,getTraining}), renderer=new TrainingRenderer(canvas);
  let selected='str',view='train',pauseReason=null,lastMilestone=0,lastImpact=0,lastLevelKey='',lastPercent=0;
  const pause=$('pause');
  function begin(){if(!canMutate())return;engine.start(selected);lastMilestone=0;pauseReason=null;$('overlay').classList.add('hidden');$('result').textContent='';update();}
  function modeButtons(){
    $('modes').innerHTML=Object.entries(MODES).map(([key,m])=>`<button class="mode ${key===selected?'active':''}" data-mode="${key}" aria-pressed="${key===selected}"><span class="emoji">${m.icon}</span>${m.name}</button>`).join('');
    $('modes').querySelectorAll('button').forEach(button=>button.onclick=()=>{onSave();selected=button.dataset.mode;engine.stop();engine.session=null;modeButtons();begin();button.blur();});
    scene.dataset.discipline=selected;$('guide').textContent=MODES[selected].guide;canvas.style.cursor=selected==='acc'?'none':'default';

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
    $('touchHintText').hidden=!engine.showTouchHints;$('touchHintText').textContent=selected==='str'?'Tocá arriba, a la derecha, abajo o detrás del héroe':selected==='dodge'?'Zonas ↑ / ↓ / ← · ? para ayuda':selected==='def'?'Tocá o arrastrá alrededor del héroe':selected==='acc'?'Tocá el centro del objetivo':'Dorado: tocá · rojo: esperá';
    if(s?.impactId!==lastImpact&&s?.perfectRun>=2&&['str','def'].includes(selected)){lastImpact=s.impactId;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('comboFocus').animate([{transform:'scale(1)'},{transform:'scale(1.1)'},{transform:'scale(1)'}],{duration:160});}
    $('cueBanner').hidden=!cue;if(cue){$('cueBanner').textContent=cue.text;$('cueBanner').dataset.tone=cue.tone;}
    $('combo').textContent=s?.combo??0;$('bestCombo').textContent=Math.max(s?.best??0,getRecord(selected));$('sessionXp').textContent=s?.xp??0;
    $('attributeLevel').textContent=`${MODES[selected].name} · Nv ${p.level}`;$('attributeProgress').max=p.required;$('attributeProgress').value=p.xp;$('attributeXp').textContent=`${p.xp} / ${p.required} XP`;
    const percent=Math.min(100,100*p.xp/p.required),notice=s?.levelNotice,key=notice?`${selected}:${notice.from}:${notice.to}`:'';
    $('attributeFill').style.width=`${percent}%`;
    $('trainingBonus').textContent=`Sala ${engine.getTraining(selected).room??1}/10 · +${Math.round(((engine.getTraining(selected).room??1)-1)*10)}% · Estación +${engine.getTraining(selected).station??0} XP · Perfecto +1 XP`;
    $('xpFeedback').textContent=s?.lastXp?`${s.lastXp.passive?'Lectura · ':s.lastXp.combo>=25?'★ ':''}+${s.lastXp.amount.toLocaleString('es-AR')} XP`:'';
    $('xpFeedback').dataset.combo=s?.lastXp?.combo??0;
    $('levelUpNotice').hidden=!notice;
    if(notice&&key!==lastLevelKey){lastLevelKey=key;$('levelUpIcon').textContent=MODES[selected].icon;$('levelUpTitle').textContent=`¡${MODES[selected].name.toUpperCase()} NIVEL ${notice.to}!`;$('levelUpDetail').textContent=(notice.to-notice.from>1?`${notice.to-notice.from} niveles · `:'')+notice.detail;$('levelUpNotice').dataset.from=notice.from;$('levelUpNotice').dataset.to=notice.to;
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){$('attributeFill').animate([{width:`${lastPercent}%`},{width:'100%',offset:.3},{width:'0%',offset:.5},{width:`${percent}%`}],{duration:750});$('levelUpNotice').animate([{opacity:0,transform:'translateY(6px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:260});}
    }lastPercent=percent;
    $('soulsMission').textContent=s?.missionFlash>0?'¡MISIÓN COMPLETADA!':s?engine.missionLabel():'Misión 1';$('recoveryNotice').hidden=!s?.recovery;
    $('rewardNotice').textContent=s?.notice?.text??'';
    if(s?.milestoneId&&s.milestoneId!==lastMilestone){lastMilestone=s.milestoneId;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('comboFocus').animate([{transform:'scale(1)'},{transform:'scale(1.18)',color:'#fff8bf'},{transform:'scale(1)'}],{duration:420});}
    $('actionFeedback').textContent=s?.feedback?.text??'';$('actionFeedback').dataset.tone=s?.feedback?.tone??'';
    pause.disabled=!canMutate()||!s?.running;pause.textContent=s?.paused||s?.recovery?'▶ Continuar':'⏸ Pausar';$('stop').disabled=!s?.running;
  }
  function pauseFor(reason){if(engine.active){engine.pause(true);pauseReason=reason;onSave();update();}}
  pause.onclick=()=>{if(!canMutate())return;if(engine.resumeRecovery()){update();pause.blur();return;}engine.pause(!engine.session?.paused);pauseReason=engine.session?.paused?'manual':null;pause.blur();update();};
  $('stop').onclick=stop;
  const typing=target=>target instanceof Element&&!!target.closest('input,textarea,select,dialog,[contenteditable="true"],button');
  const keydown=event=>{if(!canMutate()||view!=='train'||typing(event.target)||root.hidden)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))event.preventDefault();if(!event.repeat){if(!engine.resumeRecovery())engine.input(event.key);update();}};
  document.addEventListener('keydown',keydown);
  const point=event=>canvasPoint(canvas,event);
  canvas.addEventListener('pointermove',event=>{const p=point(event);engine.setPointer(p.x,p.y);});
  scene.addEventListener('pointerdown',event=>{if(!canMutate()||event.target.closest('button,dialog,a,summary')||(selected!=='crit'&&!event.target.closest('.canvas-wrap')))return;event.preventDefault();if(engine.resumeRecovery()){update();return;}scene.setPointerCapture(event.pointerId);const p=point(event);if(event.pointerType==='touch'&&event.target.closest('.canvas-wrap')&&['str','dodge'].includes(selected))engine.input(touchAction(selected,p.x,p.y));else engine.click(p.x,p.y);update();});
  scene.addEventListener('pointermove',event=>{if(event.pointerType==='touch'){const p=point(event);engine.setPointer(p.x,p.y);}});
  let helpWasActive=false;
  $('trainingHelp').onclick=()=>{helpWasActive=!!engine.active;pauseFor('help');$('controlsDialog').showModal();};
  $('closeControls').onclick=()=>$('controlsDialog').close();
  $('controlsDialog').addEventListener('close',()=>{if(helpWasActive&&canMutate()){engine.pause(false);pauseReason=null;update();}helpWasActive=false;$('trainingHelp').blur();});
  const blur=()=>pauseFor('blur'),visibility=()=>{if(document.hidden)blur();};window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
  const stage=mountStage({frame:scene,canvas,host:root.querySelector('.training-layout'),onResize:info=>{engine.viewportOffset=info.offset;engine.setScale(canvas.clientHeight/720);}});
  modeButtons();stage.fit();begin();update();renderer.draw(engine,selected);
  return{
    engine,pause:()=>pauseFor('settings'),
    syncAccess(result){if(!canMutate())engine.pause(true);else if(!engine.session&&view==='train')begin();if(engine.session&&!engine.session.running){$('overlay').querySelector('h3').textContent=exitTitle(result);$('overlay').querySelector('p:last-child').textContent=result.message;}update();},
    setView(value){const previous=view;view=value;if(value!=='train')pauseFor('navigation');else if(previous!=='train'&&canMutate()){if(!engine.session?.running)begin();else if(pauseReason==='navigation'){engine.pause(false);pauseReason=null;}}},
    update(dt){if(canMutate()&&view==='train')engine.update(dt);},draw(){if(view==='train'){renderer.draw(engine,selected);update();}},
    destroy(){onSave();stage.destroy();document.removeEventListener('keydown',keydown);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);},
  };
}
