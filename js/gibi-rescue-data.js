/* ============================================================
   GIBI RESCUE — dati, kit, blocchi e missioni
   Nessuna dipendenza DOM. Tutti i testi di gioco sono qui.
   ============================================================ */
(function(root){
  'use strict';

  const GR_PIN_MAP={
    leftEnable:5,leftIn1:2,leftIn2:4,rightEnable:6,rightIn3:7,rightIn4:8,
    servo:9,trig:12,echo:11
  };

  const GR_BLOCKS={
    setupMotors:{label:'PREPARA I MOTORI',icon:'🔌',cat:'start',kind:'setup'},
    setupSensor:{label:'PREPARA IL SENSORE',icon:'👀',cat:'start',kind:'setup'},
    setupServo:{label:'PREPARA IL SERVO',icon:'↔️',cat:'start',kind:'setup'},
    forward:{label:'AVANTI',icon:'⬆️',cat:'move',kind:'command'},
    backward:{label:'INDIETRO',icon:'⬇️',cat:'move',kind:'command'},
    stop:{label:'STOP',icon:'🛑',cat:'move',kind:'command'},
    left:{label:'GIRA A SINISTRA',icon:'↶',cat:'move',kind:'command'},
    right:{label:'GIRA A DESTRA',icon:'↷',cat:'move',kind:'command'},
    wait:{label:'ATTENDI 1 s',icon:'⏳',cat:'control',kind:'command'},
    repeat:{label:'RIPETI 2 VOLTE',icon:'🔁',cat:'control',kind:'command'},
    read:{label:'LEGGI DISTANZA',icon:'📡',cat:'sensor',kind:'command'},
    show:{label:'MOSTRA centimetri',icon:'📏',cat:'data',kind:'command'},
    ifNear:{label:'SE distanza < 20 cm',icon:'🔀',cat:'control',kind:'command'},
    avoid:{label:'SE VICINO: EVITA',icon:'🚧',cat:'control',kind:'command'},
    lookLeft:{label:'GUARDA SINISTRA',icon:'👈',cat:'sensor',kind:'command'},
    saveLeft:{label:'SALVA distanzaSinistra',icon:'💾',cat:'data',kind:'command'},
    lookRight:{label:'GUARDA DESTRA',icon:'👉',cat:'sensor',kind:'command'},
    saveRight:{label:'SALVA distanzaDestra',icon:'💾',cat:'data',kind:'command'},
    choose:{label:'GIRA VERSO IL PIÙ LIBERO',icon:'⚖️',cat:'control',kind:'command'},
    rescue:{label:'CONSEGNA LA BATTERIA',icon:'🔋',cat:'data',kind:'command'}
  };

  const part=(id,label,icon,role)=>({id,label,icon,role});
  const GR_PARTS={
    chassis:part('chassis','TELAIO','🛠️','Sostiene tutti i pezzi.'),
    leftWheel:part('leftWheel','RUOTA SINISTRA','⚙️','Trasforma il giro del motore in movimento.'),
    rightWheel:part('rightWheel','RUOTA DESTRA','⚙️','Lavora insieme alla ruota sinistra.'),
    caster:part('caster','RUOTINO FOLLE','🔘','Tiene in equilibrio l’auto.'),
    arduinoMount:part('arduinoMount','SUPPORTO ARDUINO','🔩','Tiene fermo il cervello elettronico.'),
    arduino:part('arduino','ARDUINO UNO','🧠','Legge il programma e decide.'),
    driver:part('driver','DRIVER L298N','💪','Dà ai motori la potenza necessaria.'),
    battery:part('battery','PORTAPILE AA','🔋','Fornisce energia ai motori.'),
    motorLeft:part('motorLeft','MOTORE SINISTRO','🌀','Fa girare la ruota sinistra.'),
    motorRight:part('motorRight','MOTORE DESTRO','🌀','Fa girare la ruota destra.'),
    ultrasonic:part('ultrasonic','HC-SR04','👀','Misura la distanza con ultrasuoni.'),
    servo:part('servo','SERVO SG90','↔️','Gira gli occhi a sinistra e a destra.')
  };

  const M=(n,chapter,title,icon,goal,concept,type,extra)=>Object.assign({
    n,chapter,title,icon,goal,concept,type,
    story:'Gibi ha bisogno del tuo aiuto.',
    safety:'',
    required:[],palette:[],starter:[],track:'straight',
    discovery:'Hai collegato una causa a un effetto: è così che ragiona un robot!'
  },extra||{});

  const GR_MISSIONS=[
    M(1,0,'I pezzi della Rescue Car','🔧','Monta i cinque pezzi del telaio.','Ogni componente ha un ruolo.','build',{
      story:'Prima del soccorso costruiamo una base forte.',
      required:['chassis','leftWheel','rightWheel','caster','arduinoMount'],
      discovery:'Il telaio sostiene i pezzi; le ruote trasformano il giro dei motori in movimento.'
    }),
    M(2,0,'Il cervello e l’energia','🧠','Monta Arduino, driver e portapile, poi collega le tre linee sicure.','Arduino decide, il driver dà potenza.','build',{
      story:'Ora diamo alla Rescue Car un cervello e l’energia.',required:['arduino','driver','battery'],
      wires:['USB → Arduino','GND comune','Pile AA → L298N'],
      safety:'⚠️ Spegni l’alimentazione prima di cambiare i fili. I motori non vanno mai collegati direttamente ai pin di Arduino.',
      discovery:'Arduino invia piccoli segnali; il driver usa quei segnali per controllare la corrente dei motori.'
    }),
    M(3,0,'Sveglia un motore','🌀','Prepara i pin e avvia piano il motore sinistro.','output, direzione e velocità PWM.','program',{
      parts:['motorLeft'],required:['setupMotors','forward'],palette:['setupMotors','forward','stop'],starter:['setupMotors'],track:'motor',
      safety:'⚠️ Per la prova reale usa il driver L298N e pile AA ricaricabili.',
      discovery:'Un pin output invia un comando. Il PWM regola la velocità accendendo e spegnendo molto rapidamente.'
    }),
    M(4,1,'Avanti insieme','⬆️','Fai avanzare le due ruote fino alla zona verde.','Due attuatori coordinati.','program',{
      parts:['motorRight'],required:['forward'],palette:['forward','left','right','stop'],starter:[],track:'straight',
      discovery:'Con le due ruote alla stessa velocità, la Rescue Car va diritta.'
    }),
    M(5,1,'Fermati, torna, gira','↩️','Esegui la manovra nell’ordine giusto.','Sequenza e guida differenziale.','program',{
      required:['forward','stop','backward','right'],palette:['right','backward','stop','forward','left'],starter:[],track:'parking',
      discovery:'L’ordine dei comandi cambia il risultato, proprio come l’ordine delle parole cambia una frase.'
    }),
    M(6,1,'Il giro di prova','🔁','Usa RIPETI per completare due lati della pista.','loop e ripetizione.','program',{
      required:['repeat','forward','right'],palette:['repeat','forward','right','left','stop'],starter:['repeat'],track:'loop',
      discovery:'Un loop ripete istruzioni senza doverle riscrivere ogni volta.'
    }),
    M(7,2,'Gli occhi a ultrasuoni','👀','Monta HC-SR04 e collega i quattro pin.','TRIG invia, ECHO ascolta.','build',{
      story:'Per evitare gli ostacoli, l’auto deve prima riuscire a vederli.',required:['ultrasonic'],
      wires:['VCC → 5V','GND → GND','TRIG → D12','ECHO → D11'],
      discovery:'TRIG avvia l’impulso; ECHO misura quanto tempo impiega il suono a tornare.'
    }),
    M(8,2,'Quanti centimetri?','📏','Leggi e mostra la distanza di tre oggetti.','input, valore e variabile distanza.','measure',{
      required:['read','show'],palette:['read','show','forward'],starter:['read'],samples:[12,35,78],track:'sensor',
      discovery:'Una variabile è una scatola con un nome: distanza conserva l’ultima misura in centimetri.'
    }),
    M(9,2,'Se è vicino, fermati','🛑','Ferma l’auto prima del muro usando la soglia.','if/else e soglia.','program',{
      required:['read','ifNear'],palette:['read','ifNear','forward','stop'],starter:['read'],track:'wall',threshold:20,
      discovery:'if controlla una condizione; else dice cosa fare quando la condizione non è vera.'
    }),
    M(10,3,'Trova un’altra strada','🚧','Evita l’ostacolo e raggiungi la consegna.','Una strategia composta.','program',{
      required:['read','avoid','backward','right','forward'],palette:['read','avoid','stop','backward','right','left','forward'],starter:['read'],track:'avoid',
      discovery:'Un comportamento complesso nasce da tanti passi semplici messi nell’ordine giusto.'
    }),
    M(11,3,'Guarda a sinistra e a destra','↔️','Monta il servo, misura i due lati e scegli quello più libero.','Confronto fra due valori.','program',{
      parts:['servo'],required:['setupServo','lookLeft','saveLeft','lookRight','saveRight','choose'],palette:['setupServo','lookLeft','saveLeft','lookRight','saveRight','choose','left','right'],starter:['setupServo'],track:'choice',needsServo:true,
      discovery:'Confrontare due misure permette al programma di scegliere la strada più libera.'
    }),
    M(12,3,'Batteria in arrivo!','🔋','Porta la batteria al piccolo robot senza urti.','Sensore → decisione → movimento.','program',{
      required:['read','avoid','forward','rescue'],palette:['read','avoid','forward','stop','backward','left','right','lookLeft','lookRight','choose','rescue'],starter:[],track:'rescue',final:true,
      story:'Il piccolo robot è senza energia. La città conta su di te!',
      discovery:'Hai costruito un sistema autonomo completo: misura, decide, agisce e controlla di nuovo il mondo.'
    })
  ];

  const GR_CHAPTERS=[
    {title:'L’Officina',sub:'Costruiamo l’auto',icon:'🔧',color:'#f39b31'},
    {title:'La Pista Prove',sub:'Insegniamole a muoversi',icon:'🏁',color:'#387de5'},
    {title:'Il Quartiere dei Sensori',sub:'Insegniamole a vedere',icon:'📡',color:'#22a46b'},
    {title:'Il Centro Città',sub:'Insegniamole a scegliere',icon:'🏙️',color:'#7a54d8'}
  ];

  const api={version:1,pinMap:GR_PIN_MAP,blocks:GR_BLOCKS,parts:GR_PARTS,missions:GR_MISSIONS,chapters:GR_CHAPTERS};
  root.GR_DATA=Object.freeze(api);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
