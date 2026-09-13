/* Test harness per js/officina-circuiti.js (jsdom)
   Uso: npm install jsdom && node test/test-officina.js */
const fs=require('fs');
const {JSDOM}=require('jsdom');

const src=fs.readFileSync(require('path').join(__dirname,'..','js','officina-circuiti.js'),'utf8');

const dom=new JSDOM('<!DOCTYPE html><html><body><div id="hud"></div><div id="joy"></div><div id="menu"></div><div id="modeSel"></div></body></html>',
  {runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/'});
const w=dom.window;

/* stub dei globali dell'app */
w.eval(`
  var paused=true, VOICEON=false, MUSICON=false, TRK_LEVEL={}, TRK_MENU={};
  function $(id){ return document.getElementById(id); }
  function LI(){ return 0; }
  function speak(){} function stopSpeak(){} function initTTS(){}
  function playMusic(){} function stopMusic(){} function mCtx(){} function save(){}
  var GAMES=[]; function registerGame(g){ GAMES.push(g); }
  function showModeSel(){}
  HTMLCanvasElement.prototype.getContext=function(){ return null; };
`);
w.eval(src);

const OC=w.window.__OC || w.__OC;
if(!OC){ console.error('FAIL: __OC non definito'); process.exit(1); }

let pass=0, fail=0;
function T(name,cond,extra){
  if(cond){ pass++; console.log('  ok  '+name); }
  else { fail++; console.log('  FAIL '+name+(extra!==undefined?'  ['+extra+']':'')); }
}
function steps(sec){ const n=Math.round(sec/0.02); for(let i=0;i<n;i++) OC.step(0.02); }
function until(sec,fn){ const n=Math.round(sec/0.02); for(let i=0;i<n;i++){ OC.step(0.02); if(fn()) return true; } return fn(); }
const oc=OC.oc;
const doc=w.window.document;
function unlockAll(){ oc.prog.unl=99; }
unlockAll();


console.log('Percorso Piccoli ingegneri');
OC.course('labs');
T('quattro esperimenti accessibili senza completare i primi passi',doc.querySelectorAll('#ocPickGrid .ocLvBtn:not(.sand):not(:disabled)').length===4);
T('totale separato: dodici stelle',doc.getElementById('ocTotalStars').textContent.includes('/ 12'));
const original=JSON.stringify(OC.levels);
const baselineSave=w.localStorage.getItem('gabri_off_c');
function start(n){
  OC.goto(n);
  T('esperimento '+n+' ha esempio e previsione',!doc.getElementById('ocLesson').hidden&&doc.querySelectorAll('#ocExample p').length===3);
  T('prima della previsione non si parte',doc.getElementById('ocIntroGo').disabled);
  doc.querySelectorAll('#ocAnswers button')[(oc.L.quiz.answer+1)%3].click();
  T('risposta sbagliata spiegata senza penalità',!oc.predictionOK&&oc.mish===0&&doc.getElementById('ocFeedback').textContent.includes(oc.L.quiz.why[0]));
  doc.querySelectorAll('#ocAnswers button')[oc.L.quiz.answer].click();
  T('la previsione corretta abilita il banco',oc.predictionOK&&!doc.getElementById('ocIntroGo').disabled);
  doc.getElementById('ocIntroGo').click();
  const sol=oc.L.sol;
  (sol.comps||[]).forEach(c=>T('inserisce '+c.t,OC.place(c.t,c.x,c.y,c.r)));
  (sol.wires||[]).forEach(v=>T('collega '+v.join(','),OC.wire(...v)));
}
function sw(id,on){ OC.comp(id).state.closed=on; }
function check(n){T('prova '+n+' superata',until(3,()=>oc.checkIndex===n));}
start(0);sw('A',true);sw('B',true);steps(1);
T('non basta accendere tutto',oc.checkIndex===0&&!oc.won);
sw('B',false);check(1);sw('A',false);sw('B',true);check(2);sw('A',true);check(3);sw('A',false);sw('B',false);check(4);
T('campanello completa tutte le combinazioni',until(2,()=>oc.won));
T('salvataggio esperimenti indipendente',JSON.parse(w.localStorage.getItem('gabri_off_c_labs')).stars[0]===3&&w.localStorage.getItem('gabri_off_c')===baselineSave);
start(1);sw('SL',true);sw('SM',true);check(1);sw('SM',false);check(2);sw('SL',false);sw('SM',true);check(3);sw('SM',false);check(4);
T('casa completata',until(2,()=>oc.won));
start(2);sw('S',true);check(1);steps(1);T('non passa senza scollegare la pila',oc.checkIndex===1);
sw('S',false);check(2);
T('la riserva si esaurisce davvero',until(10,()=>oc.checkIndex===3));
T('tensione visibile',doc.getElementById('ocMeter').textContent.includes('V')&&!doc.getElementById('ocMeter').hidden);
sw('S',true);check(4);T('riserva completata dopo ricarica',until(2,()=>oc.won));
start(3);sw('S',true);check(1);oc.sun=false;check(2);sw('S',false);check(3);sw('S',true);check(4);oc.sun=true;check(5);
T('lampione completo senza bruciature',until(2,()=>oc.won)&&oc.mish===0&&!OC.api.burnt('D'));
doc.getElementById('ocWinBarGo').click();doc.getElementById('ocWinNext').click();
T('ultimo esperimento torna al menu esperimenti',doc.getElementById('ocPick').style.display==='flex'&&oc.course==='labs');
T('stelle esperimenti tutte salvate',JSON.parse(w.localStorage.getItem('gabri_off_c_labs')).stars.every(n=>n===3));
start(0);sw('A',true);check(1);
doc.getElementById('ocExampleBtn').click();
T('rileggere esempio non azzera circuito o prove',oc.checkIndex===1&&OC.api.sw('A')&&oc.predictionOK);
doc.getElementById('ocIntroGo').click();
const before=OC.snapshot();sw('B',true);OC.commit(before);OC.undo();
T('annulla azzera prove ma conserva la previsione',oc.checkIndex===0&&oc.predictionOK);
doc.getElementById('ocResetBtn').click();
T('rifai ripropone esempio e previsione',!oc.predictionOK&&oc.checkIndex===0&&doc.getElementById('ocIntro').style.display==='flex');
OC.load();T('ricarica progressi separati',oc.labProg.stars.length===4&&oc.prog.stars.length===0);
OC.course('basic');T('i livelli originali non sono modificati',JSON.stringify(OC.levels)===original);
T('ritorno ai quindici livelli base',doc.querySelectorAll('#ocPickGrid .ocLvBtn:not(.sand)').length===15);
OC.goto(0);T('il percorso base non richiede quiz',doc.getElementById('ocLesson').hidden&&!doc.getElementById('ocIntroGo').disabled);
w.eval('LI=()=>1');OC.course('labs');OC.goto(3);
T('esempio e domanda disponibili in inglese',doc.getElementById('ocExample').textContent.includes('WORKED EXAMPLE')&&doc.querySelector('#ocPrediction legend').textContent.includes('night'));
console.log('\n'+pass+' ok, '+fail+' fail');process.exit(fail?1:0);
