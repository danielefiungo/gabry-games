/* ============================================================
   LA PALLA DI API 🐝🔥 — difesa dell'alveare come nella realtà
   Il calabrone manda un ESPLORATORE. Se le api lo circondano
   e vibrano, la palla arriva a 46°C e il calabrone è cotto
   (le api resistono fino a 48°C!). Se l'esploratore scappa,
   marca l'alveare con un feromone e arrivano i predoni.
   Tra un attacco e l'altro, il Consiglio dell'Alveare:
   rispondendo alle domande si sbloccano le difese VERE
   (ingresso stretto, guardiane, propoli, onda delle api).
   Premio: dipende dalla difficoltà, dimezzato con la
   lettura automatica 🔊 o con gli errori.
   ============================================================ */

/* ---------- stile ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#pa { position:absolute; inset:0; display:none; z-index:8; background:linear-gradient(180deg,#8fd3f4,#cdeefb 55%,#a8dc82 78%,#7cc061); }',
  '#paCv { position:absolute; inset:0; touch-action:none; }',
  '#paHud { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:10px 14px; z-index:9; pointer-events:none; flex-wrap:wrap; gap:6px; }',
  '#paBtns { pointer-events:auto; display:flex; gap:8px; }',
  '#paOnda { display:none; background:linear-gradient(180deg,#4fc3f7,#0288d1); color:#fff; }',
  '#paMsg { position:absolute; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.62); color:#fff; padding:10px 22px; border-radius:20px; font-size:19px; z-index:9; display:none; pointer-events:none; max-width:94vw; text-align:center; }',
  '#paBig { position:absolute; top:22%; left:50%; transform:translateX(-50%); z-index:9; pointer-events:none; font-size:clamp(30px,7vw,54px); font-weight:bold; color:#fff; text-shadow:0 3px 0 rgba(0,0,0,.35); opacity:0; text-align:center; }',
  '#paBig.pop { animation:comboBig 1.8s ease-out; }',
  /* consiglio dell'alveare */
  '#paShop .card { background:linear-gradient(180deg,#fff8e1,#ffefc2); max-width:780px; }',
  '#paShopTitle { font-size:clamp(24px,5vw,34px); color:#b06f00; margin:4px 0 8px; }',
  '#paShopSub { font-size:16px; color:#8a6d00; margin-bottom:12px; line-height:1.4; }',
  '#paStats { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }',
  '#paDef { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:8px; }',
  '.defCard { border:none; border-radius:18px; padding:12px 8px; font-family:inherit; cursor:pointer; background:#fff; border:3px solid #f0c95c; box-shadow:0 4px 0 #dfb63e; text-align:center; }',
  '.defCard:active { transform:translateY(2px); box-shadow:none; }',
  '.defCard.max { cursor:default; background:#f4ffe8; border-color:#9fd47a; box-shadow:0 4px 0 #86b968; }',
  '.defCard .di { font-size:34px; display:block; }',
  '.defCard .dn { font-size:15px; font-weight:bold; color:#7a5200; display:block; margin:4px 0 2px; }',
  '.defCard .dl { font-size:16px; letter-spacing:2px; display:block; }',
  '.defCard .de { font-size:12px; color:#8a6d00; display:block; margin-top:3px; line-height:1.3; min-height:28px; }',
  '#paDiffRow { display:none; gap:10px; justify-content:center; flex-wrap:wrap; margin:10px 0 4px; }',
  '#paDiffRow .hsq { border:none; border-radius:16px; padding:12px 16px; font-size:18px; font-weight:bold; cursor:pointer; font-family:inherit; background:#8c5cf0; color:#fff; box-shadow:0 4px 0 #5f36b8; }',
  '#paDiffRow .hsq:active { transform:translateY(2px); box-shadow:none; }',
  '#paDiffTit { width:100%; font-size:16px; font-weight:bold; color:#5a34b0; }',
  '#paShopMsg { min-height:24px; font-size:17px; font-weight:bold; margin-top:8px; color:#b06f00; }',
  '#paGo { margin-top:10px; }',
  /* domanda */
  '#paQ .card { max-width:min(1100px,96vw); }',
  '#paQReward { font-size:19px; font-weight:bold; color:#e8a013; margin-bottom:8px; }',
  '#paQText { font-size:clamp(29px,5.2vw,40px); color:#222; line-height:1.55; letter-spacing:.02em; word-spacing:.12em; margin-bottom:10px; }',
  '#paQAnswers { display:flex; flex-direction:column; gap:12px; }',
  '@media (min-width:760px){ #paQAnswers { display:grid; grid-template-columns:repeat(3,1fr); align-items:stretch; } #paQAnswers .ansBtn { display:flex; align-items:center; justify-content:center; } }',
  '#paQMsg { min-height:30px; font-size:22px; font-weight:bold; margin-top:12px; }',
  '#paQBack, #paEndMenu { margin-top:10px; background:none; border:none; color:#aaa; font-size:15px; cursor:pointer; font-family:inherit; text-decoration:underline; }',
  /* scheda curiosità */
  '#paCard .card { background:linear-gradient(180deg,#f4ffe8,#e2f6cd); border:4px solid #9fd47a; max-width:700px; }',
  '#paCardTit { font-size:clamp(22px,4.6vw,30px); color:#3f7a1e; margin:6px 0 10px; }',
  '#paCardTxt { font-size:clamp(21px,3.8vw,26px); line-height:1.65; letter-spacing:.02em; word-spacing:.1em; color:#3a4a2a; text-align:left; }',
  '#paCardEff { font-size:17px; font-weight:bold; color:#2e6b0e; background:#fff; border-radius:12px; padding:10px 12px; margin-top:12px; }',
  '#paCardRead { background:#eef2ff; border:2px solid #c5cffb; border-radius:12px; font-size:16px; padding:8px 16px; cursor:pointer; margin-top:12px; font-family:inherit; color:#2b3a8f; }',
  /* parole che scaldano */
  '#paWords { position:absolute; top:74px; left:50%; transform:translateX(-50%); z-index:9; display:none; text-align:center; max-width:96vw; }',
  '#paWordsTit { display:inline-flex; align-items:center; gap:8px; background:rgba(0,0,0,.6); color:#ffd23f; font-size:18px; font-weight:bold; padding:7px 16px; border-radius:16px; margin-bottom:8px; }',
  '#paWordsHear { background:none; border:none; font-size:20px; cursor:pointer; padding:0; }',
  '#paWordsRow { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }',
  '.paWordBtn { border:none; border-radius:18px; padding:14px 20px; font-size:clamp(22px,4.5vw,32px); font-weight:bold; letter-spacing:.04em; cursor:pointer; font-family:inherit; background:linear-gradient(180deg,#ffd35c,#f0a818); color:#5c3808; box-shadow:0 5px 0 #b97e08; transition:transform .1s; }',
  '.paWordBtn:active { transform:translateY(3px); box-shadow:none; }',
  '.paWordBtn.no { background:#e05555; color:#fff; box-shadow:0 5px 0 #9c3030; animation:shake .4s; opacity:.5; pointer-events:none; }',
  '.paWordBtn.si { background:#3cba54; color:#fff; box-shadow:0 5px 0 #27803a; animation:pop .4s; }'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- HTML ---------- */
  document.body.insertAdjacentHTML('beforeend',
  '<div id="pa">'+
    '<canvas id="paCv"></canvas>'+
    '<div id="paHud">'+
      '<div class="hudBox" id="paAtk">⚔️ 1/8</div>'+
      '<div class="hudBox" id="paHoney">🍯🍯🍯🍯🍯🍯</div>'+
      '<div class="hudBox" id="paDefIcons"></div>'+
      '<div class="hudBox" id="paScore">⭐ 0</div>'+
      '<div id="paBtns">'+
        '<button class="hudBtn" id="paOnda" title="Onda delle api">🌊</button>'+
        '<button class="hudBtn" id="paMusicBtn" title="Musica">🎵</button>'+
        '<button class="hudBtn" id="paHomeBtn" title="Menu">🏠</button>'+
      '</div>'+
    '</div>'+
    '<div id="paBig"></div>'+
    '<div id="paMsg"></div>'+
    '<div id="paWords">'+
      '<div id="paWordsTit"><span id="paWordsLab"></span><button id="paWordsHear">🔊</button></div>'+
      '<div id="paWordsRow"></div>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="paShop">'+
    '<div class="card">'+
      '<div style="font-size:44px">🐝🏛️</div>'+
      '<div id="paShopTitle"></div>'+
      '<div id="paShopSub"></div>'+
      '<div id="paStats"></div>'+
      '<div id="paDef"></div>'+
      '<div id="paDiffRow"><div id="paDiffTit"></div>'+
        '<button class="hsq" id="paQEasy"></button>'+
        '<button class="hsq" id="paQHard"></button>'+
        '<button class="hsq" id="paDiffNo" style="background:#bbb;box-shadow:0 4px 0 #999"></button>'+
      '</div>'+
      '<div id="paShopMsg"></div>'+
      '<button class="bigBtn" id="paGo"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="paQ">'+
    '<div class="card">'+
      '<div id="paQEmoji" style="font-size:44px">🐝</div>'+
      '<div id="paQTheme" style="font-size:15px;color:#999;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px"></div>'+
      '<div id="paQReward"></div>'+
      '<div id="paQText"></div>'+
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">'+
        '<button id="paQSpeak" class="jollyBtn"></button>'+
      '</div>'+
      '<div id="paQAnswers"></div>'+
      '<div id="paQMsg"></div>'+
      '<button id="paQBack"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="paCard">'+
    '<div class="card">'+
      '<div id="paCardEm" style="font-size:54px">📖</div>'+
      '<div id="paCardTit"></div>'+
      '<div id="paCardTxt"></div>'+
      '<div id="paCardEff"></div>'+
      '<button id="paCardRead">🔊 Leggimela</button>'+
      '<button class="bigBtn" id="paCardOk" style="display:block;margin:14px auto 0"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="paEnd">'+
    '<div class="card">'+
      '<div id="paEndEm" style="font-size:78px">🏆</div>'+
      '<div id="paEndTit" style="font-size:clamp(26px,6vw,40px);color:#e8a013;margin:10px 0"></div>'+
      '<div id="paEndTxt" style="font-size:20px;color:#555;margin-bottom:18px;line-height:1.5"></div>'+
      '<button class="bigBtn" id="paEndBtn"></button>'+
      '<div><button id="paEndMenu"></button></div>'+
    '</div>'+
  '</div>');
})();

/* ---------- Le difese VERE dell'alveare ---------- */
const PA_DIFESE=[
 {id:'ingresso', em:'🚪', nm:'Ingresso stretto',
  eff:['','I predoni fanno molta più fatica a rubare il miele','Rubare il miele è quasi impossibile: che fatica!'],
  card:"Le api scelgono case con l'ingresso piccolo. E quando c'è pericolo lo restringono ancora di più con la propoli, come un castello che alza il ponte levatoio! Il calabrone è troppo grosso per passare e deve restare fuori, dove le api possono difendersi meglio."},
 {id:'guardiane', em:'💂', nm:'Api guardiane',
  eff:['','2 guardiane rallentano i predoni','4 guardiane rallentano tantissimo i predoni'],
  card:"All'ingresso dell'alveare fanno la guardia delle api speciali: le GUARDIANE. Annusano chi arriva, perché ogni famiglia di api ha un odore tutto suo, come una parola d'ordine segreta. Chi non ha l'odore giusto viene affrontato e respinto!"},
 {id:'propoli', em:'🟤', nm:'Propoli',
  eff:['','+1 vasetto di miele riparato dopo ogni attacco','+2 vasetti di miele riparati dopo ogni attacco'],
  card:"Le api raccolgono la resina appiccicosa degli alberi e la trasformano in PROPOLI. La usano come cemento per riparare le crepe della casa e come disinfettante che ferma i germi. La conosciamo anche noi: le caramelle per la gola alla propoli vengono proprio dalle api!"},
 {id:'onda', em:'🌊', nm:"L'onda delle api",
  eff:['','1 onda per attacco: spaventa tutti i calabroni','2 onde per attacco: spaventa tutti i calabroni'],
  card:"Le api giganti dell'Asia fanno una mossa spettacolare: a migliaia sollevano la pancia una dopo l'altra, creando un'ONDA che corre su tutto il nido, come il pubblico allo stadio! I calabroni si confondono e non capiscono più dove attaccare."}
];
const PA_CARD_PALLA={em:'🔥', nm:'La palla di api',
  card:"Hai visto? È tutto vero! Quando un calabrone attacca, decine di api lo circondano e formano una PALLA. Poi fanno vibrare i muscoli del volo, come quando noi tremiamo dal freddo, e la palla diventa caldissima: 46 gradi! Il calabrone non resiste a tanto caldo. Le api sì: sopportano fino a 48 gradi. Due gradi di differenza salvano l'alveare!"};
const PA_FATTI=[
 "Un calabrone da solo può mangiare 30 api in un minuto: fermalo!",
 "Le api battono le ali 230 volte al secondo: per questo ronzano!",
 "L'esploratore lascia un odore (feromone) per chiamare gli altri: non farlo scappare!",
 "Le api della palla si danno il cambio: quelle stanche vanno a riposare.",
 "La regina non smette mai di deporre uova, anche durante un attacco."
];

/* ---------- Costanti di gioco ---------- */
const PA_HONEY=6, PA_ATTACKS=9, PA_NBEES=18;      /* il 9° attacco è la Vespa Regina */
const PA_BALL_MIN=7, PA_BALL_NEAR=38, PA_PTR_NEAR=100;
const PA_TSTART=30, PA_TCOOK=46;
const PA_PLAN=[[1,0],[1,1],[2,1],[1,2],[2,2],[2,3],[3,3],[3,4]]; /* [esploratori,predoni] */
const PA_REW_EASY=10, PA_REW_HARD=25;
const PA_WORD_HEAT=6, PA_WORD_HEAT_BOSS=5;        /* gradi per parola letta giusta */

/* ---------- Le parole che scaldano ----------
   La voce dice la parola: Gabriele deve LEGGERE le tre carte
   e toccare quella giusta. Parola giusta = le api vibrano più
   forte e la palla si scalda di colpo. La prima è sempre quella
   giusta, poi vengono mescolate. */
const PA_PAROLE=[
 /* livello 1: parole corte */
 [['VIBRA','VETRO','VOLPE'],['SCALDA','SCUOLA','SCATOLA'],['FORZA','FORMA','FORNO'],
  ['CALDO','CALMO','COLLA'],['APE','ALI','APRE'],['PALLA','PILA','PORTA'],
  ['MIELE','MELE','MOLE'],['FUOCO','FUMO','FIOCCO'],['DAI','DUE','DITO'],
  ['CALORE','COLORE','CANTARE']],
 /* livello 2: parole più lunghe e simili */
 [['VIBRATE','VOLATE','VOTATE'],['SCALDATE','SALTATE','SCAVATE'],['STRINGETE','SPINGETE','STENDETE'],
  ['CORAGGIO','CORALLO','CAVALLO'],['INSIEME','INVERNO','INSETTO'],['PIÙ FORTE','PIÙ PIANO','PIÙ LENTO'],
  ['CALABRONE','CALZONE','CAMPIONE'],['GUARDIANE','GIARDINO','GRANDINE'],['ALVEARE','ALTALENA','ANIMALE'],
  ['REGINA','ROVINA','RAPINA']],
 /* livello 3: frasi corte */
 [['SCALDATE LA PALLA','SALVATE LA PALLA','SCAVATE LA BUCA'],
  ['VIBRATE LE ALI','VOLATE VIA API','VIETATO ENTRARE'],
  ['TUTTE INTORNO','TUTTE IN CASA','TANTE INTERE'],
  ['DIFENDIAMO IL MIELE','DIPINGIAMO IL MELO','DIFENDIAMO IL MOLO'],
  ['IL CALABRONE SCOTTA','IL CALZONE SCOTTA','IL CALABRONE SALTA'],
  ['FORZA PICCOLE API','FORZA PICCOLE ALI','FUORI PICCOLE API']]
];

/* ---------- Stato ---------- */
let pa={on:false, raf:0, last:0, paused:true,
  atk:1, honey:PA_HONEY, marked:false, extraRaiders:0,
  bees:[], hornets:[], guards:[], fx:[], toSpawn:[], spawnT:0,
  inAttack:false, ondaLeft:0, cooked:0, tutorialShown:false,
  combo:0, shake:0, wordsRead:0, starsTot:0,
  atkHoney:0, atkEscapes:0, atkWords:0,
  ptr:{x:0,y:0,down:false}, lvl:{ingresso:0,guardiane:0,propoli:0,onda:0}};
let paWord={active:false, group:null, target:'', cool:1.5, lastIdx:-1};
let paQ={diff:'easy', q:null, theme:0, voiced:false, mult:1, done:false, defIdx:-1};
const paUsedQ=new Set();
let paDefSel=-1;
const paCv=$('paCv'), paC=paCv.getContext('2d');
let paW=0, paH=0, paMsgTid=0;

/* roundRect per i browser che non lo hanno */
if(typeof CanvasRenderingContext2D!=='undefined' && !CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    r=Math.min(r||0,Math.abs(w)/2,Math.abs(h)/2);
    this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r);
    this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this;
  };
}

function paResize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  paW=window.innerWidth; paH=window.innerHeight;
  paCv.width=Math.round(paW*dpr); paCv.height=Math.round(paH*dpr);
  paCv.style.width=paW+'px'; paCv.style.height=paH+'px';
  paC.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener('resize',()=>{ if($('pa').style.display!=='none') paResize(); });
const paHX=()=>paW/2, paHY=()=>paH-105;

function paMsgShow(t,ms){
  const el=$('paMsg'); el.textContent=t; el.style.display='block';
  clearTimeout(paMsgTid); paMsgTid=setTimeout(()=>{ el.style.display='none'; },ms||2600);
}
function paBig(t){
  const el=$('paBig'); el.textContent=t;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function paHud(){
  $('paAtk').textContent=(pa.atk>=PA_ATTACKS)?'👑 REGINA':('⚔️ '+pa.atk+'/'+PA_ATTACKS);
  $('paHoney').textContent='🍯'.repeat(pa.honey)+'▫️'.repeat(Math.max(0,PA_HONEY-pa.honey));
  $('paScore').textContent='⭐ '+score;
  $('paDefIcons').textContent=PA_DIFESE.map(d=>pa.lvl[d.id]?d.em+('•'.repeat(pa.lvl[d.id])):'').join(' ')||'🛡️ —';
  $('paMusicBtn').textContent=MUSICON?'🎵':'🔇';
  const o=$('paOnda');
  o.style.display=(pa.lvl.onda>0&&pa.inAttack)?'':'none';
  o.textContent='🌊'+(pa.ondaLeft>0?('x'+pa.ondaLeft):'');
  o.disabled=pa.ondaLeft<=0;
}

/* ---------- Api ---------- */
function paMakeBees(){
  pa.bees=[];
  for(let i=0;i<PA_NBEES;i++){
    pa.bees.push({x:paHX()+(Math.random()-0.5)*160, y:paHY()-60+(Math.random()-0.5)*80,
      vx:0, vy:0, en:75+Math.random()*25, st:'idle', ph:Math.random()*6.28, off:(Math.random()-0.5)});
  }
}
function paSteer(b,tx,ty,sp,dt){
  const dx=tx-b.x, dy=ty-b.y, d=Math.hypot(dx,dy)||1;
  b.vx+=(dx/d*sp-b.vx)*Math.min(1,dt*4);
  b.vy+=(dy/d*sp-b.vy)*Math.min(1,dt*4);
  b.x+=b.vx*dt; b.y+=b.vy*dt;
  return d;
}
/* il calabrone bersaglio della palla: il più vicino al dito */
function paBallTarget(){
  if(!pa.ptr.down) return null;
  let best=null, bd=PA_PTR_NEAR*PA_PTR_NEAR;
  for(const h of pa.hornets){
    if(h.st!=='fly'&&h.st!=='balled'&&h.st!=='steal'&&h.st!=='stun'&&h.st!=='home') continue;
    const d=(h.x-pa.ptr.x)**2+(h.y-pa.ptr.y)**2;
    if(d<bd){ bd=d; best=h; }
  }
  return best;
}
function paCountBall(h){ let n=0; for(const b of pa.bees) if(b.st==='ball'&&b.tg===h) n++; return n; }

/* ---------- Parole che scaldano ---------- */
function paWordTier(){ return pa.atk<=2?0:(pa.atk<=5?1:2); }
function paBalledHornet(){ for(const h of pa.hornets) if(h.st==='balled') return h; return null; }
function paWordNew(){
  const tier=PA_PAROLE[paWordTier()];
  let gi; do{ gi=Math.floor(Math.random()*tier.length); }while(gi===paWord.lastIdx&&tier.length>1);
  paWord.lastIdx=gi;
  const g=tier[gi];
  paWord.group=g; paWord.target=g[0]; paWord.active=true;
  $('paWordsLab').textContent=VOICEON?'Tocca la parola che senti!':'Tocca: '+g[0];
  $('paWordsHear').style.display=VOICEON?'':'none';
  const R=$('paWordsRow'); R.innerHTML='';
  shuffle(g.slice()).forEach(wd=>{
    const b=document.createElement('button');
    b.className='paWordBtn'; b.textContent=wd;
    b.onclick=()=>paWordPick(b,wd);
    R.appendChild(b);
  });
  $('paWords').style.display='block';
  if(VOICEON) speak(paWord.target);
  else setTimeout(()=>{ if(paWord.active) $('paWordsLab').textContent='Tocca la parola giusta!'; },1600);
}
function paWordHide(){ paWord.active=false; $('paWords').style.display='none'; }
function paWordPick(btn,wd){
  if(!paWord.active) return;
  const h=paBalledHornet();
  if(wd===paWord.target){
    btn.classList.add('si');
    const heat=(h&&h.kind==='boss')?PA_WORD_HEAT_BOSS:PA_WORD_HEAT;
    if(h){ h.temp+=heat; pa.fx.push({x:h.x,y:h.y-20,t:0,em:'🔥+'+heat+'°'}); }
    pa.wordsRead++; pa.atkWords++;
    sCorrect();
    paWord.active=false;
    paWord.cool=(h&&h.kind==='boss')?1.6:2.2;
    setTimeout(()=>{ if(!paWord.active) $('paWords').style.display='none'; },450);
  } else {
    btn.classList.add('no'); sWrong();
  }
}
$('paWordsHear').onclick=()=>{ if(paWord.target&&VOICEON) speak(paWord.target); };

/* ---------- Calabroni ---------- */
function paSpawnHornet(kind){
  const fromLeft=Math.random()<0.5;
  pa.hornets.push({kind, x:fromLeft?-50:paW+50, y:60+Math.random()*paH*0.3,
    vx:0, vy:0, st:'fly', t:0, ph:Math.random()*6.28, temp:PA_TSTART,
    grace:0, breaks:0, patrol:0, steal:0, stun:0, rot:0, honeyStolen:false});
}
function paAttackStart(){
  pa.atkHoney=0; pa.atkEscapes=0; pa.atkWords=0; pa.combo=0;
  paWordHide(); paWord.cool=1.5;
  pa.toSpawn=[];
  if(pa.atk>=PA_ATTACKS){
    /* l'ultimo attacco: la Vespa Regina con la sua scorta */
    pa.toSpawn=['boss','raider','raider'];
    for(let i=0;i<pa.extraRaiders;i++) pa.toSpawn.push('raider');
    pa.extraRaiders=0;
    paBig('👑 LA VESPA REGINA!');
    paMsgShow('👑 La Regina è enorme: servono TANTE parole per cuocerla… due volte!',5500);
  } else {
    const plan=PA_PLAN[Math.min(pa.atk-1,PA_PLAN.length-1)];
    let raiders=plan[1]+pa.extraRaiders;
    pa.extraRaiders=0;
    for(let i=0;i<plan[0];i++) pa.toSpawn.push('scout');
    for(let i=0;i<raiders;i++) pa.toSpawn.push('raider');
    shuffle(pa.toSpawn);
    paBig('⚔️ Attacco '+pa.atk+'!');
    if(pa.atk===1) paMsgShow('👀 Un calabrone ESPLORATORE! Tieni il dito su di lui e leggi le parole: la palla si scalda!',6000);
    else paMsgShow('💡 '+PA_FATTI[(pa.atk-1)%PA_FATTI.length],4000);
  }
  pa.spawnT=1.2;
  pa.inAttack=true; pa.paused=false; pa.last=0;
  pa.ondaLeft=pa.lvl.onda;
  paHud();
}
function paEscape(h,why){
  h.st='gone';
  pa.combo=0;
  if(h.kind==='scout'){
    pa.marked=true; pa.extraRaiders+=2; pa.atkEscapes++;
    sWrong();
    paMsgShow("😱 L'esploratore è scappato! Ha lasciato l'odore: arriveranno in tanti!",3500);
  } else if(why==='honey'){
    sLose();
    paMsgShow('Il predone è fuggito con un vasetto di miele! 🍯',2500);
  }
}
function paCook(h){
  h.st='cooked'; h.vy=-40; pa.cooked++;
  pa.combo++;
  const gain=(h.kind==='boss'?10:3)*Math.min(3,pa.combo);
  score+=gain; save();
  pa.shake=0.8;
  pa.fx.push({x:h.x,y:h.y,t:0,em:'🔥'});
  pa.fx.push({x:h.x,y:h.y-30,t:0,em:'46°!'});
  for(let k=0;k<5;k++) pa.fx.push({x:h.x+(Math.random()-0.5)*80,y:h.y+(Math.random()-0.5)*50,t:Math.random()*0.3,em:['🎉','⭐','✨'][k%3]});
  sCorrect();
  if(pa.combo>=2){ paBig('🔥 COMBO x'+Math.min(3,pa.combo)+'  +'+gain+'⭐'); beep(880,.1); beep(1175,.1,.1); beep(1568,.15,.2); }
  paMsgShow(h.kind==='boss'
    ?'👑 LA VESPA REGINA È COTTA! +'+gain+'⭐'
    :'🔥 46 gradi: calabrone cotto! +'+gain+'⭐  Le api resistono fino a 48! 💪',3000);
  paWordHide(); paWord.cool=1.5;
  paHud();
}

/* ---------- Aggiornamento ---------- */
function paUpdate(dt){
  const t=performance.now()/1000;
  /* arrivi scaglionati */
  if(pa.inAttack&&pa.toSpawn.length){
    pa.spawnT-=dt;
    if(pa.spawnT<=0){
      paSpawnHornet(pa.toSpawn.shift());
      pa.spawnT=Math.max(1.6,3.2-pa.atk*0.2);
    }
  }
  const BH=paBallTarget();
  const hx=paHX(), hy=paHY()-30;

  /* guardiane: rallentano il predone più vicino all'alveare */
  pa.guards.length=pa.lvl.guardiane*2;
  for(let g=0;g<pa.guards.length;g++){
    if(!pa.guards[g]) pa.guards[g]={x:hx+(g-1)*30,y:hy-20,ph:Math.random()*6.28};
  }

  for(let i=pa.hornets.length-1;i>=0;i--){
    const h=pa.hornets[i]; h.t+=dt;
    if(h.stun>0){ h.stun-=dt; h.x+=Math.sin(h.t*30)*1.5; if(h.stun<=0&&h.st==='stun') h.st='fly'; }
    const inBall=(h===BH)?paCountBall(h):0;

    if(h.st==='fly'||h.st==='steal'||h.st==='stun'){
      /* diventa "impallato"? */
      if(h===BH && inBall>=PA_BALL_MIN){ h.st='balled'; h.grace=0; }
    }

    if(h.st==='balled'){
      const ok=(h===BH)&&(inBall>=PA_BALL_MIN-2);
      if(ok){
        h.grace=0;
        /* da sola la palla scalda piano: sono le PAROLE lette a farla scottare! */
        const rate=Math.min(1.0, 0.35+0.06*Math.max(0,inBall-PA_BALL_MIN));
        h.temp+=rate*dt;
        /* si dibatte e trascina la palla */
        if(Math.random()<dt*0.55){ h.vx=(Math.random()-0.5)*260; h.vy=(Math.random()-0.5)*200; }
        h.vx*=(1-dt*2); h.vy*=(1-dt*2);
        h.x+=h.vx*dt; h.y+=h.vy*dt;
        h.x=Math.max(40,Math.min(paW-40,h.x)); h.y=Math.max(60,Math.min(paH-160,h.y));
        if(h.temp>=PA_TCOOK){
          if(h.kind==='boss'&&!h.phase2){
            /* prima cottura: la Regina si scrolla le api di dosso */
            h.phase2=true; h.temp=PA_TSTART; h.st='fly'; h.stun=0; h.breaks=0;
            h.vx=(Math.random()<0.5?-1:1)*400; h.vy=-200;
            pa.fx.push({x:h.x,y:h.y,t:0,em:'💢'});
            paMsgShow('👑 La Regina si è scrollata di dosso le api! Ancora una volta!',3200);
            paWordHide(); paWord.cool=1.2;
            sWrong();
          } else paCook(h);
          continue;
        }
      } else {
        h.grace+=dt; h.temp=Math.max(PA_TSTART,h.temp-5*dt);
        if(h.grace>1.3){
          h.st='fly'; h.breaks++; h.temp=PA_TSTART;
          h.vx=(Math.random()-0.5)*500; h.vy=-(150+Math.random()*150);
          pa.fx.push({x:h.x,y:h.y,t:0,em:'💨'});
          if(h.breaks>=3){
            if(h.kind==='boss'){ h.breaks=0; paMsgShow('👑 La Regina è furiosa!',1800); }
            else paEscape(h,'breaks');
          }
          else paMsgShow('Si è liberato! Riprova con più api! 🐝',1800);
        }
      }
    }
    else if(h.st==='fly'&&h.stun<=0){
      let sp=(h.kind==='scout')?62:(h.kind==='boss'?52:80);
      /* le guardiane rallentano i predoni (la Regina no: è troppo forte) */
      if(h.kind==='raider'&&pa.lvl.guardiane) sp*=(pa.lvl.guardiane>=2?0.4:0.6);
      if(h.kind==='scout'){
        /* l'esploratore gira intorno all'alveare e osserva */
        h.patrol+=dt;
        const a=h.ph+h.t*0.55;
        const tx=hx+Math.cos(a)*(190+40*Math.sin(h.t)), ty=hy-90+Math.sin(a*1.3)*70;
        const dx=tx-h.x, dy=ty-h.y, d=Math.hypot(dx,dy)||1;
        h.x+=dx/d*sp*dt; h.y+=dy/d*sp*dt; h.rot=Math.atan2(dy,dx);
        const limit=8+pa.atk*0.5;
        if(h.patrol>limit){ h.st='home'; paMsgShow('👀 Sta tornando a chiamare gli altri! Fermalo!',2000); }
      } else {
        /* il predone punta al miele */
        const dx=hx-h.x, dy=hy-h.y, d=Math.hypot(dx,dy)||1;
        h.x+=dx/d*sp*dt+Math.sin(h.t*5+h.ph)*30*dt;
        h.y+=dy/d*sp*dt;
        h.rot=Math.atan2(dy,dx);
        if(d<62){ h.st='steal'; h.steal=0; }
      }
    }
    else if(h.st==='steal'&&h.stun<=0){
      let need=[1.4,2.8,4.2][pa.lvl.ingresso];
      if(h.kind==='boss') need*=1.5;
      h.steal+=dt;
      h.x+=Math.sin(h.t*22)*0.8;
      if(h.steal>=need){
        h.honeyStolen=true;
        const stole=(h.kind==='boss')?2:1;
        pa.honey-=stole; pa.atkHoney+=stole; pa.combo=0; pa.shake=0.6;
        paHud(); sLose();
        pa.fx.push({x:h.x,y:h.y,t:0,em:'🍯'});
        if(pa.honey<=0){ paDefeat(); return; }
        if(h.kind==='boss'){ h.st='fly'; h.steal=0; h.y-=80; paMsgShow('👑 La Regina torna per altro miele!',2200); }
        else h.st='flee';
      }
    }
    else if(h.st==='home'){
      /* l'esploratore fugge verso l'alto: ultima occasione di prenderlo */
      h.y-=170*dt; h.x+=Math.sin(h.t*4)*70*dt; h.rot=-Math.PI/2;
      if(h===BH&&paCountBall(h)>=PA_BALL_MIN){ h.st='balled'; h.grace=0; }
      if(h.y<-60){ paEscape(h,'home'); }
    }
    else if(h.st==='flee'){
      h.y-=200*dt; h.x+=Math.sin(h.t*6)*60*dt;
      if(h.y<-60){ paEscape(h,h.honeyStolen?'honey':'flee'); }
    }
    else if(h.st==='cooked'){
      h.vy+=600*dt; h.y+=h.vy*dt; h.rot+=6*dt;
      if(h.y>paH+60) h.st='gone';
    }
    if(h.st==='gone') pa.hornets.splice(i,1);
  }

  /* api */
  for(const b of pa.bees){
    b.ph+=dt*6;
    if(b.st==='ball'){ b.en-=9*dt; if(b.en<12||!BH||b.tg!==BH||(BH.st!=='balled'&&BH.st!=='fly'&&BH.st!=='steal'&&BH.st!=='home')){ b.st=b.en<12?'rest':'go'; b.tg=null; } }
    if(b.en<12&&b.st!=='rest') b.st='rest';
    if(b.st==='rest'){
      const d=paSteer(b,paHX()+b.off*70,paHY()-20,180,dt);
      if(d<46){ b.en+=25*dt; if(b.en>=95){ b.en=100; b.st='idle'; } }
    }
    else if(pa.ptr.down&&BH){
      if(b.st!=='ball'){
        b.st='go';
        const d=paSteer(b,BH.x+b.off*30,BH.y+Math.sin(b.ph)*20,270,dt);
        if(d<PA_BALL_NEAR*(BH.kind==='boss'?1.8:1)){ b.st='ball'; b.tg=BH; }
      } else {
        /* orbita stretta intorno al calabrone: la palla! */
        const R=(BH.kind==='boss')?2:1;
        const idx=b.off*6.28+b.ph*0.7;
        b.x=BH.x+Math.cos(idx)*(16+8*Math.abs(b.off))*R;
        b.y=BH.y+Math.sin(idx)*(14+7*Math.abs(b.off))*R;
      }
    }
    else if(pa.ptr.down){
      b.st='go'; paSteer(b,pa.ptr.x+b.off*40,pa.ptr.y+Math.sin(b.ph)*24,250,dt);
    }
    else {
      b.st='idle';
      paSteer(b,paHX()+Math.cos(b.ph*0.5+b.off*6)*110,paHY()-70+Math.sin(b.ph*0.4+b.off*4)*55,70,dt);
    }
  }

  /* comandi di lettura mentre la palla è attiva */
  const bh=paBalledHornet();
  if(bh){
    if(!paWord.active){ paWord.cool-=dt; if(paWord.cool<=0) paWordNew(); }
  } else if(paWord.active){ paWordHide(); paWord.cool=1.2; }

  /* effetti */
  for(let i=pa.fx.length-1;i>=0;i--){ pa.fx[i].t+=dt; if(pa.fx[i].t>1) pa.fx.splice(i,1); }

  /* fine attacco */
  if(pa.inAttack&&!pa.toSpawn.length&&!pa.hornets.length){
    pa.inAttack=false; pa.paused=true;
    paWordHide();
    const rig=Math.min(PA_HONEY-pa.honey,pa.lvl.propoli);
    if(rig>0){ pa.honey+=rig; paMsgShow('🟤 La propoli ripara '+rig+' vasetto'+(rig>1?'i':'')+' di miele!',2500); }
    /* stelle dell'attacco: miele salvo / nessuna fuga / almeno 2 parole lette */
    let st=1;
    if(pa.atkHoney===0) st=2;
    if(st===2&&pa.atkEscapes===0&&pa.atkWords>=2) st=3;
    pa.starsTot+=st;
    sStar(); paHud();
    if(pa.atk>=PA_ATTACKS){ paVictory(); }
    else {
      pa.atk++;
      const stars='⭐'.repeat(st)+'☆'.repeat(3-st);
      if(!pa.tutorialShown){ pa.tutorialShown=true; paShowCard(PA_CARD_PALLA,-1,'shop'); }
      else paShop('⚔️ Attacco respinto! '+stars);
    }
  }
}

/* ---------- Disegno ---------- */
function paDrawHive(t){
  const c=paC, x=paHX(), y=paHY();
  const br=1+Math.sin(t*1.8)*0.012;            /* respiro pupazzoso */
  c.save(); c.translate(x,y);
  /* ombra */
  c.fillStyle='rgba(0,0,0,.15)';
  c.beginPath(); c.ellipse(0,58,95,15,0,0,6.29); c.fill();
  /* basamento di legno con zampette */
  c.fillStyle='#a8743c'; c.strokeStyle='#7a4a1c'; c.lineWidth=3;
  c.beginPath(); c.roundRect(-58,46,116,12,6); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(-46,56,10,14,3); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(36,56,10,14,3); c.fill(); c.stroke();
  c.save(); c.scale(1,br);
  /* cupola dorata a ciambelle, con bordo e riflesso */
  for(let i=0;i<6;i++){
    const w=70-i*9, yy=38-i*14;
    const g=c.createLinearGradient(0,yy-16,0,yy+16);
    g.addColorStop(0,(i%2)?'#ffd35c':'#f6bd3a');
    g.addColorStop(1,(i%2)?'#eda92a':'#d98f12');
    c.fillStyle=g; c.strokeStyle='#a86f10'; c.lineWidth=3;
    c.beginPath(); c.ellipse(0,yy,w,16,0,0,6.29); c.fill(); c.stroke();
    c.fillStyle='rgba(255,255,255,.35)';
    c.beginPath(); c.ellipse(-w*0.4,yy-6,w*0.28,4.5,-0.25,0,6.29); c.fill();
  }
  /* cupoletta in cima con pomello */
  c.fillStyle='#f6bd3a'; c.strokeStyle='#a86f10'; c.lineWidth=3;
  c.beginPath(); c.arc(0,-38,12,Math.PI,0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#ffe28a'; c.beginPath(); c.arc(0,-44,4,0,6.29); c.fill();
  c.restore();
  /* ingresso: si restringe con la difesa */
  const r=[14,10,7][pa.lvl.ingresso];
  c.fillStyle='#5c3808';
  c.beginPath(); c.arc(0,48,r,Math.PI,0,false); c.fill();
  c.strokeStyle='#a86f10'; c.lineWidth=3;
  c.beginPath(); c.arc(0,48,r,Math.PI,0,false); c.stroke();
  if(pa.lvl.ingresso){ /* mattoncini di propoli ai lati */
    c.fillStyle='#8a5a2a'; c.strokeStyle='#6b4520'; c.lineWidth=2;
    c.beginPath(); c.roundRect(-r-11,40,9,8,2); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(r+2,40,9,8,2); c.fill(); c.stroke();
  }
  /* goccia di miele che cola */
  c.fillStyle='#f6a71b';
  c.beginPath(); c.ellipse(r+5,50+Math.sin(t*2)*1.5,3,4.5,0,0,6.29); c.fill();
  /* cartello del miele */
  c.fillStyle='#a8743c'; c.strokeStyle='#7a4a1c'; c.lineWidth=2.5;
  c.beginPath(); c.roundRect(74,26,5,32,2); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(57,8,42,24,7); c.fill(); c.stroke();
  c.font='16px serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText('🍯',78,20);
  c.restore();
}
function paDrawBee(b,t,guard){
  const c=paC;
  /* verso di volo: il musetto guarda dove va */
  const mx=b.x-(b._lx===undefined?b.x:b._lx), my=b.y-(b._ly===undefined?b.y:b._ly);
  if(Math.abs(mx)+Math.abs(my)>0.6) b._rot=Math.atan2(my,mx);
  b._lx=b.x; b._ly=b.y;
  const dir=(Math.cos(b._rot||0)<0)?-1:1;
  const s=guard?1.35:1.12, tired=(b.en!==undefined&&b.en<35)&&!guard;
  c.save(); c.translate(b.x,b.y); c.scale(dir*s,s);
  /* ali che sbattono */
  const wa=Math.sin((b.ph||t*40))*(tired?0.35:0.7);
  c.fillStyle='rgba(220,238,255,.8)'; c.strokeStyle='rgba(120,170,220,.8)'; c.lineWidth=1.2;
  c.save(); c.translate(-2,-6); c.rotate(-0.5+wa*0.5);
  c.beginPath(); c.ellipse(0,-4,3.6,7,0,0,6.29); c.fill(); c.stroke(); c.restore();
  c.save(); c.translate(2,-6); c.rotate(0.2+wa*0.5);
  c.beginPath(); c.ellipse(0,-4,3.2,6,0,0,6.29); c.fill(); c.stroke(); c.restore();
  /* pancino a strisce */
  c.save();
  c.beginPath(); c.ellipse(-2,0,8.5,6,0,0,6.29); c.clip();
  c.fillStyle=tired?'#d9b64a':'#ffd23f'; c.fillRect(-11,-7,22,14);
  c.fillStyle='#4a3208';
  c.fillRect(-6,-7,3.4,14); c.fillRect(-0.5,-7,3.4,14);
  c.restore();
  c.strokeStyle='#4a3208'; c.lineWidth=1.6;
  c.beginPath(); c.ellipse(-2,0,8.5,6,0,0,6.29); c.stroke();
  /* pungiglioncino */
  c.fillStyle='#4a3208';
  c.beginPath(); c.moveTo(-10,-1.5); c.lineTo(-13.5,0); c.lineTo(-10,1.5); c.closePath(); c.fill();
  /* testolina */
  c.fillStyle=tired?'#d9b64a':'#ffd23f';
  c.beginPath(); c.arc(7,-1,5,0,6.29); c.fill();
  c.strokeStyle='#4a3208'; c.beginPath(); c.arc(7,-1,5,0,6.29); c.stroke();
  /* antenne con pallina */
  c.lineWidth=1.3;
  c.beginPath(); c.moveTo(5.5,-5.5); c.quadraticCurveTo(5,-9,3,-10); c.stroke();
  c.beginPath(); c.moveTo(8.5,-5.5); c.quadraticCurveTo(9,-9,11,-10); c.stroke();
  c.fillStyle='#4a3208';
  c.beginPath(); c.arc(3,-10,1.1,0,6.29); c.fill();
  c.beginPath(); c.arc(11,-10,1.1,0,6.29); c.fill();
  /* occhioni (o palpebre stanche) e sorriso */
  c.fillStyle='#222';
  if(tired){ c.fillRect(4.8,-2.6,2.8,1.3); c.fillRect(8.4,-2.6,2.8,1.3); }
  else {
    c.beginPath(); c.arc(6.2,-2,1.5,0,6.29); c.fill();
    c.beginPath(); c.arc(9.4,-2,1.5,0,6.29); c.fill();
    c.fillStyle='#fff';
    c.beginPath(); c.arc(6.7,-2.5,0.55,0,6.29); c.fill();
    c.beginPath(); c.arc(9.9,-2.5,0.55,0,6.29); c.fill();
  }
  c.strokeStyle='#222'; c.lineWidth=1;
  c.beginPath(); c.arc(7.8,0.6,1.8,0.15,Math.PI-0.4); c.stroke();
  /* guanciotte rosa */
  c.fillStyle='rgba(255,120,120,.5)';
  c.beginPath(); c.arc(4.4,0.6,1.1,0,6.29); c.fill();
  c.beginPath(); c.arc(11,0.6,1.1,0,6.29); c.fill();
  /* berretto rosso della guardiana */
  if(guard){
    c.fillStyle='#e05555'; c.strokeStyle='#a33333'; c.lineWidth=1.4;
    c.beginPath(); c.arc(7,-4.6,4.4,Math.PI,0); c.closePath(); c.fill(); c.stroke();
    c.fillRect(2.2,-5.6,9.6,1.8);
  }
  c.restore();
}
function paDrawHornet(h,t){
  const c=paC;
  const cooked=h.st==='cooked', balled=h.st==='balled';
  c.save(); c.translate(h.x,h.y); c.rotate(cooked?h.rot:(h.rot||0));
  if(h.kind==='boss') c.scale(1.9,1.9);
  /* zampette penzoloni */
  c.strokeStyle='#3a2405'; c.lineWidth=2; c.lineCap='round';
  for(const lx of [-8,0,8]){
    c.beginPath(); c.moveTo(lx,8);
    c.quadraticCurveTo(lx-2,13,lx-5,15+Math.sin(t*20+lx)*1.5); c.stroke();
  }
  /* ali */
  const fl=Math.sin(t*42+h.ph)*(cooked?0.1:0.5);
  c.fillStyle='rgba(205,228,255,.75)'; c.strokeStyle='rgba(120,160,210,.7)'; c.lineWidth=1.4;
  c.beginPath(); c.ellipse(-2,-14,7,13+fl*4,-0.4,0,6.29); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(6,-14,7,13-fl*4,0.4,0,6.29); c.fill(); c.stroke();
  /* addome a strisce, con bordo */
  c.save();
  c.beginPath(); c.ellipse(-4,0,19,11.5,0,0,6.29); c.clip();
  c.fillStyle=cooked?'#8a5a2a':'#e88b1a'; c.fillRect(-23,-12,46,24);
  c.fillStyle='#3a2405';
  for(const sx of [-14,-5,4]) c.fillRect(sx,-12,5.5,24);
  c.restore();
  c.strokeStyle='#3a2405'; c.lineWidth=2.2;
  c.beginPath(); c.ellipse(-4,0,19,11.5,0,0,6.29); c.stroke();
  /* pungiglione */
  c.fillStyle='#3a2405';
  c.beginPath(); c.moveTo(-22,-3); c.lineTo(-33,0); c.lineTo(-22,3); c.closePath(); c.fill();
  /* testona */
  c.fillStyle=cooked?'#9c7a4a':'#c96a10';
  c.beginPath(); c.arc(20,0,10.5,0,6.29); c.fill();
  c.strokeStyle='#3a2405'; c.beginPath(); c.arc(20,0,10.5,0,6.29); c.stroke();
  /* antenne */
  c.lineWidth=2;
  c.beginPath(); c.moveTo(24,-9); c.quadraticCurveTo(28,-15,32,-16); c.stroke();
  c.beginPath(); c.moveTo(19,-10); c.quadraticCurveTo(20,-17,24,-19); c.stroke();
  if(cooked){
    /* occhi a X e linguetta di fuori */
    c.strokeStyle='#222'; c.lineWidth=1.8;
    for(const ex of [16.5,24]){
      c.beginPath(); c.moveTo(ex-2,-4.5); c.lineTo(ex+2,-0.5);
      c.moveTo(ex+2,-4.5); c.lineTo(ex-2,-0.5); c.stroke();
    }
    c.fillStyle='#ff8a9a'; c.beginPath(); c.ellipse(21,5.5,2.5,3.5,0,0,6.29); c.fill();
  } else {
    /* occhioni bianchi con pupilla rossa */
    c.fillStyle='#fff';
    c.beginPath(); c.ellipse(16.5,-2.5,3.4,4,0,0,6.29); c.fill();
    c.beginPath(); c.ellipse(24,-2.5,3.4,4,0,0,6.29); c.fill();
    c.fillStyle='#e33333';
    c.beginPath(); c.arc(17,-2,1.7,0,6.29); c.fill();
    c.beginPath(); c.arc(24.5,-2,1.7,0,6.29); c.fill();
    c.strokeStyle='#3a2405'; c.lineWidth=2.4;
    if(balled){
      /* nella palla: preoccupato, bocca a "o" e sudore */
      c.beginPath(); c.moveTo(13,-9); c.lineTo(19,-7); c.stroke();
      c.beginPath(); c.moveTo(28,-9); c.lineTo(22,-7); c.stroke();
      c.fillStyle='#3a2405'; c.beginPath(); c.arc(20.5,4.5,2,0,6.29); c.fill();
      c.fillStyle='#7ec8f0';
      c.beginPath(); c.ellipse(29+Math.sin(t*10)*2,-11,2,3,0,0,6.29); c.fill();
    } else {
      /* cattivello: sopracciglia in giù e sorrisetto con dentini */
      c.beginPath(); c.moveTo(13,-8); c.lineTo(19.5,-5.2); c.stroke();
      c.beginPath(); c.moveTo(28,-8); c.lineTo(21.5,-5.2); c.stroke();
      c.strokeStyle='#222'; c.lineWidth=1.6;
      c.beginPath(); c.arc(20.5,3,3.6,0.3,Math.PI-0.3); c.stroke();
      c.fillStyle='#fff';
      c.beginPath(); c.moveTo(17.6,4.8); c.lineTo(18.8,7.2); c.lineTo(20,4.9); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(21,4.9); c.lineTo(22.2,7.2); c.lineTo(23.4,4.8); c.closePath(); c.fill();
    }
  }
  c.restore();
  /* etichette sopra */
  c.textAlign='center'; c.textBaseline='middle';
  if(h.kind==='boss'&&!cooked){ c.font='28px serif'; c.fillText('👑',h.x,h.y-(balled?92:60)); }
  if(h.kind==='scout'&&(h.st==='fly'||h.st==='home')){ c.font='20px serif'; c.fillText('👀',h.x,h.y-34); }
  if(h.st==='steal'){ c.font='20px serif'; c.fillText('🍯❗',h.x,h.y-34); }
  if(h.honeyStolen&&h.st==='flee'){ c.font='20px serif'; c.fillText('🍯',h.x,h.y-30); }
  if(h.stun>0){ c.font='18px serif'; c.fillText('✨💫',h.x,h.y-34); }
  /* termometro della palla */
  if(h.st==='balled'){
    const fr=(h.temp-PA_TSTART)/(PA_TCOOK-PA_TSTART);
    const gr=(h.kind==='boss')?80:44;
    /* alone di calore */
    const g=paC.createRadialGradient(h.x,h.y,4,h.x,h.y,gr);
    g.addColorStop(0,'rgba(255,'+Math.round(160-fr*120)+',30,'+(0.15+fr*0.4)+')');
    g.addColorStop(1,'rgba(255,120,0,0)');
    c.fillStyle=g; c.beginPath(); c.arc(h.x,h.y,gr,0,6.29); c.fill();
    const bw=(h.kind==='boss')?90:64, bx=h.x-bw/2, by=h.y-((h.kind==='boss')?96:52);
    c.fillStyle='rgba(255,255,255,.85)'; c.fillRect(bx-2,by-2,bw+4,12);
    c.fillStyle=fr<0.6?'#ffb300':'#ff5722';
    c.fillRect(bx,by,bw*Math.min(1,fr),8);
    c.fillStyle='#333'; c.font='bold 13px sans-serif';
    c.fillText(Math.round(h.temp)+'°',h.x,by-10);
  }
}
function paDraw(t){
  const c=paC; c.clearRect(0,0,paW,paH);
  c.save();
  if(pa.shake>0){
    c.translate((Math.random()-0.5)*10*pa.shake,(Math.random()-0.5)*8*pa.shake);
    pa.shake=Math.max(0,pa.shake-0.03);
  }
  c.textAlign='center'; c.textBaseline='middle';
  /* sole con raggi che girano piano */
  const sx=paW-70, sy=64;
  c.save(); c.translate(sx,sy); c.rotate(t*0.15);
  c.strokeStyle='rgba(255,214,64,.85)'; c.lineWidth=4; c.lineCap='round';
  for(let r=0;r<10;r++){
    const a=r*Math.PI/5;
    c.beginPath(); c.moveTo(Math.cos(a)*34,Math.sin(a)*34); c.lineTo(Math.cos(a)*46,Math.sin(a)*46); c.stroke();
  }
  c.restore();
  c.fillStyle='#ffd93d'; c.beginPath(); c.arc(sx,sy,27,0,6.29); c.fill();
  c.fillStyle='rgba(255,255,255,.5)'; c.beginPath(); c.arc(sx-9,sy-9,7,0,6.29); c.fill();
  /* nuvole che passano */
  for(let k=0;k<3;k++){
    const cx=((t*(8+k*4)+k*300)%(paW+260))-130, cy=48+k*50;
    c.fillStyle='rgba(255,255,255,'+(0.9-k*0.18)+')';
    c.beginPath(); c.ellipse(cx,cy,44,16,0,0,6.29); c.fill();
    c.beginPath(); c.ellipse(cx+30,cy-9,28,13,0,0,6.29); c.fill();
    c.beginPath(); c.ellipse(cx-28,cy-7,24,11,0,0,6.29); c.fill();
  }
  /* colline morbide */
  c.fillStyle='#9ad46e';
  c.beginPath(); c.ellipse(paW*0.18,paH*0.86,paW*0.38,paH*0.15,0,Math.PI,6.29); c.fill();
  c.fillStyle='#8cc95f';
  c.beginPath(); c.ellipse(paW*0.84,paH*0.88,paW*0.4,paH*0.17,0,Math.PI,6.29); c.fill();
  /* albero con le mele (ondeggia col vento) */
  const tx=Math.max(70,paW*0.1), ty=paH-58, sway=Math.sin(t*0.8)*3;
  c.fillStyle='#8a5a2a'; c.strokeStyle='#6b4520'; c.lineWidth=3;
  c.beginPath(); c.roundRect(tx-8,ty-95,16,95,6); c.fill(); c.stroke();
  c.fillStyle='#5da13f';
  c.beginPath(); c.arc(tx-26+sway,ty-106,26,0,6.29); c.fill();
  c.beginPath(); c.arc(tx+26+sway,ty-106,26,0,6.29); c.fill();
  c.beginPath(); c.arc(tx+sway,ty-130,30,0,6.29); c.fill();
  c.fillStyle='#7cc061';
  c.beginPath(); c.arc(tx-12+sway,ty-118,18,0,6.29); c.fill();
  c.beginPath(); c.arc(tx+18+sway,ty-112,16,0,6.29); c.fill();
  c.fillStyle='#e05555';
  for(const [ax,ay] of [[-22,-102],[6,-124],[24,-98],[-4,-96]]){
    c.beginPath(); c.arc(tx+ax+sway,ty+ay,3.5,0,6.29); c.fill();
  }
  /* staccionata */
  c.fillStyle='#c98d4e'; c.strokeStyle='#9c6b35'; c.lineWidth=2;
  for(let k=0;k<4;k++){
    c.beginPath(); c.roundRect(paW-150+k*34,paH-92,10,52,4); c.fill(); c.stroke();
  }
  c.beginPath(); c.roundRect(paW-158,paH-82,130,8,4); c.fill(); c.stroke();
  c.beginPath(); c.roundRect(paW-158,paH-60,130,8,4); c.fill(); c.stroke();
  /* fiori con gambo che ondeggiano */
  for(let k=0;k<9;k++){
    const fx=(((k*137+40)%100)/100)*paW, fy=paH-14-((k*61)%38);
    const sw=Math.sin(t*1.5+k)*3;
    c.strokeStyle='#3f7a1e'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(fx,fy+8); c.quadraticCurveTo(fx+sw*0.5,fy-6,fx+sw,fy-16); c.stroke();
    c.fillStyle='#5da13f';
    c.beginPath(); c.ellipse(fx+3,fy-2,4,2,0.6,0,6.29); c.fill();
    c.font='22px serif';
    c.fillText(['🌼','🌷','🌻','🌸','🌺'][k%5],fx+sw,fy-24);
  }
  /* ciuffi d'erba */
  c.strokeStyle='#4f9032'; c.lineWidth=2;
  for(let k=0;k<12;k++){
    const gx=(((k*89+15)%100)/100)*paW, gy=paH-6;
    for(const dg of [-4,0,4]){
      c.beginPath(); c.moveTo(gx,gy); c.quadraticCurveTo(gx+dg,gy-8,gx+dg*1.8,gy-14); c.stroke();
    }
  }
  /* farfalle e coccinella */
  c.font='20px serif';
  for(let k=0;k<2;k++){
    const bx=paW*(0.3+k*0.4)+Math.sin(t*0.7+k*3)*90, by=paH*0.35+Math.cos(t*0.9+k)*50;
    c.fillText('🦋',bx,by);
  }
  const lbx=((t*14)%(paW+60))-30;
  c.font='16px serif'; c.fillText('🐞',lbx,paH-8);
  paDrawHive(t);
  /* guardiane di pattuglia */
  for(let g=0;g<pa.guards.length;g++){
    const gd=pa.guards[g];
    /* la guardiana insegue il predone più vicino */
    let tgt=null,bd=1e9;
    for(const h of pa.hornets){ if(h.kind==='raider'&&(h.st==='fly'||h.st==='steal')){ const d=(h.x-gd.x)**2+(h.y-gd.y)**2; if(d<bd){bd=d;tgt=h;} } }
    const tx=tgt?tgt.x+Math.cos(t*3+g)*26:paHX()+(g-pa.guards.length/2)*34;
    const ty=tgt?tgt.y+Math.sin(t*3+g)*22:paHY()-70;
    gd.x+=(tx-gd.x)*0.05; gd.y+=(ty-gd.y)*0.05;
    paDrawBee(gd,t,true);
  }
  for(const b of pa.bees) paDrawBee(b,t,false);
  for(const h of pa.hornets) paDrawHornet(h,t);
  /* cerchio del dito */
  if(pa.ptr.down){
    c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=3;
    c.beginPath(); c.arc(pa.ptr.x,pa.ptr.y,26+Math.sin(t*8)*4,0,6.29); c.stroke();
  }
  c.font='30px serif';
  for(const f of pa.fx){
    c.globalAlpha=Math.max(0,1-f.t);
    c.fillText(f.em,f.x,f.y-f.t*55);
    c.globalAlpha=1;
  }
  c.restore();
}
function paFrame(ts){
  pa.raf=requestAnimationFrame(paFrame);
  if(!pa.last) pa.last=ts;
  const dt=Math.min((ts-pa.last)/1000,0.05); pa.last=ts;
  if(!pa.paused) paUpdate(dt);
  paDraw(performance.now()/1000);
}

/* ---------- Controlli ---------- */
paCv.addEventListener('pointerdown',e=>{
  const r=paCv.getBoundingClientRect();
  pa.ptr.x=e.clientX-r.left; pa.ptr.y=e.clientY-r.top; pa.ptr.down=true;
});
paCv.addEventListener('pointermove',e=>{
  if(!pa.ptr.down) return;
  const r=paCv.getBoundingClientRect();
  pa.ptr.x=e.clientX-r.left; pa.ptr.y=e.clientY-r.top;
});
addEventListener('pointerup',()=>{ pa.ptr.down=false; });
addEventListener('pointercancel',()=>{ pa.ptr.down=false; });

$('paOnda').onclick=()=>{
  if(pa.ondaLeft<=0||!pa.inAttack) return;
  pa.ondaLeft--;
  for(const h of pa.hornets){
    if(h.st==='fly'||h.st==='steal'||h.st==='balled'){ h.stun=3; if(h.st==='steal') h.st='fly'; h.y-=40; }
  }
  for(let k=0;k<10;k++) pa.fx.push({x:paHX()+(Math.random()-0.5)*300,y:paHY()-80-Math.random()*120,t:Math.random()*0.3,em:'🌊'});
  beep(300,.3,0,'sine',.2); beep(400,.3,.15,'sine',.2); beep(500,.3,.3,'sine',.2);
  paMsgShow("🌊 L'onda delle api! I calabroni sono confusi!",2200);
  paHud();
};

/* ---------- Consiglio dell'Alveare ---------- */
function paShop(msg){
  pa.paused=true; paDefSel=-1;
  $('paShopTitle').textContent="Il Consiglio dell'Alveare";
  $('paShopSub').textContent='Rispondi alle domande per imparare le difese vere delle api. Ogni difesa ti aiuta nel prossimo attacco!';
  $('paStats').innerHTML=
    '<span class="statChip">⭐ '+score+'</span>'+
    '<span class="statChip">🍯 '+pa.honey+'/'+PA_HONEY+'</span>'+
    '<span class="statChip">⚔️ prossimo: attacco '+pa.atk+'/'+PA_ATTACKS+'</span>'+
    (pa.marked?'<span class="statChip" style="background:#ffe0e0;border-color:#ffb3b3;color:#a33">⚠️ alveare marcato!</span>':'');
  const D=$('paDef'); D.innerHTML='';
  PA_DIFESE.forEach((d,k)=>{
    const lv=pa.lvl[d.id];
    const b=document.createElement('button');
    b.className='defCard'+(lv>=2?' max':'');
    b.innerHTML='<span class="di">'+d.em+'</span><span class="dn">'+d.nm+'</span>'+
      '<span class="dl">'+(lv>=1?'⭐':'☆')+(lv>=2?'⭐':'☆')+'</span>'+
      '<span class="de">'+(lv?d.eff[lv]:'❓ Rispondi per sbloccarla')+'</span>';
    if(lv<2) b.onclick=()=>paChooseDef(k);
    D.appendChild(b);
  });
  $('paDiffRow').style.display='none';
  $('paShopMsg').textContent=msg||'';
  $('paGo').textContent=pa.inAttack?'▶️ Torna a difendere!'
    :(pa.atk>=PA_ATTACKS?'👑 Sfida la Vespa Regina!':('▶️ Via all\'attacco '+pa.atk+'!'));
  paWordHide();
  $('paShop').style.display='flex';
}
function paChooseDef(k){
  paDefSel=k;
  const d=PA_DIFESE[k], lv=pa.lvl[d.id];
  $('paDiffTit').textContent=d.em+' '+d.nm+(lv?' (potenziamento)':'')+' — scegli la domanda:';
  $('paQEasy').textContent='❓ Facile +'+PA_REW_EASY+' ⭐';
  $('paQHard').textContent='❓❓ Difficile +'+PA_REW_HARD+' ⭐';
  $('paDiffNo').textContent='annulla';
  $('paDiffRow').style.display='flex';
}
$('paDiffNo').onclick=()=>{ paDefSel=-1; $('paDiffRow').style.display='none'; };
$('paQEasy').onclick=()=>{ if(paDefSel>=0) paQShow('easy',paDefSel); };
$('paQHard').onclick=()=>{ if(paDefSel>=0) paQShow('hard',paDefSel); };
$('paGo').onclick=()=>{
  stopSpeak();
  $('paShop').style.display='none';
  if(pa.inAttack){ pa.paused=false; pa.last=0; }
  else paAttackStart();
};

/* ---------- Domanda ---------- */
function paQPick(diff){
  /* prima le domande del tema Api, poi tutte le altre */
  const pools=[];
  THEMES.forEach((t,k)=>{
    const bee=/api/i.test(t.name[0])?0:1;
    (t[diff]||[]).forEach(q=>pools.push({q,theme:k,bee}));
  });
  pools.sort((a,b)=>a.bee-b.bee);
  let cand=pools.filter(p=>!paUsedQ.has(p.q));
  if(!cand.length){ paUsedQ.clear(); cand=pools; }
  const beeCand=cand.filter(p=>p.bee===0);
  const pick=(beeCand.length?beeCand:cand);
  return pick[Math.floor(Math.random()*Math.min(pick.length,6))];
}
function paQReward(){
  const base=(paQ.diff==='easy')?PA_REW_EASY:PA_REW_HARD;
  return Math.max(2,Math.round(base*paQ.mult*(paQ.voiced?0.5:1)));
}
function paQRewardTxt(){
  const half=paQ.voiced||paQ.mult<1;
  $('paQReward').textContent='Premio: +'+paQReward()+' ⭐'+(half?' (dimezzato: lettura 🔊 o errore)':'');
}
function paQShow(diff,defIdx){
  const pick=paQPick(diff); if(!pick) return;
  paQ={diff, q:pick.q, theme:pick.theme, voiced:false, mult:1, done:false, defIdx};
  paUsedQ.add(pick.q);
  const i=LI(), t=THEMES[pick.theme];
  $('paShop').style.display='none';
  $('paQEmoji').textContent=t.emoji;
  $('paQTheme').textContent=t.name[i];
  paQRewardTxt();
  $('paQText').textContent=pick.q.q[i];
  $('paQSpeak').textContent='🔊 Leggimela (premio dimezzato)';
  $('paQSpeak').style.display=VOICEON?'':'none';
  $('paQMsg').textContent='';
  $('paQBack').textContent='torna al consiglio';
  const A=$('paQAnswers'); A.innerHTML='';
  shuffle([[pick.q.ok[i],true],[pick.q.no[0][i],false],[pick.q.no[1][i],false]]).forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0]; b.dataset.right=o[1]?'1':'0';
    b.onclick=()=>paQAnswer(b,o[1]);
    A.appendChild(b);
  });
  $('paQ').style.display='flex';
}
function paQAnswer(btn,right){
  if(paQ.done) return;
  stopSpeak();
  const i=LI();
  if(right){
    paQ.done=true;
    document.querySelectorAll('#paQAnswers .ansBtn').forEach(b=>{ b.disabled=true; b.style.pointerEvents='none'; });
    btn.classList.add('right'); sCorrect();
    const g=paQReward(); score+=g; save();
    const praise=NM(UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)]);
    $('paQMsg').textContent=praise+'  +'+g+' ⭐'; $('paQMsg').style.color='#3cba54';
    speak(praise);
    const d=PA_DIFESE[paQ.defIdx];
    pa.lvl[d.id]=Math.min(2,pa.lvl[d.id]+1);
    paHud();
    setTimeout(()=>{
      $('paQ').style.display='none';
      paShowCard(d,pa.lvl[d.id],'shop');
    },1400);
  } else {
    btn.classList.add('wrong'); btn.disabled=true; sWrong();
    paQ.mult*=0.5; paQRewardTxt();
    $('paQMsg').textContent=UI.wrong[i]; $('paQMsg').style.color='#e05555';
  }
}
$('paQSpeak').onclick=async()=>{
  if(!paQ.q||paQ.done) return;
  if(!paQ.voiced){ paQ.voiced=true; paQRewardTxt(); }
  $('paQSpeak').textContent='🔊 sto leggendo…';
  const i=LI();
  const btns=[...document.querySelectorAll('#paQAnswers .ansBtn:not(:disabled)')];
  await speak([
    {t:paQ.q.q[i], el:$('paQText')},
    'Le risposte sono:',
    ...btns.map(b=>({t:b.textContent, el:b, block:true}))
  ]);
  $('paQSpeak').textContent='🔊 Leggimela (premio dimezzato)';
};
$('paQBack').onclick=()=>{ stopSpeak(); $('paQ').style.display='none'; paShop(); };

/* ---------- Scheda curiosità ---------- */
let paCardNext='shop';
function paShowCard(d,lv,next){
  paCardNext=next;
  $('paCardEm').textContent=d.em;
  $('paCardTit').textContent=(lv===2?'⭐⭐ ':'')+ (d.nm||'')  ;
  $('paCardTxt').textContent=d.card;
  $('paCardEff').textContent=(lv>0&&d.eff)?('Nel gioco: '+d.eff[lv]):'';
  $('paCardEff').style.display=(lv>0&&d.eff)?'':'none';
  $('paCardRead').style.display=VOICEON?'':'none';
  $('paCardOk').textContent='➡️ Avanti';
  $('paCard').style.display='flex';
  /* lettura automatica gratuita della prima frase */
  if(VOICEON){
    const first=String(d.card).split(/(?<=[.!?])\s/)[0];
    speak([{t:first, el:$('paCardTxt')}]);
  }
}
$('paCardRead').onclick=()=>{ speak([{t:$('paCardTxt').textContent, el:$('paCardTxt')}]); };
$('paCardOk').onclick=()=>{
  stopSpeak();
  $('paCard').style.display='none';
  if(paCardNext==='shop') paShop();
};

/* ---------- Vittoria / sconfitta ---------- */
function paVictory(){
  pa.paused=true; stopMusic(); fanfare(); confetti(); paWordHide();
  const i=LI();
  const defs=PA_DIFESE.filter(d=>pa.lvl[d.id]>0).map(d=>d.em+' '+d.nm).join(' · ');
  $('paEndEm').textContent='🏆';
  $('paEndTit').textContent='ALVEARE SALVO! 👑'; $('paEndTit').style.color='#e8a013';
  $('paEndTxt').innerHTML='Hai sconfitto la Vespa Regina, proprio come fanno le api vere! 🐝❤️<br>'+
    '🔥 Calabroni cotti: '+pa.cooked+' · 📖 Parole lette: '+pa.wordsRead+' · ⭐ Stelle: '+pa.starsTot+'/'+(PA_ATTACKS*3)+
    (defs?('<br>Difese imparate: '+defs):'')+'<br>⭐ Punti: '+score;
  $('paEndBtn').textContent='🔁 Gioca ancora';
  $('paEndMenu').textContent='Torna alla scelta del gioco';
  $('paEnd').style.display='flex';
  speak(NM(UI.speakBravo[i]));
}
function paDefeat(){
  pa.paused=true; pa.inAttack=false; stopMusic(); sLose();
  pa.hornets=[]; pa.toSpawn=[]; paWordHide();
  $('paEndEm').textContent='😢';
  $('paEndTit').textContent='I calabroni hanno preso tutto il miele!'; $('paEndTit').style.color='#c0392b';
  $('paEndTxt').textContent='Non mollare: le api contano su di te! Riprova questo attacco. 💪';
  $('paEndBtn').textContent='🔁 Riprova l\'attacco '+pa.atk;
  $('paEndMenu').textContent='Torna alla scelta del gioco';
  $('paEnd').style.display='flex';
}
$('paEndBtn').onclick=()=>{
  $('paEnd').style.display='none';
  if(pa.honey<=0){ pa.honey=PA_HONEY; paHud(); if(MUSICON){ mCtx(); playMusic(TRK_LEVEL); } paAttackStart(); }
  else { paReset(); if(MUSICON){ mCtx(); playMusic(TRK_LEVEL); } paShop('Nuova partita! Sblocca le difese e difendi il miele.'); }
};
$('paEndMenu').onclick=()=>{ $('paEnd').style.display='none'; paExit(); };

/* ---------- Entra / esci ---------- */
function paReset(){
  pa.atk=1; pa.honey=PA_HONEY; pa.marked=false; pa.extraRaiders=0;
  pa.hornets=[]; pa.fx=[]; pa.guards=[]; pa.toSpawn=[];
  pa.inAttack=false; pa.paused=true; pa.last=0; pa.cooked=0; pa.ondaLeft=0;
  pa.tutorialShown=false;
  pa.combo=0; pa.shake=0; pa.wordsRead=0; pa.starsTot=0;
  pa.atkHoney=0; pa.atkEscapes=0; pa.atkWords=0;
  paWord={active:false, group:null, target:'', cool:1.5, lastIdx:-1};
  paWordHide();
  pa.lvl={ingresso:0,guardiane:0,propoli:0,onda:0};
  paMakeBees();
}
function paEnter(){
  if(VOICEON) initTTS();
  paused=true; stopSpeak();
  ['modeSel','menu'].forEach(id=>$(id).style.display='none');
  $('hud').style.display='none'; $('joy').style.display='none';
  paReset(); paResize(); paHud();
  $('pa').style.display='block';
  if(MUSICON){ mCtx(); playMusic(TRK_LEVEL); }
  if(!pa.raf) pa.raf=requestAnimationFrame(paFrame);
  /* si parte subito con l'attacco 1 (tutorial), il consiglio arriva dopo */
  paAttackStart();
}
function paExit(){
  cancelAnimationFrame(pa.raf); pa.raf=0; pa.paused=true; paWordHide();
  ['pa','paShop','paQ','paCard','paEnd'].forEach(id=>$(id).style.display='none');
  stopSpeak();
  showModeSel();
}
$('paHomeBtn').onclick=paExit;
$('paMusicBtn').onclick=()=>{
  MUSICON=!MUSICON; save();
  if(!MUSICON) stopMusic(); else { mCtx(); playMusic(TRK_LEVEL); }
  paHud();
};

/* ---------- Registrazione nel menu dei giochi ---------- */
registerGame({
  id:'pallaapi', emoji:'🐝',
  nm:['La Palla di Api','The Bee Ball'],
  sub:['La vera difesa delle api: la palla che scotta a 46°!','The real bee defense: the 46° hot ball!'],
  colore:'linear-gradient(180deg,#ffb300,#e8890b)',
  enter:paEnter
});
