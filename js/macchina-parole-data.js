/* ============================================================
   LA MACCHINA DELLE PAROLE — dati didattici della fetta verticale
   Nessun dato esce dal browser. UMD: browser + test Node.
   ============================================================ */
(function(root,factory){
  const value=factory();
  if(typeof module==='object'&&module.exports)module.exports=value;
  else root.MP_DATA=value;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const chapters=[
    {n:1,icon:'🗄️',title:'L’Archivio dei dati',tech:'Corpus e qualità dei dati',open:true},
    {n:2,icon:'✂️',title:'Il Tagliatore di token',tech:'Tokenizzazione'},
    {n:3,icon:'🗺️',title:'La Mappa delle vicinanze',tech:'Embedding'},
    {n:4,icon:'🧵',title:'Il Filo dell’ordine',tech:'Posizione e contesto'},
    {n:5,icon:'🔎',title:'Le Lenti dell’attenzione',tech:'Query, Key e Value'},
    {n:6,icon:'🏗️',title:'La Torre Transformer',tech:'Blocchi e livelli'},
    {n:7,icon:'🎯',title:'La Scuola degli errori',tech:'Loss e gradiente'},
    {n:8,icon:'🧑‍🏫',title:'La Scuola delle istruzioni',tech:'Fine-tuning e feedback'},
    {n:9,icon:'🎡',title:'La Ruota delle probabilità',tech:'Generazione'},
    {n:10,icon:'🪞',title:'La Stanza degli specchi',tech:'Limiti e verifica'}
  ];

  /* Ogni capitolo possiede già una guida introduttiva completa. I capitoli non
     ancora giocabili la mostrano come anteprima dalla mappa. */
  const chapterGuides=[
    {
      problem:'Una tempesta ha mescolato i diari della Stazione Aurora. Ci sono rapporti utili, copie, frasi rovinate e messaggi personali. Prima di costruire una macchina delle parole dobbiamo scegliere bene che cosa farle leggere.',
      purpose:'In questo capitolo scoprirai che la macchina impara gli schemi presenti nei testi. Se i dati sono ripetuti, poco vari o inadatti, anche le sue previsioni cambiano.',
      activity:'Pulirai l’archivio, proteggerai le informazioni personali, aggiungerai documenti diversi e userai un piccolo modello di prova per completare tre rapporti danneggiati.',
      terms:[
        {term:'Corpus',simple:'È la raccolta di testi scelta per addestrare o provare un modello. È come lo scaffale di libri che decidiamo di far leggere alla macchina.'},
        {term:'Token',simple:'È un pezzetto di testo elaborato dalla macchina. Può essere una parola, una parte di parola, un numero oppure un segno.'},
        {term:'Probabilità',simple:'Indica quanto una continuazione è favorita dal modello. Una probabilità alta significa “compare spesso in questo contesto”, non “è sicuramente vera”.'},
        {term:'Modello linguistico',simple:'È una macchina matematica che trova schemi nei testi e assegna probabilità alle continuazioni. Il modello di questo capitolo è piccolo e conta gli esempi: non è ancora un LLM.'}
      ]
    },
    {
      problem:'La macchina non può lavorare direttamente con una pagina intera. Prima deve dividerla in pezzi abbastanza piccoli da poterli riconoscere e riutilizzare.',
      purpose:'Scoprirai perché i token non coincidono sempre con parole intere e perché scegliere pezzi troppo grandi o troppo piccoli crea problemi diversi.',
      activity:'Proverai vocabolari di parole e sottoparole, poi costruirai un tagliatore capace di scomporre anche parole mai incontrate prima.',
      terms:[
        {term:'Token',simple:'Un pezzetto di testo trasformato in un’unità per la macchina.'},
        {term:'Tokenizzazione',simple:'Il procedimento che divide il testo in token.'},
        {term:'Vocabolario',simple:'L’elenco di tutti i token che il modello sa riconoscere.'},
        {term:'Sottoparola',simple:'Un frammento riutilizzabile in parole diverse, come “gatt” dentro gatto, gatti e gattino.'}
      ]
    },
    {
      problem:'Per la macchina, un token non possiede subito un significato. Deve essere trasformato in numeri che possano essere confrontati con quelli degli altri token.',
      purpose:'Scoprirai come token incontrati in contesti simili possono finire vicini in una mappa matematica, senza assegnare a ogni numero un’etichetta inventata.',
      activity:'Osserverai i contesti, sposterai libri-token e costruirai piccoli vettori che conservano le vicinanze apprese.',
      terms:[
        {term:'Embedding',simple:'La rappresentazione numerica appresa per un token.'},
        {term:'Vettore',simple:'Una lista ordinata di numeri usata per indicare una posizione nella mappa.'},
        {term:'Distanza',simple:'Una misura che aiuta a confrontare quanto due rappresentazioni sono vicine.'}
      ]
    },
    {
      problem:'Le frasi “il cane insegue il gatto” e “il gatto insegue il cane” contengono parole simili, ma l’ordine cambia ciò che dicono.',
      purpose:'Scoprirai come la macchina conserva informazioni sulla posizione e perché può osservare soltanto una quantità limitata di testo alla volta.',
      activity:'Aggiungerai segnaposto ai token e sposterai la finestra di contesto per vedere quali informazioni restano visibili.',
      terms:[
        {term:'Posizione',simple:'L’informazione che aiuta il modello a distinguere dove si trova ogni token nella sequenza.'},
        {term:'Contesto',simple:'I token che il modello può osservare mentre prepara la previsione.'},
        {term:'Finestra di contesto',simple:'Il limite della porzione di testo visibile al modello in un dato momento.'}
      ]
    },
    {
      problem:'Quando deve prevedere un token, la macchina non usa tutte le parole precedenti allo stesso modo. Alcune relazioni sono più utili di altre.',
      purpose:'Scoprirai come l’attenzione confronta richieste e indizi, poi mescola le informazioni usando pesi differenti.',
      activity:'Collegherai parole correlate e costruirai il percorso Query, Key e Value, osservando punteggi e percentuali.',
      terms:[
        {term:'Self-attention',simple:'Il meccanismo che permette ai token di pesare informazioni provenienti dagli altri token del contesto.'},
        {term:'Query',simple:'La richiesta costruita dal token che sta cercando informazioni.'},
        {term:'Key',simple:'L’indizio usato per capire quanto ogni posizione risponde alla richiesta.'},
        {term:'Value',simple:'L’informazione raccolta da una posizione dopo aver deciso quanto deve pesare.'}
      ]
    },
    {
      problem:'Una sola lente di attenzione non basta a costruire un Transformer. Le informazioni devono attraversare altri banchi e più livelli senza perdere ciò che era già utile.',
      purpose:'Scoprirai quali parti principali compongono un blocco Transformer e che cosa aggiunge ciascun passaggio.',
      activity:'Monterai attenzione, rete feed-forward e passerella residua, poi farai attraversare ai token una piccola torre di blocchi.',
      terms:[
        {term:'Transformer',simple:'Un’architettura di rete neurale costruita con blocchi che includono attenzione e altri calcoli.'},
        {term:'Rete feed-forward',simple:'Un banco di calcolo applicato separatamente alla rappresentazione di ogni token.'},
        {term:'Collegamento residuo',simple:'Una strada che conserva il segnale precedente e lo aggiunge al risultato nuovo.'},
        {term:'Livello',simple:'Un passaggio della torre. Più livelli trasformano le rappresentazioni più volte.'}
      ]
    },
    {
      problem:'All’inizio i pesi della macchina non producono buone previsioni. Serve un modo per misurare l’errore e capire quali manopole cambiare.',
      purpose:'Scoprirai che addestrare significa ripetere previsioni, misurare la loss e aggiornare poco alla volta molti parametri.',
      activity:'Farai risalire l’errore nella rete e proverai learning rate diversi, osservando quando il modello migliora, rallenta oppure oscilla.',
      terms:[
        {term:'Loss',simple:'Un numero che misura quanto la previsione è lontana dal risultato atteso.'},
        {term:'Peso o parametro',simple:'Una manopola numerica modificabile durante l’addestramento.'},
        {term:'Gradiente',simple:'L’indicazione di come cambiare un parametro per ridurre l’errore.'},
        {term:'Learning rate',simple:'La grandezza del passo usato per aggiornare i parametri.'}
      ]
    },
    {
      problem:'Un modello che sa soltanto continuare testi non sa automaticamente rispondere bene a una richiesta o seguire istruzioni umane.',
      purpose:'Scoprirai la differenza tra imparare schemi generali, osservare esempi di istruzioni e ricevere preferenze da valutatori umani.',
      activity:'Trasformerai un completatore in un assistente di prova e confronterai valutazioni diverse, senza fingere che esista una manopola della perfezione.',
      terms:[
        {term:'Pre-addestramento',simple:'La fase in cui il modello impara molti schemi generali prevedendo token da grandi raccolte di testi.'},
        {term:'Fine-tuning',simple:'Un addestramento successivo e più mirato, svolto con esempi scelti per un certo comportamento.'},
        {term:'Feedback umano',simple:'Valutazioni o preferenze fornite da persone per orientare alcune risposte del modello.'}
      ]
    },
    {
      problem:'Il modello produce una distribuzione di probabilità, non una sola parola obbligatoria. Bisogna decidere come scegliere da quella distribuzione.',
      purpose:'Scoprirai perché la stessa richiesta può avere continuazioni differenti e che cosa cambia davvero la temperatura.',
      activity:'Genererai un token alla volta, confronterai scelte greedy e campionate e ripeterai esperimenti con lo stesso seme casuale.',
      terms:[
        {term:'Inferenza',simple:'Il momento in cui un modello già addestrato viene usato per produrre una risposta.'},
        {term:'Campionamento',simple:'La scelta di un token usando le probabilità invece di prendere sempre il primo.'},
        {term:'Temperatura',simple:'Un controllo che rende la distribuzione più concentrata o più distribuita. Non aggiunge conoscenza.'},
        {term:'Seme casuale',simple:'Un numero che permette di ripetere la stessa sequenza di scelte casuali.'}
      ]
    },
    {
      problem:'Una frase può essere scorrevole e convincente anche quando contiene un fatto inventato, incompleto o distorto.',
      purpose:'Scoprirai quali limiti derivano da dati, addestramento e generazione e quando è necessario cercare una fonte affidabile.',
      activity:'Confronterai risposte plausibili, riconoscerai lacune e bias e deciderai quali affermazioni devono essere verificate.',
      terms:[
        {term:'Allucinazione',simple:'Un contenuto prodotto dal modello che sembra plausibile ma non è sostenuto da fatti affidabili.'},
        {term:'Bias',simple:'Uno schema distorto o sbilanciato che può provenire dai dati, dalle scelte di progettazione o dall’uso.'},
        {term:'Verifica',simple:'Il controllo di un’affermazione usando una fonte adatta e affidabile.'},
        {term:'Fonte',simple:'Il luogo o documento da cui proviene un’informazione e che permette di controllarla.'}
      ]
    }
  ];

  const phases=[
    {
      id:'clean',icon:'🧹',short:'Pulisci',title:'Ripulisci l’archivio',
      goal:'Tieni i rapporti utili. Escludi copie, testi corrotti e materiale fuori tema.',
      explain:'Una copia ripetuta pesa più volte nei conteggi. Un testo raro ma valido può invece contenere informazioni preziose.',
      prediction:{q:'Se togliamo le copie, che cosa accade agli schemi ripetuti troppe volte?',answers:['Pesano meno nel modello','Diventano automaticamente veri','Il modello dimentica tutte le parole'],correct:0},
      documents:[
        {id:'c1',badge:'RAPPORTO',source:'Stazione Aurora · autorizzato',title:'Rilievo del cratere',text:'La squadra controlla il cratere. La geologa osserva la roccia. La squadra raccoglie un campione.',actions:['use','exclude'],correct:'use',note:'È pertinente, leggibile e autorizzato.'},
        {id:'c2',badge:'COPIA',source:'Duplicato automatico',title:'Rilievo del cratere — copia',text:'La squadra controlla il cratere. La geologa osserva la roccia. La squadra raccoglie un campione.',actions:['use','exclude'],correct:'exclude',note:'È una copia esatta: tenerla farebbe pesare due volte gli stessi schemi.'},
        {id:'c3',badge:'DANNEGGIATO',source:'Ricezione incompleta',title:'Frammento disturbato',text:'La squ@@dra contr##lla il cra... La geo%%loga oss—',actions:['use','exclude'],correct:'exclude',note:'Il testo è troppo corrotto per questo corpus.'},
        {id:'c4',badge:'RAPPORTO RARO',source:'Laboratorio biologico · autorizzato',title:'Lichene azzurro',text:'La squadra esplora il lichene. La biologa osserva le spore. La squadra fotografa il campione.',actions:['use','exclude'],correct:'use',note:'Compare una sola volta, ma è valido e aggiunge un contesto utile.'},
        {id:'c5',badge:'FUORI TEMA',source:'Mensa di bordo',title:'Torta orbitale',text:'La torta cuoce nel forno. La cuoca aggiunge il cacao. La torta profuma di vaniglia.',actions:['use','exclude'],correct:'exclude',note:'È leggibile, ma non serve al corpus dei rapporti scientifici.'}
      ]
    },
    {
      id:'privacy',icon:'🛡️',short:'Proteggi',title:'Controlla provenienza e privacy',
      goal:'Usa soltanto ciò che serve e può essere usato. Quando basta, anonimizza invece di buttare tutto.',
      explain:'Avere un file non significa avere una buona ragione o il permesso per usarlo. I dati personali non necessari vanno esclusi o rimossi.',
      prediction:{q:'Se anonimizzi un rapporto, che cosa dovrebbe succedere?',answers:['Resta la parte utile, spariscono i dettagli personali','Il rapporto viene duplicato','Ogni parola diventa segreta'],correct:0},
      documents:[
        {id:'p1',badge:'AUTORIZZATO',source:'Reparto tecnico · licenza interna',title:'Antenna principale',text:'La squadra controlla l’antenna. Il tecnico ripara il cavo. La squadra riattiva la radio.',actions:['use','exclude'],correct:'use',note:'Fonte chiara, pertinente e autorizzata.'},
        {id:'p2',badge:'PERSONALE',source:'Messaggio privato',title:'Lettera di Lia',text:'Lia abita in Via delle Comete 14. Il suo codice personale è AUR-8842.',actions:['use','exclude'],correct:'exclude',note:'Indirizzo e codice personale non servono per completare rapporti scientifici.'},
        {id:'p3',badge:'ANONIMIZZABILE',source:'Medicina di bordo · uso consentito senza nomi',title:'Turno di riposo',text:'La dottoressa Neri controlla il sonno. La squadra controlla il riposo.',safeText:'La dottoressa controlla il sonno. La squadra controlla il riposo.',actions:['use','anonymize','exclude'],correct:'anonymize',note:'La parte utile può restare dopo aver tolto il nome.'},
        {id:'p4',badge:'FONTE INCERTA',source:'File copiato · autore sconosciuto',title:'Manuale senza provenienza',text:'La squadra controlla il reattore con una procedura non verificata.',actions:['use','exclude'],correct:'exclude',note:'Non sappiamo chi lo ha scritto né se può essere usato.'},
        {id:'p5',badge:'AUTORIZZATO',source:'Laboratorio sensori · autorizzato',title:'Misure atmosferiche',text:'La squadra controlla il sensore. L’ingegnera calibra lo strumento. La squadra registra la pressione.',actions:['use','exclude'],correct:'use',note:'È pertinente e la provenienza è documentata.'}
      ]
    },
    {
      id:'variety',icon:'🌈',short:'Varia',title:'Rendi il corpus vario',
      goal:'Aggiungi fonti pertinenti che coprono ruoli e situazioni differenti. Non aggiungere testi casuali.',
      explain:'Più varietà utile offre più schemi da imparare. Varietà non significa riempire il corpus con qualunque testo.',
      prediction:{q:'Aggiungendo rapporti pertinenti di reparti diversi, che cosa ci aspettiamo?',answers:['Più continuazioni possibili e pertinenti','Una sola risposta sempre certa','La scomparsa di tutti gli errori'],correct:0},
      documents:[
        {id:'v1',badge:'BOTANICA',source:'Serra di Aurora · autorizzato',title:'Serra orbitale',text:'La squadra controlla le radici. La botanica misura la crescita. La squadra irriga le piante.',actions:['include','exclude'],correct:'include',note:'Aggiunge un reparto pertinente non ancora rappresentato.'},
        {id:'v2',badge:'INGEGNERIA',source:'Officina di Aurora · autorizzato',title:'Motore ausiliario',text:'La squadra controlla il motore. L’ingegnera misura la temperatura. La squadra sostituisce un filtro.',actions:['include','exclude'],correct:'include',note:'Aggiunge un contesto tecnico utile.'},
        {id:'v3',badge:'COMUNICAZIONI',source:'Sala radio · autorizzato',title:'Finestra radio',text:'La squadra controlla il segnale. L’operatore orienta l’antenna. La squadra invia il rapporto.',actions:['include','exclude'],correct:'include',note:'Aggiunge comunicazioni e un ruolo differente.'},
        {id:'v4',badge:'ALTRA COPIA',source:'Archivio geologico',title:'Cratere — terza copia',text:'La squadra controlla il cratere. La geologa osserva la roccia. La squadra raccoglie un campione.',actions:['include','exclude'],correct:'exclude',note:'Non aggiunge varietà: ripete ancora lo stesso rapporto.'},
        {id:'v5',badge:'RACCONTO',source:'Romanzo della biblioteca',title:'Il drago delle stelle',text:'Il drago vola sulla luna. La maga apre un portale. Il castello brilla nello spazio.',actions:['include','exclude'],correct:'exclude',note:'È un bel racconto, ma non è un rapporto della Stazione Aurora.'}
      ]
    }
  ];

  const finalReports=[
    {id:'f1',prompt:'La squadra controlla',question:'Quale parola potrebbe venire dopo?',source:'Registro operativo 18-A'},
    {id:'f2',prompt:'La squadra',question:'Il modello sceglie un’azione probabile.',source:'Registro operativo 21-C'},
    {id:'f3',prompt:'L’ingegnera',question:'Completa il frammento tecnico.',source:'Registro officina 7-B'}
  ];

  const explainer={
    q:'Un corpus contiene dieci copie dello stesso rapporto e un solo rapporto diverso. Che cosa può accadere?',
    answers:[
      'Lo schema copiato può pesare troppo nelle previsioni',
      'Il rapporto copiato diventa sicuramente vero',
      'Il modello comprende meglio il significato di ogni frase'
    ],correct:0,
    feedback:[
      'Esatto: il modello incontra quello schema molte più volte e può assegnargli troppo peso.',
      'Una ripetizione aumenta la frequenza, non dimostra che il contenuto sia vero.',
      'Le copie cambiano i conteggi; non regalano comprensione umana alla macchina.'
    ]
  };

  const tokenChapter={
    experimentText:'Il gatto saluta i gatti e un gattino.',
    wordVocabulary:['il','gatto','saluta','i','gatti','e','un','.'],
    subwordVocabulary:['il','gatt','o','i','ino','saluta','e','un','.'],
    buildText:'gatto gatti gattino',
    fixedVocabulary:['il','saluta','e','un','.'],
    fragmentOptions:['gatt','gatto','gatti','gattino','o','i','ino','t','a'],
    requiredFragments:['gatt','o','i','ino'],
    finalTexts:[
      'Un gattino saluta il gatto.',
      'I gatti salutano un gattino.',
      'Il gatto e i gatti giocano.'
    ],
    quiz:{
      q:'Perché un tokenizer può usare sottoparole invece di sole parole intere?',
      answers:['Può riutilizzare gli stessi frammenti in parole diverse','Rende ogni frase automaticamente vera','Fa sparire il limite della sequenza'],
      correct:0,
      feedback:['Esatto: un frammento come “gatt” può essere riutilizzato in gatto, gatti e gattino.','La tokenizzazione divide il testo: non controlla se ciò che dice è vero.','La sequenza ha ancora una lunghezza, che dipende da come il testo viene diviso.']
    }
  };

  const glossary=[
    {term:'Corpus',metaphor:'L’archivio scelto per la macchina',definition:'L’insieme dei testi usati per addestrare o provare un modello.'},
    {term:'Modello linguistico',metaphor:'La macchina che cerca schemi nei testi',definition:'Un sistema che assegna probabilità a sequenze di token. Non tutti i modelli linguistici sono grandi LLM.'},
    {term:'Token',metaphor:'Una tessera di testo',definition:'Un’unità elaborata dal modello: può essere una parola, una parte di parola, un segno o altro.'},
    {term:'Probabilità',metaphor:'Quanto è larga la pista di una candidata',definition:'Una misura di quanto una continuazione è favorita dal modello, non di quanto sia vera.'}
  ];

  return {chapters,chapterGuides,phases,finalReports,explainer,tokenChapter,glossary,actions:{
    use:'USA',exclude:'ESCLUDI',anonymize:'ANONIMIZZA',include:'AGGIUNGI'
  }};
});
