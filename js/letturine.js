/* ============================================================
   LETTURINE — scorciatoie della mappa 📖
   Un livello chiuso si può sbloccare leggendo una letturina:
   4-5 curiosità VERE sul tema + 2 domande la cui risposta
   è nel testo. Bonus ⭐ dimezzato se si usa 🔊 o si sbaglia.
   Allineate a THEMES (stesso ordine dei livelli, 13 temi).
   ============================================================ */
const LT_BONUS=30;           /* ⭐ se tutto giusto e letto da solo */
const LT_COST_READ=40;       /* costo del 🔊, come nelle domande  */

const LETTURINE=[
 { /* 0 Razzi Spaziali 🚀 */
  facts:[
   ["Il razzo Saturn V, che portò gli astronauti verso la Luna, era alto più di 110 metri: come un palazzo di 30 piani.",
    "The Saturn V rocket, which carried astronauts toward the Moon, was over 110 metres tall: like a 30-storey building."],
   ["Un razzo si muove spingendo gas caldissimi verso il basso: il gas spinge in giù e il razzo sale in su.",
    "A rocket moves by pushing very hot gas downward: the gas pushes down and the rocket goes up."],
   ["Alla partenza quasi tutto il peso di un razzo è carburante: il razzo è come un serbatoio volante.",
    "At liftoff almost all of a rocket's weight is fuel: the rocket is like a flying fuel tank."],
   ["I razzi sono fatti a pezzi chiamati stadi: quando uno stadio finisce il carburante si stacca, così il razzo resta leggero.",
    "Rockets are built in pieces called stages: when a stage runs out of fuel it drops off, so the rocket stays light."],
   ["Nello spazio non c'è aria, perciò i razzi portano con sé anche l'ossigeno che serve per bruciare il carburante.",
    "There is no air in space, so rockets carry their own oxygen to burn the fuel."]],
  qs:[
   {q:["Perché il razzo lascia cadere gli stadi vuoti?","Why does the rocket drop its empty stages?"],
    ok:["Per restare leggero","To stay light"],
    no:[["Per fare i fuochi d'artificio","To make fireworks"],["Perché sono troppo caldi","Because they are too hot"]]},
   {q:["Cosa fa salire il razzo verso l'alto?","What makes the rocket go up?"],
    ok:["Il gas caldissimo spinto verso il basso","The very hot gas pushed downward"],
    no:[["Un ventilatore gigante","A giant fan"],["Il vento forte","The strong wind"]]}]},
 { /* 1 Fenomeni Naturali 🌋 */
  facts:[
   ["Il lampo e il tuono nascono insieme, ma vedi prima il lampo perché la luce è molto più veloce del suono.",
    "Lightning and thunder are born together, but you see the lightning first because light is much faster than sound."],
   ["L'arcobaleno appare quando il sole illumina le goccioline di pioggia: le gocce dividono la luce in tanti colori.",
    "A rainbow appears when the sun shines on raindrops: the drops split the light into many colours."],
   ["Dentro la Terra c'è roccia fusa che si chiama magma; quando esce dal vulcano cambia nome: si chiama lava.",
    "Inside the Earth there is melted rock called magma; when it comes out of a volcano its name changes: it is called lava."],
   ["I terremoti avvengono perché i pezzi enormi della crosta terrestre si muovono piano piano e ogni tanto scattano di colpo.",
    "Earthquakes happen because huge pieces of the Earth's crust move very slowly and sometimes jerk all at once."],
   ["Il tornado è una colonna d'aria che gira velocissima, a forma di imbuto, e scende dalle nuvole fino a terra.",
    "A tornado is a column of air spinning very fast, shaped like a funnel, coming down from the clouds to the ground."]],
  qs:[
   {q:["Perché vedi il lampo prima di sentire il tuono?","Why do you see the lightning before you hear the thunder?"],
    ok:["Perché la luce è più veloce del suono","Because light is faster than sound"],
    no:[["Perché il tuono parte il giorno dopo","Because thunder leaves the next day"],["Perché il lampo è silenzioso","Because lightning is shy and quiet"]]},
   {q:["Come si chiama la roccia fusa quando esce dal vulcano?","What is melted rock called when it comes out of the volcano?"],
    ok:["Lava","Lava"],
    no:[["Magma","Magma"],["Ghiaccio","Ice"]]}]},
 { /* 2 Disastri Navali 🚢 */
  facts:[
   ["Il Titanic era la nave più grande del suo tempo: affondò nel 1912 dopo aver urtato un iceberg.",
    "The Titanic was the biggest ship of its time: it sank in 1912 after hitting an iceberg."],
   ["Di un iceberg si vede solo la punta: quasi tutto il ghiaccio resta nascosto sotto l'acqua.",
    "You only see the tip of an iceberg: almost all of the ice stays hidden under the water."],
   ["Dopo il Titanic arrivò una regola nuova: sulle navi ci devono essere scialuppe di salvataggio per TUTTI i passeggeri.",
    "After the Titanic came a new rule: ships must carry lifeboats for ALL passengers."],
   ["Quando una nave è in pericolo chiede aiuto via radio con un segnale famoso: l'SOS.",
    "When a ship is in danger it calls for help by radio with a famous signal: the SOS."],
   ["Il relitto del Titanic fu ritrovato solo nel 1985, in fondo all'oceano, a quasi 4000 metri di profondità.",
    "The wreck of the Titanic was found only in 1985, at the bottom of the ocean, almost 4000 metres deep."]],
  qs:[
   {q:["Cosa urtò il Titanic?","What did the Titanic hit?"],
    ok:["Un iceberg","An iceberg"],
    no:[["Una balena gigante","A giant whale"],["Un'altra nave","Another ship"]]},
   {q:["Quanta parte dell'iceberg si nasconde sotto l'acqua?","How much of an iceberg hides under the water?"],
    ok:["Quasi tutta","Almost all of it"],
    no:[["Solo la punta","Only the tip"],["Nessuna parte","None of it"]]}]},
 { /* 3 Chimica 🧪 */
  facts:[
   ["Tutto quello che ti circonda è fatto di atomi: mattoncini così piccoli che non si vedono nemmeno con un microscopio normale.",
    "Everything around you is made of atoms: building blocks so tiny you can't see them even with a normal microscope."],
   ["L'acqua è fatta di due gas legati insieme: idrogeno e ossigeno.",
    "Water is made of two gases joined together: hydrogen and oxygen."],
   ["Se mescoli bicarbonato e aceto nascono tantissime bollicine: è una reazione chimica che produce un gas.",
    "If you mix baking soda and vinegar you get lots of bubbles: it is a chemical reaction that makes a gas."],
   ["Il sale si scioglie nell'acqua ma non sparisce: se l'acqua evapora, il sale ricompare sul fondo.",
    "Salt dissolves in water but does not disappear: if the water evaporates, the salt shows up again at the bottom."],
   ["Il diamante e la mina della matita sono fatti della stessa cosa: un elemento chiamato carbonio.",
    "A diamond and a pencil lead are made of the same thing: an element called carbon."]],
  qs:[
   {q:["Di quali due gas è fatta l'acqua?","Which two gases is water made of?"],
    ok:["Idrogeno e ossigeno","Hydrogen and oxygen"],
    no:[["Sale e zucchero","Salt and sugar"],["Fumo e vapore","Smoke and steam"]]},
   {q:["Cosa ricompare sul fondo quando l'acqua evapora?","What shows up at the bottom when the water evaporates?"],
    ok:["Il sale","The salt"],
    no:[["Le bollicine","The bubbles"],["Un diamante","A diamond"]]}]},
 { /* 4 Elettronica ⚡ */
  facts:[
   ["La corrente elettrica è come un fiume di particelle piccolissime chiamate elettroni che corrono dentro i fili.",
    "Electric current is like a river of tiny particles called electrons running inside the wires."],
   ["I fili sono di rame perché il rame lascia passare benissimo la corrente.",
    "Wires are made of copper because copper lets the current pass through very well."],
   ["La plastica intorno ai fili blocca la corrente: è lei che ci protegge dalle scosse.",
    "The plastic around the wires blocks the current: it is what protects us from shocks."],
   ["Una batteria conserva l'energia e ha due poli: il più (+) e il meno (−).",
    "A battery stores energy and has two poles: plus (+) and minus (−)."],
   ["L'interruttore apre e chiude la strada della corrente: quando il circuito è chiuso, la lampadina si accende.",
    "A switch opens and closes the current's path: when the circuit is closed, the bulb lights up."]],
  qs:[
   {q:["A cosa serve la plastica intorno ai fili?","What is the plastic around the wires for?"],
    ok:["Blocca la corrente e ci protegge","It blocks the current and protects us"],
    no:[["Fa correre più veloce la corrente","It makes the current run faster"],["Serve solo a fare colore","It is only for the colour"]]},
   {q:["Quando si accende la lampadina?","When does the bulb light up?"],
    ok:["Quando il circuito è chiuso","When the circuit is closed"],
    no:[["Quando il circuito è aperto","When the circuit is open"],["Quando la batteria dorme","When the battery is asleep"]]}]},
 { /* 5 Api e Apicoltura 🐝 */
  facts:[
   ["In un alveare possono vivere anche 50.000 api, ma la regina è una sola: è lei che depone tutte le uova.",
    "Up to 50,000 bees can live in one hive, but there is only one queen: she lays all the eggs."],
   ["Per riempire un vasetto di miele le api visitano più di un milione di fiori.",
    "To fill one jar of honey, bees visit more than a million flowers."],
   ["Le api ballano! Con una danza speciale spiegano alle sorelle dove trovare i fiori migliori.",
    "Bees dance! With a special dance they tell their sisters where to find the best flowers."],
   ["Le api vedono colori che noi non vediamo, come l'ultravioletto, ma non riescono a vedere il rosso.",
    "Bees see colours we cannot see, like ultraviolet, but they cannot see red."],
   ["D'inverno le api si stringono tutte insieme in una palla e vibrano per scaldarsi.",
    "In winter bees squeeze together into a ball and vibrate to keep warm."]],
  qs:[
   {q:["Come spiegano le api dove sono i fiori?","How do bees explain where the flowers are?"],
    ok:["Con una danza","With a dance"],
    no:[["Con un disegno","With a drawing"],["Ronzando fortissimo","By buzzing very loudly"]]},
   {q:["Quante regine ci sono in un alveare?","How many queens are there in a hive?"],
    ok:["Una sola","Only one"],
    no:[["Cinquantamila","Fifty thousand"],["Una per ogni fiore","One for every flower"]]}]},
 { /* 6 Fisica 🌍 */
  facts:[
   ["La gravità tira tutto verso il centro della Terra: ecco perché le cose cadono sempre in giù.",
    "Gravity pulls everything toward the centre of the Earth: that is why things always fall down."],
   ["Sulla Luna la gravità è circa sei volte più debole: potresti saltare molto più in alto che sulla Terra.",
    "On the Moon gravity is about six times weaker: you could jump much higher than on Earth."],
   ["La luce è la cosa più veloce che esista: dal Sole alla Terra impiega circa 8 minuti.",
    "Light is the fastest thing there is: it takes about 8 minutes to travel from the Sun to the Earth."],
   ["Ogni calamita ha due poli, nord e sud: i poli uguali si respingono, quelli diversi si attirano.",
    "Every magnet has two poles, north and south: same poles push away, different poles pull together."],
   ["Il suono ha bisogno dell'aria per viaggiare: nello spazio vuoto nessuno può sentire un rumore.",
    "Sound needs air to travel: in empty space nobody can hear a noise."]],
  qs:[
   {q:["Quanto impiega la luce del Sole ad arrivare sulla Terra?","How long does sunlight take to reach the Earth?"],
    ok:["Circa 8 minuti","About 8 minutes"],
    no:[["Un anno intero","A whole year"],["Mezza giornata","Half a day"]]},
   {q:["Cosa fanno due poli uguali di una calamita?","What do two same poles of a magnet do?"],
    ok:["Si respingono","They push away from each other"],
    no:[["Si attirano","They pull together"],["Si sciolgono","They melt"]]}]},
 { /* 7 Missioni Spaziali 👨‍🚀 */
  facts:[
   ["Nel 1969 l'astronauta Neil Armstrong fu il primo uomo a camminare sulla Luna.",
    "In 1969 astronaut Neil Armstrong was the first man to walk on the Moon."],
   ["La Stazione Spaziale Internazionale vola a 28.000 chilometri all'ora: fa il giro della Terra in circa 90 minuti.",
    "The International Space Station flies at 28,000 kilometres per hour: it circles the Earth in about 90 minutes."],
   ["Per questo gli astronauti sulla Stazione vedono 16 albe e 16 tramonti ogni giorno!",
    "That is why astronauts on the Station see 16 sunrises and 16 sunsets every day!"],
   ["Senza peso i capelli galleggiano e l'acqua forma palline che volano per la cabina.",
    "Without weight, hair floats and water forms little balls that fly around the cabin."],
   ["La tuta spaziale è come una piccola astronave: dà all'astronauta aria, acqua e la giusta temperatura.",
    "A spacesuit is like a tiny spaceship: it gives the astronaut air, water and the right temperature."]],
  qs:[
   {q:["In quanto tempo la Stazione Spaziale fa il giro della Terra?","How long does the Space Station take to circle the Earth?"],
    ok:["Circa 90 minuti","About 90 minutes"],
    no:[["Un mese","A month"],["Dieci anni","Ten years"]]},
   {q:["Chi camminò per primo sulla Luna?","Who walked on the Moon first?"],
    ok:["Neil Armstrong","Neil Armstrong"],
    no:[["Yuri Gagarin","Yuri Gagarin"],["Un robot","A robot"]]}]},
 { /* 8 Lingua Inglese 🔤 */
  facts:[
   ["L'inglese si parla in tantissimi paesi: Regno Unito, Stati Uniti, Australia e molti altri.",
    "English is spoken in many countries: the United Kingdom, the United States, Australia and many more."],
   ["L'alfabeto inglese ha 26 lettere: ha anche J, K, W, X e Y, che in italiano si usano poco.",
    "The English alphabet has 26 letters, including J, K, W, X and Y, which Italian rarely uses."],
   ["Attento ai trabocchetti: \"library\" non vuol dire libreria, vuol dire biblioteca!",
    "Watch out for tricky words: \"library\" in Italian is \"biblioteca\", not \"libreria\" (bookshop)!"],
   ["\"Weekend\" è fatta di due parole: week (settimana) ed end (fine). Vuol dire fine settimana!",
    "\"Weekend\" is made of two words: week and end. In Italian it is \"fine settimana\"!"],
   ["Gli animali \"parlano\" diverso in ogni lingua: in inglese il gatto fa \"meow\" e il cane fa \"woof\"!",
    "Animals \"speak\" differently in every language: in English the cat says \"meow\" and the dog says \"woof\"!"]],
  qs:[
   {q:["Cosa vuol dire la parola inglese \"library\"?","What does \"library\" mean in Italian?"],
    ok:["Biblioteca","Biblioteca"],
    no:[["Libreria","Libreria (bookshop)"],["Letto","Letto (bed)"]]},
   {q:["Quante lettere ha l'alfabeto inglese?","How many letters does the English alphabet have?"],
    ok:["26","26"],
    no:[["21","21"],["100","100"]]}]},
 { /* 9 Geronimo Stilton 🧀 */
  facts:[
   ["Geronimo Stilton è un topo giornalista: dirige un giornale famoso, L'Eco del Roditore, nella città di Topazia.",
    "Geronimo Stilton is a mouse journalist: he runs a famous newspaper, The Rodent's Gazette, in New Mouse City."],
   ["Il suo cognome viene da un formaggio vero: lo Stilton, un formaggio inglese!",
    "His surname comes from a real cheese: Stilton, an English cheese!"],
   ["La sua famiglia lo trascina nei guai: la sorella Tea, il cugino Trappola e il nipotino Benjamin.",
    "His family drags him into trouble: his sister Thea, his cousin Trap and his little nephew Benjamin."],
   ["A Geronimo le avventure non piacciono per niente... eppure finisce sempre in mezzo ai pasticci!",
    "Geronimo does not like adventures at all... and yet he always ends up in a mess!"],
   ["I suoi libri sono letti in tutto il mondo: sono tradotti in circa 50 lingue.",
    "His books are read all over the world: they are translated into about 50 languages."]],
  qs:[
   {q:["Che lavoro fa Geronimo Stilton?","What is Geronimo Stilton's job?"],
    ok:["Il giornalista","He is a journalist"],
    no:[["L'astronauta","He is an astronaut"],["Il cuoco","He is a cook"]]},
   {q:["Da dove viene il cognome Stilton?","Where does the surname Stilton come from?"],
    ok:["Da un formaggio inglese","From an English cheese"],
    no:[["Da una città spaziale","From a space city"],["Da un gatto famoso","From a famous cat"]]}]},
 { /* 10 Computer e Componenti 💻 */
  facts:[
   ["Il cervello del computer si chiama CPU: fa miliardi di calcoli in un solo secondo.",
    "The computer's brain is called the CPU: it does billions of calculations in a single second."],
   ["La memoria RAM ricorda le cose solo mentre il computer è acceso; il disco le conserva anche da spento.",
    "RAM memory remembers things only while the computer is on; the disk keeps them even when it is off."],
   ["Il computer capisce solo due cifre: 0 e 1. Foto, giochi e musica sono tutti fatti di 0 e 1!",
    "A computer understands only two digits: 0 and 1. Photos, games and music are all made of 0s and 1s!"],
   ["Il primo mouse della storia era di legno: fu inventato più di 60 anni fa.",
    "The first mouse in history was made of wood: it was invented more than 60 years ago."],
   ["I primi computer erano giganteschi: uno solo riempiva una stanza intera!",
    "The first computers were gigantic: just one filled a whole room!"]],
  qs:[
   {q:["Quali cifre capisce il computer?","Which digits does a computer understand?"],
    ok:["Solo 0 e 1","Only 0 and 1"],
    no:[["Tutte le cifre da 0 a 9","All digits from 0 to 9"],["Solo il numero 7","Only the number 7"]]},
   {q:["Di che materiale era il primo mouse?","What was the first mouse made of?"],
    ok:["Di legno","Wood"],
    no:[["Di plastica","Plastic"],["Di formaggio","Cheese"]]}]},
 { /* 11 Programmazione 👾 */
  facts:[
   ["Un programma è una lista di istruzioni che il computer segue alla lettera, una dopo l'altra.",
    "A program is a list of instructions that the computer follows exactly, one after another."],
   ["Il computer fa ESATTAMENTE quello che scrivi: se sbagli un'istruzione, sbaglia anche lui!",
    "The computer does EXACTLY what you write: if you get an instruction wrong, it gets it wrong too!"],
   ["Un errore nel programma si chiama bug, cioè insetto: una volta una falena entrò davvero dentro un computer!",
    "A mistake in a program is called a bug, which means insect: once a real moth got inside a computer!"],
   ["Con i loop il computer ripete le stesse istruzioni tante volte, senza doverle riscrivere.",
    "With loops the computer repeats the same instructions many times, without writing them again."],
   ["La prima programmatrice della storia fu una donna, Ada Lovelace, quasi 200 anni fa: prima ancora dei computer!",
    "The first programmer in history was a woman, Ada Lovelace, almost 200 years ago: even before computers!"]],
  qs:[
   {q:["Perché un errore del programma si chiama bug (insetto)?","Why is a program mistake called a bug (insect)?"],
    ok:["Una falena entrò davvero in un computer","A real moth got inside a computer"],
    no:[["I computer mangiano insetti","Computers eat insects"],["Gli insetti scrivono programmi","Insects write programs"]]},
   {q:["Chi fu la prima programmatrice della storia?","Who was the first programmer in history?"],
    ok:["Ada Lovelace","Ada Lovelace"],
    no:[["Neil Armstrong","Neil Armstrong"],["Un robot gentile","A kind robot"]]}]},
 { /* 12 Internet e Sicurezza 🌐 */
  facts:[
   ["Internet è una rete gigantesca che collega miliardi di computer in tutto il mondo.",
    "The internet is a gigantic network connecting billions of computers all over the world."],
   ["Per attraversare gli oceani, i messaggi di internet viaggiano dentro lunghissimi cavi posati sul fondo del mare.",
    "To cross the oceans, internet messages travel inside very long cables laid on the sea floor."],
   ["Il Wi-Fi porta internet senza fili: usa onde radio invisibili che attraversano l'aria.",
    "Wi-Fi brings the internet without wires: it uses invisible radio waves that travel through the air."],
   ["Una password segreta è come la chiave di casa: non si regala a nessuno, nemmeno agli amici.",
    "A secret password is like your house key: you don't give it to anyone, not even friends."],
   ["Su internet non tutti dicono la verità: se qualcosa ti sembra strano, chiedi sempre a un adulto.",
    "On the internet not everyone tells the truth: if something seems strange, always ask a grown-up."]],
  qs:[
   {q:["Dove passano i messaggi di internet per attraversare l'oceano?","Where do internet messages travel to cross the ocean?"],
    ok:["Dentro cavi sul fondo del mare","Inside cables on the sea floor"],
    no:[["Sulle ali dei gabbiani","On seagulls' wings"],["Dentro bottiglie galleggianti","Inside floating bottles"]]},
   {q:["A cosa somiglia una password segreta?","What is a secret password like?"],
    ok:["Alla chiave di casa","Your house key"],
    no:[["A una caramella da regalare","A candy to give away"],["A un cartello per la strada","A sign on the street"]]}]}
];

/* ---------- testi UI [it,en] ---------- */
const LT_UI={
  title:["📖 Letturina","📖 Little Reading"],
  sub:["Leggi le curiosità: se rispondi bene a 2 domande, apri la scorciatoia e sblocchi il livello!",
       "Read the fun facts: answer 2 questions correctly to open the shortcut and unlock the level!"],
  goRead:["Ho letto! ➡️","I read it! ➡️"],
  q1:["DOMANDA 1 di 2","QUESTION 1 of 2"],
  q2:["DOMANDA 2 di 2","QUESTION 2 of 2"],
  qHint:["(la risposta è nelle curiosità qui sopra!)","(the answer is in the facts above!)"],
  wrong:["Ops! Rileggi le curiosità e riprova 💪","Oops! Read the facts again and try again 💪"],
  right1:["Giusto! Ora l'ultima domanda…","Correct! Now the last question…"],
  win:["SCORCIATOIA APERTA! 🎉 Livello sbloccato!","SHORTCUT OPEN! 🎉 Level unlocked!"],
  play:["Gioca subito! 🚀","Play now! 🚀"],
  back:["Torna alla mappa","Back to the map"],
  bonusFull:["Letto tutto da solo e nessun errore! +","All read alone with no mistakes! +"],
  bonusHalf:["Sbloccato! +","Unlocked! +"]
};

/* ---------- overlay (creato via JS, riusa gli stili delle domande) ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#lett { z-index:13; }',
  '#lett .card { max-width:640px; text-align:left; }',
  '#lettHead { text-align:center; }',
  '#lettTitle { font-size:clamp(22px,5vw,32px); color:#2b3a8f; font-weight:bold; }',
  '#lettSub { font-size:16px; color:#666; margin:6px 0 10px; }',
  '#lettFacts { background:#fdf6e3; border:3px solid #ffd93d; border-radius:16px; padding:12px 16px; }',
  '#lettFacts .fact { font-size:clamp(17px,3.4vw,21px); line-height:1.5; margin:8px 0; color:#25324a; }',
  '#lettFacts .fact .fEm { margin-right:6px; }',
  '#lettFacts.small .fact { font-size:15px; line-height:1.35; margin:5px 0; }',
  '#lettQTitle { font-weight:bold; color:#9a4fd1; margin-top:12px; text-align:center; }',
  '#lettQHint { font-size:14px; color:#9a86c9; text-align:center; }',
  '#lettQText { font-size:clamp(18px,3.8vw,23px); text-align:center; margin:8px 0; color:#25324a; font-weight:bold; }',
  '#lettAnswers { display:flex; flex-direction:column; gap:8px; margin-top:8px; }',
  '#lettMsg { text-align:center; font-weight:bold; min-height:24px; margin-top:8px; }',
  '#lettBtns { text-align:center; margin-top:10px; }',
  '#lettBtns button { margin:4px; }'
  ].join('\n');
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',
  '<div class="overlay" id="lett"><div class="card">'+
    '<div id="lettHead">'+
      '<div id="lettEmoji" style="font-size:44px"></div>'+
      '<div id="lettTitle"></div>'+
      '<div id="lettSub"></div>'+
    '</div>'+
    '<div id="lettFacts"></div>'+
    '<div id="lettBar" style="text-align:center;margin-top:8px"><button id="lettSpeak" class="jollyBtn">🔊</button></div>'+
    '<div id="lettQBox" style="display:none">'+
      '<div id="lettQTitle"></div>'+
      '<div id="lettQHint"></div>'+
      '<div id="lettQText"></div>'+
      '<div id="lettAnswers"></div>'+
    '</div>'+
    '<div id="lettMsg"></div>'+
    '<div id="lettBtns">'+
      '<button id="lettGo" class="bigBtn"></button>'+
      '<button id="lettPlay" class="bigBtn" style="display:none"></button>'+
      '<button id="lettBack" class="togBtn"></button>'+
    '</div>'+
  '</div></div>');
})();

/* ---------- logica ---------- */
let ltLevel=-1, ltStep=0, ltErrors=0, ltVoice=false, ltLocked=false;

function ltFactEmojis(k){ return (THEMES[k]&&THEMES[k].decos)||['✨']; }

function openLetturina(k){
  const L=LETTURINE[k];
  if(!L){ return; }               /* tema senza letturina: niente scorciatoia */
  ltLevel=k; ltStep=0; ltErrors=0; ltVoice=false; ltLocked=false;
  const i=LI(), t=THEMES[k];
  $('lettEmoji').textContent=t.emoji;
  $('lettTitle').textContent=LT_UI.title[i]+' · '+t.name[i];
  $('lettSub').textContent=LT_UI.sub[i];
  const ems=ltFactEmojis(k);
  $('lettFacts').className='';
  $('lettFacts').innerHTML=L.facts.map((f,j)=>
    '<div class="fact"><span class="fEm">'+ems[j%ems.length]+'</span><span class="fTx">'+f[i]+'</span></div>').join('');
  $('lettSpeak').textContent=UI.jollyRead[i];
  $('lettSpeak').style.display=VOICEON?'':'none';
  $('lettQBox').style.display='none';
  $('lettMsg').textContent='';
  $('lettGo').textContent=LT_UI.goRead[i]; $('lettGo').style.display='';
  $('lettPlay').style.display='none';
  $('lettBack').textContent=LT_UI.back[i];
  $('lett').style.display='flex';
}

function ltShowQuestion(){
  const i=LI(), L=LETTURINE[ltLevel], q=L.qs[ltStep];
  ltLocked=false;
  $('lettFacts').className='small';           /* il testo resta visibile, più piccolo */
  $('lettGo').style.display='none';
  $('lettQTitle').textContent=(ltStep===0?LT_UI.q1[i]:LT_UI.q2[i]);
  $('lettQHint').textContent=LT_UI.qHint[i];
  $('lettQText').textContent=q.q[i];
  const A=$('lettAnswers'); A.innerHTML='';
  shuffle([[q.ok[i],true],[q.no[0][i],false],[q.no[1][i],false]]).forEach(o=>{
    const b=document.createElement('button');
    b.className='ansBtn'; b.textContent=o[0];
    b.onclick=()=>ltAnswer(b,o[1]);
    A.appendChild(b);
  });
  $('lettQBox').style.display='block';
  $('lettMsg').textContent='';
}

function ltAnswer(btn,right){
  if(ltLocked) return;
  const i=LI();
  stopSpeak();
  if(right){
    ltLocked=true;
    btn.classList.add('right'); sCorrect();
    if(ltStep===0){
      $('lettMsg').textContent=LT_UI.right1[i]; $('lettMsg').style.color='#3cba54';
      ltStep=1;
      setTimeout(ltShowQuestion,900);
    } else {
      ltUnlock();
    }
  } else {
    btn.classList.add('wrong'); btn.disabled=true; sWrong();
    ltErrors++;
    $('lettMsg').textContent=LT_UI.wrong[i]; $('lettMsg').style.color='#e05555';
  }
}

function ltUnlock(){
  const i=LI(), k=ltLevel;
  const full=(ltErrors===0 && !ltVoice);
  const bonus=full?LT_BONUS:Math.floor(LT_BONUS/2);   /* dimezzato con 🔊 o errori */
  unlockedSet.add(k);
  score+=bonus; save();
  sDoor(); if(typeof confetti==='function') confetti();
  $('lettQBox').style.display='none';
  $('lettSpeak').style.display='none';
  $('lettMsg').innerHTML='<span style="color:#3cba54">'+LT_UI.win[i]+'</span><br>'+
    (full?LT_UI.bonusFull[i]:LT_UI.bonusHalf[i])+bonus+' ⭐';
  $('lettPlay').textContent=LT_UI.play[i]; $('lettPlay').style.display='';
  speak(NM(UI.praise[i][Math.floor(Math.random()*UI.praise[i].length)]));
  applyUI(); buildMap();                               /* mappa aggiornata dietro */
}

$('lettSpeak').onclick=async()=>{
  if(ltLevel<0) return;
  const i=LI();
  if(score<LT_COST_READ){
    $('lettMsg').textContent=UI.jollyNoPts[i]; $('lettMsg').style.color='#e8a013';
    setTimeout(()=>{ if($('lettMsg').textContent===UI.jollyNoPts[i]) $('lettMsg').textContent=''; },1800);
    return;
  }
  score=Math.max(0,score-LT_COST_READ); save(); applyUI();
  ltVoice=true;
  $('lettSpeak').textContent=UI.reading[i];
  const parts=[...document.querySelectorAll('#lettFacts .fTx')].map(el=>({t:el.textContent, el:el, block:true}));
  if($('lettQBox').style.display!=='none'){
    parts.push((i===0)?'La domanda è:':'The question is:');
    parts.push({t:$('lettQText').textContent, el:$('lettQText')});
    const btns=[...document.querySelectorAll('#lettAnswers .ansBtn:not(:disabled)')];
    parts.push((i===0)?'Le risposte sono:':'The options are:');
    parts.push(...btns.map(b=>({t:b.textContent, el:b, block:true})));
  }
  await speak(parts);
  $('lettSpeak').textContent=UI.jollyRead[i];
};
$('lettGo').onclick=()=>{ stopSpeak(); ltShowQuestion(); };
$('lettPlay').onclick=()=>{ stopSpeak(); $('lett').style.display='none'; startLevel(ltLevel); };
$('lettBack').onclick=()=>{ stopSpeak(); $('lett').style.display='none'; ltLevel=-1; };
