/* Test harness per js/officina-circuiti.js (jsdom)
   Uso: npm install jsdom && node test/test-officina.js */
const fs=require('fs');
const {JSDOM}=require('jsdom');

const src=fs.readFileSync(require('path').join(__dirname,'..','js','officina-circuiti.js'),'utf8');

const dom=new JSDOM('<!DOCTYPE html><html><body><div id="hud"></div><div id="joy"></div><div id="menu"></div><div id="modeSel"></div></body></html>',
  {runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/'});
const w=dom.window;

/* stub dei globali dell'app */
w.eval(`
  var paused=true, VOICEON=false, MUSICON=false, TRK_LEVEL={}, TRK_MENU={};
  function $(id){ return document.getElementById(id); }
  function LI(){ return 0; }
  function speak(){} function stopSpeak(){} function initTTS(){}
  function playMusic(){} function stopMusic(){} function mCtx(){} function save(){}
  var GAMES=[]; function registerGame(g){ GAMES.push(g); }
  function showModeSel(){}
  HTMLCanvasElement.prototype.getContext=function(){ return null; };
`);
w.eval(src);

const OC=w.window.__OC || w.__OC;
if(!OC){ console.error('FAIL: __OC non definito'); process.exit(1); }

let pass=0, fail=0;
function T(name,cond,extra){
  if(cond){ pass++; console.log('  ok  '+name); }
  else { fail++; console.log('  FAIL '+name+(extra!==undefined?'  ['+extra+']':'')); }
}
function steps(sec){ const n=Math.round(sec/0.02); for(let i=0;i<n;i++) OC.step(0.02); }
function until(sec,fn){ const n=Math.round(sec/0.02); for(let i=0;i<n;i++){ OC.step(0.02); if(fn()) return true; } return fn(); }
const oc=OC.oc;
const doc=w.window.document;
function unlockAll(){ oc.prog.unl=99; }
unlockAll();

console.log('Banco libero grande e infinito');
OC.goto(-1);
T('tavola ampliata a 12×8', oc.board.nx===12&&oc.board.ny===8, oc.board.nx+'×'+oc.board.ny);
T('tutti i pezzi sono infiniti', Object.values(oc.pal).every(v=>v===Infinity));
oc.tool='batt';
let ghost=OC.preview(oc.ox+oc.cs,oc.oy+oc.cs);
T('ghost verde su un foro libero', ghost&&ghost.valid&&!ghost.rotate);
T('piazzo una pila', OC.place('batt',1,1));
T('la pila resta infinita dopo averla usata', oc.pal.batt===Infinity);
ghost=OC.preview(oc.ox+oc.cs,oc.oy+oc.cs);
T('ghost giallo per ruotare lo stesso pezzo', ghost&&!ghost.valid&&ghost.rotate);
oc.tool='lamp'; ghost=OC.preview(oc.ox+oc.cs,oc.oy+oc.cs);
T('ghost rosso su un foro occupato da un altro pezzo', ghost&&!ghost.valid&&!ghost.rotate);
T('piazzo una seconda pila', OC.place('batt',3,1));
T('filo diagonale verso il basso', OC.wire(1,1,'D')&&oc.board.wires.has('1,1,D'));
T('filo diagonale verso l’alto', OC.wire(2,1,'U')&&oc.board.wires.has('2,1,U'));
const sandboxButtons=[...doc.querySelectorAll('#ocPalBar .ocTool')];
const explained=sandboxButtons.filter(b=>!/MANO|GOMMA/.test(b.textContent));
T('la palette usa i simboli reali del circuito', explained.every(b=>b.querySelector('canvas.ocCircuitSymbol')));
explained.forEach(b=>b.click());
T('ogni strumento del circuito apre una spiegazione', explained.length===11&&doc.getElementById('ocInfo').style.display==='block');
T('anche la scheda usa il simbolo reale', !!doc.querySelector('#ocInfoTitle canvas.ocCircuitSymbol'));
T('la spiegazione unisce metafora e funzionamento reale', doc.getElementById('ocInfoMetaphor').textContent.length>40&&doc.getElementById('ocInfoReal').textContent.length>80);
OC.goto(-1);
OC.place('batt',1,1,0); OC.place('lamp',3,1,0);
[[1,1,'D'],[2,1,'U'],[3,0,'U'],[3,0,'H'],[2,0,'H'],[1,0,'H'],[0,0,'H'],[0,0,'D']].forEach(wd=>OC.wire(wd[0],wd[1],wd[2]));
const diagonalLamp=oc.board.comps.get('3,1');
T('un circuito diagonale conduce davvero corrente', until(1,()=>diagonalLamp.res.P>0.004), diagonalLamp.res.P.toFixed(3)+'W');

console.log('L1 chiudi il cerchio');
OC.goto(0);
[[1,1,'H'],[2,1,'H'],[3,1,'H'],[4,1,'V'],[3,2,'H'],[2,2,'H'],[1,2,'H'],[0,2,'H'],[0,1,'V'],[0,1,'H']].forEach(wd=>{
  const okw=OC.wire(wd[0],wd[1],wd[2]); if(!okw) console.log('  (filo rifiutato: '+wd+')');
});
T('lampadina accesa', until(2,()=>OC.api.P('L')>0.15), OC.api.P('L').toFixed(3)+'W');
steps(1.2);
T('vittoria', oc.won);
T('elettroni in movimento', Object.values(oc.flow).some(I=>Math.abs(I)>0.01));
/* vittoria NON modale: banner visibile, overlay chiuso, si gioca ancora */
T('banner vittoria visibile', doc.getElementById('ocWinBar').style.display==='flex');
T('overlay NON aperto (non modale)', doc.getElementById('ocWin').style.display!=='flex');
oc.board.wires.delete('0,1,H'); /* stacco un filo: il circuito è ancora vivo */
steps(0.3);
T('si può ancora giocare (luce spenta)', OC.api.P('L')<0.05, OC.api.P('L').toFixed(3)+'W');
doc.getElementById('ocWinBarGo').onclick();
T('consenso esplicito → overlay Lo sapevi', doc.getElementById('ocWin').style.display==='flex');
doc.getElementById('ocWin').style.display='none';

console.log('L2 interruttore');
OC.goto(1);
T('spenta con interruttore aperto', !until(0.5,()=>OC.api.P('L')>0.15));
OC.comp('S').state.closed=true;
T('accesa dopo il tocco', until(2,()=>oc.won));

console.log('L3 filo rotto');
OC.goto(2);
OC.wire(2,2,'H'); OC.wire(1,2,'H');
T('riparato', until(2,()=>oc.won));

console.log('L4 LED al contrario');
OC.goto(3);
T('LED spento se girato male', !until(0.5,()=>OC.api.I('D')>0.004));
OC.comp('D').r=(OC.comp('D').r+2)%4;
T('LED acceso dopo il giro', until(2,()=>oc.won), OC.api.I('D').toFixed(4)+'A');
T('LED non bruciato (c’è la resistenza)', !OC.api.burnt('D'));

console.log('L5 PUFF + resistenza');
OC.goto(4);
OC.comp('S').state.closed=true;
T('LED si brucia senza resistenza', until(2,()=>OC.api.burnt('D')));
T('bruciatura gratuita non conta (mish=0)', oc.mish===0, 'mish='+oc.mish);
OC.comp('S').state.closed=false;
T('metto la resistenza nel buco', OC.place('res',2,2));
OC.comp('D').state.burnt=false; /* riparo (tap) */
OC.comp('S').state.closed=true;
T('LED protetto e acceso', until(2.5,()=>oc.won), OC.api.I('D').toFixed(4)+'A');
T('3 stelle possibili', oc.mish===0&&!oc.hint);

console.log('L6 serie');
OC.goto(5);
OC.wire(2,1,'H'); OC.wire(3,1,'H');
T('tutte e due accese', until(2,()=>oc.won));
const pa=OC.api.P('A'), pb=OC.api.P('B');
T('ma FIOCHE (serie)', pa>0.15&&pa<0.8&&pb>0.15&&pb<0.8, pa.toFixed(2)+'W / '+pb.toFixed(2)+'W');

console.log('L7 parallelo');
OC.goto(6);
[[2,1,'H'],[2,1,'V'],[2,2,'H'],[3,2,'H'],[4,2,'H']].forEach(wd=>OC.wire(wd[0],wd[1],wd[2]));
T('tutte e due BRILLANTI', until(2,()=>oc.won), OC.api.P('A').toFixed(2)+'W / '+OC.api.P('B').toFixed(2)+'W');

console.log('L8 condensatore');
OC.goto(7);
T('metto il secchiello', OC.place('cap',4,1));
OC.comp('S').state.closed=true;
steps(2.5); /* carica */
const vc=OC.comp && (()=>{ let v=0; oc.board.comps.forEach(c=>{ if(c.t==='cap') v=c.state.vc; }); return v; })();
T('secchiello carico', Math.abs(vc)>3, vc.toFixed(2)+'V');
OC.comp('S').state.closed=false;
T('luce resta accesa a interruttore aperto', until(1.5,()=>oc.won), OC.api.P('L').toFixed(3)+'W');

console.log('L9 transistor');
OC.goto(8);
T('motore fermo prima', !until(0.5,()=>OC.api.P('M')>0.3), OC.api.P('M').toFixed(3)+'W');
OC.comp('S').state.closed=true;
T('motorone acceso con l’interruttorino', until(2,()=>oc.won), OC.api.P('M').toFixed(2)+'W');
const ib=OC.comp('T').state.ib||0, im=OC.api.I('M');
T('corrente base PICCOLA vs motore GRANDE', ib>0.001&&ib<0.02&&im>0.2, 'Ib='+(ib*1000).toFixed(1)+'mA Im='+(im*1000).toFixed(0)+'mA');

console.log('L10 luce notturna');
OC.goto(9);
T('metto il sensore', OC.place('ldr',2,4));
let lr=null; oc.board.comps.forEach(c=>{ if(c.t==='ldr') lr=c; });
T('rotazione automatica verticale', lr&&lr.r%2===1, 'r='+(lr&&lr.r));
steps(1.2); /* giorno */
T('di giorno LED spento', OC.api.flag('dayOK'), 'I='+(OC.api.I('D')*1000).toFixed(2)+'mA');
oc.sun=false;
steps(1.2);
T('di notte LED acceso da solo', OC.api.flag('nightOK'), 'I='+(OC.api.I('D')*1000).toFixed(2)+'mA');
T('vittoria', until(1.5,()=>oc.won));

console.log('extra: parallelo, una lampadina tolta → l’altra resta accesa');
OC.goto(6);
[[2,1,'H'],[2,1,'V'],[2,2,'H'],[3,2,'H'],[4,2,'H']].forEach(wd=>OC.wire(wd[0],wd[1],wd[2]));
steps(0.5);
oc.board.comps.delete('3,2'); /* tolgo B e la sua strada */
oc.board.wires.delete('3,2,H');
steps(0.5);
T('A ancora brillante', OC.api.P('A')>0.8, OC.api.P('A').toFixed(2)+'W');

console.log('\n'+pass+' ok, '+fail+' fail');
process.exit(fail?1:0);
