// Shared by simulation, drawing and touch mapping. No separate visual hitboxes.
export const SHIELD = Object.freeze({x:600,y:390,radius:76,depth:21.4,span:66.8,halfAngle:.44,rounding:7,bodyRadius:43});
export const SWORD = Object.freeze({commit:.045,active:.11,animation:.16});
export const DODGE = Object.freeze({heroX:550,heroY:490,dummyX:730,dummyY:490,early:.2,perfectBefore:.06,perfectAfter:.12,late:.23,inputLead:.035,recover:.38});
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
// The white interval ends 200 ms before physical contact. Never draw contact inside Perfect.
export const dodgeImpact=cue=>cue.windup+.12;
export function dodgeWindow(cue){return{start:cue.windup-.08-(cue.perfectBefore??DODGE.perfectBefore)-(cue.perfectAfter??DODGE.perfectAfter),end:cue.windup-.08};}
export function dodgePerfect(cue){const w=dodgeWindow(cue);return cue.age>=w.start&&cue.age<=w.end;}
export function dodgeMotion(cue){
 const w=dodgeWindow(cue),impact=dodgeImpact(cue),clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
 const prepare=smooth(cue.age/w.start),extension=cue.age<=impact?smooth((cue.age-w.end)/(impact-w.end)):1-smooth((cue.age-impact)/.28);
 const cock=prepare*(1-extension),strike=extension;
 return{step:12*cock-38*strike,torsoAngle:cue.kind==='high'?.15*cock-.2*strike:cue.kind==='low'?-.08*cock:0,
 headX:cue.kind==='high'?42*cock-65*strike:0,headY:cue.kind==='high'?-10*cock-10*strike:0,
 arm:cue.kind==='mid'?-40*cock+128*strike:0,kick:cue.kind==='low'?-40*cock+130*strike:0,
 armElbow:cue.kind==='mid'?{x:-15+45*cock-65*strike,y:-24-35*cock}:{x:-30,y:-20},
 armHand:cue.kind==='mid'?{x:-50+65*cock-123*strike,y:-20}:{x:-50,y:-12},
 legKnee:cue.kind==='low'?{x:-12+48*cock-68*strike,y:35-38*cock}:{x:-15,y:40},
 legFoot:cue.kind==='low'?{x:-22+70*cock-138*strike,y:62-5*cock-15*strike}:{x:-22,y:65},
 kneeLift:cue.kind==='low'?-38*cock:0,elbowLift:cue.kind==='mid'?-35*cock:0,prepare:cock,strike,perfect:dodgePerfect(cue)};
}
