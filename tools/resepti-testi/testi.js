/* Reseptien testipenkki: node testi.js [--v]  (lukee ../../index.html) */
'use strict';
globalThis.window = globalThis;
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.env.APP || path.join(__dirname, '..', '..', 'index.html'), 'utf8');
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => !s.includes('const C = window.VegCore') && !s.includes('document.')).forEach(s => { try { (0, eval)(s); } catch (e) { console.error('skripti', e.message); } });
const C = globalThis.VegCore, RR = globalThis.VegRules;
const V = process.argv.includes('--v');
const blocks = fs.readFileSync(path.join(__dirname, process.env.SARJA || 'reseptit.txt'), 'utf8').split(/^### /m).slice(1);
let ok = 0, tot = 0; const fails = {};
/* korvikkeen ryhmän kaikki rivit tekstiksi (pellavarouhe + vesi) */
const i2s = (r, it) => it._g ? r.ingredients.filter(x => x._g === it._g).map(x => x.name).join(' + ') : it.name;
const fail = (k, n, msg) => { (fails[k] = fails[k] || []).push(n + ': ' + msg); };
blocks.forEach(b => {
  const [head, ...rest] = b.split('\n'); const text = rest.join('\n').trim();
  const [name, nIng, nStep, must, check, expect] = head.split('|').map(s => s.trim());
  const en = RR.isEnglish(text);
  const cls = C.classify(text, '', [], { noTitle: true });
  const ings = cls.lines.filter(l => l.k === 'ing'), steps = cls.lines.filter(l => l.k === 'step');
  const p = C.buildParsed(cls);
  const r = C.convertParsed(p, text, [], [], { lang: process.env.LANGFI ? 'fi' : (en ? 'en' : 'fi') });
  const outIng = r.ingredients.filter(i => !i.head);
  const ingNames = outIng.map(i => (C.ingText ? C.ingText(i) : i.name)).join('\n').toLowerCase();
  const all = outIng.map(i => i.name).join(', ') + '\n' + r.steps.join('\n');
  const a = C.analyze(all, { category: 'food' });
  let pass = true;
  const t = (cond, k, msg) => { tot++; if (cond) ok++; else { pass = false; fail(k, name, msg); } };
  t(ings.length === +nIng, 'aineksia', `odotettu ${nIng}, saatu ${ings.length}: ${ings.map(x => x.t).join(' | ')}`);
  t(steps.length === +nStep, 'vaiheita', `odotettu ${nStep}, saatu ${steps.length}`);
  t(!a.animal.length && !a.aid.length, 'eläinperäistä jäi', [...a.animal, ...a.aid].map(g => g.e.id + ':' + g.hits.join('/')).join(', '));
  (must || '').split(',').filter(Boolean).forEach(w => t(ingNames.includes(w.trim().toLowerCase()), 'puuttuu aines', `"${w}" ei löydy: ${ingNames.replace(/\n/g, ' | ')}`));
  t(!/°\s*F\b|\d\s*F\b/.test(r.steps.join(' ')) && !/°C\s*\(\s*\d+\s*°\s*C\s*\)/.test(r.steps.join(' ')), 'lämpötila', r.steps.join(' ').match(/.{0,30}°.{0,20}/g));
  if (en) t(!/[äöå]/i.test(outIng.map(i => i.name).join(' ')), 'kieli sekaisin', outIng.map(i => i.name).join(' | '));
  const FI_WORD = /[äöå]|\b(kuutioina|viipaleina|suikaleina|valinnainen|halutessa|tai|ja|noin|esim|sekoita|lisää|paista|keitä)\b/i;
  if (en) { const bad = outIng.map(i => i.note || '').concat(r.steps).filter(x => FI_WORD.test(x)); t(!bad.length, 'suomea englanninkielisessä', bad.join(' | ')); }
  (check || '').split(',').filter(Boolean).forEach(w => { const it = outIng.find(i => (i.name + ' ' + (i.note || '')).toLowerCase().includes(w.trim())); t(it && (it.changed || /tarkista|valitse|check|choose/i.test(it.note || '')), 'ei pakkausvaroitusta', w); });
  /* keittiökemia: odotettu tehtävä ja korvike, ja korvikkeen ominaisuudet sopivat tehtävään */
  const CH = window.VegChem;
  (expect || '').split(';').filter(Boolean).forEach(x => { const [k, w] = x.split('=').map(y => y.trim());
    const it = outIng.find(i => i._role && i._role.key === k);
    t(it && (!w || C.prepText(i2s(r, it)).includes(C.prepText(w).trim())), 'tehtävä tai korvike väärin', k + (w ? '=' + w : '') + ' | saatu: ' + outIng.filter(i => i._role).map(i => i._role.key + '→' + i.name).join(', ')); });
  outIng.filter(i => i._role).forEach(i => { const id = CH.idOf(i.name) || CH.idOf(i._role.sub); if (!id || !CH.NEED[i._role.key]) return; const f = CH.fit(CH.P[id], i._role.key); t(f >= 0.5, 'korvike ei sovi tehtävään', `${i._role.key} → ${i.name} (sopivuus ${f.toFixed(2)})`); });
  /* jokainen vaihtoehtoinen korvike: ei eläinperäistä eikä kielisekoitusta */
  outIng.filter(i => i._alt).forEach(k => { for (let ai = 1; ai <= k._alt.n; ai++) {
    const r2 = C.convertParsed(p, text, [], [], { lang: process.env.LANGFI ? 'fi' : (en ? 'en' : 'fi'), alt: { [k._alt.key]: ai } });
    const o2 = r2.ingredients.filter(i => !i.head), a2 = C.analyze(o2.map(i => i.name).join(', ') + '\n' + r2.steps.join('\n'), { category: 'food' });
    t(!a2.animal.length && !a2.aid.length, 'vaihtoehdossa eläinperäistä', k._alt.from + ' #' + ai + ': ' + [...a2.animal, ...a2.aid].map(g => g.e.id + ':' + g.hits.join('/')).join(', '));
    if (en) t(!/[äöå]/i.test(o2.map(i => i.name).join(' ')), 'vaihtoehto kieli sekaisin', k._alt.from + ' #' + ai + ': ' + o2.map(i => i.name).join(' | '));
  } });
  if (V || !pass) { console.log((pass ? 'OK   ' : 'VIKA ') + name); if (V) { outIng.forEach(i => console.log('   A: ' + C.ingText(i) + (i.note ? '  [' + i.note + ']' : ''))); r.steps.forEach(s => console.log('   V: ' + s)); } }
});
console.log('\nTarkistuksia läpi: ' + ok + ' / ' + tot + ` (${(100 * ok / tot).toFixed(1)} %)`);
Object.entries(fails).forEach(([k, v]) => { console.log('\n== ' + k + ' (' + v.length + ')'); v.forEach(x => console.log('  ' + x.slice(0, 400))); });
