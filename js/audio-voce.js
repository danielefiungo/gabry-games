/* ============================================================
   SUONI, MUSICA E VOCE (sintesi vocale + karaoke)
   ============================================================ */
/* ================= UTILITY ================= */
const $ = id => document.getElementById(id);
const LI = () => 0;
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ---------- Suoni ---------- */
let actx=null;
function beep(f,d,delay,type,v){
  delay=delay||0; type=type||'sine'; v=v||0.15;
  try{
    if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(), g=actx.createGain();
    o.type=type; o.frequency.value=f; o.connect(g); g.connect(actx.destination);
    const t=actx.currentTime+delay;
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+d);
    o.start(t); o.stop(t+d+0.05);
  }catch(e){}
}
const sCorrect=()=>{ beep(523,.15); beep(659,.15,.13); beep(784,.3,.26); };
const sWrong  =()=> beep(180,.3,0,'sawtooth',.07);
const sStar   =()=> [523,659,784,1047,1319].forEach((f,i)=>beep(f,.18,i*.11));
const sDoor   =()=>{ beep(300,.1,.5); beep(400,.1,.58); beep(500,.15,.66); };
const sToken  =()=>{ beep(880,.1); beep(660,.1,.1); beep(880,.2,.2); };
const sLose   =()=>{ [392,370,349,330].forEach((f,i)=>beep(f,.22,i*.18,'sawtooth',.06)); };

/* ---------- Musica 8-bit (chiptune, Web Audio) ---------- */
let MUSICON=true;
let mGain=null,mTimer=null,mTrack=null,mStep=0,mNext=0,mNoiseBuf=null;
const MVOL=0.55, duckers=new Set();
const mF=m=>440*Math.pow(2,(m-69)/12);
function mCtx(){ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended'){ try{actx.resume();}catch(e){} } return actx; }
function mTone(m,t,d,type,v){
  const o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.value=mF(m);
  o.connect(g); g.connect(mGain);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(v,t+0.012);
  g.gain.setValueAtTime(v,Math.max(t+0.013,t+d-0.05));
  g.gain.exponentialRampToValueAtTime(0.001,t+d);
  o.start(t); o.stop(t+d+0.05);
}
function mNoise(){
  if(!mNoiseBuf){
    const b=actx.createBuffer(1,Math.floor(actx.sampleRate*0.12),actx.sampleRate), ch=b.getChannelData(0);
    for(let i=0;i<ch.length;i++) ch[i]=Math.random()*2-1;
    mNoiseBuf=b;
  }
  return mNoiseBuf;
}
function mDrum(kind,t){
  if(kind==='k'){ /* cassa */
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(40,t+0.11);
    g.gain.setValueAtTime(0.3,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.13);
    o.connect(g); g.connect(mGain); o.start(t); o.stop(t+0.16);
  } else { /* s = rullante, h = charleston */
    const s=actx.createBufferSource(), g=actx.createGain(), f=actx.createBiquadFilter();
    s.buffer=mNoise(); f.type='highpass';
    f.frequency.value=(kind==='s')?1600:6000;
    const d=(kind==='s')?0.09:0.04, v=(kind==='s')?0.15:0.07;
    g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.001,t+d);
    s.connect(f); f.connect(g); g.connect(mGain);
    s.start(t); s.stop(t+d+0.02);
  }
}
function mSchedule(){
  if(!mTrack||!mGain) return;
  const spb=15/mTrack.bpm; /* durata di un sedicesimo */
  while(mNext<actx.currentTime+0.25){
    const t=mNext;
    mTrack.ch.forEach(c=>{
      const n=c.n[mStep%c.n.length];
      if(!n) return;
      if(c.d){ mDrum(n,t); return; }
      const mid=Array.isArray(n)?n[0]:n, len=Array.isArray(n)?n[1]:1;
      mTone(mid,t,spb*len*0.92,c.w,c.v);
    });
    mNext+=spb; mStep++;
  }
}
function playMusic(track){
  stopMusic();
  if(!MUSICON||!track) return;
  try{
    mCtx();
    mGain=actx.createGain();
    mGain.gain.value=duckers.size?MVOL*0.2:MVOL;
    mGain.connect(actx.destination);
    mTrack=track; mStep=0; mNext=actx.currentTime+0.06;
    mTimer=setInterval(mSchedule,80);
    mSchedule();
  }catch(e){}
}
function stopMusic(){
  if(mTimer){ clearInterval(mTimer); mTimer=null; }
  if(mGain){
    const g=mGain; mGain=null;
    try{ g.gain.setTargetAtTime(0.0001,actx.currentTime,0.04); setTimeout(()=>{ try{g.disconnect();}catch(e){} },300); }catch(e){}
  }
  mTrack=null;
}
function duckMusic(on,why){
  why=why||'x';
  if(on) duckers.add(why); else duckers.delete(why);
  if(mGain&&actx){ try{ mGain.gain.setTargetAtTime(duckers.size?MVOL*0.2:MVOL,actx.currentTime,0.12); }catch(e){} }
}

/* Tema livello: allegro stile platform 8-bit (do maggiore) */
const TRK_LEVEL={ bpm:160, ch:[
  { w:'square', v:0.05, n:[
    72,0,76,0,79,0,76,0, 72,0,76,0,79,0,84,0,
    81,0,79,0,76,0,74,0, 72,0,74,0,[76,2],0,0,0,
    77,0,81,0,84,0,81,0, 77,0,74,0,[72,2],0,0,0,
    74,0,79,0,83,0,79,0, [83,2],0,[81,2],0,[79,2],0,0,0 ]},
  { w:'triangle', v:0.085, n:[
    48,0,55,0,48,0,55,0, 48,0,55,0,48,0,55,0,
    45,0,52,0,45,0,52,0, 45,0,52,0,45,0,52,0,
    41,0,48,0,41,0,48,0, 41,0,48,0,41,0,48,0,
    43,0,50,0,43,0,50,0, 43,0,50,0,43,0,50,0 ]},
  { d:1, n:['k',0,'h',0,'s',0,'h',0,'k',0,'k',0,'s',0,'h','h'] }
]};
/* Tema razzi: britpop anni '90, lento e "spavaldo" (do misolidio, C-Bb-F-C),
   melodia originale con gancio ripetuto e accordi lunghi in sottofondo */
const TRK_ROCKET={ bpm:88, ch:[
  { w:'square', v:0.05, n:[
    [79,2],0,[79,2],0,[81,2],0,[79,2],0,[76,4],0,0,0,[74,2],0,[72,2],0,
    [77,2],0,[77,2],0,[79,2],0,[77,2],0,[74,4],0,0,0,[72,4],0,0,0,
    [77,2],0,[79,2],0,[81,4],0,0,0,[79,2],0,[77,2],0,[74,4],0,0,0,
    [76,2],0,[74,2],0,[72,8],0,0,0,0,0,0,0,0,0,[67,2],0 ]},
  { w:'square', v:0.024, n:[
    [64,8],0,0,0,0,0,0,0,[67,8],0,0,0,0,0,0,0,
    [65,8],0,0,0,0,0,0,0,[62,8],0,0,0,0,0,0,0,
    [65,8],0,0,0,0,0,0,0,[69,8],0,0,0,0,0,0,0,
    [64,8],0,0,0,0,0,0,0,[62,8],0,0,0,0,0,0,0 ]},
  { w:'triangle', v:0.09, n:[
    48,0,48,0,48,0,55,0, 48,0,48,0,46,0,46,0,
    46,0,46,0,46,0,53,0, 46,0,46,0,41,0,41,0,
    41,0,41,0,41,0,48,0, 41,0,41,0,43,0,45,0,
    48,0,48,0,48,0,55,0, 48,0,46,0,45,0,43,0 ]},
  { d:1, n:['k',0,'h',0,'s',0,'h','h','k',0,'k',0,'s',0,'h',0] }
]};
/* Tema del menu: dolce e accogliente (arpeggi C-Am-F-G) */
const TRK_MENU={ bpm:120, ch:[
  { w:'triangle', v:0.07, n:[
    [72,4],0,0,0,[76,4],0,0,0,[79,6],0,0,0,0,0,[76,2],0,
    [81,4],0,0,0,[76,4],0,0,0,[72,8],0,0,0,0,0,0,0,
    [77,4],0,0,0,[81,4],0,0,0,[84,6],0,0,0,0,0,[81,2],0,
    [79,4],0,0,0,[76,4],0,0,0,[74,8],0,0,0,0,0,0,0 ]},
  { w:'square', v:0.032, n:[
    60,0,64,0,67,0,72,0, 76,0,72,0,67,0,64,0,
    57,0,60,0,64,0,69,0, 72,0,69,0,64,0,60,0,
    53,0,57,0,60,0,65,0, 69,0,65,0,60,0,57,0,
    55,0,59,0,62,0,67,0, 71,0,67,0,62,0,59,0 ]},
  { d:1, n:['h',0,0,0,'h',0,0,0,'h',0,0,0,'h',0,0,0] }
]};
/* Tema boss: teso ma divertente (la minore) */
const TRK_BOSS={ bpm:140, ch:[
  { w:'square', v:0.045, n:[
    69,0,69,71,72,0,71,69, 76,0,76,77,76,74,72,71,
    69,0,69,71,72,0,74,0, 76,0,79,0,77,76,74,72 ]},
  { w:'triangle', v:0.085, n:[
    45,0,45,45,0,45,0,44, 45,0,45,45,0,47,0,48 ]},
  { d:1, n:['k',0,'h',0,'s',0,'h',0,'k',0,'h',0,'s',0,'h','h'] }
]};
function levelTrack(i){ return /Razzi|Missioni/i.test(THEMES[i].name[0]) ? TRK_ROCKET : TRK_LEVEL; }
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

/* ---------- Voce naturale con fallback ----------
   Piper TTS nel browser (vits-web): voce italiana "Paola",
   voce inglese "HFC female". Modelli scaricati da Hugging Face
   la prima volta e salvati nel browser (OPFS).
   Se qualcosa fallisce: voce di sistema (speechSynthesis). */
let piper=null, piperReady={}, ttsLoadingLang=null, ttsAudio=null, speakBusy=false;
const VOICE={ it:'it_IT-paola-medium', en:'en_US-hfc_female-medium' };

/* ---------- Cache dei modelli TTS in IndexedDB ----------
   La cache interna di vits-web (OPFS) non funziona aprendo il file
   direttamente (file://), quindi intercettiamo fetch: i modelli
   scaricati da Hugging Face (e i wasm dai CDN) vengono salvati in
   IndexedDB e riletti da lì alle visite successive. */
const CACHE_HOSTS=['https://huggingface.co/','https://cdnjs.cloudflare.com/','https://cdn.jsdelivr.net/'];
const origFetch=window.fetch.bind(window);
function idbOpen(){ return new Promise((res,rej)=>{
  const r=indexedDB.open('gabri-tts-cache',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('files');
  r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);
});}
async function idbGet(key){ try{
  const db=await idbOpen();
  return await new Promise(res=>{
    const q=db.transaction('files').objectStore('files').get(key);
    q.onsuccess=()=>res(q.result); q.onerror=()=>res(undefined);
  });
}catch(e){ return undefined; } }
async function idbPut(key,blob){ try{
  const db=await idbOpen();
  db.transaction('files','readwrite').objectStore('files').put(blob,key);
}catch(e){} }
window.fetch=async function(input,opts){
  const u=String((input&&input.url)||input);
  if(CACHE_HOSTS.some(h=>u.startsWith(h))){
    const hit=await idbGet(u);
    if(hit) return new Response(hit,{status:200,headers:{'Content-Length':hit.size,'Content-Type':hit.type||'application/octet-stream'}});
    const resp=await origFetch(input,opts);
    if(resp.ok){ resp.clone().blob().then(b=>idbPut(u,b)).catch(()=>{}); }
    return resp;
  }
  return origFetch(input,opts);
};
async function initTTS(){
  const lang=LANG;
  if(ttsLoadingLang || piperReady[lang]) return;
  ttsLoadingLang=lang;
  const st=$('ttsStatus');
  try{
    if(!piper){
      piper=await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web/+esm');
      /* vits-web non conosce "paola" (la sua mappa interna ha solo riccardo-x_low
         per l'italiano), ma il modello esiste su Hugging Face: lo registriamo. */
      try{ piper.PATH_MAP['it_IT-paola-medium']='it/it_IT/paola/medium/it_IT-paola-medium.onnx'; }catch(e){}
      if(!piper.PATH_MAP || !piper.PATH_MAP['it_IT-paola-medium']) VOICE.it='it_IT-riccardo-x_low';
    }
    st.textContent=UI.loadingVoice[LI()];
    const bar=$('ttsBar'), fill=$('ttsBarFill');
    bar.style.display='block'; fill.style.width='0%';
    await piper.download(VOICE[lang], p=>{
      const pct=p.total?Math.round(p.loaded*100/p.total):0;
      st.textContent=UI.loadingVoice[LI()]+' '+pct+'%';
      fill.style.width=pct+'%';
    });
    piperReady[lang]=true;
    bar.style.display='none';
    st.textContent=UI.voiceReady[LI()];
  }catch(e){
    console.warn('Voce naturale non disponibile, uso la voce di sistema.',e);
    st.textContent=''; $('ttsBar').style.display='none';
  }
  ttsLoadingLang=null;
}
const PAUSE_MS=600, TTS_RATE=0.85, SYS_RATE=0.75;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function cleanTxt(t){ return String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,'').trim(); }
/* stopSpeak interrompe subito qualsiasi lettura in corso
   (es. quando si risponde mentre il TTS sta ancora leggendo). */
let speakGen=0;
function stopSpeak(){
  speakGen++;
  if(ttsAudio){ try{ ttsAudio.pause(); }catch(e){} ttsAudio=null; }
  try{ speechSynthesis.cancel(); }catch(e){}
  speakBusy=false;
  duckMusic(false,'tts');
  karaClear();
}

/* ===== Karaoke: evidenzia ciò che la voce sta leggendo =====
   Un "part" può essere una stringa oppure {t, el, from, to, block}:
   - el: elemento che contiene il testo da evidenziare
   - from/to: intervallo di parole dentro el (default: tutte)
   - block: evidenzia l'intero elemento (es. bottoni risposta) */
let karaEls=[], karaCur=null;
function karaPrepEl(el){
  let k=karaEls.find(x=>x.el===el);
  if(k) return k;
  const text=el.textContent;
  k={el,text,spans:[]};
  el.textContent='';
  text.split(/(\s+)/).forEach(w=>{
    if(!w) return;
    if(/^\s+$/.test(w)) el.appendChild(document.createTextNode(w));
    else { const s=document.createElement('span'); s.className='karaW'; s.textContent=w; el.appendChild(s); k.spans.push(s); }
  });
  karaEls.push(k);
  return k;
}
function karaStart(p){
  karaEnd();
  if(!p.el) return;
  if(p.block){ p.el.classList.add('karaBlockOn'); karaCur={block:p.el}; return; }
  const k=karaPrepEl(p.el);
  if(!k.spans.length) return;
  const from=Math.min(p.from||0,k.spans.length-1);
  const to=(p.to!=null)?Math.min(p.to,k.spans.length-1):k.spans.length-1;
  for(let j=from;j<=to;j++) k.spans[j].classList.add('sent');
  karaCur={k,from,to,idx:-1};
  karaWord(0);
}
function karaWord(i){
  if(!karaCur||karaCur.block) return;
  const {k,from,to}=karaCur;
  const gi=Math.max(from,Math.min(from+i,to));
  if(karaCur.idx===gi) return;
  if(karaCur.idx>=0) k.spans[karaCur.idx].classList.remove('on');
  karaCur.idx=gi;
  const s=k.spans[gi];
  s.classList.add('on');
  try{ s.scrollIntoView({block:'nearest'}); }catch(e){}
}
function karaEnd(){
  if(!karaCur) return;
  if(karaCur.block) karaCur.block.classList.remove('karaBlockOn');
  else {
    const {k,from,to,idx}=karaCur;
    if(idx>=0) k.spans[idx].classList.remove('on');
    for(let j=from;j<=to;j++) k.spans[j].classList.remove('sent');
  }
  karaCur=null;
}
function karaClear(){
  karaEnd();
  karaEls.forEach(k=>{ k.el.textContent=k.text; });
  karaEls=[];
  document.querySelectorAll('.karaBlockOn').forEach(e=>e.classList.remove('karaBlockOn'));
}
/* per l'audio Piper (nessun evento parola): stima il tempo di ogni
   parola in proporzione alla sua lunghezza */
function karaTicker(audio,p,gen){
  if(!karaCur||karaCur.block) return ()=>{};
  const words=p.t.split(/\s+/).filter(Boolean);
  if(!words.length) return ()=>{};
  const w=words.map(x=>x.length+1), tot=w.reduce((a,b)=>a+b,0);
  const cum=[]; let a=0; for(const x of w){ a+=x; cum.push(a/tot); }
  const id=setInterval(()=>{
    if(gen!==speakGen){ clearInterval(id); return; }
    const d=audio.duration;
    if(!d||!isFinite(d)) return;
    const f=Math.min(audio.currentTime/d,0.999);
    let i=cum.findIndex(c=>f<c); if(i<0) i=words.length-1;
    karaWord(i);
  },80);
  return ()=>clearInterval(id);
}
/* speak accetta una stringa o un array di frasi: tra una frase
   e l'altra fa una pausa, e la lettura è un po' più lenta.
   Una nuova chiamata interrompe la lettura precedente. */
async function speak(text){
  if(!VOICEON) return;
  const parts=(Array.isArray(text)?text:[text])
    .map(p=> (p&&typeof p==='object') ? {...p, t:cleanTxt(p.t)} : {t:cleanTxt(p)})
    .filter(p=>p.t);
  if(!parts.length) return;
  stopSpeak();
  const gen=speakGen;
  duckMusic(true,'tts');
  if(piper && piperReady[LANG]){
    speakBusy=true;
    try{
      for(let k=0;k<parts.length;k++){
        const wav=await piper.predict({ text:parts[k].t, voiceId:VOICE[LANG] });
        if(gen!==speakGen) return;
        ttsAudio=new Audio(URL.createObjectURL(wav));
        ttsAudio.playbackRate=TTS_RATE;
        karaStart(parts[k]);
        const stopTick=karaTicker(ttsAudio,parts[k],gen);
        await new Promise(res=>{ ttsAudio.onended=res; ttsAudio.onerror=res; ttsAudio.play().catch(res); });
        stopTick();
        if(gen!==speakGen) return;
        karaEnd();
        if(k<parts.length-1){ await wait(PAUSE_MS); if(gen!==speakGen) return; }
      }
      speakBusy=false; duckMusic(false,'tts'); karaClear(); return;
    }catch(e){ console.warn('TTS errore, fallback voce di sistema',e); speakBusy=false; if(gen!==speakGen) return; karaEnd(); }
  }
  try{
    speechSynthesis.cancel();
    for(let k=0;k<parts.length;k++){
      karaStart(parts[k]);
      await new Promise(res=>{
        const u=new SpeechSynthesisUtterance(parts[k].t);
        u.lang=(LANG==='it')?'it-IT':'en-US'; u.rate=SYS_RATE;
        u.onboundary=ev=>{
          if(ev.charIndex==null) return;
          const before=parts[k].t.slice(0,ev.charIndex).trim();
          karaWord(before?before.split(/\s+/).length:0);
        };
        u.onend=res; u.onerror=res;
        speechSynthesis.speak(u);
      });
      if(gen!==speakGen) return;
      karaEnd();
      if(k<parts.length-1){ await wait(PAUSE_MS); if(gen!==speakGen) return; }
    }
  }catch(e){}
  if(gen===speakGen){ duckMusic(false,'tts'); karaClear(); }
}
