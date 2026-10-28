import {dodgeMotion} from '../../src/training/geometry.js';
// Only pixels/poses/symbols currently drawn. No age, velocity, arrival, seed, result,
// future bag or ideal timing is exposed. IDs identify already visible objects only.
export function observeTraining(engine){const s=engine.session;const out={mode:s.mode,recovery:s.recovery,paused:s.paused,running:s.running,pointer:{...engine.pointer},objects:[],cue:null,signal:null};
 for(const o of s.objects){if(o.type==='cue'){const m=dodgeMotion(o);let technique=null;if(Math.abs(m.headX)>=18)technique='high';else if(Math.abs(m.armHand.x+50)>=25)technique='mid';else if(Math.abs(m.legFoot.x+22)>=25)technique='low';out.cue={id:o.id,technique,white:m.perfect};}
 else if(o.x+(o.r??20)>=0&&o.x-(o.r??20)<=1200&&o.y+(o.r??20)>=0&&o.y-(o.r??20)<=720)out.objects.push({id:o.id,type:o.type,x:o.x,y:o.y,r:o.r??20});}
 if(s.mode==='crit'){const c=s.critical;if(['fake','ready','air'].includes(c.stage))out.signal={color:c.stage==='fake'?'red':'gold',air:c.stage==='air',white:c.stage==='air'&&c.clock>=.08&&c.clock<=.18};}
 return out;
}
