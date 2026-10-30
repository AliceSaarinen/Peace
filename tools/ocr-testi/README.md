# Tekstintunnistuksen testipenkki

Mittaa, kuinka hyvin sovellus lukee ainesosaluettelon kuvasta. Ajetaan tietokoneella, ei kuulu itse sovellukseen.

Testi tekee synteettisiä pakkauskuvia (tasainen etiketti, purkki suoraan edestä, purkki ylä- tai alakulmasta,
purkin ympäri kiertävä luettelo usealla kuvalla, pitkä luettelo usealla kuvalla, paljon muuta tekstiä, luettelo ilman
"Ainesosat:"-otsikkoa). Sitten se ajaa sovelluksen oman koodin (`index.html`) ja Tesseractin samalla suomen mallilla kuin sovellus.

Mittarit:
- **rec**: oikein ja oikeassa järjestyksessä luettujen sanojen osuus
- **prec**: luetusta tekstistä se osuus, joka on oikeasti ainesosaluetteloa (muu teksti ja roska laskee tätä)
- **missedIds**: eläinperäiset tai epävarmat ainesosat, jotka jäivät huomaamatta
- **verdictOk**: oliko vegaanisuustulos sama kuin oikeasta tekstistä

## Ajo

Tarvitaan Python 3 (numpy, opencv-python, pillow), Node.js ja Tesseract 5.

```
cd tools/ocr-testi
mkdir -p lang && cat ../../lang/fin-1.bin ../../lang/fin-2.bin | gunzip > lang/fin.traineddata
SEEDS=2 python3 gen.py cases
./bench.sh new tulos.json
```

Vertailu vanhaan versioon: tallenna vanha `index.html` esim. nimellä `vanha.html` ja aja `BASE=vanha.html ./bench.sh base vanha.json`.

## Tulokset 29.10.2026

| Tapaus | Ennen (rec / prec) | Nyt (rec / prec) |
|---|---|---|
| Purkin ympäri, useita kuvia | 59 % / 7 % | 80 % / 77 % |
| Purkki suoraan edestä | 72 % / 68 % | 79 % / 88 % |
| Purkki ylä- tai alakulmasta | 42 % / 35 % | 76 % / 90 % |
| Tasainen etiketti | 94 % / 89 % | 100 % / 100 % |
| Paljon muuta tekstiä | 100 % / 97 % | 99 % / 98 % |
| Ei "Ainesosat:"-otsikkoa | 98 % / 73 % | 97 % / 98 % |
| Pitkä luettelo, useita kuvia | 100 % / 50 % | 99 % / 97 % |
| Purkin ympäri, tiheä sarja (~30° välein, 9 kuvaa) | – | 95 % / 94 % |
| Purkin ympäri, skannaustilan tiheys (~14° välein, 17 kuvaa) | – | 98 % / 99 % |
| **Kaikki** | **81 % / 60 %** | **92 % / 94 %** |

Huomaamatta jääneet eläinperäiset ainesosat: 22 → 9. Oikea vegaanisuustulos: 52/56 → 55/56.
Jäljelle jääneet virheet ovat lähes kaikki yksittäisen purkkikuvan jyrkissä reunoissa, joista puuttuu tietoa.
Useampi kuva korjaa nämä, ja sovellus merkitsee epävarmat sanat käyttäjälle tarkistettaviksi.

## Skannaustila

Selaintesti (Chromium, kamerana video pyörivästä tölkistä): kaksi eri tuotetta, 15–16 automaattisesti otettua kuvaa,
100 % sanoista oikein, ei ylimääräistä tekstiä.

## Reseptin skannaus

Selaintesti (kamera liikkuu pitkää reseptisivua alaspäin): 4 automaattista kuvaa, 100 % sanoista oikein, ei toistoja.

## Englanninkieliset etiketit

Suomen mallilla ja englanninkielisellä sanastolla 28 synteettistä englanninkielistä etikettiä: 85 % / 91 %, oikea vegaanisuustulos 26/28.
Englannin oma malli toisi +1,4 prosenttiyksikköä mutta +11 Mt ladattavaa ja +40 % aikaa, joten sitä ei lisätty.

## PaddleOCR-kokeilu 29.10.2026

PP-OCRv5:n monikielinen ONNX-malli (tunnistus + luku) samalla testisarjalla: 78,5 % (Tesseract 90,7 %), noin 3× hitaampi
ja +21 Mt ladattavaa. Malli kadottaa ä/ö-pisteitä ja sanavälejä. Ei otettu käyttöön. Suomelle tarkoitettua latin-mallia ei
voitu tässä ympäristössä ladata kokeiltavaksi.
