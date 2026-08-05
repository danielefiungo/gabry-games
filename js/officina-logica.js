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
  labels:[['PORTA','CHIAVE'],['DOOR','KEY']],rounds:[
   {want:[1,1],out:[0],scene:['Porta aperta, ma la chiave è presente: tutto bene.','Door open, but the key is present: all clear.']},
   {want:[0,1],out:[0],scene:['Porta chiusa: niente allarme.','Door closed: no alarm.']},
   {want:[1,0],out:[1],scene:['Porta aperta e chiave assente: allarme!','Door open and key absent: alarm!']}
  ],
  circuit:[{id:'noKey',gate:'NOT',ins:[1]},{id:'alarm',gate:'AND',ins:[0,'noKey']}],
  outputRefs:['alarm'],outputLabels:[['ALLARME'],['ALARM']],
  fact:['Le porte semplici si possono collegare: qui NOT capovolge la chiave, poi AND controlla porta e “chiave assente”. Dai collegamenti nasce un circuito logico.','Simple gates can be connected: NOT flips the key, then AND checks the door and “no key”. Connections create a logic circuit.']},
 {icon:'➕',title:['Il mini-sommatore','The mini-adder'],gate:'ADD',inputs:2,
  goal:['Calcola 1 + 1: accendi entrambe le leve e osserva SOMMA e RIPORTO.','Calculate 1 + 1: turn on both switches and watch SUM and CARRY.'],
  labels:[['UNO','UNO'],['ONE','ONE']],rounds:[{want:[1,1],out:[0,1]}],
  circuit:[{id:'sum',gate:'XOR',ins:[0,1]},{id:'carry',gate:'AND',ins:[0,1]}],
  outputRefs:['sum','carry'],outputLabels:[['SOMMA','RIPORTO'],['SUM','CARRY']],
  fact:['Nel mini-sommatore XOR produce la SOMMA e AND produce il RIPORTO. Così 1 + 1 diventa 10 in binario: zero in somma e uno nella colonna successiva.','In a half-adder XOR makes the SUM and AND makes the CARRY. So 1 + 1 is 10 in binary.']},
 {icon:'🚪',title:['La porta automatica','The automatic door'],gate:'AUTO_DOOR',inputs:3,
  goal:['Apri la porta con il SENSORE oppure il BOTTONE, ma soltanto se non c’è un OSTACOLO. Supera tre prove.','Open the door with the SENSOR or BUTTON, but only when there is no OBSTACLE. Pass three tests.'],
  labels:[['SENSORE','BOTTONE','OSTACOLO'],['SENSOR','BUTTON','OBSTACLE']],
  rounds:[
   {want:[1,0,0],out:[1],scene:['Gibi si avvicina: la porta deve aprirsi.','Gibi approaches: the door must open.']},
   {want:[0,1,0],out:[1],scene:['Gibi preme il bottone: la porta deve aprirsi.','Gibi presses the button: the door must open.']},
   {want:[1,0,1],out:[0],scene:['C’è un ostacolo: la porta deve fermarsi.','There is an obstacle: the door must stop.']}
  ],
  circuit:[{id:'request',gate:'OR',ins:[0,1]},{id:'clear',gate:'NOT',ins:[2]},{id:'door',gate:'AND',ins:['request','clear']}],
  outputRefs:['door'],outputLabels:[['PORTA'],['DOOR']],
  fact:['OR unisce due modi per chiedere l’apertura. NOT trasforma “ostacolo” in “via libera”. AND apre soltanto quando arrivano insieme una richiesta e il via libera.','OR joins two ways to request opening. NOT turns “obstacle” into “clear path”. AND opens only when a request and the all-clear arrive together.']},
 {icon:'🗳️',title:['Il voto dei sensori','The sensor vote'],gate:'MAJORITY',inputs:3,
  goal:['Tre sensori votano. La sirena parte soltanto se almeno DUE sensori vedono un pericolo. Verifica tre casi.','Three sensors vote. The siren starts only if at least TWO sensors see danger. Test three cases.'],
  labels:[['SENSORE A','SENSORE B','SENSORE C'],['SENSOR A','SENSOR B','SENSOR C']],
  rounds:[
   {want:[1,0,0],out:[0],scene:['Un solo sensore: niente allarme.','One sensor: no alarm.']},
   {want:[1,1,0],out:[1],scene:['Due sensori concordano: allarme!','Two sensors agree: alarm!']},
   {want:[0,1,1],out:[1],scene:['Anche B e C formano una maggioranza.','B and C also form a majority.']}
  ],
  circuit:[{id:'ab',gate:'AND',ins:[0,1]},{id:'ac',gate:'AND',ins:[0,2]},{id:'bc',gate:'AND',ins:[1,2]},{id:'pair',gate:'OR',ins:['ab','ac']},{id:'alarm',gate:'OR',ins:['pair','bc']}],
  outputRefs:['alarm'],outputLabels:[['ALLARME'],['ALARM']],
  fact:['Ogni AND controlla una coppia di sensori. Le porte OR raccolgono i risultati: basta che una coppia sia d’accordo. Circuiti simili rendono più affidabili i sistemi che devono prendere decisioni.','Each AND checks a pair of sensors. The OR gates collect the results: one agreeing pair is enough. Similar circuits make decision systems more reliable.']},
 {icon:'🧮',title:['Il sommatore completo','The full adder'],gate:'FULL_ADD',inputs:3,
  goal:['Somma tre bit: A, B e il RIPORTO arrivato dalla colonna prima. Osserva SOMMA e nuovo RIPORTO.','Add three bits: A, B and the CARRY from the previous column. Watch SUM and the new CARRY.'],
  labels:[['BIT A','BIT B','RIPORTO IN'],['BIT A','BIT B','CARRY IN']],
  rounds:[
   {want:[1,0,0],out:[1,0],scene:['Uno più zero più zero fa 1.','One plus zero plus zero is 1.']},
   {want:[1,1,0],out:[0,1],scene:['Uno più uno fa 10 in binario.','One plus one is 10 in binary.']},
   {want:[1,1,1],out:[1,1],scene:['Tre bit accesi: 1 di somma e 1 di riporto.','Three lit bits: sum 1 and carry 1.']}
  ],
  circuit:[{id:'firstSum',gate:'XOR',ins:[0,1]},{id:'sum',gate:'XOR',ins:['firstSum',2]},{id:'carryAB',gate:'AND',ins:[0,1]},{id:'carryIn',gate:'AND',ins:['firstSum',2]},{id:'carry',gate:'OR',ins:['carryAB','carryIn']}],
  outputRefs:['sum','carry'],outputLabels:[['SOMMA','RIPORTO'],['SUM','CARRY']],
  fact:['Due XOR calcolano la somma. Due AND scoprono se nasce un riporto e OR li riunisce. Mettendo tanti sommatori completi in fila, un computer può sommare numeri grandi.','Two XOR gates calculate the sum. Two AND gates detect a carry and OR joins them. By chaining many full adders, a computer can add large numbers.']}
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
#olCircuit{width:min(980px,96vw);height:min(430px,56vh);position:relative;display:grid;grid-template-columns:170px minmax(280px,1fr) 190px;align-items:stretch;gap:0}
#olInputs{height:100%;display:grid;position:relative;z-index:2}.olSwitch{position:relative;align-self:center;width:100%;box-sizing:border-box;border:3px solid #7986bd;border-radius:18px;background:#242d5b;color:#fff;padding:10px;cursor:pointer;font:bold 17px inherit;box-shadow:0 6px 0 #090e25;transition:.2s}.olSwitch:after{content:"";position:absolute;z-index:3;right:-10px;top:50%;width:14px;height:14px;transform:translateY(-50%);border:3px solid #7e8abd;border-radius:50%;background:#27305c;transition:.2s}.olSwitch.on{background:#ffe15c;color:#493900;border-color:#fff29c;box-shadow:0 0 26px #ffe15caa,0 6px 0 #9f7410}.olSwitch.on:after{background:#ffe44f;border-color:#fff6b2;box-shadow:0 0 9px #ffe44f}.olBit{display:block;font-size:30px}.olLever{font-size:30px;display:inline-block;transition:.2s}.olSwitch.on .olLever{transform:rotate(180deg)}
#olLogic{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.olWire{height:10px;border-radius:9px;background:#30375e;box-shadow:inset 0 0 0 2px #59618a;position:absolute;transition:.2s}.olWire.on{background:#ffe44f;box-shadow:0 0 15px #ffe44f}.olInWire{right:50%;width:48%;}.olInWire.a{top:29%}.olInWire.b{top:69%}.olOutWire{left:50%;width:50%;top:49%}
#olGuardian{z-index:2;width:150px;height:150px;border:5px solid #b5c4ff;background:linear-gradient(145deg,#7655d8,#3e2d94);border-radius:42% 42% 35% 35%;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 0 #25175f,0 16px 30px #0008;transition:.25s}.olGateName{font-size:29px;font-weight:1000}.olFace{font-size:38px}.olGuardian.on{filter:brightness(1.18);box-shadow:0 0 35px #ffe75a99,0 10px 0 #785f16}.olGuardian.on .olFace:after{content:'😄'}.olGuardian:not(.on) .olFace:after{content:'🧐'}
.olNet{width:100%;height:100%;overflow:visible}.olNet .edge{fill:none;stroke:#4b547d;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;transition:.2s}.olNet .edge.on{stroke:#ffe44f;filter:drop-shadow(0 0 5px #ffe44f)}.olNet .gateShape{fill:#33286f;stroke:#b9c7ff;stroke-width:5;stroke-linejoin:round;transition:.2s}.olNet .gateShape.on{fill:#a7770d;stroke:#fff19a;filter:drop-shadow(0 0 7px #ffe44f)}.olNet .gateBubble{fill:#161d43;stroke:#b9c7ff;stroke-width:5}.olNet .gateBubble.on{stroke:#fff19a;filter:drop-shadow(0 0 5px #ffe44f)}.olNet .xorCurve{fill:none;stroke:#b9c7ff;stroke-width:5}.olNet .xorCurve.on{stroke:#fff19a;filter:drop-shadow(0 0 5px #ffe44f)}.olNet .gateText{fill:#fff;font:bold 17px sans-serif;text-anchor:middle;dominant-baseline:middle;pointer-events:none}.olNet .gateBit{fill:#dce5ff;font:bold 13px sans-serif;text-anchor:middle;pointer-events:none}
#olOutputs{height:100%;display:grid;position:relative;z-index:2}.olLamp{position:relative;align-self:center;text-align:center;border:4px solid #57618c;border-radius:50%;width:120px;height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#20274d;color:#9ca6cb;font-weight:bold;transition:.25s}.olLamp:before{content:"";position:absolute;left:-11px;top:50%;width:14px;height:14px;transform:translateY(-50%);border:3px solid #7e8abd;border-radius:50%;background:#27305c;transition:.2s}.olLamp.on{color:#513d00;border-color:#fff4a3;background:#ffe24f;box-shadow:0 0 42px #ffe24f}.olLamp.on:before{background:#ffe44f;border-color:#fff6b2;box-shadow:0 0 9px #ffe44f}.olLamp .bulb{font-size:45px}.olLamp small{font-size:12px}
#olRound{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-weight:bold;color:#bdefff;text-align:center}
#olGibi{position:absolute;right:7px;bottom:72px;width:clamp(70px,11vw,125px);height:clamp(100px,18vw,175px);background:url('assets/characters/gibi.png') center/contain no-repeat;filter:drop-shadow(0 8px 8px #0008);pointer-events:none}
#olWinBar{position:absolute;z-index:4;left:50%;bottom:90px;transform:translateX(-50%);display:none;align-items:center;gap:12px;background:#edffe2;color:#34731d;border:3px solid #8dcc69;border-radius:18px;padding:10px 14px;font-size:19px;font-weight:bold;box-shadow:0 7px 20px #0007}#olWinGo{border:0;border-radius:12px;background:#36a74b;color:#fff;font:bold 16px inherit;padding:9px 14px;cursor:pointer}
#olBottom{position:absolute;z-index:3;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:9px;padding:10px;background:#090e27bb}
.olOverlay{position:absolute;z-index:6;inset:0;background:#090e27cc;display:none;align-items:center;justify-content:center;padding:12px}.olCard{width:min(820px,94vw);max-height:90vh;overflow:auto;box-sizing:border-box;background:#fff;color:#303765;border:4px solid #aebaff;border-radius:26px;padding:22px;text-align:center;box-shadow:0 14px 50px #0009}.olCard h2{font-size:clamp(24px,5vw,36px);margin:3px 0 10px;color:#563eb1}.olCard p{font-size:clamp(17px,3.2vw,22px);line-height:1.5}.olBig{border:0;border-radius:16px;background:linear-gradient(#8d65ef,#5936bd);color:#fff;font:bold 19px inherit;padding:12px 24px;box-shadow:0 5px 0 #38207e;cursor:pointer}
#olPickGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.olLevel{border:3px solid #c8cff0;border-radius:17px;background:#f5f3ff;color:#403375;padding:10px 6px;min-height:105px;font:bold 14px inherit;cursor:pointer}.olLevel .ico{display:block;font-size:31px}.olLevel .stars{display:block;min-height:20px;margin-top:4px}.olLevel.lock{filter:grayscale(1);opacity:.55;cursor:default}.olLevel.next{border-color:#ffc928;background:#fff8d6}
#olFact{background:#edf8ff;border-left:6px solid #4eafe3;border-radius:14px;padding:13px;text-align:left;font-size:18px;line-height:1.5;margin:13px 0}
@media(max-width:650px){#olCircuit{grid-template-columns:80px minmax(190px,1fr) 70px;height:400px}#olInputs,#olLogic,#olOutputs{height:min(390px,calc((96vw - 150px)*.75));align-self:center}.olSwitch{padding:4px 2px;font-size:9px}.olSwitch:after{right:-8px;width:10px;height:10px}.olLever{font-size:18px}.olBit{font-size:20px}#olGuardian{width:100px;height:110px;border-radius:32px}.olGateName{font-size:20px}.olFace{font-size:27px}.olLamp{width:62px;height:62px}.olLamp:before{left:-9px;width:10px;height:10px}.olLamp .bulb{font-size:23px}.olLamp small{font-size:8px}#olPickGrid{grid-template-columns:repeat(2,1fr)}#olStage{inset:145px 0 78px}#olGibi{display:none}.olBtn{padding:7px;font-size:10px}.olNet .gateText{font-size:28px}.olNet .gateBit{display:none}.olNet .edge{stroke-width:9}.olNet .gateShape,.olNet .gateBubble,.olNet .xorCurve{stroke-width:7}}
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
/* Nelle versioni precedenti il livello 8 era l'ultimo: chi lo aveva già
   completato può entrare subito nella nuova sezione applicativa. */
if(ol.prog.stars[7])ol.prog.unl=Math.max(ol.prog.unl,8);
function olSave(){try{localStorage.setItem(OL_SAVE,JSON.stringify(ol.prog));}catch(e){}}
function olCircuitValues(L,b){
 const values={};
 (L.circuit||[]).forEach(n=>{const v=n.ins.map(x=>typeof x==='number'?!!b[x]:!!values[x]);values[n.id]=olGate(n.gate,v[0],v[1]);});
 return values;
}
function olOutputs(L,b){
 if(L.circuit){const values=olCircuitValues(L,b);return L.outputRefs.map(x=>!!values[x]);}
 if(L.gate==='ADD') return [olGate('XOR',b[0],b[1]),olGate('AND',b[0],b[1])];
 if(L.gate==='COMBO') return [olGate('AND',b[0],olGate('NOT',b[1]))];
 return [olGate(L.gate,b[0],b[1])];
}
function olGateSymbol(n,p,on,scale){
 const x=p.x,y=p.y,cl='gateShape'+(on?' on':''),bc='gateBubble'+(on?' on':''),xc='xorCurve'+(on?' on':'');
 const s=scale||1;
 let shape='';
 if(n.gate==='AND')shape=`<path class="${cl}" d="M${x-50*s} ${y-34*s} H${x} A${50*s} ${34*s} 0 0 1 ${x} ${y+34*s} H${x-50*s} Z"/>`;
 else if(n.gate==='OR'||n.gate==='XOR'){
  shape=`<path class="${cl}" d="M${x-50*s} ${y-34*s} Q${x-18*s} ${y} ${x-50*s} ${y+34*s} Q${x+5*s} ${y+32*s} ${x+50*s} ${y} Q${x+5*s} ${y-32*s} ${x-50*s} ${y-34*s} Z"/>`;
  if(n.gate==='XOR')shape+=`<path class="${xc}" d="M${x-61*s} ${y-34*s} Q${x-29*s} ${y} ${x-61*s} ${y+34*s}"/>`;
 }else if(n.gate==='NOT')shape=`<path class="${cl}" d="M${x-48*s} ${y-34*s} L${x+37*s} ${y} L${x-48*s} ${y+34*s} Z"/><circle class="${bc}" cx="${x+45*s}" cy="${y}" r="${8*s}"/>`;
 const tx=n.gate==='NOT'?x-10:x-5;
 return `<g><title>Porta ${n.gate}, uscita ${on?1:0}</title>${shape}<text class="gateText" x="${tx}" y="${y-6}">${n.gate}</text><text class="gateBit" x="${tx}" y="${y+18}">= ${on?1:0}</text></g>`;
}
function olNetworkSVG(L,b){
 const W=520,H=390,values=olCircuitValues(L,b),depth={},byDepth={};
 const gateScale=L.largeGate?1.65:1;
 function dep(id){if(depth[id])return depth[id];const n=L.circuit.find(x=>x.id===id);return depth[id]=1+Math.max(0,...n.ins.filter(x=>typeof x==='string').map(dep));}
 L.circuit.forEach(n=>{const d=dep(n.id);(byDepth[d]||(byDepth[d]=[])).push(n);});
 const maxD=Math.max(...Object.keys(byDepth).map(Number)),pos={};
 Object.keys(byDepth).forEach(k=>{const a=byDepth[k],d=+k;a.forEach((n,j)=>{pos[n.id]={x:d*W/(maxD+1),y:(j+1)*H/(a.length+1)};});});
 const inY=b.map((_,i)=>(i+.5)*H/b.length),outY=L.outputRefs.map((_,i)=>(i+.5)*H/L.outputRefs.length);
 let edges='',gates='';
 function source(ref){if(typeof ref==='number')return {x:0,y:inY[ref],on:!!b[ref]};const n=L.circuit.find(x=>x.id===ref);return {x:pos[ref].x+(n.gate==='NOT'?53:50)*gateScale,y:pos[ref].y,on:!!values[ref]};}
 L.circuit.forEach(n=>{const p=pos[n.id],targetX=p.x-(n.gate==='XOR'?50:48)*gateScale;n.ins.forEach((ref,i)=>{const s=source(ref),ty=p.y+(i-(n.ins.length-1)/2)*22*gateScale,mx=Math.max(s.x+14,(s.x+targetX)/2);edges+=`<path class="edge${s.on?' on':''}" d="M${s.x} ${s.y} H${mx} V${ty} H${targetX}"/>`;});});
 L.outputRefs.forEach((ref,i)=>{const s=source(ref),mx=(s.x+W)/2;edges+=`<path class="edge${s.on?' on':''}" d="M${s.x} ${s.y} H${mx} V${outY[i]} H${W}"/>`;});
 L.circuit.forEach(n=>{gates+=olGateSymbol(n,pos[n.id],values[n.id],gateScale);});
 return `<svg class="olNet" viewBox="0 0 ${W} ${H}" role="img" aria-label="Circuito con simboli standard delle porte logiche">${edges}${gates}</svg>`;
}
function olRoundOK(){
 const r=ol.L.rounds[ol.round];
 return (!r.want||r.want.every((v,n)=>!!v===!!ol.bits[n]))&&r.out.every((v,n)=>!!v===!!ol.outs[n]);
}
function olDraw(){
 const i=LI(),L=ol.L; if(!L)return;
 ol.outs=olOutputs(L,ol.bits);
 const singleGate=['AND','OR','NOT','XOR'].includes(L.gate),hasDiagram=!!L.circuit||singleGate;
 const diagramL=L.circuit?L:{circuit:[{id:'out',gate:L.gate,ins:Array.from({length:L.inputs},(_,n)=>n)}],outputRefs:['out'],largeGate:true};
 const labels=L.labels?L.labels[i]:[(i?'SWITCH A':'LEVA A'),(i?'SWITCH B':'LEVA B')];
 $('olInputs').innerHTML='';$('olInputs').style.gridTemplateRows=`repeat(${L.inputs},1fr)`;
 for(let n=0;n<L.inputs;n++){
  const b=document.createElement('button'); b.className='olSwitch'+(ol.bits[n]?' on':'');
  b.innerHTML='<span class="olLever">🎚️</span> '+labels[n]+'<span class="olBit">'+(ol.bits[n]?1:0)+'</span>';
  b.onclick=()=>{ol.bits[n]=!ol.bits[n];ol.moves++;olDraw();}; $('olInputs').appendChild(b);
 }
 const gn=L.gate==='COMBO'?'AND + NOT':L.gate==='ADD'?'XOR + AND':L.gate;
 $('olLogic').classList.toggle('network',hasDiagram);
 $('olGuardian').style.display=hasDiagram?'none':'flex';
 document.querySelector('#olGuardian .olGateName').textContent=gn;
 $('olGuardian').className=ol.outs.some(Boolean)?'on':'';
 const wires=document.querySelectorAll('#olLogic .olInWire');wires[0].style.top=L.inputs===1?'49%':'24%';wires[0].style.display=hasDiagram?'none':'block';wires[0].classList.toggle('on',!!ol.bits[0]); wires[1].style.top='74%';wires[1].style.display=!hasDiagram&&L.inputs>1?'block':'none'; wires[1].classList.toggle('on',!!ol.bits[1]);
 const outWire=document.querySelector('#olLogic .olOutWire');outWire.style.display=hasDiagram?'none':'block';outWire.classList.toggle('on',!!ol.outs[0]);
 let old=$('olLogic').querySelector('.olNet');if(old)old.remove();if(hasDiagram)$('olLogic').insertAdjacentHTML('beforeend',olNetworkSVG(diagramL,ol.bits));
 $('olOutputs').innerHTML='';$('olOutputs').style.gridTemplateRows=`repeat(${ol.outs.length},1fr)`;
 ol.outs.forEach((v,n)=>{const d=document.createElement('div');d.className='olLamp'+(v?' on':'');const nm=L.outputLabels?L.outputLabels[i][n]:(L.gate==='ADD'?(n?(i?'CARRY':'RIPORTO'):(i?'SUM':'SOMMA')):(i?'OUTPUT':'USCITA'));d.innerHTML='<span class="bulb">'+(v?'💡':'⚫')+'</span><small>'+nm+' = '+(v?1:0)+'</small>';$('olOutputs').appendChild(d);});
 const r=L.rounds[ol.round],scene=r.scene?r.scene[i]:''; $('olRound').textContent=L.rounds.length>1?((i?'TEST ':'PROVA ')+(ol.round+1)+'/'+L.rounds.length+(scene?' · '+scene:(r.want?'  →  '+r.want.join(' / '):''))):'';
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
 olLast=0;if(!olRaf)olRaf=requestAnimationFrame(olFrame);
}
function olExit(toBench){ol.on=false;if(olRaf)cancelAnimationFrame(olRaf);olRaf=0;$('ol').style.display='none';stopSpeak();if(toBench&&window.__OC){window.__OC.enter();}else showModeSel();}
$('olIntroGo').onclick=()=>{$('olIntro').style.display='none';};$('olSpeak').onclick=()=>speak(ol.L.goal[LI()]);$('olReset').onclick=()=>olGoto(ol.lvl,true);$('olPick').onclick=olPicker;$('olPickClose').onclick=()=>{$('olPicker').style.display='none';};$('olHome').onclick=()=>olExit(false);$('olBench').onclick=()=>olExit(true);
$('olWinGo').onclick=()=>{$('olWinBar').style.display='none';$('olWonTitle').textContent=OL_TEXT.done[LI()];$('olWonStars').textContent='⭐'.repeat(ol.wonStars);$('olFact').textContent=ol.L.fact[LI()];$('olNext').textContent=OL_TEXT.next[LI()];$('olWon').style.display='flex';};
$('olNext').onclick=()=>{if(ol.lvl+1<OL_LEVELS.length)olGoto(ol.lvl+1);else olPicker();};
let olLast=0,olRaf=0;function olFrame(t){if(!ol.on){olRaf=0;return;}olStep(Math.min(.05,(t-olLast)/1000||.016));olLast=t;olRaf=requestAnimationFrame(olFrame);}

window.__OL={ol,levels:OL_LEVELS,gate:olGate,outputs:olOutputs,circuitValues:olCircuitValues,goto:olGoto,step:olStep,draw:olDraw,enter:olEnter,exit:olExit};
