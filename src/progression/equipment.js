export const gearPower=level=>level<=8?level:8+Math.sqrt(level-8)*.8;
export const EQUIPMENT=Object.freeze({
 helmet:{name:'Casco',icon:'♜',base:30,stat:'Vida',step:22},
 sword:{name:'Espada',icon:'⚔',base:35,stat:'Daño físico',step:12},
 shield:{name:'Escudo',icon:'◈',base:35,stat:'Resistencia',step:5.5},
 armor:{name:'Armadura',icon:'♟',base:40,stat:'Vida',step:44},
 bow:{name:'Arco',icon:'➶',base:40,stat:'Daño / precisión',step:2},
});
export const equipmentCost=(slot,level)=>Math.ceil(EQUIPMENT[slot].base*(level+1)**1.65);
export function equipmentName(slot,level){const tier=level<1?'de aprendiz':level<5?'de hierro':level<10?'de acero':level<20?'de plata':level<40?'de obsidiana':'ancestral';return`${EQUIPMENT[slot].name} ${tier} +${level}`;}
export function equipmentDescription(slot,level){level=gearPower(level);return slot==='shield'?`+${(level*5.5).toFixed(1)} puntos de resistencia`:slot==='bow'?`+${(level*2).toFixed(1)} daño · +${(level*.5).toFixed(1)} puntos de precisión`:`+${(level*EQUIPMENT[slot].step).toFixed(1)} ${EQUIPMENT[slot].stat.toLowerCase()}`;}
export function buyEquipment(state,slot,canMutate=true){if(!canMutate||!EQUIPMENT[slot])return false;const cost=equipmentCost(slot,state.gear[slot]);if(state.coins<cost)return false;state.coins-=cost;state.gear[slot]++;return true;}
