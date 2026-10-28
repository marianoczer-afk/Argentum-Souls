// Session-only opt-in. No experimental coefficient is persisted in a player's save.
export const RHYTHMS=Object.freeze(['control','overlap']);
export const XP_CANDIDATES=Object.freeze({X0:{kind:'control'},X1a2:{kind:'linear',slope:2},X1a4:{kind:'linear',slope:4},X1a6:{kind:'linear',slope:6},X2c25:{kind:'capped',cap:25},X2c50:{kind:'capped',cap:50},X2c75:{kind:'capped',cap:75}});
export function experimentFromSearch(search=''){const p=new URLSearchParams(search);return{rhythm:p.get('rhythm')==='overlap'?'overlap':'control',xpVariant:Object.hasOwn(XP_CANDIDATES,p.get('xp'))?p.get('xp'):'X0'};}
export function rhythmParameters(base,mode,variant){if(variant!=='overlap')return base;if(mode==='dodge')return{...base,interval:base.interval-.08,minInterval:.14};if(mode==='crit')return{...base,waitMin:.14,waitMax:base.waitMax-.08};return base;}
