/* Käyttö: node run.js <pipeline> <casedir>  → tulostaa JSON-rivin.  pipeline: base | new */
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib');
const [, , pipe, dir] = process.argv;
const A = L.loadApp(pipe === 'base' ? process.env.BASE : undefined);
const shots = fs.readdirSync(dir).filter(f => /^shot_\d+\.pgm$/.test(f)).sort().map(f => L.readPGM(path.join(dir, f)));
const gt = fs.readFileSync(path.join(dir, 'gt.txt'), 'utf8');
const t0 = Date.now();
let out = '';
if (pipe === 'base') {
  /* nykyinen sovellus (Tarkista-välilehti): jokainen kuva erikseen, teksti peräkkäin */
  const parts = shots.map(im => {
    const s = L.appScale(im);
    const e = { w: s.w, h: s.h, d: A.enhanceGray(s.d, s.w, s.h) };
    const r = L.tess(e, 6);
    let t = r.text; try { t = A.fixOcrText(t); } catch (x) { }
    return A.pickIngredients(t);
  });
  out = parts.join(' ');
} else {
  const np = require('./newpipe')(A, L, shots, { dir }); out = np.text; globalThis.UNSURE = np.unsure;
}
const sc = L.score(A.VegCore, gt, out);
console.log(JSON.stringify(Object.assign({ case: path.basename(dir), pipe, ms: Date.now() - t0, out, unsure: globalThis.UNSURE }, sc)));
