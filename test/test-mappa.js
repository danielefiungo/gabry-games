/* Test jsdom: mappa a rete + letturine */
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const DIR=require('path').resolve(__dirname,'..');
const SCRIPTS=['domande.js','sfide.js','testi.js','audio-voce.js','musica.js','labirinto-3d.js','gioco-labirinto.js','letturine.js'];

let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++;console.log('  ✓ '+msg);} else {fail++;console.log('  ✗ FAIL: '+msg);} }

function boot(preLS){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:false});
  const w=dom.window;
  if(preLS) for(const[k,v] of Object.entries(preLS)) w.localStorage.setItem(k,v);
  /* stub THREE + audio */
  w.eval(`
    const __vec=()=>({x:0,y:0,z:0,set(){},copy(){},lerp(){},lookAt(){},clone(){return __vec();},offsetHSL(){return this;}});
    class __F{
      constructor(){ this.position=__vec(); this.rotation={x:0,y:0,z:0}; this.scale={set(){}};
        this.userData={}; this.domElement=document.createElement('canvas');
        this.elapsedTime=0; this.attributes={position:{array:new Float32Array(3),needsUpdate:false}}; this.geometry=this; this.material=this; }
      setPixelRatio(){} setSize(){} render(){} add(){} remove(){} getDelta(){return .016}
      lookAt(){} updateProjectionMatrix(){} setAttribute(){} getHexString(){return 'fff'} dispose(){}
      repeat={set(){}}; }
    window.THREE=new Proxy({},{get:()=>__F});
    window.requestAnimationFrame=()=>0;
    window.fetch=()=>Promise.reject(new Error('no net in test'));
    window.indexedDB={open:()=>({})};
    window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[] ,addEventListener(){}};
    window.SpeechSynthesisUtterance=function(){};
    window.AudioContext=function(){ return {state:'suspended',createOscillator:()=>({connect(){},start(){},stop(){},frequency:{value:0}}),createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}}),destination:{},currentTime:0,resume(){}}; };
    window.webkitAudioContext=window.AudioContext;
    HTMLCanvasElement.prototype.getContext=()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},createRadialGradient:()=>({addColorStop(){}}),font:'',textAlign:'',textBaseline:''});
  `);
  for(const f of SCRIPTS){
    const el=w.document.createElement('script');
    el.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
    w.document.body.appendChild(el);
  }
  return w;
}

/* ---------- TEST 1: stato iniziale + mappa ---------- */
console.log('TEST 1 — avvio pulito');
let w=boot();
let g=k=>w.eval(k);
ok(g('unlockedSet.size')===1 && g('unlockedSet.has(0)'),'solo il livello 0 è sbloccato all\'inizio');
ok(g('THEMES.length')===13 && g('LETTURINE.length')===13,'13 temi e 13 letturine allineati');
ok(g('document.querySelectorAll("#mapWrap .node").length')===13,'la mappa mostra 13 nodi');
ok(g('document.querySelectorAll("#mapWrap .node.play").length')===1,'1 nodo giocabile');
ok(g('document.querySelectorAll("#mapWrap .node.locked").length')===12,'12 nodi chiusi');
ok(g('document.querySelector("#mapWrap .node.locked").innerHTML.includes("📖")'),'i nodi chiusi mostrano il badge letturina 📖');
ok(g('document.querySelectorAll("#mapWrap path.trail").length')>=15,'la rete di sentieri è disegnata (>=15 collegamenti)');

/* EDGES: simmetria e limiti */
const EDGES=g('JSON.stringify(EDGES)'); const E=JSON.parse(EDGES);
let sym=true, bounds=true;
E.forEach((ns,a)=>ns.forEach(b=>{ if(!(E[b]||[]).includes(a)) sym=false; if(b<0||b>12) bounds=false; }));
ok(sym,'EDGES simmetrici (ogni sentiero va in due direzioni)');
ok(bounds && E.length===13,'EDGES: 13 nodi, indici validi');
/* raggiungibilità: tutta la mappa esplorabile senza letturina */
{ const seen=new Set([0]), q=[0];
  while(q.length){ const n=q.shift(); for(const m of E[n]) if(!seen.has(m)){seen.add(m);q.push(m);} }
  ok(seen.size===13,'tutti i 13 livelli raggiungibili tramite i sentieri'); }

/* ---------- TEST 2: letturina sblocca (percorso perfetto) ---------- */
console.log('TEST 2 — letturina, tutto giusto');
g('openLetturina(12)');
ok(g('$("lett").style.display')==='flex','overlay letturina visibile');
ok(g('document.querySelectorAll("#lettFacts .fact").length')===5,'5 curiosità mostrate');
const score0=g('score');
g('$("lettGo").click()');
ok(g('$("lettQBox").style.display')==='block','domanda 1 mostrata dopo "Ho letto!"');
function clickRight(){
  w.eval(`(()=>{ const q=LETTURINE[ltLevel].qs[ltStep], i=LI();
    [...document.querySelectorAll('#lettAnswers .ansBtn')].find(b=>b.textContent===q.ok[i]).click(); })()`);
}
clickRight();
g('window.__t=1'); /* flush */
/* la seconda domanda appare dopo 900ms: chiamiamo direttamente */
g('ltShowQuestion()');
clickRight();
ok(g('unlockedSet.has(12)')===true,'livello 12 sbloccato dalla letturina');
ok(g('score')===score0+30,'bonus pieno +30 ⭐ (nessun errore, no 🔊)');
ok(g('$("lettPlay").style.display')!=='none','bottone "Gioca subito!" visibile');
ok(g('document.querySelectorAll("#mapWrap .node.play").length')===2,'la mappa dietro si è aggiornata (2 nodi giocabili)');

/* ---------- TEST 3: letturina con errore = bonus dimezzato ---------- */
console.log('TEST 3 — letturina con errore');
g('openLetturina(7)');
const score1=g('score');
g('$("lettGo").click()');
w.eval(`(()=>{ const q=LETTURINE[ltLevel].qs[0], i=LI();
  [...document.querySelectorAll('#lettAnswers .ansBtn')].find(b=>b.textContent===q.no[0][i]).click(); })()`);
ok(g('ltErrors')===1,'errore registrato');
clickRight(); g('ltShowQuestion()'); clickRight();
ok(g('unlockedSet.has(7)'),'livello 7 sbloccato anche dopo un errore');
ok(g('score')===score1+15,'bonus dimezzato +15 ⭐ con errore');

/* ---------- TEST 4: completare un livello sblocca i vicini ---------- */
console.log('TEST 4 — sblocco per adiacenza');
w.eval('fanfare=()=>{}; burst=()=>{}; confetti=()=>{}; speak=()=>{}; stopMusic=()=>{}; star={position:{clone:()=>0}};');
w.eval('curLevel=0; tokens=0; lvBossMiss=0; lvVoiceUsed=false;');
g('levelComplete()');
ok(g('unlockedSet.has(1)') && g('unlockedSet.has(5)'),'completato lv0 → sbloccati i vicini 1 e 5');
ok(!g('unlockedSet.has(2)'),'il lv2 (non adiacente) resta chiuso');
ok(g('$("winNext").textContent').length>0 && g('starsMap[0]')>=1,'schermata vittoria ok, stelle salvate');

/* ---------- TEST 5: salvataggio e migrazione ---------- */
console.log('TEST 5 — persistenza');
ok(JSON.parse(g('localStorage.getItem("gabri_unlocked2")')).includes(12),'unlockedSet salvato in localStorage');
let w2=boot({gabri_unlocked:'4'});
let g2=k=>w2.eval(k);
ok(g2('unlockedSet.size')===4 && g2('unlockedSet.has(3)') && !g2('unlockedSet.has(4)'),'migrazione dal vecchio salvataggio lineare (4 → livelli 0-3)');
let w3=boot({gabri_unlocked2:'[0,5,9]'});
ok(w3.eval('unlockedSet.has(9) && unlockedSet.size===3'),'salvataggio nuovo formato ricaricato');

/* ---------- TEST 6: reset ---------- */
console.log('TEST 6 — reset');
w.eval('window.confirm=()=>true;');
g('$("btnReset").click()');
ok(g('unlockedSet.size')===1 && g('unlockedSet.has(0)'),'reset: si torna al solo livello 0');
ok(g('document.querySelectorAll("#mapWrap .node.play").length')===1,'mappa dopo reset: 1 nodo giocabile');

console.log('\n'+pass+' passati, '+fail+' falliti');
process.exit(fail?1:0);
