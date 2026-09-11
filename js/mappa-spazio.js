/* ============================================================
   IL SISTEMA SOLARE — vista 3D scientificamente fedele (Three.js)

   Questo file fa due cose:
   1. definisce EDGES, la rete che collega i livelli del Labirinto
      (usata da gioco-labirinto.js: completare un livello sblocca i vicini);
   2. registra nel menu principale la voce "🪐 Il Sistema Solare":
      un planetario esplorabile, non un gioco. Toccando un corpo si apre
      la sua scheda con i dati veri e, da lì, il livello o la letturina.

   COSA È VERO (e cosa no)
   - Orbite: ellissi con l'eccentricità reale, il Sole in un FUOCO
     (1ª legge di Keplero). La velocità cambia lungo l'orbita: più veloce
     al perielio (2ª legge, equazione di Keplero risolta con Newton).
     Periodi dalla 3ª legge sui semiassi VERI in unità astronomiche.
   - Orientamento 3D vero: inclinazione i, nodo ascendente Ω e longitudine
     del perielio ϖ ai valori J2000. Perciò Plutone passa DENTRO l'orbita
     di Nettuno senza mai incontrarlo (i=17,1°).
   - Posizioni di partenza: longitudini medie J2000 avanzate fino a oggi,
     quindi all'apertura i pianeti stanno più o meno dove stanno davvero.
   - Rotazioni: periodi siderali veri, in rapporto esatto fra loro.
     L'inclinazione assiale reale fa il resto: Venere (177°) e Urano (98°)
     girano al contrario perché sono capovolti, non per un trucco.
     La Luna è in rotazione sincrona: mostra sempre la stessa faccia.
   - Anelli: nel piano equatoriale del pianeta, con i raggi veri in raggi
     planetari (Saturno: anello C 1,28 R → bordo di A 2,35 R, con la
     divisione di Cassini al posto giusto). Urano, Nettuno e Giove hanno
     i loro anelli tenui.
   - ISS: inclinazione 51,64° riferita all'EQUATORE terrestre, non
     all'eclittica. Il telescopio Webb sta in L2, sulla linea Sole-Terra
     dalla parte opposta al Sole.
   NON in scala: le DISTANZE (compresse ∝ AU^0.4) e i DIAMETRI
   (compressi ∝ km^0.42) — altrimenti i pianeti sarebbero puntini
   invisibili a distanze impossibili da inquadrare. L'ORDINE e i
   RAPPORTI qualitativi restano corretti. Anche i tempi sono scalati:
   le orbite e le rotazioni hanno due orologi diversi, perché con un
   solo orologio la Terra girerebbe 300 volte al secondo.
   ============================================================ */

/* ---- RETE DELLE ROTTE: completare un livello sblocca i vicini;
   i livelli chiusi si aprono anche con la Letturina 📖.
   Dalla Terra (2) si dirama: Luna (3), Marte (4) e ISS (10). ---- */
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

/* ================= COSTANTI DI TUNING =================
   Solo queste tre righe cambiano l'aspetto: i dati dei pianeti
   più sotto sono valori misurati e non vanno "aggiustati". */
const SS_DIST_K=12.5, SS_DIST_P=0.40;  /* raggio scena = K · (AU)^P  → la Terra sta a 12,5 */
const SS_SIZE_K=0.0240, SS_SIZE_P=0.42;/* raggio corpo  = K · (km)^P  → la Terra è 0,95 */
const SS_DPS=12;              /* giorni di orbita per secondo (anno terrestre ≈ 30 s) */
const SS_ROT_DPS=0.125;       /* giorni di rotazione per secondo (giorno terrestre ≈ 8 s) */
const SS_SAT_MIN=2.6, SS_SAT_MAX=26; /* i satelliti terrestri stanno in questa finestra di secondi/giro */
const SS_HOVER_SLOW=0.10;     /* col puntatore sulla mappa tutto quasi si ferma */
const SS_TOUCH_SLOW_MS=3000;
const SS_ZOOM_MIN=6, SS_ZOOM_MAX=190, SS_ZOOM_START=86;
/* vista "pianeti in fila": tutti alla longitudine 0, camera quasi dall'alto */
const SS_ALIGN_THETA=Math.PI/2, SS_ALIGN_PHI=0.48, SS_ALIGN_R=80, SS_ALIGN_CX=28;
const SS_ORBIT_THETA=0.9, SS_ORBIT_PHI=1.02;
/* righe delle etichette nella vista in fila (+ sotto, − sopra) */
const SS_STAG=[1,-1,-2,2,1,-1,1,-1,1,-1,-3,4,-4];
const SS_L2=3.4;              /* distanza scenica Terra→L2 (vera: 1,5 milioni di km) */
const SS_RAD=Math.PI/180;

/* ================= DATI VERI =================
   aAU/e/inc/node/peri/L0 : elementi orbitali all'epoca J2000
     (semiasse maggiore in unità astronomiche, eccentricità,
      inclinazione sull'eclittica, longitudine del nodo ascendente,
      longitudine del perielio ϖ, longitudine media a J2000)
   rot   : periodo di rotazione siderale in giorni
   tilt  : inclinazione dell'asse sull'orbita — oltre 90° = ruota al contrario
   rKm   : raggio equatoriale in km
   g     : gravità in superficie m/s²
   Fonti: NASA Planetary Fact Sheet / JPL Approximate Positions of the Planets. */
const SS_BODIES=[
 { nm:['Mercurio','Mercury'], em:'☄️', kind:'mercurio', col:'#8c8378',
   aAU:0.38710, e:0.20563, inc:7.005, node:48.331, peri:77.456, L0:252.251,
   rot:58.646, tilt:0.034, rKm:2439.7, g:3.70, moons:0,
   temp:['da −173 °C a +427 °C','−173 °C to +427 °C'],
   fact:['Un giorno su Mercurio dura 58 giorni terrestri, ma il suo anno solo 88: fa appena un giro e mezzo su se stesso ogni anno.',
         'A day on Mercury lasts 58 Earth days, its year only 88.'] },

 { nm:['Venere','Venus'], em:'🌕', kind:'venere', col:'#e6cf9e',
   aAU:0.72333, e:0.00677, inc:3.395, node:76.680, peri:131.533, L0:181.980,
   rot:243.025, tilt:177.36, rKm:6051.8, g:8.87, moons:0,
   temp:['+464 °C, sempre','+464 °C, always'],
   fact:['Venere è capovolta: il suo asse è inclinato di 177°, così gira al contrario e il Sole sorge a ovest. Un suo giorno (243 giorni) dura più del suo anno (225).',
         'Venus is upside down: it spins backwards and its day is longer than its year.'] },

 { nm:['Terra','Earth'], em:'🌍', kind:'terra', col:'#2b6cd4',
   aAU:1.00000, e:0.01671, inc:0.000, node:0.000, peri:102.937, L0:100.464,
   rot:0.99727, tilt:23.44, rKm:6371.0, g:9.81, moons:1,
   temp:['+15 °C in media','+15 °C on average'],
   fact:['L’asse della Terra è inclinato di 23,4°: è per questo che ci sono le stagioni, non perché ci avviciniamo al Sole.',
         'Earth’s axis is tilted 23.4°: that is what makes the seasons.'] },

 { nm:['Luna','Moon'], em:'🌙', kind:'luna', col:'#9a9a97',
   parent:2, aKm:384400, aScene:2.5, alignFan:90, e:0.0549, inc:5.145, node:0, peri:0, days:27.3217,
   rot:27.3217, sync:true, tilt:6.68, rKm:1737.4, g:1.62, moons:0,
   temp:['da −173 °C a +127 °C','−173 °C to +127 °C'],
   fact:['La Luna gira su se stessa nello stesso tempo in cui gira attorno alla Terra: per questo ci mostra sempre la stessa faccia.',
         'The Moon spins once per orbit, so it always shows us the same face.'] },

 { nm:['Marte','Mars'], em:'🔴', kind:'marte', col:'#b5502e',
   aAU:1.52371, e:0.09339, inc:1.850, node:49.558, peri:336.041, L0:355.433,
   rot:1.02595, tilt:25.19, rKm:3389.5, g:3.72, moons:2,
   temp:['−63 °C in media','−63 °C on average'],
   fact:['Su Marte c’è il canyon più lungo del sistema solare: Valles Marineris, 4000 km, profondo 7 km. Il Grand Canyon è 30 volte più corto.',
         'Mars has Valles Marineris: 4000 km long and 7 km deep.'] },

 { nm:['Giove','Jupiter'], em:'🟠', kind:'giove', col:'#c8a97e',
   aAU:5.20289, e:0.04839, inc:1.304, node:100.464, peri:14.728, L0:34.351,
   rot:0.41354, tilt:3.13, rKm:69911, g:24.79, moons:115,
   temp:['−108 °C sulle nuvole','−108 °C at the cloud tops'],
   fact:['La Grande Macchia Rossa è una tempesta più larga della Terra che gira da almeno 190 anni. Giove è anche il più veloce a ruotare: un giro in meno di 10 ore.',
         'The Great Red Spot is a storm wider than Earth, spinning for at least 190 years.'] },

 { nm:['Saturno','Saturn'], em:'🪐', kind:'saturno', col:'#d8c092', ring:'saturno',
   aAU:9.53667, e:0.05386, inc:2.486, node:113.666, peri:92.599, L0:50.077,
   rot:0.44401, tilt:26.73, rKm:58232, g:10.44, moons:292,
   temp:['−139 °C','−139 °C'],
   fact:['Gli anelli sono miliardi di pezzi di ghiaccio, larghi 280.000 km ma spessi poche decine di metri: come un foglio di carta grande come un campo da calcio.',
         'The rings are 280,000 km wide but only tens of metres thick.'] },

 { nm:['Urano','Uranus'], em:'🔵', kind:'urano', col:'#a8d8dc', ring:'urano',
   aAU:19.18916, e:0.04726, inc:0.773, node:74.006, peri:170.954, L0:314.055,
   rot:0.71833, tilt:97.77, rKm:25362, g:8.87, moons:28,
   temp:['−197 °C','−197 °C'],
   fact:['Urano è caduto su un fianco: il suo asse è inclinato di 98°, quindi rotola lungo l’orbita. Ogni polo passa 42 anni al buio.',
         'Uranus rolls on its side: each pole gets 42 years of darkness.'] },

 { nm:['Nettuno','Neptune'], em:'🔷', kind:'nettuno', col:'#3457c8', ring:'nettuno',
   aAU:30.06992, e:0.00859, inc:1.770, node:131.784, peri:44.964, L0:304.349,
   rot:0.67125, tilt:28.32, rKm:24622, g:11.15, moons:16,
   temp:['−201 °C','−201 °C'],
   fact:['Nettuno ha i venti più forti del sistema solare: 2000 km/h. È stato trovato con la matematica prima che col telescopio.',
         'Neptune has the fastest winds: 2000 km/h. It was found with maths first.'] },

 { nm:['Plutone','Pluto'], em:'🤍', kind:'plutone', col:'#c7ab8c',
   aAU:39.48211, e:0.24883, inc:17.140, node:110.299, peri:224.068, L0:238.929,
   rot:6.3872, tilt:122.53, rKm:1188.3, g:0.62, moons:5,
   temp:['−229 °C','−229 °C'],
   fact:['L’orbita di Plutone è così schiacciata che a volte passa dentro quella di Nettuno. Non si scontrano perché Plutone viaggia 17° più in alto.',
         'Pluto’s orbit dips inside Neptune’s, but it travels 17° higher.'] },

 { nm:['ISS','ISS'], em:'🛰️', kind:'iss', col:'#a7c5eb',
   parent:2, aKm:6786, aScene:1.25, alignFan:-90, e:0.0003, inc:51.64, node:0, peri:0, days:0.06436, equator:true,
   rot:0.06436, sync:true, tilt:0, rKm:0, g:0, moons:0,
   temp:['da −157 °C a +121 °C','−157 °C to +121 °C'],
   fact:['La Stazione Spaziale corre a 7,7 km al secondo e fa un giro della Terra in 90 minuti: gli astronauti vedono 16 albe al giorno.',
         'The Station flies at 7.7 km/s and orbits Earth in 90 minutes.'] },

 { nm:['Telescopio Webb','Webb Telescope'], em:'🔭', kind:'jwst', col:'#e1c579',
   parent:2, l2:true, days:182, rot:182, tilt:0, rKm:0, g:0, moons:0,
   temp:['−233 °C allo specchio','−233 °C at the mirror'],
   fact:['Il telescopio Webb sta in L2, a 1,5 milioni di km dalla Terra dalla parte opposta al Sole: il suo scudo grande come un campo da tennis lo tiene al freddo.',
         'Webb sits at L2, 1.5 million km from Earth, opposite the Sun.'] },

 { nm:['Base Lunare','Moon Base'], em:'🏠', kind:'base', col:'#c2cedc',
   parent:3, surface:true, lat:-80, rot:0, tilt:0, rKm:0, g:1.62, moons:0,
   temp:['−230 °C nei crateri in ombra','−230 °C in the shadowed craters'],
   fact:['Le basi si costruiranno al polo sud della Luna: in fondo ai crateri sempre in ombra c’è ghiaccio d’acqua da 2 miliardi di anni.',
         'Bases will be built at the lunar south pole, where crater ice has sat for 2 billion years.'] }
];

/* ---- geometria delle orbite: dai dati veri ai numeri della scena ---- */
function ssDistScene(aAU){ return SS_DIST_K*Math.pow(aAU,SS_DIST_P); }
function ssSizeScene(rKm){ return SS_SIZE_K*Math.pow(rKm,SS_SIZE_P); }
/* giorni trascorsi dall'epoca J2000 (1 gennaio 2000, 12:00 TT) */
function ssDaysSinceJ2000(){ return (Date.now()-Date.UTC(2000,0,1,12,0,0))/86400000; }

/* ---- equazione di Keplero: M → E (Newton) → ν (anomalia vera) ---- */
function ssSolveE(M,e){
  let E=M+e*Math.sin(M);                 /* primo tentativo: già molto vicino */
  for(let i=0;i<8;i++){
    const d=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
    E-=d;
    if(Math.abs(d)<1e-12) break;
  }
  return E;
}
function ssNuFromE(E,e){ return Math.atan2(Math.sqrt(1-e*e)*Math.sin(E),Math.cos(E)-e); }
function ssMFromNu(nu,e){
  const E=Math.atan2(Math.sqrt(1-e*e)*Math.sin(nu),e+Math.cos(nu));
  return E-e*Math.sin(E);
}
/* posizione sull'orbita: piano orbitale → rotazioni ω, i, Ω.
   Nella scena il piano dell'eclittica è il piano xz, l'asse y punta a nord. */
function ssOrbitPos(o,M,out){
  const e=o.e, E=ssSolveE(M,e), nu=ssNuFromE(E,e);
  const r=o.aS*(1-e*Math.cos(E));        /* 2ª legge: r piccolo = veloce */
  const u=o.wRad+nu;
  const cO=Math.cos(o.nodeRad), sO=Math.sin(o.nodeRad);
  const cu=Math.cos(u), su=Math.sin(u);
  const ci=Math.cos(o.incRad), si=Math.sin(o.incRad);
  out.set(r*(cO*cu-sO*su*ci), r*su*si, r*(sO*cu+cO*su*ci));
  return out;
}
/* la vista "in fila" porta ogni corpo alla longitudine eliocentrica 0,
   cioè all'anomalia vera ν = −ϖ */
function ssAlignM(o){ return ssMFromNu(-o.periRad,o.e); }

/* ---- stato del modulo ---- */
let ssGL=null, ssScene=null, ssCam=null, ssCv=null, ssLbls=null, ssWrap=null;
let ssB=[], ssEdges=[], ssBelt=null, ssMarker=null, ssRunning=false, ssOn=false, ssFrameAt=0;
let ssCamTheta=SS_ORBIT_THETA, ssCamPhi=SS_ORBIT_PHI, ssCamR=SS_ZOOM_START;
let ssClock=null, ssRay=null, ssHits=[];
let ssSpeedF=1, ssPtrIn=false, ssLastTouch=0, ssLastW=0, ssLastH=0;
let ssAligned=false, ssCamAuto=true, ssCenterX=0, ssCardLvl=-1;
let ssCenterY=0, ssCenterZ=0, ssPaused=false;
try{ ssAligned=(localStorage.getItem('gabri_mapview')==='fila'); }catch(e){}

/* ============================================================
   TEXTURE PROCEDURALI
   Mappe equirettangolari 1024×512, disegnate in coordinate 512×256: la x è la longitudine
   (−180°→+180°), la y è la latitudine (+90° in alto).
   Ogni macchia che disegniamo sta dove sta davvero.
   ============================================================ */
const SS_TW=512, SS_TH=256;
function ssX(lon){ return (lon+180)/360*SS_TW; }
function ssY(lat){ return (90-lat)/180*SS_TH; }
function ssCanvas(base){
  const cv=document.createElement('canvas'); cv.width=SS_TW*2; cv.height=SS_TH*2;
  const c=cv.getContext('2d'); c.scale(2,2); c.fillStyle=base; c.fillRect(0,0,SS_TW,SS_TH);
  return c;
}
function ssPoly(c,pts,fill){
  c.beginPath();
  pts.forEach((p,i)=>{ const x=ssX(p[0]), y=ssY(p[1]); i?c.lineTo(x,y):c.moveTo(x,y); });
  c.closePath(); c.fillStyle=fill; c.fill();
}
function ssBlob(c,lon,lat,rx,ry,fill,rotDeg){
  c.save(); c.translate(ssX(lon),ssY(lat)); if(rotDeg) c.rotate(rotDeg*SS_RAD);
  c.beginPath(); c.ellipse(0,0,rx,ry,0,0,Math.PI*2); c.fillStyle=fill; c.fill(); c.restore();
}
/* crateri: fondo scuro + bordo illuminato, come si vedono davvero */
function ssCraters(c,n,minR,maxR,dark,light){
  for(let i=0;i<n;i++){
    const x=Math.random()*SS_TW, y=Math.random()*SS_TH, r=minR+Math.random()*(maxR-minR);
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2);
    c.fillStyle='rgba('+dark+','+(0.10+Math.random()*0.18)+')'; c.fill();
    c.beginPath(); c.arc(x-r*0.16,y-r*0.16,r*0.86,0,Math.PI*2);
    c.strokeStyle='rgba('+light+','+(0.10+Math.random()*0.14)+')'; c.lineWidth=Math.max(1,r*0.22); c.stroke();
  }
}
/* fasce zonali dei giganti gassosi: zone chiare e bande scure alternate,
   con i bordi turbolenti (le vere fasce non hanno margini netti) */
function ssBands(c,list){
  list.forEach(b=>{
    const y0=ssY(b[0]), y1=ssY(b[1]);
    c.beginPath();
    for(let x=0;x<=SS_TW;x+=2){
      const wave=Math.sin(x/SS_TW*Math.PI*12+y0)*2+Math.sin(x/SS_TW*Math.PI*26)*0.8;
      x?c.lineTo(x,y0+wave):c.moveTo(x,y0+wave);
    }
    c.lineTo(SS_TW,y1+4); c.lineTo(0,y1+4); c.closePath(); c.fillStyle=b[2]; c.fill();
  });
  for(let i=0;i<260;i++){ /* turbolenza sui bordi */
    const y=Math.random()*SS_TH, w=12+Math.random()*70, h=1+Math.random()*3;
    c.fillStyle='rgba(255,255,255,'+(0.02+Math.random()*0.05)+')';
    c.fillRect(Math.random()*SS_TW,y,w,h);
    c.fillStyle='rgba(90,60,35,'+(0.02+Math.random()*0.05)+')';
    c.fillRect(Math.random()*SS_TW,y+2,w*0.7,h);
  }
}
function ssTex(kind){
  let c;
  if(kind==='mercurio'){
    c=ssCanvas('#8c8378');
    ssCraters(c,220,1.5,9,'25,20,16','255,248,235');
    /* bacino Caloris: 1550 km, a 30°N 190°E, il più grande impatto di Mercurio */
    ssBlob(c,-170,30,34,26,'rgba(214,205,190,.5)');
    ssCraters(c,40,1,4,'25,20,16','255,248,235');
  }
  else if(kind==='venere'){
    c=ssCanvas('#e3c88f');
    /* nuvole di acido solforico: girano in 4 giorni, molto più veloci del pianeta */
    for(let i=0;i<170;i++){
      const lat=(Math.random()*2-1)*85, lon=Math.random()*360-180;
      ssBlob(c,lon,lat,26+Math.random()*54,4+Math.random()*8,
        'rgba(255,248,225,'+(0.10+Math.random()*0.22)+')', -lat*0.35);
    }
    ssBlob(c,0,90,SS_TW,16,'rgba(255,252,238,.55)');
    ssBlob(c,0,-90,SS_TW,16,'rgba(255,252,238,.55)');
  }
  else if(kind==='terra'){
    c=ssCanvas('#17509e');
    const land='#3f8b3c', dry='#8a9c50', ice='rgba(255,255,255,.94)';
    ssPoly(c,[[-17,15],[10,34],[32,31],[43,12],[51,12],[42,-2],[40,-15],[32,-27],[25,-34],[18,-34],[12,-6],[9,4],[-8,4]],land);
    ssPoly(c,[[-10,36],[0,44],[12,45],[28,41],[30,46],[40,48],[40,60],[28,70],[10,58],[5,53],[-5,48],[-10,43]],land);
    ssPoly(c,[[30,46],[45,40],[48,30],[58,25],[68,24],[78,8],[88,22],[97,8],[105,10],[110,20],[122,31],[127,42],[135,45],[142,54],[160,60],[180,66],[170,70],[140,73],[110,76],[80,74],[60,70],[50,68],[40,66],[40,50]],land);
    ssPoly(c,[[-168,66],[-160,58],[-150,60],[-135,55],[-124,48],[-120,35],[-110,24],[-97,18],[-83,10],[-80,25],[-75,35],[-65,45],[-55,50],[-60,58],[-70,62],[-85,70],[-100,72],[-125,70],[-140,70]],land);
    ssPoly(c,[[-80,8],[-70,10],[-60,5],[-50,0],[-35,-6],[-38,-22],[-48,-33],[-58,-40],[-65,-50],[-70,-55],[-73,-45],[-72,-30],[-70,-18],[-78,-5]],land);
    ssPoly(c,[[114,-22],[130,-12],[142,-11],[150,-22],[153,-28],[147,-38],[135,-35],[118,-35]],dry);
    ssPoly(c,[[-45,60],[-20,70],[-25,82],[-50,82],[-58,70]],ice);
    /* deserti: Sahara e Arabia sono la fascia chiara più visibile dallo spazio */
    ssBlob(c,10,22,74,20,'rgba(214,192,130,.75)');
    ssBlob(c,45,22,22,12,'rgba(214,192,130,.7)');
    c.fillStyle=ice; c.fillRect(0,ssY(-63),SS_TW,SS_TH-ssY(-63)); /* Antartide */
    c.fillRect(0,0,SS_TW,ssY(80));                                 /* banchi polari */
    /* Le nubi sono sul guscio separato ssClouds, non dipinte sui continenti. */
  }
  else if(kind==='luna'){
    c=ssCanvas('#9c9a95');
    /* i mari sono sulla faccia rivolta a noi: pianure di lava, più scure */
    [[-16,35,44,26],[-23,18,26,18],[23,8,30,20],[-59,-3,20,16],[-43,-13,17,13],[-25,-18,15,11],[58,17,22,18]]
      .forEach(m=>ssBlob(c,m[0],m[1],m[2],m[3],'rgba(78,78,84,.72)'));
    ssCraters(c,190,1.5,8,'40,38,36','255,255,250');
    /* Tycho con i suoi raggi chiari, il cratere più riconoscibile */
    ssBlob(c,-11,-43,7,6,'rgba(240,240,235,.85)');
    c.strokeStyle='rgba(240,240,235,.28)'; c.lineWidth=2;
    for(let i=0;i<16;i++){
      const a=i/16*Math.PI*2;
      c.beginPath(); c.moveTo(ssX(-11),ssY(-43));
      c.lineTo(ssX(-11)+Math.cos(a)*60,ssY(-43)+Math.sin(a)*40); c.stroke();
    }
  }
  else if(kind==='marte'){
    c=ssCanvas('#b25630');
    for(let i=0;i<120;i++)
      ssBlob(c,Math.random()*360-180,(Math.random()*2-1)*80,14+Math.random()*40,7+Math.random()*16,
        'rgba(150,74,42,'+(0.10+Math.random()*0.2)+')');
    /* Syrtis Major: la macchia scura vista già nel 1659 */
    ssBlob(c,70,8,26,22,'rgba(104,64,44,.75)');
    /* Valles Marineris: 4000 km lungo l'equatore, da 90°O a 40°O */
    c.save(); c.beginPath();
    c.moveTo(ssX(-95),ssY(-8)); c.lineTo(ssX(-40),ssY(-13)); c.lineTo(ssX(-40),ssY(-19)); c.lineTo(ssX(-95),ssY(-13));
    c.closePath(); c.fillStyle='rgba(84,42,26,.85)'; c.fill(); c.restore();
    /* i tre vulcani Tharsis + Olympus Mons, 22 km di altezza */
    [[-134,18,7],[-112,12,5],[-104,4,5],[-120,-2,5]].forEach(v=>
      ssBlob(c,v[0],v[1],v[2],v[2]*0.85,'rgba(212,150,110,.6)'));
    /* calotte polari di ghiaccio d'acqua e anidride carbonica */
    c.fillStyle='rgba(255,255,255,.92)'; c.fillRect(0,0,SS_TW,ssY(78));
    c.fillRect(0,ssY(-80),SS_TW,SS_TH-ssY(-80));
    ssBlob(c,0,80,90,7,'rgba(255,255,255,.6)');
  }
  else if(kind==='giove'){
    c=ssCanvas('#c8a97e');
    ssBands(c,[[90,62,'#d8c9b2'],[62,42,'#a9825b'],[42,28,'#e4d6bd'],[28,18,'#9c6f4a'],
               [18,8,'#efe3cb'],[8,-8,'#c99f6f'],[-8,-18,'#f0e5cd'],[-18,-32,'#a06a45'],
               [-32,-46,'#dccdb4'],[-46,-64,'#9d7a58'],[-64,-90,'#cfc0a8']]);
    /* Grande Macchia Rossa: 22° sud, larga più della Terra, gira in senso antiorario */
    ssBlob(c,-70,-22,42,17,'rgba(196,96,62,.9)');
    ssBlob(c,-70,-22,32,12,'rgba(214,124,84,.85)');
    ssBlob(c,-70,-22,17,6,'rgba(232,168,132,.7)');
    /* le "perle bianche", tempeste ovali della fascia sud */
    [[40,-34],[95,-33],[150,-35]].forEach(p=>ssBlob(c,p[0],p[1],13,6,'rgba(255,252,240,.8)'));
  }
  else if(kind==='saturno'){
    c=ssCanvas('#d8c092');
    ssBands(c,[[90,70,'#c9b489'],[70,50,'#e0cda0'],[50,30,'#cdb387'],[30,10,'#e8d8ae'],
               [10,-10,'#dcc79b'],[-10,-30,'#e6d5aa'],[-30,-55,'#cdb689'],[-55,-90,'#bfa87e']]);
    /* l'esagono del polo nord: una corrente a getto a sei lati, larga 30.000 km */
    c.save(); c.beginPath();
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2, x=ssX(0)+Math.cos(a)*90, y=ssY(84)+Math.sin(a)*10;
      i?c.lineTo(x,y):c.moveTo(x,y);
    }
    c.closePath(); c.strokeStyle='rgba(150,128,90,.55)'; c.lineWidth=3; c.stroke(); c.restore();
  }
  else if(kind==='urano'){
    c=ssCanvas('#a8d8dc');
    /* Urano è quasi senza dettagli: solo bande tenuissime di metano */
    for(let i=0;i<9;i++)
      ssBlob(c,0,80-i*20,SS_TW,7,'rgba(255,255,255,'+(0.03+Math.random()*0.05)+')');
    ssBlob(c,0,60,SS_TW*0.7,14,'rgba(226,250,250,.18)');
  }
  else if(kind==='nettuno'){
    c=ssCanvas('#3457c8');
    for(let i=0;i<10;i++)
      ssBlob(c,0,80-i*18,SS_TW,8,'rgba(120,160,240,'+(0.06+Math.random()*0.1)+')');
    /* Grande Macchia Scura e le nuvole bianche di metano ad alta quota */
    ssBlob(c,-30,-22,40,17,'rgba(24,44,120,.8)');
    [[-60,-30],[40,26],[100,-18],[150,34]].forEach(p=>
      ssBlob(c,p[0],p[1],26,6,'rgba(255,255,255,.4)'));
  }
  else if(kind==='plutone'){
    c=ssCanvas('#bfa588');
    /* Cthulhu Macula: la fascia scura di tolina lungo l'equatore */
    ssBlob(c,-100,0,110,22,'rgba(88,60,48,.8)');
    ssCraters(c,90,1,6,'70,50,38','255,246,228');
    /* Sputnik Planitia: il "cuore" di ghiaccio d'azoto, 1000 km */
    c.save(); c.translate(ssX(-175),ssY(6)); c.fillStyle='rgba(248,240,222,.95)';
    c.beginPath(); c.ellipse(-17,-4,22,26,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(15,2,24,30,0,0,Math.PI*2); c.fill();
    c.restore();
  }
  else c=ssCanvas('#999999');
  ssTextureDetail(c,kind);
  const t=new THREE.CanvasTexture(c.canvas);
  t.anisotropy=4;
  return t;
}
/* Grana delle superfici e filamenti delle nubi, generati una sola volta. */
function ssTextureDetail(c,kind){
  const w=c.canvas.width, h=c.canvas.height, pixels=c.getImageData(0,0,w,h);
  const gas=['giove','saturno','venere','urano','nettuno'].includes(kind);
  for(let p=0;p<pixels.data.length;p+=4){
    const x=(p/4)%w, y=Math.floor(p/4/w), u=x/w*Math.PI*2;
    const flow=Math.sin(u*7+Math.sin(y*0.026)*4)+Math.sin(u*19-y*0.043)*0.4;
    const grain=Math.sin(x*127.1+y*311.7)*43758.5453;
    const n=grain-Math.floor(grain)-0.5;
    const detail=gas?Math.sin(y*0.55+flow*2)*5+flow*3+n*3:
      Math.sin(u*23+Math.sin(y*0.06)*3)*Math.cos(y*0.14)*7+n*12;
    const strength=kind==='urano'?0.22:1;
    for(let j=0;j<3;j++) pixels.data[p+j]+=detail*strength;
  }
  c.putImageData(pixels,0,0);
}
function ssSoftDisc(){
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const c=cv.getContext('2d'), g=c.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.16,'rgba(255,255,255,.9)');
  g.addColorStop(0.45,'rgba(255,255,255,.18)'); g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g; c.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(cv);
}
function ssAtmosphere(r,color){
  return new THREE.Mesh(new THREE.SphereGeometry(r*1.035,48,32),new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color(color)}}, transparent:true, depthWrite:false,
    blending:THREE.AdditiveBlending,
    vertexShader:'varying vec3 n; varying vec3 v; varying vec3 lightDir; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal); v=-p.xyz; lightDir=(viewMatrix*vec4(0.0,0.0,0.0,1.0)).xyz-p.xyz; gl_Position=projectionMatrix*p; }',
    fragmentShader:'uniform vec3 tint; varying vec3 n; varying vec3 v; varying vec3 lightDir; void main(){ float rim=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),3.0); float day=smoothstep(-0.3,0.7,dot(normalize(n),normalize(lightDir))); gl_FragColor=vec4(tint,rim*(0.12+day*0.65)); }'
  }));
}
function ssClouds(r){
  const c=ssCanvas('rgba(0,0,0,0)');
  for(let i=0;i<180;i++){
    const lon=Math.random()*360-180, lat=(Math.random()*2-1)*72;
    for(let j=0;j<5;j++) ssBlob(c,lon+j*3,lat+Math.sin(j*0.7)*3,9-j,0.7+j*0.3,'rgba(255,255,255,.16)',lat*0.4);
  }
  return new THREE.Mesh(new THREE.SphereGeometry(r*1.014,64,40),new THREE.MeshLambertMaterial({
    map:new THREE.CanvasTexture(c.canvas),transparent:true,depthWrite:false,opacity:0.85
  }));
}
/* Sole: granulazione della fotosfera + macchie */
function ssSunTex(){
  const c=ssCanvas('#ffc34c');
  for(let i=0;i<12000;i++){
    c.fillStyle=i%3?'rgba(255,242,166,.24)':'rgba(196,74,13,.12)';
    c.beginPath(); c.arc(Math.random()*SS_TW,Math.random()*SS_TH,0.3+Math.random()*1.5,0,Math.PI*2); c.fill();
  }
  for(let i=0;i<12;i++){
    const x=Math.random()*SS_TW, y=SS_TH*(0.3+Math.random()*0.4);
    c.fillStyle='rgba(158,71,16,.35)';
    c.beginPath(); c.ellipse(x,y,1+Math.random()*2,0.8,0,0,Math.PI*2); c.fill();
  }
  return new THREE.CanvasTexture(c.canvas);
}
/* ---- anelli: la texture è RADIALE (u = distanza dal pianeta) ----
   Saturno, distanze vere dal centro (R = 58.232 km):
     anello C   74.700–92.000 km   =  1,28–1,58 R   tenue
     anello B   92.000–117.580     =  1,58–2,02 R   il più brillante
     Cassini   117.580–122.170     =  2,02–2,10 R   la divisione, 4590 km
     anello A  122.170–136.775     =  2,10–2,35 R
       divisione di Encke a 133.589 km = 2,29 R (325 km)
       divisione di Keeler a 136.505 km = 2,34 R (35 km)
   Le posizioni nella texture (colonna "t") sono calcolate da questi numeri. */
const SS_RING={
  saturno:{ in:1.282, out:2.348, tex:[
    [0.000,0.280,'rgba(190,170,140,.30)'], /* C, semitrasparente */
    [0.280,0.400,'rgba(226,210,176,.75)'], /* B interno */
    [0.400,0.690,'rgba(244,232,200,.97)'], /* B esterno: il più opaco */
    [0.690,0.765,'rgba(120,110,95,.10)'],  /* divisione di Cassini */
    [0.765,0.945,'rgba(228,212,178,.80)'], /* A */
    [0.945,0.953,'rgba(120,110,95,.10)'],  /* divisione di Encke */
    [0.953,0.995,'rgba(222,206,172,.72)'], /* A esterno */
    [0.995,1.000,'rgba(120,110,95,.12)'] ]},/* divisione di Keeler */
  urano:{ in:1.6, out:2.02, tex:[         /* 9 anelli stretti e scurissimi */
    [0.00,0.55,'rgba(140,170,180,.05)'],
    [0.55,0.60,'rgba(190,215,225,.35)'],
    [0.60,0.90,'rgba(140,170,180,.05)'],
    [0.90,1.00,'rgba(200,225,235,.45)'] ]},/* anello ε, il più largo: 20-96 km */
  nettuno:{ in:1.7, out:2.56, tex:[
    [0.00,0.30,'rgba(150,170,220,.05)'],
    [0.30,0.36,'rgba(180,200,240,.20)'],
    [0.36,0.94,'rgba(150,170,220,.04)'],
    [0.94,1.00,'rgba(190,210,245,.28)'] ]} /* anello Adams, con i suoi archi */
};
function ssRingTex(spec){
  const cv=document.createElement('canvas'); cv.width=512; cv.height=8;
  const c=cv.getContext('2d');
  spec.tex.forEach(s=>{ c.fillStyle=s[2]; c.fillRect(s[0]*512,0,(s[1]-s[0])*512+1,8); });
  c.save(); c.globalCompositeOperation='source-atop';
  for(let i=0;i<280;i++){
    c.fillStyle=i%3?'rgba(60,44,24,.18)':'rgba(255,245,217,.22)';
    c.fillRect(Math.random()*512,0,0.35+Math.random()*0.65,8);
  }
  c.restore();
  for(let i=0;i<900;i++){ /* miliardi di frammenti: un po' di grana */
    c.fillStyle='rgba(255,250,235,'+(Math.random()*0.12)+')';
    c.fillRect(Math.random()*512,Math.random()*8,1,1);
  }
  return new THREE.CanvasTexture(cv);
}
function ssMakeRing(rS,spec){
  const geo=new THREE.RingGeometry(rS*spec.in,rS*spec.out,128,1);
  /* RingGeometry dà UV quadrate: le rifacciamo radiali, così la texture
     segue la distanza dal pianeta e le divisioni cadono al posto giusto */
  const pos=geo.attributes.position, uv=geo.attributes.uv;
  const r0=rS*spec.in, r1=rS*spec.out;
  for(let i=0;i<pos.count;i++){
    const r=Math.hypot(pos.getX(i),pos.getY(i));
    uv.setXY(i,(r-r0)/(r1-r0),0.5);
  }
  uv.needsUpdate=true;
  const m=new THREE.MeshBasicMaterial({map:ssRingTex(spec),side:THREE.DoubleSide,transparent:true,depthWrite:false});
  /* Ombra del globo sugli anelli: intersezione del raggio diretto al Sole.
     La formula usa coordinate mondiali, quindi segue orbita e asse inclinato. */
  m.onBeforeCompile=shader=>{
    shader.uniforms.planetRadius={value:rS};
    shader.vertexShader='varying vec3 ringWorld; varying vec3 ringCenter;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n ringWorld=(modelMatrix*vec4(position,1.0)).xyz; ringCenter=(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;');
    shader.fragmentShader='uniform float planetRadius; varying vec3 ringWorld; varying vec3 ringCenter;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',
      'vec3 ray=normalize(-ringWorld); vec3 oc=ringWorld-ringCenter; float along=-dot(oc,ray); float miss=length(oc+ray*max(along,0.0)); float shade=along>0.0?smoothstep(planetRadius*0.97,planetRadius*1.025,miss):1.0; gl_FragColor.rgb*=0.19+0.81*shade;\n#include <dithering_fragment>');
  };
  const mesh=new THREE.Mesh(geo,m);
  mesh.rotation.x=Math.PI/2;   /* l'anello sta nel piano equatoriale */
  return mesh;
}

/* ============================================================
   MODELLI DELLE STAZIONI
   ============================================================ */
function ssMat(col,emis){ return new THREE.MeshLambertMaterial(emis?{color:col,emissive:emis}:{color:col}); }
function ssMakeISS(){
  /* traliccio lungo 109 m con quattro coppie di pannelli solari
     e i moduli abitati al centro, come la vera ISS */
  const g=new THREE.Group();
  const white=ssMat(0xe8ecf2), blue=ssMat(0x1f3f9e), gold=ssMat(0xb9932f);
  const truss=new THREE.Mesh(new THREE.BoxGeometry(0.86,0.025,0.025),ssMat(0xb9bfc9)); g.add(truss);
  for(const s of [-1,1]){
    const mod=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.20,10),white);
    mod.rotation.z=Math.PI/2; mod.position.x=s*0.09; g.add(mod);
    for(const y of [-1,1]){
      const p=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.006,0.10),blue);
      p.position.set(s*0.34,0,y*0.075); g.add(p);
      const p2=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.006,0.10),blue);
      p2.position.set(s*0.52,0,y*0.075); g.add(p2);
    }
    const rad=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.005,0.13),ssMat(0xdfe4ec));
    rad.position.set(s*0.22,-0.06,0); g.add(rad);
  }
  const lab=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.24,10),gold);
  lab.rotation.x=Math.PI/2; g.add(lab);
  return g;
}
function ssMakeJWST(){
  /* 18 specchi esagonali dorati (6,5 m in tutto) sopra uno scudo
     termico a 5 strati grande come un campo da tennis */
  const g=new THREE.Group();
  const gold=ssMat(0xd9a520,0x4a3300);
  const hex=new THREE.CylinderGeometry(0.055,0.055,0.012,6);
  const step=0.096, rows=[[-2,3],[-2,4],[-3,4],[-2,4],[-2,3]];
  let ring=0;
  rows.forEach((rr,ri)=>{
    for(let i=rr[0];i<rr[1];i++){
      if(ri===2&&i===0) continue;             /* il buco centrale della struttura */
      const m=new THREE.Mesh(hex,gold);
      m.position.set(i*step+((ri%2)?step/2:0),0.10,(ri-2)*step*0.87);
      m.rotation.y=Math.PI/6; g.add(m); ring++;
    }
  });
  for(let s=0;s<5;s++){                        /* i cinque strati dello scudo */
    const sh=new THREE.Mesh(new THREE.BoxGeometry(0.62-s*0.03,0.004,0.42-s*0.02),
      new THREE.MeshLambertMaterial({color:0xc8b4e8,transparent:true,opacity:0.55}));
    sh.position.y=-0.05-s*0.022; sh.rotation.z=0.04*(s-2); g.add(sh);
  }
  const bus=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.05,0.12),ssMat(0x9aa3b4));
  bus.position.y=-0.17; g.add(bus);
  return g;
}
function ssMakeBase(){
  /* base al polo sud lunare: cupola abitativa, lander, rover, antenna */
  const g=new THREE.Group();
  const dome=new THREE.Mesh(new THREE.SphereGeometry(0.10,14,9,0,Math.PI*2,0,Math.PI/2),ssMat(0xdde4ee));
  g.add(dome);
  const dome2=new THREE.Mesh(new THREE.SphereGeometry(0.06,12,8,0,Math.PI*2,0,Math.PI/2),ssMat(0xc9d3e4));
  dome2.position.set(0.13,0,0.03); g.add(dome2);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.11,6),ssMat(0xb6c0d2));
  tube.rotation.z=Math.PI/2; tube.position.set(0.065,0.02,0.03); g.add(tube);
  const rover=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.03,0.045),ssMat(0x8f9bad));
  rover.position.set(-0.14,0.02,-0.02); g.add(rover);
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.16,5),ssMat(0xcfd6e4));
  ant.position.set(-0.05,0.08,0.09); g.add(ant);
  const dish=new THREE.Mesh(new THREE.SphereGeometry(0.035,10,6,0,Math.PI*2,0,Math.PI/2),ssMat(0xeef2f8));
  dish.position.set(-0.05,0.16,0.09); dish.rotation.x=-0.9; g.add(dish);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.005,0.07),ssMat(0x24408f));
  panel.position.set(0.02,0.035,-0.14); panel.rotation.x=-0.35; g.add(panel);
  return g;
}

/* ============================================================
   PREPARAZIONE DEI DATI: dai valori misurati ai numeri della scena.
   Si fa una volta sola; SS_BODIES resta intatto.
   ============================================================ */
let ssPrepared=null;
function ssPrep(){
  if(ssPrepared) return ssPrepared;
  const days=ssDaysSinceJ2000();
  /* finestra dei periodi dei satelliti terrestri, per la compressione */
  const sd=SS_BODIES.filter(b=>b.parent===2&&b.days&&!b.l2).map(b=>b.days);
  const dMin=Math.min.apply(null,sd), dMax=Math.max.apply(null,sd);
  ssPrepared=SS_BODIES.map((B,k)=>{
    const o={ k:k, B:B, parent:(B.parent===undefined?-1:B.parent),
      e:B.e||0, incRad:(B.inc||0)*SS_RAD, nodeRad:(B.node||0)*SS_RAD,
      periRad:(B.peri||0)*SS_RAD, tiltRad:(B.tilt||0)*SS_RAD, M:0, nPerDay:0, aS:0, rS:0 };
    o.wRad=o.periRad-o.nodeRad;                 /* argomento del perielio ω = ϖ − Ω */
    o.rS=B.rKm?ssSizeScene(B.rKm):0.30;         /* le stazioni hanno una taglia fissa */
    if(o.parent<0){
      o.aS=ssDistScene(B.aAU);
      o.years=Math.pow(B.aAU,1.5);              /* 3ª legge di Keplero: T² = a³ */
      o.periodDays=o.years*365.256;
      /* velocità: giro completo in periodDays, con l'orologio delle orbite */
      o.nPerDay=2*Math.PI/o.periodDays;
      /* posizione di partenza vera: longitudine media J2000 + moto medio fino a oggi */
      o.M=((B.L0-B.peri)*SS_RAD + o.nPerDay*days) % (Math.PI*2);
      o.secsPerOrbit=o.periodDays/SS_DPS;
    } else if(B.l2){
      o.aS=0; o.periodDays=B.days;              /* fermo in L2, con un lento moto di alone */
    } else if(B.surface){
      o.aS=0; o.periodDays=0;
    } else {
      /* satelliti della Terra: nessuna scala regge insieme 408 km (ISS) e
         384.400 km (Luna), quindi le orbite sono INGRANDITE — l'ordine resta
         vero (ISS più bassa, poi Luna, poi L2) e la scheda dice i km veri */
      o.aS=B.aScene;
      o.periodDays=B.days;
      /* i periodi veri differiscono di 400 volte (90 minuti contro 27 giorni):
         li comprimiamo in modo logaritmico nella finestra SS_SAT_MIN..MAX.
         L'ORDINE resta vero — la ISS è la più veloce — i rapporti no. */
      const t=(Math.log(B.days)-Math.log(dMin))/(Math.log(dMax)-Math.log(dMin));
      o.secsPerOrbit=SS_SAT_MIN*Math.pow(SS_SAT_MAX/SS_SAT_MIN,t);
      o.nPerDay=2*Math.PI/B.days;
      o.M=Math.random()*Math.PI*2;
    }
    /* nella vista in fila i satelliti si aprono a ventaglio intorno alla
       Terra, altrimenti finirebbero uno sopra l'altro */
    o.alignM=(o.aS>0)?(ssAlignM(o)+(B.alignFan||0)*SS_RAD):0;
    /* rotazione: giri al secondo con l'orologio delle rotazioni.
       Il segno è sempre positivo: sono le inclinazioni assiali oltre 90°
       (Venere 177°, Urano 98°, Plutone 123°) a farli girare al contrario. */
    o.spinPerSec=B.rot?2*Math.PI/B.rot*SS_ROT_DPS:0;
    return o;
  });
  return ssPrepared;
}

/* ============================================================
   COSTRUZIONE DELLA SCENA
   ============================================================ */
function ssBuildScene(){
  const P=ssPrep();
  ssScene=new THREE.Scene();
  /* nello spazio non c'è aria che diffonda la luce: la parte in ombra
     è quasi nera, un filo di ambiente solo per non perdere i dettagli */
  ssScene.add(new THREE.AmbientLight(0x9cafd3,0.65));
  ssScene.add(new THREE.PointLight(0xfff4e6,1.65,0));

  /* stelle: 1400 punti su una sfera lontana, con magnitudini diverse */
  const starMap=ssSoftDisc();
  for(const layer of [[1400,0.6,0.65,0xbacfff],[400,1.1,0.8,0xffe5ba],[90,1.8,1,0xffffff]]){
    const n=layer[0], pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=210+Math.random()*70;
      pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.cos(ph); pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
    }
    const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    ssScene.add(new THREE.Points(gg,new THREE.PointsMaterial({map:starMap,color:layer[3],size:layer[1],transparent:true,opacity:layer[2],depthWrite:false,blending:THREE.AdditiveBlending})));
  }

  /* Sole: raggio vero 696.000 km, cioè 109 Terre. Nella scena è compresso
     come i pianeti, altrimenti coprirebbe Mercurio. */
  const sunR=ssSizeScene(696000)*0.62;
  const sun=new THREE.Mesh(new THREE.SphereGeometry(sunR,32,24),new THREE.MeshBasicMaterial({map:ssSunTex()}));
  ssScene.add(sun); ssScene.userData.sun=sun;
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:starMap,color:0xffb545,opacity:0.65,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  glow.scale.set(sunR*9,sunR*9,1); ssScene.add(glow);
  ssScene.userData.glow=glow;

  /* fascia principale degli asteroidi: 2,06–3,28 UA, con la lacuna di Kirkwood
     a 2,5 UA (risonanza 3:1 con Giove) e l'inclinazione media di 8° */
  const bn=1200, bp=new Float32Array(bn*3);
  for(let i=0;i<bn;i++){
    let au=2.06+Math.random()*1.22;
    if(Math.abs(au-2.50)<0.04 && Math.random()<0.85) au+=0.12;   /* lacuna di Kirkwood */
    const a=ssDistScene(au), t=Math.random()*Math.PI*2, inc=(Math.random()-0.5)*0.28;
    bp[i*3]=a*Math.cos(t); bp[i*3+1]=a*Math.sin(t)*Math.sin(inc); bp[i*3+2]=a*Math.sin(t)*Math.cos(inc);
  }
  const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
  ssBelt=new THREE.Points(bg,new THREE.PointsMaterial({map:starMap,color:0xbba88b,size:0.13,transparent:true,opacity:0.55,depthWrite:false}));
  ssScene.add(ssBelt);

  /* ---- i corpi ---- */
  ssB=[]; ssHits=[];
  P.forEach((o,k)=>{
    const B=o.B;
    const grp=new THREE.Group();      /* posizione sull'orbita */
    const tilt=new THREE.Group();     /* inclinazione dell'asse */
    tilt.rotation.z=o.tiltRad;
    grp.add(tilt);
    let mesh, clouds=null;
    if(B.kind==='iss') mesh=ssMakeISS();
    else if(B.kind==='jwst') mesh=ssMakeJWST();
    else if(B.kind==='base') mesh=ssMakeBase();
    else {
      const map=ssTex(B.kind), rocky=['mercurio','luna','marte','plutone'].includes(B.kind);
      mesh=new THREE.Mesh(new THREE.SphereGeometry(o.rS,64,40),
        new THREE.MeshPhongMaterial({map:map,bumpMap:rocky?map:null,bumpScale:rocky?o.rS*0.025:0,
          shininess:B.kind==='terra'?22:4,specular:B.kind==='terra'?0x294969:0x111111}));
      if(B.ring) mesh.add(ssMakeRing(o.rS,SS_RING[B.ring]));
      const atmos={terra:0x438cff,venere:0xf4c889,marte:0xc8794c,urano:0x83dae1,nettuno:0x557dff};
      if(atmos[B.kind]) tilt.add(ssAtmosphere(o.rS,atmos[B.kind]));
      if(B.kind==='terra'){ clouds=ssClouds(o.rS); mesh.add(clouds); }
    }
    tilt.add(mesh);
    /* sfera invisibile più grande: facile da toccare anche da lontano */
    const hit=new THREE.Mesh(new THREE.SphereGeometry(Math.max(o.rS*1.9,1.2),8,6),
      new THREE.MeshBasicMaterial({visible:false}));
    hit.userData.lvl=k; grp.add(hit); ssHits.push(hit);
    /* materiali PROPRI del corpo, raccolti prima di agganciare i satelliti:
       così spegnere un livello chiuso non spegne anche le sue lune */
    const mats=[]; tilt.traverse(m=>{ if(m.isMesh&&m.material&&m.material.color) mats.push(m.material); });
    ssB.push({o:o,grp:grp,tilt:tilt,mesh:mesh,clouds:clouds,orbit:null,eq:null,mats:mats});

    /* linea dell'orbita: l'ellisse vera, campionata sui suoi elementi */
    if(o.aS>0){
      const seg=200, op=new Float32Array((seg+1)*3), v=new THREE.Vector3();
      for(let i=0;i<=seg;i++){
        ssOrbitPos(o,i/seg*Math.PI*2,v);
        op[i*3]=v.x; op[i*3+1]=v.y; op[i*3+2]=v.z;
      }
      const og=new THREE.BufferGeometry(); og.setAttribute('position',new THREE.BufferAttribute(op,3));
      ssB[k].orbit=new THREE.Line(og,new THREE.LineBasicMaterial({color:B.col,transparent:true,opacity:0.24}));
    }
  });
  /* gerarchia: i satelliti stanno DENTRO il gruppo del pianeta */
  P.forEach((o,k)=>{
    const b=ssB[k];
    if(o.parent<0){ ssScene.add(b.grp); if(b.orbit) ssScene.add(b.orbit); }
    else{
      const par=ssB[o.parent];
      if(o.B.equator){
        /* la ISS è inclinata di 51,64° sull'EQUATORE terrestre, non
           sull'eclittica: il suo piano orbitale sta in un gruppo
           già inclinato come l'asse della Terra (23,44°) */
        const eq=new THREE.Group(); eq.rotation.z=ssPrep()[2].tiltRad;
        par.grp.add(eq); b.eq=eq; eq.add(b.grp); if(b.orbit) eq.add(b.orbit);
      } else if(o.B.surface){
        /* la Base sta APPOGGIATA sulla Luna e ruota con lei */
        par.mesh.add(b.grp);
        const la=(o.B.lat||0)*SS_RAD, pr=ssPrep()[o.parent].rS;
        b.grp.position.set(0,pr*Math.sin(la),pr*Math.cos(la));
        b.grp.rotation.x=-la;
      } else {
        par.grp.add(b.grp); if(b.orbit) par.grp.add(b.orbit);
      }
    }
  });

  /* rotte di trasferimento fra i livelli */
  ssEdges=[];
  const SEGS=20;
  for(let a=0;a<EDGES.length;a++) for(const b of EDGES[a]) if(b>a){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((SEGS+1)*3),3));
    const line=new THREE.Line(g,new THREE.LineDashedMaterial({color:0xfff6dc,dashSize:0.7,gapSize:0.5,transparent:true,opacity:0.7}));
    ssScene.add(line);
    ssEdges.push({a:a,b:b,line:line,segs:SEGS});
  }

  ssMarker=emojiSprite('🧑‍🚀',2.4); ssScene.add(ssMarker);
  ssCam=new THREE.PerspectiveCamera(50,1,0.05,700);
  ssRay=new THREE.Raycaster();
  ssClock=new THREE.Clock();
  /* la fascia degli asteroidi gira col periodo di 2,7 UA: 4,4 anni */
  ssScene.userData.beltW=2*Math.PI/(Math.pow(2.7,1.5)*365.256/SS_DPS);
  /* il Sole ruota in 25,4 giorni all'equatore */
  ssScene.userData.sunW=2*Math.PI/25.4*SS_ROT_DPS;
}

/* ============================================================
   SCHEDA DEL CORPO CELESTE — i dati veri, da leggere
   ============================================================ */
const SS_AU_KM=149597870.7;
function ssNum(n,dec){
  const v=(dec===undefined)?Math.round(n):Number(n.toFixed(dec));
  try{ return v.toLocaleString('it-IT'); }catch(e){ return ''+v; }
}
function ssDur(days){
  if(days<1){
    const h=days*24;
    return (h<1)?(Math.round(h*60)+' minuti'):(Math.floor(h)+'h '+Math.round((h-Math.floor(h))*60)+'m');
  }
  if(days<400) return ssNum(days,days<10?2:0)+' giorni';
  return ssNum(days/365.256,1)+' anni';
}
function ssRow(k,v){ return '<div class="ssRow"><b>'+k+'</b><span>'+v+'</span></div>'; }
function ssCardHTML(k){
  const i=LI(), o=ssPrep()[k], B=o.B, t=THEMES[k], un=unlockedSet.has(k), st=starsMap[k]||0;
  let rows='';
  if(o.parent<0){
    rows+=ssRow('Distanza dal Sole',ssNum(B.aAU,3)+' UA · '+ssNum(B.aAU*SS_AU_KM/1e6)+' milioni di km');
    rows+=ssRow('Un anno',ssDur(o.periodDays));
    rows+=ssRow('Orbita',B.e<0.02?('quasi un cerchio (e = '+B.e.toFixed(3)+')')
      :(B.e>0.15?('molto schiacciata (e = '+B.e.toFixed(3)+')'):('un po’ schiacciata (e = '+B.e.toFixed(3)+')')));
    rows+=ssRow('Inclinazione dell’orbita',B.inc.toFixed(1)+'° sull’eclittica');
  } else if(B.aKm){
    rows+=ssRow('Distanza dalla Terra',ssNum(B.aKm)+' km dal centro'+
      (B.equator?' — cioè '+ssNum(B.aKm-6371)+' km sopra il suolo':''));
    rows+=ssRow('Un giro',ssDur(B.days));
    rows+=ssRow('Inclinazione',B.inc.toFixed(2)+'°'+(B.equator?' sull’equatore terrestre':' sull’eclittica'));
    rows+=ssRow('Nel disegno','orbita ingrandita per poterla vedere');
  } else if(B.l2){
    rows+=ssRow('Dove sta','punto L2, 1,5 milioni di km dalla Terra');
    rows+=ssRow('Un’orbita di alone','circa 6 mesi');
    rows+=ssRow('Nel disegno','distanza ridotta, direzione vera (opposta al Sole)');
  } else if(B.surface){
    rows+=ssRow('Dove sta','polo sud della Luna');
  }
  if(B.rKm){
    rows+=ssRow('Diametro',ssNum(B.rKm*2)+' km'+(k===2?'':' · '+(B.rKm/6371).toFixed(2)+' volte la Terra'));
    rows+=ssRow('Un giorno',ssDur(B.rot)+(B.tilt>90?' — al contrario!':''));
    rows+=ssRow('Asse inclinato',B.tilt.toFixed(2)+'°'+(B.tilt>90?' (capovolto)':''));
    rows+=ssRow('Gravità',B.g.toFixed(2)+' m/s² — un salto di 50 cm qui diventa '+ssNum(50*9.81/B.g)+' cm');
    rows+=ssRow('Lune',B.moons===0?'nessuna':(B.moons>20?('più di '+(Math.floor(B.moons/10)*10)+', e ne trovano ancora'):''+B.moons));
  }
  rows+=ssRow('Temperatura',B.temp[i]);
  let stars=''; for(let j=0;j<3;j++) stars+=(j<st?'⭐':'☆');
  return '<button class="ssCardX" id="ssCardX" aria-label="Chiudi">✕</button>'+
    '<div class="ssCardHead"><span class="ssEm">'+B.em+'</span><div>'+
      '<div class="ssCardNm">'+B.nm[i]+'</div>'+
      '<div class="ssCardLv">'+(k+1)+'. '+(un?t.emoji:'🔒')+' '+t.name[i]+' '+(un?stars:'📖')+'</div>'+
    '</div></div>'+
    '<div class="ssFact">💡 '+B.fact[i]+'</div>'+
    '<div class="ssCardBtns">'+
      (VOICEON?'<button class="ssBtn" id="ssCardRead">🔊 Ascolta</button>':'')+
      '<button class="ssBtn go" id="ssCardGo">'+(un?'▶️ Gioca il livello':'📖 Leggi la storia')+'</button>'+
    '</div><div class="ssRows">'+rows+'</div>';
}
function ssOpenCard(k){
  if(!ssB[k]) return;
  ssCardLvl=k;
  ssCamAuto=true;
  const card=$('ssCard');
  card.style.setProperty('--planet-color',ssB[k].o.B.col);
  card.innerHTML=ssCardHTML(k);
  card.classList.add('open');
  card.removeAttribute('inert'); card.setAttribute('aria-hidden','false');
  card.scrollTop=0;
  $('ss').classList.add('inspecting');
  ssRefresh();
  $('ssCardX').onclick=ssCloseCard;
  $('ssCardX').focus({preventScroll:true});
  const rd=$('ssCardRead');
  if(rd) rd.onclick=()=>{
    const B=ssPrep()[k].B, i=LI();
    speak([B.nm[i],...[...card.querySelectorAll('.ssRow')].map(r=>r.children[0].textContent+': '+r.children[1].textContent),B.fact[i]]);
  };
  $('ssCardGo').onclick=()=>{
    stopSpeak();
    if(unlockedSet.has(k)){
      ssCloseCard(); ssExit();
      if(window.GabriNavigation) window.GabriNavigation.visit({screen:'maze-level',game:'maze',level:k});
      startLevel(k);
    } else if(typeof openLetturina==='function') openLetturina(k);
  };
}
function ssCloseCard(){
  const previous=ssCardLvl;
  ssCardLvl=-1; ssCamAuto=true; stopSpeak();
  $('ssCard').classList.remove('open');
  $('ssCard').setAttribute('inert',''); $('ssCard').setAttribute('aria-hidden','true');
  $('ss').classList.remove('inspecting');
  if(ssLbls){
    ssRefresh();
    const btn=$('ssDock').querySelector('[data-i="'+previous+'"]');
    if(btn) btn.focus({preventScroll:true});
  }
}

/* ============================================================
   DOM, CSS, INPUT
   ============================================================ */
(function(){
  const css=document.createElement('link');
  css.rel='stylesheet'; css.href='css/sistema-solare.css?v=2';
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',
    '<div class="overlay" id="ss"><div id="ssWrap">'+
      '<canvas id="ssCanvas"></canvas>'+
      '<div id="ssLabels">'+
        '<div id="ssLegend"></div><div id="ssHint"></div>'+
        '<div id="ssBtns"><button id="ssModeBtn"></button><button id="ssExit" aria-label="Torna ai giochi">⌂ <span>Giochi</span></button></div>'+
        '<div id="ssTools"><button id="ssHome" aria-label="Mostra tutto il sistema solare">◎</button><button id="ssZoomIn" aria-label="Avvicina">+</button><button id="ssZoomOut" aria-label="Allontana">−</button><button id="ssPause" aria-label="Pausa" aria-pressed="false">Ⅱ</button></div>'+
        '<nav id="ssDock" aria-label="Esplora i corpi celesti"></nav>'+
      '</div>'+
      '<section id="ssCard" aria-label="Scheda del corpo celeste" aria-hidden="true" inert></section>'+
    '</div></div>');
})();

function ssBuildDOM(){
  ssWrap=$('ssWrap'); ssCv=$('ssCanvas'); ssLbls=$('ssLabels');
  ssPrep().forEach((o,k)=>{
    const d=document.createElement('button');
    d.type='button';
    d.className='ssLbl'; d.dataset.i=k;
    d.style.setProperty('--planet-color',o.B.col);
    d.addEventListener('click',e=>{ e.stopPropagation(); ssOpenCard(k); });
    ssLbls.appendChild(d);
    const item=document.createElement('button');
    item.type='button'; item.className='ssWorld'; item.dataset.i=k;
    item.style.setProperty('--planet-color',o.B.col);
    const thumb=document.createElement('span'); thumb.className='ssThumb '+o.B.kind;
    if(o.B.rKm){
      thumb.style.backgroundImage='url('+ssB[k].mesh.material.map.image.toDataURL()+')';
    } else thumb.textContent=o.B.em;
    const name=document.createElement('span'); name.className='ssWorldName';
    item.append(thumb,name); item.onclick=()=>ssOpenCard(k);
    $('ssDock').appendChild(item);
  });
  $('ssModeBtn').onclick=e=>{ e.stopPropagation(); ssSetAligned(!ssAligned); };
  $('ssHome').onclick=ssCloseCard;
  $('ssZoomIn').onclick=()=>{ ssCamAuto=false; ssCamR=Math.max(SS_ZOOM_MIN,ssCamR/1.25); };
  $('ssZoomOut').onclick=()=>{ ssCamAuto=false; ssCamR=Math.min(ssZoomLimit(),ssCamR*1.25); };
  $('ssPause').onclick=()=>{ ssPaused=!ssPaused; ssRefresh(); };
  $('ss').addEventListener('keydown',e=>{ if(e.key==='Escape') ssCloseCard(); });
  $('ssExit').onclick=e=>{
    e.stopPropagation();
    if(window.GabriNavigation) window.GabriNavigation.showRoute({screen:'games'});
    else { ssExit(); showModeSel(); }
  };
  ssWrap.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') ssPtrIn=true; });
  ssWrap.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') ssPtrIn=false; });
  ssWrap.addEventListener('pointerdown',()=>{ ssLastTouch=Date.now(); },true);
  ssWrap.addEventListener('pointermove',()=>{ ssLastTouch=Date.now(); },true);
  ssGL=new THREE.WebGLRenderer({canvas:ssCv,antialias:true,alpha:true});
  ssGL.setPixelRatio(Math.min(devicePixelRatio||1,2));
  addEventListener('resize',ssResize);
  ssInput();
  ssResize();
}
function ssResize(){
  if(!ssCv||!ssCv.isConnected||!ssGL) return;
  const w=ssWrap.clientWidth||600, h=ssWrap.clientHeight||400;
  ssLastW=w; ssLastH=h;
  ssGL.setSize(w,h,false);
  ssCam.aspect=w/h; ssCam.updateProjectionMatrix();
}
function ssSetAligned(v){
  ssCloseCard();
  ssAligned=v; ssCamAuto=true;
  try{ localStorage.setItem('gabri_mapview',v?'fila':'orbite'); }catch(e){}
  ssRefresh();
}
function ssZoomLimit(){ return Math.max(SS_ZOOM_MAX,180*Math.max(1,ssLastH/Math.max(1,ssLastW))); }
/* trascina per ruotare, pizzica/rotella per lo zoom, tocca per la scheda */
function ssInput(){
  const ptrs=new Map();
  let downX=0,downY=0,downT=0,dragging=false,pinchD=0;
  ssCv.style.touchAction='none';
  ssCv.addEventListener('pointerdown',e=>{
    ssCv.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===1){ downX=e.clientX; downY=e.clientY; downT=Date.now(); dragging=false; }
    else if(ptrs.size===2){ const a=[...ptrs.values()]; pinchD=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]); }
  });
  ssCv.addEventListener('pointermove',e=>{
    if(!ptrs.has(e.pointerId)) return;
    const prev=ptrs.get(e.pointerId);
    ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===1){
      const dx=e.clientX-prev[0], dy=e.clientY-prev[1];
      if(Math.hypot(e.clientX-downX,e.clientY-downY)>9) dragging=true;
      if(dragging){
        ssCamAuto=false;
        ssCamTheta-=dx*0.006;
        ssCamPhi=Math.min(1.48,Math.max(0.06,ssCamPhi-dy*0.005));
      }
    } else if(ptrs.size===2){
      const a=[...ptrs.values()], d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);
      if(pinchD>0&&d>0){ ssCamAuto=false; ssCamR=Math.min(ssZoomLimit(),Math.max(SS_ZOOM_MIN,ssCamR*pinchD/d)); }
      pinchD=d; dragging=true;
    }
  });
  const up=e=>{
    if(ptrs.has(e.pointerId)){
      ptrs.delete(e.pointerId);
      if(!dragging && Date.now()-downT<500 && ptrs.size===0) ssTap(e);
    }
    if(ptrs.size<2) pinchD=0;
  };
  ssCv.addEventListener('pointerup',up);
  ssCv.addEventListener('pointercancel',e=>ptrs.delete(e.pointerId));
  ssCv.addEventListener('wheel',e=>{
    e.preventDefault(); ssCamAuto=false;
    ssCamR=Math.min(ssZoomLimit(),Math.max(SS_ZOOM_MIN,ssCamR*(e.deltaY>0?1.1:0.9)));
  },{passive:false});
}
function ssTap(e){
  const r=ssCv.getBoundingClientRect();
  const nd=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-(((e.clientY-r.top)/r.height)*2-1));
  ssRay.setFromCamera(nd,ssCam);
  const visibleHits=ssHits.filter(hit=>{
    for(let parent=hit;parent;parent=parent.parent) if(!parent.visible) return false;
    return true;
  });
  const hits=ssRay.intersectObjects(visibleHits,false);
  if(hits.length) ssOpenCard(hits[0].object.userData.lvl);
  else ssCloseCard();
}

/* ============================================================
   AGGIORNAMENTO DEI TESTI E DELLO STATO DI BLOCCO
   ============================================================ */
let ssUnlockedSeen=-1;
function ssRefresh(){
  const i=LI();
  ssUnlockedSeen=unlockedSet.size;
  ssB.forEach((b,k)=>{
    b.mats.forEach(m=>m.color.setHex(0xffffff));
    if(b.orbit) b.orbit.material.opacity=ssCardLvl===k?0.65:0.23;
  });
  for(const d of ssLbls.querySelectorAll('.ssLbl')){
    const k=parseInt(d.dataset.i), o=ssPrep()[k];
    d.innerHTML='<span class="ssDot"></span><span class="pn">'+o.B.nm[i]+'</span>';
    d.setAttribute('aria-label',(i===0?'Esplora ':'Explore ')+o.B.nm[i]);
    d.classList.toggle('selected',ssCardLvl===k);
  }
  for(const d of $('ssDock').children){
    const k=Number(d.dataset.i), B=ssPrep()[k].B;
    d.querySelector('.ssWorldName').textContent=B.nm[i];
    d.setAttribute('aria-label',(i===0?'Esplora ':'Explore ')+B.nm[i]);
    d.setAttribute('aria-pressed',String(ssCardLvl===k));
  }
  $('ssLegend').innerHTML=(i===0)
    ? '<small>IL TUO OSSERVATORIO</small><b>Il Sistema Solare</b><span>Un viaggio tra pianeti, lune e stelle.</span>'+
      '<details><summary>Come funziona la mappa</summary>Orbite ellittiche, rotazioni e assi inclinati. Distanze e diametri compressi per vedere tutti i pianeti. 1 s ≈ '+SS_DPS+' giorni di orbita.</details>'
    : '<small>YOUR OBSERVATORY</small><b>The Solar System</b><span>A journey through planets, moons and stars.</span>'+
      '<details><summary>About this map</summary>Elliptical orbits, real spins and tilts. Distances and sizes compressed. 1 s ≈ '+SS_DPS+' days of orbit.</details>';
  $('ssHint').textContent=ssAligned
    ? ((i===0)?'👆 Tocca un pianeta per la sua scheda · 🤏 Pizzica o rotella per lo zoom':'👆 Tap a planet for its card · 🤏 Pinch or wheel to zoom')
    : ((i===0)?'👆 Trascina per ruotare · 🐢 i pianeti rallentano quando li punti · guarda Plutone entrare nell’orbita di Nettuno'
              :'👆 Drag to rotate · 🐢 planets slow down when you point at them');
  $('ssModeBtn').textContent=ssAligned
    ? ((i===0)?'🌀 Vedi le orbite':'🌀 See the orbits')
    : ((i===0)?'📏 Pianeti in fila':'📏 Line up the planets');
  $('ssPause').textContent=ssPaused?'▶':'Ⅱ';
  $('ssPause').setAttribute('aria-label',ssPaused?(i===0?'Riprendi':'Resume'):(i===0?'Pausa':'Pause'));
  $('ssPause').setAttribute('aria-pressed',String(ssPaused));
}

/* ============================================================
   FRAME
   ============================================================ */
const _sv=new THREE.Vector3(), _sv2=new THREE.Vector3(), _sc=new THREE.Vector3();
function ssFrame(ts){
  if(!ssOn||!ssCv||!ssCv.isConnected){ ssRunning=false; return; }
  requestAnimationFrame(ssFrame);
  if(Number.isFinite(ts)&&ssFrameAt&&ts-ssFrameAt<1000/30-1) return;
  if(Number.isFinite(ts)) ssFrameAt=ts;
  const rdt=Math.min(ssClock.getDelta(),0.05), et=ssClock.elapsedTime;
  if(ssWrap.clientWidth!==ssLastW||ssWrap.clientHeight!==ssLastH) ssResize();
  if(unlockedSet.size!==ssUnlockedSeen) ssRefresh();   /* la letturina ha sbloccato qualcosa */

  /* col puntatore sulla mappa tutto quasi si ferma: così si può scegliere */
  const slow=ssPtrIn||(Date.now()-ssLastTouch<SS_TOUCH_SLOW_MS);
  ssSpeedF+=((slow?SS_HOVER_SLOW:1)-ssSpeedF)*Math.min(1,rdt*4);
  const dt=ssPaused?0:rdt*ssSpeedF;

  ssB.forEach((b,k)=>{
    const o=b.o, B=o.B;
    if(o.aS>0){
      if(ssAligned&&!ssPaused){
        /* vista in fila: portiamo dolcemente ogni corpo alla longitudine 0 */
        let d=(o.alignM-o.M)%(Math.PI*2);
        if(d>Math.PI) d-=Math.PI*2; if(d<-Math.PI) d+=Math.PI*2;
        o.M+=d*Math.min(1,rdt*2.2);
      } else if(!ssAligned) {
        /* un giro completo in secsPerOrbit secondi; l'anomalia MEDIA avanza
           uniforme, ma la posizione no: al perielio il corpo corre (2ª legge) */
        o.M+=2*Math.PI/o.secsPerOrbit*dt;
      }
      ssOrbitPos(o,o.M,_sv);
      b.grp.position.copy(_sv);
    } else if(B.l2){
      /* L2 sta sulla congiungente Sole-Terra, oltre la Terra:
         va ricalcolato ogni frame perché la Terra si muove */
      ssB[o.parent].grp.getWorldPosition(_sv);
      const len=Math.hypot(_sv.x,_sv.z)||1;
      o.haloPhase=(o.haloPhase||0)+dt*2*Math.PI/(B.days/SS_DPS);
      const ha=o.haloPhase;
      b.grp.position.set(_sv.x/len*SS_L2,Math.sin(ha)*0.30,_sv.z/len*SS_L2);
    }
    /* rotazione propria */
    if(B.sync){
      /* rotazione sincrona: la faccia rivolta al pianeta resta la stessa
         (la Luna ci mostra sempre lo stesso lato) */
      b.mesh.rotation.y=-Math.atan2(b.grp.position.z,b.grp.position.x)+Math.PI/2;
    } else if(o.spinPerSec){
      b.mesh.rotation.y+=o.spinPerSec*dt;
    }
    if(b.clouds) b.clouds.rotation.y+=dt*0.025;
    if(b.orbit) b.orbit.visible=!ssAligned&&ssCardLvl<0;
  });
  ssBelt.rotation.y+=ssScene.userData.beltW*dt;
  if(ssScene.userData.sun) ssScene.userData.sun.rotation.y+=ssScene.userData.sunW*dt;

  /* camera: nella vista in fila si sistema da sola per inquadrare tutto */
  const focus=ssCardLvl>=0?ssB[ssCardLvl]:null;
  const narrow=ssLastW<=700, card=$('ssCard');
  const cardW=focus&&!narrow?card.offsetWidth:0, cardH=focus&&narrow?card.offsetHeight:0;
  if(focus) focus.grp.getWorldPosition(_sv);
  else _sv.set(ssAligned?SS_ALIGN_CX:0,0,0);
  const centerL=focus?Math.min(1,rdt*7):Math.min(1,rdt*3);
  ssCenterX+=(_sv.x-ssCenterX)*centerL;
  ssCenterY+=(_sv.y-ssCenterY)*centerL;
  ssCenterZ+=(_sv.z-ssCenterZ)*centerL;
  if(ssCamAuto){
    const tt=ssAligned?SS_ALIGN_THETA:SS_ORBIT_THETA;
    const tp=ssAligned?SS_ALIGN_PHI:SS_ORBIT_PHI;
    const aspect=ssLastW/Math.max(ssLastH,1);
    const overview=ssAligned?Math.max(SS_ALIGN_R,77/aspect):Math.max(132,148/aspect);
    const extent=focus?focus.o.rS*(focus.o.B.ring?SS_RING[focus.o.B.ring].out:1):0;
    const usable=Math.max(0.15,Math.min((ssLastW-cardW-48)/ssLastH,(ssLastH-cardH-180)/ssLastH));
    const tr=focus?Math.max(6,extent*3.5/usable):overview;
    let dth=(tt-ssCamTheta)%(Math.PI*2);
    if(dth>Math.PI) dth-=Math.PI*2; if(dth<-Math.PI) dth+=Math.PI*2;
    const l=Math.min(1,rdt*2.5);
    ssCamTheta+=dth*l; ssCamPhi+=((focus?1.12:tp)-ssCamPhi)*l; ssCamR+=(tr-ssCamR)*l;
  }
  ssCam.position.set(
    ssCenterX+ssCamR*Math.sin(ssCamPhi)*Math.cos(ssCamTheta),
    ssCenterY+ssCamR*Math.cos(ssCamPhi),
    ssCenterZ+ssCamR*Math.sin(ssCamPhi)*Math.sin(ssCamTheta));
  ssCam.lookAt(ssCenterX,ssCenterY,ssCenterZ);
  ssCam.setViewOffset(ssLastW||600,ssLastH||400,cardW/2,focus?cardH/2:24,ssLastW||600,ssLastH||400);
  let focusRoot=ssCardLvl;
  while(focusRoot>=0&&ssB[focusRoot].o.parent>=0) focusRoot=ssB[focusRoot].o.parent;
  ssB.forEach((b,k)=>{ if(b.o.parent<0) b.grp.visible=!focus||k===focusRoot; });
  ssScene.userData.sun.visible=!focus; ssScene.userData.glow.visible=!focus;
  ssBelt.visible=!focus&&!ssAligned;

  /* rotte fra i livelli */
  for(const ed of ssEdges){
    ed.line.visible=false;
    ssB[ed.a].grp.getWorldPosition(_sv); ssB[ed.b].grp.getWorldPosition(_sv2);
    const dist=_sv.distanceTo(_sv2);
    _sc.addVectors(_sv,_sv2).multiplyScalar(0.5); _sc.y+=dist*0.22;
    const attr=ed.line.geometry.attributes.position;
    for(let i=0;i<=ed.segs;i++){
      const t=i/ed.segs, u=1-t;
      attr.array[i*3]  =u*u*_sv.x+2*u*t*_sc.x+t*t*_sv2.x;
      attr.array[i*3+1]=u*u*_sv.y+2*u*t*_sc.y+t*t*_sv2.y;
      attr.array[i*3+2]=u*u*_sv.z+2*u*t*_sc.z+t*t*_sv2.z;
    }
    attr.needsUpdate=true;
    ed.line.computeLineDistances();
    ed.line.material.opacity=(unlockedSet.has(ed.a)||unlockedSet.has(ed.b))?0.5+0.18*Math.sin(et*2):0.12;
  }

  /* segnaposto sull'ultimo livello giocato */
  let cur=0;
  try{ cur=parseInt(localStorage.getItem('gabri_last')||'0')||0; }catch(err){}
  if(cur>=ssB.length||!unlockedSet.has(cur)) cur=0;
  ssB[cur].grp.getWorldPosition(_sv);
  ssMarker.position.set(_sv.x,_sv.y+ssB[cur].o.rS+1.5+Math.sin(et*2.2)*0.25,_sv.z);
  ssMarker.visible=false;

  /* etichette HTML proiettate sopra il canvas */
  const r=ssCv.getBoundingClientRect();
  const halfH=r.height/2, tanF=Math.tan(ssCam.fov*Math.PI/360), placed=[];
  for(const d of ssLbls.children){
    if(!d.classList.contains('ssLbl')) continue;
    const k=parseInt(d.dataset.i);
    ssB[k].grp.getWorldPosition(_sv);
    const dist=_sv.distanceTo(ssCam.position);
    _sv2.copy(_sv).project(ssCam);
    if(_sv2.z>1||_sv2.z< -1||Math.abs(_sv2.x)>0.97||Math.abs(_sv2.y)>0.85||
       (ssCardLvl>=0&&k!==ssCardLvl)||(ssCardLvl<0&&ssB[k].o.parent>=0)){
      d.style.display='none'; continue;
    }
    d.style.display='';
    const px=(_sv2.x*0.5+0.5)*r.width, py0=(-_sv2.y*0.5+0.5)*r.height;
    const rPix=ssB[k].o.rS*halfH/(dist*tanF);
    const s=Math.max(0.85,Math.min(1,30/dist+0.5));
    const st=ssAligned?(SS_STAG[k]||1):1;   /* righe sfalsate per non coprirsi */
    const labelH=(d.offsetHeight||28)*s, labelW=(d.offsetWidth||80)*s;
    let top=st>0?py0+rPix+8+(st-1)*30*s:py0-rPix-8-(-st-1)*30*s-labelH;
    /* I nomi vicini si distribuiscono su righe distinte; il dock resta
       sempre disponibile anche quando un corpo esce dall'inquadratura. */
    for(let attempt=0;attempt<12;attempt++){
      if(!placed.some(p=>Math.abs(px-p.x)<(labelW+p.w)/2+5&&top<p.y+p.h+5&&top+labelH+5>p.y)) break;
      top+=labelH+6;
    }
    placed.push({x:px,y:top,w:labelW,h:labelH});
    const above=top+labelH<py0;
    d.classList.toggle('above',above);
    d.style.setProperty('--stem',Math.max(0,(above?py0-rPix-top-labelH:top-py0-rPix)-3)/s+'px');
    d.style.top=top+'px';
    d.style.transform='translate(-50%,0) scale('+s+')';
    d.style.transformOrigin='top center';
    d.style.left=px+'px';
    d.style.zIndex=Math.round(1000-dist*5);
  }

  ssGL.render(ssScene,ssCam);
}

/* ============================================================
   ENTRATA E USCITA — voce del menu principale
   ============================================================ */
function ssEnter(){
  $('modeSel').style.display='none';
  if(typeof paused!=='undefined') paused=true;
  $('hud').style.display='none'; $('joy').style.display='none'; $('menu').style.display='none';
  if(!ssScene) ssBuildScene();
  if(!ssCv||!ssCv.isConnected) ssBuildDOM();
  ssCloseCard();
  ssRefresh();
  $('ss').style.display='flex';
  ssOn=true;
  ssResize();
  if(!ssRunning){ ssRunning=true; ssFrameAt=0; ssClock.getDelta(); requestAnimationFrame(ssFrame); }
}
function ssExit(){
  ssOn=false; ssRunning=false; stopSpeak();
  ssCardLvl=-1;
  const c=$('ssCard'); if(c) c.classList.remove('open');
  if(c){ c.setAttribute('inert',''); c.setAttribute('aria-hidden','true'); }
  $('ss').classList.remove('inspecting');
  $('ss').style.display='none';
}
/* registrazione nel menu: registerGame vive in scelta-gioco.js, caricato
   dopo questo file, quindi si aspetta il load (il nostro listener parte
   prima di quello che disegna il menu) */
(function(){
  const entry={
    id:'sistemasolare', emoji:'🪐',
    nm:['Il Sistema Solare','The Solar System'],
    sub:['Esplora i pianeti veri e apri i livelli','Explore the real planets and open the levels'],
    colore:'linear-gradient(180deg,#3b5bbf,#101a44)',
    enter:ssEnter, exit:ssExit
  };
  if(typeof registerGame==='function') registerGame(entry);
  else addEventListener('load',()=>{ if(typeof registerGame==='function') registerGame(entry); },{once:true});
})();
