/* Modulo lunare Apollo e superficie lunare. Il modulo di discesa rimane
   sulla Luna; quello di risalita effettua il rendez-vous in orbita.
   Riferimento: https://www.nasa.gov/history/apollos-lunar-module-bridged-technological-leap-to-the-moon/ */
(function(){
  'use strict';
  window.msBuildLem=function(T){
    const group=new T.Group();group.name='Apollo lunar module';
    const ascent=new T.Group(),descent=new T.Group();ascent.name='LM ascent stage';descent.name='LM descent stage';group.add(ascent,descent);
    const gold=new T.MeshStandardMaterial({color:0xc39237,roughness:.7,metalness:.35,flatShading:true});
    const silver=new T.MeshStandardMaterial({color:0xb6babd,roughness:.62,metalness:.22,flatShading:true});
    const black=new T.MeshStandardMaterial({color:0x18212b,roughness:.48});
    const white=new T.MeshStandardMaterial({color:0xe6e1d5,roughness:.8});
    function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    function strut(parent,a,b,r,mat){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),6),mat,parent);o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
    mesh(new T.CylinderGeometry(10,10,7,8),gold,descent,0,-3,0).rotation.y=Math.PI/8;
    const bell=mesh(new T.CylinderGeometry(1.5,3,6,16,1,true),black,descent,0,-9,0);bell.material.side=T.DoubleSide;
    const gear=new T.Group();descent.add(gear);
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4,x=Math.sin(a)*22,z=Math.cos(a)*22;
      strut(gear,[Math.sin(a)*8,0,Math.cos(a)*8],[x,-15,z],.48,gold);
      strut(gear,[Math.sin(a-.3)*9,-6,Math.cos(a-.3)*9],[x,-15,z],.25,silver);
      strut(gear,[Math.sin(a+.3)*9,-6,Math.cos(a+.3)*9],[x,-15,z],.25,silver);
      mesh(new T.CylinderGeometry(3.3,3.7,.65,12),gold,gear,x,-16,z);
    }
    // Scala esterna, piattaforma e involucri termici sfaccettati.
    for(let y=-14;y<1;y+=1.6)strut(descent,[-1.3,y,13],[1.3,y,13],.13,silver);
    for(const x of [-1.3,1.3])strut(descent,[x,1,10],[x,-15,15],.18,silver);
    mesh(new T.BoxGeometry(5,.4,5),gold,descent,0,1,10);
    mesh(new T.CylinderGeometry(6,8,11,8),silver,ascent,0,7,0).rotation.y=Math.PI/8;
    mesh(new T.BoxGeometry(11,7,9),silver,ascent,0,7,2);
    mesh(new T.BoxGeometry(5,6,6),black,ascent,-7,7,-2);
    mesh(new T.BoxGeometry(5,5,7),white,ascent,7,6,-2);
    mesh(new T.CylinderGeometry(2,2,3,16),silver,ascent,0,14,0);
    mesh(new T.CylinderGeometry(1.2,2.5,4,14,1,true),black,ascent,0,-1,0);
    for(const dir of [-1,1]){
      const windowShape=new T.Shape();windowShape.moveTo(dir*1.3,10.5);windowShape.lineTo(dir*5,9.8);windowShape.lineTo(dir*4.2,6.6);windowShape.closePath();
      mesh(new T.ShapeGeometry(windowShape),black,ascent,0,0,6.55);
      const pod=mesh(new T.BoxGeometry(2,2,2),white,ascent,dir*9,9,0);
      for(const side of [-1,1]){const nozzle=mesh(new T.CylinderGeometry(.3,.6,1.4,8),black,pod,side*1.6,0,0);nozzle.rotation.z=Math.PI/2;}
    }
    mesh(new T.BoxGeometry(3,3,.2),black,ascent,0,3.2,6.6);
    strut(ascent,[4,12,0],[7,18,0],.18,silver);
    const dish=mesh(new T.SphereGeometry(2.8,12,8,0,Math.PI*2,0,Math.PI/2),white,ascent,7,18,0);dish.rotation.z=-.6;
    strut(ascent,[-4,12,0],[-4,17,0],.15,silver);
    const flameMaterial=new T.MeshBasicMaterial({color:0xffd395,transparent:true,opacity:.5,depthWrite:false});
    const descentFlame=mesh(new T.ConeGeometry(2.7,15,12),flameMaterial,descent,0,-18,0);descentFlame.rotation.z=Math.PI;
    const ascentFlame=mesh(new T.ConeGeometry(1.7,11,12),flameMaterial,ascent,0,-8,0);ascentFlame.rotation.z=Math.PI;
    return {group,ascent,descent,update(flags,t,ascentOnly=false){
      descent.visible=!ascentOnly;ascent.visible=true;
      const deployed=flags.lemDetached||flags.landed||flags.lemDescent;gear.scale.set(deployed?1:.58,1,deployed?1:.58);
      descentFlame.visible=!!flags.lemDescent&&!flags.landed&&!flags.lemAscent;
      ascentFlame.visible=!!flags.lemAscent&&!flags.lemRedocked;
      descentFlame.scale.y=ascentFlame.scale.y=.95+Math.sin(t*29)*.05;
    }};
  };
  window.msBuildMoonScene=function(T){
    const group=new T.Group();group.name='Lunar landing site';
    const lem=window.msBuildLem(T);group.add(lem.group);
    const soil=new T.MeshStandardMaterial({color:0x7f7f7b,roughness:1});
    const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d');x.fillStyle='#8c8c88';x.fillRect(0,0,512,512);
    let seed=1969;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<180;i++){
      const cx=rnd()*512,cy=rnd()*512,r=2+rnd()*22,g=x.createRadialGradient(cx-r*.15,cy-r*.15,r*.1,cx,cy,r);
      g.addColorStop(0,'#686967');g.addColorStop(.75,'#767775');g.addColorStop(.9,'#a5a5a0');g.addColorStop(1,'#8c8c88');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);
    }
    const tex=new T.CanvasTexture(cv);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(100,100);soil.map=tex;soil.bumpMap=tex;soil.bumpScale=.45;
    const ground=new T.Mesh(new T.PlaneGeometry(10000,10000),soil);ground.rotation.x=-Math.PI/2;ground.position.y=-16.4;ground.receiveShadow=true;group.add(ground);
    const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x666765,roughness:1,flatShading:true}),100),dummy=new T.Object3D();
    for(let i=0;i<100;i++){const a=rnd()*6.28,r=30+rnd()*240;dummy.position.set(Math.sin(a)*r,-16,Math.cos(a)*r);const s=.5+rnd()*3;dummy.scale.set(s,s*.6,s);dummy.rotation.set(rnd(),rnd(),rnd());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}rocks.castShadow=true;rocks.receiveShadow=true;group.add(rocks);
    const astronaut=new T.Group();astronaut.position.set(-18,-16,16);group.add(astronaut);
    const suit=new T.MeshStandardMaterial({color:0xe8e5db,roughness:.85}),visor=new T.MeshStandardMaterial({color:0x8d6427,roughness:.3,metalness:.5});
    function part(geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;astronaut.add(m);return m;}
    part(new T.BoxGeometry(2,3,1.5),suit,0,3.8,0);part(new T.SphereGeometry(1.25,14,10),suit,0,6,0);part(new T.SphereGeometry(.95,12,8),visor,0,6,.6).scale.z=.5;
    part(new T.BoxGeometry(1.6,2.3,1),suit,0,4,-1);for(const d of [-1,1]){part(new T.CylinderGeometry(.45,.5,2.5,8),suit,d*.6,1.4,0);part(new T.CylinderGeometry(.35,.4,2.6,8),suit,d*1.3,3.7,0).rotation.z=d*.2;}
    const samples=new T.Mesh(new T.BoxGeometry(3,1.5,2),new T.MeshStandardMaterial({color:0xb6bab9,roughness:.6}));samples.position.set(-22,-15,16);group.add(samples);
    return {group,lem,update(flags,t){
      lem.update(flags,t,false);
      const descentProgress=Math.min(1,(flags.lemDescentT||0)/3.5);
      lem.group.position.y=flags.landed?0:40*(1-descentProgress);
      lem.ascent.position.y=flags.lemAscent?Math.min(80,(flags.lemAscentT||0)*15):0;
      astronaut.visible=!!flags.moonWalk&&!flags.lemAscent;samples.visible=!!flags.samples&&!flags.lemAscent;
    }};
  };
})();
