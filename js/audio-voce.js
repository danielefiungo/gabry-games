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

/* ---------- Musica ----------
   Il motore musicale, i brani e il pannello 🎵 stanno in js/musica.js
   (caricato subito dopo questo file). Qui resta solo l'interruttore. */
let MUSICON=true;


/* ---------- Voce naturale con fallback ----------
   Piper TTS nel browser (vits-web): voce italiana "Paola",
   voce inglese "HFC female". Modelli scaricati da Hugging Face
   la prima volta e salvati nel browser (OPFS).
   Se qualcosa fallisce: voce di sistema (speechSynthesis). */
let piper=null, piperReady={}, ttsLoadingLang=null, ttsAudio=null, speakBusy=false, voiceGenerating=false;
const VOICE={ it:'it_IT-paola-medium', en:'en_US-hfc_female-medium' };

/* Indicatore unico e non modale per tutti i giochi. La generazione Piper può
   richiedere qualche secondo: informiamo il bambino senza coprire la pagina. */
function setVoiceGenerating(on){
  voiceGenerating=on;
  let ov=$('voiceGenerating');
  if(!ov){
    ov=document.createElement('div'); ov.id='voiceGenerating';
    ov.setAttribute('role','status'); ov.setAttribute('aria-live','polite');
    ov.innerHTML='<div class="voiceGeneratingCard"><div class="voiceWave"><i></i><i></i><i></i><i></i><i></i></div><strong class="voiceGeneratingText"></strong><span></span></div>';
    document.body.appendChild(ov);
  }
  ov.querySelector('.voiceGeneratingText').textContent=(typeof LANG!=='undefined'&&LANG==='en')?'Preparing the voice…':'Sto preparando la voce…';
  ov.querySelector('span').textContent=(typeof LANG!=='undefined'&&LANG==='en')?'Just a moment':'Un attimo di pazienza';
  ov.classList.toggle('show',on);
  document.body.classList.toggle('voice-is-generating',on);
}

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
  setVoiceGenerating(false);
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
  if(speakBusy || voiceGenerating) return;
  const parts=(Array.isArray(text)?text:[text])
    .map(p=> (p&&typeof p==='object') ? {...p, t:cleanTxt(p.t)} : {t:cleanTxt(p)})
    .filter(p=>p.t);
  if(!parts.length) return;
  stopSpeak();
  speakBusy=true;
  const gen=speakGen;
  duckMusic(true,'tts');
  if(piper && piperReady[LANG]){
    try{
      for(let k=0;k<parts.length;k++){
        setVoiceGenerating(true);
        const wav=await piper.predict({ text:parts[k].t, voiceId:VOICE[LANG] });
        if(gen!==speakGen){ setVoiceGenerating(false); return; }
        ttsAudio=new Audio(URL.createObjectURL(wav));
        ttsAudio.playbackRate=TTS_RATE;
        karaStart(parts[k]);
        const stopTick=karaTicker(ttsAudio,parts[k],gen);
        await new Promise(res=>{ ttsAudio.onended=res; ttsAudio.onerror=res; ttsAudio.play().then(()=>setVoiceGenerating(false)).catch(()=>{setVoiceGenerating(false);res();}); });
        stopTick();
        if(gen!==speakGen) return;
        karaEnd();
        if(k<parts.length-1){ await wait(PAUSE_MS); if(gen!==speakGen) return; }
      }
      speakBusy=false; setVoiceGenerating(false); duckMusic(false,'tts'); karaClear(); return;
    }catch(e){ console.warn('TTS errore, fallback voce di sistema',e); setVoiceGenerating(false); if(gen!==speakGen){speakBusy=false;return;} karaEnd(); }
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
  if(gen===speakGen){ speakBusy=false; setVoiceGenerating(false); duckMusic(false,'tts'); karaClear(); }
}
