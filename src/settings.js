export function mountSettings({root,onOpen,getSaveStatus}){
  const $=id=>root.querySelector(`#${id}`),dialog=$('settingsDialog');
  $('settingsButton').onclick=()=>{onOpen();$('settingsSave').textContent=getSaveStatus().message;dialog.showModal();};
  $('closeSettings').onclick=()=>dialog.close();
  const render=info=>{$('versionBadge').textContent=`v${info.version}`;$('buildVersion').textContent=`Entrega A · v${info.version}`;$('buildCommit').textContent=`Commit ${info.commit}${info.dirty?' + cambios locales':''} · build ${info.build}`;};
  let info={version:'0.3.0-desarrollo',commit:'sin identificar',build:'local',dirty:true};
  async function load(){
    try{
      let content=document.querySelector('meta[name="souls-build"]')?.content;
      if(!content){const response=await fetch(new URL('../index.html',import.meta.url));if(!response.ok)throw Error('metadata unavailable');content=new DOMParser().parseFromString(await response.text(),'text/html').querySelector('meta[name="souls-build"]')?.content;}
      if(content)info=JSON.parse(content);
    }catch{/* Local development remains playable without build metadata. */}
    render(info);
  }
  render(info);void load();return{close:()=>dialog.close()};
}
