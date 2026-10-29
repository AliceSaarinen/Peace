"""Synteettiset pakkausetiketit testaukseen.
Tuottaa tapauksia: tasainen, lieriö (reunat), lieriö yläkulmasta (kaarevat rivit),
lieriön ympäri kiertävä luettelo (3 kuvaa vaakaan), pitkä luettelo (3 kuvaa pystyyn), paljon sekatekstiä.
Jokaisesta tapauksesta: shot_k.png (väri) + shot_k.pgm (harmaa) + gt.txt (suomenkielinen ainesosaluettelo).
"""
import json, os, sys, math, random
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else 'cases'
FONTS = ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
BOLD = ['/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']

PRODUCTS = [
  dict(title='KAURAKEKSI', claim='Rapeat ja herkulliset keksit koko perheelle!',
       ing='Ainesosat: täysjyväkaurahiutaleet (32 %), vehnäjauho, sokeri, kasvirasva (palmu, rypsi), MAITOJAUHE, glukoosisiirappi, kananmuna, suola, nostatusaineet (E500, E503), emulgointiaine (soijalesitiini), aromi.',
       may='Saattaa sisältää pieniä määriä pähkinää ja seesaminsiementä.',
       sv='Ingredienser: fullkornshavreflingor (32 %), vetemjöl, socker, vegetabiliskt fett (palm, raps), MJÖLKPULVER, glukossirap, ägg, salt.'),
  dict(title='TOMAATTIKEITTO', claim='Lämmitä ja nauti. Ei lisättyjä säilöntäaineita.',
       ing='Ainesosat: vesi, tomaattipyree (35 %), sipuli, porkkana, rypsiöljy, kerma (MAITO), sokeri, suola, maissitärkkelys, valkosipuli, basilika, mustapippuri, happamuudensäätöaine (sitruunahappo).',
       may='Saattaa sisältää selleriä.',
       sv='Ingredienser: vatten, tomatpuré (35 %), lök, morot, rapsolja, grädde (MJÖLK), socker, salt.'),
  dict(title='SUKLAAPATUKKA', claim='Uusi ja entistä parempi resepti!',
       ing='Ainesosat: sokeri, kaakaovoi, täysmaitojauhe, kaakaomassa, herajauhe (MAITO), voirasva, emulgointiaine (auringonkukkalesitiini), vaniljauute, gelatiini, karmiini, mehiläisvaha.',
       may='Saattaa sisältää hasselpähkinää, mantelia ja vehnää.',
       sv='Ingredienser: socker, kakaosmör, helmjölkspulver, kakaomassa, vasslepulver (MJÖLK), smörfett, gelatin.'),
  dict(title='KASVISPIHVI', claim='Proteiinia kasveista. Valmis kahdessa minuutissa.',
       ing='Ainesosat: vesi, herneproteiini (18 %), rypsiöljy, perunatärkkelys, kaurahiutale, sipuli, metyyliselluloosa, suola, hiivauute, savuaromi, punajuurimehutiiviste, mustapippuri, mausteet.',
       may='Valmistettu tehtaassa, jossa käsitellään myös kananmunaa ja maitoa.',
       sv='Ingredienser: vatten, ärtprotein (18 %), rapsolja, potatisstärkelse, havreflingor, lök, salt.'),
]
NUTR = 'Ravintosisältö 100 g: Energia 1850 kJ / 440 kcal, Rasva 17 g, josta tyydyttyneitä 8,1 g, Hiilihydraatit 62 g, josta sokereita 21 g, Proteiini 7,4 g, Suola 0,9 g.'
TAIL = 'Säilytys kuivassa ja viileässä. Parasta ennen: katso pakkauksen pohja. Valmistaja: Esimerkki Oy, Teollisuuskatu 5, 00510 Helsinki.'

def wrap(draw, text, font, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def label(p, width, fsize, rng, extra=True, bold_kw=True):
    """Tasainen etiketti. Palauttaa (kuva, gt)."""
    fi = rng.randrange(len(FONTS))
    f = ImageFont.truetype(FONTS[fi], fsize); fb = ImageFont.truetype(BOLD[fi], fsize)
    ft = ImageFont.truetype(BOLD[fi], int(fsize * 2.2)); fs = ImageFont.truetype(FONTS[fi], int(fsize * 0.9))
    tmp = ImageDraw.Draw(Image.new('L', (10, 10)))
    m = int(fsize * 1.4); lh = int(fsize * 1.32)
    blocks = []
    if extra:
        blocks += [(p['title'], ft, int(fsize * 2.7)), (p['claim'], f, lh), ('', f, lh // 2)]
    blocks += [(p['ing'], f, lh), (p['may'], f, lh)]
    if extra:
        blocks += [('', f, lh // 2), (p['sv'], fs, int(lh * .9)), ('', f, lh // 2), (NUTR, fs, int(lh * .9)), (TAIL, fs, int(lh * .9))]
    rows = []
    for text, font, h in blocks:
        if not text: rows.append(('', font, h)); continue
        for ln in wrap(tmp, text, font, width - 2 * m): rows.append((ln, font, h))
    H = sum(r[2] for r in rows) + 2 * m
    bg = rng.choice([(250, 246, 236), (255, 255, 255), (245, 240, 225), (236, 244, 236)])
    img = Image.new('RGB', (width, H), bg); d = ImageDraw.Draw(img)
    ink = rng.choice([(25, 25, 25), (40, 30, 20), (20, 40, 25)])
    y = m
    for text, font, h in rows:
        if text:
            # isot kirjaimet (allergeenit) lihavoituna
            x = m
            for tok in text.split(' '):
                fo = fb if (bold_kw and font is f and tok.strip(',.()').isupper() and len(tok) > 2) else font
                d.text((x, y), tok, font=fo, fill=ink); x += d.textlength(tok + ' ', font=fo)
        y += h
    gt = p['ing'] + ' ' + p['may']
    return img, gt

def shade(img, rng, glare=True):
    a = img.astype(np.float32)
    h, w = a.shape[:2]
    # valaistusgradientti
    gx = np.linspace(rng.uniform(.75, 1), rng.uniform(.8, 1.05), w)[None, :, None]
    gy = np.linspace(rng.uniform(.85, 1.05), rng.uniform(.8, 1), h)[:, None, None]
    a = a * gx * gy
    if glare:
        cx = rng.uniform(.3, .7) * w; sig = rng.uniform(.02, .06) * w
        g = np.exp(-((np.arange(w) - cx) ** 2) / (2 * sig ** 2))[None, :, None]
        a = a + g * rng.uniform(60, 140)
    a = cv2.GaussianBlur(a, (0, 0), rng.uniform(.6, 1.2))
    a = a + np.random.default_rng(rng.randrange(1 << 30)).normal(0, rng.uniform(3, 7), a.shape)
    return np.clip(a, 0, 255).astype(np.uint8)

def cylinder_view(lab, R, D, f, h0, rot, outw, outh, rng, roll=0.0, cy=None):
    """Etiketti lieriön pinnalla. lab: HxWx3 (etiketin x = kaaren pituus). Kamera akselin suuntaan katsoen etäisyydellä D,
    korkeudella h0 (etiketin pikseleinä etiketin keskeltä). rot = lieriön kierto (rad). Palauttaa kuvan."""
    H, W = lab.shape[:2]
    X = (np.arange(outw) - outw / 2)[None, :].repeat(outh, 0).astype(np.float64)
    if cy is None: cy = -f * h0 / (D - R)
    Y = (np.arange(outh) - outh / 2 + cy)[:, None].repeat(outw, 1).astype(np.float64)
    if roll:
        c, s = math.cos(roll), math.sin(roll); X, Y = c * X - s * Y, s * X + c * Y
    a = X / f
    q = a * D / (R * np.sqrt(1 + a * a))
    ok = np.abs(q) < 1
    th = np.arcsin(np.clip(q, -1, 1)) - np.arctan(a)
    z = R * np.cos(th)
    y = h0 + Y / f * (D - z)
    u = R * (th + rot) + W / 2
    v = y + H / 2
    ok &= (u >= 0) & (u < W) & (v >= 0) & (v < H) & (np.abs(th) < 1.45)
    bgc = np.array(rng.choice([(70, 70, 75), (120, 110, 95), (180, 180, 185)]), np.float32)
    out = cv2.remap(lab, u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=bgc.tolist())
    # lieriön varjostus: reunat tummempia
    sh = (0.55 + 0.45 * np.cos(th).clip(0, 1))[..., None]
    out = np.where(ok[..., None], out * sh, bgc).astype(np.float32)
    return np.clip(out, 0, 255).astype(np.uint8)

def flat_view(lab, outw, outh, rng, y0=0, persp=0.04, scale=1.0, rot=0.0):
    H, W = lab.shape[:2]
    src = np.float32([[0, y0], [W, y0], [W, y0 + outh / scale], [0, y0 + outh / scale]])
    j = lambda: rng.uniform(-persp, persp) * outw
    dst = np.float32([[j(), j()], [outw + j(), j()], [outw + j(), outh + j()], [j(), outh + j()]])
    M = cv2.getPerspectiveTransform(src, dst)
    if rot: M = cv2.getRotationMatrix2D((outw / 2, outh / 2), rot, 1.0).tolist() + [[0, 0, 1]]; M = np.float32(M) @ cv2.getPerspectiveTransform(src, dst)
    return cv2.warpPerspective(lab, M, (outw, outh), borderMode=cv2.BORDER_CONSTANT, borderValue=(90, 90, 90))

def save(case, shots, gt, meta):
    d = os.path.join(OUT, case); os.makedirs(d, exist_ok=True)
    for k, s in enumerate(shots):
        cv2.imwrite(os.path.join(d, f'shot_{k}.png'), cv2.cvtColor(s, cv2.COLOR_RGB2BGR))
        g = cv2.cvtColor(s, cv2.COLOR_RGB2GRAY)
        cv2.imwrite(os.path.join(d, f'shot_{k}.pgm'), g)
    open(os.path.join(d, 'gt.txt'), 'w').write(gt)
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'))

def main():
    n = 0
    for seed in range(int(os.environ.get('SEEDS', '2'))):
        for pi, p in enumerate(PRODUCTS):
            rng = random.Random(seed * 100 + pi)
            fs = rng.choice([26, 30, 34])
            # 1) tasainen, vain ainesosat (kontrolli)
            lab, gt = label(p, 1500, fs, rng, extra=False); L = np.array(lab)
            save(f'flat_s{seed}_{pi}', [shade(flat_view(L, 1400, int(L.shape[0] * 1400 / 1500), rng, persp=.02, scale=1400 / 1500), rng, glare=False)], gt, dict(kind='flat'))
            # 2) tasainen, paljon muuta tekstiä
            lab, gt = label(p, 1500, fs, rng, extra=True); L = np.array(lab)
            save(f'mixed_s{seed}_{pi}', [shade(flat_view(L, 1400, int(L.shape[0] * 1400 / 1500), rng, persp=.03, scale=1400 / 1500), rng)], gt, dict(kind='mixed'))
            # 2b) sekateksti ilman "Ainesosat:"-otsikkoa
            p2 = dict(p); p2['ing'] = p['ing'].split(': ', 1)[1]; p2['ing'] = p2['ing'][0].upper() + p2['ing'][1:]
            lab, gt = label(p2, 1500, fs, rng, extra=True); L = np.array(lab)
            save(f'nokw_s{seed}_{pi}', [shade(flat_view(L, 1400, int(L.shape[0] * 1400 / 1500), rng, persp=.03, scale=1400 / 1500), rng)], gt, dict(kind='nokw'))
            # 3) lieriö suoraan edestä: reunat puristuvat
            R = rng.uniform(520, 700); W = int(R * 2.3)
            lab, gt = label(p, W, fs, rng, extra=False); L = np.array(lab)
            f = rng.uniform(2.6, 3.2) * R; D = 4.0 * R
            outw = int(2 * R * f / D * 1.15); outh = int(L.shape[0] * f / (D - R) * 1.15)
            save(f'cyl_s{seed}_{pi}', [shade(cylinder_view(L, R, D, f, 0, 0, outw, outh, rng), rng)], gt, dict(kind='cyl', R=R))
            # 4) lieriö ylä/alakulmasta: rivit kaartuvat
            h0 = rng.choice([-1, 1]) * rng.uniform(1.2, 2.0) * L.shape[0]
            save(f'cylup_s{seed}_{pi}', [shade(cylinder_view(L, R, D, f, h0, 0, outw, int(outh * 1.15), rng, roll=rng.uniform(-.03, .03)), rng)], gt, dict(kind='cylup', R=R))
            # 5) lieriön ympäri kiertävä luettelo, 3 kuvaa
            R2 = rng.uniform(380, 480); W2 = int(R2 * 2 * math.pi * .78)
            lab, gt = label(p, W2, fs, rng, extra=False); L = np.array(lab)
            f2 = rng.uniform(2.6, 3.0) * R2; D2 = 4.0 * R2
            outw2 = int(2 * R2 * f2 / D2 * 1.15); outh2 = int(L.shape[0] * f2 / (D2 - R2) * 1.2)
            span = (W2 / R2) / 2 - 0.55
            step = [1.0, 1.3][seed % 2]; nsh = int(math.ceil(2 * span / step)) + 1
            rots = list(np.linspace(-span, span, nsh))
            shots = [shade(cylinder_view(L, R2, D2, f2, rng.uniform(-.3, .3) * L.shape[0], r, outw2, outh2, rng), rng) for r in rots]
            save(f'around_s{seed}_{pi}', shots, gt, dict(kind='around', R=R2, rots=[float(r) for r in rots]))
            # 6) pitkä kapea luettelo (pussi), 3 kuvaa ylhäältä alas
            lab, gt = label(p, 620, fs, rng, extra=False); L = np.array(lab)
            Hh = L.shape[0]; win = int(Hh * .48); ys = [0, int((Hh - win) / 2), Hh - win]
            sc = 1.6
            shots = [shade(flat_view(L, int(620 * sc), int(win * sc), rng, y0=y, persp=.03, scale=sc), rng) for y in ys]
            save(f'tall_s{seed}_{pi}', shots, gt, dict(kind='tall'))
            n += 6
    print(n, 'cases')

main()
