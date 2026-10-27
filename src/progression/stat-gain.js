import {heroStats} from '../combat/balance.js';
export function statGain(before,after,mode){
 const a=heroStats(before),b=heroStats(after),delta=(key,scale=1)=>(Math.max(0,b[key]-a[key])*scale).toLocaleString('es-AR',{maximumFractionDigits:2,minimumFractionDigits:2});
 return mode==='str'?`+${delta('attack')} daño físico`:mode==='def'?`+${delta('hp')} vida · +${delta('armor',100)} puntos de mitigación`:mode==='acc'?`+${delta('hit',100)} puntos de acierto`:mode==='dodge'?`+${delta('evade',100)} puntos de evasión · +${delta('hp')} vida`:`+${delta('crit',100)} puntos de crítico · +${delta('critMultiplier')} multiplicador`;
}
