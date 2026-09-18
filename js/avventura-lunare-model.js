/* Avventura di fantasia: stato indipendente da grafica, voce e orologio reale. */
(function (root) {
  'use strict';
  const steps = [
    ['jump','F','Salta il cratere'], ['dodge','J','Scatta sotto il riparo'],
    ['collect','F','Raccogli l’antenna','antenna'], ['bridge','J','Attraversa la passerella'],
    ['climb','D','Scavalca la roccia'], ['dodge','K','Al riparo dal meteorite!'],
    ['collect','D','Recupera la batteria','batteria'], ['jump','F','Supera il grande cratere'],
    ['bridge','K','Attraversa il ponte'], ['dodge','J','Raggiungi il riparo'],
    ['collect','K','Recupera il portello','portello'], ['walk','D','Raggiungi il tuo razzo'],
    ['fit','F','Posiziona l’antenna','antenna'], ['screw','J','Avvita l’antenna','antenna'],
    ['connect','D','Collega l’antenna','antenna'], ['fit','K','Inserisci la batteria','batteria'],
    ['connect','F','Collega il cavo','batteria'], ['screw','D','Blocca la batteria','batteria'],
    ['fit','J','Incastra il portello','portello'], ['screw','K','Fissa il portello','portello'],
    ['connect','F','Chiudi il portello','portello'], ['launch','J','Accendi i motori!'],
    ['fly','F','Passa nell’apertura in alto',null,180], ['fly','K','Scendi nel varco',null,350],
    ['fly','D','Risali fra i detriti',null,160], ['fly','J','Ultimo passaggio: verso casa!',null,310]
  ].map(([type,key,label,part,lane],i) => Object.freeze({type,key,label,part,lane,
    phase:i<12?'explore':i<21?'build':'flight', duration:type==='launch'?3000:type==='fly'?2200:1800,
    danger:type==='dodge'||type==='fly', limit:i===1?36000:i===5?27000:i===9?22000:18000}));
  function create() { return {index:0, mode:'ready', elapsed:0, motion:0, parts:[], installed:[], collisions:0, retries:0, completed:false}; }
  function current(s) { return steps[s.index]; }
  function press(s,key) {
    if (s.mode!=='ready'||s.completed||key.toUpperCase()!==current(s).key) return false;
    s.mode='action'; s.motion=0; return true;
  }
  function dangerProgress(s) {
    const d=current(s); if(!d?.danger) return 0;
    // Arrivo visibile, poi forte rallentamento: il bambino può cercare il tasto.
    const t=s.elapsed/(d.limit*Math.min(2.5,1+s.retries*.5));
    return Math.min(1,t<.16 ? t/.16*.65 : .65+(t-.16)/.84*.35);
  }
  function tick(s,dt) {
    if(s.completed) return '';
    const d=current(s);
    if(s.mode==='ready') {
      s.elapsed+=dt;
      if(d.danger&&dangerProgress(s)>=1) {s.mode='rescue';s.motion=0;s.collisions++;s.retries++;return 'collision';}
    } else {
      s.motion+=dt;
      if(s.mode==='rescue'&&s.motion>=2200) {s.mode='ready';s.elapsed=0;s.motion=0;return 'retry';}
      if(s.mode==='action'&&s.motion>=d.duration) {
        if(d.type==='collect'&&!s.parts.includes(d.part)) s.parts.push(d.part);
        if(s.index===14||s.index===17||s.index===20) s.installed.push(d.part);
        s.index++;s.elapsed=s.motion=0;s.retries=0;s.mode='ready';
        if(s.index===steps.length) {s.completed=true;s.mode='won';return 'win';}
        return 'next';
      }
    }
    return '';
  }
  const api={steps,create,current,press,tick,dangerProgress};
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.LunarAdventureModel=api;
})(typeof window==='undefined'?this:window);
