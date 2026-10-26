// Shared by simulation, drawing and touch mapping. No separate visual hitboxes.
export const SHIELD = Object.freeze({x:600,y:390,radius:76,depth:21.4,span:66.8,halfAngle:.44,rounding:7,bodyRadius:43});
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
 const distance=Math.hypot(dx,dy),angleTo=Math.atan2(dy,dx),relative=Math.atan2(Math.sin(angleTo-angle),Math.cos(angleTo-angle));
 const theta=Math.max(-SHIELD.halfAngle,Math.min(SHIELD.halfAngle,relative));
 const projected=distance*Math.cos(relative-theta),radius=Math.max(SHIELD.radius-SHIELD.depth/2,Math.min(SHIELD.radius+SHIELD.depth/2,projected));
 const separation=Math.hypot(distance*Math.cos(relative)-radius*Math.cos(theta),distance*Math.sin(relative)-radius*Math.sin(theta));
 return separation<=(apple.r??17)?{perfect:Math.abs(relative)<=.11,radial:distance,tangent:Math.sin(relative)*distance}:null;
}
export function swordPosition(apple){
 const t=Math.max(0,Math.min(1,(apple.startX-apple.x)/(apple.startX-350)));
 const y=[350,450,550][apple.lane];
 return apple.startY+(y-apple.startY)*t+Math.sin(Math.PI*t)*apple.arc;
}
export function dodgeWindow(cue){return{start:cue.windup-(cue.perfectBefore??DODGE.perfectBefore),end:cue.windup+(cue.perfectAfter??DODGE.perfectAfter)};}
export function dodgePerfect(cue){const w=dodgeWindow(cue);return cue.age>=w.start&&cue.age<=w.end;}
export function dodgeMotion(cue){
 const w=dodgeWindow(cue),p=Math.max(0,Math.min(1,(cue.age-w.start)/(w.end-w.start)));
 // Extension peaks in the white-ring phase, then recovers; no directional feints.
 const strike=cue.age<=w.end?Math.sin(p*Math.PI):Math.max(0,1-(cue.age-w.end)/.14)*.15;
 const preparing=cue.age<w.start?Math.min(1,cue.age/cue.windup):0;
 return{step:18*preparing-65*strike,torsoAngle:cue.kind==='high'?.18*preparing-.18*strike:cue.kind==='low'?-.08*preparing:0,headX:cue.kind==='high'?22*preparing-55*strike:0,headY:cue.kind==='high'?-17*preparing-14*strike:0,arm:cue.kind==='mid'?-30*preparing+125*strike:0,kick:cue.kind==='low'?-22*preparing+100*strike:0,kneeLift:cue.kind==='low'?-60*preparing:0,elbowLift:cue.kind==='mid'?-45*preparing:0,prepare:preparing,perfect:dodgePerfect(cue)};
}
