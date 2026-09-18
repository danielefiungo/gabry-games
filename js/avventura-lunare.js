/* Avventura FPV: un solo loop, tempo di gioco sospeso durante pause e perdita del focus. */
(function () {
  'use strict';
  const M=window.LunarAdventureModel, SAVE='gabri_lunar_adventure_v1';
  let host, state, frame=0, last=0, paused=false, active=false, back, checkpoint=null;
  const $=id=>host?.querySelector('#'+id);
  const stopVoice=()=>{if(typeof stopSpeak==='function') stopSpeak();};
  const say=text=>{stopVoice();if(typeof speak==='function') speak(text);};
  const partNames={antenna:'Antenna',batteria:'Batteria',portello:'Portello'};
  const text=(id,value)=>{if($(id)) $(id).textContent=value;};
  let view=null;
  function scene() {
    const d=M.current(state);
    host.dataset.phase=d.phase;host.dataset.step=state.index;host.dataset.mode=state.mode;
    $('laViewport').dataset.phase=d.phase;
    text('laLetter',d.key);
    text('laCueLabel',({jump:'SALTA',bridge:'ATTRAVERSA',climb:'SCAVALCA',dodge:'AL RIPARO',collect:'RECUPERA',walk:'AL RAZZO',fit:'INSERISCI',screw:'AVVITA',connect:'COLLEGA',launch:'DECOLLA',fly:'ATTRAVERSA'})[d.type]);
    text('laInstruction',d.label);
    text('laFeedback',d.danger?'Meteorite in arrivo. Trova la lettera: la bolla ti protegge.':'Premi la lettera sul visore per muoverti.');
    text('laChapter',d.phase==='explore'?'01 / ESPLORA':d.phase==='build'?'02 / RIPARA':'03 / VERSO CASA');
    text('laViewLabel',d.phase==='flight'?'CABINA • GABRI 01':'VISORE • ASTRONAUTA');
    $('laInventory').innerHTML=Object.keys(partNames).map(p=>`<span class="${state.parts.includes(p)?'la-found':''}">${state.installed.includes(p)?'✓':state.parts.includes(p)?'◆':'◇'} ${partNames[p]}</span>`).join('');
    host.querySelectorAll('[data-la-key]').forEach(k=>k.classList.toggle('la-key-lit',k.dataset.laKey===d.key));
    host.querySelectorAll('[data-la-phase]').forEach(k=>k.classList.toggle('la-phase-current',k.dataset.laPhase===d.phase));
    view.build(state);paint();
  }
  function paint(){host.dataset.mode=state.mode;view?.draw(state);}
  function saveCheckpoint(){checkpoint=state&&!state.completed?JSON.parse(JSON.stringify({...state,mode:'ready',elapsed:0,motion:0})):null;}
  function suspend() {
    if(!active||state.completed||paused)return;
    paused=true;last=0;stopVoice();$('laPauseCover').hidden=false;text('laPause','Riprendi · Spazio');
  }
  function togglePause() {
    if(!active||state.completed||document.hidden)return;
    if(!paused){suspend();return;}
    if(timerOpen())return;
    paused=false;last=0;$('laPauseCover').hidden=true;text('laPause','Pausa · Spazio');
  }
  function timerOpen(){const n=document.getElementById('playTimerNotice');return n&&!n.hidden;}
  function loop(now) {
    if(!active||state.completed)return;
    const dt=last?Math.min(60,now-last):0;last=now;
    if(document.hidden||timerOpen())suspend();
    if(!paused){
      const result=M.tick(state,dt);
      if(result==='collision') {text('laFeedback','La bolla ti riporta al sicuro. Hai ancora tutti i pezzi!');stopVoice();}
      if(result==='next'||result==='retry') {saveCheckpoint();scene();}
      if(result==='win'){win();return;}
      paint();
    }
    frame=requestAnimationFrame(loop);
  }
  function win() {
    checkpoint=null;stopVoice();view?.dispose();view=null;let stored=true;
    try{localStorage.setItem(SAVE,JSON.stringify({completed:true}));}catch(_){stored=false;}
    host.dataset.mode='won';
    $('laStage').innerHTML=`<div class="la-win"><div class="la-home-earth">🌍</div><p class="tk-eyebrow">MISSIONE COMPIUTA</p><h2>Bentornato, Gabriele!</h2><p>Hai esplorato la Luna, costruito il razzo<br>e attraversato i meteoriti. Sei a casa!</p><div class="la-trophy">✦ F &nbsp; J &nbsp; D &nbsp; K ✦</div><p class="tk-footnote">${stored?'La tua avventura è salvata su questo dispositivo.':'Missione completata. Salvataggio non disponibile.'}</p><button class="tk-button tk-primary" id="laReplay">Gioca di nuovo</button> <button class="tk-button" id="laReturn">Menu Apollo</button></div>`;
    text('laInstruction','La Terra ti dà il benvenuto');text('laFeedback','Tutti e tre i componenti sono arrivati con te.');
    $('laPause').disabled=true;$('laListen').disabled=true;
    $('laReplay').onclick=()=>start(host,back,false);$('laReturn').onclick=back;$('laReplay').focus({preventScroll:true});
  }
  function start(container,onBack,resume=true) {
    stop();host=container;back=onBack;state=resume&&checkpoint?JSON.parse(JSON.stringify(checkpoint)):M.create();
    active=true;paused=false;last=0;
    host.innerHTML=`<div class="la-heading"><div><p class="tk-eyebrow">APOLLO AI COMANDI · PRIMA PERSONA</p><h1>Un razzo per tornare a casa</h1></div><button id="laMenu" class="tk-button">Menu Apollo</button></div><nav class="la-route" aria-label="Le tre tappe"><span data-la-phase="explore">01 &nbsp; Esplora</span><i></i><span data-la-phase="build">02 &nbsp; Ripara</span><i></i><span data-la-phase="flight">03 &nbsp; Torna a casa</span></nav><div class="la-mission-bar"><strong id="laChapter"></strong><div id="laInventory" aria-label="Componenti recuperati"></div></div><div id="laStage" class="la-stage"><div id="laViewport" class="la-viewport" role="img" aria-labelledby="laInstruction laLetter laFeedback"><div class="la-visor-rim"></div><div class="la-visor-glint"></div><div class="la-fpv-status"><span id="laViewLabel"></span><span>● O₂ 100% &nbsp; · &nbsp; BOLLA PRONTA</span></div><div class="la-crosshair" aria-hidden="true">+</div><div id="laCue" class="la-world-cue"><small id="laCueLabel"></small><b id="laLetter"></b><i></i></div><div class="la-impact" aria-hidden="true"><span>BOLLA PROTETTIVA</span></div><div class="la-fpv-coordinates">LUNA / SETTORE 07 <span>GABRIELE · MISSIONE RITORNO</span></div></div><div id="laPauseCover" class="la-pause-cover" hidden><h2>Una pausa fra le stelle</h2><p>Il mondo ti aspetta.</p><button id="laResume" class="tk-button tk-primary">Riprendi · Spazio</button></div></div><div class="la-controls"><div><h2 id="laInstruction"></h2><p id="laFeedback" role="status" aria-live="polite"></p></div><div class="la-buttons"><button id="laListen" class="tk-button">Ascolta · Invio</button><button id="laPause" class="tk-button">Pausa · Spazio</button></div></div><div class="la-key-help"><div><strong>La tua mappa dei tasti</strong><p>F e J hanno un trattino. Il tasto illuminato ti aiuta.</p></div><div class="la-keyboard" aria-label="Fila centrale della tastiera">${[...'ASDFGHJKL'].map(k=>`<span data-la-key="${k}" class="${'FJDK'.includes(k)?'la-used':''}">${k}${'FJ'.includes(k)?'<i></i>':''}</span>`).join('')}</div></div><p class="tk-footnote la-note">Una lettera alla volta · Maiuscolo o minuscolo · Spazio: pausa · Invio: ascolta · Esc: menu<br>Avventura di fantasia. Nessun limite di durata; la bolla conserva i tuoi pezzi.</p>`;
    $('laMenu').onclick=back;$('laPause').onclick=togglePause;$('laResume').onclick=togglePause;
    $('laListen').onclick=()=>{suspend();say(M.current(state).label+'. Premi la lettera '+M.current(state).key);};
    try {
      view=window.LunarFPV.create($('laViewport'));
      scene();frame=requestAnimationFrame(loop);
    } catch(error) {
      view?.dispose();view=null;active=false;
      $('laViewport').innerHTML='<div class="la-render-error" role="alert">La grafica 3D non è disponibile. Ricarica la pagina con Internet e WebGL attivi.</div>';
      $('laPause').disabled=true;$('laListen').disabled=true;
    }
    $('laViewport').addEventListener('lunar-render-error',()=>{
      stop();
      $('laViewport').innerHTML='<div class="la-render-error" role="alert">La grafica 3D si è interrotta. Torna al menu e riprendi l’avventura: i pezzi sono al sicuro.</div>';
      $('laPause').disabled=true;$('laListen').disabled=true;
    });
    host.setAttribute('tabindex','-1');host.focus({preventScroll:true});
  }
  function stop(){if(active)saveCheckpoint();active=false;view?.dispose();view=null;cancelAnimationFrame(frame);frame=0;last=0;stopVoice();}
  function onKey(e) {
    if(!active||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    if(!['Escape',' ','Enter'].includes(e.key)&&!/^[a-z]$/i.test(e.key))return;
    if(timerOpen()) {suspend();return;}
    if(e.key==='Enter'&&e.target.closest?.('button'))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(e.repeat||document.hidden)return;
    if(e.key==='Escape'){back();return;}
    if(state.completed){if(e.key==='Enter')start(host,back,false);return;}
    if(e.key===' '){togglePause();return;}
    if(e.key==='Enter'){$('laListen').click();return;}
    if(paused||state.mode!=='ready')return;
    if(M.press(state,e.key)){stopVoice();text('laFeedback',({jump:'Salto!',bridge:'Attraversiamo il ponte.',climb:'Su, oltre la roccia!',dodge:'Al riparo!',collect:'Prendiamo il pezzo!',walk:'Il razzo ci aspetta.',fit:'Il pezzo entra nel suo alloggiamento.',screw:'La vite si stringe.',connect:'Collegamento riuscito!',launch:'Motori accesi. Si parte!',fly:'Passaggio trovato!'})[M.current(state).type]);paint();}
    else text('laFeedback',`Hai premuto ${e.key.toUpperCase()}. Cerca ${M.current(state).key}: il tasto è illuminato qui sotto.`);
  }
  window.addEventListener('keydown',onKey,true);
  window.addEventListener('blur',suspend);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
  window.LunarAdventure={start,stop,get active(){return active;},get resumable(){return !!checkpoint;},get completed(){try{return JSON.parse(localStorage.getItem(SAVE))?.completed===true;}catch(_){return false;}}};
})();
