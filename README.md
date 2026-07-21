# I Giochi delle Parole 🚀🐝

Gioco per imparare a leggere con più modalità, tra cui **Il Labirinto** con mappa-avventura FPV, **La Palla di Api**, **Missione Spaziale**, **Volo Planetario** e **Gibi Rescue**, un percorso in 12 missioni per costruire e programmare un’auto Arduino simulata.

## Struttura dei file

| File | Cosa contiene | Quando modificarlo |
|---|---|---|
| `index.html` | La pagina: schermate, pulsanti, overlay | Per aggiungere elementi all'interfaccia |
| `css/stile.css` | Tutti gli stili (colori, font, dimensioni) | Per cambiare l'aspetto grafico |
| `js/domande.js` | **Le domande dei livelli** (`THEMES`): temi, domande facili/difficili, risposte | ⭐ Per aggiungere o correggere domande |
| `js/sfide.js` | Le sfide del Guardiano (boss): frasi da leggere, domande, parole nuove | ⭐ Per cambiare le sfide di fine livello |
| `js/testi.js` | I testi dell'interfaccia in italiano e inglese (`UI`) | Per cambiare messaggi ed elogi |
| `js/audio-voce.js` | Suoni, musica, sintesi vocale e karaoke | Raramente |
| `js/labirinto-3d.js` | Motore 3D: labirinto, grafica, controlli, salvataggi | Raramente |
| `js/gioco-labirinto.js` | Logica del labirinto: domande, vite, boss, vittoria, menu | Per cambiare le regole del gioco |
| `js/scelta-gioco.js` | La schermata di scelta del gioco (registro delle modalità) | Per aggiungere nuove modalità |
| `js/palla-api.js` | Modalità "La Palla di Api": esploratori, palla a 46°C, difese sbloccabili con le domande | Per modificare la seconda modalità |
| `js/missione-spaziale.js` | Modalità "Missione Spaziale": ordini scritti dalla base, plancia, carburante, imprevisti, quiz dell'astronauta | Per modificare la terza modalità |
| `js/mappa-avventura-3d.js` | Mappa FPV del labirinto: strade, cartelli, incroci e portali dei livelli | Per cambiare il percorso tra i livelli |
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

## La Macchina delle Parole

Il Capitolo 1 nella **Stazione Aurora** fa pulire il corpus, proteggere dati personali e provenienza, aggiungere varietà e usare un vero predittore a conteggio. Il Capitolo 2, **Il Tagliatore di token**, confronta parole intere, caratteri e sottoparole, poi fa costruire un vocabolario riutilizzabile. Token, dimensione del vocabolario e lunghezza della sequenza sono calcolati dal testo e dalle tessere scelte e restano ispezionabili in **Guarda dentro**. Ogni capitolo parte con una guida in quattro pagine, leggibile manualmente o automaticamente dal TTS; le guide successive sono consultabili dalla mappa.

Test del modellino linguistico:

```sh
node --test test/test-macchina-parole.js
```
