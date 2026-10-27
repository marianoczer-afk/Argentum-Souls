import {arenaReward} from '../combat/balance.js';
export function claimArena(state,id){
 if(!Number.isInteger(id)||id<1||id>100||id!==state.arena.completed+1)return null;
 const gold=arenaReward(id),region=Math.floor((id-1)/10)+1,slot=['sword','shield','armor','bow','helmet'][(region-1)%5];
 state.arena.completed=id;state.coins+=gold;state.wins++;
 let equipment=null;if(id%10===0){state.gear[slot]++;equipment={slot,level:state.gear[slot]};}
 return{gold,equipment,regionUnlocked:id%10===0&&id<100?region+1:null,trophy:id%10===0?region:null};
}
