/* Saturn V stilizzato: geometrie reali, illuminate in WebGL e composte nel
   canvas della missione. Nessun modello o texture da scaricare.
   Riferimento: https://science.nasa.gov/3d-resources/saturn-v-rocket/
   Le fasi della missione restano una semplificazione didattica. */
(function(){
  'use strict';
  let view=null, unavailable=false;

  function build(){
    const T=window.THREE;
    if(!T||!window.WebGLRenderingContext) return null;
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true});
    renderer.setClearColor(0x000000,0);
    renderer.outputEncoding=T.sRGBEncoding;
    renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    const scene=new T.Scene();
    const camera=new T.OrthographicCamera(-80,80,120,-120,1,600);
    camera.position.set(0,8,280); camera.lookAt(0,0,0);
    scene.add(new T.HemisphereLight(0xe5f1ff,0x25334b,.55));
    const sun=new T.DirectionalLight(0xfff3df,1.15);sun.position.set(-170,220,180);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
    Object.assign(sun.shadow.camera,{left:-120,right:120,top:140,bottom:-120,near:1,far:600});sun.shadow.bias=-.001;scene.add(sun);
    const rim=new T.DirectionalLight(0x7facff,.45);rim.position.set(60,20,-80);scene.add(rim);
    const root=new T.Group();scene.add(root);
    const launchCamera=new T.PerspectiveCamera(39,1,1,8000);
    const first=new T.Group(),upper=new T.Group();root.add(first,upper);
    first.name='S-IC';upper.name='S-II + S-IVB + Apollo';
    const white=new T.MeshStandardMaterial({color:0xf5f2e9,roughness:.48,metalness:.12});
    const black=new T.MeshStandardMaterial({color:0x141820,roughness:.6,metalness:.15});
    const silver=new T.MeshStandardMaterial({color:0xb6c1cd,roughness:.3,metalness:.65});
    const engine=new T.MeshStandardMaterial({color:0x655d53,roughness:.48,metalness:.65,side:T.DoubleSide});
    function mesh(geo,mat,parent,x,y,z){
      const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);parent.add(m);m.castShadow=true;m.receiveShadow=true;return m;
    }
    function cyl(parent,r1,r2,lo,hi,mat){return mesh(new T.CylinderGeometry(r1,r2,hi-lo,40),mat,parent,0,(lo+hi)/2,0);}
    function band(parent,r,lo,hi){
      for(let i=0;i<4;i++) mesh(new T.CylinderGeometry(r,r,hi-lo,8,1,true,i*Math.PI/2,.64),black,parent,0,(lo+hi)/2,0);
    }
    function ribs(parent,r,lo,hi){
      for(let i=0;i<40;i++){
        const a=i*Math.PI/20;
        mesh(new T.CylinderGeometry(.055,.055,hi-lo,4),silver,parent,Math.sin(a)*r,(lo+hi)/2,Math.cos(a)*r);
      }
    }
    function nozzle(parent,x,z,y,r){
      const bell=mesh(new T.CylinderGeometry(r*.4,r,6,20,1,true),engine,parent,x,y-3,z);
      bell.name='engine-bell';
      const ring=mesh(new T.TorusGeometry(r,.12,5,20),silver,parent,x,y-6,z);ring.rotation.x=Math.PI/2;
      mesh(new T.CircleGeometry(r*.85,20),black,parent,x,y-5.7,z).rotation.x=Math.PI/2;
    }
    function cluster(parent,y,r){
      nozzle(parent,0,0,y,r);
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2+Math.PI/4;nozzle(parent,Math.sin(a)*4.5,Math.cos(a)*4.5,y,r);
      }
    }
    function lettering(parent,r,lo,hi,label,vertical){
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f2e9';ctx.fillRect(0,0,256,1024);
      ctx.fillStyle='#aa2d28';ctx.textAlign='center';ctx.textBaseline='middle';
      if(vertical){ctx.font='bold 100px Arial';[...label].forEach((v,i)=>ctx.fillText(v,128,60+i*900/label.length));}
      else {ctx.save();ctx.translate(128,512);ctx.rotate(-Math.PI/2);ctx.font='bold 155px Arial';ctx.fillText(label,0,0);ctx.restore();}
      const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;
      const mat=new T.MeshStandardMaterial({map:texture,roughness:.55});
      for(let i=0;i<4;i++) mesh(new T.CylinderGeometry(r,r,hi-lo,10,1,true,-.25+i*Math.PI/2,.5),mat,parent,0,(lo+hi)/2,0);
    }
    // S-IC: cinque F-1, quattro pinne e fasce di riconoscimento nere.
    cyl(first,7.5,7.5,-64,0,white);cluster(first,-64,2.05);
    band(first,7.53,-64,-49);band(first,7.53,-7,0);
    ribs(first,7.56,-48,-44);ribs(first,7.56,-9,-7);
    lettering(first,7.57,-41,-13,'UNITED STATES',true);
    for(let i=0;i<4;i++){
      const fin=new T.Shape();fin.moveTo(7,-64);fin.lineTo(13,-66);fin.lineTo(7,-53);fin.closePath();
      const m=mesh(new T.ExtrudeGeometry(fin,{depth:.3,bevelEnabled:false}),silver,first);m.rotation.y=i*Math.PI/2+Math.PI/4;
    }
    // S-II e S-IVB: diametro ridotto sopra l'interstadio conico.
    const second=new T.Group();second.name='S-II';upper.add(second);
    cyl(second,7.5,7.5,0,33,white);cyl(second,7.55,7.55,0,3,black);
    band(second,7.54,3,10);ribs(second,7.57,0,8);lettering(second,7.57,15,28,'USA',true);
    cluster(second,0,1.45);
    cyl(second,4.9,7.5,33,41,white);
    const third=new T.Group();third.name='S-IVB';upper.add(third);
    cyl(third,4.9,4.9,41,59,white);band(third,4.94,42,48);ribs(third,4.98,42,47);
    cyl(third,4.95,4.95,58,60,black);lettering(third,4.99,49,57,'USA',true);
    // S-IVB: un solo J-2; il LEM è trasportato nell'adattatore sopra il serbatoio.
    nozzle(third,0,0,41,2.1);
    const cargo=window.msBuildLem(T);cargo.group.name='LEM in spacecraft adapter';cargo.group.scale.setScalar(.22);cargo.group.position.y=63.1;third.add(cargo.group);
    const panels=[],panelMat=white.clone();panelMat.side=T.DoubleSide;
    for(let i=0;i<4;i++){
      const mid=(i+.5)*Math.PI/2,hinge=new T.Group();hinge.position.set(Math.sin(mid)*4.9,60,Math.cos(mid)*4.9);third.add(hinge);
      mesh(new T.CylinderGeometry(3,4.9,7,12,1,true,i*Math.PI/2,Math.PI/2),panelMat,hinge,-hinge.position.x,3.5,-hinge.position.z);
      panels.push({hinge,mid});
    }
    const stackApollo=new T.Group();stackApollo.name='Apollo CSM on Saturn V';upper.add(stackApollo);
    cyl(stackApollo,3,3,67,73,silver);cyl(stackApollo,.65,3,73,78,white);
    const hatch=mesh(new T.BoxGeometry(1.5,2,.12),silver,stackApollo,0,75,2.1);
    const glass=new T.MeshStandardMaterial({color:0x172c43,roughness:.16,metalness:.4});
    mesh(new T.BoxGeometry(.7,.7,.15),glass,stackApollo,-1.3,75.3,1.9);
    mesh(new T.BoxGeometry(.7,.7,.15),glass,stackApollo,1.3,75.3,1.9);
    const tower=new T.Group();stackApollo.add(tower);
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4;
      const strut=mesh(new T.CylinderGeometry(.12,.12,6,5),white,tower,Math.sin(a)*.65,81,Math.cos(a)*.65);
      strut.rotation.z=Math.sin(a)*.06;
    }
    cyl(tower,.52,.52,83,89,white);cyl(tower,0,.52,89,91,white);
    const lamps=[];
    for(const d of [-1,1])lamps.push(mesh(new T.SphereGeometry(.45,8,6),new T.MeshBasicMaterial({color:d<0?0xff493c:0x64ffbc}),stackApollo,d*3.05,70,0));
    const flameMat=new T.MeshBasicMaterial({color:0xff9c35,transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide});
    const coreMat=new T.MeshBasicMaterial({color:0xfff0b5,transparent:true,opacity:.95,depthWrite:false});
    const flames=new T.Group();root.add(flames);
    for(let i=0;i<5;i++){
      const a=(i-1)*Math.PI/2+Math.PI/4,x=i?Math.sin(a)*4.5:0,z=i?Math.cos(a)*4.5:0;
      const f=new T.Group();f.position.set(x,0,z);flames.add(f);
      mesh(new T.ConeGeometry(2,29,16,1,true),flameMat,f,0,-14.5,0).rotation.z=Math.PI;
      mesh(new T.ConeGeometry(1.1,19,12),coreMat,f,0,-9.5,0).rotation.z=Math.PI;
    }
    // Modulo di comando Apollo in primo piano, anche durante il rientro.
    const capsule=new T.Group();capsule.name='Apollo command module';scene.add(capsule);
    const capMetal=new T.MeshStandardMaterial({color:0xc6cbd0,roughness:.4,metalness:.38});
    cyl(capsule,5,23,-18,22,capMetal);cyl(capsule,5,5,22,26,silver);
    const shield=cyl(capsule,23,22,-22,-18,black);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      const points=[new T.Vector3(Math.sin(a)*23.05,-18,Math.cos(a)*23.05),new T.Vector3(Math.sin(a)*5.05,22,Math.cos(a)*5.05)];
      capsule.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0x9ba5af,transparent:true,opacity:.45})));
    }
    const capHatch=mesh(new T.BoxGeometry(8,10,.3),silver,capsule,0,0,15);
    capHatch.rotation.x=.42;
    for(const x of [-4.6,4.6]){
      const windowPane=mesh(new T.BoxGeometry(2.7,3,.25),glass,capsule,x,12,8.2);windowPane.rotation.x=.42;
    }
    for(const x of [-18,18])mesh(new T.CylinderGeometry(1,1.5,2,10),engine,capsule,x,-12,7).rotation.z=Math.PI/2;
    // Il modulo di servizio resta con il CM fino alla separazione prima del rientro.
    const service=new T.Group();service.name='Apollo service module';scene.add(service);
    cyl(service,22.5,22.5,-65,-22,silver);cyl(service,23,22.5,-22,-18,white);cyl(service,23,23,-26,-22,white);
    for(let i=0;i<6;i++){
      const angle=i*Math.PI/3;
      mesh(new T.CylinderGeometry(22.6,22.6,30,8,1,true,angle,.55),white,service,0,-43,0);
    }
    cyl(service,6,6,-69,-65,engine);
    mesh(new T.CylinderGeometry(5,12,15,24,1,true),engine,service,0,-76.5,0);
    const nozzleRim=mesh(new T.TorusGeometry(12,.5,6,24),silver,service,0,-84,0);nozzleRim.rotation.x=Math.PI/2;
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2,x=Math.sin(a)*23,z=Math.cos(a)*23;
      mesh(new T.BoxGeometry(4,5,4),white,service,x,-30,z);
      for(const direction of [-1,1]){
        const nozzle=mesh(new T.CylinderGeometry(.6,1.1,3,10),engine,service,x+direction*3,-30,z);nozzle.rotation.z=direction*Math.PI/2;
      }
    }
    const antenna=new T.Group();antenna.position.set(26,-61,0);service.add(antenna);
    mesh(new T.CylinderGeometry(.4,.4,12,6),silver,antenna).rotation.z=-.8;
    for(const x of [-3,3])for(const y of [-3,3]){
      const dish=mesh(new T.SphereGeometry(3,12,8,0,Math.PI*2,0,Math.PI/2),silver,antenna,x+5,y-6,0);dish.rotation.x=Math.PI/2;
    }
    const servicePlume=mesh(new T.ConeGeometry(8,28,16),new T.MeshBasicMaterial({color:0xffe0ad,transparent:true,opacity:.65,depthWrite:false}),service,0,-98,0);servicePlume.rotation.z=Math.PI;
    service.visible=false;
    const chutes=new T.Group();capsule.add(chutes);
    const orange=new T.MeshStandardMaterial({color:0xd15a2e,roughness:1,side:T.DoubleSide});
    const silk=new T.MeshStandardMaterial({color:0xf4efdc,roughness:1,side:T.DoubleSide});
    for(let i=-1;i<=1;i++){
      const canopy=new T.Group();canopy.position.set(i*35,80-Math.abs(i)*10,i===0?-12:0);chutes.add(canopy);
      for(let k=0;k<16;k++){
        const panel=mesh(new T.SphereGeometry(25,5,10,k*Math.PI/8,Math.PI/8,0,Math.PI/2),k%2?orange:silk,canopy);
        panel.scale.y=.68;panel.castShadow=false;
      }
      for(let k=0;k<8;k++){
        const a=k*Math.PI/4,points=[new T.Vector3(i*35+Math.sin(a)*25,canopy.position.y,canopy.position.z+Math.cos(a)*25),new T.Vector3(0,24,0)];
        chutes.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xc5c0b4})));
      }
    }
    const lem=window.msBuildLem(T);scene.add(lem.group);lem.group.visible=false;
    const moonCamera=new T.PerspectiveCamera(52,1,1,8000);
    capsule.visible=false;
    root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(view&&view.renderer===renderer)unavailable=true;});
    return {renderer,scene,camera,launchCamera,root,first,upper,second,third,stackApollo,cargo,panels,tower,lamps,hatch,white,black,flames,capsule,chutes,shield,capHatch,service,servicePlume,lem,moonCamera,lunar:null,launchFog:new T.Fog(0xb3c7cf,700,2600),site:null,size:0};
  }

  function configure(v,options,t,flags){
    const booster=!!options.booster,upperOnly=!!options.upperOnly,secondOnly=!!options.secondStage,thirdOnly=!!options.thirdStage;
    v.root.visible=!options.capsule&&!options.lemOnly&&!options.serviceOnly;v.capsule.visible=!!options.capsule;
    if(v.lunar)v.lunar.group.visible=false;
    v.capsule.rotation.y=.3+Math.sin(t*.25)*.08;
    const lemAttached=!!options.capsule&&!!flags.lemDocked&&!flags.lemDetached&&!flags.lemJettisoned&&(!flags.thirdSeparated||!!flags.lemExtracted);
    v.lem.group.visible=!!options.lemOnly||lemAttached;
    v.lem.group.scale.setScalar(1.7);
    v.lem.group.position.set(0,lemAttached?52.35:0,0);
    v.lem.group.rotation.set(0,v.capsule.rotation.y,lemAttached?Math.PI:0);
    v.lem.update(flags,t,!!flags.lemAscent||!!flags.lemRedocked);
    v.service.visible=!!options.serviceOnly||(!!options.capsule&&!flags.serviceSeparated);
    v.servicePlume.visible=!!flags.serviceBurn&&!flags.serviceSeparated&&!options.serviceOnly;
    v.service.rotation.copy(v.capsule.rotation);v.service.position.set(0,options.serviceOnly?48:0,0);
    v.shield.visible=!!flags.serviceSeparated;
    v.chutes.visible=!!flags.para&&!!flags.serviceSeparated;v.shield.material=flags.scudo?v.black:v.white;
    v.capHatch.material=flags.portello?v.white:v.black;
    v.first.visible=booster||(!upperOnly&&!secondOnly&&!thirdOnly);v.upper.visible=!booster;
    v.second.visible=secondOnly||(!thirdOnly&&!flags.secondSeparated);v.third.visible=!secondOnly;
    v.stackApollo.visible=!secondOnly&&!thirdOnly&&!flags.thirdSeparated;
    v.first.position.y=booster?35:0;
    v.upper.position.y=secondOnly?-18:thirdOnly?-51:upperOnly?(flags.secondSeparated?-56:-42):0;
    v.cargo.group.visible=!flags.lemExtracted;
    v.cargo.update({},t,false);
    const opening=flags.thirdSeparated?Math.min(1,(flags.thirdSepT||0)/1.4):0;
    v.panels.forEach(({hinge,mid})=>{
      hinge.visible=!flags.thirdSeparated||(flags.thirdSepT||0)<3;
      const drift=flags.thirdSeparated?Math.max(0,(flags.thirdSepT||0)-.8)*5:0;
      hinge.position.set(Math.sin(mid)*(4.9+drift),60-drift*.4,Math.cos(mid)*(4.9+drift));
      hinge.quaternion.setFromAxisAngle(new window.THREE.Vector3(Math.cos(mid),0,-Math.sin(mid)),opening*1.3);
    });
    v.tower.visible=!upperOnly;
    v.root.position.set(0,0,0);
    v.root.rotation.set(booster?.12:0,.45+Math.sin(t*.32)*.13,0);
    v.hatch.material=flags.portello?v.white:v.black;
    v.lamps.forEach(m=>{m.visible=!!flags.luci;});
    v.flames.visible=!!flags.motori&&!booster&&!secondOnly&&!thirdOnly;
    v.flames.children.forEach((m,i)=>{m.visible=!flags.secondSeparated||i===0;});
    v.flames.position.y=upperOnly?(flags.secondSeparated?-21:-48):-70;
    v.flames.scale.y=(upperOnly?.65:1)*(.94+Math.sin(t*27)*.06);
    v.flames.scale.x=v.flames.scale.z=upperOnly?.8:1;
  }
  window.MSSaturnV={
    drawLaunch(c,width,height,alt,t,flags){
      if(unavailable||!window.msBuildApolloSite)return false;
      try{
        if(!view)view=build();if(!view)return false;
        const v=view;
        if(!v.site){v.site=window.msBuildApolloSite(window.THREE);v.scene.add(v.site.group);}
        v.site.group.visible=true;v.site.update(alt,t,flags);configure(v,{},t,flags);
        const lift=Math.pow(Math.max(0,alt),1.3)*550;
        v.root.position.y=lift;v.root.rotation.y=.4; // fermo sui supporti prima del decollo
        v.flames.scale.y*=1+alt*2;
        v.launchCamera.aspect=width/height;v.launchCamera.updateProjectionMatrix();
        v.launchCamera.position.set(145,72+lift,345);v.launchCamera.lookAt(-10,10+lift,0);
        v.scene.fog=v.launchFog;
        v.renderer.shadowMap.enabled=alt<.15;
        if(v.size!==width+'x'+height){v.renderer.setSize(width,height,false);v.size=width+'x'+height;}
        // La base sfuma nella vista della Terra: niente terreno piatto nello spazio.
        const groundFade=Math.max(0,Math.min(1,(.38-alt)/.2));
        if(groundFade>0&&groundFade<1){
          v.root.visible=false;v.renderer.render(v.scene,v.launchCamera);
          c.save();c.globalAlpha*=groundFade;c.drawImage(v.renderer.domElement,0,0,width,height);c.restore();
          v.root.visible=true;
        }
        v.site.group.visible=groundFade===1;
        if(!v.site.group.visible)v.scene.fog=null;
        v.renderer.render(v.scene,v.launchCamera);c.drawImage(v.renderer.domElement,0,0,width,height);
        return true;
      }catch(err){window.MSSaturnV.dispose();unavailable=true;console.warn('Rampa 3D non disponibile: uso la scena di riserva.',err);return false;}
    },
    drawMoon(c,width,height,t,flags){
      if(unavailable)return false;
      try{
        if(!view)view=build();if(!view)return false;
        const v=view;configure(v,{lemOnly:true},t,flags);v.lem.group.visible=false;
        if(v.site)v.site.group.visible=false;
        if(!v.lunar){v.lunar=window.msBuildMoonScene(window.THREE);v.scene.add(v.lunar.group);}
        v.lunar.group.visible=true;v.lunar.update(flags,t);
        v.scene.fog=null;v.renderer.shadowMap.enabled=true;
        v.moonCamera.aspect=width/height;v.moonCamera.updateProjectionMatrix();
        v.moonCamera.position.set(58,35,90);v.moonCamera.lookAt(0,5,0);
        const key='moon:'+width+'x'+height;if(v.size!==key){v.renderer.setSize(width,height,false);v.size=key;}
        v.renderer.render(v.scene,v.moonCamera);c.drawImage(v.renderer.domElement,0,0,width,height);return true;
      }catch(err){window.MSSaturnV.dispose();unavailable=true;console.warn('Scena lunare 3D non disponibile.',err);return false;}
    },
    draw(c,x,y,s,options,t,flags){
      if(unavailable) return false;
      try {
        if(!view) view=build();
        if(!view) return false;
        const v=view;
        const halfW=80,halfH=120;
        Object.assign(v.camera,{left:-halfW,right:halfW,top:halfH,bottom:-halfH});v.camera.updateProjectionMatrix();
        // Un buffer condiviso evita riallocazioni GPU tra stazione e capsula a ogni frame.
        if(v.size!=='sprite'){v.renderer.setSize(384,384,false);v.size='sprite';}
        if(v.site)v.site.group.visible=false;
        v.scene.fog=null;v.renderer.shadowMap.enabled=false;
        configure(v,options,t,flags);
        v.renderer.render(v.scene,v.camera);
        c.save();c.translate(x,y);c.rotate(options.rot||0);
        c.drawImage(v.renderer.domElement,-halfW*s,-halfH*s,2*halfW*s,2*halfH*s);c.restore();
        return true;
      } catch(err){
        window.MSSaturnV.dispose();unavailable=true;
        console.warn('Saturn V 3D non disponibile: uso il disegno di riserva.',err);
        return false;
      }
    },
    dispose(){
      if(!view) return;
      const geometries=new Set(),materials=new Set(),textures=new Set();
      view.scene.traverse(o=>{if(o.geometry) geometries.add(o.geometry);if(o.material) materials.add(o.material);});
      // Il portello può usare uno dei due materiali già condivisi dal modello.
      materials.forEach(m=>{if(m.map) textures.add(m.map);m.dispose();});
      textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());
      view.renderer.dispose();view.renderer.forceContextLoss();view=null;unavailable=false;
    }
  };
})();
