# I Giochi delle Parole 🚀🐝

Gioco per imparare a leggere con più modalità, tra cui **Il Labirinto** con mappa-avventura FPV, **La Palla di Api**, **Missione Spaziale** e **Volo Planetario**, un avvicinamento e atterraggio in prima persona con dati e quiz sui mondi del Sistema solare.

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
