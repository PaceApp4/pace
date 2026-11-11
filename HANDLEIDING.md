# Pace – handleiding versie 2.1

Geschreven voor Windows 11 en een iPhone. Namen van knoppen kunnen per versie een klein beetje afwijken.

## Wat is nieuw in versie 2

**Uiterlijk**
- Nieuwe, zakelijke stijl met lichte en donkere modus. De app volgt automatisch je iPhone; je kunt het ook vastzetten bij **Meer › Weergave**.

**Vandaag**
- Grote calorie-ring met daaronder drie kleine ringen voor eiwitten, koolhydraten en vetten.
- Water toevoegen met **+250** en **+500** zonder te scrollen, met een knop om de laatste ongedaan te maken.
- Slaapscore en stappen. Tik op een van de twee kaarten om ze zelf in te vullen, of gebruik **Stappen en slaap plakken uit Opdracht** (de koppeling met Apple Gezondheid stellen we in de volgende stap samen in).
- Trainingsblok met de melding **Voldoende bewogen** (genoeg stappen óf een workout).

**Profiel en voedingsplan** (Meer › Profiel en voedingsplan)
- Vul geslacht, leeftijd, lengte, gewicht, activiteit en streefdoel in (afvallen, op gewicht of spieropbouw).
- Je krijgt een voorgesteld plan met calorieën, eiwit, koolhydraten, vet, vezels en water. Met **Plan overnemen als dagdoelen** zet je het in de app. Daarna kun je alles nog aanpassen bij **Dagdoelen**.

**Training**
- **Lege workout starten**: de timer loopt meteen; je voegt oefeningen toe terwijl je traint. Vergeten te starten? Tik op **Tijd aanpassen**.
- **Routines**: vooraf ingestelde workouts met oefeningen, aantal sets en rusttijd. Een lege workout kun je bij het afronden ook als routine bewaren.
- Loggen zoals in Hevy: per set kilo en herhalingen, met in de kolom **Vorige** wat je de vorige keer deed. Tik op een lege set af en de waarden van vorige keer worden ingevuld. Tik op de waarde bij Vorige om die over te nemen.
- Rusttimer na elke afgevinkte set (tik op het klokje bij een oefening om de rusttijd te wijzigen). Een **PR**-label verschijnt zodra je een record zet.
- Met **Minimaliseren** kun je tijdens de workout andere schermen gebruiken. De workout wordt steeds bewaard, ook als je de app sluit.

**Voortgang**
- **Kalender**: blauwe dagen = workout, groen puntje = voldoende bewogen. Met het aantal workouts, dagen bewogen en je huidige reeks.
- **Oefeningen**: per oefening een grafiek (geschat 1RM, zwaarste gewicht of volume), je records en geschiedenis.
- **Lichaam**: metingen van je weegschaal invoeren (gewicht, lichaamsvet, skeletspier, spiermassa, BMI) met grafiek. Je nieuwste gewicht wordt ook in je profiel gezet.

**Hevy-gegevens** (Meer › Hevy-gegevens importeren)
- Exporteer in Hevy: **Profiel › Instellingen › Export & import › Export workouts**. Kies daarna in Pace het CSV-bestand. Bekende oefeningen worden gekoppeld aan de Pace-bibliotheek, onbekende worden automatisch aangemaakt. Twee keer importeren geeft geen dubbele workouts.

---

## Nieuw in versie 2.1

- **Meer kleur:** kleurverloop op de calorie-kaart, gekleurde kaarten voor macro's, water, slaap, stappen en training, iconen per maaltijd, een begroeting met je naam (Meer › Profiel) en vloeiende overgangen.
- **Barcodescanner:** bij een maaltijd tik je op het barcode-icoon naast het zoekveld. Richt de camera op de barcode; het scannen gaat vanzelf. De eerste keer vraagt de iPhone om toegang tot de camera: tik op **Sta toe**. Lukt de camera niet, typ dan het nummer onder de barcode.
- **Voedingsdatabase (Open Food Facts):** kies **Online zoeken**, typ bijvoorbeeld ‘kwark’ en tik op **Zoek … in Open Food Facts**. Nederlandse producten staan bovenaan, met Nutri-Score. Een gekozen product wordt bewaard bij **Mijn producten**, zodat het de volgende keer ook zonder internet werkt.
- **Zelfde als gisteren:** is een maaltijd nog leeg en at je gisteren iets bij die maaltijd, dan kopieer je het met één tik.
- **Stappen en slaap uit Apple Gezondheid:** zie het stappenplan hieronder. Het staat ook in de app bij **Meer › Apple Gezondheid en Zepp**.

Open Food Facts is gratis en open, maar wil niet te veel verzoeken: Pace zoekt daarom pas als je op de knop tikt, en maximaal één keer per 6 seconden.

## Stappen en slaap uit Zepp en Apple Gezondheid

Een web-app op je beginscherm mag Apple Gezondheid niet zelf lezen. Daarom gaat het zo: **Zepp → Apple Gezondheid → Opdracht → klembord → Pace**.

1. **Zepp naar Gezondheid.** Open de app **Gezondheid** › tik op je profielfoto rechtsboven › **Apps** › **Zepp** › zet **Stappen** en **Slaap** aan. Kijk daarna in Gezondheid of je slaap van vannacht er staat.
2. **Nieuwe Opdracht.** Open de app **Opdrachten**, tik op **+** en noem hem `Pace bijwerken`.
3. **Stappen zoeken.** Tik op **Voeg taak toe**, zoek op ‘gezondheid’ en kies de taak die met **Zoek** begint (Engels: *Find Health Samples*). Kies Type **Stappen** en voeg het filter **Begindatum is Vandaag** toe.
4. **Optellen.** Voeg **Bereken statistieken** toe en kies **Som**. Voeg daarna **Stel variabele in** toe en noem de variabele `Stappen`.
5. **Slaap zoeken.** Voeg nog een keer de Zoek-gezondheid-taak toe. Type **Slaapanalyse**, filter **Begindatum valt in de laatste 1 dagen**. Meet je iPhone ook je slaap? Voeg dan het filter **Bron is Zepp** toe, anders telt de slaap dubbel.
6. **Per slaapstuk.** Voeg **Herhaal met elk** toe. Zet daarbinnen:
   - **Haal details op van gezondheidsitem** › **Waarde**
   - nog een keer › **Begindatum**
   - nog een keer › **Einddatum**
   - **Bereken tijd tussen datums**: van *Begindatum* tot *Einddatum*, in **Minuten**
   - een **Tekst**-taak met precies: `fase=[Waarde];min=[Tijd tussen datums]` (de woorden tussen haken kies je als variabele door erop te tikken)
7. **Datum.** Na **Einde herhaling**: **Formatteer datum** › *Huidige datum* › Datumnotatie **Aangepast** › `yyyy-MM-dd`.
8. **Alles samen.** Een **Tekst**-taak met op aparte regels:

   ```
   PACE
   datum=[Geformatteerde datum]
   stappen=[Stappen]
   [Resultaten van herhaling]
   ```

9. **Kopiëren.** Voeg **Kopieer naar klembord** toe, en eventueel **Toon melding** met ‘Open Pace en tik op plakken’.
10. **Testen.** Tik op ▶ om de Opdracht te draaien. Geef de eerste keer toegang tot Gezondheid (Stappen en Slaap). Open Pace en tik op **Vandaag** op **Stappen en slaap plakken uit Opdracht**. Tik op **Plak** als de iPhone dat vraagt.
11. **Elke ochtend klaar (optioneel).** Opdrachten › **Automatisering** › **+** › **Tijdstip**, bijv. 09:00 › **Voer direct uit** › kies `Pace bijwerken`.

**Slaapscore:** de score uit de Zepp-app zelf komt (voor zover bekend) niet in Apple Gezondheid terecht. Pace rekent daarom een eigen score uit je slaapduur, diepe slaap, REM-slaap en de tijd dat je wakker lag. Wil je toch de Zepp-score zien? Tik op de slaapkaart en vul hem in; die gaat dan voor.

**Werkt het plakken niet?** Pace zegt dan ‘Geen stappen of slaap gevonden’. Open de Opdracht, tik onderaan op ▶ en bekijk de tekst bij de laatste Tekst-taak: die moet beginnen met `PACE` en regels als `stappen=8412` en `fase=Kern;min=35` bevatten. Stuur me een schermafbeelding als het niet lukt.

## Hevy-workouts overzetten

1. Open **Hevy** › **Profiel** › tandwiel rechtsboven (**Instellingen**) › **Export & Import Data** › **Export workouts**.
2. Kies **Bewaar in Bestanden** (of mail het bestand naar jezelf en bewaar de bijlage).
3. Open Pace › **Meer** › **Hevy-gegevens importeren** › **CSV-bestand kiezen** en kies het bestand.
4. Pace meldt hoeveel workouts zijn geïmporteerd. Bekende oefeningen worden gekoppeld aan de Pace-bibliotheek; onbekende krijgen hun Hevy-naam. Opnieuw importeren is veilig: dubbele workouts worden overgeslagen.

---

## Bijwerken naar een nieuwe versie

De nieuwe bestanden zet Claude direct in je map `pace-fase1\pace`. Je gegevens op je iPhone blijven bewaard.

1. **Eerst een back-up op je iPhone:** Pace › **Meer** › **Back-up maken** › **Bewaar in Bestanden**.
2. Open **Visual Studio Code** met de map `pace`, klik op **Terminal › New Terminal** en typ `npm install` (versie 2.1 heeft de barcodescanner erbij).
3. Typ `npm run dev`, houd **Ctrl** ingedrukt en klik op `http://localhost:5173/` om te kijken of alles werkt. Stoppen met **Ctrl + C**. (De camera werkt op de laptop alleen als er een webcam is; op je iPhone testen gaat via de online versie.)
4. Open **GitHub Desktop**, typ bij **Summary** bijvoorbeeld `Versie 2.1`, klik op **Commit to main** en daarna op **Push origin**.
5. Wacht 1 à 2 minuten (op github.com onder **Actions** verschijnt een groen vinkje). Sluit Pace op je iPhone helemaal af en open hem opnieuw; zie je nog de oude versie, doe dat dan nog een keer.

De melding over ‘vulnerabilities’ bij `npm install` kun je negeren. Voer **niet** `npm audit fix --force` uit.

---

## Eerste installatie (alleen nodig op een nieuwe laptop)

## Stap 1 – Programma's installeren (eenmalig)

1. **Node.js** (nodig om de app te bouwen)
   - Ga naar https://nodejs.org
   - Klik op de groene knop met **LTS**.
   - Open het gedownloade bestand en klik steeds op **Next**, daarna **Install** en **Finish**.
2. **Visual Studio Code** (het programma waarin je de code bekijkt)
   - Ga naar https://code.visualstudio.com
   - Klik op **Download for Windows**, open het bestand en klik steeds op **Volgende**.
3. **GitHub-account** (voor de gratis hosting)
   - Ga naar https://github.com en klik op **Sign up**. Onthoud je gebruikersnaam.
4. **GitHub Desktop** (om de code met een paar klikken online te zetten)
   - Ga naar https://desktop.github.com en klik op **Download for Windows**.
   - Open het bestand en log in met je GitHub-account.

## Stap 2 – De code uitpakken

1. Download het bestand `pace-fase1.zip` op je laptop.
2. Klik er met de rechtermuisknop op en kies **Alles uitpakken…**
3. Kies als locatie je map **Documenten** en klik op **Uitpakken**.
4. Controleer: in `Documenten\pace` moet je direct het bestand `package.json` zien. Zit er nog een extra map `pace` in, gebruik dan die binnenste map.

## Stap 3 – De app starten op je laptop

1. Open **Visual Studio Code**.
2. Klik linksboven op **File** → **Open Folder…** en kies de map `pace`. Klik op **Map selecteren**.
3. Vraagt VS Code of je de auteurs vertrouwt, klik dan op **Yes, I trust the authors**.
4. Klik bovenin op **Terminal** → **New Terminal**. Onderin verschijnt een venster waarin je kunt typen.
5. Typ dit en druk op Enter (dit duurt ongeveer een minuut en hoeft maar één keer):

   ```
   npm install
   ```

6. Typ daarna dit en druk op Enter:

   ```
   npm run dev
   ```

7. Er verschijnt een regel met `http://localhost:5173/`. Houd **Ctrl** ingedrukt en klik op die link. De app opent in je browser.
8. Stoppen doe je door in het terminalvenster te klikken en op **Ctrl + C** te drukken.

**Krijg je een rode foutmelding met "running scripts is disabled"?** Typ dan dit, druk op Enter en probeer stap 5 opnieuw:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Tip:** druk in de browser op **F12** en klik op het icoontje van een telefoon. Dan zie je de app in telefoonformaat.

## Stap 4 – Testen op je iPhone (zonder online te zetten)

1. Zorg dat je laptop en iPhone op hetzelfde wifi-netwerk zitten.
2. Typ in de terminal:

   ```
   npm run telefoon
   ```

3. Vraagt Windows om toestemming voor de firewall, klik dan op **Toestaan**.
4. Er verschijnt een regel met **Network:** en een adres zoals `http://192.168.1.23:5173/`.
5. Open **Safari** op je iPhone en typ precies dat adres in.

Dit is alleen om te testen. Wat je hier invoert, staat los van de online versie.

## Stap 5 – De app online zetten (gratis, via GitHub Pages)

1. Open **GitHub Desktop**.
2. Klik op **File** → **Add local repository…**
3. Klik op **Choose…**, kies de map `pace` en klik op **Map selecteren**.
4. Je ziet een melding dat dit nog geen repository is. Klik op de blauwe link **create a repository**.
5. Laat alles staan en klik op **Create repository**.
6. Klik bovenin op **Publish repository**.
7. Haal het vinkje weg bij **Keep this code private** (gratis hosting werkt alleen met openbare code; je eigen gegevens staan daar niet in).
8. Klik op **Publish repository**.
9. Ga in je browser naar `https://github.com/JOUW-GEBRUIKERSNAAM/pace`.
10. Klik op **Settings** (bovenaan, rechts in de rij).
11. Klik links op **Pages**.
12. Kies onder **Build and deployment** bij **Source** voor **GitHub Actions**.
13. Klik bovenaan op **Actions**, klik links op **Online zetten**, klik rechts op **Run workflow** en nog een keer op de groene knop **Run workflow**.
14. Wacht 1 à 2 minuten tot er een groen vinkje staat.
15. Je app staat nu op: `https://JOUW-GEBRUIKERSNAAM.github.io/pace/`

## Stap 6 – Op je iPhone installeren

1. Open **Safari** op je iPhone (het moet Safari zijn) en ga naar het adres uit stap 5.
2. Tik op de **deelknop** (het vierkantje met het pijltje omhoog).
3. Scroll omlaag en tik op **Zet op beginscherm**.
4. Tik op **Voeg toe**.
5. Open de app voortaan via het icoon op je beginscherm.

**Belangrijk:** de app op je beginscherm en de site in Safari hebben elk hun eigen gegevens. Gebruik dus altijd het icoon op je beginscherm.

## Back-up maken

1. Open de app en tik op **Meer**.
2. Tik op **Back-up maken** en kies **Bewaar in Bestanden**.
3. Terugzetten doe je met **Back-up terugzetten**. Let op: dat vervangt alles wat op dat moment in de app staat.

Maak in ieder geval een back-up voordat je een nieuwe fase installeert.

---

## Hoe de code in elkaar zit

| Bestand of map | Wat het doet |
| --- | --- |
| `index.html` | De lege pagina waarin de app start |
| `vite.config.js` | Instellingen voor bouwen, offline gebruik en het beginscherm |
| `src/main.jsx` | Start de app en kiest licht of donker |
| `src/App.jsx` | Bepaalt welk scherm zichtbaar is, en de balk 'workout bezig' |
| `src/db.js` | De lokale database (versie 2) en standaardwaarden |
| `src/index.css` | De kleuren van licht (palet 03) en donker (palet 02) |
| `src/schermen/` | Vandaag, Voeding, Training, WorkoutBezig, Voortgang en Meer |
| `src/components/` | Herbruikbare onderdelen: ringen, balken, vensters, grafiek, kiezers |
| `src/lib/plan.js` | Berekening van het voorgestelde voedingsplan |
| `src/lib/gezondheid.js` | Stappen en slaap inlezen en de slaapscore berekenen |
| `src/lib/training.js` | Rekenwerk voor workouts: vorige sets, 1RM, records en volume |
| `src/lib/hevy.js` | Import van de Hevy-export |
| `src/lib/oefeningen.js` | De standaard oefeningenbibliotheek |
| `src/lib/openfoodfacts.js` | Zoeken en barcodes opzoeken in Open Food Facts |
| `src/components/BarcodeScanner.jsx` | De camera-scanner |
| `src/components/OpdrachtUitleg.jsx` | Het stappenplan voor de Opdracht, zoals in de app |
| `.github/workflows/deploy.yml` | Zet de app automatisch online na elke **Push origin** |

**Over het voedingsplan:** het voorstel gebruikt de Mifflin-St Jeor-formule voor je rustverbranding, vermenigvuldigd met je activiteit. Afvallen = 20% minder, spieropbouw = 300 kcal extra. Eiwit: 2,2 g/kg bij afvallen, 2,0 bij spieropbouw, 1,8 bij op gewicht. Vet: minstens 25% van je calorieën. De rest is koolhydraten. Het is een startpunt, geen medisch advies.

**Over de slaapscore:** heb je zelf een score uit Zepp ingevuld, dan toont Pace die. Anders rekent Pace een score uit je slaapduur (ten opzichte van je slaapdoel), het aandeel diepe en REM-slaap en de tijd dat je wakker lag.
