const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'palla-api.js'), 'utf8');

function readConst(name, nextName) {
  const start = source.indexOf(`const ${name}=`);
  const end = source.indexOf(`const ${nextName}=`, start);
  assert.notEqual(start, -1, `${name} deve esistere`);
  assert.notEqual(end, -1, `${nextName} deve seguire ${name}`);
  const expression = source.slice(start + `const ${name}=`.length, end).trim().replace(/;$/, '');
  return vm.runInNewContext(`(${expression})`);
}

const questions = readConst('PA_QUESTIONS', 'PA_Q_REWARD');
const hornets = readConst('PA_HORNET_TYPES', 'PA_QUESTIONS');

test('ogni percorso offre un parco ampio di domande valide', () => {
  for (const level of ['worker', 'builder', 'easy', 'medium', 'hard']) {
    assert.ok(questions[level].length >= 15, `${level} ha almeno 15 domande`);
    for (const question of questions[level]) {
      assert.equal(question.length, 4, 'ogni domanda ha testo, risposta e due alternative');
      assert.ok(question.every(part => typeof part === 'string' && part.trim().length > 0));
      assert.equal(new Set(question.slice(1)).size, 3, 'le tre risposte sono diverse');
    }
  }
  const prompts = Object.values(questions).flat().map(question => question[0]);
  assert.equal(new Set(prompts).size, prompts.length, 'non ci sono domande duplicate');
});

test('le domande difficili sono brevi comprensioni del testo', () => {
  for (const question of questions.hard) {
    const lines = question[0].split('\n');
    assert.ok(lines.length >= 3 && lines.length <= 5, 'ogni lettura occupa da 3 a 5 righe');
    assert.ok(lines.at(-1).endsWith('?'), 'l’ultima riga contiene la domanda di comprensione');
    assert.ok(question[0].length >= 150, 'il testo richiede una lettura sostanziale');
  }
});

test('i calabroni robusti richiedono squadre crescenti', () => {
  const damagePerFullEnergy = 96 / 8 * 0.58;
  const required = Object.fromEntries(Object.entries(hornets).map(([type, hornet]) => [
    type,
    Math.ceil(hornet.hp * 1.28 / damagePerFullEnergy)
  ]));
  assert.deepEqual(required, {scout: 1, raider: 2, tank: 3, commander: 4, king: 6});
  assert.match(source, /x:pa\.w\+65/, 'i calabroni partono dal lato lontano dell’alveare');
});

test('il miele è prodotto dalle bottinatrici e consumato per rifocillare', () => {
  assert.match(source, /pa\.honeyFrac\+=\.5/);
  assert.match(source, /pa\.honey--/);
  assert.match(source, /b\.state='hungry'/);
  assert.match(source, /data-level="worker"/);
});

test('bottinatrici e costruttrici possono nascere in gruppi da uno, due o tre', () => {
  for (const role of ['worker', 'builder']) {
    for (const count of [1, 2, 3]) {
      assert.match(source, new RegExp(`data-level="${role}" data-count="${count}"`));
    }
  }
  assert.match(source, /pa\.workers\+=reward/);
  assert.match(source, /pa\.builders\+=reward/);
});

test('la salute dell’alveare è visibile, subisce danni e viene riparata', () => {
  assert.match(source, /id="paHiveHealth"/);
  assert.match(source, /hiveDamage:10/);
  assert.match(source, /pa\.hiveHp=Math\.max\(0,pa\.hiveHp-h\.cfg\.hiveDamage\)/);
  assert.match(source, /pa\.hiveMaxHp\+=reward\*PA_BUILDER_REINFORCE/);
  assert.match(source, /pa\.builderRepairFrac\+=PA_BUILDER_REPAIR\*dt/);
  assert.match(source, /if\(pa\.hiveHp<=0\)paFinish\(false\)/);
});

test('la scheda delle domande non crea scorrimento orizzontale', () => {
  assert.match(source, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(source, /#paQAnswers \.ansBtn\{[^}]*min-width:0/);
  assert.match(source, /#paQ \.card\{[^}]*overflow-x:hidden/);
  assert.match(source, /@media\(max-width:820px\)\{#paQAnswers\{grid-template-columns:1fr/);
});
