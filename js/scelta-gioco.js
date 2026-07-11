/* ============================================================
   SCELTA DEL GIOCO 🎮
   Registro delle modalità: ogni gioco si registra con
   registerGame({id, emoji, nm:[it,en], sub:[it,en], colore, enter})
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
  enter(){ $('modeSel').style.display='none'; showMenu(); }
});

/* ---------- stile + schermata ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent=[
  '#modeSel { z-index:15; }',
  '#modeRow { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; margin-top:14px; }',
  '.modeBtn { border:none; border-radius:24px; padding:22px 18px; width:min(240px,42vw); cursor:pointer; font-family:inherit; color:#fff; box-shadow:0 6px 0 rgba(0,0,0,.25); transition:transform .1s; }',
  '.modeBtn:active { transform:translateY(3px); box-shadow:none; }',
  '.modeBtn .em { font-size:52px; display:block; margin-bottom:8px; }',
  '.modeBtn .nm { font-size:21px; font-weight:bold; display:block; }',
  '.modeBtn small { font-size:14px; opacity:.92; display:block; margin-top:6px; line-height:1.3; }'
  ].join('\n');
  document.head.appendChild(css);
  document.body.insertAdjacentHTML('beforeend',
  '<div class="overlay" id="modeSel">'+
    '<div class="card">'+
      '<div id="modeTitle" style="font-size:clamp(26px,6vw,42px);color:#2b3a8f;margin-bottom:4px"></div>'+
      '<div id="modeSub" style="font-size:19px;color:#666;margin-bottom:8px"></div>'+
      '<div id="modeRow"></div>'+
    '</div>'+
  '</div>');
})();

function showModeSel(){
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
    b.className='modeBtn'; b.style.background=g.colore;
    b.innerHTML='<span class="em">'+g.emoji+'</span><span class="nm">'+g.nm[i]+'</span><small>'+g.sub[i]+'</small>';
    b.onclick=()=>g.enter();
    row.appendChild(b);
  });
  if(MUSICON && actx && actx.state==='running') playMusic(TRK_MENU);
  $('modeSel').style.display='flex';
}

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

/* all'avvio (dopo che tutti i giochi si sono registrati) */
addEventListener('load',()=>{ showModeSel(); });
