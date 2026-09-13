# L'Officina di Gabri 🔧 — concept (luglio 2026)

Nuova famiglia di modalità STEM: il concetto È il gameplay, la lettura è di contorno
(consegne scritte brevi + 🔊 senza penalità, schede "Lo sapevi?" vere).
Struttura: livelli guidati progressivi + sandbox libera con tutto ciò che è sbloccato.

## Cornice narrativa
Gabriele trova in officina **Gibi (GB-7)**, un robottino spento. Ogni banco di lavoro
ripara una parte di Gibi:

| Banco | Modalità | Parte di Gibi | Concetto |
|---|---|---|---|
| ⚡ 1 | Circuiti elettrici | il CUORE | corrente, componenti reali |
| 💡 2 | Porte logiche | gli OCCHI/riflessi | AND, OR, NOT, XOR |
| 🤖 3 | Programmazione | le GAMBE | sequenze, ripeti, se |
| 🧠 4 | Macchina di Turing | la MENTE | regole + nastro = calcolo |

La progressione è "come è fatto un computer", dal basso: elettroni → componenti →
logica → programmi → macchina universale. I banchi 2-4 si sbloccano completando
alcuni livelli del precedente (ma restano visitabili liberamente dal menu officina).

## Banco 1 — ⚡ Circuiti (il Cuore di Gibi) — DA IMPLEMENTARE ORA
Banco a griglia: si trascinano componenti sulle celle e si tracciano fili col dito.
**Gli elettroni sono palline gialle animate** che scorrono nel circuito chiuso:
velocità/densità ∝ corrente vera (piccolo solver nodale: serie/parallelo corretti).

Componenti (sbloccati livello per livello):
- **Pila** 4.5V — la pompa che spinge gli elettroni
- **Filo** — il tubo
- **Lampadina** — robusta, luminosità ∝ potenza (in serie diventano fioche!)
- **Interruttore** — cancello tocca-per-aprire/chiudere
- **LED** — un solo verso (freccia), delicato: troppa corrente → PUFF! fumetto
- **Resistenza** — strettoia che rallenta le palline (protegge il LED)
- **Condensatore** — secchiello che si riempie di elettroni e li rilascia
- **Transistor** — rubinetto: una corrente piccolina apre una strada grande
- Sandbox extra: buzzer 🔔, motore-ventola 🌀, sensore di luce (LDR) ☀️/🌙

Livelli (~10): 1 chiudi il cerchio → 2 interruttore → 3 ripara il filo rotto →
4 LED nel verso giusto → 5 PUFF! serve la resistenza → 6 due lampadine in serie
(fioche, perché?) → 7 parallelo (brillanti!) → 8 condensatore: la luce che resta
accesa → 9 transistor: l'interruttorino comanda il motorone → 10 luce notturna
automatica (LDR + transistor, slider sole/notte). Poi sandbox.

Stelle: 3⭐ = livello risolto senza bruciare LED e senza "Aiutino" (soluzione
fantasma). Il 🔊 sulla consegna NON penalizza. "Lo sapevi?" dopo ogni livello.

## Banco 2 — 💡 Porte logiche (gli Occhi)
Le porte usano i **simboli standard ANSI**: AND a D, OR curvo, NOT triangolare con
il pallino d’inversione e XOR con la doppia curva. Il nome resta scritto dentro al
simbolo per aiutare l’apprendimento. Segnale = filo che si illumina e i fili sono
agganciati visivamente ai morsetti di leve, porte e uscite. Dopo le porte singole,
i collegamenti diventano visibili in una serie di applicazioni: allarme della porta,
mini-sommatore, porta automatica con sensore di sicurezza, voto a maggioranza di
tre sensori e sommatore completo. Gli ultimi livelli usano tre ingressi e mostrano
anche i valori intermedi, per far vedere come blocchi semplici costruiscono una
funzione più avanzata.
Livello-cerniera col Banco 1: si collega la logica ai transistor del banco elettrico.

## Banco 3 — 🤖 Programmazione (le Gambe)
Gibi cammina su una griglia; si compongono **blocchi trascinabili con nome scritto**
(AVANTI, GIRA, SALTA, RIPETI n, SE muro). Esecuzione passo-passo col blocco corrente
evidenziato: si vede il programma "camminare". Livelli stile accendi-le-mattonelle,
con vincolo "pochi blocchi" che spinge verso RIPETI (3⭐ = soluzione corta).

## Banco 4 — 🧠 Macchina di Turing (la Mente)
"Il trenino delle regole": Gibi su un **nastro di caselle** (🔴🔵⬜) con carte-regola
visuali: «SE vedo 🔴 → scrivo 🔵, vado a destra ➡️, passo alla carta 2». Si dispone
il mazzetto di carte e si preme via: la macchina fa da sola. Livelli: colora tutto,
inverti i colori, porta il tesoro alla fine, aggiungi 1 pallino a una fila (contare!).
Messaggio finale: con carte semplici la macchina può fare qualsiasi cosa — è così
che pensa un computer.

## Note tecniche
- Un file per banco: `js/officina-circuiti.js`, `officina-logica.js`,
  `officina-robot.js`, `officina-turing.js` + hub leggero `officina.js` (menu banchi,
  stato Gibi, stelle). registerGame('officina') in scelta-gioco.js via index.html.
- Salvataggi localStorage `gabri_off_*`. Test hook `window.__OF`.
- Costanti di tuning in cima a ogni file (stile PA_*/MS_*).

## Banco 1 — missioni aggiunte 11–15 (settembre 2026)

11. **Il campanello di Gibi**: inserire il cicalino, riparare due fili diagonali e chiudere l’interruttore.
12. **Le due chiavi**: riparare due collegamenti e chiudere due interruttori in serie; uno solo non basta.
13. **La cabina di comando**: riparare due rami in parallelo e dimostrare, in ordine, motore solo, luce sola e entrambi accesi.
14. **I due fari protetti**: una resistenza per ciascun LED in parallelo, correzione del verso di un LED e accensione senza bruciature.
15. **La riserva di Gibi**: caricare un condensatore e scollegare la pila; la riserva deve alimentare il motore per almeno 0,9 secondi.

Le missioni 13 e 15 mostrano le prove da completare sotto la consegna. Una prova
vale solo dopo aver mantenuto il risultato per il tempo richiesto. RIFAI e ANNULLA
azzerano la sequenza di verifica. Tutti i livelli hanno consegne e spiegazioni in
italiano e inglese e una soluzione fantasma per l’aiuto. Il totale è 45 stelle;
i vecchi salvataggi che hanno completato il livello 10 sbloccano subito l’11.

## Piccoli ingegneri — percorso separato (settembre 2026)

Il selettore del Banco 1 distingue **Primi passi** (i 15 livelli esistenti) e
**Piccoli ingegneri** (4 esperimenti, tutti accessibili da subito). I salvataggi
restano separati: `gabri_off_c` per i primi passi, `gabri_off_c_labs` per i nuovi
esperimenti, con un massimo di 12 stelle nel secondo percorso.

Ogni esperimento inizia con un esempio spiegato in tre passaggi e una previsione
a scelta multipla. Una risposta errata dà una spiegazione e permette di riprovare
senza perdere stelle. Dopo la previsione corretta si passa al circuito: ciascuna
prova deve mantenere la condizione richiesta, in ordine. La consegna indica il
passaggio corrente. Il pulsante **Esempio** riapre la spiegazione senza azzerare
il lavoro. I testi e la lettura ad alta voce sono disponibili in italiano e inglese.

1. **Due pulsanti, un campanello**: costruire due vie alternative e verificare OR
   nei quattro casi (solo A, solo B, entrambi, nessuno).
2. **Una casa, due luci indipendenti**: completare i rami in parallelo e collaudare
   entrambe le luci, cucina sola, camera sola e spegnimento totale.
3. **Quanto dura la riserva?**: osservare tensione, carica, alimentazione senza
   pila, esaurimento e ricarica del condensatore; nessuna vittoria lasciando
   semplicemente la pila collegata.
4. **Il lampione col permesso**: combinare sensore, transistor, resistenza e
   interruttore; verificare giorno, notte, stop manuale, riaccensione e alba.

I nuovi esperimenti non mostrano automaticamente le sagome dei pezzi da inserire:
la soluzione fantasma resta disponibile tramite **Aiuto**, con la normale regola
delle stelle. RIFAI ripropone la previsione; ANNULLA azzera le verifiche del circuito
conservando la previsione già compresa. Test: `node test/test-officina-esperimenti.js`.
