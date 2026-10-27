import {gearPower} from '../progression/equipment.js';
export const COMBAT=Object.freeze({heroInterval:1.25,slashCooldown:8,guardCooldown:12,healCooldown:20,guardDuration:3.5,guardMultiplier:.38,healFraction:.3,betweenHeal:.08});
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export const statPower=level=>Math.max(0,level)**.82;
export function heroStats(state){
 const s=state.stats,g=Object.fromEntries(Object.entries(state.gear).map(([key,n])=>[key,gearPower(n)])),def=statPower(s.def),resistance=def*.018+g.shield*.055+g.armor*.014;
 return{hp:140+def*12+g.armor*44+(g.helmet??0)*22+statPower(s.dodge)*2,
 attack:14+statPower(s.str)*3.1+g.sword*12+g.bow*2,
 armor:Math.min(.82,resistance/(1+resistance)),hit:cap(.72+.23*s.acc/(s.acc+40)+g.bow*.005,.5,.985),
 evade:Math.min(.42,.02+.38*s.dodge/(s.dodge+85)),crit:Math.min(.58,.04+.48*s.crit/(s.crit+70)),critMultiplier:1.65+.45*s.crit/(s.crit+100),interval:COMBAT.heroInterval};
}
export function enemyStats(arena,wave,archetype,regionalBoss=false){
 const types={swift:{hp:.8,atk:.77,interval:1.02,armor:.08,evade:.12},brute:{hp:1.05,atk:1.4,interval:2.02,armor:.12,evade:.02},armored:{hp:1.18,atk:.95,interval:1.8,armor:.36,evade:.02},mystic:{hp:.92,atk:1.03,interval:1.65,armor:.15,evade:.06},duelist:{hp:1,atk:1.08,interval:1.4,armor:.19,evade:.08}};
 const t=types[archetype],boss=wave===3;
 return{...t,hp:Math.round((65+arena*3.8+arena**1.45*.85)*t.hp*(boss?(regionalBoss?2.3:1.65):[.85,1,1.16][wave])),attack:(5+arena*.77+arena**1.18*.15)*t.atk*(boss?1.35:1),boss,regionalBoss,archetype};
}
export const arenaReward=id=>45+id*8+Math.floor(id**1.3)*2;
