/* ============================================================
   MISSIONE PLANETARIA — volo spaziale in terza persona
   ------------------------------------------------------------
   FISICA VERA (numeri reali, non inventati):
   - razzo a due stadi con i dati del Falcon 9 (masse, spinta, Isp)
   - equazione del razzo: la massa CALA mentre brucia il propellente
   - gravita' che diminuisce con la quota:  g(h)=g0·(R/(R+h))²
   - atmosfera esponenziale: rho(h)=rho0·e^(−h/H), H=8500 m
   - pressione dinamica Q=½·rho·v²  ->  il vero Max-Q verso 11-13 km
   - gravity turn (il razzo si inclina, non sale dritto)
   - nello spazio i motori sono SPENTI: si va per inerzia (1ª di Newton)
   - discesa: g del pianeta + attrito dell'aria vero con la densita'
     al suolo di quel pianeta -> su Marte SERVE il paracadute,
     su Venere l'aria e' cosi' densa che si scende quasi da soli,
     sulla Luna e su Mercurio il paracadute e' INUTILE.
   - ritardo radio = distanza / velocita' della luce
   Le SCALE VISIVE sono compresse (70 km non entrano nello schermo):
   i numeri dell'HUD sono veri, le dimensioni no.

   Tuning: costanti VP_* qui sotto. Test hook: window.__VP
   ============================================================ */

/* ---------------- costanti fisiche reali ---------------- */
const VP_G0=9.80665;            /* m/s² */
const VP_R_EARTH=6371000;       /* m */
const VP_RHO0=1.225;            /* kg/m³ al livello del mare */
const VP_SCALE_H=8500;          /* altezza di scala atmosfera terrestre, m */
const VP_C_LIGHT=299792.458;    /* km/s */

/* ---------------- tuning del gioco ---------------- */
const VP_T1=4;                  /* accelerazione del tempo nel 1º stadio */
const VP_T2=12;                 /* accelerazione del tempo nel 2º stadio */
const VP_SUBSTEP=0.1;           /* passo massimo di integrazione (s) */
const VP_BETA_ASC=90000;        /* coeff. balistico del razzo in salita, kg/m² */
const VP_GLIM=4;                /* i motori si strozzano per non superare 4 g (come il Falcon 9) */
const VP_PITCH=1.05;            /* inclinazione massima del gravity turn (rad dalla verticale) */
const VP_PITCH_T0=18;           /* secondo in cui inizia a inclinarsi */
const VP_PITCH_TD=150;          /* durata della manovra */
const VP_CRUISE_SEC=52;         /* durata della crociera giocata */
const VP_LAND_A=22;             /* accelerazione dei retrorazzi, m/s² */
const VP_LAND_BURN=12;          /* consumo carburante al secondo */
const VP_BETA_LAND=150;         /* coeff. balistico del lander, kg/m² */
const VP_BETA_CHUTE=15;         /* con il paracadute aperto */
const VP_TD_OK=5;               /* atterraggio riuscito sotto 5 m/s (salvo tdOk del pianeta) */
const VP_TD_PERFECT=2;          /* perfetto sotto 2 m/s */
const VP_DRAG_MAX=12*VP_G0;     /* l'aria non puo' frenare piu' di 12 g: oltre si rompe tutto */

/* dati veri del Falcon 9 (blocco 5) */
const VP_ROCKET={
 s1:{dry:25600,prop:395700,thrustSL:7607000,thrustVac:8227000,ispSL:282,ispVac:311,eng:9},
 s2:{dry:3900,prop:92670,thrust:981000,isp:348,eng:1},
 fairing:1900, payload:9600
};

/* ---------------- destinazioni con dati reali ---------------- */
const VP_DEST=[
 {id:'luna',nm:'Luna',em:'🌙',c:0x9a958c,
  R:1737400,g:1.62,rho:0,atm:'praticamente assente',
  dist:384400,travel:'3 giorni',sunAng:1.0,
  sky:0x000000,fog:0,ground:0x8f8b84,ground2:0x605d58,
  chute:false,chuteWhy:'Senza aria il paracadute non frena: contano solo i motori.',
  temp:'da −173 °C a +127 °C',rot:'27 giorni e 8 ore',
  h0:2500,v0:60,tdOk:5,
  fact:'Sulla Luna non c’è aria: un paracadute non si gonfia nemmeno.',
  q:'Perché sulla Luna non basta un paracadute?',ok:'Non c’è aria da spingere',no:['Fa troppo freddo','La nave pesa troppo']},

 {id:'marte',nm:'Marte',em:'🔴',c:0xb9502d,
  R:3389500,g:3.71,rho:0.020,atm:'sottile: 0,6% di quella terrestre',
  dist:225000000,travel:'circa 7 mesi',sunAng:0.66,
  sky:0xc4a184,fog:0.0016,ground:0xa8613c,ground2:0x7b4429,
  chute:true,chuteWhy:'L’aria è pochissima: il paracadute frena, ma da solo non basta.',
  temp:'da −125 °C a +20 °C',rot:'24 ore e 39 minuti',
  h0:2500,v0:250,tdOk:5,
  fact:'Su Marte il paracadute rallenta la sonda a circa 90 m/s: poi servono i motori.',
  q:'Perché su Marte il paracadute da solo non basta?',ok:'L’aria è troppo sottile',no:['Il paracadute si brucia','Marte gira troppo veloce']},

 {id:'venere',nm:'Venere',em:'🟡',c:0xd79e45,
  R:6051800,g:8.87,rho:65,atm:'densissima: 92 volte quella terrestre',
  dist:170000000,travel:'circa 5 mesi',sunAng:1.38,
  sky:0xd08b3a,fog:0.018,ground:0x8a6a3c,ground2:0x5f4826,
  chute:false,chuteWhy:'L’aria è densa come sciroppo: le sonde Venera sganciavano il paracadute perché rallentava troppo, e scendevano da sole a 7 m/s.',
  temp:'+464 °C, sempre',rot:'243 giorni, al contrario',
  h0:250,v0:60,tdOk:8,
  fact:'L’aria di Venere è così densa che le sonde Venera scendevano a piedi… cioè a 7 m/s, quasi da sole.',
  q:'Com’è l’atmosfera di Venere?',ok:'Densissima e caldissima',no:['Assente','Come quella terrestre']},

 {id:'mercurio',nm:'Mercurio',em:'🪨',c:0x8c8177,
  R:2439700,g:3.70,rho:0,atm:'assente (solo qualche atomo)',
  dist:155000000,travel:'circa 5 mesi',sunAng:2.6,
  sky:0x000000,fog:0,ground:0x6f6b66,ground2:0x46433f,
  chute:false,chuteWhy:'Niente aria: il paracadute resterebbe chiuso.',
  temp:'da −180 °C a +430 °C',rot:'59 giorni',
  h0:2000,v0:40,tdOk:5,
  fact:'Su Mercurio il cielo resta nero anche di giorno, ma il Sole si vede grande il triplo.',
  q:'Di che colore appare il cielo su Mercurio?',ok:'Nero',no:['Azzurro','Arancione']}
];

const VP_INCIDENTS=[
 {em:'🔥',title:'SURRISCALDAMENTO',text:'Un radiatore si è surriscaldato. Per riavviare il raffreddamento rispondi:',
  q:'Nel vuoto dello spazio, come arriva il calore del Sole?',ok:'Con la radiazione',no:['Con il vento','Con le onde del mare']},
 {em:'💨',title:'FILTRI DELL’ARIA',text:'La polvere ha bloccato i filtri. Sblocca il sistema di bordo:',
  q:'Quale gas del nostro respiro va tolto dall’aria della cabina?',ok:'L’anidride carbonica',no:['L’ossigeno','L’elio']},
 {em:'📡',title:'ANTENNA DA RICALIBRARE',text:'La base non riceve. Ricalibra il segnale:',
  q:'Quanto impiega la luce dal Sole alla Terra?',ok:'Circa 8 minuti',no:['8 secondi','8 giorni']},
 {em:'🌡️',title:'SCUDO TERMICO',text:'Il computer chiede la conferma dello scudo:',
  q:'Perché una navicella si scalda quando entra nell’atmosfera?',ok:'Comprime e sfrega l’aria',no:['Si avvicina al Sole','Accende i motori']}
];

let vp={on:false,d:null,sc:null,cam:null,ren:null,cv:null,clock:null,raf:0,frameAt:0,
 stage:'idle',t:0,tSim:0,paused:false,
 /* fisica salita */
 h:0,vx:0,vy:0,down:0,m:0,p1:0,p2:0,q:0,acc:0,maxQ:0,maxQdone:false,fairOut:false,
 /* fisica discesa */
 lh:0,lv:0,fuel:100,chute:false,burning:false,dust:0,
 hull:100,score:0,reads:0,errs:0,inc:0,keys:{},touch:{},
 world:{},ship:null,plume:null,rcs:[],rocks:[],cruiseT:0};

/* ============================================================
   1) CSS + DOM
   ============================================================ */
(function(){
 const css=document.createElement('style');css.textContent=`
 #vp,#vpPick{z-index:18}#vp{position:absolute;inset:0;display:none;overflow:hidden;background:#02030a;color:white}#vp canvas{position:absolute;inset:0;width:100%;height:100%}
 #vpHud{position:absolute;inset:10px 10px auto;display:flex;gap:6px;align-items:center;z-index:2;pointer-events:none;flex-wrap:wrap}#vpHud .hudBox{font-variant-numeric:tabular-nums}#vpHud .hudBtn{pointer-events:auto;margin-left:auto}
 #vpTel{position:absolute;left:10px;top:52px;z-index:2;display:grid;gap:3px;font:bold 14px/1.15 inherit;background:rgba(3,10,26,.62);border:2px solid rgba(122,182,255,.55);border-radius:12px;padding:7px 9px;min-width:132px;text-shadow:0 1px 2px #000}
 #vpTel div{display:flex;justify-content:space-between;gap:10px}#vpTel span{color:#9fd0ff;font-weight:normal}#vpTel b{font-variant-numeric:tabular-nums}
 #vpTel .warn{color:#ffd166}#vpTel .bad{color:#ff8f8f}
 #vpMission{position:absolute;top:52px;left:50%;transform:translateX(-50%);z-index:3;width:min(520px,72vw);text-align:center;text-shadow:0 2px 5px #000;pointer-events:none}#vpTitle{font-weight:900;letter-spacing:2px;font-size:clamp(14px,2.4vw,19px)}#vpBar{height:11px;border:2px solid #a9d6ff;border-radius:9px;overflow:hidden;background:#071326;margin-top:5px}#vpBar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4cb8ff,#80ffce)}
 #vpAlert{position:absolute;left:50%;bottom:108px;transform:translateX(-50%);z-index:3;background:rgba(4,15,35,.86);border:2px solid #67c7ff;border-radius:14px;padding:9px 15px;text-align:center;width:min(570px,84vw);font-weight:bold;font-size:clamp(14px,2.3vw,18px)}
 #vpAlert.hot{border-color:#ffcf5c;background:rgba(66,32,4,.9)}
 #vpCtrl{position:absolute;bottom:13px;left:50%;transform:translateX(-50%);display:grid;grid-template-columns:repeat(3,62px);gap:6px;z-index:3}#vpCtrl button{height:48px;border:2px solid #b9d8ff;border-radius:13px;background:rgba(18,43,82,.88);color:#fff;font:bold 22px inherit;touch-action:none}#vpCtrl button:nth-child(1){grid-column:1;grid-row:2}#vpCtrl button:nth-child(2){grid-column:2;grid-row:1}#vpCtrl button:nth-child(3){grid-column:3;grid-row:2}#vpCtrl button:nth-child(4){grid-column:2;grid-row:2}
 #vpCtrl button.fire{background:linear-gradient(180deg,#ff9838,#c9400f);border-color:#ffd08a}#vpCtrl button.fire.on{box-shadow:0 0 16px #ffb457 inset,0 0 12px #ff9838}
 #vpChute{position:absolute;bottom:70px;right:12px;z-index:3;border:2px solid #b9d8ff;border-radius:13px;background:rgba(18,43,82,.9);color:#fff;font:bold 16px inherit;padding:10px 13px;display:none}
 #vpGauge{position:absolute;right:12px;top:52px;bottom:126px;width:26px;z-index:2;border:2px solid rgba(122,182,255,.55);border-radius:13px;background:rgba(3,10,26,.62);display:none;overflow:hidden}
 #vpGaugeFill{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(0deg,#2b6fd8,#79c4ff);opacity:.5}
 #vpGaugeBurn{position:absolute;left:0;right:0;height:0;background:rgba(90,230,140,.55);border-top:2px solid #6fffa6;border-bottom:2px solid #6fffa6}
 #vpGaugeShip{position:absolute;left:0;right:0;height:0;border-top:3px solid #fff;text-align:center}
 .vpDest{border:3px solid #a9c4ff;border-radius:20px;background:linear-gradient(#243d78,#101a3c);color:#fff;padding:13px;width:min(196px,43vw);font-family:inherit;cursor:pointer;text-align:center}.vpDest b{font-size:23px;display:block}.vpDest .pe{font-size:44px}.vpDest small{display:block;line-height:1.45;color:#d9e6ff}
 .vpDest .diff{display:inline-block;margin-top:6px;font-size:13px;font-weight:bold;border-radius:999px;padding:2px 9px;background:#0d1a3c;border:1px solid #7fa8ff}
 #vpPanel{z-index:23;background:radial-gradient(circle at 18% 15%,rgba(92,112,255,.28),transparent 28%),radial-gradient(circle at 82% 78%,rgba(123,59,210,.3),transparent 30%),rgba(1,4,18,.88)}#vpPanel .card{position:relative;max-width:820px;width:min(820px,94vw);max-height:92vh;overflow:auto;padding:clamp(20px,4vw,36px);color:#f4f7ff;background:linear-gradient(145deg,rgba(22,38,84,.97),rgba(8,15,42,.98));border:3px solid #82c8ff;box-shadow:0 0 0 5px rgba(83,126,255,.18),0 0 35px rgba(86,171,255,.5);text-shadow:0 2px 3px #020512}#vpPanel .card:before{content:'✦  ·  ✧  ·  ✦';display:block;margin-bottom:5px;color:#91d8ff;font-size:20px;letter-spacing:9px}
 .vpPanelTitle{font-size:clamp(29px,5.2vw,42px);line-height:1.1;color:#fff;font-weight:900;text-shadow:0 0 14px #4d9dff}
 #vpPText{font-size:clamp(23px,3.4vw,31px)!important;line-height:1.45!important;margin:16px auto 14px;max-width:720px;font-weight:700}
 .vpData{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 auto 14px;max-width:730px}
 .vpData i{font-style:normal;background:rgba(10,26,62,.85);border:2px solid #5f9fe0;border-radius:12px;padding:7px 12px;font-size:clamp(15px,2.1vw,19px);font-weight:bold}
 .vpData i u{text-decoration:none;color:#8fd0ff;font-weight:normal;display:block;font-size:.78em}
 .vpRead{display:block;margin:0 auto 16px;padding:11px 20px;border:2px solid #ffd86b;border-radius:999px;background:#172c63;color:#fff;font:bold clamp(18px,2.4vw,23px) inherit;box-shadow:0 0 14px rgba(255,216,107,.35);cursor:pointer}.vpRead:disabled{opacity:.65;cursor:default}
 .vpAnswer,.vpCommand{display:block;width:min(710px,99%);margin:12px auto;padding:clamp(15px,2.5vw,21px);border:3px solid #9ed8ff;border-radius:16px;background:#f3f7ff;font:bold clamp(25px,3.5vw,33px)/1.25 inherit;color:#172b58;box-shadow:0 5px 0 #5475b7;cursor:pointer}.vpAnswer:active,.vpCommand:active{transform:translateY(3px);box-shadow:0 2px 0 #5475b7}.vpCommand.done{background:#baf0c6;border-color:#45a65b}.vpCommand.bad{animation:vpShake .3s;background:#ffcaca}
 @media(max-height:650px){#vpPanel .card{padding:13px}.vpPanelTitle{font-size:27px}#vpPText{font-size:20px!important;margin:8px auto}.vpRead{font-size:17px;padding:7px 15px;margin-bottom:8px}.vpAnswer,.vpCommand{font-size:22px;padding:10px;margin:7px auto}.vpData i{font-size:14px;padding:5px 9px}}
 @media(max-width:560px){#vpTel{font-size:12px;min-width:112px;padding:5px 7px}#vpMission{width:min(320px,54vw)}}
 @keyframes vpShake{50%{transform:translateX(8px)}}
 `;document.head.appendChild(css);

 document.body.insertAdjacentHTML('beforeend',`
 <div class="overlay" id="vpPick"><div class="card"><div style="font-size:44px">🚀</div><div class="vpPanelTitle">Scegli la destinazione</div>
  <p>Ogni mondo ha la sua gravità e la sua aria: l’atterraggio cambia davvero.</p>
  <div id="vpDests" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center"></div>
  <button id="vpPickBack" class="togBtn" style="margin-top:15px">🎮 Altri giochi</button></div></div>
 <div id="vp"><canvas id="vpCv"></canvas>
  <div id="vpHud"><div class="hudBox" id="vpTimer">T − 00:10</div><div class="hudBox" id="vpHull">🛡️ 100%</div><div class="hudBox" id="vpDist">TERRA</div><button class="hudBtn" id="vpHome">🏠</button></div>
  <div id="vpTel">
    <div><span>quota</span><b id="tQuota">0 m</b></div>
    <div><span>velocità</span><b id="tVel">0 m/s</b></div>
    <div><span>accel.</span><b id="tAcc">1,0 g</b></div>
    <div><span>press. Q</span><b id="tQ">0 kPa</b></div>
    <div><span>propell.</span><b id="tFuel">100%</b></div>
  </div>
  <div id="vpGauge"><div id="vpGaugeFill"></div><div id="vpGaugeBurn"></div><div id="vpGaugeShip"></div></div>
  <div id="vpMission"><div id="vpTitle">PREPARAZIONE AL LANCIO</div><div id="vpBar"><i></i></div></div>
  <div id="vpAlert">Sistemi pronti</div>
  <button id="vpChute">🪂 PARACADUTE</button>
  <div id="vpCtrl"><button data-k="l">◀</button><button data-k="u">▲</button><button data-k="r">▶</button><button data-k="d">▼</button></div></div>
 <div class="overlay" id="vpPanel"><div class="card"><div id="vpPEm" style="font-size:56px"></div><div id="vpPTitle" class="vpPanelTitle"></div><p id="vpPText"></p><div id="vpPData" class="vpData"></div><div id="vpPArea"></div></div></div>`);
})();

/* ============================================================
   2) TEXTURE PROCEDURALI
   ============================================================ */
function vpCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function vpNoise(x,w,h,n,col,a1,a2,r1,r2){for(let i=0;i<n;i++){x.fillStyle=col.replace('%a',(a1+Math.random()*a2).toFixed(3));x.beginPath();x.arc(Math.random()*w,Math.random()*h,r1+Math.random()*r2,0,7);x.fill()}}
function vpCrater(x,cx,cy,r,dark,light){
 x.fillStyle=light;x.beginPath();x.arc(cx,cy,r*1.25,0,7);x.fill();            /* ejecta chiara */
 x.fillStyle=dark;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();                  /* fondo scuro */
 x.strokeStyle='rgba(255,255,255,.30)';x.lineWidth=Math.max(1,r*.22);x.beginPath();x.arc(cx,cy-r*.12,r*.92,3.4,6.1);x.stroke(); /* bordo illuminato */
}
/* Texture del pianeta: ogni mondo ha le sue caratteristiche vere */
function vpPlanetTex(d){
 const W=768,H=384,c=vpCanvas(W,H),x=c.getContext('2d');
 if(d.id==='luna'){
  x.fillStyle='#a8a49c';x.fillRect(0,0,W,H);
  /* i "mari" lunari: pianure di lava scura, quasi tutte nella faccia visibile */
  [[210,120,86,52],[300,96,60,38],[168,178,52,40],[262,168,44,30],[350,150,34,26],[120,132,34,24]]
   .forEach(m=>{x.fillStyle='rgba(78,78,84,.85)';x.beginPath();x.ellipse(m[0],m[1],m[2],m[3],.3,0,7);x.fill()});
  for(let i=0;i<220;i++){const r=2+Math.random()*13;vpCrater(x,Math.random()*W,Math.random()*H,r,'rgba(96,93,88,.75)','rgba(206,202,193,.55)')}
  /* raggi chiari del cratere Tycho */
  x.strokeStyle='rgba(232,229,222,.45)';x.lineWidth=3;for(let i=0;i<14;i++){const a=Math.random()*6.28;x.beginPath();x.moveTo(230,286);x.lineTo(230+Math.cos(a)*260,286+Math.sin(a)*180);x.stroke()}
 } else if(d.id==='marte'){
  const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#e6e2dc');gr.addColorStop(.13,'#c07a55');gr.addColorStop(.5,'#b2532c');gr.addColorStop(.87,'#a85a34');gr.addColorStop(1,'#efeae2');
  x.fillStyle=gr;x.fillRect(0,0,W,H);
  vpNoise(x,W,H,900,'rgba(60,26,12,%a)',.02,.09,3,16);
  /* regioni scure d'albedo: Syrtis Major, Mare Erythraeum */
  x.fillStyle='rgba(88,60,44,.55)';x.beginPath();x.ellipse(300,150,58,72,.2,0,7);x.fill();
  x.beginPath();x.ellipse(520,236,96,42,-.2,0,7);x.fill();
  /* Valles Marineris: 4000 km di canyon */
  x.strokeStyle='rgba(70,34,18,.75)';x.lineWidth=9;x.beginPath();x.moveTo(96,206);x.bezierCurveTo(180,196,260,214,352,204);x.stroke();
  /* Olympus Mons, il vulcano piu' alto del sistema solare */
  x.fillStyle='rgba(150,88,54,.8)';x.beginPath();x.arc(72,176,22,0,7);x.fill();
  x.fillStyle='rgba(64,32,18,.8)';x.beginPath();x.arc(72,176,7,0,7);x.fill();
  /* calotte polari di ghiaccio */
  x.fillStyle='rgba(248,248,252,.92)';x.fillRect(0,0,W,17);x.fillRect(0,H-14,W,14);
 } else if(d.id==='venere'){
  x.fillStyle='#e0b463';x.fillRect(0,0,W,H);
  /* super-rotazione: bande di nubi che girano in 4 giorni */
  for(let i=0;i<44;i++){const y=Math.random()*H;x.fillStyle=`rgba(${Math.random()>.5?'255,236,190':'186,142,66'},${.06+Math.random()*.13})`;x.beginPath();x.ellipse(Math.random()*W,y,110+Math.random()*220,5+Math.random()*13,(y/H-.5)*.5,0,7);x.fill()}
  vpNoise(x,W,H,420,'rgba(255,248,214,%a)',.02,.07,10,40);
  x.fillStyle='rgba(214,170,96,.5)';x.beginPath();x.ellipse(W*.5,H*.5,150,54,0,0,7);x.fill();
 } else {
  x.fillStyle='#7d7873';x.fillRect(0,0,W,H);
  vpNoise(x,W,H,700,'rgba(30,28,26,%a)',.02,.1,4,18);
  for(let i=0;i<320;i++){const r=2+Math.random()*15;vpCrater(x,Math.random()*W,Math.random()*H,r,'rgba(78,74,70,.8)','rgba(160,155,148,.5)')}
  /* bacino Caloris: 1550 km di diametro */
  x.fillStyle='rgba(150,144,136,.45)';x.beginPath();x.arc(430,150,64,0,7);x.fill();
  x.strokeStyle='rgba(190,184,175,.5)';x.lineWidth=4;x.beginPath();x.arc(430,150,64,0,7);x.stroke();
 }
 const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t
}
function vpEarthTex(){
 const W=768,H=384,c=vpCanvas(W,H),x=c.getContext('2d');
 x.fillStyle='#123f86';x.fillRect(0,0,W,H);
 x.fillStyle='#2e7d3a';
 [[90,150,70,54],[140,232,44,64],[300,120,62,44],[336,214,40,72],[430,140,120,58],[560,250,52,32],[236,90,90,32]]
  .forEach(m=>{x.beginPath();x.ellipse(m[0],m[1],m[2],m[3],.2,0,7);x.fill()});
 x.fillStyle='rgba(226,206,150,.75)';x.beginPath();x.ellipse(318,150,34,26,0,0,7);x.fill();
 x.fillStyle='#f2f6ff';x.fillRect(0,0,W,15);x.fillRect(0,H-19,W,19);
 for(let i=0;i<90;i++){x.fillStyle=`rgba(255,255,255,${.16+Math.random()*.34})`;x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,18+Math.random()*54,7+Math.random()*15,Math.random(),0,7);x.fill()}
 return new THREE.CanvasTexture(c)
}
function vpGroundTex(d){
 const W=512,H=512,c=vpCanvas(W,H),x=c.getContext('2d');
 const hex=n=>'#'+n.toString(16).padStart(6,'0');
 x.fillStyle=hex(d.ground);x.fillRect(0,0,W,H);
 vpNoise(x,W,H,1400,'rgba(0,0,0,%a)',.02,.09,2,10);
 vpNoise(x,W,H,900,'rgba(255,255,255,%a)',.02,.07,2,8);
 if(d.rho===0){ /* mondi senza aria: crateri ovunque, spigoli netti */
  for(let i=0;i<90;i++){const r=6+Math.random()*30;vpCrater(x,Math.random()*W,Math.random()*H,r,'rgba(0,0,0,.28)','rgba(255,255,255,.16)')}
 } else if(d.id==='marte'){ /* dune modellate dal vento */
  x.strokeStyle='rgba(90,44,22,.28)';x.lineWidth=5;
  for(let i=0;i<26;i++){const y=Math.random()*H;x.beginPath();x.moveTo(0,y);for(let px=0;px<=W;px+=32)x.lineTo(px,y+Math.sin(px/60+i)*11);x.stroke()}
 } else { /* Venere: lastroni di lava spaccati, come nelle foto Venera */
  x.strokeStyle='rgba(40,26,10,.45)';x.lineWidth=3;
  for(let i=0;i<70;i++){const px=Math.random()*W,py=Math.random()*H;x.beginPath();x.moveTo(px,py);for(let k=0;k<4;k++)x.lineTo(px+(Math.random()-.5)*130,py+(Math.random()-.5)*130);x.stroke()}
 }
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);return t
}
function vpGlowTex(){
 const c=vpCanvas(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
 g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,246,214,.85)');g.addColorStop(.6,'rgba(255,190,90,.22)');g.addColorStop(1,'rgba(255,160,60,0)');
 x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)
}
function vpSmokeTex(){
 const c=vpCanvas(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,4,64,64,64);
 g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(.5,'rgba(226,226,232,.4)');g.addColorStop(1,'rgba(210,210,220,0)');
 x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)
}

/* ============================================================
   3) IL RAZZO — due stadi, come un Falcon 9
   ============================================================ */
const VP_MAT={};
function vpMats(){
 if(VP_MAT.white)return VP_MAT;
 VP_MAT.white=new THREE.MeshStandardMaterial({color:0xeef1f6,roughness:.55,metalness:.25});
 VP_MAT.soot =new THREE.MeshStandardMaterial({color:0x2b2e34,roughness:.85,metalness:.15});
 VP_MAT.black=new THREE.MeshStandardMaterial({color:0x14161b,roughness:.7,metalness:.3});
 VP_MAT.steel=new THREE.MeshStandardMaterial({color:0x9aa3ad,roughness:.35,metalness:.9});
 VP_MAT.copper=new THREE.MeshStandardMaterial({color:0xa8703c,roughness:.4,metalness:.85});
 VP_MAT.glass=new THREE.MeshStandardMaterial({color:0x2aa8ff,roughness:.1,metalness:.1,emissive:0x0a3a63});
 VP_MAT.gold =new THREE.MeshStandardMaterial({color:0xd9ab4a,roughness:.45,metalness:.8});
 return VP_MAT
}
function vpCyl(r1,r2,h,seg,mat,y,parent){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat);m.position.y=y;parent.add(m);return m}

/* Motore Merlin: camera + ugello a campana + tubi */
function vpEngine(bell){
 const M=vpMats(),g=new THREE.Group();
 vpCyl(.30,.34,.55,10,M.steel,.28,g);
 const noz=new THREE.Mesh(new THREE.CylinderGeometry(.30,bell,1.25,14,1,true),new THREE.MeshStandardMaterial({color:0x6f6156,roughness:.5,metalness:.8,side:THREE.DoubleSide}));
 noz.position.y=-.62;g.add(noz);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(bell,.045,6,14),M.copper);ring.rotation.x=Math.PI/2;ring.position.y=-1.24;g.add(ring);
 return g
}
/* Primo stadio: 9 motori in "octaweb", 4 pinne a griglia, 4 gambe */
function vpStage1(){
 const M=vpMats(),g=new THREE.Group(),R=1.83,L=41; /* diametro 3,66 m, lunghezza reale ~41 m */
 const body=vpCyl(R,R,L,26,M.white,L/2,g);body.name='corpo';
 vpCyl(R*1.005,R*1.005,2.2,26,M.soot,1.2,g);                   /* base annerita dai motori */
 for(let i=0;i<3;i++)vpCyl(R*1.004,R*1.004,.16,26,M.soot,L*(.28+i*.22),g); /* giunzioni dei serbatoi */
 /* scritte e fasce */
 const flag=vpCyl(R*1.006,R*1.006,3.2,26,new THREE.MeshStandardMaterial({color:0xb9c6d8,roughness:.6}),L-8,g);flag.scale.set(1,1,1);
 /* octaweb: 1 motore al centro + 8 in cerchio */
 g.userData.eng=[];
 const e0=vpEngine(.62);e0.position.y=.1;g.add(e0);g.userData.eng.push(e0);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,e=vpEngine(.58);e.position.set(Math.cos(a)*1.16,.1,Math.sin(a)*1.16);g.add(e);g.userData.eng.push(e)}
 const skirt=new THREE.Mesh(new THREE.CylinderGeometry(R,R*.99,2.6,26,1,true),M.soot);skirt.position.y=1.0;g.add(skirt);
 /* pinne a griglia in titanio (aperte solo al rientro: qui ripiegate) */
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;
  const fin=new THREE.Mesh(new THREE.BoxGeometry(1.5,.14,.9),M.steel);
  fin.position.set(Math.cos(a)*(R+.42),L-2.4,Math.sin(a)*(R+.42));fin.rotation.y=-a;g.add(fin)}
 /* gambe di atterraggio ripiegate lungo il fianco */
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.79;
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.19,.13,7.4,8),M.black);
  leg.position.set(Math.cos(a)*(R+.17),4.4,Math.sin(a)*(R+.17));g.add(leg)}
 return g
}
/* Secondo stadio: un solo motore con ugello enorme, fatto per il vuoto */
function vpStage2(){
 const M=vpMats(),g=new THREE.Group(),R=1.83,L=13.8;
 vpCyl(R,R,L,26,M.white,L/2+1.6,g);
 const inter=vpCyl(R,R,1.6,26,M.black,.8,g);inter.name='interstadio';
 const e=vpEngine(1.28);e.position.y=.4;e.scale.setScalar(1.5);g.add(e); /* MVac: ugello grande = spinta migliore nel vuoto */
 for(let i=0;i<2;i++){const t=vpCyl(.14,.14,2.4,6,M.gold,L*.6,g);t.position.x=R+.2;t.position.z=i?.6:-.6}
 return g
}
/* Carenatura in due gusci: protegge il carico finche' c'e' aria */
function vpFairing(){
 const M=vpMats(),g=new THREE.Group(),R=1.83;
 [-1,1].forEach(s=>{
  const half=new THREE.Group();
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(R,R,5.4,20,1,true,s>0?0:Math.PI,Math.PI),M.white);cyl.position.y=2.7;half.add(cyl);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(R,5.6,20,1,true,s>0?0:Math.PI,Math.PI),M.white);cone.position.y=8.2;half.add(cone);
  half.userData.side=s;g.add(half)});
 return g
}
/* Il modulo che vola davvero fino al pianeta e atterra */
function vpLander(deployed){
 const M=vpMats(),g=new THREE.Group();
 const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.9,2.5,18),M.white);hull.position.y=1.9;g.add(hull);
 const cone=new THREE.Mesh(new THREE.ConeGeometry(1.55,1.7,18),M.gold);cone.position.y=4.0;g.add(cone);
 const win=new THREE.Mesh(new THREE.SphereGeometry(.5,14,10),M.glass);win.scale.set(1,.6,.42);win.position.set(0,2.5,1.55);g.add(win);
 vpCyl(1.94,1.94,.28,18,M.black,.72,g);                        /* scudo termico */
 const e=vpEngine(.72);e.position.y=.62;g.add(e);
 g.userData.legs=[];
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.79,leg=new THREE.Group();
  const strut=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,3.2,7),M.steel);strut.position.y=-1.6;leg.add(strut);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(.44,.5,.22,10),M.steel);foot.position.y=-3.2;leg.add(foot);
  leg.position.set(Math.cos(a)*1.5,2.0,Math.sin(a)*1.5);leg.rotation.z=-Math.cos(a)*.42;leg.rotation.x=Math.sin(a)*.42;
  g.add(leg);g.userData.legs.push(leg)}
 g.userData.setLegs=v=>{g.userData.legs.forEach((l,i)=>{const a=i/4*Math.PI*2+.79,k=v?1:.18;
  l.rotation.z=-Math.cos(a)*.42*k;l.rotation.x=Math.sin(a)*.42*k})};
 g.userData.setLegs(!!deployed);
 /* pannelli solari: si aprono nello spazio */
 g.userData.panels=[];
 [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.BoxGeometry(3.4,.08,1.5),new THREE.MeshStandardMaterial({color:0x1b3f8c,roughness:.3,metalness:.6}));
  p.position.set(s*3.1,2.6,0);g.add(p);g.userData.panels.push(p)});
 return g
}
/* Pennacchio: in basso stretto (l'aria lo comprime), in alto si allarga come una campana */
function vpPlume(){
 const g=new THREE.Group(),tex=vpGlowTex();
 const outer=new THREE.Mesh(new THREE.ConeGeometry(1.1,9,18,1,true),new THREE.MeshBasicMaterial({color:0xff7a1e,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));
 outer.position.y=-4.5;outer.rotation.x=Math.PI;g.add(outer);
 const core=new THREE.Mesh(new THREE.ConeGeometry(.5,6,14,1,true),new THREE.MeshBasicMaterial({color:0xfff3bb,transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false}));
 core.position.y=-3;core.rotation.x=Math.PI;g.add(core);
 /* dischi di Mach: si vedono solo dove c'e' aria */
 const dia=[];for(let i=0;i<5;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xffd98a,transparent:true,opacity:.75,depthWrite:false}));
  d.scale.set(1,.42,1);d.position.y=-1.2-i*1.15;g.add(d);dia.push(d)}
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xffb455,transparent:true,opacity:.8,depthWrite:false}));halo.scale.set(7,7,1);halo.position.y=-1;g.add(halo);
 g.userData={outer,core,dia,halo};return g
}

/* ============================================================
   4) CIELO, STELLE, SOLE
   ============================================================ */
/* Le stelle sono a anni luce: NON scorrono mai. Colori veri per tipo spettrale. */
function vpStars(radius){
 const N=1800,pos=[],col=[],c=new THREE.Color();
 for(let i=0;i<N;i++){
  const u=Math.random()*2-1,th=Math.random()*Math.PI*2,s=Math.sqrt(1-u*u);
  let x=s*Math.cos(th),y=u,z=s*Math.sin(th);
  if(i%3===0){const b=(Math.random()-.5)*.24;y=b;const n=Math.hypot(x,z)||1;x=x/n*Math.sqrt(Math.max(0,1-b*b));z=z/n*Math.sqrt(Math.max(0,1-b*b))} /* banda della Via Lattea */
  pos.push(x*radius,y*radius,z*radius);
  const r=Math.random();
  if(r<.06)c.setHex(0x9db8ff); else if(r<.18)c.setHex(0xd8e4ff); else if(r<.5)c.setHex(0xffffff);
  else if(r<.78)c.setHex(0xfff0c4); else c.setHex(0xffbf8f);
  const dim=.35+Math.random()*.65;col.push(c.r*dim,c.g*dim,c.b*dim)
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 return new THREE.Points(geo,new THREE.PointsMaterial({size:radius/620,vertexColors:true,transparent:true,opacity:1,sizeAttenuation:true}))
}
function vpSun(size,dist,dir){
 const g=new THREE.Group();
 const disc=new THREE.Mesh(new THREE.CircleGeometry(size,32),new THREE.MeshBasicMaterial({color:0xfffdf0}));g.add(disc);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:vpGlowTex(),color:0xfff0c0,transparent:true,opacity:.85,depthWrite:false}));glow.scale.set(size*7,size*7,1);g.add(glow);
 g.position.copy(dir.clone().normalize().multiplyScalar(dist));
 g.userData.face=true;return g
}

/* ============================================================
   5) MONDI DELLE TRE FASI
   ============================================================ */
function vpBuildLaunch(){
 const M=vpMats(),sc=new THREE.Scene();
 const skyCol=new THREE.Color(0x8fc4ee);
 sc.background=skyCol;
 sc.fog=new THREE.Fog(0x9fcbee,600,4200);
 const hemi=new THREE.HemisphereLight(0xbfe0ff,0x4a4034,.85);sc.add(hemi);
 const sun=new THREE.DirectionalLight(0xfff4e0,1.5);sun.position.set(-160,180,140);sc.add(sun);
 const stars=vpStars(9000);stars.material.opacity=0;sc.add(stars);

 /* --- il mondo che resta a terra: si abbassa mentre saliamo --- */
 const gnd=new THREE.Group();sc.add(gnd);
 const seaMat=new THREE.MeshStandardMaterial({color:0x1d4f7a,roughness:.25,metalness:.35});
 const sea=new THREE.Mesh(new THREE.CircleGeometry(4200,48),seaMat);sea.rotation.x=-Math.PI/2;sea.position.y=-.4;gnd.add(sea);
 const land=new THREE.Mesh(new THREE.CircleGeometry(420,40),new THREE.MeshStandardMaterial({color:0x5f6b4a,roughness:.95}));
 land.rotation.x=-Math.PI/2;gnd.add(land);
 const pad=new THREE.Mesh(new THREE.CylinderGeometry(46,50,3,28),new THREE.MeshStandardMaterial({color:0x7b7f85,roughness:.9}));pad.position.y=1.4;gnd.add(pad);
 /* canale di scarico delle fiamme */
 const trench=new THREE.Mesh(new THREE.BoxGeometry(20,4,64),M.soot);trench.position.set(0,1.6,-34);gnd.add(trench);
 /* torre di lancio con bracci e ascensore */
 const tower=new THREE.Group();tower.position.set(-14,0,0);gnd.add(tower);
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2,p=vpCyl(.5,.5,64,6,M.steel,32,tower);p.position.set(Math.cos(a)*3.2,32,Math.sin(a)*3.2)}
 for(let y=6;y<64;y+=6){const b=new THREE.Mesh(new THREE.BoxGeometry(7,.4,7),M.steel);b.position.y=y;tower.add(b)}
 const arm=new THREE.Mesh(new THREE.BoxGeometry(12,1.1,2.4),M.steel);arm.position.set(6.5,38,0);tower.add(arm);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(4,3.2,3.2),M.white);cabin.position.set(12,39.6,0);tower.add(cabin);
 /* parafulmini, veri intorno a ogni rampa */
 [[-46,0],[36,32],[36,-32]].forEach(p=>{const t=vpCyl(.35,.15,86,6,M.steel,43,gnd);t.position.set(p[0],43,p[1])});
 /* serbatoi criogenici e capannoni */
 [[78,60],[92,42],[-88,-66]].forEach(p=>{const s=new THREE.Mesh(new THREE.SphereGeometry(9,16,12),M.white);s.position.set(p[0],9,p[1]);gnd.add(s)});
 /* nuvole basse */
 const clouds=new THREE.Group();gnd.add(clouds);
 for(let i=0;i<26;i++){const cl=new THREE.Mesh(new THREE.SphereGeometry(30+Math.random()*40,10,7),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:.75}));
  cl.scale.set(1,.32,1);cl.position.set((Math.random()-.5)*3000,300+Math.random()*260,(Math.random()-.5)*3000);clouds.add(cl)}

 /* --- la Terra vista da alto: compare quando l'atmosfera finisce --- */
 const earth=new THREE.Mesh(new THREE.SphereGeometry(2600,42,30),new THREE.MeshStandardMaterial({map:vpEarthTex(),roughness:.9}));
 earth.visible=false;sc.add(earth);
 const airGlow=new THREE.Mesh(new THREE.SphereGeometry(2700,36,24),new THREE.MeshBasicMaterial({color:0x69b6ff,transparent:true,opacity:.22,side:THREE.BackSide}));
 airGlow.visible=false;sc.add(airGlow);

 /* --- il razzo completo --- */
 const stack=new THREE.Group();sc.add(stack);
 const s1=vpStage1();stack.add(s1);
 const s2=vpStage2();s2.position.y=41;stack.add(s2);
 const fair=vpFairing();fair.position.y=56.4;stack.add(fair);
 const plume1=vpPlume();plume1.position.y=0;s1.add(plume1);
 const plume2=vpPlume();plume2.position.y=-.4;plume2.visible=false;s2.add(plume2);

 /* fumo del decollo */
 const smokeTex=vpSmokeTex(),smoke=[];
 for(let i=0;i<26;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0xdfe3ea,transparent:true,opacity:0,depthWrite:false}));s.visible=false;gnd.add(s);smoke.push(s)}

 return {sc,skyCol,gnd,clouds,tower,earth,airGlow,stack,s1,s2,fair,plume1,plume2,smoke,stars,sun,hemi,fairT:0}
}

function vpBuildCruise(d){
 const sc=new THREE.Scene();sc.background=new THREE.Color(0x01020a);
 sc.add(new THREE.HemisphereLight(0x2a3a66,0x05060f,.32));
 /* la luce del Sole si indebolisce col quadrato della distanza */
 const sun=new THREE.DirectionalLight(0xfff6e6,1.15*d.sunAng);sun.position.set(-120,60,40);sc.add(sun);
 sc.add(vpStars(4200));
 sc.add(vpSun(4.2*d.sunAng,900,new THREE.Vector3(-120,60,40)));
 /* pianeta di destinazione: lato illuminato e lato in ombra (terminatore vero) */
 const target=new THREE.Group();
 const globe=new THREE.Mesh(new THREE.SphereGeometry(30,54,38),new THREE.MeshStandardMaterial({map:vpPlanetTex(d),roughness:.95,metalness:0}));
 target.add(globe);
 if(d.rho>0){const halo=new THREE.Mesh(new THREE.SphereGeometry(31.4,40,26),new THREE.MeshBasicMaterial({color:d.id==='venere'?0xf0cd8a:0xd9a48a,transparent:true,opacity:d.id==='venere'?.3:.14,side:THREE.BackSide}));target.add(halo)}
 target.position.set(6,2,-1400);target.rotation.z=d.id==='marte'?.44:.05; /* inclinazione dell'asse */
 sc.add(target);
 /* la Terra che si allontana alle nostre spalle */
 const home=new THREE.Mesh(new THREE.SphereGeometry(16,32,22),new THREE.MeshStandardMaterial({map:vpEarthTex(),roughness:.9}));
 home.position.set(-30,-14,180);sc.add(home);
 /* la nave: solo il modulo, gli stadi sono stati lasciati indietro */
 const ship=vpLander(false);ship.rotation.x=-Math.PI/2;ship.scale.setScalar(.55);sc.add(ship);
 /* sbuffi RCS: nello spazio si gira con questi, non con le ali */
 const rcs=[];for(let i=0;i<4;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:vpSmokeTex(),color:0xdff0ff,transparent:true,opacity:0,depthWrite:false}));s.scale.set(1.6,1.6,1);ship.add(s);rcs.push(s)}
 rcs[0].position.set(-1.7,0,1.6);rcs[1].position.set(1.7,0,1.6);rcs[2].position.set(0,1.7,1.6);rcs[3].position.set(0,-1.7,1.6);
 return {sc,target,globe,home,ship,rcs,sun}
}

function vpBuildLanding(d){
 const sc=new THREE.Scene();
 sc.background=new THREE.Color(d.sky);
 if(d.fog)sc.fog=new THREE.FogExp2(d.sky,d.fog);
 sc.add(new THREE.HemisphereLight(d.rho>0?d.sky:0x30343d,d.ground2,d.rho>0?.95:.42));
 const sun=new THREE.DirectionalLight(0xfff3df,(d.rho>10?.35:1.5)*Math.min(1.6,d.sunAng)); /* su Venere le nubi filtrano quasi tutto */
 sun.position.set(-90,120,60);sc.add(sun);
 if(!d.fog){const st=vpStars(3000);sc.add(st)} /* senza aria le stelle si vedono anche di giorno */
 if(d.rho===0)sc.add(vpSun(d.id==='mercurio'?26:9,700,new THREE.Vector3(-90,120,60)));
 /* dalla Luna la Terra sta ferma nello stesso punto del cielo: non sorge e non tramonta */
 if(d.id==='luna'){const e=new THREE.Mesh(new THREE.SphereGeometry(26,32,22),new THREE.MeshStandardMaterial({map:vpEarthTex(),roughness:.9,emissive:0x0a1a33}));
  e.position.set(150,190,-420);sc.add(e)}
 if(d.id==='marte'){const p=new THREE.Mesh(new THREE.DodecahedronGeometry(5,0),new THREE.MeshStandardMaterial({color:0x8b7a6a,roughness:1,flatShading:true}));
  p.position.set(190,230,-520);sc.add(p)} /* Phobos, piccola e irregolare */

 const ground=new THREE.Mesh(new THREE.CircleGeometry(1800,54),new THREE.MeshStandardMaterial({map:vpGroundTex(d),roughness:1}));
 ground.rotation.x=-Math.PI/2;sc.add(ground);
 /* rilievi e massi */
 for(let i=0;i<70;i++){const r=1+Math.random()*7,rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),new THREE.MeshStandardMaterial({color:d.ground2,roughness:1,flatShading:true}));
  const a=Math.random()*6.28,dd=26+Math.random()*620;rock.position.set(Math.cos(a)*dd,r*.35,Math.sin(a)*dd);rock.rotation.set(Math.random(),Math.random(),Math.random());sc.add(rock)}
 for(let i=0;i<14;i++){const r=40+Math.random()*130,hill=new THREE.Mesh(new THREE.SphereGeometry(r,14,8),new THREE.MeshStandardMaterial({color:d.ground2,roughness:1}));
  hill.scale.y=.22;const a=Math.random()*6.28,dd=760+Math.random()*820;hill.position.set(Math.cos(a)*dd,0,Math.sin(a)*dd);sc.add(hill)}
 /* zona di atterraggio segnata */
 const padRing=new THREE.Mesh(new THREE.RingGeometry(9,11,32),new THREE.MeshBasicMaterial({color:0x7ce8a0,transparent:true,opacity:.75,side:THREE.DoubleSide}));
 padRing.rotation.x=-Math.PI/2;padRing.position.y=.15;sc.add(padRing);

 const ship=vpLander(false);sc.add(ship);
 const plume=vpPlume();plume.scale.setScalar(.5);plume.visible=false;ship.add(plume);
 /* paracadute (solo dove l'aria puo' gonfiarlo) */
 const chute=new THREE.Group();
 const dome=new THREE.Mesh(new THREE.SphereGeometry(7,20,12,0,6.29,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xf4f0e6,roughness:1,side:THREE.DoubleSide}));
 dome.position.y=15;chute.add(dome);
 for(let i=0;i<8;i++){const a=i/8*6.28,l=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,9,4),new THREE.MeshBasicMaterial({color:0xdcd6c8}));
  l.position.set(Math.cos(a)*3.2,10.5,Math.sin(a)*3.2);l.rotation.z=-Math.cos(a)*.32;l.rotation.x=Math.sin(a)*.32;chute.add(l)}
 chute.visible=false;ship.add(chute);
 /* polvere sollevata dai motori */
 const dust=[];for(let i=0;i<30;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:vpSmokeTex(),color:d.ground,transparent:true,opacity:0,depthWrite:false}));s.visible=false;sc.add(s);dust.push(s)}
 return {sc,ground,ship,plume,chute,dust,padRing,sun}
}

/* ============================================================
   6) FISICA
   ============================================================ */
function vpGrav(h){const r=VP_R_EARTH/(VP_R_EARTH+h);return VP_G0*r*r}
function vpRho(h){return VP_RHO0*Math.exp(-h/VP_SCALE_H)}
function vpPress(h){return Math.exp(-h/VP_SCALE_H)}                 /* frazione della pressione al suolo */
function vpMass(){const R=VP_ROCKET;
 let m=R.payload;
 if(!vp.fairOut)m+=R.fairing;
 m+=R.s2.dry+vp.p2;
 if(vp.stage==='ascent1'||vp.stage==='sep')m+=R.s1.dry+vp.p1;
 return m}
/* Un passo di salita: spinta, gravita', attrito. Tutto con numeri veri. */
function vpAscentStep(dt){
 const R=VP_ROCKET,first=(vp.stage==='ascent1');
 const h=vp.h,pr=vpPress(h),rho=vpRho(h);
 const m=vpMass();
 let F=0,mdot=0;
 if(first&&vp.p1>0){
  F=R.s1.thrustSL+(R.s1.thrustVac-R.s1.thrustSL)*(1-pr);
  F=Math.min(F,VP_GLIM*VP_G0*m);          /* strozzata: mai piu' di 4 g sull'equipaggio */
  const isp=R.s1.ispSL+(R.s1.ispVac-R.s1.ispSL)*(1-pr);
  mdot=F/(isp*VP_G0);
 } else if(vp.stage==='ascent2'&&vp.p2>0){
  F=R.s2.thrust;mdot=F/(R.s2.isp*VP_G0);
 }
 /* assetto: dritti all'inizio, poi gravity turn (il razzo "cade" di lato piano piano) */
 const T=vp.tSim;
 const pitch=first? VP_PITCH*Math.sqrt(Math.max(0,(T-VP_PITCH_T0)/VP_PITCH_TD)) : 1.48;
 const v=Math.hypot(vp.vx,vp.vy)||1e-6;
 const aT=F/m, drag=0.5*rho*v*v/VP_BETA_ASC;
 const cent=vp.vx*vp.vx/(VP_R_EARTH+h);   /* effetto centrifugo: e' cio' che tiene su un satellite */
 const ax=aT*Math.sin(pitch)-drag*(vp.vx/v);
 const ay=aT*Math.cos(pitch)-vpGrav(h)+cent-drag*(vp.vy/v);
 vp.vx+=ax*dt;vp.vy+=ay*dt;vp.h=Math.max(0,vp.h+vp.vy*dt);
 if(first)vp.p1=Math.max(0,vp.p1-mdot*dt);else vp.p2=Math.max(0,vp.p2-mdot*dt);
 vp.q=0.5*rho*v*v;                        /* pressione dinamica, Pa */
 vp.acc=Math.abs(aT-drag)/VP_G0;          /* g davvero sentiti a bordo (solo spinta e attrito) */
 vp.tSim+=dt;
 return {pitch,thrust:F>0}
}
/* Un passo di discesa: gravita' del pianeta + attrito con la sua aria.
   L'aria da sola non puo' mai far risalire la nave: al massimo la porta
   alla velocita' limite. Per questo si integra in due tempi. */
function vpDescentStep(dt,burn){
 const d=vp.d,v=vp.lv,vt=vpTerminal(vp.chute);   /* positivo = scende */
 let drag=d.rho>0? Math.min(0.5*d.rho*v*Math.abs(v)/(vp.chute?VP_BETA_CHUTE:VP_BETA_LAND),VP_DRAG_MAX):0;
 const aAir=d.g-drag;
 let vn=v+aAir*dt;
 if(d.rho>0){ if(v>=vt)vn=Math.max(vt,vn); else vn=Math.min(vt,vn); } /* mai oltre la velocita' limite */
 let aEng=0;
 if(burn&&vp.fuel>0){aEng=-VP_LAND_A;vn+=aEng*dt;vp.fuel=Math.max(0,vp.fuel-VP_LAND_BURN*dt)}
 vp.lv=Math.max(-3,vn);
 vp.lh=Math.max(0,vp.lh-vp.lv*dt);
 vp.acc=Math.abs(drag+(-aEng))/VP_G0;            /* g sentiti: aria + motore, non la gravita' */
 return aAir+aEng
}
/* Velocita' massima a cui le gambe reggono su questo mondo */
function vpTdOk(){return (vp.d&&vp.d.tdOk)||VP_TD_OK}
/* Quota a cui bisogna accendere per fermarsi appena sopra il suolo.
   Se l'aria ti sta gia' frenando abbastanza (Venere col paracadute) non serve accendere. */
function vpBurnAlt(){
 const d=vp.d,net=VP_LAND_A-d.g;if(net<=0)return 0;
 const v=Math.max(0,vp.lv);
 if(v<=vpTdOk())return 0;
 return Math.max(0,(v*v-VP_TD_PERFECT*VP_TD_PERFECT)/(2*net))
}
/* Velocita' limite: quando attrito e gravita' si pareggiano */
function vpTerminal(chute){const d=vp.d;if(!d.rho)return Infinity;
 return Math.sqrt(2*(chute?VP_BETA_CHUTE:VP_BETA_LAND)*d.g/d.rho)}

/* ============================================================
   7) HUD
   ============================================================ */
const vpFmt=(n,dec)=>n.toLocaleString('it-IT',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});
function vpTel(quota,vel,acc,q,fuel){
 $('tQuota').textContent=quota;$('tVel').textContent=vel;$('tAcc').textContent=acc;$('tQ').textContent=q;$('tFuel').textContent=fuel;
}
function vpSay(msg,hot){const a=$('vpAlert');a.textContent=msg;a.classList.toggle('hot',!!hot)}
function vpBar(p){$('vpBar').firstElementChild.style.width=Math.max(0,Math.min(100,p*100))+'%'}

/* ============================================================
   8) SCHEDE DI LETTURA
   ============================================================ */
function vpPanelData(rows){
 const box=$('vpPData');box.innerHTML='';
 (rows||[]).forEach(r=>{const i=document.createElement('i');i.innerHTML=r[1]+'<u>'+r[0]+'</u>';box.appendChild(i)})
}
function vpAddReadButton(){
 const area=$('vpPArea'),b=document.createElement('button');
 b.className='vpRead';b.textContent='🔊 Leggi per me · vale metà stelle';
 b.onclick=()=>{vp.reads++;b.textContent='🔊 Sto leggendo… · metà stelle';b.disabled=true;
  const choices=Array.from(area.querySelectorAll('.vpAnswer,.vpCommand')).map(el=>({t:el.textContent,el,block:true}));
  speak([{t:$('vpPTitle').textContent,el:$('vpPTitle')},{t:$('vpPText').textContent,el:$('vpPText'),block:true},'Le scelte sono:',...choices])};
 area.insertBefore(b,area.firstChild)
}
function vpShowPanel(em,title,text,rows){
 $('vpPEm').textContent=em;$('vpPTitle').textContent=title;$('vpPText').textContent=text;
 vpPanelData(rows);$('vpPArea').innerHTML='';$('vpPanel').style.display='flex'
}
function vpQuestion(q,onOk){
 vp.paused=true;
 vpShowPanel(q.em,q.title,q.text+' '+q.q,null);
 const area=$('vpPArea');
 shuffle([q.ok].concat(q.no)).forEach(a=>{
  const b=document.createElement('button');b.className='vpAnswer';b.textContent=a;
  b.onclick=()=>{
   if(a===q.ok){b.style.background='#baf0c6';vp.score+=20;setTimeout(()=>{$('vpPanel').style.display='none';vp.paused=false;onOk&&onOk()},450)}
   else{b.style.background='#ffcaca';b.disabled=true;vp.errs++;vp.hull=Math.max(10,vp.hull-5);$('vpHull').textContent='🛡️ '+vp.hull+'%'}};
  area.appendChild(b)});
 vpAddReadButton()
}

/* ============================================================
   9) AVVIO E FASI
   ============================================================ */
function vpDiff(d){return d.rho===0?(d.g<2?'facile':'difficile'):(d.id==='venere'?'facile':'media')}
function vpPick(){
 vp.on=false;   /* ferma il loop di disegno mentre si sceglie */
 ['modeSel','menu','vp','vpPanel'].forEach(id=>$(id).style.display='none');
 const box=$('vpDests');box.innerHTML='';
 VP_DEST.forEach(d=>{
  const b=document.createElement('button');b.className='vpDest';
  b.innerHTML=`<span class="pe">${d.em}</span><b>${d.nm}</b><small>Gravità ${String(d.g).replace('.',',')} m/s²<br>Aria: ${d.rho===0?'nessuna':(d.rho<1?'pochissima':'densissima')}<br>Viaggio: ${d.travel}</small><span class="diff">atterraggio ${vpDiff(d)}</span>`;
  b.onclick=()=>vpBrief(d);box.appendChild(b)});
 $('vpPick').style.display='flex'
}
/* Scheda pre-lancio: si legge prima di partire */
function vpBrief(d){
 vp.d=d;$('vpPick').style.display='none';
 const delay=d.dist/VP_C_LIGHT, dtxt=delay<60?(Math.round(delay*10)/10+' secondi'):(Math.round(delay/60)+' minuti');
 vpShowPanel(d.em,'SCHEDA DI MISSIONE · '+d.nm.toUpperCase(),
  'Leggi i dati, poi accendi i motori. '+d.fact,
  [['distanza',vpFmt(d.dist)+' km'],['durata del viaggio',d.travel],['gravità',String(d.g).replace('.',',')+' m/s²'],
   ['aria al suolo',d.atm],['temperatura',d.temp],['un giorno dura',d.rot],['ritardo radio',dtxt]]);
 const area=$('vpPArea');
 const go=document.createElement('button');go.className='vpAnswer';go.textContent='🚀 ACCENDI I MOTORI';
 go.onclick=()=>{$('vpPanel').style.display='none';vpStart(d)};
 area.appendChild(go);
 const back=document.createElement('button');back.className='vpAnswer';back.textContent='↩️ Cambia destinazione';
 back.onclick=()=>{$('vpPanel').style.display='none';vpPick()};
 area.appendChild(back);
 vpAddReadButton()
}
function vpStart(d){
 vp.d=d;vp.stage='ascent1';vp.t=0;vp.tSim=0;vp.paused=false;
 vp.h=0;vp.vx=0;vp.vy=0;vp.q=0;vp.maxQ=0;vp.maxQdone=false;vp.fairOut=false;
 vp.p1=VP_ROCKET.s1.prop;vp.p2=VP_ROCKET.s2.prop;
 vp.hull=100;vp.score=0;vp.reads=0;vp.errs=0;vp.inc=0;vp.cruiseT=0;vp.landStep=0;vp.vxS=0;vp.vyS=0;
 vp.fuel=100;vp.chute=false;vp.burning=false;vp.rocks=[];
 vp.world={launch:vpBuildLaunch(),cruise:null,land:null};
 vp.sc=vp.world.launch.sc;
 vp.cam=new THREE.PerspectiveCamera(58,1,.6,20000);
 vp.clock=new THREE.Clock();
 $('vp').style.display='block';$('vpGauge').style.display='none';$('vpChute').style.display='none';
 $('vpCtrl').style.display='grid';$('vpCtrl').children[1].classList.remove('fire','on');
 vp.cv=$('vpCv');
 if(!vp.ren){vp.ren=new THREE.WebGLRenderer({canvas:vp.cv,antialias:true});vp.ren.setPixelRatio(Math.min(devicePixelRatio||1,1.5))}
 vpResize();
 $('vpTitle').textContent='DECOLLO';$('vpDist').textContent='TERRA';$('vpHull').textContent='🛡️ 100%';
 vpSay('Accensione! Nove motori, 7 600 kN di spinta.');
 if(MUSICON){mCtx();playMusic(TRK_ROCKET)}
 vp.on=true;if(!vp.raf)vp.raf=requestAnimationFrame(vpFrame)
}
function vpResize(){if(!vp.cam||!vp.ren)return;vp.ren.setSize(innerWidth,innerHeight,false);vp.cam.aspect=innerWidth/innerHeight;vp.cam.updateProjectionMatrix()}
addEventListener('resize',vpResize);

/* ============================================================
   10) LOOP — FASE DI SALITA
   ============================================================ */
/* quota reale -> quota sullo schermo (compressa, altrimenti 70 km non ci stanno) */
function vpVisAlt(h){return h<=400? h*.55 : 220+520*Math.log10(1+h/400)}
function vpUpdateAscent(dtReal){
 const W=vp.world.launch,scale=(vp.stage==='ascent2')?VP_T2:VP_T1;
 let dt=dtReal*scale,st={pitch:0,thrust:false};
 while(dt>0&&(vp.stage==='ascent1'||vp.stage==='ascent2')){const s=Math.min(VP_SUBSTEP,dt);st=vpAscentStep(s);dt-=s}

 const yv=vpVisAlt(vp.h),v=Math.hypot(vp.vx,vp.vy);
 W.gnd.position.y=-yv;W.gnd.visible=yv<700;
 W.clouds.position.y=Math.min(0,-yv+300);
 W.stack.rotation.z=-st.pitch*.55;
 W.stack.position.x=Math.min(90,vp.vx*.02);

 /* il cielo si spegne mentre l'aria finisce: e' proprio l'aria a renderlo azzurro */
 const air=Math.min(1,vpRho(vp.h)/VP_RHO0),lum=Math.pow(air,.42);
 W.skyCol.setRGB(0x8f/255*lum,0xc4/255*lum,0xee/255*lum);
 if(vp.sc.fog){vp.sc.fog.color.copy(W.skyCol);vp.sc.fog.near=600+yv*6;vp.sc.fog.far=4200+yv*40}
 W.stars.material.opacity=1-Math.pow(air,.25);
 W.hemi.intensity=.25+.6*air;
 /* la Terra tonda compare quando l'atmosfera e' quasi finita */
 const far=yv>620;W.earth.visible=far;W.airGlow.visible=far;
 if(far){W.earth.position.set(0,-2600-yv,0);W.airGlow.position.copy(W.earth.position)}
 /* la carenatura si apre in due gusci e cade indietro */
 if(vp.fairOut&&W.fair.visible){W.fairT=(W.fairT||0)+dtReal;
  W.fair.children.forEach(hf=>{hf.position.x=hf.userData.side*W.fairT*9;hf.position.y=-W.fairT*6;hf.rotation.z=-hf.userData.side*W.fairT*1.1});
  if(W.fairT>2.2)W.fair.visible=false}

 /* pennacchio: nel vuoto si allarga (niente aria che lo stringe) */
 const pl=(vp.stage==='ascent2')?W.plume2:W.plume1;
 W.plume1.visible=(vp.stage==='ascent1'&&st.thrust);
 W.plume2.visible=(vp.stage==='ascent2'&&st.thrust);
 if(pl.visible){
  const pr=vpPress(vp.h),spread=1+(1-pr)*2.6,flick=.9+Math.random()*.25;
  pl.userData.outer.scale.set(spread,flick*(1+(1-pr)*.8),spread);
  pl.userData.core.scale.set(1,flick,1);
  pl.userData.outer.material.color.setHex(pr>.4?0xff7a1e:(pr>.06?0xff9d4a:0x9ec8ff));
  pl.userData.outer.material.opacity=.35+.3*pr;
  pl.userData.halo.scale.setScalar(7*spread*.7);
  pl.userData.dia.forEach((dm,i)=>{dm.visible=pr>.25;dm.scale.set(1-i*.13,.42,1-i*.13)}); /* dischi di Mach solo nell'aria densa */
 }
 /* fumo alla partenza */
 if(vp.h<900){W.smoke.forEach((s,i)=>{
   if(!s.visible&&Math.random()<.25){s.visible=true;s.position.set((Math.random()-.5)*30,2,-20+(Math.random()-.5)*40);s.scale.setScalar(14);s.material.opacity=.75}
   else if(s.visible){s.scale.multiplyScalar(1.012);s.material.opacity*=.985;s.position.z-=.5;if(s.material.opacity<.02)s.visible=false}})}
 else W.smoke.forEach(s=>s.visible=false);

 /* camera: vicina alla rampa, poi si allarga */
 const k=Math.min(1,yv/700);
 vp.cam.position.set(58+k*40,26+18*k+Math.min(yv,60),62+k*36);
 vp.cam.lookAt(W.stack.position.x,26+Math.min(yv,40)*.2,0);

 /* eventi reali della salita */
 if(!vp.maxQdone&&vp.q>vp.maxQ)vp.maxQ=vp.q;
 if(!vp.maxQdone&&vp.q<vp.maxQ*.82&&vp.h>7000){vp.maxQdone=true;
  vpSay('MAX-Q superato: '+vpFmt(vp.maxQ/1000,1)+' kPa a '+vpFmt(vp.h/1000,1)+' km. Ora l’aria si dirada.',true)}
 if(vp.stage==='ascent1'&&vp.p1<=0){
  vp.stage='sep';vp.t=0;
  vpSay('MECO: motori del 1º stadio spenti. Separazione!',true);
  $('vpTitle').textContent='SEPARAZIONE DEGLI STADI';
  if(MUSICON){try{mCtx();beep(90,.35,0,'sawtooth',.06)}catch(e){}}
 }
 if(vp.stage==='ascent2'&&!vp.fairOut&&vp.h>110000){
  vp.fairOut=true;W.fair.children.forEach(hf=>{hf.userData.t=0});
  vpSay('Carenatura sganciata: fuori dall’aria non serve più.',true)
 }
 if(vp.stage==='ascent2'&&(v>7800||vp.p2<=0)){
  vp.stage='orbit';vp.t=0;$('vpTitle').textContent='ORBITA RAGGIUNTA';
  vpSay('Velocità orbitale: '+vpFmt(v)+' m/s. Motori spenti.',true)
 }
 /* telemetria */
 const sec=Math.floor(vp.tSim);
 $('vpTimer').textContent='T+ '+String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')+'  ⏩×'+scale;
 vpTel(vp.h<1000?vpFmt(vp.h)+' m':vpFmt(vp.h/1000,1)+' km',
       vpFmt(v)+' m/s', vpFmt(vp.acc,1).replace('.',',')+' g',
       vpFmt(vp.q/1000,1).replace('.',',')+' kPa',
       Math.round((vp.stage==='ascent1'?vp.p1/VP_ROCKET.s1.prop:vp.p2/VP_ROCKET.s2.prop)*100)+'%');
 $('vpDist').textContent=vpFmt(v*3.6)+' km/h';
 vpBar(Math.min(1,vp.h/200000));
}
/* separazione: il 1º stadio cade indietro, il 2º accende */
function vpUpdateSep(dt){
 const W=vp.world.launch;vp.t+=dt;
 W.s1.position.y-=dt*26;W.s1.rotation.x+=dt*.22;W.s1.position.z-=dt*4;
 W.plume1.visible=false;
 if(vp.t>1.4&&!W.plume2.visible){W.plume2.visible=true;vpSay('Accensione del 2º stadio: un solo motore, ugello grande per il vuoto.')}
 if(vp.t>2.6){vp.stage='ascent2';$('vpTitle').textContent='SPINTA DEL 2º STADIO'}
}
function vpUpdateOrbit(dt){
 const W=vp.world.launch;vp.t+=dt;W.plume2.visible=false;
 W.stack.rotation.z+=dt*.12;
 if(vp.t>2.2){vpToCruise()}
}

/* ============================================================
   11) CROCIERA
   ============================================================ */
function vpToCruise(){
 vp.world.cruise=vpBuildCruise(vp.d);vp.sc=vp.world.cruise.sc;vp.stage='cruise';vp.t=0;vp.cruiseT=0;vp.rocks=[];
 $('vpTitle').textContent='ROTTA VERSO '+vp.d.nm.toUpperCase();
 vpSay('Motori spenti: nello spazio si va per inerzia. Scansa i detriti con le frecce.');
 $('vpGauge').style.display='none';
}
function vpSpawnRock(){
 const r=.6+Math.random()*2.2,g=new THREE.IcosahedronGeometry(r,1),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const n=.72+Math.random()*.42;p.setXYZ(i,p.getX(i)*n,p.getY(i)*n,p.getZ(i)*n)}
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:Math.random()>.5?0x6d655d:0x4e4e53,roughness:1,flatShading:true}));
 m.position.set((Math.random()-.5)*34,(Math.random()-.5)*21,-150-Math.random()*40);
 m.userData={hit:false,spin:(Math.random()-.5)*2};
 vp.sc.add(m);vp.rocks.push(m)
}
function vpUpdateCruise(dt){
 const C=vp.world.cruise,k=vp.keys,t=vp.touch;
 vp.cruiseT+=dt;
 const rx=((k.ArrowRight||k.d||t.r)?1:0)-((k.ArrowLeft||k.a||t.l)?1:0);
 const ry=((k.ArrowUp||k.w||t.u)?1:0)-((k.ArrowDown||k.s||t.d)?1:0);
 vp.vxS=(vp.vxS||0)+rx*24*dt; vp.vyS=(vp.vyS||0)+ry*20*dt;
 vp.vxS*=.965; vp.vyS*=.965;   /* nello spazio non c'e' attrito: si frena solo coi motorini */
 C.ship.position.x=Math.max(-16,Math.min(16,C.ship.position.x+vp.vxS*dt));
 C.ship.position.y=Math.max(-10,Math.min(10,C.ship.position.y+vp.vyS*dt));
 C.ship.rotation.z=-vp.vxS*.02;
 /* sbuffi RCS solo quando si comanda */
 C.rcs[0].material.opacity=rx>0?.8:C.rcs[0].material.opacity*.86;
 C.rcs[1].material.opacity=rx<0?.8:C.rcs[1].material.opacity*.86;
 C.rcs[2].material.opacity=ry<0?.8:C.rcs[2].material.opacity*.86;
 C.rcs[3].material.opacity=ry>0?.8:C.rcs[3].material.opacity*.86;

 const p=Math.min(1,vp.cruiseT/VP_CRUISE_SEC);
 C.target.position.z=-1400+p*1290;C.target.rotation.y+=dt*.06;
 C.home.position.z=180+p*260;C.home.scale.setScalar(Math.max(.12,1-p*.92));
 vp.cam.position.set(C.ship.position.x*.22,7+C.ship.position.y*.18,26);
 vp.cam.lookAt(C.ship.position.x*.35,C.ship.position.y*.35,-30);

 if(Math.random()<dt*1.05)vpSpawnRock();
 vp.rocks.forEach(r=>{
  r.position.z+=46*dt;r.rotation.x+=dt*(.6+r.userData.spin);r.rotation.y+=dt*(.7-r.userData.spin*.3);
  if(!r.userData.hit&&Math.abs(r.position.z)<3.4&&r.position.distanceTo(C.ship.position)<3.4){
   r.userData.hit=true;vp.hull=Math.max(0,vp.hull-12);r.visible=false;
   $('vpHull').textContent='🛡️ '+vp.hull+'%';vpSay('⚠️ Impatto! Scudo al '+vp.hull+'%',true)}
 });
 vp.rocks=vp.rocks.filter(r=>{if(r.position.z>34){vp.sc.remove(r);return false}return true});

 /* orologio di missione con la durata vera del viaggio */
 const totDays=vp.d.id==='luna'?3:(vp.d.id==='marte'?210:150);
 const day=Math.floor(p*totDays);
 $('vpTimer').textContent='GIORNO '+day+' / '+totDays;
 $('vpDist').textContent=Math.round((1-p)*100)+'% ALL’ARRIVO';
 const remKm=vp.d.dist*(1-p);
 vpTel(vpFmt(remKm)+' km', 'inerziale', '0,0 g', '0 kPa', '100%');
 vpBar(p);

 if(vp.inc===0&&vp.cruiseT>13){vp.inc++;vpQuestion(VP_INCIDENTS[0],()=>vpSay('✅ Raffreddamento ripristinato.'))}
 else if(vp.inc===1&&vp.cruiseT>30){vp.inc++;vpQuestion(VP_INCIDENTS[1+Math.floor(Math.random()*2)],()=>vpSay('✅ Sistema di bordo a posto.'))}
 else if(vp.cruiseT>=VP_CRUISE_SEC)vpLandingBrief()
}

/* ============================================================
   12) DISCESA
   ============================================================ */
function vpCommands(d){
 return ['📡 Allinea la nave con il radiofaro',
         '🛡️ Ruota lo scudo termico in avanti',
         d.chute?'🪂 Prepara il paracadute':'🦿 Estendi le gambe di atterraggio',
         '🔥 Arma i motori di frenata']
}
function vpLandingBrief(){
 vp.stage='brief';vp.paused=true;vp.rocks.forEach(r=>vp.sc.remove(r));vp.rocks=[];
 const d=vp.d,cmds=vpCommands(d);vp.landStep=0;
 const vt=vpTerminal(false),vtc=vpTerminal(true);
 vpShowPanel(d.em,'DISCESA SU '+d.nm.toUpperCase(),
  'La base invia quattro comandi. Eseguili nell’ordine giusto. '+d.chuteWhy,
  [['gravità',String(d.g).replace('.',',')+' m/s²'],
   ['quota d’inizio',vpFmt(d.h0)+' m'],
   ['velocità di caduta senza motori',vt===Infinity?'aumenta sempre':vpFmt(vt)+' m/s'],
   ['con il paracadute',d.chute?vpFmt(vtc)+' m/s':'inutile: niente aria'],
   ['le gambe reggono fino a',vpTdOk()+' m/s']]);
 const area=$('vpPArea');
 shuffle(cmds.slice()).forEach(cmd=>{
  const b=document.createElement('button');b.className='vpCommand';b.textContent=cmd;
  b.onclick=()=>{const want=cmds[vp.landStep];
   if(cmd===want){b.classList.add('done');b.disabled=true;vp.landStep++;vp.score+=10;
    if(vp.landStep===4)setTimeout(vpBeginDescent,450)}
   else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');vp.errs++;
    $('vpPText').textContent='⚠️ Controlla la sequenza: prima bisogna '+want.replace(/^\S+\s/,'').toLowerCase()+'.'}};
  area.appendChild(b)});
 vpAddReadButton()
}
function vpBeginDescent(){
 $('vpPanel').style.display='none';vp.paused=false;
 const d=vp.d;
 vpDispose(vp.world.land);                    /* se si riprova, butta via la scena vecchia */
 vp.world.land=vpBuildLanding(d);vp.sc=vp.world.land.sc;
 vp.stage='descent';vp.t=0;vp.lh=d.h0;vp.lv=d.v0;vp.fuel=100;vp.chute=false;vp.burning=false;
 $('vpTitle').textContent='ATTERRAGGIO SU '+d.nm.toUpperCase();
 $('vpGauge').style.display='block';
 $('vpChute').style.display=d.chute?'block':'none';
 const fire=$('vpCtrl').children[1];fire.classList.add('fire');
 vpSay(d.chute?'🪂 Prima il paracadute, poi ▲ per i retrorazzi.':'Tieni ▲ per accendere i retrorazzi. Guarda la fascia verde!');
 if(!d.chute&&d.rho===0)setTimeout(()=>vpSay('Qui non c’è aria: solo i motori possono frenarti.'),3400)
}
function vpVisDown(h){return h<=120? h*.5 : 60+58*Math.log10(1+h/120)}
function vpUpdateDescent(dtReal){
 const L=vp.world.land,d=vp.d,k=vp.keys,t=vp.touch;
 const want=!!(k.ArrowUp||k.w||k[' ']||t.u);
 vp.burning=want&&vp.fuel>0;
 let dt=dtReal;while(dt>0){const s=Math.min(.05,dt);vpDescentStep(s,vp.burning);dt-=s}

 const yv=vpVisDown(vp.lh);
 L.ship.position.y=yv;
 L.ship.rotation.z=Math.sin(vp.t*1.3)*.012;
 L.plume.visible=vp.burning;
 if(vp.burning){const f=.9+Math.random()*.3;L.plume.scale.set(.5*f,.5*f,.5*f)}
 L.chute.visible=vp.chute;
 if(vp.chute){L.chute.rotation.z=Math.sin(vp.t*2.1)*.06}
 /* le gambe si aprono sotto i 200 m */
 L.ship.userData.setLegs(vp.lh<200);
 /* polvere: senza aria vola dritta, con l'aria si arriccia */
 if(vp.burning&&vp.lh<60){L.dust.forEach(s=>{
   if(!s.visible&&Math.random()<.4){s.visible=true;const a=Math.random()*6.28;
    s.userData={a,r:2,vy:d.rho>0?.5:.08};s.position.set(Math.cos(a)*2,.5,Math.sin(a)*2);s.scale.setScalar(3);s.material.opacity=.6}
   else if(s.visible){const u=s.userData;u.r+=(d.rho>0?26:44)*.016;
    s.position.set(Math.cos(u.a)*u.r,.5+u.r*u.vy*.08,Math.sin(u.a)*u.r);
    s.scale.multiplyScalar(1.02);s.material.opacity*=.972;if(s.material.opacity<.03)s.visible=false}})}
 else L.dust.forEach(s=>{if(s.visible){s.material.opacity*=.9;if(s.material.opacity<.03)s.visible=false}});

 /* camera: si avvicina man mano che scendiamo */
 const cd=18+Math.min(34,yv*.35);
 vp.cam.position.set(cd*.72,yv+6+Math.min(16,yv*.12),cd);
 vp.cam.lookAt(0,yv-1,0);
 L.padRing.material.opacity=.4+.4*Math.abs(Math.sin(vp.t*2));

 /* indicatore: fascia verde = quota giusta per accendere */
 const hb=vpBurnAlt(),top=d.h0;
 $('vpGaugeFill').style.height=(vp.lh/top*100)+'%';
 $('vpGaugeShip').style.bottom=(vp.lh/top*100)+'%';
 const bTop=Math.min(1,hb*1.25/top),bBot=Math.min(1,hb*.75/top);
 $('vpGaugeBurn').style.bottom=(bBot*100)+'%';
 $('vpGaugeBurn').style.height=Math.max(1,(bTop-bBot)*100)+'%';
 const fireBtn=$('vpCtrl').children[1];fireBtn.classList.toggle('on',vp.burning);

 const near=vp.lh<hb*1.3&&vp.lh>0;
 vpTel(vpFmt(vp.lh)+' m',
       vpFmt(vp.lv,vp.lv<10?1:0).replace('.',',')+' m/s',
       vpFmt(vp.acc,1).replace('.',',')+' g',
       d.rho>0?vpFmt(0.5*d.rho*vp.lv*vp.lv/1000,1).replace('.',',')+' kPa':'0 kPa',
       Math.round(vp.fuel)+'%');
 $('tVel').className=vp.lv>vpTdOk()*3?'bad':(vp.lv>vpTdOk()?'warn':'');
 $('tFuel').className=vp.fuel<25?'bad':(vp.fuel<50?'warn':'');
 $('vpTimer').textContent='QUOTA '+vpFmt(vp.lh)+' m';
 $('vpDist').textContent=vpFmt(vp.lv,1).replace('.',',')+' m/s';
 vpBar(1-vp.lh/top);
 if(vp.burning)vpSay('Retrorazzi accesi · '+Math.round(vp.fuel)+'% di carburante');
 else if(hb===0&&vp.lv<=vpTdOk())vpSay('🪂 L’aria ti sta già frenando: scendi a '+vpFmt(vp.lv,1).replace('.',',')+' m/s, non serve accendere.');
 else if(near&&vp.lh>3)vpSay('🔥 ACCENDI ORA: sei nella fascia verde!',true);
 else if(vp.lh<hb*.7)vpSay('⛔ Troppo tardi: frena subito!',true);
 else if(vp.chute)vpSay('🪂 Paracadute aperto: velocità limite '+vpFmt(vpTerminal(true))+' m/s');

 if(vp.lh<=0.4){vpTouchdown()}
}
function vpOpenChute(){
 if(!vp.d.chute||vp.chute)return;
 vp.chute=true;vp.score+=10;
 vpSay('🪂 Paracadute aperto!');
 $('vpChute').style.display='none'
}
function vpTouchdown(){
 const v=vp.lv;vp.stage='done';
 if(v<=vpTdOk())vpSuccess(v);else vpCrash(v)
}
function vpCrash(v){
 vp.paused=true;
 vpShowPanel('💥','ATTERRAGGIO TROPPO DURO',
  'Hai toccato il suolo a '+vpFmt(v)+' m/s. Le gambe reggono fino a '+vpTdOk()+' m/s.',
  [['gravità di '+vp.d.nm,String(vp.d.g).replace('.',',')+' m/s²'],
   ['quota giusta per accendere',vpFmt(Math.round(vp.d.v0*vp.d.v0/(2*(VP_LAND_A-vp.d.g))))+' m circa'],
   ['carburante rimasto',Math.round(vp.fuel)+'%']]);
 const area=$('vpPArea');
 const a=document.createElement('button');a.className='vpAnswer';a.textContent='🔁 Riprova la discesa';
 a.onclick=()=>{$('vpPanel').style.display='none';vp.paused=false;vpBeginDescent()};area.appendChild(a);
 const b=document.createElement('button');b.className='vpAnswer';b.textContent='🎮 Altri giochi';b.onclick=vpExit;area.appendChild(b);
 vpAddReadButton()
}
/* Ultimo quiz e premio */
function vpSuccess(v){
 vp.paused=true;
 const d=vp.d;
 vpShowPanel('🛰️','ULTIMO CONTROLLO','Sei a terra a '+vpFmt(v,1).replace('.',',')+' m/s. Il computer chiede una conferma. '+d.fact+' '+d.q,null);
 const area=$('vpPArea');
 shuffle([d.ok].concat(d.no)).forEach(a=>{
  const b=document.createElement('button');b.className='vpAnswer';b.textContent=a;
  b.onclick=()=>{if(a===d.ok){b.style.background='#baf0c6';vp.score+=20;setTimeout(()=>vpReward(v),450)}
   else{b.style.background='#ffcaca';b.disabled=true;vp.errs++}};
  area.appendChild(b)});
 vpAddReadButton()
}
function vpReward(v){
 const d=vp.d,perfect=(v<=VP_TD_PERFECT&&vp.errs===0&&vp.reads===0);
 let earned=50+vp.score+Math.round(vp.hull/4)+Math.round(vp.fuel/4)+(v<=VP_TD_PERFECT?30:0);
 if(vp.reads>0||vp.errs>0)earned=Math.round(earned/2);   /* metà stelle se 🔊 o errori */
 const stars=perfect?'⭐⭐⭐':(vp.errs===0?'⭐⭐':'⭐');
 vpShowPanel('🏆','ATTERRAGGIO RIUSCITO! '+stars,
  'Sei su '+d.nm+'. Toccata a '+vpFmt(v,1).replace('.',',')+' m/s: '+(v<=VP_TD_PERFECT?'morbidissima!':'ottima.')+' Hai guadagnato '+earned+' stelle.',
  [['velocità al contatto',vpFmt(v,1).replace('.',',')+' m/s'],
   ['scudo',vp.hull+'%'],['carburante avanzato',Math.round(vp.fuel)+'%'],
   ['letture automatiche',vp.reads],['errori',vp.errs],
   ['il tuo peso qui',Math.round(30*d.g/VP_G0)+' kg su 30 kg']]);
 const area=$('vpPArea');
 const a=document.createElement('button');a.className='vpAnswer';a.textContent='🚀 Nuova missione';a.onclick=vpPick;area.appendChild(a);
 const b=document.createElement('button');b.className='vpAnswer';b.textContent='🎮 Altri giochi';b.onclick=vpExit;area.appendChild(b);
 vpAddReadButton();
 score+=earned;save()
}

/* ============================================================
   13) LOOP PRINCIPALE
   ============================================================ */
function vpFrame(){
 if(!vp.on){vp.raf=0;return}
 vp.raf=requestAnimationFrame(vpFrame);
 const frameTs=arguments[0];
 if(Number.isFinite(frameTs)&&vp.frameAt&&frameTs-vp.frameAt<1000/30-1)return;
 if(Number.isFinite(frameTs))vp.frameAt=frameTs;
 const dt=Math.min(vp.clock.getDelta(),.05);
 if(!vp.paused){
  vp.t+=dt;
  if(vp.stage==='ascent1'||vp.stage==='ascent2')vpUpdateAscent(dt);
  else if(vp.stage==='sep')vpUpdateSep(dt);
  else if(vp.stage==='orbit')vpUpdateOrbit(dt);
  else if(vp.stage==='cruise')vpUpdateCruise(dt);
  else if(vp.stage==='descent')vpUpdateDescent(dt);
 }
 if(vp.sc&&vp.cam)vp.ren.render(vp.sc,vp.cam)
}

/* ============================================================
   14) USCITA, INPUT, REGISTRAZIONE
   ============================================================ */
/* libera la memoria della GPU: importante su tablet */
function vpDispose(w){
 if(!w||!w.sc||!w.sc.traverse)return;
 w.sc.traverse(o=>{
  if(o.geometry&&o.geometry.dispose)o.geometry.dispose();
  if(o.material)[].concat(o.material).forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();if(m.dispose)m.dispose()})})
}
function vpExit(){
 vp.on=false;vp.stage='idle';vp.frameAt=0;
 ['vp','vpPanel','vpPick'].forEach(id=>$(id).style.display='none');
 Object.values(vp.world||{}).forEach(vpDispose);
 vp.world={};vp.sc=null;
 stopSpeak();showModeSel()
}
$('vpHome').onclick=vpExit;$('vpPickBack').onclick=vpExit;$('vpChute').onclick=vpOpenChute;
addEventListener('keydown',e=>{vp.keys[e.key]=1;
 if(vp.on&&(e.key==='p'||e.key==='P'))vpOpenChute();
 if(vp.on&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()});
addEventListener('keyup',e=>vp.keys[e.key]=0);
document.querySelectorAll('#vpCtrl button').forEach(b=>{const q=b.dataset.k;
 b.onpointerdown=e=>{e.preventDefault();vp.touch[q]=1};
 b.onpointerup=b.onpointercancel=b.onpointerleave=()=>vp.touch[q]=0});

registerGame({id:'volo',emoji:'🚀',nm:['Missione Planetaria','Planetary Mission'],
 sub:['Decolla con un vero razzo a due stadi e atterra su un altro mondo','Launch a real two-stage rocket and land on another world'],
 colore:'linear-gradient(180deg,#7048c8,#172b68)',enter:vpPick,exit:vpExit});

/* hook per i test */
window.__VP={vp,DEST:VP_DEST,ROCKET:VP_ROCKET,
 grav:vpGrav,rho:vpRho,press:vpPress,mass:vpMass,
 ascentStep:vpAscentStep,descentStep:vpDescentStep,burnAlt:vpBurnAlt,terminal:vpTerminal,
 pick:vpPick,brief:vpBrief,start:vpStart,cruise:vpToCruise,
 landingBrief:vpLandingBrief,beginDescent:vpBeginDescent,touchdown:vpTouchdown,
 openChute:vpOpenChute,exit:vpExit,frame:vpFrame};
