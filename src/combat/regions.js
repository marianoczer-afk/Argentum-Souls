const raw=[
 ['Patio de entrenamiento','#ba946b','#625c43','Madera',['Aprendiz','Centinela','Espadachín','Maestro del patio'],'El instructor de bronce'],
 ['Bosque salvaje','#568269','#253c35','Raíz',['Lobo espino','Explorador silvano','Guardián de corteza','Acechador'],'La reina de las raíces'],
 ['Cavernas','#68687e','#272437','Cristal',['Murciélago pétreo','Minero perdido','Gólem de cuarzo','Vigía ciego'],'El corazón de cristal'],
 ['Pantanos','#718752','#263a31','Veneno',['Sapo de turba','Brujo del barro','Merodeador del lodo','Caballero musgo'],'La madre de la ciénaga'],
 ['Desierto','#d4ab68','#79533e','Sol',['Bandido solar','Escorpión ámbar','Guardia de arena','Derviche'],'El faraón del mediodía'],
 ['Montañas heladas','#9fbecb','#42536b','Hielo',['Lobo glaciar','Vigía polar','Coloso de hielo','Chamán de escarcha'],'La corona del invierno'],
 ['Ruinas antiguas','#a49a83','#47445b','Runa',['Autómata roto','Custodio rúnico','Sabio caído','Lancero antiguo'],'El oráculo sin tiempo'],
 ['Fortaleza oscura','#786574','#292b40','Acero',['Guardia carmesí','Caballero negro','Verdugo','Inquisidor'],'El general del eclipse'],
 ['Abismo','#6b528c','#161b33','Vacío',['Eco sin rostro','Devorador','Espectro violeta','Heraldo'],'El ojo del abismo'],
 ['Coliseo legendario','#d5b779','#544068','Gloria',['Campeón del alba','Duelista eterno','Titán dorado','Arcángel de hierro'],'El soberano de las cien almas'],
];
export const REGIONS=raw.map(([name,sky,floor,motif,names,boss],index)=>Object.freeze({id:index+1,name,sky,floor,motif,names,boss}));
const types=['swift','armored','brute','mystic','duelist'],titles=['Umbral','Sendero','Duelo','Acecho','Bastión','Prueba','Asedio','Vigilia','Cumbre','Trono'];
export const ARENAS=Array.from({length:100},(_,index)=>{const id=index+1,region=REGIONS[Math.floor(index/10)],regionalBoss=id%10===0;return Object.freeze({id,region:region.id,title:`${titles[index%10]} de ${region.motif.toLowerCase()}`,regionalBoss,enemies:Array.from({length:4},(_,wave)=>({name:wave===3?(regionalBoss?region.boss:`Capitán ${region.names[index%4].toLowerCase()}`):region.names[(index+wave)%4],archetype:types[(index+wave+region.id)%types.length],boss:wave===3,appearance:(region.id+wave)%5}))});});
