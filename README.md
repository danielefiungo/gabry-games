# I Giochi delle Parole 🚀🐝

Gioco per imparare a leggere, con due modalità: **Il Labirinto** (3D) e **Difendi l'Alveare**.

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
| `js/alveare.js` | Modalità "Difendi l'Alveare" + schermata di scelta del gioco | Per modificare la seconda modalità |

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
