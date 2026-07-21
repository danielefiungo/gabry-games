/* ============================================================
   GIBI RESCUE — simulatore 2D deterministico
   Modello differenziale, collisioni, servo e raycast HC-SR04.
   ============================================================ */
(function(root){
  'use strict';

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const norm=a=>{ while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return a; };
  const circleRect=(x,y,r,o)=>{
    const qx=clamp(x,o.x,o.x+o.w),qy=clamp(y,o.y,o.y+o.h);
    return (x-qx)*(x-qx)+(y-qy)*(y-qy)<r*r;
  };

  function rayRect(ox,oy,dx,dy,rect,max){
    let lo=0,hi=max;
    for(const a of [{o:ox,d:dx,min:rect.x,max:rect.x+rect.w},{o:oy,d:dy,min:rect.y,max:rect.y+rect.h}]){
      if(Math.abs(a.d)<1e-8){ if(a.o<a.min||a.o>a.max)return null; continue; }
      let t1=(a.min-a.o)/a.d,t2=(a.max-a.o)/a.d;
      if(t1>t2){const z=t1;t1=t2;t2=z;}
      lo=Math.max(lo,t1);hi=Math.min(hi,t2);
      if(lo>hi)return null;
    }
    return lo>=0?lo:(hi>=0?hi:null);
  }

  function GR_makeTrack(type,variant){
    const base={width:240,height:150,start:{x:26,y:75,a:0},goal:{x:202,y:58,w:25,h:34},obstacles:[],label:'CONSEGNA'};
    if(type==='motor') return Object.assign(base,{goal:{x:80,y:55,w:30,h:40},label:'PROVA MOTORE'});
    if(type==='parking') return Object.assign(base,{goal:{x:42,y:22,w:38,h:30},label:'PARCHEGGIO'});
    if(type==='loop') return Object.assign(base,{goal:{x:186,y:22,w:32,h:30},obstacles:[{x:96,y:52,w:28,h:46}],label:'GIRO'});
    if(type==='sensor') return Object.assign(base,{goal:{x:196,y:55,w:26,h:40},obstacles:[{x:70,y:30,w:10,h:22},{x:115,y:54,w:12,h:28},{x:180,y:34,w:13,h:50}],label:'MISURE'});
    if(type==='wall') return Object.assign(base,{goal:{x:145,y:53,w:30,h:44},obstacles:[{x:184,y:35,w:14,h:80}],label:'ZONA SICURA'});
    if(type==='avoid') return Object.assign(base,{goal:{x:202,y:28,w:25,h:35},obstacles:[{x:105,y:50,w:28,h:46}],label:'CONSEGNA'});
    if(type==='choice'){
      const v=(variant||0)%2;
      return Object.assign(base,{goal:{x:198,y:v?100:18,w:27,h:30},obstacles:v?[{x:102,y:18,w:24,h:62}]:[{x:102,y:72,w:24,h:60}],label:'VIA LIBERA'});
    }
    if(type==='rescue'){
      const sets=[
        [{x:86,y:18,w:22,h:72},{x:150,y:74,w:22,h:58}],
        [{x:82,y:72,w:24,h:60},{x:148,y:18,w:22,h:72}],
        [{x:76,y:30,w:20,h:64},{x:132,y:68,w:20,h:64},{x:182,y:24,w:18,h:55}]
      ];
      return Object.assign(base,{goal:{x:204,y:55,w:24,h:40},obstacles:sets[(variant||0)%sets.length],label:'ROBOT'});
    }
    return base;
  }

  class GR_Sim{
    constructor(track,opts){
      this.opts=Object.assign({wheelBase:18,radius:8,maxSpeed:72,acceleration:190,sensorMax:180,sensorMin:2},opts||{});
      this.load(track||GR_makeTrack('straight'));
    }
    load(track){ this.track=JSON.parse(JSON.stringify(track)); this.reset(); }
    reset(){
      const s=this.track.start;
      this.car={x:s.x,y:s.y,a:s.a||0,left:0,right:0,targetLeft:0,targetRight:0};
      this.servoAngle=90;this.sensorDistance=null;this.collision=false;this.goal=false;this.time=0;
      this.variables={distanza:null,distanzaSinistra:null,distanzaDestra:null};
      this.history=[];
    }
    setWheels(left,right){
      const m=this.opts.maxSpeed;
      this.car.targetLeft=clamp(left,-m,m);this.car.targetRight=clamp(right,-m,m);
    }
    stop(){this.setWheels(0,0);}
    setServo(degrees){this.servoAngle=clamp(degrees,20,160);}
    sense(angleOverride){
      const servo=angleOverride==null?this.servoAngle:angleOverride;
      const a=this.car.a+(servo-90)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);
      const nose=this.opts.radius*.85,ox=this.car.x+Math.cos(this.car.a)*nose,oy=this.car.y+Math.sin(this.car.a)*nose;
      let best=this.opts.sensorMax;
      const borders=[{x:-2,y:-2,w:this.track.width+4,h:2},{x:-2,y:this.track.height,w:this.track.width+4,h:2},{x:-2,y:0,w:2,h:this.track.height},{x:this.track.width,y:0,w:2,h:this.track.height}];
      for(const o of this.track.obstacles.concat(borders)){
        const t=rayRect(ox,oy,dx,dy,o,this.opts.sensorMax);
        if(t!=null&&t<best)best=t;
      }
      this.sensorDistance=best>=this.opts.sensorMax?null:Math.max(this.opts.sensorMin,Math.round(best));
      this.variables.distanza=this.sensorDistance;
      return this.sensorDistance;
    }
    collides(x,y){
      const r=this.opts.radius;
      if(x-r<0||y-r<0||x+r>this.track.width||y+r>this.track.height)return true;
      return this.track.obstacles.some(o=>circleRect(x,y,r,o));
    }
    inGoal(){const g=this.track.goal;return circleRect(this.car.x,this.car.y,this.opts.radius*.45,g);}
    step(dt){
      dt=clamp(Number(dt)||0,0,.05);this.time+=dt;
      const c=this.car,maxDelta=this.opts.acceleration*dt;
      const approach=(v,t)=>v<t?Math.min(t,v+maxDelta):Math.max(t,v-maxDelta);
      c.left=approach(c.left,c.targetLeft);c.right=approach(c.right,c.targetRight);
      const linear=(c.left+c.right)/2,angular=(c.right-c.left)/this.opts.wheelBase;
      const na=norm(c.a+angular*dt),nx=c.x+Math.cos(na)*linear*dt,ny=c.y+Math.sin(na)*linear*dt;
      if(this.collides(nx,ny)){this.collision=true;this.stop();c.left=0;c.right=0;}
      else {c.x=nx;c.y=ny;c.a=na;}
      this.goal=this.inGoal();
      return {collision:this.collision,goal:this.goal,x:c.x,y:c.y,a:c.a};
    }
    snapshot(){return JSON.parse(JSON.stringify({car:this.car,servoAngle:this.servoAngle,sensorDistance:this.sensorDistance,variables:this.variables,collision:this.collision,goal:this.goal,time:this.time}));}
  }

  const api={Sim:GR_Sim,makeTrack:GR_makeTrack,rayRect,circleRect,clamp};
  root.GR_SIM=Object.freeze(api);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
