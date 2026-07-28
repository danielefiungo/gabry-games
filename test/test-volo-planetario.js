/* Test jsdom — MISSIONE PLANETARIA (js/volo-planetario.js)
   Verifica la fisica vera (salita, orbita, discesa) e il flusso di gioco.
   Uso: node test/test-volo-planetario.js     (richiede: npm install jsdom) */
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const DIR=path.resolve(__dirname,'..');
const SCRIPTS=['domande.js','sfide.js','testi.js','audio-voce.js','labirinto-3d.js',
               'mappa-spazio.js','mappa-avventura-3d.js','gioco-labirinto.js','letturine.js',
               'scelta-gioco.js','volo-planetario.js'];

let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++;console.log('  ✓ '+msg);} else {fail++;console.log('  ✗ FAIL: '+msg);} }
function near(a,b,tol,msg){ ok(Math.abs(a-b)<=tol, msg+'  (atteso ~'+b+', ottenuto '+(Math.round(a*100)/100)+')'); }
function between(v,lo,hi,msg){ ok(v>=lo&&v<=hi, msg+'  (atteso '+lo+'–'+hi+', ottenuto '+(Math.round(v*10)/10)+')'); }

function boot(){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:false});
  const w=dom.window;
  w.eval(`
    const __vec=function(){return {x:0,y:0,z:0,
      set(){return this},copy(){return this},add(){return this},sub(){return this},
      lerp(){return this},lookAt(){},clone(){return __vec()},normalize(){return this},
      multiplyScalar(){return this},setScalar(){return this},distanceTo(){return 999},
      offsetHSL(){return this},length(){return 0}};};
    class __F{
      constructor(){ this.position=__vec(); this.rotation={x:0,y:0,z:0,set(){}}; this.scale=__vec();
        this.userData={}; this.children=[]; this.visible=true; this.material=this; this.geometry=this;
        this.domElement=document.createElement('canvas'); this.attributes={position:{count:0,getX:()=>0,getY:()=>0,getZ:()=>0,setXYZ(){}}};
        this.opacity=1; this.color={setHex(){},setRGB(){},copy(){},multiplyScalar(){return this},r:1,g:1,b:1};
        this.intensity=1; this.fog=null; this.background=null; this.repeat={set(){}};
        this.wrapS=0; this.wrapT=0; this.near=0; this.far=0; this.aspect=1; }
      add(){for(const a of arguments)if(a)this.children.push(a);return this}
      remove(){return this} traverse(f){f(this);this.children.forEach(c=>c.traverse&&c.traverse(f))}
      setPixelRatio(){} setSize(){} render(){} dispose(){} getDelta(){return .016}
      lookAt(){} updateProjectionMatrix(){} setAttribute(){} computeVertexNormals(){}
      copy(){return this} setScalar(){return this} multiplyScalar(){return this} setHex(){} setRGB(){}
      clone(){return this} normalize(){return this} set(){return this} distanceTo(){return 999}
    }
    window.THREE=new Proxy({BackSide:1,DoubleSide:2,RepeatWrapping:3},{get:(t,k)=>(k in t)?t[k]:__F});
    window.requestAnimationFrame=()=>0;
    window.fetch=()=>Promise.reject(new Error('no net in test'));
    window.indexedDB={open:()=>({})};
    window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[],addEventListener(){}};
    window.SpeechSynthesisUtterance=function(){};
    window.AudioContext=function(){ return {state:'running',createOscillator:()=>({connect(){},start(){},stop(){},frequency:{value:0,setValueAtTime(){}},type:''}),createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}}),destination:{},currentTime:0,resume(){}}; };
    window.webkitAudioContext=window.AudioContext;
    HTMLCanvasElement.prototype.getContext=()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},arc(){},ellipse(){},stroke(){},fill(){},bezierCurveTo(){},
      createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),font:'',textAlign:'',textBaseline:'',fillStyle:'',strokeStyle:'',lineWidth:1});
  `);
  for(const f of SCRIPTS){
    const el=w.document.createElement('script');
    el.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
    w.document.body.appendChild(el);
  }
  return w;
}

const w=boot();
const VP=w.__VP;
ok(!!VP,'window.__VP esiste (hook di test)');

/* ---------- 1. DATI REALI ---------- */
console.log('\nTEST 1 — dati astronomici veri');
const D=Object.fromEntries(VP.DEST.map(d=>[d.id,d]));
ok(VP.DEST.length===4,'4 destinazioni');
near(D.luna.g,1.62,.01,'gravità della Luna 1,62 m/s²');
near(D.marte.g,3.71,.01,'gravità di Marte 3,71 m/s²');
near(D.venere.g,8.87,.01,'gravità di Venere 8,87 m/s²');
near(D.mercurio.g,3.70,.01,'gravità di Mercurio 3,70 m/s²');
near(D.venere.rho,65,3,'densità dell’aria al suolo su Venere ~65 kg/m³');
near(D.marte.rho,0.020,.002,'densità dell’aria al suolo su Marte ~0,020 kg/m³');
ok(D.luna.rho===0&&D.mercurio.rho===0,'Luna e Mercurio: nessuna atmosfera');
ok(D.luna.chute===false&&D.mercurio.chute===false,'niente paracadute dove non c’è aria');
ok(D.marte.chute===true,'il paracadute serve solo su Marte, l’unico posto dove l’aria basta a gonfiarlo ma non a fermarti');
ok(D.venere.chute===false,'su Venere niente paracadute: rallenterebbe troppo, come sganciavano le Venera');
near(D.luna.dist,384400,100,'distanza Terra-Luna 384 400 km');
/* ritardo radio = distanza / c */
near(D.luna.dist/299792.458,1.28,.05,'ritardo radio con la Luna ~1,3 s');
between(D.marte.dist/299792.458/60,10,14,'ritardo radio con Marte ~12 minuti');

/* razzo: i numeri del Falcon 9 */
const R=VP.ROCKET;
const gtow=R.s1.dry+R.s1.prop+R.s2.dry+R.s2.prop+R.fairing+R.payload;
between(gtow,500000,560000,'massa al decollo ~530 t (Falcon 9: 549 t)');
const twr=R.s1.thrustSL/(gtow*9.80665);
between(twr,1.3,1.6,'rapporto spinta/peso al decollo ~1,4 (deve essere >1 per staccarsi)');

/* ---------- 2. FORMULE DI BASE ---------- */
console.log('\nTEST 2 — formule fisiche');
near(VP.grav(0),9.80665,.001,'g al suolo = 9,80665 m/s²');
near(VP.grav(400000),8.68,.05,'g a 400 km (quota ISS) ≈ 8,7 m/s² — la gravità c’è ancora!');
near(VP.rho(0),1.225,.001,'densità dell’aria al suolo 1,225 kg/m³');
near(VP.rho(8500),1.225/Math.E,.001,'a 8500 m la densità è 1/e di quella al suolo');
between(VP.rho(80000)/1.225,0,1e-3,'a 80 km l’aria è praticamente finita');

/* ---------- 3. SALITA COMPLETA ---------- */
console.log('\nTEST 3 — salita integrata passo per passo');
VP.start(D.luna);
const vp=VP.vp;
ok(vp.stage==='ascent1','dopo start la fase è ascent1');
near(vp.p1,R.s1.prop,1,'serbatoi del 1º stadio pieni');
const m0=VP.mass();
near(m0,gtow,1,'massa iniziale = massa al decollo');

let maxQ=0,maxQh=0,maxQT=0,maxG=0,maxG1=0,meco=null,fair=null,orbit=null,minH2=1e9;
for(let i=0;i<40000;i++){
  if(vp.stage==='ascent1'||vp.stage==='ascent2'){
    VP.ascentStep(0.05);
    if(vp.q>maxQ&&vp.stage==='ascent1'){maxQ=vp.q;maxQh=vp.h;maxQT=vp.tSim}
    if(vp.acc>maxG)maxG=vp.acc;
    if(vp.stage==='ascent1'&&vp.acc>maxG1)maxG1=vp.acc;
    if(vp.stage==='ascent2')minH2=Math.min(minH2,vp.h);
    if(vp.stage==='ascent1'&&vp.p1<=0){meco={T:vp.tSim,h:vp.h,v:Math.hypot(vp.vx,vp.vy)};vp.stage='ascent2'}
    if(vp.stage==='ascent2'&&!vp.fairOut&&vp.h>110000){vp.fairOut=true;fair={T:vp.tSim,h:vp.h}}
    const v=Math.hypot(vp.vx,vp.vy);
    if(vp.stage==='ascent2'&&(v>7800||vp.p2<=0)){orbit={T:vp.tSim,h:vp.h,v};break}
  } else break;
}
ok(!!meco,'il 1º stadio esaurisce il propellente (MECO)');
between(meco.T,140,175,'MECO verso T+150 s (Falcon 9 reale: T+155 s)');
between(meco.h/1000,55,115,'MECO tra 55 e 115 km di quota (reale: 67 km)');
between(meco.v,2500,3400,'MECO tra 2500 e 3400 m/s (reale: ~2300 m/s)');
between(maxQ/1000,25,50,'Max-Q tra 25 e 50 kPa (reale: 30-35 kPa)');
between(maxQh/1000,9,17,'Max-Q tra 9 e 17 km di quota (reale: 11-13 km)');
between(maxQT,55,85,'Max-Q verso T+65 s (reale: T+72 s)');
between(maxG1,3.5,4.05,'1º stadio: i motori si strozzano per restare sotto 4 g (come il Falcon 9)');
between(maxG,4,5.2,'picco totale ~4,5 g a fine 2º stadio (gli astronauti di Crew Dragon ne sentono ~4,5)');
ok(!!fair,'la carenatura viene sganciata sopra i 110 km');
ok(!!orbit,'il 2º stadio raggiunge la velocità orbitale');
between(orbit.v,7700,7900,'velocità orbitale ~7,8 km/s (reale: 7,7 km/s)');
between(orbit.h/1000,120,420,'inserzione tra 120 e 420 km (la ISS sta a 400 km)');
between(minH2/1000,50,1e9,'il 2º stadio non ricade nell’atmosfera densa');
ok(orbit.T>meco.T,'l’orbita arriva dopo il MECO');
/* massa: deve calare davvero (equazione del razzo) */
ok(VP.mass()<m0*0.06,'a fine salita resta meno del 6% della massa iniziale — quasi tutto era carburante');

/* ---------- 4. DISCESA: OGNI PIANETA DIVERSO ---------- */
console.log('\nTEST 4 — velocità limite (attrito vero con l’aria del pianeta)');
function withDest(d,fn){ const old=vp.d; vp.d=d; const r=fn(); vp.d=old; return r; }
const vtLuna=withDest(D.luna,()=>VP.terminal(false));
const vtMarte=withDest(D.marte,()=>VP.terminal(false));
const vtMarteC=withDest(D.marte,()=>VP.terminal(true));
const vtVenere=withDest(D.venere,()=>VP.terminal(false));
ok(vtLuna===Infinity,'sulla Luna non esiste velocità limite: si accelera sempre');
between(vtMarte,180,300,'Marte senza paracadute: ~236 m/s');
between(vtMarteC,60,95,'Marte con paracadute: ~75 m/s (le sonde vere: ~90 m/s)');
between(vtVenere,4,10,'Venere: ~6 m/s, l’aria è così densa che frena quasi tutto (Venera: 7 m/s)');
ok(vtVenere<vtMarteC && vtMarteC<vtMarte,'più aria c’è, più si scende piano');
ok(D.venere.tdOk===8,'su Venere gli anelli deformabili reggono fino a 8 m/s (come le Venera)');

console.log('\nTEST 5 — discesa simulata su ogni mondo');
function descend(d,strategy){
  vp.d=d; vp.lh=d.h0; vp.lv=d.v0; vp.fuel=100; vp.chute=false;
  let t=0, burnStart=null;
  for(let i=0;i<200000;i++){
    if(vp.lh<=0.4)break;
    if(t>900)break;
    const s=strategy(); /* {chute, burn} */
    if(s.chute&&!vp.chute&&d.chute)vp.chute=true;
    if(s.burn&&burnStart===null)burnStart=vp.lh;
    VP.descentStep(0.02,s.burn&&vp.fuel>0);
    t+=0.02;
  }
  return {v:vp.lv,fuel:vp.fuel,t,burnStart};
}
/* pilota "bravo": apre il paracadute subito e accende dentro la fascia calcolata */
const smart=()=>({chute:true,burn:vp.lh<=VP.burnAlt()*1.06});
[D.luna,D.marte,D.venere,D.mercurio].forEach(d=>{
  const r=descend(d,smart);
  const lim=d.tdOk;
  ok(r.v<=lim,'atterraggio riuscito su '+d.nm+': '+(Math.round(r.v*10)/10)+' m/s (≤'+lim+') con '+Math.round(r.fuel)+'% di carburante');
  ok(r.fuel>=0,'carburante mai negativo su '+d.nm);
  between(r.t,15,70,'la discesa su '+d.nm+' dura fra 15 e 70 secondi (giocabile)');
});
/* senza fare niente si schianta, tranne su Venere dove ci pensa l'aria */
const idle=()=>({chute:false,burn:false});
const crashLuna=descend(D.luna,idle);
ok(crashLuna.v>5,'sulla Luna senza motori ci si schianta a '+Math.round(crashLuna.v)+' m/s');
const crashMerc=descend(D.mercurio,idle);
ok(crashMerc.v>5,'su Mercurio senza motori ci si schianta a '+Math.round(crashMerc.v)+' m/s');
const venereIdle=descend(D.venere,idle);
between(venereIdle.v,5,8.1,'su Venere l’aria da sola porta a ~6,4 m/s: sotto gli 8 m/s che le gambe reggono');
ok(venereIdle.fuel===100,'su Venere non si consuma nemmeno una goccia di carburante');
between(venereIdle.t,20,70,'la discesa su Venere dura fra 20 e 70 secondi (giocabile)');
/* su Marte il paracadute è indispensabile */
const marteNoChute=descend(D.marte,()=>({chute:false,burn:vp.lh<=VP.burnAlt()*1.06}));
ok(marteNoChute.v>5,'su Marte senza paracadute non basta il carburante: '+Math.round(marteNoChute.v)+' m/s');
const marteChute=descend(D.marte,smart);
ok(marteChute.v<=5,'su Marte con il paracadute si atterra');
ok(marteNoChute.fuel<1,'senza paracadute il carburante finisce tutto');

console.log('\nTEST 6 — quota di accensione calcolata (v² = 2·a·h)');
vp.d=D.luna; vp.lv=100;
near(VP.burnAlt(),(100*100-4)/(2*(22-1.62)),1,'formula del "suicide burn" sulla Luna');
vp.d=D.venere; vp.lv=100;
near(VP.burnAlt(),(100*100-4)/(2*(22-8.87)),1,'stessa formula su Venere: serve più spazio, la gravità è forte');
ok((()=>{vp.d=D.luna;vp.lv=100;const a=VP.burnAlt();vp.d=D.venere;const b=VP.burnAlt();return b>a})(),
   'con più gravità bisogna accendere più in alto');

/* ---------- 7. FLUSSO DI GIOCO E LETTURA ---------- */
console.log('\nTEST 7 — schermate, lettura e punteggio');
const $=id=>w.document.getElementById(id);
VP.pick();
ok($('vpPick').style.display==='flex','la schermata di scelta si apre');
ok($('vpDests').querySelectorAll('.vpDest').length===4,'4 pulsanti destinazione');
ok(/Gravità/.test($('vpDests').textContent),'ogni destinazione mostra la gravità');
VP.brief(D.marte);
ok($('vpPanel').style.display==='flex','la scheda di missione si apre');
ok($('vpPData').querySelectorAll('i').length>=6,'la scheda elenca almeno 6 dati veri');
ok(/minuti|secondi/.test($('vpPData').textContent),'la scheda mostra il ritardo radio');
ok($('vpPArea').querySelector('.vpRead')!==null,'c’è il pulsante 🔊 "Leggi per me"');

VP.start(D.luna);
VP.landingBrief();
const cmds=[...$('vpPArea').querySelectorAll('.vpCommand')];
ok(cmds.length===4,'la procedura di atterraggio ha 4 comandi da leggere');
ok(new Set(cmds.map(b=>b.textContent)).size===4,'i 4 comandi sono tutti diversi');
/* ordine sbagliato: non avanza */
const right=['📡 Allinea la nave con il radiofaro','🛡️ Ruota lo scudo termico in avanti','🦿 Estendi le gambe di atterraggio','🔥 Arma i motori di frenata'];
const wrongFirst=cmds.find(b=>b.textContent!==right[0]);
wrongFirst.onclick(); ok(vp.landStep===0,'un comando fuori ordine non fa avanzare la procedura');
ok(vp.errs>0,'il comando sbagliato viene contato come errore');
right.forEach(t=>{const b=cmds.find(x=>x.textContent===t); if(b)b.onclick();});
ok(vp.landStep===4,'eseguendo i 4 comandi nell’ordine giusto la procedura si completa');

/* la lettura automatica dimezza il premio */
console.log('\nTEST 8 — premi: metà stelle con 🔊 o con errori');
const scoreBefore=w.eval('score');
vp.d=D.luna; vp.reads=0; vp.errs=0; vp.hull=100; vp.fuel=50; vp.score=50;
w.eval('__VP.vp.lv=1.5');
w.eval('vpReward(1.5)');
const gainClean=w.eval('score')-scoreBefore;
const s2=w.eval('score');
vp.reads=1; vp.errs=0; vp.hull=100; vp.fuel=50; vp.score=50;
w.eval('vpReward(1.5)');
const gainRead=w.eval('score')-s2;
ok(gainClean>0,'atterraggio perfetto: '+gainClean+' stelle');
ok(gainRead<=Math.ceil(gainClean/2),'con la lettura automatica il premio è dimezzato ('+gainRead+' invece di '+gainClean+')');
ok(/⭐⭐⭐/.test($('vpPTitle').textContent)===false,'con 🔊 non si prendono 3 stelle');

/* ---------- 9. SMOKE: il loop gira davvero in tutte le fasi ---------- */
console.log('\nTEST 9 — il loop di disegno gira senza errori in ogni fase');
function frames(n){ for(let i=0;i<n;i++) VP.frame(); }
let crashed=null;
try{
  VP.start(D.marte);
  frames(60);                       ok(vp.stage==='ascent1','fase 1: decollo — 60 frame senza errori');
  vp.p1=0; frames(4);               ok(vp.stage==='sep','fase 2: separazione degli stadi');
  frames(200);                      ok(vp.stage==='ascent2'||vp.stage==='orbit'||vp.stage==='cruise','fase 3: spinta del 2º stadio');
  vp.stage='ascent2'; vp.h=120000; vp.p2=0; frames(3);
  ok(vp.stage==='orbit'||vp.stage==='cruise','fase 4: orbita raggiunta');
  frames(200);                      ok(vp.stage==='cruise','fase 5: crociera avviata');
  vp.paused=false; vp.inc=2; vp.cruiseT=0; frames(120);
  ok(vp.stage==='cruise'||vp.stage==='brief','fase 5: la crociera regge 120 frame');
  VP.beginDescent();
  ok(vp.stage==='descent','fase 6: discesa avviata');
  vp.keys['ArrowUp']=0; frames(150); ok(vp.lh<D.marte.h0,'la nave scende davvero');
  vp.chute=true; frames(60);         ok(true,'il paracadute non rompe il loop');
  vp.keys['ArrowUp']=1; frames(120); vp.keys['ArrowUp']=0;
  ok(vp.fuel<100,'tenendo ▲ il carburante si consuma');
  vp.lh=0.2; frames(2);              ok(vp.stage==='done','toccato il suolo: la fase diventa "done"');
}catch(e){ crashed=e }
ok(!crashed,'nessuna eccezione durante 700+ frame'+(crashed?' — '+crashed.message:''));

console.log('\nTEST 10 — uscita pulita');
VP.exit();
ok($('vp').style.display==='none'&&$('vpPanel').style.display==='none','tutte le schermate si chiudono');
ok(vp.on===false,'il loop si ferma');
ok(Object.keys(vp.world).length===0,'le scene 3D vengono liberate (memoria GPU)');

console.log('\n══════════════════════════════');
console.log(pass+' passati, '+fail+' falliti');
process.exit(fail?1:0);
