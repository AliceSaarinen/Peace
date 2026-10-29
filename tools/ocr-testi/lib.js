/* Testipenkin apukirjasto: lataa sovelluksen koodin index.htmlistä, kuvien luku/kirjoitus (PGM), Tesseract-ajo ja mittarit. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const APP = process.env.APP || path.join(__dirname, '..', '..', 'index.html');
const LANG = path.join(__dirname, 'lang');

function loadApp(file = APP) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  globalThis.window = globalThis;
  const main = scripts.find(s => s.includes("'use strict';") && s.includes('const C = window.VegCore'));
  scripts.filter(s => s !== main && !s.includes('document.') ).forEach(s => { try { (0, eval)(s); } catch (e) { console.error('script', e.message); } });
  const cut = (a, b) => { const i = main.indexOf(a), j = main.indexOf(b, i + 1); if (i < 0 || j < 0) throw new Error('marker ' + a + ' / ' + b); return main.slice(i, j); };
  /* OCR-osuus pääskriptistä: kuvan esikäsittelystä tunnistusohjelman lataukseen asti + poiminta + rivitys */
  let code = cut('/* ---------- Kuvan esikäsittely', '/* ---------- TEKSTINTUNNISTUS');
  code += '\n' + cut('function pickIngredients', '/* Rajaus, kääntö ja suoristus');
  code += '\n' + cut('/* ---------- Kuvasta luetun tekstin rivitys', 'async function ocrRecipe');
  if (main.includes('/* ---------- Kaarevan pinnan suoristus')) code = cut('/* ---------- Kaarevan pinnan suoristus', '/* ---------- Kuvan esikäsittely') + '\n' + code;
  const names = [...code.matchAll(/^ {0,2}(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(m => m[1]);
  if (/^ {0,2}const OG = /m.test(code)) names.push('OG');
  const fn = new Function('S', 'saveSettings', code + '\nreturn {' + [...new Set(names)].join(',') + '};');
  return Object.assign(fn(undefined, () => { }), { VegCore: globalThis.VegCore, code });
}

function readPGM(file) {
  const b = fs.readFileSync(file);
  let p = 0; const tok = () => { while (/\s/.test(String.fromCharCode(b[p]))) p++; if (b[p] === 35) { while (b[p] !== 10) p++; return tok(); } let s = ''; while (!/\s/.test(String.fromCharCode(b[p]))) s += String.fromCharCode(b[p++]); return s; };
  if (tok() !== 'P5') throw new Error('not P5');
  const w = +tok(), h = +tok(); tok(); p++;
  const d = new Float32Array(w * h); for (let i = 0; i < w * h; i++) d[i] = b[p + i];
  return { w, h, d };
}
function writePGM(file, im) {
  const head = Buffer.from(`P5\n${im.w} ${im.h}\n255\n`), px = Buffer.alloc(im.w * im.h);
  for (let i = 0; i < px.length; i++) px[i] = Math.max(0, Math.min(255, Math.round(im.d[i])));
  fs.writeFileSync(file, Buffer.concat([head, px]));
}
/* kokomuutos: alasskaalaus keskiarvolla, ylösskaalaus bilineaarisesti (vastaa canvasin "high" -laatua) */
function resize(im, W, H) {
  const { w, h, d } = im, o = new Float32Array(W * H);
  const sx = w / W, sy = h / H;
  if (sx >= 1 && sy >= 1) {
    for (let y = 0; y < H; y++) { const y0 = y * sy, y1 = y0 + sy; for (let x = 0; x < W; x++) { const x0 = x * sx, x1 = x0 + sx; let s = 0, a = 0; for (let yy = Math.floor(y0); yy < Math.min(h, Math.ceil(y1)); yy++) { const wy = Math.min(y1, yy + 1) - Math.max(y0, yy); for (let xx = Math.floor(x0); xx < Math.min(w, Math.ceil(x1)); xx++) { const wx = Math.min(x1, xx + 1) - Math.max(x0, xx); s += d[yy * w + xx] * wx * wy; a += wx * wy; } } o[y * W + x] = s / a; } }
  } else {
    for (let y = 0; y < H; y++) { const fy = Math.max(0, Math.min(h - 1.001, (y + .5) * sy - .5)), y0 = fy | 0, ty = fy - y0; for (let x = 0; x < W; x++) { const fx = Math.max(0, Math.min(w - 1.001, (x + .5) * sx - .5)), x0 = fx | 0, tx = fx - x0; const i = y0 * w + x0; o[y * W + x] = (d[i] * (1 - tx) + d[i + 1] * tx) * (1 - ty) + (d[i + w] * (1 - tx) + d[i + w + 1] * tx) * ty; } }
  }
  return { w: W, h: H, d: o };
}
/* sovelluksen prepOcr-mitoitus */
function appScale(im) {
  const big = Math.max(im.w, im.h);
  const k = Math.min(big > 2400 ? 2400 / big : Math.min(3, 1800 / Math.max(1, im.w)), 3200 / big);
  return resize(im, Math.round(im.w * k), Math.round(im.h * k));
}

/* Tesseract: palauttaa {text, lines:[{t,x0,x1,y0,y1,p,words:[{t,conf,x0,..}]}]} */
let tmpN = 0;
function tess(im, psm = 6) {
  const f = path.join(__dirname, 'tmp', `t${process.pid}_${tmpN++}.pgm`); fs.mkdirSync(path.dirname(f), { recursive: true });
  writePGM(f, im);
  const out = cp.execFileSync('tesseract', [f, 'stdout', '--tessdata-dir', LANG, '-l', 'fin', '--psm', String(psm), '-c', 'preserve_interword_spaces=1', '-c', 'tessedit_create_tsv=1'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
  fs.unlinkSync(f);
  const rows = out.trim().split('\n').slice(1).map(l => l.split('\t'));
  const map = new Map(); let pid = 0; const pmap = new Map();
  rows.forEach(r => {
    const [lvl, pg, blk, par, ln, wn, left, top, wd, ht, conf, ...txt] = r; const t = txt.join('\t');
    if (lvl !== '5') return;
    const key = blk + '.' + par + '.' + ln, pk = blk + '.' + par;
    if (!pmap.has(pk)) pmap.set(pk, ++pid);
    if (!map.has(key)) map.set(key, { words: [], p: pmap.get(pk) });
    if (t.trim()) map.get(key).words.push({ t, conf: +conf, x0: +left, y0: +top, x1: +left + +wd, y1: +top + +ht });
  });
  const lines = [...map.values()].filter(l => l.words.length).map(l => ({ t: l.words.map(w => w.t).join(' '), words: l.words, p: l.p, x0: Math.min(...l.words.map(w => w.x0)), x1: Math.max(...l.words.map(w => w.x1)), y0: Math.min(...l.words.map(w => w.y0)), y1: Math.max(...l.words.map(w => w.y1)) }));
  return { text: lines.map(l => l.t).join('\n'), lines };
}

/* mittarit */
const toks = s => (String(s).toLowerCase().normalize('NFC').match(/[a-zäöå0-9]+/g) || []);
function lcs(a, b) { const n = a.length, m = b.length; let prev = new Uint16Array(m + 1), cur = new Uint16Array(m + 1); for (let i = 1; i <= n; i++) { for (let j = 1; j <= m; j++) cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); [prev, cur] = [cur, prev]; } return prev[m]; }
function ids(VC, text) { const r = VC.analyze(text, { category: 'food' }); const s = new Set(); ['animal', 'aid', 'maybe', 'likely'].forEach(k => r[k].forEach(g => s.add(g.e.id))); const may = new Set(r.may.map(g => g.e.id)); return { s, may, verdict: r.verdict }; }
function score(VC, gt, out) {
  const A = toks(gt), B = toks(out), L = lcs(A, B);
  const g = ids(VC, gt), o = ids(VC, out);
  const missed = [...g.s].filter(x => !o.s.has(x)), extra = [...o.s].filter(x => !g.s.has(x));
  return { rec: L / Math.max(1, A.length), prec: L / Math.max(1, B.length), missed, extra, verdictOk: g.verdict === o.verdict, gtVerdict: g.verdict, outVerdict: o.verdict };
}
module.exports = { loadApp, readPGM, writePGM, resize, appScale, tess, score, toks, lcs };
