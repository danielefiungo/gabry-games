const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
function boot(t){
  const dom=new JSDOM('<!doctype html><head></head><body>'+['menu','modeSel','hud','joy'].map(id=>'<div id="'+id+'"></div>').join('')+'</body>',{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost'});
  t.after(()=>dom.window.close());
  const w=dom.window, timers=new Map(); let next=0;
  w.setTimeout=(fn)=>{timers.set(++next,fn);return next;};
  w.clearTimeout=id=>timers.delete(id);
  w.requestAnimationFrame=()=>1; w.cancelAnimationFrame=()=>{};
  w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this},{get:(o,k)=>k in o?o[k]:k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});};
  const inject=text=>{const s=w.document.createElement('script');s.textContent=text;w.document.body.appendChild(s);};
  inject(`const $=id=>document.getElementById(id); let score=0,paused=false,VOICEON=true,MUSICON=false; const LI=()=>0,NM=t=>t; const UI={wrong:['Rileggi con calma'],praise:[['Bravo!']],speakBravo:['Bravo!']}; const shuffle=a=>a; const save=()=>{}; const stopSpeak=()=>{}; let speak=()=>Promise.resolve(); const initTTS=()=>{}; const beep=()=>{},sCorrect=()=>{},sWrong=()=>{},sLose=()=>{},sStar=()=>{},sToken=()=>{},fanfare=()=>{},confetti=()=>{}; const stopMusic=()=>{},playMusic=()=>{},mCtx=()=>{},TRK_ROCKET={}; const showModeSel=()=>{$('modeSel').style.display='flex'}; const games=[]; const registerGame=g=>games.push(g); Math.random=()=>0.9; window.testScore=()=>score; window.setSpeech=fn=>{speak=fn};`);
  inject(fs.readFileSync(path.join(__dirname,'../js/domande.js'),'utf8'));
  inject(fs.readFileSync(path.join(__dirname,'../js/apollo-launch-site.js'),'utf8'));
  inject(fs.readFileSync(path.join(__dirname,'../js/apollo-lunar.js'),'utf8'));
  inject(fs.readFileSync(path.join(__dirname,'../js/saturn-v-3d.js'),'utf8'));
  inject(fs.readFileSync(path.join(__dirname,'../js/missione-spaziale.js'),'utf8'));
  const m=w.__MS, $=id=>w.document.getElementById(id);
  const flush=()=>{const batch=[...timers];timers.clear();batch.forEach(([,fn])=>fn());};
  const start=(training=true)=>{m.enter();m.begin(training);flush();};
  const tap=id=>m.panelTap(id,w.document.querySelector('[data-id="'+id+'"]'));
  return {w,m,$,flush,start,tap};
}
test('ingresso, controlli, feedback, progresso e uscita',t=>{
  const {m,$,start,tap,flush}=boot(t); start();
  assert.equal(m.S.state,'order'); assert.equal($('msRoute').children.length,7);
  assert.equal($('msOrder').textContent,'CHIUDI IL PORTELLO');
  tap('motori'); assert.equal(m.S.fuel,92); assert.equal(m.S.idx,0);
  tap('portello'); assert.equal(m.S.flags.portello,1); assert.equal(m.S.ordersDone,1);
  assert.equal($('msProgressFill').style.width,'25%');
  assert.ok([...$('msPlancia').children].every(b=>b.disabled));
  flush(); assert.match($('msOrder').textContent,/OSSIGENO/);
  m.exit(); flush(); assert.equal(m.S.on,false); assert.equal(m.S.state,'idle');
  assert.equal($('modeSel').style.display,'flex');
});
test('sequenza: rifiuta POI anticipato, conserva il primo passo dopo un errore',t=>{
  const {m,$,start,tap,flush}=boot(t); start(); m.phaseStart(5); flush();
  m.S.idx=1; m.showOrder(); tap('gancio'); assert.equal(m.S.seqIdx,0);
  tap('motori'); assert.equal(m.S.seqIdx,1); assert.equal($('msOrder').querySelectorAll('.done').length,1);
  tap('radio'); assert.equal(m.S.seqIdx,1); tap('gancio');
  assert.equal(m.S.state,'anim'); assert.equal(m.S.ordersDone,1);
});
test('allenamento: ascolto gratuito, nessuna penalità nelle stelle, niente timer',async t=>{
  const {m,$,start,flush}=boot(t); start();
  await $('msHear').onclick(); assert.equal(m.S.fuel,100); assert.equal(m.S.phSpk,0);
  m.phaseStart(7); flush(); assert.equal(m.S.timerMax,0);
  m.update(120); assert.equal(m.S.fuel,100);
  m.emgStart(m.IMPREVISTI[0]); assert.equal(m.S.timerMax,0);
});
test('sfida: il tempo si ferma durante la voce, un clic ripetuto non addebita due volte',async t=>{
  const {w,m,$,start,flush}=boot(t); start(false); m.phaseStart(7); flush();
  let finish; w.setSpeech(()=>new Promise(resolve=>{finish=resolve}));
  const read=$('msHear').onclick(); const time=m.S.timer;
  await $('msHear').onclick(); m.update(5);
  assert.equal(m.S.timer,time); assert.equal(m.S.fuel,94); assert.equal(m.S.phSpk,1);
  finish(); await read; m.update(1); assert.equal(m.S.timer,time-1);
});
test('tempo scaduto: niente bonus al primo colpo; finestra nascosta ferma il timer',t=>{
  const {w,m,start,flush,tap}=boot(t); start(false); m.phaseStart(7); flush();
  m.update(41); assert.equal(m.S.tries,1); assert.equal(m.S.fuel,90);
  const time=m.S.timer; Object.defineProperty(w.document,'hidden',{value:true,configurable:true});
  m.update(10); assert.equal(m.S.timer,time);
  tap('portello'); assert.equal(w.testScore(),0);
});
test('quiz: aiuto ed errori dimezzano una sola volta e uscire annulla il passaggio successivo',t=>{
  const {w,m,$,start,flush}=boot(t); start(); m.qShow('easy');
  const wrong=[...$('msQAnswers').children].filter(b=>b.dataset.right==='0');
  wrong[0].click(); wrong[1].click(); m.Q.voiced=true; assert.equal(m.qReward(),5);
  $('msQAnswers').querySelector('[data-right="1"]').click(); assert.equal(w.testScore(),5);
  m.exit(); flush(); assert.equal(m.S.state,'idle'); assert.equal($('msCard').style.display,'none');
});
test('carburante finito: ripartire ricostruisce la navicella nella fase corretta',t=>{
  const {m,$,start,flush}=boot(t); start(); m.phaseStart(7); flush();
  m.S.flags.para=1; m.S.flags.scudo=1; m.fuel(-100);
  assert.equal(m.S.state,'end'); $('msEndBtn').click(); flush();
  assert.equal(m.S.fase,6); assert.equal(m.S.fuel,100);
  assert.equal(m.S.flags.para,undefined); assert.equal(m.S.flags.scudo,undefined);
  assert.equal(m.S.flags.lemDetached,1);
});
test('missione completa: sette fasi, sequenze, imprevisti, curiosità e ammaraggio',t=>{
  const {m,$,start,flush,tap}=boot(t); start();
  let guard=0;
  while(m.S.state!=='end'&&guard++<250){
    const state=m.S.state;
    if(state==='order') { const o=m.S.orders[m.S.idx]; tap(o.seq?o.seq[m.S.seqIdx]:o.ok); }
    else if(state==='emg') [...$('msProc').children].find(b=>b.textContent===m.S.emg.right).click();
    else if(state==='card') $('msCardOk').click();
    else if(state==='quiz') $('msQOffNo').click();
    else if(state==='count') m.update(1);
    else flush();
    m.draw(1);
  }
  assert.ok(guard<250); assert.equal(m.S.fase,7); assert.equal(m.S.ordersDone,42);
  assert.ok(m.S.emgSolved>=2); assert.equal(m.S.stars.reduce((a,b)=>a+b,0),21);
  assert.match($('msEndTit').textContent,/AMMARAGGIO RIUSCITO/);
  assert.equal(m.S.flags.splash,1);
});
test('i messaggi buffi si risolvono soltanto con IGNORA',t=>{
  const {m,start,tap}=boot(t); start();
  m.S.orders=[{t:'MANDA UNA PIZZA IN ORBITA',ok:'ignora',silly:true}];m.S.idx=0;m.showOrder();
  tap('radio');assert.equal(m.S.state,'order');tap('ignora');assert.equal(m.S.state,'anim');
});
test('imprevisto scaduto: la procedura corretta rimane visibile prima della spiegazione',t=>{
  const {m,$,start,flush}=boot(t);start(false);m.emgStart(m.IMPREVISTI[0]);m.emgTimeout();
  assert.equal($('msProc').style.display,'flex');assert.equal($('msProc').querySelector('.right').textContent,m.IMPREVISTI[0].right);
  assert.ok([...$('msProc').children].every(b=>b.disabled));flush();assert.equal(m.S.state,'card');
});

test('Saturn V: disegno 3D, stadio separato, capsula e rilascio risorse',t=>{
  const {w,m,start}=boot(t);start();
  const calls=[];let disposed=0;
  w.MSSaturnV={draw:(c,x,y,s,o,time,flags)=>{calls.push({o,flags});return true;},dispose:()=>disposed++};
  m.draw(1);assert.equal(calls.length,1);assert.equal(calls[0].o.upperOnly,undefined);
  calls.length=0;m.S.scene='sep';m.S.flags.sep=1;m.S.flags.sepT=.2;m.draw(2);
  assert.equal(calls.length,2);assert.equal(calls[0].o.upperOnly,true);assert.equal(calls[1].o.booster,true);
  calls.length=0;m.S.scene='rientro';m.draw(3);assert.equal(calls.length,1);assert.equal(calls[0].o.capsule,true);
  m.exit();assert.equal(disposed,1);
});

test('complesso Apollo: rampa e razzo condividono la scena, distacco e fallback restano disponibili',t=>{
  const {w,m,start}=boot(t);start();const launches=[],rockets=[];
  w.MSSaturnV={drawLaunch:(c,width,height,alt,time,flags)=>{launches.push({alt,flags});return true;},draw:(...args)=>{rockets.push(args);return true;},dispose(){}};
  m.draw(1);assert.equal(launches.length,1);assert.equal(rockets.length,0);
  m.S.scene='liftoff';m.S.alt=.25;m.S.flags.liftoff=1;m.draw(2);
  assert.equal(launches[1].alt,.25);assert.equal(launches[1].flags.liftoff,1);
  m.S.scene='sep';m.draw(3);assert.equal(launches.length,2);assert.equal(rockets.length,1);
  m.S.scene='pad';w.MSSaturnV.drawLaunch=()=>false;m.draw(4);assert.equal(rockets.length,2);
});

test('orbita lunare: LEM e Apollo usano due modelli 3D distinti',t=>{
  const {w,m,start}=boot(t);start();const models=[];
  w.MSSaturnV={draw:(c,x,y,s,options)=>{models.push(options);return true;},dispose(){}};
  m.S.scene='lunarOrbit';m.S.flags.lemDetached=1;m.draw(1);
  assert.equal(models.length,2);assert.equal(models[0].capsule,true);assert.equal(models[1].lemOnly,true);
  models.length=0;m.S.scene='rientro';m.S.flags.para=1;m.draw(2);
  assert.equal(models.length,1);assert.equal(models[0].capsule,true);
});

test('Apollo usa celle a combustibile: nessun comando per pannelli solari',t=>{
  const {m,start,tap,flush,$}=boot(t);start();m.phaseStart(4);flush();
  assert.equal(m.PANNELLI.solari,undefined);assert.equal(m.PANNELLI.energia.lab,'ENERGIA');
  assert.ok(m.FASI.every(f=>!f.pans.includes('solari')&&f.orders.every(o=>!o.t.includes('PANNELLI SOLARI'))));
  m.S.idx=1;m.showOrder();tap('energia');assert.equal(m.S.flags.energia,1);
  assert.equal(m.S.flags.solari,undefined);assert.match(m.IMPREVISTI[2].card.txt,/CELLE A COMBUSTIBILE/);
});

test('modulo di servizio: distacco solo su comando, prima di scudo e paracadute',t=>{
  const {m,start,tap,flush}=boot(t);start();
  for(let phase=3;phase<=7;phase++){m.phaseStart(phase);flush();assert.equal(m.S.flags.serviceSeparated,undefined);}
  const detach=m.S.orders.findIndex(o=>o.set&&o.set.serviceSeparated);
  assert.ok(detach>0);assert.ok(detach<m.S.orders.findIndex(o=>o.set&&o.set.scudo));
  m.S.idx=detach;m.showOrder();tap('gancio');assert.equal(m.S.flags.serviceSeparated,undefined);
  tap('motori');assert.equal(m.S.flags.serviceSeparated,undefined);tap('gancio');
  assert.equal(m.S.flags.serviceSeparated,1);assert.equal(m.S.flags.motori,0);
  m.update(.5);assert.equal(m.S.flags.serviceSepT,.5);
  m.phaseStart(7);flush();assert.equal(m.S.flags.serviceSeparated,undefined);
});

test('LEM: allunaggio, risalita, riaggancio e trasferimento prima dello sgancio',t=>{
  const {m,start,tap,flush}=boot(t);start();m.phaseStart(6);flush();
  assert.equal(m.S.flags.lemDocked,1);assert.equal(m.S.flags.lemDetached,1);
  const applyUntil=flag=>{
    let guard=0;
    while(!m.S.flags[flag]&&guard++<40){
      const o=m.S.orders[m.S.idx];assert.ok(o);tap(o.seq?o.seq[m.S.seqIdx]:o.ok);
      if(m.S.state==='anim')flush();
    }
    assert.equal(m.S.flags[flag],1);
  };
  applyUntil('landed');assert.equal(m.S.flags.serviceSeparated,undefined);
  applyUntil('samples');applyUntil('lemAscent');assert.equal(m.S.flags.landed,1);
  applyUntil('lemRedocked');assert.equal(m.S.flags.lemDetached,0);
  applyUntil('samplesTransferred');assert.equal(m.S.flags.crewInLem,0);
  applyUntil('lemJettisoned');assert.equal(m.S.flags.lemDocked,0);assert.equal(m.S.flags.serviceSeparated,undefined);
  m.phaseStart(7);flush();assert.equal(m.S.flags.lemJettisoned,1);assert.equal(m.S.flags.serviceSeparated,undefined);
});

test('Saturn V: tre stadi, riaccensione, separazione e recupero del LEM nell’ordine corretto',t=>{
  const {m,start,tap,flush}=boot(t);start();m.phaseStart(3);flush();
  function completePhaseOrders(){let guard=0;while(m.S.state==='order'&&guard++<30){const o=m.S.orders[m.S.idx];tap(o.seq?o.seq[m.S.seqIdx]:o.ok);if(m.S.state==='anim')flush();}}
  completePhaseOrders();assert.equal(m.S.flags.sep,1);assert.equal(m.S.flags.secondSeparated,1);assert.equal(m.S.flags.thirdSeparated,undefined);
  m.phaseStart(4);flush();m.S.emgAt=-1;const orders=m.S.orders;
  const separation=orders.findIndex(o=>o.set&&o.set.thirdSeparated),docking=orders.findIndex(o=>o.set&&o.set.lemDocked),extraction=orders.findIndex(o=>o.set&&o.set.lemExtracted);
  assert.ok(orders.findIndex(o=>o.set&&o.set.tli)<separation);assert.ok(separation<docking&&docking<extraction);
  assert.equal(m.S.flags.thirdSeparated,undefined);
  m.S.idx=separation;m.showOrder();tap('radio');assert.equal(m.S.flags.thirdSeparated,undefined);tap('gancio');
  assert.equal(m.S.flags.thirdSeparated,1);assert.equal(m.S.flags.lemExtracted,undefined);flush();
  tap('motori');tap('gancio');assert.equal(m.S.flags.lemDocked,1);assert.equal(m.S.flags.thirdDiscarded,undefined);flush();
  tap('gancio');assert.equal(m.S.flags.lemExtracted,1);assert.equal(m.S.flags.thirdDiscarded,1);
  m.phaseStart(5);flush();assert.equal(m.S.flags.secondSeparated,1);assert.equal(m.S.flags.thirdSeparated,1);assert.equal(m.S.flags.lemExtracted,1);assert.equal(m.S.flags.serviceSeparated,undefined);
  m.phaseStart(4);flush();assert.equal(m.S.flags.thirdSeparated,undefined);assert.equal(m.S.flags.lemDocked,undefined);
});
test('la separazione del terzo stadio disegna sia S-IVB sia Apollo',t=>{
  const {w,m,start}=boot(t);start();const models=[];w.MSSaturnV={draw:(c,x,y,s,o)=>{models.push(o);return true;},dispose(){}};
  m.S.scene='orbit';m.S.flags.secondSeparated=1;m.draw(0);assert.equal(models.length,1);assert.equal(models[0].upperOnly,true);
  models.length=0;m.S.flags.thirdSeparated=1;m.S.flags.thirdSepT=2;m.draw(1);
  assert.equal(models.length,2);assert.equal(models[0].thirdStage,true);assert.equal(models[1].capsule,true);
});
