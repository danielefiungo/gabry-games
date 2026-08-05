/* ============================================================
   L'ALVEARE DI GABRIELE — gestionale di lettura e difesa
   Regina -> uova -> bottinatrici/costruttrici/guerriere.
   Un click su un calabrone assegna le guerriere disponibili.
   Le domande corrette fanno nascere nuove api.
   Le bottinatrici producono le razioni per le guerriere.
   ============================================================ */

(function(){
  const css=document.createElement('style');
  css.textContent=`
  #pa{position:absolute;inset:0;display:none;z-index:8;overflow:hidden;background:linear-gradient(#78cef1 0 55%,#a5df75 55% 100%)}
  #paCv{position:absolute;inset:0;touch-action:manipulation;cursor:crosshair}
  #paHud{position:absolute;inset:10px 12px auto;z-index:9;display:flex;align-items:center;gap:8px;flex-wrap:wrap;pointer-events:none}
  #paHud .paMeter{background:rgba(255,255,255,.94);border:3px solid #fff;border-radius:16px;padding:7px 11px;box-shadow:0 4px 12px #315d7030;font-size:16px;font-weight:700;color:#4d3a18;white-space:nowrap}
  #paHiveHealth{width:min(285px,44vw);padding:7px 11px!important;border-color:#fff2b2!important;background:linear-gradient(180deg,#fffdf4,#fff2c7)!important}
  .paHealthTop{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px}.paHealthTop strong{color:#8c3b22}.paHealthTop span{font-size:13px}
  .paHealthTrack{height:13px;margin:4px 0;border:2px solid #7d4a1d;border-radius:10px;background:#5b2f20;overflow:hidden}.paHealthTrack>div{height:100%;width:100%;border-radius:8px;background:linear-gradient(90deg,#43b95a,#8ddd58);transition:width .3s,background .3s}
  #paHiveHits{display:block;font-size:11px;color:#6d4b24;line-height:1.15}
  #paHudBtns{margin-left:auto;display:flex;gap:7px;pointer-events:auto}
  #paPause .card{max-width:430px;border:4px solid #f1b82f;background:linear-gradient(#fffdf1,#ffefb5)}
  #paPause h2{margin:4px;color:#9a6200;font-size:clamp(30px,6vw,42px)}
  #paPause p{font-size:19px;color:#674712}
  #paMsg{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);z-index:10;max-width:min(680px,92vw);padding:11px 18px;border-radius:18px;background:#3f2b20e8;color:#fff;font-size:18px;font-weight:700;text-align:center;box-shadow:0 5px 16px #0004;pointer-events:none}
  #paTask{position:absolute;top:82px;left:12px;z-index:9;max-width:330px;background:#fff9dfef;border:3px solid #efb92f;border-radius:18px;padding:10px 14px;color:#674712;font-weight:700;line-height:1.35;pointer-events:none}
  #paAsk{position:absolute;z-index:11;display:grid;grid-template-columns:48px 1fr;align-items:center;width:184px;height:70px;padding:6px 11px 6px 7px;border:3px solid #7b480e;border-radius:22px;font:700 16px/1.05 Andika,sans-serif;color:#5a3308;text-align:left;background:linear-gradient(145deg,#fff7a8,#ffc832 68%,#efa514);box-shadow:0 7px 0 #9a5b0c,0 11px 22px #0003;cursor:pointer;transform:rotate(-2deg);animation:paAskBob 2.8s ease-in-out infinite}
  #paAsk:hover{filter:brightness(1.06)}#paAsk:active{transform:translateY(4px) rotate(-2deg);box-shadow:0 3px 0 #9a5b0c,0 6px 12px #0002}
  #paAsk .paAskIcon{display:grid;place-items:center;width:43px;height:43px;border:2px solid #9a5b0c;border-radius:50%;background:#fff9d4;font-size:22px}
  #paAsk small{display:block;margin-top:3px;font-size:11px;line-height:1;color:#7b4a13;letter-spacing:.04em}
  @keyframes paAskBob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(1deg)}}
  #paQ{padding:clamp(8px,2vw,18px)}
  #paQ .card{width:min(960px,calc(100vw - 2 * clamp(8px,2vw,18px)));max-width:none;max-height:calc(100dvh - 2 * clamp(8px,2vw,18px));padding:clamp(15px,2.2vw,26px);border:4px solid #f1b82f;background:linear-gradient(#fffdf2,#fff0b7);overflow-x:hidden}
  #paQTitle{font-size:24px;color:#9a6200;font-weight:700}
  #paQText{font-size:clamp(24px,4.2vw,36px);line-height:1.45;margin:14px 0;color:#302314;white-space:pre-line}
  #paQText.paLong{font-size:clamp(19px,3.3vw,27px);text-align:left;max-width:760px;margin:12px auto}
  #paQAnswers{display:grid;gap:11px;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}
  #paQAnswers .ansBtn{display:flex;align-items:center;justify-content:center;width:100%;min-width:0;min-height:92px;padding:clamp(12px,1.8vw,20px) clamp(8px,1.2vw,14px);font-size:clamp(18px,2.3vw,28px);line-height:1.18;overflow-wrap:anywhere;hyphens:auto;text-wrap:balance}
  #paQLevels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0}
  .paBirthRole{display:grid;grid-template-rows:auto 1fr;gap:10px;padding:12px;border:3px solid #ecd17e;border-radius:20px;background:#fffdf4;text-align:left}.paBirthRole.worker{border-color:#71c9bd}.paBirthRole.builder{border-color:#efa755}.paBirthRole.warrior{border-color:#e67b72}
  .paBirthHead{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center;color:#5c3c14}.paBirthHead>span{grid-row:1/3;font-size:34px}.paBirthHead strong{font-size:17px}.paBirthHead small{font-size:12px;color:#745c3b}
  .paCountChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;align-self:end}
  .paLevelBtn{min-width:0;border:0;border-radius:13px;padding:10px 3px;color:#fff;font:700 18px Andika,sans-serif;cursor:pointer;box-shadow:0 4px 0 #0003}
  .worker .paLevelBtn{background:#269e96}.builder .paLevelBtn{background:#df861e}.warrior .paLevelBtn:nth-child(1){background:#47ad5b}.warrior .paLevelBtn:nth-child(2){background:#ef9f25}.warrior .paLevelBtn:nth-child(3){background:#d94b4b}
  .paLevelBtn small{display:block;font-size:10px;margin-top:3px}
  #paQMsg{min-height:30px;font-size:20px;font-weight:700;margin-top:12px}
  #paIntro .card{max-width:720px;border:4px solid #f1b82f;background:linear-gradient(#fffdf1,#ffefb5)}
  #paIntro h2{font-size:clamp(27px,5vw,39px);color:#9a6200;margin:4px}
  #paIntro p{font-size:18px;line-height:1.5;text-align:left}
  .paLegend{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;text-align:left;margin:15px 0}
  .paLegend span{background:#fff;border-radius:13px;padding:9px}
  @media(max-width:820px){#paQAnswers{grid-template-columns:1fr;gap:9px}#paQAnswers .ansBtn{min-height:58px;font-size:clamp(17px,4.5vw,22px);padding:10px 12px}#paQLevels{grid-template-columns:1fr;gap:8px}.paBirthRole{grid-template-columns:minmax(145px,1fr) 1fr;grid-template-rows:1fr;align-items:center;padding:8px 11px}.paBirthHead>span{font-size:28px}}
  @media(max-width:650px){#paHud{gap:4px;inset:5px 5px auto}#paHud .paMeter{font-size:12px;padding:5px 7px;border-width:2px}#paHiveHealth{order:10;width:min(275px,78vw)}#paTask{top:128px;font-size:12px;max-width:245px}.paLegend{grid-template-columns:1fr}#paAsk{width:158px;height:62px;grid-template-columns:39px 1fr;font-size:13px;padding:5px 7px}#paAsk .paAskIcon{width:35px;height:35px;font-size:18px}#paAsk small{font-size:9px}#paQText{font-size:clamp(20px,5.7vw,27px)}#paQText.paLong{font-size:clamp(17px,4.8vw,21px);line-height:1.38}}
  @media(max-height:720px){#paQ .card>div:first-child{font-size:34px!important}#paQTitle{font-size:20px}#paQText,#paQText.paLong{margin:7px auto;line-height:1.32}#paQAnswers{gap:7px}#paQAnswers .ansBtn{min-height:54px;padding:8px 10px}#paQMsg{margin-top:7px}#paQBack{margin-top:4px!important}}
  `;
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',`
    <div id="pa"><canvas id="paCv"></canvas>
      <div id="paHud">
        <div class="paMeter" id="paEggs">🥚 0</div><div class="paMeter" id="paWorkers">🌼 0</div>
        <div class="paMeter" id="paBuilders">🔨 0</div><div class="paMeter" id="paWarriors">🛡️ 0</div><div class="paMeter" id="paHoney">🍯 0</div>
        <div class="paMeter" id="paHiveHealth"><div class="paHealthTop"><strong>❤️ SALUTE ALVEARE</strong><span id="paHiveHpText">100 / 100</span></div><div class="paHealthTrack"><div id="paHiveHpFill"></div></div><small id="paHiveHits">Può resistere ancora a 10 colpi leggeri</small></div>
        <div class="paMeter" id="paWave">⚔️ 1</div><div id="paHudBtns"><button class="hudBtn" id="paPauseBtn" aria-label="Metti in pausa" title="Pausa">⏸️</button><button class="hudBtn" id="paMusicBtn" aria-label="Attiva o disattiva la musica" title="Musica">🎵</button><button class="hudBtn" id="paHomeBtn" aria-label="Torna ai giochi" title="Torna ai giochi">🏠</button></div>
      </div>
      <div id="paTask"></div><div id="paMsg"></div><button id="paAsk" aria-label="Fai nascere nuove api"><span class="paAskIcon">🥚✨</span><span>FAI NASCERE<small>LE API</small></span></button>
    </div>
    <div class="overlay" id="paIntro"><div class="card"><div style="font-size:58px">👑🐝</div><h2>L'alveare di Gabriele</h2>
      <p>La Regina depone un uovo ogni pochi secondi. Con una risposta corretta puoi far nascere insieme 1, 2 o 3 api dello stesso tipo.</p>
      <div class="paLegend"><span>👑 La <b>regina</b> produce le uova necessarie.</span><span>🌼 Le <b>bottinatrici</b> raccolgono nettare e producono miele.</span><span>🔨 Le <b>costruttrici</b> rinforzano e riparano l’alveare.</span><span>🛡️ Le <b>guerriere</b> fermano i calabroni e consumano miele.</span><span>❤️ Se la salute arriva a zero, l’alveare cede.</span><span>👆 Tocca più volte un <b>calabrone</b> per mandare una squadra.</span></div>
      <button class="bigBtn" id="paIntroGo">Proteggi l'alveare! 🛡️</button></div></div>
    <div class="overlay" id="paQ"><div class="card"><div style="font-size:46px">🥚🐝</div><div id="paQTitle"></div><div id="paQLevels">
      <div class="paBirthRole worker"><div class="paBirthHead"><span>🌼</span><strong>BOTTINATRICI</strong><small>producono miele</small></div><div class="paCountChoices"><button class="paLevelBtn" data-level="worker" data-count="1">×1<small>1 uovo</small></button><button class="paLevelBtn" data-level="worker" data-count="2">×2<small>2 uova</small></button><button class="paLevelBtn" data-level="worker" data-count="3">×3<small>3 uova</small></button></div></div>
      <div class="paBirthRole builder"><div class="paBirthHead"><span>🔨</span><strong>COSTRUTTRICI</strong><small>rinforzano e riparano</small></div><div class="paCountChoices"><button class="paLevelBtn" data-level="builder" data-count="1">×1<small>1 uovo</small></button><button class="paLevelBtn" data-level="builder" data-count="2">×2<small>2 uova</small></button><button class="paLevelBtn" data-level="builder" data-count="3">×3<small>3 uova</small></button></div></div>
      <div class="paBirthRole warrior"><div class="paBirthHead"><span>🛡️</span><strong>GUERRIERE</strong><small>difendono l’alveare</small></div><div class="paCountChoices"><button class="paLevelBtn" data-level="easy" data-count="1">×1<small>facile</small></button><button class="paLevelBtn" data-level="medium" data-count="2">×2<small>medio</small></button><button class="paLevelBtn" data-level="hard" data-count="3">×3<small>difficile</small></button></div></div>
    </div>
      <div id="paQText"></div><button id="paQSpeak" class="jollyBtn">🔊 Leggimela</button><div id="paQAnswers"></div><div id="paQMsg"></div><button id="paQBack" style="border:0;background:none;color:#777;text-decoration:underline;margin-top:8px">torna al gioco</button>
    </div></div>
    <div class="overlay" id="paPause"><div class="card"><div style="font-size:70px">⏸️🐝</div><h2>PAUSA</h2><p>L’alveare è fermo. Riprendi quando sei pronto!</p><button class="bigBtn" id="paResume">Riprendi ▶️</button></div></div>
    <div class="overlay" id="paEnd"><div class="card"><div id="paEndEm" style="font-size:74px"></div><div id="paEndTitle" style="font-size:34px;color:#b27300;font-weight:700"></div><div id="paEndTxt" style="font-size:20px;line-height:1.5;margin:12px"></div><button class="bigBtn" id="paAgain">Gioca ancora</button><br><button id="paEndHome" style="border:0;background:none;text-decoration:underline;margin-top:12px">Torna ai giochi</button></div></div>`);
})();

const PA_TWO_PI=Math.PI*2;
const PA_FLOWERS=[['#ef476f','#ffd166'],['#8b5cf6','#ffe66d'],['#ff8fab','#ffe66d'],['#f77f00','#fff3b0'],['#55a630','#fff']];
/* Tema originale dell'alveare: circa 26 secondi prima di ripetersi.
   Melodia solare, controcanto morbido, basso ronzante e batteria leggera. */
const PA_HIVE_A=[76,0,79,0,81,0,79,0,76,0,74,0,[72,3],0,0,0, 74,0,76,0,79,0,81,0,[79,3],0,0,0,76,0,74,0];
const PA_HIVE_B=[77,0,81,0,84,0,81,0,79,0,77,0,[76,3],0,0,0, 74,0,77,0,81,0,79,0,[76,3],0,0,0,74,0,72,0];
const PA_HIVE_C=[79,0,83,0,86,0,83,0,81,0,79,0,[77,3],0,0,0, 79,0,81,0,83,0,86,0,[84,3],0,0,0,81,0,79,0];
const PA_HIVE_D=[81,0,84,0,88,0,86,0,84,0,81,0,[79,3],0,0,0, 77,0,79,0,81,0,84,0,[83,3],0,0,0,79,0,76,0];
const PA_HIVE_E=[84,0,83,0,81,0,79,0,81,0,84,0,[86,3],0,0,0, 84,0,81,0,79,0,76,0,[77,3],0,0,0,79,0,81,0];
const PA_HIVE_F=[79,0,76,0,74,0,76,0,79,0,81,0,[84,3],0,0,0, 83,0,79,0,77,0,74,0,[72,6],0,0,0,0,0,0,0];
const TRK_HIVE={bpm:112,ch:[
  {w:'triangle',v:.055,n:[...PA_HIVE_A,...PA_HIVE_B,...PA_HIVE_C,...PA_HIVE_D,...PA_HIVE_E,...PA_HIVE_F]},
  {w:'sine',v:.026,n:[
    [67,8],0,0,0,0,0,0,0,[69,8],0,0,0,0,0,0,0,[67,8],0,0,0,0,0,0,0,[64,8],0,0,0,0,0,0,0,
    [65,8],0,0,0,0,0,0,0,[69,8],0,0,0,0,0,0,0,[67,8],0,0,0,0,0,0,0,[64,8],0,0,0,0,0,0,0,
    [67,8],0,0,0,0,0,0,0,[71,8],0,0,0,0,0,0,0,[69,8],0,0,0,0,0,0,0,[67,8],0,0,0,0,0,0,0,
    [69,8],0,0,0,0,0,0,0,[72,8],0,0,0,0,0,0,0,[71,8],0,0,0,0,0,0,0,[67,8],0,0,0,0,0,0,0,
    [72,8],0,0,0,0,0,0,0,[71,8],0,0,0,0,0,0,0,[69,8],0,0,0,0,0,0,0,[65,8],0,0,0,0,0,0,0,
    [67,8],0,0,0,0,0,0,0,[64,8],0,0,0,0,0,0,0,[62,8],0,0,0,0,0,0,0,[60,8],0,0,0,0,0,0,0]},
  {w:'triangle',v:.072,n:[48,0,55,0,48,0,55,0,45,0,52,0,45,0,52,0, 41,0,48,0,41,0,48,0,43,0,50,0,43,0,50,0,
    48,0,55,0,48,0,55,0,45,0,52,0,45,0,52,0, 41,0,48,0,41,0,48,0,43,0,50,0,47,0,50,0]},
  {d:1,n:['k',0,'h',0,0,0,'h',0,'s',0,'h',0,0,0,'h',0,'k',0,'h',0,'k',0,'h',0,'s',0,'h',0,0,'h','h',0]}
]};
const PA_HORNET_TYPES={
  scout:{name:'ESPLORATORE',icon:'💨',hp:4,speed:1.5,damage:1,hiveDamage:10,scale:.92,body:'#f5a623',head:'#cf6b16',reward:4,hint:'Può bastare 1 guerriera ben riposata.'},
  raider:{name:'PREDONE',icon:'🍯',hp:8,speed:1,damage:2,hiveDamage:18,scale:1.15,body:'#e57b18',head:'#a94716',reward:7,hint:'Meglio una squadra di 2 guerriere.'},
  tank:{name:'CORAZZATO',icon:'🪨',hp:13,speed:.68,damage:3,hiveDamage:28,scale:1.42,body:'#9b5a2e',head:'#71391f',reward:11,hint:'Servono circa 3 guerriere.'},
  commander:{name:'COMANDANTE',icon:'⚡',hp:18,speed:1.18,damage:4,hiveDamage:38,scale:1.58,body:'#d34b28',head:'#8e251b',reward:16,hint:'Prepara almeno 4 guerriere.'},
  king:{name:'RE DEI CALABRONI',icon:'👑',hp:30,speed:.86,damage:5,hiveDamage:55,scale:1.85,body:'#7d3ac1',head:'#4d247b',reward:30,hint:'Solo una grande squadra può fermarlo!'}
};
const PA_QUESTIONS={
  worker:[
    ['Quale parola indica chi raccoglie nettare?','BOTTINATRICE','CALABRONE','REGINA'],
    ['Completa: La bottinatrice vola sul…','FIORE','LETTO','MARE'],
    ['Quale parola comincia come MIELE?','MIMOSA','SOLE','APE'],
    ['Che cosa porta a casa la bottinatrice?','NETTARE','SASSI','NEVE'],
    ['Completa: FIO _ E','R','L','N'],
    ['Quale frase ha senso?','L’APE VISITA IL FIORE','IL FIORE VISITA L’APE','IL MIELE VOLA'],
    ['Qual è la prima sillaba di NETTARE?','NET','TA','RE'],
    ['Scegli la parola scritta bene.','POLLINE','POLLNIE','POLINEE'],
    ['Dove torna l’ape dopo il raccolto?','ALL’ALVEARE','NEL MARE','SULLA LUNA'],
    ['Completa: Le api raccolgono il nettare e producono il…','MIELE','PANE','LATTE'],
    ['Quale parola fa rima con FIORE?','CUORE','ALVEARE','MIELE'],
    ['Leggi: “L’ape ha le zampe piene di polline.” Che cosa trasporta?','POLLINE','ACQUA','FOGLIE'],
    ['Quale azione compie una bottinatrice?','RACCOGLIE','RUGGISCE','NUOTA'],
    ['Metti al posto giusto: La bottinatrice ___ all’alveare.','RITORNA','DORMONO','CRESCI'],
    ['Quale parola è più lunga?','BOTTINATRICE','APE','RE']
  ],
  builder:[
    ['Con che cosa le api costruiscono il favo?','CON LA CERA','CON LA SABBIA','CON LA LANA'],
    ['Quale ape ripara l’alveare?','LA COSTRUTTRICE','LA BOTTINATRICE','IL CALABRONE'],
    ['Completa: La costruttrice chiude la…','CREPA','NUVOLA','PORTAEREI'],
    ['Quale parola comincia come CERA?','CESTO','SOLE','MIELE'],
    ['Come si scrive il nome dell’ape che ripara?','COSTRUTTRICE','COSTRUTRICE','COSTRUTTRICCE'],
    ['Le celle del favo hanno quanti lati?','SEI','DUE','DIECI'],
    ['Che cosa usa l’ape per sigillare piccoli buchi?','LA PROPOLI','IL NETTARE','IL POLLINE'],
    ['Completa: La cera rende il favo più…','FORTE','BAGNATO','RUMOROSO'],
    ['Quale azione significa “aggiustare”?','RIPARARE','SCAPPARE','DIMENTICARE'],
    ['La costruttrice lavora vicino a che cosa?','ALL’ALVEARE','AL FONDO DEL MARE','SULLA LUNA'],
    ['Qual è la prima sillaba di FAVO?','FA','VO','AV'],
    ['Completa: CO _ TRUIRE','S','M','P'],
    ['Quale frase descrive il lavoro nell’alveare?','L’APE RIPARA IL FAVO','IL FAVO VOLA SUL FIORE','LA CERA LEGGE'],
    ['Che cosa diventa più resistente grazie alla costruttrice?','L’ALVEARE','IL CALABRONE','LA NUVOLA'],
    ['Quale parola fa rima con CERA?','SERA','FIORE','MIELE']
  ],
  easy:[
    ['Quale parola comincia con A?','APE','SOLE','LUNA'],['Completa: A _ E','P','M','T'],
    ['Quale animale vola?','APE','GATTO','PESCE'],['Che cosa producono le api?','MIELE','LATTE','PANE'],
    ['Quale parola comincia con F?','FIORE','NIDO','APE'],['Completa: MIE _ E','L','R','N'],
    ['Quale parola finisce con E?','APE','FIORI','NETTARE'],['Completa: A _ VEARE','L','P','R'],
    ['Quale parola contiene la sillaba “MI”?','MIELE','APE','FIORE'],['Quante sillabe ha la parola A-PE?','DUE','UNA','TRE'],
    ['Quale forma della parola REGINA è scritta bene?','REGINA','REGNIA','REIGNA'],['Quale parola indica una casa delle api?','ALVEARE','TANA','ACQUARIO'],
    ['Completa: Il fiore è gial _ o.','L','R','T'],['Qual è il plurale di FIORE?','FIORI','FIOREI','FIORO'],
    ['Leggi: “L’ape vola.” Che cosa fa l’ape?','VOLA','DORME','NUOTA'],['Quale parola è più corta?','APE','MIELE','REGINA'],
    ['Completa: Le api fanno il…','MIELE','TRENO','VENTO'],['Quale lettera manca? CA _ ABRONE','L','M','P']
  ],
  medium:[
    ['Che cosa raccolgono le api sui fiori?','NETTARE','SABBIA','NEVE'],['Qual è il plurale di APE?','API','APO','APA'],
    ['Quale parola è scritta bene?','CALABRONE','CALABRNOE','CALBORANE'],['La regina depone le…','UOVA','PIETRE','STELLE'],
    ['Quale parola ha quattro sillabe?','ALVEARE','APE','MIELE'],['Completa la frase: le api volano sui…','FIORI','MARI','TRENI'],
    ['Lina vede nuvole scure e torna all’alveare. Perché torna?','STA PER PIOVERE','HA TROVATO LA LUNA','VUOLE NUOTARE'],
    ['Il fiore è vuoto, così l’ape ne cerca un altro. Che cosa manca?','IL NETTARE','LA NEVE','IL VENTO'],
    ['Prima l’ape raccoglie il nettare, poi torna a casa. Che cosa fa per ultimo?','TORNA A CASA','CERCA IL NETTARE','ESCE DALL’UOVO'],
    ['Le bottinatrici lavorano insieme. Qual è il soggetto della frase?','LE BOTTINATRICI','LAVORANO','INSIEME'],
    ['Scegli la frase con causa e conseguenza.','PIOVE, PERCIÒ LE API RESTANO NELL’ALVEARE','L’APE È GIALLA E NERA','IL FIORE È VICINO'],
    ['Il calabrone è forte, ma tre guerriere lo circondano. Chi è in maggior numero?','LE GUERRIERE','IL CALABRONE','SONO UGUALI'],
    ['Quale frase è al passato?','L’APE HA RACCOLTO IL NETTARE','L’APE RACCOGLIE IL NETTARE','L’APE RACCOGLIERÀ IL NETTARE'],
    ['Nell’alveare resta poco miele. Quale ape è più utile far nascere?','UNA BOTTINATRICE','UN CALABRONE','UNA FARFALLA'],
    ['“Le api non escono perché piove.” Perché restano dentro?','PER LA PIOGGIA','PER IL BUIO','PER IL MIELE'],
    ['Quale parola significa quasi la stessa cosa di “difendere”?','PROTEGGERE','RACCOGLIERE','SCAPPARE'],
    ['Metti in ordine le azioni.','FIORE → NETTARE → ALVEARE','ALVEARE → MIELE → FIORE','NETTARE → ALVEARE → FIORE'],
    ['Un’ape torna con le zampe cariche di polline. Da dove arriva?','DAI FIORI','DAL FONDO DEL MARE','DA UNA GROTTA']
  ],
  hard:[
    ['Una bottinatrice trova molti fiori ricchi di nettare.\nTornata all’alveare, esegue la “danza dell’addome”.\nCon i movimenti indica direzione e distanza del cibo.\nChe cosa comunica alle compagne?','DOVE TROVARE I FIORI','QUANDO ANDARE A DORMIRE','COME COSTRUIRE LE CELLE'],
    ['Un’ape ha due grandi occhi composti.\nSopra la testa possiede anche tre piccoli occhi semplici.\nQuesti percepiscono soprattutto i cambiamenti di luce.\nQuanti occhi ha in tutto?','CINQUE','DUE','TRE'],
    ['Le ali di un’ape battono circa 200 volte al secondo.\nIl movimento rapidissimo sposta l’aria.\nCosì nasce il ronzio che sentiamo.\nQual è la causa del ronzio?','IL BATTITO DELLE ALI','IL COLORE DEI FIORI','LA FORMA DELL’ALVEARE'],
    ['Le giovani operaie producono piccole scaglie di cera.\nLe ammorbidiscono con la bocca e costruiscono il favo.\nNel favo crescono le larve e si conservano le scorte.\nA che cosa serve la cera?','A COSTRUIRE IL FAVO','A COLORARE IL POLLINE','A RAFFREDDARE LE ALI'],
    ['Sulle zampe posteriori alcune api hanno una “cestella”.\nDurante la visita ai fiori vi accumulano il polline.\nPoi lo riportano all’alveare per nutrire la colonia.\nChe cosa trasporta la cestella?','IL POLLINE','LA CERA','LE UOVA'],
    ['In inverno le api non vanno in letargo.\nSi stringono in un gruppo e muovono i muscoli del volo.\nIl movimento produce calore e protegge la regina.\nPerché formano un gruppo?','PER RESTARE CALDE','PER TROVARE FIORI','PER PRODURRE PIOGGIA'],
    ['Quando l’alveare è troppo caldo, alcune api portano acqua.\nAltre ventilano con le ali e fanno evaporare le gocce.\nL’evaporazione abbassa la temperatura interna.\nQuale risultato ottengono?','RAFFREDDANO L’ALVEARE','SCALDANO IL MIELE','COLORANO LE CELLE'],
    ['Le celle del favo hanno sei lati.\nLa forma esagonale usa bene lo spazio ed è resistente.\nInoltre richiede poca cera per costruire le pareti.\nPerché l’esagono è vantaggioso?','È SOLIDO E RISPARMIA CERA','È ROTONDO E MORBIDO','LASCIA SPAZI VUOTI'],
    ['Le api raccolgono resine appiccicose dalle piante.\nLe mescolano con la cera e ottengono la propoli.\nLa propoli serve a sigillare e proteggere il nido.\nDa dove proviene la parte appiccicosa?','DALLE PIANTE','DALLE NUVOLE','DALLE PIETRE'],
    ['Le operaie raccolgono il nettare e lo passano ad altre api.\nNell’alveare vengono aggiunti enzimi e molta acqua evapora.\nIl liquido diventa più denso e si trasforma in miele.\nChe cosa accade all’acqua?','EVAPORA','AUMENTA','DIVENTA POLLINE'],
    ['I fiori possono mostrare disegni visibili alla luce ultravioletta.\nNoi non li vediamo, ma le api sì.\nQuei segni guidano le visitatrici verso il nettare.\nA chi sono utili quei disegni?','ALLE API','SOLO AGLI ESSERI UMANI','AI PESCI'],
    ['Le api non hanno papille gustative come le nostre.\nPer riconoscere alcune sostanze usano speciali sensori.\nQuesti si trovano anche sulle zampe anteriori.\nCon quale parte possono “assaggiare”?','CON LE ZAMPE','CON LE ALI','CON IL PUNGIGLIONE'],
    ['Una colonia ha una regina, molte operaie e alcuni fuchi.\nI fuchi sono maschi e non possiedono il pungiglione.\nLe operaie, invece, difendono e nutrono la colonia.\nChi non può pungere?','I FUCHI','LE OPERAIE','LA REGINA'],
    ['Le operaie cambiano compito mentre crescono.\nDa giovani puliscono e nutrono le larve; poi costruiscono e sorvegliano.\nSolo più tardi escono a cercare cibo.\nQuale lavoro svolgono per ultimo?','RACCOGLIERE CIBO','PULIRE LE CELLE','NUTRIRE LE LARVE'],
    ['Il polline si attacca ai peli dell’ape mentre visita un fiore.\nSul fiore successivo, alcuni granelli si staccano.\nCosì la pianta può produrre semi e frutti.\nQuale effetto ha il viaggio dell’ape?','AIUTA LE PIANTE A RIPRODURSI','FA APPASSIRE I FIORI','TRASFORMA IL POLLINE IN CERA'],
    ['Nel favo le celle non servono tutte allo stesso scopo.\nAlcune ospitano uova e larve; altre conservano miele o polline.\nOgni spazio aiuta la vita della colonia.\nQuale affermazione riassume il testo?','LE CELLE HANNO FUNZIONI DIVERSE','TUTTE LE CELLE SONO VUOTE','NELLE CELLE VIVE SOLO LA REGINA'],
    ['Una bottinatrice sente il profumo dei fiori su una compagna.\nPoi osserva la sua danza e scopre in quale direzione volare.\nProfumo e movimento offrono informazioni diverse.\nChe cosa indica soprattutto la danza?','LA DIREZIONE DEL CIBO','IL COLORE DELL’APE','L’ETÀ DELLA REGINA'],
    ['Durante il freddo, il gruppo di api si stringe.\nLe api esterne fanno da barriera, quelle interne producono calore.\nA turno cambiano posizione per proteggere tutta la colonia.\nChe cosa dimostra questo comportamento?','LE API COLLABORANO','LE API LAVORANO SEMPRE SOLE','LE API ABBANDONANO LA REGINA']
  ]
};
const PA_Q_REWARD={easy:1,medium:2,hard:3};
const PA_WARRIOR_DPS=.58;
const PA_WARRIOR_DRAIN=8;
const PA_REFUEL_SECONDS=3.2;
const PA_HIVE_START_HP=100;
const PA_BUILDER_REINFORCE=15;
const PA_BUILDER_REPAIR=1.15;

let pa={on:false,paused:true,manualPaused:false,raf:0,last:0,frameAt:0,w:0,h:0,time:0,eggs:1,eggClock:0,workerClock:0,workers:2,builders:0,warriors:1,honey:4,honeyFrac:0,hiveHp:PA_HIVE_START_HP,hiveMaxHp:PA_HIVE_START_HP,builderRepairFrac:0,
  bees:[],hornets:[],flowers:[],fx:[],wave:1,waveKills:0,killed:0,lost:0,spawnClock:3,nextId:1,msgTimer:0,qUsed:[],queen:null,hive:null};
const paCv=$('paCv'),paC=paCv.getContext('2d');

function paResize(){const d=Math.min(devicePixelRatio||1,1.5);pa.w=innerWidth;pa.h=innerHeight;paCv.width=pa.w*d;paCv.height=pa.h*d;paCv.style.width=pa.w+'px';paCv.style.height=pa.h+'px';paC.setTransform(d,0,0,d,0,0);paLayout();}
function paLayout(){pa.hive={x:pa.w*.22,y:pa.h*.72};pa.queen={x:pa.hive.x,y:pa.hive.y-15};pa.flowers=[];for(let i=0;i<7;i++)pa.flowers.push({x:pa.w*(.48+(i%4)*.14),y:pa.h*(.68+Math.floor(i/4)*.18),c:i%PA_FLOWERS.length});const ask=$('paAsk');if(ask){const ah=pa.w<650?62:70;/* Sotto l'alveare, fuori dalle rotte tra alveare e fiori. */ask.style.left='10px';ask.style.top=Math.max(8,pa.h-ah-12)+'px';}}
function paSay(t,ms=2600){$('paMsg').textContent=t;$('paMsg').style.display='block';pa.msgTimer=ms/1000;}
function paHud(){
  const avail=pa.bees.filter(b=>b.role==='warrior'&&b.state==='idle').length;
  const hungry=pa.bees.filter(b=>b.role==='warrior'&&b.state==='hungry').length;
  $('paEggs').textContent='🥚 '+pa.eggs+' disponibili';$('paWorkers').textContent='🌼 '+pa.workers+' bottinatrici · '+Math.round(pa.honeyFrac*100)+'%';
  $('paBuilders').textContent='🔨 '+pa.builders+' costruttrici';$('paWarriors').textContent='🛡️ '+avail+'/'+pa.warriors+' pronte'+(hungry?' · '+hungry+' affamate':'');$('paHoney').textContent='🍯 '+pa.honey+' razioni';
  const health=Math.max(0,Math.min(1,pa.hiveHp/pa.hiveMaxHp)),pct=Math.round(health*100),lightHits=Math.ceil(pa.hiveHp/PA_HORNET_TYPES.scout.hiveDamage);
  $('paHiveHpText').textContent=Math.ceil(pa.hiveHp)+' / '+pa.hiveMaxHp;$('paHiveHpFill').style.width=pct+'%';$('paHiveHpFill').style.background=pct>60?'linear-gradient(90deg,#43b95a,#8ddd58)':pct>30?'linear-gradient(90deg,#e69b25,#ffd45a)':'linear-gradient(90deg,#c93636,#f06a4d)';
  $('paHiveHits').textContent=lightHits?'Può resistere ancora a '+lightHits+(lightHits===1?' colpo leggero':' colpi leggeri'):'Non può resistere a un altro colpo';
  $('paWave').textContent='⚔️ '+pa.wave+'/8 · '+Math.min(pa.waveKills,paWaveGoal())+'/'+paWaveGoal();$('paPauseBtn').textContent=pa.manualPaused?'▶️':'⏸️';$('paPauseBtn').setAttribute('aria-label',pa.manualPaused?'Riprendi il gioco':'Metti in pausa');$('paMusicBtn').textContent=MUSICON?'🎵':'🔇';
  $('paTask').innerHTML='<b>ORGANIZZA L’ALVEARE</b><br>🥚 Fai nascere 1, 2 o 3 api insieme.<br>🌼 Le bottinatrici producono miele.<br>🔨 Le costruttrici aumentano la salute massima e riparano i danni.<br>🛡️ Tocca più volte un calabrone per creare una squadra.';
}
function paWaveGoal(){return 2+Math.ceil(pa.wave/2);}
function paBee(role){const a=Math.random()*PA_TWO_PI,r=35+Math.random()*45;return{id:pa.nextId++,role,state:'idle',x:pa.hive.x+Math.cos(a)*r,y:pa.hive.y-45+Math.sin(a)*r*.5,vx:0,vy:0,phase:Math.random()*PA_TWO_PI,energy:100,target:null,flower:null,carry:false,rest:0,refuelPaid:false};}
function paReset(){
  Object.assign(pa,{paused:true,manualPaused:false,last:0,time:0,eggs:1,eggClock:0,workerClock:0,workers:2,builders:0,warriors:1,honey:4,honeyFrac:0,hiveHp:PA_HIVE_START_HP,hiveMaxHp:PA_HIVE_START_HP,builderRepairFrac:0,bees:[],hornets:[],fx:[],wave:1,waveKills:0,killed:0,lost:0,spawnClock:3,nextId:1,msgTimer:0,qUsed:[]});
  $('paPause').style.display='none';
  paLayout();for(let i=0;i<2;i++)pa.bees.push(paBee('worker'));pa.bees.push(paBee('warrior'));paHud();
}
function paSpawnHornet(){
  let type='scout';
  if(pa.wave===8&&pa.hornets.length===0)type='king';
  else{const r=Math.random();if(pa.wave>=6&&r<.2)type='commander';else if(pa.wave>=4&&r<.48)type='tank';else if(pa.wave>=2&&r<.78)type='raider';}
  const cfg=PA_HORNET_TYPES[type],boss=type==='king';
  const hp=cfg.hp*1.28*(1+(pa.wave-1)*.12);
  /* L'alveare è a sinistra: i nemici arrivano dal bordo lontano, così anche
     su uno schermo piccolo c'è il tempo di leggere l'avviso e formare la squadra. */
  pa.hornets.push({id:pa.nextId++,type,cfg,x:pa.w+65,y:100+Math.random()*Math.max(100,pa.h*.36),hp,maxHp:hp,speed:(36+pa.wave*3.1)*cfg.speed,phase:Math.random()*6,targetX:pa.hive.x,targetY:pa.hive.y-45,assigned:[],dead:false,boss,hit:0});
  paSay(cfg.icon+' '+cfg.name+'! '+cfg.hint);
}
function paAssign(h){
  const b=pa.bees.find(x=>x.role==='warrior'&&x.state==='idle'&&x.energy>=95);
  if(!b){const hungry=pa.bees.some(x=>x.role==='warrior'&&x.state==='hungry');paSay(hungry?'Le guerriere hanno fame! Servono bottinatrici per produrre miele.':'Nessuna guerriera pronta. Aspetta il rifornimento o rispondi a una domanda!');return;}
  b.state='fight';b.target=h;b.energy=Math.max(0,b.energy-4);h.assigned.push(b);pa.fx.push({x:h.x,y:h.y,t:0,text:'🛡️ +1'});paSay('Guerriera assegnata! Tocca ancora per mandarne un’altra.');paHud();
}
function paReleaseBee(b){const h=b.target;if(h){const i=h.assigned.indexOf(b);if(i>=0)h.assigned.splice(i,1);}b.target=null;b.state='return';b.refuelPaid=false;}
function paBeginRefuel(b){
  if(pa.honey<1){b.state='hungry';b.rest=0;paHud();return false;}
  pa.honey--;b.state='rest';b.rest=0;b.refuelPaid=true;pa.fx.push({x:b.x,y:b.y,t:0,text:'🍯 -1'});paHud();return true;
}
function paMove(b,tx,ty,s,dt){const dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy)||1;b.vx+=(dx/d*s-b.vx)*Math.min(1,dt*3);b.vy+=(dy/d*s-b.vy)*Math.min(1,dt*3);b.x+=b.vx*dt;b.y+=b.vy*dt;return d;}
function paUpdate(dt){
  pa.time+=dt;if(pa.msgTimer>0){pa.msgTimer-=dt;if(pa.msgTimer<=0)$('paMsg').style.display='none';}
  pa.eggClock+=dt;if(pa.eggClock>6){pa.eggClock=0;pa.eggs++;pa.fx.push({x:pa.queen.x,y:pa.queen.y,t:0,text:'🥚 +1'});paSay('👑 La regina ha deposto un uovo!');paHud();}
  pa.spawnClock-=dt;if(pa.waveKills<paWaveGoal()&&pa.spawnClock<=0&&pa.hornets.length<Math.min(5,2+Math.floor(pa.wave/2))){paSpawnHornet();pa.spawnClock=Math.max(3.4,6.2-pa.wave*.32);}
  for(const b of pa.bees){b.phase+=dt*12;
    if(b.role==='worker'){
      if(!b.flower)b.flower=pa.flowers[Math.floor(Math.random()*pa.flowers.length)];
      if(b.state==='idle'||b.state==='gather'){
        b.state='gather';const d=paMove(b,b.flower.x,b.flower.y-24,108,dt);
        if(d<14){b.carry=true;b.state='return';}
      }else if(b.state==='return'){
        const d=paMove(b,pa.hive.x+20,pa.hive.y-40,126,dt);
        if(d<18){pa.honeyFrac+=.5;if(pa.honeyFrac>=1){pa.honey++;pa.honeyFrac-=1;pa.fx.push({x:pa.hive.x,y:pa.hive.y-85,t:0,text:'🍯 +1 RAZIONE'});paSay('🍯 Le bottinatrici hanno prodotto miele per rifocillare le guerriere!');}paHud();b.carry=false;b.flower=pa.flowers[Math.floor(Math.random()*pa.flowers.length)];b.state='gather';}
      }
    }else if(b.role==='builder'){
      const step=Math.floor(pa.time/2+b.id)%4,spots=[[-58,-38],[-24,-92],[34,-88],[62,-30]],spot=spots[step];
      paMove(b,pa.hive.x+spot[0],pa.hive.y+spot[1],82,dt);
      if(pa.hiveHp<pa.hiveMaxHp){pa.builderRepairFrac+=PA_BUILDER_REPAIR*dt;if(pa.builderRepairFrac>=1){const repair=Math.min(Math.floor(pa.builderRepairFrac),pa.hiveMaxHp-pa.hiveHp);pa.builderRepairFrac-=repair;pa.hiveHp+=repair;pa.fx.push({x:b.x,y:b.y,t:0,text:'🔨 +'+repair});paHud();}}
    }else if(b.state==='fight'){
      const h=b.target;if(!h||h.dead){paReleaseBee(b);}else{const n=h.assigned.indexOf(b),a=pa.time*2.8+n*PA_TWO_PI/Math.max(1,h.assigned.length);const d=paMove(b,h.x+Math.cos(a)*30,h.y+Math.sin(a)*22,168,dt);if(d<40){b.energy=Math.max(0,b.energy-dt*PA_WARRIOR_DRAIN);h.hp-=dt*PA_WARRIOR_DPS;h.hit=.1;if(b.energy<=0){paReleaseBee(b);paSay('Una guerriera è stanca: torna all’alveare e ha bisogno di miele!');paHud();}}}
    }else if(b.state==='return'){
      if(paMove(b,pa.hive.x+(b.id%5-2)*13,pa.hive.y-50,122,dt)<18)paBeginRefuel(b);
    }else if(b.state==='rest'){
      b.rest+=dt;b.energy=Math.min(100,b.energy+dt*100/PA_REFUEL_SECONDS);if(b.rest>=PA_REFUEL_SECONDS){b.energy=100;b.state='idle';b.refuelPaid=false;paHud();}
    }else if(b.state==='hungry'){
      paMove(b,pa.hive.x+(b.id%5-2)*13,pa.hive.y-58,35,dt);if(pa.honey>=1){paBeginRefuel(b);paSay('🍯 Una guerriera affamata ha ricevuto la sua razione!');}
    }else{paMove(b,pa.hive.x+Math.cos(b.phase*.15+b.id)*75,pa.hive.y-55+Math.sin(b.phase*.13+b.id)*35,48,dt);}
  }
  for(const h of pa.hornets){if(h.dead)continue;h.phase+=dt*7;h.hit=Math.max(0,h.hit-dt);
    const dx=h.targetX-h.x,dy=h.targetY-h.y,d=Math.hypot(dx,dy)||1;
    /* Anche sotto attacco il calabrone avanza. Ogni guerriera lo rallenta,
       ma non può mai immobilizzarlo completamente. */
    const slow=h.assigned.length?Math.max(.2,.58-h.assigned.length*.07):1;
    h.x+=dx/d*h.speed*slow*dt+Math.sin(h.phase)*7*dt;
    h.y+=dy/d*h.speed*slow*dt+Math.cos(h.phase*.8)*4*dt;
    if(d<38){
      h.dead=true;pa.lost++;pa.honey=Math.max(0,pa.honey-h.cfg.damage);pa.hiveHp=Math.max(0,pa.hiveHp-h.cfg.hiveDamage);
      for(const b of h.assigned){b.state='return';b.target=null;}
      paSay('💥 '+h.cfg.name+': -'+h.cfg.hiveDamage+' salute e -'+h.cfg.damage+' miele!');paHud();
    }
    if(!h.dead&&h.hp<=0){h.dead=true;pa.killed++;pa.waveKills++;score+=h.cfg.reward;save();for(const b of h.assigned){b.state='return';b.target=null;}pa.fx.push({x:h.x,y:h.y,t:0,text:'✨ +'+h.cfg.reward});sCorrect();paSay(h.cfg.name+' sconfitto! Le guerriere tornano a riposare.');paHud();}
  }
  pa.hornets=pa.hornets.filter(h=>!h.dead);
  for(const f of pa.fx)f.t+=dt;pa.fx=pa.fx.filter(f=>f.t<1.4);
  if(pa.hiveHp<=0){paFinish(false);return;}
  /* Raggiunto l'obiettivo non arrivano altri nemici. L'ondata, e soprattutto
     la partita finale, si chiude soltanto quando il campo è davvero libero. */
  if(pa.waveKills>=paWaveGoal()&&pa.hornets.length===0){if(pa.wave>=8)paFinish(true);else{pa.wave++;pa.waveKills=0;pa.spawnClock=2.2;paSay('🌟 Ondata superata! Prepara nuove guerriere: ora saranno di più.');paHud();}}
}

function paRound(x,y,w,h,r=12){paC.beginPath();paC.roundRect(x,y,w,h,r);}
function paDrawFlower(f,t){const c=PA_FLOWERS[f.c],s=1+Math.sin(t*1.5+f.x)*.04;paC.strokeStyle='#39843e';paC.lineWidth=5;paC.beginPath();paC.moveTo(f.x,f.y+35);paC.quadraticCurveTo(f.x-10,f.y+10,f.x,f.y);paC.stroke();paC.save();paC.translate(f.x,f.y);paC.scale(s,s);for(let i=0;i<7;i++){const a=i*PA_TWO_PI/7;paC.fillStyle=c[0];paC.beginPath();paC.ellipse(Math.cos(a)*13,Math.sin(a)*13,9,14,a,0,PA_TWO_PI);paC.fill();}paC.fillStyle=c[1];paC.beginPath();paC.arc(0,0,9,0,PA_TWO_PI);paC.fill();paC.restore();}
function paDrawHive(){const {x,y}=pa.hive,c=paC,health=Math.max(0,Math.min(1,pa.hiveHp/pa.hiveMaxHp));c.fillStyle='#0002';c.beginPath();c.ellipse(x,y+47,85,14,0,0,PA_TWO_PI);c.fill();for(let i=0;i<6;i++){const w=70-i*8,yy=y+30-i*15,g=c.createLinearGradient(x,yy-12,x,yy+12);g.addColorStop(0,'#ffd866');g.addColorStop(1,'#d99315');c.fillStyle=g;c.strokeStyle='#925b0b';c.lineWidth=3;c.beginPath();c.ellipse(x,yy,w,17,0,0,PA_TWO_PI);c.fill();c.stroke();}c.fillStyle='#4a2709';c.beginPath();c.arc(x,y+37,15,Math.PI,0);c.fill();c.fillStyle='#9b622c';paRound(x-72,y+46,144,12,5);c.fill();if(health<.72){c.strokeStyle='#6e390e';c.lineWidth=3;c.beginPath();c.moveTo(x-25,y-20);c.lineTo(x-10,y-8);c.lineTo(x-22,y+5);c.lineTo(x-7,y+18);if(health<.38){c.moveTo(x+28,y-36);c.lineTo(x+13,y-22);c.lineTo(x+26,y-8);c.lineTo(x+15,y+5);}c.stroke();}const bw=142,bx=x-bw/2,by=y-112;c.fillStyle='#fffbe8';paRound(bx-4,by-20,bw+8,40,12);c.fill();c.strokeStyle='#7d4a1d';c.lineWidth=2;paRound(bx,by,bw,13,7);c.stroke();c.fillStyle='#5b2f20';paRound(bx+2,by+2,bw-4,9,5);c.fill();c.fillStyle=health>.6?'#55c35d':health>.3?'#f0ae2e':'#e2483c';paRound(bx+2,by+2,(bw-4)*health,9,5);c.fill();c.fillStyle='#663d17';c.font='bold 12px Andika';c.textAlign='center';c.fillText('❤️ ALVEARE '+Math.round(health*100)+'%',x,by-5);}
function paDrawBee(b,queen=false){const c=paC,s=queen?1.75:(b.role==='warrior'?1.2:1),ang=Math.atan2(b.vy,b.vx),dir=Math.cos(ang)>=0?1:-1,tilt=dir>0?ang:Math.PI-ang;c.save();c.translate(b.x,b.y);c.rotate(tilt);c.scale(dir*s,s);c.fillStyle='#dff6ffcc';c.strokeStyle='#7bb5cf';c.lineWidth=1;c.beginPath();c.ellipse(-4,-9,6,10,-.5,0,PA_TWO_PI);c.ellipse(5,-9,6,10,.5,0,PA_TWO_PI);c.fill();c.stroke();c.save();c.beginPath();c.ellipse(0,0,14,9,0,0,PA_TWO_PI);c.clip();c.fillStyle=queen?'#ffc83d':'#ffd43b';c.fillRect(-15,-10,30,20);c.fillStyle='#3a2a10';c.fillRect(-7,-10,4,20);c.fillRect(3,-10,4,20);c.restore();c.strokeStyle='#3a2a10';c.lineWidth=2;c.beginPath();c.ellipse(0,0,14,9,0,0,PA_TWO_PI);c.stroke();c.fillStyle='#efaa28';c.beginPath();c.arc(13,0,7,0,PA_TWO_PI);c.fill();c.stroke();c.fillStyle='#241a10';c.beginPath();c.arc(15,-2,1.5,0,PA_TWO_PI);c.fill();c.beginPath();c.moveTo(-14,-2);c.lineTo(-21,0);c.lineTo(-14,2);c.fill();if(b.role==='warrior'){c.fillStyle='#c84b31';paRound(7,-10,13,5,2);c.fill();c.fillStyle='#fff';c.font='9px sans-serif';c.fillText('✦',12,-6);}if(b.role==='builder'){c.fillStyle='#f08b22';c.beginPath();c.arc(9,-7,8,Math.PI,0);c.fill();c.fillRect(1,-8,16,3);c.font='11px serif';c.fillText('🔨',-9,-10);}if(queen){c.font='15px serif';c.fillText('👑',5,-14);}if(b.carry){c.font='12px serif';c.fillText('🍯',-8,13);}c.restore();}
function paDrawHornet(h){const c=paC,s=h.cfg.scale,a=Math.atan2(h.targetY-h.y,h.targetX-h.x),dir=Math.cos(a)>=0?1:-1,tilt=dir>0?a:Math.PI-a;c.save();c.translate(h.x,h.y);c.rotate(tilt);c.scale(dir*s,s);if(h.hit)c.translate((Math.random()-.5)*4,0);c.fillStyle='#d7efffcc';c.strokeStyle='#678ca3';c.lineWidth=1.5;c.beginPath();c.ellipse(-5,-14,8,14,-.4,0,PA_TWO_PI);c.ellipse(6,-14,8,14,.4,0,PA_TWO_PI);c.fill();c.stroke();c.save();c.beginPath();c.ellipse(0,0,23,13,0,0,PA_TWO_PI);c.clip();c.fillStyle=h.cfg.body;c.fillRect(-25,-14,50,28);c.fillStyle='#35230d';for(let x=-15;x<15;x+=10)c.fillRect(x,-14,5,28);c.restore();c.strokeStyle='#35230d';c.lineWidth=h.type==='tank'?4:3;c.beginPath();c.ellipse(0,0,23,13,0,0,PA_TWO_PI);c.stroke();c.fillStyle=h.cfg.head;c.beginPath();c.arc(22,0,12,0,PA_TWO_PI);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(25,-3,4,0,PA_TWO_PI);c.fill();c.fillStyle='#c1121f';c.beginPath();c.arc(26,-3,2,0,PA_TWO_PI);c.fill();c.strokeStyle='#35230d';c.beginPath();c.moveTo(18,-10);c.lineTo(29,-7);c.stroke();c.beginPath();c.moveTo(-23,-3);c.lineTo(-35,0);c.lineTo(-23,3);c.fill();c.restore();const w=h.boss?112:76,top=h.boss?66:50,fr=Math.max(0,h.hp/h.maxHp);c.fillStyle='#fff';paRound(h.x-w/2,h.y-top,w,10,5);c.fill();c.fillStyle=fr>.45?'#50b85a':'#e24b3b';paRound(h.x-w/2+2,h.y-top+2,(w-4)*fr,6,3);c.fill();c.fillStyle='#3b2915';c.font='bold 12px Andika';c.textAlign='center';c.fillText(h.cfg.icon+' '+h.cfg.name+' · '+h.assigned.length+' 🐝',h.x,h.y-top-9);}
function paDraw(){const t=pa.time,c=paC;c.clearRect(0,0,pa.w,pa.h);const sky=c.createLinearGradient(0,0,0,pa.h);sky.addColorStop(0,'#70c9ef');sky.addColorStop(.58,'#d8f5ff');sky.addColorStop(.59,'#87cb62');sky.addColorStop(1,'#4d9b45');c.fillStyle=sky;c.fillRect(0,0,pa.w,pa.h);c.fillStyle='#ffe45e';c.beginPath();c.arc(pa.w-70,80,35,0,PA_TWO_PI);c.fill();c.fillStyle='#fff9';for(let i=0;i<4;i++){const x=(i*300+t*8)%(pa.w+180)-90,y=75+i*45;c.beginPath();c.ellipse(x,y,55,18,0,0,PA_TWO_PI);c.ellipse(x+35,y-10,35,16,0,0,PA_TWO_PI);c.fill();}c.fillStyle='#7cbc58';c.beginPath();c.ellipse(pa.w*.3,pa.h*.65,pa.w*.48,pa.h*.18,0,Math.PI,PA_TWO_PI);c.fill();c.fillStyle='#67ae4d';c.beginPath();c.ellipse(pa.w*.8,pa.h*.68,pa.w*.45,pa.h*.2,0,Math.PI,PA_TWO_PI);c.fill();for(const f of pa.flowers)paDrawFlower(f,t);paDrawHive();paDrawBee({x:pa.queen.x,y:pa.queen.y,vx:1,vy:0,role:'queen'},true);for(const b of pa.bees)paDrawBee(b);for(const h of pa.hornets)paDrawHornet(h);c.textAlign='center';c.font='bold 25px Andika';for(const f of pa.fx){c.globalAlpha=1-f.t/1.4;c.fillStyle='#fff';c.strokeStyle='#4b3216';c.lineWidth=4;c.strokeText(f.text,f.x,f.y-f.t*35);c.fillText(f.text,f.x,f.y-f.t*35);}c.globalAlpha=1;}
function paFrame(ts){pa.raf=requestAnimationFrame(paFrame);const frameMs=pa.paused?100:1000/30;if(Number.isFinite(ts)&&pa.frameAt&&ts-pa.frameAt<frameMs-1)return;if(Number.isFinite(ts))pa.frameAt=ts;if(!pa.last)pa.last=ts;const dt=Math.min(.05,(ts-pa.last)/1000);pa.last=ts;if(!pa.paused)paUpdate(dt);paDraw();}

paCv.addEventListener('pointerdown',e=>{if(pa.paused)return;const r=paCv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let hit=null,bd=80*80;for(const h of pa.hornets){const d=(h.x-x)**2+(h.y-y)**2;if(d<bd){bd=d;hit=h;}}if(hit)paAssign(hit);else paSay('Tocca direttamente un calabrone per assegnare una guerriera.');});

function paPickQ(level){const questions=PA_QUESTIONS[level],prefix=level+':';let pool=questions.map((q,i)=>({q,i})).filter(x=>!pa.qUsed.includes(prefix+x.i));if(!pool.length){pa.qUsed=pa.qUsed.filter(x=>!x.startsWith(prefix));pool=questions.map((q,i)=>({q,i}));}const p=pool[Math.floor(Math.random()*pool.length)];pa.qUsed.push(prefix+p.i);return p.q;}
let paCurrentQ=null,paQDone=false,paQLevel='easy',paQCount=1;
function paShowQ(){pa.paused=true;paCurrentQ=null;paQDone=false;$('paQTitle').textContent='Scegli quali api far nascere';$('paQLevels').style.display='grid';$('paQText').classList.remove('paLong');$('paQText').textContent='La regina ha deposto '+pa.eggs+(pa.eggs===1?' uovo disponibile.':' uova disponibili.');$('paQSpeak').style.display='none';$('paQAnswers').innerHTML='';$('paQMsg').textContent=pa.eggs?'Scegli un tipo e una quantità: basta una risposta corretta.':'Aspetta che la regina deponga un uovo!';$('paQLevels').querySelectorAll('button').forEach(b=>{const need=Number(b.dataset.count);b.disabled=pa.eggs<need;b.style.opacity=b.disabled?'.35':'1';});$('paQ').style.display='flex';}
function paStartQ(level,count){const reward=Number(count)||PA_Q_REWARD[level]||1;if(pa.eggs<reward){$('paQMsg').textContent='Non ci sono abbastanza uova!';return;}paQLevel=level;paQCount=reward;paCurrentQ=paPickQ(level);paQDone=false;const role=level==='worker'?'BOTTINATRIC'+(reward===1?'E':'I'):level==='builder'?'COSTRUTTRIC'+(reward===1?'E':'I'):'GUERRIER'+(reward===1?'A':'E');$('paQTitle').textContent='FAI NASCERE '+reward+' '+role+' — '+reward+(reward===1?' uovo':' uova');$('paQLevels').style.display='none';$('paQText').classList.toggle('paLong',level==='hard');$('paQText').textContent=paCurrentQ[0];$('paQSpeak').style.display='inline-block';$('paQMsg').textContent='';const a=$('paQAnswers');a.innerHTML='';shuffle([[paCurrentQ[1],1],[paCurrentQ[2],0],[paCurrentQ[3],0]]).forEach(([txt,ok])=>{const b=document.createElement('button');b.className='ansBtn';b.textContent=txt;b.onclick=()=>paAnswer(b,ok);a.appendChild(b);});}
function paAnswer(b,ok){if(paQDone)return;if(ok){paQDone=true;b.classList.add('right');document.querySelectorAll('#paQAnswers button').forEach(x=>x.disabled=true);const reward=paQCount,isWorker=paQLevel==='worker',isBuilder=paQLevel==='builder';pa.eggs-=reward;if(isWorker){for(let i=0;i<reward;i++)pa.bees.push(paBee('worker'));pa.workers+=reward;}else if(isBuilder){for(let i=0;i<reward;i++)pa.bees.push(paBee('builder'));pa.builders+=reward;pa.hiveMaxHp+=reward*PA_BUILDER_REINFORCE;pa.hiveHp+=reward*PA_BUILDER_REINFORCE;}else{for(let i=0;i<reward;i++)pa.bees.push(paBee('warrior'));pa.warriors+=reward;}score+=reward*5;save();sCorrect();const born=reward===1?'È nata 1 '+(isWorker?'bottinatrice':isBuilder?'costruttrice':'guerriera'):'Sono nate '+reward+' '+(isWorker?'bottinatrici':isBuilder?'costruttrici':'guerriere');$('paQMsg').style.color='#299447';$('paQMsg').textContent='Bravissimo! '+born+'! '+(isWorker?'🌼🐝':isBuilder?'🔨🐝':'🐝🛡️');paHud();setTimeout(()=>{$('paQ').style.display='none';pa.paused=false;pa.last=0;paSay(isWorker?'Le nuove bottinatrici raccoglieranno nettare e produrranno miele.':isBuilder?'Le costruttrici hanno rinforzato l’alveare e ora ripareranno i danni.':'Le nuove guerriere sono pronte. Tocca un calabrone più volte per creare una squadra!');},1400);}else{b.disabled=true;b.classList.add('wrong');sWrong();$('paQMsg').style.color='#d53e3e';$('paQMsg').textContent='Quasi! Prova un’altra risposta.';}}
$('paQLevels').querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>paStartQ(b.dataset.level,b.dataset.count));
$('paAsk').onclick=paShowQ;$('paQBack').onclick=()=>{stopSpeak();$('paQ').style.display='none';pa.paused=false;pa.last=0;};$('paQSpeak').onclick=()=>speak([{t:paCurrentQ?paCurrentQ[0]:'',el:$('paQText')}]);
function paFinish(win){if(pa.paused)return;pa.paused=true;stopMusic();$('paEndEm').textContent=win?'🏆🐝':'🌧️🐝';$('paEndTitle').textContent=win?'ALVEARE SALVO!':'RIPROVIAMO!';$('paEndTxt').innerHTML=win?'Tutti i calabroni sono stati sconfitti!<br>Hai guidato bottinatrici, costruttrici e guerriere fino alla vittoria.<br>Calabroni sconfitti: '+pa.killed+' · Punti: '+score:'La salute dell’alveare è arrivata a zero. Fai nascere costruttrici per rinforzarlo e ripararlo!';$('paEnd').style.display='flex';if(win){fanfare();confetti();}}
function paTogglePause(force){
  if(!pa.on||(!pa.manualPaused&&pa.paused))return;
  const pause=typeof force==='boolean'?force:!pa.manualPaused;
  pa.manualPaused=pause;pa.paused=pause;$('paPause').style.display=pause?'flex':'none';
  if(pause){stopSpeak();stopMusic();}else{pa.last=0;if(MUSICON){mCtx();playMusic(TRK_HIVE);}}
  paHud();
}
$('paAgain').onclick=()=>{$('paEnd').style.display='none';paReset();pa.paused=false;paSay('La Regina ha iniziato a deporre le uova!');if(MUSICON){mCtx();playMusic(TRK_HIVE);}};$('paEndHome').onclick=paExit;
function paEnter(){if(VOICEON)initTTS();paused=true;stopSpeak();['modeSel','menu'].forEach(id=>$(id).style.display='none');$('hud').style.display='none';$('joy').style.display='none';$('pa').style.display='block';pa.on=true;pa.frameAt=0;paResize();paReset();if(!pa.raf)pa.raf=requestAnimationFrame(paFrame);$('paIntro').style.display='flex';}
function paExit(){cancelAnimationFrame(pa.raf);pa.raf=0;pa.on=false;pa.paused=true;pa.manualPaused=false;['pa','paIntro','paQ','paPause','paEnd'].forEach(id=>$(id).style.display='none');stopSpeak();showModeSel();}
$('paIntroGo').onclick=()=>{$('paIntro').style.display='none';pa.paused=false;pa.last=0;paSay('La Regina depone le uova. Le operaie stanno andando ai fiori!');if(MUSICON){mCtx();playMusic(TRK_HIVE);}};$('paPauseBtn').onclick=()=>paTogglePause();$('paResume').onclick=()=>paTogglePause(false);$('paHomeBtn').onclick=paExit;$('paMusicBtn').onclick=()=>{MUSICON=!MUSICON;save();if(MUSICON){mCtx();playMusic(TRK_HIVE);}else stopMusic();paHud();};addEventListener('resize',()=>{if(pa.on)paResize();});
registerGame({id:'pallaapi',emoji:'🐝',nm:['L’Alveare di Gabriele','Gabriele’s Hive'],sub:['Fai nascere api, raccogli miele e difendi l’alveare!','Raise bees, collect honey and defend the hive!'],colore:'linear-gradient(180deg,#ffd23f,#e8890b)',enter:paEnter,exit:paExit});
