import {loadState,awardTraining,xpRequired} from '../../src/state.js';import {trainingXp} from '../../src/progression/training-xp.js';import {advanceMission} from '../../src/progression/missions.js';import {purchase} from './economy-policy.mjs';
// Replays RESOLVED events captured from real inputs/physics. Never fabricates success,
// increments a fixed combo, grants free gear, or replaces missions with XP/s.
export class TrainingLedger{
 constructor({variant='X0',economy='none',state=loadState({getItem:()=>null})}={}){this.variant=variant;this.economy=economy;this.state=state;this.totals={xp:0,base:0,room:0,station:0,perfect:0,passive:0,mission:0,gold:0,missions:0};this.purchases=[];this.start();}
 start(){this.hits=0;this.comboLevel=null;this.combo=0;this.streaks=[];}
 miss(){if(this.combo)this.streaks.push(this.combo);this.combo=0;this.comboLevel=null;}
 grant(mode,event){const {perfect=false,details={}}=event;this.hits++;if(!details.passive){this.combo++;if(this.comboLevel===null)this.comboLevel=this.state.stats[mode];}
 const r=trainingXp({combo:this.combo,required:xpRequired(this.comboLevel??this.state.stats[mode]),room:this.state.room,station:this.state.stations[mode],perfect,passive:!!details.passive,variant:this.variant}),mission=advanceMission(this.state.missions[mode],mode,{perfect,combo:this.combo,...details}),xp=r.total+(mission?.xp??0),gold=(this.hits%5===0?1:0)+(mission?.gold??0);
 awardTraining(this.state,mode,{xp,gold,combo:this.combo,missionState:this.state.missions[mode]});const t=this.totals;t.xp+=xp;t.gold+=gold;t.mission+=mission?.xp??0;t.missions+=mission?1:0;if(details.passive)t.passive+=r.total;else{t.base+=Math.round(r.base);t.room+=Math.round(r.base+r.room)-Math.round(r.base);t.station+=r.station;t.perfect+=r.perfect;}
 return{xp,gold};}
 shop(mode){const p=purchase(this.state,this.economy,mode);this.purchases.push(...p);return p;}
}
