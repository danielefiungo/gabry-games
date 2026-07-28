/* ============================================================
   Test jsdom: LA MUSICA (js/musica.js)
   Controlla la notazione, la coerenza di tutti i brani
   (ogni pattern deve stare in battuta con la sua sezione),
   lo scheduler con strofe/ritornelli, il pannello 🎵.
   Uso:  npm install jsdom  &&  node test/test-musica.js
   ============================================================ */
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const DIR=path.resolve(__dirname,'..');

let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++;console.log('  ✓ '+msg);} else {fail++;console.log('  ✗ FAIL: '+msg);} }

/* ---------- stub di Web Audio che REGISTRA quello che viene suonato ---------- */
const AUDIO_STUB=`
(function(){
  const W=window;
  W.__EV=[];                     /* eventi suonati: {k:'osc'|'noise', f, t} */
  function param(v){
    return { value:v||0, _calls:0,
      setValueAtTime(x){this.value=x;this._calls++;return this},
      linearRampToValueAtTime(x){this.value=x;this._calls++;return this},
      exponentialRampToValueAtTime(x){this.value=x;this._calls++;return this},
      setTargetAtTime(x){this.value=x;this._calls++;return this},
      cancelScheduledValues(){return this} };
  }
  function node(extra){
    return Object.assign({ connect(){return this}, disconnect(){} }, extra||{});
  }
  W.AudioContext=function(){
    const ctx={
      state:'running', sampleRate:44100, currentTime:0,
      resume(){ ctx.state='running'; },
      destination:node(),
      createGain(){ return node({gain:param(1)}); },
      createBiquadFilter(){ return node({type:'lowpass',frequency:param(1000),Q:param(1)}); },
      createDelay(){ return node({delayTime:param(0)}); },
      createDynamicsCompressor(){ return node({threshold:param(0),ratio:param(1)}); },
      createPeriodicWave(){ return {__wave:true}; },
      createBuffer(ch,len){ const a=new Float32Array(len); return {length:len,getChannelData(){return a;}}; },
      createBufferSource(){ const n=node({buffer:null,
        start(t){ W.__EV.push({k:'noise',t:t||0}); }, stop(){} }); return n; },
      createOscillator(){
        const o=node({ type:'square', frequency:param(0), detune:param(0),
          setPeriodicWave(w){ o.__pw=!!w; },
          start(t){ W.__EV.push({k:'osc',t:t||0,f:o.frequency.value,type:o.type,pw:!!o.__pw}); },
          stop(){} });
        return o;
      }
    };
    W.__CTX=ctx; return ctx;
  };
  W.webkitAudioContext=W.AudioContext;
  W.requestAnimationFrame=()=>0;
  W.fetch=()=>Promise.reject(new Error('no net'));
  W.indexedDB={open:()=>({})};
  W.speechSynthesis={speak(){},cancel(){},getVoices:()=>[],addEventListener(){}};
  W.SpeechSynthesisUtterance=function(){};
  W.devicePixelRatio=1;
  HTMLCanvasElement.prototype.getContext=function(){
    return { canvas:this, fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,font:'',
      textAlign:'',textBaseline:'',
      fillRect(){},clearRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},arc(){},
      ellipse(){},fill(){},stroke(){},save(){},restore(){},translate(){},rotate(){},scale(){},
      fillText(){},drawImage(){},
      createRadialGradient(){return{addColorStop(){}}},
      createLinearGradient(){return{addColorStop(){}}} };
  };
})();
`;

function boot(){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:false});
  const w=dom.window;
  w.eval(AUDIO_STUB);
  ['domande.js','sfide.js','testi.js','audio-voce.js','musica.js'].forEach(f=>{
    const s=w.document.createElement('script');
    s.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
    w.document.body.appendChild(s);
  });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  w.dispatchEvent(new w.Event('load'));
  return w;
}
const w=boot();
const E=s=>w.eval(s);
const src=fs.readFileSync(path.join(DIR,'js','musica.js'),'utf8');

/* ============================================================ */
console.log('\n1. NOTAZIONE: nomi di note, pause, legature, accordi');
ok(E('NT("C4")')===60,'C4 = do centrale = MIDI 60');
ok(E('NT("A4")')===69,'A4 = 440 Hz = MIDI 69');
ok(E('NT("F#3")')===54,'F#3 = 54');
ok(E('NT("Bb5")')===82,'Bb5 = 82');
ok(E('NT("C5")')-E('NT("C4")')===12,'un\'ottava = 12 semitoni');
{
  const p=E('mel("C4 ~ ~ . E4 . | G4+C5 ~ .",{i:"pulse",v:.05})');
  ok(p.n.length===9,'ogni token è un passo da un sedicesimo (| ignorato)');
  ok(p.n[0][0]===60&&p.n[0][1]===3,'"C4 ~ ~" = una nota lunga 3 sedicesimi');
  ok(p.n[1]===0&&p.n[2]===0&&p.n[3]===0,'le legature e le pause non fanno partire altre note');
  ok(Array.isArray(p.n[6][0])&&p.n[6][0].length===2,'"G4+C5" = accordo di due note');
  ok(p.n[6][1]===2,'l\'accordo si allunga con ~ come una nota');
  ok(p.i==='pulse'&&p.v===0.05,'strumento e volume restano sul pattern');
  const acc=E('mel("C4^ C4 C4_")');
  ok(acc.n[0][2]>1&&acc.n[1][2]===1&&acc.n[2][2]<1,'^ accenta e _ ammorbidisce');
}
{
  const d=E('dr("k . h s | o c t r")');
  ok(d.d===1&&d.n.length===8,'la batteria è un canale a parte');
  ok(d.n[1]===0&&d.n[0]==='k','. = pausa, k = cassa');
}

/* ============================================================ */
console.log('\n2. STRUMENTI');
const MI=E('MI');
ok(Object.keys(MI).length>=12,'almeno 12 strumenti disponibili ('+Object.keys(MI).length+')');
ok(Object.values(MI).every(i=>i.env&&i.env.length===4),'ogni strumento ha un inviluppo ADSR completo');
ok(Object.values(MI).every(i=>i.w),'ogni strumento ha una forma d\'onda');
ok(Object.values(MI).some(i=>i.det>0),'qualche strumento è raddoppiato e stonato di poco (suono largo)');
ok(Object.values(MI).some(i=>i.vib),'qualche strumento ha il vibrato');
ok(/createDelay/.test(src)&&/MUS_ECHO_FB/.test(src),'c\'è l\'eco con riverbero (delay + feedback)');
ok(/\(15\/tr\.bpm\)\*3/.test(src),'l\'eco è sincronizzata col tempo (ottavo puntato)');

/* ============================================================ */
console.log('\n3. I BRANI: struttura, battute in ordine, note sensate');
const TRACKS=E('TRACKS');
const ids=TRACKS.filter(t=>t.id!=='auto').map(t=>t.id);
ok(TRACKS[0].id==='auto','il primo posto è la scelta automatica');
ok(ids.length>=10,'almeno 10 brani tra cui scegliere ('+ids.length+')');
ok(TRACKS.every(t=>t.em&&t.nm.length===2&&t.d.length===2),'ogni brano ha emoji, nome e descrizione in 2 lingue');
ok(new Set(TRACKS.map(t=>t.id)).size===TRACKS.length,'nessun id ripetuto');

const DRUMS=new Set(['k','s','h','o','c','t','r']);
const names=['TRK_LEVEL','TRK_ROCKET','TRK_MENU','TRK_BOSS','TRK_TECHNO','TRK_SPACE','TRK_FUNK','TRK_BAROQUE','TRK_SEA','TRK_LULLABY'];
let structOK=true, barOK=true, rangeOK=true, insOK=true, longOK=true, refrainOK=true, drumOK=true;
const report=[];
names.forEach(n=>{
  const tr=E(n), norm=E(n+'&&mNormalize('+n+')');
  const secs=tr.seq||[];
  if(!(tr.bpm>=60&&tr.bpm<=200)) { structOK=false; report.push(n+': bpm fuori scala'); }
  if(secs.length<4){ structOK=false; report.push(n+': meno di 4 sezioni'); }
  /* ogni nome usato deve esistere */
  secs.forEach((s,si)=>{
    s.u.forEach(k=>{ if(!tr.p[k]){ structOK=false; report.push(n+' sez.'+si+': pattern "'+k+'" inesistente'); } });
  });
  /* ogni pattern deve entrare un numero intero di volte nella sezione */
  norm.seq.forEach((s,si)=>{
    s.u.forEach(c=>{
      if(s.len%c.n.length!==0){
        barOK=false;
        report.push(n+' sez.'+si+': un pattern di '+c.n.length+' passi non entra in '+s.len+' (battuta sbagliata)');
      }
    });
  });
  /* note in un registro sensato e strumenti esistenti */
  Object.keys(tr.p).forEach(k=>{
    const c=tr.p[k];
    if(c.d){
      c.n.forEach(x=>{ if(x!==0&&!DRUMS.has(x)){ drumOK=false; report.push(n+'.'+k+': simbolo batteria "'+x+'" sconosciuto'); } });
      return;
    }
    if(c.i&&!MI[c.i]){ insOK=false; report.push(n+'.'+k+': strumento "'+c.i+'" inesistente'); }
    c.n.forEach(e=>{
      if(!e) return;
      const v=Array.isArray(e)?e[0]:e;
      (Array.isArray(v)?v:[v]).forEach(m=>{
        if(!(m>=21&&m<=108)){ rangeOK=false; report.push(n+'.'+k+': nota fuori dal pianoforte ('+m+')'); }
      });
    });
  });
  /* lungo, con variazioni e ritornello ripetuto */
  const steps=norm.seq.reduce((a,s)=>a+s.len*s.rep,0);
  const secondi=steps*(15/tr.bpm);
  if(secondi<30){ longOK=false; report.push(n+': troppo corto ('+secondi.toFixed(0)+'s)'); }
  /* ritornello = almeno un pattern melodico che torna in due sezioni diverse */
  const usi={};
  secs.forEach(s=>s.u.forEach(k=>{ if(!tr.p[k].d) usi[k]=(usi[k]||0)+1; }));
  if(!Object.keys(usi).some(k=>usi[k]>=2)){
    refrainOK=false; report.push(n+': nessun tema che torna (manca il ritornello)');
  }
  report.push('    '+n+': '+norm.seq.length+' sezioni, '+steps+' passi ≈ '+secondi.toFixed(0)+'s, '+Object.keys(tr.p).length+' pattern');
});
ok(structOK,'ogni brano ha bpm sensato, almeno 4 sezioni e pattern esistenti');
ok(barOK,'ogni pattern entra in battuta nella sua sezione (nessun token contato male)');
ok(rangeOK,'tutte le note stanno nel registro del pianoforte');
ok(insOK,'tutti gli strumenti citati esistono');
ok(drumOK,'tutti i simboli di batteria sono validi');
ok(longOK,'ogni brano dura almeno ~30 secondi prima di ricominciare');
ok(refrainOK,'ogni brano ha un ritornello che torna');
ok(names.every(n=>(E(n).loop||0)>=1||!E(n).p.ldI),'i brani con intro non la risentono al giro dopo');
console.log(report.filter(r=>r.startsWith('    ')).join('\n'));
report.filter(r=>!r.startsWith('    ')).forEach(r=>console.log('      ⚠ '+r));

/* ============================================================ */
console.log('\n3b. ARMONIA: le note stanno nella tonalità dichiarata');
/* pitch class ammesse per ogni brano (0=do) */
const SC={
  TRK_LEVEL  :[0,2,4,5,7,9,11],            /* do maggiore */
  TRK_ROCKET :[0,2,4,5,7,9,10],            /* do misolidio (con Sib) */
  TRK_MENU   :[0,2,4,5,7,9,11],            /* do maggiore */
  TRK_BOSS   :[9,11,0,2,4,5,7,10],         /* la minore (+ Sib di tensione) */
  TRK_TECHNO :[9,11,0,2,4,5,7],            /* la minore */
  TRK_SPACE  :[2,4,5,7,9,10,0],            /* re minore */
  TRK_FUNK   :[4,6,7,9,11,0,2],            /* mi minore */
  TRK_BAROQUE:[2,4,5,7,9,10,0,1],          /* re minore (+ do# della cadenza) */
  TRK_SEA    :[2,4,5,7,9,10,0,1],          /* re minore (+ do#) */
  TRK_LULLABY:[5,7,9,10,0,2,4]             /* fa maggiore */
};
let scaleOK=true;
names.forEach(n=>{
  const tr=E(n), ammesse=new Set(SC[n]);
  let tot=0, fuori=0, esempi=[];
  Object.keys(tr.p).forEach(k=>{
    const c=tr.p[k]; if(c.d) return;
    c.n.forEach(e=>{
      if(!e) return;
      const v=Array.isArray(e)?e[0]:e;
      (Array.isArray(v)?v:[v]).forEach(m=>{
        tot++;
        if(!ammesse.has(m%12)){ fuori++; if(esempi.length<4) esempi.push(k+':'+m); }
      });
    });
  });
  const perc=100*fuori/tot;
  if(perc>2){ scaleOK=false; console.log('      ⚠ '+n+': '+fuori+'/'+tot+' note fuori tonalità ('+perc.toFixed(1)+'%) es. '+esempi.join(' ')); }
});
ok(scaleOK,'nessun brano ha note stonate rispetto alla sua tonalità');
/* la melodia non deve battagliare col basso: niente seconde minori nello stesso istante */
let clashOK=true, none9=0;
names.forEach(n=>{
  const norm=E(n+'&&mNormalize('+n+')');
  norm.seq.forEach((s,si)=>{
    for(let st=0;st<s.len;st++){
      const suonano=[];
      s.u.forEach(c=>{
        if(c.d) return;
        const e=c.n[st%c.n.length]; if(!e) return;
        const v=Array.isArray(e)?e[0]:e;
        (Array.isArray(v)?v:[v]).forEach(m=>suonano.push(m));
      });
      for(let i=0;i<suonano.length;i++) for(let j=i+1;j<suonano.length;j++){
        const d=Math.abs(suonano[i]-suonano[j]);
        /* semitono vicino = fango; la nona minore (13) è normale tra melodia e basso */
        if(d===1){ clashOK=false; console.log('      ⚠ '+n+' sez.'+si+' passo '+st+': semitono '+suonano[i]+'/'+suonano[j]); }
        else if(d===13) none9++;
      }
    }
  });
});
ok(clashOK,'nessun semitono suonato insieme (niente fango armonico)');
console.log('    none minori (melodia sopra il basso, normali): '+none9);

/* ============================================================ */
console.log('\n4. ROTAZIONE PER TEMA');
const TT=E('THEME_TRACKS'), THEMES=E('THEMES');
ok(TT.length===THEMES.length,'un brano per ognuno dei '+THEMES.length+' temi del Labirinto');
ok(TT.every(id=>ids.indexOf(id)>=0),'i brani dei temi esistono tutti nell\'elenco');
ok(new Set(TT).size>=6,'almeno 6 brani diversi girano nel Labirinto ('+new Set(TT).size+')');
ok(E('levelTrack(0)')===E('TRK_ROCKET'),'i Razzi Spaziali hanno il brano dei razzi');
ok(E('levelTrack(4)')===E('TRK_TECHNO'),'l\'Elettronica ha il brano elettronico');
ok(E('levelTrack(6)')===E('TRK_BAROQUE'),'la Fisica ha il brano barocco');
ok(E('typeof TRK_HIVE==="undefined" ? trackById("hive")===TRK_LEVEL : true'),
   'se palla-api.js non è caricato, il brano Alveare non fa crashare nulla');

/* ============================================================ */
console.log('\n5. SCHEDULER: suona, cambia sezione, ricomincia dal ritornello');
E('MUSICON=true');
E('playMusic(TRK_LEVEL)');
ok(E('mTrack')===E('TRK_LEVEL'),'il brano richiesto è in suonata');
ok(E('__EV.length')>0,'lo scheduler ha già messo in coda le prime note');
function avanza(sec){
  const ctx=E('__CTX');
  const step=0.05;
  for(let t=0;t<sec;t+=step){ ctx.currentTime+=step; E('mSchedule()'); }
}
E('__EV.length=0');
avanza(20);
const ev=E('__EV');
ok(ev.length>200,'in 20 secondi suonano centinaia di eventi ('+ev.length+')');
ok(ev.some(e=>e.k==='noise'),'la batteria suona (rumore filtrato)');
ok(ev.some(e=>e.pw),'gli strumenti usano le onde costruite a mano (pulse/organo)');
ok(ev.every(e=>e.k==='noise'||(e.f>=25&&e.f<=4200)||(e.f>=2&&e.f<=12)),
   'ogni oscillatore è o una nota del pianoforte o un vibrato lento (2-12 Hz)');
ok(ev.some(e=>e.k==='osc'&&e.f>=2&&e.f<=12),'il vibrato è attivo su qualche strumento');
const tempi=ev.map(e=>e.t);
ok(tempi.every((t,i)=>i===0||t>=tempi[i-1]-1e-9),'gli eventi sono in ordine di tempo');
ok(E('mSeqI')>0,'siamo passati alle sezioni successive (sezione '+E('mSeqI')+')');
const visti=new Set(); let giri=0;
for(let i=0;i<40;i++){ avanza(6); visti.add(E('mSeqI')); if(E('mSeqI')===E('mNorm.loop')) giri++; }
ok(visti.size>=4,'la canzone attraversa più sezioni diverse ('+visti.size+')');
ok(!visti.has(0)||E('TRK_LEVEL.loop')===0,'l\'intro non torna più dopo il primo giro');
ok(giri>0,'alla fine la canzone riparte dal punto di loop');

console.log('\n6. VOLUME, ABBASSAMENTO PER LA VOCE, STOP');
E('musSetVolume(0.3)');
ok(Math.abs(E('MUSVOL')-0.3)<1e-9,'il volume si imposta');
ok(w.localStorage.getItem('gabri_musicvol')==='0.3','il volume si ricorda (localStorage)');
E('duckMusic(true,"tts")');
const gDuck=E('mGain.gain.value');
E('duckMusic(false,"tts")');
const gNorm=E('mGain.gain.value');
ok(gDuck<gNorm,'quando parla la voce la musica si abbassa e poi torna ('+gDuck.toFixed(3)+' < '+gNorm.toFixed(3)+')');
ok(Math.abs(gNorm-0.3)<1e-9,'tornata al volume scelto');
E('playMusic(TRK_LEVEL)');
const prima=E('__EV.length'); E('playMusic(TRK_LEVEL)');
ok(E('__EV.length')===prima,'richiedere lo stesso brano non lo fa ripartire da capo');
E('stopMusic()');
ok(E('mTrack')===null&&E('mTimer')===null,'stopMusic ferma tutto');

console.log('\n7. SCELTA DEL BRANO (pannello 🎵)');
ok(!!w.document.getElementById('mus'),'il pannello 🎵 esiste nella pagina');
E('musPanelOpen()');
ok(w.document.getElementById('mus').style.display==='flex','si apre');
const btns=w.document.querySelectorAll('#musList .musBtn');
ok(btns.length===TRACKS.length,'un bottone per brano ('+btns.length+')');
ok(w.document.querySelector('.musBtn.on'),'il brano attuale è evidenziato');
btns[4].click();
ok(E('MUSPICK')===TRACKS[4].id,'toccando un bottone si sceglie quel brano ('+TRACKS[4].id+')');
ok(w.localStorage.getItem('gabri_track')===TRACKS[4].id,'la scelta si ricorda');
E('playMusic(TRK_LEVEL)');
ok(E('mTrack')===E('trackById(MUSPICK)'),'la scelta vince su quello che chiede il gioco');
E('musPickTrack("auto")');
E('playMusic(TRK_SPACE)');
ok(E('mTrack')===E('TRK_SPACE'),'in automatico torna a decidere il gioco');
E('musToggleOn(false)');
ok(E('MUSICON')===false&&E('mTrack')===null,'il pannello spegne la musica');
E('musToggleOn(true)');
ok(E('MUSICON')===true&&E('mTrack')!==null,'e la riaccende');
w.document.getElementById('musClose').click();
ok(w.document.getElementById('mus').style.display==='none','si chiude col bottone');
ok(E('typeof toggleMusic')==='function','i bottoni 🎵 dei giochi aprono il pannello');
['btnMusic','btnMusicHud'].forEach(id=>{
  const b=w.document.getElementById(id);
  ok(!!b&&b.onclick===E('musPanelOpen'),'il bottone '+id+' apre il pannello');
});

console.log('\n8. COMPATIBILITÀ col vecchio formato (TRK_HIVE di palla-api.js)');
E('window.__OLD={bpm:112,ch:[{w:"square",v:0.05,n:[72,0,76,0]},{d:1,n:["k",0,"h",0,"s",0,"h",0]}]}');
E('__EV.length=0'); E('playMusic(window.__OLD)');
avanza(5);
ok(E('__EV.length')>10,'un brano nel vecchio formato suona ancora ('+E('__EV.length')+' eventi)');
ok(E('mNorm.seq.length')===1,'il vecchio formato diventa una sezione unica che si ripete');
ok(E('mNorm.seq[0].len%4===0'),'la lunghezza viene calcolata dai canali (minimo comune multiplo)');
E('stopMusic()');
let boom=false; try{ E('fanfare()'); }catch(e){ boom=true; }
ok(!boom,'la fanfara di fine livello funziona ancora');
ok(/function levelTrack/.test(src)&&!/function levelTrack/.test(fs.readFileSync(path.join(DIR,'js','audio-voce.js'),'utf8')),
   'il vecchio motore è stato tolto da audio-voce.js (niente doppioni)');

console.log('\n'+(fail?'❌ ':'✅ ')+pass+' assert passati, '+fail+' falliti\n');
process.exit(fail?1:0);
