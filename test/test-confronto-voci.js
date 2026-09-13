const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function setup(t) {
  const root = path.join(__dirname, '..');
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'confronto-voci.html'), 'utf8'), {
    url: 'http://localhost:8000/confronto-voci.html', runScripts: 'outside-only'
  });
  const w = dom.window, instances = [];
  w.isSecureContext = true;
  w.HTMLMediaElement.prototype.pause = function () {};
  w.URL.createObjectURL = () => 'blob:generated-test-audio';
  w.URL.revokeObjectURL = () => {};
  w.Worker = class {
    constructor() { instances.push(this); }
    postMessage(data) { this.request = data; }
    terminate() { this.terminated = true; }
    reply(data) { this.onmessage?.({ data }); }
  };
  w.eval(fs.readFileSync(path.join(root, 'js/confronto-voci.mjs'), 'utf8')
    .replaceAll('import.meta.url', JSON.stringify('http://localhost:8000/js/confronto-voci.mjs')));
  t.after(() => { w.dispatchEvent(new w.Event('pagehide')); w.close(); });
  const tick = () => new Promise(resolve => setImmediate(resolve));
  const result = { type: 'result', blob: new w.Blob(['audio']), preparationMs: 100, generationMs: 200 };
  return { w, instances, tick, result, $: id => w.document.getElementById(id) };
}

test('il confronto usa lo stesso testo e rende entrambi i lettori riproducibili', async t => {
  const { $, instances, tick, result } = setup(t);
  $('compare').click();
  assert.equal($('text').disabled, true);
  assert.equal(instances[0].request.engine, 'paola');
  const originalText = instances[0].request.text;
  instances[0].reply(result);
  await tick();
  assert.equal(instances[1].request.engine, 'supertonic');
  assert.equal(instances[1].request.text, originalText);
  assert.equal(instances[1].request.voice, 'F1');
  instances[1].reply(result);
  await tick();
  for (const engine of ['paola', 'supertonic']) {
    assert.equal($(`result-${engine}`).hidden, false);
    assert.equal($(`quote-${engine}`).textContent, originalText);
    assert.equal($(`audio-${engine}`).playbackRate, 0.85);
  }
  assert.equal($('compare').disabled, false);
});

test('interrompere termina il worker e impedisce al risultato tardivo di riavviare il confronto', async t => {
  const { $, instances, tick, result } = setup(t);
  $('compare').click();
  const lateResult = instances[0].onmessage;
  $('stop').click();
  lateResult({ data: result });
  await tick();
  assert.equal(instances[0].terminated, true);
  assert.equal(instances.length, 1);
  assert.equal($('result-paola').hidden, true);
  assert.equal($('compare').disabled, false);
  $('generate-paola').click();
  assert.equal(instances.length, 2);
});

test('un errore Paola è esplicito e lascia provare Supertonic, senza voce sostitutiva', async t => {
  const { $, instances, tick, result } = setup(t);
  $('compare').click();
  instances[0].reply({ type: 'error', message: 'Download non disponibile' });
  await tick();
  assert.match($('status-paola').textContent, /Download non disponibile/);
  assert.equal($('result-paola').hidden, true);
  assert.equal(instances[1].request.engine, 'supertonic');
  instances[1].reply(result);
  await tick();
  assert.equal($('result-supertonic').hidden, false);
  assert.equal($('compare').disabled, false);
});
