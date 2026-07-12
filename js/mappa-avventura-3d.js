/* Mappa dei livelli in prima persona. Sostituisce buildMap() lasciando intatta
   la mappa astronomica, che viene riutilizzata dal gioco Volo Planetario. */
let avScene=null,avCam=null,avRen=null,avCv=null,avRun=false,avClock=null,avResize=null;
let avYaw=0,avX=0,avZ=12,avKeys={},avTouch={f:0,t:0},avPortals=[];
let avStepT=0,avAmbientT=0,avPromptLevel=-1;
const AV_POS=[
  [0,0],[0,-18],[-16,-32],[-34,-32],[-16,-49],[16,-32],[34,-32],[16,-49],
  [0,-65],[-19,-78],[19,-78],[-19,-95],[19,-95]
];
const AV_ROADS=[[0,1],[1,2],[1,5],[2,3],[2,4],[5,6],[5,7],[4,8],[7,8],[8,9],[8,10],[9,11],[10,12]];

function avMat(c){return new THREE.MeshLambertMaterial({color:c});}
function avBox(w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),avMat(c));m.position.set(x,y,z);avScene.add(m);return m;}
function avTextSprite(txt,bg){
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
  x.fillStyle=bg||'#17315f';x.fillRect(0,0,512,128);x.strokeStyle='#fff';x.lineWidth=7;x.strokeRect(5,5,502,118);
  x.fillStyle='#fff';x.font='bold 37px Andika, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,256,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c)}));s.scale.set(7.2,1.8,1);return s;
}
function avRoad(a,b){
  const A=AV_POS[a],B=AV_POS[b],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz);
  const r=avBox(5.4,.07,len,0x65707d,(A[0]+B[0])/2,.04,(A[1]+B[1])/2);r.rotation.y=Math.atan2(dx,dz);
  const line=avBox(.14,.03,len-.8,0xffed75,r.position.x,.09,r.position.z);line.rotation.y=r.rotation.y;
}
function avSound(kind){
  if(!MUSICON)return;
  try{mCtx();if(kind==='step')beep(105,.045,0,'sine',.018);else if(kind==='portal'){beep(440,.12,0,'sine',.07);beep(660,.15,.1,'sine',.07);beep(880,.22,.22,'sine',.08);}else if(kind==='sign')beep(330,.08,0,'triangle',.035);else if(kind==='bird'){beep(1250,.06,0,'sine',.018);beep(1580,.07,.08,'sine',.015);}}catch(e){}
}
function avTree(x,z,s){
  avBox(.34*s,2.4*s,.34*s,0x80542f,x,1.2*s,z);
  const c=new THREE.Mesh(new THREE.ConeGeometry(1.35*s,3.8*s,7),avMat(0x26743d));c.position.set(x,3.2*s,z);avScene.add(c);
}
function avHouse(x,z,col){
  avBox(4,2.5,3.5,col,x,1.25,z);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.05,1.8,4),avMat(0x9b3f32));roof.position.set(x,3.35,z);roof.rotation.y=Math.PI/4;avScene.add(roof);
  avBox(.8,1.45,.12,0x6b4527,x, .73,z+1.81);avBox(.65,.65,.13,0x8ee3ff,x-1.15,1.55,z+1.82);avBox(.65,.65,.13,0x8ee3ff,x+1.15,1.55,z+1.82);
}
function avLamp(x,z){
  avBox(.12,2.7,.12,0x343b45,x,1.35,z);const l=new THREE.Mesh(new THREE.SphereGeometry(.28,8,6),new THREE.MeshBasicMaterial({color:0xffe88a}));l.position.set(x,2.82,z);avScene.add(l);
  const p=new THREE.PointLight(0xffd86a,.55,8);p.position.copy(l.position);avScene.add(p);
}
function avMakeWorld(){
  avScene=new THREE.Scene();avScene.background=new THREE.Color(0x88c9ff);avScene.fog=new THREE.Fog(0x88c9ff,28,115);
  avScene.add(new THREE.HemisphereLight(0xe8f6ff,0x52753b,1.15));
  const sun=new THREE.DirectionalLight(0xfff2cf,.8);sun.position.set(-20,35,15);avScene.add(sun);
  avBox(150,.3,135,0x65a84f,0,-.22,-44);
  /* rilievi e punti di riferimento: il mondo deve essere leggibile anche da lontano */
  [[-55,-45,13],[55,-55,17],[-48,-98,11],[48,-100,14]].forEach(h=>{const m=new THREE.Mesh(new THREE.ConeGeometry(h[2],12,9),avMat(0x4f8b48));m.position.set(h[0],5.7,h[1]);avScene.add(m);});
  AV_ROADS.forEach(e=>avRoad(e[0],e[1]));
  for(let i=0;i<65;i++){
    const x=(Math.random()-.5)*130,z=18-Math.random()*125;if(Math.abs(x)<7&&z>-105)continue;
    avTree(x,z,.75+Math.random()*.65);
  }
  avHouse(-10,-8,0xf0c66d);avHouse(11,-43,0x76b8d8);avHouse(-29,-63,0xd99b73);avHouse(29,-86,0xb9a1df);
  for(let z=8;z>-101;z-=9){avLamp(-3.6,z);avLamp(3.6,z-4.5);}
  for(let i=0;i<45;i++){const x=(Math.random()-.5)*105,z=12-Math.random()*118;const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.18+Math.random()*.38,0),avMat(0x85857d));r.position.set(x,.15,z);r.rotation.set(Math.random(),Math.random(),0);avScene.add(r);}
  for(let i=0;i<80;i++){const x=(Math.random()-.5)*110,z=12-Math.random()*118;if(Math.abs(x)<4)continue;const f=new THREE.Mesh(new THREE.SphereGeometry(.09,5,4),new THREE.MeshBasicMaterial({color:[0xffe45c,0xff71b8,0xeef7ff][i%3]}));f.position.set(x,.18,z);avScene.add(f);}
  const pond=new THREE.Mesh(new THREE.CircleGeometry(7,30),new THREE.MeshLambertMaterial({color:0x4fa9d8,transparent:true,opacity:.82,side:THREE.DoubleSide}));pond.rotation.x=-Math.PI/2;pond.position.set(44,.02,-22);avScene.add(pond);
  for(let i=0;i<7;i++){const cloud=new THREE.Group();for(let j=0;j<4;j++){const q=new THREE.Mesh(new THREE.SphereGeometry(1.6+j*.15,10,7),new THREE.MeshBasicMaterial({color:0xffffff}));q.position.set(j*1.6,Math.sin(j)*.35,0);cloud.add(q)}cloud.position.set(-45+i*15,14+(i%3)*3,-25-i*11);avScene.add(cloud);}
  avPortals=[];
  AV_POS.forEach((p,k)=>{
    const un=unlockedSet.has(k),col=un?0x7653e8:0x59606c;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05,.3,10,28),avMat(col));ring.position.set(p[0],2.25,p[1]);avScene.add(ring);
    const glow=new THREE.Mesh(new THREE.CircleGeometry(1.72,24),new THREE.MeshBasicMaterial({color:un?0x9d84ff:0x333945,transparent:true,opacity:.7,side:THREE.DoubleSide}));glow.position.copy(ring.position);glow.position.z+=.05;avScene.add(glow);
    const sign=avTextSprite((k+1)+' · '+THEMES[k].emoji+' '+THEMES[k].name[LI()],un?'#284a88':'#4d535d');sign.position.set(p[0],5.7,p[1]);avScene.add(sign);
    avPortals.push({k,x:p[0],z:p[1],ring,un});
  });
  [[0,-9,'← SCOPERTE   MISSIONI →'],[0,-57,'← SPAZIO   TECNOLOGIA →']].forEach(s=>{
    const q=avTextSprite(s[2],'#14623a');q.position.set(s[0],3.8,s[1]);avScene.add(q);
    avBox(.18,2.7,.18,0x6b472b,s[0],1.35,s[1]);
  });
  avCam=new THREE.PerspectiveCamera(72,1,.1,170);avClock=new THREE.Clock();
}
function avBuildDom(){
  const w=$('mapWrap');$('menu').classList.add('avMode');w.innerHTML='<canvas id="mapCanvas"></canvas><div id="avHud"><div class="avHudInfo"><b>🧭 MAPPA DEI LIVELLI</b><span id="avNear">Segui i cartelli e raggiungi un portale</span></div><div id="avPad"><button data-a="l" aria-label="Gira a sinistra">↶</button><button data-a="b" aria-label="Indietro">▼</button><button data-a="f" aria-label="Avanti">▲</button><button data-a="r" aria-label="Gira a destra">↷</button></div><div class="avHudActions"><button id="avMusic" aria-label="Musica">'+(MUSICON?'🎵':'🔇')+'</button><button id="avExit" aria-label="Altri giochi">🎮</button></div></div><div class="overlay" id="avConfirm"><div class="avConfirmCard"><div id="avConfirmEm"></div><h2 id="avConfirmTitle"></h2><p id="avConfirmText"></p><div><button id="avConfirmYes">ENTRA 🚪</button><button id="avConfirmNo">CONTINUA A ESPLORARE</button></div></div></div>';
  avCv=$('mapCanvas');avRen=new THREE.WebGLRenderer({canvas:avCv,antialias:true});avRen.setPixelRatio(Math.min(devicePixelRatio||1,2));
  avResize=()=>{
    if(!avCv||!avCv.isConnected||!avRen||!avCam)return;
    const r=w.getBoundingClientRect();
    /* showMenu() costruisce la mappa un istante prima di rendere visibile il menu.
       In quel momento getBoundingClientRect può essere 0×0: usa il viewport come
       misura iniziale e ricontrolla dopo il primo frame visibile. */
    const ww=Math.max(1,r.width||window.innerWidth||800);
    const hh=Math.max(1,r.height||window.innerHeight||600);
    avRen.setSize(ww,hh,false);avCam.aspect=ww/hh;avCam.updateProjectionMatrix();
  };
  avResize();addEventListener('resize',avResize);
  w.tabIndex=0;w.onpointerdown=()=>w.focus();
  w.querySelectorAll('#avPad button').forEach(b=>{const a=b.dataset.a,down=e=>{e.preventDefault();mCtx();if(a==='f'||a==='b')avTouch.f=a==='f'?1:-1;else avTouch.t=a==='l'?1:-1;},up=()=>{if(a==='f'||a==='b')avTouch.f=0;else avTouch.t=0;};b.onpointerdown=down;b.onpointerup=up;b.onpointercancel=up;});
  $('avExit').onclick=()=>{avRun=false;$('menu').classList.remove('avMode');$('menu').style.display='none';showModeSel();};
  $('avMusic').onclick=()=>{toggleMusic();$('avMusic').textContent=MUSICON?'🎵':'🔇';};
  $('avConfirmNo').onclick=()=>{avPromptLevel=-1;$('avConfirm').style.display='none';avSound('sign');};
  $('avConfirmYes').onclick=()=>{const k=avPromptLevel;avPromptLevel=-1;$('avConfirm').style.display='none';if(k<0)return;avPortals[k].un?startLevel(k):openLetturina(k);};
}
function avAskLevel(p){
  if(avPromptLevel>=0)return;avPromptLevel=p.k;avSound('portal');
  $('avConfirmEm').textContent=p.un?THEMES[p.k].emoji:'🔒';$('avConfirmTitle').textContent=(p.k+1)+'. '+THEMES[p.k].name[LI()];
  $('avConfirmText').textContent=p.un?'Vuoi entrare in questo labirinto?':'Questo livello è ancora chiuso. Vuoi leggere la storia per sbloccarlo?';
  $('avConfirmYes').textContent=p.un?'ENTRA NEL LABIRINTO 🚪':'LEGGI LA STORIA 📖';$('avConfirm').style.display='flex';
}
function avFrame(){
  if($('menu').style.display==='none'||!avCv||!avCv.isConnected){avRun=false;return}requestAnimationFrame(avFrame);
  const dt=Math.min(avClock.getDelta(),.05),turn=(avKeys.ArrowLeft||avKeys.a?1:0)-(avKeys.ArrowRight||avKeys.d?1:0)+avTouch.t;
  const f=(avKeys.ArrowUp||avKeys.w?1:0)-(avKeys.ArrowDown||avKeys.s?1:0)+avTouch.f;avYaw+=turn*2.05*dt;
  if(f&&avPromptLevel<0){const nx=avX-Math.sin(avYaw)*f*7*dt,nz=avZ-Math.cos(avYaw)*f*7*dt;if(Math.abs(nx)<70&&nz<18&&nz>-112){avX=nx;avZ=nz;avStepT-=dt;if(avStepT<=0){avSound('step');avStepT=.36;}}}
  avCam.position.set(avX,1.72,avZ);avCam.lookAt(avX-Math.sin(avYaw),1.68,avZ-Math.cos(avYaw));
  let near=null,dist=99;avPortals.forEach(p=>{p.ring.rotation.z+=dt*.65;const d=Math.hypot(avX-p.x,avZ-p.z);if(d<dist){dist=d;near=p;}});
  const msg=$('avNear');if(dist<2.35&&avPromptLevel<0&&!avKeys.entered){avKeys.entered=1;avAskLevel(near);}if(dist<4.2)msg.textContent=near.un?'Portale: '+THEMES[near.k].name[LI()]:'🔒 Livello da sbloccare';else{msg.textContent='Frecce/WASD · segui strade e cartelli';avKeys.entered=0;}
  avAmbientT-=dt;if(avAmbientT<=0){avAmbientT=5+Math.random()*7;avSound('bird');}
  avRen.render(avScene,avCam);
}
addEventListener('keydown',e=>{avKeys[e.key]=1;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)&&$('menu').style.display!=='none')e.preventDefault();});
addEventListener('keyup',e=>{avKeys[e.key]=0;});
function buildMap(){
  avX=0;avZ=12;avYaw=0;avMakeWorld();avBuildDom();
  $('howto').textContent=LI()===0?'Cammina in prima persona. Agli incroci leggi i cartelli; entra nei portali luminosi.':'Walk in first person. Read the signs and enter a glowing portal.';
  /* Il menu diventa display:flex subito dopo il ritorno da buildMap(). */
  requestAnimationFrame(()=>{if(avResize)avResize();requestAnimationFrame(()=>{if(avResize)avResize();});});
  if(!avRun){avRun=true;avClock.getDelta();requestAnimationFrame(avFrame);}
}
