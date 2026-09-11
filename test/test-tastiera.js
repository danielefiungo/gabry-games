'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../js/tastiera.js'), 'utf8');

function setup(saved) {
  const dom = new JSDOM('<div id="modeSel"></div>', { url: 'https://gabri.test', runScripts: 'outside-only' });
  const w = dom.window, games = [], timers = new Map(); let serial = 0;
  w.registerGame = game => games.push(game);
  w.stopSpeak = () => {}; w.speak = () => {};
  w.showModeSel = () => { w.document.getElementById('modeSel').style.display = 'flex'; };
  w.setTimeout = (fn, ms) => { timers.set(++serial, { fn, ms }); return serial; };
  w.clearTimeout = id => timers.delete(id);
  if (saved) w.localStorage.setItem('gabri_keyboard_drafts_v1', saved);
  w.eval(source);
  const $ = selector => w.document.querySelector(selector);
  const press = (key, opts = {}, target = w) => target.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
  const tick = ms => { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.fn(); } };
  const start = (world, level) => { games[world].enter(); $(`[data-level="${level}"]`).click(); };
  const correct = () => { press($('#tkTarget .tk-current').textContent.toLowerCase()); tick(260); };
  return { w, games, timers, $, press, tick, start, correct, close: () => dom.window.close() };
}

test('lettere corrette, errori senza penalità e protezione da ripetizioni/scorciatoie', () => {
  const h = setup(); h.start(0, 0);
  assert.equal(h.$('#tkCount').textContent, '0 / 8 lettere');
  h.press('z'); assert.match(h.$('#tkFeedback').textContent, /Cerca [FJ]/);
  const key = h.$('.tk-current').textContent;
  for (const opts of [{ repeat: true }, { metaKey: true }, { ctrlKey: true }, { altKey: true }, { isComposing: true }]) h.press(key, opts);
  assert.equal(h.$('#tkCount').textContent, '0 / 8 lettere');
  h.correct(); assert.equal(h.$('#tkCount').textContent, '1 / 8 lettere');
  h.press('z'); assert.equal(h.$('#tkCount').textContent, '1 / 8 lettere');
  h.close();
});

test('tutte le 12 missioni sono completabili e salvate separatamente', () => {
  const h = setup();
  for (let world = 0; world < 2; world++) for (let level = 0; level < 6; level++) {
    h.start(world, level);
    let letters = 0; const seen = new Set();
    while (!h.$('#tkNext') && letters < 40) {
      seen.add(h.$('#tkTarget .tk-current').textContent); h.correct(); letters++;
    }
    assert.ok(h.$('#tkNext'), `missione ${world}:${level} non completata`);
    if (level === 4) assert.equal(seen.size, 26, 'il livello alfabeto deve esercitare ogni lettera');
    assert.equal(h.$('[role="progressbar"]').getAttribute('aria-valuenow'), String(letters));
    h.$('#tkReplay').click(); assert.match(h.$('#tkCount').textContent, /^0 \//);
  }
  const data = h.w.localStorage.getItem('gabri_keyboard_drafts_v1');
  assert.deepEqual(JSON.parse(data), { gibi: [0, 1, 2, 3, 4, 5], apollo: [0, 1, 2, 3, 4, 5] });
  const restored = setup(data); restored.games[0].enter();
  assert.equal(restored.w.document.querySelectorAll('.tk-mission').length, 6);
  assert.equal((restored.$('#tkMain').textContent.match(/COMPLETATA/g) || []).length, 6);
  h.close(); restored.close();
});

test('le sequenze avanzano una lettera alla volta e mantengono visibili le precedenti', () => {
  const h = setup(); h.start(1, 5);
  assert.equal(h.$('#tkTarget').children.length, 3);
  const first = h.$('#tkTarget .tk-current').textContent;
  h.correct(); assert.equal(h.$('#tkTarget .tk-done').textContent, first);
  assert.equal(h.$('#tkTarget .tk-current'), h.$('#tkTarget').children[1]);
  h.correct(); h.correct();
  assert.equal(h.$('#tkTarget .tk-current'), h.$('#tkTarget').children[0]);
  assert.equal(h.$('#tkCount').textContent, '3 / 18 lettere'); h.close();
});

test('uscita e cambio gioco cancellano feedback e suggerimenti pendenti', () => {
  const h = setup(); h.start(0, 2);
  assert.equal(h.$('.tk-hint'), null); h.tick(4000); assert.ok(h.$('.tk-hint'));
  h.press(h.$('.tk-current').textContent); h.games[0].exit();
  assert.equal(h.timers.size, 0); assert.equal(h.$('#typingGame').hidden, true);
  h.tick(260); h.start(1, 0); assert.equal(h.$('#tkCount').textContent, '0 / 8 lettere');
  h.press('Escape'); assert.ok(h.$('.tk-map')); assert.equal(h.timers.size, 0);
  h.press('Escape'); assert.equal(h.$('#typingGame').hidden, true); h.close();
});

test('salvataggi danneggiati o indisponibili non impediscono di giocare', () => {
  const h = setup('{non valido'); h.start(0, 0);
  h.w.Storage.prototype.setItem = () => { throw new Error('storage unavailable'); };
  for (let n = 0; n < 8; n++) h.correct();
  assert.ok(h.$('#tkNext')); assert.match(h.$('#tkCount').textContent, /Salvataggio non disponibile/);
  h.close();
});

test('gli input di altri controlli non vengono intercettati', () => {
  const h = setup(); h.start(0, 0);
  const input = h.w.document.createElement('input'); h.w.document.body.appendChild(input);
  assert.equal(h.press(h.$('.tk-current').textContent, {}, input), true);
  assert.equal(h.$('#tkCount').textContent, '0 / 8 lettere'); h.close();
});
