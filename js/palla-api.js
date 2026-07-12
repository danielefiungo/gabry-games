/* ============================================================
   L'ALVEARE DI GABRIELE — gestionale di lettura e difesa
   Regina -> uova -> operaie -> fiori -> miele -> guerriere.
   Un click su un calabrone assegna le guerriere disponibili.
   Le domande corrette fanno nascere nuove guerriere.
   ============================================================ */

(function(){
  const css=document.createElement('style');
  css.textContent=`
  #pa{position:absolute;inset:0;display:none;z-index:8;overflow:hidden;background:linear-gradient(#78cef1 0 55%,#a5df75 55% 100%)}
  #paCv{position:absolute;inset:0;touch-action:manipulation;cursor:crosshair}
  #paHud{position:absolute;inset:10px 12px auto;z-index:9;display:flex;align-items:center;gap:8px;flex-wrap:wrap;pointer-events:none}
  #paHud .paMeter{background:rgba(255,255,255,.94);border:3px solid #fff;border-radius:16px;padding:7px 11px;box-shadow:0 4px 12px #315d7030;font-size:16px;font-weight:700;color:#4d3a18;white-space:nowrap}
  #paHudBtns{margin-left:auto;display:flex;gap:7px;pointer-events:auto}
  #paMsg{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);z-index:10;max-width:min(680px,92vw);padding:11px 18px;border-radius:18px;background:#3f2b20e8;color:#fff;font-size:18px;font-weight:700;text-align:center;box-shadow:0 5px 16px #0004;pointer-events:none}
  #paTask{position:absolute;top:82px;left:12px;z-index:9;max-width:330px;background:#fff9dfef;border:3px solid #efb92f;border-radius:18px;padding:10px 14px;color:#674712;font-weight:700;line-height:1.35;pointer-events:none}
  #paAsk{position:absolute;z-index:11;border:0;border-radius:50%;width:74px;height:74px;font:700 30px Andika,sans-serif;background:linear-gradient(#ffe76b,#f2a91b);box-shadow:0 7px 0 #b56b10,0 10px 20px #0003;cursor:pointer}
  #paAsk:active{transform:translateY(4px);box-shadow:0 3px 0 #b56b10}
  #paAsk small{display:block;font-size:10px;line-height:10px}
  #paQ .card{max-width:min(900px,95vw);border:4px solid #f1b82f;background:linear-gradient(#fffdf2,#fff0b7)}
  #paQTitle{font-size:24px;color:#9a6200;font-weight:700}
  #paQText{font-size:clamp(27px,5vw,40px);line-height:1.45;margin:14px 0;color:#302314}
  #paQAnswers{display:grid;gap:11px;grid-template-columns:repeat(3,1fr)}
  #paQLevels{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0}
  .paLevelBtn{border:0;border-radius:18px;padding:15px 10px;color:#fff;font:700 19px Andika,sans-serif;cursor:pointer;box-shadow:0 5px 0 #0003}
  .paLevelBtn:nth-child(1){background:#38a6a0}.paLevelBtn:nth-child(2){background:#47ad5b}.paLevelBtn:nth-child(3){background:#ef9f25}.paLevelBtn:nth-child(4){background:#d94b4b}
  .paLevelBtn small{display:block;font-size:14px;margin-top:4px}
  #paQMsg{min-height:30px;font-size:20px;font-weight:700;margin-top:12px}
  #paIntro .card{max-width:720px;border:4px solid #f1b82f;background:linear-gradient(#fffdf1,#ffefb5)}
  #paIntro h2{font-size:clamp(27px,5vw,39px);color:#9a6200;margin:4px}
  #paIntro p{font-size:18px;line-height:1.5;text-align:left}
  .paLegend{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;text-align:left;margin:15px 0}
  .paLegend span{background:#fff;border-radius:13px;padding:9px}
  @media(max-width:650px){#paHud{gap:4px;inset:5px 5px auto}#paHud .paMeter{font-size:12px;padding:5px 7px;border-width:2px}#paTask{top:100px;font-size:13px;max-width:250px}.paLegend,#paQAnswers,#paQLevels{grid-template-columns:1fr}#paQAnswers .ansBtn{font-size:17px;padding:10px}#paAsk{width:64px;height:64px}}
  `;
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',`
    <div id="pa"><canvas id="paCv"></canvas>
      <div id="paHud">
        <div class="paMeter" id="paEggs">🥚 0</div><div class="paMeter" id="paWorkers">🌼 0</div>
        <div class="paMeter" id="paWarriors">🛡️ 0</div><div class="paMeter" id="paHoney">🍯 0</div>
        <div class="paMeter" id="paWave">⚔️ 1</div><div id="paHudBtns"><button class="hudBtn" id="paMusicBtn">🎵</button><button class="hudBtn" id="paHomeBtn">🏠</button></div>
      </div>
      <div id="paTask"></div><div id="paMsg"></div><button id="paAsk">📖<small>NUOVA APE</small></button>
    </div>
    <div class="overlay" id="paIntro"><div class="card"><div style="font-size:58px">👑🐝</div><h2>L'alveare di Gabriele</h2>
      <p>La Regina depone un uovo ogni pochi secondi. Scegli se trasformarlo in una bottinatrice oppure rispondi a una domanda per creare guerriere.</p>
      <div class="paLegend"><span>👑 La <b>regina</b> produce le uova necessarie.</span><span>🌼 Le <b>bottinatrici</b> raccolgono nettare e producono miele.</span><span>🍯 Più <b>miele</b> significa guerriere più forti.</span><span>📖 Ogni nuova <b>guerriera</b> consuma un uovo.</span><span>👆 Tocca un <b>calabrone</b> per mandarla.</span><span>⚠️ Le ondate richiedono nuove guerriere per essere vinte.</span></div>
      <button class="bigBtn" id="paIntroGo">Proteggi l'alveare! 🛡️</button></div></div>
    <div class="overlay" id="paQ"><div class="card"><div style="font-size:46px">📖🐝</div><div id="paQTitle"></div><div id="paQLevels">
      <button class="paLevelBtn" data-worker="1">🌼 BOTTINATRICE<small>1 uovo → raccoglie miele</small></button><button class="paLevelBtn" data-level="easy">🌱 FACILE<small>1 uovo → 1 guerriera</small></button><button class="paLevelBtn" data-level="medium">🌻 MEDIO<small>2 uova → 2 guerriere</small></button><button class="paLevelBtn" data-level="hard">🔥 DIFFICILE<small>3 uova → 3 guerriere</small></button></div>
      <div id="paQText"></div><button id="paQSpeak" class="jollyBtn">🔊 Leggimela</button><div id="paQAnswers"></div><div id="paQMsg"></div><button id="paQBack" style="border:0;background:none;color:#777;text-decoration:underline;margin-top:8px">torna al gioco</button>
    </div></div>
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
  scout:{name:'ESPLORATORE',icon:'💨',hp:3.2,speed:1.55,damage:1,scale:.92,body:'#f5a623',head:'#cf6b16',reward:4},
  raider:{name:'PREDONE',icon:'🍯',hp:6.4,speed:1,damage:2,scale:1.15,body:'#e57b18',head:'#a94716',reward:7},
  tank:{name:'CORAZZATO',icon:'🪨',hp:11,speed:.68,damage:3,scale:1.42,body:'#9b5a2e',head:'#71391f',reward:11},
  commander:{name:'COMANDANTE',icon:'⚡',hp:15,speed:1.18,damage:4,scale:1.58,body:'#d34b28',head:'#8e251b',reward:16},
  king:{name:'RE DEI CALABRONI',icon:'👑',hp:25,speed:.86,damage:5,scale:1.85,body:'#7d3ac1',head:'#4d247b',reward:30}
};
const PA_QUESTIONS={
  easy:[
    ['Quale parola comincia con A?','APE','SOLE','LUNA'],['Completa: A _ E','P','M','T'],
    ['Quale animale vola?','APE','GATTO','PESCE'],['Che cosa producono le api?','MIELE','LATTE','PANE'],
    ['Quale parola comincia con F?','FIORE','NIDO','APE'],['Completa: MIE _ E','L','R','N']
  ],
  medium:[
    ['Che cosa raccolgono le api sui fiori?','NETTARE','SABBIA','NEVE'],['Qual è il plurale di APE?','API','APO','APA'],
    ['Quale parola è scritta bene?','CALABRONE','CALABRNOE','CALBORANE'],['La regina depone le…','UOVA','PIETRE','STELLE'],
    ['Quale parola ha tre sillabe?','ALVEARE','APE','RE'],['Completa la frase: le api volano sui…','FIORI','MARI','TRENI']
  ],
  hard:[
    ['Quale frase è scritta correttamente?','LE API RACCOLGONO IL NETTARE','LE API RACCOGLIE IL NETTARE','LE APE RACCOLGONO I NETTARE'],
    ['Quale parola significa “proteggere da un pericolo”?','DIFENDERE','DORMIRE','COLORARE'],
    ['Completa: Le guerriere sono tornate perché il calabrone è…','SCONFITTO','RACCOLTO','FIORITO'],
    ['Quale frase racconta una causa e una conseguenza?','LE API RACCOLGONO NETTARE, QUINDI PRODUCONO MIELE','IL FIORE È GIALLO E ROSA','IL CALABRONE VOLA ALTO'],
    ['Qual è il contrario di VELOCE?','LENTO','FORTE','GRANDE'],
    ['Scegli la frase con il verbo al plurale.','LE OPERAIE VOLANO','LA REGINA VOLA','IL CALABRONE ATTACCA']
  ]
};
const PA_Q_REWARD={easy:1,medium:2,hard:3};

let pa={on:false,paused:true,raf:0,last:0,w:0,h:0,time:0,eggs:1,eggClock:0,workerClock:0,workers:2,warriors:1,honey:1,honeyFrac:0,
  bees:[],hornets:[],flowers:[],fx:[],wave:1,waveKills:0,killed:0,lost:0,spawnClock:3,nextId:1,msgTimer:0,qUsed:[],queen:null,hive:null};
const paCv=$('paCv'),paC=paCv.getContext('2d');

function paResize(){const d=Math.min(devicePixelRatio||1,2);pa.w=innerWidth;pa.h=innerHeight;paCv.width=pa.w*d;paCv.height=pa.h*d;paCv.style.width=pa.w+'px';paCv.style.height=pa.h+'px';paC.setTransform(d,0,0,d,0,0);paLayout();}
function paLayout(){pa.hive={x:pa.w*.22,y:pa.h*.72};pa.queen={x:pa.hive.x,y:pa.hive.y-15};pa.flowers=[];for(let i=0;i<7;i++)pa.flowers.push({x:pa.w*(.48+(i%4)*.14),y:pa.h*(.68+Math.floor(i/4)*.18),c:i%PA_FLOWERS.length});const ask=$('paAsk');if(ask){const size=pa.w<650?64:74;ask.style.left=Math.min(pa.w-size-8,pa.hive.x+72)+'px';ask.style.top=Math.min(pa.h-size-8,pa.hive.y-35)+'px';}}
function paSay(t,ms=2600){$('paMsg').textContent=t;$('paMsg').style.display='block';pa.msgTimer=ms/1000;}
function paHud(){
  const avail=pa.bees.filter(b=>b.role==='warrior'&&b.state==='idle').length;
  $('paEggs').textContent='🥚 '+pa.eggs+' disponibili';$('paWorkers').textContent='🌼 '+pa.workers+' bottinatrici · '+Math.round(pa.honeyFrac*100)+'%';
  $('paWarriors').textContent='🛡️ '+avail+'/'+pa.warriors+' pronte';$('paHoney').textContent='🍯 '+pa.honey+'  Forza '+paPower();
  $('paWave').textContent='⚔️ '+pa.wave+'/8 · '+pa.waveKills+'/'+paWaveGoal();$('paMusicBtn').textContent=MUSICON?'🎵':'🔇';
  $('paTask').innerHTML='<b>ORGANIZZA L’ALVEARE</b><br>👑 La regina depone le uova.<br>📖 Spendi uova per creare guerriere.<br>🌼 Le bottinatrici producono miele.<br>🍯 Il miele moltiplica la forza: x'+paPower()+'.';
}
function paPower(){return 1+Math.min(5,Math.floor(pa.honey/2));}
function paWaveGoal(){return 2+Math.ceil(pa.wave/2);}
function paBee(role){const a=Math.random()*PA_TWO_PI,r=35+Math.random()*45;return{id:pa.nextId++,role,state:'idle',x:pa.hive.x+Math.cos(a)*r,y:pa.hive.y-45+Math.sin(a)*r*.5,vx:0,vy:0,phase:Math.random()*PA_TWO_PI,energy:100,target:null,flower:null,carry:false,rest:0};}
function paReset(){
  Object.assign(pa,{paused:true,last:0,time:0,eggs:1,eggClock:0,workerClock:0,workers:2,warriors:1,honey:1,honeyFrac:0,bees:[],hornets:[],fx:[],wave:1,waveKills:0,killed:0,lost:0,spawnClock:3,nextId:1,msgTimer:0,qUsed:[]});
  paLayout();for(let i=0;i<2;i++)pa.bees.push(paBee('worker'));pa.bees.push(paBee('warrior'));paHud();
}
function paSpawnHornet(){
  let type='scout';
  if(pa.wave===8&&pa.hornets.length===0)type='king';
  else{const r=Math.random();if(pa.wave>=6&&r<.2)type='commander';else if(pa.wave>=4&&r<.48)type='tank';else if(pa.wave>=2&&r<.78)type='raider';}
  const cfg=PA_HORNET_TYPES[type],boss=type==='king',side=Math.random()<.5?-1:1;
  const hp=cfg.hp*1.28*(1+(pa.wave-1)*.12);
  pa.hornets.push({id:pa.nextId++,type,cfg,x:side<0?-65:pa.w+65,y:100+Math.random()*Math.max(100,pa.h*.36),hp,maxHp:hp,speed:(36+pa.wave*3.1)*cfg.speed,phase:Math.random()*6,targetX:pa.hive.x,targetY:pa.hive.y-45,assigned:[],dead:false,boss,hit:0});
  paSay(cfg.icon+' '+cfg.name+'! '+(type==='scout'?'È velocissimo!':type==='tank'?'È lento ma molto resistente!':boss?'Servono tante guerriere!':'Toccalo per mandare le guerriere!'));
}
function paAssign(h){
  const b=pa.bees.find(x=>x.role==='warrior'&&x.state==='idle'&&x.energy>20);
  if(!b){paSay('Nessuna guerriera pronta. Aspetta il riposo o rispondi a una domanda!');return;}
  b.state='fight';b.target=h;b.energy=Math.max(0,b.energy-4);h.assigned.push(b);pa.fx.push({x:h.x,y:h.y,t:0,text:'🛡️ +1'});paSay('Guerriera assegnata! Tocca ancora per mandarne un’altra.');paHud();
}
function paMove(b,tx,ty,s,dt){const dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy)||1;b.vx+=(dx/d*s-b.vx)*Math.min(1,dt*3);b.vy+=(dy/d*s-b.vy)*Math.min(1,dt*3);b.x+=b.vx*dt;b.y+=b.vy*dt;return d;}
function paUpdate(dt){
  pa.time+=dt;if(pa.msgTimer>0){pa.msgTimer-=dt;if(pa.msgTimer<=0)$('paMsg').style.display='none';}
  pa.eggClock+=dt;if(pa.eggClock>6){pa.eggClock=0;pa.eggs++;pa.fx.push({x:pa.queen.x,y:pa.queen.y,t:0,text:'🥚 +1'});paSay('👑 La regina ha deposto un uovo!');paHud();}
  pa.spawnClock-=dt;if(pa.spawnClock<=0&&pa.hornets.length<Math.min(5,2+Math.floor(pa.wave/2))){paSpawnHornet();pa.spawnClock=Math.max(3.4,6.2-pa.wave*.32);}
  for(const b of pa.bees){b.phase+=dt*12;
    if(b.role==='worker'){
      if(!b.flower)b.flower=pa.flowers[Math.floor(Math.random()*pa.flowers.length)];
      if(b.state==='idle'||b.state==='gather'){
        b.state='gather';const d=paMove(b,b.flower.x,b.flower.y-24,108,dt);
        if(d<14){b.carry=true;b.state='return';}
      }else if(b.state==='return'){
        const d=paMove(b,pa.hive.x+20,pa.hive.y-40,126,dt);
        if(d<18){pa.honeyFrac+=.3;if(pa.honeyFrac>=1){pa.honey++;pa.honeyFrac-=1;pa.fx.push({x:pa.hive.x,y:pa.hive.y-85,t:0,text:'🍯 +1 · FORZA x'+paPower()});paSay('🍯 Le bottinatrici hanno prodotto miele: guerriere più forti!');}paHud();b.carry=false;b.flower=pa.flowers[Math.floor(Math.random()*pa.flowers.length)];b.state='gather';}
      }
    }else if(b.state==='fight'){
      const h=b.target;if(!h||h.dead){b.state='return';b.target=null;}else{const n=h.assigned.indexOf(b),a=pa.time*2.8+n*PA_TWO_PI/Math.max(1,h.assigned.length);const d=paMove(b,h.x+Math.cos(a)*30,h.y+Math.sin(a)*22,168,dt);if(d<40){b.energy-=dt*.65;h.hp-=dt*.62*paPower();h.hit=.1;}}
    }else if(b.state==='return'){
      if(paMove(b,pa.hive.x+(b.id%5-2)*13,pa.hive.y-50,122,dt)<18){b.state='rest';b.rest=0;}
    }else if(b.state==='rest'){
      b.rest+=dt;b.energy=Math.min(100,b.energy+dt*5);if(b.rest>5&&b.energy>55)b.state='idle';
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
      h.dead=true;pa.lost++;pa.honey=Math.max(0,pa.honey-h.cfg.damage);
      for(const b of h.assigned){b.state='return';b.target=null;}
      paSay('💥 '+h.cfg.name+' ha raggiunto l’alveare e rubato '+h.cfg.damage+' miele!');paHud();
    }
    if(!h.dead&&h.hp<=0){h.dead=true;pa.killed++;pa.waveKills++;score+=h.cfg.reward;save();for(const b of h.assigned){b.state='return';b.target=null;}pa.fx.push({x:h.x,y:h.y,t:0,text:'✨ +'+h.cfg.reward});sCorrect();paSay(h.cfg.name+' sconfitto! Le guerriere tornano a riposare.');paHud();}
  }
  pa.hornets=pa.hornets.filter(h=>!h.dead);
  for(const f of pa.fx)f.t+=dt;pa.fx=pa.fx.filter(f=>f.t<1.4);
  if(pa.waveKills>=paWaveGoal()){if(pa.wave>=8)paFinish(true);else{pa.wave++;pa.waveKills=0;pa.spawnClock=2.2;paSay('🌟 Ondata superata! Prepara nuove guerriere: ora saranno di più.');paHud();}}
  if(pa.honey<=0&&pa.lost>=3)paFinish(false);
}

function paRound(x,y,w,h,r=12){paC.beginPath();paC.roundRect(x,y,w,h,r);}
function paDrawFlower(f,t){const c=PA_FLOWERS[f.c],s=1+Math.sin(t*1.5+f.x)*.04;paC.strokeStyle='#39843e';paC.lineWidth=5;paC.beginPath();paC.moveTo(f.x,f.y+35);paC.quadraticCurveTo(f.x-10,f.y+10,f.x,f.y);paC.stroke();paC.save();paC.translate(f.x,f.y);paC.scale(s,s);for(let i=0;i<7;i++){const a=i*PA_TWO_PI/7;paC.fillStyle=c[0];paC.beginPath();paC.ellipse(Math.cos(a)*13,Math.sin(a)*13,9,14,a,0,PA_TWO_PI);paC.fill();}paC.fillStyle=c[1];paC.beginPath();paC.arc(0,0,9,0,PA_TWO_PI);paC.fill();paC.restore();}
function paDrawHive(){const {x,y}=pa.hive;paC.fillStyle='#0002';paC.beginPath();paC.ellipse(x,y+47,85,14,0,0,PA_TWO_PI);paC.fill();for(let i=0;i<6;i++){const w=70-i*8,yy=y+30-i*15,g=paC.createLinearGradient(x,yy-12,x,yy+12);g.addColorStop(0,'#ffd866');g.addColorStop(1,'#d99315');paC.fillStyle=g;paC.strokeStyle='#925b0b';paC.lineWidth=3;paC.beginPath();paC.ellipse(x,yy,w,17,0,0,PA_TWO_PI);paC.fill();paC.stroke();}paC.fillStyle='#4a2709';paC.beginPath();paC.arc(x,y+37,15,Math.PI,0);paC.fill();paC.fillStyle='#9b622c';paRound(x-72,y+46,144,12,5);paC.fill();}
function paDrawBee(b,queen=false){const c=paC,s=queen?1.75:(b.role==='warrior'?1.2:1),ang=Math.atan2(b.vy,b.vx),dir=Math.cos(ang)>=0?1:-1,tilt=dir>0?ang:Math.PI-ang;c.save();c.translate(b.x,b.y);c.rotate(tilt);c.scale(dir*s,s);c.fillStyle='#dff6ffcc';c.strokeStyle='#7bb5cf';c.lineWidth=1;c.beginPath();c.ellipse(-4,-9,6,10,-.5,0,PA_TWO_PI);c.ellipse(5,-9,6,10,.5,0,PA_TWO_PI);c.fill();c.stroke();c.save();c.beginPath();c.ellipse(0,0,14,9,0,0,PA_TWO_PI);c.clip();c.fillStyle=queen?'#ffc83d':'#ffd43b';c.fillRect(-15,-10,30,20);c.fillStyle='#3a2a10';c.fillRect(-7,-10,4,20);c.fillRect(3,-10,4,20);c.restore();c.strokeStyle='#3a2a10';c.lineWidth=2;c.beginPath();c.ellipse(0,0,14,9,0,0,PA_TWO_PI);c.stroke();c.fillStyle='#efaa28';c.beginPath();c.arc(13,0,7,0,PA_TWO_PI);c.fill();c.stroke();c.fillStyle='#241a10';c.beginPath();c.arc(15,-2,1.5,0,PA_TWO_PI);c.fill();c.beginPath();c.moveTo(-14,-2);c.lineTo(-21,0);c.lineTo(-14,2);c.fill();if(b.role==='warrior'){c.fillStyle='#c84b31';paRound(7,-10,13,5,2);c.fill();c.fillStyle='#fff';c.font='9px sans-serif';c.fillText('✦',12,-6);}if(queen){c.font='15px serif';c.fillText('👑',5,-14);}if(b.carry){c.font='12px serif';c.fillText('🍯',-8,13);}c.restore();}
function paDrawHornet(h){const c=paC,s=h.cfg.scale,a=Math.atan2(h.targetY-h.y,h.targetX-h.x),dir=Math.cos(a)>=0?1:-1,tilt=dir>0?a:Math.PI-a;c.save();c.translate(h.x,h.y);c.rotate(tilt);c.scale(dir*s,s);if(h.hit)c.translate((Math.random()-.5)*4,0);c.fillStyle='#d7efffcc';c.strokeStyle='#678ca3';c.lineWidth=1.5;c.beginPath();c.ellipse(-5,-14,8,14,-.4,0,PA_TWO_PI);c.ellipse(6,-14,8,14,.4,0,PA_TWO_PI);c.fill();c.stroke();c.save();c.beginPath();c.ellipse(0,0,23,13,0,0,PA_TWO_PI);c.clip();c.fillStyle=h.cfg.body;c.fillRect(-25,-14,50,28);c.fillStyle='#35230d';for(let x=-15;x<15;x+=10)c.fillRect(x,-14,5,28);c.restore();c.strokeStyle='#35230d';c.lineWidth=h.type==='tank'?4:3;c.beginPath();c.ellipse(0,0,23,13,0,0,PA_TWO_PI);c.stroke();c.fillStyle=h.cfg.head;c.beginPath();c.arc(22,0,12,0,PA_TWO_PI);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(25,-3,4,0,PA_TWO_PI);c.fill();c.fillStyle='#c1121f';c.beginPath();c.arc(26,-3,2,0,PA_TWO_PI);c.fill();c.strokeStyle='#35230d';c.beginPath();c.moveTo(18,-10);c.lineTo(29,-7);c.stroke();c.beginPath();c.moveTo(-23,-3);c.lineTo(-35,0);c.lineTo(-23,3);c.fill();c.restore();const w=h.boss?112:76,top=h.boss?66:50,fr=Math.max(0,h.hp/h.maxHp);c.fillStyle='#fff';paRound(h.x-w/2,h.y-top,w,10,5);c.fill();c.fillStyle=fr>.45?'#50b85a':'#e24b3b';paRound(h.x-w/2+2,h.y-top+2,(w-4)*fr,6,3);c.fill();c.fillStyle='#3b2915';c.font='bold 12px Andika';c.textAlign='center';c.fillText(h.cfg.icon+' '+h.cfg.name+' · '+h.assigned.length+' 🐝',h.x,h.y-top-9);}
function paDraw(){const t=pa.time,c=paC;c.clearRect(0,0,pa.w,pa.h);const sky=c.createLinearGradient(0,0,0,pa.h);sky.addColorStop(0,'#70c9ef');sky.addColorStop(.58,'#d8f5ff');sky.addColorStop(.59,'#87cb62');sky.addColorStop(1,'#4d9b45');c.fillStyle=sky;c.fillRect(0,0,pa.w,pa.h);c.fillStyle='#ffe45e';c.beginPath();c.arc(pa.w-70,80,35,0,PA_TWO_PI);c.fill();c.fillStyle='#fff9';for(let i=0;i<4;i++){const x=(i*300+t*8)%(pa.w+180)-90,y=75+i*45;c.beginPath();c.ellipse(x,y,55,18,0,0,PA_TWO_PI);c.ellipse(x+35,y-10,35,16,0,0,PA_TWO_PI);c.fill();}c.fillStyle='#7cbc58';c.beginPath();c.ellipse(pa.w*.3,pa.h*.65,pa.w*.48,pa.h*.18,0,Math.PI,PA_TWO_PI);c.fill();c.fillStyle='#67ae4d';c.beginPath();c.ellipse(pa.w*.8,pa.h*.68,pa.w*.45,pa.h*.2,0,Math.PI,PA_TWO_PI);c.fill();for(const f of pa.flowers)paDrawFlower(f,t);paDrawHive();paDrawBee({x:pa.queen.x,y:pa.queen.y,vx:1,vy:0,role:'queen'},true);for(const b of pa.bees)paDrawBee(b);for(const h of pa.hornets)paDrawHornet(h);c.textAlign='center';c.font='bold 25px Andika';for(const f of pa.fx){c.globalAlpha=1-f.t/1.4;c.fillStyle='#fff';c.strokeStyle='#4b3216';c.lineWidth=4;c.strokeText(f.text,f.x,f.y-f.t*35);c.fillText(f.text,f.x,f.y-f.t*35);}c.globalAlpha=1;}
function paFrame(ts){pa.raf=requestAnimationFrame(paFrame);if(!pa.last)pa.last=ts;const dt=Math.min(.05,(ts-pa.last)/1000);pa.last=ts;if(!pa.paused)paUpdate(dt);paDraw();}

paCv.addEventListener('pointerdown',e=>{if(pa.paused)return;const r=paCv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let hit=null,bd=80*80;for(const h of pa.hornets){const d=(h.x-x)**2+(h.y-y)**2;if(d<bd){bd=d;hit=h;}}if(hit)paAssign(hit);else paSay('Tocca direttamente un calabrone per assegnare una guerriera.');});

function paPickQ(level){const questions=PA_QUESTIONS[level],prefix=level+':';let pool=questions.map((q,i)=>({q,i})).filter(x=>!pa.qUsed.includes(prefix+x.i));if(!pool.length){pa.qUsed=pa.qUsed.filter(x=>!x.startsWith(prefix));pool=questions.map((q,i)=>({q,i}));}const p=pool[Math.floor(Math.random()*pool.length)];pa.qUsed.push(prefix+p.i);return p.q;}
let paCurrentQ=null,paQDone=false,paQLevel='easy';
function paShowQ(){pa.paused=true;paCurrentQ=null;paQDone=false;$('paQTitle').textContent='Scegli come usare le uova';$('paQLevels').style.display='grid';$('paQText').textContent='La regina ha deposto '+pa.eggs+(pa.eggs===1?' uovo disponibile.':' uova disponibili.');$('paQSpeak').style.display='none';$('paQAnswers').innerHTML='';$('paQMsg').textContent=pa.eggs?'Crea una bottinatrice oppure affronta una domanda per le guerriere.':'Aspetta che la regina deponga un uovo!';$('paQLevels').querySelectorAll('button').forEach(b=>{const need=b.dataset.worker?1:PA_Q_REWARD[b.dataset.level];b.disabled=pa.eggs<need;b.style.opacity=b.disabled?'.35':'1';});$('paQ').style.display='flex';}
function paMakeWorker(){if(pa.eggs<1)return;pa.eggs--;pa.workers++;pa.bees.push(paBee('worker'));sCorrect();paHud();$('paQ').style.display='none';pa.paused=false;pa.last=0;paSay('🌼 È nata una bottinatrice! Raccoglierà nettare per produrre miele.');}
function paStartQ(level){const reward=PA_Q_REWARD[level];if(pa.eggs<reward){$('paQMsg').textContent='Non ci sono abbastanza uova!';return;}paQLevel=level;paCurrentQ=paPickQ(level);paQDone=false;const names={easy:'FACILE',medium:'MEDIO',hard:'DIFFICILE'};$('paQTitle').textContent=names[level]+' — userai '+reward+(reward===1?' uovo':' uova');$('paQLevels').style.display='none';$('paQText').textContent=paCurrentQ[0];$('paQSpeak').style.display='inline-block';$('paQMsg').textContent='';const a=$('paQAnswers');a.innerHTML='';shuffle([[paCurrentQ[1],1],[paCurrentQ[2],0],[paCurrentQ[3],0]]).forEach(([txt,ok])=>{const b=document.createElement('button');b.className='ansBtn';b.textContent=txt;b.onclick=()=>paAnswer(b,ok);a.appendChild(b);});}
function paAnswer(b,ok){if(paQDone)return;if(ok){paQDone=true;b.classList.add('right');document.querySelectorAll('#paQAnswers button').forEach(x=>x.disabled=true);const reward=PA_Q_REWARD[paQLevel];pa.eggs-=reward;for(let i=0;i<reward;i++)pa.bees.push(paBee('warrior'));pa.warriors+=reward;score+=reward*5;save();sCorrect();$('paQMsg').style.color='#299447';$('paQMsg').textContent=reward===1?'Bravissimo! L’uovo è diventato una guerriera! 🐝🛡️':'Bravissimo! '+reward+' uova sono diventate guerriere! 🐝🛡️';paHud();setTimeout(()=>{$('paQ').style.display='none';pa.paused=false;pa.last=0;paSay('Le nuove guerriere sono pronte. Tocca un calabrone!');},1400);}else{b.disabled=true;b.classList.add('wrong');sWrong();$('paQMsg').style.color='#d53e3e';$('paQMsg').textContent='Quasi! Prova un’altra risposta.';}}
$('paQLevels').querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>paStartQ(b.dataset.level));
$('paQLevels').querySelector('[data-worker]').onclick=paMakeWorker;
$('paAsk').onclick=paShowQ;$('paQBack').onclick=()=>{stopSpeak();$('paQ').style.display='none';pa.paused=false;pa.last=0;};$('paQSpeak').onclick=()=>speak([{t:paCurrentQ?paCurrentQ[0]:'',el:$('paQText')}]);
function paFinish(win){if(pa.paused)return;pa.paused=true;stopMusic();$('paEndEm').textContent=win?'🏆🐝':'🌧️🐝';$('paEndTitle').textContent=win?'ALVEARE SALVO!':'RIPROVIAMO!';$('paEndTxt').innerHTML=win?'Hai guidato operaie e guerriere fino alla vittoria!<br>Calabroni sconfitti: '+pa.killed+' · Punti: '+score:'I calabroni hanno preso il miele, ma ora sai come organizzare l’alveare.';$('paEnd').style.display='flex';if(win){fanfare();confetti();}}
$('paAgain').onclick=()=>{$('paEnd').style.display='none';paReset();pa.paused=false;paSay('La Regina ha iniziato a deporre le uova!');if(MUSICON){mCtx();playMusic(TRK_HIVE);}};$('paEndHome').onclick=paExit;
function paEnter(){if(VOICEON)initTTS();paused=true;stopSpeak();['modeSel','menu'].forEach(id=>$(id).style.display='none');$('hud').style.display='none';$('joy').style.display='none';$('pa').style.display='block';pa.on=true;paResize();paReset();if(!pa.raf)pa.raf=requestAnimationFrame(paFrame);$('paIntro').style.display='flex';}
function paExit(){cancelAnimationFrame(pa.raf);pa.raf=0;pa.on=false;pa.paused=true;['pa','paIntro','paQ','paEnd'].forEach(id=>$(id).style.display='none');stopSpeak();showModeSel();}
$('paIntroGo').onclick=()=>{$('paIntro').style.display='none';pa.paused=false;pa.last=0;paSay('La Regina depone le uova. Le operaie stanno andando ai fiori!');if(MUSICON){mCtx();playMusic(TRK_HIVE);}};$('paHomeBtn').onclick=paExit;$('paMusicBtn').onclick=()=>{MUSICON=!MUSICON;save();if(MUSICON){mCtx();playMusic(TRK_HIVE);}else stopMusic();paHud();};addEventListener('resize',()=>{if(pa.on)paResize();});
registerGame({id:'pallaapi',emoji:'🐝',nm:['L’Alveare di Gabriele','Gabriele’s Hive'],sub:['Fai nascere api, raccogli miele e difendi l’alveare!','Raise bees, collect honey and defend the hive!'],colore:'linear-gradient(180deg,#ffd23f,#e8890b)',enter:paEnter});
