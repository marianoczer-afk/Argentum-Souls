export function rng(n){return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32;};}
export function normal(random){return Math.sqrt(-2*Math.log(Math.max(1e-12,random())))*Math.cos(2*Math.PI*random());}
