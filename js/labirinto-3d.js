/* ============================================================
   MOTORE 3D — generazione labirinto, grafica, input, collisioni, salvataggi
   ============================================================ */
/* ================= LABIRINTO =================
   Valori della griglia:
     0 = corridoio libero
     1 = muro (viene disegnato)
     2 = basamento di un monumento: blocca il passaggio ma NON è un muro
   ============================================================ */
let ROOMS=[];   /* piazze aperte: {cx,cy} con il monumento al centro */

function genMaze(w,h){
  const g=Array.from({length:h},()=>Array(w).fill(1));
  const stack=[[1,1]]; g[1][1]=0;
  while(stack.length){
    const cur=stack[stack.length-1], x=cur[0], y=cur[1];
    const dirs=shuffle([[2,0],[-2,0],[0,2],[0,-2]]);
    let moved=false;
    for(const d of dirs){
      const nx=x+d[0], ny=y+d[1];
      if(nx>0 && nx<w-1 && ny>0 && ny<h-1 && g[ny][nx]===1){
        g[y+d[1]/2][x+d[0]/2]=0; g[ny][nx]=0; stack.push([nx,ny]); moved=true; break;
      }
    }
    if(!moved) stack.pop();
  }
  /* --- PIAZZE: aree 3x3 aperte con un monumento al centro.
     Servono da punto di riferimento: senza, i corridoi sono tutti uguali
     e non si capisce mai dove si è. --- */
  ROOMS=[];
  const wanted=w<=15?2:3;
  const spots=[];
  for(let cy=3;cy<=h-4;cy+=2) for(let cx=3;cx<=w-4;cx+=2){
    if(Math.abs(cx-1)+Math.abs(cy-1)<5) continue;            /* non sulla partenza */
    if(Math.abs(cx-(w-2))+Math.abs(cy-(h-2))<5) continue;    /* non sulla stella */
    spots.push([cx,cy]);
  }
  shuffle(spots);
  /* prima si prova a tenere le piazze ben distanti; nei labirinti piccoli
     non c'è spazio, allora si accetta una distanza minore */
  for(const sep of [6,4,3]){
    if(ROOMS.length>=wanted) break;
    for(const s of spots){
      if(ROOMS.length>=wanted) break;
      const cx=s[0], cy=s[1];
      if(ROOMS.some(r=>Math.abs(r.cx-cx)<sep && Math.abs(r.cy-cy)<sep)) continue;
      for(let y=cy-1;y<=cy+1;y++) for(let x=cx-1;x<=cx+1;x++) g[y][x]=0;
      ROOMS.push({cx:cx,cy:cy});
    }
  }
  /* labirinto più articolato: apre qualche muro interno per creare
     anelli e percorsi alternativi (non un solo corridoio giusto) */
  const extra=Math.max(2,Math.floor(w*h/45));
  let removed=0, tries=0;
  while(removed<extra && tries<600){
    tries++;
    const x=2+Math.floor(Math.random()*(w-4));
    const y=2+Math.floor(Math.random()*(h-4));
    if(g[y][x]!==1) continue;
    const hh=g[y][x-1]===0 && g[y][x+1]===0 && g[y-1][x]===1 && g[y+1][x]===1;
    const vv=g[y-1][x]===0 && g[y+1][x]===0 && g[y][x-1]===1 && g[y][x+1]===1;
    if(hh||vv){ g[y][x]=0; removed++; }
  }
  /* il centro della piazza diventa il basamento del monumento: si gira
     intorno come in una rotonda, ma non ci si passa attraverso */
  ROOMS.forEach(r=>{ g[r.cy][r.cx]=2; });
  return g;
}
function findPath(g,sx,sy,ex,ey){
  const w=g[0].length, h=g.length;
  const prev={}, q=[[sx,sy]], seen=new Set([sx+","+sy]);
  while(q.length){
    const c=q.shift(), x=c[0], y=c[1];
    if(x===ex && y===ey){
      const path=[]; let k=x+","+y;
      while(k){ const p=k.split(","); path.unshift([+p[0],+p[1]]); k=prev[k]; }
      return path;
    }
    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+d[0], ny=y+d[1], kk=nx+","+ny;
      if(nx>=0 && nx<w && ny>=0 && ny<h && g[ny][nx]===0 && !seen.has(kk)){
        seen.add(kk); prev[kk]=x+","+y; q.push([nx,ny]);
      }
    }
  }
  return [[sx,sy]];
}

/* ================= STATO ================= */
const CELL=2, MAXLIVES=3;
const SIZES=[13,15,15,17,17,19,19,21,21,21,21,21,21];
let renderer, scene=null, camera, player, arrowGroup=null;
let grid, W, H, doors=[], star=null, glow=null, decos=[], bursts=[];
let themeParts=null, themeVel=1;
/* punti di riferimento, cartelli, torce, minimappa */
let marks=[], signs=[], torches=[], seenCells=null, MAPON=true, curSign=null;
let curLevel=0, keysGot=0, paused=true, currentDoor=null, walk=0;
let lives=MAXLIVES, tokens=0, qpool=[];
/* power-up raccoglibili nel labirinto */
let powerups=[], hunt=null, freeJolly=0, shieldOn=false;
let LANG='it', DIFF='easy', unlockedSet=new Set([0]), VOICEON=true, ARROWON=true, FPV=false;
/* progressione / motivazione */
let score=0, streak=0, bestStreak=0;
let starsMap={}, words=[];
/* tracker del livello corrente */
let lvErrors=0, lvVoiceUsed=false, voiceUsedThisQ=false, lvBossMiss=0;
/* nome del giocatore (chiesto al primo avvio) */
let PLAYER='';
function NM(s){
  const fb=(LANG==='it')?'Campione':'Champion';
  const n=PLAYER||fb;
  return s.replace(/\{NAME\}/g,(/[a-z]/.test(s.replace(/\{NAME\}/g,'')))?n:n.toUpperCase());
}
function applyName(){
  if(PLAYER){
    $('menuTitle').textContent='🌟 Il Labirinto di '+PLAYER+' 🌟';
    document.title='Il Labirinto di '+PLAYER+' 🚀';
  }
}
try{
  PLAYER=(localStorage.getItem('gabri_name')||'').trim();
  /* mappa a rete: set dei livelli sbloccati (migra dal vecchio contatore lineare) */
  const u2=localStorage.getItem('gabri_unlocked2');
  if(u2){ unlockedSet=new Set(JSON.parse(u2)); }
  else {
    const old=Math.max(1, parseInt(localStorage.getItem('gabri_unlocked')||'1')||1);
    unlockedSet=new Set(Array.from({length:old},(_,k)=>k));
  }
  unlockedSet.add(0);
  DIFF=localStorage.getItem('gabri_diff')||'easy';
  VOICEON=localStorage.getItem('gabri_voice')!=='0';
  MUSICON=localStorage.getItem('gabri_music')!=='0';
  ARROWON=localStorage.getItem('gabri_arrow')!=='0';
  MAPON=localStorage.getItem('gabri_map')!=='0';
  FPV=localStorage.getItem('gabri_fpv')==='1';
  score=parseInt(localStorage.getItem('gabri_score')||'0')||0;
  bestStreak=parseInt(localStorage.getItem('gabri_beststreak')||'0')||0;
  starsMap=JSON.parse(localStorage.getItem('gabri_stars')||'{}')||{};
  words=JSON.parse(localStorage.getItem('gabri_words')||'[]')||[];
}catch(e){}
function save(){ try{
  localStorage.setItem('gabri_unlocked2',JSON.stringify([...unlockedSet]));
  localStorage.setItem('gabri_diff',DIFF);
  localStorage.setItem('gabri_voice',VOICEON?'1':'0');
  localStorage.setItem('gabri_music',MUSICON?'1':'0');
  localStorage.setItem('gabri_arrow',ARROWON?'1':'0');
  localStorage.setItem('gabri_map',MAPON?'1':'0');
  localStorage.setItem('gabri_fpv',FPV?'1':'0');
  localStorage.setItem('gabri_score',String(score));
  localStorage.setItem('gabri_beststreak',String(bestStreak));
  localStorage.setItem('gabri_stars',JSON.stringify(starsMap));
  localStorage.setItem('gabri_words',JSON.stringify(words));
}catch(e){} }
function totalStars(){ let s=0; for(const k in starsMap) s+=starsMap[k]||0; return s; }
function addStreak(){
  streak++; if(streak>bestStreak){ bestStreak=streak; }
  return 1+Math.min(4,Math.floor(streak/3)); /* moltiplicatore 1..5 */
}
function resetStreak(){ streak=0; }
function showComboBig(mult){
  if(streak<2) return;
  const el=$('comboBig');
  el.textContent='🔥 '+(UI.comboMsg[LI()])+streak+(mult>1?'  (punti x'+mult+')':'');
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function g2w(gx,gz){ return new THREE.Vector3((gx-(W-1)/2)*CELL, 0, (gz-(H-1)/2)*CELL); }

/* ================= TEXTURE ================= */
/* Pavimento a piastrelle consumate: fughe scure, macchie, qualche crepa. */
function groundTexture(t){
  const cv=document.createElement('canvas'); cv.width=cv.height=256;
  const c=cv.getContext('2d');
  const base=new THREE.Color(t.floor);
  const lite=base.clone().lerp(new THREE.Color(0xffffff),0.13);
  const dark=base.clone().lerp(new THREE.Color(0x000000),0.34);
  c.fillStyle='#'+base.getHexString(); c.fillRect(0,0,256,256);
  /* quattro piastrelle con la fuga in mezzo */
  c.fillStyle='#'+lite.getHexString();
  [[0,0],[128,128]].forEach(p=>c.fillRect(p[0],p[1],128,128));
  c.strokeStyle='#'+dark.getHexString(); c.lineWidth=6;
  c.beginPath(); c.moveTo(128,0); c.lineTo(128,256); c.moveTo(0,128); c.lineTo(256,128); c.stroke();
  c.strokeRect(3,3,250,250);
  /* usura: chiazze chiare e scure */
  for(let i=0;i<160;i++){
    c.fillStyle='rgba('+(Math.random()>.5?'255,255,255':'0,0,0')+','+(0.02+Math.random()*0.06).toFixed(3)+')';
    c.beginPath(); c.arc(Math.random()*256,Math.random()*256,3+Math.random()*16,0,7); c.fill();
  }
  /* crepe */
  c.strokeStyle='rgba(0,0,0,.22)'; c.lineWidth=2;
  for(let i=0;i<6;i++){
    let x=Math.random()*256,y=Math.random()*256; c.beginPath(); c.moveTo(x,y);
    for(let k=0;k<5;k++){ x+=(Math.random()-.5)*46; y+=(Math.random()-.5)*46; c.lineTo(x,y); }
    c.stroke();
  }
  const tex=new THREE.CanvasTexture(cv);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}
/* Muro a blocchi di pietra sfalsati, con malta e luce dall'alto. */
function wallTexture(t){
  const cv=document.createElement('canvas'); cv.width=cv.height=256;
  const c=cv.getContext('2d');
  const base=new THREE.Color(t.wall);
  const mortar=base.clone().lerp(new THREE.Color(0x000000),0.42);
  c.fillStyle='#'+mortar.getHexString(); c.fillRect(0,0,256,256);
  const rows=5, bh=256/rows;
  for(let r=0;r<rows;r++){
    const off=(r%2)?-64:0, bw=128;
    for(let x=off;x<256;x+=bw){
      const shade=(Math.random()-0.5)*0.16;
      const col=base.clone().lerp(new THREE.Color(shade>0?0xffffff:0x000000),Math.abs(shade));
      c.fillStyle='#'+col.getHexString();
      c.fillRect(x+3,r*bh+3,bw-6,bh-6);
      /* spigolo illuminato in alto, ombra in basso: dà volume */
      c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(x+3,r*bh+3,bw-6,4);
      c.fillStyle='rgba(0,0,0,.22)';       c.fillRect(x+3,r*bh+bh-8,bw-6,5);
    }
  }
  /* granulosità della pietra */
  for(let i=0;i<300;i++){
    c.fillStyle='rgba('+(Math.random()>.5?'255,255,255':'0,0,0')+','+(0.02+Math.random()*0.05).toFixed(3)+')';
    c.beginPath(); c.arc(Math.random()*256,Math.random()*256,1+Math.random()*5,0,7); c.fill();
  }
  return new THREE.CanvasTexture(cv);
}
/* Cupola del cielo: sfumatura verticale invece del colore piatto. */
function skyDome(t){
  const cv=document.createElement('canvas'); cv.width=8; cv.height=256;
  const c=cv.getContext('2d');
  const base=new THREE.Color(t.sky);
  const top=base.clone().lerp(new THREE.Color(0x000010),0.55);
  const mid=base.clone();
  const low=base.clone().lerp(new THREE.Color(0xffffff),0.22);
  const g=c.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#'+top.getHexString());
  g.addColorStop(0.55,'#'+mid.getHexString());
  g.addColorStop(1,'#'+low.getHexString());
  c.fillStyle=g; c.fillRect(0,0,8,256);
  const tex=new THREE.CanvasTexture(cv);
  const m=new THREE.Mesh(new THREE.SphereGeometry(150,20,14),
    new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide,depthWrite:false}));
  m.material.fog=false;
  return m;
}
/* Macchia scura da appoggiare a terra sotto gli oggetti: ombra finta, costa nulla. */
let _shadowTex=null;
function shadowTexture(){
  if(_shadowTex) return _shadowTex;
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(32,32,2,32,32,32);
  g.addColorStop(0,'rgba(0,0,0,.5)'); g.addColorStop(.6,'rgba(0,0,0,.22)'); g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g; c.fillRect(0,0,64,64);
  _shadowTex=new THREE.CanvasTexture(cv);
  return _shadowTex;
}
function shadowBlob(size){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),
    new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false}));
  m.rotation.x=-Math.PI/2; m.position.y=0.03; m.renderOrder=-1;
  return m;
}
/* Fiamma della torcia: due sprite additivi che tremolano. */
function torchFlameTexture(){
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(32,38,1,32,38,30);
  g.addColorStop(0,'rgba(255,255,225,.95)');
  g.addColorStop(.35,'rgba(255,196,70,.7)');
  g.addColorStop(1,'rgba(255,120,20,0)');
  c.fillStyle=g; c.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(cv);
}
function glowTexture(){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,4,64,64,64);
  g.addColorStop(0,'rgba(255,230,120,0.9)'); g.addColorStop(0.5,'rgba(255,200,60,0.35)'); g.addColorStop(1,'rgba(255,200,60,0)');
  c.fillStyle=g; c.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(cv);
}
function emojiSprite(em,size){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  c.font='96px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(em,64,72);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));
  s.scale.set(size,size,1); return s;
}
/* lettera raccoglibile per la caccia alla parola */
function letterSprite(ch,accent){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  c.beginPath(); c.arc(64,64,54,0,Math.PI*2);
  c.fillStyle=accent; c.fill();
  c.lineWidth=8; c.strokeStyle='#fff'; c.stroke();
  c.font='bold 72px sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle='#fff'; c.fillText(ch,64,68);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));
  s.scale.set(1.0,1.0,1); return s;
}

/* ================= PUNTI DI RIFERIMENTO =================
   Ogni piazza ha un monumento alto e colorato che spunta sopra i muri.
   Ha un nome scritto: i cartelli lo useranno per dare le indicazioni,
   così per orientarsi bisogna LEGGERE.
   ============================================================ */
const LANDMARKS=[
  {id:'torre',    col:0xe1483c, nm:['LA TORRE ROSSA','THE RED TOWER'],
   near:['VICINO ALLA TORRE ROSSA','NEAR THE RED TOWER'],       beyond:['OLTRE LA TORRE ROSSA','BEYOND THE RED TOWER']},
  {id:'fontana',  col:0x2f8ff0, nm:['LA FONTANA BLU','THE BLUE FOUNTAIN'],
   near:['VICINO ALLA FONTANA BLU','NEAR THE BLUE FOUNTAIN'],   beyond:['OLTRE LA FONTANA BLU','BEYOND THE BLUE FOUNTAIN']},
  {id:'cristallo',col:0x2fcf78, nm:['IL CRISTALLO VERDE','THE GREEN CRYSTAL'],
   near:['VICINO AL CRISTALLO VERDE','NEAR THE GREEN CRYSTAL'], beyond:['OLTRE IL CRISTALLO VERDE','BEYOND THE GREEN CRYSTAL']},
  {id:'arco',     col:0xf5c22b, nm:['L’ARCO GIALLO','THE YELLOW ARCH'],
   near:['VICINO ALL’ARCO GIALLO','NEAR THE YELLOW ARCH'],      beyond:['OLTRE L’ARCO GIALLO','BEYOND THE YELLOW ARCH']},
  {id:'statua',   col:0xa463e8, nm:['LA STATUA VIOLA','THE PURPLE STATUE'],
   near:['VICINO ALLA STATUA VIOLA','NEAR THE PURPLE STATUE'],  beyond:['OLTRE LA STATUA VIOLA','BEYOND THE PURPLE STATUE']}
];
/* il monumento più vicino a una cella: serve a scrivere le indicazioni */
function nearestMark(gx,gz){
  let best=null,bd=1e9;
  for(const m of marks){ const d=Math.abs(m.gx-gx)+Math.abs(m.gz-gz); if(d<bd){ bd=d; best=m; } }
  return best;
}
function signPhrase(gx,gz,isStar){
  const i=LI(), m=nearestMark(gx,gz);
  if(!m) return isStar?['LA STELLA È IN FONDO AL LABIRINTO','THE STAR IS AT THE END OF THE MAZE'][i]
                      :['LA PORTA È PIÙ AVANTI','THE DOOR IS FURTHER ON'][i];
  if(isStar) return (i===0?'LA STELLA È ':'THE STAR IS ')+m.def.beyond[i];
  return (i===0?'LA PORTA È ':'THE DOOR IS ')+m.def.near[i];
}
function makeLandmark(def){
  const g=new THREE.Group();
  const col=def.col;
  const body =new THREE.MeshPhongMaterial({color:col,shininess:50});
  const stone=new THREE.MeshPhongMaterial({color:0xd8d4c8,shininess:12});
  const lit  =new THREE.MeshPhongMaterial({color:col,emissive:col,shininess:90});
  /* basamento comune: si vede che è "appoggiato" nella piazza */
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.72,.86,.34,12),stone);
  base.position.y=.17; g.add(base);
  if(def.id==='torre'){
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.34,.52,2.5,10),body); t.position.y=1.6; g.add(t);
    for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(.44-i*.04,.06,6,12),stone);
      r.rotation.x=Math.PI/2; r.position.y=.8+i*.7; g.add(r); }
    const roof=new THREE.Mesh(new THREE.ConeGeometry(.5,.8,10),stone); roof.position.y=3.2; g.add(roof);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),lit); lamp.position.y=3.75; g.add(lamp);
    g.userData.spin=lamp;
  } else if(def.id==='fontana'){
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.9,.78,.4,14),stone); bowl.position.y=.5; g.add(bowl);
    const water=new THREE.Mesh(new THREE.CylinderGeometry(.78,.78,.06,14),
      new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:.75,shininess:100})); water.position.y=.71; g.add(water);
    const col1=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,1.5,10),stone); col1.position.y=1.45; g.add(col1);
    const top=new THREE.Mesh(new THREE.SphereGeometry(.42,14,10),
      new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:.85,shininess:100})); top.position.y=2.35; g.add(top);
    const jet=new THREE.Mesh(new THREE.ConeGeometry(.3,1.2,10,1,true),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));
    jet.position.y=2.95; g.add(jet);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),lit); lamp.position.y=3.6; g.add(lamp);
    g.userData.spin=top;
  } else if(def.id==='cristallo'){
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.34,.5,1.1,8),stone); ped.position.y=.85; g.add(ped);
    const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.62,0),
      new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:.4,shininess:100,transparent:true,opacity:.9}));
    cr.position.y=2.3; cr.scale.y=1.7; g.add(cr);
    for(let i=0;i<3;i++){ const s=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),body);
      const a=i/3*Math.PI*2; s.position.set(Math.cos(a)*.75,1.7,Math.sin(a)*.75); g.add(s); }
    g.userData.spin=cr;
  } else if(def.id==='arco'){
    [-1,1].forEach(s=>{ const p=new THREE.Mesh(new THREE.BoxGeometry(.34,2.5,.34),stone);
      p.position.set(s*.62,1.25,0); g.add(p); });
    const arch=new THREE.Mesh(new THREE.TorusGeometry(.62,.17,8,16,Math.PI),body);
    arch.position.y=2.5; g.add(arch);
    const key=new THREE.Mesh(new THREE.SphereGeometry(.2,12,9),lit); key.position.y=3.2; g.add(key);
    const flag=new THREE.Mesh(new THREE.BoxGeometry(.55,.34,.03),body); flag.position.set(.28,3.55,0); g.add(flag);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.9,6),stone); pole.position.y=3.5; g.add(pole);
    g.userData.spin=key;
  } else {
    const ped=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),stone); ped.position.y=.75; g.add(ped);
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(.3,.42,1.2,10),body); torso.position.y=1.8; g.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.29,14,10),body); head.position.y=2.65; g.add(head);
    [-1,1].forEach(s=>{ const a=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1,8),body);
      a.position.set(s*.42,2.15,0); a.rotation.z=s*.7; g.add(a); });
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,6,14),lit);
    halo.rotation.x=Math.PI/2; halo.position.y=3.15; g.add(halo);
    g.userData.spin=halo;
  }
  const glowS=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:col,
    blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  glowS.scale.set(2.4,2.4,1); glowS.position.y=3.4; g.add(glowS);
  g.add(shadowBlob(2.2));
  /* pozza di luce colorata a terra: si vede benissimo dall'alto e costa
     molto meno di una vera PointLight (sui tablet le luci si pagano care) */
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(5.2,5.2),
    new THREE.MeshBasicMaterial({map:glowTexture(),color:col,blending:THREE.AdditiveBlending,
      transparent:true,opacity:.34,depthWrite:false}));
  pool.rotation.x=-Math.PI/2; pool.position.y=0.05; g.add(pool);
  g.userData.glow=glowS; g.userData.pool=pool;
  return g;
}

/* ================= CARTELLI =================
   Un cartello dice a parole dov'è il prossimo obiettivo, usando il nome
   di un monumento: «LA PORTA È VICINO ALLA TORRE ROSSA».
   Non c'è nessuna freccia disegnata: bisogna leggere per davvero.
   ============================================================ */
function signTexture(text,accent){
  const cv=document.createElement('canvas'); cv.width=512; cv.height=224;
  const c=cv.getContext('2d');
  /* tavola di legno con bordo */
  const g=c.createLinearGradient(0,0,0,224);
  g.addColorStop(0,'#8a5a2f'); g.addColorStop(.5,'#a06c3a'); g.addColorStop(1,'#7d5029');
  c.fillStyle=g; c.fillRect(0,0,512,224);
  for(let i=0;i<26;i++){ c.strokeStyle='rgba(0,0,0,'+(0.03+Math.random()*0.05).toFixed(3)+')';
    c.lineWidth=1+Math.random()*3; c.beginPath(); c.moveTo(0,Math.random()*224);
    c.bezierCurveTo(170,Math.random()*224,340,Math.random()*224,512,Math.random()*224); c.stroke(); }
  c.strokeStyle=accent||'#ffd11a'; c.lineWidth=10; c.strokeRect(9,9,494,206);
  c.fillStyle='#fff8e6'; c.textAlign='center'; c.textBaseline='middle';
  c.shadowColor='rgba(0,0,0,.6)'; c.shadowBlur=6; c.shadowOffsetY=3;
  /* il testo va a capo da solo su massimo tre righe */
  const words=String(text).split(' ');
  let size=46, lines=[];
  for(;size>=26;size-=3){
    c.font='bold '+size+'px Andika, sans-serif';
    lines=[]; let cur='';
    for(const w of words){
      const test=cur?cur+' '+w:w;
      if(c.measureText(test).width>452 && cur){ lines.push(cur); cur=w; } else cur=test;
    }
    if(cur) lines.push(cur);
    if(lines.length<=3) break;
  }
  const lh=size*1.16, y0=112-(lines.length-1)*lh/2;
  lines.forEach((ln,i)=>c.fillText(ln,256,y0+i*lh));
  return new THREE.CanvasTexture(cv);
}
/* La targa si appoggia PIATTA al muro e guarda dentro al corridoio: così la
   sua larghezza va nel senso di marcia e non stringe mai il passaggio. */
function makeSign(text,accent,rotY){
  const g=new THREE.Group();
  const wood=new THREE.MeshPhongMaterial({color:0x6b4523,shininess:10});
  const frame=new THREE.Mesh(new THREE.BoxGeometry(1.58,.74,.05),wood);
  frame.position.set(0,1.25,-.03); g.add(frame);
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.5,.66,.07),
    [wood,wood,wood,wood,new THREE.MeshPhongMaterial({map:signTexture(text,accent),shininess:14}),wood]);
  board.position.y=1.25; g.add(board);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),
    new THREE.MeshPhongMaterial({color:accent||'#ffd11a',emissive:0x332200,shininess:70}));
  knob.position.set(0,1.70,0); g.add(knob);
  /* due chiodi agli angoli: fa capire che è appesa al muro */
  [-1,1].forEach(s=>{ const n=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),
    new THREE.MeshPhongMaterial({color:0x9aa3ad,shininess:80}));
    n.position.set(s*.68,1.25,.05); g.add(n); });
  g.rotation.y=rotY||0;
  return g;
}

/* ================= GRAFICA ================= */
function initGL(){
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  $('game').appendChild(renderer.domElement);
  camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,300);
  camera.position.set(0,10,8);
  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

/* Astronauta protagonista */
function makePlayer(){
  const g=new THREE.Group();
  const white=new THREE.MeshPhongMaterial({color:0xf7f8fb,shininess:55});
  const grey =new THREE.MeshPhongMaterial({color:0x8793a5,shininess:38});
  const joint=new THREE.MeshPhongMaterial({color:0x30394a,shininess:35});
  const red=new THREE.MeshPhongMaterial({color:0xe54f48,shininess:45});
  const legGeo=new THREE.CylinderGeometry(0.10,0.12,0.34,14);
  const legL=new THREE.Mesh(legGeo,white); legL.position.set(0.14,0.13,0);
  const legR=new THREE.Mesh(legGeo,white); legR.position.set(-0.14,0.13,0);
  g.add(legL); g.add(legR);
  const bootGeo=new THREE.BoxGeometry(.18,.12,.28);
  [-1,1].forEach(s=>{ const boot=new THREE.Mesh(bootGeo,joint); boot.position.set(s*.14,.04,.055); g.add(boot); });
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.38,24,18),white);
  body.scale.y=1.15; body.position.y=0.6; g.add(body);
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.31,.035,8,24),red); belt.rotation.x=Math.PI/2; belt.position.y=.48; g.add(belt);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.16,0.07),grey);
  chest.position.set(0,0.62,0.33); g.add(chest);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.18),grey);
  pack.position.set(0,0.66,-0.34); g.add(pack);
  [-1,1].forEach(s=>{
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.42,12),white); arm.position.set(s*.42,.65,0); arm.rotation.z=s*.22; g.add(arm);
    const glove=new THREE.Mesh(new THREE.SphereGeometry(.105,12,9),white); glove.position.set(s*.465,.43,0); g.add(glove);
    const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.12,12,9),red); shoulder.position.set(s*.36,.79,0); g.add(shoulder);
  });
  const neckRing=new THREE.Mesh(new THREE.TorusGeometry(.27,.045,10,28),grey); neckRing.rotation.x=Math.PI/2; neckRing.position.y=.9; g.add(neckRing);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,24,18),white);
  head.position.y=1.08; g.add(head);
  const visor=new THREE.Mesh(new THREE.SphereGeometry(0.215,24,18),new THREE.MeshPhongMaterial({color:0x10203c,emissive:0x07152c,shininess:100}));
  visor.scale.z=0.75; visor.position.set(0,1.10,0.12); g.add(visor);
  const eyeM=new THREE.MeshBasicMaterial({color:0x9fd8ff});
  const e1=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,8),eyeM); e1.position.set(0.07,1.13,0.29); g.add(e1);
  const e2=e1.clone(); e2.position.x=-0.07; g.add(e2);
  const smile=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,6,10,Math.PI),eyeM);
  smile.position.set(0,1.06,0.29); smile.rotation.z=Math.PI; g.add(smile);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(0.32,24,18),
    new THREE.MeshPhongMaterial({color:0xccecff,transparent:true,opacity:0.28,shininess:100}));
  helmet.position.y=1.08; g.add(helmet);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.2,6),grey);
  ant.position.set(0.2,1.4,0); g.add(ant);
  const tipMat=new THREE.MeshLambertMaterial({color:0x662222,emissive:0xff2222});
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),tipMat);
  tip.position.set(0.2,1.52,0); g.add(tip);
  const lamp=new THREE.PointLight(0xffe8c0,0.7,9); lamp.position.set(0,2.2,0); g.add(lamp);
  /* ombra finta a terra: costa quasi nulla ma "incolla" l'astronauta al pavimento */
  const sh=shadowBlob(1.5); g.add(sh);
  g.userData={legL:legL,legR:legR,tipMat:tipMat,shadow:sh};
  return g;
}

function makeDoor(gx,gz,q,theme,rotationY){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const grad=c.createLinearGradient(0,0,128,128); grad.addColorStop(0,theme.accent); grad.addColorStop(1,'#27375f');
  c.fillStyle=grad; c.fillRect(0,0,128,128);
  c.strokeStyle='rgba(255,255,255,.38)'; c.lineWidth=5; c.strokeRect(8,8,112,112);
  c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
  c.font='bold 64px sans-serif'; c.fillText('?',64,44);
  c.font='44px sans-serif'; c.fillText(theme.emoji,64,98);
  const tex=new THREE.CanvasTexture(cv);
  const mesh=new THREE.Group();
  const metal=new THREE.MeshPhongMaterial({color:0x384761,shininess:75});
  /* Il corridoio occupa una cella libera fra due celle-muro: la porta deve
     quindi coprire quasi due CELL, fino al bordo interno delle pareti. */
  const doorWidth=2*CELL-CELL*.28+.08;
  const panel=new THREE.Mesh(new THREE.BoxGeometry(doorWidth-.48,1.92,.24),new THREE.MeshPhongMaterial({map:tex,shininess:55}));
  panel.position.y=1.08; mesh.add(panel);
  const sideGeo=new THREE.BoxGeometry(.22,2.35,.42);
  [-1,1].forEach(s=>{const side=new THREE.Mesh(sideGeo,metal);side.position.set(s*(doorWidth/2-.11),1.18,0);mesh.add(side);});
  const top=new THREE.Mesh(new THREE.BoxGeometry(doorWidth,.24,.42),metal); top.position.y=2.3; mesh.add(top);
  const lampMat=new THREE.MeshPhongMaterial({color:theme.accent,emissive:theme.accent,shininess:90});
  [-1,1].forEach(s=>{const lamp=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),lampMat);lamp.position.set(s*(doorWidth/2-.34),2.3,.24);mesh.add(lamp);});
  mesh.add(shadowBlob(2.4));
  const p=g2w(gx,gz); mesh.position.set(p.x,0,p.z); scene.add(mesh);
  mesh.rotation.y=rotationY||0;
  return {gx:gx,gz:gz,mesh:mesh,q:q,open:false,cooldown:false};
}

function makeStars(){
  const n=500, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*0.9);
    const r=70+Math.random()*25;
    pos[i*3]=r*Math.sin(ph)*Math.cos(th);
    pos[i*3+1]=r*Math.cos(ph);
    pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:0xffffff,size:0.7,sizeAttenuation:true,transparent:true,opacity:0.9});
  mat.fog=false;
  return new THREE.Points(geo,mat);
}
function makeThemeParticles(t){
  const n=160, area=Math.max(W,H)*CELL+10, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    pos[i*3]=(Math.random()-0.5)*area;
    pos[i*3+1]=Math.random()*7;
    pos[i*3+2]=(Math.random()-0.5)*area;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:t.pcolor,size:0.15,transparent:true,opacity:0.85});
  themeVel=t.pspeed;
  return new THREE.Points(geo,mat);
}
function burst(pos,baseColor){
  for(let i=0;i<18;i++){
    const col=new THREE.Color(baseColor).offsetHSL((Math.random()-0.5)*0.15,0,Math.random()*0.25);
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.13,0.13),new THREE.MeshBasicMaterial({color:col}));
    m.position.copy(pos); m.position.y+=1;
    scene.add(m);
    const a=Math.random()*Math.PI*2;
    bursts.push({m:m, vx:Math.cos(a)*(1+Math.random()*3), vy:2.5+Math.random()*4, vz:Math.sin(a)*(1+Math.random()*3), life:1.2});
  }
}

function questionSet(){ return DIFF==='easy' ? THEMES[curLevel].easy : THEMES[curLevel].hard; }

/* Mette i cartelli lungo il percorso. Ognuno indica il prossimo obiettivo
   (la porta successiva, o la stella se non ce ne sono più) nominando il
   monumento più vicino: l'unico modo per usarli è leggerli. */
function buildSigns(path,used,t){
  const spots=[0.06,0.28,0.5,0.72];
  const taken=new Set();
  spots.forEach(f=>{
    const wanted=Math.max(1,Math.round(f*(path.length-1)));
    let k=-1;
    for(let radius=0;radius<path.length && k<0;radius++){
      for(const ck of (radius?[wanted-radius,wanted+radius]:[wanted])){
        if(ck<1||ck>=path.length-1) continue;
        const cur=path[ck], pv=path[ck-1], nx=path[ck+1];
        const key=cur[0]+','+cur[1];
        if(used.has(key)||taken.has(key)) continue;
        /* serve un muro laterale a cui appendere la targa: se il corridoio va
           in orizzontale il muro deve stare sopra o sotto, e viceversa */
        const hz=(nx[0]!==pv[0])||(pv[1]===cur[1]&&nx[1]===cur[1]);
        const wall=hz ? (grid[cur[1]-1][cur[0]]!==0||grid[cur[1]+1][cur[0]]!==0)
                      : (grid[cur[1]][cur[0]-1]!==0||grid[cur[1]][cur[0]+1]!==0);
        if(!wall) continue;
        k=ck; break;
      }
    }
    if(k<0) return;
    const cur=path[k], prev=path[Math.max(0,k-1)], next=path[Math.min(path.length-1,k+1)];
    taken.add(cur[0]+','+cur[1]);
    /* obiettivo successivo: la prima porta più avanti, altrimenti la stella */
    let target=null, isStar=true;
    let bestPk=1e9;
    for(const d of doors) if(typeof d.pk==='number' && d.pk>k && d.pk<bestPk){ bestPk=d.pk; target=[d.gx,d.gz]; isStar=false; }
    if(!target) target=[W-2,H-2];
    const text=signPhrase(target[0],target[1],isStar);
    /* il cartello si appoggia al muro laterale, non in mezzo al corridoio */
    const horiz=(next[0]!==prev[0])||(prev[1]===cur[1]&&next[1]===cur[1]);
    let ox=0,oz=0;
    if(horiz) oz=(grid[cur[1]-1][cur[0]]!==0)?-0.80:0.80;
    else      ox=(grid[cur[1]][cur[0]-1]!==0)?-0.80:0.80;
    const p=g2w(cur[0],cur[1]);
    /* la targa guarda dal muro verso il centro del corridoio */
    const rotY=Math.atan2(-ox,-oz);
    const grp=makeSign(text,t.accent,rotY);
    grp.position.set(p.x+ox,0,p.z+oz); scene.add(grp);
    signs.push({gx:cur[0],gz:cur[1],x:p.x+ox,z:p.z+oz,text:text,group:grp,read:false,knob:grp.children[2]});
  });
}

function buildLevel(idx){
  curLevel=idx; keysGot=0; doors=[]; decos=[]; bursts=[]; currentDoor=null;
  lives=MAXLIVES; tokens=0; starCooldown=false;
  powerups=[]; hunt=null; freeJolly=0; shieldOn=false;
  marks=[]; signs=[]; torches=[]; curSign=null;
  const t=THEMES[idx];
  scene=new THREE.Scene();
  scene.background=new THREE.Color(t.sky);
  scene.fog=new THREE.Fog(t.sky,16,52);
  scene.add(new THREE.HemisphereLight(0xdbeeff,0x26331f,0.72));
  const dl=new THREE.DirectionalLight(0xfff4dd,0.9); dl.position.set(5,12,4); scene.add(dl);
  /* una seconda luce debole dal lato opposto: toglie le facce completamente nere */
  const fill=new THREE.DirectionalLight(0x9fc4ff,0.28); fill.position.set(-7,6,-5); scene.add(fill);
  scene.add(skyDome(t));

  W=H=SIZES[idx];
  grid=genMaze(W,H);
  seenCells=Array.from({length:H},()=>new Uint8Array(W));

  const planeSize=Math.max(W,H)*CELL+50;
  const gtex=groundTexture(t); gtex.repeat.set(planeSize/CELL,planeSize/CELL);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(planeSize,planeSize), new THREE.MeshLambertMaterial({map:gtex}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);

  const wallHeight=1.72;
  /* Pareti sottili ma continue: ogni cella di muro si collega al centro
     delle celle vicine. I segmenti si sovrappongono agli incroci, quindi
     non restano fessure visive né nelle curve né lungo il perimetro.
     Tutti i pezzi uguali finiscono in un solo InstancedMesh: da ~1200
     oggetti da disegnare si scende a 6, e il gioco resta fluido su tablet. */
  const wallThickness=CELL*.28, wallLength=CELL*1.04;
  const wallMat=new THREE.MeshPhongMaterial({map:wallTexture(t),shininess:14});
  const capMat=new THREE.MeshPhongMaterial({color:t.accent,shininess:45});
  const geos={
    h:new THREE.BoxGeometry(wallLength,wallHeight,wallThickness),
    v:new THREE.BoxGeometry(wallThickness,wallHeight,wallLength),
    p:new THREE.BoxGeometry(wallThickness,wallHeight,wallThickness),
    ch:new THREE.BoxGeometry(wallLength+.04,.13,wallThickness+.06),
    cv:new THREE.BoxGeometry(wallThickness+.06,.13,wallLength+.04),
    cp:new THREE.BoxGeometry(wallThickness+.06,.13,wallThickness+.06)
  };
  const slots={h:[],v:[],p:[]}, wallCells=[];
  for(let z=0;z<H;z++) for(let x=0;x<W;x++) if(grid[z][x]===1){
    const p=g2w(x,z);
    const horizontal=(x>0&&grid[z][x-1]===1)||(x<W-1&&grid[z][x+1]===1);
    const vertical=(z>0&&grid[z-1][x]===1)||(z<H-1&&grid[z+1][x]===1);
    if(horizontal) slots.h.push(p);
    if(vertical)   slots.v.push(p);
    if(!horizontal&&!vertical) slots.p.push(p);
    wallCells.push([x,z]);
  }
  const dummy=new THREE.Object3D();
  const place=(geo,mat,list,y)=>{
    if(!list.length) return;
    const im=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach((p,i)=>{ dummy.position.set(p.x,y,p.z); dummy.updateMatrix(); im.setMatrixAt(i,dummy.matrix); });
    if(im.instanceMatrix) im.instanceMatrix.needsUpdate=true;
    /* in questa versione di Three la sfera di ingombro di un InstancedMesh è
       quella del singolo pezzo, centrata sull'origine: senza questa riga i
       muri sparirebbero appena la telecamera si allontana dal centro. */
    im.frustumCulled=false;
    scene.add(im);
  };
  place(geos.h,wallMat,slots.h,wallHeight/2);
  place(geos.v,wallMat,slots.v,wallHeight/2);
  place(geos.p,wallMat,slots.p,wallHeight/2);
  place(geos.ch,capMat,slots.h,wallHeight+.065);
  place(geos.cv,capMat,slots.v,wallHeight+.065);
  place(geos.cp,capMat,slots.p,wallHeight+.065);

  scene.add(makeStars());
  themeParts=makeThemeParticles(t); scene.add(themeParts);

  /* --- torce appese ai muri: danno profondità e fanno "vivere" i corridoi --- */
  const flameTex=torchFlameTexture();
  const bracketMat=new THREE.MeshPhongMaterial({color:0x3a3226,shininess:10});
  const torchCells=shuffle(wallCells.filter(c=>{
    const x=c[0],z=c[1];
    return x>0&&x<W-1&&z>0&&z<H-1 &&
      (grid[z][x-1]===0||grid[z][x+1]===0||grid[z-1][x]===0||grid[z+1][x]===0);
  })).slice(0,Math.min(14,Math.floor(W*H/34)));
  torchCells.forEach(c=>{
    const x=c[0], z=c[1], p=g2w(x,z);
    let ox=0,oz=0;
    if(grid[z][x-1]===0) ox=-wallThickness/2-.1; else if(grid[z][x+1]===0) ox=wallThickness/2+.1;
    else if(grid[z-1][x]===0) oz=-wallThickness/2-.1; else oz=wallThickness/2+.1;
    const br=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.34,6),bracketMat);
    br.position.set(p.x+ox,1.28,p.z+oz); br.rotation.z=ox?Math.sign(ox)*0.5:0; br.rotation.x=oz?-Math.sign(oz)*0.5:0;
    scene.add(br);
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:flameTex,color:0xffb14a,
      blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
    fl.position.set(p.x+ox*1.5,1.52,p.z+oz*1.5); fl.scale.set(.62,.8,1);
    scene.add(fl); torches.push(fl);
  });

  /* --- monumenti nelle piazze: i punti di riferimento del labirinto --- */
  ROOMS.forEach((r,k)=>{
    const def=LANDMARKS[(idx*2+k)%LANDMARKS.length];
    const grp=makeLandmark(def);
    const p=g2w(r.cx,r.cy); grp.position.set(p.x,0,p.z); scene.add(grp);
    marks.push({def:def,gx:r.cx,gz:r.cy,group:grp});
  });

  const path=findPath(grid,1,1,W-2,H-2);
  const used=new Set(['1,1',(W-2)+','+(H-2)]);
  qpool=shuffle(questionSet().slice());
  let qi=0;
  [0.15,0.32,0.5,0.68,0.85].forEach(f=>{
    const wanted=Math.round(f*(path.length-1));
    let k=-1;
    /* Una porta ha bisogno di due muri opposti ai lati. Cerchiamo la cella
       rettilinea più vicina, evitando curve e incroci dove la cornice
       finirebbe davanti o dentro a un blocco. */
    for(let radius=0;radius<path.length && k<0;radius++){
      const candidates=radius?[wanted-radius,wanted+radius]:[wanted];
      for(const ck of candidates){
        if(ck<=1||ck>=path.length-2) continue;
        const cur=path[ck], prev=path[ck-1], next=path[ck+1];
        const vertical=prev[0]===cur[0]&&next[0]===cur[0];
        const horizontal=prev[1]===cur[1]&&next[1]===cur[1];
        const anchored=(vertical&&grid[cur[1]][cur[0]-1]===1&&grid[cur[1]][cur[0]+1]===1) ||
          (horizontal&&grid[cur[1]-1][cur[0]]===1&&grid[cur[1]+1][cur[0]]===1);
        if((vertical||horizontal)&&anchored&&!used.has(cur[0]+','+cur[1])){ k=ck; break; }
      }
    }
    if(k<0) return;
    const gx=path[k][0], gz=path[k][1];
    used.add(gx+','+gz);
    /* La faccia della porta taglia il tratto rettilineo del corridoio. */
    const prev=path[Math.max(0,k-1)];
    const rotationY=(prev && prev[0]!==gx)?Math.PI/2:0;
    const dr=makeDoor(gx,gz,qpool[qi%qpool.length],t,rotationY); dr.pk=k;
    doors.push(dr); qi++;
  });

  star=new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshLambertMaterial({color:0xffd11a,emissive:0x996d00}));
  const sp=g2w(W-2,H-2); star.position.set(sp.x,1.2,sp.z); scene.add(star);
  glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  glow.position.copy(star.position); glow.scale.set(2.6,2.6,1); scene.add(glow);
  const sl=new THREE.PointLight(0xffd11a,0.8,10); sl.position.set(sp.x,2,sp.z); scene.add(sl);
  const sbl=shadowBlob(1.6); sbl.position.set(sp.x,0.03,sp.z); scene.add(sbl);

  /* --- CARTELLI: si leggono per capire dove andare --- */
  buildSigns(path,used,t);

  const openCells=[];
  for(let z=1;z<H-1;z++) for(let x=1;x<W-1;x++)
    if(grid[z][x]===0 && !used.has(x+','+z)) openCells.push([x,z]);
  const cells=shuffle(openCells);
  /* decorazioni (solo estetiche) */
  cells.splice(0,8).forEach((c,i)=>{
    const s=emojiSprite(t.decos[i%t.decos.length],0.9);
    const p=g2w(c[0],c[1]); s.position.set(p.x,1.3,p.z); scene.add(s); decos.push(s);
  });
  /* power-up raccoglibili: cuore, jolly gratis, scudo */
  [['heart','❤️'],['jolly','🎟️'],['shield','🛡️']].forEach(pu=>{
    if(!cells.length) return;
    const c=cells.pop();
    const s=emojiSprite(pu[1],1.0);
    const p=g2w(c[0],c[1]); s.position.set(p.x,1.25,p.z); scene.add(s);
    powerups.push({type:pu[0],sprite:s});
  });
  /* caccia alla parola: le lettere di una parola del Guardiano, sparse nel labirinto */
  let hcand=SFIDE[idx].filter(s=>s.word[LI()].length<=8);
  if(!hcand.length) hcand=SFIDE[idx].slice().sort((a,b)=>a.word[LI()].length-b.word[LI()].length).slice(0,1);
  const hsf=hcand[Math.floor(Math.random()*hcand.length)];
  const hword=hsf.word[LI()].toUpperCase();
  if(cells.length>=hword.length){
    hunt={s:hsf, word:hword, got:[], letters:[]};
    hword.split('').forEach((ch,k)=>{
      if(!/[A-ZÀ-Ü0-9]/.test(ch)){ hunt.got[k]=true; return; }
      hunt.got[k]=false;
      const c=cells.pop();
      const s=letterSprite(ch,t.accent);
      const p=g2w(c[0],c[1]); s.position.set(p.x,1.25,p.z); scene.add(s);
      hunt.letters.push({sprite:s,idx:k,ch:ch,done:false});
    });
  }

  player=makePlayer();
  const pp=g2w(1,1); player.position.set(pp.x,0,pp.z); scene.add(player);

  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,10), new THREE.MeshBasicMaterial({color:0xffd11a}));
  cone.rotation.x=Math.PI/2; cone.position.z=0.45;
  arrowGroup=new THREE.Group(); arrowGroup.add(cone); scene.add(arrowGroup);

  camera.position.set(pp.x,8.5,pp.z+7);
}

/* ================= INPUT ================= */
const keys={};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase(); keys[k]=true;
  if(k.startsWith('arrow')||k===' ') e.preventDefault();
});
addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });

const isTouch=('ontouchstart' in window);
const joy={dx:0,dy:0,id:null};
const joyEl=$('joy'), knob=$('joyKnob');
function joyMove(t){
  const r=joyEl.getBoundingClientRect();
  let dx=t.clientX-(r.left+70), dy=t.clientY-(r.top+70);
  const l=Math.hypot(dx,dy), max=55;
  if(l>max){ dx*=max/l; dy*=max/l; }
  knob.style.left=(45+dx)+'px'; knob.style.top=(45+dy)+'px';
  joy.dx=dx/max; joy.dy=dy/max;
}
function joyReset(){ joy.dx=joy.dy=0; joy.id=null; knob.style.left='45px'; knob.style.top='45px'; }
joyEl.addEventListener('touchstart',e=>{ e.preventDefault(); joy.id=e.changedTouches[0].identifier; joyMove(e.changedTouches[0]); },{passive:false});
joyEl.addEventListener('touchmove',e=>{ e.preventDefault(); for(const t of e.changedTouches) if(t.identifier===joy.id) joyMove(t); },{passive:false});
joyEl.addEventListener('touchend',joyReset);
joyEl.addEventListener('touchcancel',joyReset);

function inputDir(){
  let dx=0,dz=0;
  if(keys['arrowup']||keys['w']) dz-=1;
  if(keys['arrowdown']||keys['s']) dz+=1;
  if(keys['arrowleft']||keys['a']) dx-=1;
  if(keys['arrowright']||keys['d']) dx+=1;
  dx+=joy.dx; dz+=joy.dy;
  const l=Math.hypot(dx,dz);
  if(l>1){ dx/=l; dz/=l; }
  return [dx,dz];
}

/* ================= COLLISIONI ================= */
function solidAt(wx,wz){
  const gx=Math.round(wx/CELL+(W-1)/2), gz=Math.round(wz/CELL+(H-1)/2);
  if(gx<0||gx>=W||gz<0||gz>=H) return true;
  if(grid[gz][gx]!==0) return true;   /* 1 = muro, 2 = basamento del monumento */
  for(const d of doors) if(!d.open && d.gx===gx && d.gz===gz) return true;
  return false;
}
function canStand(wx,wz){
  const r=0.38;
  return !( solidAt(wx-r,wz-r)||solidAt(wx+r,wz-r)||solidAt(wx-r,wz+r)||solidAt(wx+r,wz+r) );
}
