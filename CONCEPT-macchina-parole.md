# La Macchina delle Parole

## Concept di gioco — luglio 2026

**Sottotitolo:** *Costruisci un piccolo LLM nella Biblioteca delle Storie Spezzate.*

**Stato:** concept approvato, pronto per la progettazione della prima fetta verticale.

---

## 1. Visione

**La Macchina delle Parole** è un gioco autonomo di GabriGame nel quale Gabriele
costruisce un piccolo modello linguistico pezzo dopo pezzo. Il gioco spiega come
funziona e come viene costruito un LLM attraverso esperimenti realmente collegati
ai calcoli del modellino.

L'esperienza semplifica la scala e la matematica, non la natura dei meccanismi:

- i dati scelti cambiano davvero le previsioni;
- i testi vengono realmente divisi in token;
- embedding, posizione, attenzione, livelli e pesi hanno un effetto osservabile;
- l'addestramento modifica davvero i parametri del modellino;
- la generazione sceglie realmente un token alla volta da una distribuzione di
  probabilità;
- il gioco distingue sempre una risposta plausibile da una risposta vera.

Il risultato non deve far credere che un LLM sia una mente, un archivio di fatti o
una creatura che comprende come una persona. È una macchina matematica costruita
per prevedere token dal contesto, resa più utile attraverso dati, addestramento e
feedback umano.

---

## 2. Pubblico, piattaforma e durata

- **Età di riferimento:** 8–11 anni.
- **Lingua:** solo italiano nella prima versione.
- **Piattaforma principale:** computer.
- **Tablet:** supporto best effort, soprattutto in orizzontale.
- **Telefono:** non è un obiettivo della prima versione.
- **Campagna:** 10 capitoli da circa 8–12 minuti.
- **Dopo la campagna:** laboratorio libero e missioni bonus.
- **Salvataggio:** automatico e locale, associato al profilo di Gabriele già usato
  da GabriGame, ma separato dagli altri giochi.

Il gioco è accessibile direttamente dal menu principale. Non richiede di aver
completato l'Officina o altre modalità.

---

## 3. Promessa didattica

Al termine della campagna, Gabriele dovrebbe saper spiegare con parole proprie che:

1. un LLM impara schemi da molti testi, la cui qualità e provenienza contano;
2. il testo viene trasformato in token, che non coincidono sempre con parole intere;
3. i token sono rappresentati da numeri appresi e arricchiti con informazioni sul
   contesto e sull'ordine;
4. l'attenzione combina informazioni provenienti da posizioni diverse;
5. un Transformer contiene anche reti feed-forward, collegamenti residui,
   normalizzazioni e molti livelli, non soltanto attenzione;
6. durante l'addestramento la previsione viene confrontata con il risultato atteso
   e l'errore modifica gradualmente i pesi;
7. pre-addestramento, addestramento su istruzioni e preferenze umane hanno scopi
   differenti;
8. la generazione avviene un token alla volta e può includere campionamento;
9. temperatura e altri controlli cambiano la distribuzione delle scelte, non
   aggiungono conoscenza o creatività alla macchina;
10. una risposta fluida può essere falsa, distorta o inadatta e va verificata quando
    il compito lo richiede;
11. protezioni e feedback riducono alcuni rischi, ma non rendono il sistema
    infallibile;
12. il modellino del gioco e un LLM reale condividono idee fondamentali ma hanno
    scale enormemente diverse.

La lettura è facilitata, non valutata: frasi brevi, voce su richiesta ed
evidenziazione sincronizzata aiutano Gabriele, ma il gioco non aggiunge prove di
lettura separate.

---

## 4. Principi di progettazione

### 4.1 Il concetto è il gameplay

Ogni attività deve produrre una conseguenza coerente nel modello. Una scelta non
può essere dichiarata importante soltanto dal dialogo: deve cambiare dati, calcoli,
probabilità o output.

### 4.2 Semplificare senza mentire

Il gioco può usare vocabolari piccoli, vettori di poche dimensioni e reti minuscole.
Deve dichiarare queste riduzioni e non trasformare metafore didattiche in false
descrizioni tecniche.

Esempi:

- gli embedding vengono mostrati come punti vicini, ma i loro assi non sono
  etichettati artificialmente come “animale” o “colore”;
- le teste di attenzione possono cercare relazioni diverse, ma non ricevono ruoli
  umani rigidi o universali;
- la temperatura modifica probabilità, non “fantasia”;
- il feedback umano orienta il comportamento, non installa una moralità perfetta.

### 4.3 Esperimento prima del termine

Il giocatore incontra prima il fenomeno, poi costruisce il componente e infine
impara il suo nome tecnico.

Prima di entrare nell'attività, ogni capitolo presenta una **guida introduttiva in
quattro pagine brevi**:

1. il problema narrativo da risolvere;
2. lo scopo del capitolo e l'idea che si scoprirà;
3. le azioni concrete che il giocatore svolgerà;
4. le parole tecniche nuove, spiegate con termini semplici.

La guida può essere letta interamente dal TTS, pagina per pagina, oppure ascoltata
automaticamente. Ogni termine possiede anche un proprio pulsante di ascolto. Le
introduzioni dei capitoli non ancora giocabili restano consultabili dalla mappa,
così il percorso complessivo può essere esplorato in anticipo.

Ogni capitolo segue il ciclo:

1. **Esperimento:** manipolare un esempio e prevedere cosa accadrà.
2. **Costruzione:** montare o configurare il componente della macchina.
3. **Prova finale:** usare il componente per recuperare una parte della biblioteca.

### 4.4 Errori osservabili, non punitivi

Non ci sono vite. Un errore mostra il proprio effetto e può essere corretto.
Gli aiuti sono volontari, progressivi e non tolgono stelle:

1. indizio;
2. esempio analogo;
3. dimostrazione passo-passo.

### 4.5 Due livelli di lettura

Il percorso principale usa oggetti, barre, distanze, forme e piccole quantità.
Il pulsante **“🔍 Guarda dentro”** apre numeri e calcoli reali, spiegati un passaggio
alla volta.

---

## 5. Cornice narrativa

La **Biblioteca delle Storie Spezzate** conserva testi provenienti da molti mondi e
spedizioni. Alcune pagine sono state danneggiate e altre sono incomplete.

Gabriele costruisce una Macchina delle Parole che può proporre continuazioni
plausibili. Il viaggio rivela progressivamente che proporre non significa ricordare
l'originale e che soltanto una fonte autentica può stabilire cosa fosse davvero
scritto.

### Personaggi

#### Ada, la bibliotecaria

- custodisce fonti, permessi, provenienza e significato delle storie;
- assegna le missioni narrative;
- distingue una ricostruzione plausibile da un documento autentico;
- non pretende di conoscere il funzionamento interno della macchina.

Il nome richiama discretamente Ada Lovelace; la spiegazione è una curiosità
facoltativa.

#### Gibi

- aiuta Gabriele a costruire e ispezionare la macchina;
- spiega calcoli e componenti;
- non parla come se il modello avesse intenzioni, emozioni o comprensione umana;
- segnala con chiarezza quando si usa un modellino didattico.

Ada conosce le fonti. Gibi conosce la macchina. Gabriele deve collegare i due tipi di
conoscenza.

---

## 6. Identità visiva e interazione

### Biblioteca-meccanismo

L'ambiente è un **diorama 2D animato**. La biblioteca contiene archivi, nastri,
scaffali, lenti, passerelle e torri meccaniche. Ogni capitolo resta una stanza
riconoscibile della stessa grande macchina.

Metafore principali:

| Concetto | Rappresentazione |
|---|---|
| testo | strisce e pagine |
| token | tessere componibili |
| vocabolario | cassetti di tessere |
| embedding | libri collocati in una mappa di vicinanza |
| posizione | segnaposto applicati alla sequenza |
| finestra di contesto | cornice che rende visibile una parte del nastro |
| attenzione | lenti e fili luminosi pesati |
| rete feed-forward | banco che lavora separatamente ogni token |
| residuo | passerella che conserva il segnale precedente |
| peso | manopola numerica |
| loss | distanza dal bersaglio |
| gradiente | frecce di responsabilità che risalgono la macchina |
| probabilità | piste o barre per le parole candidate |
| livello Transformer | piano della torre |

### Controlli

- interazione touch-first nella logica: selezione e destinazione tramite clic/tocco;
- trascinamento disponibile, ma mai necessario per completare un'attività;
- layout ottimizzato per mouse e schermo da computer;
- azioni principali grandi e chiaramente etichettate;
- annullamento e ripristino sempre disponibili negli esperimenti.

### Animazioni accessibili

- pausa;
- avanzamento passo-passo;
- velocità regolabile;
- modalità movimento ridotto;
- colori sempre accompagnati da forme, trame, spessori o etichette;
- nessuna informazione affidata soltanto al movimento.

### Voce

La voce è disponibile su richiesta con un pulsante 🔊. Durante la lettura, i token
sono evidenziati in sequenza. Il gioco chiarisce che la sintesi vocale è un sistema
separato dall'LLM.

---

## 7. Progressione e ricompense

La campagna è lineare, con sblocco morbido. La stella **Costruttore** apre il
capitolo successivo; le altre possono essere ottenute in seguito. Un controllo per
l'adulto può sbloccare tutto.

Ogni capitolo assegna tre stelle indipendenti:

- ⭐ **Costruttore:** completa e usa il nuovo componente.
- ⭐ **Investigatore:** prevede correttamente l'effetto di una modifica prima di
  eseguire il calcolo.
- ⭐ **Spiegatore:** risponde a una domanda a scelta multipla basata su una nuova
  situazione.

Le domande dello Spiegatore:

- usano alternative sbagliate plausibili, legate a errori di ragionamento reali;
- spiegano sempre la risposta dopo il tentativo;
- consentono nuovi tentativi senza penalità;
- non richiedono di memorizzare parole tecniche isolate.

Ogni capitolo aggiunge un componente alla Macchina delle Parole e restaura una zona
della biblioteca. Le stelle sbloccano decorazioni, corpus ed esperimenti alternativi,
mai potenziamenti arbitrari del modello.

---

## 8. Campagna principale

### Capitolo 1 — L'Archivio dei dati

**Concetti:** corpus, qualità, varietà, duplicati, dati personali, provenienza,
permessi e distorsioni.

Gabriele recupera il diario della **Stazione Aurora**, una spedizione indipendente
dagli altri giochi di GabriGame. Una tempesta di particelle ha mescolato rapporti,
messaggi personali, copie, frammenti corrotti e materiali di provenienza incerta.

Il capitolo usa un vero **predittore a conteggio**, dichiarato come modello
linguistico semplice e non come LLM. Conta quali token seguono un breve contesto e
mostra immediatamente come il corpus cambi le probabilità.

Struttura dettagliata nella sezione dedicata alla prima fetta verticale.

### Capitolo 2 — Il Tagliatore di token

**Concetti:** token, vocabolario, parole intere, sottoparole, lunghezza della
sequenza.

Gabriele prova due estremi: un cassetto con intere parole diventa enorme e non sa
gestire parole nuove; tessere troppo piccole rendono ogni frase lunghissima. Deve
costruire un vocabolario di sottoparole che riutilizza frammenti tra “gatto”,
“gatti” e “gattino”.

Caratteri e byte sono un esperimento facoltativo. Il gioco non afferma che esista
un solo tokenizer universale.

### Capitolo 3 — La Mappa delle vicinanze

**Concetti:** embedding, vettori, contesti simili, distanza, rappresentazione
distribuita.

I token diventano libri collocati mediante piccoli vettori. Quelli incontrati in
contesti simili tendono ad avvicinarsi. Gli assi restano volutamente non nominati.

“Guarda dentro” mostra un vettore minuscolo e una misura di distanza. Una scheda
spiega che i modelli reali usano molte più coordinate e che un concetto non occupa
normalmente una singola dimensione leggibile.

### Capitolo 4 — Il Filo dell'ordine

**Concetti:** posizione, ordine, finestra e limite del contesto.

Gabriele applica segnaposto ai token e sposta una cornice lungo il nastro. Cambiare
l'ordine o lasciare una parola fuori dalla finestra modifica il risultato.

Posizioni relative e metodi rotatori come RoPE compaiono in “Guarda dentro” come
possibili soluzioni, non come regola universale di ogni LLM.

### Capitolo 5 — Le Lenti dell'attenzione

**Concetti:** self-attention, Query, Key, Value, punteggio, softmax e più teste.

Prima Gabriele collega intuitivamente un token alle parti rilevanti del contesto.
Poi ricostruisce il meccanismo:

1. crea una Query;
2. la confronta con le Key;
3. trasforma i punteggi in pesi;
4. raccoglie una miscela dei Value.

Il gioco principale usa gettoni e proporzioni. “Guarda dentro” mostra prodotto
scalare e softmax con numeri piccoli. Più lenti possono osservare relazioni diverse,
senza assegnare a ogni testa un significato fisso.

### Capitolo 6 — La Torre Transformer

**Concetti:** multi-head attention, rete feed-forward, collegamenti residui,
normalizzazione e profondità.

Sono giocabili:

- attenzione;
- rete feed-forward applicata separatamente a ogni token;
- collegamento residuo che conserva il segnale precedente;
- passaggio attraverso più livelli.

Normalizzazione, proiezioni e dettagli del blocco completo sono visibili in
“Guarda dentro”. Il capitolo corregge esplicitamente l'idea che un Transformer sia
soltanto attenzione.

### Capitolo 7 — La Scuola degli errori

**Concetti:** previsione, bersaglio, loss, backpropagation, gradiente, aggiornamento
dei pesi, epoche e learning rate.

Il modello effettua una previsione, misura la distanza dal risultato atteso, fa
risalire frecce di responsabilità e modifica i pesi di poco. Ripetendo esempi,
Gabriele osserva la loss e il comportamento cambiare.

Un learning rate troppo piccolo rende l'apprendimento lento; uno troppo grande fa
oscillare o peggiorare il modello. “Guarda dentro” mostra una derivata su una singola
manopola, senza richiedere la chain rule completa.

L'addestramento del modellino è calcolo reale e dura normalmente 2–5 secondi sul
dispositivo di riferimento. Può essere rallentato, messo in pausa o eseguito un
esempio alla volta. Non si aggiungono attese finte.

### Capitolo 8 — La Scuola delle istruzioni

**Concetti:** pre-addestramento, fine-tuning su istruzioni, preferenze e feedback
umano, pluralità dei metodi di allineamento.

Il modello passa da completare testo a seguire esempi domanda-risposta. In seguito
confronta risposte valutate da persone. Valutatori diversi possono non essere
d'accordo e il feedback può essere incompleto.

Il capitolo non presenta RLHF come unica tecnica possibile e non suggerisce che
l'allineamento renda il modello sempre corretto o sicuro.

### Capitolo 9 — La Ruota delle probabilità

**Concetti:** logits, distribuzione, campionamento, temperatura e generazione
autoregressiva.

La macchina propone probabilità e sceglie un token. Il token viene aggiunto al
contesto e il processo ricomincia. Gabriele può bloccare il seme casuale e ripetere
lo stesso esperimento.

La temperatura è il controllo principale della campagna. Top-k e top-p diventano
controlli del laboratorio. Greedy e altri metodi possono essere confrontati come
approfondimento, senza affollare la missione principale.

Il modello finale genera completamenti brevi di circa 3–8 token, tutti ispezionabili.

### Capitolo 10 — La Stanza degli specchi

**Concetti:** plausibilità, verità, lacune, distorsioni, dipendenza dal prompt e
verifica.

Quattro situazioni collegano i limiti ai capitoli precedenti:

1. una frase fluida inventa un fatto;
2. dati insufficienti producono una risposta fragile;
3. un corpus distorto produce uno schema distorto;
4. la formulazione della richiesta cambia la continuazione.

Gabriele decide quando e come verificare con una fonte affidabile. Il messaggio non
è “non fidarti mai”, ma **usa il modello come strumento e verifica quando conta**.

---

## 9. Sfida finale — Il Grande Restauro

Una storia importante ha perso il finale. Gabriele:

1. prepara un piccolo corpus;
2. controlla tokenizzazione e contesto;
3. ispeziona alcuni collegamenti di attenzione;
4. addestra il modellino;
5. genera più completamenti;
6. confronta probabilità e limiti;
7. decide che cosa deve essere verificato.

La macchina propone conclusioni plausibili. Ada recupera infine una fonte conservata
e mostra il testo originale. La campagna termina distinguendo chiaramente
**generazione** e **recupero di una fonte**.

---

## 10. Laboratorio libero

Il laboratorio usa il piccolo modello integrato della campagna. Il corpus iniziale
è preparato e controllato, ma Gabriele può aggiungere o modificare frasi. Tutto resta
locale nel browser e nessun testo viene inviato a servizi esterni.

### Modalità Base

- corpus;
- tokenizzazione;
- dimensione della finestra di contesto;
- temperatura;
- avvio, pausa e ripristino dell'esperimento.

### Modalità Tecnico

- dimensione degli embedding;
- numero di teste;
- numero di livelli;
- learning rate;
- numero di cicli;
- top-k;
- top-p;
- seme casuale;
- visualizzazione di pesi, loss e distribuzioni.

Combinazioni inefficienti o instabili restano consentite quando il dispositivo può
gestirle. Il gioco ne spiega le conseguenze invece di correggerle silenziosamente.

I corpus tematici sbloccabili possono includere animali, spazio, avventure e vita
quotidiana.

---

## 11. Missioni bonus

### 11.1 Ala Sicurezza

Quattro missioni giocabili, sbloccate dopo il finale e non necessarie per terminare
la campagna:

1. **Privacy:** riconoscere dati personali e capire perché non vanno inseriti senza
   motivo o autorizzazione.
2. **Truffe e manipolazione:** riconoscere testo persuasivo o impersonale che tenta
   di indurre un'azione rischiosa.
3. **Contenuti dannosi:** distinguere utilità, contesto e necessità di chiedere aiuto
   a una persona competente.
4. **Prompt injection:** osservare come istruzioni dentro un contenuto possano
   tentare di deviare un sistema e perché servono separazione, controlli e verifica.

Le missioni spiegano che le protezioni riducono il rischio ma possono fallire.

### 11.2 Hardware, scala ed energia

Il giocatore distribuisce piccoli calcoli tra chip e osserva memoria, parallelismo,
energia e raffreddamento. Addestramento e uso quotidiano vengono trattati
separatamente.

Uno **zoom delle dimensioni** confronta il modellino con sistemi molto più grandi
attraverso metafore spaziali e numeri reali:

- parametri;
- quantità di esempi e cicli;
- operazioni;
- memoria;
- tempo misurato sul dispositivo;
- ordini di grandezza dei modelli reali.

I dati su hardware ed energia devono avere fonte, data e condizioni. Non vengono
usate equivalenze universali o sensazionalistiche: consumo e prestazioni dipendono
da modello, hardware, lunghezza, carico, raffreddamento e fonte energetica.

---

## 12. Architettura didattica dei modelli

Il gioco usa due famiglie di strumenti:

### Modellini da banco

Ogni capitolo può isolare un fenomeno con un sistema minuscolo e deterministico.
Il gioco dichiara sempre quando sta usando questo tipo di modello.

Esempi:

- predittore a conteggio nel Capitolo 1;
- tokenizer sperimentali nel Capitolo 2;
- mappa vettoriale ridotta nel Capitolo 3;
- singola testa con dimensioni minime nel Capitolo 5;
- rete con poche manopole nel Capitolo 7.

### Modello finale integrato

Il Grande Restauro e il laboratorio usano un piccolo Transformer realmente
collegato. Deve includere almeno:

- tokenizzazione;
- embedding;
- informazione posizionale;
- attenzione causale;
- rete feed-forward;
- collegamenti residui e normalizzazione;
- uno o più blocchi;
- testa di previsione;
- loss e aggiornamento dei parametri;
- generazione autoregressiva e campionamento.

La dimensione esatta verrà scelta con prove di prestazioni. Il gioco mostra sempre
parametri, dati usati e tempo reale di calcolo.

---

## 13. Prima fetta verticale

La prima fase di sviluppo non tenta di implementare subito tutta la campagna. Deve
produrre una porzione completa, rifinita e verificabile che stabilisca il modello di
interazione per i capitoli successivi.

### Contenuto incluso

- nuova voce nel menu: **La Macchina delle Parole**;
- mappa/diorama iniziale della Biblioteca delle Storie Spezzate;
- introduzione breve di Ada e Gibi;
- anteprima visiva dei dieci reparti, con i successivi ancora chiusi;
- Capitolo 1 completo;
- sistema delle tre stelle;
- salvataggio separato;
- voce su richiesta;
- pulsante “Guarda dentro”;
- animazione con pausa, passo-passo e movimento ridotto;
- prima pagina del Taccuino per l'adulto;
- anteprima non interattiva della Macchina delle Parole ancora incompleta.

### Capitolo 1 — Stazione Aurora

#### Apertura

Ada riceve un archivio danneggiato della Stazione Aurora. La tempesta di particelle
ha mescolato copie, rapporti incompleti, comunicazioni personali e materiali di
provenienza diversa. Gibi propone di costruire prima un piccolo predittore per
misurare l'effetto delle scelte.

#### Micro-missione A — Ripulisci l'archivio

Il giocatore confronta documenti e identifica:

- duplicati esatti;
- duplicati quasi identici;
- frammenti corrotti;
- righe fuori tema;
- testi utili ma rari, che non vanno eliminati solo perché compaiono poco.

Prima di confermare, prevede come ripetizioni e corruzione influenzeranno le parole
più probabili. Il modello a conteggio visualizza il cambiamento.

#### Micro-missione B — Controlla provenienza e privacy

Ogni documento ha una scheda di provenienza. Il giocatore separa:

- rapporti autorizzati per il corpus;
- messaggi personali non necessari;
- coordinate o identificativi sensibili;
- testi privi di permesso o con provenienza sconosciuta.

La soluzione non equivale sempre a “eliminare”: quando possibile, un dato personale
può essere rimosso dal documento mantenendo la parte utile. Ada spiega la differenza
tra possedere un file e avere una buona ragione o il permesso per usarlo.

#### Micro-missione C — Rendi il corpus vario

Una prima selezione contiene quasi soltanto rapporti di un singolo laboratorio o
descrizioni di un solo tipo di evento. Il giocatore confronta distribuzioni e
aggiunge fonti pertinenti provenienti da ruoli e situazioni differenti.

Il modello mostra come previsioni troppo uniformi cambino quando il corpus copre più
contesti. “Vario” non significa aggiungere testi casuali: i documenti devono restare
pertinenti e affidabili.

#### Prova finale — I rapporti danneggiati

Il predittore riceve brevi righe con l'ultimo token mancante. Per ciascuna:

1. mostra le parole candidate e i loro conteggi;
2. permette di confrontare il corpus prima e dopo la selezione;
3. chiede a Gabriele di prevedere quale probabilità cambierà;
4. sceglie o campiona una continuazione;
5. ricorda che il risultato è plausibile, non una prova dell'evento reale.

La conclusione resta breve: la prima parte della macchina funziona, ma sa soltanto
contare schemi locali. Serviranno token migliori, rappresentazioni, contesto e
attenzione per costruire un LLM.

### Stelle della fetta verticale

- **Costruttore:** completa le tre micro-missioni e usa il predittore.
- **Investigatore:** formula correttamente almeno una previsione prima del calcolo.
- **Spiegatore:** risponde a una situazione a scelta multipla sul rapporto tra corpus
  e output, ricevendo comunque la spiegazione completa.

### Criteri di accettazione

La fetta verticale è riuscita quando:

1. il capitolo può essere completato senza leggere spiegazioni lunghe;
2. tutti i testi importanti hanno voce su richiesta;
3. le conseguenze di duplicati, pulizia e varietà sono prodotte dai dati del
   predittore, non da risultati preparati separatamente;
4. il giocatore può confrontare chiaramente prima e dopo;
5. nessun errore blocca o toglie progressi;
6. tastiera e mouse permettono di usare tutte le azioni principali;
7. il layout principale è stabile su computer e rimane utilizzabile su tablet;
8. ricaricare la pagina conserva il progresso;
9. il Taccuino descrive ciò che è stato esplorato senza assegnare un voto;
10. al termine, un bambino può dire che cambiare i dati cambia ciò che la macchina
    considera probabile.

---

## 14. Taccuino per l'adulto

Il Taccuino è locale, essenziale e non valutativo. Mostra:

- capitoli completati;
- stelle ottenute;
- concetti incontrati;
- esperimenti facoltativi ancora disponibili;
- una domanda suggerita per parlarne insieme;
- controllo per sbloccare tutti i capitoli;
- azzeramento separato dei progressi del gioco.

Non registra classifiche, tempi di risposta, profili psicologici o percentuali di
competenza.

Esempio di spunto: **“Che cosa è successo quando hai lasciato molte copie dello
stesso rapporto nel corpus?”**

---

## 15. Glossario

Ogni termine appare insieme alla metafora usata nel gioco. Il glossario include:

- nome tecnico;
- pronuncia tramite voce;
- definizione breve;
- esempio già incontrato;
- piccola animazione ripetibile;
- collegamento al capitolo corrispondente.

La terminologia prevista include almeno: LLM, corpus, token, vocabolario, embedding,
vettore, contesto, posizione, Transformer, self-attention, Query, Key, Value,
softmax, rete feed-forward, collegamento residuo, normalizzazione, parametro, peso,
loss, gradiente, backpropagation, learning rate, pre-addestramento, fine-tuning,
feedback umano, inferenza, logit, temperatura, top-k, top-p, bias e allucinazione.

---

## 16. Confini espliciti della prima versione

La prima versione non deve:

- collegarsi a un LLM esterno;
- inviare testi o progressi fuori dal dispositivo;
- generare racconti lunghi;
- fingere che il piccolo modello abbia capacità paragonabili a un assistente
  commerciale;
- usare attese simulate come sostituto del calcolo;
- valutare risposte scritte libere con un sistema opaco;
- supportare più lingue;
- essere ottimizzata per telefono;
- rendere obbligatorie missioni di sicurezza, hardware o energia per completare la
  storia principale;
- presentare un'architettura o una tecnica di addestramento come universale per ogni
  LLM.

---

## 17. Ordine di sviluppo proposto

1. Progettazione visuale e wireframe della fetta verticale.
2. Definizione completa dei documenti della Stazione Aurora e dei risultati attesi.
3. Motore del predittore a conteggio con confronto tra corpus.
4. Diorama, dialoghi brevi e ciclo esperimento–costruzione–prova.
5. Stelle, salvataggio, voce, accessibilità e Taccuino.
6. Test con scenari deterministici e verifica su computer/tablet.
7. Revisione della fetta verticale prima di estendere il Capitolo 2.

Le fasi successive devono riutilizzare la struttura validata, mantenendo un file o
modulo chiaramente separato per dati didattici, motore del modellino, interfaccia e
salvataggi.
