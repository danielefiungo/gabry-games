/* Test del nucleo didattico della Macchina delle Parole. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const DATA=require(path.join(__dirname,'..','js','macchina-parole-data.js'));
const MODEL=require(path.join(__dirname,'..','js','macchina-parole-model.js'));

function correctDecisions(){
  const out={};
  for(const phase of DATA.phases){
    out[phase.id]={};
    for(const doc of phase.documents)out[phase.id][doc.id]=doc.correct;
  }
  return out;
}

test('la campagna dichiara dieci capitoli e la fetta verticale tre micro-missioni',()=>{
  assert.equal(DATA.chapters.length,10);
  assert.equal(DATA.chapterGuides.length,10);
  assert.equal(DATA.phases.length,3);
  assert.equal(DATA.finalReports.length,3);
  assert.equal(DATA.chapters[0].open,true);
});

test('ogni capitolo ha una guida semplice e termini tecnici leggibili dal TTS',()=>{
  for(let i=0;i<DATA.chapters.length;i++){
    const guide=DATA.chapterGuides[i];
    assert.ok(guide.problem.length>80,`problema capitolo ${i+1}`);
    assert.ok(guide.purpose.length>70,`scopo capitolo ${i+1}`);
    assert.ok(guide.activity.length>60,`attività capitolo ${i+1}`);
    assert.ok(guide.terms.length>=3,`termini capitolo ${i+1}`);
    for(const item of guide.terms){assert.ok(item.term);assert.ok(item.simple.length>24,`${i+1}: ${item.term}`);}
  }
  const first=DATA.chapterGuides[0].terms.map(x=>x.term);
  assert.deepEqual(first,['Corpus','Token','Probabilità','Modello linguistico']);
});

test('il tokenizer conserva apostrofi italiani e separa la punteggiatura',()=>{
  assert.deepEqual(MODEL.tokenize('L’ingegnera controlla l’antenna.'),['l’ingegnera','controlla','l’antenna','.']);
  assert.deepEqual(MODEL.tokenize('Gatti, gattini!'),['gatti',',','gattini','!']);
});

test('i tokenizer del Capitolo 2 calcolano davvero token, vocabolario e sequenza',()=>{
  const ch=DATA.tokenChapter;
  const words=MODEL.inspectTokenizer(ch.experimentText,ch.wordVocabulary,'word');
  const chars=MODEL.inspectTokenizer(ch.experimentText,[],'character');
  const subwords=MODEL.inspectTokenizer(ch.experimentText,ch.subwordVocabulary,'subword');
  assert.equal(words.unknown,1);
  assert.equal(subwords.unknown,0);
  assert.ok(chars.sequenceLength>subwords.sequenceLength);
  assert.equal(subwords.sequenceLength,12);
  assert.equal(subwords.vocabularySize,new Set(ch.subwordVocabulary).size);
});

test('il vocabolario costruibile riusa frammenti e segnala quelli mancanti',()=>{
  const ch=DATA.tokenChapter,good=ch.fixedVocabulary.concat(ch.requiredFragments);
  const built=MODEL.inspectTokenizer(ch.buildText,good,'subword');
  assert.deepEqual(built.tokens,['gatt','o','gatt','i','gatt','ino']);
  assert.equal(built.unknown,0);
  const missing=MODEL.inspectTokenizer(ch.buildText,ch.fixedVocabulary.concat(['gatt','o','i']),'subword');
  assert.equal(missing.unknown,1);
});

test('ogni fase riconosce scelte corrette, mancanti e sbagliate',()=>{
  for(const phase of DATA.phases){
    const right=correctDecisions()[phase.id];
    assert.equal(MODEL.validatePhase(phase,right).ok,true,phase.id);
    const missing={...right};delete missing[phase.documents[0].id];
    assert.equal(MODEL.validatePhase(phase,missing).missing.length,1,phase.id);
    const wrong={...right};const d=phase.documents[0];wrong[d.id]=d.actions.find(a=>a!==d.correct);
    assert.equal(MODEL.validatePhase(phase,wrong).wrong.length,1,phase.id);
  }
});

test('il corpus corretto esclude copie, privati e fonti fuori tema',()=>{
  const corpus=MODEL.corpusFrom(DATA.phases,correctDecisions());
  assert.deepEqual(corpus.map(x=>x.id),['c1','c4','p1','p3','p5','v1','v2','v3']);
  const privateText=corpus.map(x=>x.text).join(' ');
  assert.doesNotMatch(privateText,/Via delle Comete|AUR-8842|Neri/);
  assert.match(privateText,/La dottoressa controlla il sonno/);
});

test('il predittore usa il contesto più lungo disponibile e normalizza i conteggi',()=>{
  const corpus=MODEL.corpusFrom(DATA.phases,correctDecisions());
  const model=MODEL.build(corpus.map(x=>x.text),3);
  const pred=MODEL.predict(model,'La squadra controlla');
  assert.equal(pred.used,3);
  assert.ok(pred.total>=2);
  assert.equal(pred.candidates[0].token,'il');
  assert.ok(Math.abs(pred.candidates.reduce((a,c)=>a+c.prob,0)-1)<1e-12);
  assert.ok(model.tokenCount>50);
  assert.ok(model.transitions>model.tokenCount);
});

test('le copie cambiano davvero le probabilità del modello',()=>{
  const right=correctDecisions();
  const cleanCorpus=MODEL.corpusFrom(DATA.phases,right,0);
  const dirty=correctDecisions();dirty.clean.c2='use';
  const dirtyCorpus=MODEL.corpusFrom(DATA.phases,dirty,0);
  const clean=MODEL.predict(MODEL.build(cleanCorpus.map(x=>x.text),3),'La squadra');
  const withCopy=MODEL.predict(MODEL.build(dirtyCorpus.map(x=>x.text),3),'La squadra');
  const p=(pred,token)=>pred.candidates.find(c=>c.token===token).prob;
  assert.ok(p(withCopy,'controlla')>p(clean,'controlla'));
});

test('il campionamento deterministico restituisce una candidata reale',()=>{
  const pred={candidates:[{token:'a',prob:.25},{token:'b',prob:.75}]};
  assert.equal(MODEL.sample(pred,()=>.1).token,'a');
  assert.equal(MODEL.sample(pred,()=>.9).token,'b');
  assert.equal(MODEL.sample({candidates:[]},()=>0),null);
});
