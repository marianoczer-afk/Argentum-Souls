import {xpRequired} from '../state.js';
import {XP_CANDIDATES} from '../experiments/a32.js';
// A combo snapshots its starting level: levelling up cannot recursively inflate the same streak.
export const ROOM_MAX=10;
export const roomBonus=level=>.1*(Math.max(1,Math.min(ROOM_MAX,level))-1);
export const roomCost=level=>level>=ROOM_MAX?null:Math.round(180*level**2.15);
export function buyRoom(state,allowed=true){const cost=roomCost(state.room);if(!allowed||cost===null||state.coins<cost)return false;state.coins-=cost;state.room++;return true;}
export const rawComboXp=combo=>combo===1?2:combo===2?4:combo===3?12:combo*(combo-1)+4;
export function comboXp(combo,required,variant='X0'){
 if(!Object.hasOwn(XP_CANDIDATES,variant))throw Error('Unknown XP candidate');
 const candidate=XP_CANDIDATES[variant];if(combo<=3)return rawComboXp(combo);
 if(candidate.kind==='linear')return 12+candidate.slope*(combo-3);
 if(candidate.kind==='capped')required=Math.min(required,xpRequired(candidate.cap));
 const floor=combo+8,extra=rawComboXp(combo)-floor,budget=Math.max(24,required*.18);
 // Strictly growing before integer rounding; linear tail prevents a flat cap.
 return floor+extra/(1+extra/budget);
}
export function trainingXp({combo,required,room=1,station=0,perfect=false,passive=false,variant='X0',disciplineMultiplier=1}){
 if(passive)return{base:0,room:0,station:0,perfect:0,total:1,passive:true};
 const base=comboXp(combo,required,variant)*disciplineMultiplier,roomXp=base*roomBonus(room),perfectXp=perfect?1:0;
 // Stations and Perfects are additive, never multiplied by combo or room.
 return{base,room:roomXp,station,perfect:perfectXp,total:Math.round(base+roomXp)+station+perfectXp,passive:false};
}
