const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const path=require('node:path');
module.exports=async(browser,url,check)=>{
 await check('release cache: stale app and CSS reproduce broken startup; versioned full graph recovers without clearing saves',async()=>{
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  try{
   const fixture=async name=>readFile(path.join(__dirname,'fixtures/pre-delivery-a',name+'.txt'),'utf8');
   const stale={app:await fixture('app'),styles:await fixture('styles'),controller:await fixture('controller')};
   const requests=[],errors=[];let legacy=true;
   await context.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/Argentum-Souls/'){
     const r=await route.fetch();let html=await r.text();
     if(legacy)html=html.replace(/<script type="importmap">.*?<\/script>/,'').replace(/styles.css\?v=[a-f0-9]+/,'styles.css').replace(/app.js\?v=[a-f0-9]+/,'app.js');
     return route.fulfill({response:r,body:html});
    }
    if(u.pathname.endsWith('.js')||u.pathname.endsWith('.css'))requests.push(u);
    if(!u.search&&u.pathname.endsWith('/src/app.js'))return route.fulfill({contentType:'text/javascript',body:stale.app});
    if(!u.search&&u.pathname.endsWith('/training/controller.js'))return route.fulfill({contentType:'text/javascript',body:stale.controller});
    if(!u.search&&u.pathname.endsWith('/src/styles.css'))return route.fulfill({contentType:'text/css',body:stale.styles});
    return route.continue();
   });
   await context.addInitScript(()=>{if(!localStorage.getItem('argentum_souls_fiel_v2'))localStorage.setItem('argentum_souls_fiel_v2',JSON.stringify({coins:18,xp:{str:3}}));});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+'/Argentum-Souls/');await page.waitForTimeout(500);
   assert.ok(errors.length,'control must reproduce stale startup failure');
   assert.equal(await page.locator('[id="pause"]').count(),2,'stale controller reproduces duplicated pause buttons');
   assert.equal(await page.locator('#settingsSound button').count(),0,'old app places sound outside settings');
   const before=await page.evaluate(()=>localStorage.getItem('argentum_souls_fiel_v2'));
   legacy=false;errors.length=0;requests.length=0;
   await page.reload();await page.waitForFunction(()=>!!window.ArgentumSoulsBridge);
   assert.equal(await page.locator('[data-mode]').count(),5);
   assert.equal(await page.locator('#settingsSound button').count(),1);
   assert.equal(await page.locator('#pause').count(),1);
   await page.waitForTimeout(200);
   assert.ok(await page.evaluate(()=>{const c=document.querySelector('#cv');return c.getContext('2d').getImageData(600,390,1,1).data[3]>0;}),'scene is actually drawn');
   assert.equal(await page.locator('.app-header').evaluate(e=>getComputedStyle(e).display),'flex');
   assert.ok(requests.length>8,'entry and transitive modules fetched');
   assert.ok(requests.every(u=>/^\?v=[a-f0-9]{12}$/.test(u.search)),'all JS and CSS use the same release identity');
   assert.equal(new Set(requests.map(u=>u.search)).size,1);
   assert.deepEqual(errors,[]);
   assert.equal(await page.evaluate(()=>window.ArgentumSoulsBridge.exportProgress().xp.str),3);
   assert.equal(await page.evaluate(()=>localStorage.getItem('argentum_souls_fiel_v2')),before,'reload does not delete saved progress');
  }finally{await context.close();}
 });
};
