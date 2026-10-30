# Reseptien testipenkki

Tarkistaa reseptimuunnoksen sovelluksen omalla koodilla (`index.html`). Ajetaan tietokoneella, ei kuulu itse sovellukseen.

```
cd tools/resepti-testi
node testi.js        # yhteenveto
node testi.js --v    # jokaisen reseptin ainekset ja vaiheet
```

`reseptit.txt` sisältää 42 suomen- ja englanninkielistä reseptiä (osa tarkoituksella hankalia: numeroidut vaiheet ilman
otsikkoa, useita aineksia samalla rivillä, °F-lämpötilat, osaotsikot). Jokaisesta tarkistetaan:

- ainesrivien ja vaiheiden määrä
- ettei muunnettuun reseptiin jää eläinperäistä
- että tärkeät ainekset säilyvät
- lämpötilat °C:nä ilman tuplausta
- englanninkielinen resepti pysyy kokonaan englanninkielisenä
- piilo-eläinperäisistä (pesto, liemikuutio, viini…) tulee "tarkista pakkaus" -huomautus
- jokainen vaihtoehtoinen korvike ("muut korvikkeet") on vegaaninen ja samalla kielellä

Tulos 30.10.2026: 337 / 337 tarkistusta läpi.
