// Shared by simulation, drawing and touch mapping. No separate visual hitboxes.
export const SHIELD = Object.freeze({x:600,y:390,radius:76,depth:20,span:62,rounding:7,bodyRadius:43});
export const SWORD = Object.freeze({commit:.045,active:.11,animation:.16});
export const DODGE = Object.freeze({heroX:550,heroY:490,dummyX:730,dummyY:490,early:.2,perfectBefore:.06,perfectAfter:.12,late:.23,recover:.34});
export function shieldGeometry(pointer){
 const angle=Math.atan2(pointer.y-SHIELD.y,pointer.x-SHIELD.x);
 return{angle,x:SHIELD.x+Math.cos(angle)*SHIELD.radius,y:SHIELD.y+Math.sin(angle)*SHIELD.radius};
}
export function shieldContact(apple,pointer){
 if(apple.passedShield)return null;
 const {angle}=shieldGeometry(pointer),dx=apple.x-SHIELD.x,dy=apple.y-SHIELD.y;
 if(Math.hypot(dx,dy)<SHIELD.radius)return null; // No catches from the back after passing the shield.
 const radial=dx*Math.cos(angle)+dy*Math.sin(angle),tangent=-dx*Math.sin(angle)+dy*Math.cos(angle);
 if(radial<SHIELD.radius)return null;
 const u=Math.max(Math.abs(radial-SHIELD.radius)-(SHIELD.depth/2-SHIELD.rounding),0),v=Math.max(Math.abs(tangent)-(SHIELD.span/2-SHIELD.rounding),0);
 return u*u+v*v<=((apple.r??17)+SHIELD.rounding)**2?{perfect:Math.abs(tangent)<=11,radial,tangent}:null;
}
export function swordPosition(apple){
 const t=Math.max(0,Math.min(1,(apple.startX-apple.x)/(apple.startX-350)));
 const y=[350,450,550][apple.lane];
 return apple.startY+(y-apple.startY)*t+Math.sin(Math.PI*t)*apple.arc;
}
export function dodgeWindow(cue){return{start:cue.windup-DODGE.perfectBefore,end:cue.windup+DODGE.perfectAfter};}
export function dodgePerfect(cue){const w=dodgeWindow(cue);return cue.age>=w.start&&cue.age<=w.end;}
export function dodgeMotion(cue){
 const w=dodgeWindow(cue),p=Math.max(0,Math.min(1,(cue.age-w.start)/(w.end-w.start)));
 // Extension peaks in the white-ring phase, then recovers; no directional feints.
 const strike=cue.age<=w.end?Math.sin(p*Math.PI):Math.max(0,1-(cue.age-w.end)/.14)*.15;
 const preparing=cue.age<w.start?Math.min(1,cue.age/cue.windup):0;
 return{step:8*preparing-65*strike,headX:cue.kind==='high'?6*preparing-55*strike:0,headY:cue.kind==='high'?-5*preparing-14*strike:0,arm:cue.kind==='mid'?-12*preparing+125*strike:0,kick:cue.kind==='low'?-8*preparing+100*strike:0,prepare:preparing,perfect:dodgePerfect(cue)};
}
