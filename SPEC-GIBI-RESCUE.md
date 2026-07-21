# Gibi Rescue: l'Auto Intelligente

## Specifica di prodotto e sviluppo — v1.0

**Sottotitolo:** Costruisci e programma con Arduino  
**Stato:** design approvato, pronto per l'implementazione  
**Destinatario principale:** Gabriele, 7–9 anni, nessuna esperienza di programmazione  
**Piattaforma:** browser, prima di tutto computer; tablet supportato  
**Lingua:** italiano, con i termini tecnici Arduino autentici in inglese

---

## 1. Visione

Gibi Rescue è un gioco autonomo di GabriGame nel quale Gabriele costruisce e programma una piccola automobile Arduino a due ruote. L'auto diventa progressivamente capace di muoversi, misurare le distanze, evitare gli ostacoli e scegliere da sola la direzione più libera.

La storia si svolge in una città futura allegra e colorata. Gibi è il copilota e accompagna Gabriele dalla prima vite fino alla missione finale: consegnare una batteria a un piccolo robot rimasto senza energia.

Il gioco deve funzionare interamente in simulazione, senza richiedere hardware. Chi possiede un kit Arduino compatibile può però stampare la scheda del progetto, esportare il codice `.ino` e ricostruire l'automobile reale.

### Promessa didattica

Il bambino non impara definizioni isolate: costruisce un sistema e vede continuamente il ciclo completo:

> il sensore misura → Arduino legge → il programma decide → i motori agiscono → il mondo cambia

La lettura è integrata nell'azione. Le consegne sono brevi, lette per fare qualcosa, senza quiz di comprensione separati.

---

## 2. Principi non negoziabili

1. **Prima capire, poi scrivere:** i blocchi visuali introducono un concetto alla volta.
2. **Autenticità protetta:** pin, componenti, unità e codice sono reali; gli errori pericolosi vengono impediti o spiegati.
3. **Errore come esperimento:** nessuna punizione dura, nessun numero limitato di tentativi.
4. **Causa ed effetto visibili:** blocco corrente, riga di codice, cono del sensore e movimento delle ruote restano sincronizzati.
5. **Progressione graduale:** si completa prima un programma quasi pronto; negli ultimi livelli lo si costruisce da zero.
6. **Due profondità:** cruscotto semplice per giocare, cruscotto tecnico per esplorare.
7. **Trasferibilità:** il codice Arduino completo esportato deve corrispondere al cablaggio proposto.
8. **Computer-first:** su desktop pista, blocchi e dati possono essere affiancati; su tablet diventano pannelli richiudibili.
9. **Accessibilità nativa:** voce, sottotitoli, tastiera, testo ingrandibile, icone oltre ai colori e riduzione delle animazioni.
10. **Niente dipendenze didattiche:** Gibi Rescue è accessibile subito e non richiede il completamento dell'Officina.

---

## 3. Pubblico, tono e linguaggio

- Età principale: 7–9 anni.
- Esperienza iniziale: nessuna.
- Tono: curioso, incoraggiante, mai infantile o punitivo.
- Frasi: brevi, concrete, una consegna principale alla volta.
- Voce: ogni consegna può essere ascoltata senza penalità.
- Lettura karaoke: durante la voce, le parole si evidenziano in sincrono quando il sistema esistente lo permette.
- Termini Arduino: `setup`, `loop`, `input`, `output`, `HIGH`, `LOW`, `if`, `else` restano in inglese, ma vengono spiegati in italiano alla prima apparizione.
- Numeri: si usano misure reali in centimetri e percentuali semplici, sostenute da rappresentazioni visive. Non sono richieste formule.

---

## 4. Cornice narrativa

Gibi riceve richieste di aiuto dalla Città del Futuro. Per rispondere serve un veicolo capace di guidarsi da solo. Gabriele lo costruisce nel garage, lo prova in una pista e infine lo invia nelle strade della città.

### I quattro quartieri/capitoli

1. **L'Officina — Costruiamo l'auto**  
   Telaio, Arduino, alimentazione, driver e primo motore.
2. **La Pista Prove — Insegniamole a muoversi**  
   Due motori, sequenze, sterzata, velocità e `loop`.
3. **Il Quartiere dei Sensori — Insegniamole a vedere**  
   HC-SR04, centimetri, soglia e `if/else`.
4. **Il Centro Città — Insegniamole a scegliere**  
   Evitamento, servo, confronto sinistra/destra e soccorso finale.

La mappa è illustrata. Le strade si illuminano con il progresso e mostrano stelle, missione successiva e componenti sbloccati.

### Ruolo di Gibi

Gibi è copilota, non professore. Presenta l'obiettivo, pone domande durante il debugging, celebra le scoperte e offre tre livelli di aiuto:

1. domanda orientativa;
2. suggerimento visivo;
3. soluzione fantasma da applicare o copiare.

Voce e primi due indizi non penalizzano. Solo l'uso della soluzione completa può impedire la stella relativa alla qualità del programma in quella missione.

---

## 5. Kit Arduino di riferimento

La simulazione rappresenta un kit standard e comune, senza obbligarne l'acquisto.

### Componenti principali

- Arduino Uno R3 o compatibile;
- telaio 2WD;
- due motori TT con ruote;
- ruotino folle;
- driver motori L298N;
- sensore a ultrasuoni HC-SR04;
- micro-servo SG90;
- portapile AA con pile ricaricabili per i motori;
- cavo USB per programmazione;
- breadboard piccola o morsetti, cavetti jumper e interruttore secondo il kit.

### Mappatura pin predefinita

La mappatura può essere modificata in futuro, ma una configurazione deve restare predefinita e coerente in simulazione, schemi e generatore di codice:

| Funzione | Pin Arduino proposto |
|---|---:|
| Motore sinistro ENA (PWM) | D5 |
| Motore sinistro IN1 / IN2 | D2 / D4 |
| Motore destro ENB (PWM) | D6 |
| Motore destro IN3 / IN4 | D7 / D8 |
| Servo | D9 |
| HC-SR04 TRIG | D12 |
| HC-SR04 ECHO | D11 |

Questa tabella è una scelta implementativa iniziale: prima di pubblicare le istruzioni fisiche va verificata sul kit reale di riferimento.

### Sicurezza

Gli avvisi sono integrati nelle missioni reali, non in una sezione separata. Devono essere brevi, contestuali e distinguere chiaramente ciò che può fare il bambino da ciò che richiede la presenza di un adulto.

- Spegnere l'alimentazione prima di cambiare i fili.
- Controllare polarità e massa comune.
- Non alimentare i motori direttamente dai pin di Arduino.
- Non usare una batteria rettangolare da 9 V come soluzione consigliata per i motori.
- Non proporre celle al litio sciolte nella prima versione.
- Usare AA ricaricabili nel portapile e USB per la programmazione.
- Le varianti del modulo L298N devono avere istruzioni specifiche e verificate, soprattutto per jumper e alimentazione logica.

Il browser non comunica direttamente con Arduino nella prima versione. La futura modalità USB/Web Serial resta fuori ambito, ma l'architettura non deve renderla impossibile.

---

## 6. Ciclo di gioco

Ogni missione segue, con piccole variazioni, questo ciclo:

1. **Richiesta di soccorso:** Gibi spiega in una frase cosa serve.
2. **Officina:** si monta o collega il nuovo componente con agganci assistiti.
3. **Programmazione:** si completa, ordina o costruisce un programma a blocchi.
4. **Previsione:** Gibi chiede cosa farà l'auto; la risposta è visuale e non punitiva.
5. **Test:** l'auto esegue il programma sulla pista.
6. **Debug:** in caso di problema, il test si ferma sul momento utile e mostra causa ed effetto.
7. **Nuovo tentativo:** modifica immediata, riavvolgimento e ripartenza.
8. **Conclusione:** stelle indipendenti, una scoperta breve e sblocco successivo.

### Controlli del test

- **ESEGUI:** esecuzione autonoma.
- **PAUSA:** congela fisica e programma e apre l'ispezione.
- **PASSO-PASSO:** esegue un singolo blocco logico o una singola azione significativa.
- **RIAVVOLGI:** torna all'inizio del test mantenendo le modifiche.
- **RIFAI:** ripristina il programma iniziale della missione dopo conferma non distruttiva.

### Debug visivo

Quando l'auto urta o non raggiunge l'obiettivo:

- il tempo rallenta e poi si ferma;
- viene evidenziato il blocco appena eseguito;
- la riga di codice corrispondente viene evidenziata;
- il cono del sensore e la misura usata restano visibili;
- Gibi pone una domanda concreta, per esempio: «L'auto ha iniziato a frenare abbastanza presto?»;
- si può tornare direttamente all'editor mantenendo il punto problematico in evidenza.

---

## 7. Le 12 missioni

Ogni missione dura indicativamente 5–10 minuti ed è rigiocabile.

### Capitolo 1 — L'Officina

#### 1. I pezzi della Rescue Car

- **Obiettivo:** montare telaio, ruote, ruotino e supporto Arduino.
- **Concetto:** ogni componente ha un ruolo.
- **Interazione:** trascinamento con aggancio nei punti compatibili; ruotare il pezzo solo quando necessario.
- **Programmazione:** nessuna pagina vuota; breve sequenza illustrata di montaggio.
- **Successo:** automobile meccanicamente completa.
- **Sblocco:** colore base e adesivo Rescue.

#### 2. Il cervello e l'energia

- **Obiettivo:** posizionare Arduino, driver e alimentazione.
- **Concetto:** Arduino decide, il driver fornisce potenza ai motori, le pile danno energia.
- **Cablaggio:** collegamenti guidati, con `5V`, `GND` e alimentazione motori distinti visivamente.
- **Sicurezza:** motori non collegati direttamente ai pin; alimentazione spenta durante il cablaggio.
- **Successo:** controllo di coerenza dello schema.

#### 3. Sveglia un motore

- **Obiettivo:** collegare e provare il motore sinistro.
- **Concetto:** `output`, direzione e velocità PWM semplificata.
- **Programma:** inserire i blocchi mancanti in `setup` e avviare il motore a bassa velocità.
- **Visualizzazione:** ruota reale, icona del pin e riga Arduino sincronizzate.
- **Successo:** il motore gira nel verso richiesto.

### Capitolo 2 — La Pista Prove

#### 4. Avanti insieme

- **Obiettivo:** collegare il secondo motore e percorrere un tratto diritto.
- **Concetto:** due attuatori coordinati.
- **Programma:** entrambe le ruote avanti alla stessa velocità.
- **Successo:** raggiungere la zona verde senza uscire dalla pista.

#### 5. Fermati, torna, gira

- **Obiettivo:** eseguire una piccola manovra composta.
- **Concetto:** sequenza e guida differenziale.
- **Programma:** AVANTI → STOP → INDIETRO → GIRA.
- **Debug:** mostrare le frecce di ciascuna ruota.
- **Successo:** parcheggiare nella seconda zona.

#### 6. Il giro di prova

- **Obiettivo:** ripetere un tratto senza duplicare tutti i blocchi.
- **Concetto:** `loop` e ripetizione.
- **Programma:** ordinare i blocchi e racchiudere la sequenza nel ciclo corretto.
- **Successo:** completare il percorso previsto.
- **Nota:** il moto resta semplificato e ripetibile; la missione non pretende precisione millimetrica da un robot reale.

### Capitolo 3 — Il Quartiere dei Sensori

#### 7. Gli occhi a ultrasuoni

- **Obiettivo:** montare HC-SR04 e collegare `TRIG`, `ECHO`, `5V`, `GND`.
- **Concetto:** il sensore invia un suono non udibile e ascolta il ritorno.
- **Programma:** completare la configurazione dei pin.
- **Successo:** collegamento corretto e cono sensoriale attivo.

#### 8. Quanti centimetri?

- **Obiettivo:** misurare tre oggetti a distanze diverse.
- **Concetto:** input, valore e variabile `distanza`.
- **Programma:** usare LEGGI DISTANZA e mostrare il risultato.
- **Vista tecnica:** durata dell'eco disponibile solo nel cruscotto tecnico.
- **Successo:** associare correttamente vicino/lontano ai valori in cm.

#### 9. Se è vicino, fermati

- **Obiettivo:** fermare l'auto prima di un muro.
- **Concetto:** soglia e `if/else`.
- **Programma:** `if distanza < 20 cm` → STOP; `else` → AVANTI.
- **Interazione:** soglia regolabile e linea visiva sulla pista.
- **Successo:** fermarsi senza contatto nella zona prevista.

### Capitolo 4 — Il Centro Città

#### 10. Trova un'altra strada

- **Obiettivo:** non limitarsi a fermarsi, ma evitare l'ostacolo.
- **Concetto:** strategia composta.
- **Programma:** STOP → INDIETRO → GIRA → AVANTI.
- **Ostacoli:** fissi e ripetibili.
- **Successo:** raggiungere il punto di consegna senza urti.

#### 11. Guarda a sinistra e a destra

- **Obiettivo:** montare il servo e scegliere il lato più libero.
- **Concetto:** confronto fra due valori.
- **Programma:** guarda sinistra, salva `distanzaSinistra`; guarda destra, salva `distanzaDestra`; gira verso il valore maggiore.
- **Visualizzazione:** testa del sensore, due raggi e due etichette in cm.
- **Successo:** scegliere correttamente in più di una configurazione.

#### 12. Batteria in arrivo!

- **Obiettivo narrativo:** consegnare una batteria a un piccolo robot senza energia.
- **Concetti:** ciclo completo sensore → decisione → movimento.
- **Programma:** costruzione libera con i blocchi sbloccati; modello iniziale disponibile tramite aiuti.
- **Pista:** ostacoli in posizioni parzialmente variabili, ma sempre risolvibili.
- **Nessun timer obbligatorio:** la sicurezza vale più della velocità.
- **Successo:** raggiungere il robot senza urti e senza controllo manuale.
- **Finale:** riaccensione del robot, celebrazione di Gibi, accesso completo al laboratorio libero.

---

## 8. Stelle, ricompense e progressione

Ogni missione assegna tre stelle indipendenti:

1. **Missione:** obiettivo raggiunto.
2. **Sicurezza:** nessun urto o errore di cablaggio rilevante durante il tentativo riuscito.
3. **Programma:** soluzione chiara/efficiente entro criteri specifici della missione e senza applicare la soluzione fantasma completa.

Regole:

- ascoltare la voce non penalizza;
- usare i primi due aiuti non penalizza;
- gli errori nei tentativi precedenti non cancellano la possibilità di migliorare;
- nessuna classifica globale e nessun rapporto separato per adulti;
- la mappa mostra stelle, progressi e concetti acquisiti senza giudizi rigidi.

### Ricompense

- Componenti e blocchi funzionali vengono sbloccati dalla progressione.
- Le stelle sbloccano colori, adesivi, lampeggianti ed elementi estetici.
- Le personalizzazioni non modificano la fisica o la difficoltà.

---

## 9. Programmazione a blocchi

### Aspetto

Blocchi a incastro ispirati a Scratch, ma originali e coerenti con GabriGame. Devono essere grandi, leggibili e usabili con mouse o touch.

### Categorie

| Categoria | Colore indicativo | Blocchi principali |
|---|---|---|
| Avvio | giallo | QUANDO PARTE, `setup`, `loop` |
| Movimento | blu | AVANTI, INDIETRO, STOP, GIRA SINISTRA/DESTRA, VELOCITÀ |
| Sensori | verde | LEGGI DISTANZA, GUARDA SINISTRA, GUARDA DESTRA |
| Controllo | arancio | ATTENDI, RIPETI, `if`, `else` |
| Valori | viola | centimetri, velocità, maggiore/minore |
| Dati | turchese | `distanza`, `distanzaSinistra`, `distanzaDestra` |

### Progressione dell'editor

- Missioni 1–3: sequenze quasi complete, un blocco mancante.
- Missioni 4–6: riordino e piccoli programmi guidati.
- Missioni 7–9: condizioni con spazi predisposti.
- Missioni 10–11: composizione di strategie con palette limitata.
- Missione 12 e sandbox: costruzione libera con tutti i blocchi sbloccati.

### Regole dell'editor

- impedire incastri sintatticamente impossibili;
- spiegare perché un blocco non può entrare in una posizione;
- evidenziare durante l'esecuzione il blocco corrente;
- consentire annulla/ripristina;
- evitare cancellazioni accidentali con una zona cestino chiara e recupero immediato;
- offrire navigazione completa da tastiera;
- serializzare il programma in un formato dati versionato, non come HTML.

---

## 10. Le due viste del codice

Ogni programma a blocchi genera due rappresentazioni sincronizzate.

### Codice di Gabri

Versione breve e leggibile, per esempio:

```cpp
sempre {
  distanza = misuraDistanza();

  se (distanza < 20 cm) {
    fermati();
    giraADestra();
  } altrimenti {
    vaiAvanti();
  }
}
```

Questa vista non viene esportata come programma Arduino: serve a comprendere.

### Arduino vero

Codice C++ Arduino completo e compilabile, con:

- costanti dei pin;
- `#include <Servo.h>` quando necessario;
- `setup()` con `pinMode` e inizializzazione servo;
- `loop()`;
- funzioni per motori, sterzata e misura tramite `pulseIn`;
- commenti brevi in italiano;
- timeout nella lettura dell'eco per evitare blocchi;
- valori di velocità e soglia coerenti con la simulazione.

Toccando un blocco si evidenziano le righe generate. Durante l'esecuzione, blocco e codice avanzano insieme.

### Esportazione

Per i traguardi abilitati, generare:

- file `.ino`;
- schema dei collegamenti stampabile;
- elenco componenti;
- istruzioni illustrate e avvisi di sicurezza;
- riepilogo pin;
- file progetto Gibi Rescue, per esempio `.gibi-rescue.json`.

Non promettere caricamento diretto sulla scheda nella v1.

---

## 11. Simulazione

### Fisica

Usare un modello 2D di guida differenziale semplificato ma corretto:

- velocità indipendente per ruota sinistra e destra;
- uguale velocità positiva → moto diritto;
- velocità differenti → curva;
- segni opposti → rotazione sul posto;
- accelerazione e frenata leggermente smussate;
- collisioni stabili con pareti e ostacoli;
- piccole tolleranze per non trasformare il gioco in un test di precisione fisica.

La casualità fisica non deve impedire di confrontare due esecuzioni. Eventuali differenze fra motori o slittamento appartengono a una futura modalità avanzata.

### Sensore HC-SR04

- origine e direzione coerenti con la posizione del servo;
- cono/raggio visibile quando richiesto;
- misura della prima superficie valida entro il campo configurato;
- limite minimo e massimo realistico ma tarato per il gameplay;
- rumore nullo o molto piccolo nelle prime missioni;
- valore assente/timeout gestito esplicitamente nella vista tecnica;
- collisione e misura devono usare la stessa geometria del mondo.

### Servo

- posizioni didattiche principali: sinistra, centro, destra;
- movimento animato, non teletrasporto;
- la misura avviene quando il servo ha raggiunto la posizione;
- il passo-passo tratta orientamento e lettura come azioni comprensibili.

### Ostacoli

- missioni 1–10: posizioni fisse;
- missione 11: più configurazioni predeterminate;
- missione 12: configurazioni variabili scelte da un insieme verificato e sempre risolvibile;
- sandbox: disposizione libera con validazione minima di partenza e obiettivo.

---

## 12. Interfaccia

### Desktop

Tre pannelli ridimensionabili:

1. **Sinistra — Blocchi:** palette e programma.
2. **Centro — Pista:** area principale, auto, ostacoli e obiettivo.
3. **Destra — Capire:** cruscotto o codice, selezionabili tramite schede.

Ogni pannello laterale è richiudibile. La pista deve ricevere lo spazio maggiore.

Le fasi di montaggio possono usare un'officina isometrica dedicata, ma devono mantenere accesso rapido a consegna, aiuto e mappa.

### Tablet

- pista a tutta larghezza;
- blocchi e cruscotto come pannelli laterali o inferiori richiamabili;
- nessuna funzione essenziale disponibile solo al passaggio del mouse;
- bersagli tattili grandi e trascinamento tollerante.

### Cruscotto semplice

- distanza in cm;
- direzione dello sguardo;
- decisione corrente;
- velocità/direzione delle due ruote.

### Cruscotto tecnico

Selezionabile liberamente, aggiunge:

- pin coinvolti;
- `HIGH/LOW`;
- impulso e durata dell'eco;
- velocità PWM dei motori;
- variabili;
- registro delle ultime istruzioni.

La scelta viene ricordata, ma ogni missione può suggerire temporaneamente la vista più utile.

### Stile visivo

- automobile, città e personaggi: giocattolo colorato, forme morbide, contorni leggibili;
- Arduino, pin, fili e componenti: riconoscibili e proporzionati abbastanza da poterli ritrovare nel kit reale;
- non affidarsi al solo colore per stato o correttezza;
- effetti festosi, ma senza coprire codice o dati importanti.

### Audio

- musica discreta;
- motori e servo riconoscibili;
- impulsi del sensore rappresentati con un effetto delicato, pur chiarendo che gli ultrasuoni veri non sono udibili;
- urti morbidi, mai allarmanti;
- controlli separati per voce, effetti e musica.

---

## 13. Laboratorio libero

Si sblocca progressivamente e diventa completo dopo la missione 12.

### Funzioni v1

- creare una pista vista dall'alto;
- posizionare muri, ostacoli, curve decorative, partenza, traguardo e punto di soccorso;
- scegliere l'aspetto dell'auto;
- costruire un programma libero con i blocchi sbloccati;
- eseguire, mettere in pausa e avanzare passo-passo;
- cambiare cruscotto;
- salvare più progetti;
- rinominare, duplicare, esportare e importare un progetto;
- generare il codice Arduino quando il progetto usa solo capacità trasferibili.

### Fuori ambito v1

- simulazione libera di componenti elettronici arbitrari;
- sensori di linea, luce o colore;
- più automobili contemporaneamente;
- condivisione online o account;
- classifiche;
- editor di città 3D;
- collegamento diretto via USB/Web Serial.

---

## 14. Salvataggi e formato progetto

Il gioco deve funzionare offline e senza server.

### Local storage

Usare chiavi prefissate e versionate, per esempio:

- `gabri_gr_progress_v1`;
- `gabri_gr_settings_v1`;
- `gabri_gr_projects_v1`.

Salvare almeno:

- missione sbloccata;
- stelle per missione;
- componenti e decorazioni sbloccati;
- scelta cruscotto semplice/tecnico;
- layout dei pannelli;
- programmi e piste della sandbox;
- versione dello schema dati.

Ogni lettura deve tollerare dati mancanti o corrotti e ripiegare su valori sicuri senza rompere l'avvio.

### File esportabile

Formato JSON versionato con:

- metadati del progetto;
- versione;
- configurazione auto e pin;
- programma come albero di blocchi;
- pista;
- impostazioni pertinenti.

L'importazione deve validare struttura, dimensioni e valori prima di modificare i dati locali.

---

## 15. Accessibilità

Requisiti della prima versione:

- testo ingrandibile senza perdita di funzioni;
- sintesi vocale per consegne e spiegazioni;
- sottotitoli/testo sempre presenti anche quando parla Gibi;
- controlli da tastiera per editor, pannelli e test;
- focus visibile;
- icona o testo insieme a ogni colore di stato;
- contrasto adeguato;
- opzione riduci movimento;
- pausa sempre disponibile;
- nessuna sfida basata esclusivamente sulla rapidità;
- nessun suono indispensabile senza equivalente visivo.

---

## 16. Integrazione con GabriGame

Gibi Rescue è una modalità autonoma registrata nel selettore principale, non un banco dell'Officina.

Registrazione indicativa:

```js
registerGame({
  id: 'gibi-rescue',
  emoji: '🚗',
  nm: ['Gibi Rescue'],
  sub: ['Costruisci e programma l’Auto Intelligente!'],
  colore: 'linear-gradient(180deg,#38b8d8,#3467c7)',
  enter: grEnter
});
```

Il testo definitivo può usare un'illustrazione dell'auto invece dell'emoji.

### Architettura suggerita

Il progetto attuale è statico, senza bundler, e carica script classici in sequenza. Conservare questo modello.

- `js/gibi-rescue-data.js` — testi, missioni, definizioni dei blocchi, configurazione kit;
- `js/gibi-rescue-sim.js` — fisica, collisioni, sensore e servo senza dipendenze DOM forti;
- `js/gibi-rescue-code.js` — validazione AST e generazione Codice di Gabri/Arduino;
- `js/gibi-rescue.js` — stato, interfaccia, editor, mappa, salvataggi e registrazione;
- `test/test-gibi-rescue.js` — test unitari e integrazione;
- eventuali asset in `assets/gibi-rescue/`.

Caricare i file nell'ordine `data → sim → code → main`, dopo le dipendenze comuni. Aggiornare `index.html` e `README.md` senza cambiare l'ordine degli script già esistenti.

### Namespace

- prefisso costanti/funzioni: `GR_` / `gr`;
- esporre un solo hook di test documentato, per esempio `window.__GR`;
- evitare nuove globali generiche;
- riusare, quando appropriato, `$`, `LI`, `NM`, `speak`, `stopSpeak`, audio comune e `registerGame`;
- non dipendere da variabili interne non documentate di altre modalità.

---

## 17. Modello di stato suggerito

```js
{
  version: 1,
  screen: 'map',
  chapter: 0,
  mission: 0,
  phase: 'intro',
  runMode: 'paused',
  dashboard: 'simple',
  progress: {
    unlockedMission: 0,
    stars: [],
    unlocks: []
  },
  build: {
    parts: [],
    wires: [],
    pinMap: {}
  },
  program: {
    schemaVersion: 1,
    setup: [],
    loop: []
  },
  sim: {
    car: {},
    servoAngle: 90,
    sensorDistanceCm: null,
    variables: {},
    execution: {}
  },
  attempts: {
    collisions: 0,
    usedGhostSolution: false,
    hintsUsed: 0
  }
}
```

Separare chiaramente:

- stato persistente;
- stato della missione;
- stato transitorio del simulatore;
- dati derivati per il rendering.

---

## 18. Strategia di implementazione

### Fase A — Fondamenta e vertical slice

1. Registrazione nel menu e mappa dei quattro capitoli.
2. Layout desktop a tre pannelli e adattamento tablet.
3. AST minimo dei blocchi ed editor per AVANTI/STOP/ATTENDI.
4. Generazione delle due viste di codice.
5. Simulatore differenziale, collisioni e controlli ESEGUI/PAUSA/PASSO-PASSO.
6. Missione 4 come vertical slice completa, usando un'auto già assemblata temporaneamente.

La vertical slice verifica la parte più rischiosa: editor → interprete → simulazione → evidenziazione → risultato.

### Fase B — Costruzione e primo capitolo

1. Officina isometrica.
2. Sistema parti/agganci e cablaggio assistito.
3. Missioni 1–3.
4. Sicurezza contestuale.

### Fase C — Movimento e sensore

1. Missioni 5–9.
2. Cicli, variabili, soglia e `if/else`.
3. Simulazione HC-SR04 e cruscotti.

### Fase D — Autonomia e conclusione

1. Servo e scansione.
2. Missioni 10–12.
3. Varianti verificate della pista finale.
4. Stelle, ricompense e finale narrativo.

### Fase E — Sandbox ed esportazione

1. Editor pista.
2. Progetti multipli, import/export JSON.
3. Generatore `.ino` completo.
4. Scheda progetto stampabile.
5. Rifinitura accessibilità e audio.

---

## 19. Verifica e test

### Test unitari

- cinematica differenziale;
- collisioni e ripristino;
- raycast/misura del sensore;
- orientamento servo;
- interprete dei blocchi;
- pausa e passo-passo;
- validazione AST;
- generazione di codice per ogni blocco;
- corrispondenza pin/schema/codice;
- calcolo indipendente delle tre stelle;
- migrazione e recupero salvataggi;
- validazione import JSON.

### Test di integrazione

- avvio dal selettore e ritorno al menu;
- completamento di ogni missione;
- aiuti progressivi;
- collisione → debug → modifica → successo;
- passaggio semplice/tecnico;
- evidenziazione sincronizzata blocco/codice;
- salvataggio e ripristino;
- esportazione e reimportazione progetto;
- sblocco sandbox e ricompense.

### Verifica codice Arduino

Il codice esportato non deve essere soltanto plausibile. Prima della consegna della funzione di export:

- compilare sketch rappresentativi con Arduino CLI, se disponibile;
- verificare sketch senza servo e con servo;
- controllare timeout del sensore;
- controllare conflitti fra pin/PWM/Servo;
- confrontare schema stampato e costanti generate;
- provare almeno il percorso finale su hardware reale prima di definirlo «pronto per Arduino».

### Verifica visiva

- desktop largo e laptop medio;
- viewport tablet orizzontale e verticale;
- zoom testo;
- riduzione animazioni;
- uso senza mouse;
- assenza di sovrapposizioni fra pista, editor, modali e controlli.

### Comandi minimi prima della consegna

Adattare ai file effettivamente creati:

```sh
node --check js/gibi-rescue-data.js
node --check js/gibi-rescue-sim.js
node --check js/gibi-rescue-code.js
node --check js/gibi-rescue.js
node --test test/test-gibi-rescue.js
```

---

## 20. Criteri di accettazione della v1

La prima versione è completa quando:

1. Gibi Rescue compare come gioco autonomo nel menu.
2. Tutte le 12 missioni sono giocabili, salvate e rigiocabili.
3. Il bambino può completare il percorso senza hardware reale.
4. Montaggio e cablaggio usano componenti e pin coerenti.
5. I programmi evolvono da completamento guidato a costruzione libera.
6. Auto, sensore, servo e collisioni reagiscono in modo stabile e comprensibile.
7. ESEGUI, PAUSA, PASSO-PASSO e RIAVVOLGI funzionano in ogni missione di programmazione.
8. Blocco corrente, riga di codice e azione simulata sono sincronizzati.
9. Cruscotto semplice e tecnico sono entrambi selezionabili.
10. Le tre stelle sono indipendenti e gli aiuti rispettano le regole definite.
11. La missione finale usa configurazioni variabili ma sempre risolvibili.
12. La sandbox permette di creare, salvare, esportare e reimportare piste/programmi.
13. Il codice `.ino` esportato compila per gli scenari supportati.
14. La scheda progetto riflette esattamente pin e componenti generati.
15. Il gioco è utilizzabile da tastiera, con voce disattivata e con animazioni ridotte.
16. Non esistono account, classifiche, dipendenze di rete o connessione USB obbligatoria.

---

## 21. Rischi principali e contromisure

| Rischio | Contromisura |
|---|---|
| Editor a blocchi troppo complesso | AST ridotto, palette progressiva, vertical slice anticipata |
| Simulazione e codice esportato divergono | Un solo modello semantico condiviso fra interprete e generatori |
| Cablaggio realistico troppo difficile | Pin reali con agganci compatibili e aiuti che diminuiscono gradualmente |
| Schermo sovraccarico | Pannelli ridimensionabili/richiudibili e due cruscotti |
| Fisica imprevedibile | Modello deterministico, tolleranze e niente slittamento nella v1 |
| Missione finale casualmente impossibile | Libreria di configurazioni pre-verificate, non generazione arbitraria |
| Codice Arduino non realmente utilizzabile | Compilazione automatica e prova sul kit di riferimento |
| Progetto troppo grande in un solo file | Separazione data/sim/code/UI con namespace unico |
| Frustrazione durante il debug | errore non punitivo, riavvolgimento e tre indizi progressivi |

---

## 22. Decisioni rinviate

Non appartengono alla v1, ma l'architettura dovrebbe consentirle:

- connessione USB/Web Serial con l'auto reale;
- sensori segui-linea;
- sensori di luce e colore;
- calibrazione avanzata dei motori;
- rumore sensoriale e batteria variabile;
- condivisione di piste senza account;
- ulteriori missioni cittadine;
- compatibilità con altri driver motori o schede Arduino.

---

## 23. Prompt di handoff per la sessione di sviluppo

Copia il testo seguente in una nuova sessione con accesso alla cartella `GabriGame`.

```text
Nel repository GabriGame devi implementare il nuovo gioco autonomo “Gibi Rescue: l’Auto Intelligente”.

Prima di modificare qualsiasi file:
1. leggi integralmente /Users/danielefiungo/GabriGame/SPEC-GIBI-RESCUE.md;
2. leggi AGENTS.md, README.md, index.html, js/scelta-gioco.js e le modalità Officina già presenti;
3. controlla lo stato Git e preserva tutte le modifiche dell’utente non pertinenti.

La specifica è la fonte di verità per prodotto, didattica, missioni, componenti, interfaccia, simulazione, salvataggi, accessibilità, test e criteri di accettazione. Non ridisegnare silenziosamente le decisioni approvate. Se trovi una contraddizione tecnica, documentala e scegli la soluzione più piccola che preserva l’intento.

Obiettivo di sviluppo:
- realizzare Gibi Rescue come modalità autonoma del selettore principale;
- mantenere il progetto statico, senza introdurre framework o build step non necessari;
- usare l’architettura suggerita data/sim/code/main e il namespace GR_/gr;
- costruire prima la vertical slice descritta nella sezione 18, quindi completare le fasi successive;
- integrare blocchi, interprete, fisica, sensore, servo e generatori attraverso un unico modello semantico;
- verificare ogni fase prima di continuare.

Vincoli importanti:
- computer-first, tablet supportato;
- italiano con termini tecnici Arduino in inglese;
- nessun hardware richiesto e nessuna connessione USB nella v1;
- errori non punitivi, voce gratuita, tre aiuti progressivi;
- codice Arduino e scheda dei collegamenti devono restare coerenti;
- nessuna dipendenza di rete, account o classifica;
- non cambiare l’ordine degli script esistenti: aggiungi i nuovi script nel corretto ordine dopo le dipendenze comuni;
- riusa le utilità globali documentate soltanto quando appropriato e non creare globali generiche.

Metodo di lavoro richiesto:
1. crea un piano breve basato sulle fasi A–E della specifica;
2. implementa e testa la vertical slice end-to-end prima di moltiplicare i contenuti;
3. aggiungi test unitari per sim, sensore, AST, interprete, generatori e salvataggi;
4. aggiungi test di integrazione per menu, missioni, debugging, stelle e import/export;
5. esegui il controllo sintattico di tutti i file e la suite completa;
6. prova visivamente desktop e tablet e correggi sovrapposizioni o controlli inaccessibili;
7. aggiorna README.md con i nuovi file e l’uso del gioco;
8. alla consegna indica chiaramente ciò che è completo, i test eseguiti e qualsiasi parte ancora non verificata su Arduino reale.

Skill suggerite per la sessione:
- browser:control-in-app-browser, per collaudare l’interfaccia e il flusso locale;
- imagegen soltanto se servono nuovi asset raster originali e non bastano canvas/CSS/asset esistenti.

Non fermarti a uno scheletro di interfaccia: una fase è conclusa solo quando il relativo flusso è giocabile e verificato. Non dichiarare l’esportazione “pronta per Arduino” finché gli sketch rappresentativi non compilano e schema/pin/codice non coincidono.
```

---

## 24. Riepilogo delle decisioni approvate

- simulazione completa con Arduino reale opzionale;
- principiante assoluto, 7–9 anni;
- blocchi visuali con codice Arduino affiancato;
- montaggio guidato progressivo;
- primo e unico sistema sensoriale v1: HC-SR04 su servo;
- officina isometrica e pista dall'alto;
- missioni progressive più laboratorio libero;
- veicolo di soccorso in una città futura;
- kit Arduino Uno 2WD standard con varianti limitate;
- pin reali e cablaggio assistito;
- misure reali spiegate visivamente;
- programmi inizialmente incompleti, poi liberi;
- debugging con rallentatore, evidenziazione e riavvolgimento;
- tre stelle indipendenti;
- 12 missioni in quattro capitoli;
- sensore inizialmente fisso, poi orientato da servo;
- due viste del codice;
- scheda stampabile, elenco pezzi, schema e `.ino`;
- avvisi di sicurezza integrati;
- Gibi copilota e tre indizi progressivi;
- sandbox con editor di piste e programmi;
- italiano con termini tecnici Arduino autentici;
- lettura integrata, senza quiz separati;
- stile giocattolo con componenti realistici;
- ESEGUI, PAUSA e PASSO-PASSO;
- cruscotto semplice o tecnico a scelta;
- computer-first, tablet compatibile;
- salvataggio locale ed esportazione file;
- tre pannelli desktop ridimensionabili;
- suoni funzionali e musica discreta;
- ostacoli fissi all'inizio, variabili alla fine;
- ricompense funzionali ed estetiche;
- titolo “Gibi Rescue: l’Auto Intelligente”;
- gioco autonomo e subito accessibile;
- nessuna sezione separata per adulti;
- accessibilità essenziale sempre presente;
- AA ricaricabili + USB come alimentazione consigliata;
- collegamento diretto browser/Arduino rinviato;
- fisica differenziale semplificata ma corretta;
- finale: consegna di una batteria a un robot;
- selezione missioni tramite mappa della città.
