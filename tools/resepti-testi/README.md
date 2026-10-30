# Reseptien testipenkki

Tarkistaa reseptimuunnoksen sovelluksen omalla koodilla (`index.html`). Ajetaan tietokoneella, ei kuulu itse sovellukseen.

```
cd tools/resepti-testi
node testi.js                    # yhteenveto (reseptit.txt)
node testi.js --v                # jokaisen reseptin ainekset ja vaiheet
SARJA=uudet.txt node testi.js    # uudet reseptit, joilla sääntöjä ei ole viritetty (myös uudet2.txt, uudet3.txt)
node rajaukset.js                # rajaukset: sokeriton, rasvaton, öljytön, vehnätön, gluteeniton, soijaton, pähkinätön, whole food
```

`reseptit.txt` sisältää 64 suomen- ja englanninkielistä reseptiä (osa tarkoituksella hankalia: numeroidut vaiheet ilman
otsikkoa, useita aineksia samalla rivillä, °F-lämpötilat, osaotsikot). Jokaisesta tarkistetaan:

- ainesrivien ja vaiheiden määrä
- ettei muunnettuun reseptiin jää eläinperäistä
- että tärkeät ainekset säilyvät
- lämpötilat °C:nä ilman tuplausta
- englanninkielinen resepti pysyy kokonaan englanninkielisenä
- piilo-eläinperäisistä (pesto, liemikuutio, viini…) tulee "tarkista pakkaus" -huomautus
- jokainen vaihtoehtoinen korvike ("muut korvikkeet") on vegaaninen ja samalla kielellä
- keittiökemia: aineksen tehtävä reseptissä päätellään oikein (esim. muna vaahtona, sitojana tai hyytyjänä; voi
  vaahdotettuna, murotaikinassa, lehtitaikinassa tai kuorrutteessa) ja korvike on tehtävään sopiva
- englanninkielisessä reseptissä myös perustelut ja muistiinpanot ovat englanniksi
- valitun korvikkeen ominaisuudet (rasva, proteiini, keittokestävyys, vaahtoutuminen, jähmettyminen) sopivat tehtävään
  sovelluksen tuotetietokannan mukaan

Tulokset 30.10.2026: `reseptit.txt` 642 / 642, `uudet.txt` (10 reseptiä, ei viritetty etukäteen) ensimmäisellä
ajolla 1 virheellinen tehtävä (voin ja sokerin vaahdotus tulkittiin munavaahdoksi), korjauksen jälkeen 114 / 114.

## Rajaukset

`rajaukset.js` ajaa jokaisen rajauksen jokaiselle reseptille (8 × 70) ja lisäksi 280 rajausyhdistelmää. Kielletty
aines ei saa jäädä ainesluetteloon eikä valmistusvaiheisiin, eläinperäistä ei saa jäädä, ja englanninkielinen resepti
pysyy englanninkielisenä. Whole food säilyttää tarkoituksella margariinin leivonnassa ja paistamisessa (siitä kerrotaan
muistiinpanoissa). Tulos 30.10.2026: kaikki kunnossa.

## Lisäsarjat 30.10.2026

`uudet2.txt` (37 reseptiä) ja `uudet3.txt` (16 reseptiä, muun muassa blogireseptin johdanto, englanninkieliset väliotsikot,
valmiit tuotteet kuten pullat ja kalapuikot) kirjoitettiin ennen korjauksia. Ensimmäisellä ajolla 96,0 % ja 94,9 %
tarkistuksista meni läpi. Löytyneet viat korjattiin:

- "kinkun", "lohen", "silakan" ym. taivutusmuodot jäivät tunnistamatta (ainesosatarkistus ja valmistusvaiheet)
- "voi-vesiseos", "vaivaa voi taikinaan" jäivät vaiheisiin; "Kuori:"-väliotsikko tulkittiin vaiheeksi
- "meat sauce", "fish fingers" ja kalapuikot vaiheissa; kalapuikoille vegaaninen valmistuote
- sama korvike kahdesti luettelossa ("silkkitofu, silkkitofu") ja sama aines kahdella rivillä (maissitärkkelys)
- verbi "cream" ("Cream the butter") vaihdettiin kasvikermaksi; tiramisun "the cream" (kreemi) tulkittiin kermaksi
- englanninkielisessä reseptissä suomenkielisiä sanoja (feta, jauhis, "vaahdoksi vatkattuna")
- "8 pullaa" tulkittiin annosmääräksi, vaikka pullat olivat aines
- uppomunat (shakshuka) ja kalan kypsyysohje ("kunnes kala irtoaa haarukalla")

Korjausten jälkeen kaikki sarjat: 642 + 114 + 297 + 137 = 1190 / 1190, rajaukset kunnossa.
