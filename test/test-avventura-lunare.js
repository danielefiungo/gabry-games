'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const M=require('../js/avventura-lunare-model.js');
function complete(s){assert.equal(M.press(s,M.current(s).key.toLowerCase()),true);return M.tick(s,M.current(s).duration);}
function reach(s,i){while(s.index<i)complete(s);}
test('missione completa: raccolta, nove operazioni di montaggio, decollo, quattro varchi e vittoria',()=>{
  const s=M.create();reach(s,12);assert.deepEqual(s.parts,['antenna','batteria','portello']);
  assert.deepEqual(s.installed,[]);reach(s,15);assert.deepEqual(s.installed,['antenna']);
  reach(s,21);assert.deepEqual(s.installed,s.parts);assert.equal(M.current(s).type,'launch');
  complete(s);assert.equal(M.current(s).type,'fly');reach(s,25);assert.equal(complete(s),'win');
  assert.equal(s.completed,true);assert.equal(M.press(s,'J'),false);assert.equal(M.tick(s,999999),'');
});
test('collisioni a terra e in volo: bolla, stesso ostacolo, inventario intatto e più tempo al nuovo tentativo',()=>{
  for(const index of [5,9,22,25]){
    const s=M.create();reach(s,index);const parts=[...s.parts],installed=[...s.installed],limit=M.current(s).limit;
    M.tick(s,limit*.16);assert.ok(Math.abs(M.dangerProgress(s)-.65)<.001);
    assert.equal(M.tick(s,limit*.84+1),'collision');assert.equal(s.mode,'rescue');
    assert.equal(M.press(s,M.current(s).key),false);assert.equal(s.index,index);
    assert.equal(M.tick(s,2200),'retry');assert.deepEqual(s.parts,parts);assert.deepEqual(s.installed,installed);
    M.tick(s,limit);assert.equal(s.mode,'ready','il secondo tentativo concede più tempo');
    assert.equal(complete(s),index===25?'win':'next');
  }
});
test('errore non avanza; animazione riuscita immune da collisioni e altri input',()=>{
  const s=M.create();reach(s,1);M.tick(s,M.current(s).limit-1);
  assert.equal(M.press(s,'Z'),false);assert.equal(s.index,1);
  assert.equal(M.press(s,'j'),true);assert.equal(M.press(s,'j'),false);
  assert.equal(M.tick(s,1800),'next');assert.equal(s.collisions,0);
});
function setup(){
  const dom=new JSDOM('<div id="modeSel"></div><div id="playTimerNotice" hidden></div>',{url:'https://gabri.test',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,games=[],frames=new Map(),views=[];let serial=0,now=100,hidden=false;
  w.LunarFPV={create:container=>{const view={draws:0,disposed:0,build(){},draw(s){this.draws++;container.dataset.camera=String(s.motion);container.dataset.danger=String(s.elapsed);},dispose(){this.disposed++;}};views.push(view);return view;}};
  Object.defineProperty(w.document,'hidden',{get:()=>hidden});
  w.requestAnimationFrame=fn=>{frames.set(++serial,fn);return serial;};w.cancelAnimationFrame=id=>frames.delete(id);
  w.registerGame=g=>games.push(g);w.speak=()=>{};w.stopSpeak=()=>{};w.showModeSel=()=>{w.document.getElementById('modeSel').style.display='flex';};
  for(const file of ['avventura-lunare-model.js','avventura-lunare.js','tastiera.js'])w.eval(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'));
  const $=s=>w.document.querySelector(s);
  const press=(key,opts={},target=w)=>target.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...opts}));
  const advance=ms=>{for(let i=0;i<Math.ceil(ms/20);i++){now+=20;const pending=[...frames];frames.clear();pending.forEach(([,fn])=>fn(now));}};
  const correct=()=>{press($('#laLetter').textContent);advance(3100);};
  const start=()=>{games[1].enter();$('#tkAdventure').click();};
  return {w,$,games,frames,views,press,advance,correct,start,hide:value=>{hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'));},close:()=>w.close()};
}
test('input reale: maiuscole, errori, ripetizioni, modificatori, input di form e pressioni durante animazioni',()=>{
  const h=setup();h.start();h.press('z');assert.match(h.$('#laFeedback').textContent,/Cerca F/);
  for(const opts of [{repeat:true},{ctrlKey:true},{metaKey:true},{altKey:true},{isComposing:true}])h.press('f',opts);
  const input=h.w.document.createElement('input');h.w.document.body.append(input);h.press('f',{},input);
  assert.equal(h.$('#tkMain').dataset.mode,'ready');h.press('f');h.press('j');h.advance(1900);
  assert.equal(h.$('#tkMain').dataset.step,'1');h.press('j',{repeat:true});assert.equal(h.$('#tkMain').dataset.mode,'ready');h.close();
});
test('pausa, scheda nascosta, perdita focus e avviso del timer congelano pericoli e azioni',()=>{
  const h=setup();h.start();h.correct();h.advance(5000);
  const before=h.$('#laViewport').dataset.danger;h.press(' ');h.advance(60000);
  assert.equal(h.$('#laViewport').dataset.danger,before);h.press('j');assert.equal(h.$('#tkMain').dataset.step,'1');
  h.press(' ');h.hide(true);h.advance(60000);h.hide(false);assert.equal(h.$('#laPauseCover').hidden,false);
  h.press(' ');h.w.dispatchEvent(new h.w.Event('blur'));h.advance(60000);assert.equal(h.$('#laViewport').dataset.danger,before);
  h.press(' ');h.$('#playTimerNotice').hidden=false;h.advance(60000);assert.equal(h.$('#laViewport').dataset.danger,before);
  h.$('#playTimerNotice').hidden=true;h.press(' ');h.press('j');h.advance(500);const during=h.$('#laViewport').dataset.camera;
  h.press(' ');h.advance(5000);assert.equal(h.$('#laViewport').dataset.camera,during);h.press(' ');h.advance(2000);
  assert.equal(h.$('#tkMain').dataset.step,'2');h.close();
});
test('collisione visibile, ripresa, uscita/rientro, nessun loop residuo; Gibi e allenamenti accessibili',()=>{
  const h=setup();h.start();for(let i=0;i<5;i++)h.correct();h.advance(26000);
  assert.equal(h.$('#tkMain').dataset.mode,'rescue');assert.match(h.$('#laFeedback').textContent,/bolla/);
  assert.match(h.$('#laInventory').textContent,/◆ Antenna/);h.advance(2300);h.press('Escape');
  assert.equal(h.frames.size,0);assert.match(h.$('#tkAdventure').textContent,/Riprendi/);h.$('#tkAdventure').click();
  assert.equal(h.$('#tkMain').dataset.step,'5');assert.match(h.$('#laInventory').textContent,/◆ Antenna/);
  h.games[1].exit();assert.equal(h.frames.size,0);h.games[0].enter();h.$('[data-level="0"]').click();assert.ok(h.$('#tkTarget'));
  h.games[0].exit();h.games[1].enter();assert.equal(h.w.document.querySelectorAll('.la-training [data-level]').length,6);h.close();
});
test('vittoria nel DOM, salvataggio separato, rigioca e storage indisponibile',()=>{
  const h=setup();h.w.localStorage.setItem('gabri_keyboard_drafts_v1','{"gibi":[2],"apollo":[1]}');h.start();
  for(let i=0;i<26;i++)h.correct();assert.ok(h.$('#laReplay'));assert.equal(h.frames.size,0);
  assert.deepEqual(JSON.parse(h.w.localStorage.getItem('gabri_lunar_adventure_v1')),{completed:true});
  assert.deepEqual(JSON.parse(h.w.localStorage.getItem('gabri_keyboard_drafts_v1')),{gibi:[2],apollo:[1]});
  h.$('#laReplay').click();assert.equal(h.$('#tkMain').dataset.step,'0');assert.equal(h.frames.size,1);
  h.w.Storage.prototype.setItem=()=>{throw Error('unavailable');};for(let i=0;i<26;i++)h.correct();
  assert.match(h.$('.la-win').textContent,/Salvataggio non disponibile/);h.close();
});

test('FPV: il renderer si libera su menu, uscita e vittoria e viene ricreato alla ripresa',()=>{
  const h=setup();h.start();const first=h.views[0];h.press('Escape');assert.equal(first.disposed,1);assert.equal(h.frames.size,0);
  h.$('#tkAdventure').click();assert.equal(h.views.length,2);h.games[1].exit();assert.equal(h.views[1].disposed,1);
  h.start();for(let i=0;i<26;i++)h.correct();assert.equal(h.views[2].disposed,1);assert.equal(h.frames.size,0);h.close();
});
test('FPV: WebGL indisponibile lascia un messaggio e il menu accessibile, senza avviare il loop',()=>{
  const h=setup();h.w.LunarFPV.create=()=>{throw Error('WebGL unavailable');};h.start();
  assert.match(h.$('[role="alert"]').textContent,/grafica 3D/);assert.equal(h.frames.size,0);h.$('#laMenu').click();assert.ok(h.$('#tkAdventure'));h.close();
});

test('FPV: perdita del contesto grafico interrompe il loop e conserva il punto di ripresa',()=>{
  const h=setup();h.start();h.correct();h.$('#laViewport').dispatchEvent(new h.w.CustomEvent('lunar-render-error',{bubbles:true}));
  assert.equal(h.frames.size,0);assert.equal(h.views[0].disposed,1);assert.match(h.$('[role="alert"]').textContent,/pezzi sono al sicuro/);
  h.$('#laMenu').click();h.$('#tkAdventure').click();assert.equal(h.$('#tkMain').dataset.step,'1');h.close();
});

test('paesaggio continuo: crateri scavati, bordi rialzati e montaggio nello stesso luogo',()=>{
  const world=require('../js/avventura-lunare-world.js');
  for(const crater of world.craters.filter(c=>c.x===0)){
    assert.ok(world.height(0,crater.z)<-2,'il fondo è sotto la superficie');
    assert.ok(world.height(0,crater.z+crater.r*1.06)>.25,'il bordo emerge dal terreno');
  }
  for(let i=0;i<11;i++)assert.equal(world.baseFor(i,'explore')-22,world.baseFor(i+1,'explore'));
  const arrival=world.baseFor(11,'explore')-22;
  for(let i=12;i<=21;i++)assert.equal(world.baseFor(i,M.steps[i].phase,M.steps[i].type),arrival);
});
