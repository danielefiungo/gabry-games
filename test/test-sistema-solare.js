/* ============================================================
   Test jsdom: IL SISTEMA SOLARE (js/mappa-spazio.js)
   Controlla la FISICA (le tre leggi di Keplero, le rotazioni,
   le inclinazioni) e poi che la scena si costruisca e girri.
   Uso:  npm install jsdom  &&  node test/test-sistema-solare.js
   ============================================================ */
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const DIR=path.resolve(__dirname,'..');

let pass=0, fail=0;
function ok(cond,msg){ if(cond){pass++;console.log('  ✓ '+msg);} else {fail++;console.log('  ✗ FAIL: '+msg);} }
function near(a,b,tol,msg){ ok(Math.abs(a-b)<=tol,msg+'  ('+a+' ≈ '+b+' ±'+tol+')'); }

/* ---------- stub di THREE con la matematica VERA dei vettori ---------- */
const THREE_STUB=`
(function(){
  const noop=function(){return this};
  class V3{
    constructor(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0}
    set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
    copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
    clone(){return new V3(this.x,this.y,this.z)}
    add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
    addVectors(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this}
    multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}
    normalize(){const l=this.length()||1;return this.multiplyScalar(1/l)}
    length(){return Math.hypot(this.x,this.y,this.z)}
    distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}
    project(){return this}
    setHex(){return this}
  }
  class Attr{
    constructor(arr,n){this.array=arr;this.itemSize=n;this.count=arr.length/n;this.needsUpdate=false}
    getX(i){return this.array[i*this.itemSize]}
    getY(i){return this.array[i*this.itemSize+1]}
    setXY(i,x,y){this.array[i*this.itemSize]=x;this.array[i*this.itemSize+1]=y}
  }
  class Geo{
    constructor(){this.attributes={}}
    setAttribute(k,a){this.attributes[k]=a;return this}
    dispose(){}
  }
  class Ring extends Geo{
    constructor(ri,ro,seg){
      super(); const n=(seg+1)*2, p=new Float32Array(n*3), uv=new Float32Array(n*2);
      for(let i=0;i<=seg;i++){ const a=i/seg*Math.PI*2;
        p[i*6]=ri*Math.cos(a); p[i*6+1]=ri*Math.sin(a);
        p[i*6+3]=ro*Math.cos(a); p[i*6+4]=ro*Math.sin(a); }
      this.setAttribute('position',new Attr(p,3));
      this.setAttribute('uv',new Attr(uv,2));
    }
  }
  class Obj{
    constructor(){this.position=new V3();this.rotation={x:0,y:0,z:0};
      this.scale={set:noop};this.children=[];this.parent=null;this.userData={};
      this.isMesh=false;this.visible=true}
    add(o){if(o){o.parent=this;this.children.push(o)}return this}
    remove(){return this}
    traverse(fn){fn(this);this.children.forEach(c=>c.traverse&&c.traverse(fn))}
    getWorldPosition(out){
      out.set(0,0,0); let o=this;
      while(o){ out.x+=o.position.x; out.y+=o.position.y; out.z+=o.position.z; o=o.parent; }
      return out;
    }
    computeLineDistances(){return this}
    lookAt(){return this}
    updateProjectionMatrix(){return this}
  }
  class Mesh extends Obj{
    constructor(g,m){super();this.geometry=g||new Geo();this.material=m||{color:new V3()};this.isMesh=true}
  }
  /* i materiali veri accettano un colore numerico ma espongono un oggetto Color:
     lo stub fa lo stesso, altrimenti color.setHex() non esisterebbe */
  const Mat=function(o){
    const m=Object.assign({opacity:1,transparent:false,visible:true},o||{});
    m.color=new V3(); return m;
  };
  const W=window;
  W.THREE={
    Scene:Obj, Vector2:V3, Vector3:V3, Group:Obj, Object3D:Obj, Mesh:Mesh, Line:Mesh, Points:Mesh,
    Sprite:Mesh, BufferGeometry:Geo, BufferAttribute:Attr, RingGeometry:Ring,
    SphereGeometry:Geo, BoxGeometry:Geo, CylinderGeometry:Geo, ConeGeometry:Geo,
    MeshLambertMaterial:Mat, MeshBasicMaterial:Mat, LineBasicMaterial:Mat,
    LineDashedMaterial:Mat, PointsMaterial:Mat, SpriteMaterial:Mat,
    CanvasTexture:function(){return{repeat:{set:noop}}}, Color:function(){return new V3()},
    AmbientLight:Obj, PointLight:Obj, HemisphereLight:Obj, DirectionalLight:Obj,
    AdditiveBlending:1, DoubleSide:2,
    PerspectiveCamera:function(fov){ const o=new Obj(); o.fov=fov||50; o.aspect=1; return o },
    Raycaster:function(){ return {setFromCamera:noop,intersectObjects:()=>[]} },
    Clock:function(){ return {t:0,elapsedTime:0,getDelta(){this.elapsedTime+=0.016;return 0.016}} },
    WebGLRenderer:function(){ return {setSize:noop,setPixelRatio:noop,render:noop,domElement:null} },
    Fog:Obj, FogExp2:Obj
  };
})();
`;

/* ---------- stub del contesto 2D (jsdom non disegna) ---------- */
const CANVAS_STUB=`
(function(){
  const ctx={ canvas:null,
    fillStyle:'',strokeStyle:'',lineWidth:1,globalAlpha:1,font:'',textAlign:'',textBaseline:'',
    fillRect(){},strokeRect(){},clearRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},
    arc(){},ellipse(){},fill(){},stroke(){},save(){},restore(){},translate(){},rotate(){},
    scale(){},fillText(){},drawImage(){},
    createRadialGradient(){return{addColorStop(){}}},
    createLinearGradient(){return{addColorStop(){}}},
    getImageData(){return{data:[]}}, putImageData(){}
  };
  HTMLCanvasElement.prototype.getContext=function(){ const c=Object.create(ctx); c.canvas=this; return c; };
})();
`;

function boot(){
  const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:false});
  const w=dom.window;
  w.eval(CANVAS_STUB);
  w.eval(THREE_STUB);
  w.eval(`
    window.requestAnimationFrame=()=>0;
    window.fetch=()=>Promise.reject(new Error('no net'));
    window.indexedDB={open:()=>({})};
    window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[],addEventListener(){}};
    window.SpeechSynthesisUtterance=function(){};
    window.devicePixelRatio=1;
    window.AudioContext=function(){return{state:'suspended',resume(){},createGain(){return{connect(){},gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){}}}},createOscillator(){return{connect(){},start(){},stop(){},frequency:{value:0,setValueAtTime(){}},type:''}},destination:{},currentTime:0}};
    window.webkitAudioContext=window.AudioContext;
  `);
  /* i file che servono, nell'ordine di index.html */
  ['domande.js','sfide.js','testi.js','audio-voce.js','labirinto-3d.js','mappa-spazio.js']
    .forEach(f=>{
      const s=w.document.createElement('script');
      s.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
      w.document.body.appendChild(s);
    });
  return w;
}

const w=boot();
const B=w.eval('SS_BODIES'), P=w.eval('ssPrep()');
const NM=k=>B[k].nm[0];
const V=()=>new (w.eval('THREE.Vector3'))();
const pos=(o,M)=>w.eval('ssOrbitPos')(o,M,V());

console.log('\n1. DATI: completezza e coerenza con i livelli');
ok(B.length===13,'13 corpi, uno per livello');
ok(w.eval('THEMES').length===13,'13 temi nel Labirinto: gli indici combaciano');
ok(w.eval('EDGES').length===13,'EDGES ha ancora 13 voci (serve a gioco-labirinto.js)');
ok(B.every(b=>b.nm&&b.temp&&b.fact&&b.em),'ogni corpo ha nome, temperatura, curiosità, emoji');
ok(B.slice(0,3).concat(B.slice(4,10)).every(b=>b.aAU>0&&b.rot>0&&b.rKm>0),
   'i 9 pianeti hanno semiasse, rotazione e raggio');

console.log('\n2. PRIMA LEGGE: ellisse col Sole in un fuoco');
[0,4,9].forEach(k=>{
  const o=P[k], a=o.aS, e=o.e;
  let rMin=1e9, rMax=0;
  for(let i=0;i<720;i++){ const p=pos(o,i/720*Math.PI*2), r=Math.hypot(p.x,p.y,p.z);
    rMin=Math.min(rMin,r); rMax=Math.max(rMax,r); }
  near(rMin,a*(1-e),a*0.002,NM(k)+': perielio = a(1−e)');
  near(rMax,a*(1+e),a*0.002,NM(k)+': afelio = a(1+e)');
});

console.log('\n3. SECONDA LEGGE: più veloce al perielio');
[0,9].forEach(k=>{
  const o=P[k], dM=0.004;
  const vPeri=pos(o,dM).distanceTo(pos(o,-dM));          /* M=0 → perielio */
  const vAph =pos(o,Math.PI+dM).distanceTo(pos(o,Math.PI-dM));
  const teor=(1+o.e)/(1-o.e);                            /* rapporto delle velocità */
  ok(vPeri>vAph,NM(k)+': corre al perielio, rallenta all’afelio');
  near(vPeri/vAph,teor,teor*0.02,NM(k)+': rapporto delle velocità = (1+e)/(1−e)');
});

console.log('\n4. TERZA LEGGE: T² = a³ sui semiassi veri');
near(P[2].periodDays,365.256,0.5,'anno della Terra');
near(P[0].periodDays,87.97,0.6,'anno di Mercurio');
near(P[5].periodDays/365.256,11.86,0.1,'anno di Giove: 11,86 anni');
near(P[8].periodDays/365.256,164.8,1.5,'anno di Nettuno: 164,8 anni');
ok(P.slice(0,3).concat(P.slice(4,10)).every((o,i,arr)=>i===0||o.periodDays>arr[i-1].periodDays),
   'più lontano dal Sole = anno più lungo');

console.log('\n5. PLUTONE entra nell’orbita di NETTUNO senza incontrarlo');
let pMin=1e9, nMax=0, sepMin=1e9;
for(let i=0;i<2000;i++){
  const pp=pos(P[9],i/2000*Math.PI*2), nn=pos(P[8],i/2000*Math.PI*2);
  pMin=Math.min(pMin,Math.hypot(pp.x,pp.z)); nMax=Math.max(nMax,Math.hypot(nn.x,nn.z));
}
ok(pMin<nMax,'il perielio di Plutone cade dentro l’orbita di Nettuno ('+pMin.toFixed(1)+' < '+nMax.toFixed(1)+')');
for(let i=0;i<720;i++){
  const pp=pos(P[9],i/720*Math.PI*2);
  for(let j=0;j<720;j+=4){
    const nn=pos(P[8],j/720*Math.PI*2);
    sepMin=Math.min(sepMin,pp.distanceTo(nn));
  }
}
ok(sepMin>1.2,'le due orbite non si toccano mai: Plutone passa più in alto (min '+sepMin.toFixed(2)+')');
near(B[9].inc,17.14,0.01,'inclinazione di Plutone: 17,14°');

console.log('\n6. POSIZIONI VERE alla data di oggi');
const lon=k=>{ const p=pos(P[k],P[k].M); let d=Math.atan2(p.z,p.x)/Math.PI*180; return (d+360)%360; };
/* longitudine eliocentrica della Terra = longitudine del Sole vista da noi + 180° */
const d=new Date(), doy=(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,1))/86400000;
const sunLon=(doy-79.5)*(360/365.2422);                  /* 0° all'equinozio di marzo */
const attesa=((sunLon+180)%360+360)%360;
near(Math.min(Math.abs(lon(2)-attesa),360-Math.abs(lon(2)-attesa)),0,4,
  'la Terra è dove deve stare oggi (long. eliocentrica ≈ '+attesa.toFixed(0)+'°)');
ok(P.slice(0,3).concat(P.slice(4,10)).every(o=>isFinite(o.M)),'nessuna anomalia media NaN');

console.log('\n7. VISTA IN FILA: tutti alla longitudine 0');
[0,1,2,4,5,6,7,8,9].forEach(k=>{
  const p=pos(P[k],P[k].alignM);
  const l=Math.abs(Math.atan2(p.z,p.x)/Math.PI*180);
  ok(p.x>0&&l<3.5,NM(k)+': allineato a longitudine ~0 ('+l.toFixed(1)+'°)');
});
ok(Math.abs(P[3].alignM-P[10].alignM)>1,'Luna e ISS si aprono a ventaglio, non si sovrappongono');

console.log('\n8. ROTAZIONI E INCLINAZIONI');
near(B[2].rot,0.99727,1e-5,'giorno siderale della Terra: 23h56m');
near(B[5].rot,0.41354,1e-5,'Giove: un giro in meno di 10 ore');
ok(B[5].rot===Math.min.apply(null,B.filter(b=>b.rKm).map(b=>b.rot)),'Giove è il più veloce a ruotare');
ok(B[1].rot>224.7,'il giorno di Venere (243 gg) dura più del suo anno (225 gg)');
[[1,177.36],[7,97.77],[9,122.53]].forEach(t=>
  ok(B[t[0]].tilt===t[1]&&B[t[0]].tilt>90,NM(t[0])+': asse a '+t[1]+'° → ruota al contrario'));
[[0,0.034],[2,23.44],[4,25.19],[6,26.73],[8,28.32]].forEach(t=>
  near(B[t[0]].tilt,t[1],0.01,NM(t[0])+': asse inclinato di '+t[1]+'°'));
ok(B[3].rot===B[3].days&&B[3].sync,'la Luna è in rotazione sincrona: sempre la stessa faccia');
ok(P[5].spinPerSec>P[0].spinPerSec*100,'i rapporti fra le rotazioni restano quelli veri');

console.log('\n9. SCALE COMPRESSE MA ORDINATE');
const ord=(arr,get)=>arr.every((x,i)=>i===0||get(x)>get(arr[i-1]));
const pl=[0,1,2,4,5,6,7,8,9];
ok(ord(pl.map(k=>P[k]),o=>o.aS),'le distanze crescono nell’ordine vero, Mercurio→Plutone');
const bySize=[...pl].sort((a,b)=>B[a].rKm-B[b].rKm);
ok(ord(bySize.map(k=>P[k]),o=>o.rS),'i diametri in scena rispettano l’ordine vero');
ok(P[5].rS>P[6].rS&&P[6].rS>P[7].rS&&P[2].rS>P[4].rS&&P[4].rS>P[0].rS&&P[0].rS>P[9].rS,
   'Giove > Saturno > Urano … Terra > Marte > Mercurio > Plutone');
near(P[2].rS,0.95,0.02,'la Terra misura 0,95 unità di scena');
ok(P[10].aS<P[3].aS&&P[3].aS<w.eval('SS_L2'),'ISS più bassa della Luna, L2 oltre la Luna');

console.log('\n10. ANELLI DI SATURNO ai raggi veri');
const R=w.eval('SS_RING').saturno;
near(R.in,74500/58232,0.02,'bordo interno dell’anello C: 1,28 raggi');
near(R.out,136780/58232,0.02,'bordo esterno dell’anello A: 2,35 raggi');
const cass=R.tex.find(t=>t[2].indexOf('120,110,95')>=0);
const cIn=R.in+cass[0]*(R.out-R.in), cOut=R.in+cass[1]*(R.out-R.in);
near(cIn,117580/58232,0.03,'divisione di Cassini: inizio a 2,02 raggi');
near(cOut,122170/58232,0.03,'divisione di Cassini: fine a 2,10 raggi');
ok(w.eval('SS_RING').urano&&w.eval('SS_RING').nettuno,'anche Urano e Nettuno hanno i loro anelli');

console.log('\n11. EQUAZIONE DI KEPLERO risolta bene');
const solve=w.eval('ssSolveE');
[[0.0,0.5],[0.2488,1.0],[0.2056,3.0],[0.0489,-2.0],[0.24,0.001]].forEach(t=>{
  const e=t[0], M=t[1], E=solve(M,e);
  near(E-e*Math.sin(E),M,1e-9,'E−e·sinE = M  (e='+e+', M='+M+')');
});

console.log('\n12. SCENA: si costruisce, gira, risponde');
w.eval('ssBuildScene()');
ok(w.eval('ssB.length')===13,'13 corpi nella scena');
ok(w.eval('ssHits.length')===13,'13 zone toccabili');
ok(w.eval('ssEdges.length')>0,'le rotte fra i livelli sono state create');
ok(w.eval('ssB[6].mesh.children.length')>0,'Saturno ha i suoi anelli attaccati');
ok(w.eval('ssB[12].grp.parent===ssB[3].mesh'),'la Base Lunare è appoggiata sulla Luna e ruota con lei');
ok(w.eval('ssB[10].grp.parent!==ssB[2].grp'),'la ISS sta nel gruppo inclinato come l’equatore terrestre');
ok(w.eval('Math.abs(ssB[10].grp.parent.rotation.z-ssPrep()[2].tiltRad)<1e-9'),
   'quel gruppo è inclinato di 23,44° come l’asse della Terra');
ok(w.eval('ssB.every(b=>b.mats.length>0)'),'ogni corpo ha i suoi materiali (spegnerne uno non spegne le lune)');
ok(w.eval('ssB[2].mats.length')<w.eval('ssB[2].tilt.children.length+40'),'i materiali della Terra non includono quelli della Luna');

w.eval('ssBuildDOM()');
ok(w.document.querySelectorAll('#ss .ssLbl').length===13,'13 etichette nel DOM');
w.eval('ssOn=true; ssRefresh();');
ok(w.document.querySelector('#ssLegend').textContent.indexOf('ellittiche')>0,'la legenda dice cosa è vero');
const p0=w.eval('JSON.stringify([ssB[2].grp.position.x,ssB[2].grp.position.z])');
w.eval('ssAligned=false; for(let i=0;i<30;i++) ssFrame();');
const p1=w.eval('JSON.stringify([ssB[2].grp.position.x,ssB[2].grp.position.z])');
ok(p0!==p1,'dopo 30 frame la Terra si è mossa lungo l’orbita');
ok(w.eval('ssB[5].mesh.rotation.y>0'),'Giove ha ruotato su se stesso');
ok(w.eval('isFinite(ssCam.position.x)&&isFinite(ssCam.position.y)'),'la camera resta in un posto sensato');
const lbl=w.document.querySelector('#ss .ssLbl');
ok(lbl.style.left!=='','le etichette vengono proiettate sullo schermo');

console.log('\n13. SCHEDA DEL PIANETA');
w.eval('ssOpenCard(6)');
const card=w.document.getElementById('ssCard');
ok(card.classList.contains('open'),'la scheda si apre');
ok(card.textContent.indexOf('Saturno')>=0,'mostra il nome giusto');
ok(card.textContent.indexOf('26.73°')>=0||card.textContent.indexOf('26,73')>=0,'mostra l’inclinazione dell’asse');
ok(/29,5 anni|29,4 anni/.test(card.textContent),'mostra l’anno di Saturno (29,5 anni)');
ok(card.textContent.indexOf('290')>=0,'mostra le lune, senza inseguire il numero esatto');
w.eval('ssOpenCard(1)');
ok(w.document.getElementById('ssCard').textContent.indexOf('al contrario')>=0,
   'la scheda di Venere avverte che gira al contrario');
w.eval('ssCloseCard()');
ok(!card.classList.contains('open'),'la scheda si chiude');

console.log('\n14. MENU E CICLO DI VITA');
ok(w.eval('typeof ssEnter')==='function'&&w.eval('typeof ssExit')==='function','ha entrata e uscita per il menu');
w.eval('ssExit()');
ok(w.document.getElementById('ss').style.display==='none','uscendo l’overlay si chiude');
ok(w.eval('ssOn')===false,'uscendo il ciclo di rendering si ferma');
w.eval('ssFrame()');
ok(w.eval('ssRunning')===false,'un frame in ritardo non riaccende nulla');
ok(w.eval('typeof buildMap')==='undefined'||w.eval('String(buildMap).indexOf("av")>=0'),
   'questo file NON definisce più buildMap: la mappa in prima persona è intatta');

console.log('\n================================');
console.log(pass+' passati, '+fail+' falliti');
process.exit(fail?1:0);
