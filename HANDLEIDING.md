# Pace – handleiding fase 1

Deze handleiding is geschreven voor Windows 11 en een iPhone. Volg de stappen in volgorde. Namen van knoppen kunnen per versie een klein beetje afwijken.

## Wat zit er in fase 1

- Dashboard met ringen voor calorieën en water, en balken voor eiwit, koolhydraten, vet, vezels en suiker.
- Water toevoegen met één tik (glas of fles), met een knop om de laatste ongedaan te maken.
- Voedingsdagboek per maaltijd: ontbijt, lunch, diner en snacks.
- Eigen producten aanmaken, zoeken, wijzigen en als favoriet markeren.
- Eerder gebruikte producten staan bovenaan, met de hoeveelheid van de vorige keer al ingevuld.
- Terugbladeren naar eerdere dagen.
- Doelen en waterknoppen instellen.
- Back-up maken en terugzetten (JSON-bestand).
- Installeerbaar op je beginscherm en offline bruikbaar.

Producten zoeken in Open Food Facts en de barcodescanner komen in fase 2. Tot die tijd voer je producten één keer zelf in vanaf het etiket.

---

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

## Stap 7 – Een nieuwe versie online zetten (bij volgende fases)

1. Vervang de bestanden in de map `pace` door de nieuwe versie.
2. Open **GitHub Desktop**. Links zie je de gewijzigde bestanden.
3. Typ linksonder bij **Summary** een korte omschrijving, bijvoorbeeld `Fase 2`.
4. Klik op **Commit to main**.
5. Klik bovenin op **Push origin**.
6. Na 1 à 2 minuten staat de nieuwe versie online. Sluit de app op je iPhone helemaal af en open hem opnieuw (soms twee keer) om de nieuwe versie te zien. Je gegevens blijven bewaard.

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
| `vite.config.js` | Instellingen voor bouwen en voor installeren op het beginscherm |
| `src/main.jsx` | Start de app |
| `src/App.jsx` | Bepaalt welk scherm zichtbaar is |
| `src/db.js` | De lokale database en de standaarddoelen |
| `src/schermen/` | Eén bestand per tab: Vandaag, Voeding, Training, Voortgang, Meer |
| `src/components/` | Herbruikbare onderdelen, zoals de ring, balk en invoervelden |
| `src/lib/` | Rekenwerk: datums, voedingswaarden en back-up |
| `public/icons/` | Het app-icoon |
| `.github/workflows/deploy.yml` | Zet de app automatisch online na elke **Push origin** |

De standaarddoelen (2.200 kcal, 140 g eiwit, 2.000 ml water, enzovoort) zijn voorbeeldwaarden. Pas ze aan in de app onder **Meer**.
