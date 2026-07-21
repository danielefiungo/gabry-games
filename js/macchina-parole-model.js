/* ============================================================
   LA MACCHINA DELLE PAROLE — predittore a conteggio ispezionabile
   È un vero modello linguistico semplice, NON un LLM.
   UMD: browser + test Node.
   ============================================================ */
(function(root,factory){
  const value=factory();
  if(typeof module==='object'&&module.exports)module.exports=value;
  else root.MP_MODEL=value;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const LETTERS='A-Za-zÀ-ÖØ-öø-ÿ’\'';
  const TOKEN_RE=new RegExp('['+LETTERS+']+|[0-9]+|[.,!?;:]','g');

  function tokenize(text){
    return (String(text||'').match(TOKEN_RE)||[]).map(t=>t.toLocaleLowerCase('it-IT'));
  }

  function unique(tokens){return Array.from(new Set(tokens));}

  /* Tokenizzatori trasparenti del Capitolo 2. Gli spazi separano gli elementi
     lessicali e non diventano token; la punteggiatura resta invece visibile. */
  function tokenizeWithVocabulary(text,vocabulary,mode){
    const lexical=tokenize(text),vocab=unique((vocabulary||[]).map(t=>String(t).toLocaleLowerCase('it-IT'))),known=new Set(vocab);
    if(mode==='character')return lexical.flatMap(item=>Array.from(item));
    if(mode==='word')return lexical.map(item=>known.has(item)?item:'<sconosciuto:'+item+'>');
    const ordered=vocab.slice().sort((a,b)=>b.length-a.length||a.localeCompare(b,'it'));
    return lexical.flatMap(item=>{
      if(/^[.,!?;:]$/.test(item))return known.has(item)?[item]:['<sconosciuto:'+item+'>'];
      const pieces=[];let rest=item;
      while(rest.length){
        const found=ordered.find(piece=>piece&&rest.startsWith(piece));
        if(!found){pieces.push('<sconosciuto:'+rest+'>');break;}
        pieces.push(found);rest=rest.slice(found.length);
      }
      return pieces;
    });
  }

  function inspectTokenizer(text,vocabulary,mode){
    const started=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    const tokens=tokenizeWithVocabulary(text,vocabulary,mode);
    const actualVocabulary=mode==='character'?unique(tokens):unique((vocabulary||[]).map(t=>String(t).toLocaleLowerCase('it-IT')));
    const ended=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    return {mode,tokens,vocabulary:actualVocabulary,vocabularySize:actualVocabulary.length,sequenceLength:tokens.length,unknown:tokens.filter(t=>t.startsWith('<sconosciuto:')).length,buildMs:Math.max(0,ended-started)};
  }

  function key(tokens){return tokens.join('\u241f');}

  function build(texts,maxContext){
    const started=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    const context=Math.max(1,Math.min(4,Number(maxContext)||3));
    const tables=Array.from({length:context+1},()=>Object.create(null));
    let tokenCount=0,transitions=0;
    (texts||[]).forEach(text=>{
      const tokens=tokenize(text);tokenCount+=tokens.length;
      for(let i=1;i<tokens.length;i++){
        const next=tokens[i];
        for(let n=1;n<=context&&n<=i;n++){
          const k=key(tokens.slice(i-n,i));
          if(!tables[n][k])tables[n][k]=Object.create(null);
          tables[n][k][next]=(tables[n][k][next]||0)+1;
          transitions++;
        }
      }
    });
    const ended=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    return {context,tables,texts:(texts||[]).slice(),tokenCount,transitions,buildMs:Math.max(0,ended-started)};
  }

  function predict(model,prompt){
    if(!model)return {context:[],used:0,total:0,candidates:[]};
    const tokens=tokenize(prompt);
    let counts=null,used=0,context=[];
    for(let n=Math.min(model.context,tokens.length);n>=1;n--){
      const tail=tokens.slice(-n),found=model.tables[n][key(tail)];
      if(found){counts=found;used=n;context=tail;break;}
    }
    if(!counts)return {context:[],used:0,total:0,candidates:[]};
    const total=Object.values(counts).reduce((a,b)=>a+b,0);
    const candidates=Object.keys(counts).map(token=>({token,count:counts[token],prob:counts[token]/total}))
      .sort((a,b)=>b.count-a.count||a.token.localeCompare(b.token,'it'));
    return {context,used,total,candidates};
  }

  function sample(prediction,random){
    if(!prediction||!prediction.candidates.length)return null;
    let r=(typeof random==='function'?random():Math.random());
    for(const c of prediction.candidates){r-=c.prob;if(r<=0)return c;}
    return prediction.candidates[prediction.candidates.length-1];
  }

  function corpusFrom(phases,decisions,through){
    const out=[];
    const limit=through==null?phases.length-1:through;
    for(let pi=0;pi<=limit&&pi<phases.length;pi++){
      const phase=phases[pi],chosen=decisions[phase.id]||{};
      phase.documents.forEach(doc=>{
        const action=chosen[doc.id];
        if(action==='use'||action==='include')out.push({id:doc.id,text:doc.text,title:doc.title});
        if(action==='anonymize')out.push({id:doc.id,text:doc.safeText||doc.text,title:doc.title+' (anonimo)'});
      });
    }
    return out;
  }

  function validatePhase(phase,choices){
    const missing=[],wrong=[];
    phase.documents.forEach(doc=>{
      if(!choices||!choices[doc.id])missing.push(doc.id);
      else if(choices[doc.id]!==doc.correct)wrong.push(doc.id);
    });
    return {ok:!missing.length&&!wrong.length,missing,wrong};
  }

  return {tokenize,tokenizeWithVocabulary,inspectTokenizer,build,predict,sample,corpusFrom,validatePhase};
});
