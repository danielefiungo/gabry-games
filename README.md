# I Giochi delle Parole 🚀🐝

Gioco per imparare a leggere con più modalità, tra cui **Il Labirinto** con mappa-avventura FPV, **La Palla di Api**, **Missione Spaziale**, **Volo Planetario**, **Il Sistema Solare** (planetario 3D con la fisica vera) e **Gibi Rescue**, un percorso in 12 missioni per costruire e programmare un’auto Arduino simulata.

## Struttura dei file

| File | Cosa contiene | Quando modificarlo |
|---|---|---|
| `index.html` | La pagina: schermate, pulsanti, overlay | Per aggiungere elementi all'interfaccia |
| `css/stile.css` | Tutti gli stili (colori, font, dimensioni) | Per cambiare l'aspetto grafico |
| `js/domande.js` | **Le domande dei livelli** (`THEMES`): temi, domande facili/difficili, risposte | ⭐ Per aggiungere o correggere domande |
| `js/sfide.js` | Le sfide del Guardiano (boss): frasi da leggere, domande, parole nuove | ⭐ Per cambiare le sfide di fine livello |
| `js/testi.js` | I testi dell'interfaccia in italiano e inglese (`UI`) | Per cambiare messaggi ed elogi |
| `js/audio-voce.js` | Suoni, sintesi vocale e karaoke | Raramente |
| `js/musica.js` | Motore musicale, 11 brani con ritornelli, pannello 🎵 (scelta brano + volume) | Per aggiungere o ritoccare un brano |
| `js/labirinto-3d.js` | Motore 3D: labirinto, grafica, controlli, salvataggi | Raramente |
| `js/gioco-labirinto.js` | Logica del labirinto: domande, vite, boss, vittoria, menu | Per cambiare le regole del gioco |
| `js/scelta-gioco.js` | La schermata di scelta del gioco (registro delle modalità) | Per aggiungere nuove modalità |
| `js/palla-api.js` | Modalità "La Palla di Api": esploratori, palla a 46°C, difese sbloccabili con le domande | Per modificare la seconda modalità |
| `js/saturn-v-3d.js` | Saturn V, stadi separabili e moduli Apollo in 3D | Per cambiare i veicoli e il rendering |
| `js/apollo-launch-site.js` | Complesso di lancio, bracci e fumo | Per cambiare la rampa |
| `js/apollo-lunar.js` | LEM a due moduli e superficie lunare | Per cambiare allunaggio e risalita |
| `js/missione-spaziale.js` | Modalità "Missione Spaziale": ordini scritti dalla base, plancia, carburante, imprevisti, quiz dell'astronauta | Per modificare la terza modalità |
| `js/mappa-avventura-3d.js` | Mappa FPV del labirinto: strade, cartelli, incroci e portali dei livelli | Per cambiare il percorso tra i livelli |
| `js/mappa-spazio.js` | `EDGES` (rete dei livelli) + modalità "Il Sistema Solare": planetario 3D con orbite kepleriane vere e schede dei pianeti | Per correggere dati astronomici o l'aspetto dei pianeti |
| `js/volo-planetario.js` | Mini-gioco FPV di avvicinamento e atterraggio planetario | Per cambiare destinazioni, fisica e curiosità |
| `js/gibi-rescue-data.js` | Kit Arduino, blocchi, testi e dati delle 12 missioni | Per cambiare contenuti e progressione di Gibi Rescue |
| `js/gibi-rescue-sim.js` | Fisica differenziale, collisioni, sensore HC-SR04 e servo | Per cambiare la simulazione dell’auto |
| `js/gibi-rescue-code.js` | AST, interprete e generatori Codice di Gabri/Arduino | Per cambiare il significato dei blocchi o il codice esportato |
| `js/gibi-rescue.js` | Mappa, editor, interfaccia, salvataggi, sandbox ed esportazione | Per cambiare l’esperienza di Gibi Rescue |
| `js/macchina-parole-data.js` | Capitoli, documenti della Stazione Aurora, quiz e glossario | Per cambiare i contenuti didattici della Macchina delle Parole |
| `js/macchina-parole-model.js` | Tokenizzatori reali e predittore a conteggio ispezionabile | Per cambiare i modellini linguistici dei Capitoli 1 e 2 |
| `js/macchina-parole.js` | Diorama, capitoli, stelle, accessibilità, salvataggi e Taccuino | Per cambiare l’esperienza della Macchina delle Parole |

L'ordine dei tag `<script>` in `index.html` **non va cambiato**: i file si caricano in sequenza e dipendono l'uno dall'altro.

## Come aggiungere una domanda

In `js/domande.js`, ogni voce ha questo formato (`[italiano, inglese]`):

```js
{q:["Domanda?","Question?"], ok:["Risposta giusta","Right answer"],
 no:[["Sbagliata 1","Wrong 1"],["Sbagliata 2","Wrong 2"]],
 ...}
```

Aggiungi la voce nella lista `easy` o `hard` del tema che preferisci, ricordando la virgola tra una voce e l'altra.

## Come provarlo in locale

### Bozze tastiera: Gibi ai comandi e Apollo ai comandi

**Gibi ai comandi** propone sei missioni con una tastiera fisica QWERTY. In **Apollo ai comandi**, le sei missioni originali restano nella sezione espandibile **Allenamenti della tastiera**, con i progressi conservati. Il percorso parte da F/J, aggiunge lettere vicine, poi altre file, tutto l’alfabeto e sequenze di tre lettere. Tutte le missioni sono selezionabili per facilitare le prove; i completamenti sono salvati separatamente sul dispositivo. Gli esercizi non hanno un conto alla rovescia né penalità per gli errori; rimane il timer globale della sessione.

La mappa dei tasti evidenzia subito la lettera nel primo livello e dopo quattro secondi nei successivi. **Mostra il tasto** e **Ascolta** danno aiuto; **Esc** torna alle missioni e poi ai giochi. Lettere maiuscole e minuscole sono equivalenti. Le scene sono illustrazioni semplificate: Gibi si riattiva e si muove, Apollo passa dalla rampa all’ammaraggio.

File: `js/tastiera.js`, `css/tastiera.css`. Verifica: `node --test test/test-tastiera.js`.

### Avventura lunare: Un razzo per tornare a casa

Apri **Apollo ai comandi → Parti per l’avventura**. Una missione di fantasia in tre parti: esplora crateri, rocce e passerelle, recupera antenna/batteria/portello, montali sul razzo e attraversa quattro varchi fra i detriti per tornare sulla Terra. La visuale è **3D in prima persona (FPV)**: casco e guanti sulla Luna, agganci ravvicinati per le riparazioni, cabina durante decollo e volo. Il tasto corretto muove automaticamente la visuale; non servono mouse o comandi di direzione. Le **26 azioni** usano soltanto **F, J, D, K**, una lettera alla volta. Durata indicativa 3–4 minuti per chi cerca i tasti; nessun limite alla missione.

La lettera è sull’ostacolo, sul riparo o accanto al punto di montaggio. La fila centrale evidenzia sempre il tasto. **Spazio** mette in pausa e riprende, **Invio** ascolta la consegna mettendo al sicuro il gioco, **Esc** torna al menu. Si può giocare senza mouse. Il primo meteorite concede 36 secondi, i successivi 27 e 22; i varchi in volo 18. Dopo l’avvicinamento iniziale i pericoli rallentano molto. Una collisione attiva la bolla protettiva e ripropone lo stesso ostacolo con più tempo, senza perdere pezzi. Le animazioni riuscite sono protette da collisioni e pressioni aggiuntive.

Pausa automatica quando la finestra perde il focus, la scheda viene nascosta o compare l’avviso del timer globale; si riparte esplicitamente con Spazio. Il timer di sessione continua a funzionare normalmente. Uscendo e rientrando **nella stessa pagina**, “Riprendi l’avventura” conserva l’ultimo passo e i pezzi. Ricaricare la pagina ricomincia la missione; il completamento finale viene salvato separatamente dagli allenamenti. Alla vittoria si può rigiocare.

Il paesaggio mantiene coordinate continue durante la traversata: crateri scavati nella superficie, impronte, segnaletica e habitat con pannelli solari. Guanti articolati, componenti con agganci e cavi, avvitatore e connettore hanno animazioni distinte; le spie indicano i collegamenti completati. Il razzo resta nello stesso punto durante tutte le riparazioni.

File: `js/avventura-lunare-world.js` (terreno e coordinate), `js/avventura-lunare-art.js` (modelli, texture e materiali condivisi), `js/avventura-lunare-model.js` (stato e collisioni), `js/avventura-lunare.js` (controlli), `js/avventura-lunare-fpv.js` (scena 3D, camera e rilascio delle risorse), `css/avventura-lunare.css`. Usa Three.js già caricato dal progetto; richiede WebGL. Terreno, oggetti e texture sono generati localmente, senza nuovi asset esterni. La preferenza di sistema per movimento ridotto elimina oscillazioni e inclinazioni decorative. Verifica:

```sh
node --test test/test-avventura-lunare.js test/test-tastiera.js test/test-timer-globale.js test/test-missione-spaziale.js
```

### Avvio

Basta aprire `index.html` nel browser. Se qualcosa non carica, avvia un piccolo server:

```
python3 -m http.server
```

e apri http://localhost:8000

## Pubblicazione

Il gioco è statico: carica **tutti i file e le cartelle** (index.html, css/, js/) su GitHub Pages, Netlify o simili.

Il nome del giocatore viene chiesto al primo avvio e salvato sul dispositivo (localStorage).

## Gibi Rescue

Dal selettore principale scegli **Gibi Rescue**. Le prime missioni guidano il montaggio, poi si usano blocchi grandi per movimento, sensore e decisioni. Il pannello **Capire** alterna cruscotto semplice/tecnico, Codice di Gabri e Arduino vero. I tasti rapidi durante una prova sono `Spazio` (esegui), `P` (pausa), `R` (riavvolgi) ed `Esc` (mappa).

Il laboratorio libero permette di salvare più progetti sul dispositivo, importare/esportare `.gibi-rescue.json`, scaricare uno sketch `.ino` e stampare la scheda con componenti, pin e avvisi di sicurezza. Il gioco non carica direttamente il programma su Arduino e funziona senza hardware.

Test del nuovo gioco:

```sh
node --test test/test-gibi-rescue.js
```

## Il Sistema Solare

Dal selettore principale scegli **Il Sistema Solare**: non è un gioco, è un planetario da esplorare. Toccando un pianeta si apre la sua scheda con i dati veri (giorno, anno, gravità, temperatura, inclinazione dell'asse, lune), il pulsante 🔊 per farsela leggere e l'accesso al livello del Labirinto o alla sua letturina.

Cosa è fedele: orbite ellittiche con l'eccentricità reale e il Sole in un fuoco (1ª legge), velocità che cambia lungo l'orbita (2ª legge), periodi dai semiassi veri (3ª legge), orientamento 3D con inclinazione, nodo e perielio J2000, posizioni di partenza calcolate alla data del giorno, periodi di rotazione siderali, inclinazioni assiali vere (Venere e Urano girano al contrario perché sono capovolti), Luna in rotazione sincrona, anelli ai raggi veri con la divisione di Cassini, ISS inclinata di 51,64° sull'equatore terrestre e telescopio Webb in L2.

Cosa non è in scala, e il gioco lo dice: distanze, diametri, orbite dei satelliti terrestri e i due orologi (orbite e rotazioni). Le costanti `SS_*` in cima al file governano solo la resa; i valori misurati in `SS_BODIES` non vanno "aggiustati".

Due viste: **orbite** (predefinita, tutto in movimento) e **pianeti in fila**. La scelta viene ricordata. Con il puntatore sulla mappa le orbite rallentano; il pulsante pausa ferma anche rotazioni, nubi e moto di Webb.

La barra inferiore permette di scegliere tutti i 13 corpi: la camera si avvicina al pianeta e la scheda mostra subito curiosità, ascolto e letturina. Il pulsante ◎ o Esc riporta alla panoramica; +/−, rotella e pizzico regolano lo zoom. Inquadratura e schede si adattano anche al telefono. Le superfici procedurali sono a 1024×512, con rilievo dei corpi rocciosi, nubi terrestri separate, bordi atmosferici e ombra del globo sugli anelli. I pianeti mantengono i loro colori anche quando il livello è bloccato. Lo stile del planetario è in `css/sistema-solare.css`.

```sh
node test/test-sistema-solare.js     # richiede: npm install jsdom
```

## La Macchina delle Parole

Il Capitolo 1 nella **Stazione Aurora** fa pulire il corpus, proteggere dati personali e provenienza, aggiungere varietà e usare un vero predittore a conteggio. Il Capitolo 2, **Il Tagliatore di token**, confronta parole intere, caratteri e sottoparole, poi fa costruire un vocabolario riutilizzabile. Token, dimensione del vocabolario e lunghezza della sequenza sono calcolati dal testo e dalle tessere scelte e restano ispezionabili in **Guarda dentro**. Ogni capitolo parte con una guida in quattro pagine, leggibile manualmente o automaticamente dal TTS; le guide successive sono consultabili dalla mappa.

Test del modellino linguistico:

```sh
node --test test/test-macchina-parole.js
```

## Missione Spaziale — Apollo

La missione segue Apollo verso la Luna in sette capitoli e 42 ordini, oltre ai messaggi buffi e agli imprevisti. I tempi sono compressi per il gioco di lettura.

1. Checklist e decollo con Saturn V.
2. Separazione del primo e del secondo stadio durante la salita.
3. Il terzo stadio S-IVB entra in orbita e si riaccende verso la Luna. Apollo si separa, si gira, aggancia il LEM ed estrae il modulo lunare; il terzo stadio vuoto si allontana.
4. Il CSM (modulo di comando e servizio) resta in orbita lunare mentre il LEM scende sulla superficie.
5. Il modulo di discesa del LEM rimane sulla Luna. Quello di risalita si riaggancia al CSM; astronauti e campioni rientrano a bordo prima dello sgancio del LEM vuoto.
6. Il modulo di servizio resta con Apollo fino alla separazione comandata prima del rientro. Solo il modulo di comando rientra e apre i tre paracadute.

Apollo usa celle a combustibile e batterie, senza pannelli solari; questa missione non visita la ISS. La torre del gioco è senza gru per scelta grafica richiesta, anche se la torre storica Apollo aveva una gru in cima.

Il gioco ricostruisce i moduli corretti anche quando si ripete una fase. Test: `node --test test/test-missione-spaziale.js`.
