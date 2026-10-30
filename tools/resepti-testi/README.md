# Reseptien testipenkki

Tarkistaa reseptimuunnoksen sovelluksen omalla koodilla (`index.html`). Ajetaan tietokoneella, ei kuulu itse sovellukseen.

```
cd tools/resepti-testi
node testi.js                    # yhteenveto (reseptit.txt)
node testi.js --v                # jokaisen reseptin ainekset ja vaiheet
SARJA=uudet.txt node testi.js    # uudet reseptit, joilla sääntöjä ei ole viritetty
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
