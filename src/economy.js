import {buyRoom,roomCost,roomBonus} from './progression/training-xp.js';
import {mountProgressPanel} from './progress-panel.js';
import {MODES} from './training/model.js';
import {xpRequired} from './state.js';
import {EQUIPMENT,equipmentCost,equipmentName,equipmentDescription,buyEquipment} from './progression/equipment.js';
export function mountEconomy(state,save,canMutate=()=>true,root=document){
 const $=id=>root.querySelector('#'+id),renderTrainingProgress=mountProgressPanel(root,state);let selected='sword',signature='';
 function purchase(slot){if(!buyEquipment(state,slot,canMutate()))return;const status=save();$('purchaseFeedback').textContent=`${equipmentName(slot,state.gear[slot])} equipado · ${status.message}`;render();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('equipmentDetail').animate([{background:'#786333'},{background:'#202b36'}],{duration:600});}
 function renderInventory(){
  $('inventorySlots').innerHTML=Object.entries(EQUIPMENT).map(([key,item])=>`<button class="equipment-slot ${key===selected?'active':''}" data-slot="${key}" aria-label="${item.name}">${item.icon}<small>${item.name} +${state.gear[key]}</small></button>`).join('');
  $('inventorySlots').querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{selected=b.dataset.slot;renderInventory();b.blur();});
  const level=state.gear[selected],price=equipmentCost(selected,level);$('equipmentDetail').innerHTML=`<b>${equipmentName(selected,level)}</b><p>${equipmentDescription(selected,level)}</p><small>Próxima: ${equipmentName(selected,level+1)}<br>${equipmentDescription(selected,level+1)}</small><p>${price} monedas${state.coins<price?` · faltan ${price-state.coins}`:''}</p><button class="btn" id="equipBuy" ${!canMutate()||state.coins<price?'disabled':''}>Comprar y equipar</button>`;$('equipBuy').onclick=()=>purchase(selected);
 }
 function renderProgress(){renderTrainingProgress();$('coins').textContent=state.coins.toLocaleString('es-AR');
  const next=JSON.stringify([state.gear,state.coins,canMutate()]);if(signature!==next){signature=next;renderInventory();}
  $('skills').innerHTML=Object.entries(MODES).map(([key,m])=>`<p>${m.name} · Nv ${state.stats[key]} · ${state.xp[key]}/${xpRequired(state.stats[key])} XP</p>`).join('');
 }
 function renderShop(){
  $('shopList').innerHTML=Object.entries(EQUIPMENT).map(([key,item])=>{const level=state.gear[key],price=equipmentCost(key,level);return`<div class="shopitem"><b>${item.icon} ${equipmentName(key,level)}</b><p>${equipmentDescription(key,level)} → ${equipmentDescription(key,level+1)}</p><button class="btn" data-buy="${key}" ${!canMutate()||state.coins<price?'disabled':''}>Comprar y equipar · ${price} monedas</button></div>`;}).join('');$('shopList').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>purchase(b.dataset.buy));
  const cost=roomCost(state.room);$('roomUpgrade').innerHTML=`<h2>Sala de entrenamiento · ${state.room}/10</h2><p>+${Math.round(roomBonus(state.room)*100)}% sobre XP activa de combo. Las estaciones se suman después; Perfecto +1 XP. Las misiones y lecturas no se multiplican.</p><p>${cost===null?'Sala de élite completa':`Próxima: +${state.room*10}% · ${cost} monedas${state.coins<cost?` · faltan ${cost-state.coins}`:''}`}</p><button id="buyRoom" class="btn" ${cost===null||!canMutate()||state.coins<cost?'disabled':''}>Mejorar sala</button><p id="roomFeedback" role="status"></p>`;$('buyRoom').onclick=()=>{if(!buyRoom(state,canMutate()))return;const status=save();render();$('roomFeedback').textContent=`Sala ${state.room} · ${status.message}`;};
  $('soulsStations').innerHTML='<h2>Estaciones</h2><div class="shopgrid">'+Object.entries(MODES).map(([key,m])=>{const level=state.stations[key],price=45*(level+1)**2;return`<div class="shopitem"><b>${m.icon} ${m.name} · Estación ${level}</b><p>+${level} XP por acierto</p><button class="btn" data-station="${key}" ${!canMutate()||state.coins<price?'disabled':''}>Mejorar · ${price} monedas</button></div>`;}).join('')+'</div>';
  $('soulsStations').querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>{const key=b.dataset.station,price=45*(state.stations[key]+1)**2;if(!canMutate()||state.coins<price)return;state.coins-=price;state.stations[key]++;save();render();});
 }
 function render(){renderProgress();renderShop();}render();return{render,renderProgress};
}
