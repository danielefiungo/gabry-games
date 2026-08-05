/* ============================================================
   GIBI RESCUE — interfaccia, progressi, editor e orchestrazione
   ============================================================ */
(function(root){
  'use strict';
  const D=root.GR_DATA,S=root.GR_SIM,C=root.GR_CODE;
  if(!D||!S||!C)return;
  const gr$=id=>document.getElementById(id);
  const KEY_PROGRESS='gabri_gr_progress_v1',KEY_SETTINGS='gabri_gr_settings_v1',KEY_PROJECTS='gabri_gr_projects_v1';
  const safeJSON=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch(_){return fallback;}};
  const saveJSON=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch(_){/* gioco ancora utilizzabile */}};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};

  const gr={
    on:false,mission:0,isSandbox:false,program:[],mounted:[],wires:[],measurements:[],hintLevel:0,
    runMode:'paused',sim:null,actions:[],actionIndex:0,actionTime:0,last:0,raf:0,frameAt:0,variant:0,collisions:0,currentBlock:null,
    trackTool:'obstacle',carColor:'#30aee0',
    progress:Object.assign({version:1,unlockedMission:0,stars:[],starDetail:[],unlocks:[]},safeJSON(KEY_PROGRESS,{})),
    settings:Object.assign({version:1,dashboard:'simple',reducedMotion:false,panels:{left:true,right:true}},safeJSON(KEY_SETTINGS,{})),
    projects:safeJSON(KEY_PROJECTS,[])
  };
  gr.progress.unlockedMission=Math.max(0,Math.min(11,Number(gr.progress.unlockedMission)||0));
  if(!Array.isArray(gr.progress.stars))gr.progress.stars=[];
  if(!Array.isArray(gr.projects))gr.projects=[];

  function persist(){saveJSON(KEY_PROGRESS,gr.progress);saveJSON(KEY_SETTINGS,gr.settings);saveJSON(KEY_PROJECTS,gr.projects);}
  function grSpeak(text){if(typeof root.speak==='function')root.speak(text);else if('speechSynthesis'in root){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text));}}
  function grStopSpeak(){if(typeof root.stopSpeak==='function')root.stopSpeak();else if('speechSynthesis'in root)speechSynthesis.cancel();}

  function installUI(){
    const css=document.createElement('style');css.textContent=`
      #grApp{display:none;position:fixed;inset:0;z-index:40;background:#d9f2f0;color:#19344a;font-family:Andika,system-ui,sans-serif;overflow:hidden}
      #grApp *{box-sizing:border-box}#grApp button,#grApp input,#grApp select{font:inherit}#grApp button{cursor:pointer}
      #grTop{height:64px;background:linear-gradient(100deg,#123e6c,#276da3);color:#fff;display:flex;align-items:center;gap:10px;padding:8px 12px;box-shadow:0 3px 12px #1236;position:relative;z-index:3}
      .grTopBtn{min-width:45px;height:45px;border:2px solid #ffffff88;border-radius:13px;background:#ffffff18;color:#fff;font-weight:bold;padding:5px 10px}
      #grMissionName{font-weight:bold;font-size:clamp(15px,2vw,21px);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#grMissionName small{display:block;font-size:12px;opacity:.8}
      #grLayout{height:calc(100% - 64px);display:grid;grid-template-columns:minmax(240px,29%) minmax(360px,1fr) minmax(250px,27%);gap:8px;padding:8px}
      .grPanel{background:#f9fcff;border:2px solid #9dc9d8;border-radius:18px;min-width:0;overflow:hidden;box-shadow:0 4px 14px #19415d1d;position:relative}
      #grLeft,#grRight{display:flex;flex-direction:column}.grPanelHead{padding:10px 12px;background:#e7f4f8;border-bottom:2px solid #b9dbe5;font-weight:bold;display:flex;align-items:center;justify-content:space-between;min-height:48px}
      .grMini{border:1px solid #9ebcca;border-radius:9px;background:#fff;color:#234b61;min-width:34px;min-height:32px}
      #grEditor{overflow:auto;padding:12px;flex:1}.grGoal{background:#fff8d7;border:2px solid #f2ce55;border-radius:13px;padding:10px;margin-bottom:10px;font-size:15px;line-height:1.35}.grSafety{background:#fff0e8;border-color:#eb9b65;color:#7a321b}
      #grPalette{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0 14px}.grBlock{border:0;border-radius:11px;padding:9px 8px;color:#fff;font-weight:bold;line-height:1.15;box-shadow:0 3px 0 #0003;text-align:left;min-height:49px;position:relative}.grBlock:active{transform:translateY(2px);box-shadow:none}
      .grBlock[data-cat=start]{background:#d99d08}.grBlock[data-cat=move]{background:#357bd7}.grBlock[data-cat=sensor]{background:#239a65}.grBlock[data-cat=control]{background:#df742b}.grBlock[data-cat=data]{background:#168e9c}.grBlock.ghost{opacity:.45;border:2px dashed #fff}
      #grWorkspace{min-height:120px;border:3px dashed #a8c5d1;border-radius:14px;background:#eef6f8;padding:8px}.grEmpty{color:#668697;text-align:center;padding:28px 8px}.grProgRow{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:5px;margin:5px 0}.grProgRow .grBlock{width:100%}.grRowBtn{width:31px;height:31px;border:1px solid #abc3ce;border-radius:8px;background:#fff}.grProgRow.active .grBlock{outline:5px solid #ffe14d;transform:scale(1.015)}
      .grPartGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.grPart{border:2px solid #9abfca;border-radius:14px;background:#fff;padding:10px;color:#234455;text-align:center;min-height:105px}.grPart b{display:block;font-size:14px}.grPart .em{display:block;font-size:34px}.grPart.done{background:#dff8e9;border-color:#2aa963}.grPart.done:after{content:' ✓';color:#14844a;font-weight:bold}
      .grWire{display:block;width:100%;margin:7px 0;border:2px solid #b3c7cf;border-radius:12px;background:#fff;padding:9px;text-align:left}.grWire.done{background:#e1f7e9;border-color:#2ba966}.grWire.done:after{content:'  ✓';font-weight:bold;color:#16864b}
      .grPrimary{border:0;border-radius:13px;padding:11px 16px;background:#2f9b58;color:#fff;font-weight:bold;box-shadow:0 4px 0 #1f6e3d;margin-top:10px}.grPrimary:active{transform:translateY(3px);box-shadow:none}.grSecondary{border:2px solid #8bb4c4;border-radius:12px;background:#fff;color:#245167;padding:8px 11px;font-weight:bold}
      #grCenter{display:flex;flex-direction:column;background:linear-gradient(#bfe9ff 0 25%,#9cd997 25%)}#grCanvasWrap{position:relative;flex:1;min-height:220px}#grCanvas{width:100%;height:100%;display:block;touch-action:none}
      #grGibi{position:absolute;left:12px;bottom:12px;width:92px;height:105px;background:url('assets/characters/gibi.png') center 7%/150% auto no-repeat;filter:drop-shadow(0 5px 6px #17394b55);pointer-events:none}.grSpeech{position:absolute;left:92px;bottom:18px;max-width:min(390px,65%);background:#fff;border:3px solid #477f9d;border-radius:17px;padding:8px 12px;font-size:14px;line-height:1.3;box-shadow:0 5px 15px #183c5033}.grSpeech:before{content:'';position:absolute;left:-16px;bottom:17px;border:8px solid transparent;border-right-color:#477f9d}
      #grThreshold{position:absolute;top:12px;left:12px;background:#ffffffdf;border:2px solid #e4aa25;border-radius:12px;padding:7px 10px;font-weight:bold;display:none}#grThreshold input{width:110px;vertical-align:middle}
      #grControls{min-height:65px;background:#f4fbfd;border-top:2px solid #a9ceda;display:flex;gap:7px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px}.grControl{border:2px solid #8cacba;border-radius:11px;background:#fff;color:#173c51;padding:8px 10px;font-weight:bold;min-height:42px}.grControl.run{background:#2d9f59;color:#fff;border-color:#1b7540}.grControl.pause{background:#ffcf4a;border-color:#c69019}.grControl.step{background:#3d7ee6;color:#fff;border-color:#285aae}
      #grTabs{display:flex;border-bottom:2px solid #afd0dc;background:#e8f3f7}.grTab{flex:1;border:0;border-right:1px solid #b7d2db;background:transparent;padding:10px 3px;font-size:12px;font-weight:bold;color:#355d70}.grTab.active{background:#fff;color:#176791;box-shadow:inset 0 -4px #2a91bf}
      #grUnderstand{overflow:auto;flex:1;padding:12px}.grMeter{border:2px solid #b9d3dd;border-radius:13px;padding:9px;margin:7px 0;background:#fff}.grMeter b{display:block;font-size:12px;color:#507083}.grMeter strong{font-size:21px}.grWheels{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grWheel{text-align:center;background:#edf6f8;border-radius:12px;padding:8px}.grWheel .disc{font-size:32px;display:block}.grWheel.spin .disc{animation:grSpin .5s linear infinite}@keyframes grSpin{to{transform:rotate(360deg)}}
      .grCode{font:12px/1.55 ui-monospace,SFMono-Regular,monospace;white-space:pre;overflow:auto;background:#142434;color:#d7edf5;border-radius:12px;padding:7px;counter-reset:line}.grLine{display:block;padding:0 5px;border-radius:4px}.grLine:before{counter-increment:line;content:counter(line);display:inline-block;width:25px;color:#6d8795}.grLine.active{background:#7b6418;color:#fff3a0}
      #grMap,#grIntro,#grWin,#grHelp,#grPrint{display:none;position:fixed;inset:0;z-index:50;background:rgba(9,30,49,.78);align-items:center;justify-content:center;padding:15px}.grModal{width:min(1050px,96vw);max-height:94vh;overflow:auto;background:#f8fcff;border:4px solid #78b9ce;border-radius:25px;padding:18px;text-align:center;box-shadow:0 18px 55px #0019}.grModal h1,.grModal h2{margin:4px;color:#174e75}.grMapGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:15px;text-align:left}.grChapter{background:#e9f5f8;border:2px solid #afd1dc;border-radius:18px;padding:10px}.grChapter h3{margin:2px 0 8px;color:#1f5572}.grMissionBtn{width:100%;min-height:78px;margin:5px 0;border:2px solid #b5cdd5;border-radius:13px;background:#fff;text-align:left;padding:7px;color:#173d51}.grMissionBtn.next{outline:4px solid #ffd85b}.grMissionBtn.lock{opacity:.55}.grMissionBtn b{display:block}.grMissionBtn .stars{color:#e2aa00}.grMapRoad{height:9px;background:linear-gradient(90deg,#6ecf89 var(--p),#c8d9dd var(--p));border-radius:6px;margin:10px 0}.grModalActions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}
      #grIntro .grModal{width:min(650px,94vw);position:relative;padding-left:min(190px,24vw)}.grBigGibi{position:absolute;left:8px;bottom:0;width:180px;height:210px;background:url('assets/characters/gibi.png') center 7%/150% auto no-repeat}.grIntroIcon{font-size:62px}.grConcept{background:#e7f7f0;border:2px solid #7bc7a1;border-radius:14px;padding:10px;margin:12px}.grStars{font-size:42px;letter-spacing:5px;color:#eab40c}.grStarDetail{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.grStarCard{background:#eef5f7;border:2px solid #b9d0d8;border-radius:13px;padding:8px}.grStarCard.on{background:#fff7d1;border-color:#edc342}
      #grToast{position:fixed;z-index:70;top:76px;left:50%;transform:translateX(-50%);background:#123d58;color:#fff;border:2px solid #80c9dc;border-radius:13px;padding:9px 15px;display:none;max-width:80vw;text-align:center;box-shadow:0 6px 18px #0017}
      #grProjectBar{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.grSample{border:2px solid #89b8c8;border-radius:13px;background:#fff;padding:10px;margin:7px 0;width:100%;text-align:left}.grSample.done{background:#e5f8eb;border-color:#3daa68}.grSample strong{float:right}
      #grApp :focus-visible{outline:4px solid #ffbe28!important;outline-offset:2px}@media(prefers-reduced-motion:reduce){#grApp *{animation-duration:.001ms!important;transition:none!important}}
      @media(max-width:980px){#grLayout{grid-template-columns:minmax(225px,36%) 1fr}#grRight{position:absolute;z-index:8;right:8px;top:72px;bottom:8px;width:min(390px,88vw);box-shadow:0 8px 30px #0017}#grRight.grClosed{display:none}.grMapGrid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:690px){#grTop{height:58px;padding:6px}#grLayout{height:calc(100% - 58px);display:block;padding:5px}#grCenter{height:100%}#grLeft{position:absolute;z-index:8;left:5px;top:63px;bottom:5px;width:min(390px,92vw);box-shadow:0 8px 30px #0018}#grLeft.grClosed{display:none}#grControls{min-height:106px;padding-left:83px}.grControl{font-size:12px;padding:6px}.grMapGrid{grid-template-columns:1fr 1fr}.grChapter{padding:7px}#grIntro .grModal{padding:14px}.grBigGibi{display:none}#grGibi{width:75px;height:88px}.grSpeech{left:72px;max-width:73%;font-size:12px}}
      @media print{body>*:not(#grPrint){display:none!important}#grPrint{display:block!important;position:static;background:#fff;color:#000;padding:0}.grModal{border:0;box-shadow:none;max-height:none;width:100%}.grNoPrint{display:none!important}}
    `;document.head.appendChild(css);
    document.body.insertAdjacentHTML('beforeend',`
      <section id="grApp" aria-label="Gibi Rescue">
        <header id="grTop"><button class="grTopBtn" id="grHome" aria-label="Torna ai giochi">🏠</button><button class="grTopBtn" id="grMapBtn" aria-label="Mappa missioni">🗺️</button><div id="grMissionName">Gibi Rescue</div><button class="grTopBtn" id="grVoice" aria-label="Leggi la consegna">🔊</button><button class="grTopBtn" id="grMotion" aria-label="Riduci movimento">✨</button><button class="grTopBtn" id="grToggleLeft" aria-label="Apri o chiudi blocchi">🧩</button><button class="grTopBtn" id="grToggleRight" aria-label="Apri o chiudi cruscotto">📊</button></header>
        <main id="grLayout">
          <aside class="grPanel" id="grLeft"><div class="grPanelHead"><span>🧩 COSTRUISCI E PROGRAMMA</span><button class="grMini" id="grUndo" title="Annulla">↶</button></div><div id="grEditor"></div></aside>
          <section class="grPanel" id="grCenter"><div id="grCanvasWrap"><canvas id="grCanvas"></canvas><div id="grThreshold">SOGLIA: <output id="grThresholdOut">20</output> cm<br><input id="grThresholdInput" type="range" min="10" max="40" value="20"></div><div id="grGibi"></div><div class="grSpeech" id="grSpeech">Pronto per costruire?</div></div><div id="grControls"><button class="grControl run" id="grRun">▶ ESEGUI</button><button class="grControl pause" id="grPause">⏸ PAUSA</button><button class="grControl step" id="grStep">⏭ PASSO-PASSO</button><button class="grControl" id="grRewind">⏮ RIAVVOLGI</button><button class="grControl" id="grReset">🔄 RIFAI</button><button class="grControl" id="grHint">💡 AIUTO <span id="grHintN">1</span>/3</button></div></section>
          <aside class="grPanel" id="grRight"><div id="grTabs"><button class="grTab active" data-tab="dash">CRUSCOTTO</button><button class="grTab" data-tab="gabri">CODICE DI GABRI</button><button class="grTab" data-tab="arduino">ARDUINO VERO</button></div><div id="grUnderstand"></div></aside>
        </main>
      </section>
      <div id="grMap"><div class="grModal"><h1>🚗 Gibi Rescue</h1><p>Le strade si accendono mentre l’auto impara.</p><div class="grMapRoad" id="grMapRoad"></div><div class="grMapGrid" id="grMapGrid"></div><div class="grModalActions"><button class="grSecondary" id="grMapClose">CHIUDI</button><button class="grSecondary" id="grClear">🔄 AZZERA GIBI RESCUE</button><button class="grPrimary" id="grSandbox">🧪 LABORATORIO LIBERO</button></div></div></div>
      <div id="grIntro"><div class="grModal"><div class="grBigGibi"></div><div class="grIntroIcon" id="grIntroIcon"></div><h1 id="grIntroTitle"></h1><p id="grIntroStory"></p><div class="grConcept" id="grIntroGoal"></div><div id="grIntroSafety"></div><div class="grModalActions"><button class="grSecondary" id="grIntroSpeak">🔊 ASCOLTA</button><button class="grPrimary" id="grIntroGo">INIZIAMO ➡️</button></div></div></div>
      <div id="grWin"><div class="grModal" style="width:min(650px,94vw)"><div class="grIntroIcon">🎉</div><h1>MISSIONE COMPIUTA!</h1><div class="grStars" id="grWinStars"></div><div class="grStarDetail" id="grStarDetail"></div><div class="grConcept" id="grDiscovery"></div><div class="grModalActions"><button class="grSecondary" id="grReplay">RIGIOCA</button><button class="grSecondary" id="grWinMap">MAPPA</button><button class="grPrimary" id="grNext">PROSSIMA ➡️</button></div></div></div>
      <div id="grPrint"><div class="grModal"><h1>Gibi Rescue — Scheda progetto</h1><div id="grPrintBody"></div><button class="grPrimary grNoPrint" id="grPrintNow">STAMPA</button><button class="grSecondary grNoPrint" id="grPrintClose">CHIUDI</button></div></div>
      <div id="grToast" role="status" aria-live="polite"></div><input id="grImport" type="file" accept="application/json,.gibi-rescue.json" hidden>
    `);
    bindUI();
  }

  function toast(msg,ms){const el=gr$('grToast');el.textContent=msg;el.style.display='block';clearTimeout(gr.toastTimer);gr.toastTimer=setTimeout(()=>el.style.display='none',ms||2400);}
  function mission(){
    if(!gr.isSandbox)return D.missions[gr.mission];
    const unlocked=[];D.missions.slice(0,gr.progress.unlockedMission+1).forEach(m=>(m.palette||[]).concat(m.starter||[]).forEach(id=>{if(!unlocked.includes(id))unlocked.push(id);}));
    return Object.assign({},D.missions[11],{title:'Laboratorio libero',goal:unlocked.length?'Inventa un programma con i blocchi sbloccati.':'Completa altre missioni per sbloccare i primi blocchi.',required:[],palette:unlocked,starter:[],track:'rescue'});
  }

  function showMap(){
    pause();gr$('grMapGrid').innerHTML='';
    D.chapters.forEach((ch,ci)=>{const box=document.createElement('section');box.className='grChapter';box.innerHTML=`<h3>${ch.icon} ${esc(ch.title)}</h3><small>${esc(ch.sub)}</small>`;
      D.missions.filter(m=>m.chapter===ci).forEach(m=>{const idx=m.n-1,locked=idx>gr.progress.unlockedMission,b=document.createElement('button');b.className='grMissionBtn'+(locked?' lock':idx===gr.progress.unlockedMission?' next':'');b.disabled=locked;b.innerHTML=`<b>${locked?'🔒':m.icon} ${m.n}. ${esc(m.title)}</b><span>${esc(m.concept)}</span><div class="stars">${'⭐'.repeat(gr.progress.stars[idx]||0)}${'☆'.repeat(3-(gr.progress.stars[idx]||0))}</div>`;if(!locked)b.onclick=()=>startMission(idx);box.appendChild(b);});gr$('grMapGrid').appendChild(box);});
    gr$('grMapRoad').style.setProperty('--p',((gr.progress.unlockedMission+1)/12*100)+'%');gr$('grMap').style.display='flex';
  }
  function hideMap(){gr$('grMap').style.display='none';}

  function startMission(idx,sandbox){
    gr.isSandbox=!!sandbox;gr.mission=Math.max(0,Math.min(11,idx));const m=mission();
    gr.program=m.starter.slice();gr.initialProgram=gr.program.slice();gr.mounted=[];gr.wires=[];gr.measurements=[];gr.hintLevel=0;gr.collisions=0;gr.variant=(gr.variant+1)%3;gr.currentBlock=null;
    gr.sim=new S.Sim(S.makeTrack(m.track,gr.variant));rewind(false);hideMap();renderAll();
    gr$('grIntroIcon').textContent=m.icon;gr$('grIntroTitle').textContent=(gr.isSandbox?'':(m.n+'. '))+m.title;gr$('grIntroStory').textContent=m.story;gr$('grIntroGoal').innerHTML='<b>MISSIONE:</b> '+esc(m.goal)+'<br><small>'+esc(m.concept)+'</small>';
    gr$('grIntroSafety').textContent=m.safety;gr$('grIntroSafety').className=m.safety?'grGoal grSafety':'';gr$('grIntro').style.display='flex';
  }

  function renderAll(){const m=mission();gr$('grMissionName').innerHTML=`${m.icon} ${gr.isSandbox?'':m.n+'. '}${esc(m.title)}<small>${esc(m.goal)}</small>`;gr$('grHintN').textContent=Math.min(3,gr.hintLevel+1);renderEditor();renderUnderstand();draw();}
  function renderEditor(){
    const m=mission(),ed=gr$('grEditor');let html=`<div class="grGoal"><b>🎯 ${esc(m.goal)}</b><br><small>${esc(m.concept)}</small></div>`;
    if(m.safety)html+=`<div class="grGoal grSafety">${esc(m.safety)}</div>`;
    if(m.type==='build'){
      html+='<div class="grPartGrid">'+m.required.map(id=>{const p=D.parts[id],done=gr.mounted.includes(id);return `<button class="grPart ${done?'done':''}" data-part="${id}" ${done?'disabled':''}><span class="em">${p.icon}</span><b>${p.label}</b><small>${p.role}</small></button>`;}).join('')+'</div>';
      if(m.wires&&gr.mounted.length===m.required.length)html+='<h3>🔌 COLLEGAMENTI</h3>'+m.wires.map((w,i)=>`<button class="grWire ${gr.wires.includes(i)?'done':''}" data-wire="${i}">${esc(w)}</button>`).join('');
      html+='<button class="grPrimary" id="grCheckBuild">✓ VERIFICA IL MONTAGGIO</button>';
    }else{
      if(m.parts&&m.parts.length)html+='<h3>🔩 NUOVO COMPONENTE</h3><div class="grPartGrid">'+m.parts.map(id=>{const p=D.parts[id],done=gr.mounted.includes(id);return `<button class="grPart ${done?'done':''}" data-part="${id}" ${done?'disabled':''}><span class="em">${p.icon}</span><b>${p.label}</b><small>${p.role}</small></button>`;}).join('')+'</div>';
      html+='<b>PALETTE DEI BLOCCHI</b><div id="grPalette">'+m.palette.map(id=>{const b=D.blocks[id];return `<button class="grBlock" draggable="true" data-add="${id}" data-cat="${b.cat}">${b.icon} ${b.label}</button>`;}).join('')+'</div><b>IL MIO PROGRAMMA</b><div id="grWorkspace">';
      if(!gr.program.length)html+='<div class="grEmpty">Tocca un blocco per aggiungerlo qui.</div>';
      gr.program.forEach((id,i)=>{const b=D.blocks[id];html+=`<div class="grProgRow ${gr.currentBlock===id?'active':''}" draggable="true" data-row="${i}"><button class="grBlock" data-cat="${b.cat}" data-select="${i}">${b.icon} ${b.label}</button><button class="grRowBtn" data-up="${i}" aria-label="Sposta su">↑</button><button class="grRowBtn" data-down="${i}" aria-label="Sposta giù">↓</button><button class="grRowBtn" data-del="${i}" aria-label="Elimina">×</button></div>`;});html+='</div>';
      if(m.type==='measure')html+='<h3>📏 OGGETTI DA MISURARE</h3>'+m.samples.map((cm,i)=>`<button class="grSample ${gr.measurements.includes(i)?'done':''}" data-sample="${i}">Oggetto ${i+1}: ${i===0?'vicino':i===1?'a metà':'lontano'} <strong>${gr.measurements.includes(i)?cm+' cm':'? cm'}</strong></button>`).join('');
      if(gr.isSandbox)html+=sandboxBar();
    }
    ed.innerHTML=html;bindEditor();gr$('grThreshold').style.display=m.threshold?'block':'none';
  }
  function sandboxBar(){return `<h3>🛣️ CREA LA PISTA</h3><div id="grProjectBar"><button class="grSecondary" data-track="obstacle">📦 OSTACOLO</button><button class="grSecondary" data-track="wall">🧱 MURO</button><button class="grSecondary" data-track="start">🏁 PARTENZA</button><button class="grSecondary" data-track="goal">🤖 SOCCORSO</button><button class="grSecondary" data-track="remove">🧽 TOGLI</button><button class="grSecondary" data-track="color">🎨 AUTO</button></div><small>Seleziona uno strumento, poi tocca la pista.</small><h3>💾 PROGETTI</h3><div id="grProjectBar"><button class="grSecondary" data-project="save">💾 SALVA</button><button class="grSecondary" data-project="rename">✏️ RINOMINA</button><button class="grSecondary" data-project="duplicate">📄 DUPLICA</button><button class="grSecondary" data-project="json">⬇ PROGETTO</button><button class="grSecondary" data-project="import">⬆ IMPORTA</button><button class="grSecondary" data-project="ino">ARDUINO .ino</button><button class="grSecondary" data-project="print">🖨 SCHEDA</button></div><div>${gr.projects.map((p,i)=>`<button class="grWire" data-load-project="${i}">📁 ${esc(p.metadata&&p.metadata.name||('Progetto '+(i+1)))}</button>`).join('')}</div><small>${gr.projects.length} progetti salvati su questo dispositivo.</small>`;}

  function bindEditor(){
    document.querySelectorAll('#grEditor [data-part]').forEach(b=>b.onclick=()=>{gr.mounted.push(b.dataset.part);renderEditor();draw();grSpeak(D.parts[b.dataset.part].role);});
    document.querySelectorAll('#grEditor [data-wire]').forEach(b=>b.onclick=()=>{const n=+b.dataset.wire;if(!gr.wires.includes(n))gr.wires.push(n);renderEditor();});
    const check=gr$('grCheckBuild');if(check)check.onclick=checkBuild;
    document.querySelectorAll('#grEditor [data-add]').forEach(b=>{b.onclick=()=>addBlock(b.dataset.add);b.ondragstart=e=>e.dataTransfer.setData('text/gr-block',b.dataset.add);});
    document.querySelectorAll('#grEditor [data-del]').forEach(b=>b.onclick=()=>{gr.program.splice(+b.dataset.del,1);renderAll();});
    document.querySelectorAll('#grEditor [data-up]').forEach(b=>b.onclick=()=>moveBlock(+b.dataset.up,-1));document.querySelectorAll('#grEditor [data-down]').forEach(b=>b.onclick=()=>moveBlock(+b.dataset.down,1));
    document.querySelectorAll('#grEditor [data-select]').forEach(b=>b.onclick=()=>{gr.currentBlock=gr.program[+b.dataset.select];renderAll();showTab(gr.activeTab||'dash');});
    document.querySelectorAll('#grEditor [data-sample]').forEach(b=>b.onclick=()=>measureSample(+b.dataset.sample));
    document.querySelectorAll('#grEditor [data-project]').forEach(b=>b.onclick=()=>projectAction(b.dataset.project));
    document.querySelectorAll('#grEditor [data-track]').forEach(b=>b.onclick=()=>{if(b.dataset.track==='color'){const colors=['#30aee0','#ef6e52','#7d58d5','#35a965','#f1b42e'];gr.carColor=colors[(colors.indexOf(gr.carColor)+1)%colors.length];draw();}else{gr.trackTool=b.dataset.track;toast('Ora tocca la pista.');}});
    document.querySelectorAll('#grEditor [data-load-project]').forEach(b=>b.onclick=()=>loadProject(+b.dataset.loadProject));
    const ws=gr$('grWorkspace');if(ws){ws.ondragover=e=>e.preventDefault();ws.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('text/gr-block');if(id)addBlock(id);};}
  }
  function addBlock(id){gr.program.push(id);gr.currentBlock=id;renderAll();}
  function moveBlock(i,d){const j=i+d;if(j<0||j>=gr.program.length)return;const x=gr.program[i];gr.program[i]=gr.program[j];gr.program[j]=x;renderAll();}
  function checkBuild(){const m=mission(),parts=m.required.every(id=>gr.mounted.includes(id)),wires=!m.wires||m.wires.every((_,i)=>gr.wires.includes(i));if(parts&&wires)finish(true);else{toast(!parts?'Manca ancora qualche pezzo. Guarda le sagome!':'Controlla tutti i collegamenti.');gr$('grSpeech').textContent='Quale pezzo o filo manca ancora?';}}
  function measureSample(i){const m=mission();if(!C.matches(gr.program,m.required)){toast('Prima completa il programma: LEGGI e MOSTRA.');return;}if(!gr.measurements.includes(i))gr.measurements.push(i);gr.sim.sensorDistance=m.samples[i];gr.sim.variables.distanza=m.samples[i];gr$('grSpeech').textContent=`Oggetto ${i+1}: ${m.samples[i]} centimetri!`;renderAll();if(gr.measurements.length===m.samples.length)setTimeout(()=>finish(true),500);}

  function renderUnderstand(){showTab(gr.activeTab||'dash');}
  function showTab(tab){
    gr.activeTab=tab;document.querySelectorAll('#grTabs .grTab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const el=gr$('grUnderstand');
    if(tab==='dash'){
      const s=gr.sim?gr.sim.snapshot():{car:{left:0,right:0},servoAngle:90,sensorDistance:null,variables:{}},tech=gr.settings.dashboard==='technical';
      el.innerHTML=`<button class="grSecondary" id="grDashMode">${tech?'🛠 VISTA TECNICA':'🙂 VISTA SEMPLICE'}</button><div class="grMeter"><b>📏 DISTANZA</b><strong>${s.sensorDistance==null?'—':s.sensorDistance+' cm'}</strong></div><div class="grMeter"><b>👀 SGUARDO</b><strong>${s.servoAngle>105?'SINISTRA':s.servoAngle<75?'DESTRA':'CENTRO'}</strong></div><div class="grMeter"><b>🧠 DECISIONE</b><strong>${esc(gr.currentBlock?D.blocks[gr.currentBlock].label:'IN ATTESA')}</strong></div><div class="grWheels"><div class="grWheel ${Math.abs(s.car.left)>1?'spin':''}"><span class="disc">⚙️</span>SX ${Math.round(s.car.left)}</div><div class="grWheel ${Math.abs(s.car.right)>1?'spin':''}"><span class="disc">⚙️</span>DX ${Math.round(s.car.right)}</div></div>${tech?technicalHTML(s):''}`;
      gr$('grDashMode').onclick=()=>{gr.settings.dashboard=tech?'simple':'technical';persist();showTab('dash');};
    }else{
      const out=tab==='gabri'?C.gabriCode(gr.program):C.arduinoCode(gr.program,{name:'Gibi Rescue Missione '+(gr.mission+1)});el.innerHTML=`<div class="grCode">${codeHTML(out.code,out.ranges,gr.currentBlock)}</div>`+(tab==='arduino'?'<button class="grPrimary" id="grDownloadIno">⬇ SCARICA .ino</button>':'');if(gr$('grDownloadIno'))gr$('grDownloadIno').onclick=()=>download(out.filename,out.code,'text/x-c++src');
    }
  }
  function technicalHTML(s){const echo=s.sensorDistance==null?'timeout':Math.round(s.sensorDistance*58)+' µs';return `<div class="grMeter"><b>PIN MOTORI</b>D5/D2/D4 · D6/D7/D8<br><b>SENSORE</b>TRIG D12: LOW · ECHO D11: ${echo}<br><b>PWM</b>SX ${Math.round(Math.abs(s.car.left)/72*255)} · DX ${Math.round(Math.abs(s.car.right)/72*255)}<br><b>VARIABILI</b><pre>${esc(JSON.stringify(s.variables,null,2))}</pre></div>`;}
  function codeHTML(code,ranges,active){const activeRange=active&&ranges[active];return code.split('\n').map((line,i)=>`<span class="grLine ${activeRange&&i+1>=activeRange[0]&&i+1<=activeRange[1]?'active':''}">${esc(line)||' '}</span>`).join('');}

  function runProgram(){
    const m=mission();if(m.type==='build'){checkBuild();return;}if(m.type==='measure'){toast('Tocca i tre oggetti per misurarli.');return;}
    if(m.parts&&!m.parts.every(id=>gr.mounted.includes(id))){toast('Prima monta il nuovo componente.');gr$('grSpeech').textContent='Quale componente manca prima della prova?';return;}
    const v=C.validate(gr.program,m.palette.concat(m.starter));if(!v.ok){toast(v.errors[0].message);return;}
    gr.correct=gr.isSandbox||C.matches(gr.program,m.required);gr.actions=C.compileActions(gr.program);if(!gr.actions.length){toast('Aggiungi almeno un blocco al programma.');return;}
    if(gr.runMode==='done'||gr.runMode==='debug')rewind(false);gr.runMode='running';gr$('grSpeech').textContent='Segui il blocco giallo: cosa farà adesso?';
  }
  function pause(){if(gr.runMode==='running')gr.runMode='paused';}
  function rewind(render=true){if(!gr.sim)return;gr.sim.reset();gr.actionIndex=0;gr.actionTime=0;gr.runMode='paused';gr.currentBlock=null;gr.collisions=0;if(render)renderAll();}
  function stepOnce(){if(!gr.actions.length){runProgram();if(gr.runMode!=='running')return;}gr.runMode='step';for(let k=0;k<120&&gr.runMode==='step';k++)advance(.05);renderAll();}
  function applyAction(a){
    if(a.type==='wheels')gr.sim.setWheels(a.left,a.right);else if(a.type==='sense')gr.sim.sense();else if(a.type==='servo')gr.sim.setServo(a.angle);
    else if(a.type==='saveLeft'){gr.sim.variables.distanzaSinistra=gr.sim.sense(150);}else if(a.type==='saveRight'){gr.sim.variables.distanzaDestra=gr.sim.sense(30);}
    else if(a.type==='choose'){const l=gr.sim.variables.distanzaSinistra||180,r=gr.sim.variables.distanzaDestra||180;gr.sim.setWheels(l>r?-45:45,l>r?45:-45);}
    else if(a.type==='ifNear'){const d=gr.sim.sense()||400;gr.sim.setWheels(d<a.threshold?0:54,d<a.threshold?0:54);}
    else if(a.type==='avoid')gr.sim.sense();else if(a.type==='rescue')gr.sim.stop();
  }
  function advance(dt){
    if(!gr.actions.length)return;const a=gr.actions[gr.actionIndex];if(!a){endRun();return;}gr.currentBlock=a.block||a.type;applyAction(a);gr.actionTime+=dt;const res=gr.sim.step(dt);gr.sim.sense();if(res.collision){gr.collisions++;gr.runMode='debug';gr$('grSpeech').textContent='L’auto ha urtato. Ha iniziato a frenare abbastanza presto?';toast('Esperimento fermato: osserva blocco, distanza e ruote.');}
    if(gr.actionTime>=a.duration){gr.actionIndex++;gr.actionTime=0;if(gr.runMode==='step')gr.runMode='paused';if(gr.actionIndex>=gr.actions.length)endRun();}
  }
  function endRun(){gr.sim.stop();if(gr.correct){gr.runMode='done';setTimeout(()=>finish(true),gr.settings.reducedMotion?50:450);}else{gr.runMode='debug';gr$('grSpeech').textContent='Il programma è partito, ma manca un passaggio. Quale blocco serve per raggiungere la missione?';toast('Quasi! Modifica il programma e riprova.');}}
  function frame(ts){if(!gr.on)return;gr.raf=requestAnimationFrame(frame);const frameMs=gr.runMode==='running'?1000/30:100;if(Number.isFinite(ts)&&gr.frameAt&&ts-gr.frameAt<frameMs-1)return;if(Number.isFinite(ts))gr.frameAt=ts;const dt=Math.min(.05,(ts-gr.last)/1000||.016);gr.last=ts;if(gr.runMode==='running')advance(dt);draw();if(gr.activeTab==='dash'&&Math.floor(ts/160)!==gr.lastDash){gr.lastDash=Math.floor(ts/160);showTab('dash');}}

  function finish(ok){if(!ok)return;pause();const m=mission();if(gr.isSandbox){toast('Prova completata! Nel laboratorio puoi continuare a cambiare tutto.');return;}
    const missionStar=true,safety=gr.collisions===0,program=m.type==='build'||(gr.hintLevel<3&&gr.program.length<=m.required.length+1);const detail=[missionStar,safety,program],count=detail.filter(Boolean).length;
    gr.progress.stars[gr.mission]=Math.max(gr.progress.stars[gr.mission]||0,count);gr.progress.starDetail[gr.mission]=detail;gr.progress.unlockedMission=Math.max(gr.progress.unlockedMission,Math.min(11,gr.mission+1));
    const unlocks=['telaio','energia','motore sinistro','due motori','manovre','loop','HC-SR04','distanza','if/else','evitamento','servo','laboratorio completo'];if(!gr.progress.unlocks.includes(unlocks[gr.mission]))gr.progress.unlocks.push(unlocks[gr.mission]);persist();
    gr$('grWinStars').textContent='⭐'.repeat(count)+'☆'.repeat(3-count);gr$('grStarDetail').innerHTML=['MISSIONE','SICUREZZA','PROGRAMMA'].map((x,i)=>`<div class="grStarCard ${detail[i]?'on':''}">${detail[i]?'⭐':'☆'}<br><b>${x}</b></div>`).join('');gr$('grDiscovery').innerHTML='<b>🔍 SCOPERTA</b><br>'+esc(m.discovery);gr$('grNext').style.display=gr.mission<11?'inline-block':'none';gr$('grWin').style.display='flex';
  }

  function useHint(){const m=mission();gr.hintLevel=Math.min(3,gr.hintLevel+1);if(gr.hintLevel===1)gr$('grSpeech').textContent=m.type==='build'?'Guarda i nomi e il ruolo di ogni pezzo.':'Leggi la missione e cerca il primo verbo: quale blocco gli somiglia?';else if(gr.hintLevel===2){const missing=m.required.find(id=>!gr.program.includes(id));gr$('grSpeech').textContent=missing?`Prova il blocco ${D.blocks[missing].label}.`:'L’ordine dei blocchi segue l’ordine delle azioni nella consegna.';}else{if(m.type!=='build'){gr.program=m.required.slice();renderAll();}gr$('grSpeech').textContent='Ho messo una soluzione fantasma. Puoi cambiarla e provarla.';}gr$('grHintN').textContent=Math.min(3,gr.hintLevel+1);}

  function draw(){
    const cv=gr$('grCanvas');if(!cv||!gr.sim)return;const box=cv.getBoundingClientRect(),dpr=Math.min(1.5,devicePixelRatio||1),w=Math.max(1,box.width),h=Math.max(1,box.height);if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
    const t=gr.sim.track,pad=22,sc=Math.min((w-pad*2)/t.width,(h-pad*2)/t.height),ox=(w-t.width*sc)/2,oy=(h-t.height*sc)/2;const X=v=>ox+v*sc,Y=v=>oy+v*sc;
    x.fillStyle='#8fd082';x.fillRect(0,0,w,h);x.fillStyle='#59656d';roundRect(x,X(0),Y(0),t.width*sc,t.height*sc,17);x.fill();x.strokeStyle='#f1f0cc';x.lineWidth=2;x.setLineDash([12,12]);x.beginPath();x.moveTo(X(8),Y(t.height/2));x.lineTo(X(t.width-8),Y(t.height/2));x.stroke();x.setLineDash([]);
    const g=t.goal;x.fillStyle='#67df84';x.globalAlpha=.85;x.fillRect(X(g.x),Y(g.y),g.w*sc,g.h*sc);x.globalAlpha=1;x.fillStyle='#114a2a';x.font=`bold ${Math.max(9,10*sc/1.5)}px Andika`;x.fillText(t.label,X(g.x),Y(g.y)-4);
    t.obstacles.forEach(o=>{x.fillStyle='#e77355';roundRect(x,X(o.x),Y(o.y),o.w*sc,o.h*sc,7);x.fill();x.fillStyle='#fff3';x.fillRect(X(o.x)+4,Y(o.y)+4,Math.max(0,o.w*sc-8),5);});
    const c=gr.sim.car,a=c.a,cx=X(c.x),cy=Y(c.y),sz=Math.max(10,gr.sim.opts.radius*sc);if(gr.sim.sensorDistance!=null){const sa=a+(gr.sim.servoAngle-90)*Math.PI/180;x.strokeStyle='#55f2bf';x.fillStyle='#55f2bf22';x.lineWidth=2;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(sa)*gr.sim.sensorDistance*sc,cy+Math.sin(sa)*gr.sim.sensorDistance*sc);x.stroke();}
    x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=gr.carColor;x.beginPath();roundRect(x,-sz,-sz*.68,sz*2,sz*1.36,7);x.fill();x.fillStyle='#0b2836';x.fillRect(-sz*.6,-sz*.84,sz*.65,sz*.28);x.fillRect(-sz*.6,sz*.56,sz*.65,sz*.28);x.fillRect(sz*.1,-sz*.84,sz*.65,sz*.28);x.fillRect(sz*.1,sz*.56,sz*.65,sz*.28);x.fillStyle='#fff';x.beginPath();x.arc(sz*.65,-sz*.28,sz*.15,0,Math.PI*2);x.arc(sz*.65,sz*.28,sz*.15,0,Math.PI*2);x.fill();x.fillStyle='#ffe14d';x.fillRect(-sz*.65,-sz*.4,sz*.55,sz*.8);x.restore();
    if(gr.runMode==='paused'){x.fillStyle='#ffffffdd';x.font='bold 14px Andika';x.fillText('⏸ IN PAUSA',X(8),Y(16));}
  }
  function roundRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  function projectData(){return {metadata:{name:'Progetto di Gabriele',created:new Date().toISOString()},version:1,pinMap:D.pinMap,car:{color:gr.carColor},program:C.normalize(gr.program),track:gr.sim.track,settings:{dashboard:gr.settings.dashboard}};}
  function validProject(p){return p&&p.version===1&&p.program&&Array.isArray(p.program.setup)&&Array.isArray(p.program.loop)&&p.track&&Number(p.track.width)>0&&Number(p.track.width)<=1000&&Array.isArray(p.track.obstacles)&&p.track.obstacles.length<=100;}
  function projectAction(kind){
    if(kind==='save'){const p=projectData();p.metadata.name='Progetto '+(gr.projects.length+1);gr.projects.push(p);gr.projects=gr.projects.slice(-12);persist();toast('Progetto salvato sul dispositivo.');renderEditor();}
    if(kind==='rename'){if(!gr.projects.length){toast('Prima salva un progetto.');return;}const old=gr.projects[gr.projects.length-1].metadata.name,n=prompt('Nuovo nome del progetto:',old);if(n&&n.trim()){gr.projects[gr.projects.length-1].metadata.name=n.trim().slice(0,40);persist();renderEditor();}}
    if(kind==='duplicate'){if(!gr.projects.length){toast('Prima salva un progetto.');return;}const p=JSON.parse(JSON.stringify(gr.projects[gr.projects.length-1]));p.metadata.name=(p.metadata.name+' copia').slice(0,40);gr.projects.push(p);gr.projects=gr.projects.slice(-12);persist();renderEditor();}
    if(kind==='json')download('progetto.gibi-rescue.json',JSON.stringify(projectData(),null,2),'application/json');
    if(kind==='import')gr$('grImport').click();
    if(kind==='ino'){const out=C.arduinoCode(gr.program,{name:'gibi-rescue'});download(out.filename,out.code,'text/x-c++src');}
    if(kind==='print')showPrint();
  }
  function loadProject(index){const p=gr.projects[index];if(!validProject(p)){toast('Il progetto salvato non è più valido.');return;}gr.program=C.flatten(p.program);gr.sim.load(p.track);if(p.car&&/^#[0-9a-f]{6}$/i.test(p.car.color))gr.carColor=p.car.color;rewind();toast('Progetto caricato.');}
  function importFile(file){if(!file||file.size>500000){toast('File troppo grande.');return;}const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(!validProject(p))throw Error();gr.program=C.flatten(p.program);gr.sim.load(p.track);if(p.car&&/^#[0-9a-f]{6}$/i.test(p.car.color))gr.carColor=p.car.color;renderAll();toast('Progetto importato e controllato.');}catch(_){toast('Questo non è un progetto Gibi Rescue valido.');}};r.readAsText(file);}
  function showPrint(){const out=C.arduinoCode(gr.program),parts=['Arduino Uno R3','Telaio 2WD','Driver L298N','2 motori TT','HC-SR04','Servo SG90','Portapile AA ricaricabili'];gr$('grPrintBody').innerHTML=`<h2>Componenti</h2><ul>${parts.map(p=>'<li>'+p+'</li>').join('')}</ul><h2>Pin</h2><table style="margin:auto;border-collapse:collapse"><tr><th>Funzione</th><th>Pin</th></tr>${Object.entries(D.pinMap).map(([k,v])=>`<tr><td style="border:1px solid #999;padding:5px">${k}</td><td style="border:1px solid #999;padding:5px">D${v}</td></tr>`).join('')}</table><p><b>Sicurezza:</b> togli alimentazione prima dei fili; usa il driver per i motori; usa AA ricaricabili e USB per programmare.</p><h2>Programma Arduino</h2><pre style="text-align:left;white-space:pre-wrap">${esc(out.code)}</pre>`;gr$('grPrint').style.display='flex';}

  function bindUI(){
    gr$('grHome').onclick=exit;gr$('grMapBtn').onclick=showMap;gr$('grMapClose').onclick=hideMap;gr$('grClear').onclick=()=>{if(confirm('Azzero missioni, stelle e progetti di Gibi Rescue?')){gr.progress={version:1,unlockedMission:0,stars:[],starDetail:[],unlocks:[]};gr.projects=[];persist();startMission(0);showMap();toast('Progressi di Gibi Rescue azzerati.');}};gr$('grVoice').onclick=()=>grSpeak(mission().goal+' '+mission().concept);gr$('grMotion').onclick=()=>{gr.settings.reducedMotion=!gr.settings.reducedMotion;gr$('grMotion').textContent=gr.settings.reducedMotion?'🧘':'✨';persist();};
    gr$('grToggleLeft').onclick=()=>gr$('grLeft').classList.toggle('grClosed');gr$('grToggleRight').onclick=()=>gr$('grRight').classList.toggle('grClosed');gr$('grUndo').onclick=()=>{if(gr.program.length){gr.program.pop();renderAll();}};
    gr$('grRun').onclick=runProgram;gr$('grPause').onclick=pause;gr$('grStep').onclick=stepOnce;gr$('grRewind').onclick=()=>rewind();gr$('grReset').onclick=()=>{if(confirm('Ripristinare l’inizio della missione?'))startMission(gr.mission,gr.isSandbox);};gr$('grHint').onclick=useHint;
    document.querySelectorAll('#grTabs .grTab').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));gr$('grIntroGo').onclick=()=>{gr$('grIntro').style.display='none';grStopSpeak();};gr$('grIntroSpeak').onclick=()=>grSpeak(mission().story+' '+mission().goal+' '+mission().concept);
    gr$('grReplay').onclick=()=>{gr$('grWin').style.display='none';startMission(gr.mission);};gr$('grWinMap').onclick=()=>{gr$('grWin').style.display='none';showMap();};gr$('grNext').onclick=()=>{gr$('grWin').style.display='none';startMission(Math.min(11,gr.mission+1));};gr$('grSandbox').onclick=()=>startMission(11,true);
    gr$('grThresholdInput').oninput=e=>{gr$('grThresholdOut').textContent=e.target.value;};gr$('grImport').onchange=e=>{importFile(e.target.files[0]);e.target.value='';};gr$('grPrintNow').onclick=()=>print();gr$('grPrintClose').onclick=()=>gr$('grPrint').style.display='none';
    gr$('grCanvas').addEventListener('pointerdown',editTrack);
    addEventListener('keydown',e=>{if(!gr.on||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();runProgram();}else if(e.key.toLowerCase()==='p')pause();else if(e.key.toLowerCase()==='r')rewind();else if(e.key==='Escape'){if(gr$('grMap').style.display==='flex')hideMap();else showMap();}});
    addEventListener('resize',draw);
  }

  function editTrack(e){
    if(!gr.isSandbox||!gr.sim)return;const cv=gr$('grCanvas'),r=cv.getBoundingClientRect(),t=gr.sim.track,pad=22,sc=Math.min((r.width-pad*2)/t.width,(r.height-pad*2)/t.height),ox=(r.width-t.width*sc)/2,oy=(r.height-t.height*sc)/2;
    const x=Math.max(8,Math.min(t.width-8,(e.clientX-r.left-ox)/sc)),y=Math.max(8,Math.min(t.height-8,(e.clientY-r.top-oy)/sc));
    if(gr.trackTool==='obstacle'&&t.obstacles.length<100)t.obstacles.push({x:x-9,y:y-9,w:18,h:18});
    else if(gr.trackTool==='wall'&&t.obstacles.length<100)t.obstacles.push({x:x-4,y:y-20,w:8,h:40});
    else if(gr.trackTool==='start'){t.start={x,y,a:0};gr.sim.reset();}
    else if(gr.trackTool==='goal'){t.goal={x:x-12,y:y-15,w:24,h:30};t.label='SOCCORSO';}
    else if(gr.trackTool==='remove'&&t.obstacles.length){let best=0,dist=Infinity;t.obstacles.forEach((o,i)=>{const d=Math.hypot(x-(o.x+o.w/2),y-(o.y+o.h/2));if(d<dist){dist=d;best=i;}});if(dist<35)t.obstacles.splice(best,1);}
    draw();
  }

  function enter(){
    gr.on=true;if(typeof root.paused!=='undefined')root.paused=true;grStopSpeak();['modeSel','menu','hud','joy'].forEach(id=>{const e=gr$(id);if(e)e.style.display='none';});gr$('grApp').style.display='block';if(!gr.sim)startMission(Math.min(gr.progress.unlockedMission,11));showMap();gr.last=0;gr.frameAt=0;if(!gr.raf)gr.raf=requestAnimationFrame(frame);
  }
  function exit(){cancelAnimationFrame(gr.raf);gr.raf=0;gr.on=false;pause();grStopSpeak();['grApp','grMap','grIntro','grWin','grPrint'].forEach(id=>gr$(id).style.display='none');if(typeof root.showModeSel==='function')root.showModeSel();}

  installUI();
  if(typeof root.registerGame==='function')root.registerGame({id:'gibi-rescue',emoji:'🚗',nm:['Gibi Rescue','Gibi Rescue'],sub:['Costruisci e programma l’Auto Intelligente!','Build and program the Smart Car!'],colore:'linear-gradient(180deg,#38b8d8,#3467c7)',enter,exit});
  root.__GR={state:gr,enter,exit,start:startMission,run:runProgram,pause,step:advance,rewind,finish,validateProject:validProject,projectData};
})(typeof globalThis!=='undefined'?globalThis:this);
