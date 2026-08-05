/* ============================================================
   SCELTA DEL GIOCO 🎮
   Registro delle modalità: ogni gioco si registra con
   registerGame({id, emoji, nm:[it,en], sub:[it,en], colore, enter, exit})
   e compare come pulsante nella schermata iniziale.
   ============================================================ */

const GAMES=[];
function registerGame(g){ GAMES.push(g); }

/* Il labirinto (modalità base, già esistente) */
registerGame({
  id:'maze', emoji:'🧩',
  nm:['Il Labirinto','The Maze'],
  sub:['Leggi, apri le porte, trova la stella','Read, open doors, find the star'],
  colore:'linear-gradient(180deg,#3d6ef7,#2b3a8f)',
  enter(){ $('modeSel').style.display='none'; showMenu(); },
  exit(){
    paused=true; stopSpeak();
    if(typeof stopMazeLoop==='function') stopMazeLoop();
    ['menu','question','win','boss','album'].forEach(id=>{ const e=$(id); if(e)e.style.display='none'; });
    $('hud').style.display='none'; $('joy').style.display='none'; $('startHint').style.display='none';
  }
});

/* ---------- stile + schermata ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#modeSel { z-index:15; background:radial-gradient(circle at 50% 15%,#273468 0,#101735 48%,#080d22 100%); }',
  '#modeSel:before { content:"";position:absolute;inset:0;pointer-events:none;opacity:.28;background-image:radial-gradient(circle,#fff 1px,transparent 1.5px);background-size:54px 54px; }',
  '#modeSel .modeCard { width:min(1040px,96vw)!important; max-width:1040px!important; max-height:94vh; overflow:auto; padding:20px; }',
  '#modeRow { display:grid;grid-template-columns:repeat(3,minmax(160px,1fr));gap:16px;margin:14px auto 0;max-width:900px; }',
  '.modeBtn { border:3px solid rgba(255,255,255,.22); border-radius:24px; padding:14px; width:100%; min-height:156px; cursor:pointer; font-family:inherit; color:#fff; box-shadow:0 7px 0 rgba(0,0,0,.28),0 12px 28px rgba(20,15,70,.2); transition:transform .16s,filter .16s; position:relative;overflow:hidden; }',
  '.modeBtn:before { content:"";position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.22),transparent 42%);pointer-events:none; }',
  '.modeBtn:hover { transform:translateY(-4px);filter:saturate(1.12) brightness(1.05); }',
  '.modeBtn:active { transform:translateY(3px); box-shadow:none; }',
  '.modeBtn .em { font-size:52px; display:block; margin-bottom:6px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.22)); }',
  '.modeBtn .nm { font-size:21px; font-weight:bold; display:block; }',
  '.modeBtn small { font-size:13px; opacity:.92; display:block; margin-top:6px; line-height:1.3; }',
  '#modeStats { display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0 2px; }',
  '#modeSettings { margin-top:20px;padding:14px;background:#eef2ff;border:2px solid #c5cffb;border-radius:20px; }',
  '#modeSettingsTitle { color:#2b3a8f;font-size:18px;font-weight:bold;margin-bottom:10px; }',
  '#modeSettingsBtns { display:flex;gap:9px;justify-content:center;flex-wrap:wrap; }',
  '.modeSetting { border:2px solid #b7c4ee;border-radius:13px;background:#fff;color:#29386f;padding:9px 13px;font:bold 14px inherit;cursor:pointer;box-shadow:0 3px 0 #c5cffb; }',
  '.modeSetting.danger { color:#a52626;border-color:#efb4b4;background:#fff7f7;box-shadow:0 3px 0 #efcaca; }',
  '.modeSetting:active { transform:translateY(2px);box-shadow:none; }',
  '#modeTimerSetting { display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;border:2px solid #b7c4ee;border-radius:13px;background:#fff;color:#29386f;box-shadow:0 3px 0 #c5cffb; }',
  '#modeTimerLabel { font:bold 14px inherit;margin-right:2px;white-space:nowrap; }',
  '#modeTimerActiveControls,#modeTimerInactiveControls { display:flex;align-items:center;gap:6px; }',
  '#modeTimerActiveControls[hidden],#modeTimerInactiveControls[hidden] { display:none!important; }',
  '.modeTimerAction { border:0;border-radius:9px;padding:7px 10px;background:#e3e9ff;color:#2b3a8f;font:bold 12px inherit;cursor:pointer;white-space:nowrap; }',
  '#modeTimerStop { background:#ffe3e3;color:#a12a2a; }',
  '#modeTimerStart { background:#dff6e4;color:#247137; }',
  '#modeTimerExact { width:58px;height:30px;border:2px solid #bbc7ee;border-radius:9px;padding:3px 5px;color:#29386f;font:bold 14px inherit;text-align:center; }',
  '#modeTimerExactLabel { font-size:12px;white-space:nowrap; }',
  '.modeBtn[data-game="officina"] .em { width:70px;height:70px;margin:0 auto 6px;background:url("assets/characters/gibi.png") center 8%/145% auto no-repeat;font-size:0;filter:drop-shadow(0 4px 3px rgba(0,0,0,.22)); }',
  '@media(max-width:700px){#modeSel .modeCard{padding:14px 9px}#modeRow{grid-template-columns:repeat(2,minmax(125px,1fr));gap:10px}.modeBtn{min-height:158px;padding:12px 8px}.modeBtn .em{font-size:39px}.modeBtn[data-game="officina"] .em{width:58px;height:58px}#modeSettings{padding:11px 7px}.modeSetting{font-size:12px;padding:8px 9px}#modeTimerSetting{width:100%;justify-content:center;flex-wrap:wrap}#modeTimerLabel{width:100%;font-size:12px;text-align:center}#modeTimerInactiveControls{flex-wrap:wrap;justify-content:center}}'
  ].join('\n');
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',
  '<div class="overlay" id="modeSel">'+
    '<div class="card modeCard">'+
      '<div id="modeTitle" style="font-size:clamp(26px,6vw,42px);color:#2b3a8f;margin-bottom:4px"></div>'+
      '<div id="modeSub" style="font-size:19px;color:#666;margin-bottom:8px"></div>'+
      '<div id="modeStats"></div>'+
      '<div id="modeRow"></div>'+
      '<div id="modeSettings">'+
        '<div id="modeSettingsTitle"></div>'+
        '<div id="modeSettingsBtns">'+
          '<button class="modeSetting" id="modeDiff"></button><button class="modeSetting" id="modeVoice"></button>'+
          '<button class="modeSetting" id="modeMusic"></button><button class="modeSetting" id="modeArrow"></button>'+
          '<button class="modeSetting" id="modeAlbum"></button>'+
          '<div id="modeTimerSetting"><span id="modeTimerLabel">⏱ Timer fermo · 20:00</span>'+
            '<div id="modeTimerActiveControls" hidden>'+
              '<button class="modeTimerAction" id="modeTimerStop" type="button">Ferma timer</button>'+
            '</div>'+
            '<div id="modeTimerInactiveControls">'+
              '<button class="modeTimerAction" id="modeTimerAdd" type="button">+5 min</button>'+
              '<label id="modeTimerExactLabel" for="modeTimerExact">Minuti</label>'+
              '<input id="modeTimerExact" type="number" min="1" max="180" step="1" value="20" inputmode="numeric">'+
              '<button class="modeTimerAction" id="modeTimerStart" type="button">Attiva timer</button>'+
            '</div>'+
          '</div>'+
          '<button class="modeSetting danger" id="modeReset"></button>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>');
})();

function applyModeSettings(){
  const i=LI();
  $('modeSettingsTitle').textContent=i===0?'⚙️ Impostazioni e progressi':'⚙️ Settings and progress';
  $('modeDiff').textContent=DIFF==='easy'?UI.diffE[i]:UI.diffH[i];
  $('modeVoice').textContent=VOICEON?UI.voiceOn[i]:UI.voiceOff[i];
  $('modeMusic').textContent=MUSICON?UI.musicOn[i]:UI.musicOff[i];
  $('modeArrow').textContent=ARROWON?UI.arrowOn[i]:UI.arrowOff[i];
  $('modeAlbum').textContent=UI.albumBtn[i]+' ('+words.length+')';
  $('modeReset').textContent=UI.resetBtn[i];
  $('modeStats').innerHTML='<span class="statChip">⭐ '+score+' '+UI.statPoints[i]+'</span><span class="statChip">🔥 '+bestStreak+' '+UI.statBest[i]+'</span><span class="statChip">🌟 '+totalStars()+'/'+(THEMES.length*3)+' '+UI.statStars[i]+'</span>';
  if(window.GabriPlayTimer) window.GabriPlayTimer.refreshHome();
}

function showModeSel(){
  if(window.GabriNavigation) window.GabriNavigation.visit({screen:'games'});
  paused=true; stopSpeak();
  const i=LI();
  const nm=(typeof PLAYER!=='undefined'&&PLAYER)?PLAYER:'Gabriele';
  $('modeTitle').textContent=(i===0)?('🌟 I Giochi di '+nm+' 🌟'):('🌟 '+nm+"'s Games 🌟");
  $('modeSub').textContent=(i===0)?'Scegli il gioco!':'Pick a game!';
  $('hud').style.display='none'; $('joy').style.display='none';
  $('menu').style.display='none';
  const row=$('modeRow'); row.innerHTML='';
  GAMES.forEach(g=>{
    const b=document.createElement('button');
    b.className='modeBtn'; b.dataset.game=g.id; b.style.background=g.colore;
    b.innerHTML='<span class="em">'+g.emoji+'</span><span class="nm">'+g.nm[i]+'</span><small>'+g.sub[i]+'</small>';
    b.onclick=()=>window.GabriNavigation?window.GabriNavigation.openGame(g):g.enter();
    row.appendChild(b);
  });
  applyModeSettings();
  if(MUSICON && actx && actx.state==='running') playMusic(TRK_MENU);
  $('modeSel').style.display='flex';
}

$('modeDiff').onclick=()=>{DIFF=DIFF==='easy'?'hard':'easy';save();applyModeSettings();};
$('modeVoice').onclick=()=>{VOICEON=!VOICEON;save();if(!VOICEON)stopSpeak();else initTTS();applyModeSettings();};
$('modeMusic').onclick=()=>{toggleMusic();applyModeSettings();};
$('modeArrow').onclick=()=>{ARROWON=!ARROWON;save();applyModeSettings();};
let modeAlbumReturn=false;
$('modeAlbum').onclick=()=>{modeAlbumReturn=true;$('modeSel').style.display='none';showAlbum();};
const modeOldAlbumClose=$('albumCloseBtn').onclick;
$('albumCloseBtn').onclick=()=>{if(modeOldAlbumClose)modeOldAlbumClose();if(modeAlbumReturn){modeAlbumReturn=false;showModeSel();}};
$('modeReset').onclick=()=>{resetProgress();applyModeSettings();};

/* pulsante "cambia gioco" nel menu del labirinto */
(function(){
  const row=document.querySelector('#menu .togRow');
  if(row){
    const b=document.createElement('button');
    b.className='togBtn'; b.id='btnMode';
    b.onclick=()=>{ $('menu').style.display='none'; showModeSel(); };
    row.insertBefore(b,row.firstChild);
  }
})();
const sgOldApplyUI=applyUI;
applyUI=function(){
  sgOldApplyUI();
  const b=$('btnMode');
  if(b) b.textContent=(LI()===0)?'🎮 Cambia gioco':'🎮 Change game';
};

/* musica del menu al primo tocco anche sulla schermata di scelta */
addEventListener('pointerdown',()=>{
  if(MUSICON && !mTrack && $('modeSel').style.display==='flex'){ mCtx(); playMusic(TRK_MENU); }
},true);

/* ---------- cronologia Indietro / Avanti del browser ---------- */
(function(root){
  const STATE_KEY='gabriGameNavigation';
  let applying=false, enabled=false, current={screen:'games'};

  function normalise(route){
    const r=route&&typeof route==='object'?route:{screen:'games'};
    if(r.screen==='maze-level'){
      const level=Math.max(0,Math.min(THEMES.length-1,Number(r.level)||0));
      return {screen:'maze-level',game:'maze',level};
    }
    if(r.screen==='maze-menu') return {screen:'maze-menu',game:'maze'};
    if(r.screen==='game'&&typeof r.game==='string') return {screen:'game',game:r.game};
    return {screen:'games'};
  }
  function same(a,b){ return a.screen===b.screen&&a.game===b.game&&a.level===b.level; }
  function stateFor(route,boundary){ return {[STATE_KEY]:true,route:normalise(route),boundary:!!boundary}; }
  function gameFor(route){ return route&&route.game?GAMES.find(g=>g.id===route.game)||null:null; }

  function visit(route){
    const next=normalise(route);
    if(applying){ current=next; return; }
    if(same(current,next)) return;
    current=next;
    if(!enabled) return;
    try{ history.pushState(stateFor(next,false),''); }
    catch(_){ enabled=false; }
  }
  function openGame(game){
    if(!game||typeof game.enter!=='function') return;
    visit(game.id==='maze'?{screen:'maze-menu',game:'maze'}:{screen:'game',game:game.id});
    game.enter();
  }
  function leaveCurrent(next){
    const active=gameFor(current);
    if(active&&!same(current,next)&&typeof active.exit==='function') active.exit();
  }
  function showRoute(route){
    const next=normalise(route);
    applying=true;
    try{
      leaveCurrent(next);
      if(next.screen==='games') showModeSel();
      else if(next.screen==='maze-menu'){
        const maze=gameFor(next); if(maze) maze.enter();
      }else if(next.screen==='maze-level'){
        $('modeSel').style.display='none'; startLevel(next.level);
      }else{
        const game=gameFor(next); if(game) game.enter(); else showModeSel();
      }
      current=next;
    }finally{ applying=false; }
  }
  function keepInsideGame(){
    const safe={screen:'games'};
    showRoute(safe);
    try{ history.pushState(stateFor(safe,false),''); }
    catch(_){ enabled=false; }
  }

  addEventListener('popstate',event=>{
    const state=event.state;
    if(!state||state[STATE_KEY]!==true) return;
    if(state.boundary) keepInsideGame(); else showRoute(state.route);
  });
  try{
    history.replaceState(stateFor({screen:'games'},true),'');
    history.pushState(stateFor({screen:'games'},false),'');
    enabled=true;
  }catch(_){ enabled=false; }

  root.GabriNavigation={visit,openGame,showRoute,get current(){return {...current};}};
})(window);

/* all'avvio (dopo che tutti i giochi si sono registrati) */
addEventListener('load',()=>{ showModeSel(); });
