/* ============================================================
   LA MACCHINA DELLE PAROLE — fetta verticale, Capitolo 1
   Interfaccia, progressi e orchestrazione. Test hook: window.__MP
   ============================================================ */
(function(root){
  'use strict';
  const D=root.MP_DATA,M=root.MP_MODEL;
  if(!D||!M)return;
  const mp$=id=>document.getElementById(id);
  const SAVE='gabri_mp_progress_v1';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load=()=>{try{return Object.assign({version:1,stage:0,complete:false,stars:{builder:false,investigator:false,explainer:false},decisions:{},settings:{reducedMotion:false,speed:1,previewAll:false}},JSON.parse(localStorage.getItem(SAVE)||'{}'));}catch(_){return {version:1,stage:0,complete:false,stars:{builder:false,investigator:false,explainer:false},decisions:{},settings:{reducedMotion:false,speed:1,previewAll:false}};}};
  const mp={on:false,activeChapter:0,phase:0,tokenStage:0,tokenMode:'word',tokenFragments:[],tokenFinalIndex:0,guideChapter:0,guidePage:0,progress:load(),wrong:[],prediction:null,generated:{},model:null,corpus:[],scan:{tokens:[],index:0,paused:true,timer:0},view:'mission'};
  mp.progress.stars=Object.assign({builder:false,investigator:false,explainer:false},mp.progress.stars||{});
  mp.progress.decisions=mp.progress.decisions||{};mp.progress.settings=Object.assign({reducedMotion:false,speed:1,previewAll:false,autoRead:true},mp.progress.settings||{});
  mp.progress.chapter2=Object.assign({stage:0,complete:false,fragments:[],stars:{builder:false,investigator:false,explainer:false}},mp.progress.chapter2||{});
  mp.progress.chapter2.fragments=Array.isArray(mp.progress.chapter2.fragments)?mp.progress.chapter2.fragments:[];
  mp.progress.chapter2.stars=Object.assign({builder:false,investigator:false,explainer:false},mp.progress.chapter2.stars||{});
  const persist=()=>{try{localStorage.setItem(SAVE,JSON.stringify(mp.progress));}catch(_){/* resta giocabile */}};
  const hide=id=>{const e=mp$(id);if(e)e.style.display='none';};
  const show=(id,display)=>{const e=mp$(id);if(e)e.style.display=display||'flex';};

  function installUI(){
    const css=document.createElement('style');css.textContent=`
      #mpApp{display:none;position:fixed;inset:0;z-index:42;background:#10253d;color:#193348;font-family:Andika,system-ui,sans-serif;overflow:hidden}
      #mpApp *{box-sizing:border-box}#mpApp button{font:inherit;cursor:pointer}#mpTop{height:68px;display:flex;align-items:center;gap:9px;padding:8px 12px;color:#fff;background:linear-gradient(100deg,#183c59,#285b69 58%,#6a4a7e);box-shadow:0 3px 14px #061522aa;position:relative;z-index:4}
      .mpTopBtn{min-width:46px;height:46px;border:2px solid #ffffff7a;border-radius:14px;background:#ffffff17;color:#fff;font-weight:bold;padding:5px 10px}.mpBrand{flex:1;min-width:0}.mpBrand b{display:block;font-size:clamp(17px,2.2vw,23px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mpBrand small{display:block;opacity:.78;font-size:12px}.mpStars{font-size:20px;white-space:nowrap}
      #mpLayout{height:calc(100% - 68px);display:grid;grid-template-columns:minmax(210px,22%) minmax(470px,1fr) minmax(245px,26%);gap:9px;padding:9px;background:radial-gradient(circle at 50% 20%,#234a5d,#10253d 66%)}
      .mpPanel{background:#f8f2e7;border:3px solid #c7a978;border-radius:20px;min-width:0;overflow:hidden;box-shadow:0 7px 20px #05152266}.mpPanelHead{min-height:51px;padding:10px 13px;background:#ead9b8;border-bottom:2px solid #c7a978;font-weight:bold;display:flex;align-items:center;justify-content:space-between;gap:8px}.mpPanelHead small{display:block;color:#725c3d;font-weight:normal}
      #mpLeft{display:flex;flex-direction:column}#mpSteps{padding:10px;overflow:auto;flex:1}.mpStep{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:8px;width:100%;border:2px solid #ccb88f;border-radius:14px;background:#fffaf0;padding:9px;margin-bottom:8px;text-align:left;color:#473b2b}.mpStep .em{font-size:25px}.mpStep.active{border-color:#5e8fb1;background:#eaf7ff;box-shadow:0 0 0 3px #b9e3fb}.mpStep.done{border-color:#5aa66b;background:#e9f8e7}.mpStep.lock{opacity:.55}.mpStep b{display:block;font-size:14px}.mpStep small{font-size:11px;color:#756b5b}.mpStep .tick{font-weight:bold;color:#2d8b4a}
      #mpAda{margin:8px 10px 10px;background:#fff7da;border:2px solid #e4c85e;border-radius:16px;padding:10px;line-height:1.35;font-size:13px;position:relative;padding-left:56px;min-height:62px}#mpAda:before{content:'👩‍🏫';position:absolute;left:10px;top:9px;font-size:35px}#mpAda b{color:#775513}
      #mpCenter{display:flex;flex-direction:column;background:linear-gradient(180deg,#edf8fa,#f9f2e7)}#mpMission{padding:14px 16px 8px;overflow:auto;flex:1}.mpMissionTitle{display:flex;gap:12px;align-items:flex-start;margin-bottom:8px}.mpMissionTitle .em{font-size:39px}.mpMissionTitle h1{font-size:clamp(21px,2.8vw,31px);color:#294f68;margin:0}.mpMissionTitle p{color:#60717a;line-height:1.4;margin:2px 0 0}.mpExplain{background:#e5f4f8;border-left:6px solid #4d96ae;border-radius:11px;padding:9px 12px;margin:10px 0;color:#315466;font-size:14px;line-height:1.4}
      .mpDocGrid{display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:10px}.mpDoc{border:3px solid #c7b793;border-radius:16px;background:#fffdf8;padding:10px;text-align:left;position:relative;transition:border-color .15s,transform .15s}.mpDoc.bad{border-color:#da6257;background:#fff0ec}.mpDoc.good{border-color:#4d9b62;background:#effbed}.mpDocBadge{display:inline-block;border-radius:8px;padding:2px 7px;background:#704d82;color:#fff;font-size:10px;font-weight:bold;letter-spacing:.04em}.mpDoc h3{font-size:16px;margin:5px 0 2px;color:#3f3a32}.mpSource{font-size:11px;color:#7b6f5e}.mpDocText{font-size:13px;line-height:1.42;margin:7px 0;color:#34434a}.mpActions{display:flex;gap:5px;flex-wrap:wrap}.mpChoice{border:2px solid #b8b1a4;border-radius:9px;background:#f7f4ec;color:#4d4a43;padding:5px 8px;font-size:11px;font-weight:bold}.mpChoice.sel{background:#286e8d;border-color:#1c5874;color:#fff}.mpDocNote{display:none;margin-top:7px;font-size:11px;line-height:1.35;color:#783d35}.mpDoc.bad .mpDocNote,.mpDoc.good .mpDocNote{display:block}
      #mpMissionFoot{min-height:70px;border-top:2px solid #c7a978;background:#f1e4cb;display:flex;align-items:center;gap:9px;justify-content:center;padding:9px;flex-wrap:wrap}.mpPrimary,.mpSecondary{border:0;border-radius:13px;padding:10px 15px;font-weight:bold;box-shadow:0 4px 0 #0003}.mpPrimary{background:#2d9260;color:#fff}.mpSecondary{background:#fff;color:#31556a;border:2px solid #91aeb9}.mpPrimary:active,.mpSecondary:active{transform:translateY(3px);box-shadow:none}.mpPrimary:disabled{opacity:.45;cursor:not-allowed}.mpStatus{font-size:13px;color:#5d513d;max-width:420px;text-align:center}
      #mpRight{display:flex;flex-direction:column}.mpModelBody{padding:11px;overflow:auto;flex:1}.mpPrompt{background:#172c43;color:#fff;border-radius:13px;padding:9px 11px;margin-bottom:9px}.mpPrompt small{display:block;color:#9ac5d4}.mpPrompt strong{font-size:18px}.mpBar{display:grid;grid-template-columns:minmax(65px,.7fr) 2fr 44px;align-items:center;gap:6px;margin:7px 0;font-size:12px}.mpTrack{height:15px;background:#ded7c9;border-radius:8px;overflow:hidden}.mpFill{height:100%;background:linear-gradient(90deg,#6b5bd1,#3fa6b4);border-radius:8px;min-width:2px}.mpModelMeta{background:#fffaf0;border:2px solid #d2c3a4;border-radius:12px;padding:8px;margin:8px 0;font-size:11px;line-height:1.5}.mpScan{min-height:72px;border:2px dashed #6e98a7;border-radius:13px;background:#eaf6f8;padding:8px;text-align:center}.mpScanToken{display:inline-block;background:#fff;border:2px solid #5c8ca1;border-radius:9px;padding:5px 8px;font-weight:bold;min-width:60px}.mpScanControls{display:flex;gap:5px;justify-content:center;margin-top:7px}.mpScanControls button{border:1px solid #86a5b2;border-radius:8px;background:#fff;padding:4px 8px}.mpTechBtn{width:100%;margin-top:9px}
      .mpShade{display:none;position:fixed;inset:0;z-index:55;background:#071625cc;align-items:center;justify-content:center;padding:16px}.mpModal{width:min(820px,95vw);max-height:92vh;overflow:auto;border:4px solid #c8a86d;border-radius:25px;background:#fffaf0;padding:20px;text-align:center;box-shadow:0 18px 60px #000b}.mpModal h1,.mpModal h2{color:#274f68;margin:5px}.mpModal p{line-height:1.5;color:#4b5a61}.mpModalActions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:14px}.mpBig{font-size:62px}.mpMap{width:min(1150px,97vw)}.mpMapGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:15px 0}.mpRoom{min-height:125px;border:3px solid #9e835c;border-radius:17px;background:linear-gradient(#fff8dc,#e5d0a7);color:#403523;padding:9px;box-shadow:0 5px 0 #745c3b}.mpRoom .em{font-size:31px;display:block}.mpRoom b{display:block;font-size:13px}.mpRoom small{display:block;font-size:10px;margin-top:4px}.mpRoom.lock{filter:grayscale(.6);opacity:.57;cursor:default}.mpRoom.done{background:linear-gradient(#efffdc,#bfe6a7);border-color:#659c52}.mpRoom.preview{opacity:.8}.mpLibrary{height:18px;border-radius:10px;background:#c9c1b3;overflow:hidden;margin:7px auto;width:min(680px,90%)}.mpLibrary span{display:block;height:100%;background:linear-gradient(90deg,#60a566,#e3bd40);transition:width .5s}
      .mpGuide{width:min(900px,95vw);position:relative}.mpGuideTop{display:grid;grid-template-columns:92px 1fr;gap:14px;align-items:center;text-align:left}.mpGuideTop .mpGibi{grid-row:1/3}.mpGuideTop small{color:#7b6584;font-weight:bold;letter-spacing:.05em}.mpGuideTop h1{margin:2px 0}.mpGuideProgress{display:flex;gap:7px;justify-content:center;margin:14px 0}.mpGuideDot{width:13px;height:13px;border-radius:50%;background:#d0c5b2;border:2px solid #a99778}.mpGuideDot.on{background:#4d91ab;border-color:#2d657b;transform:scale(1.2)}.mpGuideCard{background:#fff;border:3px solid #b9d5dd;border-radius:19px;padding:18px;text-align:left;min-height:190px;display:flex;flex-direction:column;justify-content:center}.mpGuideCard h2{font-size:clamp(22px,3vw,30px);margin:0 0 8px;color:#315d73}.mpGuideCopy{font-size:clamp(18px,2.3vw,23px);line-height:1.58;color:#334d59}.mpTerms{display:grid;grid-template-columns:1fr 1fr;gap:9px}.mpTerm{background:#eef8fa;border:2px solid #9bc2ce;border-radius:14px;padding:10px;position:relative}.mpTerm h3{color:#315d73;margin:0 36px 4px 0}.mpTerm p{font-size:14px;line-height:1.42;margin:0}.mpTerm button{position:absolute;right:7px;top:7px;border:1px solid #88aeb9;border-radius:9px;background:#fff;padding:4px 7px}.mpGuideReadRow{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px}.mpGuideReadRow button{font-size:14px}.mpRoom.lock{cursor:pointer}.mpRoom.lock:hover{filter:grayscale(.25);opacity:.76}
      .mpPrediction{display:grid;gap:8px;margin:13px auto;max-width:620px}.mpPrediction button,.mpQuizAnswers button{border:2px solid #9fb4bd;border-radius:13px;background:#fff;padding:10px;text-align:left;color:#29485b}.mpPrediction button.sel{border-color:#4d83a0;background:#e3f5ff}.mpQuizAnswers{display:grid;gap:9px;margin:12px auto;max-width:650px}.mpQuizAnswers button.right{background:#e3f8e2;border-color:#4a9c5d}.mpQuizAnswers button.wrong{background:#ffe9e5;border-color:#d05d51}.mpResultCards{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0}.mpResult{border:2px solid #bda87c;border-radius:14px;background:#fff;padding:10px}.mpResult strong{display:block;color:#2e5b72;font-size:17px}.mpResult .answer{display:block;margin:8px 0;font-size:20px;font-weight:bold;color:#68437d}.mpStarCards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.mpStarCard{border:2px solid #cfc3aa;border-radius:13px;background:#f2ede3;padding:9px}.mpStarCard.on{background:#fff4be;border-color:#d9aa27}.mpStarCard b{display:block}.mpNotebook{text-align:left}.mpNotebook section{border:2px solid #d7c8a8;border-radius:14px;padding:11px;margin:9px 0;background:#fff}.mpGloss{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left}.mpGloss div{border:2px solid #b9ced4;border-radius:12px;background:#f0fafb;padding:9px}.mpTokenCloud{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:10px 0}.mpToken{border-radius:8px;background:#e5eff3;border:1px solid #87aab8;padding:3px 6px;font-size:12px}.mpFormula{font:13px/1.55 ui-monospace,SFMono-Regular,monospace;text-align:left;background:#172b3e;color:#e9fbff;border-radius:13px;padding:11px;overflow:auto}
      .mpTokenizerModes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.mpTokenizerMode{border:3px solid #bca77f;border-radius:16px;background:#fffaf0;padding:12px;color:#344d59;text-align:left}.mpTokenizerMode.sel{border-color:#4b8fac;background:#e7f7fb;box-shadow:0 0 0 3px #bce5ef}.mpTokenizerMode b{display:block;font-size:17px;margin-bottom:4px}.mpTokenStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.mpTokenStat{border:2px solid #c9b88f;border-radius:13px;background:#fff;padding:9px;text-align:center}.mpTokenStat b{display:block;font-size:24px;color:#5e4779}.mpFragmentTray{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:14px 0}.mpFragment{border:3px solid #aeb7b5;border-radius:12px;background:#fff;padding:9px 13px;font-weight:bold}.mpFragment.sel{background:#684e86;color:#fff;border-color:#493363}.mpTape{background:#172c43;color:#fff;border-radius:14px;padding:13px;margin:10px 0}.mpTape .mpToken{display:inline-block;background:#f7e9bd;color:#263e4e;border-color:#d1ad51;margin:3px;font-size:15px}.mpUnknown{background:#ffe4df!important;border-color:#d25b4d!important;color:#842e27!important}
      #mpToast{display:none;position:fixed;z-index:70;left:50%;top:80px;transform:translateX(-50%);max-width:80vw;border:2px solid #9fcad6;border-radius:14px;background:#14384b;color:#fff;padding:9px 15px;text-align:center;box-shadow:0 8px 20px #0008}.mpGibi{width:96px;height:104px;margin:0 auto;background:url('assets/characters/gibi.png') center 7%/150% auto no-repeat;filter:drop-shadow(0 5px 7px #17334c55)}
      #mpApp :focus-visible{outline:4px solid #ffca2d!important;outline-offset:2px}@media(prefers-reduced-motion:reduce){#mpApp *{animation-duration:.001ms!important;transition:none!important}}
      @media(max-width:1050px){#mpLayout{grid-template-columns:200px 1fr}#mpRight{position:absolute;right:9px;top:77px;bottom:9px;width:min(360px,88vw);z-index:8;box-shadow:0 8px 35px #001a}#mpRight.closed{display:none}.mpMapGrid{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:760px){#mpTop{height:60px;padding:6px}#mpLayout{height:calc(100% - 60px);display:block;padding:5px}#mpCenter{height:100%}#mpLeft{display:none}.mpDocGrid{grid-template-columns:1fr}.mpMapGrid{grid-template-columns:repeat(2,1fr)}.mpResultCards,.mpStarCards,.mpGloss,.mpTerms,.mpTokenizerModes,.mpTokenStats{grid-template-columns:1fr}#mpMission{padding:10px}.mpTopBtn{min-width:40px;height:42px;padding:4px}.mpBrand small{display:none}.mpGuideTop{grid-template-columns:1fr;text-align:center}.mpGuideTop .mpGibi{height:70px}.mpGuideCard{min-height:150px;padding:13px}}
    `;document.head.appendChild(css);
    document.body.insertAdjacentHTML('beforeend',`
      <section id="mpApp" aria-label="La Macchina delle Parole">
        <header id="mpTop"><button class="mpTopBtn" id="mpHome" aria-label="Torna ai giochi">🏠</button><button class="mpTopBtn" id="mpMapBtn" aria-label="Mappa della biblioteca">🗺️</button><div class="mpBrand"><b>⚙️ La Macchina delle Parole</b><small id="mpTopSub">Capitolo 1 · L’Archivio dei dati</small></div><div class="mpStars" id="mpStars"></div><button class="mpTopBtn" id="mpSpeak" aria-label="Leggi la consegna">🔊</button><button class="mpTopBtn" id="mpModelToggle" aria-label="Apri o chiudi il modello">📊</button></header>
        <main id="mpLayout">
          <aside class="mpPanel" id="mpLeft"><div class="mpPanelHead" id="mpStationTitle">🛰️ STAZIONE AURORA</div><div id="mpSteps"></div><div id="mpAda"><b>Ada</b><div id="mpAdaText"></div></div></aside>
          <section class="mpPanel" id="mpCenter"><div id="mpMission"></div><footer id="mpMissionFoot"></footer></section>
          <aside class="mpPanel" id="mpRight"><div class="mpPanelHead"><span><span id="mpModelTitle">⚙️ MODELLO DI PROVA</span><small id="mpModelSubtitle">Predittore a conteggio · non è un LLM</small></span><button class="mpChoice" id="mpCloseModel" aria-label="Chiudi il pannello del modello">×</button></div><div class="mpModelBody"><label class="mpPrompt"><small id="mpPromptLabel">CONTESTO OSSERVATO</small><strong id="mpPrompt">La squadra</strong></label><div id="mpBars"></div><div class="mpModelMeta" id="mpModelMeta"></div><div class="mpScan"><small id="mpScanLabel">RIPRODUZIONE DIDATTICA DEL CONTEGGIO</small><div><span class="mpScanToken" id="mpScanToken">pronto</span></div><div class="mpScanControls" id="mpScanControls"><button id="mpScanPlay" aria-label="Avvia riproduzione">▶</button><button id="mpScanPause" aria-label="Metti in pausa">⏸</button><button id="mpScanStep" aria-label="Avanza di un token">⏭</button><button id="mpScanSpeed" aria-label="Cambia velocità">1×</button></div></div><button class="mpSecondary mpTechBtn" id="mpInside">🔍 GUARDA DENTRO</button></div></aside>
        </main>
      </section>
      <div class="mpShade" id="mpMap"><div class="mpModal mpMap"><div class="mpBig">📚⚙️</div><h1>La Biblioteca delle Storie Spezzate</h1><p>Costruisci un piccolo LLM, un reparto alla volta.</p><div class="mpLibrary"><span id="mpLibraryFill"></span></div><div id="mpMapGrid" class="mpMapGrid"></div><div class="mpModalActions"><button class="mpSecondary" id="mpNotebookBtn">📒 Taccuino adulto</button><button class="mpSecondary" id="mpMapHome">🏠 Giochi</button></div></div></div>
      <div class="mpShade" id="mpIntro"><div class="mpModal mpGuide"><div class="mpGuideTop"><div class="mpGibi"></div><small id="mpGuideEyebrow">CAPITOLO 1 · GUIDA</small><h1 id="mpGuideTitle">🗄️ L’Archivio dei dati</h1></div><div class="mpGuideProgress" id="mpGuideProgress"></div><div class="mpGuideCard" id="mpIntroText"></div><div class="mpGuideReadRow"><button class="mpSecondary" id="mpIntroSpeak">🔊 LEGGI QUESTA PAGINA</button><button class="mpSecondary" id="mpGuideAuto">🔁 LETTURA AUTOMATICA: SÌ</button></div><div class="mpModalActions"><button class="mpSecondary" id="mpGuideBack">← INDIETRO</button><button class="mpPrimary" id="mpGuideNext">AVANTI →</button><button class="mpPrimary" id="mpIntroGo" style="display:none">INIZIA IL CAPITOLO 🚀</button></div></div></div>
      <div class="mpShade" id="mpPredict"><div class="mpModal"><div class="mpBig">🔮</div><h2>Prima prevedi, poi calcola</h2><p id="mpPredictQ"></p><div class="mpPrediction" id="mpPredictAnswers"></div><div class="mpModalActions"><button class="mpPrimary" id="mpPredictGo" disabled>CALCOLA E CONTROLLA</button></div></div></div>
      <div class="mpShade" id="mpPhaseDone"><div class="mpModal"><div class="mpBig">✅</div><h2 id="mpDoneTitle">Archivio aggiornato</h2><p id="mpDoneText"></p><div class="mpModelMeta" id="mpDoneMeta"></div><div class="mpModalActions"><button class="mpSecondary" id="mpDoneInside">🔍 Guarda il calcolo</button><button class="mpPrimary" id="mpDoneNext">PROSEGUI ➜</button></div></div></div>
      <div class="mpShade" id="mpInsideModal"><div class="mpModal"><div class="mpBig">🔍</div><h2 id="mpInsideTitle">Dentro il predittore</h2><div id="mpInsideBody"></div><div class="mpModalActions"><button class="mpSecondary" id="mpInsideClose">CHIUDI</button></div></div></div>
      <div class="mpShade" id="mpQuiz"><div class="mpModal"><div class="mpBig">⭐</div><h2>Stella Spiegatore</h2><p id="mpQuizQ"></p><div class="mpQuizAnswers" id="mpQuizAnswers"></div><p id="mpQuizFeedback"></p><div class="mpModalActions"><button class="mpPrimary" id="mpQuizDone" style="display:none">VEDI IL RISULTATO</button></div></div></div>
      <div class="mpShade" id="mpWin"><div class="mpModal"><div class="mpBig">🏆</div><h1>Primo reparto restaurato!</h1><p>Hai costruito un modello linguistico semplice e hai visto che cambiare il corpus cambia ciò che la macchina considera probabile.</p><div class="mpStarCards" id="mpWinStars"></div><div class="mpExplain"><b>La macchina conta schemi, non controlla la verità.</b><br>Per costruire un LLM serviranno token, vettori, contesto, attenzione e addestramento.</div><div class="mpModalActions"><button class="mpSecondary" id="mpReplay">↻ Rigioca</button><button class="mpPrimary" id="mpWinMap">TORNA ALLA MAPPA</button></div></div></div>
      <div class="mpShade" id="mpNotebook"><div class="mpModal mpNotebook"><h1>📒 Taccuino per l’adulto</h1><div id="mpNotebookBody"></div><div class="mpModalActions"><button class="mpSecondary" id="mpMotionToggle">🎞 Movimento ridotto</button><button class="mpSecondary" id="mpUnlockPreview">🔓 Mostra anteprime</button><button class="mpSecondary" id="mpResetProgress">↻ Azzera questo gioco</button><button class="mpPrimary" id="mpNotebookClose">CHIUDI</button></div></div></div>
      <div id="mpToast" role="status" aria-live="polite"></div>
    `);
  }

  function speakElement(el){if(typeof root.speak==='function'&&el)root.speak({t:el.textContent,el});}
  function stopVoice(){if(typeof root.stopSpeak==='function')root.stopSpeak();}
  function voiceIsOn(){try{return typeof VOICEON!=='undefined'&&VOICEON;}catch(_){return false;}}
  function readParts(parts,manual){
    if(manual&&!voiceIsOn()){
      try{VOICEON=true;if(typeof save==='function')save();if(typeof initTTS==='function')initTTS();}catch(_){}
    }
    if(typeof root.speak==='function'&&parts&&parts.length)root.speak(parts);
  }
  let toastTimer=0;function toast(msg){const e=mp$('mpToast');e.textContent=msg;e.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.style.display='none',2600);}
  function activeStars(){return mp.activeChapter===1?mp.progress.chapter2.stars:mp.progress.stars;}
  function starsText(){const s=activeStars();return (s.builder?'⭐':'☆')+(s.investigator?'⭐':'☆')+(s.explainer?'⭐':'☆');}
  function updateStars(){mp$('mpStars').textContent=starsText();}
  function closeShades(){document.querySelectorAll('.mpShade').forEach(e=>e.style.display='none');}

  function ensureDefaults(pi){
    const phase=D.phases[pi];if(!phase)return;
    const choices=mp.progress.decisions[phase.id]||(mp.progress.decisions[phase.id]={});
    phase.documents.forEach(doc=>{if(!choices[doc.id])choices[doc.id]=phase.id==='variety'?'exclude':'use';});
  }

  function currentCorpus(){
    for(let i=0;i<=mp.phase&&i<D.phases.length;i++)ensureDefaults(i);
    return M.corpusFrom(D.phases,mp.progress.decisions,Math.min(mp.phase,D.phases.length-1));
  }

  function rebuild(prompt){
    mp.corpus=currentCorpus();mp.model=M.build(mp.corpus.map(x=>x.text),3);
    renderModel(prompt||mp$('mpPrompt').textContent||'La squadra');
    return mp.model;
  }

  function renderModel(prompt){
    prompt=prompt||'La squadra';mp$('mpPrompt').textContent=prompt;
    const pred=M.predict(mp.model,prompt),bars=mp$('mpBars');
    bars.innerHTML=pred.candidates.length?pred.candidates.slice(0,6).map(c=>`<div class="mpBar"><b>${esc(c.token)}</b><span class="mpTrack"><span class="mpFill" style="width:${Math.max(2,c.prob*100)}%"></span></span><span>${Math.round(c.prob*100)}%</span></div>`).join(''):'<p style="font-size:13px;color:#786d5c">Nessuna continuazione trovata per questo contesto.</p>';
    mp$('mpModelMeta').innerHTML=`<b>${mp.corpus.length}</b> documenti · <b>${mp.model.tokenCount}</b> token<br>Calcolo reale: <b>${mp.model.buildMs.toFixed(2)} ms</b><br><small>L’animazione sotto è una riproduzione rallentata, non il tempo del calcolo.</small>`;
  }

  function chapterChrome(chapter){
    const token=chapter===1;
    mp$('mpTopSub').textContent=token?'Capitolo 2 · Il Tagliatore di token':'Capitolo 1 · L’Archivio dei dati';
    mp$('mpStationTitle').textContent=token?'✂️ OFFICINA DEI TOKEN':'🛰️ STAZIONE AURORA';
    mp$('mpModelTitle').textContent=token?'✂️ TAGLIATORE TRASPARENTE':'⚙️ MODELLO DI PROVA';
    mp$('mpModelSubtitle').textContent=token?'Tre strategie reali a confronto':'Predittore a conteggio · non è un LLM';
    mp$('mpPromptLabel').textContent=token?'TESTO DA DIVIDERE':'CONTESTO OSSERVATO';
    mp$('mpScanLabel').textContent=token?'SEQUENZA DI TOKEN CALCOLATA':'RIPRODUZIONE DIDATTICA DEL CONTEGGIO';
    mp$('mpScanControls').style.display=token?'none':'flex';
  }

  function tokenVocabulary(){
    const ch=D.tokenChapter;
    if(mp.tokenMode==='word')return ch.wordVocabulary;
    if(mp.tokenMode==='character')return [];
    if(mp.tokenStage===1)return ch.fixedVocabulary.concat(mp.tokenFragments);
    return ch.subwordVocabulary;
  }

  function tokenText(){
    const ch=D.tokenChapter;
    if(mp.tokenStage===1)return ch.buildText;
    if(mp.tokenStage===2)return ch.finalTexts[mp.tokenFinalIndex];
    return ch.experimentText;
  }

  function tokenInspection(){return M.inspectTokenizer(tokenText(),tokenVocabulary(),mp.tokenMode);}
  function tokenChips(tokens){return tokens.map(t=>`<span class="mpToken ${t.startsWith('<sconosciuto:')?'mpUnknown':''}">${esc(t)}</span>`).join('');}
  function tokenStats(result){return `<div class="mpTokenStats"><div class="mpTokenStat"><b>${result.vocabularySize}</b>dimensione vocabolario</div><div class="mpTokenStat"><b>${result.sequenceLength}</b>lunghezza sequenza</div><div class="mpTokenStat"><b>${result.unknown}</b>token sconosciuti</div></div>`;}

  function renderTokenPanel(){
    const result=tokenInspection();mp$('mpPrompt').textContent=tokenText();mp$('mpBars').innerHTML=`<div class="mpTape">${tokenChips(result.tokens)}</div>`;
    mp$('mpModelMeta').innerHTML=`Strategia: <b>${mp.tokenMode==='word'?'parole intere':mp.tokenMode==='character'?'caratteri':'sottoparole'}</b><br>Vocabolario: <b>${result.vocabularySize}</b> token<br>Sequenza: <b>${result.sequenceLength}</b> token<br>Calcolo reale: <b>${result.buildMs.toFixed(3)} ms</b>`;
    mp$('mpScanToken').textContent=result.tokens.join(' · ')||'vuoto';
  }

  function renderTokenSteps(){
    const steps=[['🔬','Confronta','Tre strategie'],['🧰','Costruisci','Vocabolario riutilizzabile'],['🚂','Prova finale','Taglia nuovi testi']];
    mp$('mpSteps').innerHTML=steps.map((s,i)=>`<button class="mpStep ${i===mp.tokenStage?'active':''} ${i<mp.tokenStage||mp.progress.chapter2.complete?'done':''} ${i>mp.tokenStage&&!mp.progress.chapter2.complete?'lock':''}" ${i>mp.tokenStage&&!mp.progress.chapter2.complete?'disabled':''}><span class="em">${s[0]}</span><span><b>${i+1}. ${s[1]}</b><small>${s[2]}</small></span><span class="tick">${i<mp.tokenStage||mp.progress.chapter2.complete?'✓':''}</span></button>`).join('');
  }

  function renderTokenChapter(){
    stopScan();mp.activeChapter=1;chapterChrome(1);renderTokenSteps();mp$('mpAdaText').textContent=mp.tokenStage===0?'Prima proviamo gli estremi: parole intere e caratteri.':mp.tokenStage===1?'Costruiamo tessere che possano essere riutilizzate.':'Ora il tagliatore affronta testi nuovi.';
    const ch=D.tokenChapter;
    if(mp.tokenStage===0){
      const descriptions={word:'Poche tessere, ma “gattino” non è nel vocabolario.',character:'Nessuna parola sconosciuta, ma la sequenza diventa molto lunga.',subword:'Frammenti riutilizzabili: una via di mezzo utile.'};
      mp$('mpMission').innerHTML=`<div class="mpMissionTitle"><span class="em">🔬</span><div><h1>Quanto grandi devono essere i pezzi?</h1><p id="mpGoalText">Confronta tre modi reali di dividere la stessa frase.</p></div></div><div class="mpExplain">Un tokenizer non è universale: strategie diverse producono vocabolari e sequenze differenti.</div><div class="mpTokenizerModes">${['word','character','subword'].map((mode,i)=>`<button class="mpTokenizerMode ${mp.tokenMode===mode?'sel':''}" data-token-mode="${mode}"><b>${['PAROLE INTERE','CARATTERI','SOTTOPAROLE'][i]}</b>${descriptions[mode]}</button>`).join('')}</div><div id="mpTokenLive"></div>`;
      mp$('mpMissionFoot').innerHTML='<span class="mpStatus">Osserva come cambiano i numeri, poi scegli la soluzione più equilibrata.</span><button class="mpPrimary" id="mpTokenContinue">COSTRUISCI IL TAGLIATORE ➜</button>';
      document.querySelectorAll('[data-token-mode]').forEach(b=>b.onclick=()=>{mp.tokenMode=b.dataset.tokenMode;if(mp.tokenMode==='subword')mp.progress.chapter2.stars.investigator=true;persist();renderTokenChapter();});
      mp$('mpTokenContinue').onclick=()=>{mp.tokenStage=1;mp.tokenMode='subword';mp.progress.chapter2.stage=1;persist();renderTokenChapter();};
    }else if(mp.tokenStage===1){
      mp$('mpMission').innerHTML=`<div class="mpMissionTitle"><span class="em">🧰</span><div><h1>Costruisci il vocabolario</h1><p id="mpGoalText">Scegli tessere capaci di formare gatto, gatti e gattino.</p></div></div><div class="mpExplain">Cerca un frammento comune e finali riutilizzabili. Il tagliatore prova davvero la tua selezione.</div><div class="mpFragmentTray">${ch.fragmentOptions.map(f=>`<button class="mpFragment ${mp.tokenFragments.includes(f)?'sel':''}" data-fragment="${esc(f)}">${esc(f)}</button>`).join('')}</div><div id="mpTokenLive"></div>`;
      mp$('mpMissionFoot').innerHTML='<span class="mpStatus">Nessun errore toglie progressi: modifica le tessere e riprova.</span><button class="mpPrimary" id="mpTokenCheck">PROVA IL VOCABOLARIO</button>';
      document.querySelectorAll('[data-fragment]').forEach(b=>b.onclick=()=>{const f=b.dataset.fragment,i=mp.tokenFragments.indexOf(f);if(i>=0)mp.tokenFragments.splice(i,1);else mp.tokenFragments.push(f);mp.progress.chapter2.fragments=mp.tokenFragments.slice();persist();renderTokenChapter();});
      mp$('mpTokenCheck').onclick=checkTokenBuild;
    }else{
      const result=tokenInspection();
      mp$('mpMission').innerHTML=`<div class="mpMissionTitle"><span class="em">🚂</span><div><h1>Taglia testi mai provati</h1><p id="mpGoalText">Il vocabolario costruito viene applicato a nuove frasi.</p></div></div><div class="mpExplain">Ogni clic ricalcola token, dimensione del vocabolario e lunghezza della sequenza.</div><div class="mpPrediction">${ch.finalTexts.map((t,i)=>`<button class="${i===mp.tokenFinalIndex?'sel':''}" data-final-text="${i}">${esc(t)}</button>`).join('')}</div><div class="mpTape">${tokenChips(result.tokens)}</div>${tokenStats(result)}`;
      mp$('mpMissionFoot').innerHTML='<span class="mpStatus">Una parola nuova può ancora richiedere tessere aggiuntive: il vocabolario non conosce tutto.</span><button class="mpPrimary" id="mpTokenFinish">CONCLUDI IL CAPITOLO</button>';
      document.querySelectorAll('[data-final-text]').forEach(b=>b.onclick=()=>{mp.tokenFinalIndex=+b.dataset.finalText;renderTokenChapter();});mp$('mpTokenFinish').onclick=openQuiz;
    }
    const live=mp$('mpTokenLive');if(live){const result=tokenInspection();live.innerHTML=`<div class="mpTape">${tokenChips(result.tokens)}</div>${tokenStats(result)}`;}renderTokenPanel();updateStars();
  }

  function checkTokenBuild(){
    const result=tokenInspection(),hasAll=D.tokenChapter.requiredFragments.every(f=>mp.tokenFragments.includes(f));
    if(result.unknown||!hasAll){toast('Manca ancora qualche tessera utile. Cerca la parte comune “gatt” e i finali delle tre parole.');return;}
    mp.progress.chapter2.stars.builder=true;mp.progress.chapter2.fragments=mp.tokenFragments.slice();mp.tokenStage=2;mp.progress.chapter2.stage=2;persist();renderTokenChapter();
  }

  function startTokenChapter(){closeShades();mp.activeChapter=1;mp.tokenStage=mp.progress.chapter2.complete?0:Math.min(2,Number(mp.progress.chapter2.stage)||0);mp.tokenMode=mp.tokenStage?'subword':'word';mp.tokenFragments=mp.tokenStage?mp.progress.chapter2.fragments.slice():[];show('mpApp','block');renderTokenChapter();}

  function renderSteps(){
    const names=[...D.phases.map(p=>({icon:p.icon,title:p.short,sub:p.title})),{icon:'🛰️',title:'Ripara',sub:'Rapporti danneggiati'}];
    mp$('mpSteps').innerHTML=names.map((x,i)=>`<button class="mpStep ${i===mp.phase?'active':''} ${i<mp.phase||mp.progress.complete?'done':''} ${i>mp.phase&&!mp.progress.complete?'lock':''}" ${i>mp.phase&&!mp.progress.complete?'disabled':''} data-step="${i}"><span class="em">${x.icon}</span><span><b>${i+1}. ${x.title}</b><small>${x.sub}</small></span><span class="tick">${i<mp.phase||mp.progress.complete?'✓':''}</span></button>`).join('');
  }

  function renderPhase(){
    mp.view='mission';mp.wrong=[];mp.prediction=null;ensureDefaults(mp.phase);renderSteps();
    if(mp.phase>=D.phases.length){renderFinal();return;}
    const phase=D.phases[mp.phase],choices=mp.progress.decisions[phase.id];
    mp$('mpAdaText').textContent=phase.id==='clean'?'Prima controlliamo se ogni documento è utile e leggibile.':phase.id==='privacy'?'Ora chiediamoci: serve davvero, e possiamo usarlo?':'Un archivio vario non è un archivio riempito a caso.';
    mp$('mpMission').innerHTML=`<div class="mpMissionTitle"><span class="em">${phase.icon}</span><div><h1>${esc(phase.title)}</h1><p id="mpGoalText">${esc(phase.goal)}</p></div></div><div class="mpExplain">${esc(phase.explain)}</div><div class="mpDocGrid">${phase.documents.map(doc=>docHTML(doc,choices[doc.id])).join('')}</div>`;
    mp$('mpMissionFoot').innerHTML=`<span class="mpStatus">Scegli che cosa fare con ogni documento. Il modello a destra cambia davvero.</span><button class="mpSecondary" id="mpObserve">▶ OSSERVA IL CONTEGGIO</button><button class="mpPrimary" id="mpReview">CONTROLLA LE SCELTE</button>`;
    bindDocChoices();mp$('mpObserve').onclick=startScan;mp$('mpReview').onclick=reviewPhase;rebuild();
  }

  function docHTML(doc,choice){
    return `<article class="mpDoc" id="mpDoc-${doc.id}"><span class="mpDocBadge">${esc(doc.badge)}</span><h3>${esc(doc.title)}</h3><div class="mpSource">${esc(doc.source)}</div><p class="mpDocText" id="mpText-${doc.id}">${esc(choice==='anonymize'&&doc.safeText?doc.safeText:doc.text)}</p><div class="mpActions">${doc.actions.map(a=>`<button class="mpChoice ${choice===a?'sel':''}" data-doc="${doc.id}" data-action="${a}">${esc(D.actions[a])}</button>`).join('')}</div><div class="mpDocNote">${esc(doc.note)}</div></article>`;
  }

  function bindDocChoices(){
    const phase=D.phases[mp.phase];document.querySelectorAll('#mpMission [data-doc]').forEach(b=>b.onclick=()=>{
      mp.progress.decisions[phase.id][b.dataset.doc]=b.dataset.action;persist();
      const doc=phase.documents.find(x=>x.id===b.dataset.doc),card=mp$('mpDoc-'+doc.id);
      card.classList.remove('bad','good');card.querySelectorAll('.mpChoice').forEach(x=>x.classList.toggle('sel',x===b));
      mp$('mpText-'+doc.id).textContent=b.dataset.action==='anonymize'&&doc.safeText?doc.safeText:doc.text;rebuild();
    });
  }

  function reviewPhase(){
    const phase=D.phases[mp.phase],v=M.validatePhase(phase,mp.progress.decisions[phase.id]);
    if(!v.ok){
      mp.wrong=v.wrong;phase.documents.forEach(doc=>{const card=mp$('mpDoc-'+doc.id);card.classList.toggle('bad',v.wrong.includes(doc.id));card.classList.toggle('good',!v.wrong.includes(doc.id));});
      toast(v.missing.length?'Manca ancora qualche scelta.':'Osserva le schede evidenziate: puoi correggere e riprovare.');return;
    }
    const p=phase.prediction;mp.prediction=null;mp$('mpPredictQ').textContent=p.q;mp$('mpPredictAnswers').innerHTML=p.answers.map((a,i)=>`<button data-pred="${i}">${esc(a)}</button>`).join('');mp$('mpPredictGo').disabled=true;
    document.querySelectorAll('#mpPredictAnswers button').forEach(b=>b.onclick=()=>{mp.prediction=+b.dataset.pred;document.querySelectorAll('#mpPredictAnswers button').forEach(x=>x.classList.toggle('sel',x===b));mp$('mpPredictGo').disabled=false;});
    show('mpPredict');
  }

  function finishPrediction(){
    hide('mpPredict');const phase=D.phases[mp.phase],correct=mp.prediction===phase.prediction.correct;if(correct)mp.progress.stars.investigator=true;
    rebuild();persist();startScan();
    mp$('mpDoneTitle').textContent=phase.title+' completato';
    mp$('mpDoneText').textContent=(correct?'La previsione era corretta. ':'Ora puoi confrontare la tua previsione con il risultato. ')+phase.explain;
    mp$('mpDoneMeta').innerHTML=`Il nuovo corpus contiene <b>${mp.corpus.length} documenti</b> e <b>${mp.model.tokenCount} token</b>. Il conteggio è stato calcolato davvero in <b>${mp.model.buildMs.toFixed(2)} ms</b>.`;
    show('mpPhaseDone');updateStars();
  }

  function nextPhase(){
    hide('mpPhaseDone');mp.phase=Math.min(D.phases.length,mp.phase+1);mp.progress.stage=Math.max(mp.progress.stage,mp.phase);persist();renderPhase();
  }

  function renderFinal(){
    renderSteps();mp$('mpAdaText').textContent='La macchina propone possibilità. Il diario originale resta una fonte diversa.';
    mp$('mpMission').innerHTML=`<div class="mpMissionTitle"><span class="em">🛰️</span><div><h1>Ripara i rapporti danneggiati</h1><p id="mpGoalText">Usa il corpus selezionato per proporre continuazioni plausibili.</p></div></div><div class="mpExplain"><b>Attenzione:</b> una parola probabile non dimostra che l’evento sia accaduto davvero.</div><div class="mpResultCards">${D.finalReports.map((r,i)=>`<article class="mpResult"><small>${esc(r.source)}</small><strong>${esc(r.prompt)} …</strong><span class="answer" id="mpGenerated-${i}">${mp.generated[i]?esc(mp.generated[i].token):'?'}</span><button class="mpSecondary" data-generate="${i}">${mp.generated[i]?'RIPROVA':'GENERA'}</button></article>`).join('')}</div>`;
    mp$('mpMissionFoot').innerHTML=`<span class="mpStatus">Genera tutti e tre i frammenti, poi controlla che cosa hai imparato.</span><button class="mpPrimary" id="mpFinalCheck" ${Object.keys(mp.generated).length<3?'disabled':''}>CONCLUDI IL CAPITOLO</button>`;
    document.querySelectorAll('[data-generate]').forEach(b=>b.onclick=()=>generate(+b.dataset.generate));mp$('mpFinalCheck').onclick=openQuiz;rebuild('La squadra controlla');
  }

  function seededRandom(seed){let x=(seed*9301+49297)%233280;return()=>{x=(x*9301+49297)%233280;return x/233280;};}
  function generate(i){
    const report=D.finalReports[i],pred=M.predict(mp.model,report.prompt),picked=M.sample(pred,seededRandom(Date.now()+i*17));
    if(!picked){toast('Il corpus non contiene ancora una continuazione per questo frammento.');return;}
    mp.generated[i]=picked;renderFinal();renderModel(report.prompt);mp$('mpGenerated-'+i).textContent=picked.token+' · '+Math.round(picked.prob*100)+'%';
  }

  function openQuiz(){
    if(mp.activeChapter===0)mp.progress.stars.builder=true;persist();updateStars();const q=mp.activeChapter===1?D.tokenChapter.quiz:D.explainer;mp$('mpQuizQ').textContent=q.q;mp$('mpQuizFeedback').textContent='';mp$('mpQuizDone').style.display='none';mp$('mpQuizAnswers').innerHTML=q.answers.map((a,i)=>`<button data-quiz="${i}">${esc(a)}</button>`).join('');
    document.querySelectorAll('#mpQuizAnswers button').forEach(b=>b.onclick=()=>answerQuiz(+b.dataset.quiz,b));show('mpQuiz');
  }

  function answerQuiz(i,button){
    const q=mp.activeChapter===1?D.tokenChapter.quiz:D.explainer,correct=i===q.correct;document.querySelectorAll('#mpQuizAnswers button').forEach(b=>b.classList.remove('right','wrong'));button.classList.add(correct?'right':'wrong');mp$('mpQuizFeedback').textContent=q.feedback[i];
    if(correct){activeStars().explainer=true;persist();updateStars();mp$('mpQuizDone').style.display='inline-block';}
  }

  function completeChapter(){
    hide('mpQuiz');if(mp.activeChapter===1){mp.progress.chapter2.complete=true;mp.progress.chapter2.stage=3;}else{mp.progress.complete=true;mp.progress.stage=4;}persist();
    const win=mp$('mpWin');win.querySelector('h1').textContent=mp.activeChapter===1?'Secondo reparto restaurato!':'Primo reparto restaurato!';win.querySelector('p').textContent=mp.activeChapter===1?'Hai costruito un tokenizer di sottoparole e osservato come vocabolario e sequenza cambiano davvero.':'Hai costruito un modello linguistico semplice e hai visto che cambiare il corpus cambia ciò che la macchina considera probabile.';
    win.querySelector('.mpExplain').innerHTML=mp.activeChapter===1?'<b>I token non coincidono sempre con parole intere.</b><br>Il tokenizer divide il testo prima che il modello possa elaborarlo.':'<b>La macchina conta schemi, non controlla la verità.</b><br>Per costruire un LLM serviranno token, vettori, contesto, attenzione e addestramento.';
    mp$('mpWinStars').innerHTML=starCards();show('mpWin');
  }
  function starCards(){const s=activeStars();return `<div class="mpStarCard ${s.builder?'on':''}"><b>⭐ Costruttore</b>${mp.activeChapter===1?'Hai costruito il vocabolario.':'Hai usato il modello.'}</div><div class="mpStarCard ${s.investigator?'on':''}"><b>⭐ Investigatore</b>Hai previsto un effetto.</div><div class="mpStarCard ${s.explainer?'on':''}"><b>⭐ Spiegatore</b>Hai spiegato un caso nuovo.</div>`;}

  function startScan(){
    stopScan();const all=[];mp.corpus.forEach(d=>M.tokenize(d.text).forEach(t=>all.push(t)));mp.scan.tokens=all;mp.scan.index=0;mp.scan.paused=false;if(mp.progress.settings.reducedMotion){mp$('mpScanToken').textContent=all.length?all[all.length-1]:'vuoto';return;}scanTick();
  }
  function scanTick(){if(mp.scan.paused||!mp.scan.tokens.length)return;mp$('mpScanToken').textContent=mp.scan.tokens[mp.scan.index%mp.scan.tokens.length];mp.scan.index++;mp.scan.timer=setTimeout(scanTick,Math.max(90,420/mp.progress.settings.speed));}
  function pauseScan(){mp.scan.paused=true;clearTimeout(mp.scan.timer);}
  function stopScan(){clearTimeout(mp.scan.timer);mp.scan.paused=true;}
  function stepScan(){pauseScan();if(!mp.scan.tokens.length)startScan();pauseScan();if(mp.scan.tokens.length){mp$('mpScanToken').textContent=mp.scan.tokens[mp.scan.index%mp.scan.tokens.length];mp.scan.index++;}}
  function toggleSpeed(){const vals=[.5,1,2],i=vals.indexOf(mp.progress.settings.speed);mp.progress.settings.speed=vals[(i+1)%vals.length];mp$('mpScanSpeed').textContent=mp.progress.settings.speed+'×';persist();if(!mp.scan.paused){pauseScan();mp.scan.paused=false;scanTick();}}

  function openInside(){
    if(mp.activeChapter===1){
      const result=tokenInspection();mp$('mpInsideTitle').textContent='Dentro il tagliatore di token';
      mp$('mpInsideBody').innerHTML=`<p>Il testo viene analizzato davvero con la strategia e il vocabolario attivi.</p><div class="mpTokenCloud">${tokenChips(result.tokens)}</div>${tokenStats(result)}<div class="mpFormula">testo = ${esc(tokenText())}\nstrategia = ${esc(result.mode)}\nvocabolario = [${esc(result.vocabulary.join(' · '))}]\ndimensione vocabolario = ${result.vocabularySize}\ntoken prodotti = [${esc(result.tokens.join(' · '))}]\nlunghezza sequenza = ${result.sequenceLength}\ntoken sconosciuti = ${result.unknown}\ntempo reale = ${result.buildMs.toFixed(3)} ms</div><div class="mpExplain"><b>Questi risultati non sono preparati.</b> Cambiando tessere o testo, il tagliatore ricalcola la sequenza. I tokenizer dei modelli reali possono usare regole e vocabolari differenti.</div>`;show('mpInsideModal');return;
    }
    mp$('mpInsideTitle').textContent='Dentro il predittore';
    const prompt=mp$('mpPrompt').textContent,pred=M.predict(mp.model,prompt),tokens=M.tokenize(mp.corpus.map(x=>x.text).join(' '));
    mp$('mpInsideBody').innerHTML=`<p>Il predittore cerca il contesto più lungo già incontrato, poi conta quale token viene dopo.</p><div class="mpTokenCloud">${tokens.slice(0,80).map(t=>`<span class="mpToken">${esc(t)}</span>`).join('')}${tokens.length>80?'<span class="mpToken">…</span>':''}</div><div class="mpFormula">contesto = [${esc(pred.context.join(' · '))||'nessuno'}]\nconteggi = ${esc(pred.candidates.map(c=>c.token+': '+c.count).join(', ')||'nessuno')}\ntotale = ${pred.total}\nprobabilità(token) = conteggio(token) / ${pred.total||'totale'}\n\nmodello: n-gram a conteggio, contesto massimo ${mp.model.context}\ndocumenti: ${mp.corpus.length}\ntoken: ${mp.model.tokenCount}\ntransizioni contate: ${mp.model.transitions}\ntempo reale: ${mp.model.buildMs.toFixed(3)} ms</div><div class="mpExplain"><b>Questo non è ancora un LLM.</b> Non usa embedding, attenzione o una rete neurale. È il nostro modello di prova trasparente.</div><div class="mpGloss">${D.glossary.map(g=>`<div><b>${esc(g.term)}</b><small>${esc(g.metaphor)}</small><p>${esc(g.definition)}</p></div>`).join('')}</div>`;show('mpInsideModal');
  }

  function guideParts(){
    const area=mp$('mpIntroText'),parts=[];
    const heading=area.querySelector('h2');if(heading)parts.push({t:heading.textContent,el:heading});
    area.querySelectorAll('[data-guide-copy]').forEach(el=>parts.push({t:el.textContent,el}));
    return parts;
  }

  function readGuide(manual){readParts(guideParts(),manual);}

  function renderGuide(shouldAuto){
    stopVoice();const chapter=D.chapters[mp.guideChapter],guide=D.chapterGuides[mp.guideChapter],page=mp.guidePage;
    const pages=[
      {title:'Il problema da risolvere',icon:'🧩',copy:guide.problem},
      {title:'Che cosa scoprirai',icon:'🎯',copy:guide.purpose},
      {title:'Che cosa farai nel gioco',icon:'🛠️',copy:guide.activity},
      {title:'Le parole nuove',icon:'🔤',terms:guide.terms}
    ],content=pages[page];
    mp$('mpGuideEyebrow').textContent='CAPITOLO '+chapter.n+' · GUIDA '+(page+1)+' DI '+pages.length;
    mp$('mpGuideTitle').textContent=chapter.icon+' '+chapter.title;
    mp$('mpGuideProgress').innerHTML=pages.map((_,i)=>`<span class="mpGuideDot ${i===page?'on':''}" aria-label="Pagina ${i+1}"></span>`).join('');
    if(content.terms){
      mp$('mpIntroText').innerHTML=`<h2>${content.icon} ${content.title}</h2><p class="mpGuideCopy" data-guide-copy>Queste parole sembrano difficili, ma indicano idee precise. Puoi ascoltarle una alla volta.</p><div class="mpTerms">${content.terms.map((t,i)=>`<article class="mpTerm"><h3 data-guide-copy>${esc(t.term)}</h3><button data-term-read="${i}" aria-label="Leggi ${esc(t.term)}">🔊</button><p data-guide-copy>${esc(t.simple)}</p></article>`).join('')}</div>`;
      document.querySelectorAll('#mpIntroText [data-term-read]').forEach(b=>b.onclick=()=>{const card=b.parentElement,h=card.querySelector('h3'),p=card.querySelector('p');readParts([{t:h.textContent,el:h},{t:p.textContent,el:p}],true);});
    }else mp$('mpIntroText').innerHTML=`<h2>${content.icon} ${content.title}</h2><p class="mpGuideCopy" data-guide-copy>${esc(content.copy)}</p>`;
    const playable=mp.guideChapter===0||(mp.guideChapter===1&&mp.progress.complete);
    mp$('mpGuideBack').textContent=page===0?'← MAPPA':'← INDIETRO';mp$('mpGuideNext').style.display=page<pages.length-1?'inline-block':'none';mp$('mpIntroGo').style.display=page===pages.length-1?'inline-block':'none';mp$('mpIntroGo').textContent=playable?'INIZIA IL CAPITOLO 🚀':'TORNA ALLA MAPPA';mp$('mpGuideAuto').textContent='🔁 LETTURA AUTOMATICA: '+(mp.progress.settings.autoRead?'SÌ':'NO');
    if(shouldAuto&&mp.progress.settings.autoRead&&voiceIsOn())setTimeout(()=>{if(mp$('mpIntro').style.display==='flex')readGuide(false);},180);
  }

  function openGuide(chapterIndex){
    mp.guideChapter=Math.max(0,Math.min(D.chapters.length-1,chapterIndex));mp.guidePage=0;hide('mpMap');show('mpIntro');renderGuide(true);
  }

  function guideBack(){
    if(mp.guidePage>0){mp.guidePage--;renderGuide(true);}else{stopVoice();hide('mpIntro');renderMap();show('mpMap');}
  }

  function guideNext(){if(mp.guidePage<3){mp.guidePage++;renderGuide(true);}}

  function finishGuide(){
    stopVoice();hide('mpIntro');if(mp.guideChapter===0)startChapter();else if(mp.guideChapter===1&&mp.progress.complete)startTokenChapter();else{renderMap();show('mpMap');}
  }

  function renderMap(){
    mp$('mpLibraryFill').style.width=((mp.progress.complete?10:0)+(mp.progress.chapter2.complete?10:0))+'%';mp$('mpMapGrid').innerHTML=D.chapters.map((c,i)=>{
      const open=i===0||(i===1&&mp.progress.complete)||mp.progress.settings.previewAll,done=(i===0&&mp.progress.complete)||(i===1&&mp.progress.chapter2.complete),klass=done?'done':open?'':'lock';
      const suffix=done?' · RIPROVA':i===1&&mp.progress.complete?' · GIOCA':i>0?(open?' · ANTEPRIMA':' · GUIDA DISPONIBILE'):'';
      return `<button class="mpRoom ${klass}" data-room="${i}"><span class="em">${done?'✅':open?c.icon:'🔒'}</span><b>${c.n}. ${esc(c.title)}</b><small>${esc(c.tech)}${suffix}</small></button>`;
    }).join('');
    document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>openGuide(+b.dataset.room));updateStars();
  }

  function openMap(){stopVoice();stopScan();renderMap();show('mpMap');}
  function openNotebook(){
    mp$('mpNotebookBody').innerHTML=`<section><h2>Progresso</h2><p>Capitolo 1: <b>${mp.progress.complete?'completato':'in corso'}</b> · ${Object.values(mp.progress.stars).filter(Boolean).length}/3 stelle.</p><p>Capitolo 2: <b>${mp.progress.chapter2.complete?'completato':mp.progress.complete?'disponibile':'da sbloccare'}</b> · ${Object.values(mp.progress.chapter2.stars).filter(Boolean).length}/3 stelle.</p></section><section><h2>Concetti incontrati</h2><p>Corpus, qualità, frequenza e probabilità${mp.progress.chapter2.stage?', token, tokenizzazione, vocabolario, sottoparole e lunghezza della sequenza':''}.</p></section><section><h2>Parlatene insieme</h2><p><b>${mp.progress.chapter2.stage?'Che differenza hai visto tra parole intere, caratteri e sottoparole?':'Che cosa è successo quando hai lasciato molte copie dello stesso rapporto nel corpus?'}</b></p></section><section><h2>Dati</h2><p>Progressi e scelte restano soltanto su questo dispositivo. Il gioco non invia testi a servizi esterni.</p></section>`;mp$('mpMotionToggle').textContent=mp.progress.settings.reducedMotion?'🎞 Movimento ridotto: sì':'🎞 Movimento ridotto: no';mp$('mpUnlockPreview').textContent=mp.progress.settings.previewAll?'🔒 Nascondi anteprime':'🔓 Mostra anteprime';show('mpNotebook');
  }

  function resetProgress(){
    if(!root.confirm||root.confirm('Azzerare soltanto i progressi della Macchina delle Parole?')){try{localStorage.removeItem(SAVE);}catch(_){}mp.progress={version:1,stage:0,complete:false,stars:{builder:false,investigator:false,explainer:false},chapter2:{stage:0,complete:false,fragments:[],stars:{builder:false,investigator:false,explainer:false}},decisions:{},settings:{reducedMotion:false,speed:1,previewAll:false,autoRead:true}};mp.phase=0;mp.tokenStage=0;mp.generated={};hide('mpNotebook');renderMap();toast('Progressi della Macchina delle Parole azzerati.');}
  }

  function startChapter(){closeShades();mp.activeChapter=0;chapterChrome(0);mp.phase=mp.progress.complete?0:Math.min(D.phases.length,Number(mp.progress.stage)||0);mp.generated={};show('mpApp','block');renderPhase();}
  function enter(){
    try{paused=true;}catch(_){}stopVoice();['modeSel','menu','hud','joy'].forEach(hide);show('mpApp','block');mp.on=true;renderMap();show('mpMap');if(typeof root.initTTS==='function')root.initTTS();
  }
  function exit(){mp.on=false;stopScan();stopVoice();hide('mpApp');closeShades();if(typeof root.showModeSel==='function')root.showModeSel();}

  installUI();
  mp$('mpHome').onclick=exit;mp$('mpMapHome').onclick=exit;mp$('mpMapBtn').onclick=openMap;mp$('mpModelToggle').onclick=()=>mp$('mpRight').classList.toggle('closed');mp$('mpCloseModel').onclick=()=>mp$('mpRight').classList.add('closed');
  mp$('mpSpeak').onclick=()=>speakElement(mp$('mpGoalText')||mp$('mpMission'));mp$('mpIntroSpeak').onclick=()=>readGuide(true);mp$('mpGuideBack').onclick=guideBack;mp$('mpGuideNext').onclick=guideNext;mp$('mpIntroGo').onclick=finishGuide;mp$('mpGuideAuto').onclick=()=>{mp.progress.settings.autoRead=!mp.progress.settings.autoRead;persist();renderGuide(false);};
  mp$('mpScanPlay').onclick=()=>{if(!mp.scan.tokens.length)startScan();else if(mp.scan.paused){mp.scan.paused=false;scanTick();}};mp$('mpScanPause').onclick=pauseScan;mp$('mpScanStep').onclick=stepScan;mp$('mpScanSpeed').onclick=toggleSpeed;
  mp$('mpInside').onclick=openInside;mp$('mpInsideClose').onclick=()=>hide('mpInsideModal');mp$('mpDoneInside').onclick=openInside;mp$('mpPredictGo').onclick=finishPrediction;mp$('mpDoneNext').onclick=nextPhase;
  mp$('mpQuizDone').onclick=completeChapter;mp$('mpWinMap').onclick=()=>{hide('mpWin');openMap();};mp$('mpReplay').onclick=()=>{hide('mpWin');if(mp.activeChapter===1){mp.tokenStage=0;mp.tokenMode='word';mp.tokenFragments=[];renderTokenChapter();}else{mp.progress.stage=0;mp.phase=0;mp.generated={};renderPhase();}};
  mp$('mpNotebookBtn').onclick=openNotebook;mp$('mpNotebookClose').onclick=()=>hide('mpNotebook');mp$('mpUnlockPreview').onclick=()=>{mp.progress.settings.previewAll=!mp.progress.settings.previewAll;persist();hide('mpNotebook');renderMap();};mp$('mpResetProgress').onclick=resetProgress;
  mp$('mpMotionToggle').onclick=()=>{mp.progress.settings.reducedMotion=!mp.progress.settings.reducedMotion;persist();pauseScan();openNotebook();};

  if(typeof root.registerGame==='function')root.registerGame({id:'macchina-parole',emoji:'⚙️',nm:['La Macchina delle Parole','La Macchina delle Parole'],sub:['Costruisci un piccolo LLM nella Biblioteca delle Storie Spezzate','Costruisci un piccolo LLM'],colore:'linear-gradient(180deg,#3f8190,#5c3f75)',enter});
  root.__MP={state:mp,data:D,model:M,enter,exit,start:startChapter,render:renderPhase,rebuild,validate:(pi,choices)=>M.validatePhase(D.phases[pi],choices),reset:resetProgress};
})(typeof window!=='undefined'?window:globalThis);
