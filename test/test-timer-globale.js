/* Test senza dipendenze: timer globale condiviso tra tutti i giochi */
const fs=require('fs'),path=require('path'),vm=require('vm');
const DIR=path.resolve(__dirname,'..');
const timerScript=fs.readFileSync(path.join(DIR,'js','timer-globale.js'),'utf8');
const timerCss=fs.readFileSync(path.join(DIR,'css','stile.css'),'utf8');

let pass=0,fail=0;
function ok(condition,message){
  if(condition){pass++;console.log('  ✓ '+message);}
  else{fail++;console.log('  ✗ FAIL: '+message);}
}

function boot(saved,now=1_000_000,savedUi){
  const elementListeners={};
  const elements={};
  ['playTimer','playTimerDrag','playTimerValue','playTimerHide','playTimerRestore','playTimerNotice','playTimerNoticeTitle','playTimerNoticeBody','playTimerDismiss','modeTimerLabel','modeTimerActiveControls','modeTimerInactiveControls','modeTimerStop','modeTimerAdd','modeTimerExactLabel','modeTimerExact','modeTimerStart'].forEach(id=>{
    const classes=new Set();
    elements[id]={
      id,hidden:id!=='playTimerValue',textContent:'',value:'',attributes:{},title:'',disabled:false,
      style:{setProperty(name,value){this[name]=value;}},
      classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)},
      setAttribute(name,value){this.attributes[name]=value;},
      addEventListener(type,handler){(elementListeners[id]||(elementListeners[id]={}))[type]=handler;},
      getBoundingClientRect(){return {left:Number.parseFloat(this.style.left)||200,top:Number.parseFloat(this.style.top)||400,width:112,height:41};},
      setPointerCapture(){},releasePointerCapture(){},
      trigger(type,event={}){const handler=elementListeners[id]&&elementListeners[id][type];if(handler)handler(Object.assign({target:this,preventDefault(){}},event));},
      click(){this.trigger('click');}
    };
  });
  const documentListeners={};
  const storage={},uiStorage={};
  if(saved) storage.gabri_play_timer_v1=JSON.stringify(saved);
  if(savedUi) uiStorage.gabri_play_timer_ui_v1=JSON.stringify(savedUi);
  const sessionStorage={
    getItem:key=>Object.prototype.hasOwnProperty.call(storage,key)?storage[key]:null,
    setItem:(key,value)=>{storage[key]=String(value);}
  };
  const localStorage={
    getItem:key=>Object.prototype.hasOwnProperty.call(uiStorage,key)?uiStorage[key]:null,
    setItem:(key,value)=>{uiStorage[key]=String(value);}
  };
  class FakeDate extends Date{static now(){return now;}}
  const document={
    hidden:false,activeElement:null,documentElement:{clientWidth:800,clientHeight:600},
    getElementById:id=>elements[id],
    addEventListener(type,handler){documentListeners[type]=handler;}
  };
  const windowListeners={};
  const window={
    innerWidth:800,innerHeight:600,
    addEventListener(type,handler){windowListeners[type]=handler;},
    AudioContext:function(){return {state:'running',currentTime:0,destination:{},createOscillator:()=>({frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}),createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};}
  };
  const context={window,document,sessionStorage,localStorage,Date:FakeDate,JSON,Number,String,Math,setInterval:()=>1,clearInterval:()=>{}};
  vm.runInNewContext(timerScript,context);
  return {window,elements,storage,uiStorage,documentListeners,windowListeners};
}

console.log('TEST TIMER — avvio dalla scelta di un gioco');
let app=boot();
app.documentListeners.click({target:{closest:selector=>selector==='.modeBtn'?{}:null}});
ok(app.window.GabriPlayTimer.active,'il timer parte al primo gioco scelto');
ok(app.window.GabriPlayTimer.durationMinutes===20,'la sessione dura 20 minuti');
ok(!app.elements.playTimer.hidden,'il contatore globale diventa visibile');
ok(app.elements.playTimerValue.textContent==='20:00','il tempo iniziale è mostrato nel formato mm:ss');
ok(timerCss.includes('right:max(14px')&&timerCss.includes('bottom:max(14px'),'la posizione iniziale è in basso a destra');
ok(timerCss.includes('conic-gradient(var(--timer-color) var(--timer-progress)'),'un anello mostra visivamente il tempo residuo');
ok(app.elements.playTimer.style['--timer-progress']==='100.00%','l’indicatore parte pieno');

console.log('TEST TIMER — configurazione dalla home');
let settings=boot();
ok(settings.elements.modeTimerLabel.textContent.includes('20:00'),'la home mostra il tempo pronto a partire');
settings.documentListeners.click({target:{closest:selector=>selector==='.modeBtn'?{}:null}});
ok(!settings.elements.modeTimerActiveControls.hidden&&settings.elements.modeTimerInactiveControls.hidden,'quando è attivo la home mostra soltanto i comandi attivi');
settings.elements.playTimerHide.click();
settings.elements.modeTimerStop.click();
ok(!settings.window.GabriPlayTimer.active&&settings.elements.playTimer.hidden,'Ferma timer congela e nasconde il contatore');
ok(settings.elements.modeTimerActiveControls.hidden&&!settings.elements.modeTimerInactiveControls.hidden,'da fermo compaiono i comandi di regolazione');
settings.elements.modeTimerAdd.click();
ok(settings.window.GabriPlayTimer.remainingMs===25*60*1000,'da fermo si possono aggiungere cinque minuti');
settings.elements.modeTimerExact.value='12';
settings.elements.modeTimerStart.click();
ok(settings.window.GabriPlayTimer.remainingMs===12*60*1000,'Attiva applica direttamente il valore preciso');
ok(JSON.parse(settings.uiStorage.gabri_play_timer_ui_v1).presetMinutes===12,'il valore preciso viene ricordato');
ok(settings.window.GabriPlayTimer.active&&!settings.elements.playTimer.hidden,'riattivandolo il timer torna subito visibile anche se era nascosto');
ok(settings.elements.playTimerValue.textContent==='12:00','il timer riparte dal valore impostato');

console.log('TEST TIMER — trascinamento e visibilità');
app.elements.playTimerDrag.trigger('pointerdown',{pointerId:4,button:0,clientX:210,clientY:410});
app.elements.playTimerDrag.trigger('pointermove',{pointerId:4,clientX:270,clientY:440});
app.elements.playTimerDrag.trigger('pointerup',{pointerId:4,clientX:270,clientY:440});
ok(app.elements.playTimer.style.left==='260px'&&app.elements.playTimer.style.top==='430px','il timer segue il trascinamento');
ok(JSON.parse(app.uiStorage.gabri_play_timer_ui_v1).left===260,'la nuova posizione viene ricordata');
app.elements.playTimerHide.click();
ok(app.elements.playTimer.hidden&&!app.elements.playTimerRestore.hidden,'il timer può essere nascosto lasciando un richiamo discreto');
app.elements.playTimerRestore.click();
ok(!app.elements.playTimer.hidden&&app.elements.playTimerRestore.hidden,'il timer può essere mostrato di nuovo');

console.log('TEST TIMER — persistenza nella stessa sessione');
const saved=JSON.parse(app.storage.gabri_play_timer_v1);
let restored=boot(saved);
ok(restored.window.GabriPlayTimer.active,'il timer continua dopo un ricaricamento');
ok(!restored.elements.playTimer.hidden,'il contatore restaurato resta visibile');

console.log('TEST TIMER — scadenza non blocca il gioco');
let expired=boot({endAt:999_999,notified:false});
ok(expired.elements.playTimer.hidden,'il piccolo contatore sparisce allo scadere');
ok(!expired.elements.playTimerNotice.hidden,'compare il messaggio di pausa');
ok(expired.elements.playTimerNoticeTitle.textContent.includes('abbastanza'),'il messaggio parla direttamente a Gabriele');
ok(!Object.values(expired.elements).some(element=>element.disabled),'il timer non disabilita nessun comando del gioco');
expired.elements.playTimerDismiss.click();
ok(expired.elements.playTimerNotice.hidden,'Gabriele può chiudere il solo avviso');

console.log('\n'+pass+' passati, '+fail+' falliti');
process.exit(fail?1:0);
