// Each voice has its own worker: generation stays off the UI thread.
const PAOLA = 'it_IT-paola-medium';
const SUPER_BASE = 'https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46';
let piper, helper, superTTS;
const styles = new Map();
const report = (message, progress) => self.postMessage({ type: 'status', message, progress });

// Cache only immutable Supertonic assets. Piper already caches its models in OPFS.
const networkFetch = self.fetch.bind(self);
self.fetch = async (input, options) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url?.startsWith(SUPER_BASE + '/') || (options?.method && options.method !== 'GET')) return networkFetch(input, options);
  let cache;
  try {
    cache = await caches.open('gabri-voice-lab-supertonic-v3');
    const hit = await cache.match(url);
    if (hit) return hit;
  } catch { /* Private browsing or quota limits must not prevent synthesis. */ }
  const response = await networkFetch(input, options);
  if (!response.ok) throw new Error(`Download Supertonic: HTTP ${response.status}`);
  if (cache) {
    try { await cache.put(url, response.clone()); } catch { /* Continue without persistent cache. */ }
  }
  return response;
};

async function prepare(engine, voice) {
  if (engine === 'paola') {
    if (!piper) {
      report('Scarico e preparo Paola…');
      const module = await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm');
      module.PATH_MAP[PAOLA] = 'it/it_IT/paola/medium/it_IT-paola-medium.onnx';
      await module.download(PAOLA, ({ loaded, total }) => {
        const percent = total ? Math.round(loaded / total * 100) : undefined;
        report(`Scarico Paola${percent === undefined ? '…' : ` · ${percent}%`}`, percent);
      });
      piper = module;
    }
  } else {
    if (!helper) helper = await import('./vendor/supertonic/helper.mjs');
    if (!superTTS) {
      const result = await helper.loadTextToSpeech(`${SUPER_BASE}/onnx`, {
        executionProviders: ['wasm'], graphOptimizationLevel: 'all'
      }, (name, current, total) => report(`Preparo Supertonic · modello ${current}/${total}…`));
      superTTS = result.textToSpeech;
    }
    if (!styles.has(voice)) {
      report(`Preparo il timbro ${voice}…`);
      styles.set(voice, await helper.loadVoiceStyle([`${SUPER_BASE}/voice_styles/${voice}.json`]));
    }
  }
}

self.onmessage = async ({ data }) => {
  const { engine, text, voice } = data;
  try {
    if (!['paola', 'supertonic'].includes(engine) || !text?.trim() || text.length > 600) throw new Error('Inserisci da 1 a 600 caratteri.');
    if (engine === 'supertonic' && !/^[FM][1-5]$/.test(voice)) throw new Error('Timbro non valido.');
    const start = performance.now();
    await prepare(engine, voice);
    const ready = performance.now();
    report('Genero la voce…');
    let blob;
    if (engine === 'paola') {
      blob = await piper.predict({ text, voiceId: PAOLA });
    } else {
      // Generate at natural speed; both players share the same playback-rate control.
      const { wav, duration } = await superTTS.call(text, 'it', styles.get(voice), 8, 1, 0.3,
        (step, total) => report(`Genero Supertonic · passaggio ${step}/${total}…`));
      const samples = wav.slice(0, Math.floor(superTTS.sampleRate * duration[0]));
      blob = new Blob([helper.writeWavFile(samples, superTTS.sampleRate)], { type: 'audio/wav' });
    }
    if (!blob || blob.size <= 44) throw new Error('Il modello ha prodotto un audio vuoto. Riprova.');
    self.postMessage({ type: 'result', blob, preparationMs: ready - start, generationMs: performance.now() - ready });
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || String(error) });
  }
};
