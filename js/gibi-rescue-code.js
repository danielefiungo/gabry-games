/* ============================================================
   GIBI RESCUE — AST, interprete e generatori di codice
   Un unico significato dei blocchi alimenta simulazione e Arduino.
   ============================================================ */
(function(root){
  'use strict';
  const DATA=root.GR_DATA||(typeof require==='function'?require('./gibi-rescue-data.js'):null);
  const B=DATA.blocks,P=DATA.pinMap;

  function normalize(input){
    const ids=Array.isArray(input)?input.slice():[].concat(input&&input.setup||[],input&&input.loop||[]);
    const ast={schemaVersion:1,setup:[],loop:[]};
    ids.forEach(raw=>{const id=typeof raw==='string'?raw:raw&&raw.type;if(!id)return;(B[id]&&B[id].kind==='setup'?ast.setup:ast.loop).push({type:id});});
    return ast;
  }
  function flatten(ast){return [].concat(ast.setup||[],ast.loop||[]).map(n=>typeof n==='string'?n:n.type);}
  function validate(input,allowed){
    const errors=[],ast=normalize(input),ids=flatten(ast),allow=allowed?new Set(allowed):null;
    ids.forEach((id,i)=>{if(!B[id])errors.push({index:i,message:'Blocco sconosciuto: '+id});else if(allow&&!allow.has(id))errors.push({index:i,message:'Questo blocco non è ancora sbloccato.'});});
    if(ids.length>80)errors.push({message:'Il programma può contenere al massimo 80 blocchi.'});
    return {ok:errors.length===0,errors,ast};
  }
  function matches(input,required){
    const ids=flatten(normalize(input));let pos=0;
    for(const id of ids)if(id===required[pos])pos++;
    return pos===required.length;
  }

  function compileActions(input){
    const ids=flatten(normalize(input)),actions=[];
    const add=(type,duration,extra)=>actions.push(Object.assign({type,duration:duration||0},extra||{}));
    for(let i=0;i<ids.length;i++){
      const id=ids[i];
      if(id==='setupMotors'||id==='setupSensor'||id==='setupServo')add(id,.25);
      else if(id==='forward')add('wheels',1.9,{left:58,right:58,block:id});
      else if(id==='backward')add('wheels',.55,{left:-48,right:-48,block:id});
      else if(id==='stop')add('wheels',.35,{left:0,right:0,block:id});
      else if(id==='left')add('wheels',.58,{left:-42,right:42,block:id});
      else if(id==='right')add('wheels',.58,{left:42,right:-42,block:id});
      else if(id==='wait')add('wait',1,{block:id});
      else if(id==='read')add('sense',.35,{block:id});
      else if(id==='show')add('show',.45,{block:id});
      else if(id==='ifNear')add('ifNear',2.6,{threshold:20,block:id});
      else if(id==='avoid'){
        add('avoid',.2,{block:id});add('wheels',.45,{left:-45,right:-45,block:id});
        add('wheels',.62,{left:46,right:-46,block:id});add('wheels',1.25,{left:58,right:58,block:id});
        add('wheels',.62,{left:-46,right:46,block:id});add('wheels',1.15,{left:58,right:58,block:id});
      }
      else if(id==='lookLeft')add('servo',.55,{angle:150,block:id});
      else if(id==='saveLeft')add('saveLeft',.35,{block:id});
      else if(id==='lookRight')add('servo',.8,{angle:30,block:id});
      else if(id==='saveRight')add('saveRight',.35,{block:id});
      else if(id==='choose')add('choose',.75,{block:id});
      else if(id==='repeat')add('repeat',.25,{block:id});
      else if(id==='rescue')add('rescue',.4,{block:id});
    }
    return actions;
  }

  const gabri={
    setupMotors:'preparaMotori();',setupSensor:'preparaSensore();',setupServo:'preparaServo();',
    forward:'vaiAvanti();',backward:'vaiIndietro();',stop:'fermati();',left:'giraASinistra();',right:'giraADestra();',
    wait:'attendi(1 secondo);',repeat:'ripeti 2 volte {',read:'distanza = misuraDistanza();',show:'mostra(distanza + " cm");',
    ifNear:'se (distanza < 20 cm) { fermati(); } altrimenti { vaiAvanti(); }',
    avoid:'se è vicino { fermati(); indietro(); giraADestra(); }',lookLeft:'guarda(SINISTRA);',saveLeft:'distanzaSinistra = misuraDistanza();',
    lookRight:'guarda(DESTRA);',saveRight:'distanzaDestra = misuraDistanza();',
    choose:'gira verso la distanza maggiore;',rescue:'consegnaBatteria();'
  };
  const ard={
    forward:'avanti();',backward:'indietro();',stop:'ferma();',left:'giraSinistra();',right:'giraDestra();',wait:'delay(1000);',
    read:'distanza = misuraDistanza();',show:'Serial.println(distanza);',repeat:'for (byte giro = 0; giro < 2; giro++) {',
    ifNear:'if (distanza < 20) { ferma(); } else { avanti(); }',
    avoid:'if (distanza < 20) { ferma(); delay(150); indietro(); delay(450); giraDestra(); delay(500); }',
    lookLeft:'testa.write(150); delay(400);',saveLeft:'distanzaSinistra = misuraDistanza();',
    lookRight:'testa.write(30); delay(650);',saveRight:'distanzaDestra = misuraDistanza();',
    choose:'if (distanzaSinistra > distanzaDestra) giraSinistra(); else giraDestra();',rescue:'ferma(); // Batteria consegnata!'
  };

  function gabriCode(input){
    const ast=normalize(input),lines=['quando parte {'],ranges={};
    ast.setup.forEach(n=>{ranges[n.type]=[lines.length+1,lines.length+1];lines.push('  '+gabri[n.type]);});
    lines.push('}','sempre {');
    ast.loop.forEach(n=>{const start=lines.length+1;lines.push('  '+gabri[n.type]);if(n.type==='repeat')lines.push('    // i blocchi seguenti si ripetono','  }');ranges[n.type]=[start,lines.length];});
    lines.push('}');return {code:lines.join('\n'),ranges};
  }

  function arduinoCode(input,meta){
    const ast=normalize(input),ids=flatten(ast),servo=ids.some(id=>['setupServo','lookLeft','lookRight','saveLeft','saveRight','choose'].includes(id));
    const sensor=ids.some(id=>['setupSensor','read','ifNear','avoid','lookLeft','lookRight','saveLeft','saveRight','choose'].includes(id));
    const lines=[],ranges={};
    if(servo)lines.push('#include <Servo.h>');
    lines.push('// Gibi Rescue — sketch generato',
      `const byte ENA=${P.leftEnable}, IN1=${P.leftIn1}, IN2=${P.leftIn2};`,
      `const byte ENB=${P.rightEnable}, IN3=${P.rightIn3}, IN4=${P.rightIn4};`,
      `const byte TRIG=${P.trig}, ECHO=${P.echo};`);
    if(servo)lines.push(`const byte SERVO_PIN=${P.servo};`,'Servo testa;');
    lines.push('long distanza = 0, distanzaSinistra = 0, distanzaDestra = 0;','',
      'void motori(int sx, int dx) {','  digitalWrite(IN1, sx >= 0); digitalWrite(IN2, sx < 0);','  digitalWrite(IN3, dx >= 0); digitalWrite(IN4, dx < 0);','  analogWrite(ENA, abs(sx)); analogWrite(ENB, abs(dx));','}',
      'void avanti(){ motori(150,150); }','void indietro(){ motori(-130,-130); }','void ferma(){ motori(0,0); }','void giraSinistra(){ motori(-130,130); }','void giraDestra(){ motori(130,-130); }');
    if(sensor)lines.push('',
      'long misuraDistanza() {','  digitalWrite(TRIG, LOW); delayMicroseconds(2);','  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);',
      '  unsigned long durata = pulseIn(ECHO, HIGH, 30000UL);','  if (durata == 0) return 400;','  return durata / 58;','}');
    lines.push('','void setup() {','  Serial.begin(9600);','  pinMode(IN1,OUTPUT); pinMode(IN2,OUTPUT); pinMode(ENA,OUTPUT);','  pinMode(IN3,OUTPUT); pinMode(IN4,OUTPUT); pinMode(ENB,OUTPUT);');
    if(sensor)lines.push('  pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT);');
    if(servo)lines.push('  testa.attach(SERVO_PIN); testa.write(90);');
    ast.setup.forEach(n=>{ranges[n.type]=[lines.length+1,lines.length+1];lines.push('  // '+B[n.type].label);});
    lines.push('}','', 'void loop() {');
    ast.loop.forEach(n=>{const start=lines.length+1;lines.push('  '+(ard[n.type]||('// '+B[n.type].label)));if(n.type==='repeat')lines.push('    avanti(); delay(900); giraDestra(); delay(500);','  }');ranges[n.type]=[start,lines.length];});
    lines.push('}');
    return {code:lines.join('\n'),ranges,filename:((meta&&meta.name)||'gibi-rescue').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.ino'};
  }

  const api={normalize,flatten,validate,matches,compileActions,gabriCode,arduinoCode};
  root.GR_CODE=Object.freeze(api);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
