export function mountStage({frame,canvas,host,height=720,onResize=()=>{}}){
 const button=frame.querySelector('.fullscreen-button');let fitting=false;
 const expanded=()=>document.fullscreenElement===frame||frame.classList.contains('visual-fullscreen');
 function fit(){if(fitting||!canvas.clientWidth||!host.clientHeight)return;fitting=true;
  const full=expanded(),limit=full?frame.clientHeight:host.clientHeight;
  const chrome=[...frame.children].filter(el=>el!==canvas.parentElement&&getComputedStyle(el).position!=='absolute').reduce((n,el)=>n+el.offsetHeight,4);
  const h=Math.max(90,Math.min(limit-chrome-4,canvas.clientWidth*height/1200)),w=Math.max(1200,Math.round(canvas.clientWidth/h*height));
  canvas.parentElement.style.height=`${h}px`;canvas.style.height=`${h}px`;if(canvas.width!==w)canvas.width=w;if(canvas.height!==height)canvas.height=height;
  canvas.dataset.worldOffset=String((w-1200)/2);canvas.dataset.worldHeight=String(height);onResize({offset:(w-1200)/2,width:w,height});fitting=false;
 }
 const observer=new ResizeObserver(fit);observer.observe(host);observer.observe(frame);window.addEventListener('resize',fit);
 async function toggle(){
  if(expanded()){if(document.fullscreenElement===frame)await document.exitFullscreen().catch(()=>{});frame.classList.remove('visual-fullscreen');screen.orientation?.unlock?.();}
  else {try{if(!frame.requestFullscreen)throw Error('fullscreen unavailable');await frame.requestFullscreen();}catch{frame.classList.add('visual-fullscreen');}try{await screen.orientation?.lock?.('landscape');}catch{}}
  button.textContent=expanded()?'⛶ Salir':'⛶';button.setAttribute('aria-label',expanded()?'Salir de pantalla completa':'Pantalla completa');button.blur();fit();
 }
 button.onclick=toggle;const changed=()=>{button.textContent=expanded()?'⛶ Salir':'⛶';button.setAttribute('aria-label',expanded()?'Salir de pantalla completa':'Pantalla completa');if(!document.fullscreenElement&&!document.querySelector('.visual-fullscreen'))screen.orientation?.unlock?.();fit();};document.addEventListener('fullscreenchange',changed);
 const key=e=>{if(e.key==='Escape'&&frame.classList.contains('visual-fullscreen')){frame.classList.remove('visual-fullscreen');changed();}};document.addEventListener('keydown',key);
 fit();return{fit,destroy(){observer.disconnect();window.removeEventListener('resize',fit);document.removeEventListener('fullscreenchange',changed);document.removeEventListener('keydown',key);}};
}
export function canvasPoint(canvas,event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*canvas.width/r.width-(canvas.width-1200)/2,y:(event.clientY-r.top)*canvas.height/r.height};}
