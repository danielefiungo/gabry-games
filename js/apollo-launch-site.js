/* Complesso di lancio ispirato al Mobile Launcher Apollo di LC-39.
   Nove bracci: https://www.nasa.gov/wp-content/uploads/static/history/afj/pdf/saturn-V-step-by-step.pdf
   Quote visive semplificate; il crawler non rimane sotto la piattaforma al lancio. */
(function(){
  'use strict';
  window.msBuildApolloSite=function(T){
    const group=new T.Group();group.name='Apollo mobile launcher and LC-39';
    const mat=(color,roughness=.8)=>new T.MeshStandardMaterial({color,roughness});
    const red=mat(0xa9402f),deck=mat(0x686e70),concrete=mat(0xa4a598),dark=mat(0x242a2a),rail=mat(0xd7d5c6),grass=mat(0x667558);
    // Texture procedurale del terreno costiero: nessuna immagine esterna.
    const terrainCanvas=document.createElement('canvas');terrainCanvas.width=terrainCanvas.height=256;
    const terrainCtx=terrainCanvas.getContext('2d');terrainCtx.fillStyle='#788065';terrainCtx.fillRect(0,0,256,256);
    let seed=39;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<6000;i++){terrainCtx.fillStyle=i%3?'rgba(42,62,36,.13)':'rgba(181,164,116,.18)';terrainCtx.fillRect(rnd()*256,rnd()*256,1+rnd()*5,1+rnd()*3);}
    const terrainTexture=new T.CanvasTexture(terrainCanvas);terrainTexture.wrapS=terrainTexture.wrapT=T.RepeatWrapping;terrainTexture.repeat.set(90,90);terrainTexture.encoding=T.sRGBEncoding;grass.map=terrainTexture;
    // Travi e pannelli ripetuti sono istanze: pochi draw call per tutta la torre.
    function structure(parent){
      const batches=new Map(),dummy=new T.Object3D();
      function add(material,position,scale,quaternion){
        dummy.position.copy(position);dummy.scale.copy(scale);dummy.quaternion.copy(quaternion||new T.Quaternion());dummy.updateMatrix();
        if(!batches.has(material))batches.set(material,[]);batches.get(material).push(dummy.matrix.clone());
      }
      return {
        box(m,x,y,z,w,h,d){add(m,new T.Vector3(x,y,z),new T.Vector3(w,h,d));},
        beam(m,a,b,w=.35){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);add(m,start.add(end).multiplyScalar(.5),new T.Vector3(w,delta.length(),w),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));},
        finish(){batches.forEach((list,m)=>{const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),m,list.length);list.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);});}
      };
    }
    const b=structure(group);
    // Terrapieno, due carreggiate del crawlerway e canale di scarico.
    b.box(grass,0,-92,0,5000,3,5000);
    b.box(concrete,-8,-89,0,140,3,110);
    b.box(concrete,-23,-90,370,13,1,650);b.box(concrete,1,-90,370,13,1,650);
    b.box(dark,0,-87,17,21,4,148);
    b.box(concrete,-13,-84,18,5,12,152);b.box(concrete,13,-84,18,5,12,152);
    // Viabilità di servizio e due fasce di ghiaia verso la piattaforma.
    b.box(dark,-140,-90.1,0,11,.3,1200);b.box(dark,-90,-90,115,110,.3,9);
    b.box(concrete,-143,-89.9,0,.2,.1,1200);b.box(concrete,-137,-89.9,0,.2,.1,1200);
    for(let z=140;z<600;z+=28)b.box(rail,-140,-89.8,z,.3,.1,9);
    // Sei supporti e piattaforma scatolata con apertura centrale libera.
    for(const x of [-39,18])for(const z of [-21,0,21])b.box(concrete,x,-84,z,7,12,7);
    b.box(deck,-25,-75,0,38,9,45);b.box(deck,17,-75,0,14,9,45);
    b.box(deck,1,-75,-18,18,9,9);b.box(deck,1,-75,18,18,9,9);
    for(let x=-42;x<=22;x+=4){
      b.beam(rail,[x,-70,22],[x,-67.8,22],.18);b.beam(rail,[x,-70,-22],[x,-67.8,-22],.18);
    }
    b.beam(rail,[-44,-68,22],[24,-68,22],.18);b.beam(rail,[-44,-68,-22],[24,-68,-22],.18);
    for(let x=-40;x<24;x+=7){b.box(dark,x,-75,22.6,3,2,.1);b.box(rail,x,-75.2,22.7,2,.12,.1);}
    // Quattro hold-down arms sostengono il bordo esterno del primo stadio.
    for(const x of [-8,8])for(const z of [-7,7]){
      b.box(dark,x,-68,z,2,5,2);b.beam(deck,[x,-66,z],[x*.83,-64,z*.83],1.3);
    }
    // Tail service masts alla base, collegamenti criogenici e tubazioni.
    for(const [x,z] of [[-11,9],[11,8],[1,-12]]){
      b.box(deck,x,-67,z,2.2,7,2);b.beam(rail,[x,-64,z],[x*.65,-62,z*.65],.7);
    }
    for(const z of [-18,-16,-14])b.beam(rail,[-41,-69,z],[-9,-69,z],.5);
    // Torre ombelicale rossa: quattro montanti, piani, diagonali e ascensore.
    const tx=-29,tz=-5;
    for(const dx of [-7,7])for(const dz of [-6,6])b.beam(red,[tx+dx,-70,tz+dz],[tx+dx,104,tz+dz],1.1);
    b.box(deck,tx-3,15,tz-4,4.6,168,4);
    for(let y=-70;y<=101;y+=9){
      b.box(deck,tx,y,tz,16,.55,14);
      for(const z of [tz-6,tz+6]){
        b.beam(red,[tx-7,y,z],[tx+7,y+9,z],.45);b.beam(red,[tx+7,y,z],[tx-7,y+9,z],.45);
        b.beam(rail,[tx-7,y+2,z],[tx+7,y+2,z],.16);
      }
      for(const x of [tx-7,tx+7])b.beam(red,[x,y,tz-6],[x,y+9,tz+6],.45);
    }
    // Gru in cima alla torre e cavo di sollevamento.
    b.box(red,tx,106,tz,4,5,4);b.box(red,tx+10,110,tz,40,2.2,3);
    b.beam(red,[tx-10,111,tz],[tx,117,tz],.5);b.beam(red,[tx,117,tz],[tx+28,111,tz],.5);
    b.beam(dark,[tx+27,110,tz],[tx+27,99,tz],.13);
    b.box(deck,tx-8,108,tz,5,3,5);
    b.finish();
    // Nove passerelle orientabili, l’ultima porta alla White Room Apollo.
    const arms=[];
    [-56,-39,-7,3,23,40,58,70,75].forEach((y,i)=>{
      const arm=new T.Group();arm.name=i===8?'Crew access arm and White Room':'Swing arm '+(i+1);arm.position.set(tx+8,y,0);group.add(arm);
      const a=structure(arm),end=i>6?18:14.5;
      a.box(deck,end/2,0,0,end,.7,2.8);
      for(const z of [-1.3,1.3]){
        a.beam(red,[0,2,z],[end,2,z],.22);
        for(let x=0;x<end;x+=3){a.beam(red,[x,0,z],[x,2,z],.18);a.beam(red,[x,0,z],[Math.min(x+3,end),2,z],.18);}
      }
      a.beam(rail,[0,-.8,0],[end,-.8,0],.38);
      if(i===8){a.box(rail,end-1,1,0,3.8,3.5,4);a.box(dark,end+1,1,0,.1,2,2);}
      a.finish();arms.push(arm);
    });
    // Edifici e serbatoi lontani: scala e profondità atmosferica.
    const distant=new T.Group();group.add(distant);const d=structure(distant);
    d.box(concrete,-320,-53,-500,63,75,54);d.box(rail,-320,-15,-500,64,2,55);
    for(let x=-340;x<-290;x+=14)d.box(deck,x,-50,-472.8,6,65,.3);
    d.box(concrete,-266,-80,-487,45,22,35);
    d.box(deck,118,-87,-120,20,6,12);
    d.finish();
    for(const [x,z] of [[116,-150],[-140,-110]]){
      const tank=new T.Mesh(new T.SphereGeometry(10,20,12),rail);tank.position.set(x,-77,z);group.add(tank);
      const stand=new T.Mesh(new T.CylinderGeometry(6,7,8,14),deck);stand.position.set(x,-86,z);group.add(stand);
    }
    // Fumo morbido, senza sfere opache sovrapposte.
    const cv=document.createElement('canvas');cv.width=cv.height=128;const ctx=cv.getContext('2d');
    const gradient=ctx.createRadialGradient(64,64,3,64,64,62);gradient.addColorStop(0,'rgba(238,233,219,.88)');gradient.addColorStop(.4,'rgba(226,224,218,.58)');gradient.addColorStop(1,'rgba(215,220,223,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
    const texture=new T.CanvasTexture(cv),smoke=[];
    for(let i=0;i<38;i++){
      const puff=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:0,depthWrite:false}));group.add(puff);smoke.push(puff);
    }
    const vent=[];
    for(let i=0;i<6;i++){
      const puff=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:.28,depthWrite:false}));group.add(puff);vent.push(puff);
    }
    return {group,arms,update(alt,t,flags){
      const release=flags.liftoff?Math.min(1,alt*22):flags.motori?.7:0;
      arms.forEach((arm,i)=>{arm.rotation.y=-(i>5?Math.max(release,flags.portello?.13:0):release)*Math.PI*.62;});
      smoke.forEach((p,i)=>{
        const life=(t*.3+i/38)%1,side=i%2?1:-1;
        p.visible=!!flags.motori;
        p.position.set(side*(12+life*100),-82+life*19,28+life*75+(i%5)*4);
        const size=12+life*78;p.scale.set(size*1.35,size,1);p.material.opacity=(1-life)*.7*Math.max(.12,1-alt*.8);
      });
      vent.forEach((p,i)=>{
        const life=(t*.25+i/6)%1;p.visible=alt<.015;
        p.position.set(8+life*15,34+life*6,(i%2)*3);p.scale.set(5+life*20,3+life*8,1);p.material.opacity=(1-life)*.28;
      });
    }};
  };
})();
