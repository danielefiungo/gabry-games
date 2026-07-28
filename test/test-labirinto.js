/* Test jsdom — IL LABIRINTO (js/labirinto-3d.js + js/gioco-labirinto.js)
   Piazze e monumenti, cartelli da leggere, minimappa con nebbia di guerra,
   muri in InstancedMesh, collisioni.
   Uso: node test/test-labirinto.js     (richiede: npm install jsdom) */
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const DIR=path.resolve(__dirname,'..');
/* L'elenco degli script si legge da index.html: se qualcuno aggiunge o sposta
   un file, il test resta allineato da solo. Ci fermiamo a letturine.js: tutto
   quello che serve al labirinto è caricato prima. */
function scriptList(stopAfter){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8');
  const all=[...html.matchAll(/<script src="js\/([^"?]+)/g)].map(m=>m[1]);
  const i=all.indexOf(stopAfter);
  return i<0 ? all : all.slice(0,i+1);
}
const SCRIPTS=scriptList('letturine.js');

let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++;console.log('  ✓ '+msg);} else {fail++;console.log('  ✗ FAIL: '+msg);} }
function between(v,lo,hi,msg){ ok(v>=lo&&v<=hi, msg+'  (atteso '+lo+'–'+hi+', ottenuto '+v+')'); }

function boot(){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:false});
  const w=dom.window;
  w.eval(`
    /* conta quante volte viene creato un oggetto disegnabile */
    window.__stats={mesh:0,instanced:0,instances:0,sprite:0,points:0,light:0,added:0};
    function __vecFactory(){ const v={x:0,y:0,z:0,
      set(a,b,c){this.x=a;this.y=b;this.z=c;return this},
      copy(o){if(o){this.x=o.x;this.y=o.y;this.z=o.z}return this},
      clone(){return __vecFactory().copy(this)},
      add(){return this},sub(){return this},lerp(){return this},normalize(){return this},
      multiplyScalar(){return this},setScalar(){return this},lookAt(){},length(){return 0},
      distanceTo(o){return Math.hypot(this.x-o.x,this.y-o.y,this.z-o.z)}};
      return v; }
    class __Obj {
      constructor(){ this.position=__vecFactory(); this.rotation={x:0,y:0,z:0,set(){}};
        this.scale=__vecFactory(); this.userData={}; this.children=[]; this.visible=true;
        this.material=this; this.geometry=this; this.matrix={};
        this.domElement=document.createElement('canvas');
        this.color={setHex(){},setRGB(){},set(){},getHexString(){return 'aabbcc'},
                    clone(){return this},lerp(){return this},offsetHSL(){return this},r:1,g:1,b:1};
        this.emissive={setRGB(){},setHex(){}};
        this.opacity=1; this.intensity=1; this.fog=null; this.background=null;
        this.repeat={set(){}}; this.instanceMatrix={needsUpdate:false};
        this.attributes={position:{count:0,array:new Float32Array(3),needsUpdate:false,
                                   getX:()=>0,getY:()=>0,getZ:()=>0,setXYZ(){}}};
        this.wrapS=0; this.wrapT=0; this.near=0; this.far=0; this.aspect=1; this.elapsedTime=0; }
      add(){ for(const a of arguments) if(a){ this.children.push(a); window.__stats.added++; } return this }
      remove(){ return this } traverse(f){ f(this); this.children.forEach(c=>c.traverse&&c.traverse(f)) }
      setPixelRatio(){} setSize(){} render(){} dispose(){} getDelta(){return .016}
      lookAt(){} updateProjectionMatrix(){} updateMatrix(){} setAttribute(){}
      setMatrixAt(){ window.__stats.instances++ } computeVertexNormals(){}
      clone(){ return new __Obj() } copy(){return this} setScalar(){return this}
    }
    const __mk=(kind)=>function(){ const o=new __Obj();
      if(window.__stats[kind]!==undefined) window.__stats[kind]++;
      if(kind==='instanced'){ o.count=arguments[2]||0; }
      return o; };
    const __handler={ get:(t,k)=>{
      if(k in t) return t[k];
      if(k==='Mesh') return __mk('mesh');
      if(k==='InstancedMesh') return __mk('instanced');
      if(k==='Sprite') return __mk('sprite');
      if(k==='Points') return __mk('points');
      if(/Light$/.test(String(k))) return __mk('light');
      if(k==='Color') return function(){ return new __Obj().color };
      if(k==='Vector3') return function(a,b,c){ const v=__vecFactory(); v.set(a||0,b||0,c||0); return v };
      return __Obj; } };
    window.THREE=new Proxy({BackSide:1,DoubleSide:2,FrontSide:0,RepeatWrapping:3,AdditiveBlending:4},__handler);
    window.requestAnimationFrame=()=>0;
    window.fetch=()=>Promise.reject(new Error('no net in test'));
    window.indexedDB={open:()=>({})};
    window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[],addEventListener(){}};
    window.SpeechSynthesisUtterance=function(){};
    window.AudioContext=function(){ return {state:'running',createOscillator:()=>({connect(){},start(){},stop(){},frequency:{value:0,setValueAtTime(){}},type:''}),createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}}),destination:{},currentTime:0,resume(){}}; };
    window.webkitAudioContext=window.AudioContext;
    window.__mapDraws=0;
    HTMLCanvasElement.prototype.getContext=function(){ return {
      fillRect(){},strokeRect(){},clearRect(){ window.__mapDraws++ },fillText(){},measureText:t=>({width:String(t).length*18}),
      beginPath(){},moveTo(){},lineTo(){},arc(){},ellipse(){},stroke(){},fill(){},bezierCurveTo(){},
      createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),
      font:'',textAlign:'',textBaseline:'',fillStyle:'',strokeStyle:'',lineWidth:1,
      shadowColor:'',shadowBlur:0,shadowOffsetY:0 }; };
  `);
  for(const f of SCRIPTS){
    const el=w.document.createElement('script');
    el.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
    w.document.body.appendChild(el);
  }
  return w;
}

const w=boot();
const g=k=>w.eval(k);
const $=id=>w.document.getElementById(id);

/* ---------- 1. GENERATORE: piazze e risolvibilità ---------- */
console.log('TEST 1 — generatore: piazze, bordi, sempre risolvibile');
let allSolvable=true, bordersOk=true, roomsOk=true, roomCounts=[], pillarsOk=true;
for(let lvl=0; lvl<13; lvl++){
  for(let rep=0; rep<6; rep++){
    const W=g('SIZES['+lvl+']');
    w.eval('__G=genMaze('+W+','+W+'); __R=ROOMS.slice();');
    const grid=g('__G'), rooms=g('__R');
    roomCounts.push(rooms.length);
    /* il bordo deve restare tutto muro */
    for(let i=0;i<W;i++){
      if(grid[0][i]!==1||grid[W-1][i]!==1||grid[i][0]!==1||grid[i][W-1]!==1) bordersOk=false;
    }
    /* partenza e stella libere */
    if(grid[1][1]!==0||grid[W-2][W-2]!==0) roomsOk=false;
    /* ogni piazza ha il basamento (2) al centro e i bordi aperti */
    rooms.forEach(r=>{
      if(grid[r.cy][r.cx]!==2) pillarsOk=false;
      let open=0;
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(d=>{ if(grid[r.cy+d[1]][r.cx+d[0]]===0) open++; });
      if(open!==4) pillarsOk=false;   /* si gira intorno al monumento come in una rotonda */
    });
    /* BFS: dalla partenza si deve arrivare alla stella */
    const pathLen=g('findPath(__G,1,1,'+(W-2)+','+(W-2)+').length');
    if(pathLen<2) allSolvable=false;
  }
}
ok(allSolvable,'78 labirinti generati: tutti risolvibili dalla partenza alla stella');
ok(bordersOk,'il bordo esterno resta sempre chiuso');
ok(roomsOk,'partenza e stella restano libere');
ok(pillarsOk,'ogni piazza ha il monumento al centro e ci si gira intorno da tutti e 4 i lati');
between(Math.min(...roomCounts),2,3,'ogni livello ha almeno 2 piazze');
between(Math.max(...roomCounts),2,3,'e al massimo 3');

/* i valori della griglia sono solo 0, 1, 2 */
w.eval('__G=genMaze(21,21)');
const vals=new Set(); g('__G').forEach(r=>r.forEach(v=>vals.add(v)));
ok([...vals].every(v=>v===0||v===1||v===2),'la griglia usa solo 0 (libero), 1 (muro), 2 (basamento)');

/* ---------- 2. LIVELLO COSTRUITO ---------- */
console.log('\nTEST 2 — costruzione del livello');
w.eval('startLevel(0)');
const marks=g('marks.length'), signs=g('signs.length'), doorsN=g('doors.length');
between(marks,2,3,'i monumenti sono stati piazzati');
ok(g('marks.every(m=>m.def&&m.def.nm&&m.group)'),'ogni monumento ha nome e modello 3D');
ok(g('new Set(marks.map(m=>m.def.id)).size')===marks,'i monumenti dello stesso livello sono tutti diversi');
between(doorsN,4,5,'porte con le domande');
between(signs,2,4,'cartelli piazzati lungo il percorso');
between(g('torches.length'),3,14,'torce appese ai muri');

/* ---------- 3. I CARTELLI SI LEGGONO E SERVONO ---------- */
console.log('\nTEST 3 — i cartelli dicono davvero dove andare');
const texts=g('signs.map(s=>s.text)');
ok(texts.every(t=>t&&t.length>8),'ogni cartello ha una frase scritta');
ok(texts.every(t=>/^LA PORTA È |^LA STELLA È /.test(t)),'le frasi sono nella forma «LA PORTA È…» / «LA STELLA È…»');
const markNames=g('marks.map(m=>m.def.nm[0])');
ok(texts.every(t=>markNames.some(n=>t.includes(n.replace(/^(LA |IL |L’)/,'')))),
   'ogni cartello nomina un monumento che esiste davvero in questo livello');
ok(texts.every(t=>!/[←→↑↓⬅➡⬆⬇]/.test(t)),'nessuna freccia disegnata: bisogna leggere');
/* il cartello indica un obiettivo che sta PIÙ AVANTI sul percorso */
ok(g(`(function(){
  const p=findPath(grid,1,1,W-2,H-2);
  const idx=(x,z)=>p.findIndex(c=>c[0]===x&&c[1]===z);
  return signs.every(s=>{
    const si=idx(s.gx,s.gz); if(si<0) return true;
    const next=doors.filter(d=>typeof d.pk==='number'&&d.pk>si);
    if(next.length) return /LA PORTA/.test(s.text);
    return /LA STELLA/.test(s.text);
  });
})()`),'un cartello parla della stella solo quando non ci sono più porte davanti');
/* i cartelli non stanno addosso a una porta */
ok(g('signs.every(s=>!doors.some(d=>d.gx===s.gx&&d.gz===s.gz))'),'i cartelli non finiscono sopra una porta');
ok(g('signs.every(s=>grid[s.gz][s.gx]===0)'),'i cartelli stanno in corridoi liberi');
/* la targa è appesa a un muro vero, non sospesa a mezz'aria */
ok(g(`signs.every(s=>{
  const gx=Math.round(s.x/CELL+(W-1)/2), gz=Math.round(s.z/CELL+(H-1)/2);
  return grid[gz]&&grid[gz][gx]!==undefined;
})`),'ogni targa resta dentro la griglia');
ok(g(`signs.every(s=>{
  const p=g2w(s.gx,s.gz), dx=s.x-p.x, dz=s.z-p.z;
  const wx=s.gx+(dx>0.4?1:dx<-0.4?-1:0), wz=s.gz+(dz>0.4?1:dz<-0.4?-1:0);
  return grid[wz][wx]!==0;   /* dietro la targa c'è un muro */
})`),'ogni targa è appesa a un muro, non sospesa a mezz’aria');
/* e non chiude il passaggio: la targa resta fuori dallo spazio che il
   corpo dell'astronauta può occupare (mezzo corridoio libero = 0,72 m) */
ok(g('signs.every(s=>canStand(g2w(s.gx,s.gz).x,g2w(s.gx,s.gz).z))'),
   'nella cella del cartello ci si può stare');
ok(g(`signs.every(s=>{
  const p=g2w(s.gx,s.gz);
  const off=Math.max(Math.abs(s.x-p.x),Math.abs(s.z-p.z));
  return off-0.04 >= 0.72;      /* faccia della targa oltre il bordo del corridoio */
})`),'la targa è a filo di muro: l’astronauta non la urta mai');

/* ---------- 4. PREMIO DI LETTURA ---------- */
console.log('\nTEST 4 — leggere il cartello vale stelle, il 🔊 la metà');
w.eval('score=0; signs.forEach(s=>{s.read=false;s.spoken=false});');
w.eval('showSign(signs[0])');
ok(g('score')===8,'primo cartello letto da solo: +8 ⭐');
ok($('signBanner').classList.contains('show'),'il banner del cartello compare');
ok($('signText').textContent===g('signs[0].text'),'nel banner c’è il testo del cartello');
w.eval('showSign(signs[0])');
ok(g('score')===8,'rileggere lo stesso cartello non dà altre stelle');
w.eval('speakSign()');
ok(g('score')===4,'usando 🔊 il premio scende a 4 ⭐ (metà)');
ok(g('lvVoiceUsed')===true,'il 🔊 conta anche per le stelle di fine livello');
w.eval('speakSign()');
ok(g('score')===4,'premere 🔊 due volte non toglie altre stelle');
w.eval('hideSign()');
ok(!$('signBanner').classList.contains('show'),'allontanandosi il banner sparisce');
ok(g('curSign')===null,'nessun cartello attivo dopo hideSign');
/* avvicinandosi davvero al cartello con il personaggio */
w.eval('score=0; signs.forEach(s=>{s.read=false;s.spoken=false});');
w.eval('player.position.x=signs[1].x; player.position.z=signs[1].z; checkSigns();');
ok(g('score')===8,'camminando accanto a un cartello lo si legge');
w.eval('player.position.x=signs[1].x+40; player.position.z=signs[1].z+40; checkSigns();');
ok(g('curSign')===null,'andando via il cartello si chiude');

/* ---------- 5. MINIMAPPA E NEBBIA DI GUERRA ---------- */
console.log('\nTEST 5 — minimappa: si scopre camminando');
w.eval('startLevel(3)');
function seenCount(){ return g('(function(){let n=0;for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(seenCells[z][x])n++;return n})()'); }
const seen0=seenCount();
between(seen0,4,25,'all’inizio si vede solo la zona intorno alla partenza');
ok(seen0 < g('W*H')*0.25,'il resto del labirinto è ancora nascosto');
/* camminiamo lungo il percorso: la mappa si scopre */
w.eval(`(function(){
  const p=findPath(grid,1,1,W-2,H-2);
  for(const c of p){ const wp=g2w(c[0],c[1]); player.position.x=wp.x; player.position.z=wp.z; revealAround(); }
})()`);
const seen1=seenCount();
ok(seen1>seen0*3,'percorrendo il labirinto si scoprono molte più celle ('+seen0+' → '+seen1+')');
ok(seen1 < g('W*H'),'ma non si scopre tutto: restano zone inesplorate');
/* entrando in una piazza si vede tutta la piazza */
w.eval(`(function(){
  const m=marks[0], wp=g2w(m.gx,m.gz);
  player.position.x=wp.x; player.position.z=wp.z; revealAround();
})()`);
ok(g('(function(){const m=marks[0];for(let z=m.gz-1;z<=m.gz+1;z++)for(let x=m.gx-1;x<=m.gx+1;x++)if(!seenCells[z][x])return false;return true})()'),
   'entrando in una piazza si scopre tutta la piazza');
const draws0=g('__mapDraws');
w.eval('drawMiniMap()');
ok(g('__mapDraws')>draws0,'la minimappa viene disegnata');
w.eval('MAPON=false; applyMapBtn();');
ok($('miniMap').style.display==='none' && $('btnMap').textContent==='🚫','il tasto 🗺️ nasconde la minimappa');
w.eval('MAPON=true; applyMapBtn();');
ok($('miniMap').style.display==='block' && $('btnMap').textContent==='🗺️','e la rimostra');

/* ---------- 6. PRESTAZIONI: MURI IN INSTANCEDMESH ---------- */
console.log('\nTEST 6 — muri disegnati in blocco (prestazioni su tablet)');
w.eval('__stats.instanced=0; __stats.instances=0; __stats.mesh=0;');
w.eval('startLevel(12)');   /* il livello più grande: 21x21 */
const inst=g('__stats.instanced'), instCount=g('__stats.instances'), meshes=g('__stats.mesh');
between(inst,1,6,'i muri stanno in al massimo 6 InstancedMesh invece di centinaia di oggetti');
ok(instCount>200,'ma contengono comunque centinaia di pezzi di muro ('+instCount+')');
ok(meshes<230,'gli oggetti disegnati singolarmente restano pochi ('+meshes+', prima erano oltre 1000)');

/* ---------- 7. COLLISIONI ---------- */
console.log('\nTEST 7 — non si passa attraverso muri e monumenti');
ok(g('solidAt(g2w(0,0).x,g2w(0,0).z)')===true,'il muro di bordo è solido');
ok(g('solidAt(g2w(1,1).x,g2w(1,1).z)')===false,'la cella di partenza è libera');
ok(g('marks.every(m=>solidAt(g2w(m.gx,m.gz).x,g2w(m.gx,m.gz).z)===true)'),
   'il basamento del monumento blocca il passaggio');
ok(g('marks.every(m=>{const p=g2w(m.gx,m.gz+1);return canStand(p.x,p.z)})'),
   'ma si può camminare tutto intorno');
ok(g('doors.every(d=>solidAt(g2w(d.gx,d.gz).x,g2w(d.gx,d.gz).z)===true)'),'le porte chiuse bloccano');
w.eval('doors[0].open=true');
ok(g('solidAt(g2w(doors[0].gx,doors[0].gz).x,g2w(doors[0].gx,doors[0].gz).z)')===false,'la porta aperta lascia passare');

/* ---------- 8. IL LOOP GIRA ---------- */
console.log('\nTEST 8 — il gioco gira senza errori');
let crashed=null;
try{
  w.eval('startLevel(0); paused=false;');
  for(let i=0;i<120;i++){
    if(i===40) w.eval('keys["arrowright"]=true');
    if(i===80) w.eval('keys["arrowright"]=false; keys["arrowdown"]=true');
    w.eval('animate()');
  }
  w.eval('keys["arrowdown"]=false');
  w.eval('FPV=true'); for(let i=0;i<40;i++) w.eval('animate()');
  w.eval('FPV=false; MAPON=false'); for(let i=0;i<20;i++) w.eval('animate()');
  w.eval('MAPON=true');
}catch(e){ crashed=e }
ok(!crashed,'180 frame senza eccezioni'+(crashed?' — '+crashed.message:''));
ok(g('scene')!==null,'la scena è viva');

/* ---------- 9. STRESS: gli invarianti reggono su tanti livelli ---------- */
console.log('\nTEST 9 — 52 livelli costruiti di fila: nessun caso limite');
const bad={piazze:0,muro:0,filo:0,suPorta:0,bloccato:0,senzaCartelli:0,frase:0,giroPiazza:0};
for(let n=0;n<52;n++){
  w.eval('startLevel('+(n%13)+')');
  if(g('marks.length')<2) bad.piazze++;
  if(!g('marks.every(m=>[[0,-1],[0,1],[-1,0],[1,0]].every(d=>grid[m.gz+d[1]][m.gx+d[0]]===0))')) bad.giroPiazza++;
  if(g('signs.length')<1){ bad.senzaCartelli++; continue; }
  if(!g(`signs.every(s=>{const p=g2w(s.gx,s.gz),dx=s.x-p.x,dz=s.z-p.z;
    const wx=s.gx+(dx>0.4?1:dx<-0.4?-1:0), wz=s.gz+(dz>0.4?1:dz<-0.4?-1:0);
    return grid[wz]&&grid[wz][wx]!==0&&grid[wz][wx]!==undefined;})`)) bad.muro++;
  if(!g(`signs.every(s=>{const p=g2w(s.gx,s.gz);
    return Math.max(Math.abs(s.x-p.x),Math.abs(s.z-p.z))-0.04>=0.72;})`)) bad.filo++;
  if(!g('signs.every(s=>!doors.some(d=>d.gx===s.gx&&d.gz===s.gz))')) bad.suPorta++;
  if(!g('signs.every(s=>canStand(g2w(s.gx,s.gz).x,g2w(s.gx,s.gz).z))')) bad.bloccato++;
  if(!g('signs.every(s=>/^LA PORTA È |^LA STELLA È /.test(s.text))')) bad.frase++;
}
Object.entries(bad).forEach(([k,v])=>ok(v===0,'nessuna violazione «'+k+'» in 52 livelli'+(v?' ('+v+' casi)':'')));

console.log('\n══════════════════════════════');
console.log(pass+' passati, '+fail+' falliti');
process.exit(fail?1:0);
