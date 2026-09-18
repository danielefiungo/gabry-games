/* Visuale 3D in prima persona. Il controller possiede l'unico requestAnimationFrame. */
(function () {
  'use strict';
  function create(container) {
    const T=window.THREE;
    if(!T)throw new Error('La grafica 3D non è disponibile. Ricarica la pagina con una connessione Internet.');
    const A=window.LunarArt.create(T),landscape=window.LunarLandscape;
    const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    container.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Paesaggio lunare in prima persona');
    const scene=new T.Scene(), camera=new T.PerspectiveCamera(66,1,.06,1800);
    scene.background=new T.Color('#070d1c');
    let world,stageRoot,gear,environmentKind,sun,farRocket,indicators={},obstacle,meteor,pickup,loose,slots={},target=new T.Vector3(),gateCenter,step,lastWidth=0,lastHeight=0,disposed=false;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const color={white:0xe3e8e9,grey:0x7d8995,dark:0x182a38,mint:0x64ecd4,gold:0xffbd64};
    function mat(c,metal=.1){return A.material(c,metal);}
    function glow(c){return A.light(c);}
    function mesh(parent,g,m,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
    function box(p,w,h,d,m,x=0,y=0,z=0){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
    function rod(p,a,b,r,m){const v=new T.Vector3(...a),u=new T.Vector3(...b),delta=u.clone().sub(v);const o=mesh(p,new T.CylinderGeometry(r,r,delta.length(),8),m);o.position.copy(v.add(u).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
    function group(p,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
    function release(root){if(!root)return;const geometries=new Set(),materials=new Set();root.traverse(o=>{o.shadow?.map?.dispose();o.shadow?.mapPass?.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>{if(!A.owns(g))g.dispose();});materials.forEach(m=>{if(A.owns(m))return;for(const key of ['map','bumpMap','normalMap'])if(m[key]&&!A.owns(m[key]))m[key].dispose();m.dispose();});root.removeFromParent?root.removeFromParent():root.parent?.remove(root);}
    function rock(p,x,y,z,size=1){const g=new T.SphereGeometry(size,20,14),a=g.attributes.position;for(let i=0;i<a.count;i++){const k=.9+Math.sin(a.getX(i)*2.1+a.getY(i)*3.7+a.getZ(i)*2.9)*.12;a.setXYZ(i,a.getX(i)*k,a.getY(i)*k,a.getZ(i)*k);}g.computeVertexNormals();const o=mesh(p,g,mat(0x929aa1),x,y,z);o.rotation.set(x*.13,z*.12,size);o.scale.set(1,.7,1.15);return o;}
    const component=(name,parent)=>A.component(name,parent);
    const earth=(...args)=>A.earth(...args);
    function stars(){const points=[];for(let i=0;i<850;i++){const a=i*2.3999,y=-.15+(i%211)/211*1.15,r=750;points.push(Math.cos(a)*r*Math.sqrt(1-y*y),y*r,Math.sin(a)*r*Math.sqrt(1-y*y));}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));world.add(new T.Points(g,new T.PointsMaterial({color:0xdaedff,size:1.2,sizeAttenuation:true,fog:false})));}
    function ground(){
      const tex=A.texture('moon-dust',(c,w,h)=>{
        const pixels=c.createImageData(w,h);let seed=15421;
        for(let i=0;i<w*h;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=i%w,z=Math.floor(i/w),n=seed/4294967296;
          const value=135+Math.sin(x/w*Math.PI*6+Math.cos(z/h*Math.PI*4))*2+Math.cos(z/h*Math.PI*10)*2+(n-.5)*34;
          pixels.data[i*4]=value+3;pixels.data[i*4+1]=value+2;pixels.data[i*4+2]=value;pixels.data[i*4+3]=255;
        }c.putImageData(pixels,0,0);
      },512,512);
      tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(20,66);
      const surface=new T.MeshStandardMaterial({color:0xb2aea5,map:tex,bumpMap:tex,bumpScale:.006,roughness:1,vertexColors:true});
      const g=new T.PlaneGeometry(100,350,150,420);g.rotateX(-Math.PI/2);g.translate(0,0,-145);const a=g.attributes.position,colors=[];
      for(let i=0;i<a.count;i++){const x=Math.sign(a.getX(i))*50*Math.pow(Math.abs(a.getX(i))/50,1.65),z=a.getZ(i),y=landscape.height(x,z);a.setXYZ(i,x,y,z);const shade=.91+Math.min(0,y)*.075;colors.push(shade,shade,shade);}
      g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();mesh(world,g,surface);
      const boundary=new T.Shape();boundary.moveTo(-800,-800);boundary.lineTo(800,-800);boundary.lineTo(800,800);boundary.lineTo(-800,800);boundary.closePath();const hole=new T.Path();hole.moveTo(-50,-175);hole.lineTo(-50,175);hole.lineTo(50,175);hole.lineTo(50,-175);hole.closePath();boundary.holes.push(hole);const far=new T.ShapeGeometry(boundary);far.rotateX(-Math.PI/2);const farMat=surface.clone();farMat.vertexColors=false;mesh(world,far,farMat,0,-.15,-145);
      // Un unico insieme di rocce, stabile lungo tutta la traversata.
      const stoneGeo=new T.IcosahedronGeometry(1,1),stones=new T.InstancedMesh(stoneGeo,mat(0x89877e),260),dummy=new T.Object3D();
      for(let i=0;i<260;i++){const x=(i%2?1:-1)*(6+(i*13.77)%70),z=20-(i*17.61)%330,size=.12+(i%11)*.095;dummy.position.set(x,landscape.height(x,z)+size*.22,z);dummy.scale.set(size,size*.55,size*.84);dummy.rotation.set(i*.23,i*.91,i*.12);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);}stones.castShadow=stones.receiveShadow=true;world.add(stones);
      // Una cresta continua sullo sfondo, senza blocchi giganti vicino al sentiero.
      const positions=[],indices=[],segments=144;
      for(let row=0;row<4;row++)for(let i=0;i<=segments;i++){const angle=i/segments*Math.PI*2,r=190+row*65;
        const peak=(Math.sin(angle*9+1)*.5+.5)*10+(Math.cos(angle*17)*.5+.5)*7;
        positions.push(Math.cos(angle)*r,row===0?-.2:row===3?8:10+peak*(row===1?1:1.5),-130+Math.sin(angle)*r);
      }
      for(let row=0;row<3;row++)for(let i=0;i<segments;i++){const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
      const ridge=new T.BufferGeometry();ridge.setAttribute('position',new T.Float32BufferAttribute(positions,3));ridge.setIndex(indices);ridge.computeVertexNormals();mesh(world,ridge,new T.MeshStandardMaterial({color:0x6f7479,roughness:1,side:T.DoubleSide}));
      const print=A.texture('bootprint',(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#28313955';for(let i=0;i<7;i++){c.fillRect(25,18+i*12,31,5);c.fillRect(67,18+i*12,31,5);}c.fillRect(28,104,65,8);},128,128);
      const printMat=new T.MeshBasicMaterial({map:print,transparent:true,depthWrite:false,opacity:.65,polygonOffset:true,polygonOffsetFactor:-1});
      const footprint=new T.PlaneGeometry(.25,.37);
      for(let i=0;i<210;i++){const x=i%2?.22:-.22,z=4-i*1.28,y=landscape.height(x,z);if(y<-.2)continue;const o=mesh(world,footprint,printMat,x,y+.012,z);o.rotation.set(-Math.PI/2,0,i%2?.07:-.07);o.castShadow=false;}
      for(let i=0;i<12;i++){const z=-i*22-3,x=i%2?-3.7:3.7,y=landscape.height(x,z);A.cylinder(world,.035,.06,.68,mat(0x44535b),x,y+.34,z);A.box(world,.22,.23,.055,mat(0xe8773e),x,y+.6,z,.02);A.label(world,String(i+1).padStart(2,'0'),'ROUTE',.18,.16,x,y+.6,z+.032);}
      const habitat=A.habitat(world);habitat.position.z=-19;
      farRocket=A.rocket(world).group;farRocket.position.z=-269;
      earth(world,235,190,-840,42);
    }
    let hands=[],cockpit;
    function equipment(flight){gear=group(camera);scene.add(camera);hands=[A.glove(gear,-1),A.glove(gear,1)];
      cockpit=A.cockpit(gear);cockpit.visible=flight;
      if(flight)hands.forEach((h,i)=>{h.position.set(i?.42:-.42,-.58,-1.0);h.rotation.x=-.3;A.grip(h,.95);});
    }
    function environment(space,base){
      world=new T.Group();scene.add(world);scene.fog=space?null:new T.FogExp2(0x080d18,.0009);
      world.add(new T.HemisphereLight(0xb8d6ed,0x292825,.7));sun=new T.DirectionalLight(0xffead2,1.75);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.camera.far=150;sun.shadow.bias=-.0007;sun.shadow.normalBias=.018;world.add(sun,sun.target);
      stars();if(space){farRocket=null;earth(world,16,12,-190,28);}else ground();
    }
    function build(s){
      release(stageRoot);release(gear);step=window.LunarAdventureModel.current(s);slots={};indicators={};obstacle=meteor=pickup=loose=null;
      const d=step,base=landscape.baseFor(s.index,d.phase,d.type),space=d.type==='fly',kind=space?'space':'moon';
      if(!world||environmentKind!==kind){release(world);environment(space,base);environmentKind=kind;}
      stageRoot=group(world);equipment(d.phase==='flight');
      sun.target.position.set(0,0,base-12);sun.position.set(-45,70,base+20);
      if(farRocket)farRocket.visible=d.phase==='explore'&&s.index<11;
      if(d.phase==='explore'){
        target.set(0,1.4,base-10);obstacle=group(stageRoot,0,0,base-10);
        if(d.type==='jump'||d.type==='bridge'){
          if(d.type==='bridge'){
            box(obstacle,2.1,.22,12,mat(color.grey),0,.16,0);
            for(let z=-5;z<=5;z+=1){box(obstacle,2.15,.045,.12,mat(color.dark),0,.3,z);for(const side of [-1,1])rod(obstacle,[side*1.1,.3,z],[side*1.1,1.4,z],.035,mat(color.gold));}
            for(const side of [-1,1])rod(obstacle,[side*1.1,1.4,-5],[side*1.1,1.4,5],.055,mat(color.white));
          }
        }else if(d.type==='climb'){rock(obstacle,0,.7,0,2.1);target.y=2;}
        else if(d.type==='dodge'){
          obstacle.position.x=4;A.shelter(obstacle);target.set(4,2,base-7);
          meteor=rock(stageRoot,-7,22,base-16,1.2);meteor.material=mat(0xb68a70);
          const trail=mesh(meteor,new T.ConeGeometry(.7,6,12),new T.MeshBasicMaterial({color:0xffb05c,transparent:true,opacity:.45}),0,3,0);trail.rotation.z=-.6;
          const shadow=mesh(stageRoot,new T.CircleGeometry(2.3,40),new T.MeshBasicMaterial({color:0xf8a55d,transparent:true,opacity:.23}),0,.05,base-2);shadow.rotation.x=-Math.PI/2;
        }else if(d.type==='collect'){
          A.box(obstacle,1.4,.36,.85,mat(0x45545c),0,.18,0,.05);A.label(obstacle,'RECOVERY','GABRI / 07',.8,.18,0,.2,.441);pickup=component(d.part,obstacle);pickup.position.y=1.1;pickup.scale.setScalar(1.5);
          mesh(obstacle,new T.TorusGeometry(1.1,.025,8,40),glow(color.mint),0,1.2,0);target.set(0,2.4,base-10);
        }else{
          // Il razzo della missione è immaginario, con i tre alloggiamenti da riparare.
          rocket(obstacle);obstacle.position.z=-269;target.set(0,3,-267);
        }
      }else if(d.phase==='build'){
        obstacle=group(stageRoot,0,0,base-5);rocket(obstacle);
        const y=d.part==='antenna'?4.8:d.part==='batteria'?1.5:3;
        camera.position.set(d.part==='antenna'?1.6:0,y,base);target.set(d.part==='antenna'?1.3:0,y,base-3.7);
        loose=component(d.part,stageRoot);loose.position.copy(target).add(new T.Vector3(-1.2,-.8,1.5));
        if(d.type==='screw'||d.type==='connect'){release(loose);loose=A.tool(d.type,stageRoot);target.x+=d.type==='screw'?.3:.22;target.y+=d.type==='screw'?-.4:-.25;target.z+=.13;}
        Object.keys(slots).forEach((name,i)=>{slots[name].visible=s.index>[12,15,18][i]||s.installed.includes(name);if(s.installed.includes(name))indicators[name].material=glow(color.mint);});
      }else if(d.type==='launch'){
        target.set(0,3,base-35);const pad=mesh(stageRoot,new T.CylinderGeometry(8,8,.25,48),mat(color.dark),0,.1,base);box(stageRoot,.1,7,.1,glow(color.mint),-5,3.5,base-8);box(stageRoot,.1,7,.1,glow(color.mint),5,3.5,base-8);
      }else{
        gateCenter=new T.Vector3(d.lane<250?-3.3:3.3,d.lane<250?2.8:-2.5,-30);
        obstacle=group(stageRoot,gateCenter.x,gateCenter.y,-30);
        for(let i=0;i<15;i++){const a=i/15*Math.PI*2;const r=6+(i%3)*.4;rock(obstacle,Math.cos(a)*r,Math.sin(a)*r,(i%3-1)*1.2,1.1+i%3*.3);}
        const guide=mesh(obstacle,new T.TorusGeometry(4.3,.035,6,64),glow(color.mint).clone());guide.material.transparent=true;guide.material.opacity=.5;
        for(let i=0;i<32;i++)rock(stageRoot,Math.sin(i*9.3)*32,Math.cos(i*7.1)*24,-50-i*7,.5+i%4);
        target.copy(gateCenter);
      }
    }
    function rocket(parent){const result=A.rocket(parent);slots=result.slots;indicators=result.signals;return result.group;}
    const projected=new T.Vector3();
    function draw(s){if(disposed||!step)return;const d=step,action=s.mode==='action',rescue=s.mode==='rescue',p=action?Math.min(1,s.motion/d.duration):0,t=p*p*(3-2*p),r=rescue?Math.min(1,s.motion/2200):0,base=landscape.baseFor(s.index,d.phase,d.type);
      const w=container.clientWidth||1100,h=container.clientHeight||620;if(w!==lastWidth||h!==lastHeight){lastWidth=w;lastHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
      camera.rotation.set(0,0,0);camera.position.set(0,1.75,base);const bob=reduced?0:Math.sin((s.elapsed+s.motion)*.002)*.016;
      camera.position.y+=bob;
      if(d.phase==='explore'){
        camera.position.z=base-22*t;
        if(d.type==='jump'||d.type==='climb')camera.position.y+=Math.sin(Math.PI*p)*(d.type==='jump'?2.6:2.1);
        if(d.type==='bridge')camera.position.y+=.25*Math.sin(p*Math.PI);
        if(d.type==='dodge'){camera.position.x=Math.sin(p*Math.PI)*4.8;camera.rotation.z=reduced?0:Math.sin(p*Math.PI*2)*.06;const q=rescue?1:action?Math.min(1,window.LunarAdventureModel.dangerProgress(s)+p):window.LunarAdventureModel.dangerProgress(s);meteor.position.set(-5*(1-q),1.6+8.4*(1-q),base-1-23*(1-q));meteor.rotation.z=q*3;meteor.visible=!rescue||r<.2;}
        if(d.type==='collect'&&pickup){const reach=Math.min(1,p*4);pickup.visible=p<.8;pickup.position.set(-.45*reach,1.1+(camera.position.y-.3-1.1)*reach,(9.1-22*t)*reach);pickup.scale.setScalar(1.5-1.1*reach);pickup.rotation.y=t*1.5;}
        camera.rotation.x=-.09;
        if(rescue){camera.position.z=base+Math.sin(r*Math.PI)*2;camera.rotation.z=reduced?0:Math.sin(r*24)*.035*(1-r);}
      }else if(d.phase==='build'){
        const y=d.part==='antenna'?4.8:d.part==='batteria'?1.5:3;
        camera.position.set(d.part==='antenna'?1.6:0,y+.08,base-2.05);camera.lookAt(target);
        const operation=Math.max(0,Math.min(1,(p-.3)/.5)),reach=d.type==='fit'?t:Math.min(1,p/.3)*(1-Math.max(0,(p-.82)/.18));
        const from=new T.Vector3(d.type==='fit'?-.3:.32,-.28,-.73).applyQuaternion(camera.quaternion).add(camera.position);
        const destination=target.clone().add(new T.Vector3(0,0,d.type==='screw'?.45:d.type==='connect'?.24:0));
        loose.position.copy(from.lerp(destination,reach));loose.scale.setScalar(d.type==='fit'?.55+.45*reach:.8+.2*reach);
        loose.rotation.set(0,0,0);if(loose.userData.spindle)loose.userData.spindle.rotation.y=operation*Math.PI*8;
        loose.visible=d.type==='fit'?p<.9:true;slots[d.part].visible=d.type!=='fit'||p>=.9;
        if(d.type==='connect'&&p>.65)indicators[d.part].material=glow(color.mint);
        const held=loose.position.clone().sub(camera.position).applyQuaternion(camera.quaternion.clone().invert());
        if(d.type==='fit'){hands[0].position.copy(held).add(new T.Vector3(-.23,-.25,.1));hands[1].position.copy(held).add(new T.Vector3(.23,-.25,.1));hands.forEach(h=>A.grip(h,.72));}
        else{hands[0].position.set(-.3,-.49,-.84);hands[1].position.copy(held).add(new T.Vector3(0,-.22,.13));A.grip(hands[0],.5);A.grip(hands[1],1.15);}
      }else if(d.type==='launch'){
        camera.position.set(0,2+t*85,base);camera.rotation.x=t*.7;target.set(0,3,base-35);container.style.setProperty('--launch',p);
      }else{
        const q=window.LunarAdventureModel.dangerProgress(s),travel=action?t:0;
        camera.position.set(gateCenter.x*travel,gateCenter.y*travel,0);camera.rotation.z=reduced?0:-Math.sin(p*Math.PI)*gateCenter.x*.035;
        obstacle.position.z=action?(-30+q*26)*(1-t)+12*t:rescue?-2:-30+q*26;
        target.set(gateCenter.x,gateCenter.y,obstacle.position.z);
        if(rescue)camera.position.z=Math.sin(r*Math.PI)*3;
      }
      if(d.phase==='explore'){hands.forEach((hand,i)=>{hand.position.y=-.68+Math.sin(p*Math.PI)*(d.type==='collect'?.26:.10);hand.rotation.z=Math.sin(p*Math.PI)*(i?-.12:.12);A.grip(hand,.28+Math.sin(p*Math.PI)*(d.type==='collect'?.65:.18));});}
      camera.updateMatrixWorld();projected.copy(target).project(camera);
      const cue=container.querySelector('#laCue');if(cue){cue.style.left=`${Math.max(14,Math.min(86,(projected.x+1)*50))}%`;cue.style.top=`${Math.max(20,Math.min(65,(1-projected.y)*50))}%`;cue.hidden=action||rescue;}
      container.dataset.camera=[camera.position.x,camera.position.y,camera.position.z].map(n=>n.toFixed(3)).join(',');
      container.dataset.danger=window.LunarAdventureModel.dangerProgress(s).toFixed(4);
      container.style.setProperty('--impact',rescue?Math.sin(r*Math.PI):0);
      renderer.render(scene,camera);
    }
    function lost(e){e.preventDefault();container.dispatchEvent(new CustomEvent('lunar-render-error',{bubbles:true}));}
    renderer.domElement.addEventListener('webglcontextlost',lost);
    return {build,draw,dispose(){if(disposed)return;disposed=true;renderer.domElement.removeEventListener('webglcontextlost',lost);release(world);release(gear);A.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
  }
  window.LunarFPV={create};
})();
