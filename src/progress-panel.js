import {MODES} from './training/model.js';
import {xpRequired} from './state.js';
export function mountProgressPanel(root,state){
 const panel=root.querySelector('#trainingStats'),previous={};
 panel.innerHTML=Object.entries(MODES).map(([key,m])=>`<div class="training-attribute" data-attribute="${key}"><div><span>${m.icon} ${m.name}</span><b></b></div><progress aria-label="${m.name}: experiencia"></progress><small></small></div>`).join('');
 const rows=Object.fromEntries(Object.keys(MODES).map(key=>[key,panel.querySelector(`[data-attribute="${key}"]`)]));
 return()=>{for(const [key,row] of Object.entries(rows)){
  const level=state.stats[key],xp=state.xp[key],required=xpRequired(level);
  if(previous[key]?.level===level&&previous[key]?.xp===xp)continue;
  row.querySelector('b').textContent=`Nv ${level}`;row.querySelector('progress').max=required;row.querySelector('progress').value=xp;row.querySelector('small').textContent=`${xp} / ${required} XP`;
  if(previous[key]&&level>previous[key].level&&!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{background:'#786333',transform:'scale(1.03)'},{background:'transparent',transform:'scale(1)'}],{duration:750});
  previous[key]={level,xp};
 }};
}
