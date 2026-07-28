/* carica TUTTI gli script di index.html come farebbe il browser e segnala errori */
const fs=require('fs'), path=require('path'), {JSDOM}=require('jsdom');
const DIR='/sessions/kind-sharp-tesla/mnt/GabriGame';
const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="js\/([^"?]+)/g)].map(m=>m[1]);
const dom=new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g,''),{runScripts:'dangerously',url:'http://localhost/'});
const w=dom.window; const errs=[];
w.addEventListener('error',e=>errs.push('window error: '+e.message));
w.eval(`
 window.requestAnimationFrame=()=>0; window.cancelAnimationFrame=()=>{};
 window.fetch=()=>Promise.reject(new Error('no net')); window.indexedDB={open:()=>({})};
 window.speechSynthesis={speak(){},cancel(){},getVoices:()=>[],addEventListener(){}};
 window.SpeechSynthesisUtterance=function(){}; window.devicePixelRatio=1;
 function P(v){return {value:v||0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}}}
 function N(x){return Object.assign({connect(){},disconnect(){}},x||{})}
 window.AudioContext=function(){return {state:'running',sampleRate:44100,currentTime:0,resume(){},destination:N(),
  createGain:()=>N({gain:P(1)}),createBiquadFilter:()=>N({type:'',frequency:P(1),Q:P(1)}),createDelay:()=>N({delayTime:P(0)}),
  createPeriodicWave:()=>({}),createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)}),
  createBufferSource:()=>N({buffer:null,start(){},stop(){}}),
  createOscillator:()=>N({type:'',frequency:P(0),detune:P(0),setPeriodicWave(){},start(){},stop(){}})}};
 window.webkitAudioContext=window.AudioContext;
 HTMLCanvasElement.prototype.getContext=function(){return {canvas:this,fillRect(){},clearRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},arc(){},ellipse(){},fill(){},stroke(){},save(){},restore(){},translate(){},rotate(){},scale(){},fillText(){},drawImage(){},measureText:()=>({width:10}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),getImageData:()=>({data:[]}),putImageData(){},setTransform(){},createPattern:()=>null}};
 window.THREE=new Proxy(function(){},{get:(t,k)=>{ if(k==='Vector3'||k==='Vector2') return function(x,y,z){this.x=x||0;this.y=y||0;this.z=z||0;this.set=function(a,b,c){this.x=a;this.y=b;this.z=c;return this};this.copy=function(v){return this};this.clone=function(){return this};this.add=function(){return this};this.sub=function(){return this};this.normalize=function(){return this};this.multiplyScalar=function(){return this};this.length=()=>1;this.distanceTo=()=>1;this.applyQuaternion=function(){return this};this.project=function(){return this};this.crossVectors=function(){return this};this.setFromMatrixColumn=function(){return this};};
   return function(){ return new Proxy({},{get:(o,p)=>{ if(p==='position'||p==='rotation'||p==='scale') return {x:0,y:0,z:0,set(){},copy(){}}; if(p==='children') return []; if(p==='userData') return {}; if(p==='attributes') return {position:{array:new Float32Array(9),count:3,setXY(){},getX:()=>0,getY:()=>0,needsUpdate:false}}; if(p==='domElement') return document.createElement('canvas'); if(p==='style') return {}; return function(){ return new Proxy({},{get:()=>function(){}}) }; },set:()=>true}); };
 }});
`);
files.forEach(f=>{
  const s=w.document.createElement('script');
  s.textContent=fs.readFileSync(path.join(DIR,'js',f),'utf8');
  try{ w.document.body.appendChild(s); }catch(e){ errs.push(f+': '+e.message); }
});
try{ w.dispatchEvent(new w.Event('load')); }catch(e){ errs.push('load: '+e.message); }
const names=['playMusic','stopMusic','duckMusic','levelTrack','fanfare','toggleMusic','musPanelOpen','TRK_LEVEL','TRK_HIVE','MUSICON','TRACKS'];
console.log('script caricati:',files.length);
names.forEach(n=>{ let v; try{ v=w.eval('typeof '+n); }catch(e){ v='ERRORE '+e.message; } console.log('  '+n+': '+v); });
console.log(errs.length?('\nERRORI:\n'+errs.join('\n')):'\nnessun errore di caricamento');
