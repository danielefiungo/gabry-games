/* ============================================================
   MISSIONE SPAZIALE: ORDINI DALLA BASE 🚀
   La sala di controllo manda ORDINI SCRITTI: Gabriele li legge
   e tocca il pannello giusto della plancia. Leggere È il gioco!
   7 fasi vere di una missione: checklist, decollo, separazione
   del primo stadio, orbita, attracco alla ISS, esperimenti,
   rientro con scudo termico e ammaraggio.
   Il carburante si consuma con errori e lettura automatica 🔊;
   ordini giusti al primo colpo lo ricaricano.
   Tra le fasi: il Quiz dell'Astronauta (domande di THEMES,
   premio dimezzato con 🔊 o errori, come nella Palla di Api).
   ============================================================ */

/* ---------- Costanti di tuning (tutte qui!) ---------- */
const MS_FUEL_MAX   = 100;  /* serbatoio pieno */
const MS_FUEL_ERR   = 8;    /* carburante perso per ogni errore */
const MS_FUEL_HEAR  = 6;    /* costo della lettura automatica 🔊 */
const MS_FUEL_TIME  = 10;   /* carburante perso se il tempo scade */
const MS_FUEL_BONUS = 4;    /* bonus per ordine giusto al primo colpo */
const MS_FUEL_EMG   = 10;   /* bonus per imprevisto risolto */
const MS_REW_ORDER  = 2;    /* ⭐ per ordine semplice giusto al 1° colpo */
const MS_REW_SEQ    = 3;    /* ⭐ per sequenza giusta al 1° colpo */
const MS_REW_EMG    = 8;    /* ⭐ per imprevisto risolto senza errori */
const MS_REW_EASY   = 10;   /* ⭐ quiz facile (come palla-api) */
const MS_REW_HARD   = 25;   /* ⭐ quiz difficile */
const MS_T_LIFTOFF  = 12;   /* secondi per l'ordine del decollo */
const MS_T_REENTRY  = 25;   /* secondi per gli ordini del rientro */
const MS_T_EMG      = 40;   /* secondi per risolvere un imprevisto */
const MS_ANIM_MS    = 900;  /* pausa (ms) tra un ordine e l'altro */
const MS_COUNT_FROM = 5;    /* il conto alla rovescia parte da qui */
const MS_COUNT_STEP = 0.8;  /* secondi tra un numero e l'altro */
const MS_SILLY_CHANCE = 0.5;/* probabilità di un ordine sciocco per fase (fasi 2+) */
const MS_EMG_MIN=2, MS_EMG_MAX=3; /* imprevisti per partita */

/* ---------- Stile + HTML ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#ms { position:absolute; inset:0; display:none; z-index:8; background:linear-gradient(180deg,#0b1030,#1a2350 60%,#2b3a8f); }',
  '#msCv { position:absolute; inset:0; }',
  '#msHud { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:8px 12px; z-index:9; pointer-events:none; flex-wrap:wrap; gap:6px; }',
  '#msBtns { pointer-events:auto; display:flex; gap:8px; }',
  '#msFuelBar { display:inline-block; width:min(120px,18vw); height:14px; background:rgba(255,255,255,.25); border-radius:8px; overflow:hidden; vertical-align:middle; margin-left:4px; }',
  '#msFuelFill { display:block; height:100%; width:100%; background:linear-gradient(90deg,#ffb300,#3cba54); border-radius:8px; transition:width .3s; }',
  /* monitor della base */
  '#msMon { position:absolute; top:56px; left:50%; transform:translateX(-50%); width:min(760px,95vw); background:#0d1526; border:4px solid #3d6ef7; border-radius:18px; padding:10px 14px 12px; z-index:9; box-shadow:0 8px 30px rgba(0,0,0,.5); }',
  '#msMon.alarm { border-color:#ff5555; animation:msAlarm .7s infinite; }',
  '@keyframes msAlarm { 0%,100%{ box-shadow:0 0 0 0 rgba(255,60,60,.0);} 50%{ box-shadow:0 0 26px 6px rgba(255,60,60,.75);} }',
  '#msMonTop { display:flex; justify-content:space-between; align-items:center; gap:8px; }',
  '#msMonLab { font-size:14px; letter-spacing:2px; color:#7ea6ff; font-weight:bold; }',
  '#msHear { background:#16233f; border:2px solid #3d6ef7; border-radius:12px; color:#cfe0ff; font-size:15px; font-weight:bold; padding:5px 12px; cursor:pointer; font-family:inherit; }',
  '#msHear:active { transform:translateY(2px); }',
  '#msOrder { font-size:clamp(24px,4.8vw,38px); font-weight:bold; color:#7cff9e; letter-spacing:.08em; word-spacing:.25em; line-height:1.45; text-align:center; padding:10px 4px 6px; min-height:56px; }',
  '#msMon.alarm #msOrder { color:#ff9d9d; }',
  '#msTimerBar { height:10px; background:rgba(255,255,255,.15); border-radius:6px; overflow:hidden; display:none; margin-top:4px; }',
  '#msTimerFill { display:block; height:100%; width:100%; background:#3cba54; border-radius:6px; }',
  '#msProc { display:none; flex-direction:column; gap:8px; margin-top:10px; }',
  '#msProc .ansBtn { font-size:clamp(18px,3.4vw,24px); padding:12px 10px; letter-spacing:.04em; }',
  /* plancia */
  '#msPlancia { position:absolute; left:50%; transform:translateX(-50%); bottom:10px; width:min(860px,97vw); display:grid; grid-template-columns:repeat(4,1fr); gap:8px; z-index:9; background:linear-gradient(180deg,#26314f,#161e35); border:3px solid #3d4d70; border-radius:20px; padding:10px; }',
  '@media (max-width:560px){ #msPlancia { grid-template-columns:repeat(2,1fr); } }',
  '.msPan { border:3px solid #33436b; border-radius:14px; padding:8px 4px 9px; cursor:pointer; font-family:inherit; text-align:center; background:linear-gradient(180deg,#7c90b8,#54678f); color:#fff; box-shadow:0 4px 0 #2c3a5c; transition:transform .1s; }',
  '.msPan:active { transform:translateY(3px); box-shadow:none; }',
  '.msPan .pe { font-size:30px; display:block; }',
  '.msPan .pl { font-size:clamp(13px,2.6vw,17px); font-weight:bold; letter-spacing:.08em; display:block; margin-top:2px; }',
  '.msPan.msNo { background:#e05555; border-color:#9c3030; animation:shake .4s; }',
  '.msPan.msOk { background:#3cba54; border-color:#27803a; animation:pop .4s; }',
  /* messaggi */
  '#msMsg { position:absolute; bottom:150px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.65); color:#fff; padding:9px 20px; border-radius:18px; font-size:18px; z-index:9; display:none; pointer-events:none; max-width:94vw; text-align:center; }',
  '#msBig { position:absolute; top:26%; left:50%; transform:translateX(-50%); z-index:9; pointer-events:none; font-size:clamp(34px,8vw,64px); font-weight:bold; color:#fff; text-shadow:0 3px 0 rgba(0,0,0,.4); opacity:0; text-align:center; }',
  '#msBig.pop { animation:comboBig 1.8s ease-out; }',
  /* quiz + offerta */
  '#msQ .card { max-width:min(1100px,96vw); }',
  '#msQReward { font-size:19px; font-weight:bold; color:#e8a013; margin-bottom:8px; }',
  '#msQText { font-size:clamp(28px,5vw,38px); color:#222; line-height:1.55; letter-spacing:.02em; word-spacing:.12em; margin-bottom:10px; }',
  '#msQAnswers { display:flex; flex-direction:column; gap:12px; }',
  '@media (min-width:760px){ #msQAnswers { display:grid; grid-template-columns:repeat(3,1fr); align-items:stretch; } #msQAnswers .ansBtn { display:flex; align-items:center; justify-content:center; } }',
  '#msQMsg { min-height:30px; font-size:22px; font-weight:bold; margin-top:12px; }',
  '#msQBack, #msEndMenu { margin-top:10px; background:none; border:none; color:#aaa; font-size:15px; cursor:pointer; font-family:inherit; text-decoration:underline; }',
  '#msQOff .card { background:linear-gradient(180deg,#eef4ff,#dbe7ff); }',
  '#msQOff .hsq { border:none; border-radius:16px; padding:14px 18px; font-size:19px; font-weight:bold; cursor:pointer; font-family:inherit; background:#8c5cf0; color:#fff; box-shadow:0 4px 0 #5f36b8; margin:6px; }',
  '#msQOff .hsq:active { transform:translateY(2px); box-shadow:none; }',
  /* scheda curiosità */
  '#msCard .card { background:linear-gradient(180deg,#eef4ff,#d8e6ff); border:4px solid #7ea6ff; max-width:700px; }',
  '#msCardTit { font-size:clamp(22px,4.6vw,30px); color:#2b3a8f; margin:6px 0 10px; }',
  '#msCardTxt { font-size:clamp(20px,3.8vw,26px); line-height:1.65; letter-spacing:.02em; word-spacing:.1em; color:#243055; text-align:left; }',
  '#msCardRead { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:16px; padding:8px 16px; cursor:pointer; margin-top:12px; font-family:inherit; color:#2b3a8f; }',
  '#msEnd .starRowMs { font-size:22px; line-height:1.7; }'
  ].join('\n');
  document.head.appendChild(css);

  document.body.insertAdjacentHTML('beforeend',
  '<div id="ms">'+
    '<canvas id="msCv"></canvas>'+
    '<div id="msHud">'+
      '<div class="hudBox" id="msFase">🚀 FASE 1/7</div>'+
      '<div class="hudBox" id="msFuelBox">⛽<span id="msFuelBar"><span id="msFuelFill"></span></span></div>'+
      '<div class="hudBox" id="msScore">⭐ 0</div>'+
      '<div id="msBtns">'+
        '<button class="hudBtn" id="msMusicBtn" title="Musica">🎵</button>'+
        '<button class="hudBtn" id="msHomeBtn" title="Menu">🏠</button>'+
      '</div>'+
    '</div>'+
    '<div id="msMon">'+
      '<div id="msMonTop"><span id="msMonLab">📡 ORDINI DALLA BASE</span><button id="msHear">🔊</button></div>'+
      '<div id="msOrder"></div>'+
      '<div id="msTimerBar"><span id="msTimerFill"></span></div>'+
      '<div id="msProc"></div>'+
    '</div>'+
    '<div id="msBig"></div>'+
    '<div id="msMsg"></div>'+
    '<div id="msPlancia"></div>'+
  '</div>'+
  '<div class="overlay" id="msQOff">'+
    '<div class="card">'+
      '<div style="font-size:50px">🧑‍🚀</div>'+
      '<div id="msQOffTit" style="font-size:clamp(24px,5vw,34px);color:#2b3a8f;margin:6px 0"></div>'+
      '<div id="msQOffSub" style="font-size:17px;color:#666;margin-bottom:10px"></div>'+
      '<div><button class="hsq" id="msQOffEasy"></button><button class="hsq" id="msQOffHard"></button></div>'+
      '<div><button class="hsq" id="msQOffNo" style="background:#3cba54;box-shadow:0 4px 0 #27803a"></button></div>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="msQ">'+
    '<div class="card">'+
      '<div id="msQEmoji" style="font-size:44px">🚀</div>'+
      '<div id="msQTheme" style="font-size:15px;color:#999;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px"></div>'+
      '<div id="msQReward"></div>'+
      '<div id="msQText"></div>'+
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">'+
        '<button id="msQSpeak" class="jollyBtn"></button>'+
      '</div>'+
      '<div id="msQAnswers"></div>'+
      '<div id="msQMsg"></div>'+
      '<button id="msQBack"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="msCard">'+
    '<div class="card">'+
      '<div id="msCardEm" style="font-size:54px">📖</div>'+
      '<div id="msCardTit"></div>'+
      '<div id="msCardTxt"></div>'+
      '<button id="msCardRead">🔊 Leggimela</button>'+
      '<button class="bigBtn" id="msCardOk" style="display:block;margin:14px auto 0">➡️ Avanti</button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="msEnd">'+
    '<div class="card">'+
      '<div id="msEndEm" style="font-size:78px">🏆</div>'+
      '<div id="msEndTit" style="font-size:clamp(26px,6vw,40px);color:#e8a013;margin:10px 0"></div>'+
      '<div id="msEndTxt" style="font-size:19px;color:#555;margin-bottom:16px;line-height:1.55"></div>'+
      '<button class="bigBtn" id="msEndBtn"></button>'+
      '<div><button id="msEndMenu"></button></div>'+
    '</div>'+
  '</div>');
})();

/* ---------- I pannelli della plancia ---------- */
const MS_PANNELLI={
  motori:    {em:'🔥', lab:'MOTORI'},
  carburante:{em:'⛽', lab:'CARBURANTE'},
  paracadute:{em:'🪂', lab:'PARACADUTE'},
  solari:    {em:'☀️', lab:'PANNELLI SOLARI'},
  radio:     {em:'📻', lab:'RADIO'},
  ossigeno:  {em:'💨', lab:'OSSIGENO'},
  luci:      {em:'💡', lab:'LUCI'},
  scudo:     {em:'🛡️', lab:'SCUDO TERMICO'},
  portello:  {em:'🚪', lab:'PORTELLO'},
  gancio:    {em:'🪝', lab:'GANCIO'},
  ignora:    {em:'🚫', lab:'IGNORA'}
};

/* ---------- Ordini sciocchi (da rifiutare col pannello IGNORA) ---------- */
const MS_SCIOCCHI=[
 'MANDA UNA PIZZA IN ORBITA',
 'DIPINGI IL RAZZO A POIS ROSA',
 'INVITA UN DINOSAURO SULLA STAZIONE',
 'LANCIA I CALZINI SPORCHI NELLO SPAZIO',
 'FAI IL SOLLETICO AL COMPUTER DI BORDO',
 'ORDINA UN GELATO ALLA LUNA'
];

/* ---------- Le 7 fasi (vere!) di una missione ---------- */
const MS_FASI=[
 {nm:'CHECKLIST PRE-LANCIO', scene:'pad', intro:'Prima di partire si controlla TUTTO, voce per voce!',
  pans:['portello','ossigeno','luci','radio','carburante','motori','ignora'],
  orders:[
   {t:'CHIUDI IL PORTELLO', ok:'portello', set:{portello:1}, fx:'🚪'},
   {t:"CONTROLLA L'OSSIGENO", ok:'ossigeno', fx:'✅'},
   {t:'ACCENDI LE LUCI', ok:'luci', set:{luci:1}, fx:'💡'},
   {t:'PROVA LA RADIO', ok:'radio', fx:'📻'}
  ],
  card:{em:'📋', tit:'La checklist degli astronauti',
   txt:"Gli astronauti veri non si fidano della memoria: prima di partire leggono una LISTA DI CONTROLLO e spuntano ogni voce, una per una. Anche i piloti degli aerei lo fanno! Leggere bene ogni riga, senza saltarne nemmeno una, può salvare tutta la missione."}},
 {nm:'COUNTDOWN E DECOLLO', scene:'liftoff', intro:'Conto alla rovescia… tieniti forte!',
  pans:['motori','carburante','luci','ossigeno','radio','paracadute','ignora'],
  orders:[
   {t:'CONTROLLA IL CARBURANTE', ok:'carburante', fx:'✅'},
   {t:'OSSIGENO AL MASSIMO', ok:'ossigeno', fx:'💨'},
   {count:true, t:'ACCENDI I MOTORI!', ok:'motori', timer:MS_T_LIFTOFF, set:{motori:1}, liftoff:true, fx:'🔥'}
  ],
  card:{em:'🚀', tit:'Il decollo',
   txt:"Al decollo i motori spingono così forte che il corpo degli astronauti pesa tre volte tanto! Per restare nello spazio bisogna correre a 28.000 chilometri all'ora: più di cento volte più veloce di un'auto in autostrada. Per questo serve un razzo pieno pieno di carburante."}},
 {nm:'SEPARAZIONE DEL PRIMO STADIO', scene:'sep', intro:'Il primo stadio è vuoto: va staccato!',
  pans:['motori','gancio','luci','radio','solari','ossigeno','ignora'],
  orders:[
   {t:'SPEGNI I MOTORI', ok:'motori', set:{motori:0}, fx:'✔️'},
   {t:'SGANCIA IL PRIMO STADIO', ok:'gancio', sep:true, fx:'💥'},
   {t:'ACCENDI I MOTORI, NON LE LUCI', ok:'motori', set:{motori:1}, fx:'🔥'}
  ],
  card:{em:'🧩', tit:'Perché i razzi hanno gli stadi?',
   txt:"I razzi sono fatti a pezzi, chiamati STADI. Quando il primo stadio finisce il suo carburante, si stacca e cade: così il razzo diventa più leggero e vola meglio, come togliersi lo zaino per correre. Alcuni stadi moderni tornano giù e atterrano in piedi, per essere usati di nuovo!"}},
 {nm:'IN ORBITA', scene:'orbit', intro:'Ci siamo: stiamo girando intorno alla Terra!',
  pans:['solari','paracadute','motori','radio','ossigeno','luci','ignora'],
  orders:[
   {t:'SPEGNI I MOTORI: SIAMO IN ORBITA', ok:'motori', set:{motori:0}, fx:'✔️'},
   {t:'APRI I PANNELLI SOLARI, NON IL PARACADUTE', ok:'solari', set:{solari:1}, fx:'☀️'},
   {t:'CHIAMA LA BASE CON LA RADIO', ok:'radio', fx:'📡'},
   {t:"NON TOCCARE I MOTORI: CONTROLLA L'OSSIGENO", ok:'ossigeno', fx:'✅'}
  ],
  card:{em:'🌍', tit:"Che cos'è un'orbita?",
   txt:"Stare in orbita è come cadere sempre intorno alla Terra senza toccarla mai: la navicella va così veloce che, mentre cade, la Terra le 'scappa' sotto perché è rotonda. Per questo gli astronauti galleggiano: cadono insieme alla navicella! Si chiama assenza di peso."}},
 {nm:'ATTRACCO ALLA ISS', scene:'iss', intro:'Ecco la Stazione Spaziale! Piano piano…',
  pans:['motori','gancio','luci','radio','portello','ossigeno','ignora'],
  orders:[
   {t:'ACCENDI LE LUCI PER FARTI VEDERE', ok:'luci', set:{luci:1}, fx:'💡'},
   {t:'PRIMA FRENA CON I MOTORI, POI APRI IL GANCIO', seq:['motori','gancio'], fx:'🪝'},
   {t:'PRIMA CHIAMA LA ISS CON LA RADIO, POI APRI IL PORTELLO', seq:['radio','portello'], dock:true, set:{portello:0}, fx:'🤝'}
  ],
  card:{em:'🛰️', tit:'La Stazione Spaziale Internazionale',
   txt:"La ISS è grande come un campo di calcio ed è la casa degli astronauti nello spazio. Gira intorno alla Terra in 90 minuti: chi sta a bordo vede 16 albe e 16 tramonti ogni giorno! Per attraccare bisogna andare pianissimo e fare le cose nell'ordine giusto, proprio come hai fatto tu."}},
 {nm:'ESPERIMENTI A BORDO', scene:'exp', intro:'Ora si lavora: esperimenti in assenza di peso!',
  pans:['luci','portello','radio','ossigeno','solari','motori','ignora'],
  orders:[
   {t:"NON APRIRE IL PORTELLO: ACCENDI LE LUCI DEL LABORATORIO", ok:'luci', set:{luci:1}, fx:'🔬'},
   {t:'PRIMA SPEGNI LE LUCI, POI GUARDA LA TERRA DAL PORTELLO', seq:['luci','portello'], set:{luci:0}, fx:'🌍'},
   {t:"DAI ARIA FRESCA ALLE PIANTINE: APRI L'OSSIGENO", ok:'ossigeno', fx:'🌱'},
   {t:'RACCONTA TUTTO ALLA BASE CON LA RADIO', ok:'radio', fx:'📡'}
  ],
  card:{em:'🧪', tit:'Esperimenti nello spazio',
   txt:"Nello spazio l'acqua non cade: diventa una bolla che galleggia a mezz'aria! Gli astronauti fanno esperimenti con gocce d'acqua, piantine e persino piccole fiamme (che diventano rotonde) per capire come funziona il mondo senza peso. Le scoperte servono anche a noi sulla Terra."}},
 {nm:'RIENTRO E AMMARAGGIO', scene:'rientro', intro:'Si torna a casa! Leggi con calma: il tempo basta.',
  pans:['portello','motori','scudo','paracadute','radio','ossigeno','luci','ignora'],
  orders:[
   {t:'SALUTA GLI AMICI E CHIUDI BENE IL PORTELLO', ok:'portello', timer:MS_T_REENTRY, set:{portello:1}, fx:'👋'},
   {t:'ACCENDI I MOTORI PER FRENARE E TORNARE VERSO CASA', ok:'motori', timer:MS_T_REENTRY, set:{motori:1}, fx:'🔥'},
   {t:'GIRA LA CAPSULA E METTI LO SCUDO TERMICO DAVANTI', ok:'scudo', timer:MS_T_REENTRY, set:{scudo:1}, fx:'🛡️'},
   {t:'ADESSO IL CIELO È BLU: APRI IL PARACADUTE', ok:'paracadute', timer:MS_T_REENTRY, set:{para:1}, splash:true, fx:'🪂'}
  ],
  card:{em:'🛡️', tit:'Lo scudo termico e l\'ammaraggio',
   txt:"La capsula rientra velocissima e l'aria davanti a lei si scalda tantissimo: lo scudo termico arriva a più di 1500 gradi e protegge gli astronauti come un ombrello di fuoco. Poi si aprono i paracadute e la capsula AMMARA, cioè atterra nel mare, dove una nave la va a recuperare. SPLASH!"}}
];

/* ---------- Gli imprevisti (veri!) ---------- */
const MS_IMPREVISTI=[
 {alarm:'ALLARME! TROPPA ANIDRIDE CARBONICA IN CABINA!', em:'😮‍💨',
  right:"CAMBIA IL FILTRO DELL'ARIA",
  wrong:['APRI IL FINESTRINO PER CAMBIARE ARIA','ACCENDI UN VENTILATORE E BASTA'],
  card:{em:'🌬️', tit:"L'aria della navicella",
   txt:"Quando respiriamo buttiamo fuori anidride carbonica: in una cabina chiusa, troppa fa male. Per questo le navicelle hanno FILTRI speciali che puliscono l'aria. Nel 1970 gli astronauti dell'Apollo 13 costruirono un filtro d'emergenza con tubi, sacchetti e nastro adesivo: e funzionò!"}},
 {alarm:'ALLARME! UN PEZZETTO DI VECCHIO SATELLITE SI AVVICINA!', em:'☄️',
  right:'ACCENDI I MOTORI E SPOSTA LA NAVICELLA',
  wrong:['APRI IL PARACADUTE PER FRENARE','SPEGNI LE LUCI PER NASCONDERTI'],
  card:{em:'🛰️', tit:'I detriti spaziali',
   txt:"Intorno alla Terra girano tanti pezzetti di vecchi satelliti e razzi. La base li segue con i radar e, se uno si avvicina troppo, la stazione accende i motori e si sposta un pochino per lasciarlo passare. La ISS lo fa davvero, qualche volta ogni anno!"}},
 {alarm:'ALLARME! I PANNELLI SOLARI NON DANNO PIÙ ENERGIA!', em:'🔋',
  right:'GIRA I PANNELLI VERSO IL SOLE',
  wrong:['SCUOTI I PANNELLI FORTE FORTE','ATTACCA UNA PILA GIGANTE'],
  card:{em:'☀️', tit:'I pannelli solari',
   txt:"I pannelli solari trasformano la luce del Sole in elettricità, che fa funzionare luci, computer e filtri dell'aria. Sulla ISS i pannelli ruotano piano piano per guardare sempre il Sole, come fanno i girasoli nei campi."}},
 {alarm:'ALLARME! LA BASE NON CI SENTE PIÙ!', em:'📡',
  right:"PUNTA L'ANTENNA VERSO LA TERRA",
  wrong:['PARLA PIÙ FORTE DENTRO IL MICROFONO','APRI IL PORTELLO E URLA'],
  card:{em:'📻', tit:'Parlare dallo spazio',
   txt:"Le parole viaggiano dallo spazio alla Terra con le ONDE RADIO, invisibili e velocissime. Le antenne però vanno puntate bene, come quando giri l'antenna della TV. Curiosità: durante il rientro l'aria infuocata intorno alla capsula blocca la radio per qualche minuto: si chiama blackout!"}}
];

/* ---------- Stato ---------- */
let msS={on:false, raf:0, last:0, frameAt:0, paused:true, state:'idle',
  fase:1, orders:[], idx:0, seqIdx:0, tries:0,
  fuel:MS_FUEL_MAX, phErr:0, phSpk:0,
  timer:0, timerMax:0, countN:0, countT:0,
  stars:[0,0,0,0,0,0,0,0], ordersDone:0, emgSolved:0,
  emgPhases:[], emgAt:-1, emgTriggered:false, emg:null, emgErr:0,
  scene:'pad', prog:0, alt:0, sky:0, issD:1, shake:0,
  flags:{}, fx:[], t:0};
let msQ={diff:'easy', q:null, theme:0, voiced:false, mult:1, done:false};
const msQUsed=new Set(), msEmgUsed=new Set();
let msCardNext='resume', msMsgTid=0, msAnimTid=0;
const msCv=$('msCv'), msC=msCv.getContext('2d');
let msW=0, msH=0;
const MS_STARS=[]; /* stelline di sfondo, generate una volta */
for(let i=0;i<90;i++) MS_STARS.push([Math.random(),Math.random(),0.6+Math.random()*1.6,Math.random()*6.28]);

function msResize(){
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  msW=window.innerWidth; msH=window.innerHeight;
  msCv.width=Math.round(msW*dpr); msCv.height=Math.round(msH*dpr);
  msCv.style.width=msW+'px'; msCv.style.height=msH+'px';
  msC.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener('resize',()=>{ if($('ms').style.display!=='none') msResize(); });

/* ---------- HUD e messaggi ---------- */
function msHud(){
  $('msFase').textContent='🚀 FASE '+msS.fase+'/7';
  $('msScore').textContent='⭐ '+score;
  $('msFuelFill').style.width=Math.max(0,Math.min(100,msS.fuel))+'%';
  $('msFuelFill').style.background=msS.fuel>35?'linear-gradient(90deg,#ffb300,#3cba54)':'#e05555';
  $('msMusicBtn').textContent=MUSICON?'🎵':'🔇';
  $('msHear').textContent='🔊 −'+MS_FUEL_HEAR+'⛽';
  $('msHear').style.display=VOICEON?'':'none';
}
function msMsgShow(t,ms){
  const el=$('msMsg'); el.textContent=t; el.style.display='block';
  clearTimeout(msMsgTid); msMsgTid=setTimeout(()=>{ el.style.display='none'; },ms||2600);
}
function msBig(t){
  const el=$('msBig'); el.textContent=t;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function msFuel(d){
  msS.fuel=Math.max(0,Math.min(MS_FUEL_MAX,msS.fuel+d));
  msHud();
  if(msS.fuel<=0){ msFuelOut(); return true; }
  return false;
}

/* ---------- Plancia ---------- */
function msBuildPlancia(){
  const P=$('msPlancia'); P.innerHTML='';
  const ids=shuffle(MS_FASI[msS.fase-1].pans.slice());
  ids.forEach(id=>{
    const p=MS_PANNELLI[id];
    const b=document.createElement('button');
    b.className='msPan'; b.dataset.id=id;
    b.innerHTML='<span class="pe">'+p.em+'</span><span class="pl">'+p.lab+'</span>';
    b.onclick=()=>msPanelTap(id,b);
    P.appendChild(b);
  });
}
function msPanFlash(id,cls){
  const b=document.querySelector('#msPlancia .msPan[data-id="'+id+'"]');
  if(!b) return;
  b.classList.add(cls);
  setTimeout(()=>b.classList.remove(cls),700);
}

/* ---------- Motore degli ordini ---------- */
function msCurOrder(){ return msS.orders[msS.idx]; }
function msShowOrder(){
  const o=msCurOrder();
  msS.state='order'; msS.seqIdx=0; msS.tries=0;
  stopSpeak();
  $('msMon').classList.remove('alarm');
  $('msMonLab').textContent='📡 ORDINI DALLA BASE';
  $('msProc').style.display='none';
  $('msOrder').textContent=o.t;
  msS.timerMax=o.timer||0; msS.timer=msS.timerMax;
  $('msTimerBar').style.display=o.timer?'block':'none';
  msHud();
}
function msLaunchCurrent(){
  const o=msCurOrder();
  if(o.count){
    msS.state='count'; msS.countN=MS_COUNT_FROM+1; msS.countT=0;
    $('msOrder').textContent='… PRONTI AL LANCIO …';
    $('msTimerBar').style.display='none';
  } else msShowOrder();
}
function msNextOrder(){
  msS.idx++;
  msS.prog=msS.idx/msS.orders.length;
  if(msS.idx>=msS.orders.length){ msPhaseEnd(); return; }
  if(!msS.emgTriggered && msS.emgAt===msS.idx){ msEmgStart(); return; }
  msLaunchCurrent();
}
function msPanelTap(id,btn){
  if(msS.state!=='order') return;
  const o=msCurOrder();
  const want=o.seq?o.seq[msS.seqIdx]:o.ok;
  if(id===want){
    if(o.seq&&msS.seqIdx===0){
      msS.seqIdx=1; msS.tries+=0;
      if(btn) btn.classList.add('msOk');
      sToken();
      msMsgShow('✅ Prima azione fatta! Adesso la seconda…',1800);
      return;
    }
    msOrderDone(o,btn);
  } else msOrderWrong(o,btn,id);
}
function msOrderDone(o,btn){
  msS.state='anim';
  stopSpeak();
  if(btn) btn.classList.add('msOk');
  document.querySelectorAll('#msPlancia .msPan.msOk').forEach(b=>setTimeout(()=>b.classList.remove('msOk'),700));
  sCorrect();
  msS.ordersDone++;
  /* effetti sulla scena */
  if(o.set) Object.assign(msS.flags,o.set);
  if(o.liftoff){ msS.flags.liftoff=1; msS.shake=1; msBig('🚀 DECOLLO!'); }
  if(o.sep){ msS.flags.sep=1; msS.flags.sepT=0; msS.shake=0.5; }
  if(o.dock){ msS.flags.dock=1; msBig('🤝 ATTRACCO RIUSCITO!'); }
  if(o.splash){ msS.flags.splash=0; } /* lo splash arriva col paracadute, in draw */
  if(o.fx) msS.fx.push({x:msW/2,y:msH*0.45,t:0,em:o.fx});
  /* premi */
  if(msS.tries===0){
    const g=o.seq?MS_REW_SEQ:MS_REW_ORDER;
    score+=g; save();
    msS.fuel=Math.min(MS_FUEL_MAX,msS.fuel+MS_FUEL_BONUS);
    msMsgShow((o.silly?'😂 Ben letto! Era uno scherzo: da ignorare!':'✅ Perfetto al primo colpo!')+' +'+g+'⭐ +'+MS_FUEL_BONUS+'⛽',2200);
  } else msMsgShow(o.silly?'😂 Era uno scherzo: giusto ignorarlo!':'✅ Ordine eseguito!',1800);
  msHud();
  $('msTimerBar').style.display='none';
  clearTimeout(msAnimTid);
  msAnimTid=setTimeout(msNextOrder,MS_ANIM_MS);
}
function msOrderWrong(o,btn,id){
  msS.tries++; msS.phErr++;
  if(btn) btn.classList.add('msNo');
  setTimeout(()=>{ if(btn) btn.classList.remove('msNo'); },700);
  sWrong(); msS.shake=Math.max(msS.shake,0.35);
  if(o.silly&&id!==o.ok) msMsgShow('🤭 Leggi bene: quel messaggio è sciocco! Cerca il pannello IGNORA. −'+MS_FUEL_ERR+'⛽',2800);
  else if(id==='ignora') msMsgShow('👀 Questo ordine è vero: va eseguito! −'+MS_FUEL_ERR+'⛽',2600);
  else msMsgShow(UI.wrong[LI()]+' −'+MS_FUEL_ERR+'⛽',2400);
  msFuel(-MS_FUEL_ERR);
}
$('msHear').onclick=()=>{
  if(!VOICEON) return;
  if(msS.state==='order'){
    msS.phSpk++;
    if(msFuel(-MS_FUEL_HEAR)) return;
    msMsgShow('🔊 −'+MS_FUEL_HEAR+'⛽ (leggere da solo conviene!)',2000);
    speak([{t:$('msOrder').textContent, el:$('msOrder')}]);
  } else if(msS.state==='emg'&&msS.emg){
    msS.phSpk++;
    if(msFuel(-MS_FUEL_HEAR)) return;
    const btns=[...document.querySelectorAll('#msProc .ansBtn')];
    speak([{t:msS.emg.alarm, el:$('msOrder')},'Le procedure sono:',...btns.map(b=>({t:b.textContent, el:b, block:true}))]);
  }
};

/* ---------- Imprevisti ---------- */
function msEmgPick(){
  let cand=MS_IMPREVISTI.map((e,k)=>k).filter(k=>!msEmgUsed.has(k));
  if(!cand.length){ msEmgUsed.clear(); cand=MS_IMPREVISTI.map((e,k)=>k); }
  const k=cand[Math.floor(Math.random()*cand.length)];
  msEmgUsed.add(k);
  return MS_IMPREVISTI[k];
}
function msEmgStart(forced){
  msS.emgTriggered=true;
  msS.emg=forced||msEmgPick();
  msS.emgErr=0;
  msS.state='emg';
  stopSpeak();
  sLose(); msS.shake=0.8;
  const M=$('msMon');
  M.classList.add('alarm');
  $('msMonLab').textContent='🚨 IMPREVISTO! LEGGI E SCEGLI LA PROCEDURA GIUSTA';
  $('msOrder').textContent=msS.emg.alarm;
  msS.timerMax=MS_T_EMG; msS.timer=MS_T_EMG;
  $('msTimerBar').style.display='block';
  const P=$('msProc'); P.innerHTML=''; P.style.display='flex';
  shuffle([[msS.emg.right,true],[msS.emg.wrong[0],false],[msS.emg.wrong[1],false]]).forEach(pr=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=pr[0];
    b.onclick=()=>msEmgPickProc(b,pr[1]);
    P.appendChild(b);
  });
  msBig('🚨 ALLARME!');
  msHud();
}
function msEmgPickProc(btn,right){
  if(msS.state!=='emg') return;
  if(right){
    btn.classList.add('right');
    sCorrect(); msS.emgSolved++;
    const perfect=msS.emgErr===0;
    if(perfect){ score+=MS_REW_EMG; save(); }
    msS.fuel=Math.min(MS_FUEL_MAX,msS.fuel+MS_FUEL_EMG);
    msMsgShow('🛠️ Imprevisto risolto!'+(perfect?' +'+MS_REW_EMG+'⭐':'')+' +'+MS_FUEL_EMG+'⛽',2600);
    msEmgClose(true);
  } else {
    btn.classList.add('wrong'); btn.disabled=true;
    msS.emgErr++; msS.phErr++;
    sWrong();
    if(msFuel(-MS_FUEL_ERR)) return;
    msMsgShow('Quella procedura non va… rileggi con calma! −'+MS_FUEL_ERR+'⛽',2400);
  }
}
function msEmgClose(solved){
  msS.state='anim';
  $('msMon').classList.remove('alarm');
  $('msProc').style.display='none';
  $('msTimerBar').style.display='none';
  const card=msS.emg.card;
  clearTimeout(msAnimTid);
  msAnimTid=setTimeout(()=>{ msShowCard(card,'resume'); },solved?800:1400);
}
function msEmgTimeout(){
  msS.phErr++;
  sWrong();
  if(msFuel(-MS_FUEL_TIME)) return;
  /* mostra la procedura giusta, poi la scheda: si impara comunque */
  document.querySelectorAll('#msProc .ansBtn').forEach(b=>{
    if(b.textContent===msS.emg.right) b.classList.add('right');
    b.disabled=true;
  });
  msMsgShow('⏰ Tempo scaduto! La procedura giusta era quella verde. −'+MS_FUEL_TIME+'⛽',3000);
  msEmgClose(false);
}

/* ---------- Scheda curiosità ---------- */
function msShowCard(card,next){
  msCardNext=next;
  msS.state='card';
  $('msCardEm').textContent=card.em;
  $('msCardTit').textContent=card.tit;
  $('msCardTxt').textContent=card.txt;
  $('msCardRead').style.display=VOICEON?'':'none';
  $('msCard').style.display='flex';
  if(VOICEON){
    const first=String(card.txt).split(/(?<=[.!?])\s/)[0];
    speak([{t:first, el:$('msCardTxt')}]);
  }
}
$('msCardRead').onclick=()=>{ speak([{t:$('msCardTxt').textContent, el:$('msCardTxt')}]); };
$('msCardOk').onclick=()=>{
  stopSpeak();
  $('msCard').style.display='none';
  if(msCardNext==='quiz') msQOffer();
  else if(msCardNext==='win') msVictory();
  else { /* resume: torna all'ordine in sospeso */
    msLaunchCurrent();
  }
};

/* ---------- Fasi ---------- */
function msPhaseStart(n){
  msS.fase=n;
  const F=MS_FASI[n-1];
  msS.orders=F.orders.map(o=>Object.assign({},o));
  /* ogni tanto la base manda un messaggio sciocco da IGNORARE */
  if(n>=2&&Math.random()<MS_SILLY_CHANCE){
    const s=MS_SCIOCCHI[Math.floor(Math.random()*MS_SCIOCCHI.length)];
    const at=1+Math.floor(Math.random()*msS.orders.length);
    msS.orders.splice(at,0,{t:s, ok:'ignora', silly:true, fx:'😂'});
  }
  msS.idx=0; msS.prog=0; msS.phErr=0; msS.phSpk=0; msS.seqIdx=0; msS.tries=0;
  msS.emgTriggered=false;
  msS.emgAt=msS.emgPhases.includes(n)?(1+Math.floor(Math.random()*(msS.orders.length-1))):-1;
  msS.scene=F.scene;
  if(F.scene==='iss') msS.issD=1;
  msS.state='anim';
  msBuildPlancia();
  msBig('FASE '+n+': '+F.nm);
  msMsgShow('🧑‍🚀 '+F.intro,3000);
  msHud();
  clearTimeout(msAnimTid);
  msAnimTid=setTimeout(()=>{ msLaunchCurrent(); },1500);
}
function msPhaseEnd(){
  msS.state='anim';
  const st=(msS.phErr===0&&msS.phSpk===0)?3:((msS.phErr+msS.phSpk<=2)?2:1);
  msS.stars[msS.fase]=st;
  sStar();
  msBig('⭐'.repeat(st)+'☆'.repeat(3-st));
  msMsgShow(st===3?'🌟 Fase perfetta: niente errori e tutto letto da solo!'
    :(st===2?'⭐ Ottimo lavoro! Prova senza aiuti per 3 stelle.':'⭐ Fase completata! Leggi con calma per più stelle.'),3000);
  clearTimeout(msAnimTid);
  msAnimTid=setTimeout(()=>{
    msShowCard(MS_FASI[msS.fase-1].card, msS.fase<7?'quiz':'win');
  },1600);
}
function msFuelOut(){
  msS.state='end';
  stopSpeak();
  clearTimeout(msAnimTid);
  $('msMon').classList.remove('alarm');
  $('msProc').style.display='none';
  $('msTimerBar').style.display='none';
  sLose();
  const back=Math.max(1,msS.fase-1);
  $('msEndEm').textContent='⛽';
  $('msEndTit').textContent='Carburante finito!'; $('msEndTit').style.color='#c0392b';
  $('msEndTxt').textContent='Nessun problema, capita anche ai veri astronauti! La base ti rimanda alla fase '+back+' col serbatoio pieno. Leggi con calma: ce la fai! 💪';
  $('msEndBtn').textContent='🔁 Riparti dalla fase '+back;
  $('msEndMenu').textContent='Torna alla scelta del gioco';
  $('msEnd').style.display='flex';
  $('msEndBtn').onclick=()=>{
    $('msEnd').style.display='none';
    msS.fuel=MS_FUEL_MAX;
    msPhaseStart(back);
  };
}
function msVictory(){
  msS.state='end';
  stopMusic(); fanfare(); confetti();
  msS.flags.splash=1;
  let rows='';
  for(let f=1;f<=7;f++){
    const st=msS.stars[f]||0;
    rows+=MS_FASI[f-1].nm.charAt(0)+MS_FASI[f-1].nm.slice(1).toLowerCase()+': '+'⭐'.repeat(st)+'☆'.repeat(3-st)+'<br>';
  }
  $('msEndEm').textContent='🏆';
  $('msEndTit').textContent='AMMARAGGIO RIUSCITO! 🌊'; $('msEndTit').style.color='#e8a013';
  $('msEndTxt').innerHTML='Missione compiuta, comandante! La nave di recupero ti sta portando a casa. 🚢<br><br>'+
    '<span class="starRowMs">'+rows+'</span><br>'+
    '📖 Ordini letti ed eseguiti: '+msS.ordersDone+
    ' · 🛠️ Imprevisti risolti: '+msS.emgSolved+
    ' · ⭐ Stelle di fase: '+msS.stars.reduce((a,b)=>a+b,0)+'/21'+
    '<br>⭐ Punti totali: '+score;
  $('msEndBtn').textContent='🔁 Nuova missione';
  $('msEndMenu').textContent='Torna alla scelta del gioco';
  $('msEnd').style.display='flex';
  $('msEndBtn').onclick=()=>{
    $('msEnd').style.display='none';
    msReset();
    if(MUSICON){ mCtx(); playMusic(TRK_ROCKET); }
    msPhaseStart(1);
  };
  speak(NM(UI.speakBravo[LI()]));
}
$('msEndMenu').onclick=()=>{ $('msEnd').style.display='none'; msExit(); };

/* ---------- Quiz dell'astronauta (come palla-api: premio dimezzato con 🔊 o errori) ---------- */
function msQOffer(){
  msS.state='quiz';
  $('msQOffTit').textContent="Quiz dell'Astronauta!";
  $('msQOffSub').textContent='Vuoi guadagnare stelle extra prima della prossima fase?';
  $('msQOffEasy').textContent='❓ Facile +'+MS_REW_EASY+' ⭐';
  $('msQOffHard').textContent='❓❓ Difficile +'+MS_REW_HARD+' ⭐';
  $('msQOffNo').textContent='▶️ Continua la missione';
  $('msQOff').style.display='flex';
}
$('msQOffEasy').onclick=()=>{ $('msQOff').style.display='none'; msQShow('easy'); };
$('msQOffHard').onclick=()=>{ $('msQOff').style.display='none'; msQShow('hard'); };
$('msQOffNo').onclick=()=>{ $('msQOff').style.display='none'; msPhaseStart(msS.fase+1); };

function msQPick(diff){
  /* prima i temi spaziali (Razzi Spaziali, Missioni Spaziali), poi gli altri */
  const pools=[];
  THEMES.forEach((t,k)=>{
    const sp=/razzi|missioni/i.test(t.name[0])?0:1;
    (t[diff]||[]).forEach(q=>pools.push({q,theme:k,sp}));
  });
  pools.sort((a,b)=>a.sp-b.sp);
  let cand=pools.filter(p=>!msQUsed.has(p.q));
  if(!cand.length){ msQUsed.clear(); cand=pools; }
  const spCand=cand.filter(p=>p.sp===0);
  const pick=(spCand.length?spCand:cand);
  return pick[Math.floor(Math.random()*Math.min(pick.length,6))];
}
function msQReward(){
  const base=(msQ.diff==='easy')?MS_REW_EASY:MS_REW_HARD;
  return Math.max(2,Math.round(base*msQ.mult*(msQ.voiced?0.5:1)));
}
function msQRewardTxt(){
  const half=msQ.voiced||msQ.mult<1;
  $('msQReward').textContent='Premio: +'+msQReward()+' ⭐'+(half?' (dimezzato: lettura 🔊 o errore)':'');
}
function msQShow(diff){
  const pick=msQPick(diff); if(!pick){ msPhaseStart(msS.fase+1); return; }
  msQ={diff, q:pick.q, theme:pick.theme, voiced:false, mult:1, done:false};
  msQUsed.add(pick.q);
  const i=LI(), t=THEMES[pick.theme];
  msS.state='quiz';
  $('msQEmoji').textContent=t.emoji;
  $('msQTheme').textContent=t.name[i];
  msQRewardTxt();
  $('msQText').textContent=pick.q.q[i];
  $('msQSpeak').textContent='🔊 Leggimela (premio dimezzato)';
  $('msQSpeak').style.display=VOICEON?'':'none';
  $('msQMsg').textContent='';
  $('msQBack').textContent='salta e continua la missione';
  const A=$('msQAnswers'); A.innerHTML='';
  shuffle([[pick.q.ok[i],true],[pick.q.no[0][i],false],[pick.q.no[1][i],false]]).forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0]; b.dataset.right=o[1]?'1':'0';
    b.onclick=()=>msQAnswer(b,o[1]);
    A.appendChild(b);
  });
  $('msQ').style.display='flex';
}
function msQAnswer(btn,right){
  if(msQ.done) return;
  stopSpeak();
  const i=LI();
  if(right){
    msQ.done=true;
    document.querySelectorAll('#msQAnswers .ansBtn').forEach(b=>{ b.disabled=true; b.style.pointerEvents='none'; });
    btn.classList.add('right'); sCorrect();
    const g=msQReward(); score+=g; save();
    const praise=NM(UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)]);
    $('msQMsg').textContent=praise+'  +'+g+' ⭐'; $('msQMsg').style.color='#3cba54';
    speak(praise);
    msHud();
    setTimeout(()=>{
      $('msQ').style.display='none';
      msPhaseStart(msS.fase+1);
    },1500);
  } else {
    btn.classList.add('wrong'); btn.disabled=true; sWrong();
    msQ.mult*=0.5; msQRewardTxt();
    $('msQMsg').textContent=UI.wrong[i]; $('msQMsg').style.color='#e05555';
  }
}
$('msQSpeak').onclick=async()=>{
  if(!msQ.q||msQ.done) return;
  if(!msQ.voiced){ msQ.voiced=true; msQRewardTxt(); }
  $('msQSpeak').textContent='🔊 sto leggendo…';
  const i=LI();
  const btns=[...document.querySelectorAll('#msQAnswers .ansBtn:not(:disabled)')];
  await speak([
    {t:msQ.q.q[i], el:$('msQText')},
    'Le risposte sono:',
    ...btns.map(b=>({t:b.textContent, el:b, block:true}))
  ]);
  $('msQSpeak').textContent='🔊 Leggimela (premio dimezzato)';
};
$('msQBack').onclick=()=>{ stopSpeak(); $('msQ').style.display='none'; msPhaseStart(msS.fase+1); };

/* ---------- Aggiornamento ---------- */
function msUpdate(dt){
  msS.t+=dt;
  /* cielo: 0 = giorno sulla rampa, 1 = spazio */
  let skyT=0;
  if(msS.scene==='pad') skyT=0;
  else if(msS.scene==='liftoff') skyT=msS.flags.liftoff?Math.min(1,msS.alt*1.4):0.05;
  else if(msS.scene==='rientro') skyT=Math.max(0,1-msS.prog*1.1);
  else skyT=1;
  msS.sky+=(skyT-msS.sky)*Math.min(1,dt*1.5);
  /* quota durante il decollo */
  if(msS.flags.liftoff&&msS.scene==='liftoff') msS.alt=Math.min(1,msS.alt+dt*0.16);
  /* separazione: il primo stadio cade */
  if(msS.flags.sep) msS.flags.sepT=(msS.flags.sepT||0)+dt;
  /* avvicinamento alla ISS: segue il progresso della fase */
  if(msS.scene==='iss'){
    const tgt=msS.flags.dock?0:Math.max(0.12,1-msS.prog);
    msS.issD+=(tgt-msS.issD)*Math.min(1,dt*1.2);
  }
  /* timer degli ordini e degli imprevisti */
  if((msS.state==='order'||msS.state==='emg')&&msS.timerMax>0){
    msS.timer-=dt;
    const fr=Math.max(0,msS.timer/msS.timerMax);
    $('msTimerFill').style.width=(fr*100)+'%';
    $('msTimerFill').style.background=fr>0.4?'#3cba54':'#e05555';
    if(msS.timer<=0){
      if(msS.state==='emg') msEmgTimeout();
      else {
        msS.phErr++;
        if(!msFuel(-MS_FUEL_TIME)){
          msMsgShow('⏰ Il tempo è volato! Riprova, con calma. −'+MS_FUEL_TIME+'⛽',2600);
          msS.timer=msS.timerMax;
        }
      }
    }
  }
  /* conto alla rovescia */
  if(msS.state==='count'){
    msS.countT-=dt;
    if(msS.countT<=0){
      msS.countN--;
      if(msS.countN>0){ msBig(String(msS.countN)); beep(700,.12); msS.countT=MS_COUNT_STEP; }
      else { msBig('VIA! 🚀'); beep(1046,.3); msShowOrder(); }
    }
  }
  /* effetti volanti */
  for(let i=msS.fx.length-1;i>=0;i--){ msS.fx[i].t+=dt; if(msS.fx[i].t>1.2) msS.fx.splice(i,1); }
  msS.shake=Math.max(0,msS.shake-dt*1.2);
}

/* ---------- Disegno (canvas 2D, stile realistico) ---------- */
function msLerp(a,b,f){ return a+(b-a)*f; }
function msSkyColor(){
  const f=msS.sky;
  const r=Math.round(msLerp(110,4,f)), g=Math.round(msLerp(178,7,f)), b=Math.round(msLerp(235,20,f));
  return 'rgb('+r+','+g+','+b+')';
}
function msSkyHorizon(){
  const f=msS.sky;
  const r=Math.round(msLerp(212,8,f)), g=Math.round(msLerp(232,12,f)), b=Math.round(msLerp(246,32,f));
  return 'rgb('+r+','+g+','+b+')';
}
function msDrawStars(c,t){
  if(msS.sky<0.25) return;
  c.save(); c.globalAlpha=Math.min(1,(msS.sky-0.25)/0.5);
  /* velo lattiginoso della Via Lattea */
  const mg=c.createLinearGradient(0,0,msW,msH*0.6);
  mg.addColorStop(0,'rgba(180,190,220,0)');
  mg.addColorStop(0.5,'rgba(190,200,230,.07)');
  mg.addColorStop(1,'rgba(180,190,220,0)');
  c.fillStyle=mg; c.fillRect(0,0,msW,msH*0.7);
  for(let i=0;i<MS_STARS.length;i++){
    const s=MS_STARS[i];
    const tw=0.6+0.4*Math.sin(t*2+s[3]);
    c.fillStyle=(i%7===0)?'rgba(190,210,255,'+(0.5*tw+0.3)+')'
      :(i%11===0)?'rgba(255,225,190,'+(0.5*tw+0.3)+')'
      :'rgba(255,255,245,'+(0.5*tw+0.3)+')';
    c.beginPath(); c.arc(s[0]*msW,s[1]*msH*0.85,s[2],0,6.29); c.fill();
    /* le più luminose hanno una piccola croce di diffrazione */
    if(s[2]>1.9){
      c.strokeStyle='rgba(255,255,255,'+(0.25*tw)+')'; c.lineWidth=1;
      const sx=s[0]*msW, sy=s[1]*msH*0.85;
      c.beginPath(); c.moveTo(sx-5,sy); c.lineTo(sx+5,sy);
      c.moveTo(sx,sy-5); c.lineTo(sx,sy+5); c.stroke();
    }
  }
  c.restore();
}
function msDrawSun(c,t){
  if(msS.sky<0.45) return;
  c.save(); c.globalAlpha=Math.min(1,(msS.sky-0.45)/0.35);
  const sx=msW*0.84, sy=msH*0.14;
  let g=c.createRadialGradient(sx,sy,2,sx,sy,70);
  g.addColorStop(0,'rgba(255,255,245,1)');
  g.addColorStop(0.2,'rgba(255,244,210,.9)');
  g.addColorStop(1,'rgba(255,225,140,0)');
  c.fillStyle=g; c.beginPath(); c.arc(sx,sy,70,0,6.29); c.fill();
  c.fillStyle='#fffef5'; c.beginPath(); c.arc(sx,sy,13,0,6.29); c.fill();
  /* riflessi di lente */
  c.fillStyle='rgba(255,255,255,.10)';
  c.beginPath(); c.arc(sx-100,sy+80,11,0,6.29); c.fill();
  c.beginPath(); c.arc(sx-170,sy+134,6,0,6.29); c.fill();
  c.restore();
}
function msDrawEarthBall(c,x,y,r,t){
  /* alone dell'atmosfera (il sottile strato azzurro che si vede dallo spazio) */
  const ag=c.createRadialGradient(x,y,r*0.97,x,y,r*1.09);
  ag.addColorStop(0,'rgba(130,195,255,.5)');
  ag.addColorStop(0.55,'rgba(90,160,240,.18)');
  ag.addColorStop(1,'rgba(90,160,240,0)');
  c.fillStyle=ag; c.beginPath(); c.arc(x,y,r*1.09,0,6.29); c.fill();
  /* oceano */
  const g=c.createRadialGradient(x-r*0.38,y-r*0.38,r*0.08,x,y,r);
  g.addColorStop(0,'#79bdee'); g.addColorStop(0.5,'#2e6fb4'); g.addColorStop(1,'#0e2f5c');
  c.fillStyle=g; c.beginPath(); c.arc(x,y,r,0,6.29); c.fill();
  c.save(); c.beginPath(); c.arc(x,y,r,0,6.29); c.clip();
  /* continenti (masse irregolari a due toni + deserto) */
  function blob(bx,by,bw,bh,rot,col){
    c.save(); c.translate(x+bx*r,y+by*r); c.rotate(rot);
    c.fillStyle=col;
    c.beginPath();
    c.moveTo(-bw*r,0);
    c.bezierCurveTo(-bw*r,-bh*r,-bw*r*0.2,-bh*r*1.25,bw*r*0.45,-bh*r*0.6);
    c.bezierCurveTo(bw*r*1.15,-bh*r*0.15,bw*r*0.8,bh*r*0.9,bw*r*0.1,bh*r);
    c.bezierCurveTo(-bw*r*0.5,bh*r*1.05,-bw*r,bh*r*0.5,-bw*r,0);
    c.closePath(); c.fill();
    c.restore();
  }
  blob(-0.34,-0.18,0.24,0.2,0.5,'#5f8f47');
  blob(-0.3,-0.22,0.15,0.12,0.6,'#7fae5b');
  blob(0.3,0.32,0.2,0.16,-0.4,'#5f8f47');
  blob(0.24,-0.42,0.17,0.11,0.25,'#c2a866');
  blob(0.28,-0.46,0.1,0.06,0.25,'#8a9958');
  blob(-0.05,0.5,0.13,0.1,0.1,'#6b9a50');
  /* calotta polare */
  c.fillStyle='rgba(240,248,255,.85)';
  c.beginPath(); c.ellipse(x,y-r*0.9,r*0.5,r*0.16,0,0,6.29); c.fill();
  /* nuvole: bande e vortici che scorrono piano */
  c.fillStyle='rgba(255,255,255,.5)';
  const cw=t*0.008;
  for(let k=0;k<6;k++){
    const a=k*1.05+cw, cy2=(-0.65+k*0.26)*r;
    const cx2=Math.sin(a)*r*0.55;
    c.beginPath(); c.ellipse(x+cx2,y+cy2,r*(0.3+0.08*Math.sin(k*3)),r*0.055,Math.sin(a)*0.3,0,6.29); c.fill();
  }
  c.fillStyle='rgba(255,255,255,.35)';
  c.beginPath(); c.ellipse(x-r*0.2,y+r*0.15,r*0.16,r*0.1,0.6,0,6.29); c.fill();
  c.beginPath(); c.ellipse(x+r*0.45,y-r*0.1,r*0.12,r*0.07,-0.5,0,6.29); c.fill();
  /* terminatore: la notte avanza da destra */
  const tg=c.createLinearGradient(x+r*0.15,y,x+r,y);
  tg.addColorStop(0,'rgba(5,10,26,0)');
  tg.addColorStop(1,'rgba(5,10,26,.62)');
  c.fillStyle=tg; c.fillRect(x,y-r,r,r*2);
  c.restore();
}
function msDrawFlame(c,x,y,s,t){
  /* pennacchio realistico: nucleo bianco-azzurro, diamanti di Mach,
     e il getto che si allarga con la quota (meno pressione fuori) */
  const alt=msS.alt||0;
  const fl=0.85+0.28*Math.sin(t*31)+0.12*Math.sin(t*53);
  const L=62*s*fl*(1+alt*0.8), W2=9*s*(1+alt*1.7);
  let g=c.createLinearGradient(x,y,x,y+L);
  g.addColorStop(0,'rgba(255,196,110,.95)');
  g.addColorStop(0.4,'rgba(255,120,30,.7)');
  g.addColorStop(1,'rgba(255,60,10,0)');
  c.fillStyle=g;
  c.beginPath();
  c.moveTo(x-W2,y);
  c.quadraticCurveTo(x-W2*1.6,y+L*0.55,x,y+L);
  c.quadraticCurveTo(x+W2*1.6,y+L*0.55,x+W2,y);
  c.closePath(); c.fill();
  /* nucleo quasi bianco */
  g=c.createLinearGradient(x,y,x,y+L*0.62);
  g.addColorStop(0,'rgba(255,255,255,.98)');
  g.addColorStop(0.5,'rgba(220,235,255,.7)');
  g.addColorStop(1,'rgba(190,220,255,0)');
  c.fillStyle=g;
  c.beginPath();
  c.moveTo(x-W2*0.45,y);
  c.quadraticCurveTo(x,y+L*0.65,x+W2*0.45,y);
  c.closePath(); c.fill();
  /* diamanti di Mach nel getto */
  c.fillStyle='rgba(255,255,255,.75)';
  for(let k=1;k<=3;k++){
    const dy=y+k*L*0.13;
    c.beginPath(); c.ellipse(x,dy,W2*0.17,W2*0.32,0,0,6.29); c.fill();
  }
}
function msDrawSolar(c,x,y,s,open){
  if(open<=0.02) return;
  for(const dir of [-1,1]){
    c.save(); c.translate(x+dir*16*s,y); c.scale(dir*open,1);
    c.fillStyle='#2f5fd0'; c.strokeStyle='#16307a'; c.lineWidth=2;
    c.beginPath(); c.roundRect(4,-9*s,34*s,18*s,3); c.fill(); c.stroke();
    c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=1.2;
    for(let k=1;k<4;k++){ c.beginPath(); c.moveTo(4+k*8.5*s,-9*s); c.lineTo(4+k*8.5*s,9*s); c.stroke(); }
    c.beginPath(); c.moveTo(4,0); c.lineTo(4+34*s,0); c.stroke();
    c.restore();
  }
}
function msDrawRocket(c,x,y,s,o,t){
  o=o||{};
  c.save(); c.translate(x,y);
  if(o.rot) c.rotate(o.rot);
  const F=msS.flags;
  const OUT='#39424f';
  /* tubo bianco con luce laterale (il sole arriva da sinistra) */
  function tube(x0,y0,w,h,r){
    const g=c.createLinearGradient(x0,0,x0+w,0);
    g.addColorStop(0,'#eef1f5'); g.addColorStop(0.32,'#ffffff');
    g.addColorStop(0.75,'#c9d1dc'); g.addColorStop(1,'#98a3b2');
    c.fillStyle=g; c.strokeStyle=OUT; c.lineWidth=1.8;
    c.beginPath(); c.roundRect(x0,y0,w,h,r); c.fill(); c.stroke();
  }
  if(o.capsule){
    /* ---- capsula realistica (tipo Dragon/Orion) ---- */
    if(F.motori){ /* retrorazzi: due getti obliqui dai lati */
      for(const d of [-1,1]){
        c.save(); c.translate(d*16*s,14*s); c.rotate(d*0.5);
        msDrawFlame(c,0,0,s*0.32,t+d);
        c.restore();
      }
    }
    /* corpo a goccia: base larga, cima stretta */
    const g=c.createLinearGradient(-23*s,0,23*s,0);
    g.addColorStop(0,'#eef1f5'); g.addColorStop(0.35,'#ffffff'); g.addColorStop(1,'#a9b3c1');
    c.fillStyle=g; c.strokeStyle=OUT; c.lineWidth=1.8;
    c.beginPath();
    c.moveTo(-23*s,18*s);
    c.lineTo(-10*s,-22*s);
    c.quadraticCurveTo(0,-27*s,10*s,-22*s);
    c.lineTo(23*s,18*s);
    c.closePath(); c.fill(); c.stroke();
    /* giunzioni dei pannelli */
    c.strokeStyle='rgba(60,70,85,.35)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(-16*s,-2*s); c.lineTo(16*s,-2*s); c.stroke();
    c.beginPath(); c.moveTo(-20*s,9*s); c.lineTo(20*s,9*s); c.stroke();
    /* anello di attracco in cima */
    c.fillStyle='#7e8898'; c.strokeStyle=OUT; c.lineWidth=1.6;
    c.beginPath(); c.roundRect(-6*s,-29*s,12*s,5*s,2*s); c.fill(); c.stroke();
    /* oblò piccoli e scuri (dentro si intravede l'astronauta) */
    for(const wx of [-8,8]){
      c.fillStyle='#16243c'; c.strokeStyle=OUT; c.lineWidth=1.6;
      c.beginPath(); c.arc(wx*s,-9*s,4*s,0,6.29); c.fill(); c.stroke();
      c.fillStyle='rgba(190,220,255,.35)';
      c.beginPath(); c.arc(wx*s-1.3*s,-10.3*s,1.4*s,0,6.29); c.fill();
    }
    /* casco dell'astronauta nell'oblò sinistro */
    c.fillStyle='#e8ecf2';
    c.beginPath(); c.arc(-8*s,-8*s,2.1*s,0,6.29); c.fill();
    /* portello con maniglia */
    c.strokeStyle=OUT; c.lineWidth=1.4;
    c.beginPath(); c.roundRect(-4.5*s,2*s,9*s,11*s,3*s); c.stroke();
    if(!F.portello){ c.fillStyle='#101a2c'; c.beginPath(); c.roundRect(-4.5*s,2*s,9*s,11*s,3*s); c.fill(); }
    /* propulsori di manovra (piccoli fori scuri) */
    c.fillStyle='#39424f';
    for(const [tx2,ty2] of [[-19,12],[19,12],[-13,-16],[13,-16]]){
      c.beginPath(); c.ellipse(tx2*s,ty2*s,1.7*s,1.1*s,0,0,6.29); c.fill();
    }
    /* luci di navigazione */
    if(F.luci){
      c.fillStyle='rgba(255,70,70,'+(0.5+0.5*Math.sin(t*5))+')';
      c.beginPath(); c.arc(-22*s,4*s,1.8*s,0,6.29); c.fill();
      c.fillStyle='rgba(80,255,130,'+(0.5+0.5*Math.sin(t*5+2))+')';
      c.beginPath(); c.arc(22*s,4*s,1.8*s,0,6.29); c.fill();
    }
    /* scudo termico ablativo (scuro come il PICA) */
    c.fillStyle=F.scudo?'#4a3b30':'#6e7684'; c.strokeStyle='#241c14'; c.lineWidth=1.8;
    c.beginPath(); c.ellipse(0,19*s,24*s,6*s,0,0,Math.PI); c.fill(); c.stroke();
    if(F.scudo&&msS.scene==='rientro'&&!F.para&&msS.prog>0.4){
      /* strato incandescente sullo scudo */
      const hg=c.createLinearGradient(0,19*s,0,30*s);
      hg.addColorStop(0,'rgba(255,240,200,.95)'); hg.addColorStop(1,'rgba(255,120,20,0)');
      c.fillStyle=hg;
      c.beginPath(); c.ellipse(0,21*s,26*s,8*s,0,0,Math.PI); c.fill();
    }
    msDrawSolar(c,0,4*s,s*0.8,F.solari?1:0);
    /* paracadute: prima i cavi, poi TRE calotte come nelle missioni vere */
    if(F.para){
      c.strokeStyle='#8a7f6a'; c.lineWidth=1.2;
      for(const k of [-1,0,1]){
        const px=k*36*s, py=-88*s+Math.abs(k)*10*s;
        c.beginPath(); c.moveTo(-6*s,-26*s); c.lineTo(px-18*s,py+6*s); c.stroke();
        c.beginPath(); c.moveTo(6*s,-26*s); c.lineTo(px+18*s,py+6*s); c.stroke();
      }
      for(const k of [-1,0,1]){
        const px=k*36*s, py=-88*s+Math.abs(k)*10*s, pr=26*s;
        const sw=Math.sin(t*1.6+k)*0.04;
        c.save(); c.translate(px,py); c.rotate(k*0.12+sw);
        c.fillStyle='#e8641e'; c.strokeStyle='#9c3d0a'; c.lineWidth=1.8;
        c.beginPath(); c.arc(0,0,pr,Math.PI,0); c.closePath(); c.fill(); c.stroke();
        /* spicchi bianchi alternati */
        c.fillStyle='#f4f1ea';
        for(const a0 of [0.125,0.375,0.625,0.875]){
          c.beginPath();
          c.arc(0,0,pr,Math.PI+a0*Math.PI,Math.PI+(a0+0.125)*Math.PI);
          c.lineTo(0,0); c.closePath(); c.fill();
        }
        c.strokeStyle='#9c3d0a';
        c.beginPath(); c.arc(0,0,pr,Math.PI,0); c.closePath(); c.stroke();
        c.restore();
      }
    }
    c.restore(); return;
  }
  /* ---- razzo a due stadi (o solo lo stadio superiore dopo la separazione) ---- */
  const upperOnly=!!o.upperOnly;
  if(F.motori) msDrawFlame(c,0,upperOnly?38*s:80*s,s*(upperOnly?0.62:1),t);
  if(!upperOnly){
    /* BOOSTER (primo stadio) */
    tube(-15*s,-20*s,30*s,80*s,3*s);
    /* sezione motori */
    c.fillStyle='#2c333f'; c.strokeStyle=OUT; c.lineWidth=1.8;
    c.beginPath(); c.roundRect(-15*s,52*s,30*s,8*s,2*s); c.fill(); c.stroke();
    /* tre campane dei motori */
    c.fillStyle='#59647a';
    for(const bx of [-9,0,9]){
      c.beginPath();
      c.moveTo(bx*s-3.2*s,60*s); c.lineTo(bx*s-5*s,70*s);
      c.lineTo(bx*s+5*s,70*s); c.lineTo(bx*s+3.2*s,60*s);
      c.closePath(); c.fill(); c.stroke();
    }
    /* interstadio nero */
    c.fillStyle='#171d28'; c.fillRect(-15*s,-20*s,30*s,7*s);
    /* alette a griglia ripiegate */
    c.fillStyle='#79849a'; c.strokeStyle=OUT; c.lineWidth=1.4;
    c.beginPath(); c.roundRect(-21*s,-13*s,6*s,10*s,1.5*s); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(15*s,-13*s,6*s,10*s,1.5*s); c.fill(); c.stroke();
    /* gambe di atterraggio ripiegate lungo il corpo */
    c.strokeStyle='#525d70'; c.lineWidth=2.2;
    for(const d of [-1,1]){
      c.beginPath(); c.moveTo(d*12*s,16*s); c.lineTo(d*14.3*s,52*s); c.stroke();
    }
    /* tricolore sul booster */
    c.fillStyle='#3c9a4e'; c.fillRect(-15*s,26*s,10*s,5*s);
    c.fillStyle='#f4f4f4'; c.fillRect(-5*s,26*s,10*s,5*s);
    c.fillStyle='#d84343'; c.fillRect(5*s,26*s,10*s,5*s);
  }
  /* STADIO SUPERIORE */
  tube(-15*s,-52*s,30*s,(upperOnly?84:32)*s,3*s);
  if(upperOnly){
    /* campana del motore dello stadio superiore */
    c.fillStyle='#59647a'; c.strokeStyle=OUT; c.lineWidth=1.6;
    c.beginPath();
    c.moveTo(-4*s,32*s); c.lineTo(-7*s,42*s); c.lineTo(7*s,42*s); c.lineTo(4*s,32*s);
    c.closePath(); c.fill(); c.stroke();
  }
  /* fascia blu della missione */
  c.fillStyle='#28527a'; c.fillRect(-15*s,-32*s,30*s,4*s);
  /* portello dell'equipaggio sullo stadio superiore */
  c.strokeStyle=OUT; c.lineWidth=1.4;
  c.beginPath(); c.arc(0,-40*s,5*s,0,6.29); c.stroke();
  if(!F.portello){ c.fillStyle='#101a2c'; c.beginPath(); c.arc(0,-40*s,5*s,0,6.29); c.fill(); }
  else { c.fillStyle='#39424f'; c.beginPath(); c.arc(3*s,-40*s,0.9*s,0,6.29); c.fill(); }
  /* pannelli solari (aperti in orbita) */
  msDrawSolar(c,0,-38*s,s,F.solari?1:0);
  /* luci di navigazione: rossa a sinistra, verde a destra, strobo in cima */
  if(F.luci){
    c.fillStyle='rgba(255,70,70,'+(0.5+0.5*Math.sin(t*5))+')';
    c.beginPath(); c.arc(-16.5*s,-46*s,1.8*s,0,6.29); c.fill();
    c.fillStyle='rgba(80,255,130,'+(0.5+0.5*Math.sin(t*5+2))+')';
    c.beginPath(); c.arc(16.5*s,-46*s,1.8*s,0,6.29); c.fill();
    if(Math.sin(t*9)>0.6){
      c.fillStyle='rgba(255,255,255,.95)';
      c.beginPath(); c.arc(0,-84*s,2*s,0,6.29); c.fill();
    }
  }
  /* CAPSULA in cima (con oblò scuri) */
  const cg=c.createLinearGradient(-15*s,0,15*s,0);
  cg.addColorStop(0,'#eef1f5'); cg.addColorStop(0.35,'#ffffff'); cg.addColorStop(1,'#a9b3c1');
  c.fillStyle=cg; c.strokeStyle=OUT; c.lineWidth=1.8;
  c.beginPath();
  c.moveTo(-15*s,-52*s);
  c.lineTo(-6*s,-76*s);
  c.quadraticCurveTo(0,-80*s,6*s,-76*s);
  c.lineTo(15*s,-52*s);
  c.closePath(); c.fill(); c.stroke();
  /* anello di attracco */
  c.fillStyle='#7e8898';
  c.beginPath(); c.roundRect(-4*s,-83*s,8*s,5*s,2*s); c.fill(); c.stroke();
  /* oblò della capsula */
  c.fillStyle='#16243c';
  for(const wx of [-6,6]){
    c.beginPath(); c.arc(wx*s,-62*s,2.6*s,0,6.29); c.fill();
  }
  c.restore();
}
function msDrawBooster(c,x,y,s,fall,t){
  /* il primo stadio che ricade: griglie aperte e sbuffi di gas freddo */
  c.save(); c.translate(x,y); c.rotate(0.35+fall*0.5);
  const OUT='#39424f';
  const g=c.createLinearGradient(-13*s,0,13*s,0);
  g.addColorStop(0,'#e6e9ee'); g.addColorStop(0.4,'#f8fafc'); g.addColorStop(1,'#939eae');
  c.fillStyle=g; c.strokeStyle=OUT; c.lineWidth=1.8;
  c.beginPath(); c.roundRect(-13*s,-38*s,26*s,76*s,3*s); c.fill(); c.stroke();
  /* bocca aperta dell'interstadio */
  c.fillStyle='#12161f';
  c.beginPath(); c.ellipse(0,-38*s,13*s,4*s,0,0,6.29); c.fill();
  /* alette a griglia APERTE */
  c.fillStyle='#79849a'; c.lineWidth=1.4;
  for(const d of [-1,1]){
    c.save(); c.translate(d*13*s,-30*s); c.rotate(d*1.25);
    c.beginPath(); c.roundRect(0,-4*s,10*s,8*s,1.5*s); c.fill(); c.stroke();
    c.strokeStyle='rgba(30,36,48,.5)';
    for(let k=1;k<3;k++){ c.beginPath(); c.moveTo(k*3.3*s,-4*s); c.lineTo(k*3.3*s,4*s); c.stroke(); }
    c.restore(); c.strokeStyle=OUT;
  }
  /* tricolore + campane dei motori */
  c.fillStyle='#3c9a4e'; c.fillRect(-13*s,4*s,8.6*s,4.4*s);
  c.fillStyle='#f4f4f4'; c.fillRect(-4.4*s,4*s,8.8*s,4.4*s);
  c.fillStyle='#d84343'; c.fillRect(4.4*s,4*s,8.6*s,4.4*s);
  c.fillStyle='#59647a';
  for(const bx of [-8,0,8]){
    c.beginPath();
    c.moveTo(bx*s-2.8*s,38*s); c.lineTo(bx*s-4.4*s,46*s);
    c.lineTo(bx*s+4.4*s,46*s); c.lineTo(bx*s+2.8*s,38*s);
    c.closePath(); c.fill(); c.stroke();
  }
  /* sbuffi di gas freddo dai propulsori di assetto */
  c.fillStyle='rgba(230,240,255,'+(0.25+0.2*Math.sin(t*7))+')';
  c.beginPath(); c.ellipse(-16*s,-34*s,6*s,3*s,-0.4,0,6.29); c.fill();
  c.beginPath(); c.ellipse(15*s,-24*s,5*s,2.5*s,0.5,0,6.29); c.fill();
  c.restore();
}
function msDrawISS(c,x,y,s,t){
  c.save(); c.translate(x,y);
  const OUT='#4a5570';
  /* traliccio reticolare orizzontale */
  c.strokeStyle='#98a2b6'; c.lineWidth=2;
  c.beginPath(); c.moveTo(-118*s,-4*s); c.lineTo(118*s,-4*s);
  c.moveTo(-118*s,4*s); c.lineTo(118*s,4*s); c.stroke();
  c.lineWidth=1;
  c.beginPath();
  for(let k=-11;k<11;k++){
    c.moveTo(k*10.7*s,-4*s); c.lineTo((k+1)*10.7*s,4*s);
  }
  c.stroke();
  /* coppie di pannelli solari dorati alle estremità (ruotano piano verso il sole) */
  for(const dx of [-104,-76,76,104]){
    for(const dy of [-1,1]){
      c.save(); c.translate(dx*s,dy*6*s);
      c.rotate(0.05*Math.sin(t*0.3+dx*0.1));
      const g=c.createLinearGradient(-9*s,0,9*s,0);
      g.addColorStop(0,'#a06f22'); g.addColorStop(0.4,'#d8a13a'); g.addColorStop(1,'#8a5f12');
      c.fillStyle=g; c.strokeStyle='#6e4a12'; c.lineWidth=1.6;
      c.beginPath(); c.roundRect(-9*s,dy>0?4*s:-64*s,18*s,60*s,2); c.fill(); c.stroke();
      c.strokeStyle='rgba(20,16,8,.35)';
      const py0=dy>0?4*s:-64*s;
      for(let k=1;k<8;k++){ c.beginPath(); c.moveTo(-9*s,py0+k*7.5*s); c.lineTo(9*s,py0+k*7.5*s); c.stroke(); }
      c.beginPath(); c.moveTo(0,py0); c.lineTo(0,py0+60*s); c.stroke();
      c.restore();
    }
  }
  /* radiatori bianchi inclinati sotto il traliccio */
  for(const dx of [-40,44]){
    c.save(); c.translate(dx*s,10*s); c.rotate(0.5);
    c.fillStyle='#dde3ec'; c.strokeStyle=OUT; c.lineWidth=1.4;
    c.beginPath(); c.roundRect(-6*s,0,12*s,30*s,2); c.fill(); c.stroke();
    c.strokeStyle='rgba(74,85,112,.4)';
    for(let k=1;k<4;k++){ c.beginPath(); c.moveTo(-6*s,k*7.5*s); c.lineTo(6*s,k*7.5*s); c.stroke(); }
    c.restore();
  }
  /* fila di moduli pressurizzati (cilindri bianchi con anelli) */
  function modulo(mx,my,w,h,vert){
    const g=vert?c.createLinearGradient(mx-w/2,0,mx+w/2,0):c.createLinearGradient(0,my-h/2,0,my+h/2);
    g.addColorStop(0,'#f5f7fa'); g.addColorStop(0.4,'#ffffff'); g.addColorStop(1,'#aab4c2');
    c.fillStyle=g; c.strokeStyle=OUT; c.lineWidth=1.8;
    c.beginPath(); c.roundRect(mx-w/2,my-h/2,w,h,Math.min(w,h)*0.4); c.fill(); c.stroke();
    c.strokeStyle='rgba(74,85,112,.4)'; c.lineWidth=1;
    if(vert){ for(const fy of [-h*0.25,0,h*0.25]){ c.beginPath(); c.moveTo(mx-w/2,my+fy); c.lineTo(mx+w/2,my+fy); c.stroke(); } }
    else { for(const fx of [-w*0.25,0,w*0.25]){ c.beginPath(); c.moveTo(mx+fx,my-h/2); c.lineTo(mx+fx,my+h/2); c.stroke(); } }
  }
  modulo(-36*s,14*s,34*s,15*s,false);
  modulo(0,14*s,40*s,17*s,false);
  modulo(34*s,14*s,28*s,13*s,false);
  modulo(0,30*s,15*s,26*s,true);
  /* cupola con i finestroni (da lì gli astronauti fotografano la Terra) */
  c.fillStyle='#c8d4e4'; c.strokeStyle=OUT; c.lineWidth=1.6;
  c.beginPath(); c.arc(0,44*s,7*s,0,Math.PI); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#16243c';
  for(const wx of [-3.4,0,3.4]){ c.beginPath(); c.arc(wx*s,46*s,1.6*s,0,6.29); c.fill(); }
  /* portello di attracco rivolto verso la capsula, con luce verde lampeggiante */
  c.fillStyle='#7e8898'; c.strokeStyle=OUT;
  c.beginPath(); c.roundRect(-58*s,10*s,8*s,8*s,2*s); c.fill(); c.stroke();
  c.fillStyle='rgba(90,255,140,'+(0.4+0.6*(Math.sin(t*4)>0?1:0.2))+')';
  c.beginPath(); c.arc(-60*s,8*s,1.8*s,0,6.29); c.fill();
  c.restore();
}
function msDrawGround(c,off,t){
  t=t||0;
  const gy=msH-70+off;
  const rx=msW/2;
  /* foschia e mare all'orizzonte (le basi di lancio sono in riva all'oceano) */
  const hz=c.createLinearGradient(0,gy-46,0,gy-16);
  hz.addColorStop(0,'rgba(255,255,255,0)'); hz.addColorStop(1,'rgba(235,242,248,.55)');
  c.fillStyle=hz; c.fillRect(0,gy-46,msW,30);
  c.fillStyle='#4784b8'; c.fillRect(0,gy-16,msW,16);
  c.fillStyle='rgba(255,255,255,.35)';
  c.fillRect(0,gy-16,msW,1.5);
  /* terra bassa con vegetazione */
  const lg=c.createLinearGradient(0,gy,0,msH);
  lg.addColorStop(0,'#8b9a6d'); lg.addColorStop(1,'#66794f');
  c.fillStyle=lg; c.fillRect(0,gy,msW,msH-gy+80);
  c.fillStyle='rgba(48,66,38,.5)';
  for(let k=0;k<26;k++){
    const bx=(((k*97+31)%100)/100)*msW, by=gy+8+((k*53)%Math.max(20,msH-gy-20));
    c.beginPath(); c.ellipse(bx,by,7+(k%4)*3,3,0,0,6.29); c.fill();
  }
  /* edificio di assemblaggio in lontananza (tipo VAB) */
  c.fillStyle='#9aa3ad'; c.strokeStyle='#5c646e'; c.lineWidth=1.5;
  c.beginPath(); c.rect(msW*0.08,gy-40,70,40); c.fill(); c.stroke();
  c.fillStyle='#6e7883'; c.fillRect(msW*0.08+27,gy-40,16,40);
  c.fillStyle='#c9d1da'; c.fillRect(msW*0.08,gy-40,70,6);
  /* serbatoio dell'acqua (torre sferica) */
  c.strokeStyle='#5c646e'; c.lineWidth=3;
  c.beginPath(); c.moveTo(msW*0.22,gy); c.lineTo(msW*0.22-8,gy-52); c.moveTo(msW*0.22+16,gy); c.lineTo(msW*0.22+8+16-8,gy-52); c.stroke();
  c.fillStyle='#d7dde5';
  c.beginPath(); c.arc(msW*0.22+8,gy-62,16,0,6.29); c.fill();
  c.strokeStyle='#5c646e'; c.lineWidth=1.5;
  c.beginPath(); c.arc(msW*0.22+8,gy-62,16,0,6.29); c.stroke();
  /* piazzola di cemento con fossa delle fiamme */
  c.fillStyle='#b9bec6'; c.strokeStyle='#7d838d'; c.lineWidth=2;
  c.beginPath();
  c.moveTo(rx-150,gy+34); c.lineTo(rx-96,gy-6); c.lineTo(rx+96,gy-6); c.lineTo(rx+150,gy+34);
  c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#2c3138';
  c.beginPath(); c.rect(rx-34,gy-2,68,10); c.fill();
  /* supporto di lancio */
  c.fillStyle='#6e7883'; c.strokeStyle='#454c55'; c.lineWidth=2;
  c.beginPath(); c.roundRect(rx-30,gy-12,60,10,2); c.fill(); c.stroke();
  /* torre di servizio reticolare con parafulmine */
  const tx0=rx+56;
  c.strokeStyle='#7d838d'; c.lineWidth=3;
  c.beginPath(); c.moveTo(tx0,gy-2); c.lineTo(tx0,gy-208);
  c.moveTo(tx0+20,gy-2); c.lineTo(tx0+20,gy-208); c.stroke();
  c.lineWidth=1.4;
  c.beginPath();
  for(let k=0;k<10;k++){
    c.moveTo(tx0,gy-2-k*21); c.lineTo(tx0+20,gy-2-(k+1)*21);
    c.moveTo(tx0+20,gy-2-k*21); c.lineTo(tx0,gy-2-(k+1)*21);
  }
  c.stroke();
  c.beginPath(); c.moveTo(tx0,gy-208); c.lineTo(tx0+20,gy-208); c.stroke();
  /* parafulmine sottile in cima con luce rossa */
  c.lineWidth=2;
  c.beginPath(); c.moveTo(tx0+10,gy-208); c.lineTo(tx0+10,gy-244); c.stroke();
  c.fillStyle='rgba(255,60,60,'+(Math.sin(t*3)>0?0.95:0.25)+')';
  c.beginPath(); c.arc(tx0+10,gy-246,3,0,6.29); c.fill();
  /* bracci di servizio verso il razzo (si staccano al decollo) */
  if((msS.flags.liftoff?0:1)||msS.alt<0.03){
    c.strokeStyle='#7d838d'; c.lineWidth=4;
    const swing=msS.flags.motori?0.5:0;
    for(const ay of [70,130,180]){
      c.save(); c.translate(tx0,gy-ay); c.rotate(swing);
      c.beginPath(); c.moveTo(0,0); c.lineTo(-38,4); c.stroke();
      c.restore();
    }
  }
}
function msDrawSea(c,t){
  const sy=msH*0.68;
  /* nuvole basse all'orizzonte */
  c.fillStyle='rgba(255,255,255,.7)';
  for(let k=0;k<4;k++){
    const cx2=((t*4+k*260)%(msW+300))-150, cy2=sy-24-k*14;
    c.beginPath(); c.ellipse(cx2,cy2,54,10,0,0,6.29); c.fill();
    c.beginPath(); c.ellipse(cx2+34,cy2-7,30,8,0,0,6.29); c.fill();
  }
  /* oceano con profondità */
  const g=c.createLinearGradient(0,sy,0,msH);
  g.addColorStop(0,'#5d9fd4'); g.addColorStop(0.3,'#3576ad'); g.addColorStop(1,'#123c66');
  c.fillStyle=g; c.fillRect(0,sy,msW,msH-sy);
  c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(0,sy,msW,1.5);
  /* scia di luce del sole sull'acqua */
  const gl=c.createLinearGradient(0,sy,0,msH);
  gl.addColorStop(0,'rgba(255,240,200,.4)'); gl.addColorStop(1,'rgba(255,240,200,0)');
  c.fillStyle=gl;
  for(let k=0;k<9;k++){
    const gw=10+k*7, gy2=sy+8+k*((msH-sy)/9);
    c.beginPath(); c.ellipse(msW*0.78+Math.sin(t*1.4+k)*6,gy2,gw,2.6,0,0,6.29); c.fill();
  }
  /* creste delle onde */
  c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=1.6;
  for(let k=0;k<6;k++){
    const wy=sy+10+k*((msH-sy)/6);
    c.beginPath();
    for(let x=-20;x<=msW+20;x+=22){
      const yy=wy+Math.sin(x*0.045+t*1.6+k*1.7)*(2.5+k*0.7);
      (x<-19)?c.moveTo(x,yy):c.lineTo(x,yy);
    }
    c.stroke();
  }
  /* nave di recupero: scafo grigio, plancia bianca, gru e piazzola */
  const nx=msW*0.74+Math.sin(t*0.6)*3, ny=sy+26+Math.sin(t*1.1)*2.5;
  const roll=Math.sin(t*0.9)*0.02;
  c.save(); c.translate(nx,ny); c.rotate(roll);
  c.fillStyle='#5d6672'; c.strokeStyle='#343b45'; c.lineWidth=2;
  c.beginPath(); c.moveTo(-84,0); c.lineTo(84,0); c.lineTo(64,20); c.lineTo(-70,20); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#d84343'; c.fillRect(-84,-3,168,3.5);
  /* piazzola con la H */
  c.fillStyle='#3f464f';
  c.beginPath(); c.roundRect(-64,-8,52,8,2); c.fill(); c.stroke();
  c.strokeStyle='#f2c94c'; c.lineWidth=1.6;
  c.beginPath(); c.moveTo(-44,-6.5); c.lineTo(-44,-1.5); c.moveTo(-34,-6.5); c.lineTo(-34,-1.5); c.moveTo(-44,-4); c.lineTo(-34,-4); c.stroke();
  /* sovrastruttura */
  c.fillStyle='#eef1f5'; c.strokeStyle='#343b45'; c.lineWidth=1.8;
  c.beginPath(); c.roundRect(6,-26,44,26,3); c.fill(); c.stroke();
  c.fillStyle='#16243c';
  for(const wx of [14,26,38]){ c.fillRect(wx,-20,7,5); }
  /* albero radar e antenna */
  c.strokeStyle='#343b45'; c.lineWidth=2;
  c.beginPath(); c.moveTo(28,-26); c.lineTo(28,-44); c.stroke();
  c.beginPath(); c.moveTo(22,-40); c.lineTo(34,-40); c.stroke();
  /* gru per issare la capsula */
  c.lineWidth=3;
  c.beginPath(); c.moveTo(58,0); c.lineTo(58,-30); c.lineTo(30,-52); c.stroke();
  c.lineWidth=1.2;
  c.beginPath(); c.moveTo(30,-52); c.lineTo(30,-38); c.stroke();
  c.fillStyle='#f2c94c'; c.beginPath(); c.arc(30,-36,2.5,0,6.29); c.fill();
  c.restore();
  /* gabbiani */
  c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1.6;
  for(let k=0;k<3;k++){
    const bx=msW*(0.2+k*0.18)+Math.sin(t*0.7+k*2)*40, by=sy-50-k*22+Math.cos(t*0.9+k)*10;
    c.beginPath(); c.moveTo(bx-6,by); c.quadraticCurveTo(bx-2,by-4,bx,by);
    c.quadraticCurveTo(bx+2,by-4,bx+6,by); c.stroke();
  }
}
function msDraw(t){
  const c=msC;
  c.clearRect(0,0,msW,msH);
  c.save();
  if(msS.shake>0) c.translate((Math.random()-0.5)*12*msS.shake,(Math.random()-0.5)*10*msS.shake);
  /* cielo con gradiente verticale (chiaro all'orizzonte, scuro in alto) */
  const skg=c.createLinearGradient(0,0,0,msH);
  skg.addColorStop(0,msSkyColor());
  skg.addColorStop(1,msSkyHorizon());
  c.fillStyle=skg;
  c.fillRect(-20,-20,msW+40,msH+40);
  msDrawStars(c,t);
  msDrawSun(c,t);
  const cx=msW/2, cy=msH*0.52;
  const sc=Math.min(msW,msH)/520; /* scala generale */
  const F=msS.flags;

  if(msS.scene==='pad'||msS.scene==='liftoff'){
    const alt=msS.alt;
    /* nuvole alte che scorrono (e sfrecciano via durante la salita) */
    if(msS.sky<0.6){
      for(let k=0;k<4;k++){
        const nx2=((t*(6+k*3)+k*300)%(msW+280))-140, ny2=60+k*44+alt*msH*0.9;
        c.fillStyle='rgba(255,255,255,'+((0.8-k*0.16)*(1-msS.sky))+')';
        c.beginPath(); c.ellipse(nx2,ny2,52,11,0,0,6.29); c.fill();
        c.beginPath(); c.ellipse(nx2+34,ny2-7,32,9,0,0,6.29); c.fill();
        c.beginPath(); c.ellipse(nx2-30,ny2-5,26,8,0,0,6.29); c.fill();
      }
    }
    msDrawGround(c,alt*msH*1.2,t);
    const ry=msH*0.62-alt*msH*0.28;
    msDrawRocket(c,cx,ry,sc*1.1,{},t);
    /* nuvole di vapore che si allargano ai lati della rampa */
    if(F.motori&&alt<0.45){
      const spread=Math.min(1,alt*6+0.25);
      for(let k=0;k<10;k++){
        const side=(k%2?1:-1);
        const px=cx+side*(30+k*16*spread)+Math.sin(t*3+k*2)*6;
        const py=msH-84+alt*msH*1.2+Math.sin(t*2+k)*5-k*2;
        c.fillStyle='rgba(240,242,246,'+(0.65-k*0.05)+')';
        c.beginPath(); c.arc(px,py,14+k*3,0,6.29); c.fill();
      }
      /* colonna di fumo che segue il razzo */
      for(let k=1;k<6;k++){
        c.fillStyle='rgba(220,224,230,'+(0.3-k*0.05)+')';
        c.beginPath(); c.arc(cx+Math.sin(t*4+k*3)*6,ry+100*sc+k*34,12+k*5,0,6.29); c.fill();
      }
    }
    /* striature di velocità ad alta quota */
    if(alt>0.55){
      c.strokeStyle='rgba(255,255,255,'+(alt-0.55)*0.5+')'; c.lineWidth=1.6;
      for(let k=0;k<7;k++){
        const lx=(((k*137+40)%100)/100)*msW, ly=((t*260+k*140)%(msH+120))-60;
        c.beginPath(); c.moveTo(lx,ly); c.lineTo(lx,ly+26+k*4); c.stroke();
      }
    }
  }
  else if(msS.scene==='sep'){
    /* la Terra rimpicciolisce sotto: si vede la curvatura e l'atmosfera */
    const er=msLerp(msH*1.4,msH*0.55,Math.min(1,msS.prog+0.15));
    msDrawEarthBall(c,cx,msH+er*0.82,er,t);
    if(F.sep){
      msDrawRocket(c,cx,cy-30,sc,{upperOnly:true},t);
      const st2=F.sepT||0;
      msDrawBooster(c,cx+st2*44,cy-30+92*sc+st2*st2*150,sc,st2,t);
    } else msDrawRocket(c,cx,cy-30,sc,{},t);
  }
  else if(msS.scene==='orbit'){
    msDrawEarthBall(c,msW*0.2,msH*0.85,msH*0.34,t);
    msDrawRocket(c,cx+Math.sin(t*0.7)*6,cy+Math.cos(t*0.9)*5,sc,{upperOnly:true},t);
  }
  else if(msS.scene==='iss'||msS.scene==='exp'){
    msDrawEarthBall(c,msW*0.14,msH*0.9,msH*0.3,t);
    const d=(msS.scene==='exp')?0:msS.issD;
    const ix=msLerp(cx+96*sc,msW*0.78,d), iy=msLerp(cy-30*sc,msH*0.34,d);
    msDrawISS(c,ix,iy,sc*(0.8+0.2*(1-d)),t);
    msDrawRocket(c,cx-40*sc,cy+20+Math.sin(t*0.8)*4,sc*0.9,{capsule:true},t);
    if(msS.scene==='exp'||F.dock){
      /* tunnel di attracco pressurizzato */
      c.strokeStyle='#8d97a9'; c.lineWidth=9*sc;
      c.beginPath(); c.moveTo(cx-40*sc+20*sc,cy+8); c.lineTo(ix-52*sc,iy+12*sc); c.stroke();
      c.strokeStyle='#4a5570'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(cx-40*sc+20*sc,cy+8-4.5*sc); c.lineTo(ix-52*sc,iy+12*sc-4.5*sc);
      c.moveTo(cx-40*sc+20*sc,cy+8+4.5*sc); c.lineTo(ix-52*sc,iy+12*sc+4.5*sc); c.stroke();
    }
    if(msS.scene==='exp'){
      /* esperimenti che galleggiano in assenza di peso */
      c.font=Math.round(26*sc)+'px serif'; c.textAlign='center';
      const flo=[['💧',0.34,0.42],['🌱',0.6,0.5],['🫧',0.47,0.6],['📓',0.66,0.38]];
      flo.forEach((f2,k)=>{
        c.fillText(f2[0],msW*f2[1]+Math.sin(t*0.9+k*2)*10,msH*f2[2]+Math.cos(t*0.7+k)*8);
      });
    }
  }
  else if(msS.scene==='rientro'){
    const pr=msS.prog;
    if(pr<0.85){
      const er=msLerp(msH*0.5,msH*2.2,pr);
      msDrawEarthBall(c,cx,msH+er*0.75,er,t);
    } else msDrawSea(c,t);
    const capY=F.splash?msH*0.6+Math.sin(t*1.4)*5:cy-20;
    /* guaina di plasma: davanti allo scudo e in scia dietro la capsula */
    if(F.scudo&&!F.para&&!F.splash&&pr>0.4&&pr<0.95){
      const hot=Math.min(1,(pr-0.4)/0.3);
      let pg=c.createRadialGradient(cx,capY+30*sc,6,cx,capY+40*sc,90*sc);
      pg.addColorStop(0,'rgba(255,235,190,'+(0.85*hot)+')');
      pg.addColorStop(0.4,'rgba(255,140,40,'+(0.5*hot)+')');
      pg.addColorStop(1,'rgba(255,60,10,0)');
      c.fillStyle=pg;
      c.beginPath(); c.ellipse(cx,capY+42*sc,72*sc,54*sc,0,0,6.29); c.fill();
      /* scia dietro (la capsula scende con lo scudo in avanti) */
      const wg=c.createLinearGradient(0,capY-30*sc,0,capY-190*sc);
      wg.addColorStop(0,'rgba(255,170,70,'+(0.45*hot)+')');
      wg.addColorStop(1,'rgba(255,90,20,0)');
      c.fillStyle=wg;
      c.beginPath();
      c.moveTo(cx-30*sc,capY-16*sc);
      c.quadraticCurveTo(cx-46*sc,capY-110*sc,cx,capY-190*sc);
      c.quadraticCurveTo(cx+46*sc,capY-110*sc,cx+30*sc,capY-16*sc);
      c.closePath(); c.fill();
      /* filamenti incandescenti */
      c.strokeStyle='rgba(255,220,160,'+(0.6*hot)+')'; c.lineWidth=2;
      for(let k=0;k<5;k++){
        const lx=cx+(k-2)*16*sc, ph=Math.sin(t*11+k*2)*7;
        c.beginPath(); c.moveTo(lx,capY-20*sc);
        c.quadraticCurveTo(lx+ph,capY-90*sc,lx+ph*1.6,capY-160*sc); c.stroke();
      }
    }
    msDrawRocket(c,cx,capY,sc*1.1,{capsule:true},t);
    if(F.splash){
      /* spruzzi e schiuma dell'ammaraggio */
      c.fillStyle='rgba(255,255,255,.8)';
      for(let k=0;k<7;k++){
        const px=cx+(k-3)*16*sc, ph=Math.abs(Math.sin(t*2.4+k));
        c.beginPath(); c.ellipse(px,msH*0.66+2,7+ph*4,3,0,0,6.29); c.fill();
      }
      c.font=Math.round(24*sc)+'px serif'; c.textAlign='center';
      c.fillText('💦',cx-44*sc,msH*0.63); c.fillText('💦',cx+44*sc,msH*0.63);
    }
  }
  /* effetti emoji */
  c.font='32px serif'; c.textAlign='center'; c.textBaseline='middle';
  for(const f of msS.fx){
    c.globalAlpha=Math.max(0,1-f.t/1.2);
    c.fillText(f.em,f.x,f.y-f.t*50);
    c.globalAlpha=1;
  }
  c.restore();
}
function msFrame(ts){
  msS.raf=requestAnimationFrame(msFrame);
  /* Durante quiz e pannelli basta un aggiornamento leggero; durante il volo
     30 fps dimezzano il lavoro del canvas senza cambiare la simulazione. */
  const frameMs=msS.paused?100:1000/30;
  if(Number.isFinite(ts)&&msS.frameAt&&ts-msS.frameAt<frameMs-1) return;
  if(Number.isFinite(ts)) msS.frameAt=ts;
  if(!msS.last) msS.last=ts;
  const dt=Math.min((ts-msS.last)/1000,0.05); msS.last=ts;
  if(!msS.paused) msUpdate(dt);
  msDraw(performance.now()/1000);
}

/* ---------- Entra / esci ---------- */
function msReset(){
  msS.fase=1; msS.fuel=MS_FUEL_MAX;
  msS.stars=[0,0,0,0,0,0,0,0];
  msS.ordersDone=0; msS.emgSolved=0;
  msS.orders=[]; msS.idx=0; msS.seqIdx=0; msS.tries=0;
  msS.phErr=0; msS.phSpk=0; msS.timer=0; msS.timerMax=0;
  msS.scene='pad'; msS.prog=0; msS.alt=0; msS.sky=0; msS.issD=1; msS.shake=0;
  msS.flags={}; msS.fx=[]; msS.state='idle'; msS.emg=null; msS.emgTriggered=false;
  /* piano degli imprevisti: 2-3 a partita, in fasi diverse (dalla 2 in poi) */
  const n=MS_EMG_MIN+Math.floor(Math.random()*(MS_EMG_MAX-MS_EMG_MIN+1));
  msS.emgPhases=shuffle([2,3,4,5,6,7]).slice(0,n);
  clearTimeout(msAnimTid);
}
function msEnter(){
  if(VOICEON) initTTS();
  paused=true; stopSpeak();
  ['modeSel','menu'].forEach(id=>$(id).style.display='none');
  $('hud').style.display='none'; $('joy').style.display='none';
  msReset(); msResize(); msHud();
  $('ms').style.display='block';
  msS.paused=false; msS.last=0; msS.frameAt=0;
  if(MUSICON){ mCtx(); playMusic(TRK_ROCKET); }
  if(!msS.raf) msS.raf=requestAnimationFrame(msFrame);
  msPhaseStart(1);
}
function msExit(){
  cancelAnimationFrame(msS.raf); msS.raf=0; msS.paused=true; msS.state='idle';
  clearTimeout(msAnimTid);
  ['ms','msQ','msQOff','msCard','msEnd'].forEach(id=>$(id).style.display='none');
  stopSpeak();
  showModeSel();
}
$('msHomeBtn').onclick=msExit;
$('msMusicBtn').onclick=()=>{
  MUSICON=!MUSICON; save();
  if(!MUSICON) stopMusic(); else { mCtx(); playMusic(TRK_ROCKET); }
  msHud();
};

/* ---------- Registrazione nel menu dei giochi ---------- */
registerGame({
  id:'missione', emoji:'🚀',
  nm:['Missione Spaziale','Space Mission'],
  sub:['Leggi gli ordini della base e vola!','Read mission control and fly!'],
  colore:'linear-gradient(180deg,#5c6bc0,#1a237e)',
  enter:msEnter,
  exit:msExit
});

/* ---------- Aggancio per i test (jsdom) ---------- */
if(typeof window!=='undefined'){
  window.__MS={
    get S(){ return msS; },
    get Q(){ return msQ; },
    FASI:MS_FASI, IMPREVISTI:MS_IMPREVISTI, PANNELLI:MS_PANNELLI,
    enter:msEnter, exit:msExit, reset:msReset,
    phaseStart:msPhaseStart, panelTap:msPanelTap, showOrder:msShowOrder,
    launch:msLaunchCurrent, next:msNextOrder,
    emgStart:msEmgStart, emgTimeout:msEmgTimeout,
    qShow:msQShow, qOffer:msQOffer, qReward:msQReward,
    fuel:msFuel, fuelOut:msFuelOut, victory:msVictory,
    update:msUpdate, draw:msDraw
  };
}
