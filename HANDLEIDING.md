# Pace – handleiding versie 2

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

## Bijwerken van fase 1 naar versie 2

De nieuwe bestanden staan al in je map `pace-fase1\pace`. Je gegevens op je iPhone blijven bewaard.

1. **Eerst een back-up op je iPhone.** Open Pace, tik op **Meer › Back-up maken** en kies **Bewaar in Bestanden**.
2. Open **Visual Studio Code** met de map `pace` (**File › Open Folder…**).
3. Klik op **Terminal › New Terminal** en typ (er is een nieuw lettertype bijgekomen):

   ```
   npm install
   ```

4. Typ daarna:

   ```
   npm run dev
   ```

   Houd **Ctrl** ingedrukt en klik op `http://localhost:5173/`. Kijk of alles werkt. Stoppen doe je met **Ctrl + C**.
5. Open **GitHub Desktop**. Links zie je de gewijzigde bestanden.
6. Typ linksonder bij **Summary**: `Versie 2`.
7. Klik op **Commit to main** en daarna bovenin op **Push origin**.
8. Wacht 1 à 2 minuten. Op github.com onder **Actions** zie je een groen vinkje als het klaar is.
9. Sluit Pace op je iPhone helemaal af (omhoog vegen) en open hem opnieuw. Zie je nog de oude versie, doe het dan nog een keer.

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
| `.github/workflows/deploy.yml` | Zet de app automatisch online na elke **Push origin** |

**Over het voedingsplan:** het voorstel gebruikt de Mifflin-St Jeor-formule voor je rustverbranding, vermenigvuldigd met je activiteit. Afvallen = 20% minder, spieropbouw = 300 kcal extra. Eiwit: 2,2 g/kg bij afvallen, 2,0 bij spieropbouw, 1,8 bij op gewicht. Vet: minstens 25% van je calorieën. De rest is koolhydraten. Het is een startpunt, geen medisch advies.

**Over de slaapscore:** heb je zelf een score uit Zepp ingevuld, dan toont Pace die. Anders rekent Pace een score uit je slaapduur (ten opzichte van je slaapdoel), het aandeel diepe en REM-slaap en de tijd dat je wakker lag.
