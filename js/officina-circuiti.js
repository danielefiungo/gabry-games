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
  '#oc { position:absolute; inset:0; display:none; z-index:8; background:linear-gradient(180deg,#4a3f66,#2e2a45 60%,#242038); }',
  '#ocCv { position:absolute; inset:0; touch-action:none; }',
  '#ocHud { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-start; padding:10px 12px; z-index:9; pointer-events:none; gap:6px; }',
  '#ocHud .hudBox { pointer-events:auto; }',
  '#ocBtns { pointer-events:auto; display:flex; gap:8px; }',
  '#ocGoal { position:absolute; top:56px; left:50%; transform:translateX(-50%); z-index:9; background:rgba(255,248,225,.96); border:3px solid #f0c95c; border-radius:16px; padding:8px 14px; font-size:clamp(16px,3.4vw,21px); color:#5c4300; max-width:min(720px,92vw); text-align:center; display:none; line-height:1.4; }',
  '#ocGoal button { background:none; border:none; font-size:20px; cursor:pointer; padding:0 4px; font-family:inherit; }',
  '#ocPalBar { position:absolute; bottom:0; left:0; right:0; z-index:9; display:none; justify-content:center; gap:8px; padding:8px 10px calc(10px + env(safe-area-inset-bottom)); flex-wrap:wrap; background:rgba(20,16,34,.72); }',
  '.ocTool { border:none; border-radius:16px; padding:8px 10px; min-width:64px; cursor:pointer; font-family:inherit; background:#3a3357; color:#fff; box-shadow:0 4px 0 rgba(0,0,0,.35); text-align:center; position:relative; }',
  '.ocTool:active { transform:translateY(2px); box-shadow:none; }',
  '.ocTool.sel { background:linear-gradient(180deg,#ffd35c,#f0a818); color:#4a3200; }',
  '.ocTool .ti { font-size:26px; display:block; }',
  '.ocTool .tn { font-size:11px; font-weight:bold; display:block; margin-top:2px; letter-spacing:.04em; }',
  '.ocTool .tc { position:absolute; top:-7px; right:-5px; background:#e05555; color:#fff; border-radius:10px; font-size:12px; font-weight:bold; padding:1px 7px; }',
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
  '#ocIntro .card, #ocWin .card { max-width:640px; }',
  '#ocIntroEm { font-size:56px; }',
  '#ocIntroTit { font-size:clamp(24px,5vw,34px); color:#5a34b0; margin:6px 0 10px; }',
  '#ocIntroTxt { font-size:clamp(20px,4vw,26px); color:#333; line-height:1.6; letter-spacing:.02em; word-spacing:.1em; margin-bottom:8px; }',
  '#ocIntroNew { display:none; background:#f3edff; border:2px solid #c9b8f2; border-radius:14px; padding:8px 12px; font-size:17px; color:#5a34b0; margin:0 auto 10px; max-width:90%; }',
  '#ocIntroSpk { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:18px; padding:6px 16px; cursor:pointer; font-family:inherit; margin-bottom:10px; }',
  /* vittoria + lo sapevi */
  '#ocWin .card { background:linear-gradient(180deg,#f4ffe8,#e2f6cd); border:4px solid #9fd47a; }',
  '#ocWinTit { font-size:clamp(24px,5vw,34px); color:#3f7a1e; margin:4px 0 6px; }',
  '#ocKnow { background:#fff; border-radius:14px; padding:12px 14px; margin:10px 0; text-align:left; }',
  '#ocKnowTit { font-size:16px; font-weight:bold; color:#b06f00; margin-bottom:6px; }',
  '#ocKnowTxt { font-size:clamp(18px,3.6vw,23px); line-height:1.6; letter-spacing:.02em; color:#3a4a2a; white-space:pre-line; }',
  '#ocKnowSpk { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:17px; padding:5px 14px; cursor:pointer; font-family:inherit; margin-top:8px; }',
  /* scelta livello */
  '#ocPick .card { max-width:720px; }',
  '#ocPickTit { font-size:clamp(24px,5vw,34px); color:#5a34b0; margin-bottom:2px; }',
  '#ocPickSub { font-size:16px; color:#777; margin-bottom:12px; line-height:1.4; }',
  '#ocPickGrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(104px,1fr)); gap:10px; }',
  '.ocLvBtn { border:none; border-radius:16px; padding:10px 6px; cursor:pointer; font-family:inherit; background:linear-gradient(180deg,#7f5cf0,#5a34b0); color:#fff; box-shadow:0 4px 0 #3d2378; }',
  '.ocLvBtn:active { transform:translateY(2px); box-shadow:none; }',
  '.ocLvBtn.lock { background:#4a4462; opacity:.55; cursor:default; }',
  '.ocLvBtn.sand { background:linear-gradient(180deg,#3cba54,#27803a); box-shadow:0 4px 0 #1d5f2b; }',
  '.ocLvBtn .ln { font-size:22px; font-weight:bold; display:block; }',
  '.ocLvBtn .lt { font-size:11px; display:block; margin:3px 0; min-height:26px; line-height:1.2; }',
  '.ocLvBtn .ls { font-size:13px; display:block; }',
  '#ocPickBack { margin-top:14px; background:none; border:none; color:#aaa; font-size:15px; cursor:pointer; font-family:inherit; text-decoration:underline; }'
  ].join('\n');
  document.head.appendChild(css);

  document.body.insertAdjacentHTML('beforeend',
  '<div id="oc">'+
    '<canvas id="ocCv"></canvas>'+
    '<div id="ocHud">'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
        '<div class="hudBox" id="ocLvl">⚡ 1/10</div>'+
        '<div class="hudBox" id="ocStar">⭐⭐⭐</div>'+
      '</div>'+
      '<div id="ocBtns">'+
        '<button class="hudBtn" id="ocHintBtn" title="Aiutino">💡</button>'+
        '<button class="hudBtn" id="ocResetBtn" title="Ricomincia">🔄</button>'+
        '<button class="hudBtn" id="ocPickBtn" title="Livelli">📋</button>'+
        '<button class="hudBtn" id="ocMusicBtn" title="Musica">🎵</button>'+
        '<button class="hudBtn" id="ocHomeBtn" title="Menu">🏠</button>'+
      '</div>'+
    '</div>'+
    '<div id="ocGoal"><span id="ocGoalTxt"></span> <button id="ocGoalSpk">🔊</button></div>'+
    '<button id="ocSun" class="day">☀️</button>'+
    '<div id="ocPalBar"></div>'+
    '<div id="ocMsg"></div>'+
    '<div id="ocWinBar"><span id="ocWinBarTxt"></span><button id="ocWinBarGo"></button><span id="ocWinBarSub"></span></div>'+
  '</div>'+
  '<div class="overlay" id="ocIntro" style="z-index:16">'+
    '<div class="card">'+
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
const OC_SANDBOX={ nx:8, ny:5, sun:1, comps:[], wires:[],
  pal:{wire:60,batt:2,lamp:4,sw:3,led:4,res:4,cap:2,npn:2,mot:2,buz:2,ldr:2} };

/* ---------- stato ---------- */
const oc={ on:false, raf:0, lvl:0, sandbox:false, board:null, pal:{}, tool:'hand',
  time:0, last:0, winT:0, mish:0, hint:0, hintT:0, freeBurnLeft:0,
  flow:{}, nets:null, smoke:[], flags:{}, dayT:0, nightT:0, sun:true,
  drag:null, won:false, cs:64, ox:0, oy:0 };

function ocSave(){ try{ localStorage.setItem('gabri_off_c', JSON.stringify(oc.prog)); }catch(e){} }
function ocLoad(){ try{ oc.prog=JSON.parse(localStorage.getItem('gabri_off_c'))||{unl:0,stars:[]}; }catch(e){ oc.prog={unl:0,stars:[]}; } }
ocLoad();

/* ---------- modello del banco ---------- */
function ocNK(x,y){ return x+','+y; }
function ocEK(x,y,o){ return x+','+y+','+o; }
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
    const [x,y,o]=k.split(','); const xi=+x, yi=+y;
    const a=(o==='H')?sk(xi,yi,'E'):sk(xi,yi,'S');
    const c=(o==='H')?sk(xi+1,yi,'W'):sk(xi,yi+1,'N');
    els.push({kind:'R', g:1/OC_RWIRE, a, b:c, edge:k});
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
  const availW=innerWidth-40, availH=innerHeight-210;
  oc.cs=Math.max(44, Math.min(110, Math.min(availW/(b.nx-1||1), availH/(b.ny-1||1))));
  oc.ox=(innerWidth-(b.nx-1)*oc.cs)/2;
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
      g.font=cs*0.3+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText(OC_T.icons[c.t]||'❓', px, py);
      g.globalAlpha=1;
    });
  }
  /* aiutino: fantasmi */
  if(oc.hintT>0&&oc.L&&oc.L.sol){
    const blink=0.35+0.3*Math.sin(oc.time*6);
    g.strokeStyle='rgba(255,240,120,'+blink+')'; g.lineWidth=cs*0.14; g.lineCap='round';
    (oc.L.sol.wires||[]).forEach(w=>{
      if(oc.board.wires.has(ocEK(w[0],w[1],w[2]))) return;
      const [ax,ay]=ocXY(w[0],w[1]); const [bx,by]=(w[2]==='H')?ocXY(w[0]+1,w[1]):ocXY(w[0],w[1]+1);
      g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
    });
    g.fillStyle='rgba(255,240,120,'+blink+')';
    (oc.L.sol.comps||[]).forEach(c=>{ const [px,py]=ocXY(c.x,c.y); g.beginPath(); g.arc(px,py,cs*0.3,0,7); g.fill(); });
    (oc.L.sol.tap||[]).forEach(id=>{ const c=ocComp(id); if(c){ const [px,py]=ocXY(c.x,c.y); g.strokeStyle='rgba(255,240,120,'+blink+')'; g.lineWidth=4; g.beginPath(); g.arc(px,py,cs*0.42,0,7); g.stroke(); } });
  }
  /* fili */
  b.wires.forEach((w,k)=>{
    const [x,y,o]=k.split(','); const xi=+x, yi=+y;
    const [ax,ay]=ocXY(xi,yi); const [bx,by]=(o==='H')?ocXY(xi+1,yi):ocXY(xi,yi+1);
    g.strokeStyle=w.lock?'#b7794a':'#d98e55'; g.lineWidth=cs*0.13; g.lineCap='round';
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=cs*0.05;
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,by); g.stroke();
  });
  /* elettroni (si muovono dal − al +, come nella realtà!) */
  b.wires.forEach((w,k)=>{
    const I=oc.flow[k]||0; if(Math.abs(I)<0.0006) return;
    const [x,y,o]=k.split(','); const xi=+x, yi=+y;
    const [ax,ay]=ocXY(xi,yi); const [bx,by]=(o==='H')?ocXY(xi+1,yi):ocXY(xi,yi+1);
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
      g.fillStyle=on?'#ffd35c':'#888'; g.font=cs*0.3+'px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText('🔔',px,py);
      if(on){ g.strokeStyle='rgba(255,211,92,'+(0.4+0.3*Math.sin(oc.time*20))+')'; g.lineWidth=2;
        g.beginPath(); g.arc(px,py,cs*0.32+3*Math.sin(oc.time*20),0,7); g.stroke(); }
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
  /* nome scritto (lettura leggera) + lucchetto */
  ocCap(g,c,px,py,cs,name);
  if(c.lock){ g.font=Math.max(9,cs*0.14)+'px sans-serif'; g.textAlign='center'; g.fillText('🔩', px+cs*0.3, py-cs*0.3); }
}

/* ---------- interazione ---------- */
function ocHitNode(mx,my){
  const b=oc.board;
  for(let x=0;x<b.nx;x++) for(let y=0;y<b.ny;y++){
    const [px,py]=ocXY(x,y);
    if(Math.hypot(mx-px,my-py)<oc.cs*0.38) return {x,y};
  }
  return null;
}
function ocHitEdge(mx,my){
  const b=oc.board; let best=null, bd=oc.cs*0.3;
  b.wires.forEach((w,k)=>{
    const [x,y,o]=k.split(','); const xi=+x, yi=+y;
    const [ax,ay]=ocXY(xi,yi); const [bx,by]=(o==='H')?ocXY(xi+1,yi):ocXY(xi,yi+1);
    const d=Math.hypot(mx-(ax+bx)/2,my-(ay+by)/2);
    if(d<bd){ bd=d; best=k; }
  });
  return best;
}
function ocSideOfEdge(x,y,o,nx2,ny2){ /* lato del nodo (nx2,ny2) toccato dall'arco */
  if(o==='H') return (nx2===x)?'E':'W';
  return (ny2===y)?'S':'N';
}
function ocCanAttach(x,y,side){
  const c=oc.board.comps.get(ocNK(x,y));
  if(!c) return true;
  return ocPins(c)[side]!==undefined;
}
function ocAddWire(x,y,o){
  const b=oc.board, k=ocEK(x,y,o);
  if(b.wires.has(k)) return false;
  const x2=(o==='H')?x+1:x, y2=(o==='H')?y:y+1;
  if(x2>=b.nx||y2>=b.ny) return false;
  if(!ocCanAttach(x,y,ocSideOfEdge(x,y,o,x,y))||!ocCanAttach(x2,y2,ocSideOfEdge(x,y,o,x2,y2))){ ocToast(OC_T.noPin[LI()]); return false; }
  if((oc.pal.wire||0)<=0){ ocToast(OC_T.noPiece[LI()]); return false; }
  b.wires.set(k,{}); oc.pal.wire--; ocPalDraw(); return true;
}
function ocSmartRot(t,x,y){
  /* scegli la rotazione che aggancia più fili vicini */
  const b=oc.board, rmax=(t==='npn')?4:4; let best=0, bestN=-1;
  for(let r=0;r<rmax;r++){
    const pins=ocPins({t,r}); let n2=0;
    for(const s in pins){
      let k=null;
      if(s==='E') k=ocEK(x,y,'H'); else if(s==='W') k=ocEK(x-1,y,'H');
      else if(s==='S') k=ocEK(x,y,'V'); else if(s==='N') k=ocEK(x,y-1,'V');
      if(k&&b.wires.has(k)) n2++;
    }
    if(n2>bestN){ bestN=n2; best=r; }
  }
  return best;
}
function ocPlace(t,x,y,r){
  const b=oc.board, k=ocNK(x,y);
  if(b.comps.has(k)) return false;
  if((oc.pal[t]||0)<=0){ ocToast(OC_T.noPiece[LI()]); return false; }
  b.comps.set(k, ocNewComp(t,x,y,(r===undefined)?ocSmartRot(t,x,y):r));
  oc.pal[t]--; ocPalDraw(); return true;
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
function ocPointer(e){
  if($('oc').style.display!=='block') return;
  const mx=e.clientX, my=e.clientY;
  if(my>innerHeight-92||my<110) return; /* palette e hud */
  const nd=ocHitNode(mx,my);
  if(oc.tool==='hand'){
    if(nd){ const c=oc.board.comps.get(ocNK(nd.x,nd.y)); if(c) ocInteract(c); }
    return;
  }
  if(oc.tool==='erase'){
    if(nd){ const k=ocNK(nd.x,nd.y), c=oc.board.comps.get(k);
      if(c){ if(c.lock){ ocToast(OC_T.locked[LI()]); } else { oc.board.comps.delete(k); oc.pal[c.t]=(oc.pal[c.t]||0)+1; ocPalDraw(); } return; } }
    const ek=ocHitEdge(mx,my);
    if(ek){ const w=oc.board.wires.get(ek);
      if(w.lock){ ocToast(OC_T.locked[LI()]); } else { oc.board.wires.delete(ek); oc.pal.wire=(oc.pal.wire||0)+1; ocPalDraw(); } }
    return;
  }
  if(oc.tool==='wire'){
    if(nd) oc.drag={last:nd};
    return;
  }
  /* strumento componente */
  if(nd){
    const c=oc.board.comps.get(ocNK(nd.x,nd.y));
    if(c){ if(c.t===oc.tool&&!c.lock){ c.r=((c.r||0)+1)%4; } else ocToast(OC_T.occupied[LI()]); }
    else ocPlace(oc.tool,nd.x,nd.y);
  }
}
function ocPointerMove(e){
  if(!oc.drag) return;
  const nd=ocHitNode(e.clientX,e.clientY); if(!nd) return;
  const L2=oc.drag.last;
  const dx=nd.x-L2.x, dy=nd.y-L2.y;
  if(Math.abs(dx)+Math.abs(dy)!==1) { if(dx||dy) oc.drag.last=nd; return; }
  if(dx===1) ocAddWire(L2.x,L2.y,'H');
  else if(dx===-1) ocAddWire(nd.x,nd.y,'H');
  else if(dy===1) ocAddWire(L2.x,L2.y,'V');
  else ocAddWire(nd.x,nd.y,'V');
  oc.drag.last=nd;
}
addEventListener('pointerdown',ocPointer);
addEventListener('pointermove',ocPointerMove);
addEventListener('pointerup',()=>{ oc.drag=null; });
addEventListener('resize',()=>{ if(oc.on) ocResize(); });

/* ---------- palette ---------- */
function ocPalDraw(){
  const bar=$('ocPalBar'); bar.innerHTML='';
  const i=LI();
  const tools=['hand','wire','erase'].concat(Object.keys(oc.pal).filter(t=>t!=='wire'));
  tools.forEach(t=>{
    if(t==='wire'&&oc.pal.wire===undefined) return;
    const btn=document.createElement('button');
    btn.className='ocTool'+(oc.tool===t?' sel':'');
    const cnt=(t==='hand'||t==='erase')?'':(t==='wire'?oc.pal.wire:oc.pal[t]);
    if(cnt===0) btn.classList.add('zero');
    btn.innerHTML='<span class="ti">'+OC_T.icons[t]+'</span><span class="tn">'+OC_T.names[t][i]+'</span>'+(cnt!==''?'<span class="tc">'+cnt+'</span>':'');
    btn.onclick=()=>{ oc.tool=t; ocPalDraw(); };
    bar.appendChild(btn);
  });
  /* filo subito dopo la mano */
  const kids=[...bar.children];
  if(oc.pal.wire===undefined&&kids.length){ /* nothing */ }
  bar.style.display='flex';
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
  const i=LI();
  $('ocLvl').textContent=oc.sandbox?'🧪':'⚡ '+(oc.lvl+1)+'/'+OC_LEVELS.length;
  ocStarHud();
  $('ocSun').style.display=L.sun?'block':'none'; ocSunDraw();
  $('ocHintBtn').style.display=oc.sandbox?'none':'';
  $('ocGoal').style.display=oc.sandbox?'none':'block';
  if(!oc.sandbox) $('ocGoalTxt').textContent=L.g[i];
  ocResize(); ocPalDraw();
  $('ocWinBar').style.display='none';
  ['ocIntro','ocWin','ocPick'].forEach(id=>$(id).style.display='none');
  if(!oc.sandbox){
    $('ocIntroTit').textContent='⚡ '+(oc.lvl+1)+'. '+L.t[i];
    $('ocIntroTxt').textContent=L.g[i];
    const newComp=Object.keys(L.pal||{}).filter(t=>t!=='wire')[0];
    const nv=$('ocIntroNew');
    if(newComp){ nv.style.display='block'; nv.textContent=OC_T.icons[newComp]+' '+((i===0)?'Nuovo pezzo: ':'New piece: ')+OC_T.names[newComp][i]; }
    else nv.style.display='none';
    $('ocIntro').style.display='flex';
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
  $('ocKnowTxt').textContent=oc.L.know[i];
  $('ocWin').style.display='flex';
};
function ocPickShow(){
  const i=LI();
  $('ocPickTit').textContent='⚡ '+OC_T.bench[i];
  $('ocPickSub').textContent=OC_T.story[i];
  const grid=$('ocPickGrid'); grid.innerHTML='';
  OC_LEVELS.forEach((L,n)=>{
    const btn=document.createElement('button');
    const locked=n>oc.prog.unl;
    btn.className='ocLvBtn'+(locked?' lock':'');
    const st=oc.prog.stars[n]||0;
    btn.innerHTML='<span class="ln">'+(locked?'🔒':(n+1))+'</span><span class="lt">'+L.t[i]+'</span><span class="ls">'+(st?'⭐'.repeat(st):'')+'</span>';
    if(!locked) btn.onclick=()=>{ ocGoto(n); };
    grid.appendChild(btn);
  });
  const sb=document.createElement('button');
  sb.className='ocLvBtn sand';
  sb.innerHTML='<span class="ln">🧪</span><span class="lt">'+OC_T.sandbox[i]+'</span><span class="ls">'+OC_T.sandboxSub[i]+'</span>';
  sb.onclick=()=>{ ocGoto(-1); };
  grid.appendChild(sb);
  $('ocPickBack').textContent=OC_T.back[i];
  $('ocPick').style.display='flex';
}
function ocSunDraw(){
  const b=$('ocSun');
  b.textContent=oc.sun?'☀️':'🌙';
  b.className=oc.sun?'day':'night';
}

/* ---------- pulsanti ---------- */
$('ocSun').onclick=()=>{ oc.sun=!oc.sun; ocSunDraw(); };
$('ocIntroGo').onclick=()=>{ $('ocIntro').style.display='none'; stopSpeak(); };
$('ocIntroSpk').onclick=()=>{ if(oc.L) speak(oc.L.g[LI()]); };
$('ocGoalSpk').onclick=()=>{ if(oc.L) speak(oc.L.g[LI()]); };
$('ocKnowSpk').onclick=()=>{ speak($('ocKnowTxt').textContent); };
$('ocWinNext').onclick=()=>{
  $('ocWin').style.display='none'; stopSpeak();
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
  oc.on=true; oc.last=0;
  ocGoto(Math.min(oc.prog.unl,OC_LEVELS.length-1));
  ocPickShow();
  $('ocIntro').style.display='none';
  if(typeof MUSICON!=='undefined'&&MUSICON){ mCtx(); playMusic(TRK_LEVEL); }
  if(!oc.raf) oc.raf=requestAnimationFrame(ocFrame);
}
function ocExit(){
  cancelAnimationFrame(oc.raf); oc.raf=0; oc.on=false;
  ['oc','ocIntro','ocWin','ocPick','ocWinBar'].forEach(id=>$(id).style.display='none');
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
  enter:ocEnter
});

/* ---------- aggancio per i test ---------- */
window.__OC={ oc, levels:OC_LEVELS, goto:ocGoto, step:ocStep, solve:ocSolve,
  place:ocPlace, wire:ocAddWire, comp:ocComp, api:ocApi, enter:ocEnter, exit:ocExit };
