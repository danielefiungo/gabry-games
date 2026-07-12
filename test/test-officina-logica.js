/* Test harness per il Banco 2: Porte logiche */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const src=fs.readFileSync(path.join(__dirname,'..','js','officina-logica.js'),'utf8');
const dom=new JSDOM('<!doctype html><body><div id="hud"></div><div id="joy"></div><div id="menu"></div><div id="modeSel"></div><div id="oc"></div></body>',{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost'});
const w=dom.window;
w.eval(`var paused=true;function $(x){return document.getElementById(x)}function LI(){return 0}function speak(){}function stopSpeak(){}function showModeSel(){}window.requestAnimationFrame=()=>0;`);
w.eval(src);const OL=w.__OL,ol=OL.ol;let pass=0,fail=0;
function T(n,c){if(c){pass++;console.log('  ok  '+n)}else{fail++;console.log('  FAIL '+n)}}
function settle(){for(let i=0;i<30;i++)OL.step(.02)}
console.log('Porte singole');
T('AND 1,1 = 1',OL.gate('AND',1,1)===true);T('AND 1,0 = 0',OL.gate('AND',1,0)===false);
T('OR 0,1 = 1',OL.gate('OR',0,1)===true);T('NOT 0 = 1',OL.gate('NOT',0)===true);
T('XOR uguali = 0',OL.gate('XOR',1,1)===false);T('XOR diversi = 1',OL.gate('XOR',1,0)===true);
console.log('Livelli e progressione');ol.on=true;OL.goto(1,true);ol.bits=[true,true];OL.draw();settle();T('AND completa il livello',ol.won);T('sblocca livello seguente',ol.prog.unl>=2);T('salva stelle',ol.prog.stars[1]>0);
OL.goto(6,true);ol.bits=[true,false];OL.draw();T('allarme: porta aperta e chiave assente',ol.outs[0]===true);
OL.goto(7,true);ol.bits=[true,true];OL.draw();T('1+1: somma 0',ol.outs[0]===false);T('1+1: riporto 1',ol.outs[1]===true);settle();T('mini-sommatore completa',ol.won);
T('otto livelli disponibili',OL.levels.length===8);
console.log('\n'+pass+' ok, '+fail+' fail');process.exit(fail?1:0);
