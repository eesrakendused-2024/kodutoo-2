# kodutoo-2
Täiusta tunnis loodud typer'i rakendust.

Tähtaeg: 05.05.2024 23:59

# Karmen Klaasen

## Link tööle - http://greeny.cs.tlu.ee/~karasen/finaltyper/typer.html

Lisatud feature - sõnade trükkimisel kõlab trükkimise heli. 

Pilt tulemuse osas ilmub pärast tulemuste tabeli vaatamist ehk kui mäng läbi saab ja tulemuste nupule vajutada ning see sulgeda, siis antakse kasutajale teada tema kiirus ja kuvatakse vastav pilt. 

Kasutatud pildid:

https://pixabay.com/illustrations/samuel-thumbs-up-laugh-cool-thumb-1233415/

https://pixabay.com/vectors/trophy-icon-winner-win-cup-award-1674911/

https://pixabay.com/illustrations/cup-victory-winner-award-gold-1010916/

https://pixabay.com/vectors/rocket-spaceship-launch-fire-stars-7757105/

https://pixabay.com/vectors/star-yellow-favorite-bookmark-297837/

Kasutatud heli:

https://www.chosic.com/download-audio/54458/

Kasutatud font:

https://fonts.google.com/selection/embed

Lisaks kasutatud ka ChatGPT'd. 

# Kõik nõuded täidetud, siis 20 punkti.

1. Kasuta veebilehel mõnda Google fonti: https://fonts.google.com/
2. Tulemused peavad tulema välja nupule vajutades ja minema peitu x vajutades. Võimalus kasutada tavalist modalit või sidebari. https://www.w3schools.com/howto/howto_css_modals.asp
3. Kuva tulemused paremini välja, kui praegu. Praegu lihtsalt tühikutega eraldatud tulemused, aga paiguta need eraldi elementidesse ja kujunda selgemalt. Lisa ka pealkirjad igale osale, et saaks aru, mis osaga on tegemist (nimi, kiirus jne).
4. Kuva kasutajel vastavalt trükkimiskiirusele pilti tulemuste osas. Näiteks võib võtta antud lingilt vahemikud ja vastavalt sellele kuvada erinevat pilti: https://www.typingpal.com/en/blog/good-typing-speed
5. Teha rakendus paremini kasutatavaks ka mobiilivaatest kasutades media query't: https://www.w3schools.com/css/css_rwd_mediaqueries.asp
6. Muuda lehe CSS-i vastavalt oma soovidele muutes ära kõik praegu rakenduses kasutusel olevad värvid, teksti suurused ja elementide mõõtmed. Ideid leiad siit: https://www.w3schools.com/css/default.asp
7. Leia moodus, kuidas kasutada CSS-is vähemalt 5-t erinevat pseudo class-i: https://www.w3schools.com/css/css_pseudo_classes.asp
8. Lisa omaltpoolt veel üks feature, mida hetkel rakenduses pole.

### GitHub'i töövoog kodutöö esitamiseks

1. *Fork*'i ülesande/projekti repositoorium (leiab [https://github.com/eesrakendused-2023/](https://github.com/eesrakendused-2023/)).
1. *Clone*'i see repositoorium enda arvutisse/serverisse ja määra repositooriumi URL kuhu edaspidi muudatusi salvestad.
  ```
  git clone https://YOURUSERNAME@github.com/YOURUSERNAME/REPOSITORY.git

  nt esimese iseseisva töö puhul:
  git clone https://jukujuurikas@github.com/jukujuurikas/1kodutoo.git
  ```
1. Lisa vajdusel oma nimi ja email repositooriumi omanikuks ([Setting your username](https://help.github.com/articles/setting-your-username-in-git/)). Vajadusel hangi endale privaatne e-post @users.noreply.github.com lõpuga (https://github.com/settings/emails)
  ```
  git config --global user.name "Tauri Kirsipuu"
  git config --global user.email taurikirsipuu@users.noreply.github.com
  ```
1. Muuda faile ülesande lahendamiseks ja *Commit*'i iga olulisem muudatus, kasutades kahte käsku.
  ```
  git add .
  ```
  ```
  git commit -m "Added this functionality to the app"
  ```
1. Veendu, et kogu kood on *Commit*'itud.
  ```
  git status
  ```
1. *Push/sync*'i muudatused GitHub'i.
  ```
  git push origin
  ```
1. [Ava *pull request*](https://help.github.com/articles/creating-a-pull-request) ülesande originaalses repositooriumis. Järgi üleasende esitamise tähtaega
1. Muudatusi ja täiendusi võib *push*'ida repositooriumisse, kuni ette antud kuupäevani.

Tagasisidet saab otse *pull request*'i millele ootan Sinupoolseid kommentaare/mõtteid/küsimusi. Võid julgselt avada *pull request*'i kohe kui hakkad kodutöö kallal tegelama ja siis kui hätta jääd võid esitada sinna küsimuse. Maini kommentaaris minu kasutajat `@taurikirsipuu` siis jõuan sellele kiiremini vastata.

### Nõuded

* Peab järgma "head programmeerimise stiili"
    * Muutujate nimed peavad kirjeldama muutujat ning peavad olema inglise keeles
    * Funktsiooni nimi peab olema "lühike"
    * Optimeeri koodi lugemiseks (real ~80 tähemärki)
    * Projektide jaoks tuleb kasutada objektorienteeritud lähenemist
    * Laenatud koodile tuleb viidata
* Boonuspunktid:
    * Loomingulisus (NB! nõuded peavad olema täidetud)


