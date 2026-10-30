# Reseptien testipenkki

Tarkistaa reseptimuunnoksen sovelluksen omalla koodilla (`index.html`). Ajetaan tietokoneella, ei kuulu itse sovellukseen.

```
cd tools/resepti-testi
node testi.js                    # yhteenveto (reseptit.txt)
node testi.js --v                # jokaisen reseptin ainekset ja vaiheet
SARJA=uudet.txt node testi.js    # uudet reseptit, joilla sääntöjä ei ole viritetty
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
- valitun korvikkeen ominaisuudet (rasva, proteiini, keittokestävyys, vaahtoutuminen, jähmettyminen) sopivat tehtävään
  sovelluksen tuotetietokannan mukaan

Tulokset 30.10.2026: `reseptit.txt` 615 / 615, `uudet.txt` (10 reseptiä, ei viritetty etukäteen) ensimmäisellä
ajolla 1 virheellinen tehtävä (kermavaahdotettu kakku tulkittiin munavaahdoksi), korjauksen jälkeen 110 / 110.
