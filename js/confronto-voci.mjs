const $ = id => document.getElementById(id);
const engines = ['paola', 'supertonic'];
const examples = {
  saluto: 'Ciao Gabriele! Il razzo è pronto. Leggi con calma e scegli la risposta giusta.',
  parole: 'Sole.',
  suoni: 'Lo gnomo raccoglie le castagne. Il coniglio salta sull’erba. La scimmia guarda la luna.',
  missione: 'Accendi i motori del razzo. Ora apri i pannelli solari. Guarda la Terra: è bellissima!',
  storia: 'Gabriele trova una piccola chiave sotto un albero. Poco più avanti c’è una porta azzurra. La apre piano e scopre una stanza piena di stelle. «Benvenuto, esploratore!» dice una voce gentile.'
};
const workers = new Map(), urls = new Map();
let busy = false, cancelPending = null, run = 0;

function setBusy(value) {
  busy = value;
  for (const id of ['compare', 'generate-paola', 'generate-supertonic', 'text', 'example', 'voice']) $(id).disabled = value;
  $('stop').disabled = !value;
}
function status(engine, message, error = false) {
  const element = $(`status-${engine}`);
  element.textContent = message;
  element.dataset.error = String(error);
}
function stopAudio() {
  engines.forEach(engine => $(`audio-${engine}`).pause());
}
function cancel() {
  run++;
  stopAudio();
  cancelPending?.();
  cancelPending = null;
  setBusy(false);
  $('global-status').textContent = 'Prova interrotta. Puoi ripartire quando vuoi.';
}

function generate(engine, text, voice) {
  return new Promise((resolve, reject) => {
    let worker = workers.get(engine);
    if (!worker) {
      worker = new Worker(new URL('./confronto-voci-worker.mjs', import.meta.url), { type: 'module' });
      workers.set(engine, worker);
    }
    const progress = $(`progress-${engine}`);
    progress.hidden = false;
    progress.removeAttribute('value');
    status(engine, 'Preparo la voce…');
    const cleanup = () => {
      clearTimeout(timeout);
      worker.onmessage = null;
      worker.onerror = null;
      progress.hidden = true;
      cancelPending = null;
    };
    const abort = (message, name = 'Error') => {
      cleanup();
      worker.terminate();
      workers.delete(engine);
      status(engine, message, name !== 'AbortError');
      const error = new Error(message);
      error.name = name;
      reject(error);
    };
    const timeout = setTimeout(() => abort('La preparazione sta impiegando troppo tempo. Controlla la connessione e riprova.'), 300000);
    cancelPending = () => abort('Interrotto', 'AbortError');
    worker.onerror = event => abort(event.message || 'Impossibile avviare la voce in questo browser.');
    worker.onmessage = ({ data }) => {
      if (data.type === 'status') {
        status(engine, data.message);
        if (Number.isFinite(data.progress)) { progress.max = 100; progress.value = data.progress; }
        else progress.removeAttribute('value');
      } else if (data.type === 'error') {
        abort(data.message);
      } else if (data.type === 'result') {
        cleanup();
        resolve(data);
      }
    };
    worker.postMessage({ engine, text, voice });
  });
}

function showResult(engine, result, text, voice) {
  const audio = $(`audio-${engine}`);
  audio.pause();
  if (urls.has(engine)) URL.revokeObjectURL(urls.get(engine));
  const url = URL.createObjectURL(result.blob);
  urls.set(engine, url);
  audio.src = url;
  audio.playbackRate = Number($('speed').value);
  $(`download-${engine}`).href = url;
  $(`quote-${engine}`).textContent = text;
  $(`result-${engine}`).hidden = false;
  const label = engine === 'paola' ? 'Paola medium' : `Supertonic 3 · ${voice} · 8 passaggi`;
  const metrics = `${label} · WebAssembly\nPreparazione: ${(result.preparationMs / 1000).toFixed(2)} s · Generazione: ${(result.generationMs / 1000).toFixed(2)} s`;
  $(`metrics-${engine}`).textContent = metrics;
  audio.onloadedmetadata = () => {
    audio.playbackRate = Number($('speed').value);
    $(`metrics-${engine}`).textContent = metrics + ` · Audio a 1×: ${audio.duration.toFixed(1)} s`;
  };
  status(engine, 'Audio pronto · premi Play per ascoltare');
}

async function start(selected) {
  if (busy) return;
  const text = $('text').value.trim(), voice = $('voice').value;
  if (!text) { $('global-status').textContent = 'Scrivi una parola o una frase da ascoltare.'; $('text').focus(); return; }
  stopAudio();
  setBusy(true);
  const current = ++run;
  let failed = 0;
  $('global-status').textContent = 'Preparo il confronto. Il primo caricamento può richiedere qualche minuto.';
  try {
    for (const engine of selected) {
      try {
        const result = await generate(engine, text, voice);
        if (current !== run) return;
        showResult(engine, result, text, voice);
      } catch (error) {
        if (current !== run || error.name === 'AbortError') return;
        failed++;
        status(engine, `Non disponibile: ${error.message}`, true);
      }
    }
    $('global-status').textContent = failed ? 'Una voce non è riuscita a generare l’audio. Puoi riprovarla con il suo pulsante.' : 'Audio pronto. Ascolta le due voci e prova anche a cambiare velocità.';
  } finally {
    if (current === run) setBusy(false);
  }
}

$('compare').onclick = () => start(engines);
for (const engine of engines) {
  $(`generate-${engine}`).onclick = () => start([engine]);
  $(`audio-${engine}`).onplay = () => engines.filter(other => other !== engine).forEach(other => $(`audio-${other}`).pause());
}
$('stop').onclick = cancel;
$('speed').onchange = () => engines.forEach(engine => { $(`audio-${engine}`).playbackRate = Number($('speed').value); });
function edited() {
  $('count').textContent = `${$('text').value.length} / 600`;
  if (urls.size) $('global-status').textContent = 'Genera di nuovo per ascoltare le modifiche. I lettori conservano il testo della prova precedente.';
}
$('example').onchange = () => { $('text').value = examples[$('example').value]; edited(); };
$('text').oninput = edited;
$('voice').onchange = edited;
edited();
if (location.protocol === 'file:' || !window.isSecureContext || !window.Worker) {
  setBusy(true);
  $('stop').disabled = true;
  $('global-status').textContent = 'Apri questa pagina da localhost o da un sito HTTPS per caricare le voci. Per esempio: http://localhost:8000/confronto-voci.html';
}
window.addEventListener('pagehide', () => {
  cancel();
  workers.forEach(worker => worker.terminate());
  workers.clear();
});
