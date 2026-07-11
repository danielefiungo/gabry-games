/* ============================================================
   MOTORE 3D — generazione labirinto, grafica, input, collisioni, salvataggi
   ============================================================ */
/* ================= LABIRINTO ================= */
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
const SIZES=[13,15,15,17,17,19,19,21,21,21];
let renderer, scene=null, camera, player, arrowGroup=null;
let grid, W, H, doors=[], star=null, glow=null, decos=[], bursts=[];
let themeParts=null, themeVel=1;
let curLevel=0, keysGot=0, paused=true, currentDoor=null, walk=0;
let lives=MAXLIVES, tokens=0, qpool=[];
let LANG='it', DIFF='easy', unlocked=1, VOICEON=true, ARROWON=true, FPV=false;
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
  unlocked=Math.max(1, parseInt(localStorage.getItem('gabri_unlocked')||'1')||1);
  DIFF=localStorage.getItem('gabri_diff')||'easy';
  VOICEON=localStorage.getItem('gabri_voice')!=='0';
  MUSICON=localStorage.getItem('gabri_music')!=='0';
  ARROWON=localStorage.getItem('gabri_arrow')!=='0';
  FPV=localStorage.getItem('gabri_fpv')==='1';
  score=parseInt(localStorage.getItem('gabri_score')||'0')||0;
  bestStreak=parseInt(localStorage.getItem('gabri_beststreak')||'0')||0;
  starsMap=JSON.parse(localStorage.getItem('gabri_stars')||'{}')||{};
  words=JSON.parse(localStorage.getItem('gabri_words')||'[]')||[];
}catch(e){}
function save(){ try{
  localStorage.setItem('gabri_unlocked',String(unlocked));
  localStorage.setItem('gabri_diff',DIFF);
  localStorage.setItem('gabri_voice',VOICEON?'1':'0');
  localStorage.setItem('gabri_music',MUSICON?'1':'0');
  localStorage.setItem('gabri_arrow',ARROWON?'1':'0');
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
function groundTexture(t){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const base=new THREE.Color(t.floor);
  const lite=base.clone().lerp(new THREE.Color(0xffffff),0.10);
  c.fillStyle='#'+base.getHexString(); c.fillRect(0,0,128,128);
  c.fillStyle='#'+lite.getHexString(); c.fillRect(0,0,64,64); c.fillRect(64,64,64,64);
  const tex=new THREE.CanvasTexture(cv);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  return tex;
}
function wallTexture(t){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const base=new THREE.Color(t.wall);
  const dark=base.clone().lerp(new THREE.Color(0x000000),0.25);
  const lite=base.clone().lerp(new THREE.Color(0xffffff),0.18);
  c.fillStyle='#'+base.getHexString(); c.fillRect(0,0,128,128);
  c.strokeStyle='#'+dark.getHexString(); c.lineWidth=8; c.strokeRect(4,4,120,120);
  c.strokeStyle='#'+lite.getHexString(); c.lineWidth=3;
  c.beginPath(); c.moveTo(10,46); c.lineTo(118,46); c.moveTo(10,86); c.lineTo(118,86); c.stroke();
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
  const white=new THREE.MeshLambertMaterial({color:0xf2f2f8});
  const grey =new THREE.MeshLambertMaterial({color:0xb9c2d0});
  const legGeo=new THREE.CylinderGeometry(0.09,0.11,0.26,10);
  const legL=new THREE.Mesh(legGeo,white); legL.position.set(0.14,0.13,0);
  const legR=new THREE.Mesh(legGeo,white); legR.position.set(-0.14,0.13,0);
  g.add(legL); g.add(legR);
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.36,18,14),white);
  body.scale.y=1.15; body.position.y=0.6; g.add(body);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.14,0.06),grey);
  chest.position.set(0,0.62,0.33); g.add(chest);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.18),grey);
  pack.position.set(0,0.66,-0.34); g.add(pack);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.26,18,14),white);
  head.position.y=1.08; g.add(head);
  const visor=new THREE.Mesh(new THREE.SphereGeometry(0.20,16,12),new THREE.MeshLambertMaterial({color:0x18243f}));
  visor.scale.z=0.75; visor.position.set(0,1.10,0.12); g.add(visor);
  const eyeM=new THREE.MeshBasicMaterial({color:0x9fd8ff});
  const e1=new THREE.Mesh(new THREE.SphereGeometry(0.045,8,8),eyeM); e1.position.set(0.07,1.13,0.29); g.add(e1);
  const e2=e1.clone(); e2.position.x=-0.07; g.add(e2);
  const smile=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.018,6,10,Math.PI),eyeM);
  smile.position.set(0,1.06,0.29); smile.rotation.z=Math.PI; g.add(smile);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(0.31,18,14),
    new THREE.MeshLambertMaterial({color:0xbfe4ff,transparent:true,opacity:0.25}));
  helmet.position.y=1.08; g.add(helmet);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.2,6),grey);
  ant.position.set(0.2,1.4,0); g.add(ant);
  const tipMat=new THREE.MeshLambertMaterial({color:0x662222,emissive:0xff2222});
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),tipMat);
  tip.position.set(0.2,1.52,0); g.add(tip);
  const lamp=new THREE.PointLight(0xffe8c0,0.7,9); lamp.position.set(0,2.2,0); g.add(lamp);
  g.userData={legL:legL,legR:legR,tipMat:tipMat};
  return g;
}

function makeDoor(gx,gz,q,theme){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  c.fillStyle=theme.accent; c.fillRect(0,0,128,128);
  c.strokeStyle='rgba(0,0,0,.28)'; c.lineWidth=10; c.strokeRect(5,5,118,118);
  c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
  c.font='bold 64px sans-serif'; c.fillText('?',64,44);
  c.font='44px sans-serif'; c.fillText(theme.emoji,64,98);
  const tex=new THREE.CanvasTexture(cv);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(CELL*0.99,2.4,CELL*0.99), new THREE.MeshLambertMaterial({map:tex}));
  const p=g2w(gx,gz); mesh.position.set(p.x,1.2,p.z); scene.add(mesh);
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

function buildLevel(idx){
  curLevel=idx; keysGot=0; doors=[]; decos=[]; bursts=[]; currentDoor=null;
  lives=MAXLIVES; tokens=0; starCooldown=false;
  const t=THEMES[idx];
  scene=new THREE.Scene();
  scene.background=new THREE.Color(t.sky);
  scene.fog=new THREE.Fog(t.sky,14,44);
  scene.add(new THREE.AmbientLight(0xffffff,0.6));
  const dl=new THREE.DirectionalLight(0xffffff,0.7); dl.position.set(5,12,4); scene.add(dl);

  W=H=SIZES[idx];
  grid=genMaze(W,H);

  const planeSize=Math.max(W,H)*CELL+50;
  const gtex=groundTexture(t); gtex.repeat.set(planeSize/(CELL*2),planeSize/(CELL*2));
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(planeSize,planeSize), new THREE.MeshLambertMaterial({map:gtex}));
  floor.rotation.x=-Math.PI/2; scene.add(floor);

  const wallGeo=new THREE.BoxGeometry(CELL,2.4,CELL);
  const wallMat=new THREE.MeshLambertMaterial({map:wallTexture(t)});
  for(let z=0;z<H;z++) for(let x=0;x<W;x++) if(grid[z][x]===1){
    const m=new THREE.Mesh(wallGeo,wallMat); const p=g2w(x,z); m.position.set(p.x,1.2,p.z); scene.add(m);
  }

  scene.add(makeStars());
  themeParts=makeThemeParticles(t); scene.add(themeParts);

  const path=findPath(grid,1,1,W-2,H-2);
  const used=new Set(['1,1',(W-2)+','+(H-2)]);
  qpool=shuffle(questionSet().slice());
  let qi=0;
  [0.15,0.32,0.5,0.68,0.85].forEach(f=>{
    let k=Math.round(f*(path.length-1));
    while(k>1 && used.has(path[k][0]+','+path[k][1])) k--;
    const gx=path[k][0], gz=path[k][1];
    if(used.has(gx+','+gz)) return;
    used.add(gx+','+gz);
    doors.push(makeDoor(gx,gz,qpool[qi%qpool.length],t)); qi++;
  });

  star=new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshLambertMaterial({color:0xffd11a,emissive:0x996d00}));
  const sp=g2w(W-2,H-2); star.position.set(sp.x,1.2,sp.z); scene.add(star);
  glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  glow.position.copy(star.position); glow.scale.set(2.6,2.6,1); scene.add(glow);
  const sl=new THREE.PointLight(0xffd11a,0.8,10); sl.position.set(sp.x,2,sp.z); scene.add(sl);

  const openCells=[];
  for(let z=1;z<H-1;z++) for(let x=1;x<W-1;x++)
    if(grid[z][x]===0 && !used.has(x+','+z)) openCells.push([x,z]);
  shuffle(openCells).slice(0,10).forEach((c,i)=>{
    const s=emojiSprite(t.decos[i%t.decos.length],0.9);
    const p=g2w(c[0],c[1]); s.position.set(p.x,1.3,p.z); scene.add(s); decos.push(s);
  });

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
  if(grid[gz][gx]===1) return true;
  for(const d of doors) if(!d.open && d.gx===gx && d.gz===gz) return true;
  return false;
}
function canStand(wx,wz){
  const r=0.38;
  return !( solidAt(wx-r,wz-r)||solidAt(wx+r,wz-r)||solidAt(wx-r,wz+r)||solidAt(wx+r,wz+r) );
}
