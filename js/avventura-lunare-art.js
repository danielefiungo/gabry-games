/* Modelli e materiali condivisi della missione. Geometrie arrotondate, strumenti
   articolati e decalcomanie locali: nessun modello o asset remoto aggiuntivo. */
(function () {
  'use strict';
  function create(T) {
    const resources=new Set(), cache=new Map();
    const palette={ivory:0xdddacf,orange:0xe8773e,dark:0x17252d,metal:0x70828a,mint:0x82ded0};
    const own=r=>{resources.add(r);return r;};
    function cached(key,fn){if(!cache.has(key))cache.set(key,own(fn()));return cache.get(key);}
    const material=(color,metalness=.12,roughness=.63)=>cached(`m:${color}:${metalness}:${roughness}`,()=>new T.MeshStandardMaterial({color,metalness,roughness}));
    const light=color=>cached('lit:'+color,()=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.5,roughness:.35}));
    function mesh(parent,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
    function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
    function roundGeometry(w,h,d,r){return cached(`round:${w}:${h}:${d}:${r}`,()=>{
      const s=new T.Shape(),x=-w/2,y=-h/2;
      s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
      const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(r*.25,.025),bevelThickness:Math.min(d*.12,.025),curveSegments:5});g.translate(0,0,-d/2);return g;
    });}
    function box(p,w,h,d,mat,x=0,y=0,z=0,r=.03){return mesh(p,roundGeometry(w,h,d,Math.min(r,w*.4,h*.4)),mat,x,y,z);}
    function sphere(p,rx,ry,rz,mat,x=0,y=0,z=0){const m=mesh(p,cached('sphere',()=>new T.SphereGeometry(1,16,12)),mat,x,y,z);m.scale.set(rx,ry,rz);return m;}
    function cylinder(p,a,b,h,mat,x=0,y=0,z=0){return mesh(p,cached(`cyl:${a}:${b}:${h}`,()=>new T.CylinderGeometry(a,b,h,24)),mat,x,y,z);}
    function ring(p,r,t,mat,x=0,y=0,z=0){return mesh(p,cached(`ring:${r}:${t}`,()=>new T.TorusGeometry(r,t,8,48)),mat,x,y,z);}
    function rod(p,a,b,r,mat){const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);const o=cylinder(p,r,r,v.length(),mat);o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
    function cable(p,points,r,mat){const key='tube:'+r+JSON.stringify(points);const g=cached(key,()=>new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),24,r,7,false));return mesh(p,g,mat);}
    function texture(key,draw,w=512,h=256){return cached('tex:'+key,()=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);const t=new T.CanvasTexture(canvas);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;});}
    function label(p,title,subtitle,w,h,x,y,z,background='#172933',ink='#c4ede5'){
      const tex=texture('label:'+title+subtitle+background,(c,W,H)=>{c.fillStyle=background;c.fillRect(0,0,W,H);c.strokeStyle='#78948b';c.lineWidth=3;c.strokeRect(8,8,W-16,H-16);c.fillStyle=ink;c.font='600 57px monospace';c.fillText(title,25,90);c.font='25px monospace';c.fillStyle='#91a7a8';c.fillText(subtitle,25,145);c.fillStyle=ink;for(let i=0;i<24;i++)c.fillRect(25+i*7,185,2+i%3,32);});
      return mesh(p,cached(`plane:${w}:${h}`,()=>new T.PlaneGeometry(w,h)),cached('labelmat:'+title+subtitle+background,()=>new T.MeshStandardMaterial({map:tex,roughness:.7,metalness:.05})),x,y,z);
    }
    function bolts(p,w,h,z){for(const x of [-w/2,w/2])for(const y of [-h/2,h/2]){const b=cylinder(p,.025,.025,.015,material(0x859599,.7),x,y,z);b.rotation.x=Math.PI/2;box(p,.026,.004,.005,material(0x28363b),x,y,z+.01,.001);}}
    const fabric=()=>cached('fabric',()=>{const t=texture('weave',(c,w,h)=>{c.fillStyle='#aaa';c.fillRect(0,0,w,h);for(let i=0;i<w;i+=4){c.fillStyle='#777';c.fillRect(i,0,1,h);c.fillStyle='#ccc';c.fillRect(0,i,w,1);}},128,128);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,5);return new T.MeshStandardMaterial({color:palette.ivory,roughness:.93,bumpMap:t,bumpScale:.003});});
    function glove(parent,side){
      const g=group(parent,side*.5,-.68,-.95),cloth=fabric(),rubber=material(0x36484f,.1,.9),ivory=material(palette.ivory),orange=material(palette.orange);
      const sleeve=group(g,0,-.22,.12);sleeve.rotation.x=-.55;
      cylinder(sleeve,.11,.15,.42,cloth);for(let i=0;i<5;i++)ring(sleeve,.117+i*.004,.009,ivory,0,.03-i*.055,0).rotation.x=Math.PI/2;
      cylinder(g,.116,.12,.09,rubber,0,-.015,0);ring(g,.118,.015,orange,0,.027,0).rotation.x=Math.PI/2;
      sphere(g,.106,.125,.066,cloth,0,.14,-.015);box(g,.15,.13,.025,ivory,0,.17,.048,.025);
      for(let i=0;i<3;i++)box(g,.105,.007,.006,rubber,0,.13+i*.028,.065,.002);
      const fingers=[];
      for(let i=0;i<4;i++){
        const length=[.065,.08,.075,.059][i],f=group(g,(i-1.5)*.051,.225,-.025);f.rotation.z=(i-1.5)*-.045;
        sphere(f,.025,.027,.027,cloth);const phalanx=group(f,0,length*.45,0);sphere(phalanx,.025,length*.62,.026,cloth);
        const joint=group(f,0,length,0);sphere(joint,.025,.025,.027,rubber);sphere(joint,.024,length*.53,.025,cloth,0,length*.45,0);
        const tip=group(joint,0,length*.8,0);sphere(tip,.024,.036,.027,cloth,0,.017,-.005);fingers.push({root:f,joint,tip});
      }
      const thumb=group(g,-side*.106,.11,0);thumb.rotation.z=side*.65;sphere(thumb,.035,.055,.035,cloth,0,.025,0);sphere(thumb,.029,.045,.03,cloth,0,.077,-.015);
      box(g,.086,.055,.018,rubber,side*.01,-.005,.115,.008);label(g,'O2','100',.074,.037,side*.01,-.005,.126);
      g.userData.fingers=fingers;g.userData.thumb=thumb;g.userData.side=side;g.traverse(o=>{if(o.isMesh)o.castShadow=false;});grip(g,.3);return g;
    }
    function grip(hand,value){hand.userData.fingers?.forEach((f,i)=>{f.root.rotation.x=-value*(.75+i*.035);f.joint.rotation.x=-value*.9;f.tip.rotation.x=-value*.55;});if(hand.userData.thumb)hand.userData.thumb.rotation.x=-value*.5;}
    function component(name,parent){const g=group(parent),white=material(palette.ivory,.35),metal=material(palette.metal,.65,.36),dark=material(palette.dark),orange=material(palette.orange,.25);
      if(name==='antenna'){
        box(g,.45,.2,.24,metal,0,-.35,0,.03);bolts(group(g,0,-.35,0),.32,.1,.132);rod(g,[0,-.25,0],[0,.21,0],.045,metal);
        const dishGroup=group(g,0,.28,0);dishGroup.rotation.x=.55;
        const profile=[];for(let i=0;i<=20;i++){const r=i/20*.46;profile.push(new T.Vector2(r,r*r*.65));}
        const dish=mesh(dishGroup,cached('dish',()=>new T.LatheGeometry(profile,48)),cached('dishmat',()=>new T.MeshStandardMaterial({color:palette.ivory,side:T.DoubleSide,metalness:.4,roughness:.35})));dish.rotation.x=Math.PI/2;
        ring(dishGroup,.46,.014,metal,0,0,.137);
        for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod(dishGroup,[Math.cos(a)*.42,Math.sin(a)*.42,.12],[0,0,.42],.012,metal);}
        cylinder(dishGroup,.05,.05,.12,orange,0,0,.4).rotation.x=Math.PI/2;
        cable(g,[[.12,-.3,0],[.22,-.18,-.08],[.19,.03,-.09],[0,.2,-.07]],.016,dark);label(g,'LINK','S-BAND',.22,.09,0,-.35,.13);
      }else if(name==='batteria'){
        box(g,.63,.85,.4,metal,0,0,0,.07);box(g,.55,.67,.04,white,0,0,.225,.035);
        for(const x of [-.27,.27])box(g,.07,.8,.46,orange,x,0,0,.022);
        const handle=group(g,0,.46,0);rod(handle,[-.17,0,0],[-.17,.1,0],.028,dark);rod(handle,[.17,0,0],[.17,.1,0],.028,dark);rod(handle,[-.17,.1,0],[.17,.1,0],.028,metal);
        label(g,'PWR 02','28 V / LUNAR',.4,.2,0,.13,.252);
        for(let i=0;i<4;i++)box(g,.065,.045,.014,light(palette.mint),-.135+i*.09,-.08,.26,.006);
        for(let i=0;i<5;i++)box(g,.34,.014,.014,dark,0,-.2-i*.035,.253,.005);
        for(const x of [-.12,.12])cylinder(g,.035,.035,.07,material(0xcfa968,.7),x,.46,.12);
        bolts(g,.41,.54,.258);
      }else{
        box(g,.88,1.22,.13,dark,0,0,0,.15);box(g,.78,1.12,.13,white,0,0,.08,.13);
        ring(g,.255,.035,metal,0,.18,.18);ring(g,.215,.014,dark,0,.18,.195);
        const glass=mesh(g,cached('porthole',()=>new T.CircleGeometry(.204,48)),cached('windowglass',()=>new T.MeshPhysicalMaterial({color:0x164b62,metalness:.4,roughness:.12,clearcoat:1})),0,.18,.185);
        const shine=mesh(g,cached('shine',()=>new T.CircleGeometry(.12,24,0,Math.PI*.7)),material(0x80c2cc,.3,.3),-.04,.24,.191);shine.rotation.z=.4;
        for(const y of [-.34,.34])box(g,.13,.1,.14,metal,-.43,y,.12,.02);
        rod(g,[.16,-.25,.22],[.32,-.25,.22],.035,orange);rod(g,[.16,-.25,.13],[.16,-.25,.22],.022,metal);
        label(g,'G-01','AIRLOCK',.32,.13,-.07,-.26,.162);bolts(g,.58,.92,.17);
      }return g;
    }
    function tool(type,parent){const g=group(parent),dark=material(palette.dark),metal=material(0x9ba8ab,.7,.3),orange=material(palette.orange);
      if(type==='screw'){
        box(g,.19,.18,.34,orange,0,0,0,.035);box(g,.105,.25,.12,dark,0,-.18,.06,.028);box(g,.17,.08,.18,orange,0,-.32,.06,.025);
        const chuck=group(g,0,0,-.22);chuck.rotation.x=-Math.PI/2;const spindle=group(chuck);cylinder(spindle,.058,.07,.12,metal);rod(spindle,[0,.06,0],[0,.23,0],.019,metal);box(spindle,.028,.009,.012,dark,0,.23,0,.002);g.userData.spindle=spindle;label(g,'07','TORQUE',.12,.07,0,0,.178);
      }else{
        box(g,.18,.13,.23,orange,0,0,0,.025);box(g,.15,.09,.04,metal,0,.04,-.14,.01);
        for(let i=0;i<3;i++)rod(g,[-.045+i*.045,.02,-.17],[-.045+i*.045,.02,-.24],.009,material(0xe4b16d,.7));
        cable(g,[[0,-.05,.1],[-.12,-.2,.16],[-.28,-.21,.15],[-.32,-.45,.24]],.025,dark);ring(g,.06,.012,light(palette.mint),0,0,.125);
      }return g;
    }
    function rocket(parent){const g=group(parent),white=material(palette.ivory,.35),dark=material(palette.dark,.3),metal=material(palette.metal,.65,.35),orange=material(palette.orange,.3);
      const profile=[[1.28,.8],[1.52,1.2],[1.5,4.9],[1.34,5.8],[1.1,6.5],[.69,7.1],[.22,7.55],[0,7.65]].map(v=>new T.Vector2(...v));
      mesh(g,cached('hull',()=>new T.LatheGeometry(profile,64)),white);
      for(const y of [1.25,2.1,4.5,5.4])ring(g,y>5?1.43:1.52,.033,metal,0,y,0).rotation.x=Math.PI/2;
      cylinder(g,1.46,1.49,.28,orange,0,5.23,0);
      for(let i=0;i<4;i++){const a=i*Math.PI/2+.65,x=Math.sin(a),z=Math.cos(a);rod(g,[x*1.4,1.8,z*1.4],[x*2.6,.2,z*2.6],.09,metal);rod(g,[x*1.4,2.2,z*1.4],[x*2.2,.8,z*2.2],.13,white);cylinder(g,.4,.46,.12,dark,x*2.6,.12,z*2.6);}
      cylinder(g,.43,.8,.7,dark,0,.48,0);ring(g,.78,.045,metal,0,.14,0).rotation.x=Math.PI/2;
      for(let i=0;i<14;i++){const a=i*Math.PI*2/14;rod(g,[Math.sin(a)*1.52,1.4,Math.cos(a)*1.52],[Math.sin(a)*1.52,1.95,Math.cos(a)*1.52],.018,metal);}
      label(g,'GABRI 01','LUNAR EXPLORER',1.02,.43,0,4.08,1.495,'#d9d7ca','#283c43');
      for(const x of [-1,1]){
        const tank=group(g,x*1.6,2.3,-.45);cylinder(tank,.21,.21,1.3,orange);sphere(tank,.21,.18,.21,metal,0,.65,0);sphere(tank,.21,.18,.21,metal,0,-.65,0);
        cable(g,[[x*1.45,2.9,.6],[x*1.7,2.6,.8],[x*1.6,1.7,.9],[x*.9,1.3,1.3]],.035,dark);
      }
      const slots={},signals={},coords={antenna:[1.3,4.8,1.25],batteria:[0,1.5,1.65],portello:[0,3,1.5]};
      for(const [name,pos] of Object.entries(coords)){
        const socket=group(g,...pos),w=name==='portello'?1.02:.84,h=name==='portello'?1.4:1.06;
        box(socket,w,h,.09,metal,0,0,0,.07);box(socket,w-.08,h-.08,.1,dark,0,0,.05,.05);bolts(socket,w-.13,h-.13,.12);
        for(const side of [-1,1])box(socket,.022,h*.5,.03,light(palette.mint),side*(w/2-.055),0,.13,.005);
        signals[name]=sphere(socket,.035,.035,.02,light(palette.orange),w/2-.09,h/2-.1,.14);
        const item=component(name,socket);item.position.z=.17;item.visible=false;slots[name]=item;
      }return {group:g,slots,signals};
    }
    function habitat(parent){const g=group(parent,-17,0,12),white=material(palette.ivory),metal=material(palette.metal,.5),dark=material(palette.dark);
      const shell=cylinder(g,3,3,8,white,0,3,0);shell.rotation.z=Math.PI/2;
      for(const x of [-4,-2,0,2,4])ring(g,3.03,.07,metal,x,3,0).rotation.y=Math.PI/2;
      const end=group(g,4.04,3,0);end.rotation.y=Math.PI/2;const hatch=component('portello',end);hatch.scale.setScalar(1.7);hatch.position.y=-.6;label(end,'BASE 07','HABITAT / LUNA',2,.55,0,1.45,.03);ring(end,2.7,.035,material(palette.orange));
      for(let i=0;i<3;i++)box(g,.8,.48,.06,material(0x24475a,.6,.25),-2+i*2,3.8,2.9,.1);
      for(const x of [-3,3])for(const z of [-1.5,1.5])rod(g,[x,2,z],[x,.1,z*1.8],.18,metal);
      box(g,1.4,2,.4,dark,0,2,2.7,.3);label(g,'LUNA 07','BASE / HABITAT',2,.65,0,4.2,2.76);
      for(let i=0;i<4;i++)box(g,1.8,.18,.6,metal,0,.2+i*.2,3.5-i*.2);
      const solar=group(g,-7,2,-1);solar.rotation.x=-.6;box(solar,6,3,.1,material(0x152d4c,.6,.3));
      for(let i=0;i<6;i++)for(let j=0;j<3;j++)box(solar,.85,.83,.025,material(0x294b68,.55,.3),-2.5+i,-1+j,.07,.01);
      rod(g,[-7,0,-1],[-7,2,-1],.12,metal);return g;
    }
    function shelter(parent){const g=group(parent),white=material(palette.ivory),metal=material(palette.metal,.55),dark=material(palette.dark),orange=material(palette.orange);
      box(g,5.2,.3,6,white,0,3.2,0,.09);box(g,4.7,.11,5.7,dark,0,3,0,.02);
      for(const x of [-2.25,2.25])for(const z of [-2.65,2.65]){rod(g,[x,.1,z],[x,3.1,z],.11,metal);cylinder(g,.25,.3,.1,dark,x,.06,z);box(g,.23,.45,.23,orange,x,1,z,.025);}
      for(const z of [-2.65,2.65]){rod(g,[-2.25,2,z],[-1.25,3,z],.065,metal);rod(g,[2.25,2,z],[1.25,3,z],.065,metal);}
      label(g,'RIPARO','SAFE ZONE',1.2,.4,0,2.88,2.96);box(g,4.5,.035,.04,light(palette.mint),0,3.08,3.07,.007);
      return g;
    }
    function cockpit(parent){const g=group(parent),dark=material(0x152027,.28),metal=material(0x526773,.55),ivory=material(palette.ivory);
      const dashboard=group(g,0,-.72,-1.45);dashboard.rotation.x=-.18;
      box(dashboard,2.7,.54,.52,dark,0,-.05,0,.1);
      for(const x of [-.75,0,.75]){
        box(dashboard,.62,.33,.04,metal,x,.05,.29,.025);
        const title=x<0?'NAV / 01':x>0?'PWR / 28V':'GABRI 01';label(dashboard,title,x<0?'HOME  →  TERRA':x>0?'SYSTEMS  OK':'FLIGHT / READY',.54,.26,x,.05,.317);
        for(let i=0;i<3;i++)sphere(dashboard,.016,.016,.012,light(i===2?palette.orange:palette.mint),x-.11+i*.11,-.18,.285);
      }
      for(const side of [-1,1]){
        rod(g,[side*1.35,-1,-1.1],[side*.98,.83,-1.65],.043,metal);rod(g,[side*.98,.83,-1.65],[side*.46,1.16,-1.8],.044,dark);
        const control=group(g,side*.42,-.46,-1.08);cylinder(control,.06,.1,.12,dark,0,-.19,0);rod(control,[0,-.17,0],[0,.05,-.06],.035,metal);box(control,.12,.09,.1,dark,0,.06,-.06,.025);sphere(control,.018,.012,.018,light(palette.orange),0,.105,-.07);
      }
      return g;
    }
    function earth(parent,x,y,z,size){const g=group(parent,x,y,z);
      const map=cached('earth-map',()=>{const t=typeof ssTex==='function'?ssTex('terra'):texture('earth-fallback',c=>{c.fillStyle='#174b7d';c.fillRect(0,0,512,256);});t.encoding=T.sRGBEncoding;return t;});
      mesh(g,cached('earth-geometry',()=>new T.SphereGeometry(1,64,48)),cached('earthmat',()=>new T.MeshStandardMaterial({map,roughness:.9,metalness:0,emissive:0x07101c,emissiveIntensity:.15}))).scale.setScalar(size);
      if(typeof ssClouds==='function'){const clouds=ssClouds(size);own(clouds.geometry);own(clouds.material);own(clouds.material.map);g.add(clouds);}
      const atmosphere=mesh(g,cached('atmosphere-geometry',()=>new T.SphereGeometry(1,48,32)),cached('atmosphere-material',()=>new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color(0x419ade)}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=-p.xyz;gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;uniform vec3 tint;void main(){float rim=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.8);gl_FragColor=vec4(tint,rim*.55);}'})));atmosphere.scale.setScalar(size*1.025);g.rotation.set(.08,2.2,.22);return g;
    }
    return {material,light,mesh,box,sphere,cylinder,ring,rod,cable,group,label,bolts,glove,grip,component,tool,rocket,habitat,shelter,cockpit,earth,texture,owns:r=>resources.has(r),dispose(){resources.forEach(r=>r.dispose());resources.clear();cache.clear();}};
  }
  window.LunarArt={create};
})();
