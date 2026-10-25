// Combo determines challenge; rhythm phrases vary cadence without shrinking reaction floors.
export const COMBO_MILESTONES = Object.freeze({10:3,25:5,50:8,100:12,150:16,200:20});
export const MISSION_REWARD = Object.freeze({xp:12,gold:15});
export const difficultyTarget = combo => Math.min(1,Math.log1p(Math.max(0,combo)/35)/Math.log1p(150/35));
export function tuning(mode,d,scale=1){
 d=Math.max(0,Math.min(1,d));
 const common={intervalJitter:.08};
 if(mode==='str')return{...common,speed:260+330*d,speedJitter:10,interval:.94-.5*d,minInterval:.34,pairChance:.12+.48*d,pairGap:.29-.08*d,tripleChance:.35*d,minActionGap:.19};
 if(mode==='def')return{...common,travel:2.05-1.01*d,interval:.95-.49*d,minInterval:.37,pairChance:.08+.48*d,pairGap:.38-.08*d,minArrivalGap:.33-.05*d,tripleChance:.16*d};
 if(mode==='acc')return{...common,radius:Math.max(48,Math.min(110,27/scale)),life:2.05-.5*d,interval:1.05-.34*d,minInterval:.55,pairChance:.1+.4*d,pairGap:.4-.08*d,motion:Math.max(0,(d-difficultyTarget(8))/(1-difficultyTarget(8)))*78};
 if(mode==='dodge')return{...common,windup:1.05-.24*d,interval:.32-.1*d,minInterval:.18,accept:.2,perfectStart:-.06,perfectEnd:.12,late:.23};
 return{...common,ready:.78-.16*d,air:.46-.08*d,fake:.64-.1*d,fakeChance:.25+.28*d,waitMin:.16,waitMax:.42-.1*d,perfectStart:.07,perfectEnd:.19};
}
