// ============================================================
// LA ESPADA CELESTIAL — datos del mundo
// ============================================================

export const AFFINITIES = {
  fuego:     { name: 'Fuego',     color: '#ff8a5c', glow: '#ff5b35', icon: 'fire' },
  agua:      { name: 'Agua',      color: '#66c8ff', glow: '#2e9cff', icon: 'water' },
  tierra:    { name: 'Tierra',    color: '#c9a06c', glow: '#9c6b35', icon: 'earth' },
  viento:    { name: 'Viento',    color: '#9ef0d8', glow: '#5de5bf', icon: 'wind' },
  rayo:      { name: 'Rayo',      color: '#ffe169', glow: '#ffd11a', icon: 'lightning' },
  hielo:     { name: 'Hielo',     color: '#b9e8ff', glow: '#69ccff', icon: 'ice' },
  luz:       { name: 'Luz',       color: '#fff2c2', glow: '#ffdc7a', icon: 'light' },
  oscuridad: { name: 'Oscuridad', color: '#b899ff', glow: '#7d55e8', icon: 'dark' },
  naturaleza:{ name: 'Naturaleza',color: '#8fe3a0', glow: '#53c878', icon: 'nature' },
  celestial: { name: 'Celestial', color: '#f4d998', glow: '#e8b85a', icon: 'celestial' },
};

export const SOLID_TILES = new Set(['wall','tree','ruin','crystal','void','water','lava']);
export const TILE_INFO = {
  grass:   { walk: true,  base: '#315e48', alt: '#3b6a50', accent: '#5f8f68' },
  path:    { walk: true,  base: '#8a7852', alt: '#9b8860', accent: '#b8a47a' },
  flower:  { walk: true,  base: '#356349', alt: '#3f6d50', accent: '#d8b7e8' },
  stone:   { walk: true,  base: '#4d5668', alt: '#596277', accent: '#7e8aa0' },
  wood:    { walk: true,  base: '#6a4a31', alt: '#795539', accent: '#9b704b' },
  water:   { walk: false, base: '#1d4e74', alt: '#246089', accent: '#77c4e8' },
  lava:    { walk: false, base: '#761f16', alt: '#a5351b', accent: '#ffb24a' },
  wall:    { walk: false, base: '#2b3140', alt: '#353d50', accent: '#5c6882' },
  tree:    { walk: false, base: '#214b3b', alt: '#285741', accent: '#3f7a54' },
  ruin:    { walk: false, base: '#565b68', alt: '#636a7b', accent: '#8c95a8' },
  crystal: { walk: false, base: '#3a3f70', alt: '#4c5592', accent: '#a6b4ff' },
  void:    { walk: false, base: '#070b15', alt: '#0b1120', accent: '#16203a' },
  bridge:  { walk: true,  base: '#745535', alt: '#82613d', accent: '#a47d4d' },
  ash:     { walk: true,  base: '#4a4448', alt: '#565056', accent: '#777077' },
  snow:    { walk: true,  base: '#9aa9bb', alt: '#adbac9', accent: '#dce7f2' },
  sand:    { walk: true,  base: '#a08a60', alt: '#af9a6d', accent: '#cdbb8b' },
};

// ---------- utilidades de mapas ----------
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function grid(w,h,base='grass'){return Array.from({length:h},()=>Array(w).fill(base))}
function rect(g,x,y,w,h,type){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(g[j]&&g[j][i]!==undefined)g[j][i]=type}
function border(g,type,thick=1){const h=g.length,w=g[0].length;for(let t=0;t<thick;t++){for(let x=0;x<w;x++){g[t][x]=type;g[h-1-t][x]=type}for(let y=0;y<h;y++){g[y][t]=type;g[y][w-1-t]=type}}}
function line(g,x1,y1,x2,y2,type,width=1){
  const dx=x2-x1,dy=y2-y1,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
  for(let k=0;k<=n;k++){const x=Math.round(x1+dx*k/n),y=Math.round(y1+dy*k/n);const r=Math.floor(width/2);for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(g[y+j]&&g[y+j][x+i]!==undefined)g[y+j][x+i]=type}}
}
function disc(g,cx,cy,r,type){
  for(let y=Math.floor(cy-r);y<=Math.ceil(cy+r);y++)for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){
    if(x<0||y<0||!g[y]||g[y][x]===undefined)continue;
    if((x-cx)**2+(y-cy)**2<=r*r)g[y][x]=type;
  }
}
function scatter(g,type,count,seed,avoid=[]){
  const r=rng(seed);let tries=0;
  while(count>0&&tries++<count*30){
    const x=1+Math.floor(r()*(g[0].length-2)),y=1+Math.floor(r()*(g.length-2));
    if(g[y][x]!=='grass'&&g[y][x]!=='flower')continue;
    if(avoid.some(([ax,ay,ar])=>(x-ax)**2+(y-ay)**2<ar*ar))continue;
    g[y][x]=type;count--;
  }
}
function wallRect(g,x,y,w,h){rect(g,x,y,w,1,'ruin');rect(g,x,y,1,h,'ruin');rect(g,x+w-1,y,1,h,'ruin');rect(g,x,y+h-1,w,1,'ruin')}
function box(g,x,y,w,h,fill='stone'){rect(g,x,y,w,h,fill)}

// ---------- ALDEA ALBA ----------
function buildAldea(){
  const w=32,h=22,g=grid(w,h,'grass');
  border(g,'tree',1);
  rect(g,1,1,w-2,h-2,'grass');
  scatter(g,'flower',42,11,[[15,11,6],[8,10,3],[24,8,3]]);
  // plaza y caminos
  disc(g,15,11,4.6,'path');
  line(g,3,11,29,11,'path',3);
  line(g,15,2,15,20,'path',2);
  line(g,15,11,25,10,'path',2);
  // estanque
  rect(g,2,16,5,3,'water');
  rect(g,2,15,5,1,'sand');rect(g,2,19,5,1,'sand');
  // claros de edificios (los edificios son objetos)
  rect(g,4,3,5,4,'path');
  rect(g,22,3,5,4,'path');
  rect(g,22,15,5,4,'path');
  // árboles
  scatter(g,'tree',38,23,[[15,11,6],[5,4,4],[24,5,4],[24,17,4],[8,10,2],[24,8,2]]);
  scatter(g,'flower',25,41,[[15,11,5]]);
  return {
    id:'aldea',name:'Aldea Alba',subtitle:'Donde nace el último juramento',region:'Valle de Lumen',
    width:w,height:h,tiles:g,seed:5,music:'village',ambient:'day',
    spawn:{x:15.5,y:13.2},clock:'Crepúsculo',
    palette:{sky:'#7ca7c9',tint:'rgba(255,196,120,.06)',fog:'rgba(20,32,48,.12)',weather:'pollen'},
    buildings:[
      {x:4,y:3,w:5,h:4,type:'cottage',name:'Casa de Mirra',roof:'#7a3f3b'},
      {x:22,y:3,w:5,h:4,type:'shop',name:'Bazar de Elio',roof:'#3b567a'},
      {x:22,y:15,w:5,h:4,type:'smith',name:'Fragua de Bruma',roof:'#58413a'},
      {x:4,y:15,w:4,h:3,type:'cottage',name:'Posada del Alba',roof:'#4c6348'},
    ],
    portals:[
      {id:'toForest',x:30.2,y:10.6,w:1.4,h:2.6,to:'bosque',spawn:{x:3,y:17.2},label:'Bosque de Lumen',dir:'east'},
    ],
    shrines:[{id:'aldeaShrine',x:9.5,y:18.5,active:true}],
    chests:[{id:'aldeaChest',x:3.6,y:19.2,item:'pocion',amount:2,opened:false}],
    signs:[{id:'signAldea',x:28.4,y:8.7,text:'Bosque de Lumen →\n«Que la luz guíe tus pasos.»'}],
    npcs:[
      {id:'mirra',name:'Anciana Mirra',role:'elder',x:8.6,y:9.6,color:'#c9b6e8',hair:'#d8d2e8',outfit:'robe',outfitColor:'#4d3f72'},
      {id:'elio',name:'Elio el Mercader',role:'merchant',x:24.2,y:7.7,color:'#ffd28a',hair:'#6b4a2e',outfit:'vest',outfitColor:'#7a4b36'},
      {id:'bruma',name:'Bruma la Herrera',role:'smith',x:23.4,y:14.1,color:'#ffb07a',hair:'#9a4d2a',outfit:'apron',outfitColor:'#4f3c33'},
      {id:'lia',name:'Lía',role:'child',x:18.4,y:14.6,color:'#9fe0ff',hair:'#e8c477',outfit:'dress',outfitColor:'#4e75a8'},
      {id:'garet',name:'Garet el Cazador',role:'hunter',x:11.2,y:6.3,color:'#a8e6b2',hair:'#39402f',outfit:'hunter',outfitColor:'#3f5b3e'},
      {id:'nara',name:'Nara la Sanadora',role:'healer',x:19.4,y:8.8,color:'#ffe6a8',hair:'#b8a5d8',outfit:'robe',outfitColor:'#6b5c8c'},
    ],
    spawns:[
      {type:'jelly',x:4.4,y:12.4,wander:2},{type:'jelly',x:26.5,y:12.2,wander:4},
    ],
    wilds:[],
    boss:null,
    lights:[{x:15,y:11,r:3.4,color:'rgba(255,200,110,.18)'},{x:9.5,y:18.5,r:2.4,color:'rgba(130,210,255,.2)'}],
  };
}

// ---------- BOSQUE DE LUMEN ----------
function buildBosque(){
  const w=46,h=34,g=grid(w,h,'grass');
  border(g,'tree',2);
  scatter(g,'tree',105,77,[[1,17,5],[45,17,5],[35,6,8],[9,28,4],[23,17,4]]);
  scatter(g,'flower',120,31,[[23,17,3],[35,6,6]]);
  // arroyo
  line(g,19,1,19,33,'water',2);
  line(g,21,26,28,32,'water',2);
  // caminos
  line(g,2,17,16,17,'path',2);
  line(g,16,17,28,17,'path',2);
  line(g,28,17,44,17,'path',2);
  line(g,22,17,27,11,'path',2);
  line(g,27,11,34,7,'path',2);
  line(g,16,17,12,26,'path',2);
  line(g,12,26,9,28,'path',2);
  // puentes
  rect(g,18,16,4,3,'bridge');
  // claro del jefe
  disc(g,35,6,5.2,'grass');disc(g,35,6,4.2,'flower');disc(g,35,6,1.2,'path');
  // claro santuario
  disc(g,9,28,3.4,'grass');disc(g,9,28,2.2,'flower');
  // obstáculos y secretos
  rect(g,29,20,3,1,'tree');
  rect(g,33,20,1,3,'tree');
  disc(g,28,25,1.2,'water');
  return {
    id:'bosque',name:'Bosque de Lumen',subtitle:'Susurros entre hojas antiguas',region:'Valle de Lumen',
    width:w,height:h,tiles:g,seed:17,music:'forest',ambient:'forest',
    spawn:{x:3,y:17.2},clock:'Atardecer',
    palette:{sky:'#5d9077',tint:'rgba(50,110,85,.12)',fog:'rgba(18,40,32,.16)',weather:'fireflies'},
    buildings:[],
    portals:[
      {id:'toVillage',x:0.2,y:16.5,w:1.2,h:2.6,to:'aldea',spawn:{x:28.4,y:10.7},label:'Aldea Alba',dir:'west'},
      {id:'toRuins',x:45,y:16.5,w:1.2,h:2.6,to:'ruinas',spawn:{x:2.4,y:15.1},label:'Ruinas de Elyra',dir:'east'},
    ],
    shrines:[{id:'bosqueShrine',x:9.5,y:28.5,active:true}],
    chests:[
      {id:'bosqueChest1',x:14.6,y:9.4,item:'eter',amount:2,opened:false},
      {id:'bosqueChest2',x:29.6,y:24.8,item:'sello',amount:3,opened:false},
      {id:'bosqueChest3',x:41.4,y:27.6,item:'arco_lunar',amount:1,opened:false},
    ],
    obstacles:[
      {id:'bramble1',type:'bramble',x:32.3,y:26.2,required:'fuego',label:'Zarzas de ceniza',cleared:false},
      {id:'boulder1',type:'boulder',x:23.6,y:9.2,required:'tierra',label:'Roca antigua',cleared:false},
    ],
    signs:[{id:'signBosque',x:5.4,y:15.2,text:'Claro de la Reina ↑\nRuinas de Elyra →'}],
    npcs:[
      {id:'sylva',name:'Sylva, guardiana del bosque',role:'dryad',x:14.6,y:24.8,color:'#9fe3ae',hair:'#3c7a50',outfit:'robe',outfitColor:'#385b42'},
    ],
    spawns:[
      {type:'jelly',x:8.4,y:13.4,wander:3},{type:'jelly',x:33.6,y:14.8,wander:4},
      {type:'wolf',x:15.2,y:7.4,wander:5},{type:'wolf',x:39.2,y:22.6,wander:4},
      {type:'jelly',x:24.2,y:22.2,wander:3},
    ],
    wilds:[
      {species:'brotito',x:12.5,y:20.4},{species:'brasita',x:38.4,y:25.4},
    ],
    boss:{type:'queen',x:35,y:6,awake:false,shard:1},
    lights:[{x:9.5,y:28.5,r:3,color:'rgba(130,220,255,.2)'},{x:35,y:6,r:4,color:'rgba(180,255,180,.12)'},{x:19,y:17,r:2.4,color:'rgba(120,200,255,.12)'}],
  };
}

// ---------- RUINAS DE ELYRA ----------
function buildRuinas(){
  const w=40,h=32,g=grid(w,h,'stone');
  border(g,'ruin',2);
  // exterior agrietado
  disc(g,20,16,12,'stone');
  // pasillos y salas
  rect(g,2,2,7,7,'grass');rect(g,2,2,7,7,'stone');
  // salas laterales
  wallRect(g,3,3,9,8);rect(g,4,4,7,6,'stone');
  wallRect(g,28,3,9,8);rect(g,29,4,7,6,'stone');
  wallRect(g,3,21,9,8);rect(g,4,22,7,6,'stone');
  // arena central
  wallRect(g,14,10,14,13);rect(g,15,11,12,11,'stone');
  // puertas
  rect(g,20,10,2,1,'stone');rect(g,20,22,2,1,'stone');
  rect(g,14,15,1,2,'stone');rect(g,27,15,1,2,'stone');
  // conectar salas con arena
  line(g,11,8,15,13,'stone',1);line(g,29,8,25,13,'stone',1);line(g,8,22,15,19,'stone',1);
  line(g,2,15,14,15,'stone',2);line(g,31,15,38,15,'stone',2);
  // decoración
  scatter(g,'crystal',20,55,[[20,16,7],[6,7,2],[32,7,2],[7,25,2]]);
  scatter(g,'flower',12,8,[[20,16,7]]);
  // jardín exterior
  disc(g,7,7,2.4,'grass');disc(g,32,7,2.4,'grass');disc(g,7,25,2.4,'grass');
  return {
    id:'ruinas',name:'Ruinas de Elyra',subtitle:'La ciudad que olvidó su nombre',region:'Meseta de Elyra',
    width:w,height:h,tiles:g,seed:31,music:'ruins',ambient:'crypt',
    spawn:{x:2.6,y:15.2},clock:'Noche',
    palette:{sky:'#252b4a',tint:'rgba(40,44,90,.28)',fog:'rgba(10,12,28,.38)',weather:'motes'},
    buildings:[],
    portals:[
      {id:'toForest2',x:0.2,y:14.5,w:1.2,h:2.6,to:'bosque',spawn:{x:43.4,y:17},label:'Bosque de Lumen',dir:'west'},
      {id:'toLake',x:18.5,y:0.2,w:3,h:1.2,to:'lago',spawn:{x:19,y:27.2},label:'Lago Espejo',dir:'north'},
    ],
    shrines:[{id:'ruinasShrine',x:5.2,y:5.2,active:true}],
    chests:[
      {id:'ruinasChest1',x:31.6,y:5.6,item:'mandoble_astral',amount:1,opened:false},
      {id:'ruinasChest2',x:6.4,y:24.4,item:'cristal',amount:4,opened:false},
      {id:'ruinasChest3',x:36.4,y:26.6,item:'pocion',amount:3,opened:false},
    ],
    obstacles:[
      {id:'ice1',type:'iceblock',x:36.5,y:15.5,required:'fuego',label:'Bloque de escarcha',cleared:false},
      {id:'gateArena',type:'gate',x:20,y:22,required:'runas',label:'Sello de tres runas',cleared:false},
      {id:'boulder2',type:'boulder',x:12.6,y:26.8,required:'tierra',label:'Coloso derruido',cleared:false},
    ],
    runes:[
      {id:'runeA',x:6.5,y:6.5,lit:false,name:'Runa del Alba'},
      {id:'runeB',x:32.5,y:6.5,lit:false,name:'Runa del Eco'},
      {id:'runeC',x:6.5,y:25.5,lit:false,name:'Runa del Abismo'},
    ],
    braziers:[],
    signs:[{id:'signRuinas',x:3.4,y:13.2,text:'Arena de Elyra ↑\n«Tres luces despiertan la puerta.»'}],
    npcs:[],
    spawns:[
      {type:'specter',x:8.6,y:10.4,wander:2},{type:'specter',x:30.4,y:20.6,wander:3},
      {type:'beetle',x:23.5,y:26.6,wander:3},{type:'beetle',x:23.5,y:5.6,wander:3},
      {type:'wolf',x:12.4,y:15.6,wander:3},
    ],
    wilds:[
      {species:'umbrio',x:33.4,y:24.6},{species:'chispin',x:34.4,y:7.4},
    ],
    boss:{type:'guardian',x:20,y:16,awake:false,shard:2,requires:'runas'},
    lights:[{x:5.2,y:5.2,r:3,color:'rgba(130,210,255,.24)'},{x:20,y:16,r:4.2,color:'rgba(180,140,255,.13)'},{x:32,y:7,r:2.2,color:'rgba(255,190,80,.15)'}],
  };
}

// ---------- LAGO ESPEJO ----------
function buildLago(){
  const w=40,h=32,g=grid(w,h,'water');
  border(g,'wall',1);
  // islas
  disc(g,20,27,5.2,'grass');disc(g,20,27,3.8,'sand');
  disc(g,8,21,3,'grass');disc(g,30,20,3.3,'grass');
  disc(g,13,12,3,'grass');disc(g,27,11,3,'grass');
  disc(g,20,5,6.4,'grass');disc(g,20,5,4.6,'flower');
  // puentes
  line(g,15,17,13,13,'bridge',1);line(g,20,22,20,17,'bridge',1);
  line(g,20,17,13,12,'bridge',1);line(g,20,17,27,11,'bridge',1);
  line(g,13,12,18,6,'bridge',1);line(g,27,11,22,6,'bridge',1);
  line(g,8,21,14,19,'bridge',1);line(g,30,20,27,17,'bridge',1);
  line(g,19,28,20,31,'sand',2);
  // detalles
  scatter(g,'flower',30,19,[[20,27,4],[20,5,5]]);
  scatter(g,'tree',18,29,[[20,27,4],[20,5,4],[8,21,2],[30,20,2]]);
  return {
    id:'lago',name:'Lago Espejo',subtitle:'El cielo dormido bajo el agua',region:'Cuenca de Mirra',
    width:w,height:h,tiles:g,seed:47,music:'lake',ambient:'lake',
    spawn:{x:20,y:28.2},clock:'Luna llena',
    palette:{sky:'#4c7d9e',tint:'rgba(55,120,155,.16)',fog:'rgba(20,50,70,.22)',weather:'rain'},
    buildings:[],
    portals:[
      {id:'toRuins2',x:18.6,y:31,w:3,h:1.2,to:'ruinas',spawn:{x:20,y:2.2},label:'Ruinas de Elyra',dir:'south'},
      {id:'toPeak',x:18.4,y:0.2,w:3.2,h:1.2,to:'cumbre',spawn:{x:18,y:31.2},label:'Cima Celestial',dir:'north',requiresShards:3,lockedText:'La cima duerme. Necesitas los tres fragmentos celestiales.'},
    ],
    shrines:[{id:'lagoShrine',x:8.2,y:22.4,active:true}],
    chests:[
      {id:'lagoChest1',x:30.4,y:21.8,item:'esencia_agua',amount:3,opened:false},
      {id:'lagoChest2',x:26.4,y:9.4,item:'baya',amount:5,opened:false},
      {id:'lagoChest3',x:20.4,y:3.2,item:'armadura_astral',amount:1,opened:false},
    ],
    obstacles:[
      {id:'ice2',type:'iceblock',x:17.6,y:19.6,required:'fuego',label:'Puente congelado',cleared:false},
      {id:'bramble2',type:'bramble',x:10.4,y:19.4,required:'fuego',label:'Lianas del lago',cleared:false},
    ],
    braziers:[
      {id:'brazierA',x:8.2,y:20.2,lit:false,name:'Brasero del Sur'},
      {id:'brazierB',x:20.2,y:16.2,lit:false,name:'Brasero del Centro'},
      {id:'brazierC',x:27.2,y:10.2,lit:false,name:'Brasero del Norte'},
    ],
    signs:[{id:'signLago',x:17.4,y:26.2,text:'Tres braseros, una marea.\nEnciéndelos con fuego.'}],
    npcs:[],
    spawns:[
      {type:'jelly',x:13.4,y:13.4,wander:2},{type:'specter',x:27.6,y:13.4,wander:2},
      {type:'wolf',x:8.4,y:22.2,wander:2},
    ],
    wilds:[
      {species:'aquin',x:29.6,y:18.4},{species:'escarcha',x:12.4,y:9.4},
    ],
    boss:{type:'tide',x:20,y:5,awake:false,shard:3,requires:'braziers'},
    lights:[{x:8.2,y:20.2,r:2.2,color:'rgba(255,150,90,.25)'},{x:20.2,y:16.2,r:2.2,color:'rgba(255,150,90,.25)'},{x:27.2,y:10.2,r:2.2,color:'rgba(255,150,90,.25)'},{x:20,y:5,r:4.2,color:'rgba(130,210,255,.16)'}],
  };
}

// ---------- CIMA CELESTIAL ----------
function buildCumbre(){
  const w=38,h=36,g=grid(w,h,'void');
  // plataformas flotantes
  disc(g,19,33,5,'ash');disc(g,19,33,3.6,'stone');
  disc(g,10,26,3.4,'stone');disc(g,28,26,3.4,'stone');
  disc(g,19,23,4.2,'ash');disc(g,19,23,3,'stone');
  disc(g,12,17,3.2,'stone');disc(g,27,16,3.2,'stone');
  disc(g,19,13,4.2,'ash');disc(g,19,13,3.2,'stone');
  disc(g,19,6,7,'ash');disc(g,19,6,5.4,'stone');
  // caminos
  line(g,19,31,19,27,'stone',2);line(g,19,27,10,26,'stone',2);line(g,19,27,28,26,'stone',2);
  line(g,10,26,12,18,'stone',2);line(g,28,26,27,17,'stone',2);
  line(g,12,18,19,14,'stone',2);line(g,27,17,19,14,'stone',2);
  line(g,19,13,19,9,'stone',3);
  // lava
  line(g,4,20,10,12,'lava',2);line(g,34,22,28,13,'lava',2);line(g,6,8,13,10,'lava',2);
  // cristales
  scatter(g,'crystal',34,73,[[19,33,3],[19,6,5],[19,23,3]]);
  scatter(g,'flower',18,91,[[19,33,3],[19,6,5]]);
  return {
    id:'cumbre',name:'Cima Celestial',subtitle:'El lugar donde el cielo se rompió',region:'Sobre las nubes',
    width:w,height:h,tiles:g,seed:61,music:'peak',ambient:'peak',
    spawn:{x:19,y:31.4},clock:'Eclipse',
    palette:{sky:'#5b3d6e',tint:'rgba(90,50,100,.22)',fog:'rgba(24,16,42,.32)',weather:'ash'},
    buildings:[],
    portals:[{id:'toLake2',x:17.6,y:35,w:3,h:1,to:'lago',spawn:{x:19,y:2.4},label:'Lago Espejo',dir:'south'}],
    shrines:[{id:'cumbreShrine',x:8.4,y:27.4,active:true}],
    chests:[
      {id:'cumbreChest1',x:28.6,y:27.4,item:'elixir',amount:2,opened:false},
      {id:'cumbreChest2',x:10.4,y:25.4,item:'sello',amount:5,opened:false},
      {id:'cumbreChest3',x:33.6,y:24.6,item:'cristal',amount:6,opened:false},
    ],
    obstacles:[],
    altar:{id:'altar',x:19,y:7.2,forged:false},
    signs:[{id:'signCumbre',x:16.4,y:29.2,text:'Altar del Firmamento ↑\nSolo la luz forja lo que la noche rompió.'}],
    npcs:[],
    spawns:[
      {type:'wolf',x:10.4,y:27.4,wander:2},{type:'beetle',x:28.6,y:27.4,wander:2},
      {type:'specter',x:12.4,y:17.4,wander:2},{type:'beetle',x:27.4,y:16.4,wander:2},
    ],
    wilds:[
      {species:'terrabi',x:11.4,y:25.4},{species:'zefiro',x:28.4,y:25.4},
      {species:'lumiel',x:12.4,y:18.4},{species:'astral',x:31.4,y:14.4},
    ],
    boss:{type:'eclipse',x:19,y:5,awake:false,shard:0,final:true,requires:'altar'},
    lights:[{x:19,y:7.2,r:5,color:'rgba(255,215,130,.23)'},{x:8.4,y:27.4,r:2.8,color:'rgba(120,200,255,.2)'}],
  };
}

export const ZONES = {
  aldea: buildAldea(),
  bosque: buildBosque(),
  ruinas: buildRuinas(),
  lago: buildLago(),
  cumbre: buildCumbre(),
};

// ---------- EQUIPO ----------
export const WEAPONS = {
  espada_alba:{id:'espada_alba',name:'Filo de Alba',type:'espada',kind:'weapon',glyph:'sword',icon:'sword',rarity:2,price:0,
    damage:12,range:60,arc:1.85,speed:2.55,stamina:7,combo:3,crit:.1,knock:110,color:'#cfe8ff',desc:'La espada de los juramentos. Equilibrada, veloz y leal.',element:'luz'},
  mandoble_astral:{id:'mandoble_astral',name:'Mandoble Astral',type:'mandoble',kind:'weapon',glyph:'sword',icon:'sword',rarity:4,price:620,
    damage:28,range:76,arc:2.35,speed:1.5,stamina:16,combo:2,crit:.06,knock:200,color:'#f4d998',desc:'Una hoja enorme que arrastra luz de constelaciones. Lenta, devastadora.',element:'luz'},
  daga_sombra:{id:'daga_sombra',name:'Daga de Umbra',type:'daga',kind:'weapon',glyph:'dagger',icon:'dagger',rarity:3,price:310,
    damage:9,range:44,arc:1.5,speed:4.1,stamina:4,combo:4,crit:.24,knock:60,color:'#c7a6ff',desc:'Rápida como un pensamiento. El crítico es su lenguaje.',element:'oscuridad'},
  lanza_cielo:{id:'lanza_cielo',name:'Lanza del Cielo',type:'lanza',kind:'weapon',glyph:'spear',icon:'spear',rarity:3,price:450,
    damage:17,range:96,arc:.8,speed:2.1,stamina:9,combo:3,crit:.09,knock:140,color:'#a9e6ff',desc:'Alcanza lo que otros no se atreven a tocar.',element:'viento'},
  arco_lunar:{id:'arco_lunar',name:'Arco Lunar',type:'arco',kind:'weapon',glyph:'bow',icon:'bow',rarity:3,price:480,
    damage:15,range:360,arc:.22,speed:2.0,stamina:8,combo:2,crit:.18,knock:80,color:'#d4c5ff',projectile:'arrow',desc:'Dispara flechas de plata desde la distancia.',element:'luna'},
  baculo_estelar:{id:'baculo_estelar',name:'Báculo Estelar',type:'baston',kind:'weapon',glyph:'wand',icon:'wand',rarity:4,price:560,
    damage:11,range:280,arc:.4,speed:1.9,stamina:10,combo:2,crit:.1,knock:60,color:'#9ee7ff',projectile:'star',magic:26,desc:'Canaliza el maná en proyectiles de luz pura.',element:'agua'},
};
export const ARMORS = {
  tunica_viajera:{id:'tunica_viajera',name:'Túnica de Viajera',kind:'armor',icon:'armor',rarity:1,price:0,defense:3,hp:0,mana:0,speed:.04,color:'#4e75a8',desc:'Ligera y cómoda. Huele a hierba y camino.'},
  cota_plata:{id:'cota_plata',name:'Cota de Plata',kind:'armor',icon:'armor',rarity:3,price:520,defense:11,hp:20,mana:0,speed:-.03,color:'#aebdd8',desc:'Malla lunar forjada para resistir el aliento de las sombras.'},
  armadura_astral:{id:'armadura_astral',name:'Armadura Astral',kind:'armor',icon:'armor',rarity:4,price:980,defense:18,hp:45,mana:20,speed:0,color:'#d9c9ff',desc:'Placas bañadas en polvo de estrella. La noche las reconoce.'},
  manto_hoja:{id:'manto_hoja',name:'Manto de Hoja',kind:'armor',icon:'armor',rarity:2,price:260,defense:6,hp:10,mana:10,speed:.09,color:'#6e9f72',desc:'Tejido por manos del bosque; el viento te presta velocidad.'},
  vestido_alba:{id:'vestido_alba',name:'Vestido del Alba',kind:'armor',icon:'armor',rarity:2,price:230,defense:4,hp:8,mana:18,speed:.03,color:'#e8d5b0',desc:'Un recuerdo del primer amanecer. Suave como la luz.'},
};
export const ACCESSORIES = {
  amuleto_lumen:{id:'amuleto_lumen',name:'Amuleto de Lumen',kind:'accessory',icon:'ring',rarity:2,price:180,stats:{intelligence:2,luck:2},desc:'Una piedra que pulsa al ritmo de tu corazón.'},
  anillo_zorro:{id:'anillo_zorro',name:'Anillo del Zorro',kind:'accessory',icon:'ring',rarity:3,price:340,stats:{speed:3,luck:4},desc:'Los caminos difíciles se vuelven fáciles para quien sabe correr.'},
  colgante_oso:{id:'colgante_oso',name:'Colgante del Oso',kind:'accessory',icon:'ring',rarity:3,price:360,stats:{strength:4,defense:2},desc:'El valor no pesa; sostiene.'},
  diadema_celeste:{id:'diadema_celeste',name:'Diadema Celeste',kind:'accessory',icon:'celestial',rarity:4,price:760,stats:{intelligence:5,luck:5,defense:3},desc:'El firmamento se inclina para escuchar a quien la porta.'},
};

// ---------- OBJETOS ----------
export const ITEMS = {
  pocion:{id:'pocion',name:'Poción de Luna',kind:'consumable',icon:'potion',rarity:1,price:28,effect:{hp:48},desc:'Restaura 48 de vida. Sabe a menta y a recuerdos.'},
  eter:{id:'eter',name:'Éter de Estrella',kind:'consumable',icon:'ether',rarity:2,price:42,effect:{mana:40},desc:'Restaura 40 de maná. Burbujea con luz fría.'},
  elixir:{id:'elixir',name:'Elixir Celestial',kind:'consumable',icon:'potion',rarity:4,price:180,effect:{hp:999,mana:999},desc:'Devuelve la vida y el maná por completo. Muy raro.'},
  hierba:{id:'hierba',name:'Hierba de Lumen',kind:'material',icon:'herb',rarity:1,price:12,desc:'Una hoja que brilla al tocarla. Ingrediente de pociones.'},
  cristal:{id:'cristal',name:'Cristal de Maná',kind:'material',icon:'crystal',rarity:2,price:25,desc:'Fragmento de una estrella caída. Late con energía.'},
  baya:{id:'baya',name:'Baya Estelar',kind:'food',icon:'herb',rarity:1,price:18,desc:'Alimento favorito de las criaturas. Sube su vínculo.'},
  sello:{id:'sello',name:'Sello Celestial',kind:'seal',icon:'seal',rarity:2,price:55,desc:'Atrapa criaturas debilitadas. Funciona mejor con poca vida y suerte alta.'},
  esencia_fuego:{id:'esencia_fuego',name:'Esencia de Fuego',kind:'material',icon:'fire',rarity:2,price:35,desc:'Calor concentrado. Sirve para encender y crear.'},
  esencia_agua:{id:'esencia_agua',name:'Esencia de Agua',kind:'material',icon:'water',rarity:2,price:35,desc:'Una gota que nunca se seca.'},
  esencia_tierra:{id:'esencia_tierra',name:'Esencia de Tierra',kind:'material',icon:'earth',rarity:2,price:35,desc:'Peso antiguo y fértil.'},
  esencia_viento:{id:'esencia_viento',name:'Esencia de Viento',kind:'material',icon:'wind',rarity:2,price:35,desc:'Un suspiro atrapado en ámbar.'},
  esencia_rayo:{id:'esencia_rayo',name:'Esencia de Rayo',kind:'material',icon:'lightning',rarity:3,price:45,desc:'Chispa indomable.'},
  esencia_hielo:{id:'esencia_hielo',name:'Esencia de Hielo',kind:'material',icon:'ice',rarity:3,price:45,desc:'Frío que conserva secretos.'},
  esencia_luz:{id:'esencia_luz',name:'Esencia de Luz',kind:'material',icon:'light',rarity:3,price:50,desc:'Un destello de bondad.'},
  esencia_sombra:{id:'esencia_sombra',name:'Esencia de Sombra',kind:'material',icon:'dark',rarity:3,price:50,desc:'No es malvada; solo recuerda.'},
  esencia_naturaleza:{id:'esencia_naturaleza',name:'Esencia de Naturaleza',kind:'material',icon:'nature',rarity:2,price:30,desc:'Semilla de un bosque entero.'},
  esencia_celestial:{id:'esencia_celestial',name:'Esencia Celestial',kind:'material',icon:'celestial',rarity:5,price:120,desc:'El último aliento del firmamento.'},
  llave_ruina:{id:'llave_ruina',name:'Llave de Elyra',kind:'key',icon:'key',rarity:3,price:0,desc:'Abre sellos antiguos de la ciudad olvidada.'},
};
export const GEAR = {...WEAPONS,...ARMORS,...ACCESSORIES};
export function itemDef(id){return ITEMS[id]||GEAR[id]||null}
export function itemIcon(id){const d=itemDef(id);return d?.icon||'bag'}
export function itemName(id){const d=itemDef(id);return d?.name||id}

// ---------- MAGIA ----------
export const SPELLS = {
  fuego:{id:'fuego',name:'Fuego Solar',affinity:'fuego',icon:'fire',cost:16,damage:26,cooldown:.9,desc:'Lanza una esfera ardiente que explota al impactar.',color:'#ff8a5c',unlock:0},
  hielo:{id:'hielo',name:'Lanza de Escarcha',affinity:'hielo',icon:'ice',cost:20,damage:17,cooldown:1.2,desc:'Congela al enemigo durante 2,4 s.',color:'#b9e8ff',unlock:'hielo'},
  rayo:{id:'rayo',name:'Cadena de Tormenta',affinity:'rayo',icon:'lightning',cost:24,damage:20,cooldown:1.5,desc:'Un relámpago salta entre hasta tres enemigos.',color:'#ffe169',unlock:'rayo'},
  luz:{id:'luz',name:'Bendición del Alba',affinity:'luz',icon:'light',cost:28,damage:0,heal:44,cooldown:2.4,desc:'Restaura 44 de vida y purifica el miedo.',color:'#fff2c2',unlock:'luz'},
};

// ---------- HABILIDADES ----------
export const SKILLS = {
  filo:{id:'filo',name:'Filo del Alba',icon:'sword',cost:1,desc:'+12% de daño con armas.',requires:null},
  vitalidad:{id:'vitalidad',name:'Corazón de Estrella',icon:'heart',cost:1,desc:'+25 de vida máxima.',requires:null},
  flujo:{id:'flujo',name:'Flujo de Maná',icon:'mana',cost:1,desc:'+20 de maná máximo.',requires:null},
  esquiva:{id:'esquiva',name:'Paso de Niebla',icon:'wind',cost:1,desc:'La esquiva dura más y cuesta menos.',requires:null},
  guardia:{id:'guardia',name:'Muro de Luz',icon:'shield',cost:1,desc:'Bloquea el 65% del daño frontal.',requires:null},
  fortuna:{id:'fortuna',name:'Fortuna del Zorro',icon:'star',cost:1,desc:'+15% de oro y +10% de captura.',requires:null},
  hielo:{id:'hielo',name:'Susurro de Escarcha',icon:'ice',cost:1,desc:'Desbloquea la magia de hielo.',requires:null},
  rayo:{id:'rayo',name:'Furia del Cielo',icon:'lightning',cost:1,desc:'Desbloquea la magia de rayo.',requires:'flujo'},
  luz:{id:'luz',name:'Bendición del Alba',icon:'light',cost:1,desc:'Desbloquea la magia de luz.',requires:'vitalidad'},
  invocacion:{id:'invocacion',name:'Lazo de Criatura',icon:'paw',cost:1,desc:'La criatura activa ataca más a menudo.',requires:null},
  combo:{id:'combo',name:'Danza de Acero',icon:'sword',cost:1,desc:'Añade un golpe al combo de todas las armas.',requires:'filo'},
  mago:{id:'mago',name:'Intelecto Arcano',icon:'wand',cost:1,desc:'+20% de daño mágico y +10 maná.',requires:'flujo'},
  cazador:{id:'cazador',name:'Ojo del Cazador',icon:'bow',cost:1,desc:'+15% de crítico y +12% de velocidad de ataque.',requires:'fortuna'},
  parry:{id:'parry',name:'Contraataque',icon:'shield',cost:1,desc:'Bloquear a tiempo aturde al enemigo.',requires:'guardia'},
  celestial:{id:'celestial',name:'Aliento Celestial',icon:'celestial',cost:2,desc:'+15% a todos los atributos. Requiere la espada forjada.',requires:'combo'},
};

// ---------- CRIATURAS ----------
export const CREATURES = {
  brasita:{id:'brasita',name:'Brasita',affinity:'fuego',rarity:2,base:{hp:34,atk:12,def:6,spd:1.1},evolveTo:'ignisaurio',evolveLevel:8,shape:'imp',color:'#ff8a5c',eye:'#ffe1a6',desc:'Una chispa con colmillos. Duerme dentro de las hogueras.',ability:'Combustión',abilityDesc:'Quema zarzas y abre pasos de fuego.',lore:'Nació del primer sol que tocó la tierra.'},
  ignisaurio:{id:'ignisaurio',name:'Ignisaurio',affinity:'fuego',rarity:4,base:{hp:68,atk:26,def:12,spd:1.25},shape:'drake',color:'#ff6b3c',eye:'#fff0b0',desc:'Un pequeño dragón de brasas. Protege a quien lo crió.',ability:'Aliento Ígneo',abilityDesc:'Quema obstáculos y derrite hielo.',lore:'Su aliento enciende los altares olvidados.'},
  aquin:{id:'aquin',name:'Aquín',affinity:'agua',rarity:2,base:{hp:38,atk:10,def:8,spd:1.05},evolveTo:'marestral',evolveLevel:8,shape:'squid',color:'#66c8ff',eye:'#e8fbff',desc:'Una gota curiosa que corre por los arroyos.',ability:'Marea',abilityDesc:'Apaga llamas y activa molinos de agua.',lore:'Dice la leyenda que llora cuando el río está triste.'},
  marestral:{id:'marestral',name:'Marestrál',affinity:'agua',rarity:4,base:{hp:74,atk:23,def:15,spd:1.1},shape:'serpent',color:'#3e9cff',eye:'#d8f4ff',desc:'Serpiente de agua que dibuja constelaciones en la superficie.',ability:'Corriente Viva',abilityDesc:'Permite cruzar aguas profundas.',lore:'Los navegantes le piden permiso antes de zarpar.'},
  terrabi:{id:'terrabi',name:'Terrabí',affinity:'tierra',rarity:2,base:{hp:48,atk:11,def:13,spd:.8},evolveTo:'golemin',evolveLevel:8,shape:'mole',color:'#c9a06c',eye:'#3a2a1a',desc:'Un topo de piedra que adora las siestas largas.',ability:'Peso Antiguo',abilityDesc:'Mueve rocas y activa placas de presión.',lore:'Cada montaña es, en realidad, un Terrabí dormido.'},
  golemin:{id:'golemin',name:'Golemín',affinity:'tierra',rarity:4,base:{hp:96,atk:24,def:26,spd:.75},shape:'golem',color:'#a57a48',eye:'#ffe4a8',desc:'Un guardián de musgo y granito. Camina despacio, protege siempre.',ability:'Muro Vivo',abilityDesc:'Mueve rocas enormes y golpea con fuerza.',lore:'Sostuvo el techo de Elyra durante mil años.'},
  zefiro:{id:'zefiro',name:'Zéfiro',affinity:'viento',rarity:3,base:{hp:30,atk:15,def:5,spd:1.6},evolveTo:'tempestin',evolveLevel:9,shape:'bird',color:'#9ef0d8',eye:'#2b6a5a',desc:'Un colibrí de viento que nunca toca el suelo.',ability:'Corriente',abilityDesc:'Activa aspas y molinos; permite planear.',lore:'Su canto cambia la dirección de las tormentas.'},
  tempestin:{id:'tempestin',name:'Tempestín',affinity:'viento',rarity:4,base:{hp:58,atk:30,def:10,spd:1.85},shape:'griffin',color:'#5de5bf',eye:'#fff7b0',desc:'Alas de vendaval y mirada de horizonte.',ability:'Vendaval',abilityDesc:'Empuja objetos y alcanza zonas altas.',lore:'Los marineros lo llaman "el que abre el cielo".'},
  chispin:{id:'chispin',name:'Chispín',affinity:'rayo',rarity:3,base:{hp:32,atk:18,def:5,spd:1.35},evolveTo:'voltario',evolveLevel:9,shape:'mouse',color:'#ffe169',eye:'#6a4b00',desc:'Una chispa con orejas. Se esconde en los cables de tormenta.',ability:'Descarga',abilityDesc:'Activa mecanismos eléctricos y aturde.',lore:'Le encanta morder los pararrayos.'},
  voltario:{id:'voltario',name:'Voltario',affinity:'rayo',rarity:4,base:{hp:60,atk:34,def:9,spd:1.6},shape:'tiger',color:'#ffd11a',eye:'#fffbe0',desc:'Un felino de rayos que corre más rápido que el trueno.',ability:'Tormenta',abilityDesc:'Energiza ruinas y paraliza enemigos.',lore:'Cuando parpadea, hay un relámpago en alguna parte.'},
  escarcha:{id:'escarcha',name:'Escarcha',affinity:'hielo',rarity:3,base:{hp:40,atk:15,def:10,spd:1.0},evolveTo:'glaciel',evolveLevel:9,shape:'fox',color:'#b9e8ff',eye:'#3d7a9c',desc:'Un zorro de nieve que deja escarcha al caminar.',ability:'Ventisca',abilityDesc:'Congela agua y mecanismos.',lore:'Sus huellas forman copos perfectos.'},
  glaciel:{id:'glaciel',name:'Glaciel',affinity:'hielo',rarity:4,base:{hp:78,atk:26,def:20,spd:1.15},shape:'stag',color:'#69ccff',eye:'#f0feff',desc:'Un ciervo de hielo eterno. Su cornamenta canta.',ability:'Era Glacial',abilityDesc:'Congela cualquier obstáculo de agua.',lore:'Solo aparece cuando el lago duerme.'},
  lumiel:{id:'lumiel',name:'Lumiel',affinity:'luz',rarity:4,base:{hp:44,atk:14,def:12,spd:1.2},shape:'angel',color:'#fff2c2',eye:'#c39a35',desc:'Un espíritu de luz que guía a los perdidos.',ability:'Faro',abilityDesc:'Ilumina cuevas y revela secretos.',lore:'Nunca abandona a quien camina en la oscuridad.'},
  umbrio:{id:'umbrio',name:'Umbrío',affinity:'oscuridad',rarity:3,base:{hp:46,atk:20,def:8,spd:1.25},evolveTo:'nocturno',evolveLevel:9,shape:'cat',color:'#b899ff',eye:'#fff4a8',desc:'Un gato de sombra que aparece en los reflejos.',ability:'Velo',abilityDesc:'Revela pasadizos ocultos en la oscuridad.',lore:'No es un mal augurio. Solo es tímido.'},
  nocturno:{id:'nocturno',name:'Nocturno',affinity:'oscuridad',rarity:4,base:{hp:82,atk:35,def:14,spd:1.4},shape:'panther',color:'#7d55e8',eye:'#ffe169',desc:'La pantera que camina entre dos mundos.',ability:'Eclipse',abilityDesc:'Abre sellos de sombra y aturde.',lore:'Los espejos le guardan el sitio.'},
  brotito:{id:'brotito',name:'Brotito',affinity:'naturaleza',rarity:1,base:{hp:36,atk:9,def:7,spd:.95},evolveTo:'florecer',evolveLevel:7,shape:'sprout',color:'#8fe3a0',eye:'#2f5b34',desc:'Un brote con patas que adora la lluvia.',ability:'Fotosíntesis',abilityDesc:'Cura al grupo fuera de combate.',lore:'Si lo plantas, crece una casa.'},
  florecer:{id:'florecer',name:'Florecer',affinity:'naturaleza',rarity:3,base:{hp:70,atk:22,def:16,spd:1.0},shape:'tree',color:'#53c878',eye:'#fff3b0',desc:'Un pequeño árbol andante cubierto de flores.',ability:'Jardín Vivo',abilityDesc:'Cura al grupo y hace crecer puentes de raíces.',lore:'Cada flor guarda el nombre de una persona querida.'},
  astral:{id:'astral',name:'Astral',affinity:'celestial',rarity:5,base:{hp:52,atk:28,def:18,spd:1.5},shape:'astral',color:'#f4d998',eye:'#fffbe8',desc:'Una criatura hecha de constelaciones. Muy rara.',ability:'Firmamento',abilityDesc:'Abre sellos celestiales y potencia la magia.',lore:'Se dice que una estrella se apagó para que naciera.'},
};

export const CAPTURE_SPECIES = ['brotito','brasita','aquin','umbrio','chispin','escarcha','terrabi','zefiro','lumiel','astral'];

// ---------- ENEMIGOS ----------
export const ENEMIES = {
  jelly:{id:'jelly',name:'Gelatina Silvestre',hp:38,atk:7,speed:34,radius:15,xp:16,gold:7,color:'#8fe3a0',color2:'#4ba86c',affinity:'naturaleza',behavior:'bounce',drop:'hierba',dropChance:.55,scale:1,capture:null},
  wolf:{id:'wolf',name:'Lobo de Ceniza',hp:54,atk:11,speed:68,radius:17,xp:26,gold:12,color:'#8491a8',color2:'#3d4a61',affinity:'oscuridad',behavior:'chase',drop:'esencia_sombra',dropChance:.25,scale:1.05},
  beetle:{id:'beetle',name:'Escarabajo Pétreo',hp:92,atk:15,speed:27,radius:20,xp:38,gold:19,color:'#a57a48',color2:'#5f452c',affinity:'tierra',behavior:'tank',drop:'esencia_tierra',dropChance:.35,scale:1.1},
  specter:{id:'specter',name:'Espectro de las Ruinas',hp:48,atk:13,speed:46,radius:16,xp:34,gold:16,color:'#b899ff',color2:'#5f4a96',affinity:'oscuridad',behavior:'caster',drop:'esencia_sombra',dropChance:.4,scale:1.05},
  guardian:{id:'guardian',name:'Guardián Corrompido',hp:520,atk:21,speed:40,radius:30,xp:240,gold:180,color:'#c9a06c',color2:'#57422c',affinity:'tierra',behavior:'boss',boss:true,drop:'esencia_celestial',dropChance:1,scale:1.65,phases:2},
  queen:{id:'queen',name:'Reina Gelatina',hp:430,atk:17,speed:39,radius:32,xp:220,gold:160,color:'#a5f0b8',color2:'#3f9c62',affinity:'naturaleza',behavior:'boss',boss:true,drop:'esencia_naturaleza',dropChance:1,scale:1.7,phases:2},
  tide:{id:'tide',name:'Leviatán del Lago',hp:560,atk:20,speed:42,radius:34,xp:280,gold:210,color:'#66c8ff',color2:'#276099',affinity:'agua',behavior:'boss',boss:true,drop:'esencia_celestial',dropChance:1,scale:1.75,phases:2},
  eclipse:{id:'eclipse',name:'Avatar del Eclipse',hp:980,atk:27,speed:45,radius:36,xp:600,gold:500,color:'#b899ff',color2:'#39265e',affinity:'oscuridad',behavior:'boss',boss:true,drop:'esencia_celestial',dropChance:1,scale:2,phases:3,final:true},
};

export const SHOP_STOCK = ['pocion','eter','sello','baya','hierba','cristal','mandoble_astral','daga_sombra','lanza_cielo','arco_lunar','baculo_estelar','cota_plata','manto_hoja','amuleto_lumen','anillo_zorro','colgante_oso'];

export const RECIPES = [
  {id:'r_pocion',output:'pocion',amount:2,ingredients:{hierba:2},desc:'Dos pociones de luna con hierbas frescas.'},
  {id:'r_eter',output:'eter',amount:2,ingredients:{cristal:2},desc:'Dos éteres destilados de cristales de maná.'},
  {id:'r_sello',output:'sello',amount:2,ingredients:{cristal:1,esencia_luz:1},desc:'Sellos celestiales reforzados con luz.'},
  {id:'r_elixir',output:'elixir',amount:1,ingredients:{pocion:2,eter:2,esencia_celestial:1},desc:'El elixir que devuelve la vida completa.'},
  {id:'r_cota',output:'cota_plata',amount:1,ingredients:{cristal:5,esencia_tierra:2},desc:'Forja una cota de plata lunar.'},
  {id:'r_armadura',output:'armadura_astral',amount:1,ingredients:{cristal:8,esencia_celestial:2,esencia_luz:2},desc:'La armadura que vistió el último héroe.'},
];

export const QUESTS = {
  main:{id:'main',title:'La Espada Rota',type:'main',steps:[
    {text:'Habla con la Anciana Mirra en la plaza de Aldea Alba.'},
    {text:'Recupera los tres fragmentos celestiales: Bosque, Ruinas y Lago.'},
    {text:'Lleva los fragmentos al Altar del Firmamento, en la Cima Celestial.'},
    {text:'Derrota al Avatar del Eclipse y restaura la Espada Celestial.'},
    {text:'La paz ha vuelto al valle. Explora y completa tu colección.'},
  ]},
  herbs:{id:'herbs',title:'Las hierbas de Nara',type:'side',steps:[
    {text:'Reúne 5 Hierbas de Lumen para Nara, la sanadora.'},
    {text:'Entrega las hierbas a Nara en Aldea Alba.'},
  ],reward:{gold:120,item:'pocion',amount:3}},
  cat:{id:'cat',title:'El gato de Lía',type:'side',steps:[
    {text:'Busca a "Nube", el gato de Lía, en el Bosque de Lumen.'},
    {text:'Vuelve junto a Lía en Aldea Alba.'},
  ],reward:{gold:90,item:'amuleto_lumen',amount:1}},
  jelly:{id:'jelly',title:'Gelatinas del sendero',type:'side',steps:[
    {text:'Derrota 5 Gelatinas Silvestres para Garet el Cazador.'},
    {text:'Habla de nuevo con Garet.'},
  ],reward:{gold:80,item:'sello',amount:3}},
};

export const ZONE_ORDER = ['aldea','bosque','ruinas','lago','cumbre'];

export const DEFAULT_APPEARANCE = {
  hairStyle:0,hairColor:'#e8c477',outfit:'tunic',outfitColor:'#4e75a8',skin:'#e8b98c',accessory:'diadema',
};
export const HAIR_STYLES = [
  {id:0,name:'Mecha lunar'},{id:1,name:'Trenza alba'},{id:2,name:'Corto salvaje'},{id:3,name:'Larga celestial'}
];
export const HAIR_COLORS = ['#e8c477','#f2ead8','#3b2a28','#b24a3f','#7c9fe8','#9b6bd6','#6fcbb0','#d97ab1'];
export const SKIN_TONES = ['#f5d5b8','#e8b98c','#c98f62','#9a6440','#74492f','#5a3423'];
export const OUTFIT_COLORS = ['#4e75a8','#7a4b36','#4d6b48','#6b5c8c','#8f3f4e','#2f5d6b','#b08b4f','#d7d2e8'];
export const ACCESSORY_STYLES = ['diadema','pluma','arete','ninguno'];
export const OUTFIT_STYLES = [
  {id:'tunic',name:'Túnica'},{id:'robe',name:'Manto'},{id:'hunter',name:'Cazadora'},{id:'vest',name:'Jubón'}
];

export const STAT_LABELS = {
  strength:'Fuerza',defense:'Defensa',speed:'Velocidad',intelligence:'Inteligencia',luck:'Suerte',
  maxHp:'Vida',maxMana:'Maná',maxStamina:'Resistencia'
};
