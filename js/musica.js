/* ============================================================
   MUSICA 🎵
   Motore chiptune "ricco" + brani lunghi con strofe e ritornelli.

   Perché questo file: prima c'era un solo tema per tutti i livelli
   e il suono era secco (una sola onda quadra, niente eco).
   Ora:
   - strumenti veri (onde pulse 12,5%/25% come il NES, organo,
     detune, vibrato, filtro passa-basso, inviluppo ADSR);
   - eco sincronizzata col tempo (ottavo puntato) = molta più aria;
   - batteria con cassa, rullante, charleston chiuso/aperto,
     battito di mani, tom e piatto;
   - i brani sono CANZONI: una lista di sezioni (intro, strofa,
     variazione, ritornello, bridge) che si ripetono in ordine,
     così il tema dura minuti e non 8 secondi;
   - notazione a nomi di note ("C5 . E5 ~") invece dei numeri MIDI,
     così comporre e correggere è facile;
   - pannello 🎵 per scegliere il brano e il volume.

   Formato di un brano:
     { bpm, echo, swing,
       p:{ nomePattern:{i:'strumento', v:volume, n:[...]}, ... },
       seq:[ {u:['pat1','pat2'], len:64, rep:2}, ... ],
       loop:1 }
   Ogni pattern è una lista di passi da un sedicesimo; dentro una
   sezione i pattern corti si ripetono (un basso di 16 passi gira
   sotto una melodia di 64). `len` = lunghezza della sezione in
   sedicesimi, `rep` = quante volte, `loop` = da quale sezione
   ricominciare (per non risentire l'intro).

   Il vecchio formato { bpm, ch:[...] } continua a funzionare
   (lo usa TRK_HIVE in palla-api.js).
   ============================================================ */

/* ---------- tuning ---------- */
const MUS_VOL_DEF   = 0.55;  /* volume di partenza */
const MUS_DUCK      = 0.22;  /* quanto si abbassa la musica quando parla la voce */
const MUS_LOOK      = 0.32;  /* secondi di anticipo dello scheduler */
const MUS_ECHO_DEF  = 0.22;  /* mandata eco se il brano non la specifica */
const MUS_ECHO_FB   = 0.30;  /* riverbero dell'eco (feedback) */
const MUS_ECHO_CUT  = 2600;  /* l'eco è più scura del suono diretto */

let MUSVOL  = MUS_VOL_DEF;
let MUSPICK = 'auto';        /* 'auto' o id di un brano scelto dal bambino */
try{
  const v=parseFloat(localStorage.getItem('gabri_musicvol'));
  if(!isNaN(v)) MUSVOL=Math.max(0,Math.min(1,v));
  MUSPICK=localStorage.getItem('gabri_track')||'auto';
}catch(e){}

/* ---------- stato del motore ---------- */
let mGain=null,mBus=null,mSend=null,mDelay=null,mTimer=null;
let mTrack=null,mNorm=null,mSeqI=0,mStep=0,mNext=0;
let mNoiseBuf=null,mWaves={},mWanted=null;
const duckers=new Set();

const mF=m=>440*Math.pow(2,(m-69)/12);
function mCtx(){
  if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
  if(actx.state==='suspended'){ try{actx.resume();}catch(e){} }
  return actx;
}

/* ---------- notazione ----------
   "C5 . E5 ~ | A4+C5+E5 . . ."
     C5      = nota (C4 = do centrale = MIDI 60)
     .       = pausa
     ~       = allunga di un sedicesimo la nota precedente
     A4+C5   = accordo
     C5^     = accentata   C5_ = piano
     |       = separatore di battuta (ignorato) */
const MUS_SEMI={c:0,d:2,e:4,f:5,g:7,a:9,b:11};
function NT(s){
  const m=/^([a-gA-G])([#b]?)(-?\d+)$/.exec(s);
  if(!m) return 0;
  return (parseInt(m[3],10)+1)*12+MUS_SEMI[m[1].toLowerCase()]+(m[2]==='#'?1:m[2]==='b'?-1:0);
}
function mTok(str){ return String(str).split(/\s+/).filter(t=>t&&t!=='|'); }
/* melodia/accordi -> pattern */
function mel(str,o){
  const n=[]; let last=-1;
  mTok(str).forEach(tok=>{
    if(tok==='.'){ n.push(0); last=-1; return; }
    if(tok==='~'){ if(last>=0) n[last][1]++; n.push(0); return; }
    let t=tok, vel=1;
    while(/[\^_]$/.test(t)){ vel*=t.endsWith('^')?1.35:0.62; t=t.slice(0,-1); }
    const ms=t.split('+').map(NT);
    n.push([ms.length>1?ms:ms[0],1,vel]); last=n.length-1;
  });
  return Object.assign({n},o);
}
/* batteria: k cassa · s rullante · h charleston · o charleston aperto
   c mani · t tom · r piatto · . pausa */
function dr(str,o){
  return Object.assign({d:1,n:mTok(str).map(t=>t==='.'?0:t)},o);
}

/* ---------- strumenti ----------
   w: forma d'onda (p12/p25/p50/org = onde costruite a mano)
   det: detune del secondo oscillatore (centesimi) -> suono più largo
   cut: taglio del passa-basso · env:[attacco,decadimento,sostegno,rilascio]
   vib:[Hz, centesimi] · send: quanta eco */
const MI={
  pulse   :{w:'p25',     det:7,  cut:5200, env:[.004,.05,.88,.09], vib:[5.0,5],  send:.55},
  thin    :{w:'p12',     det:0,  cut:6200, env:[.003,.04,.82,.07], send:.45},
  square  :{w:'square',  det:5,  cut:4600, env:[.005,.06,.9,.10],  send:.40},
  saw     :{w:'sawtooth',det:10, cut:3200, env:[.008,.10,.78,.12], vib:[5.5,4], send:.55},
  lead    :{w:'p50',     det:8,  cut:4200, env:[.010,.09,.85,.13], vib:[5.2,7], send:.60},
  bell    :{w:'sine',    det:0,  cut:9000, env:[.002,.55,.001,.45],            send:.85},
  pluck   :{w:'sawtooth',det:6,  cut:2600, env:[.003,.17,.20,.13],             send:.50},
  organ   :{w:'org',     det:4,  cut:3800, env:[.020,.06,.95,.10],             send:.35},
  flute   :{w:'sine',    det:3,  cut:5200, env:[.050,.10,.92,.16], vib:[5.2,13],send:.65},
  pad     :{w:'triangle',det:14, cut:2200, env:[.260,.40,.80,.55],             send:.75},
  clav    :{w:'p12',     det:4,  cut:3400, env:[.003,.10,.35,.10],             send:.45},
  bass    :{w:'triangle',det:0,  cut:1500, env:[.004,.07,.92,.07],             send:.10},
  bassSaw :{w:'sawtooth',det:0,  cut:950,  env:[.004,.10,.80,.08],             send:.10},
  sub     :{w:'sine',    det:0,  cut:700,  env:[.010,.12,.95,.10],             send:.00}
};

function mWave(kind){
  if(mWaves[kind]!==undefined) return mWaves[kind];
  const N=32, re=new Float32Array(N), im=new Float32Array(N);
  if(kind==='org'){
    const h=[1,2,3,4,6,8], a=[1,.55,.35,.22,.13,.08];
    h.forEach((k,i)=>{ if(k<N) im[k]=a[i]; });
  }else{
    const duty=kind==='p12'?0.125:kind==='p25'?0.25:0.5;
    for(let k=1;k<N;k++) im[k]=(2/(k*Math.PI))*Math.sin(Math.PI*k*duty);
  }
  let w=null;
  try{ w=actx.createPeriodicWave(re,im,{disableNormalization:false}); }catch(e){ w=null; }
  mWaves[kind]=w; return w;
}

function mVoice(ins,midi,t,dur,v){
  const env=ins.env||[.005,.05,.9,.08];
  const vol=v*(ins.det?0.62:1);
  const amp=actx.createGain();
  let out=amp;
  if(ins.cut){
    const f=actx.createBiquadFilter();
    f.type='lowpass';
    f.frequency.value=Math.max(300,Math.min(ins.cut,mF(midi)*9+500));
    if(f.Q) f.Q.value=ins.q||0.8;
    amp.connect(f); out=f;
  }
  out.connect(mBus);
  const send=(ins.send||0);
  if(send>0&&mSend){
    const sg=actx.createGain(); sg.gain.value=send;
    out.connect(sg); sg.connect(mSend);
  }
  const g=amp.gain, sus=Math.max(vol*env[2],0.0003);
  const hold=Math.max(t+env[0]+env[1]+0.01,t+dur);
  g.setValueAtTime(0.0001,t);
  g.linearRampToValueAtTime(vol,t+env[0]);
  g.exponentialRampToValueAtTime(sus,t+env[0]+env[1]);
  g.setValueAtTime(sus,hold);
  g.exponentialRampToValueAtTime(0.0001,hold+env[3]);
  const end=hold+env[3]+0.06, oscs=[];
  for(let i=0;i<(ins.det?2:1);i++){
    const o=actx.createOscillator();
    if(/^(p12|p25|p50|org)$/.test(ins.w||'')){
      const w=mWave(ins.w);
      if(w&&o.setPeriodicWave) o.setPeriodicWave(w); else o.type='square';
    }else o.type=ins.w||'square';
    o.frequency.value=mF(midi);
    if(i===1&&o.detune) o.detune.value=ins.det;
    o.connect(amp); o.start(t); o.stop(end); oscs.push(o);
  }
  if(ins.vib){
    const lfo=actx.createOscillator(), lg=actx.createGain();
    lfo.type='sine'; lfo.frequency.value=ins.vib[0]; lg.gain.value=ins.vib[1];
    lfo.connect(lg);
    oscs.forEach(o=>{ if(o.detune) lg.connect(o.detune); });
    lfo.start(t); lfo.stop(end);
  }
}

function mNoise(){
  if(!mNoiseBuf){
    const b=actx.createBuffer(1,Math.floor(actx.sampleRate*0.5),actx.sampleRate),
          ch=b.getChannelData(0);
    for(let i=0;i<ch.length;i++) ch[i]=Math.random()*2-1;
    mNoiseBuf=b;
  }
  return mNoiseBuf;
}
function mDrum(kind,t,vm){
  vm=vm||1;
  if(kind==='k'||kind==='t'){
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine';
    const f0=kind==='k'?135:220, f1=kind==='k'?42:95, d=kind==='k'?0.14:0.18;
    o.frequency.setValueAtTime(f0,t);
    o.frequency.exponentialRampToValueAtTime(f1,t+d*0.8);
    g.gain.setValueAtTime(0.34*vm,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+d);
    o.connect(g); g.connect(mBus); o.start(t); o.stop(t+d+0.04);
    return;
  }
  const s=actx.createBufferSource(), g=actx.createGain(), f=actx.createBiquadFilter();
  s.buffer=mNoise();
  let d=0.05, v=0.08;
  if(kind==='s'){ f.type='bandpass'; f.frequency.value=1900; if(f.Q)f.Q.value=0.8; d=0.11; v=0.17; }
  else if(kind==='c'){ f.type='bandpass'; f.frequency.value=1200; if(f.Q)f.Q.value=1.4; d=0.09; v=0.15; }
  else if(kind==='o'){ f.type='highpass'; f.frequency.value=5200; d=0.20; v=0.08; }
  else if(kind==='r'){ f.type='highpass'; f.frequency.value=3800; d=0.45; v=0.10; }
  else { f.type='highpass'; f.frequency.value=6800; d=0.04; v=0.07; }
  g.gain.setValueAtTime(v*vm,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+d);
  s.connect(f); f.connect(g); g.connect(mBus);
  s.start(t); s.stop(t+d+0.03);
  if(mSend){ const sg=actx.createGain(); sg.gain.value=kind==='s'?0.35:0.15; g.connect(sg); sg.connect(mSend); }
}

/* ---------- normalizzazione del brano ---------- */
function mLcm(a,b){ const g=(x,y)=>y?g(y,x%y):x; return a*b/g(a,b); }
function mNormalize(tr){
  if(tr.__n) return tr.__n;
  let pats={}, seq=[];
  if(tr.ch){                                   /* vecchio formato */
    tr.ch.forEach((c,i)=>{ pats['c'+i]=c; });
    let len=16;
    tr.ch.forEach(c=>{ len=Math.min(512,mLcm(len,Math.max(1,c.n.length))); });
    seq=[{u:Object.keys(pats).map(k=>pats[k]),len,rep:1}];
  }else{
    pats=tr.p||{};
    seq=(tr.seq||[]).map(s=>{
      const u=(s.u||[]).map(k=>pats[k]).filter(Boolean);
      let len=s.len||0;
      if(!len) u.forEach(c=>{ len=Math.max(len,c.n.length); });
      return {u,len:len||16,rep:s.rep||1};
    }).filter(s=>s.u.length);
  }
  tr.__n={pats,seq,loop:Math.min(tr.loop||0,Math.max(0,seq.length-1))};
  return tr.__n;
}

/* ---------- scheduler ---------- */
function mSchedule(){
  if(!mTrack||!mGain||!mNorm||!mNorm.seq.length) return;
  const spb=15/mTrack.bpm, sw=(mTrack.swing||0)*spb;
  let guard=0;
  while(mNext<actx.currentTime+MUS_LOOK && guard++<400){
    const sec=mNorm.seq[mSeqI];
    if(!sec){ mSeqI=mNorm.loop; mStep=0; continue; }
    const total=sec.len*sec.rep;
    if(mStep>=total){
      mStep=0; mSeqI++;
      if(mSeqI>=mNorm.seq.length) mSeqI=mNorm.loop;
      continue;
    }
    const t=mNext+((mStep%2)?sw:0);
    sec.u.forEach(c=>{
      const e=c.n[mStep%c.n.length];
      if(!e) return;
      if(c.d){ mDrum(e,t,c.v||1); return; }
      const val=Array.isArray(e)?e[0]:e,
            len=Array.isArray(e)?(e[1]||1):1,
            vel=(Array.isArray(e)?(e[2]||1):1)*(c.v||0.05),
            ins=MI[c.i]||{w:c.w||'square',cut:c.cut,env:c.env,det:c.det,vib:c.vib,send:c.send},
            dur=spb*len*0.94;
      if(Array.isArray(val)) val.forEach(m=>mVoice(ins,m,t,dur,vel*0.72));
      else mVoice(ins,val,t,dur,vel);
    });
    mNext+=spb; mStep++;
  }
}

/* ---------- avvio / stop ---------- */
function musResolve(track){
  if(MUSPICK==='auto') return track;
  const e=TRACKS.find(x=>x.id===MUSPICK);
  const t=e&&e.get?e.get():null;
  return t||track;
}
function playMusic(track){
  mWanted=track||null;
  const tr=musResolve(track);
  if(mTrack===tr&&mGain) return;               /* già in suonata: non ripartire */
  stopMusic();
  if(!MUSICON||!tr) return;
  try{
    mCtx();
    mGain=actx.createGain();
    mGain.gain.value=duckers.size?MUSVOL*MUS_DUCK:MUSVOL;
    mGain.connect(actx.destination);
    mBus=actx.createGain(); mBus.gain.value=1; mBus.connect(mGain);
    /* eco sincronizzata: ottavo puntato = 3 sedicesimi */
    try{
      mSend=actx.createGain(); mSend.gain.value=(tr.echo==null?MUS_ECHO_DEF:tr.echo);
      mDelay=actx.createDelay(1.6);
      mDelay.delayTime.value=Math.min(1.5,(15/tr.bpm)*3);
      const fb=actx.createGain(); fb.gain.value=MUS_ECHO_FB;
      const lp=actx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=MUS_ECHO_CUT;
      mSend.connect(mDelay); mDelay.connect(lp); lp.connect(fb); fb.connect(mDelay); lp.connect(mGain);
    }catch(e){ mSend=null; mDelay=null; }
    mTrack=tr; mNorm=mNormalize(tr);
    mSeqI=0; mStep=0; mNext=actx.currentTime+0.08;
    mTimer=setInterval(mSchedule,90);
    mSchedule();
  }catch(e){}
}
function stopMusic(){
  if(mTimer){ clearInterval(mTimer); mTimer=null; }
  if(mGain){
    const g=mGain; mGain=null; mBus=null; mSend=null; mDelay=null;
    try{
      g.gain.setTargetAtTime(0.0001,actx.currentTime,0.05);
      setTimeout(()=>{ try{g.disconnect();}catch(e){} },400);
    }catch(e){}
  }
  mTrack=null; mNorm=null;
}
function duckMusic(on,why){
  why=why||'x';
  if(on) duckers.add(why); else duckers.delete(why);
  if(mGain&&actx){
    try{ mGain.gain.setTargetAtTime(duckers.size?MUSVOL*MUS_DUCK:MUSVOL,actx.currentTime,0.12); }catch(e){}
  }
}
function musSetVolume(v){
  MUSVOL=Math.max(0,Math.min(1,v));
  try{ localStorage.setItem('gabri_musicvol',String(MUSVOL)); }catch(e){}
  if(mGain&&actx){
    try{ mGain.gain.setTargetAtTime(duckers.size?MUSVOL*MUS_DUCK:MUSVOL,actx.currentTime,0.08); }catch(e){}
  }
}
function musPickTrack(id){
  MUSPICK=id||'auto';
  try{ localStorage.setItem('gabri_track',MUSPICK); }catch(e){}
  const want=mWanted||TRK_MENU;
  mTrack=null;                                  /* forza il cambio */
  if(MUSICON){ mCtx(); playMusic(want); } else stopMusic();
  musPanelRefresh();
}

/* Fanfara di fine livello */
function fanfare(){
  try{
    mCtx();
    [[72,0,.12],[76,.13,.12],[79,.26,.12],[84,.39,.34],[79,.76,.12],[84,.9,.6]]
      .forEach(x=>beep(mF(x[0]),x[2],x[1],'square',.12));
    [[48,0,.38],[43,.39,.36],[48,.9,.6]]
      .forEach(x=>beep(mF(x[0]),x[2],x[1],'triangle',.14));
    [523,659,784,1047,1319,1568].forEach((f,i)=>beep(f,.15,1.5+i*.09,'sine',.08));
  }catch(e){}
}

/* ============================================================
   I BRANI
   ============================================================ */

/* ---------- 🏃 CORSA — platform 8-bit allegro (do maggiore, 158) ---------- */
const TRK_LEVEL={ bpm:158, echo:.20, swing:.05,
  p:{
    ldI:mel("C5 . E5 . | G5 . . . | C6 ~ ~ . | B5 . A5 . "+
            "G5 . B5 . | D6 . . . | G5 ~ ~ ~ | . . . .",{i:'pulse',v:.055}),
    ldA:mel("G4 . C5 . | E5 . G5 . | E5 C5 D5 . | E5 ~ ~ . "+
            "D5 . G5 . | B5 . D6 . | B5 A5 G5 . | A5 ~ ~ . "+
            "E5 . A5 . | C6 . A5 . | G5 E5 F5 . | E5 ~ ~ . "+
            "F5 . A5 . | C6 . A5 . | G5 . E5 . | D5 ~ ~ .",{i:'pulse',v:.055}),
    ldA2:mel("G4 . C5 . | E5 . G5 . | E5 C5 D5 . | E5 ~ ~ . "+
             "D5 . G5 . | B5 . D6 . | B5 . A5 . | G5 ~ ~ . "+
             "E5 . A5 . | C6 . E6 . | C6 B5 A5 . | G5 . A5 . "+
             "F5 . A5 . | C6 D6 E6 . | D6 C6 B5 . | C6 ~ ~ .",{i:'pulse',v:.055}),
    ldR:mel("A5^ . A5 . | C6 ~ ~ . | A5 . G5 . | F5 ~ ~ . "+
            "G5^ . G5 . | B5 ~ ~ . | D6 . B5 . | G5 ~ ~ . "+
            "E6^ . D6 . | C6 ~ ~ . | G5 . A5 . | B5 ~ ~ . "+
            "C6 . B5 . | A5 ~ ~ ~ | . . E5 . | A5 ~ ~ .",{i:'lead',v:.05}),
    ldB:mel("A4 . C5 . | E5 ~ ~ . | . . A4 . | C5 ~ ~ . "+
            "F4 . A4 . | C5 ~ ~ . | . . C5 . | D5 ~ ~ . "+
            "G4 . B4 . | D5 ~ ~ . | . . D5 . | E5 ~ ~ . "+
            "C5 ~ ~ . | E5 . G5 ~ | . . . . | . . . .",{i:'flute',v:.05}),
    bsA:mel("C3 . C3 . | G3 . C3 . | C3 . C3 . | G3 . G3 . "+
            "G2 . G2 . | D3 . G2 . | G2 . G2 . | D3 . D3 . "+
            "A2 . A2 . | E3 . A2 . | A2 . A2 . | E3 . E3 . "+
            "F2 . F2 . | C3 . F2 . | F2 . F2 . | C3 . G2 .",{i:'bass',v:.10}),
    bsR:mel("F2 . F2 . | C3 . F2 . | F2 . F2 . | C3 . C3 . "+
            "G2 . G2 . | D3 . G2 . | G2 . G2 . | D3 . D3 . "+
            "C3 . C3 . | G3 . C3 . | C3 . C3 . | G3 . G3 . "+
            "A2 . A2 . | E3 . A2 . | A2 . G2 . | F2 . G2 .",{i:'bass',v:.10}),
    bsB:mel("A2 . A2 . | E3 . A2 . | A2 . A2 . | E3 . E3 . "+
            "F2 . F2 . | C3 . F2 . | F2 . F2 . | C3 . C3 . "+
            "G2 . G2 . | D3 . G2 . | G2 . G2 . | D3 . D3 . "+
            "C3 . C3 . | G3 . C3 . | C3 . C3 . | G3 . G3 .",{i:'bass',v:.10}),
    hrA:mel(". . C4+E4+G4 . | . . C4+E4+G4 . | . . C4+E4+G4 . | . . C4+E4+G4 . "+
            ". . B3+D4+G4 . | . . B3+D4+G4 . | . . B3+D4+G4 . | . . B3+D4+G4 . "+
            ". . A3+C4+E4 . | . . A3+C4+E4 . | . . A3+C4+E4 . | . . A3+C4+E4 . "+
            ". . A3+C4+F4 . | . . A3+C4+F4 . | . . A3+C4+F4 . | . . A3+C4+F4 .",{i:'organ',v:.03}),
    hrR:mel(". . A3+C4+F4 . | . . A3+C4+F4 . | . . A3+C4+F4 . | . . A3+C4+F4 . "+
            ". . B3+D4+G4 . | . . B3+D4+G4 . | . . B3+D4+G4 . | . . B3+D4+G4 . "+
            ". . C4+E4+G4 . | . . C4+E4+G4 . | . . C4+E4+G4 . | . . C4+E4+G4 . "+
            ". . A3+C4+E4 . | . . A3+C4+E4 . | . . A3+C4+E4 . | . . A3+C4+E4 .",{i:'organ',v:.03}),
    drI:dr("h . h . | h . h . | h . h . | h . h h"),
    dr1:dr("k . h . | s . h . | k . k . | s . h h"),
    dr2:dr("k . h . | s . h . | k . k . | s . h h "+
           "k . h . | s . h . | k . s s | t t t r")
  },
  seq:[
    {u:['ldI','bsA','drI'],len:64,rep:1},
    {u:['ldA','bsA','hrA','dr1'],len:64,rep:1},
    {u:['ldA2','bsA','hrA','dr2'],len:64,rep:1},
    {u:['ldR','bsR','hrR','dr1'],len:64,rep:1},
    {u:['ldB','bsB','dr1'],len:64,rep:1},
    {u:['ldR','bsR','hrR','dr2'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🚀 RAZZI — britpop anni '90, spavaldo (do misolidio, 92) ---------- */
const TRK_ROCKET={ bpm:92, echo:.26,
  p:{
    ldI:mel("G4 ~ ~ ~ | C5 ~ ~ ~ | E5 ~ ~ ~ | ~ ~ ~ ~ "+
            "D5 ~ ~ ~ | C5 ~ ~ ~ | G4 ~ ~ ~ | ~ ~ ~ ~",{i:'lead',v:.045}),
    ldA:mel("G5 ~ G5 ~ | A5 ~ G5 ~ | E5 ~ ~ ~ | D5 ~ C5 ~ "+
            "F5 ~ F5 ~ | G5 ~ F5 ~ | D5 ~ ~ ~ | C5 ~ ~ ~ "+
            "F5 ~ G5 ~ | A5 ~ ~ ~ | G5 ~ F5 ~ | D5 ~ ~ ~ "+
            "E5 ~ D5 ~ | C5 ~ ~ ~ | ~ ~ ~ ~ | . . G4 ~",{i:'lead',v:.05}),
    ldA2:mel("G5 ~ G5 ~ | A5 ~ C6 ~ | E5 ~ ~ ~ | D5 ~ C5 ~ "+
             "F5 ~ F5 ~ | G5 ~ Bb5 ~ | D5 ~ ~ ~ | C5 ~ ~ ~ "+
             "F5 ~ G5 ~ | A5 ~ C6 ~ | Bb5 ~ A5 ~ | G5 ~ ~ ~ "+
             "E5 ~ G5 ~ | C6 ~ ~ ~ | ~ ~ ~ ~ | . . G5 ~",{i:'lead',v:.05}),
    ldR:mel("C6 ~ ~ ~ | A5 ~ C6 ~ | D6 ~ ~ ~ | C6 ~ A5 ~ "+
            "Bb5 ~ ~ ~ | G5 ~ Bb5 ~ | C6 ~ ~ ~ | Bb5 ~ G5 ~ "+
            "G5 ~ A5 ~ | C6 ~ ~ ~ | B5 ~ G5 ~ | E5 ~ ~ ~ "+
            "D5 ~ E5 ~ | G5 ~ ~ ~ | ~ ~ ~ ~ | . . . .",{i:'lead',v:.052}),
    ldB:mel("A5 ~ ~ ~ | G5 ~ E5 ~ | D5 ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb5 ~ ~ ~ | A5 ~ F5 ~ | D5 ~ ~ ~ | ~ ~ ~ ~ "+
            "C6 ~ ~ ~ | Bb5 ~ G5 ~ | F5 ~ ~ ~ | ~ ~ ~ ~ "+
            "G5 ~ A5 ~ | Bb5 ~ ~ ~ | C6 ~ ~ ~ | ~ ~ ~ ~",{i:'flute',v:.045}),
    pdA:mel("C4+E4+G4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb3+D4+F4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "A3+C4+F4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "C4+E4+G4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.035}),
    pdR:mel("A3+C4+F4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb3+D4+F4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "C4+E4+G4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "C4+E4+G4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.035}),
    bsA:mel("C3 ~ ~ . | C3 ~ ~ . | C3 ~ G2 ~ | Bb2 ~ ~ ~ "+
            "Bb2 ~ ~ . | Bb2 ~ ~ . | Bb2 ~ F2 ~ | F2 ~ ~ ~ "+
            "F2 ~ ~ . | F2 ~ ~ . | F2 ~ C3 ~ | C3 ~ ~ ~ "+
            "C3 ~ ~ . | C3 ~ ~ . | G2 ~ ~ ~ | G2 ~ ~ ~",{i:'bassSaw',v:.10}),
    bsR:mel("F2 ~ ~ . | F2 ~ ~ . | F2 ~ C3 ~ | C3 ~ ~ ~ "+
            "Bb2 ~ ~ . | Bb2 ~ ~ . | Bb2 ~ F2 ~ | F2 ~ ~ ~ "+
            "C3 ~ ~ . | C3 ~ ~ . | C3 ~ G2 ~ | G2 ~ ~ ~ "+
            "C3 ~ ~ . | C3 ~ ~ . | G2 ~ Bb2 ~ | C3 ~ ~ ~",{i:'bassSaw',v:.10}),
    drI:dr("k . . . | . . h . | . . . . | h . h ."),
    dr1:dr("k . h . | s . h h | k . k . | s . h ."),
    dr2:dr("k . h . | s . h h | k . k . | s . h . "+
           "k . h . | s . h h | k . s . | s s t r")
  },
  seq:[
    {u:['ldI','bsA','pdA','drI'],len:64,rep:1},
    {u:['ldA','bsA','pdA','dr1'],len:64,rep:1},
    {u:['ldA2','bsA','pdA','dr2'],len:64,rep:1},
    {u:['ldR','bsR','pdR','dr1'],len:64,rep:1},
    {u:['ldB','bsA','pdA','dr1'],len:64,rep:1},
    {u:['ldR','bsR','pdR','dr2'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🏠 BENVENUTO — menu dolce e accogliente (do maggiore, 116) ---------- */
const TRK_MENU={ bpm:116, echo:.30,
  p:{
    ldA:mel("C5 . E5 . | G5 ~ ~ . | E5 . G5 . | C6 ~ ~ . "+
            "A5 ~ ~ . | G5 . E5 . | A5 ~ ~ ~ | ~ ~ ~ . "+
            "F5 . A5 . | C6 ~ ~ . | A5 . F5 . | G5 ~ ~ . "+
            "D5 . G5 . | B5 ~ ~ . | D6 ~ ~ ~ | ~ ~ ~ .",{i:'bell',v:.075}),
    ldR:mel("C6 ~ ~ . | A5 ~ ~ . | F5 ~ ~ ~ | G5 ~ ~ . "+
            "B5 ~ ~ . | D6 ~ ~ . | G5 ~ ~ ~ | ~ ~ ~ . "+
            "E6 ~ ~ . | C6 ~ ~ . | G5 ~ ~ ~ | E5 ~ ~ . "+
            "A5 ~ ~ . | C6 ~ ~ . | E6 ~ ~ ~ | ~ ~ ~ .",{i:'flute',v:.055}),
    ldB:mel("E5 ~ ~ . | G5 ~ ~ . | C6 ~ ~ ~ | ~ ~ ~ . "+
            "C6 ~ ~ . | A5 ~ ~ . | E5 ~ ~ ~ | ~ ~ ~ . "+
            "F5 ~ ~ . | A5 ~ ~ . | C6 ~ ~ ~ | A5 ~ ~ . "+
            "G5 ~ ~ . | D6 ~ ~ . | B5 ~ ~ ~ | ~ ~ ~ .",{i:'bell',v:.06}),
    arA:mel("C4 E4 G4 C5 | E5 C5 G4 E4 | C4 E4 G4 C5 | E5 G4 E4 C4 "+
            "A3 C4 E4 A4 | C5 A4 E4 C4 | A3 C4 E4 A4 | C5 E4 C4 A3 "+
            "F3 A3 C4 F4 | A4 F4 C4 A3 | F3 A3 C4 F4 | A4 C4 A3 F3 "+
            "G3 B3 D4 G4 | B4 G4 D4 B3 | G3 B3 D4 G4 | B4 D4 B3 G3",{i:'pluck',v:.035}),
    arR:mel("F3 A3 C4 F4 | A4 F4 C4 A3 | F3 A3 C4 F4 | A4 C4 A3 F3 "+
            "G3 B3 D4 G4 | B4 G4 D4 B3 | G3 B3 D4 G4 | B4 D4 B3 G3 "+
            "C4 E4 G4 C5 | E5 C5 G4 E4 | C4 E4 G4 C5 | E5 G4 E4 C4 "+
            "A3 C4 E4 A4 | C5 A4 E4 C4 | A3 C4 E4 A4 | C5 E4 C4 A3",{i:'pluck',v:.035}),
    pdA:mel("C3+G3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "A2+E3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "F2+C3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "G2+D3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.05}),
    pdR:mel("F2+C3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "G2+D3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "C3+G3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "A2+E3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.05}),
    dr0:dr("h . . . | . . . . | h . . . | . . . ."),
    dr1:dr("k . . . | h . . . | . . k . | h . . h")
  },
  seq:[
    {u:['arA','pdA','dr0'],len:64,rep:1},
    {u:['ldA','arA','pdA','dr0'],len:64,rep:1},
    {u:['ldR','arR','pdR','dr1'],len:64,rep:1},
    {u:['ldB','arA','pdA','dr1'],len:64,rep:1},
    {u:['ldR','arR','pdR','dr1'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🐲 BOSS — teso e cattivo ma divertente (la minore, 150) ---------- */
const TRK_BOSS={ bpm:150, echo:.18,
  p:{
    ldI:mel("A4 ~ ~ ~ | . . . . | A4 ~ ~ ~ | . . . . "+
            "A4 A4 A4 . | Bb4 ~ ~ . | A4 ~ ~ ~ | . . . .",{i:'saw',v:.05}),
    ldA:mel("A4 . A4 B4 | C5 . B4 A4 | E5 . E5 F5 | E5 D5 C5 B4 "+
            "A4 . A4 B4 | C5 . D5 . | E5 . G5 . | F5 E5 D5 C5 "+
            "F4 . F4 G4 | A4 . G4 F4 | D5 . D5 E5 | D5 C5 B4 A4 "+
            "G4 . G4 A4 | B4 . C5 . | D5 . E5 . | G5 ~ ~ .",{i:'saw',v:.05}),
    ldA2:mel("A4 . A4 B4 | C5 . B4 A4 | E5 . E5 F5 | E5 D5 C5 B4 "+
             "A5 . A5 B5 | C6 . B5 A5 | E5 . E5 F5 | E5 D5 C5 B4 "+
             "F5 . F5 G5 | A5 . G5 F5 | D5 . D5 E5 | D5 C5 B4 A4 "+
             "G5 . G5 A5 | B5 . C6 . | D6 . E6 . | E6 ~ ~ .",{i:'saw',v:.05}),
    ldR:mel("A5^ ~ ~ . | E5 ~ ~ . | F5 ~ ~ ~ | E5 ~ ~ . "+
            "D5 ~ ~ . | E5 ~ ~ . | F5 ~ ~ ~ | G5 ~ ~ . "+
            "A5^ ~ ~ . | G5 ~ ~ . | F5 ~ ~ ~ | E5 ~ ~ . "+
            "D5 . E5 . | F5 . G5 . | A5 ~ ~ ~ | ~ ~ ~ .",{i:'lead',v:.055}),
    ldB:mel("E5 . . E5 | . . E5 . | F5 . . F5 | . . F5 . "+
            "D5 . . D5 | . . D5 . | E5 . . E5 | . . E5 . "+
            "C5 . . C5 | . . C5 . | D5 . . D5 | . . D5 . "+
            "B4 . . B4 | . . C5 . | D5 D5 E5 E5 | F5 F5 G5 G5",{i:'thin',v:.045}),
    bsA:mel("A2 A2 A2 A2 | A2 A2 A2 A2 | A2 A2 A2 A2 | A2 A2 G2 G2 "+
            "A2 A2 A2 A2 | A2 A2 A2 A2 | E3 E3 E3 E3 | E3 E3 E3 E3 "+
            "F2 F2 F2 F2 | F2 F2 F2 F2 | F2 F2 F2 F2 | F2 F2 A2 A2 "+
            "G2 G2 G2 G2 | G2 G2 G2 G2 | G2 G2 G2 G2 | G2 G2 B2 B2",{i:'bassSaw',v:.085}),
    bsR:mel("A2 . A2 A2 | . A2 . A2 | A2 . A2 A2 | . A2 . A2 "+
            "D3 . D3 D3 | . D3 . D3 | D3 . D3 D3 | . D3 . D3 "+
            "F2 . F2 F2 | . F2 . F2 | F2 . F2 F2 | . F2 . F2 "+
            "G2 . G2 G2 | . G2 . G2 | E2 . E2 E2 | . E2 . E2",{i:'bassSaw',v:.09}),
    org:mel("A3+C4+E4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "A3+C4+E4 ~ ~ ~ | ~ ~ ~ ~ | E3+G3+B3 ~ ~ ~ | ~ ~ ~ ~ "+
            "F3+A3+C4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "G3+B3+D4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'organ',v:.028}),
    drI:dr("t . t . | t . t . | t t t t | r . . ."),
    dr1:dr("k . h . | s . h . | k . k . | s . h h"),
    dr2:dr("k k h . | s . h . | k . k k | s . s s "+
           "k . h . | s . h . | k k k k | t t r ."),
    dr3:dr("k . h h | s . h h | k . k . | s s h h")
  },
  seq:[
    {u:['ldI','bsA','drI'],len:64,rep:1},
    {u:['ldA','bsA','org','dr1'],len:64,rep:1},
    {u:['ldA2','bsA','org','dr2'],len:64,rep:1},
    {u:['ldR','bsR','org','dr3'],len:64,rep:1},
    {u:['ldB','bsA','dr2'],len:64,rep:1},
    {u:['ldR','bsR','org','dr3'],len:64,rep:1}
  ], loop:1 };

/* ---------- 💻 CIRCUITI — elettronica/techno (la minore, 128) ---------- */
const TRK_TECHNO={ bpm:128, echo:.32,
  p:{
    arp:mel("A3 C4 E4 A4 | E4 C4 A3 C4 | E4 A4 C5 A4 | E4 C4 A3 E3 "+
            "F3 A3 C4 F4 | C4 A3 F3 A3 | C4 F4 A4 F4 | C4 A3 F3 C3 "+
            "C4 E4 G4 C5 | G4 E4 C4 E4 | G4 C5 E5 C5 | G4 E4 C4 G3 "+
            "G3 B3 D4 G4 | D4 B3 G3 B3 | D4 G4 B4 G4 | D4 B3 G3 D3",{i:'pluck',v:.04}),
    arp2:mel("A4 C5 E5 A5 | E5 C5 A4 C5 | E5 A5 C6 A5 | E5 C5 A4 E4 "+
             "F4 A4 C5 F5 | C5 A4 F4 A4 | C5 F5 A5 F5 | C5 A4 F4 C4 "+
             "C5 E5 G5 C6 | G5 E5 C5 E5 | G5 C6 E6 C6 | G5 E5 C5 G4 "+
             "G4 B4 D5 G5 | D5 B4 G4 B4 | D5 G5 B5 G5 | D5 B4 G4 D4",{i:'thin',v:.03}),
    ldA:mel("A5 ~ ~ . | . . E5 . | G5 ~ ~ . | . . . . "+
            "F5 ~ ~ . | . . C5 . | A4 ~ ~ ~ | ~ ~ ~ . "+
            "C6 ~ ~ . | . . G5 . | E5 ~ ~ . | . . . . "+
            "D5 ~ ~ . | . . B4 . | G4 ~ ~ ~ | ~ ~ ~ .",{i:'lead',v:.05}),
    ldR:mel("E5 . A5 . | C6 ~ ~ . | B5 . A5 . | E5 ~ ~ . "+
            "C5 . F5 . | A5 ~ ~ . | G5 . F5 . | C5 ~ ~ . "+
            "G5 . C6 . | E6 ~ ~ . | D6 . C6 . | G5 ~ ~ . "+
            "D5 . G5 . | B5 ~ ~ . | A5 . G5 . | D5 ~ ~ .",{i:'saw',v:.05}),
    bsA:mel("A2 . A2 . | A2 . A2 . | A2 . A2 . | A2 . A2 . "+
            "F2 . F2 . | F2 . F2 . | F2 . F2 . | F2 . F2 . "+
            "C3 . C3 . | C3 . C3 . | C3 . C3 . | C3 . C3 . "+
            "G2 . G2 . | G2 . G2 . | G2 . G2 . | G2 . G2 .",{i:'sub',v:.11}),
    pd:mel("A3+C4+E4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "F3+A3+C4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "C4+E4+G4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "G3+B3+D4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.045}),
    dr0:dr("k . . . | . . o . | k . . . | . . o ."),
    dr1:dr("k . . . | c . o . | k . . h | c . o ."),
    dr2:dr("k . h . | c . o h | k . k h | c . o . "+
           "k . h . | c . o h | k . k k | s s r .")
  },
  seq:[
    {u:['bsA','arp','dr0'],len:64,rep:1},
    {u:['bsA','arp','pd','dr1'],len:64,rep:1},
    {u:['ldA','bsA','arp','dr1'],len:64,rep:1},
    {u:['ldR','bsA','arp2','pd','dr2'],len:64,rep:1},
    {u:['bsA','arp2','pd','dr1'],len:64,rep:1},
    {u:['ldR','bsA','arp','pd','dr2'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🪐 ORBITA — spaziale, lento e ampio (re minore, 100) ---------- */
const TRK_SPACE={ bpm:100, echo:.42,
  p:{
    pdA:mel("D3+A3+D4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb2+F3+Bb3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "F2+C3+F3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
            "C3+G3+C4 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.055}),
    ldA:mel("D5 ~ ~ ~ | ~ . F5 . | A5 ~ ~ ~ | ~ ~ ~ . "+
            "F5 ~ ~ ~ | ~ . D5 . | F5 ~ ~ ~ | ~ ~ ~ . "+
            "C5 ~ ~ ~ | ~ . E5 . | A5 ~ ~ ~ | ~ ~ ~ . "+
            "G5 ~ ~ ~ | ~ . E5 . | C5 ~ ~ ~ | ~ ~ ~ .",{i:'bell',v:.07}),
    ldR:mel("A5 ~ ~ ~ | D6 ~ ~ ~ | C6 ~ ~ . | A5 ~ ~ . "+
            "F5 ~ ~ ~ | Bb5 ~ ~ ~ | A5 ~ ~ . | F5 ~ ~ . "+
            "C6 ~ ~ ~ | E6 ~ ~ ~ | D6 ~ ~ . | A5 ~ ~ . "+
            "G5 ~ ~ ~ | C6 ~ ~ ~ | D6 ~ ~ ~ | ~ ~ ~ .",{i:'flute',v:.055}),
    ldB:mel("D5 . E5 . | F5 ~ ~ . | G5 . A5 . | Bb5 ~ ~ . "+
            "A5 ~ ~ . | G5 ~ ~ . | F5 ~ ~ ~ | ~ ~ ~ . "+
            "Bb5 . A5 . | G5 ~ ~ . | F5 . E5 . | D5 ~ ~ . "+
            "C5 ~ ~ . | D5 ~ ~ . | A4 ~ ~ ~ | ~ ~ ~ .",{i:'bell',v:.06}),
    arp:mel("D4 A4 D5 A4 | F4 A4 D5 F5 | D5 A4 F4 D4 | A4 D5 F5 A5 "+
            "Bb3 F4 Bb4 F4 | D4 F4 Bb4 D5 | Bb4 F4 D4 Bb3 | F4 Bb4 D5 F5 "+
            "F3 C4 F4 C5 | A3 C4 F4 A4 | F4 C4 A3 F3 | C4 F4 A4 C5 "+
            "C4 G4 C5 G4 | E4 G4 C5 E5 | C5 G4 E4 C4 | G4 C5 E5 G5",{i:'pluck',v:.028}),
    bsA:mel("D2 ~ ~ ~ | ~ ~ ~ . | D2 ~ ~ ~ | ~ ~ ~ . "+
            "Bb1 ~ ~ ~ | ~ ~ ~ . | Bb1 ~ ~ ~ | ~ ~ ~ . "+
            "F2 ~ ~ ~ | ~ ~ ~ . | F2 ~ ~ ~ | ~ ~ ~ . "+
            "C2 ~ ~ ~ | ~ ~ ~ . | C2 ~ ~ ~ | ~ ~ ~ .",{i:'sub',v:.10}),
    dr0:dr("k . . . | . . . . | . . . . | . . . ."),
    dr1:dr("k . . . | . . h . | . . k . | . . h ."),
    dr2:dr("k . . h | s . . . | . . k . | s . h h")
  },
  seq:[
    {u:['pdA','bsA','dr0'],len:64,rep:1},
    {u:['ldA','pdA','bsA','arp','dr1'],len:64,rep:1},
    {u:['ldR','pdA','bsA','arp','dr2'],len:64,rep:1},
    {u:['ldB','pdA','bsA','arp','dr1'],len:64,rep:1},
    {u:['ldR','pdA','bsA','arp','dr2'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🔧 OFFICINA — funky, bassi sincopati (mi minore, 106) ---------- */
const TRK_FUNK={ bpm:106, echo:.24, swing:.10,
  p:{
    bsA:mel("E2 . E3 . | E2 . . E2 | G2 . E2 . | D2 . . . "+
            "A2 . A3 . | A2 . . A2 | C3 . A2 . | G2 . . . "+
            "D3 . D2 . | D3 . . D2 | F#3 . D3 . | C3 . . . "+
            "E2 . E3 . | E2 . . G2 | A2 . B2 . | D3 . E3 .",{i:'bassSaw',v:.10}),
    clA:mel(". . E4+G4+B4 . | . . . E4+G4+B4 | . . . . | E4+G4+B4 . . . "+
            ". . A4+C5+E5 . | . . . A4+C5+E5 | . . . . | A4+C5+E5 . . . "+
            ". . D4+F#4+A4 . | . . . D4+F#4+A4 | . . . . | D4+F#4+A4 . . . "+
            ". . E4+G4+B4 . | . . . E4+G4+B4 | . . B4+D5 . | E5+G5 . . .",{i:'clav',v:.035}),
    ldA:mel("B4 . D5 E5 | . D5 B4 . | G4 . A4 B4 | . . . . "+
            "E5 . G5 A5 | . G5 E5 . | C5 . D5 E5 | . . . . "+
            "A5 . G5 F#5 | . E5 D5 . | F#5 . E5 D5 | . . . . "+
            "B4 . D5 . | E5 . G5 . | A5 . B5 . | E5 ~ ~ .",{i:'lead',v:.05}),
    ldR:mel("E5^ . E5 . | G5 ~ ~ . | E5 . D5 . | B4 ~ ~ . "+
            "A5^ . A5 . | C6 ~ ~ . | A5 . G5 . | E5 ~ ~ . "+
            "D5^ . F#5 . | A5 ~ ~ . | G5 . F#5 . | D5 ~ ~ . "+
            "E5 . G5 . | B5 ~ ~ . | A5 . G5 . | E5 ~ ~ .",{i:'saw',v:.05}),
    ldB:mel("G4 A4 B4 . | D5 ~ ~ . | . B4 A4 . | G4 ~ ~ . "+
            "A4 B4 C5 . | E5 ~ ~ . | . C5 B4 . | A4 ~ ~ . "+
            "B4 C5 D5 . | F#5 ~ ~ . | . D5 C5 . | B4 ~ ~ . "+
            "C5 D5 E5 . | G5 ~ ~ . | A5 ~ ~ . | B5 ~ ~ .",{i:'clav',v:.045}),
    dr1:dr("k . h . | c . h k | . . h . | c . h h"),
    dr2:dr("k . h . | c . h k | . . h . | c . h h "+
           "k . h k | c . h . | k . c c | s s t r"),
    dr0:dr("h . h . | h . h . | h . h . | h . h h")
  },
  seq:[
    {u:['bsA','dr0'],len:64,rep:1},
    {u:['bsA','clA','dr1'],len:64,rep:1},
    {u:['ldA','bsA','clA','dr1'],len:64,rep:1},
    {u:['ldR','bsA','clA','dr2'],len:64,rep:1},
    {u:['ldB','bsA','dr1'],len:64,rep:1},
    {u:['ldR','bsA','clA','dr2'],len:64,rep:1}
  ], loop:1 };

/* ---------- 🎻 INVENZIONE — stile barocco a due voci, niente batteria
     (re minore, 132; la voce bassa risponde a quella alta, come in Bach) ---------- */
const TRK_BAROQUE={ bpm:132, echo:.20,
  p:{
    v1A:mel("D5 E5 F5 G5 | A5 F5 D5 A4 | Bb4 D5 F5 A5 | G5 E5 C5 A4 "+
            "D5 F5 A5 D6 | C6 A5 F5 D5 | E5 G5 Bb5 E6 | D6 Bb5 G5 E5 "+
            "F5 A5 D6 A5 | F5 D5 A4 F4 | G4 Bb4 E5 Bb4 | G4 E4 Bb3 G3 "+
            "A4 C5 E5 A5 | G5 E5 C5 A4 | D5 ~ ~ ~ | ~ ~ ~ ~",{i:'pluck',v:.05}),
    v2A:mel("D3 ~ ~ ~ | ~ ~ ~ ~ | Bb2 ~ ~ ~ | ~ ~ ~ ~ "+
            "D3 E3 F3 G3 | A3 F3 D3 A2 | Bb2 D3 F3 A3 | G3 E3 C3 A2 "+
            "D3 F3 A3 D4 | C4 A3 F3 D3 | E3 G3 Bb3 E4 | D4 Bb3 G3 E3 "+
            "F3 A3 D4 C4 | Bb3 G3 E3 C3 | D3 ~ ~ ~ | ~ ~ ~ ~",{i:'pluck',v:.045}),
    v1B:mel("A5 ~ G5 F5 | E5 ~ D5 C5 | D5 ~ E5 F5 | G5 ~ A5 Bb5 "+
            "A5 ~ G5 F5 | G5 ~ F5 E5 | F5 ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb5 ~ A5 G5 | F5 ~ E5 D5 | E5 ~ F5 G5 | A5 ~ Bb5 C6 "+
            "D6 ~ C6 Bb5 | A5 ~ G5 F5 | E5 ~ ~ ~ | A5 ~ ~ ~",{i:'flute',v:.05}),
    v2B:mel("F3 ~ ~ ~ | C3 ~ ~ ~ | D3 ~ ~ ~ | Bb2 ~ ~ ~ "+
            "F3 ~ ~ ~ | C3 ~ ~ ~ | F2 ~ ~ ~ | ~ ~ ~ ~ "+
            "G3 ~ ~ ~ | D3 ~ ~ ~ | E3 ~ ~ ~ | C3 ~ ~ ~ "+
            "F3 ~ ~ ~ | D3 ~ ~ ~ | A2 ~ ~ ~ | A2 ~ ~ ~",{i:'bass',v:.06}),
    v1R:mel("D6 ~ A5 ~ | F5 ~ D5 ~ | E5 F5 G5 A5 | Bb5 ~ A5 ~ "+
            "G5 ~ E5 ~ | C5 ~ E5 ~ | F5 G5 A5 Bb5 | C6 ~ Bb5 ~ "+
            "A5 ~ F5 ~ | D5 ~ F5 ~ | G5 A5 Bb5 C6 | D6 ~ C6 ~ "+
            "Bb5 ~ G5 ~ | E5 ~ C5 ~ | D5 ~ ~ ~ | ~ ~ ~ ~",{i:'organ',v:.04}),
    v2R:mel("D3 A3 D4 A3 | D3 A2 D3 F3 | Bb2 F3 Bb3 F3 | Bb2 F2 Bb2 D3 "+
            "C3 G3 C4 G3 | C3 G2 C3 E3 | F2 C3 F3 C3 | F2 C2 F2 A2 "+
            "D3 A3 D4 A3 | D3 A2 D3 F3 | G2 D3 G3 D3 | G2 D2 G2 Bb2 "+
            "A2 E3 A3 E3 | A2 E2 A2 C3 | D3 ~ ~ ~ | ~ ~ ~ ~",{i:'pluck',v:.045}),
    v3R:mel("D4+F4 ~ ~ ~ | ~ ~ ~ ~ | Bb3+D4 ~ ~ ~ | ~ ~ ~ ~ "+
            "C4+E4 ~ ~ ~ | ~ ~ ~ ~ | A3+C4 ~ ~ ~ | ~ ~ ~ ~ "+
            "D4+F4 ~ ~ ~ | ~ ~ ~ ~ | Bb3+D4 ~ ~ ~ | ~ ~ ~ ~ "+
            "C#4+E4 ~ ~ ~ | ~ ~ ~ ~ | D4+F4 ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.03})
  },
  seq:[
    {u:['v1A'],len:64,rep:1},
    {u:['v1A','v2A'],len:64,rep:1},
    {u:['v1R','v2R','v3R'],len:64,rep:1},
    {u:['v1B','v2B'],len:64,rep:1},
    {u:['v1R','v2R','v3R'],len:64,rep:1}
  ], loop:1 };

/* ---------- ⛵ MARE — canto dei marinai in 6/8 (re minore, 104)
     battute da 12 sedicesimi: TA-ta-ta come le onde ---------- */
const TRK_SEA={ bpm:104, echo:.28,
  p:{
    ldA:mel("D5 ~ ~ | F5 ~ ~ | A5 ~ ~ | A5 ~ ~ "+
            "G5 ~ ~ | F5 ~ ~ | E5 ~ ~ ~ ~ ~ "+
            "F5 ~ ~ | A5 ~ ~ | D6 ~ ~ | C6 ~ ~ "+
            "Bb5 ~ ~ | A5 ~ ~ | D5 ~ ~ ~ ~ ~",{i:'flute',v:.055}),
    ldR:mel("A5 ~ ~ | A5 ~ ~ | Bb5 ~ A5 | G5 ~ ~ "+
            "F5 ~ ~ | G5 ~ ~ | A5 ~ ~ ~ ~ ~ "+
            "D6 ~ ~ | C6 ~ ~ | Bb5 ~ A5 | G5 ~ ~ "+
            "A5 ~ ~ | E5 ~ ~ | D5 ~ ~ ~ ~ ~",{i:'lead',v:.055}),
    ldB:mel("D5 ~ E5 | F5 ~ ~ | E5 ~ D5 | C5 ~ ~ "+
            "D5 ~ ~ | F5 ~ ~ | A4 ~ ~ ~ ~ ~ "+
            "Bb4 ~ C5 | D5 ~ ~ | C5 ~ Bb4 | A4 ~ ~ "+
            "G4 ~ ~ | A4 ~ ~ | D5 ~ ~ ~ ~ ~",{i:'pluck',v:.05}),
    hrA:mel("D4+F4+A4 ~ ~ | ~ ~ ~ | ~ ~ ~ | ~ ~ ~ "+
            "Bb3+D4+F4 ~ ~ | ~ ~ ~ | A3+C#4+E4 ~ ~ | ~ ~ ~ "+
            "F3+A3+C4 ~ ~ | ~ ~ ~ | ~ ~ ~ | ~ ~ ~ "+
            "G3+Bb3+D4 ~ ~ | ~ ~ ~ | D4+F4+A4 ~ ~ | ~ ~ ~",{i:'organ',v:.032}),
    hrR:mel("D4+F4+A4 ~ ~ | ~ ~ ~ | Bb3+D4+F4 ~ ~ | ~ ~ ~ "+
            "F3+A3+C4 ~ ~ | ~ ~ ~ | C4+E4+G4 ~ ~ | ~ ~ ~ "+
            "Bb3+D4+F4 ~ ~ | ~ ~ ~ | F3+A3+C4 ~ ~ | ~ ~ ~ "+
            "A3+C#4+E4 ~ ~ | ~ ~ ~ | D4+F4+A4 ~ ~ | ~ ~ ~",{i:'organ',v:.032}),
    bsA:mel("D2 ~ ~ | A2 ~ ~ | D3 ~ ~ | A2 ~ ~ "+
            "Bb1 ~ ~ | F2 ~ ~ | A1 ~ ~ | E2 ~ ~ "+
            "F2 ~ ~ | C3 ~ ~ | F2 ~ ~ | C3 ~ ~ "+
            "G2 ~ ~ | D3 ~ ~ | D2 ~ ~ | A2 ~ ~",{i:'bass',v:.10}),
    bsR:mel("D2 ~ ~ | A2 ~ ~ | Bb1 ~ ~ | F2 ~ ~ "+
            "F2 ~ ~ | C3 ~ ~ | C2 ~ ~ | G2 ~ ~ "+
            "Bb1 ~ ~ | F2 ~ ~ | F2 ~ ~ | C3 ~ ~ "+
            "A1 ~ ~ | E2 ~ ~ | D2 ~ ~ | A2 ~ ~",{i:'bass',v:.10}),
    dr0:dr("t . . | . . . | t . . | . . ."),
    dr1:dr("k . . | . . h | t . . | . . h"),
    dr2:dr("k . . | h . h | t . t | h . h "+
           "k . . | h . h | t t t | r . .")
  },
  seq:[
    {u:['ldA','bsA','dr0'],len:48,rep:1},
    {u:['ldA','bsA','hrA','dr1'],len:48,rep:1},
    {u:['ldR','bsR','hrR','dr2'],len:48,rep:1},
    {u:['ldB','bsA','hrA','dr1'],len:48,rep:1},
    {u:['ldR','bsR','hrR','dr2'],len:48,rep:1}
  ], loop:1 };

/* ---------- 🌙 SOGNI — ninna nanna per leggere in pace (fa maggiore, 74) ---------- */
const TRK_LULLABY={ bpm:74, echo:.45,
  p:{
    ldA:mel("F5 ~ ~ ~ | A5 ~ ~ ~ | C6 ~ ~ ~ | ~ ~ ~ ~ "+
            "Bb5 ~ ~ ~ | A5 ~ ~ ~ | F5 ~ ~ ~ | ~ ~ ~ ~ "+
            "G5 ~ ~ ~ | Bb5 ~ ~ ~ | D6 ~ ~ ~ | ~ ~ ~ ~ "+
            "C6 ~ ~ ~ | A5 ~ ~ ~ | F5 ~ ~ ~ | ~ ~ ~ ~",{i:'bell',v:.07}),
    ldB:mel("C6 ~ ~ ~ | Bb5 ~ ~ ~ | A5 ~ ~ ~ | G5 ~ ~ ~ "+
            "F5 ~ ~ ~ | G5 ~ ~ ~ | A5 ~ ~ ~ | ~ ~ ~ ~ "+
            "D6 ~ ~ ~ | C6 ~ ~ ~ | Bb5 ~ ~ ~ | A5 ~ ~ ~ "+
            "G5 ~ ~ ~ | F5 ~ ~ ~ | C5 ~ ~ ~ | ~ ~ ~ ~",{i:'flute',v:.05}),
    arp:mel("F3 A3 C4 F4 | C4 A3 F3 A3 | C4 F4 A4 F4 | C4 A3 F3 C3 "+
            "Bb2 D3 F3 Bb3 | F3 D3 Bb2 D3 | F3 Bb3 D4 Bb3 | F3 D3 Bb2 F2 "+
            "G2 Bb2 D3 G3 | D3 Bb2 G2 Bb2 | D3 G3 Bb3 G3 | D3 Bb2 G2 D2 "+
            "C3 E3 G3 C4 | G3 E3 C3 E3 | G3 C4 E4 C4 | G3 E3 C3 G2",{i:'pluck',v:.026}),
    pd:mel("F2+C3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "Bb1+F2 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "G2+D3 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ "+
           "C2+G2 ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~ | ~ ~ ~ ~",{i:'pad',v:.055})
  },
  seq:[
    {u:['pd','arp'],len:64,rep:1},
    {u:['ldA','pd','arp'],len:64,rep:1},
    {u:['ldB','pd','arp'],len:64,rep:1},
    {u:['ldA','pd','arp'],len:64,rep:1}
  ], loop:1 };

/* ============================================================
   ELENCO DEI BRANI (per il pannello 🎵) e rotazione automatica
   ============================================================ */
const TRACKS=[
  {id:'auto',   em:'🎲', nm:['Automatica','Automatic'],
   d:['Ogni gioco e ogni livello ha la sua musica','Every game and level picks its own']},
  {id:'level',  em:'🏃', nm:['Corsa','Runner'],
   d:['Allegra, stile platform 8-bit','Upbeat 8-bit platformer'],   get:()=>TRK_LEVEL},
  {id:'rocket', em:'🚀', nm:['Razzi','Rockets'],
   d:['Lenta e spavalda, chitarre anni \'90','Slow and swaggering, \'90s rock'], get:()=>TRK_ROCKET},
  {id:'menu',   em:'🏠', nm:['Benvenuto','Welcome'],
   d:['Dolce, campanelli e arpeggi','Sweet bells and arpeggios'],   get:()=>TRK_MENU},
  {id:'boss',   em:'🐲', nm:['Il Guardiano','The Guardian'],
   d:['Tesa e battagliera','Tense and battling'],                   get:()=>TRK_BOSS},
  {id:'techno', em:'💻', nm:['Circuiti','Circuits'],
   d:['Elettronica con arpeggi veloci','Electronic with fast arpeggios'], get:()=>TRK_TECHNO},
  {id:'space',  em:'🪐', nm:['Orbita','Orbit'],
   d:['Ampia e spaziale, lenta','Wide and spacey, slow'],           get:()=>TRK_SPACE},
  {id:'funk',   em:'🔧', nm:['Officina','Workshop'],
   d:['Funky, bassi sincopati','Funky syncopated bass'],            get:()=>TRK_FUNK},
  {id:'baroque',em:'🎻', nm:['Invenzione','Invention'],
   d:['Barocca a due voci, stile Bach','Two-voice baroque, Bach style'], get:()=>TRK_BAROQUE},
  {id:'sea',    em:'⛵', nm:['Mare','Sea'],
   d:['Canto dei marinai in 6/8','Sailors\' song in 6/8'],          get:()=>TRK_SEA},
  {id:'lullaby',em:'🌙', nm:['Sogni','Dreams'],
   d:['Ninna nanna, per leggere in pace','Lullaby, calm reading'],  get:()=>TRK_LULLABY},
  {id:'hive',   em:'🐝', nm:['Alveare','Beehive'],
   d:['Ronzio operoso delle api','The busy hum of bees'],
   get:()=>(typeof TRK_HIVE!=='undefined'?TRK_HIVE:TRK_LEVEL)}
];

/* Un brano diverso per ogni tema del Labirinto (indice = THEMES) */
const THEME_TRACKS=[
  'rocket',  /*  0 Razzi Spaziali */
  'level',   /*  1 Fenomeni Naturali */
  'sea',     /*  2 Disastri Navali */
  'funk',    /*  3 Chimica */
  'techno',  /*  4 Elettronica */
  'hive',    /*  5 Api e Apicoltura */
  'baroque', /*  6 Fisica */
  'space',   /*  7 Missioni Spaziali */
  'sea',     /*  8 Lingua Inglese */
  'level',   /*  9 Geronimo Stilton */
  'techno',  /* 10 Computer e Componenti */
  'funk',    /* 11 Programmazione */
  'space'    /* 12 Internet e Sicurezza */
];
function trackById(id){
  const e=TRACKS.find(x=>x.id===id);
  return (e&&e.get)?e.get():TRK_LEVEL;
}
function levelTrack(i){
  const id=THEME_TRACKS[i];
  return id?trackById(id):TRK_LEVEL;
}

/* ============================================================
   PANNELLO 🎵 — scegli il brano e il volume
   ============================================================ */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#mus { z-index:26; background:rgba(8,12,32,.82); }',
  '#mus .musCard { width:min(760px,96vw); max-height:92vh; overflow:auto; text-align:center; }',
  '#musTitle { font-size:clamp(24px,5vw,34px); color:#2b3a8f; margin-bottom:4px; }',
  '#musSub { font-size:15px; color:#666; margin-bottom:10px; }',
  '#musTop { display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:12px; }',
  '#musOnOff { border:2px solid #b7c4ee;border-radius:14px;background:#fff;color:#29386f;padding:10px 14px;font:bold 16px inherit;cursor:pointer;box-shadow:0 3px 0 #c5cffb; }',
  '#musOnOff.off { background:#fff3f3;border-color:#efb4b4;color:#a52626;box-shadow:0 3px 0 #efcaca; }',
  '#musVolBox { display:flex;align-items:center;gap:8px;border:2px solid #b7c4ee;border-radius:14px;background:#fff;padding:8px 12px;box-shadow:0 3px 0 #c5cffb; }',
  '#musVol { width:150px; }',
  '#musVolLab { font:bold 15px inherit;color:#29386f;min-width:44px; }',
  '#musList { display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }',
  '.musBtn { border:3px solid #c5cffb;border-radius:18px;background:#f7f9ff;color:#26346b;padding:10px 8px;font:inherit;cursor:pointer;text-align:left;box-shadow:0 4px 0 #dbe2ff; }',
  '.musBtn:active { transform:translateY(2px);box-shadow:none; }',
  '.musBtn.on { background:linear-gradient(180deg,#3cba54,#2f9443);color:#fff;border-color:#2f9443;box-shadow:0 4px 0 #237037; }',
  '.musBtn .musEm { font-size:26px;display:block; }',
  '.musBtn .musNm { font:bold 16px inherit;display:block;margin-top:2px; }',
  '.musBtn .musD { font-size:12px;opacity:.86;display:block;line-height:1.25;margin-top:2px; }',
  '#musClose { margin-top:14px; }',
  '@media(max-width:700px){#musList{grid-template-columns:repeat(2,1fr)}#mus .musCard{padding:12px 8px}.musBtn .musNm{font-size:14px}}'
  ].join('\n');
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',
  '<div class="overlay" id="mus">'+
    '<div class="card musCard">'+
      '<div id="musTitle">🎵 La musica</div>'+
      '<div id="musSub"></div>'+
      '<div id="musTop">'+
        '<button id="musOnOff" type="button"></button>'+
        '<div id="musVolBox"><span>🔉</span>'+
          '<input id="musVol" type="range" min="0" max="100" step="5">'+
          '<span id="musVolLab"></span></div>'+
      '</div>'+
      '<div id="musList"></div>'+
      '<button class="bigBtn" id="musClose">✅ Va bene</button>'+
    '</div>'+
  '</div>');
})();

function musPanelRefresh(){
  const i=(typeof LI==='function')?LI():0, p=$('mus');
  if(!p) return;
  $('musSub').textContent=i===0
    ?'Scegli la musica che ti piace di più. Puoi cambiarla quando vuoi!'
    :'Pick the music you like best. You can change it any time!';
  const on=$('musOnOff');
  on.textContent=MUSICON?(i===0?'🎵 Musica: sì':'🎵 Music: on'):(i===0?'🔇 Musica: no':'🔇 Music: off');
  on.classList.toggle('off',!MUSICON);
  $('musVol').value=String(Math.round(MUSVOL*100));
  $('musVolLab').textContent=Math.round(MUSVOL*100)+'%';
  const list=$('musList');
  list.innerHTML='';
  TRACKS.forEach(t=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='musBtn'+(MUSPICK===t.id?' on':'');
    b.dataset.track=t.id;
    b.innerHTML='<span class="musEm">'+t.em+'</span><span class="musNm">'+t.nm[i]+'</span><span class="musD">'+t.d[i]+'</span>';
    b.onclick=()=>{ if(!MUSICON) musToggleOn(true); musPickTrack(t.id); };
    list.appendChild(b);
  });
  $('musClose').textContent=(i===0)?'✅ Va bene':'✅ Done';
}
function musToggleOn(force){
  MUSICON=(force===undefined)?!MUSICON:!!force;
  try{ if(typeof save==='function') save(); else localStorage.setItem('gabri_music',MUSICON?'1':'0'); }catch(e){}
  if(!MUSICON) stopMusic();
  else { mCtx(); playMusic(mWanted||TRK_MENU); }
  if(typeof applyUI==='function'){ try{ applyUI(); }catch(e){} }
  if(typeof applyModeSettings==='function'){ try{ applyModeSettings(); }catch(e){} }
  musIcons();
  musPanelRefresh();
}
/* i bottoni musica dentro i giochi mostrano 🎵 o 🔇 */
function musIcons(){
  ['avMusic','paMusicBtn','msMusicBtn','ocMusicBtn','btnMusicHud'].forEach(id=>{
    const b=$(id);
    if(b) b.textContent=MUSICON?'🎵':'🔇';
  });
}
function musPanelOpen(){
  if(typeof stopSpeak==='function') stopSpeak();
  mCtx();
  if(MUSICON&&!mTrack) playMusic(mWanted||TRK_MENU);
  musPanelRefresh();
  $('mus').style.display='flex';
}
function musPanelClose(){ $('mus').style.display='none'; }

/* i bottoni musica dei vari giochi aprono il pannello (il vecchio
   comportamento era acceso/spento secco: ora si sceglie anche il brano) */
function toggleMusic(){ musPanelOpen(); }

addEventListener('load',()=>{
  $('musClose').onclick=musPanelClose;
  $('mus').onclick=e=>{ if(e.target&&e.target.id==='mus') musPanelClose(); };
  $('musOnOff').onclick=()=>musToggleOn();
  $('musVol').oninput=e=>{ musSetVolume(Number(e.target.value)/100); $('musVolLab').textContent=Math.round(MUSVOL*100)+'%'; };
  ['btnMusic','btnMusicHud','modeMusic'].forEach(id=>{ const b=$(id); if(b) b.onclick=musPanelOpen; });
  musPanelRefresh();
});
