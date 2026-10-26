export const newMissionProgress=()=>({index:1,hits:0,perfect:0,combo:0,special:0,kinds:0});
export function normalizeMission(raw){const p=newMissionProgress();for(const key of Object.keys(p))if(Number.isFinite(raw?.[key]))p[key]=Math.max(key==='index'?1:0,Math.floor(raw[key]));p.kinds&=7;return p;}
const challenges={str:'Recogé estrellas o cortá varias frutas',def:'Conseguí bloqueos centrados',acc:'Acertá blancos lejanos',dodge:'Usá las tres evasiones',crit:'Leé los amagues rojos'};
export function missionSpec(mode,index){
 const round=Math.floor((index-1)/5),kind=(index-1)%5;
 const specs=[{title:'Primer dominio',hits:12+round*12,combo:5+round*4},{title:'Pulso preciso',perfect:8+round*6,combo:8+round*4},{title:challenges[mode],...(mode==='dodge'?{kinds:7}:{special:3+round*2}),hits:8+round*8},{title:'Cadena firme',combo:15+round*8,hits:20+round*10},{title:'Maestría combinada',hits:30+round*15,perfect:12+round*8,combo:12+round*6}];
 return{...specs[kind],index,xp:12+Math.min(168,(index-1)*4),gold:15+Math.min(185,(index-1)*5)};
}
export function advanceMission(progress,mode,event){
 progress.hits++;progress.perfect+=event.perfect?1:0;progress.combo=Math.max(progress.combo,event.combo);progress.special+=event.special??0;
 if(event.technique)progress.kinds|={low:1,mid:2,high:4}[event.technique]??0;
 const spec=missionSpec(mode,progress.index),done=['hits','perfect','combo','special'].every(key=>!spec[key]||progress[key]>=spec[key])&&(!spec.kinds||progress.kinds===7);
 if(!done)return null;
 Object.assign(progress,newMissionProgress(),{index:progress.index+1});return spec;
}
export function missionText(mode,p){const spec=missionSpec(mode,p.index),parts=[];for(const [key,label] of [['hits','aciertos'],['perfect','perfectos'],['combo','combo'],['special','especiales']])if(spec[key])parts.push(`${label} ${Math.min(p[key],spec[key])}/${spec[key]}`);if(spec.kinds)parts.push(`evasiones ${[1,2,4].filter(bit=>p.kinds&bit).length}/3`);return`Misión ${p.index} · ${spec.title} · ${parts.join(' · ')}`;}
