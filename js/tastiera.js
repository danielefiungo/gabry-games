/* Due bozze di tastiera: stesso percorso motorio, missioni e scene distinte. */
(function () {
  'use strict';
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const TRAINING = [
    { keys: 'FJ', count: 8, size: 1, help: 'Trova F e J: hanno un piccolo trattino sul tasto.' },
    { keys: 'DFJK', count: 8, size: 1, help: 'D e K sono accanto ai tuoi primi due tasti.' },
    { keys: 'ASDFJKL', count: 10, size: 1, help: 'Esplora la fila centrale, con calma.' },
    { keys: 'QWERUIOPASDFJKL', count: 16, size: 1, help: 'Ora esploriamo anche la fila superiore.' },
    { keys: ALPHABET, count: 26, size: 1, help: 'Tutte le lettere! Anche quelle nella fila in basso.' },
    { keys: ALPHABET, count: 18, size: 3, help: 'Tre lettere in ordine. Premi solo quella illuminata.' }
  ];
  const WORLDS = {
    gibi: {
      id: 'tastiera-gibi', title: 'Gibi ai comandi', icon: '🤖', label: 'OFFICINA • GB-7',
      intro: 'La tastiera è il telecomando di Gibi. Riaccendilo, prova i suoi movimenti e insegnagli a ballare!',
      color: 'linear-gradient(160deg,#268f89,#184a65)',
      missions: [
        ['Il risveglio', 'Riaccendi il cuore di Gibi', 'Energia in arrivo!', 'Il cuore di Gibi è acceso!', '⚡'],
        ['Due occhi curiosi', 'Accendi le luci di Gibi', 'Una luce in più!', 'Gibi ti vede!', '💡'],
        ['Ciao, Gabriele!', 'Allena il saluto di Gibi', 'Il braccio si muove!', 'Gibi ha imparato a salutare!', '👋'],
        ['Primi passi', 'Accompagna Gibi lungo la pista', 'Un passo avanti!', 'Gibi ha attraversato la pista!', '👣'],
        ['Caccia ai pezzi', 'Aiuta Gibi a raccogliere i pezzi', 'Pezzo recuperato!', 'Tutti i pezzi sono in officina!', '⚙️'],
        ['Il ballo di Gibi', 'Prepara una mossa con tre lettere', 'Mossa imparata!', 'Gibi balla grazie a te!', '🎶']
      ]
    },
    apollo: {
      id: 'tastiera-apollo', title: 'Apollo ai comandi', icon: '🚀', label: 'CENTRO DI CONTROLLO • APOLLO',
      intro: 'Prendi posto alla plancia. Ogni lettera aziona un comando, dalla rampa di lancio fino al ritorno a casa.',
      color: 'linear-gradient(160deg,#5264bf,#242849)',
      missions: [
        ['Pronti al lancio', 'Completa i controlli sulla rampa', 'Controllo completato!', 'Tutto pronto sulla rampa!', '📋'],
        ['Accensione!', 'Porta Saturn V verso lo spazio', 'Continuiamo a salire!', 'Il razzo ha lasciato la rampa!', '🔥'],
        ['Via gli stadi', 'Completa i comandi di separazione', 'Comando ricevuto!', 'Gli stadi hanno fatto il loro lavoro!', '🚀'],
        ['Verso la Luna', 'Accompagna Apollo lungo la rotta', 'Rotta confermata!', 'Apollo è arrivato vicino alla Luna!', '🌙'],
        ['Un piccolo passo', 'Guida il modulo lunare al suolo', 'Discesa controllata!', 'Il modulo lunare è atterrato!', '🧑‍🚀'],
        ['Si torna a casa', 'Invia tre lettere per ogni manovra', 'Manovra completata!', 'Ammaraggio! Bentornato, comandante!', '🌍']
      ]
    }
  };
  let root, world, level = 0, queue = [], cursor = 0, active = false, playing = false;
  let advanceTimer, hintTimer, busy = false, saved = { gibi: [], apollo: [] };
  const STORAGE = 'gabri_keyboard_drafts_v1';
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE));
    for (const id of Object.keys(saved)) if (Array.isArray(data?.[id]))
      saved[id] = data[id].filter(n => Number.isInteger(n) && n >= 0 && n < TRAINING.length);
  } catch (_) { /* Si può giocare anche senza salvataggi. */ }
  const el = id => root.querySelector('#' + id);
  const worldKey = () => world === WORLDS.gibi ? 'gibi' : 'apollo';
  function clearTimers() { clearTimeout(advanceTimer); clearTimeout(hintTimer); busy = false; }
  function stopVoice() { if (typeof stopSpeak === 'function') stopSpeak(); }
  function say(text) { if (typeof speak === 'function') { stopVoice(); speak(text); } }
  function shell() {
    if (!root) {
      root = document.createElement('section'); root.id = 'typingGame'; root.hidden = true;
      root.setAttribute('aria-label', 'Giochi della tastiera'); document.body.appendChild(root);
    }
    root.dataset.world = worldKey();
    root.innerHTML = `<div class="tk-shell"><header class="tk-header"><button id="tkHome" class="tk-button">← Giochi</button><span>${world.label}</span><span class="tk-badge">BOZZA</span></header><main id="tkMain"></main></div>`;
    el('tkHome').onclick = () => { exit(); showModeSel(); };
  }
  function enter(id) {
    exit(); world = WORLDS[id]; active = true;
    if (typeof paused !== 'undefined') paused = true;
    document.getElementById('modeSel').style.display = 'none';
    shell(); root.hidden = false; menu();
  }
  function exit() { active = playing = false; clearTimers(); stopVoice(); if (root) root.hidden = true; }
  function menu() {
    playing = false; clearTimers(); stopVoice();
    el('tkMain').innerHTML = `<div class="tk-intro"><div><p class="tk-eyebrow">LA TUA PRIMA AVVENTURA CON LA TASTIERA</p><h1>${world.title}</h1><p>${world.intro}</p><div class="tk-tags"><span>⌨ Lettere, senza parole</span><span>∞ Nessuna fretta</span><span>✦ 6 missioni</span></div></div><div class="tk-mascot">${world === WORLDS.gibi ? '<img src="assets/characters/gibi.png" alt="Gibi, il robot dell’Officina">' : rocket()}</div></div><div class="tk-map">${world.missions.map((m, i) => `<button class="tk-mission" data-level="${i}"><span class="tk-mission-icon">${m[4]}</span><span class="tk-eyebrow">MISSIONE ${i + 1} ${saved[worldKey()].includes(i) ? '• ✓ COMPLETATA' : ''}</span><strong>${m[0]}</strong><small>${i === 0 ? 'F · J' : i === 1 ? 'D · F · J · K' : i === 2 ? 'La fila centrale' : i === 3 ? 'Anche la fila superiore' : i === 4 ? 'Tutto l’alfabeto' : 'Sequenze di 3 lettere'}</small><span class="tk-mission-arrow">→</span></button>`).join('')}</div><p class="tk-footnote">Puoi provare ogni missione. I completamenti si salvano su questo dispositivo.</p>`;
    root.querySelectorAll('[data-level]').forEach(b => b.onclick = () => start(Number(b.dataset.level)));
    el('tkHome').focus({ preventScroll: true });
  }
  function makeQueue(config) {
    const result = [];
    while (result.length < config.count) {
      const bag = [...config.keys];
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (result.length && bag[0] === result[result.length - 1]) [bag[0], bag[1]] = [bag[1], bag[0]];
      result.push(...bag);
    }
    return result.slice(0, config.count);
  }
  function start(index) {
    clearTimers(); stopVoice(); level = index; cursor = 0; playing = true;
    queue = makeQueue(TRAINING[level]);
    el('tkMain').innerHTML = `<div class="tk-play-heading"><div><p class="tk-eyebrow">MISSIONE ${level + 1} / 6</p><h1>${world.missions[level][0]}</h1></div><button id="tkLevels" class="tk-button">Le missioni</button></div><div class="tk-play-grid"><div class="tk-scene" id="tkScene" data-level="${level}">${scene()}<div class="tk-scene-caption"><span id="tkSceneLabel">${world.missions[level][1]}</span><div class="tk-meter" role="progressbar" aria-label="Missione completata" aria-valuemin="0" aria-valuemax="${queue.length}" aria-valuenow="0"><i id="tkMeter"></i></div></div></div><div class="tk-console"><p class="tk-eyebrow" id="tkPrompt">PREMI QUESTA LETTERA</p><div id="tkTarget" class="tk-target"></div><p id="tkFeedback" role="status" aria-live="polite">Cerca il tasto sulla tua tastiera.</p><div class="tk-console-actions"><button id="tkListen" class="tk-button" aria-label="Ascolta la lettera">🔊 Ascolta</button><button id="tkHelp" class="tk-button">Mostra il tasto</button></div><span id="tkCount" class="tk-count"></span></div></div><div class="tk-keyboard-panel"><div class="tk-keyboard-heading"><strong>La tua mappa dei tasti</strong><span>${TRAINING[level].help}</span></div><div class="tk-keyboard" aria-label="Mappa della tastiera QWERTY">${['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => `<div class="tk-key-row">${[...row].map(k => `<span class="tk-key ${TRAINING[level].keys.includes(k) ? 'tk-in-use' : ''}" data-key="${k}">${k}${'FJ'.includes(k) ? '<i></i>' : ''}</span>`).join('')}</div>`).join('')}</div><p class="tk-footnote">Usa una tastiera fisica QWERTY. Maiuscolo o minuscolo vanno entrambi bene.</p></div>`;
    el('tkLevels').onclick = menu;
    el('tkListen').onclick = () => say('Premi la lettera ' + queue[cursor]);
    el('tkHelp').onclick = showHint;
    el('tkLevels').focus({ preventScroll: true });
    updateTarget(); updateScene();
  }
  function rocket() {
    return `<svg class="tk-rocket" viewBox="0 0 120 310" role="img" aria-label="Razzo Saturn V"><path class="tk-flame" d="M43 263 Q60 340 77 263Z" fill="#ffb94e"/><g class="tk-first-stage"><path d="M38 184h44v78H38z" fill="#edf4ff"/><path d="M38 225l-18 38h18m44-38 18 38H82" fill="#8b9ac4"/><path d="M38 198h44v19H38z" fill="#303852"/></g><g class="tk-second-stage"><path d="M38 120h44v64H38z" fill="#edf4ff"/><path d="M38 126h44v16H38z" fill="#303852"/></g><path d="M45 72h30l7 48H38z" fill="#e3eafa"/><path d="M45 45h30v27H45z" fill="#fff"/><path d="M45 45 60 19 75 45" fill="#8b9ac4"/><path d="M58 0h4v20h-4z" fill="#e3eafa"/><text x="60" y="169" text-anchor="middle" fill="#35415f" font-size="11" font-weight="bold">USA</text></svg>`;
  }
  function scene() {
    if (world === WORLDS.gibi) return `<div class="tk-workshop-grid"></div><div class="tk-gibi"><img src="assets/characters/gibi.png" alt="Gibi si riattiva con i tuoi comandi"><span class="tk-part">${world.missions[level][4]}</span></div><div class="tk-lights">${Array.from({ length: 8 }, () => '<i></i>').join('')}</div>`;
    return `<div class="tk-stars"></div><div class="tk-moon"></div><div class="tk-flight">${level < 3 ? rocket() : level === 3 ? '<svg class="tk-csm" viewBox="0 0 120 70" role="img" aria-label="Apollo: modulo di comando e servizio"><path d="M9 20 30 30v10L9 50Z" fill="#8796b5"/><rect x="30" y="15" width="45" height="40" rx="4" fill="#d7dfed"/><path d="M75 15 110 35 75 55Z" fill="#f0f4fc"/><path d="M40 15v40m25-40v40" stroke="#8391ae" stroke-width="3"/><path d="M84 25 94 31 84 33Z" fill="#465878"/></svg>' : level === 4 ? '<div class="tk-lander" role="img" aria-label="Modulo lunare"><span>◒</span><b>▣</b><i>╱ ╲</i><em>🔥</em></div>' : '<div class="tk-capsule" role="img" aria-label="Capsula Apollo con tre paracadute"><svg class="tk-parachute" viewBox="0 0 110 90" aria-hidden="true"><g fill="#f8a77d" stroke="#e8e9f2" stroke-width="2"><path d="M2 28a17 17 0 0 1 34 0Z"/><path d="M38 19a17 17 0 0 1 34 0Z"/><path d="M74 28a17 17 0 0 1 34 0Z"/></g><path d="M2 28 55 85 36 28M38 19 55 85 72 19M74 28 55 85 108 28" fill="none" stroke="#e8e9f2"/></svg><b>◭</b></div>'}</div><div class="tk-ground"></div>${level === 0 ? '<div class="tk-lights">' + Array.from({ length: 8 }, () => '<i></i>').join('') + '</div>' : ''}`;
  }
  function updateTarget() {
    const size = TRAINING[level].size, begin = Math.floor(cursor / size) * size;
    el('tkPrompt').textContent = size === 1 ? 'PREMI QUESTA LETTERA' : 'PREMI LE LETTERE IN ORDINE';
    el('tkTarget').innerHTML = queue.slice(begin, begin + size).map((k, i) => `<span class="${begin + i < cursor ? 'tk-done' : begin + i === cursor ? 'tk-current' : 'tk-waiting'}">${k}</span>`).join('');
    el('tkCount').textContent = `${cursor} / ${queue.length} lettere`;
    root.querySelectorAll('[data-key]').forEach(k => k.classList.remove('tk-hint'));
    clearTimeout(hintTimer);
    if (level === 0) showHint(); else hintTimer = setTimeout(showHint, 4000);
  }
  function showHint() {
    if (!playing || busy) return;
    const key = root.querySelector(`[data-key="${queue[cursor]}"]`);
    if (key) key.classList.add('tk-hint');
  }
  function updateScene() {
    const progress = cursor / queue.length, sceneEl = el('tkScene');
    sceneEl.style.setProperty('--progress', progress);
    sceneEl.dataset.step = Math.floor(progress * 8);
    el('tkMeter').style.width = `${progress * 100}%`;
    el('tkMeter').parentElement.setAttribute('aria-valuenow', cursor);
    root.querySelectorAll('.tk-lights i').forEach((light, i) => light.classList.toggle('on', i < Math.ceil(progress * 8)));
    sceneEl.classList.toggle('tk-stage-one-away', progress >= .4);
    sceneEl.classList.toggle('tk-stage-two-away', progress >= .8);
    sceneEl.classList.remove('tk-react'); void sceneEl.offsetWidth; sceneEl.classList.add('tk-react');
  }
  function finish() {
    playing = false; clearTimers(); stopVoice();
    const key = worldKey();
    if (!saved[key].includes(level)) saved[key].push(level);
    let stored = true;
    try { localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch (_) { stored = false; }
    el('tkTarget').innerHTML = '<span class="tk-victory">★</span>';
    el('tkPrompt').textContent = 'MISSIONE COMPIUTA!';
    el('tkFeedback').textContent = world.missions[level][3];
    el('tkSceneLabel').textContent = world.missions[level][3];
    el('tkCount').textContent = `${queue.length} lettere! ${stored ? 'Completamento salvato.' : 'Completato! Salvataggio non disponibile.'}`;
    root.querySelector('.tk-console-actions').innerHTML = `<button id="tkReplay" class="tk-button">Riprova</button><button id="tkNext" class="tk-button tk-primary">${level < 5 ? 'Prossima missione →' : 'Tutte le missioni →'}</button>`;
    el('tkReplay').onclick = () => start(level);
    el('tkNext').onclick = () => level < 5 ? start(level + 1) : menu();
    el('tkNext').focus({ preventScroll: true });
  }
  function onKey(event) {
    if (!active || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (playing) menu(); else { exit(); showModeSel(); } return; }
    if (!playing || !/^[a-z]$/i.test(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.repeat || busy) return;
    if (event.key.toUpperCase() !== queue[cursor]) {
      el('tkFeedback').textContent = `Quello è ${event.key.toUpperCase()}. Cerca ${queue[cursor]}, con calma.`;
      showHint(); return;
    }
    stopVoice(); clearTimeout(hintTimer); cursor++; busy = true;
    const groupDone = cursor % TRAINING[level].size === 0;
    el('tkFeedback').textContent = groupDone ? world.missions[level][2] : 'Bene! Ora la prossima lettera.';
    el('tkSceneLabel').textContent = groupDone ? world.missions[level][2] : 'Comando in preparazione…';
    root.querySelector('.tk-current')?.classList.add('tk-done');
    updateScene(); el('tkCount').textContent = `${cursor} / ${queue.length} lettere`;
    advanceTimer = setTimeout(() => {
      busy = false;
      if (!active || !playing) return;
      if (cursor === queue.length) finish(); else updateTarget();
    }, 260);
  }
  window.addEventListener('keydown', onKey, true);
  for (const [id, config] of Object.entries(WORLDS)) registerGame({
    id: config.id, emoji: config.icon, nm: [config.title, config.title],
    sub: ['⌨ Tastiera · 6 missioni · Bozza', '⌨ Keyboard · 6 missions · Draft'],
    colore: config.color, enter: () => enter(id), exit
  });
})();
