# Prompt: costruisci la modalità "Missione Spaziale: ordini dalla base" 🚀

Copia tutto quello che segue in una nuova sessione con accesso alla cartella `GabriGame`.

---

Nel progetto GabriGame (gioco per insegnare a leggere a Gabriele, ~6-7 anni) devi aggiungere una terza modalità di gioco: **Missione Spaziale: ordini dalla base**. Il principio fondante: **leggere È il gameplay**, non un quiz separato. La sala di controllo manda ordini scritti e Gabriele deve leggerli ed eseguirli toccando il pannello giusto.

## Contesto tecnico (rispettalo alla lettera)

- Progetto statico: `index.html` + `css/stile.css` + `js/*.js`, caricati in sequenza con `<script src>`. L'ordine dei tag non va cambiato; aggiungi i tuoi file DOPO `js/scelta-gioco.js`.
- Le modalità si registrano nel selettore iniziale con `registerGame({id, emoji, nm:[it,en], sub:[it,en], colore, enter})` (vedi `js/scelta-gioco.js` e l'esempio completo `js/palla-api.js`).
- Crea UN file nuovo: `js/missione-spaziale.js`. CSS e HTML li inietti da JS (come fa `palla-api.js`: `document.head.appendChild(style)` + `insertAdjacentHTML`), così `index.html` cambia solo per il tag `<script>`. Aggiorna anche la tabella file nel `README.md`.
- Globali già disponibili che DEVI riusare (definiti negli altri file): `$` (getElementById), `LI()` (indice lingua, ora sempre 0=italiano), `NM(s)` (sostituisce {NAME} col nome del bambino), `UI` (testi, es. `UI.praise`, `UI.wrong`, `UI.speakBravo`), `THEMES` (domande per tema, formato `{q:[it,en], ok:[it,en], no:[[it,en],[it,en]]}` nei set `easy`/`hard` — i temi "Razzi Spaziali" e "Missioni Spaziali" sono i più pertinenti), `score` (⭐ condivise, con `save()`), `shuffle`, `speak(testo | [parti])` con karaoke (`{t, el}` evidenzia le parole sull'elemento), `stopSpeak`, `initTTS`, `VOICEON`, `MUSICON`, `playMusic/stopMusic/mCtx`, `TRK_MENU`, `TRK_ROCKET` (usa questa: è la musica dei razzi), suoni `beep/sCorrect/sWrong/sLose/sStar/sToken/fanfare`, `confetti`, `paused` (impostalo a true entrando), `showModeSel()` per uscire.
- All'ingresso della modalità: `if(VOICEON) initTTS(); paused=true;` nascondi `menu`, `modeSel`, `hud`, `joy`; all'uscita richiama `showModeSel()`.
- ATTENZIONE: a volte un'altra sessione lavora sugli stessi file in parallelo. Prima di modificare `index.html` o `README.md`, verifica che siano stabili (stat/md5 ripetuti a distanza di ~30s). Il tuo file nuovo non rischia conflitti.

## Design del gioco

Schermata: in alto il **monitor della base** dove arrivano gli ordini scritti (grandi, font leggibile, lettere ben spaziate); al centro il razzo/la scena che reagisce; in basso la **plancia** con 6-8 pannelli grandi e colorati (MOTORI, CARBURANTE, PARACADUTE, PANNELLI SOLARI, RADIO, OSSIGENO, LUCI, SCUDO TERMICO), ognuno con emoji + etichetta scritta. I pannelli si somigliano apposta: la differenza sta nel testo.

**Loop:** la base invia un ordine scritto (con la voce che lo legge SOLO se Gabriele tocca il 🔊 — e usarlo costa carburante). Gabriele legge e tocca il pannello giusto. Giusto = animazione della scena (i motori si accendono davvero, i pannelli si aprono...), +carburante/avanzamento. Sbagliato = niente punizione dura: il pannello lampeggia rosso, si perde un po' di carburante, si riprova.

**Fasi accurate di una missione vera** (7 fasi = 7 livelli nella stessa partita):
1. Checklist pre-lancio (3-4 ordini: "CHIUDI IL PORTELLO", "CONTROLLA L'OSSIGENO"...)
2. Countdown e decollo (ordine a tempo: "ACCENDI I MOTORI!")
3. Separazione del primo stadio (spiega perché i razzi hanno gli stadi)
4. Orbita (ordini di manovra)
5. Rendez-vous e attracco alla ISS (sequenze: "PRIMA rallenta, POI apri il gancio")
6. Esperimenti a bordo (ordini più lunghi e buffi)
7. Rientro con scudo termico e paracadute (finale col botto: ammaraggio e recupero)

**Difficoltà crescente nella lettura** (questo è il cuore didattico):
- Fase 1-2: ordine = 2-3 parole ("ACCENDI I MOTORI")
- Fase 3-4: frasi con un dettaglio che cambia tutto ("Apri i pannelli SOLARI, non il PARACADUTE")
- Fase 5-6: sequenze di due azioni nell'ordine giusto ("Prima X, poi Y") e negazioni ("NON toccare i motori: apri la radio")
- Fase 7: frasi lunghe sotto un timer generoso
- Ogni tanto un ordine-distrattore da rifiutare: pannello "IGNORA" per i messaggi sciocchi ("Manda una pizza in orbita") — insegna a leggere TUTTO prima di agire.

**Imprevisti (2-3 a partita, casuali):** allarme lampeggiante + 3 procedure scritte tra cui scegliere leggendo (una giusta, due sbagliate ma plausibili). Timer generoso e visibile. Risolto = curiosità vera collegata (perché lo scudo termico si scalda, cos'è l'assenza di peso...). Riusa le domande di THEMES ("Razzi Spaziali", "Missioni Spaziali") tra una fase e l'altra come "quiz dell'astronauta" per guadagnare ⭐ extra: facile +10⭐, difficile +25⭐, dimezzate se si usa la lettura automatica 🔊 o si sbaglia (identico a palla-api.js, funzioni `paQ*` come riferimento).

**Risorsa: il carburante.** Si parte col serbatoio pieno; ordini giusti al primo colpo = bonus carburante; errori e 🔊 lo consumano. Il carburante determina le stelle di fase (3⭐ = nessun errore e niente 🔊). Se finisce, la missione non fallisce brutalmente: si torna alla fase precedente con un messaggio incoraggiante. Vittoria = ammaraggio: riepilogo con ordini letti, imprevisti risolti, stelle per fase, `confetti()` + `fanfare()` + `speak(NM(UI.speakBravo[0]))`.

**Accuratezza:** niente fantasy — fasi, nomi e spiegazioni devono essere veri (stadi, orbita, ISS, scudo termico, ammaraggio). Ogni fase ha una scheda-curiosità breve in italiano semplice, con lettura karaoke gratuita della prima frase (vedi `paShowCard` in palla-api.js).

**Stile visivo:** canvas 2D pupazzoso coerente con palla-api.js (contorni scuri, gradienti, occhioni): razzo con oblò e faccina, Terra che rimpicciolisce durante la salita, stelle e ISS disegnate, fiamme dei motori animate, scossa dello schermo al decollo. La plancia è DOM (bottoni), non canvas.

**Registrazione:** `registerGame({id:'missione', emoji:'🚀', nm:['Missione Spaziale','Space Mission'], sub:['Leggi gli ordini della base e vola!','Read mission control and fly!'], colore:'linear-gradient(180deg,#5c6bc0,#1a237e)', enter:msEnter})`. Prefissa TUTTO con `ms`/`MS_` per evitare collisioni.

## Verifica obbligatoria prima di consegnare

1. `node --check js/missione-spaziale.js`.
2. Test jsdom in Node (vedi il pattern usato per palla-api: stub di canvas `getContext` con Proxy che gestisce `createLinearGradient`/`createRadialGradient` (ritornano `{addColorStop(){}}`), `requestAnimationFrame` stub, script iniettati come elementi `<script>` — NON `window.eval`, altrimenti i `let/const` top-level non diventano globali). Copri: boot col selettore (3 pulsanti), ingresso modalità, ordine giusto/sbagliato, sequenza "prima/poi", imprevisto, quiz con premio dimezzato dopo errore, carburante, fase completata con stelle, vittoria, ritorno al selettore. Aggiungi uno smoke-test che chiama la funzione di disegno in tutti gli stati.
3. Tutte le costanti di tuning (carburante, timer, bonus) in cima al file con commenti.
