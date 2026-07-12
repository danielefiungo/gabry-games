/* ============================================================
   MAPPA DEI REGNI — SISTEMA SOLARE 3D (Three.js)
   Sostituisce la vecchia mappa SVG a isole.
   - nodi 0-9  : pianeti in ordine reale dal Sole (Regno delle Scoperte)
                 Mercurio, Venere, Terra, Luna, Marte, Giove,
                 Saturno, Urano, Nettuno, Plutone
   - nodi 10-12: stazioni (Regno dell'Informatica)
                 ISS intorno alla Terra, Telescopio spaziale,
                 Base sulla Luna
   Scienza vera: le velocità orbitali seguono la 3ª legge di
   Keplero (T² ∝ a³): i pianeti vicini al Sole corrono, quelli
   lontani vanno piano. Distanze e grandezze NON in scala.
   ============================================================ */

/* ---- costanti di tuning ---- */
const MAPPA_TIME=0.55;        /* scala del tempo (orbite più lente = più facili da toccare) */
const MAPPA_HOVER_SLOW=0.12;  /* con il mouse sulla mappa (o dopo un tocco) le orbite rallentano a questo fattore */
const MAPPA_TOUCH_SLOW_MS=3000; /* dopo un tocco su schermo touch, resta lento per questi ms */
const MAPPA_KEP=15;           /* costante di Keplero per le orbite intorno al Sole */
const MAPPA_KEP_CHILD=0.92;   /* costante di Keplero per Luna/stazioni intorno alla Terra */
const MAPPA_ZOOM_MIN=14, MAPPA_ZOOM_MAX=110, MAPPA_ZOOM_START=62;
/* vista "pianeti in fila" (allineamento planetario): tutti i corpi alla stessa
   longitudine, camera quasi dall'alto — il percorso si legge da sinistra a destra */
const MAPPA_ALIGN_THETA=Math.PI/2, MAPPA_ALIGN_PHI=0.5, MAPPA_ALIGN_R=60, MAPPA_ALIGN_CX=21;
const MAPPA_ORBIT_THETA=0.9, MAPPA_ORBIT_PHI=1.05;
/* sfalsamento delle etichette nella vista in fila (righe: + sotto, - sopra) */
const MAP_STAG=[1,-1,-2,2,1,-1,1,-1,1,-1,-3,-3,3];

/* RETE DELLE ROTTE DI TRASFERIMENTO: completare un livello sblocca
   i vicini; i livelli chiusi si aprono anche con la Letturina 📖.
   Dalla Terra (2) si dirama: Luna (3), Marte (4) e ISS (10). */
const EDGES=[
  [1],        /* 0  Mercurio */
  [0,2],      /* 1  Venere */
  [1,3,4,10], /* 2  Terra */
  [2,12],     /* 3  Luna → Base Lunare */
  [2,5],      /* 4  Marte */
  [4,6],      /* 5  Giove */
  [5,7],      /* 6  Saturno */
  [6,8],      /* 7  Urano */
  [7,9],      /* 8  Nettuno */
  [8],        /* 9  Plutone */
  [2,11],     /* 10 ISS → Telescopio */
  [10,12],    /* 11 Telescopio */
  [3,11]      /* 12 Base Lunare */
];

/* corpo celeste per ogni livello: a=raggio orbita, r=raggio corpo,
   parent=-1 orbita il Sole, altrimenti indice del corpo genitore */
const MAP_BODIES=[
  {nm:['Mercurio','Mercury'], a:7,    r:0.55, parent:-1, inc:0.03, kind:'rock',  col:'#9c8b7a'},
  {nm:['Venere','Venus'],     a:9.5,  r:0.85, parent:-1, inc:0.02, kind:'rock',  col:'#e0c48f'},
  {nm:['Terra','Earth'],      a:12.5, r:0.95, parent:-1, inc:0.00, kind:'terra', col:'#2b6cd4'},
  {nm:['Luna','Moon'],        a:2.0,  r:0.34, parent:2,  inc:0.09, kind:'rock',  col:'#b9b9b9'},
  {nm:['Marte','Mars'],       a:16,   r:0.70, parent:-1, inc:0.03, kind:'rock',  col:'#c1552f'},
  {nm:['Giove','Jupiter'],    a:24,   r:2.10, parent:-1, inc:0.02, kind:'bands', col:'#c8a97e', bands:['#b3906a','#dcc3a0','#a5764f','#e8d7bb']},
  {nm:['Saturno','Saturn'],   a:29,   r:1.75, parent:-1, inc:0.04, kind:'bands', col:'#d8c092', bands:['#c9ae7d','#e8d9ae','#bfa26e'], ring:true},
  {nm:['Urano','Uranus'],     a:34,   r:1.30, parent:-1, inc:0.01, kind:'ice',   col:'#9fd8db'},
  {nm:['Nettuno','Neptune'],  a:38.5, r:1.25, parent:-1, inc:0.03, kind:'ice',   col:'#3a5bd0'},
  {nm:['Plutone','Pluto'],    a:43,   r:0.42, parent:-1, inc:0.30, kind:'rock',  col:'#c7a888'},
  {nm:['ISS','ISS'],          a:1.15, r:0.30, parent:2,  inc:0.45, kind:'iss'},
  {nm:['Telescopio','Telescope'], a:3.1, r:0.30, parent:2, inc:0.12, kind:'jwst'},
  {nm:['Base Lunare','Moon Base'], a:0, r:0.30, parent:3, inc:0,   kind:'base'}
];

/* ---- stato del modulo ---- */
let mapGL=null, mapScene=null, mapCam=null, mapCv=null, mapLbls=null;
let mapBodies=[], mapEdges=[], mapBelt=null, mapMarker=null, mapRunning=false;
let mapCamTheta=0.9, mapCamPhi=1.05, mapCamR=MAPPA_ZOOM_START;
let mapClock=null, mapRay=null, mapHits=[];
/* rallentamento "gentile": col mouse sopra la mappa i pianeti quasi si fermano,
   così non bisogna rincorrerli per cliccarli */
let mapSpeedF=1, mapPtrIn=false, mapLastTouch=0;
let mapLastW=0, mapLastH=0;
/* vista: 'fila' (default, facile scegliere) o 'orbite' (tutto in movimento) */
let mapAligned=true, mapCamAuto=true, mapCenterX=MAPPA_ALIGN_CX;
try{ mapAligned=(localStorage.getItem('gabri_mapview')!=='orbite'); }catch(e){}
function mapSetAligned(v){
  mapAligned=v; mapCamAuto=true;
  try{ localStorage.setItem('gabri_mapview',v?'fila':'orbite'); }catch(e){}
  buildMap();
}
/* angolo di allineamento: pianeti a longitudine 0; Luna e stazioni si aprono
   a ventaglio intorno alla Terra per non finire uno sopra l'altro */
function mapAlignAngle(k){
  if(k===3) return Math.PI/2;          /* Luna: davanti (in basso sullo schermo) */
  if(k===10||k===11) return -Math.PI/2; /* ISS e Telescopio: dietro (in alto) */
  return 0;
}

/* ---- texture procedurali ---- */
function mapTex(kind,base,bands){
  const cv=document.createElement('canvas'); cv.width=256; cv.height=128;
  const c=cv.getContext('2d');
  c.fillStyle=base; c.fillRect(0,0,256,128);
  if(kind==='rock'){
    /* crateri e macchie */
    for(let i=0;i<70;i++){
      const x=Math.random()*256, y=Math.random()*128, r=1+Math.random()*5;
      c.fillStyle='rgba(0,0,0,'+(0.05+Math.random()*0.13)+')';
      c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
    }
    for(let i=0;i<30;i++){
      c.fillStyle='rgba(255,255,255,'+(0.04+Math.random()*0.08)+')';
      c.beginPath(); c.arc(Math.random()*256,Math.random()*128,1+Math.random()*4,0,Math.PI*2); c.fill();
    }
  } else if(kind==='bands'){
    const bs=bands||[]; const n=9;
    for(let i=0;i<n;i++){
      c.fillStyle=bs[i%bs.length];
      c.globalAlpha=0.85;
      c.fillRect(0,i*128/n,256,128/n+1);
    }
    c.globalAlpha=1;
  } else if(kind==='terra'){
    /* oceani + continenti + poli */
    for(let i=0;i<26;i++){
      const x=Math.random()*256, y=14+Math.random()*100, r=5+Math.random()*14;
      c.fillStyle=(Math.random()<0.8)?'#3e9b3e':'#7bb661';
      c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
    }
    c.fillStyle='rgba(255,255,255,.9)'; c.fillRect(0,0,256,9); c.fillRect(0,119,256,9);
    for(let i=0;i<14;i++){ /* nuvole */
      c.fillStyle='rgba(255,255,255,.35)';
      c.beginPath(); c.arc(Math.random()*256,Math.random()*128,4+Math.random()*8,0,Math.PI*2); c.fill();
    }
  } else if(kind==='ice'){
    for(let i=0;i<10;i++){
      c.fillStyle='rgba(255,255,255,'+(0.05+Math.random()*0.08)+')';
      c.fillRect(0,Math.random()*128,256,3+Math.random()*8);
    }
  }
  return new THREE.CanvasTexture(cv);
}
function mapSunTex(){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(64,64,8,64,64,64);
  g.addColorStop(0,'#fff8d0'); g.addColorStop(0.55,'#ffd93d'); g.addColorStop(1,'#ff9d1a');
  c.fillStyle=g; c.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(cv);
}

/* ---- modelli delle stazioni ---- */
function mapMakeISS(){
  const g=new THREE.Group();
  const white=new THREE.MeshLambertMaterial({color:0xe8ecf2});
  const blue =new THREE.MeshLambertMaterial({color:0x2a4fc0});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.5,8),white);
  body.rotation.z=Math.PI/2; g.add(body);
  const p1=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.02,0.16),blue); p1.position.x=0.34; g.add(p1);
  const p2=p1.clone(); p2.position.x=-0.34; g.add(p2);
  return g;
}
function mapMakeJWST(){
  const g=new THREE.Group();
  const mirror=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.03,6),
    new THREE.MeshLambertMaterial({color:0xd9a520,emissive:0x553d00}));
  mirror.rotation.x=Math.PI/2.4; g.add(mirror);
  const shield=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.015,0.3),
    new THREE.MeshLambertMaterial({color:0xc9ccd6}));
  shield.position.y=-0.12; g.add(shield);
  return g;
}
function mapMakeBase(){
  const g=new THREE.Group();
  const dome=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,8,0,Math.PI*2,0,Math.PI/2),
    new THREE.MeshLambertMaterial({color:0xdde4ee}));
  g.add(dome);
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.07,0.1),
    new THREE.MeshLambertMaterial({color:0x9aa6b8}));
  box.position.set(0.17,0.035,0); g.add(box);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.2,5),
    new THREE.MeshLambertMaterial({color:0xcfd6e4}));
  ant.position.set(-0.12,0.1,0); g.add(ant);
  return g;
}

/* ---- costruzione della scena ---- */
function mapBuildScene(){
  mapScene=new THREE.Scene();
  mapScene.add(new THREE.AmbientLight(0x8899bb,0.55));
  const sunLight=new THREE.PointLight(0xfff2cc,1.4,0); mapScene.add(sunLight);

  /* stelle di sfondo */
  const n=900, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=150+Math.random()*60;
    pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.cos(ph); pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  mapScene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.9,transparent:true,opacity:0.85})));

  /* Sole */
  const sun=new THREE.Mesh(new THREE.SphereGeometry(4,24,18), new THREE.MeshBasicMaterial({map:mapSunTex()}));
  mapScene.add(sun);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  glow.scale.set(16,16,1); mapScene.add(glow);
  mapScene.userData.sun=sun;

  /* fascia degli asteroidi (tra Marte e Giove) */
  const bn=320, bp=new Float32Array(bn*3);
  for(let i=0;i<bn;i++){
    const a=18.5+Math.random()*2.6, t=Math.random()*Math.PI*2;
    bp[i*3]=a*Math.cos(t); bp[i*3+1]=(Math.random()-0.5)*0.8; bp[i*3+2]=a*Math.sin(t);
  }
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
  mapBelt=new THREE.Points(bg,new THREE.PointsMaterial({color:0xb0a090,size:0.28,transparent:true,opacity:0.8}));
  mapScene.add(mapBelt);

  /* corpi: prima quelli che orbitano il Sole, poi i figli */
  mapBodies=[]; mapHits=[];
  MAP_BODIES.forEach((B,k)=>{
    const grp=new THREE.Group();
    let mesh;
    if(B.kind==='iss') mesh=mapMakeISS();
    else if(B.kind==='jwst') mesh=mapMakeJWST();
    else if(B.kind==='base') mesh=mapMakeBase();
    else {
      const mat=new THREE.MeshLambertMaterial({map:mapTex(B.kind,B.col,B.bands)});
      mesh=new THREE.Mesh(new THREE.SphereGeometry(B.r,20,14),mat);
      if(B.ring){
        const rg=new THREE.Mesh(new THREE.RingGeometry(B.r*1.35,B.r*2.05,36),
          new THREE.MeshBasicMaterial({color:0xd8c092,side:THREE.DoubleSide,transparent:true,opacity:0.75}));
        rg.rotation.x=Math.PI/2-0.35; mesh.add(rg);
      }
    }
    grp.add(mesh);
    /* sfera invisibile più grande: facile da toccare */
    const hit=new THREE.Mesh(new THREE.SphereGeometry(Math.max(B.r*1.8,1.15),8,6),
      new THREE.MeshBasicMaterial({visible:false}));
    hit.userData.lvl=k; grp.add(hit); mapHits.push(hit);
    /* velocità di Keplero: ω = K / a^1.5 */
    const K=(B.parent<0)?MAPPA_KEP:MAPPA_KEP_CHILD;
    const w=(B.a>0)?K/Math.pow(B.a,1.5):0;
    mapBodies.push({B:B,grp:grp,mesh:mesh,th:Math.random()*Math.PI*2,w:w,orbitLine:null});
    /* anello dell'orbita */
    if(B.a>0){
      const seg=72, op=new Float32Array((seg+1)*3);
      for(let i=0;i<=seg;i++){
        const t=i/seg*Math.PI*2;
        const x=B.a*Math.cos(t), z0=B.a*Math.sin(t);
        op[i*3]=x; op[i*3+1]=z0*Math.sin(B.inc); op[i*3+2]=z0*Math.cos(B.inc);
      }
      const og=new THREE.BufferGeometry(); og.setAttribute('position',new THREE.BufferAttribute(op,3));
      const ol=new THREE.Line(og,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.16}));
      mapBodies[k].orbitLine=ol;
    }
  });
  /* aggiungi alla scena rispettando la gerarchia (figli dentro il genitore) */
  MAP_BODIES.forEach((B,k)=>{
    if(B.parent<0){ mapScene.add(mapBodies[k].grp); if(mapBodies[k].orbitLine) mapScene.add(mapBodies[k].orbitLine); }
    else { mapBodies[B.parent].grp.add(mapBodies[k].grp); if(mapBodies[k].orbitLine) mapBodies[B.parent].grp.add(mapBodies[k].orbitLine); }
  });
  /* la Base Lunare sta APPOGGIATA sulla Luna, non orbita */
  mapBodies[12].grp.position.set(0,MAP_BODIES[3].r+0.06,0);

  /* rotte di trasferimento (rete dei sentieri) */
  mapEdges=[];
  const SEGS=18;
  for(let a=0;a<EDGES.length;a++) for(const b of EDGES[a]) if(b>a){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((SEGS+1)*3),3));
    const m=new THREE.LineDashedMaterial({color:0xfff6dc,dashSize:0.8,gapSize:0.55,transparent:true,opacity:0.75});
    const line=new THREE.Line(g,m);
    mapScene.add(line);
    mapEdges.push({a:a,b:b,line:line,segs:SEGS});
  }

  /* segnaposto astronauta */
  mapMarker=emojiSprite('🧑‍🚀',2.4); mapScene.add(mapMarker);

  mapCam=new THREE.PerspectiveCamera(50,1,0.1,500);
  mapRay=new THREE.Raycaster();
  mapClock=new THREE.Clock();
}

/* ---- etichette HTML sopra il canvas ---- */
function mapLabelHTML(k){
  const i=LI(), t=THEMES[k], un=unlockedSet.has(k), earned=starsMap[k]||0;
  const pn=MAP_BODIES[k].nm[i];
  let h='<div class="pn">'+pn+'</div>';
  h+='<div class="tn">'+(k+1)+'. '+(un?t.emoji:'🔒')+' '+t.name[i]+'</div>';
  if(un){ let ss=''; for(let j=0;j<3;j++) ss+=(j<earned?'⭐':'☆'); h+='<div class="st">'+ss+'</div>'; }
  else h+='<div class="st">📖 '+((i===0)?'Letturina':'Story')+'</div>';
  return h;
}
function mapNodeAction(k){
  if(unlockedSet.has(k)) startLevel(k);
  else if(typeof openLetturina==='function') openLetturina(k);
}
function mapBuildDOM(){
  const wrap=$('mapWrap');
  wrap.innerHTML='';
  mapCv=document.createElement('canvas');
  mapCv.id='mapCanvas';
  wrap.appendChild(mapCv);
  mapLbls=document.createElement('div');
  mapLbls.id='mapLabels';
  wrap.appendChild(mapLbls);
  MAP_BODIES.forEach((B,k)=>{
    const d=document.createElement('div');
    d.className='mapLbl'; d.dataset.i=k;
    d.addEventListener('click',e=>{ e.stopPropagation(); mapNodeAction(k); });
    mapLbls.appendChild(d);
  });
  const legend=document.createElement('div');
  legend.className='mapLegend';
  legend.id='mapLegend';
  mapLbls.appendChild(legend);
  const hint=document.createElement('div');
  hint.className='mapHint'; hint.id='mapHint';
  mapLbls.appendChild(hint);
  const modeBtn=document.createElement('button');
  modeBtn.className='mapModeBtn'; modeBtn.id='mapModeBtn';
  modeBtn.addEventListener('click',e=>{ e.stopPropagation(); mapSetAligned(!mapAligned); });
  mapLbls.appendChild(modeBtn);

  /* mouse sopra la mappa → orbite quasi ferme (per touch: dopo ogni tocco) */
  wrap.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') mapPtrIn=true; });
  wrap.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') mapPtrIn=false; });
  wrap.addEventListener('pointerdown',()=>{ mapLastTouch=Date.now(); },true);
  wrap.addEventListener('pointermove',()=>{ mapLastTouch=Date.now(); },true);

  mapGL=new THREE.WebGLRenderer({canvas:mapCv,antialias:true});
  mapGL.setPixelRatio(Math.min(devicePixelRatio,2));
  mapResize();
  addEventListener('resize',mapResize);
  mapInput();
}
function mapResize(){
  if(!mapCv || !mapCv.isConnected) return;
  const wrap=$('mapWrap');
  const w=wrap.clientWidth||600;
  const h=wrap.clientHeight||Math.max(300,Math.min(w*0.72,innerHeight*0.62));
  mapLastW=w; mapLastH=h;
  mapGL.setSize(w,h,false);        /* il CSS tiene il canvas al 100%: qui solo la risoluzione */
  mapCam.aspect=w/h; mapCam.updateProjectionMatrix();
}

/* ---- input: trascina per ruotare, pizzica/rotella per zoom, tocco = scegli ---- */
function mapInput(){
  const ptrs=new Map();
  let downX=0,downY=0,downT=0,dragging=false,pinchD=0;
  mapCv.style.touchAction='none';
  mapCv.addEventListener('pointerdown',e=>{
    mapCv.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===1){ downX=e.clientX; downY=e.clientY; downT=Date.now(); dragging=false; }
    else if(ptrs.size===2){
      const a=[...ptrs.values()];
      pinchD=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);
    }
  });
  mapCv.addEventListener('pointermove',e=>{
    if(!ptrs.has(e.pointerId)) return;
    const prev=ptrs.get(e.pointerId);
    ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===1){
      const dx=e.clientX-prev[0], dy=e.clientY-prev[1];
      if(Math.hypot(e.clientX-downX,e.clientY-downY)>9) dragging=true;
      if(dragging){
        mapCamAuto=false;
        mapCamTheta-=dx*0.006;
        mapCamPhi=Math.min(1.42,Math.max(0.35,mapCamPhi-dy*0.005));
      }
    } else if(ptrs.size===2){
      const a=[...ptrs.values()];
      const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);
      if(pinchD>0){ mapCamAuto=false; mapCamR=Math.min(MAPPA_ZOOM_MAX,Math.max(MAPPA_ZOOM_MIN,mapCamR*pinchD/d)); }
      pinchD=d; dragging=true;
    }
  });
  const up=e=>{
    if(ptrs.has(e.pointerId)){
      ptrs.delete(e.pointerId);
      if(!dragging && Date.now()-downT<500 && ptrs.size===0) mapTap(e);
    }
    if(ptrs.size<2) pinchD=0;
  };
  mapCv.addEventListener('pointerup',up);
  mapCv.addEventListener('pointercancel',e=>ptrs.delete(e.pointerId));
  mapCv.addEventListener('wheel',e=>{
    e.preventDefault();
    mapCamAuto=false;
    mapCamR=Math.min(MAPPA_ZOOM_MAX,Math.max(MAPPA_ZOOM_MIN,mapCamR*(e.deltaY>0?1.1:0.9)));
  },{passive:false});
}
function mapTap(e){
  const r=mapCv.getBoundingClientRect();
  const nd=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -(((e.clientY-r.top)/r.height)*2-1));
  mapRay.setFromCamera(nd,mapCam);
  const hits=mapRay.intersectObjects(mapHits,false);
  if(hits.length) mapNodeAction(hits[0].object.userData.lvl);
}

/* ---- aggiornamento per-frame ---- */
const _mv=new THREE.Vector3(), _mv2=new THREE.Vector3(), _mc=new THREE.Vector3();
function mapWorldPos(k,out){ return mapBodies[k].grp.getWorldPosition(out); }
function mapFrame(){
  if($('menu').style.display==='none' || !mapCv || !mapCv.isConnected){ mapRunning=false; return; }
  requestAnimationFrame(mapFrame);
  const rdt=Math.min(mapClock.getDelta(),0.05);
  const et=mapClock.elapsedTime;

  /* se il menu è appena riapparso o la finestra è cambiata, adatta il canvas */
  const wrap=$('mapWrap');
  if(wrap.clientWidth!==mapLastW || wrap.clientHeight!==mapLastH) mapResize();

  /* rallentamento morbido quando il puntatore è sulla mappa (o subito dopo un tocco) */
  const slow=mapPtrIn || (Date.now()-mapLastTouch<MAPPA_TOUCH_SLOW_MS);
  mapSpeedF+=((slow?MAPPA_HOVER_SLOW:1)-mapSpeedF)*Math.min(1,rdt*4);
  const dt=rdt*MAPPA_TIME*mapSpeedF;

  /* orbite (Keplero) oppure allineamento dolce dei pianeti in fila */
  mapBodies.forEach((b,k)=>{
    if(b.B.a>0){
      if(mapAligned){
        const tgt=mapAlignAngle(k);
        let d=(tgt-b.th)%(Math.PI*2);
        if(d>Math.PI) d-=Math.PI*2; if(d<-Math.PI) d+=Math.PI*2;
        b.th+=d*Math.min(1,rdt*2.5);
      } else b.th+=b.w*dt;
      const x=b.B.a*Math.cos(b.th), z0=b.B.a*Math.sin(b.th);
      b.grp.position.set(x, z0*Math.sin(b.B.inc), z0*Math.cos(b.B.inc));
    }
    if(b.mesh.rotation) b.mesh.rotation.y+=0.35*rdt*MAPPA_TIME;
  });
  mapBelt.rotation.y+=0.02*dt;
  if(mapScene.userData.sun) mapScene.userData.sun.rotation.y+=0.1*rdt*MAPPA_TIME;

  /* camera orbitale; nella vista in fila si sposta da sola a inquadrare tutto */
  mapCenterX+=((mapAligned?MAPPA_ALIGN_CX:0)-mapCenterX)*Math.min(1,rdt*2);
  if(mapCamAuto){
    const tt=mapAligned?MAPPA_ALIGN_THETA:MAPPA_ORBIT_THETA;
    const tp=mapAligned?MAPPA_ALIGN_PHI:MAPPA_ORBIT_PHI;
    const tr=mapAligned?MAPPA_ALIGN_R:MAPPA_ZOOM_START;
    let dth=(tt-mapCamTheta)%(Math.PI*2);
    if(dth>Math.PI) dth-=Math.PI*2; if(dth<-Math.PI) dth+=Math.PI*2;
    const l=Math.min(1,rdt*2.5);
    mapCamTheta+=dth*l; mapCamPhi+=(tp-mapCamPhi)*l; mapCamR+=(tr-mapCamR)*l;
  }
  mapCam.position.set(
    mapCenterX+mapCamR*Math.sin(mapCamPhi)*Math.cos(mapCamTheta),
    mapCamR*Math.cos(mapCamPhi),
    mapCamR*Math.sin(mapCamPhi)*Math.sin(mapCamTheta));
  mapCam.lookAt(mapCenterX,0,0);

  /* rotte: curve aggiornate con i pianeti che si muovono */
  for(const ed of mapEdges){
    mapWorldPos(ed.a,_mv); mapWorldPos(ed.b,_mv2);
    const dist=_mv.distanceTo(_mv2);
    _mc.addVectors(_mv,_mv2).multiplyScalar(0.5); _mc.y+=dist*0.22;
    const attr=ed.line.geometry.attributes.position;
    for(let i=0;i<=ed.segs;i++){
      const t=i/ed.segs, u=1-t;
      attr.array[i*3]  =u*u*_mv.x+2*u*t*_mc.x+t*t*_mv2.x;
      attr.array[i*3+1]=u*u*_mv.y+2*u*t*_mc.y+t*t*_mv2.y;
      attr.array[i*3+2]=u*u*_mv.z+2*u*t*_mc.z+t*t*_mv2.z;
    }
    attr.needsUpdate=true;
    ed.line.computeLineDistances();
    const on=unlockedSet.has(ed.a)||unlockedSet.has(ed.b);
    ed.line.material.opacity=on?0.55+0.2*Math.sin(et*2):0.14;
  }

  /* segnaposto sopra l'ultimo livello giocato */
  let cur=0;
  try{ cur=parseInt(localStorage.getItem('gabri_last')||'0')||0; }catch(err){}
  if(cur>=MAP_BODIES.length || !unlockedSet.has(cur)) cur=0;
  mapWorldPos(cur,_mv);
  mapMarker.position.set(_mv.x,_mv.y+MAP_BODIES[cur].r+1.6+Math.sin(et*2.2)*0.25,_mv.z);

  /* etichette HTML proiettate */
  const r=mapCv.getBoundingClientRect();
  const halfH=r.height/2, tanF=Math.tan(mapCam.fov*Math.PI/360);
  for(const d of mapLbls.children){
    if(!d.classList.contains('mapLbl')) continue;
    const k=parseInt(d.dataset.i);
    mapWorldPos(k,_mv);
    const dist=_mv.distanceTo(mapCam.position);
    _mv2.copy(_mv).project(mapCam);
    if(_mv2.z>1){ d.style.display='none'; continue; }
    d.style.display='';
    const px=(_mv2.x*0.5+0.5)*r.width;
    const rPix=MAP_BODIES[k].r*halfH/(dist*tanF);
    const py0=(-_mv2.y*0.5+0.5)*r.height;
    /* più lontano = etichetta più piccola e leggera */
    const s=Math.max(0.62,Math.min(1,26/dist+0.55));
    /* nella vista in fila le etichette si sfalsano su righe sopra/sotto
       per non coprirsi a vicenda */
    const st=mapAligned?(MAP_STAG[k]||1):1;
    if(st>0){
      d.style.top=(py0+rPix+4+(st-1)*28*s)+'px';
      d.style.transform='translate(-50%,0) scale('+s+')';
      d.style.transformOrigin='top center';
    } else {
      d.style.top=(py0-rPix-4-(-st-1)*28*s)+'px';
      d.style.transform='translate(-50%,-100%) scale('+s+')';
      d.style.transformOrigin='bottom center';
    }
    d.style.left=px+'px';
    d.style.zIndex=Math.round(1000-dist*5);
  }

  mapGL.render(mapScene,mapCam);
}

/* ---- entry point: chiamata da showMenu() / reset / letturine ---- */
function buildMap(){
  const i=LI();
  if(!mapScene) mapBuildScene();
  if(!mapCv || !mapCv.isConnected) mapBuildDOM();
  /* stato di blocco: pianeti chiusi in grigio */
  mapBodies.forEach((b,k)=>{
    const un=unlockedSet.has(k);
    b.grp.traverse(o=>{
      if(o.isMesh && o.material && o.material.color && o.material.visible!==false)
        o.material.color.setHex(un?0xffffff:0x565660);
    });
  });
  /* testi (lingua, stelline) */
  for(const d of mapLbls.querySelectorAll('.mapLbl')){
    const k=parseInt(d.dataset.i);
    d.innerHTML=mapLabelHTML(k);
    d.classList.toggle('locked',!unlockedSet.has(k));
  }
  $('mapLegend').innerHTML=(i===0)
    ?'🪐 <b>Regno delle Scoperte</b>: i pianeti · 🛰️ <b>Regno dell\'Informatica</b>: le stazioni<br><span>Velocità vere di Keplero — distanze non in scala</span>'
    :'🪐 <b>Realm of Discoveries</b>: the planets · 🛰️ <b>Realm of Computing</b>: the stations<br><span>True Kepler speeds — distances not to scale</span>';
  $('mapHint').textContent=mapAligned
    ?((i===0)?'👆 Tocca un pianeta per giocare · 🤏 Pizzica o rotella per lo zoom':'👆 Tap a planet to play · 🤏 Pinch or wheel to zoom')
    :((i===0)?'👆 Trascina per ruotare · 🤏 Pizzica o rotella per lo zoom · 🐢 i pianeti rallentano quando li punti':'👆 Drag to rotate · 🤏 Pinch or wheel to zoom · 🐢 planets slow down when you point at them');
  $('mapModeBtn').textContent=mapAligned
    ?((i===0)?'🌀 Vedi le orbite':'🌀 See the orbits')
    :((i===0)?'📏 Pianeti in fila':'📏 Line up the planets');
  mapResize();
  if(!mapRunning){ mapRunning=true; mapClock.getDelta(); requestAnimationFrame(mapFrame); }
}
