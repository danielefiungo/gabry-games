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
