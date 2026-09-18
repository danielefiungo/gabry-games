/* Coordinate stabili della superficie: la scena non cambia a ogni pressione. */
(function(root){
  'use strict';
  const craters=[0,3,7,8].map((index)=>({x:0,z:-index*22-10,r:index===7?5.3:4.8,depth:2.2}));
  for(let i=0;i<18;i++)craters.push({x:(i%2?1:-1)*(13+(i*19)%57),z:18-(i*43)%320,r:2.5+i%5,depth:1+i%3*.5});
  function noise(x,z){return Math.sin(x*.19+Math.cos(z*.06))*Math.cos(z*.17)*.23+Math.sin(x*.73+z*.38)*.075;}
  function height(x,z){let y=-.05+noise(x,z)*Math.min(1,Math.abs(x)/6);for(const c of craters){const d=Math.hypot(x-c.x,z-c.z)/c.r;if(d>1.7)continue;if(d<1)y-=c.depth*Math.pow(1-d*d,2);y+=.38*Math.exp(-Math.pow((d-1.06)/.17,2));}return y;}
  function baseFor(index,phase,type){return phase==='explore'?-index*22:type==='fly'?0:-264;}
  const api={craters,height,baseFor};if(typeof module==='object'&&module.exports)module.exports=api;else root.LunarLandscape=api;
})(typeof window==='undefined'?this:window);
