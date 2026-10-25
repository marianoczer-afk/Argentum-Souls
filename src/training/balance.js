// All rates are seconds/world pixels. Time spent in a session never sets intensity.
export const COMBO_MILESTONES = Object.freeze({10:3,25:5,50:8,100:12,150:16,200:20});
export const MISSION_REWARD = Object.freeze({xp:12,gold:15});
export const difficultyTarget = combo => Math.min(1, Math.log1p(Math.max(0,combo)/40)/Math.log(6));
export function tuning(mode,d,scale=1){
 d=Math.max(0,Math.min(1,d));
 const common={intervalJitter:.1};
 if(mode==='str')return{...common,speed:315+150*d,speedJitter:15,interval:.72-.32*d,pairChance:.42*d,pairGap:.21-.04*d};
 if(mode==='def')return{...common,travel:1.9-.5*d,interval:.84-.34*d,pairChance:.38*d,pairGap:.34-.06*d,minArrivalGap:.26};
 if(mode==='acc')return{...common,radius:Math.max(34,Math.min(110,25/scale)),life:1.95-.4*d,interval:1.02-.28*d,pairChance:.5*d,pairGap:.36-.06*d,motion:Math.max(0,(d-difficultyTarget(8))/(1-difficultyTarget(8)))*72};
 if(mode==='dodge')return{...common,windup:1.28-.14*d,interval:.38-.06*d,accept:.2,perfectStart:.62,perfectEnd:.8,late:.08};
 return{...common,ready:.82-.08*d,air:.48-.06*d,fake:.68-.08*d,fakeChance:.22+.3*d,waitMin:.3-.05*d,waitMax:.55-.08*d,perfectStart:.075,perfectEnd:.2};
}
