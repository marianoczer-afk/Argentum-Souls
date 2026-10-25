import {DODGE} from './geometry.js';
export function touchAction(mode,x,y){
 if(mode==='str')return x<285?'ArrowLeft':y<410?'ArrowUp':y>515?'ArrowDown':'ArrowRight';
 if(mode==='dodge')return y<DODGE.heroY-70?'ArrowUp':y>DODGE.heroY+25?'ArrowDown':'ArrowLeft';
 return null;
}
export function touchHints(mode){
 if(mode==='str')return[{x:330,y:320,label:'↑ ALTO'},{x:510,y:455,label:'→ MEDIO'},{x:330,y:620,label:'↓ BAJO'},{x:160,y:455,label:'← BONUS'}];
 if(mode==='dodge')return[{x:550,y:320,label:'↑ SALTAR'},{x:550,y:620,label:'↓ AGACHAR'},{x:370,y:465,label:'← ATRÁS'}];
 return[];
}
