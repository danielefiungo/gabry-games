/* ============================================================
   MODALITA' 2: DIFENDI L'ALVEARE + schermata di scelta del gioco
   ============================================================ */
/* ============================================================
   MODALITÀ 2: DIFENDI L'ALVEARE 🐝
   I calabroni attaccano l'alveare: tocca un calabrone per
   mandare un'ape difenditrice (costa 1 munizione-ape).
   Le api nuove si comprano con le ⭐ guadagnate rispondendo
   alle domande nel Negozio delle Api, tra un'ondata e l'altra.
   Il premio dipende dalla difficoltà e si dimezza se si usa
   la lettura automatica 🔊 (o si sbaglia una risposta).
   ============================================================ */

/* ---------- CSS ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#modeSel { z-index:15; }',
  '#modeRow { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; margin-top:14px; }',
  '.modeBtn { border:none; border-radius:24px; padding:22px 18px; width:min(250px,60vw); cursor:pointer; font-family:inherit; color:#fff; box-shadow:0 6px 0 rgba(0,0,0,.25); transition:transform .1s; }',
  '.modeBtn:active { transform:translateY(3px); box-shadow:none; }',
  '.modeBtn .em { font-size:52px; display:block; margin-bottom:8px; }',
  '.modeBtn .nm { font-size:22px; font-weight:bold; display:block; }',
  '.modeBtn small { font-size:14px; opacity:.92; display:block; margin-top:6px; line-height:1.3; }',
  '#modeMaze { background:linear-gradient(180deg,#3d6ef7,#2b3a8f); }',
  '#modeHive { background:linear-gradient(180deg,#ffb300,#e8890b); }',
  '#hive { position:absolute; inset:0; display:none; z-index:8; background:linear-gradient(180deg,#7ec8f0,#bfe6f7 55%,#9fd47a 78%,#7cc061); }',
  '#hiveCv { position:absolute; inset:0; touch-action:none; }',
  '#hiveHud { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:10px 14px; z-index:9; pointer-events:none; flex-wrap:wrap; gap:6px; }',
  '#hvBtns { pointer-events:auto; display:flex; gap:8px; }',
  '#hvMsg { position:absolute; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.6); color:#fff; padding:10px 22px; border-radius:20px; font-size:19px; z-index:9; display:none; pointer-events:none; max-width:94vw; text-align:center; }',
  '#hvWaveBig { position:absolute; top:24%; left:50%; transform:translateX(-50%); z-index:9; pointer-events:none; font-size:clamp(30px,7vw,56px); font-weight:bold; color:#fff; text-shadow:0 3px 0 rgba(0,0,0,.35); opacity:0; }',
  '#hvWaveBig.pop { animation:comboBig 1.6s ease-out; }',
  '#hiveShop .card { background:linear-gradient(180deg,#fff8e1,#ffefc2); max-width:720px; }',
  '#hsTitle { font-size:clamp(24px,5vw,34px); color:#b06f00; margin:4px 0 10px; }',
  '#hsStats { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:12px; }',
  '.hsLab { font-size:16px; font-weight:bold; color:#8a6d00; margin:10px 0 8px; }',
  '.hsBtn { border:none; border-radius:18px; padding:14px 16px; font-size:19px; font-weight:bold; cursor:pointer; font-family:inherit; background:#ffd54f; color:#6d4c00; box-shadow:0 5px 0 #c99b06; }',
  '.hsBtn:active { transform:translateY(3px); box-shadow:none; }',
  '.hsBtn:disabled { opacity:.45; cursor:not-allowed; box-shadow:none; }',
  '.hsBtn.q { background:#8c5cf0; color:#fff; box-shadow:0 5px 0 #5f36b8; }',
  '#hsMsg { min-height:26px; font-size:18px; font-weight:bold; margin-top:10px; color:#b06f00; }',
  '#hsGo { margin-top:10px; }',
  '#hiveQ .card { max-width:min(1100px,96vw); }',
  '#hqReward { font-size:20px; font-weight:bold; color:#e8a013; margin-bottom:8px; }',
  '#hqText { font-size:clamp(29px,5.2vw,40px); color:#222; line-height:1.55; letter-spacing:.02em; word-spacing:.12em; margin-bottom:10px; }',
  '#hqAnswers { display:flex; flex-direction:column; gap:12px; }',
  '@media (min-width:760px){ #hqAnswers { display:grid; grid-template-columns:repeat(3,1fr); align-items:stretch; } #hqAnswers .ansBtn { display:flex; align-items:center; justify-content:center; } }',
  '#hqMsg { min-height:30px; font-size:22px; font-weight:bold; margin-top:12px; }',
  '#hqBack, #heMenu { margin-top:10px; background:none; border:none; color:#aaa; font-size:15px; cursor:pointer; font-family:inherit; text-decoration:underline; }'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- HTML ---------- */
  document.body.insertAdjacentHTML('beforeend',
  '<div class="overlay" id="modeSel">'+
    '<div class="card">'+
      '<div id="modeTitle" style="font-size:clamp(26px,6vw,42px);color:#2b3a8f;margin-bottom:4px"></div>'+
      '<div id="modeSub" style="font-size:19px;color:#666;margin-bottom:8px"></div>'+
      '<div id="modeRow">'+
        '<button class="modeBtn" id="modeMaze"><span class="em">🧩</span><span class="nm" id="modeMazeNm"></span><small id="modeMazeSub"></small></button>'+
        '<button class="modeBtn" id="modeHive"><span class="em">🐝</span><span class="nm" id="modeHiveNm"></span><small id="modeHiveSub"></small></button>'+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div id="hive">'+
    '<canvas id="hiveCv"></canvas>'+
    '<div id="hiveHud">'+
      '<div class="hudBox" id="hvWave">🌊 1</div>'+
      '<div class="hudBox" id="hvHealth">🍯🍯🍯🍯🍯</div>'+
      '<div class="hudBox" id="hvAmmo">🐝 10</div>'+
      '<div class="hudBox" id="hvScore">⭐ 0</div>'+
      '<div id="hvBtns">'+
        '<button class="hudBtn" id="hvShopBtn" title="Negozio">🛒</button>'+
        '<button class="hudBtn" id="hvMusicBtn" title="Musica">🎵</button>'+
        '<button class="hudBtn" id="hvHomeBtn" title="Menu">🏠</button>'+
      '</div>'+
    '</div>'+
    '<div id="hvWaveBig"></div>'+
    '<div id="hvMsg"></div>'+
  '</div>'+
  '<div class="overlay" id="hiveShop">'+
    '<div class="card">'+
      '<div style="font-size:48px">🐝🛒</div>'+
      '<div id="hsTitle"></div>'+
      '<div id="hsStats"></div>'+
      '<div class="hsLab" id="hsBuyLab"></div>'+
      '<div class="togRow">'+
        '<button class="hsBtn" id="hsBuy1"></button>'+
        '<button class="hsBtn" id="hsBuy2"></button>'+
      '</div>'+
      '<div class="hsLab" id="hsEarnLab"></div>'+
      '<div class="togRow">'+
        '<button class="hsBtn q" id="hsQEasy"></button>'+
        '<button class="hsBtn q" id="hsQHard"></button>'+
      '</div>'+
      '<div id="hsMsg"></div>'+
      '<button class="bigBtn" id="hsGo"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="hiveQ">'+
    '<div class="card">'+
      '<div id="hqEmoji" style="font-size:46px">🐝</div>'+
      '<div id="hqTheme" style="font-size:15px;color:#999;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px"></div>'+
      '<div id="hqReward"></div>'+
      '<div id="hqText"></div>'+
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">'+
        '<button id="hqSpeak" class="jollyBtn"></button>'+
      '</div>'+
      '<div id="hqAnswers"></div>'+
      '<div id="hqMsg"></div>'+
      '<button id="hqBack"></button>'+
    '</div>'+
  '</div>'+
  '<div class="overlay" id="hiveEnd">'+
    '<div class="card">'+
      '<div id="heEmoji" style="font-size:78px">🏆</div>'+
      '<div id="heTitle" style="font-size:clamp(26px,6vw,40px);color:#e8a013;margin:10px 0"></div>'+
      '<div id="heText" style="font-size:21px;color:#555;margin-bottom:20px"></div>'+
      '<button class="bigBtn" id="heRetry"></button>'+
      '<div><button id="heMenu"></button></div>'+
    '</div>'+
  '</div>');
})();

/* ---------- Testi [it,en] ---------- */
const HUI={
  modeTitle:["🌟 I Giochi delle Parole 🌟","🌟 The Word Games 🌟"],
  modeSub:["Scegli il gioco!","Pick a game!"],
  mazeNm:["Il Labirinto","The Maze"],
  mazeSub:["Leggi, apri le porte, trova la stella","Read, open doors, find the star"],
  hiveNm:["Difendi l'Alveare","Defend the Hive"],
  hiveSub:["Ferma i calabroni con le api!","Stop the hornets with the bees!"],
  switchBtn:["🎮 Cambia gioco","🎮 Change game"],
  wave:["Ondata","Wave"],
  tapHint:["👆 Tocca i calabroni per mandare le api!","👆 Tap the hornets to send the bees!"],
  noAmmo:["Api finite! Rispondi alle domande per chiamarne altre 🐝","Out of bees! Answer questions to call more 🐝"],
  hiveHit:["Oh no! Un calabrone ha rubato il miele! 🍯","Oh no! A hornet stole some honey! 🍯"],
  shopTitle:["Il Negozio delle Api","The Bee Shop"],
  buyLab:["Chiama nuove api:","Call new bees:"],
  earnLab:["Guadagna stelle rispondendo alle domande:","Earn stars by answering questions:"],
  buy1:["🐝 +5 api — 15 ⭐","🐝 +5 bees — 15 ⭐"],
  buy2:["🐝🐝 +12 api — 30 ⭐","🐝🐝 +12 bees — 30 ⭐"],
  qEasy:["❓ Facile  +10 ⭐","❓ Easy  +10 ⭐"],
  qHard:["❓❓ Difficile  +25 ⭐","❓❓ Hard  +25 ⭐"],
  goWave:["▶️ Via all'ondata","▶️ Start wave"],
  goBack:["▶️ Torna a difendere!","▶️ Back to defending!"],
  noStars:["Ti servono più stelle: rispondi a una domanda! 😊","You need more stars: answer a question! 😊"],
  bought:["Evviva! Nuove api in arrivo! 🐝","Hooray! New bees on the way! 🐝"],
  reward:["Premio:","Reward:"],
  rewardHalf:["(dimezzato: lettura 🔊 o errore)","(halved: reading 🔊 or mistake)"],
  readBtn:["🔊 Leggimela (premio dimezzato)","🔊 Read it to me (half reward)"],
  reading:["🔊 sto leggendo…","🔊 reading…"],
  backShop:["torna al negozio","back to the shop"],
  waveDone:["Ondata superata! 🎉","Wave cleared! 🎉"],
  winTitle:["ALVEARE SALVO! 👑","HIVE SAVED! 👑"],
  winText:["Hai difeso le api da tutte le ondate! Sei un eroe! 🐝❤️","You defended the bees from every wave! You're a hero! 🐝❤️"],
  loseTitle:["I calabroni hanno preso il miele!","The hornets took the honey!"],
  loseText:["Non mollare: le api contano su di te! 💪","Don't give up: the bees are counting on you! 💪"],
  retry:["🔁 Riprova l'ondata","🔁 Retry the wave"],
  again:["🔁 Gioca ancora","🔁 Play again"],
  toMenu:["Torna alla scelta del gioco","Back to game choice"]
};

/* ---------- Stato ---------- */
const HV_HEALTH=5, HV_AMMO_START=10, HV_WAVES=10;
const HV_PACK1={n:5,cost:15}, HV_PACK2={n:12,cost:30};
const HV_REW_EASY=10, HV_REW_HARD=25;
let hv={wave:1, health:HV_HEALTH, ammo:HV_AMMO_START, hornets:[], bees:[], fx:[],
        spawnLeft:0, spawnT:0, shake:0, raf:0, last:0, inWave:false, paused:true};
let hq={diff:'easy', q:null, theme:0, voiced:false, mult:1, done:false};
const hvUsed=new Set();
const hvCv=$('hiveCv'), hvC=hvCv.getContext('2d');
let hvW=0, hvH=0, hvMsgTid=0;

function hvResize(){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  hvW=window.innerWidth; hvH=window.innerHeight;
  hvCv.width=Math.round(hvW*dpr); hvCv.height=Math.round(hvH*dpr);
  hvCv.style.width=hvW+'px'; hvCv.style.height=hvH+'px';
  hvC.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener('resize',()=>{ if($('hive').style.display!=='none') hvResize(); });
const hiveX=()=>hvW/2, hiveY=()=>hvH-110;

function hvMsgShow(t,ms){
  const el=$('hvMsg'); el.textContent=t; el.style.display='block';
  clearTimeout(hvMsgTid); hvMsgTid=setTimeout(()=>{ el.style.display='none'; },ms||2200);
}
function hvHud(){
  $('hvWave').textContent='🌊 '+hv.wave+'/'+HV_WAVES;
  $('hvHealth').textContent='🍯'.repeat(hv.health)+'▫️'.repeat(Math.max(0,HV_HEALTH-hv.health));
  $('hvAmmo').textContent='🐝 '+hv.ammo;
  $('hvScore').textContent='⭐ '+score;
  $('hvMusicBtn').textContent=MUSICON?'🎵':'🔇';
}
function hvReset(){
  hv.wave=1; hv.health=HV_HEALTH; hv.ammo=HV_AMMO_START;
  hv.hornets=[]; hv.bees=[]; hv.fx=[];
  hv.spawnLeft=0; hv.inWave=false; hv.paused=true; hv.last=0; hv.shake=0;
}

/* ---------- Ondate e calabroni ---------- */
function hvStartWave(n){
  hv.inWave=true; hv.paused=false; hv.last=0;
  hv.spawnLeft=2+2*n; hv.spawnT=0.8;
  const el=$('hvWaveBig');
  el.textContent='🌊 '+HUI.wave[LI()]+' '+n;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  if(n===1) hvMsgShow(HUI.tapHint[LI()],3500);
  hvHud();
}
function hvSpawn(){
  const side=Math.random(); let x,y;
  if(side<0.6){ x=Math.random()*hvW; y=-40; }
  else if(side<0.8){ x=-40; y=Math.random()*hvH*0.4; }
  else { x=hvW+40; y=Math.random()*hvH*0.4; }
  hv.hornets.push({x,y, ph:Math.random()*6.28, t:0, rot:0,
    spd:(55+hv.wave*7)*(0.85+Math.random()*0.3), state:'fly', targeted:false});
  hv.spawnLeft--;
}
function hvHiveHit(h){
  h.state='flee'; hv.health--; hv.shake=0.7; sLose(); hvHud();
  hv.fx.push({x:h.x,y:h.y,t:0,em:'🍯'});
  hvMsgShow(HUI.hiveHit[LI()],2200);
  if(hv.health<=0) hvDefeat();
}
function hvUpdate(dt){
  if(hv.inWave && hv.spawnLeft>0){
    hv.spawnT-=dt;
    if(hv.spawnT<=0){ hvSpawn(); hv.spawnT=Math.max(0.55,1.7-hv.wave*0.1); }
  }
  const hx=hiveX(), hy=hiveY()-20;
  for(let i=hv.hornets.length-1;i>=0;i--){
    const h=hv.hornets[i]; h.t+=dt;
    if(h.state==='fly'){
      const dx=hx-h.x, dy=hy-h.y, d=Math.hypot(dx,dy)||1;
      const wob=Math.sin(h.t*5+h.ph)*46;
      h.x+=(dx/d)*h.spd*dt+(-dy/d)*wob*dt;
      h.y+=(dy/d)*h.spd*dt+( dx/d)*wob*dt;
      h.rot=Math.atan2(dy,dx);
      if(d<55) hvHiveHit(h);
    } else if(h.state==='die'){
      h.vy=(h.vy||0)+700*dt; h.y+=h.vy*dt; h.x+=(h.vx||0)*dt; h.rot+=6*dt;
      if(h.y>hvH+80){ h.dead=true; hv.hornets.splice(i,1); }
    } else { /* flee */
      h.y-=220*dt; h.x+=Math.sin(h.t*6)*60*dt;
      if(h.y<-80){ h.dead=true; hv.hornets.splice(i,1); }
    }
  }
  for(let i=hv.bees.length-1;i>=0;i--){
    const b=hv.bees[i], tg=b.tg;
    if(!tg||tg.dead||tg.state==='die'){ hv.bees.splice(i,1); continue; }
    const dx=tg.x-b.x, dy=tg.y-b.y, d=Math.hypot(dx,dy)||1;
    b.x+=dx/d*b.spd*dt; b.y+=dy/d*b.spd*dt;
    if(d<24){
      tg.state='die'; tg.vx=(Math.random()-0.5)*120; tg.vy=-140;
      hv.fx.push({x:tg.x,y:tg.y,t:0,em:'💥'});
      beep(880,.09,0,'square',.12); beep(1245,.12,.07,'square',.1);
      hv.bees.splice(i,1);
    }
  }
  for(let i=hv.fx.length-1;i>=0;i--){ hv.fx[i].t+=dt; if(hv.fx[i].t>0.8) hv.fx.splice(i,1); }
  if(hv.inWave && hv.spawnLeft<=0 && !hv.hornets.length){
    hv.inWave=false; hv.paused=true;
    const bonus=5; score+=bonus; save(); hvHud();
    if(hv.wave>=HV_WAVES){ hvVictory(); }
    else { hv.wave++; sStar(); hvShop(HUI.waveDone[LI()]+' +'+bonus+' ⭐'); }
  }
}

/* ---------- Disegno ---------- */
function hvDrawHive(t){
  const c=hvC, x=hiveX()+Math.sin(t*40)*hv.shake*8, y=hiveY();
  hv.shake=Math.max(0,hv.shake-0.016);
  c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.15)';
  c.beginPath(); c.ellipse(0,54,84,14,0,0,6.29); c.fill();
  for(let i=0;i<6;i++){
    const w=68-i*8, yy=40-i*15;
    c.fillStyle=(i%2)?'#f2b435':'#e8a013';
    c.beginPath(); c.ellipse(0,yy,w,15,0,0,6.29); c.fill();
  }
  c.fillStyle='#7a4a00';
  c.beginPath(); c.arc(0,50,13,Math.PI,0,false); c.fill();
  c.restore();
}
function hvDrawHornet(h,t){
  const c=hvC;
  c.save(); c.translate(h.x,h.y); c.rotate(h.rot);
  const fl=Math.sin(t*42+h.ph)*0.5;
  c.fillStyle='rgba(205,228,255,.75)';
  c.beginPath(); c.ellipse(-2,-13,7,13+fl*4,-0.4,0,6.29); c.fill();
  c.beginPath(); c.ellipse(6,-13,7,13-fl*4,0.4,0,6.29); c.fill();
  c.save();
  c.beginPath(); c.ellipse(0,0,20,11,0,0,6.29); c.clip();
  c.fillStyle='#c96a10'; c.fillRect(-20,-11,40,22);
  c.fillStyle='#3a2405';
  for(const sx of [-9,0,9]) c.fillRect(sx-2.5,-11,5,22);
  c.restore();
  c.fillStyle='#3a2405'; c.beginPath(); c.arc(24,0,7.5,0,6.29); c.fill();
  c.fillStyle='#ff3b30';
  c.beginPath(); c.arc(26,-2.6,2.2,0,6.29); c.fill();
  c.beginPath(); c.arc(26, 2.6,2.2,0,6.29); c.fill();
  c.fillStyle='#3a2405';
  c.beginPath(); c.moveTo(-19,-3); c.lineTo(-31,0); c.lineTo(-19,3); c.closePath(); c.fill();
  c.restore();
}
function hvDraw(t){
  const c=hvC; c.clearRect(0,0,hvW,hvH);
  c.textAlign='center'; c.textBaseline='middle';
  c.font='26px serif';
  for(let k=0;k<8;k++){
    const fx=(((k*137+40)%100)/100)*hvW, fy=hvH-18-((k*61)%42);
    c.fillText(['🌼','🌷','🌻','🌸'][k%4],fx,fy);
  }
  hvDrawHive(t);
  c.font='24px serif';
  for(let k=0;k<3;k++){
    const a=t*1.6+k*2.09;
    c.fillText('🐝', hiveX()+Math.cos(a)*(78+k*9), hiveY()-34+Math.sin(a*1.3)*30);
  }
  c.font='30px serif';
  for(const b of hv.bees) c.fillText('🐝',b.x,b.y);
  for(const h of hv.hornets) hvDrawHornet(h,t);
  c.font='34px serif';
  for(const f of hv.fx){
    c.globalAlpha=Math.max(0,1-f.t/0.8);
    c.fillText(f.em,f.x,f.y-f.t*55);
    c.globalAlpha=1;
  }
}
function hvFrame(ts){
  hv.raf=requestAnimationFrame(hvFrame);
  if(!hv.last) hv.last=ts;
  const dt=Math.min((ts-hv.last)/1000,0.05); hv.last=ts;
  if(!hv.paused) hvUpdate(dt);
  hvDraw(performance.now()/1000);
}

/* ---------- Tocco ---------- */
hvCv.addEventListener('pointerdown',e=>{
  if(hv.paused) return;
  const r=hvCv.getBoundingClientRect();
  const x=e.clientX-r.left, y=e.clientY-r.top;
  let best=null, bd=60*60;
  for(const h of hv.hornets){
    if(h.state!=='fly'||h.targeted) continue;
    const d=(h.x-x)*(h.x-x)+(h.y-y)*(h.y-y);
    if(d<bd){ bd=d; best=h; }
  }
  if(best){
    if(hv.ammo<=0){ sWrong(); hv.paused=true; hvShop(HUI.noAmmo[LI()]); return; }
    hv.ammo--; hvHud();
    best.targeted=true;
    hv.bees.push({x:hiveX(),y:hiveY()-40,tg:best,spd:430});
    beep(700,.08,0,'square',.08);
  } else {
    hv.fx.push({x,y,t:0.3,em:'💨'});
  }
});

/* ---------- Negozio ---------- */
function hvShop(msg){
  const i=LI(); hv.paused=true;
  $('hsTitle').textContent=HUI.shopTitle[i];
  $('hsStats').innerHTML=
    '<span class="statChip">⭐ '+score+'</span>'+
    '<span class="statChip">🐝 '+hv.ammo+'</span>'+
    '<span class="statChip">🌊 '+HUI.wave[i]+' '+hv.wave+'/'+HV_WAVES+'</span>'+
    '<span class="statChip">🍯 '+hv.health+'/'+HV_HEALTH+'</span>';
  $('hsBuyLab').textContent=HUI.buyLab[i];
  $('hsEarnLab').textContent=HUI.earnLab[i];
  $('hsBuy1').textContent=HUI.buy1[i]; $('hsBuy1').disabled=score<HV_PACK1.cost;
  $('hsBuy2').textContent=HUI.buy2[i]; $('hsBuy2').disabled=score<HV_PACK2.cost;
  $('hsQEasy').textContent=HUI.qEasy[i];
  $('hsQHard').textContent=HUI.qHard[i];
  $('hsMsg').textContent=msg||'';
  $('hsGo').textContent=hv.inWave?HUI.goBack[i]:(HUI.goWave[i]+' '+hv.wave+'!');
  $('hiveShop').style.display='flex';
}
function hvBuy(p){
  const i=LI();
  if(score<p.cost){ $('hsMsg').textContent=HUI.noStars[i]; sWrong(); return; }
  score-=p.cost; hv.ammo+=p.n; save(); hvHud(); sToken();
  hvShop(HUI.bought[i]);
}
$('hsBuy1').onclick=()=>hvBuy(HV_PACK1);
$('hsBuy2').onclick=()=>hvBuy(HV_PACK2);
$('hsQEasy').onclick=()=>hqShow('easy');
$('hsQHard').onclick=()=>hqShow('hard');
$('hsGo').onclick=()=>{
  stopSpeak();
  $('hiveShop').style.display='none';
  if(!hv.inWave) hvStartWave(hv.wave);
  else { hv.paused=false; hv.last=0; }
};
$('hvShopBtn').onclick=()=>{
  if($('hiveQ').style.display==='flex'||$('hiveEnd').style.display==='flex') return;
  hv.paused=true; hvShop();
};

/* ---------- Domande (premio: difficoltà, dimezzato con 🔊 o errori) ---------- */
function hqPick(diff){
  const pool=[];
  THEMES.forEach((t,k)=>{ (t[diff]||[]).forEach(q=>pool.push({q,theme:k})); });
  let cand=pool.filter(p=>!hvUsed.has(p.q));
  if(!cand.length){ hvUsed.clear(); cand=pool; }
  return cand[Math.floor(Math.random()*cand.length)];
}
function hqReward(){
  const base=(hq.diff==='easy')?HV_REW_EASY:HV_REW_HARD;
  return Math.max(2,Math.round(base*hq.mult*(hq.voiced?0.5:1)));
}
function hqRewardTxt(){
  const i=LI(), half=hq.voiced||hq.mult<1;
  $('hqReward').textContent=HUI.reward[i]+' +'+hqReward()+' ⭐ '+(half?HUI.rewardHalf[i]:'');
}
function hqShow(diff){
  const pick=hqPick(diff); if(!pick) return;
  hq={diff, q:pick.q, theme:pick.theme, voiced:false, mult:1, done:false};
  hvUsed.add(pick.q);
  const i=LI(), t=THEMES[pick.theme];
  $('hiveShop').style.display='none';
  $('hqEmoji').textContent=t.emoji;
  $('hqTheme').textContent=t.name[i];
  hqRewardTxt();
  $('hqText').textContent=pick.q.q[i];
  $('hqSpeak').textContent=HUI.readBtn[i];
  $('hqSpeak').style.display=VOICEON?'':'none';
  $('hqMsg').textContent='';
  $('hqBack').textContent=HUI.backShop[i];
  const A=$('hqAnswers'); A.innerHTML='';
  shuffle([[pick.q.ok[i],true],[pick.q.no[0][i],false],[pick.q.no[1][i],false]]).forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0]; b.dataset.right=o[1]?'1':'0';
    b.onclick=()=>hqAnswer(b,o[1]);
    A.appendChild(b);
  });
  $('hiveQ').style.display='flex';
}
function hqAnswer(btn,right){
  if(hq.done) return;
  stopSpeak();
  const i=LI();
  if(right){
    hq.done=true;
    document.querySelectorAll('#hqAnswers .ansBtn').forEach(b=>{ b.disabled=true; b.style.pointerEvents='none'; });
    btn.classList.add('right'); sCorrect();
    const g=hqReward(); score+=g; save();
    const praise=UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)];
    $('hqMsg').textContent=praise+'  +'+g+' ⭐'; $('hqMsg').style.color='#3cba54';
    speak(praise);
    setTimeout(()=>{ $('hiveQ').style.display='none'; hvHud(); hvShop(praise+' +'+g+' ⭐'); },1500);
  } else {
    btn.classList.add('wrong'); btn.disabled=true; sWrong();
    hq.mult*=0.5; hqRewardTxt();
    $('hqMsg').textContent=UI.wrong[i]; $('hqMsg').style.color='#e05555';
  }
}
$('hqSpeak').onclick=async()=>{
  if(!hq.q||hq.done) return;
  const i=LI();
  if(!hq.voiced){ hq.voiced=true; hqRewardTxt(); }
  $('hqSpeak').textContent=HUI.reading[i];
  const btns=[...document.querySelectorAll('#hqAnswers .ansBtn:not(:disabled)')];
  const intro=(i===0)?'Le risposte sono:':'The options are:';
  await speak([
    {t:hq.q.q[i], el:$('hqText')},
    intro,
    ...btns.map(b=>({t:b.textContent, el:b, block:true}))
  ]);
  $('hqSpeak').textContent=HUI.readBtn[i];
};
$('hqBack').onclick=()=>{ stopSpeak(); $('hiveQ').style.display='none'; hvShop(); };

/* ---------- Vittoria / sconfitta ---------- */
function hvVictory(){
  hv.paused=true; hv.inWave=false; stopMusic(); fanfare(); confetti();
  const i=LI();
  $('heEmoji').textContent='🏆';
  $('heTitle').textContent=HUI.winTitle[i]; $('heTitle').style.color='#e8a013';
  $('heText').textContent=HUI.winText[i]+' ⭐'+score;
  $('heRetry').textContent=HUI.again[i];
  $('heMenu').textContent=HUI.toMenu[i];
  $('hiveEnd').style.display='flex';
  speak(UI.speakBravo[i]);
}
function hvDefeat(){
  hv.paused=true; hv.inWave=false; stopMusic(); sLose();
  hv.hornets=[]; hv.bees=[];
  const i=LI();
  $('heEmoji').textContent='😢';
  $('heTitle').textContent=HUI.loseTitle[i]; $('heTitle').style.color='#c0392b';
  $('heText').textContent=HUI.loseText[i];
  $('heRetry').textContent=HUI.retry[i];
  $('heMenu').textContent=HUI.toMenu[i];
  $('hiveEnd').style.display='flex';
}
$('heRetry').onclick=()=>{
  $('hiveEnd').style.display='none';
  if(hv.health<=0){ /* sconfitta: riprova la stessa ondata */
    hv.health=HV_HEALTH; hv.ammo+=5; hv.hornets=[]; hv.bees=[]; hv.inWave=false;
  } else { /* vittoria: ricomincia da capo */
    hvReset();
  }
  if(MUSICON){ mCtx(); playMusic(TRK_LEVEL); }
  hvHud(); hvShop();
};
$('heMenu').onclick=()=>{ $('hiveEnd').style.display='none'; hvExit(); };

/* ---------- Entra / esci ---------- */
function hvEnter(){
  if(VOICEON) initTTS();
  paused=true; stopSpeak();
  ['modeSel','menu'].forEach(id=>$(id).style.display='none');
  $('hud').style.display='none'; $('joy').style.display='none';
  hvReset(); hvResize(); hvHud();
  $('hive').style.display='block';
  if(MUSICON){ mCtx(); playMusic(TRK_LEVEL); }
  if(!hv.raf) hv.raf=requestAnimationFrame(hvFrame);
  hvShop();
}
function hvExit(){
  cancelAnimationFrame(hv.raf); hv.raf=0; hv.paused=true;
  ['hive','hiveShop','hiveQ','hiveEnd'].forEach(id=>$(id).style.display='none');
  stopSpeak();
  showModeSel();
}
$('hvHomeBtn').onclick=hvExit;
$('hvMusicBtn').onclick=()=>{
  MUSICON=!MUSICON; save();
  if(!MUSICON) stopMusic(); else { mCtx(); playMusic(TRK_LEVEL); }
  hvHud();
};

/* ---------- Scelta del gioco ---------- */
function showModeSel(){
  paused=true; stopSpeak();
  const i=LI();
  const nm=(typeof PLAYER!=='undefined'&&PLAYER)?PLAYER:((typeof LANG!=='undefined'&&LANG==='en')?'Champion':'Campione');
  $('modeTitle').textContent=(i===0)?('🌟 I Giochi di '+nm+' 🌟'):('🌟 '+nm+"'s Games 🌟");
  $('modeSub').textContent=HUI.modeSub[i];
  $('modeMazeNm').textContent=HUI.mazeNm[i]; $('modeMazeSub').textContent=HUI.mazeSub[i];
  $('modeHiveNm').textContent=HUI.hiveNm[i]; $('modeHiveSub').textContent=HUI.hiveSub[i];
  $('hud').style.display='none'; $('joy').style.display='none';
  $('menu').style.display='none'; $('hive').style.display='none';
  if(MUSICON && actx && actx.state==='running') playMusic(TRK_MENU);
  $('modeSel').style.display='flex';
}
$('modeMaze').onclick=()=>{ $('modeSel').style.display='none'; showMenu(); };
$('modeHive').onclick=hvEnter;

/* pulsante "cambia gioco" nel menu del labirinto */
(function(){
  const row=document.querySelector('#menu .togRow');
  if(row){
    const b=document.createElement('button');
    b.className='togBtn'; b.id='btnMode';
    b.onclick=()=>{ $('menu').style.display='none'; showModeSel(); };
    row.insertBefore(b,row.firstChild);
  }
})();
const hvOldApplyUI=applyUI;
applyUI=function(){
  hvOldApplyUI();
  const b=$('btnMode'); if(b) b.textContent=HUI.switchBtn[LI()];
};

/* musica del menu al primo tocco anche sulla schermata di scelta */
addEventListener('pointerdown',()=>{
  if(MUSICON && !mTrack && $('modeSel').style.display==='flex'){ mCtx(); playMusic(TRK_MENU); }
},true);

/* all'avvio: mostra la scelta del gioco */
showModeSel();
