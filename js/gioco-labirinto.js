/* ============================================================
   LOGICA DI GIOCO — domande, vite, boss, vittoria, menu, avvio
   ============================================================ */
/* ================= LOGICA ================= */
function checkDoors(){
  for(const d of doors){
    if(d.open) continue;
    const p=g2w(d.gx,d.gz);
    const dist=Math.hypot(player.position.x-p.x, player.position.z-p.z);
    if(d.cooldown){ if(dist>2.6) d.cooldown=false; continue; }
    if(dist<1.5){ showQuestion(d); return; }
  }
}
let starCooldown=false;
function checkStar(){
  const sp=g2w(W-2,H-2);
  const d=Math.hypot(player.position.x-sp.x, player.position.z-sp.z);
  if(starCooldown){ if(d>2.2) starCooldown=false; return; }
  if(d<1.0) startBoss();
}
/* ================= POWER-UP ================= */
function showPowerBig(txt){
  const el=$('comboBig');
  el.textContent=txt;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function collectPowerup(pu,k){
  const i=LI();
  scene.remove(pu.sprite);
  powerups.splice(k,1);
  burst(pu.sprite.position.clone(),THEMES[curLevel].wall);
  if(pu.type==='heart'){
    if(lives<MAXLIVES){ lives++; showPowerBig(UI.powerHeart[i]); }
    else { score+=10; save(); showPowerBig(UI.powerHeartFull[i]); }
    sCorrect();
  } else if(pu.type==='jolly'){
    freeJolly++; sToken(); showPowerBig(UI.powerJolly[i]);
  } else if(pu.type==='shield'){
    shieldOn=true; sDoor(); showPowerBig(UI.powerShield[i]);
  }
  updateHUD();
}
function huntWordStr(){
  return hunt.word.split('').map((ch,k)=>hunt.got[k]?ch:'·').join(' ');
}
function collectLetter(l){
  l.done=true; hunt.got[l.idx]=true;
  scene.remove(l.sprite);
  burst(l.sprite.position.clone(),THEMES[curLevel].accent);
  if(hunt.got.every(Boolean)){
    /* parola completata! bonus + la parola entra nell'album */
    score+=30; save(); sStar();
    collectWord(hunt.s);
    showPowerBig('🔤 '+hunt.word+'! +30 ⭐');
    if(VOICEON) speak(hunt.word);
    hunt=null;
  } else {
    sToken();
    showPowerBig('🔤 '+huntWordStr());
    if(VOICEON) speak(l.ch);
  }
  updateHUD();
}
function checkPowerups(){
  for(let k=powerups.length-1;k>=0;k--){
    const p=powerups[k].sprite.position;
    if(Math.hypot(player.position.x-p.x,player.position.z-p.z)<0.95) collectPowerup(powerups[k],k);
  }
  if(hunt) for(const l of hunt.letters){
    if(l.done) continue;
    const p=l.sprite.position;
    if(Math.hypot(player.position.x-p.x,player.position.z-p.z)<0.95){ collectLetter(l); break; }
  }
}
function updateArrow(){
  if(!arrowGroup) return;
  arrowGroup.visible=ARROWON;
  if(!ARROWON) return;
  let t=null, best=1e9;
  for(const d of doors) if(!d.open){
    const p=g2w(d.gx,d.gz);
    const dd=Math.hypot(player.position.x-p.x, player.position.z-p.z);
    if(dd<best){ best=dd; t=p; }
  }
  if(!t) t=g2w(W-2,H-2);
  if(FPV){
    /* in FPV la freccia sta davanti al giocatore, in vista */
    const fx=Math.sin(player.rotation.y), fz=Math.cos(player.rotation.y);
    arrowGroup.position.set(player.position.x+fx*2.2, 1.7, player.position.z+fz*2.2);
  } else {
    arrowGroup.position.set(player.position.x, 2.3, player.position.z);
  }
  arrowGroup.rotation.y=Math.atan2(t.x-player.position.x, t.z-player.position.z);
}

/* ================= DOMANDE + VITE/GETTONI ================= */
const COST_READ=40, COST_5050=20, BONUS_PTS=15;
let fiftyUsed=false;
function livesStr(){ return '❤️'.repeat(lives)+'🖤'.repeat(MAXLIVES-lives); }
function updateJolly(){
  const i=LI();
  $('qSpeak').disabled = jollyLock>0 || (freeJolly<=0 && score<COST_READ);
  $('j5050').disabled = jollyLock>0 || fiftyUsed || (freeJolly<=0 && score<COST_5050);
  $('qExpSpeak').disabled = freeJolly<=0 && score<COST_READ;
  if(jollyLock>0){
    $('qSpeak').textContent='⏳ '+jollyLock;
    $('j5050').textContent='⏳ '+jollyLock;
  } else {
    $('qSpeak').textContent = freeJolly>0 ? UI.jollyFreeRead[i] : UI.jollyRead[i];
    if(!fiftyUsed) $('j5050').textContent = freeJolly>0 ? UI.jollyFree5050[i] : UI.jolly5050[i];
  }
}
/* prima di poter usare i jolly bisogna aspettare 10 secondi:
   così il bambino prova prima a leggere da solo! */
const JOLLY_WAIT=10;
let jollyLock=0, jollyTimerId=null;
function startJollyTimer(){
  if(jollyTimerId){ clearInterval(jollyTimerId); jollyTimerId=null; }
  jollyLock=JOLLY_WAIT;
  updateJolly();
  jollyTimerId=setInterval(()=>{
    jollyLock--;
    if(jollyLock<=0){
      jollyLock=0; clearInterval(jollyTimerId); jollyTimerId=null;
      const i=LI();
      $('qSpeak').textContent=UI.jollyRead[i];
      $('j5050').textContent=UI.jolly5050[i];
    }
    updateJolly();
  },1000);
}
function jollyNudge(el){
  const i=LI();
  $('qMsg').textContent=UI.jollyNoPts[i]; $('qMsg').style.color='#e8a013';
  el.classList.remove('shakeIt'); void el.offsetWidth;
  setTimeout(()=>{ if($('qMsg').textContent===UI.jollyNoPts[i]) $('qMsg').textContent=''; },1800);
}
function payJolly(cost){ score=Math.max(0,score-cost); save(); updateHUD(); updateJolly(); }
/* usa un jolly: prima consuma i 🎟️ gratis, poi i punti */
function useJolly(cost){
  if(freeJolly>0){ freeJolly--; updateHUD(); updateJolly(); return; }
  payJolly(cost);
}
/* scudo 🛡️: protegge la combo da un errore */
function loseStreak(){
  if(shieldOn && streak>0){ shieldOn=false; updateHUD(); return true; }
  resetStreak(); return false;
}
function renderQuestion(){
  const d=currentDoor, t=THEMES[curLevel], i=LI();
  $('qEmoji').textContent=t.emoji;
  $('qTheme').textContent=t.name[i];
  $('qLives').textContent=livesStr();
  $('qText').textContent=d.q.q[i];
  $('qSpeak').textContent=UI.jollyRead[i];
  $('qSpeak').style.display=VOICEON?'':'none';
  $('j5050').textContent=UI.jolly5050[i];
  $('j5050').style.display='';
  fiftyUsed=false;
  $('readAloneHint').textContent=VOICEON?UI.readAloneHint[i]:'';
  voiceUsedThisQ=false;
  $('qBack').textContent=UI.back[i];
  $('qExplain').style.display='none';
  $('answers').style.display='';
  const A=$('answers'); A.innerHTML='';
  const opts=shuffle([[d.q.ok[i],true],[d.q.no[0][i],false],[d.q.no[1][i],false]]);
  opts.forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0];
    b.dataset.right=o[1]?'1':'0';
    b.onclick=()=>answer(b,o[1]);
    A.appendChild(b);
  });
  startJollyTimer();
}
function showQuestion(d){
  paused=true; currentDoor=d;
  duckMusic(true,'q');
  $('qMsg').textContent='';
  renderQuestion();
  $('question').style.display='flex';
}
function newQuestionFor(door){
  const set=questionSet();
  let cand=qpool.filter(q=>q!==door.q);
  if(!cand.length) cand=set.filter(q=>q!==door.q);
  door.q=cand[Math.floor(Math.random()*cand.length)]||door.q;
}
/* prime N frasi di un testo (per la lettura automatica parziale) */
function firstSentences(t,n){
  const s=String(t).match(/[^.!?…]+[.!?…]+["»']?/g)||[String(t)];
  return s.slice(0,n).map(x=>x.trim());
}
function showExplain(praise){
  const i=LI(), q=currentDoor.q;
  $('answers').style.display='none';
  $('qSpeak').style.display='none';
  $('j5050').style.display='none';
  $('readAloneHint').textContent='';
  $('qExpText').textContent=q.exp[i];
  renderBonus(q);
  const L=$('qExpLink');
  if(q.link){ L.href=q.link[i]; L.textContent=UI.more[i]; L.style.display='inline-block'; }
  else L.style.display='none';
  $('qExpSpeak').textContent=UI.readExp[i];
  $('qExpSpeak').style.display=VOICEON?'':'none';
  $('qExpNext').textContent=UI.go[i];
  $('qExplain').style.display='block';
  updateJolly();
  /* lettura automatica gratuita: solo le prime 2 frasi, non tutto il testo.
     Il bottone 🔊 (a punti) legge invece tutto. */
  if(VOICEON){
    let off=0;
    const parts=firstSentences(q.exp[i],2).map(s=>{
      const n=s.split(/\s+/).filter(Boolean).length;
      const o={t:s, el:$('qExpText'), from:off, to:off+n-1};
      off+=n; return o;
    });
    speak(praise?[praise,...parts]:parts);
  }
}
/* ---- domanda extra: la risposta è nell'approfondimento ---- */
let bonusDone=false;
function renderBonus(q){
  const i=LI(), box=$('bqBox');
  bonusDone=false;
  if(!q.bq){ box.style.display='none'; return; }
  $('bqTitle').textContent=UI.bonusTitle[i];
  $('bqText').textContent=q.bq[i];
  $('bqMsg').textContent=UI.bonusHint[i]; $('bqMsg').style.color='#9a86c9';
  const A=$('bqAnswers'); A.innerHTML='';
  const opts=shuffle([[q.bok[i],true],[q.bno[0][i],false],[q.bno[1][i],false]]);
  opts.forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0];
    b.dataset.right=o[1]?'1':'0';
    b.onclick=()=>bonusAnswer(b,o[1]);
    A.appendChild(b);
  });
  box.style.display='block';
}
function bonusAnswer(btn,right){
  if(bonusDone) return; bonusDone=true;
  const i=LI();
  stopSpeak();
  [...document.querySelectorAll('#bqAnswers .ansBtn')].forEach(b=>{
    b.disabled=true; b.style.pointerEvents='none';
    if(!right && b.dataset.right==='1') b.classList.add('right');
  });
  if(right){
    btn.classList.add('right'); sCorrect();
    score+=BONUS_PTS; save(); updateHUD();
    $('bqMsg').textContent=UI.bonusRight[i]; $('bqMsg').style.color='#3cba54';
    speak(NM(UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)]));
  } else {
    btn.classList.add('wrong'); sWrong();
    $('bqMsg').textContent=UI.bonusWrong[i]; $('bqMsg').style.color='#e05555';
  }
}
function answer(btn,right){
  if(!currentDoor || currentDoor.open) return;
  const i=LI();
  stopSpeak();
  if(right){
    btn.classList.add('right'); sCorrect(); sDoor();
    const mult=addStreak();
    const alone=!voiceUsedThisQ;
    const gained=10*mult+(alone?5:0);
    score+=gained; save();
    const praise=NM(UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)]);
    let msg=praise+' +'+gained;
    if(alone) msg+='  ('+UI.aloneBonus[i]+'5)';
    $('qMsg').textContent=msg; $('qMsg').style.color='#3cba54';
    showComboBig(mult);
    currentDoor.open=true; keysGot++; updateHUD();
    burst(g2w(currentDoor.gx,currentDoor.gz), THEMES[curLevel].wall);
    if(currentDoor.q.exp){ showExplain(praise); }
    else { speak(praise); setTimeout(()=>{ $('question').style.display='none'; duckMusic(false,'q'); paused=false; }, 1000); }
  } else {
    btn.classList.add('wrong'); btn.disabled=true; sWrong();
    lives--; lvErrors++;
    const saved=loseStreak();
    if(lives<=0){
      tokens++; lives=MAXLIVES; sToken();
      newQuestionFor(currentDoor);
      updateHUD(); renderQuestion();
      $('qMsg').textContent=UI.tokenMsg[i]; $('qMsg').style.color='#e8a013';
    } else {
      updateHUD(); $('qLives').textContent=livesStr();
      $('qMsg').textContent=UI.wrong[i]+(saved?' '+UI.shieldSaved[i]:''); $('qMsg').style.color='#e05555';
    }
  }
}
$('qSpeak').onclick=async()=>{
  if(!currentDoor) return;
  const i=LI();
  if(freeJolly<=0 && score<COST_READ){ jollyNudge($('qSpeak')); return; }
  useJolly(COST_READ);
  voiceUsedThisQ=true; lvVoiceUsed=true;
  $('qSpeak').textContent=UI.reading[i];
  const btns=[...document.querySelectorAll('#answers .ansBtn:not(.removed)')];
  const intro=(i===0)?'Le risposte sono:':'The options are:';
  await speak([
    {t:currentDoor.q.q[i], el:$('qText')},
    intro,
    ...btns.map(b=>({t:b.textContent, el:b, block:true}))
  ]);
  $('qSpeak').textContent=UI.jollyRead[i];
  updateJolly();
};
$('j5050').onclick=()=>{
  if(!currentDoor || fiftyUsed) return;
  if(freeJolly<=0 && score<COST_5050){ jollyNudge($('j5050')); return; }
  const cand=[...document.querySelectorAll('#answers .ansBtn')].filter(b=>b.dataset.right==='0' && !b.disabled && !b.classList.contains('removed') && !b.classList.contains('wrong'));
  if(!cand.length) return;
  fiftyUsed=true;
  useJolly(COST_5050);
  sDoor();
  cand[Math.floor(Math.random()*cand.length)].classList.add('removed');
};
$('qBack').onclick=()=>{
  stopSpeak(); duckMusic(false,'q');
  if(currentDoor) currentDoor.cooldown=true;
  $('question').style.display='none'; paused=false;
};
$('qExpSpeak').onclick=()=>{
  if(!currentDoor || !currentDoor.q.exp) return;
  const i=LI(), q=currentDoor.q;
  if(freeJolly<=0 && score<COST_READ){ const m=$('bqMsg'); m.textContent=UI.jollyNoPts[i]; m.style.color='#e8a013'; return; }
  useJolly(COST_READ);
  lvVoiceUsed=true;
  const parts=[{t:q.exp[i], el:$('qExpText')}];
  if(q.bq && !bonusDone){
    parts.push((i===0)?'La domanda extra è:':'The bonus question is:');
    parts.push({t:q.bq[i], el:$('bqText')});
    const btns=[...document.querySelectorAll('#bqAnswers .ansBtn')];
    parts.push((i===0)?'Le risposte sono:':'The options are:');
    parts.push(...btns.map(b=>({t:b.textContent, el:b, block:true})));
  }
  speak(parts);
};
$('qExpNext').onclick=()=>{
  stopSpeak(); duckMusic(false,'q');
  $('qExplain').style.display='none';
  $('question').style.display='none'; paused=false;
};

/* ================= BOSS DI FINE MONDO ================= */
const BOSS_FACE=['👾','🐉','🦑','🧟','🤖','🐻','👹','👽','🦉','🐱','🖥️','🐛','🕷️'];
const BOSS_TIME=60000; /* ms per leggere e rispondere (con calma!) */
let boss={list:[],hp:0,idx:0,plives:3};
let bossTimerId=null, bossTleft=0, bossLocked=false, bossExpired=false;
function clearBossTimer(){ if(bossTimerId){ clearInterval(bossTimerId); bossTimerId=null; } }
function heartStr(n,full,empty){ return full.repeat(Math.max(0,n))+empty.repeat(Math.max(0,3-n)); }

function startBoss(){
  paused=true; stopSpeak();
  boss.list=shuffle(SFIDE[curLevel].slice());
  boss.hp=boss.list.length; boss.idx=0; boss.plives=3;
  const i=LI();
  $('bossFace').textContent=BOSS_FACE[curLevel]||'🐲';
  $('bossName').textContent=UI.bossName[i]+' '+THEMES[curLevel].emoji;
  $('bossHp').querySelector('.lab').textContent=UI.bossName[i];
  $('bossPl').querySelector('.lab').textContent='';
  $('bossOver').style.display='none';
  $('bossPlay').style.display='';
  $('bossMsg').textContent=UI.bossIntro[i]; $('bossMsg').style.color='#ffd6ef';
  renderBoss();
  $('boss').style.display='flex';
  sStar();
  playMusic(TRK_BOSS);
}
function renderBoss(){
  bossLocked=false; bossExpired=false;
  const i=LI(), s=boss.list[boss.idx];
  voiceUsedThisQ=false;
  /* HP guardiano / vite giocatore */
  $('bossHpHearts').textContent=heartStr(boss.hp,'💜','🖤');
  $('bossPlHearts').textContent=heartStr(boss.plives,'❤️','🖤');
  /* frase da leggere, con la parola nuova evidenziata */
  const w=s.word[i];
  const rx=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i');
  $('bossText').innerHTML=s.text[i].replace(rx,'<b>$1</b>');
  $('bossQ').textContent=s.q[i];
  $('bossRead').textContent=UI.bossRead[i];
  $('bossRead').style.display=VOICEON?'':'none';
  const A=$('bossAnswers'); A.innerHTML='';
  const opts=shuffle([[s.ok[i],true],[s.no[0][i],false],[s.no[1][i],false]]);
  opts.forEach(o=>{
    const b=document.createElement('button');
    b.className='bAns'; b.textContent=o[0];
    b.onclick=()=>bossAnswer(b,o[1]);
    A.appendChild(b);
  });
  startBossTimer();
}
function startBossTimer(){
  clearBossTimer();
  bossTleft=BOSS_TIME;
  const fill=$('bossTimerFill'); fill.style.width='100%';
  bossTimerId=setInterval(()=>{
    bossTleft-=100;
    const pct=Math.max(0,bossTleft/BOSS_TIME);
    fill.style.width=(pct*100)+'%';
    fill.style.backgroundPosition=((1-pct)*100)+'% 0';
    if(bossTleft<=0){
      clearBossTimer(); bossExpired=true; bossTleft=0;
      /* niente penalità: si può ancora rispondere, ma senza bonus tempo */
      if(!bossLocked){ $('bossMsg').textContent=UI.bossNoRush[LI()]; $('bossMsg').style.color='#ffe6a8'; }
    }
  },100);
}
function collectWord(s){
  const key=s.word[0].toLowerCase();
  if(words.some(x=>x.k===key)) return;
  words.push({k:key, it:s.word[0], en:s.word[1], defIt:s.def[0], defEn:s.def[1], theme:curLevel});
  save();
}
function bossAnswer(btn,right){
  if(bossLocked) return; bossLocked=true;
  clearBossTimer(); stopSpeak();
  const i=LI(), s=boss.list[boss.idx];
  if(right){
    btn.classList.add('right'); sCorrect();
    const mult=addStreak();
    const alone=!voiceUsedThisQ;
    const base=20*mult+(alone?10:0);                       /* punteggio minimo garantito */
    const timeBonus=bossExpired?0:Math.round(60*(bossTleft/BOSS_TIME)); /* più veloce = più punti */
    const gained=base+timeBonus;
    score+=gained; if(bestStreak<streak)bestStreak=streak; save();
    collectWord(s);
    boss.hp--;
    $('bossFace').classList.remove('hit'); void $('bossFace').offsetWidth; $('bossFace').classList.add('hit');
    $('bossHpHearts').textContent=heartStr(boss.hp,'💜','🖤');
    showComboBig(mult);
    $('bossMsg').innerHTML=UI.bossHit[i]+' +'+gained+(timeBonus>0?' <span style="color:#8ff">('+UI.bossTimeBonus[i]+' +'+timeBonus+')</span>':'')+' · '+UI.bossNewWord[i]+' <b style="color:#ffe14d">'+s.word[i]+'</b>';
    $('bossMsg').style.color='#8dffb0';
    updateHUD();
    setTimeout(()=>{
      if(boss.hp<=0){ bossDefeated(); }
      else { boss.idx++; renderBoss(); $('bossMsg').textContent=''; }
    },1400);
  } else {
    btn.classList.add('wrong'); sWrong();
    bossHurt(false);
  }
}
function bossMiss(timeout){
  if(bossLocked) return; bossLocked=true;
  clearBossTimer(); stopSpeak(); sWrong();
  bossHurt(timeout);
}
function bossHurt(timeout){
  const i=LI();
  const saved=loseStreak(); lvBossMiss++; boss.plives--;
  $('bossPlHearts').textContent=heartStr(boss.plives,'❤️','🖤');
  $('bossMsg').textContent=(timeout?UI.bossTimeout[i]:UI.bossHurt[i])+(saved?' '+UI.shieldSaved[i]:'');
  $('bossMsg').style.color='#ff9d9d';
  updateHUD();
  setTimeout(()=>{
    if(boss.plives<=0){ bossFailed(); }
    else { renderBoss(); }
  },1300);
}
function bossDefeated(){
  clearBossTimer();
  $('boss').style.display='none';
  levelComplete();
}
function bossFailed(){
  clearBossTimer();
  stopMusic(); sLose();
  const i=LI();
  $('bossPlay').style.display='none';
  $('bossOverText').textContent=UI.bossLose[i];
  $('bossRetry').textContent=UI.bossRetry[i];
  $('bossFlee').textContent=UI.bossFlee[i];
  $('bossOver').style.display='block';
}
$('bossRead').onclick=async()=>{
  const i=LI(), s=boss.list[boss.idx];
  if(freeJolly<=0 && score<COST_READ){
    $('bossMsg').textContent=UI.jollyNoPts[i]; $('bossMsg').style.color='#e8a013';
    setTimeout(()=>{ if($('bossMsg').textContent===UI.jollyNoPts[i]) $('bossMsg').textContent=''; },1800);
    return;
  }
  useJolly(COST_READ);
  voiceUsedThisQ=true; lvVoiceUsed=true;
  $('bossRead').textContent=UI.reading[i];
  const btns=[...document.querySelectorAll('#bossAnswers .bAns')];
  const intro=(i===0)?'La domanda è:':'The question is:';
  await speak([
    {t:s.text[i], el:$('bossText'), block:true},
    intro,
    {t:s.q[i], el:$('bossQ')},
    ...btns.map(b=>({t:b.textContent, el:b, block:true}))
  ]);
  $('bossRead').textContent=UI.bossRead[i];
};
$('bossRetry').onclick=()=>startBoss();
$('bossFlee').onclick=()=>{
  clearBossTimer(); stopSpeak();
  $('boss').style.display='none';
  starCooldown=true; paused=false;
  playMusic(levelTrack(curLevel));
};

/* ================= VITTORIA ================= */
function computeStars(){
  let st=1;                                   /* 1 ⭐: livello completato */
  if(tokens===0 && lvBossMiss===0) st=2;      /* 2 ⭐: nessun cuore perso, Guardiano battuto senza colpi */
  if(st===2 && !lvVoiceUsed) st=3;            /* 3 ⭐: letto tutto da solo, senza voce */
  return st;
}
function levelComplete(){
  paused=true; stopMusic(); fanfare();
  burst(star.position.clone(),0xffd11a); burst(star.position.clone(),0xff8c1a);
  const i=LI(), last=(curLevel===THEMES.length-1);
  const st=computeStars();
  const prev=starsMap[curLevel]||0;
  if(st>prev){ starsMap[curLevel]=st; }
  save();
  $('winEmoji').textContent=last?'👑':'🏆';
  $('winTitle').textContent=last?UI.finished[i]:NM(UI.bravo[i]);
  let sr=''; for(let k=0;k<3;k++) sr+='<span class="'+(k<st?'win':'off')+'">⭐</span>';
  $('winStars').innerHTML=sr;
  let txt=last?UI.champion[i]:(UI.completedLvl[i]+' '+THEMES[curLevel].emoji+' '+THEMES[curLevel].name[i]+'!');
  txt+=' · ⭐'+score;
  $('winText').textContent=txt;
  $('winNext').textContent=UI.menuBtn[i];
  /* mappa a rete: completare un livello sblocca tutti i vicini sui sentieri */
  for(const n of (EDGES[curLevel]||[])) if(n<THEMES.length) unlockedSet.add(n);
  save();
  $('win').style.display='flex';
  speak(NM(UI.speakBravo[i]));
  confetti();
}
$('winNext').onclick=()=>{
  $('win').style.display='none';
  showMenu(); /* con la mappa a rete si sceglie il prossimo sentiero dalla mappa */
};
function confetti(){
  const ems=['🎉','⭐','🎊','✨','🏆'];
  for(let i=0;i<26;i++){
    const s=document.createElement('div');
    s.className='confetti'; s.textContent=ems[i%ems.length];
    s.style.left=(Math.random()*100)+'vw';
    s.style.animationDelay=(Math.random()*0.8)+'s';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(),3600);
  }
}

/* ================= MAPPA DEI REGNI ================= */
/* La mappa è ora un SISTEMA SOLARE 3D: vedi js/mappa-spazio.js
   (definisce EDGES, la rete delle rotte, e buildMap). */

/* ================= MENU / HUD ================= */
function applyUI(){
  const i=LI();
  $('menuSub').textContent=UI.subtitle[i];
  $('howto').textContent=UI.howto[i];
  $('btnDiff').textContent=(DIFF==='easy')?UI.diffE[i]:UI.diffH[i];
  $('btnVoice').textContent=VOICEON?UI.voiceOn[i]:UI.voiceOff[i];
  $('btnMusic').textContent=MUSICON?UI.musicOn[i]:UI.musicOff[i];
  $('btnMusicHud').textContent=MUSICON?'🎵':'🔇';
  $('btnArrow').textContent=ARROWON?UI.arrowOn[i]:UI.arrowOff[i];
  $('btnAlbum').textContent=UI.albumBtn[i]+' ('+words.length+')';
  $('btnReset').textContent=UI.resetBtn[i];
  $('statRow').innerHTML=
    '<span class="statChip">⭐ '+score+' '+UI.statPoints[i]+'</span>'+
    '<span class="statChip">🔥 '+bestStreak+' '+UI.statBest[i]+'</span>'+
    '<span class="statChip">🌟 '+totalStars()+'/'+(THEMES.length*3)+' '+UI.statStars[i]+'</span>';
  if(!VOICEON){ $('ttsStatus').textContent=''; $('ttsBar').style.display='none'; }
}
function showMenu(){
  paused=true;
  /* musica del menu (solo se l'audio è già stato sbloccato da un tocco) */
  if(MUSICON && actx && actx.state==='running') playMusic(TRK_MENU); else stopMusic();
  $('hud').style.display='none'; $('joy').style.display='none'; $('startHint').style.display='none';
  applyUI(); buildMap();
  $('menu').style.display='flex';
}
function startLevel(i){
  if(VOICEON) initTTS();
  try{ localStorage.setItem('gabri_last',String(i)); }catch(e){} /* per il segnaposto 🧑‍🚀 sulla mappa */
  $('menu').style.display='none';
  lvErrors=0; lvVoiceUsed=false; voiceUsedThisQ=false; lvBossMiss=0; resetStreak();
  buildLevel(i); updateHUD();
  $('hud').style.display='flex';
  if(isTouch) $('joy').style.display='block';
  $('startHint').textContent=isTouch?UI.hintJoy[LI()]:UI.hintKeys[LI()];
  $('startHint').style.display='block';
  setTimeout(()=>{ $('startHint').style.display='none'; },4000);
  paused=false;
  playMusic(levelTrack(i));
}
function updateHUD(){
  $('hudLevel').textContent=THEMES[curLevel].emoji+' '+THEMES[curLevel].name[LI()];
  $('hudKeys').textContent='🗝️ '+keysGot+'/'+doors.length;
  $('hudLives').textContent=livesStr();
  $('hudScore').textContent='⭐ '+score;
  const c=$('hudCombo');
  if(streak>=2){ c.textContent='🔥 x'+streak; c.classList.add('show'); }
  else c.classList.remove('show');
  /* power-up attivi + progresso caccia alla parola */
  const pw=[];
  if(freeJolly>0) pw.push('🎟️'+(freeJolly>1?'x'+freeJolly:''));
  if(shieldOn) pw.push('🛡️');
  $('hudPow').textContent=pw.join(' ');
  $('hudPow').style.display=pw.length?'':'none';
  if(hunt){ $('hudHunt').textContent='🔤 '+huntWordStr(); $('hudHunt').style.display=''; }
  else $('hudHunt').style.display='none';
}
$('btnHome').onclick=showMenu;
$('btnDiff').onclick=()=>{ DIFF=(DIFF==='easy')?'hard':'easy'; save(); applyUI(); };
$('btnVoice').onclick=()=>{
  VOICEON=!VOICEON; save(); applyUI();
  if(!VOICEON) stopSpeak(); else initTTS();
};
function toggleMusic(){
  MUSICON=!MUSICON; save(); applyUI();
  if(!MUSICON){ stopMusic(); return; }
  mCtx(); beep(659,.12,0,'square',.1); beep(880,.18,.13,'square',.1);
  /* riparte subito la musica giusta per la schermata attuale */
  if($('boss').style.display==='flex') playMusic(TRK_BOSS);
  else if($('menu').style.display!=='none') playMusic(TRK_MENU);
  else if($('hud').style.display==='flex') playMusic(levelTrack(curLevel));
}
$('btnMusic').onclick=toggleMusic;
$('btnMusicHud').onclick=toggleMusic;
/* al primo tocco/tasto il browser sblocca l'audio: parte la musica del menu */
function kickMenuMusic(){
  if(MUSICON && !mTrack && $('menu').style.display!=='none'){ mCtx(); playMusic(TRK_MENU); }
}
addEventListener('pointerdown',kickMenuMusic,true);
addEventListener('keydown',kickMenuMusic,true);
$('btnArrow').onclick=()=>{ ARROWON=!ARROWON; save(); applyUI(); };
function applyCamBtn(){ $('btnCam').textContent=FPV?'👁️':'🎥'; }
$('btnCam').onclick=()=>{ FPV=!FPV; save(); applyCamBtn(); };
applyCamBtn();
function resetProgress(){
  if(confirm(UI.resetAsk[LI()])){
    unlockedSet=new Set([0]); score=0; bestStreak=0; starsMap={}; words=[];
    try{ localStorage.removeItem('gabri_last'); localStorage.removeItem('gabri_unlocked'); }catch(e){}
    save(); applyUI();
    if($('menu').style.display!=='none') buildMap();
    return true;
  }
  return false;
}
$('btnReset').onclick=resetProgress;
function showAlbum(){
  const i=LI();
  $('albumTitle').textContent=UI.albumTitle[i];
  $('albumCount').textContent=words.length+' '+UI.albumCount[i];
  $('albumCloseBtn').textContent=UI.albumClose[i];
  const L=$('wordList');
  if(!words.length){ L.innerHTML='<div style="grid-column:1/-1;color:#888;padding:20px">'+UI.albumEmpty[i]+'</div>'; }
  else {
    L.innerHTML=words.map(w=>{
      const th=THEMES[w.theme]?THEMES[w.theme].emoji+' '+THEMES[w.theme].name[i]:'';
      return '<div class="wordCard"><div class="w">'+w[i===0?'it':'en']+'</div>'+
        (w.it!==w.en?'<div class="en">'+(i===0?w.en:w.it)+'</div>':'')+
        '<div class="d">'+(i===0?w.defIt:w.defEn)+'</div>'+
        '<div class="t">'+th+'</div></div>';
    }).join('');
  }
  $('album').style.display='flex';
}
$('btnAlbum').onclick=showAlbum;
$('albumCloseBtn').onclick=()=>{ $('album').style.display='none'; };

/* ================= LOOP ================= */
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.05);
  const et=clock.elapsedTime;
  if(!scene){ return; }
  if(!paused){
    const dir=inputDir(), dx=dir[0], dz=dir[1];
    if(FPV){
      /* FPV: su/giù = avanti/indietro, sinistra/destra = gira */
      if(dx) player.rotation.y-=dx*2.4*dt;
      const fwd=-dz;
      if(Math.abs(fwd)>0.01){
        const sp=4.2;
        const mx=Math.sin(player.rotation.y)*fwd, mz=Math.cos(player.rotation.y)*fwd;
        const nx=player.position.x+mx*sp*dt, nz=player.position.z+mz*sp*dt;
        if(canStand(nx,player.position.z)) player.position.x=nx;
        if(canStand(player.position.x,nz)) player.position.z=nz;
        walk+=dt*10;
        player.position.y=Math.abs(Math.sin(walk))*0.1;
        player.userData.legL.rotation.x=Math.sin(walk)*0.7;
        player.userData.legR.rotation.x=-Math.sin(walk)*0.7;
      } else {
        player.position.y*=0.8;
        player.userData.legL.rotation.x*=0.8;
        player.userData.legR.rotation.x*=0.8;
      }
    } else if(dx||dz){
      const sp=4.2;
      const nx=player.position.x+dx*sp*dt, nz=player.position.z+dz*sp*dt;
      if(canStand(nx,player.position.z)) player.position.x=nx;
      if(canStand(player.position.x,nz)) player.position.z=nz;
      player.rotation.y=Math.atan2(dx,dz);
      walk+=dt*10;
      player.position.y=Math.abs(Math.sin(walk))*0.1;
      player.userData.legL.rotation.x=Math.sin(walk)*0.7;
      player.userData.legR.rotation.x=-Math.sin(walk)*0.7;
    } else {
      player.position.y*=0.8;
      player.userData.legL.rotation.x*=0.8;
      player.userData.legR.rotation.x*=0.8;
    }
    checkDoors();
    if(!paused) checkStar();
    if(!paused) checkPowerups();
  }
  const blink=(Math.sin(et*5)+1)/2;
  player.userData.tipMat.emissive.setRGB(blink,0.05,0.05);

  player.visible=!FPV;
  if(FPV){
    const fx=Math.sin(player.rotation.y), fz=Math.cos(player.rotation.y);
    const cpos=new THREE.Vector3(player.position.x-fx*0.15, 1.35+player.position.y*0.5, player.position.z-fz*0.15);
    camera.position.lerp(cpos,0.5);
    camera.lookAt(player.position.x+fx*4, 1.05, player.position.z+fz*4);
  } else {
    const cpos=new THREE.Vector3(player.position.x, 8.5, player.position.z+7);
    camera.position.lerp(cpos,0.08);
    camera.lookAt(player.position.x, 0.5, player.position.z);
  }

  if(star){ star.rotation.y+=dt*2; star.position.y=1.2+Math.sin(et*2)*0.15; }
  if(glow){ const gs=2.4+Math.sin(et*3)*0.35; glow.scale.set(gs,gs,1); glow.position.y=star.position.y; }
  for(const d of doors) if(d.open && d.mesh.position.y>-1.6) d.mesh.position.y-=dt*2.5;
  decos.forEach((s,i)=>{ s.position.y=1.3+Math.sin(et*1.5+i)*0.15; });
  powerups.forEach((p,i)=>{ p.sprite.position.y=1.25+Math.sin(et*2+i*2.1)*0.2; });
  if(hunt) hunt.letters.forEach((l,i)=>{ if(!l.done) l.sprite.position.y=1.25+Math.sin(et*2.2+i)*0.18; });

  if(themeParts){
    const arr=themeParts.geometry.attributes.position.array;
    for(let i=0;i<arr.length;i+=3){
      arr[i+1]+=themeVel*dt*(0.6+0.4*Math.sin(i));
      if(themeVel>0 && arr[i+1]>7) arr[i+1]=0;
      if(themeVel<0 && arr[i+1]<0) arr[i+1]=7;
    }
    themeParts.geometry.attributes.position.needsUpdate=true;
  }
  for(let i=bursts.length-1;i>=0;i--){
    const b=bursts[i];
    b.life-=dt;
    if(b.life<=0){ scene.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); bursts.splice(i,1); continue; }
    b.m.position.x+=b.vx*dt; b.m.position.y+=b.vy*dt; b.m.position.z+=b.vz*dt;
    b.vy-=9.8*dt;
    b.m.rotation.x+=dt*6; b.m.rotation.y+=dt*8;
    const sc=Math.max(b.life,0.05); b.m.scale.set(sc,sc,sc);
  }
  updateArrow();
  renderer.render(scene,camera);
}

/* ================= AVVIO ================= */
initGL();
showMenu();
applyName();
if(!PLAYER){
  $('nameOv').style.display='flex';
  setTimeout(()=>{ try{$('nameInput').focus();}catch(e){} },100);
}
function confirmName(){
  let n=($('nameInput').value||'').trim().replace(/[^A-Za-zÀ-ÿ' -]/g,'');
  if(!n) n='Campione';
  n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();
  PLAYER=n;
  try{ localStorage.setItem('gabri_name',PLAYER); }catch(e){}
  applyName();
  $('nameOv').style.display='none';
}
$('nameGo').onclick=confirmName;
$('nameInput').addEventListener('keydown',e=>{ if(e.key==='Enter') confirmName(); });
animate();
