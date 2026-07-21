/* Test unitari del nucleo Gibi Rescue — solo moduli Node integrati. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const DATA=require(path.join(__dirname,'..','js','gibi-rescue-data.js'));
global.GR_DATA=DATA;
const SIM=require(path.join(__dirname,'..','js','gibi-rescue-sim.js'));
const CODE=require(path.join(__dirname,'..','js','gibi-rescue-code.js'));

test('la specifica dati espone 12 missioni in quattro capitoli',()=>{
  assert.equal(DATA.missions.length,12);
  assert.deepEqual([...new Set(DATA.missions.map(m=>m.chapter))],[0,1,2,3]);
  assert.deepEqual(DATA.pinMap,{leftEnable:5,leftIn1:2,leftIn2:4,rightEnable:6,rightIn3:7,rightIn4:8,servo:9,trig:12,echo:11});
});

test('cinematica differenziale: avanti diritto e rotazione sul posto',()=>{
  const sim=new SIM.Sim(SIM.makeTrack('straight'));
  const y=sim.car.y,a=sim.car.a;
  sim.setWheels(50,50);for(let i=0;i<30;i++)sim.step(.02);
  assert.ok(sim.car.x>sim.track.start.x+8);assert.ok(Math.abs(sim.car.y-y)<.001);assert.ok(Math.abs(sim.car.a-a)<.001);
  sim.reset();sim.setWheels(-40,40);for(let i=0;i<30;i++)sim.step(.02);
  assert.ok(Math.abs(sim.car.x-sim.track.start.x)<.5);assert.ok(sim.car.a>.5);
});

test('collisione stabile ferma le ruote e conserva una posizione valida',()=>{
  const track=SIM.makeTrack('straight');track.obstacles=[{x:48,y:55,w:12,h:40}];
  const sim=new SIM.Sim(track);sim.setWheels(70,70);
  for(let i=0;i<100&&!sim.collision;i++)sim.step(.02);
  assert.equal(sim.collision,true);assert.equal(sim.car.targetLeft,0);assert.equal(sim.car.targetRight,0);assert.ok(sim.car.x<48);
});

test('HC-SR04 usa la stessa geometria degli ostacoli',()=>{
  const track=SIM.makeTrack('straight');track.obstacles=[{x:76,y:65,w:10,h:20}];
  const sim=new SIM.Sim(track);const d=sim.sense();
  assert.ok(d>=40&&d<=45,`distanza=${d}`);
  sim.setServo(150);const side=sim.sense();assert.ok(side>d+30,`laterale=${side}`);
});

test('servo rispetta i limiti didattici',()=>{
  const sim=new SIM.Sim();sim.setServo(999);assert.equal(sim.servoAngle,160);sim.setServo(-10);assert.equal(sim.servoAngle,20);
});

test('AST normalizzato, validato e confrontato in ordine',()=>{
  const ast=CODE.normalize(['setupMotors','forward','stop']);
  assert.deepEqual(CODE.flatten(ast),['setupMotors','forward','stop']);
  assert.equal(CODE.validate(ast,['setupMotors','forward','stop']).ok,true);
  assert.equal(CODE.validate(['bloccoInventato']).ok,false);
  assert.equal(CODE.matches(['forward','stop','right'],['forward','stop','right']),true);
  assert.equal(CODE.matches(['stop','forward','right'],['forward','stop','right']),false);
});

test('interprete produce azioni coerenti per sensore, servo e movimento',()=>{
  const actions=CODE.compileActions(['read','avoid','lookLeft','saveLeft']);
  assert.equal(actions[0].type,'sense');assert.ok(actions.some(a=>a.type==='wheels'&&a.left<0));assert.ok(actions.some(a=>a.type==='servo'&&a.angle===150));assert.equal(actions.at(-1).type,'saveLeft');
});

test('Codice di Gabri e Arduino restano sincronizzati ai blocchi',()=>{
  const blocks=['setupMotors','setupSensor','setupServo','read','ifNear','lookLeft','saveLeft'];
  const gabri=CODE.gabriCode(blocks),arduino=CODE.arduinoCode(blocks,{name:'Test Rescue'});
  assert.match(gabri.code,/distanza = misuraDistanza/);assert.ok(gabri.ranges.read);
  assert.match(arduino.code,/#include <Servo.h>/);assert.match(arduino.code,/pulseIn\(ECHO, HIGH, 30000UL\)/);
  assert.match(arduino.code,/const byte ENA=5/);assert.match(arduino.code,/TRIG=12, ECHO=11/);assert.ok(arduino.ranges.ifNear);
  assert.equal(arduino.filename,'test-rescue.ino');
});

test('tutte le missioni di programmazione hanno blocchi definiti e soluzione valida',()=>{
  for(const m of DATA.missions.filter(m=>m.type!=='build')){
    for(const id of [...m.required,...m.palette,...m.starter])assert.ok(DATA.blocks[id],`${m.n}: ${id}`);
    assert.equal(CODE.matches(m.required,m.required),true,`missione ${m.n}`);
    assert.equal(CODE.validate(m.required,m.palette.concat(m.starter)).ok,true,`missione ${m.n}`);
  }
});
