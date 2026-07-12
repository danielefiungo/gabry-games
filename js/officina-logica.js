/* ============================================================
   L'OFFICINA DI GABRI 💡 — Banco 2: PORTE LOGICHE
   I segnali accesi valgono 1, quelli spenti 0. I guardiani AND,
   OR, NOT e XOR decidono se far passare la luce.
   Salvataggi: localStorage gabri_off_l. Test hook: window.__OL
   ============================================================ */

const OL_WIN_HOLD=.45;
const OL_SAVE='gabri_off_l';

function olGate(type,a,b){
  if(type==='AND') return !!a&&!!b;
  if(type==='OR') return !!a||!!b;
  if(type==='NOT') return !a;
  if(type==='XOR') return !!a!==!!b;
  return !!a;
}

const OL_TEXT={
  bench:['Banco 2 · Gli Occhi di Gibi','Bench 2 · Gibi’s Eyes'],
  story:['Insegna a Gibi a vedere e decidere con i segnali 0 e 1.','Teach Gibi to see and decide with 0 and 1 signals.'],
  levels:['LIVELLI','LEVELS'], back:['BANCO 1','BENCH 1'], home:['GIOCHI','GAMES'],
  reset:['RIFAI','RESET'], speak:['ASCOLTA','LISTEN'], start:['INIZIA','START'],
  next:['CONTINUA','CONTINUE'], done:['Occhi riparati!','Eyes repaired!'],
  try:['Prova le leve: il filo acceso vale 1, quello spento vale 0.','Try the switches: a lit wire is 1, an unlit wire is 0.'],
  newLevel:['Nuovo livello!','New level!']
};

const OL_LEVELS=[
 {icon:'🔌',title:['Il segnale','The signal'],gate:'BUF',inputs:1,
  goal:['Accendi la leva per mandare un segnale agli occhi di Gibi.','Turn on the switch to send a signal to Gibi’s eyes.'],
  rounds:[{want:[1],out:[1]}],
  fact:['Un filo spento rappresenta 0. Un filo acceso rappresenta 1: con questi due valori un computer descrive numeri, parole, foto e suoni.','An unlit wire represents 0. A lit wire represents 1: with these two values a computer describes numbers, words, pictures and sounds.']},
 {icon:'🔐',title:['AND: due chiavi','AND: two keys'],gate:'AND',inputs:2,
  goal:['Il guardiano AND apre il caveau solo con ENTRAMBE le chiavi accese.','The AND guardian opens the vault only when BOTH keys are on.'],
  rounds:[{want:[1,1],out:[1]}],
  fact:['AND significa “e”: la sua uscita vale 1 soltanto quando il primo E il secondo ingresso valgono 1. Si usa quando servono due condizioni insieme.','AND means both conditions must be true: its output is 1 only when the first AND the second input are 1.']},
 {icon:'😜',title:['NOT: il dispettoso','NOT: the trickster'],gate:'NOT',inputs:1,
  goal:['NOT fa sempre il contrario. Spegni la leva per accendere l’uscita.','NOT always does the opposite. Turn the switch off to light the output.'],
  start:[1],rounds:[{want:[0],out:[1]}],
  fact:['NOT inverte il segnale: trasforma 0 in 1 e 1 in 0. Il piccolo cerchio sul simbolo indica proprio l’inversione.','NOT flips the signal: it changes 0 into 1 and 1 into 0. The small circle on its symbol marks the inversion.']},
 {icon:'🔔',title:['OR: basta uno','OR: one is enough'],gate:'OR',inputs:2,
  goal:['Fai suonare il campanello. Per OR basta almeno UNA leva accesa.','Ring the bell. OR needs AT LEAST ONE switch on.'],
  rounds:[{out:[1]}],
  fact:['OR significa “o”: l’uscita vale 1 se è acceso un ingresso, l’altro oppure tutti e due. È un guardiano generoso.','OR means one or more: its output is 1 if either input, or both inputs, are on.']},
 {icon:'⚖️',title:['XOR: uno soltanto','XOR: exactly one'],gate:'XOR',inputs:2,
  goal:['XOR vuole UNA SOLA leva accesa: non zero e non due.','XOR wants EXACTLY ONE switch on: not zero and not two.'],
  rounds:[{out:[1]}],
  fact:['XOR è l“OR esclusivo”: vale 1 quando gli ingressi sono diversi. Serve, per esempio, per confrontare bit e costruire somme.','XOR is exclusive OR: it is 1 when its inputs differ. It is used to compare bits and build adders.']},
 {icon:'🧪',title:['Il laboratorio AND','The AND lab'],gate:'AND',inputs:2,
  goal:['Dimostra di conoscere AND: riproduci tre esperimenti in fila.','Show you know AND: reproduce three experiments in a row.'],
  rounds:[{want:[1,0],out:[0]},{want:[0,1],out:[0]},{want:[1,1],out:[1]}],
  fact:['Provando tutte le combinazioni si costruisce una tabella della verità. È la carta d’identità di una porta logica.','Trying every combination builds a truth table. It is the identity card of a logic gate.']},
 {icon:'🛡️',title:['Allarme intelligente','Smart alarm'],gate:'COMBO',inputs:2,
  goal:['L’allarme si accende se la PORTA è aperta AND la CHIAVE è assente.','The alarm turns on when the DOOR is open AND the KEY is absent.'],
  labels:[['PORTA','CHIAVE'],['DOOR','KEY']],rounds:[{want:[1,0],out:[1]}],
  fact:['Le porte semplici si possono collegare: qui NOT capovolge la chiave, poi AND controlla porta e “chiave assente”. Dai collegamenti nasce un circuito logico.','Simple gates can be connected: NOT flips the key, then AND checks the door and “no key”. Connections create a logic circuit.']},
 {icon:'➕',title:['Il mini-sommatore','The mini-adder'],gate:'ADD',inputs:2,
  goal:['Calcola 1 + 1: accendi entrambe le leve e osserva SOMMA e RIPORTO.','Calculate 1 + 1: turn on both switches and watch SUM and CARRY.'],
  labels:[['UNO','UNO'],['ONE','ONE']],rounds:[{want:[1,1],out:[0,1]}],
  fact:['Nel mini-sommatore XOR produce la SOMMA e AND produce il RIPORTO. Così 1 + 1 diventa 10 in binario: zero in somma e uno nella colonna successiva.','In a half-adder XOR makes the SUM and AND makes the CARRY. So 1 + 1 is 10 in binary.']}
];

(function(){
 const css=document.createElement('style');
 css.textContent=`
#ol{position:fixed;inset:0;z-index:18;display:none;overflow:hidden;color:#fff;background:radial-gradient(circle at 50% 10%,#303c78,#161d43 58%,#090e27);font-family:inherit}
#ol:before{content:"";position:absolute;inset:0;opacity:.18;background-image:radial-gradient(circle,#8feaff 1px,transparent 2px);background-size:44px 44px;pointer-events:none}
#olTop{position:absolute;z-index:3;left:0;right:0;top:0;padding:9px 11px;display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.olBtns{display:flex;gap:7px;flex-wrap:wrap}.olBtn{border:0;border-radius:13px;background:#fff;color:#29336c;font:bold 12px inherit;padding:8px 11px;box-shadow:0 4px 0 #abb6e9;cursor:pointer}.olBtn:active{transform:translateY(2px);box-shadow:none}
#olTitle{font-size:clamp(17px,3.5vw,25px);font-weight:900;text-align:center;text-shadow:0 2px 4px #000}
#olGoal{position:absolute;z-index:2;top:67px;left:50%;transform:translateX(-50%);width:min(720px,88vw);box-sizing:border-box;background:#fff;color:#303765;border:3px solid #8feaff;border-radius:18px;padding:9px 45px 9px 13px;text-align:center;font-size:clamp(15px,3vw,20px);line-height:1.35;box-shadow:0 7px 20px #05091d88}
#olSpeak{position:absolute;right:7px;top:50%;transform:translateY(-50%);border:0;background:#e8f7ff;border-radius:11px;font-size:21px;cursor:pointer}
#olStage{position:absolute;inset:142px 0 84px;display:flex;align-items:center;justify-content:center;padding:8px}
#olCircuit{width:min(900px,94vw);height:min(410px,55vh);position:relative;display:grid;grid-template-columns:170px 1fr 190px;align-items:center;gap:24px}
#olInputs{display:flex;flex-direction:column;gap:34px}.olSwitch{border:3px solid #7986bd;border-radius:18px;background:#242d5b;color:#fff;padding:10px;cursor:pointer;font:bold 17px inherit;box-shadow:0 6px 0 #090e25;transition:.2s}.olSwitch.on{background:#ffe15c;color:#493900;border-color:#fff29c;box-shadow:0 0 26px #ffe15caa,0 6px 0 #9f7410}.olBit{display:block;font-size:30px}.olLever{font-size:30px;display:inline-block;transition:.2s}.olSwitch.on .olLever{transform:rotate(180deg)}
#olLogic{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.olWire{height:10px;border-radius:9px;background:#30375e;box-shadow:inset 0 0 0 2px #59618a;position:absolute;transition:.2s}.olWire.on{background:#ffe44f;box-shadow:0 0 15px #ffe44f}.olInWire{right:50%;width:48%;}.olInWire.a{top:29%}.olInWire.b{top:69%}.olOutWire{left:50%;width:50%;top:49%}
#olGuardian{z-index:2;width:150px;height:150px;border:5px solid #b5c4ff;background:linear-gradient(145deg,#7655d8,#3e2d94);border-radius:42% 42% 35% 35%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 0 #25175f,0 16px 30px #0008;transition:.25s}.olGateName{font-size:29px;font-weight:1000}.olFace{font-size:38px}.olGuardian.on{filter:brightness(1.18);box-shadow:0 0 35px #ffe75a99,0 10px 0 #785f16}.olGuardian.on .olFace:after{content:'😄'}.olGuardian:not(.on) .olFace:after{content:'🧐'}
#olOutputs{display:flex;flex-direction:column;gap:22px}.olLamp{text-align:center;border:4px solid #57618c;border-radius:50%;width:120px;height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#20274d;color:#9ca6cb;font-weight:bold;transition:.25s}.olLamp.on{color:#513d00;border-color:#fff4a3;background:#ffe24f;box-shadow:0 0 42px #ffe24f}.olLamp .bulb{font-size:45px}.olLamp small{font-size:12px}
#olRound{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-weight:bold;color:#bdefff;text-align:center}
#olGibi{position:absolute;right:7px;bottom:72px;width:clamp(70px,11vw,125px);height:clamp(100px,18vw,175px);background:url('assets/characters/gibi.png') center/contain no-repeat;filter:drop-shadow(0 8px 8px #0008);pointer-events:none}
#olWinBar{position:absolute;z-index:4;left:50%;bottom:90px;transform:translateX(-50%);display:none;align-items:center;gap:12px;background:#edffe2;color:#34731d;border:3px solid #8dcc69;border-radius:18px;padding:10px 14px;font-size:19px;font-weight:bold;box-shadow:0 7px 20px #0007}#olWinGo{border:0;border-radius:12px;background:#36a74b;color:#fff;font:bold 16px inherit;padding:9px 14px;cursor:pointer}
#olBottom{position:absolute;z-index:3;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:9px;padding:10px;background:#090e27bb}
.olOverlay{position:absolute;z-index:6;inset:0;background:#090e27cc;display:none;align-items:center;justify-content:center;padding:12px}.olCard{width:min(820px,94vw);max-height:90vh;overflow:auto;box-sizing:border-box;background:#fff;color:#303765;border:4px solid #aebaff;border-radius:26px;padding:22px;text-align:center;box-shadow:0 14px 50px #0009}.olCard h2{font-size:clamp(24px,5vw,36px);margin:3px 0 10px;color:#563eb1}.olCard p{font-size:clamp(17px,3.2vw,22px);line-height:1.5}.olBig{border:0;border-radius:16px;background:linear-gradient(#8d65ef,#5936bd);color:#fff;font:bold 19px inherit;padding:12px 24px;box-shadow:0 5px 0 #38207e;cursor:pointer}
#olPickGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.olLevel{border:3px solid #c8cff0;border-radius:17px;background:#f5f3ff;color:#403375;padding:10px 6px;min-height:105px;font:bold 14px inherit;cursor:pointer}.olLevel .ico{display:block;font-size:31px}.olLevel .stars{display:block;min-height:20px;margin-top:4px}.olLevel.lock{filter:grayscale(1);opacity:.55;cursor:default}.olLevel.next{border-color:#ffc928;background:#fff8d6}
#olFact{background:#edf8ff;border-left:6px solid #4eafe3;border-radius:14px;padding:13px;text-align:left;font-size:18px;line-height:1.5;margin:13px 0}
@media(max-width:650px){#olCircuit{grid-template-columns:92px 1fr 95px;gap:5px;height:390px}.olSwitch{padding:7px 3px;font-size:12px}.olLever{font-size:23px}.olBit{font-size:23px}#olGuardian{width:105px;height:115px;border-radius:35px}.olGateName{font-size:21px}.olFace{font-size:29px}.olLamp{width:78px;height:78px}.olLamp .bulb{font-size:29px}#olPickGrid{grid-template-columns:repeat(2,1fr)}#olStage{inset:145px 0 78px}#olGibi{display:none}.olBtn{padding:7px;font-size:10px}}
`;
 document.head.appendChild(css);
 document.body.insertAdjacentHTML('beforeend',`<div id="ol">
  <div id="olTop"><div class="olBtns"><button class="olBtn" id="olHome">🏠 <span></span></button><button class="olBtn" id="olBench">⚡ <span></span></button></div><div id="olTitle"></div><div class="olBtns"><button class="olBtn" id="olPick">📋 <span></span></button><button class="olBtn" id="olReset">🔄 <span></span></button></div></div>
  <div id="olGoal"><span id="olGoalText"></span><button id="olSpeak">🔊</button></div>
  <div id="olStage"><div id="olCircuit"><div id="olInputs"></div><div id="olLogic"><div class="olWire olInWire a"></div><div class="olWire olInWire b"></div><div id="olGuardian"><span class="olGateName"></span><span class="olFace"></span></div><div class="olWire olOutWire"></div></div><div id="olOutputs"></div><div id="olRound"></div></div></div>
  <div id="olGibi"></div><div id="olWinBar"><span id="olWinText"></span><button id="olWinGo"></button></div><div id="olBottom"><span id="olStars"></span></div>
  <div class="olOverlay" id="olIntro"><div class="olCard"><div style="font-size:50px" id="olIntroIcon"></div><h2 id="olIntroTitle"></h2><p id="olIntroText"></p><button class="olBig" id="olIntroGo"></button></div></div>
  <div class="olOverlay" id="olPicker"><div class="olCard"><h2 id="olPickTitle"></h2><p id="olPickSub"></p><div id="olPickGrid"></div><button class="olBig" id="olPickClose"></button></div></div>
  <div class="olOverlay" id="olWon"><div class="olCard"><h2 id="olWonTitle"></h2><div id="olWonStars" style="font-size:30px"></div><div id="olFact"></div><button class="olBig" id="olNext"></button></div></div>
 </div>`);
})();

const ol={on:false,lvl:0,L:null,bits:[],outs:[],round:0,hold:0,won:false,moves:0,perfect:true,
 prog:(()=>{try{return Object.assign({unl:0,stars:[]},JSON.parse(localStorage.getItem(OL_SAVE)||'{}'));}catch(e){return {unl:0,stars:[]};}})()};
function olSave(){try{localStorage.setItem(OL_SAVE,JSON.stringify(ol.prog));}catch(e){}}
function olOutputs(L,b){
 if(L.gate==='ADD') return [olGate('XOR',b[0],b[1]),olGate('AND',b[0],b[1])];
 if(L.gate==='COMBO') return [olGate('AND',b[0],olGate('NOT',b[1]))];
 return [olGate(L.gate,b[0],b[1])];
}
function olRoundOK(){
 const r=ol.L.rounds[ol.round];
 return (!r.want||r.want.every((v,n)=>!!v===!!ol.bits[n]))&&r.out.every((v,n)=>!!v===!!ol.outs[n]);
}
function olDraw(){
 const i=LI(),L=ol.L; if(!L)return;
 ol.outs=olOutputs(L,ol.bits);
 const labels=L.labels?L.labels[i]:[(i?'SWITCH A':'LEVA A'),(i?'SWITCH B':'LEVA B')];
 $('olInputs').innerHTML='';
 for(let n=0;n<L.inputs;n++){
  const b=document.createElement('button'); b.className='olSwitch'+(ol.bits[n]?' on':'');
  b.innerHTML='<span class="olLever">🎚️</span> '+labels[n]+'<span class="olBit">'+(ol.bits[n]?1:0)+'</span>';
  b.onclick=()=>{if(ol.won)return;ol.bits[n]=!ol.bits[n];ol.moves++;olDraw();}; $('olInputs').appendChild(b);
 }
 const gn=L.gate==='COMBO'?'AND + NOT':L.gate==='ADD'?'XOR + AND':L.gate;
 document.querySelector('#olGuardian .olGateName').textContent=gn;
 $('olGuardian').className=ol.outs.some(Boolean)?'on':'';
 const wires=document.querySelectorAll('#olLogic .olInWire'); wires[0].classList.toggle('on',!!ol.bits[0]); wires[1].style.display=L.inputs>1?'block':'none'; wires[1].classList.toggle('on',!!ol.bits[1]);
 document.querySelector('#olLogic .olOutWire').classList.toggle('on',!!ol.outs[0]);
 $('olOutputs').innerHTML='';
 ol.outs.forEach((v,n)=>{const d=document.createElement('div');d.className='olLamp'+(v?' on':'');const nm=L.gate==='ADD'?(n?(i?'CARRY':'RIPORTO'):(i?'SUM':'SOMMA')):(i?'OUTPUT':'USCITA');d.innerHTML='<span class="bulb">'+(v?'💡':'⚫')+'</span><small>'+nm+' = '+(v?1:0)+'</small>';$('olOutputs').appendChild(d);});
 const r=L.rounds[ol.round]; $('olRound').textContent=L.rounds.length>1?((i?'EXPERIMENT ':'ESPERIMENTO ')+(ol.round+1)+'/'+L.rounds.length+(r.want?'  →  '+r.want.join(' / '):'')):'';
}
function olStep(dt){
 if(!ol.on||ol.won||!ol.L)return;
 if(olRoundOK()){
  ol.hold+=dt;if(ol.hold>=OL_WIN_HOLD){ol.hold=0;if(ol.round+1<ol.L.rounds.length){ol.round++;ol.bits=ol.L.rounds[ol.round].want?ol.L.rounds[ol.round].want.map(()=>false):ol.bits.map(()=>false);olDraw();}else olComplete();}
 }else ol.hold=0;
}
function olComplete(){
 ol.won=true;const ideal=ol.L.rounds.reduce((s,r)=>s+(r.want?r.want.filter(Boolean).length:1),0);const stars=ol.moves<=ideal+1?3:ol.moves<=ideal+3?2:1;
 ol.wonStars=stars;ol.prog.stars[ol.lvl]=Math.max(ol.prog.stars[ol.lvl]||0,stars);ol.prog.unl=Math.max(ol.prog.unl,Math.min(OL_LEVELS.length-1,ol.lvl+1));olSave();
 $('olWinText').textContent='🏆 '+OL_TEXT.done[LI()]+' '+'⭐'.repeat(stars);$('olWinGo').textContent=OL_TEXT.next[LI()];$('olWinBar').style.display='flex';
}
function olGoto(n,skipIntro){
 ol.lvl=Math.max(0,Math.min(OL_LEVELS.length-1,n));ol.L=OL_LEVELS[ol.lvl];ol.bits=(ol.L.start||Array(ol.L.inputs).fill(0)).map(Boolean);ol.round=0;ol.hold=0;ol.won=false;ol.moves=0;
 $('olWinBar').style.display='none';$('olWon').style.display='none';$('olPicker').style.display='none';$('olTitle').textContent=ol.L.icon+' '+(ol.lvl+1)+'. '+ol.L.title[LI()];$('olGoalText').textContent=ol.L.goal[LI()];olDraw();
 $('olStars').textContent='⭐'.repeat(ol.prog.stars[ol.lvl]||0);
 if(!skipIntro){$('olIntroIcon').textContent=ol.L.icon;$('olIntroTitle').textContent=ol.L.title[LI()];$('olIntroText').textContent=ol.L.goal[LI()];$('olIntroGo').textContent=OL_TEXT.start[LI()];$('olIntro').style.display='flex';}
}
function olPicker(){
 const i=LI();$('olPickTitle').textContent='💡 '+OL_TEXT.bench[i];$('olPickSub').textContent=OL_TEXT.story[i];const g=$('olPickGrid');g.innerHTML='';
 OL_LEVELS.forEach((L,n)=>{const lock=n>ol.prog.unl,b=document.createElement('button');b.className='olLevel'+(lock?' lock':'')+(n===ol.prog.unl?' next':'');b.innerHTML='<span class="ico">'+(lock?'🔒':L.icon)+'</span>'+(n+1)+'. '+L.title[i]+'<span class="stars">'+'⭐'.repeat(ol.prog.stars[n]||0)+'</span>';if(!lock)b.onclick=()=>olGoto(n);g.appendChild(b);});
 $('olPickClose').textContent=i?'BACK':'INDIETRO';$('olPicker').style.display='flex';
}
function olEnter(){
 paused=true;stopSpeak();['modeSel','menu','oc'].forEach(id=>{const e=$(id);if(e)e.style.display='none';});$('hud').style.display='none';$('joy').style.display='none';$('ol').style.display='block';ol.on=true;
 const i=LI();$('olHome').querySelector('span').textContent=OL_TEXT.home[i];$('olBench').querySelector('span').textContent=OL_TEXT.back[i];$('olPick').querySelector('span').textContent=OL_TEXT.levels[i];$('olReset').querySelector('span').textContent=OL_TEXT.reset[i];olGoto(Math.min(ol.prog.unl,OL_LEVELS.length-1),true);olPicker();
}
function olExit(toBench){ol.on=false;$('ol').style.display='none';stopSpeak();if(toBench&&window.__OC){window.__OC.enter();}else showModeSel();}
$('olIntroGo').onclick=()=>{$('olIntro').style.display='none';};$('olSpeak').onclick=()=>speak(ol.L.goal[LI()]);$('olReset').onclick=()=>olGoto(ol.lvl,true);$('olPick').onclick=olPicker;$('olPickClose').onclick=()=>{$('olPicker').style.display='none';};$('olHome').onclick=()=>olExit(false);$('olBench').onclick=()=>olExit(true);
$('olWinGo').onclick=()=>{$('olWinBar').style.display='none';$('olWonTitle').textContent=OL_TEXT.done[LI()];$('olWonStars').textContent='⭐'.repeat(ol.wonStars);$('olFact').textContent=ol.L.fact[LI()];$('olNext').textContent=OL_TEXT.next[LI()];$('olWon').style.display='flex';};
$('olNext').onclick=()=>{if(ol.lvl+1<OL_LEVELS.length)olGoto(ol.lvl+1);else olPicker();};
let olLast=0;function olFrame(t){if(ol.on){olStep(Math.min(.05,(t-olLast)/1000||.016));olLast=t;}requestAnimationFrame(olFrame);}requestAnimationFrame(olFrame);

window.__OL={ol,levels:OL_LEVELS,gate:olGate,outputs:olOutputs,goto:olGoto,step:olStep,draw:olDraw,enter:olEnter,exit:olExit};
