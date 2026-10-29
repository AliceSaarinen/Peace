/* Uusi putki testipenkissä: sama logiikka kuin sovelluksen ocrRun-funktiossa */
'use strict';
module.exports = (A, L, shots, opt = {}) => {
  const OG = A.OG, log = [];
  const res = shots.map((g, k) => {
    /* sama kuin sovelluksen prepOcr: enintään 2400 px, suoristus ja mittakaava; jos tekstiä ei löydy, entinen mitoitus */
    const big = Math.max(g.w, g.h), im = big > 2400 ? OG.resize(g, g.w * 2400 / big, g.h * 2400 / big) : g;
    const en = x => ({ w: x.w, h: x.h, d: A.enhanceGray(Float32Array.from(x.d), x.w, x.h) });
    let p = OG.prepShot(en(im));
    if (!p.hc) { const s = L.appScale(g); p = { im: en(s), info: { fallback: true } }; }
    log.push(p.info);
    if (opt.dir && process.env.DUMP) L.writePGM(require('path').join(opt.dir, `dbg_${k}.pgm`), p.im);
    return L.tess(p.im, +(process.env.PSM || 4));
  });
  const groups = A.ocrMergeShots(res);
  let text = '', unsure = [];
  groups.forEach(lines => { const s = A.ocrSelect(lines); text = A.ocrJoin(text, s.text); unsure.push(...s.unsure); });
  if (process.env.LOG) console.error(JSON.stringify(log), groups.length);
  return { text, unsure, log };
};
