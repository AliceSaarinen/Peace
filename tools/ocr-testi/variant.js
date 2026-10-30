/* kokeilu: vaihtoehtoiset käsittelyt samalle kuvalle (sama geometria) */
function otsu(im) { const h = new Float64Array(256); im.d.forEach(v => h[Math.max(0, Math.min(255, v | 0))]++); const n = im.d.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i]; let sB = 0, wB = 0, best = 0, th = 128; for (let i = 0; i < 256; i++) { wB += h[i]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += i * h[i]; const mB = sB / wB, mF = (sum - sB) / wF, b = wB * wF * (mB - mF) ** 2; if (b > best) { best = b; th = i; } } return { w: im.w, h: im.h, d: im.d.map(v => v > th ? 255 : 0) }; }
function gamma(im) { return { w: im.w, h: im.h, d: im.d.map(v => 255 * Math.pow(Math.max(0, Math.min(255, v)) / 255, 1.8)) }; }
function sharp(im) { const { w, h, d } = im, o = new Float32Array(d.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; const l = x ? d[i - 1] : d[i], r = x < w - 1 ? d[i + 1] : d[i], u = y ? d[i - w] : d[i], b = y < h - 1 ? d[i + w] : d[i]; o[i] = Math.max(0, Math.min(255, 5 * d[i] - l - r - u - b)); } return { w, h, d: o }; }
/* sanakohtainen valinta: sama geometria, joten sanat vastaavat toisiaan sijainnin perusteella */
function vote(base, vars, known) {
  const allW = vars.flatMap(r => r.lines.flatMap(l => l.words));
  let changed = 0;
  base.lines.forEach(l => { l.words.forEach(w => {
    if (known(w.t)) return;
    const cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2;
    const cands = allW.filter(v => cx > v.x0 && cx < v.x1 && cy > v.y0 && cy < v.y1 && Math.abs((v.x1 - v.x0) - (w.x1 - w.x0)) < (w.x1 - w.x0) * 0.4);
    const good = cands.filter(v => known(v.t)).sort((a, b) => b.conf - a.conf)[0];
    if (good) { w.t = good.t; w.conf = Math.max(w.conf, good.conf); changed++; }
  }); l.t = l.words.map(w => w.t).join(' '); });
  if (process.env.LOG) console.error('vote changed', changed);
  base.text = base.lines.map(l => l.t).join('\n');
  return base;
}
module.exports = { otsu, gamma, sharp, vote };
