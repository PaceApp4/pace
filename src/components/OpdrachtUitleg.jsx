// Stappenplan voor de Opdracht die stappen en slaap uit Apple Gezondheid haalt.
// De namen van taken kunnen per iOS-versie iets verschillen; zoek op het vetgedrukte woord.
const STAPPEN = [
  ['Zepp naar Gezondheid', 'Open de app Gezondheid › je profielfoto rechtsboven › Apps › Zepp, en zet Stappen en Slaap aan. Check daarna in Gezondheid of je slaap van vannacht er staat.'],
  ['Nieuwe Opdracht', 'Open de app Opdrachten, tik op + en noem hem ‘Pace bijwerken’.'],
  ['Stappen zoeken', 'Voeg de taak toe die begint met ‘Zoek’ en ‘gezondheid’ (Engels: Find Health Samples). Kies Type: Stappen, en als filter Begindatum is Vandaag.'],
  ['Optellen', 'Voeg Bereken statistieken toe en kies Som. Voeg daarna Stel variabele in toe met de naam Stappen.'],
  ['Slaap zoeken', 'Voeg opnieuw de Zoek-gezondheid-taak toe. Type: Slaapanalyse, filter Begindatum valt in de laatste 1 dagen. Draag je ook ’s nachts je iPhone als slaapmeter? Voeg dan het filter Bron is Zepp toe.'],
  ['Per slaapstuk', 'Voeg Herhaal met elk toe. Zet daarbinnen: Haal details op van gezondheidsitem › Waarde; nog twee keer › Begindatum en › Einddatum; en Bereken tijd tussen datums (van Begindatum tot Einddatum, in Minuten).'],
  ['Regel maken', 'Nog binnen de herhaling: een Tekst-taak met precies: fase=[Waarde];min=[Tijd tussen datums]. De woorden tussen haken kies je als variabele.'],
  ['Datum', 'Na Einde herhaling: Formatteer datum › Huidige datum › Notatie Aangepast: yyyy-MM-dd.'],
  ['Alles samen', 'Een Tekst-taak met op aparte regels: PACE, datum=[Geformatteerde datum], stappen=[Stappen], en daaronder [Resultaten van herhaling].'],
  ['Kopiëren', 'Voeg Kopieer naar klembord toe, en eventueel Toon melding: ‘Open Pace en tik op plakken’.'],
  ['Gebruiken', 'Draai de Opdracht (geef de eerste keer toegang tot Gezondheid), open Pace en tik op Vandaag op ‘Stappen en slaap plakken uit Opdracht’.'],
  ['Automatisch', 'Optioneel: Opdrachten › Automatisering › + › Tijdstip (bijv. 09:00) › Voer direct uit › kies ‘Pace bijwerken’. Dan staat het elke ochtend klaar om te plakken.'],
];

export default function OpdrachtUitleg() {
  return (
    <ol className="space-y-3">
      {STAPPEN.map(([titel, tekst], i) => (
        <li key={titel} className="flex gap-3">
          <span className="badge h-7 w-7 text-xs font-bold" style={{ '--tint': 'var(--pace-stappen)' }}>
            {i + 1}
          </span>
          <span className="text-sm">
            <b className="font-semibold">{titel}.</b> <span className="text-zacht">{tekst}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
