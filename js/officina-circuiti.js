/* ============================================================
   L'OFFICINA DI GABRI ⚡ — Banco 1: CIRCUITI (il Cuore di Gibi)
   Gibi il robottino è spento: per riaccendere il suo cuore
   bisogna imparare i circuiti VERI. Gli elettroni sono palline
   gialle che scorrono davvero (piccolo solver nodale: serie,
   parallelo, LED con verso e bruciatura, condensatore che si
   carica, transistor-rubinetto, sensore di luce).
   La lettura è di contorno: consegne scritte brevi, 🔊 senza
   penalità. 3⭐ = niente LED bruciati e niente Aiutino.
   Salvataggi: localStorage gabri_off_c. Test hook: window.__OC
   ============================================================ */

/* ---------- costanti di tuning ---------- */
const OC_VOLT=4.5;        /* pila (V) */
const OC_RINT=0.6;        /* resistenza interna pila */
const OC_RWIRE=0.05;      /* resistenza filo */
const OC_RLAMP=15;        /* lampadina */
const OC_RRES=470;        /* resistenza */
const OC_LED_VF=2.0, OC_LED_RON=6;
const OC_LED_LIT=0.004;   /* A: LED acceso */
const OC_LED_BURN=0.03;   /* A: oltre → si brucia */
const OC_LED_BURN_T=0.45; /* s di sovracorrente prima del PUFF */
const OC_LAMP_LIT=0.15, OC_LAMP_BRIGHT=0.8; /* W */
const OC_CAP_F=0.15;      /* condensatore (F, gigante apposta) */
const OC_SW_R=0.02;
const OC_NPN_VBE=0.6, OC_NPN_RB=100, OC_NPN_RCE=1.5, OC_NPN_IB=0.0008;
const OC_RMOT=10, OC_MOT_ON=0.3;
const OC_RBUZ=20, OC_BUZ_ON=0.2;
const OC_LDR_SUN=30, OC_LDR_NIGHT=80000;
const OC_WIN_HOLD=0.9;    /* s di obiettivo raggiunto per vincere */
const OC_ELEC_SP=16;      /* px tra un elettrone e l'altro */

/* ---------- stile + HTML ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#oc { position:absolute; inset:0; display:none; z-index:8; background:radial-gradient(circle at 50% 25%,#5b5075,#302a49 62%,#211d35); }',
  '#oc:before { content:"";position:absolute;inset:0;opacity:.12;pointer-events:none;background-image:linear-gradient(90deg,transparent 49%,#ffd35c 50%,transparent 51%),linear-gradient(transparent 49%,#ffd35c 50%,transparent 51%);background-size:80px 80px; }',
  '#ocCv { position:absolute; inset:0; touch-action:none; }',
  '#ocHud { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-start; padding:10px 12px; z-index:9; pointer-events:none; gap:6px; }',
  '#ocHud .hudBox { pointer-events:auto; }',
  '#ocBtns { pointer-events:auto; display:flex; gap:8px; }',
  '#ocBtns .hudBtn { width:auto;min-width:48px;padding:5px 9px;display:flex;gap:5px;align-items:center;justify-content:center; }',
  '#ocBtns .bl { font-size:10px;font-weight:700;letter-spacing:.03em;display:block; }',
  '#ocGoal { position:absolute; top:62px; left:50%; transform:translateX(-50%); z-index:9; background:rgba(255,248,225,.96); border:3px solid #f0c95c; border-radius:16px; padding:8px 14px; font-size:clamp(16px,3.4vw,21px); color:#5c4300; width:min(680px,80vw); text-align:center; display:none; line-height:1.4;box-shadow:0 5px 18px rgba(0,0,0,.18); }',
  '#ocGibiDesk { position:absolute;left:10px;bottom:86px;width:clamp(70px,11vw,135px);height:clamp(92px,16vw,180px);z-index:7;background:url("assets/characters/gibi.png") center/contain no-repeat;filter:drop-shadow(0 8px 8px rgba(0,0,0,.35));pointer-events:none;transition:transform .25s; }',
  '#ocGoal button { background:none; border:none; font-size:20px; cursor:pointer; padding:0 4px; font-family:inherit; }',
  '#ocPalBar { position:absolute; bottom:0; left:0; right:0; z-index:9; display:none; justify-content:center; gap:8px; padding:8px 10px calc(10px + env(safe-area-inset-bottom)); flex-wrap:wrap; background:rgba(20,16,34,.72); }',
  '#ocPalBar.sandbox { justify-content:flex-start; flex-wrap:nowrap; overflow-x:auto; overflow-y:hidden; scrollbar-color:#ffd35c #2b2641; }',
  '#ocPalBar.sandbox .ocTool { flex:0 0 auto; }',
  '.ocTool { border:none; border-radius:16px; padding:8px 10px; min-width:64px; cursor:pointer; font-family:inherit; background:#3a3357; color:#fff; box-shadow:0 4px 0 rgba(0,0,0,.35); text-align:center; position:relative; }',
  '.ocTool:active { transform:translateY(2px); box-shadow:none; }',
  '.ocTool.sel { background:linear-gradient(180deg,#ffd35c,#f0a818); color:#4a3200; }',
  '.ocTool .ti { width:64px; height:40px; margin:0 auto; display:block; font-size:26px; line-height:40px; }',
  '.ocTool canvas.ti { object-fit:contain; }',
  '.ocTool .tn { font-size:11px; font-weight:bold; display:block; margin-top:2px; letter-spacing:.04em; }',
  '.ocTool .tc { position:absolute; top:-7px; right:-5px; background:#e05555; color:#fff; border-radius:10px; font-size:12px; font-weight:bold; padding:1px 7px; }',
  '.ocTool .tc.inf { background:#3cba54; font-size:15px; min-width:18px; }',
  '#ocInfo { position:absolute; z-index:10; right:12px; top:62px; width:min(330px,calc(100vw - 24px)); max-height:calc(100vh - 170px); overflow:auto; box-sizing:border-box; display:none; background:rgba(255,252,239,.98); color:#333; border:3px solid #ffd35c; border-radius:20px; padding:12px 42px 13px 14px; box-shadow:0 8px 28px rgba(0,0,0,.28); }',
  '#ocInfoClose { position:absolute; right:8px; top:7px; width:30px; height:30px; border:0; border-radius:50%; background:#eee7d3; color:#594b2c; cursor:pointer; font:bold 18px sans-serif; }',
  '#ocInfoTitle { color:#5935aa; font-size:20px; font-weight:900; margin-bottom:8px; display:flex; align-items:center; gap:8px; }',
  '#ocInfoTitle .ocInfoSymbol { width:54px; height:34px; flex:0 0 auto; }',
  '#ocInfoHelp { display:none; background:#eaf9e5; color:#367227; border-radius:10px; padding:6px 9px; margin-bottom:7px; font-size:12px; font-weight:bold; line-height:1.35; }',
  '.ocInfoPart { border-radius:12px; padding:8px 10px; margin-top:7px; font-size:14px; line-height:1.42; }',
  '.ocInfoPart.metaphor { background:#fff0bd; border-left:5px solid #f1ad28; }',
  '.ocInfoPart.real { background:#e6f5ff; border-left:5px solid #3c9ed5; }',
  '.ocInfoPart strong { display:block; color:#493b70; font-size:11px; letter-spacing:.05em; margin-bottom:2px; }',
  '#ocInfoSpeak { margin-top:9px; border:2px solid #c5cffb; border-radius:10px; background:#eef2ff; padding:5px 12px; cursor:pointer; font-family:inherit; }',
  '.ocTool.zero { opacity:.4; }',
  '#ocMsg { position:absolute; bottom:96px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.68); color:#fff; padding:9px 20px; border-radius:18px; font-size:18px; z-index:9; display:none; pointer-events:none; max-width:92vw; text-align:center; }',
  '#ocSun { position:absolute; right:12px; top:56px; z-index:9; display:none; border:none; border-radius:18px; font-size:34px; padding:8px 12px; cursor:pointer; font-family:inherit; box-shadow:0 4px 0 rgba(0,0,0,.3); }',
  '#ocSun.day { background:linear-gradient(180deg,#8fd3f4,#4fa8e0); }',
  '#ocSun.night { background:linear-gradient(180deg,#2c3e6b,#141c38); }',
  /* vittoria non modale: si può ancora giocare col circuito */
  '#ocWinBar { position:absolute; left:50%; transform:translateX(-50%); bottom:calc(104px + env(safe-area-inset-bottom)); z-index:10; display:none; align-items:center; gap:12px; background:linear-gradient(180deg,#f4ffe8,#d9f2be); border:3px solid #9fd47a; border-radius:20px; padding:10px 16px; box-shadow:0 6px 0 rgba(0,0,0,.25); max-width:94vw; flex-wrap:wrap; justify-content:center; }',
  '#ocWinBarTxt { font-size:clamp(16px,3.6vw,22px); font-weight:bold; color:#3f7a1e; }',
  '#ocWinBarSub { width:100%; text-align:center; font-size:14px; color:#6a8a4a; }',
  '#ocWinBarGo { border:none; border-radius:14px; background:linear-gradient(180deg,#3cba54,#27803a); color:#fff; font-family:inherit; font-size:clamp(16px,3.6vw,21px); font-weight:bold; padding:8px 18px; cursor:pointer; box-shadow:0 4px 0 #1d5f2b; }',
  '#ocWinBarGo:active { transform:translateY(2px); box-shadow:none; }',
  /* intro livello */
  '#ocIntro .card, #ocWin .card { max-width:760px;position:relative;overflow:hidden; }',
  '#ocIntro .card { padding-left:clamp(155px,24vw,230px);min-height:370px;display:flex;flex-direction:column;justify-content:center; }',
  '#ocIntroGibi { position:absolute;left:10px;bottom:-18px;width:clamp(145px,23vw,220px);height:360px;background:url("assets/characters/gibi.png") center bottom/contain no-repeat;filter:drop-shadow(0 8px 10px rgba(43,30,88,.25)); }',
  '#ocIntroEm { display:none; }',
  '#ocIntroTit { font-size:clamp(24px,5vw,34px); color:#5a34b0; margin:6px 0 10px; }',
  '#ocIntroTxt { font-size:clamp(20px,4vw,26px); color:#333; line-height:1.6; letter-spacing:.02em; word-spacing:.1em; margin-bottom:8px; }',
  '#ocIntroNew { display:none; align-items:center; justify-content:center; gap:8px; background:#f3edff; border:2px solid #c9b8f2; border-radius:14px; padding:8px 12px; font-size:17px; color:#5a34b0; margin:0 auto 10px; max-width:90%; }',
  '#ocIntroNew canvas { width:54px; height:34px; flex:0 0 auto; }',
  '#ocIntroSpk { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:18px; padding:6px 22px; cursor:pointer; font-family:inherit; margin:0 auto 10px;align-self:center; }',
  /* vittoria + lo sapevi */
  '#ocWin .card { background:linear-gradient(180deg,#f4ffe8,#e2f6cd); border:4px solid #9fd47a; }',
  '#ocWinTit { font-size:clamp(24px,5vw,34px); color:#3f7a1e; margin:4px 0 6px; }',
  '#ocWin .card { padding-left:clamp(135px,20vw,190px); }',
  '#ocWinGibi { position:absolute;left:-12px;bottom:-25px;width:clamp(135px,21vw,190px);height:310px;background:url("assets/characters/gibi.png") center bottom/contain no-repeat;filter:drop-shadow(0 8px 9px rgba(0,0,0,.22)); }',
  '#ocKnow { background:#fff; border-radius:18px; padding:12px; margin:10px 0; text-align:left;box-shadow:0 4px 14px rgba(51,80,25,.1); }',
  '#ocKnowTit { font-size:16px; font-weight:bold; color:#b06f00; margin-bottom:6px; }',
  '#ocKnowTxt { font-size:clamp(17px,3vw,21px); line-height:1.5; letter-spacing:.01em; color:#32402b; }',
  '.ocFact { border-radius:14px;padding:10px 12px;margin:7px 0; }',
  '.ocFact.metaphor { background:#fff3c9;border-left:5px solid #f4b63d; }',
  '.ocFact.real { background:#e8f5ff;border-left:5px solid #43a6df; }',
  '.ocFact strong { display:block;font-size:13px;letter-spacing:.05em;margin-bottom:3px;color:#43366d; }',
  '#ocKnowSpk { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:17px; padding:5px 14px; cursor:pointer; font-family:inherit; margin-top:8px; }',
  /* scelta livello */
  '#ocPick .card { width:min(1050px,96vw);max-width:1050px;position:relative;overflow:hidden;padding-left:clamp(175px,22vw,245px);background:linear-gradient(145deg,#fff 0,#faf7ff 72%); }',
  '#ocPickGibi { position:absolute;left:4px;bottom:-25px;width:clamp(165px,22vw,235px);height:440px;background:url("assets/characters/gibi.png") center bottom/contain no-repeat;filter:drop-shadow(0 10px 12px rgba(55,35,105,.22)); }',
  '#ocPickTit { font-size:clamp(24px,5vw,34px); color:#5a34b0; margin-bottom:2px; }',
  '#ocPickSub { font-size:16px; color:#777; margin-bottom:12px; line-height:1.4; }',
  '#ocPickGrid { display:grid; grid-template-columns:repeat(5,minmax(112px,1fr)); gap:12px;position:relative; }',
  '.ocLvBtn { border:3px solid rgba(255,255,255,.35); border-radius:18px; padding:9px 7px;min-height:112px; cursor:pointer; font-family:inherit; background:linear-gradient(180deg,#8b68ef,#5934ad); color:#fff; box-shadow:0 5px 0 #3d2378,0 8px 16px rgba(61,35,120,.16);position:relative;transition:transform .14s,filter .14s; }',
  '.ocLvBtn:not(.lock):hover { transform:translateY(-3px);filter:brightness(1.08); }',
  '.ocLvBtn:active { transform:translateY(2px); box-shadow:none; }',
  '.ocLvBtn.lock { background:#dfdce8;color:#777187;border-color:#eeecf4;box-shadow:0 4px 0 #bbb6ca;cursor:default; }',
  '.ocLvBtn.next { outline:4px solid #ffd35c;outline-offset:2px;animation:ocPulse 1.5s ease-in-out infinite; }',
  '@keyframes ocPulse { 50%{filter:brightness(1.15);transform:translateY(-2px)} }',
  '.ocLvBtn.sand { background:linear-gradient(180deg,#3cba54,#27803a); box-shadow:0 4px 0 #1d5f2b; }',
  '.ocLvBtn .ln { font-size:27px; font-weight:bold; display:block; }',
  '.ocLvBtn .lt { font-size:12px;font-weight:bold;display:block; margin:3px 0; min-height:30px; line-height:1.2; }',
  '.ocLvBtn .ls { font-size:13px; display:block; }',
  '#ocPickBack { margin-top:16px; background:#eeeaf8;border:2px solid #d0c6ea;border-radius:12px;color:#635487;font-size:15px;padding:7px 13px;cursor:pointer;font-family:inherit; }',
  '@media(max-width:760px){#ocBtns .bl{display:none}#ocBtns .hudBtn{min-width:42px;padding:4px}#ocGoal{top:58px;width:84vw}#ocGibiDesk{opacity:.75;left:-8px}.ocTool{min-width:57px;padding:7px 6px}#ocInfo{top:58px;right:8px;width:calc(100vw - 16px);max-height:205px}#ocPick .card{padding:16px 10px 18px}#ocPickGibi{position:relative;display:block;width:100%;height:110px;bottom:auto;left:auto;background-position:center 10%;background-size:145px auto}#ocPickGrid{grid-template-columns:repeat(2,minmax(120px,1fr))}.ocLvBtn{min-height:96px}#ocIntro .card{padding:18px 14px 20px;min-height:0}#ocIntroGibi{position:relative;left:auto;bottom:auto;width:100%;height:110px;background-position:center 7%;background-size:145px auto}#ocWin .card{padding:18px 12px}#ocWinGibi{display:none}}'
  ].join('\n');
  document.head.appendChild(css);

  document.body.insertAdjacentHTML('beforeend',
  '<div id="oc">'+
    '<canvas id="ocCv"></canvas>'+
    '<div id="ocGibiDesk" aria-hidden="true"></div>'+
    '<div id="ocHud">'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
        '<div class="hudBox" id="ocLvl">⚡ 1/10</div>'+
        '<div class="hudBox" id="ocStar">⭐⭐⭐</div>'+
      '</div>'+
      '<div id="ocBtns">'+
        '<button class="hudBtn" id="ocHintBtn" title="Aiutino">💡<span class="bl">AIUTO</span></button>'+
        '<button class="hudBtn" id="ocResetBtn" title="Ricomincia">🔄<span class="bl">RIFAI</span></button>'+
        '<button class="hudBtn" id="ocPickBtn" title="Livelli">📋<span class="bl">LIVELLI</span></button>'+
        '<button class="hudBtn" id="ocMusicBtn" title="Musica">🎵</button>'+
        '<button class="hudBtn" id="ocHomeBtn" title="Menu">🏠</button>'+
      '</div>'+
    '</div>'+
    '<div id="ocGoal"><span id="ocGoalTxt"></span> <button id="ocGoalSpk">🔊</button></div>'+
    '<button id="ocSun" class="day">☀️</button>'+
    '<div id="ocPalBar"></div>'+
    '<div id="ocInfo" role="dialog" aria-live="polite">'+
      '<button id="ocInfoClose" aria-label="Chiudi">×</button>'+
      '<div id="ocInfoTitle"></div>'+
      '<div id="ocInfoHelp"></div>'+
      '<div id="ocInfoMetaphor" class="ocInfoPart metaphor"></div>'+
      '<div id="ocInfoReal" class="ocInfoPart real"></div>'+
      '<button id="ocInfoSpeak">🔊</button>'+
    '</div>'+
    '<div id="ocMsg"></div>'+
    '<div id="ocWinBar"><span id="ocWinBarTxt"></span><button id="ocWinBarGo"></button><span id="ocWinBarSub"></span></div>'+
  '</div>'+
  '<div class="overlay" id="ocIntro" style="z-index:16">'+
    '<div class="card">'+
      '<div id="ocIntroGibi" aria-hidden="true"></div>'+
      '<div id="ocIntroEm">⚡</div>'+
      '<div id="ocIntroTit"></div>'+
      '<div id="ocIntroTxt"></div>'+
      '<div id="ocIntroNew"></div>'+
      '<br><button id="ocIntroSpk">🔊</button><br>'+
      '<button class="bigBtn" id="ocIntroGo">VIA! ⚡</button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="ocWin" style="z-index:16">'+
    '<div class="card">'+
      '<div id="ocWinGibi" aria-hidden="true"></div>'+
      '<div id="ocWinEm" style="font-size:56px">🏆</div>'+
      '<div id="ocWinTit"></div>'+
      '<div id="ocWinStars" class="starRow"></div>'+
      '<div id="ocKnow">'+
        '<div id="ocKnowTit"></div>'+
        '<div id="ocKnowTxt"></div>'+
        '<button id="ocKnowSpk">🔊</button>'+
      '</div>'+
      '<button class="bigBtn" id="ocWinNext">➡️</button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="ocPick" style="z-index:16">'+
    '<div class="card">'+
      '<div id="ocPickGibi" aria-hidden="true"></div>'+
      '<div id="ocPickTit"></div>'+
      '<div id="ocPickSub"></div>'+
      '<div id="ocPickGrid"></div>'+
      '<button id="ocPickBack"></button>'+
    '</div>'+
  '</div>');
})();

/* ---------- testi ---------- */
const OC_T={
  bench:['Il Cuore di Gibi','Gibi’s Heart'],
  story:['Gibi il robottino è spento! Costruisci i circuiti e riaccendi il suo cuore, un livello alla volta.','Gibi the little robot is off! Build the circuits and restart his heart, one level at a time.'],
  sandbox:['Banco libero','Free bench'],
  sandboxSub:['Inventa quello che vuoi!','Invent anything you like!'],
  back:['torna ai giochi','back to games'],
  win:['CIRCUITO RIUSCITO!','CIRCUIT COMPLETE!'],
  winPlay:['Puoi ancora giocare col circuito!','You can still play with the circuit!'],
  next:['AVANTI ➡️','NEXT ➡️'],
  know:['🔍 LO SAPEVI?','🔍 DID YOU KNOW?'],
  burn:['PUFF! 💨 Troppa corrente: il LED si è bruciato. Toccalo per ripararlo.','POOF! 💨 Too much current: the LED burned out. Tap it to fix it.'],
  fixed:['LED riparato! ✨','LED fixed! ✨'],
  noPin:['Lì il filo non si attacca!','The wire can’t attach there!'],
  noPiece:['Pezzi finiti!','No pieces left!'],
  occupied:['C’è già qualcosa qui!','Something is already here!'],
  locked:['Questo pezzo è fissato al banco.','This piece is bolted to the bench.'],
  hintMsg:['💡 Guarda i pezzi fantasma... (niente 3⭐)','💡 Watch the ghost pieces... (no 3⭐)'],
  names:{ batt:['PILA','BATTERY'], lamp:['LAMPADINA','BULB'], sw:['INTERRUTTORE','SWITCH'], led:['LED','LED'], res:['RESISTENZA','RESISTOR'], cap:['CONDENSATORE','CAPACITOR'], npn:['TRANSISTOR','TRANSISTOR'], mot:['MOTORE','MOTOR'], buz:['CICALINO','BUZZER'], ldr:['SENSORE LUCE','LIGHT SENSOR'], wire:['FILO','WIRE'], hand:['MANO','HAND'], erase:['GOMMA','ERASER'] },
  icons:{ batt:'🔋', lamp:'💡', sw:'🔘', led:'🚦', res:'🚧', cap:'🪣', npn:'🚰', mot:'🌀', buz:'🔔', ldr:'🌗', wire:'〰️', hand:'🖐️', erase:'🧽' }
};
const OC_INFO={
  wire:{
    metaphor:['È la strada di rame su cui viaggiano le cariche. Se la strada si interrompe, il giro non si chiude.','It is the copper road travelled by electric charges. If the road breaks, the loop cannot close.'],
    real:['Il rame conduce bene perché alcuni suoi elettroni possono muoversi facilmente. In un circuito chiuso il campo elettrico mette in moto le cariche già presenti nel filo; il rivestimento isolante aiuta a evitare contatti pericolosi.','Copper conducts well because some of its electrons can move easily. In a closed circuit, the electric field sets charges already inside the wire in motion; insulation helps prevent dangerous contact.']},
  batt:{
    metaphor:['È la pompa del circuito: dà la spinta che fa partire il viaggio delle cariche.','It is the circuit’s pump: it provides the push that starts the charges moving.'],
    real:['Le reazioni chimiche della pila mantengono una differenza di potenziale tra i poli + e −. Così trasformano energia chimica in energia elettrica; la pila non “fabbrica” elettroni.','Chemical reactions maintain a potential difference between the + and − terminals. They turn chemical energy into electrical energy; the battery does not “make” electrons.']},
  lamp:{
    metaphor:['È una casetta che prende energia dalla strada elettrica e la trasforma in luce e calore.','It is a little house that takes energy from the electric road and turns it into light and heat.'],
    real:['La corrente attraversa un filamento resistivo, che si scalda fino a emettere luce. Più potenza elettrica riceve, più la lampadina appare luminosa, entro i suoi limiti.','Current crosses a resistive filament, heating it until it emits light. The more electrical power it receives, the brighter the bulb appears, within its limits.']},
  sw:{
    metaphor:['È un ponte levatoio: abbassato completa la strada, alzato la interrompe.','It is a drawbridge: lowered it completes the road, raised it breaks the road.'],
    real:['Quando è chiuso, i contatti metallici si toccano e la corrente può circolare. Quando è aperto, il percorso è interrotto e la corrente si ferma.','When closed, metal contacts touch and current can flow. When open, the path is broken and current stops.']},
  led:{
    metaphor:['È un tunnel luminoso a senso unico: lascia passare solo nel verso giusto e va protetto da una resistenza.','It is a glowing one-way tunnel: it passes current only in the right direction and needs a resistor for protection.'],
    real:['Il LED è un diodo: conduce dall’anodo al catodo oltre una tensione minima e converte parte dell’energia in luce. Troppa corrente lo surriscalda e può danneggiarlo.','An LED is a diode: it conducts from anode to cathode above a minimum voltage and converts some energy into light. Too much current overheats and can damage it.']},
  res:{
    metaphor:['È una strettoia nella strada: frena il traffico delle cariche e protegge i pezzi delicati.','It is a narrow section of road: it slows charge traffic and protects delicate parts.'],
    real:['La resistenza limita la corrente secondo la legge di Ohm, V = R × I, e trasforma parte dell’energia elettrica in calore. Non consuma cariche: riduce la corrente nel circuito.','A resistor limits current according to Ohm’s law, V = R × I, and turns some electrical energy into heat. It does not use up charge: it reduces circuit current.']},
  cap:{
    metaphor:['È un piccolo serbatoio: si riempie di energia e può restituirla per poco tempo.','It is a small tank: it fills with energy and can give it back for a short time.'],
    real:['Il condensatore separa cariche sulle sue due armature e conserva energia nel campo elettrico tra esse. La corrente scorre mentre si carica o si scarica; a carica stabile, la corrente continua si arresta.','A capacitor separates charge on two plates and stores energy in the electric field between them. Current flows while it charges or discharges; at steady charge, direct current stops.']},
  npn:{
    metaphor:['È un rubinetto elettrico: un piccolo comando apre o chiude il passaggio di una corrente più grande.','It is an electric tap: a small control opens or closes the path for a larger current.'],
    real:['Nel transistor NPN una piccola corrente nella base controlla il passaggio di corrente tra collettore ed emettitore. Qui lavora come interruttore elettronico.','In an NPN transistor, a small base current controls current between collector and emitter. Here it works as an electronic switch.']},
  mot:{
    metaphor:['È una ruota che beve energia elettrica e la restituisce come movimento.','It is a wheel that drinks electrical energy and gives it back as motion.'],
    real:['La corrente crea campi magnetici negli avvolgimenti. La loro forza fa ruotare il rotore, trasformando energia elettrica in energia meccanica, con una parte dispersa in calore.','Current creates magnetic fields in the windings. Their force turns the rotor, converting electrical energy into mechanical energy, with some lost as heat.']},
  buz:{
    metaphor:['È il campanello del circuito: quando riceve energia, fa vibrare l’aria e si sente un suono.','It is the circuit’s bell: when powered, it makes the air vibrate and produces a sound.'],
    real:['Il cicalino trasforma energia elettrica in vibrazioni meccaniche. Una parte interna vibra rapidamente e genera onde di pressione che il nostro orecchio percepisce come suono.','A buzzer turns electrical energy into mechanical vibration. An internal part vibrates rapidly and creates pressure waves that our ears perceive as sound.']},
  ldr:{
    metaphor:['È l’occhio del circuito: al sole apre una strada facile, al buio la rende molto stretta.','It is the circuit’s eye: in sunlight it opens an easy road, in darkness it makes the road very narrow.'],
    real:['La fotoresistenza cambia resistenza con la luce: in questo modello ha bassa resistenza quando è illuminata e resistenza molto alta al buio. Il circuito misura il cambiamento per reagire.','A photoresistor changes resistance with light: in this model it has low resistance when lit and very high resistance in darkness. The circuit uses that change to react.']}
};
const OC_LEVEL_ICONS=['🔌','🔘','🧰','🚦','🛡️','🚂','🛤️','⚡','🚰','🌙'];

/* ---------- livelli ----------
   comps: {t,x,y,r,lock,id,closed} — wires: [x,y,'H'|'V',lock]
   sol: pezzi/fili fantasma per l'Aiutino
   win(api): true se l'obiettivo è raggiunto (tenuto OC_WIN_HOLD s) */
const OC_LEVELS=[
{ /* 1 — chiudi il cerchio */
  t:['Chiudi il cerchio','Close the loop'],
  g:['Collega la pila alla lampadina con i fili. La corrente può circolare solo se il percorso è chiuso!','Connect the battery to the bulb with wires. Current can flow only when the path is closed!'],
  nx:5, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'lamp',x:3,y:1,id:'L',lock:1}],
  wires:[],
  pal:{wire:14},
  sol:{wires:[[1,1,'H'],[2,1,'H'],[3,1,'H'],[4,1,'V'],[3,2,'H'],[2,2,'H'],[1,2,'H'],[0,2,'H'],[0,1,'V'],[0,1,'H']]},
  win(a){ return a.P('L')>OC_LAMP_LIT; },
  know:['🏎️ IMMAGINALO COSÌ: il circuito è una pista. Se manca un pezzo, non si può completare il giro.\n\n🔬 COME FUNZIONA DAVVERO: nel filo ci sono già moltissimi elettroni. La pila fornisce energia e li spinge quando il percorso è chiuso. Gli elettroni avanzano lentamente, ma l’effetto elettrico raggiunge la lampadina quasi subito, come in un tubo già pieno d’acqua.','🏎️ IMAGINE IT LIKE THIS: a circuit is a racetrack. If a piece is missing, nothing can complete the lap.\n\n🔬 HOW IT REALLY WORKS: the wire already contains many electrons. The battery supplies energy and pushes them when the path is closed. Electrons drift slowly, but the electrical effect reaches the bulb almost at once, like water in a pipe that is already full.']
},
{ /* 2 — interruttore */
  t:['Il cancello','The gate'],
  g:['La luce non si accende! Trova l’interruttore e tocca il suo bottone.','The light won’t turn on! Find the switch and tap its button.'],
  nx:5, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'sw',x:2,y:1,id:'S',lock:1},{t:'lamp',x:3,y:1,id:'L',lock:1}],
  wires:[[1,1,'H',1],[2,1,'H',1],[3,1,'H',1],[4,1,'V',1],[3,2,'H',1],[2,2,'H',1],[1,2,'H',1],[0,2,'H',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{},
  sol:{tap:['S']},
  win(a){ return a.P('L')>OC_LAMP_LIT; },
  know:['🌉 IMMAGINALO COSÌ: l’interruttore è un ponte levatoio. Quando si alza, la strada si interrompe.\n\n🔬 COME FUNZIONA DAVVERO: aprendo l’interruttore spezzi il circuito, quindi la corrente non può più circolare. La lampadina si spegne quasi subito. Gli interruttori di casa fanno proprio questo.','🌉 IMAGINE IT LIKE THIS: a switch is a drawbridge. When it rises, the road is broken.\n\n🔬 HOW IT REALLY WORKS: opening the switch breaks the circuit, so current can no longer flow. The bulb goes out almost at once. The switches in your home do the same thing.']
},
{ /* 3 — filo rotto */
  t:['Il filo rotto','The broken wire'],
  g:['Qualcuno ha rotto il circuito! Trova i buchi e ripara con i fili.','Someone broke the circuit! Find the gaps and fix them with wires.'],
  nx:5, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'lamp',x:3,y:1,id:'L',lock:1}],
  wires:[[1,1,'H',1],[2,1,'H',1],[3,1,'H',1],[4,1,'V',1],[3,2,'H',1],[0,2,'H',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{wire:4},
  sol:{wires:[[2,2,'H'],[1,2,'H']]},
  win(a){ return a.P('L')>OC_LAMP_LIT; },
  know:['🛣️ IMMAGINALO COSÌ: il rame è una strada facile per le cariche elettriche; la plastica è una barriera.\n\n🔬 COME FUNZIONA DAVVERO: il rame conduce bene la corrente, mentre la plastica è un isolante. Il rivestimento di plastica riduce il rischio di scosse, ma con l’elettricità di casa non si gioca mai.','🛣️ IMAGINE IT LIKE THIS: copper is an easy road for electric charges; plastic is a barrier.\n\n🔬 HOW IT REALLY WORKS: copper conducts current well, while plastic is an insulator. Plastic covering reduces the risk of electric shock, but mains electricity must never be played with.']
},
{ /* 4 — LED al contrario */
  t:['Il tunnel a senso unico','The one-way tunnel'],
  g:['Il LED lascia passare gli elettroni solo da un verso... e ora guarda dalla parte sbagliata! Toccalo per girarlo.','A LED lets electrons through one way only... and it’s facing the wrong way! Tap it to flip it.'],
  nx:5, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'res',x:2,y:1,lock:1},{t:'led',x:3,y:1,r:2,id:'D'}],
  wires:[[1,1,'H',1],[2,1,'H',1],[3,1,'H',1],[4,1,'V',1],[3,2,'H',1],[2,2,'H',1],[1,2,'H',1],[0,2,'H',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{},
  sol:{tap:['D']},
  win(a){ return a.I('D')>OC_LED_LIT; },
  know:['➡️ IMMAGINALO COSÌ: il LED è una porta a senso unico. Se lo giri al contrario, la porta resta chiusa.\n\n🔬 COME FUNZIONA DAVVERO: LED significa “diodo che emette luce”. Lascia passare corrente soprattutto in una direzione e trasforma parte dell’energia elettrica in luce. Lo trovi nei semafori, negli schermi e nelle lucine.','➡️ IMAGINE IT LIKE THIS: an LED is a one-way gate. Turn it backwards and the gate stays closed.\n\n🔬 HOW IT REALLY WORKS: LED means “light-emitting diode”. It lets current flow mainly in one direction and changes some electrical energy into light. LEDs are found in traffic lights, screens and fairy lights.']
},
{ /* 5 — PUFF! serve la resistenza */
  t:['PUFF! Il LED delicato','POOF! The delicate LED'],
  g:['Chiudi l’interruttore e guarda cosa succede... poi metti la RESISTENZA sulla strada in basso per proteggere il LED.','Close the switch and watch what happens... then put the RESISTOR on the bottom road to protect the LED.'],
  nx:5, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'sw',x:2,y:1,id:'S',lock:1},{t:'led',x:3,y:1,id:'D',lock:1}],
  wires:[[1,1,'H',1],[2,1,'H',1],[3,1,'H',1],[4,1,'V',1],[3,2,'H',1],[2,2,'H',1],[1,2,'H',1],[0,2,'H',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{res:1},
  freeBurn:1,
  sol:{comps:[{t:'res',x:2,y:2}]},
  win(a){ return a.I('D')>OC_LED_LIT && !a.burnt('D'); },
  know:['🚧 IMMAGINALO COSÌ: la resistenza è una strettoia che limita il traffico.\n\n🔬 COME FUNZIONA DAVVERO: la resistenza limita la corrente e trasforma parte dell’energia in calore. Così impedisce che nel LED passi una corrente troppo grande. Nelle vecchie lampadine un filo molto sottile diventava tanto caldo da produrre luce.','🚧 IMAGINE IT LIKE THIS: a resistor is a narrow passage that limits traffic.\n\n🔬 HOW IT REALLY WORKS: a resistor limits current and changes some energy into heat. This stops too much current from passing through the LED. In old light bulbs, a very thin wire became hot enough to produce light.']
},
{ /* 6 — due lampadine in serie */
  t:['Due luci in fila','Two lights in a row'],
  g:['Accendi TUTTE E DUE le lampadine, una dopo l’altra sulla stessa strada. Come sono? Forti o deboline?','Turn on BOTH bulbs, one after the other on the same road. Are they strong or weak?'],
  nx:6, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'lamp',x:3,y:1,id:'A',lock:1},{t:'lamp',x:4,y:1,id:'B',lock:1}],
  wires:[[1,1,'H',1],[4,1,'H',1],[5,1,'V',1],[4,2,'H',1],[3,2,'H',1],[2,2,'H',1],[1,2,'H',1],[0,2,'H',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{wire:4},
  sol:{wires:[[2,1,'H'],[3,1,'H']]},
  win(a){ return a.P('A')>OC_LAMP_LIT && a.P('B')>OC_LAMP_LIT; },
  know:['🚂 IMMAGINALO COSÌ: in serie c’è una sola strada e tutte le lampadine stanno in fila.\n\n🔬 COME FUNZIONA DAVVERO: aggiungendo una seconda lampadina aumenta la resistenza totale del circuito. Con questa pila circola meno corrente e le due lampadine risultano più deboli.','🚂 IMAGINE IT LIKE THIS: in a series circuit there is one road and all the bulbs stand in a row.\n\n🔬 HOW IT REALLY WORKS: adding a second bulb increases the circuit’s total resistance. With this battery, less current flows and both bulbs are dimmer.']
},
{ /* 7 — parallelo */
  t:['Due strade, due luci forti','Two roads, two bright lights'],
  g:['Stavolta dai a ogni lampadina la SUA strada: collegale una sopra e una sotto. Guarda come brillano!','This time give each bulb its OWN road: connect one above and one below. Watch them shine!'],
  nx:6, ny:4,
  comps:[{t:'batt',x:1,y:1,lock:1},{t:'lamp',x:3,y:1,id:'A',lock:1},{t:'lamp',x:3,y:2,id:'B',lock:1}],
  wires:[[1,1,'H',1],[3,1,'H',1],[4,1,'V',1],[4,2,'V',1],[3,3,'H',1],[2,3,'H',1],[1,3,'H',1],[0,3,'H',1],[0,2,'V',1],[0,1,'V',1],[0,1,'H',1]],
  pal:{wire:5},
  sol:{wires:[[2,1,'H'],[2,1,'V'],[2,2,'H'],[3,2,'H'],[4,2,'H']]},
  win(a){ return a.P('A')>OC_LAMP_BRIGHT && a.P('B')>OC_LAMP_BRIGHT; },
  know:['🛤️ IMMAGINALO COSÌ: in parallelo ogni lampadina ha la propria strada.\n\n🔬 COME FUNZIONA DAVVERO: ogni ramo è collegato direttamente ai due poli della pila. Se un ramo si interrompe, la corrente può ancora circolare negli altri. Le luci di casa sono collegate in parallelo: spegnerne una non spegne tutte le altre.','🛤️ IMAGINE IT LIKE THIS: in a parallel circuit each bulb has its own road.\n\n🔬 HOW IT REALLY WORKS: each branch is connected directly to both battery terminals. If one branch breaks, current can still flow through the others. Home lights are wired in parallel: switching one off does not turn all the others off.']
},
{ /* 8 — condensatore */
  t:['Il serbatoio di energia','The energy tank'],
  g:['Metti il SERBATOIO nel buco in alto. Chiudi l’interruttore per caricarlo... poi APRILO: la luce resta accesa?','Put the TANK in the top gap. Close the switch to charge it... then OPEN it: does the light stay on?'],
  nx:6, ny:4,
  comps:[{t:'batt',x:1,y:2,lock:1},{t:'sw',x:2,y:2,id:'S',lock:1},{t:'lamp',x:4,y:2,id:'L',lock:1}],
  wires:[[1,2,'H',1],[2,2,'H',1],[3,2,'H',1],[4,2,'H',1],[5,2,'V',1],[4,3,'H',1],[3,3,'H',1],[2,3,'H',1],[1,3,'H',1],[0,3,'H',1],[0,2,'V',1],[0,2,'H',1],[3,1,'V',1],[3,1,'H',1],[4,1,'H',1],[5,1,'V',1]],
  pal:{cap:1},
  sol:{comps:[{t:'cap',x:4,y:1}]},
  win(a){ return !a.sw('S') && a.P('L')>0.06; },
  know:['🪣 IMMAGINALO COSÌ: il condensatore è un piccolo serbatoio che conserva energia e poi la restituisce.\n\n🔬 COME FUNZIONA DAVVERO: separa cariche elettriche sulle sue due parti e conserva energia in un campo elettrico. Quando la pila viene scollegata, può restituire quell’energia per poco tempo. I flash fotografici usano condensatori per liberare rapidamente molta energia.','🪣 IMAGINE IT LIKE THIS: a capacitor is a small tank that stores energy and gives it back later.\n\n🔬 HOW IT REALLY WORKS: it separates electric charge on its two parts and stores energy in an electric field. When the battery is disconnected, it can return that energy for a short time. Camera flashes use capacitors to release a lot of energy quickly.']
},
{ /* 9 — transistor */
  t:['Il rubinetto elettrico','The electric tap'],
  g:['Il motorone è comandato dal TRANSISTOR, un rubinetto: una corrente piccolina apre la strada a una corrente GRANDE. Chiudi il piccolo interruttore e guarda i puntini!','The big motor is controlled by the TRANSISTOR, a tap: a tiny current opens the road for a BIG current. Close the little switch and watch the dots!'],
  nx:7, ny:5,
  comps:[{t:'batt',x:1,y:4,lock:1},{t:'mot',x:4,y:0,id:'M',lock:1},{t:'npn',x:3,y:1,r:1,id:'T',lock:1},{t:'res',x:4,y:1,lock:1},{t:'sw',x:5,y:1,id:'S',lock:1}],
  wires:[[0,4,'H',1],[1,4,'H',1],[2,4,'H',1],[3,4,'H',1],[4,4,'H',1],[5,4,'H',1],[6,3,'V',1],[6,2,'V',1],[6,1,'V',1],[6,0,'V',1],[5,0,'H',1],[4,0,'H',1],[3,0,'H',1],[3,0,'V',1],[3,1,'V',1],[3,2,'V',1],[2,3,'H',1],[1,3,'H',1],[0,3,'H',1],[0,3,'V',1],[3,1,'H',1],[4,1,'H',1],[5,1,'H',1]],
  pal:{},
  sol:{tap:['S']},
  win(a){ return a.P('M')>OC_MOT_ON; },
  know:['🚰 IMMAGINALO COSÌ: il transistor è un rubinetto comandato da un segnale piccolissimo.\n\n🔬 COME FUNZIONA DAVVERO: un piccolo segnale elettrico può controllare una corrente più grande. Nei computer i transistor lavorano soprattutto come interruttori minuscoli. Miliardi di questi interruttori permettono al telefono di calcolare, ricordare e mostrare immagini.','🚰 IMAGINE IT LIKE THIS: a transistor is a tap controlled by a tiny signal.\n\n🔬 HOW IT REALLY WORKS: a small electrical signal can control a larger current. In computers, transistors mainly work as tiny switches. Billions of these switches let a phone calculate, remember and display images.']
},
{ /* 10 — luce notturna (plancia "a scala": ＋ sopra, − sotto, 3 colonne) */
  t:['La luce notturna','The night light'],
  g:['Metti il SENSORE DI LUCE nella presa tratteggiata. Poi prova col bottone: col sole ☀️ il LED sta SPENTO, con la notte 🌙 si accende DA SOLO!','Put the LIGHT SENSOR in the dashed socket. Then try the button: with the sun ☀️ the LED stays OFF, at night 🌙 it turns on BY ITSELF!'],
  nx:4, ny:6, sun:1,
  comps:[{t:'batt',x:0,y:2,r:3,lock:1},{t:'res',x:2,y:1,r:1,lock:1},{t:'res',x:3,y:1,r:1,lock:1},{t:'led',x:3,y:2,r:1,id:'D',lock:1},{t:'npn',x:3,y:3,r:0,id:'T',lock:1}],
  wires:[[0,0,'H',1],[1,0,'H',1],[2,0,'H',1],
         [0,0,'V',1],[0,1,'V',1],[0,2,'V',1],[0,3,'V',1],[0,4,'V',1],
         [2,0,'V',1],[2,1,'V',1],[2,2,'V',1],[2,3,'V',1],[2,4,'V',1],
         [2,3,'H',1],
         [3,0,'V',1],[3,1,'V',1],[3,2,'V',1],[3,3,'V',1],[3,4,'V',1],
         [0,5,'H',1],[1,5,'H',1],[2,5,'H',1]],
  labels:[[-0.45,0,'＋','＋'],[-0.45,5,'−','−'],[2,-0.55,'① sensore','① sensor'],[3,-0.55,'② luce','② light']],
  pal:{ldr:1},
  sol:{comps:[{t:'ldr',x:2,y:4,r:1}]},
  win(a){ return a.flag('dayOK') && a.flag('nightOK'); },
  know:['👁️ IMMAGINALO COSÌ: il sensore è un occhio che avvisa il transistor quando arriva la notte.\n\n🔬 COME FUNZIONA DAVVERO: il sensore cambia la propria resistenza in base alla luce che riceve. Il circuito usa questo cambiamento per comandare il transistor e accendere il LED. Sistemi simili accendono automaticamente molti lampioni.','👁️ IMAGINE IT LIKE THIS: the sensor is an eye that tells the transistor when night arrives.\n\n🔬 HOW IT REALLY WORKS: the sensor changes its resistance according to the light it receives. The circuit uses this change to control the transistor and switch on the LED. Similar systems automatically turn on many street lights.']
}
];

/* palette del banco libero */
const OC_SANDBOX={ nx:12, ny:8, sun:1, comps:[], wires:[],
  pal:{wire:Infinity,batt:Infinity,lamp:Infinity,sw:Infinity,led:Infinity,res:Infinity,cap:Infinity,npn:Infinity,mot:Infinity,buz:Infinity,ldr:Infinity} };

/* ---------- stato ---------- */
const oc={ on:false, raf:0, lvl:0, sandbox:false, board:null, pal:{}, tool:'hand',
  time:0, last:0, winT:0, mish:0, hint:0, hintT:0, freeBurnLeft:0,
  flow:{}, nets:null, smoke:[], flags:{}, dayT:0, nightT:0, sun:true,
  drag:null, wireGhost:null, preview:null, placing:false, won:false, cs:64, ox:0, oy:0, infoType:null };

function ocSave(){ try{ localStorage.setItem('gabri_off_c', JSON.stringify(oc.prog)); }catch(e){} }
function ocLoad(){ try{ oc.prog=JSON.parse(localStorage.getItem('gabri_off_c'))||{unl:0,stars:[]}; }catch(e){ oc.prog={unl:0,stars:[]}; } }
ocLoad();

/* ---------- modello del banco ---------- */
function ocNK(x,y){ return x+','+y; }
function ocEK(x,y,o){ return x+','+y+','+o; }
function ocWireGeom(x,y,o){
  if(o==='H') return {a:{x,y},b:{x:x+1,y}};
  if(o==='V') return {a:{x,y},b:{x,y:y+1}};
  if(o==='D') return {a:{x,y},b:{x:x+1,y:y+1}};       /* ↘ */
  if(o==='U') return {a:{x,y:y+1},b:{x:x+1,y}};       /* ↗ */
  return null;
}
function ocWireGeomKey(k){ const [x,y,o]=k.split(','); return ocWireGeom(+x,+y,o); }
function ocWireSideAt(p,q,comp){
  const horizontal=q.x>p.x?'E':'W', vertical=q.y>p.y?'S':'N';
  const c=comp||oc.board.comps.get(ocNK(p.x,p.y));
  if(!c) return horizontal;
  const pins=ocPins(c);
  if(pins[horizontal]!==undefined) return horizontal;
  if(pins[vertical]!==undefined) return vertical;
  return null;
}
const OC_PIN2=[['W','E'],['N','S'],['E','W'],['S','N']]; /* [primo,secondo] per rotazione */
const OC_NPNPIN=[{b:'W',c:'N',e:'S'},{b:'E',c:'N',e:'S'},{b:'W',c:'S',e:'N'},{b:'E',c:'S',e:'N'}];

function ocPins(c){ /* mappa lato→ruolo */
  if(c.t==='npn'){ const p=OC_NPNPIN[c.r||0]; const m={}; m[p.b]='b'; m[p.c]='c'; m[p.e]='e'; return m; }
  const pr=OC_PIN2[c.r||0], m={};
  m[pr[0]]='a'; m[pr[1]]='b'; /* batt: a=−  b=+ | led: a=anodo(+) b=catodo */
  return m;
}
function ocNewComp(t,x,y,r,extra){
  const c=Object.assign({t,x,y,r:r||0,state:{}},extra||{});
  if(t==='sw') c.state.closed=!!c.closed;
  if(t==='cap') c.state.vc=0;
  if(t==='led') c.state.heat=0;
  if(t==='mot'||t==='buz') c.state.ang=0;
  return c;
}
function ocBuildBoard(L){
  const b={ nx:L.nx, ny:L.ny, comps:new Map(), wires:new Map() };
  (L.comps||[]).forEach(d=>{ b.comps.set(ocNK(d.x,d.y), ocNewComp(d.t,d.x,d.y,d.r,{lock:d.lock,id:d.id,closed:d.closed})); });
  (L.wires||[]).forEach(w=>{ b.wires.set(ocEK(w[0],w[1],w[2]), {lock:w[3]}); });
  return b;
}

/* ---------- solver nodale ----------
   Reti = (nodo,lato). Nei nodi vuoti i 4 lati sono uniti (incrocio).
   Fili = resistenze piccole (così vediamo la corrente per l'animazione).
   Pila = Norton (G=1/Rint, I=V/Rint). Diodi (LED e base del transistor)
   e collettore-emettitore risolti per iterazione. Condensatore: Eulero
   all'indietro. */
function ocSolve(dt){
  const b=oc.board; if(!b) return;
  /* union-find sui lati */
  const par={};
  function find(k){ let r=k; while(par[r]!==undefined&&par[r]!==r) r=par[r]; par[k]=r; return r; }
  function uni(a,c){ a=find(a); c=find(c); if(a!==c) par[a]=c; }
  function sk(x,y,s){ const k=x+','+y+':'+s; if(par[k]===undefined) par[k]=k; return k; }
  for(let x=0;x<b.nx;x++) for(let y=0;y<b.ny;y++){
    if(!b.comps.has(ocNK(x,y))){ const n=sk(x,y,'N'); uni(n,sk(x,y,'E')); uni(n,sk(x,y,'S')); uni(n,sk(x,y,'W')); }
  }
  /* elementi */
  const els=[]; let ground=null;
  b.wires.forEach((w,k)=>{
    const line=ocWireGeomKey(k), sa=ocWireSideAt(line.a,line.b), sb=ocWireSideAt(line.b,line.a);
    const a=sk(line.a.x,line.a.y,sa), c=sk(line.b.x,line.b.y,sb);
    const wireLength=Math.hypot(line.b.x-line.a.x,line.b.y-line.a.y);
    els.push({kind:'R', g:1/(OC_RWIRE*wireLength), a, b:c, edge:k});
  });
  b.comps.forEach(c=>{
    const pins=ocPins(c), net={};
    for(const s in pins) net[pins[s]]=sk(c.x,c.y,s);
    c.res={I:0,P:0,V:0};
    switch(c.t){
      case 'batt': els.push({kind:'batt', a:net.b, b:net.a, g:1/OC_RINT, isrc:OC_VOLT/OC_RINT, comp:c}); if(!ground) ground=net.a; break;
      case 'lamp': els.push({kind:'R', g:1/OC_RLAMP, a:net.a, b:net.b, comp:c}); break;
      case 'res':  els.push({kind:'R', g:1/OC_RRES, a:net.a, b:net.b, comp:c}); break;
      case 'mot':  els.push({kind:'R', g:1/OC_RMOT, a:net.a, b:net.b, comp:c}); break;
      case 'buz':  els.push({kind:'R', g:1/OC_RBUZ, a:net.a, b:net.b, comp:c}); break;
      case 'ldr':  els.push({kind:'R', g:1/(oc.sun?OC_LDR_SUN:OC_LDR_NIGHT), a:net.a, b:net.b, comp:c}); break;
      case 'sw':   if(c.state.closed) els.push({kind:'R', g:1/OC_SW_R, a:net.a, b:net.b, comp:c}); break;
      case 'led':  if(!c.state.burnt) els.push({kind:'diode', a:net.a, b:net.b, vf:OC_LED_VF, ron:OC_LED_RON, on:!!c.state.on, comp:c}); break;
      case 'cap':  els.push({kind:'cap', a:net.a, b:net.b, g:OC_CAP_F/Math.max(dt,0.001), comp:c}); break;
      case 'npn':
        els.push({kind:'diode', a:net.b, b:net.e, vf:OC_NPN_VBE, ron:OC_NPN_RB, on:!!c.state.beOn, npnBE:c});
        els.push({kind:'ce', a:net.c, b:net.e, on:!!c.state.ceOn, comp:c});
        break;
    }
  });
  oc.flow={};
  if(!ground){ b.comps.forEach(c=>{ c.res={I:0,P:0,V:0}; }); return; }
  ground=find(ground);
  /* indici delle reti usate */
  const idx={}; let n=0;
  els.forEach(e=>{ e.a=find(e.a); e.b=find(e.b);
    [e.a,e.b].forEach(k=>{ if(k!==ground && idx[k]===undefined) idx[k]=n++; }); });
  const ia=e=>e.a===ground?-1:idx[e.a], ib=e=>e.b===ground?-1:idx[e.b];

  let v=new Float64Array(n);
  for(let it=0; it<15; it++){
    const A=[], rhs=new Float64Array(n);
    for(let i=0;i<n;i++){ A.push(new Float64Array(n)); }
    function stampG(p,q,g){ if(p>=0)A[p][p]+=g; if(q>=0)A[q][q]+=g; if(p>=0&&q>=0){A[p][q]-=g;A[q][p]-=g;} }
    function stampI(p,q,i){ if(p>=0)rhs[p]+=i; if(q>=0)rhs[q]-=i; }
    els.forEach(e=>{
      const p=ia(e), q=ib(e);
      if(e.kind==='R'){ stampG(p,q,e.g); }
      else if(e.kind==='batt'){ stampG(p,q,e.g); stampI(p,q,e.isrc); }
      else if(e.kind==='diode'){ if(e.on){ const g=1/e.ron; stampG(p,q,g); stampI(p,q,g*e.vf); } else stampG(p,q,1e-9); }
      else if(e.kind==='ce'){ stampG(p,q, e.on?1/OC_NPN_RCE:1e-9); }
      else if(e.kind==='cap'){ stampG(p,q,e.g); stampI(p,q,e.g*e.comp.state.vc); }
    });
    /* eliminazione di Gauss con pivot */
    for(let c0=0;c0<n;c0++){
      let piv=c0;
      for(let r=c0+1;r<n;r++) if(Math.abs(A[r][c0])>Math.abs(A[piv][c0])) piv=r;
      if(Math.abs(A[piv][c0])<1e-12){ A[c0][c0]+=1e-9; }
      if(piv!==c0){ const t=A[piv]; A[piv]=A[c0]; A[c0]=t; const tb=rhs[piv]; rhs[piv]=rhs[c0]; rhs[c0]=tb; }
      const d=A[c0][c0];
      for(let r=c0+1;r<n;r++){
        const f=A[r][c0]/d; if(!f) continue;
        for(let k2=c0;k2<n;k2++) A[r][k2]-=f*A[c0][k2];
        rhs[r]-=f*rhs[c0];
      }
    }
    for(let r=n-1;r>=0;r--){
      let s=rhs[r];
      for(let k2=r+1;k2<n;k2++) s-=A[r][k2]*v[k2];
      v[r]=s/A[r][r];
    }
    /* aggiorna stati non lineari */
    const V=e=>{ const p=ia(e),q=ib(e); return (p>=0?v[p]:0)-(q>=0?v[q]:0); };
    let changed=false;
    els.forEach(e=>{
      if(e.kind==='diode'){
        const vd=V(e), on=e.on ? (vd>e.vf-0.02) : (vd>e.vf+0.02);
        if(on!==e.on){ e.on=on; changed=true; }
      }
    });
    els.forEach(e=>{
      if(e.kind==='ce'){
        const be=els.find(o=>o.npnBE===e.comp);
        const ibe=(be&&be.on)?Math.max(0,(V(be)-be.vf)/be.ron):0;
        const on=!!(be&&be.on&&ibe>OC_NPN_IB);
        if(on!==e.on){ e.on=on; changed=true; }
      }
    });
    if(!changed) break;
  }
  /* risultati */
  const V=e=>{ const p=ia(e),q=ib(e); return (p>=0?v[p]:0)-(q>=0?v[q]:0); };
  els.forEach(e=>{
    const vd=V(e); let I=0;
    if(e.kind==='R') I=vd*e.g;
    else if(e.kind==='batt') I=e.isrc-vd*e.g;
    else if(e.kind==='diode') I=e.on?Math.max(0,(vd-e.vf)/e.ron):0;
    else if(e.kind==='ce') I=e.on?vd/OC_NPN_RCE:0;
    else if(e.kind==='cap') I=(vd-e.comp.state.vc)*e.g;
    if(e.edge) oc.flow[e.edge]=I;
    if(e.comp){
      const c=e.comp;
      if(e.kind==='ce'){ c.state.ceOn=e.on; c.res.I=Math.max(c.res.I,Math.abs(I)); }
      else { c.res={I:Math.abs(I), V:vd, P:Math.abs(vd*I)}; }
      if(e.kind==='diode'&&c.t==='led') c.state.on=e.on;
      if(e.kind==='cap') c.state.vc=vd;
    }
    if(e.npnBE){ e.npnBE.state.beOn=e.on; e.npnBE.state.ib=e.on?Math.max(0,(vd-e.vf)/e.ron):0; }
  });
}

/* ---------- api per gli obiettivi ---------- */
function ocComp(id){ let f=null; oc.board.comps.forEach(c=>{ if(c.id===id) f=c; }); return f; }
const ocApi={
  P:id=>{ const c=ocComp(id); return c?c.res.P:0; },
  I:id=>{ const c=ocComp(id); return c?c.res.I:0; },
  burnt:id=>{ const c=ocComp(id); return !!(c&&c.state.burnt); },
  sw:id=>{ const c=ocComp(id); return !!(c&&c.state.closed); },
  sun:()=>oc.sun,
  placed:t=>{ let n=0; oc.board.comps.forEach(c=>{ if(c.t===t&&!c.lock) n++; }); return n; },
  flag:k=>!!oc.flags[k]
};

/* ---------- passo di simulazione ---------- */
function ocStep(dt){
  oc.time+=dt;
  ocSolve(dt);
  /* LED che si bruciano */
  oc.board.comps.forEach(c=>{
    if(c.t==='led'&&!c.state.burnt){
      if(c.res.I>OC_LED_BURN) c.state.heat+=dt; else c.state.heat=Math.max(0,c.state.heat-dt*2);
      if(c.state.heat>OC_LED_BURN_T){
        c.state.burnt=true; c.state.on=false; c.state.heat=0;
        ocSmoke(c.x,c.y);
        if(oc.freeBurnLeft>0) oc.freeBurnLeft--; else oc.mish++;
        ocToast(OC_T.burn[LI()]);
      }
    }
    if((c.t==='mot'||c.t==='buz')) c.state.ang+=c.res.P*6*dt;
  });
  /* fumo */
  for(let i=oc.smoke.length-1;i>=0;i--){ const s=oc.smoke[i]; s.age+=dt; s.y-=dt*30; if(s.age>1.6) oc.smoke.splice(i,1); }
  if(oc.hintT>0) oc.hintT-=dt;
  /* livello 10: giorno/notte osservati */
  const L=oc.L;
  if(L&&L.sun&&ocApi.placed('ldr')>0){
    const d=ocComp('D');
    if(d&&oc.sun&&d.res.I<0.001){ oc.dayT+=dt; if(oc.dayT>0.6) oc.flags.dayOK=true; } else oc.dayT=0;
    if(d&&!oc.sun&&d.res.I>OC_LED_LIT){ oc.nightT+=dt; if(oc.nightT>0.6) oc.flags.nightOK=true; } else oc.nightT=0;
  }
  /* vittoria */
  if(!oc.sandbox&&!oc.won&&L&&L.win){
    if(L.win(ocApi)) oc.winT+=dt; else oc.winT=0;
    if(oc.winT>OC_WIN_HOLD){ oc.won=true; ocWinShow(); }
  }
}

/* ---------- disegno ---------- */
function ocXY(x,y){ return [oc.ox+x*oc.cs, oc.oy+y*oc.cs]; }
function ocResize(){
  const cv=$('ocCv'); cv.width=innerWidth; cv.height=innerHeight;
  const b=oc.board; if(!b) return;
  const infoSpace=oc.sandbox&&innerWidth>=1000?350:0;
  const boardW=innerWidth-infoSpace;
  const availW=boardW-40, availH=innerHeight-210;
  const minCell=oc.sandbox?26:44;
  oc.cs=Math.max(minCell, Math.min(110, Math.min(availW/(b.nx-1||1), availH/(b.ny-1||1))));
  oc.ox=(boardW-(b.nx-1)*oc.cs)/2;
  oc.oy=120+(availH-(b.ny-1)*oc.cs)/2;
}
function ocDraw(){
  const cv=$('ocCv'), g=cv.getContext('2d'); if(!g) return;
  g.clearRect(0,0,cv.width,cv.height);
  const b=oc.board; if(!b) return;
  const cs=oc.cs;
  /* piano forato del banco */
  g.fillStyle='rgba(255,255,255,.05)';
  g.beginPath();
  const [x0,y0]=ocXY(0,0), [x1,y1]=ocXY(b.nx-1,b.ny-1);
  g.roundRect ? g.roundRect(x0-cs*0.5,y0-cs*0.5,(x1-x0)+cs,(y1-y0)+cs,24) : g.rect(x0-cs*0.5,y0-cs*0.5,(x1-x0)+cs,(y1-y0)+cs);
  g.fill();
  /* nodi */
  for(let x=0;x<b.nx;x++) for(let y=0;y<b.ny;y++){
    const [px,py]=ocXY(x,y);
    g.fillStyle='rgba(255,255,255,.22)';
    g.beginPath(); g.arc(px,py,3.2,0,7); g.fill();
  }
  /* etichette della plancia */
  if(oc.L&&oc.L.labels){
    const i=LI();
    oc.L.labels.forEach(l=>{
      const [px,py]=ocXY(l[0],l[1]);
      const single=l[2].length<=1;
      g.fillStyle=single?'#ffd35c':'rgba(255,255,255,.75)';
      g.font=(single?'bold '+cs*0.5:'bold '+Math.max(12,cs*0.2))+'px Andika, sans-serif';
      g.textAlign='center'; g.textBaseline='middle';
      g.fillText(l[2+i]||l[2], px, py);
    });
  }
  /* prese tratteggiate: dove va il pezzo da piazzare */
  if(!oc.sandbox&&oc.L&&oc.L.sol&&oc.L.sol.comps){
    oc.L.sol.comps.forEach(c=>{
      if(oc.board.comps.has(ocNK(c.x,c.y))) return;
      const [px,py]=ocXY(c.x,c.y);
      g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=3; g.setLineDash([7,7]);
      g.beginPath(); g.arc(px,py,cs*0.32,0,7); g.stroke(); g.setLineDash([]);
      g.globalAlpha=0.4+0.15*Math.sin(oc.time*3);
      const ghost=ocNewComp(c.t,c.x,c.y,c.r); ghost.ghost=true; ghost.res={I:0,P:0,V:0};
      ocDrawComp(g,ghost);
      g.globalAlpha=1;
    });
  }
  /* aiutino: fantasmi */
  if(oc.hintT>0&&oc.L&&oc.L.sol){
    const blink=0.35+0.3*Math.sin(oc.time*6);
    g.strokeStyle='rgba(255,240,120,'+blink+')'; g.lineWidth=cs*0.14; g.lineCap='round';
    (oc.L.sol.wires||[]).forEach(w=>{
      if(oc.board.wires.has(ocEK(w[0],w[1],w[2]))) return;
      const line=ocWireGeom(w[0],w[1],w[2]);
      const [ax,ay]=ocXY(line.a.x,line.a.y), [bx,by]=ocXY(line.b.x,line.b.y);
      g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
    });
    g.fillStyle='rgba(255,240,120,'+blink+')';
    (oc.L.sol.comps||[]).forEach(c=>{ const [px,py]=ocXY(c.x,c.y); g.beginPath(); g.arc(px,py,cs*0.3,0,7); g.fill(); });
    (oc.L.sol.tap||[]).forEach(id=>{ const c=ocComp(id); if(c){ const [px,py]=ocXY(c.x,c.y); g.strokeStyle='rgba(255,240,120,'+blink+')'; g.lineWidth=4; g.beginPath(); g.arc(px,py,cs*0.42,0,7); g.stroke(); } });
  }
  /* fili */
  b.wires.forEach((w,k)=>{
    const line=ocWireGeomKey(k);
    const [ax,ay]=ocXY(line.a.x,line.a.y), [bx,by]=ocXY(line.b.x,line.b.y);
    g.strokeStyle=w.lock?'#b7794a':'#d98e55'; g.lineWidth=cs*0.13; g.lineCap='round';
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=cs*0.05;
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
  });
  /* elettroni (si muovono dal − al +, come nella realtà!) */
  b.wires.forEach((w,k)=>{
    const I=oc.flow[k]||0; if(Math.abs(I)<0.0006) return;
    const line=ocWireGeomKey(k);
    const [ax,ay]=ocXY(line.a.x,line.a.y), [bx,by]=ocXY(line.b.x,line.b.y);
    const len=Math.hypot(bx-ax,by-ay);
    const speed=Math.min(90, 25+Math.abs(I)*260);
    const dir=(I>0)?-1:1; /* elettroni contro la corrente convenzionale */
    let off=(oc.time*speed*dir)%OC_ELEC_SP; if(off<0) off+=OC_ELEC_SP;
    const nDots=Math.floor(len/OC_ELEC_SP);
    const r=Math.min(4.2, 2+Math.abs(I)*8);
    g.fillStyle='#ffe14a';
    for(let i2=0;i2<=nDots;i2++){
      const d=(off+i2*OC_ELEC_SP); if(d>len) continue;
      const t=d/len;
      g.beginPath(); g.arc(ax+(bx-ax)*t, ay+(by-ay)*t, r, 0, 7); g.fill();
    }
  });
  /* filo fantasma dal foro di partenza al puntatore */
  if(oc.wireGhost){
    const [ax,ay]=ocXY(oc.wireGhost.from.x,oc.wireGhost.from.y);
    g.save(); g.strokeStyle='rgba(159,239,255,.8)'; g.lineWidth=cs*0.1; g.lineCap='round'; g.setLineDash([8,6]);
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(oc.wireGhost.mx,oc.wireGhost.my); g.stroke(); g.restore();
  }
  /* anteprima magnetica del componente da inserire */
  if(oc.preview){
    const p=oc.preview, [px,py]=ocXY(p.x,p.y);
    g.save();
    g.fillStyle=p.valid?'rgba(92,220,112,.24)':(p.rotate?'rgba(255,202,71,.25)':'rgba(238,83,83,.25)');
    g.strokeStyle=p.valid?'#70e383':(p.rotate?'#ffd35c':'#ff7474'); g.lineWidth=Math.max(3,cs*0.055);
    g.beginPath(); g.arc(px,py,cs*0.43,0,7); g.fill(); g.stroke();
    g.globalAlpha=(p.valid||p.rotate)?0.62:0.38;
    const ghost=ocNewComp(p.t,p.x,p.y,p.r); ghost.ghost=true; ghost.res={I:0,P:0,V:0};
    ocDrawComp(g,ghost);
    g.globalAlpha=1;
    g.fillStyle=p.valid?'#baffc4':(p.rotate?'#fff0a8':'#ffd0d0');
    g.font='bold '+Math.max(13,cs*0.23)+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText(p.valid?'✓':(p.rotate?'↻':'✕'),px+cs*0.34,py-cs*0.32);
    g.restore();
  }
  /* componenti */
  b.comps.forEach(c=>ocDrawComp(g,c));
  /* fumo */
  oc.smoke.forEach(s=>{
    g.fillStyle='rgba(190,190,190,'+Math.max(0,0.55-s.age*0.34)+')';
    g.beginPath(); g.arc(s.x+Math.sin(s.age*5+s.ph)*6, s.y, 6+s.age*14, 0, 7); g.fill();
  });
}
function ocSmoke(x,y){
  const [px,py]=ocXY(x,y);
  for(let i=0;i<5;i++) oc.smoke.push({x:px+(Math.random()*20-10), y:py-8, age:Math.random()*0.3, ph:Math.random()*7});
}
function ocCap(g,c,px,py,cs,label){
  g.fillStyle='#fff'; g.font='bold '+Math.max(10,cs*0.15)+'px Andika, sans-serif'; g.textAlign='center';
  g.fillText(label, px, py+cs*0.52);
}
function ocDrawComp(g,c){
  const cs=oc.cs, [px,py]=ocXY(c.x,c.y);
  const i=LI(), name=OC_T.names[c.t]?OC_T.names[c.t][i]:'';
  const vert=(c.r%2===1);
  g.save(); g.translate(px,py); if(vert) g.rotate(Math.PI/2); g.translate(-px,-py);
  const hw=cs*0.34, hh=cs*0.22;
  switch(c.t){
    case 'batt':{
      const flip=(c.r>=2)?-1:1;
      g.fillStyle='#2f2b46'; g.fillRect(px-hw,py-hh,hw*2,hh*2);
      g.fillStyle='#f5a623'; g.fillRect(px-hw+3,py-hh+3,hw*2-6,hh*2-6);
      g.fillStyle='#2f2b46'; g.font='bold '+cs*0.24+'px Andika, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText('−', px-hw*0.5*flip, py); g.fillText('+', px+hw*0.5*flip, py);
      g.fillStyle='#c9c9c9'; g.fillRect(px+hw*flip-(flip>0?0:4), py-5, 4, 10);
      break; }
    case 'lamp':{
      const p=c.res?c.res.P:0, br=Math.min(1,p/1.3);
      const lampOn=p>OC_LAMP_LIT*0.7; /* niente alone sotto la soglia di "accesa" */
      if(lampOn){ const gr=g.createRadialGradient(px,py,2,px,py,cs*0.55);
        gr.addColorStop(0,'rgba(255,236,140,'+(0.35+br*0.6)+')'); gr.addColorStop(1,'rgba(255,236,140,0)');
        g.fillStyle=gr; g.beginPath(); g.arc(px,py,cs*0.55,0,7); g.fill(); }
      g.fillStyle=lampOn?'rgb(255,'+(200+Math.round(br*55))+','+Math.round(90+br*120)+')':'#efe9dc';
      g.beginPath(); g.arc(px,py-cs*0.04,cs*0.2,0,7); g.fill();
      g.strokeStyle='#8a8578'; g.lineWidth=2; g.stroke();
      g.fillStyle='#9a948a'; g.fillRect(px-cs*0.08,py+cs*0.13,cs*0.16,cs*0.1);
      g.strokeStyle='#c07f30'; g.lineWidth=1.6;
      g.beginPath(); g.moveTo(px-6,py); g.quadraticCurveTo(px,py-9,px+6,py); g.stroke();
      break; }
    case 'sw':{
      g.fillStyle='#39355c'; g.beginPath(); g.arc(px-hw*0.6,py,4,0,7); g.arc(px+hw*0.6,py,4,0,7); g.fill();
      g.strokeStyle=c.state.closed?'#57d06a':'#e05555'; g.lineWidth=5; g.lineCap='round';
      g.beginPath(); g.moveTo(px-hw*0.6,py);
      if(c.state.closed) g.lineTo(px+hw*0.6,py); else g.lineTo(px+hw*0.35,py-cs*0.22);
      g.stroke();
      g.fillStyle='#ffd35c'; g.beginPath(); g.arc(px,py+cs*0.2,cs*0.09,0,7); g.fill();
      break; }
    case 'led':{
      const flip=(c.r>=2)?-1:1;
      const ii=c.res?c.res.I:0;
      const lit=!c.state.burnt && ii>OC_LED_LIT; /* acceso solo sopra la soglia vera */
      if(lit){
        const al=Math.min(0.95, 0.45+(ii-OC_LED_LIT)*20)*(ii>OC_LED_BURN?(0.7+0.3*Math.sin(oc.time*30)):1);
        const gr=g.createRadialGradient(px,py,2,px,py,cs*0.6);
        gr.addColorStop(0,'rgba(255,120,120,'+al+')'); gr.addColorStop(1,'rgba(255,90,90,0)');
        g.fillStyle=gr; g.beginPath(); g.arc(px,py,cs*0.6,0,7); g.fill();
        /* raggi: acceso senza dubbi */
        g.strokeStyle='rgba(255,200,120,'+al+')'; g.lineWidth=3; g.lineCap='round';
        for(let k2=0;k2<8;k2++){ const a2=k2*Math.PI/4+oc.time*1.5;
          g.beginPath(); g.moveTo(px+Math.cos(a2)*cs*0.3,py+Math.sin(a2)*cs*0.3);
          g.lineTo(px+Math.cos(a2)*cs*(0.42+0.04*Math.sin(oc.time*8+k2)),py+Math.sin(a2)*cs*(0.42+0.04*Math.sin(oc.time*8+k2))); g.stroke(); }
      }
      g.fillStyle=c.state.burnt?'#777':(lit?'#ff5c5c':'#6e3a3a');
      g.beginPath();
      g.moveTo(px-hw*0.5*flip,py-hh); g.lineTo(px-hw*0.5*flip,py+hh); g.lineTo(px+hw*0.45*flip,py); g.closePath(); g.fill();
      g.strokeStyle=c.state.burnt?'#555':'#7a2e2e'; g.lineWidth=3;
      g.beginPath(); g.moveTo(px+hw*0.5*flip,py-hh); g.lineTo(px+hw*0.5*flip,py+hh); g.stroke();
      if(c.state.burnt){ g.fillStyle='#444'; g.font=cs*0.3+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('✖', px, py); }
      break; }
    case 'res':{
      g.strokeStyle='#e8c07a'; g.lineWidth=cs*0.13; g.lineCap='round';
      g.beginPath(); g.moveTo(px-hw,py); g.lineTo(px-hw*0.55,py); g.moveTo(px+hw*0.55,py); g.lineTo(px+hw,py); g.stroke();
      g.fillStyle='#d9a44a'; g.beginPath();
      g.moveTo(px-hw*0.55,py-hh); g.lineTo(px+hw*0.55,py-hh*0.35); g.lineTo(px+hw*0.55,py+hh*0.35); g.lineTo(px-hw*0.55,py+hh); g.closePath(); g.fill();
      g.strokeStyle='#8a6420'; g.lineWidth=2; g.stroke();
      break; }
    case 'cap':{
      const ch=Math.min(1,Math.abs(c.state.vc)/OC_VOLT);
      g.strokeStyle='#e8c07a'; g.lineWidth=cs*0.13; g.lineCap='round';
      g.beginPath(); g.moveTo(px-hw,py); g.lineTo(px-cs*0.09,py); g.moveTo(px+cs*0.09,py); g.lineTo(px+hw,py); g.stroke();
      g.strokeStyle='#7fb2e5'; g.lineWidth=5;
      g.beginPath(); g.moveTo(px-cs*0.09,py-hh); g.lineTo(px-cs*0.09,py+hh); g.moveTo(px+cs*0.09,py-hh); g.lineTo(px+cs*0.09,py+hh); g.stroke();
      /* livello di riempimento */
      g.fillStyle='rgba(255,225,74,'+(0.25+ch*0.7)+')';
      g.fillRect(px-cs*0.07, py+hh-ch*hh*2, cs*0.14, ch*hh*2);
      break; }
    case 'npn':{
      const on=c.state.ceOn;
      g.fillStyle=on?'#3f8f4f':'#4a4462'; g.beginPath(); g.arc(px,py,cs*0.26,0,7); g.fill();
      g.strokeStyle='#ddd'; g.lineWidth=2.5; g.stroke();
      /* rubinetto */
      g.strokeStyle=on?'#a8e6b0':'#bbb'; g.lineWidth=4; g.lineCap='round';
      g.save(); g.translate(px,py); g.rotate(on?0:(Math.PI/4));
      g.beginPath(); g.moveTo(-cs*0.14,0); g.lineTo(cs*0.14,0); g.stroke(); g.restore();
      break; }
    case 'mot':{
      const sp=c.state.ang;
      g.fillStyle='#4a4462'; g.beginPath(); g.arc(px,py,cs*0.28,0,7); g.fill();
      g.strokeStyle='#ddd'; g.lineWidth=2.5; g.stroke();
      g.save(); g.translate(px,py); g.rotate(sp);
      g.fillStyle='#9fd4f0';
      for(let k2=0;k2<3;k2++){ g.rotate(Math.PI*2/3); g.beginPath(); g.ellipse(0,-cs*0.14,cs*0.06,cs*0.13,0,0,7); g.fill(); }
      g.restore();
      break; }
    case 'buz':{
      const on=(c.res?c.res.P:0)>OC_BUZ_ON;
      g.fillStyle='#4a4462'; g.beginPath(); g.arc(px,py,cs*0.24,0,7); g.fill();
      /* campanella vettoriale: lo stesso simbolo compare nella palette */
      g.fillStyle=on?'#ffd35c':'#aaa5b8'; g.beginPath();
      g.moveTo(px-cs*0.12,py+cs*0.07); g.quadraticCurveTo(px-cs*0.08,py-cs*0.14,px,py-cs*0.15);
      g.quadraticCurveTo(px+cs*0.08,py-cs*0.14,px+cs*0.12,py+cs*0.07);
      g.lineTo(px+cs*0.16,py+cs*0.12); g.lineTo(px-cs*0.16,py+cs*0.12); g.closePath(); g.fill();
      g.beginPath(); g.arc(px,py+cs*0.16,cs*0.035,0,7); g.fill();
      if(on){ g.strokeStyle='rgba(255,211,92,'+(0.5+0.3*Math.sin(oc.time*20))+')'; g.lineWidth=2; g.lineCap='round';
        g.beginPath(); g.arc(px,py,cs*0.32,-0.8,0.8); g.moveTo(px-cs*0.22,py-cs*0.22); g.arc(px,py,cs*0.32,Math.PI-0.8,Math.PI+0.8); g.stroke(); }
      break; }
    case 'ldr':{
      g.fillStyle='#4a4462'; g.fillRect(px-hw*0.7,py-hh,hw*1.4,hh*2);
      g.fillStyle=oc.sun?'#ffd35c':'#39558f'; g.beginPath(); g.arc(px,py,cs*0.13,0,7); g.fill();
      g.strokeStyle='#ddd'; g.lineWidth=2;
      for(let k2=0;k2<4;k2++){ const a=k2*Math.PI/2+Math.PI/4;
        g.beginPath(); g.moveTo(px+Math.cos(a)*cs*0.17,py+Math.sin(a)*cs*0.17); g.lineTo(px+Math.cos(a)*cs*0.24,py+Math.sin(a)*cs*0.24); g.stroke(); }
      break; }
  }
  g.restore();
  if(!c.ghost){
    /* nome scritto (lettura leggera) + lucchetto */
    ocCap(g,c,px,py,cs,name);
    if(oc.sandbox){
      g.fillStyle='#fff7cc'; g.strokeStyle='#6c51b8'; g.lineWidth=Math.max(1.5,cs*0.025);
      g.beginPath(); g.arc(px-cs*0.28,py-cs*0.29,Math.max(7,cs*0.105),0,7); g.fill(); g.stroke();
      g.fillStyle='#563aa7'; g.font='bold '+Math.max(10,cs*0.16)+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText('i',px-cs*0.28,py-cs*0.285);
    }
    if(c.lock){ g.font=Math.max(9,cs*0.14)+'px sans-serif'; g.textAlign='center'; g.fillText('🔩', px+cs*0.3, py-cs*0.3); }
  }
}

/* ---------- interazione ---------- */
function ocHitNode(mx,my,radius){
  const b=oc.board; let best=null, bd=oc.cs*(radius||0.38);
  for(let x=0;x<b.nx;x++) for(let y=0;y<b.ny;y++){
    const [px,py]=ocXY(x,y), d=Math.hypot(mx-px,my-py);
    if(d<bd){ bd=d; best={x,y}; }
  }
  return best;
}
function ocHitEdge(mx,my){
  const b=oc.board; let best=null, bd=oc.cs*0.3;
  b.wires.forEach((w,k)=>{
    const line=ocWireGeomKey(k);
    const [ax,ay]=ocXY(line.a.x,line.a.y), [bx,by]=ocXY(line.b.x,line.b.y);
    const vx=bx-ax, vy=by-ay, len2=vx*vx+vy*vy;
    const t=Math.max(0,Math.min(1,((mx-ax)*vx+(my-ay)*vy)/len2));
    const d=Math.hypot(mx-(ax+vx*t),my-(ay+vy*t));
    if(d<bd){ bd=d; best=k; }
  });
  return best;
}
function ocAddWire(x,y,o){
  const b=oc.board, k=ocEK(x,y,o), line=ocWireGeom(x,y,o);
  if(!line) return false;
  if(b.wires.has(k)) return false;
  const inside=p=>p.x>=0&&p.y>=0&&p.x<b.nx&&p.y<b.ny;
  if(!inside(line.a)||!inside(line.b)) return false;
  if(!ocWireSideAt(line.a,line.b)||!ocWireSideAt(line.b,line.a)){ ocToast(OC_T.noPin[LI()]); return false; }
  if(!ocHasPiece('wire')){ ocToast(OC_T.noPiece[LI()]); return false; }
  b.wires.set(k,{}); ocTakePiece('wire'); ocPalDraw(); return true;
}
function ocSmartRot(t,x,y){
  /* scegli la rotazione che aggancia più fili vicini */
  const b=oc.board, rmax=(t==='npn')?4:4; let best=0, bestN=-1;
  for(let r=0;r<rmax;r++){
    const candidate={t,r}, here={x,y}; let n2=0;
    b.wires.forEach((w,k)=>{
      const line=ocWireGeomKey(k);
      if(line.a.x===x&&line.a.y===y&&ocWireSideAt(here,line.b,candidate)) n2++;
      else if(line.b.x===x&&line.b.y===y&&ocWireSideAt(here,line.a,candidate)) n2++;
    });
    if(n2>bestN){ bestN=n2; best=r; }
  }
  return best;
}
function ocPlace(t,x,y,r){
  const b=oc.board, k=ocNK(x,y);
  if(b.comps.has(k)) return false;
  if(!ocHasPiece(t)){ ocToast(OC_T.noPiece[LI()]); return false; }
  b.comps.set(k, ocNewComp(t,x,y,(r===undefined)?ocSmartRot(t,x,y):r));
  ocTakePiece(t); ocPalDraw(); return true;
}
function ocInteract(c){
  if(c.t==='sw'){ c.state.closed=!c.state.closed; return; }
  if(c.t==='led'){
    if(c.state.burnt){ c.state.burnt=false; c.state.heat=0; ocToast(OC_T.fixed[LI()]); }
    else c.r=(c.r+2)%4; /* gira il verso */
    return;
  }
  if(!c.lock) c.r=((c.r||0)+1)%4;
}
function ocIsComponentTool(t){ return t!=='hand'&&t!=='wire'&&t!=='erase'; }
function ocPreviewAt(mx,my,radius){
  if(!ocIsComponentTool(oc.tool)){ oc.preview=null; return null; }
  const nd=ocHitNode(mx,my,radius||0.68);
  if(!nd){ oc.preview=null; return null; }
  const c=oc.board.comps.get(ocNK(nd.x,nd.y)), occupied=!!c;
  oc.preview={t:oc.tool,x:nd.x,y:nd.y,r:ocSmartRot(oc.tool,nd.x,nd.y),valid:!occupied&&ocHasPiece(oc.tool),rotate:!!(c&&c.t===oc.tool&&!c.lock)};
  return oc.preview;
}
function ocPointer(e){
  if($('oc').style.display!=='block') return;
  if(e.target.closest&&e.target.closest('#ocInfo,#ocHud,#ocPalBar,#ocSun')) return;
  const mx=e.clientX, my=e.clientY;
  const palTop=$('ocPalBar').getBoundingClientRect().top||innerHeight-92;
  if(my>palTop||my<110) return; /* palette e hud */
  const nd=ocHitNode(mx,my,0.48);
  if(oc.tool==='hand'){
    if(nd){ const c=oc.board.comps.get(ocNK(nd.x,nd.y)); if(c){ if(oc.sandbox) ocInfoShow(c.t); ocInteract(c); } }
    return;
  }
  if(oc.tool==='erase'){
    if(nd){ const k=ocNK(nd.x,nd.y), c=oc.board.comps.get(k);
      if(c){ if(c.lock){ ocToast(OC_T.locked[LI()]); } else { oc.board.comps.delete(k); ocGiveBack(c.t); ocPalDraw(); } return; } }
    const ek=ocHitEdge(mx,my);
    if(ek){ const w=oc.board.wires.get(ek);
      if(w.lock){ ocToast(OC_T.locked[LI()]); } else { oc.board.wires.delete(ek); ocGiveBack('wire'); ocPalDraw(); } }
    return;
  }
  if(oc.tool==='wire'){
    if(nd){ oc.drag={last:nd}; oc.wireGhost={from:nd,mx,my}; }
    return;
  }
  /* il componente si vede prima e viene posato al rilascio */
  if(ocIsComponentTool(oc.tool)){
    const p=ocPreviewAt(mx,my,0.72);
    if(!p) return;
    /* Sul PC il clic deve essere immediato: il ghost ha già scelto il foro. */
    if(!e.pointerType||e.pointerType==='mouse'){
      const c=oc.board.comps.get(ocNK(p.x,p.y));
      if(p.valid) ocPlace(p.t,p.x,p.y,p.r);
      else if(p.rotate&&c) c.r=((c.r||0)+1)%4;
      else if(c) ocToast(OC_T.occupied[LI()]);
      oc.preview=null; oc.placing=false;
      return;
    }
    oc.placing=true;
    if(oc.placing){
      e.preventDefault();
      try{ $('ocCv').setPointerCapture(e.pointerId); }catch(err){}
    }
  }
}
function ocPointerMove(e){
  if($('oc').style.display!=='block') return;
  if(ocIsComponentTool(oc.tool)){
    if(oc.placing||e.target===$('ocCv')) ocPreviewAt(e.clientX,e.clientY,oc.placing?0.9:0.68);
    else oc.preview=null;
    return;
  }
  if(oc.drag){
    oc.wireGhost={from:oc.drag.last,mx:e.clientX,my:e.clientY};
    const nd=ocHitNode(e.clientX,e.clientY,0.48); if(!nd) return;
    const L2=oc.drag.last;
    const dx=nd.x-L2.x, dy=nd.y-L2.y;
    if(!dx&&!dy) return;
    if(Math.abs(dx)>1||Math.abs(dy)>1){ oc.drag.last=nd; oc.wireGhost.from=nd; return; }
    if(dx===1&&dy===0) ocAddWire(L2.x,L2.y,'H');
    else if(dx===-1&&dy===0) ocAddWire(nd.x,nd.y,'H');
    else if(dx===0&&dy===1) ocAddWire(L2.x,L2.y,'V');
    else if(dx===0&&dy===-1) ocAddWire(nd.x,nd.y,'V');
    else if(dx===1&&dy===1) ocAddWire(L2.x,L2.y,'D');
    else if(dx===-1&&dy===-1) ocAddWire(nd.x,nd.y,'D');
    else if(dx===1&&dy===-1) ocAddWire(L2.x,nd.y,'U');
    else if(dx===-1&&dy===1) ocAddWire(nd.x,L2.y,'U');
    oc.drag.last=nd;
    oc.wireGhost.from=nd;
  }
}
function ocPointerUp(e){
  if(oc.placing&&oc.preview){
    const p=oc.preview, c=oc.board.comps.get(ocNK(p.x,p.y));
    if(p.valid) ocPlace(p.t,p.x,p.y,p.r);
    else if(c&&c.t===p.t&&!c.lock) c.r=((c.r||0)+1)%4;
    else if(c) ocToast(OC_T.occupied[LI()]);
  }
  if(e){ try{ if($('ocCv').hasPointerCapture(e.pointerId)) $('ocCv').releasePointerCapture(e.pointerId); }catch(err){} }
  oc.drag=null; oc.wireGhost=null; oc.placing=false; oc.preview=null;
}
addEventListener('pointerdown',ocPointer);
addEventListener('pointermove',ocPointerMove);
addEventListener('pointerup',ocPointerUp);
addEventListener('pointercancel',ocPointerUp);
addEventListener('resize',()=>{ if(oc.on) ocResize(); });

/* miniatura identica al simbolo disegnato sul circuito */
function ocToolIconMarkup(t,extraClass){
  if(t==='hand'||t==='erase') return '<span class="ti" aria-hidden="true">'+OC_T.icons[t]+'</span>';
  return '<canvas class="ti ocCircuitSymbol '+(extraClass||'')+'" width="128" height="80" aria-hidden="true"></canvas>';
}
function ocPaintToolSymbol(canvas,t){
  if(!canvas||t==='hand'||t==='erase') return;
  const g=canvas.getContext('2d'); if(!g) return;
  g.clearRect(0,0,canvas.width,canvas.height); g.save();
  g.scale(canvas.width/64,canvas.height/40);
  if(t==='wire'){
    g.strokeStyle='#d98e55'; g.lineWidth=7; g.lineCap='round';
    g.beginPath(); g.moveTo(7,25); g.lineTo(57,15); g.stroke();
    g.strokeStyle='rgba(255,255,255,.28)'; g.lineWidth=2.5;
    g.beginPath(); g.moveTo(7,23); g.lineTo(57,13); g.stroke();
  }else{
    const saved={cs:oc.cs,ox:oc.ox,oy:oc.oy,sandbox:oc.sandbox};
    oc.cs=52; oc.ox=32; oc.oy=18; oc.sandbox=false;
    const c=ocNewComp(t,0,0,0); c.ghost=true; c.res={I:0,P:0,V:0};
    ocDrawComp(g,c);
    oc.cs=saved.cs; oc.ox=saved.ox; oc.oy=saved.oy; oc.sandbox=saved.sandbox;
  }
  g.restore();
}

/* ---------- palette ---------- */
function ocPalDraw(){
  const bar=$('ocPalBar'); bar.innerHTML='';
  bar.className=oc.sandbox?'sandbox':'';
  const i=LI();
  const tools=['hand','wire','erase'].concat(Object.keys(oc.pal).filter(t=>t!=='wire'));
  tools.forEach(t=>{
    if(t==='wire'&&oc.pal.wire===undefined) return;
    const btn=document.createElement('button');
    btn.className='ocTool'+(oc.tool===t?' sel':'');
    btn.setAttribute('aria-pressed',oc.tool===t?'true':'false');
    const raw=(t==='wire'?oc.pal.wire:oc.pal[t]);
    const cnt=(t==='hand'||t==='erase')?'':(raw===Infinity?'∞':raw);
    if(cnt===0) btn.classList.add('zero');
    btn.innerHTML=ocToolIconMarkup(t)+'<span class="tn">'+OC_T.names[t][i]+'</span>'+(cnt!==''?'<span class="tc'+(cnt==='∞'?' inf':'')+'">'+cnt+'</span>':'');
    btn.title=oc.sandbox&&OC_INFO[t]?((i===0?'Scegli e scopri: ':'Choose and discover: ')+OC_T.names[t][i]):OC_T.names[t][i];
    btn.onclick=()=>{ oc.tool=t; oc.preview=null; oc.placing=false; oc.drag=null; oc.wireGhost=null; if(oc.sandbox&&OC_INFO[t]) ocInfoShow(t); ocPalDraw(); };
    bar.appendChild(btn);
    ocPaintToolSymbol(btn.querySelector('canvas'),t);
  });
  /* filo subito dopo la mano */
  const kids=[...bar.children];
  if(oc.pal.wire===undefined&&kids.length){ /* nothing */ }
  $('ocCv').style.cursor=ocIsComponentTool(oc.tool)?'crosshair':(oc.tool==='erase'?'not-allowed':'default');
  bar.style.display='flex';
}

function ocHasPiece(t){ return oc.pal[t]===Infinity||(oc.pal[t]||0)>0; }
function ocTakePiece(t){ if(oc.pal[t]!==Infinity) oc.pal[t]--; }
function ocGiveBack(t){ if(oc.pal[t]!==Infinity) oc.pal[t]=(oc.pal[t]||0)+1; }

function ocInfoShow(t){
  const info=OC_INFO[t]; if(!oc.sandbox||!info) return;
  const i=LI(); oc.infoType=t;
  const title=$('ocInfoTitle');
  title.innerHTML=ocToolIconMarkup(t,'ocInfoSymbol')+'<span></span>';
  title.querySelector('span:last-child').textContent=OC_T.names[t][i];
  ocPaintToolSymbol(title.querySelector('canvas'),t);
  const help=$('ocInfoHelp');
  help.style.display='block';
  help.textContent=t==='wire'
    ?(i===0?'〰️ Trascina da un foro a quello vicino: ora puoi andare anche in diagonale.':'〰️ Drag from one hole to a nearby one: diagonal wires are now supported too.')
    :(i===0?'👻 PC: muovi il ghost e clicca per fissarlo. Touch: trascina e rilascia. Verde inserisce, giallo ruota, rosso è occupato.':'👻 PC: move the ghost and click to attach it. Touch: drag and release. Green places, yellow rotates, red is occupied.');
  $('ocInfoMetaphor').innerHTML='<strong>'+(i===0?'🧰 NEL GIOCO':'🧰 IN THE GAME')+'</strong>';
  $('ocInfoMetaphor').appendChild(document.createTextNode(info.metaphor[i]));
  $('ocInfoReal').innerHTML='<strong>'+(i===0?'🔬 COME FUNZIONA DAVVERO':'🔬 HOW IT REALLY WORKS')+'</strong>';
  $('ocInfoReal').appendChild(document.createTextNode(info.real[i]));
  $('ocInfoClose').setAttribute('aria-label',i===0?'Chiudi':'Close');
  $('ocInfo').style.display='block';
}

/* ---------- messaggi ---------- */
let ocMsgTimer=0;
function ocToast(t){
  const m=$('ocMsg'); m.textContent=t; m.style.display='block';
  m.style.bottom=($('ocWinBar').style.display==='flex')?'190px':'';
  clearTimeout(ocMsgTimer); ocMsgTimer=setTimeout(()=>{ m.style.display='none'; },2600);
}

/* ---------- flusso di livello ---------- */
function ocGoto(n){
  oc.sandbox=(n<0);
  oc.lvl=Math.max(0,n);
  const L=oc.sandbox?OC_SANDBOX:OC_LEVELS[oc.lvl];
  oc.L=oc.sandbox?null:L;
  oc.board=ocBuildBoard(L);
  oc.pal=Object.assign({},L.pal);
  oc.tool=(L.pal&&L.pal.wire)?'wire':'hand';
  oc.mish=0; oc.hint=0; oc.hintT=0; oc.winT=0; oc.won=false;
  oc.flags={}; oc.dayT=0; oc.nightT=0; oc.sun=true; oc.smoke=[];
  oc.freeBurnLeft=(L.freeBurn||0);
  oc.infoType=null; oc.preview=null; oc.placing=false; oc.drag=null; oc.wireGhost=null; $('ocInfo').style.display='none';
  const i=LI();
  $('ocLvl').textContent=oc.sandbox?(i===0?'🧪 BANCO 12×8 · PEZZI ∞':'🧪 BENCH 12×8 · PARTS ∞'):'⚡ '+(oc.lvl+1)+'/'+OC_LEVELS.length;
  ocStarHud();
  $('ocSun').style.display=L.sun?'block':'none'; ocSunDraw();
  $('ocHintBtn').style.display=oc.sandbox?'none':'';
  $('ocGoal').style.display=oc.sandbox?'none':'block';
  if(!oc.sandbox) $('ocGoalTxt').textContent=L.g[i];
  ocResize(); ocPalDraw();
  $('ocWinBar').style.display='none';
  ['ocIntro','ocWin','ocPick'].forEach(id=>$(id).style.display='none');
  $('ocGibiDesk').style.display='block';
  if(!oc.sandbox){
    $('ocIntroTit').textContent='⚡ '+(oc.lvl+1)+'. '+L.t[i];
    $('ocIntroTxt').textContent=L.g[i];
    const newComp=Object.keys(L.pal||{}).filter(t=>t!=='wire')[0];
    const nv=$('ocIntroNew');
    if(newComp){
      nv.style.display='flex';
      nv.innerHTML=ocToolIconMarkup(newComp,'ocIntroSymbol')+'<span></span>';
      nv.querySelector('span:last-child').textContent=((i===0)?'Nuovo pezzo: ':'New piece: ')+OC_T.names[newComp][i];
      ocPaintToolSymbol(nv.querySelector('canvas'),newComp);
    }
    else nv.style.display='none';
    $('ocIntro').style.display='flex';
    $('ocGibiDesk').style.display='none';
  }
}
function ocStarHud(){
  const st=Math.max(1,3-Math.min(2,oc.mish+(oc.hint?1:0)));
  $('ocStar').textContent=oc.sandbox?'🔧':'⭐'.repeat(st)+'☆'.repeat(3-st);
}
function ocWinShow(){
  /* non modale: il circuito resta giocabile, si prosegue solo col bottone */
  const i=LI();
  const st=Math.max(1,3-Math.min(2,oc.mish+(oc.hint?1:0)));
  oc.wonStars=st;
  const best=oc.prog.stars[oc.lvl]||0;
  if(st>best) oc.prog.stars[oc.lvl]=st;
  if(oc.lvl+1>oc.prog.unl) oc.prog.unl=Math.min(OC_LEVELS.length-1,oc.lvl+1);
  ocSave();
  $('ocWinBarTxt').textContent='🏆 '+OC_T.win[i]+' '+'⭐'.repeat(st);
  $('ocWinBarGo').textContent=OC_T.next[i];
  $('ocWinBarSub').textContent=OC_T.winPlay[i];
  $('ocWinBar').style.display='flex';
  if(typeof VOICEON!=='undefined'&&VOICEON) speak((i===0)?'Bravo! Circuito riuscito!':'Well done! Circuit complete!');
}
$('ocWinBarGo').onclick=()=>{
  const i=LI();
  $('ocWinBar').style.display='none';
  const st=oc.wonStars||1;
  $('ocWinTit').textContent=OC_T.win[i];
  $('ocWinStars').textContent='⭐'.repeat(st)+'☆'.repeat(3-st);
  $('ocKnowTit').textContent=OC_T.know[i];
  ocFactDraw(oc.L.know[i]);
  $('ocGibiDesk').style.display='none';
  $('ocWin').style.display='flex';
};
function ocFactDraw(text){
  const box=$('ocKnowTxt'); box.innerHTML='';
  const parts=text.split(/\n\n/);
  parts.forEach((part,n)=>{
    const div=document.createElement('div');
    div.className='ocFact '+(n===0?'metaphor':'real');
    const cut=part.indexOf(':');
    if(cut>0){
      const strong=document.createElement('strong');
      strong.textContent=part.slice(0,cut);
      div.appendChild(strong);
      div.appendChild(document.createTextNode(part.slice(cut+1).trim()));
    }else div.textContent=part;
    box.appendChild(div);
  });
}
function ocPickShow(){
  const i=LI();
  $('ocPickTit').textContent='⚡ '+OC_T.bench[i];
  $('ocPickSub').textContent=OC_T.story[i];
  const grid=$('ocPickGrid'); grid.innerHTML='';
  OC_LEVELS.forEach((L,n)=>{
    const btn=document.createElement('button');
    const locked=n>oc.prog.unl;
    btn.className='ocLvBtn'+(locked?' lock':'')+(!locked&&n===oc.prog.unl?' next':'');
    const st=oc.prog.stars[n]||0;
    btn.innerHTML='<span class="ln">'+(locked?'🔒':OC_LEVEL_ICONS[n])+'</span><span class="lt">'+(n+1)+'. '+L.t[i]+'</span><span class="ls">'+(st?'⭐'.repeat(st):(locked?'':'NUOVO'))+'</span>';
    if(!locked) btn.onclick=()=>{ ocGoto(n); };
    grid.appendChild(btn);
  });
  const sb=document.createElement('button');
  sb.className='ocLvBtn sand';
  sb.innerHTML='<span class="ln">🧪</span><span class="lt">'+OC_T.sandbox[i]+'</span><span class="ls">'+OC_T.sandboxSub[i]+'</span>';
  sb.onclick=()=>{ ocGoto(-1); };
  grid.appendChild(sb);
  if(window.__OL){
    const logic=document.createElement('button');
    logic.className='ocLvBtn sand';
    logic.innerHTML='<span class="ln">💡</span><span class="lt">'+(i===0?'Banco 2: Porte logiche':'Bench 2: Logic gates')+'</span><span class="ls">'+(i===0?'RIPARA GLI OCCHI DI GIBI':'REPAIR GIBI\'S EYES')+'</span>';
    logic.onclick=()=>{ ocExit(); window.__OL.enter(); };
    grid.appendChild(logic);
  }
  $('ocPickBack').textContent=OC_T.back[i];
  const repaired=oc.prog.stars.filter(Boolean).length;
  $('ocPickGibi').style.filter='drop-shadow(0 10px 12px rgba(55,35,105,.22)) '+(repaired?'saturate(1)':'grayscale(.72) brightness(.72)');
  $('ocGibiDesk').style.display='none';
  $('ocPick').style.display='flex';
}
function ocSunDraw(){
  const b=$('ocSun');
  b.textContent=oc.sun?'☀️':'🌙';
  b.className=oc.sun?'day':'night';
}

/* ---------- pulsanti ---------- */
$('ocSun').onclick=()=>{ oc.sun=!oc.sun; ocSunDraw(); };
$('ocInfoClose').onclick=()=>{ $('ocInfo').style.display='none'; oc.infoType=null; stopSpeak(); };
$('ocInfoSpeak').onclick=()=>{ if(oc.infoType&&OC_INFO[oc.infoType]){ const i=LI(),d=OC_INFO[oc.infoType]; speak(OC_T.names[oc.infoType][i]+'. '+d.metaphor[i]+' '+d.real[i]); } };
$('ocIntroGo').onclick=()=>{ $('ocIntro').style.display='none'; $('ocGibiDesk').style.display='block'; stopSpeak(); };
$('ocIntroSpk').onclick=()=>{ if(oc.L) speak(oc.L.g[LI()]); };
$('ocGoalSpk').onclick=()=>{ if(oc.L) speak(oc.L.g[LI()]); };
$('ocKnowSpk').onclick=()=>{ speak($('ocKnowTxt').textContent); };
$('ocWinNext').onclick=()=>{
  $('ocWin').style.display='none'; $('ocGibiDesk').style.display='block'; stopSpeak();
  if(oc.lvl+1<OC_LEVELS.length) ocGoto(oc.lvl+1); else ocPickShow();
};
$('ocResetBtn').onclick=()=>{ ocGoto(oc.sandbox?-1:oc.lvl); if(!oc.sandbox) $('ocIntro').style.display='none'; };
$('ocPickBtn').onclick=()=>{ ocPickShow(); };
$('ocHintBtn').onclick=()=>{
  if(oc.sandbox||!oc.L) return;
  oc.hint=1; oc.hintT=4; ocStarHud(); ocToast(OC_T.hintMsg[LI()]);
};
$('ocPickBack').onclick=()=>{ ocExit(); };
$('ocHomeBtn').onclick=()=>{ ocExit(); };
$('ocMusicBtn').onclick=()=>{
  MUSICON=!MUSICON; if(typeof save==='function') save();
  if(!MUSICON) stopMusic(); else { mCtx(); playMusic(TRK_LEVEL); }
};

/* ---------- ciclo ---------- */
function ocFrame(ts){
  if(!oc.on) return;
  const dt=Math.min(0.05, (ts-oc.last)/1000||0.016); oc.last=ts;
  ocStep(dt);
  ocDraw();
  oc.raf=requestAnimationFrame(ocFrame);
}
function ocEnter(){
  if(typeof VOICEON!=='undefined'&&VOICEON&&typeof initTTS==='function') initTTS();
  paused=true; stopSpeak();
  ['modeSel','menu'].forEach(id=>{ const el=$(id); if(el) el.style.display='none'; });
  $('hud').style.display='none'; $('joy').style.display='none';
  $('oc').style.display='block';
  const bi=LI();
  $('ocHintBtn').innerHTML='💡<span class="bl">'+(bi===0?'AIUTO':'HELP')+'</span>';
  $('ocResetBtn').innerHTML='🔄<span class="bl">'+(bi===0?'RIFAI':'RESET')+'</span>';
  $('ocPickBtn').innerHTML='📋<span class="bl">'+(bi===0?'LIVELLI':'LEVELS')+'</span>';
  oc.on=true; oc.last=0;
  ocGoto(Math.min(oc.prog.unl,OC_LEVELS.length-1));
  ocPickShow();
  $('ocIntro').style.display='none';
  if(typeof MUSICON!=='undefined'&&MUSICON){ mCtx(); playMusic(TRK_LEVEL); }
  if(!oc.raf) oc.raf=requestAnimationFrame(ocFrame);
}
function ocExit(){
  cancelAnimationFrame(oc.raf); oc.raf=0; oc.on=false;
  ['oc','ocIntro','ocWin','ocPick','ocWinBar','ocInfo'].forEach(id=>$(id).style.display='none');
  $('ocPalBar').style.display='none';
  stopSpeak();
  showModeSel();
}

/* ---------- registrazione ---------- */
registerGame({
  id:'officina', emoji:'🔧',
  nm:['L’Officina di Gabri','Gabri’s Workshop'],
  sub:['Riaccendi Gibi il robot: circuiti veri con elettroni che corrono!','Restart Gibi the robot: real circuits with running electrons!'],
  colore:'linear-gradient(180deg,#8c5cf0,#4a2d94)',
  enter:ocEnter,
  exit:()=>{
    if(window.__OL&&window.__OL.ol&&window.__OL.ol.on) window.__OL.exit(false);
    else ocExit();
  }
});

/* ---------- aggancio per i test ---------- */
window.__OC={ oc, levels:OC_LEVELS, goto:ocGoto, step:ocStep, solve:ocSolve,
  place:ocPlace, wire:ocAddWire, comp:ocComp, api:ocApi, preview:ocPreviewAt,
  pointerUp:ocPointerUp, enter:ocEnter, exit:ocExit };
