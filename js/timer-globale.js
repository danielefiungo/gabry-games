/* ============================================================
   TIMER GLOBALE DELLA SESSIONE
   Un solo contatore per tutti i giochi. Può essere fermato,
   regolato dalla home e riattivato senza perdere il residuo.
   ============================================================ */
(function(root){
  'use strict';

  const DEFAULT_MINUTES=20;
  const ADD_MINUTES=5;
  const MAX_MINUTES=180;
  const STORAGE_KEY='gabri_play_timer_v1';
  const UI_STORAGE_KEY='gabri_play_timer_ui_v1';
  const tickEvery=1000;
  let uiState=readUiState();
  let state=readState();
  let tickId=0;
  let audioContext=null;
  let pendingSound=false;
  let dragState=null;

  const timer=document.getElementById('playTimer');
  const timerDrag=document.getElementById('playTimerDrag');
  const timerValue=document.getElementById('playTimerValue');
  const timerHide=document.getElementById('playTimerHide');
  const timerRestore=document.getElementById('playTimerRestore');
  const notice=document.getElementById('playTimerNotice');
  const noticeTitle=document.getElementById('playTimerNoticeTitle');
  const noticeBody=document.getElementById('playTimerNoticeBody');
  const dismiss=document.getElementById('playTimerDismiss');
  const homeLabel=document.getElementById('modeTimerLabel');
  const homeActive=document.getElementById('modeTimerActiveControls');
  const homeInactive=document.getElementById('modeTimerInactiveControls');
  const homeStop=document.getElementById('modeTimerStop');
  const homeAdd=document.getElementById('modeTimerAdd');
  const homeExactLabel=document.getElementById('modeTimerExactLabel');
  const homeExact=document.getElementById('modeTimerExact');
  const homeStart=document.getElementById('modeTimerStart');

  function normaliseMinutes(value){
    const number=Math.round(Number(value));
    return Number.isFinite(number)?Math.max(1,Math.min(MAX_MINUTES,number)):DEFAULT_MINUTES;
  }

  function minutesMs(minutes){return normaliseMinutes(minutes)*60*1000;}

  function readUiState(){
    try{
      const saved=JSON.parse(localStorage.getItem(UI_STORAGE_KEY)||'null');
      if(saved) return {
        left:Number.isFinite(saved.left)?saved.left:null,
        top:Number.isFinite(saved.top)?saved.top:null,
        hidden:!!saved.hidden,
        presetMinutes:normaliseMinutes(saved.presetMinutes||saved.durationMinutes),
        legacyAutoStart:saved.enabled!==false
      };
    }catch(_){/* usa posizione e durata iniziali */}
    return {left:null,top:null,hidden:false,presetMinutes:DEFAULT_MINUTES,legacyAutoStart:true};
  }

  function readState(){
    try{
      const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null');
      if(saved&&saved.version===2){
        return {
          version:2,
          running:!!saved.running,
          endAt:Number.isFinite(saved.endAt)?saved.endAt:0,
          remainingMs:Number.isFinite(saved.remainingMs)?Math.max(0,saved.remainingMs):minutesMs(uiState.presetMinutes),
          initialMs:Number.isFinite(saved.initialMs)?Math.max(1,saved.initialMs):minutesMs(uiState.presetMinutes),
          notified:!!saved.notified,
          autoStart:!!saved.autoStart
        };
      }
      /* Migrazione dalla prima versione del timer. */
      if(saved&&Number.isFinite(saved.endAt)){
        const initial=minutesMs(saved.durationMinutes||uiState.presetMinutes);
        return {
          version:2,
          running:saved.endAt>0,
          endAt:saved.endAt,
          remainingMs:Math.max(0,saved.endAt-Date.now()),
          initialMs:initial,
          notified:!!saved.notified,
          autoStart:saved.endAt?false:uiState.legacyAutoStart
        };
      }
    }catch(_){/* crea una nuova sessione pronta a partire */}
    const initial=minutesMs(uiState.presetMinutes);
    return {version:2,running:false,endAt:0,remainingMs:initial,initialMs:initial,notified:false,autoStart:true};
  }

  function saveState(){
    try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){/* il timer continua in memoria */}
  }

  function saveUiState(){
    const saved={left:uiState.left,top:uiState.top,hidden:uiState.hidden,presetMinutes:uiState.presetMinutes};
    try{localStorage.setItem(UI_STORAGE_KEY,JSON.stringify(saved));}catch(_){/* la preferenza resta valida fino al ricaricamento */}
  }

  function isEnglish(){
    try{return typeof root.LI==='function'&&root.LI()===1;}catch(_){return false;}
  }

  function copy(){
    return isEnglish()?{
      title:'You have played enough!',body:'Great work. Now it is time for a break.',dismiss:'Okay 😊',
      remaining:'Play time remaining',move:'Drag to move the timer',hide:'Hide the timer',show:'Show the timer',
      running:'⏱ Timer running',stopped:'⏱ Timer stopped',stop:'Stop timer',add:'+5 min',exact:'Minutes',
      start:'Start timer'
    }:{
      title:'Hai giocato abbastanza!',body:'Hai fatto un ottimo lavoro. Ora è il momento di una pausa.',dismiss:'Va bene 😊',
      remaining:'Tempo di gioco rimasto',move:'Trascina per spostare il timer',hide:'Nascondi il timer',show:'Mostra il timer',
      running:'⏱ Timer attivo',stopped:'⏱ Timer fermo',stop:'Ferma timer',add:'+5 min',exact:'Minuti',
      start:'Attiva timer'
    };
  }

  function formatRemaining(ms){
    const seconds=Math.max(0,Math.ceil(ms/1000));
    const minutes=Math.floor(seconds/60);
    return String(minutes).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }

  function remainingNow(){
    return state.running?Math.max(0,state.endAt-Date.now()):Math.max(0,state.remainingMs);
  }

  function runningNow(){return state.running&&state.endAt>Date.now();}

  function setTimerPosition(left,top,persist){
    const rect=timer.getBoundingClientRect();
    const viewportWidth=root.innerWidth||document.documentElement.clientWidth||320;
    const viewportHeight=root.innerHeight||document.documentElement.clientHeight||480;
    const width=rect.width||112,height=rect.height||41;
    const x=Math.max(8,Math.min(left,viewportWidth-width-8));
    const y=Math.max(8,Math.min(top,viewportHeight-height-8));
    timer.style.left=x+'px';timer.style.top=y+'px';timer.style.right='auto';timer.style.bottom='auto';
    uiState.left=x;uiState.top=y;
    if(persist) saveUiState();
  }

  function updateTimerControls(labels){
    timerDrag.setAttribute('aria-label',labels.move);timerDrag.title=labels.move;
    timerHide.setAttribute('aria-label',labels.hide);timerHide.title=labels.hide;
    timerRestore.setAttribute('aria-label',labels.show);timerRestore.title=labels.show;
  }

  function applyVisibility(){
    const active=runningNow();
    timer.hidden=!active||uiState.hidden;
    timerRestore.hidden=!active||!uiState.hidden;
    if(active&&!uiState.hidden&&Number.isFinite(uiState.left)&&Number.isFinite(uiState.top)){
      setTimerPosition(uiState.left,uiState.top,false);
    }
  }

  function refreshHome(){
    if(!homeLabel||!homeActive||!homeInactive) return;
    const labels=copy();
    const remaining=remainingNow();
    const active=runningNow();
    homeLabel.textContent=(active?labels.running:labels.stopped)+' · '+formatRemaining(remaining);
    homeActive.hidden=!active;
    homeInactive.hidden=active;
    if(homeStop) homeStop.textContent=labels.stop;
    if(homeAdd){homeAdd.textContent=labels.add;homeAdd.disabled=remaining>=minutesMs(MAX_MINUTES);}
    if(homeExactLabel) homeExactLabel.textContent=labels.exact;
    if(homeStart) homeStart.textContent=labels.start;
    if(homeExact&&!active&&document.activeElement!==homeExact){
      homeExact.value=String(Math.max(1,Math.ceil(remaining/60000)||uiState.presetMinutes));
    }
  }

  function render(){
    if(!state.running){applyVisibility();refreshHome();return;}
    const remaining=remainingNow();
    if(remaining<=0){expire();return;}
    const labels=copy();
    const progress=Math.max(0,Math.min(1,remaining/Math.max(1,state.initialMs)));
    const color=progress>.5?'#72e6a5':progress>.2?'#ffe15c':'#ff8b73';
    timerValue.textContent=formatRemaining(remaining);
    timer.setAttribute('aria-label',labels.remaining+': '+formatRemaining(remaining));
    timer.style.setProperty('--timer-progress',(progress*100).toFixed(2)+'%');
    timer.style.setProperty('--timer-color',color);
    updateTimerControls(labels);
    applyVisibility();
    refreshHome();
  }

  function schedule(){
    clearInterval(tickId);
    render();
    if(runningNow()) tickId=setInterval(render,tickEvery);
  }

  function createAudioContext(){
    if(audioContext) return audioContext;
    const AudioCtor=root.AudioContext||root.webkitAudioContext;
    if(!AudioCtor) return null;
    try{audioContext=new AudioCtor();}catch(_){audioContext=null;}
    return audioContext;
  }

  function playChime(){
    const ctx=createAudioContext();
    if(!ctx) return false;
    const begin=()=>{
      try{
        const now=ctx.currentTime;
        [523.25,659.25,783.99].forEach((frequency,index)=>{
          const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=now+index*.18;
          oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
          gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.075,start+.035);
          gain.gain.exponentialRampToValueAtTime(.0001,start+.42);
          oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+.44);
        });
        pendingSound=false;return true;
      }catch(_){return false;}
    };
    if(ctx.state==='suspended'&&typeof ctx.resume==='function'){
      try{
        const resumed=ctx.resume();
        if(resumed&&typeof resumed.then==='function') resumed.then(begin).catch(()=>{});else return begin();
      }catch(_){return false;}
      return true;
    }
    return begin();
  }

  function expire(){
    clearInterval(tickId);
    const shouldSound=!state.notified;
    state.running=false;state.endAt=0;state.remainingMs=0;state.autoStart=false;state.notified=true;
    saveState();
    timer.hidden=true;timerRestore.hidden=true;
    const labels=copy();
    noticeTitle.textContent=labels.title;noticeBody.textContent=labels.body;dismiss.textContent=labels.dismiss;
    notice.hidden=false;
    refreshHome();
    if(shouldSound){pendingSound=true;playChime();}
  }

  function activate(){
    if(runningNow()){schedule();return;}
    let remaining=remainingNow();
    if(remaining<=0) remaining=minutesMs(uiState.presetMinutes);
    /* Una riattivazione esplicita deve sempre rendere visibile il timer. */
    uiState.hidden=false;
    saveUiState();
    state.running=true;state.endAt=Date.now()+remaining;state.remainingMs=remaining;
    state.initialMs=Math.max(1,remaining);state.notified=false;state.autoStart=false;
    notice.hidden=true;
    saveState();createAudioContext();schedule();refreshHome();
  }

  function stop(){
    if(!state.running) return;
    const remaining=remainingNow();
    if(remaining<=0){expire();return;}
    clearInterval(tickId);
    state.running=false;state.endAt=0;state.remainingMs=remaining;state.autoStart=false;
    saveState();applyVisibility();refreshHome();
  }

  function addMinutes(){
    if(state.running) return;
    state.remainingMs=Math.min(minutesMs(MAX_MINUTES),remainingNow()+minutesMs(ADD_MINUTES));
    state.initialMs=Math.max(1,state.remainingMs);state.notified=false;
    saveState();notice.hidden=true;refreshHome();
  }

  function resetExact(){
    if(state.running||!homeExact) return;
    const minutes=normaliseMinutes(homeExact.value);
    uiState.presetMinutes=minutes;
    state.remainingMs=minutesMs(minutes);state.initialMs=state.remainingMs;state.notified=false;
    saveUiState();saveState();notice.hidden=true;refreshHome();
  }

  function activateFromHome(){
    resetExact();
    activate();
  }

  function onFirstGameChoice(event){
    const target=event.target&&event.target.closest?event.target.closest('.modeBtn'):null;
    if(target&&state.autoStart) activate();
  }

  function unlockSound(){
    const ctx=createAudioContext();
    if(ctx&&ctx.state==='suspended'&&typeof ctx.resume==='function'){try{ctx.resume();}catch(_){}}
    if(pendingSound) playChime();
  }

  function hideTimer(){uiState.hidden=true;saveUiState();applyVisibility();}
  function restoreTimer(){uiState.hidden=false;saveUiState();applyVisibility();}

  function dragStart(event){
    if(event.button!==undefined&&event.button!==0) return;
    const rect=timer.getBoundingClientRect();
    dragState={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:rect.left,top:rect.top};
    timer.classList.add('dragging');
    if(timerDrag.setPointerCapture&&event.pointerId!==undefined) timerDrag.setPointerCapture(event.pointerId);
    if(event.preventDefault) event.preventDefault();
  }

  function dragMove(event){
    if(!dragState||(event.pointerId!==undefined&&event.pointerId!==dragState.pointerId)) return;
    setTimerPosition(dragState.left+event.clientX-dragState.startX,dragState.top+event.clientY-dragState.startY,false);
    if(event.preventDefault) event.preventDefault();
  }

  function dragEnd(event){
    if(!dragState||(event.pointerId!==undefined&&event.pointerId!==dragState.pointerId)) return;
    if(timerDrag.releasePointerCapture&&event.pointerId!==undefined){try{timerDrag.releasePointerCapture(event.pointerId);}catch(_){}}
    timer.classList.remove('dragging');saveUiState();dragState=null;
  }

  function moveWithKeyboard(event){
    const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const direction=directions[event.key];
    if(!direction) return;
    const rect=timer.getBoundingClientRect(),step=event.shiftKey?30:10;
    setTimerPosition(rect.left+direction[0]*step,rect.top+direction[1]*step,true);event.preventDefault();
  }

  document.addEventListener('click',onFirstGameChoice,true);
  document.addEventListener('pointerdown',unlockSound,true);
  timerDrag.addEventListener('pointerdown',dragStart);
  timerDrag.addEventListener('pointermove',dragMove);
  timerDrag.addEventListener('pointerup',dragEnd);
  timerDrag.addEventListener('pointercancel',dragEnd);
  timerDrag.addEventListener('keydown',moveWithKeyboard);
  timerHide.addEventListener('click',hideTimer);
  timerRestore.addEventListener('click',restoreTimer);
  if(homeStop) homeStop.addEventListener('click',stop);
  if(homeAdd) homeAdd.addEventListener('click',addMinutes);
  if(homeStart) homeStart.addEventListener('click',activateFromHome);
  if(homeExact) homeExact.addEventListener('keydown',event=>{if(event.key==='Enter')activateFromHome();});
  dismiss.addEventListener('click',()=>{notice.hidden=true;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.running)schedule();});
  root.addEventListener('resize',()=>{
    if(Number.isFinite(uiState.left)&&Number.isFinite(uiState.top))setTimerPosition(uiState.left,uiState.top,true);
  });

  if(state.running) schedule();
  else{applyVisibility();refreshHome();}

  root.GabriPlayTimer={
    start:activate,stop,refreshHome,
    get active(){return runningNow();},
    get remainingMs(){return remainingNow();},
    get durationMinutes(){return Math.ceil(remainingNow()/60000);}
  };
})(window);
