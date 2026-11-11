import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { STANDAARD_OEFENINGEN } from './lib/oefeningen.js';

// De lokale database (IndexedDB). Alles staat alleen op jouw toestel.
export const db = new Dexie('pace');

// Per tabel: welke velden doorzoekbaar zijn. '++id' = automatisch nummer.
db.version(1).stores({
  producten: '++id, naam',
  voedingslog: '++id, datum, productId',
  waterlog: '++id, datum',
  instellingen: 'sleutel',
});

// Versie 2 (Pace v2): gezondheid, lichaam en training erbij.
// Bestaande gegevens blijven gewoon staan.
db.version(2)
  .stores({
    producten: '++id, naam',
    voedingslog: '++id, datum, productId',
    waterlog: '++id, datum',
    instellingen: 'sleutel',
    gezondheid: 'datum', // stappen en slaap per dag
    lichaamslog: '++id, datum', // gewicht, vet%, spiermassa enz.
    oefeningen: '++id, naam',
    routines: '++id, naam',
    workouts: '++id, datum, start, *oefeningIds',
  })
  .upgrade((tx) => tx.table('oefeningen').bulkAdd(STANDAARD_OEFENINGEN));

// Bij een helemaal nieuwe database: meteen de oefeningen erin zetten.
db.on('populate', (tx) => tx.table('oefeningen').bulkAdd(STANDAARD_OEFENINGEN));

export const STANDAARD_DOELEN = {
  kcal: 2200,
  eiwit: 140,
  koolhydraten: 250,
  vet: 70,
  vezels: 30,
  suiker: 60,
  water: 2000,
  stappen: 8000,
  slaapUren: 8,
};

export const STANDAARD_WATERKNOPPEN = [250, 500];

export const STANDAARD_PROFIEL = {
  geslacht: 'man',
  leeftijd: '',
  lengte: '', // cm
  gewicht: '', // kg
  activiteit: 'gemiddeld',
  doel: 'onderhouden',
};

// Leest één instelling en geeft ook een functie terug om hem te bewaren.
// Gebruik: const [waarde, bewaar] = useInstelling('doelen', STANDAARD_DOELEN);
export function useInstelling(sleutel, standaard) {
  // null = bestaat nog niet, undefined = nog aan het laden
  const rij = useLiveQuery(
    () => db.instellingen.get(sleutel).then((r) => r ?? null),
    [sleutel]
  );
  const waarde = rij ? rij.waarde : standaard;
  const bewaar = (nieuw) => db.instellingen.put({ sleutel, waarde: nieuw });
  return [waarde, bewaar, rij !== undefined];
}

// Doelen, altijd aangevuld met de standaardwaarden.
export function useDoelen() {
  const [waarde, bewaar, geladen] = useInstelling('doelen', STANDAARD_DOELEN);
  return [{ ...STANDAARD_DOELEN, ...waarde }, bewaar, geladen];
}

export function useProfiel() {
  const [waarde, bewaar, geladen] = useInstelling('profiel', STANDAARD_PROFIEL);
  return [{ ...STANDAARD_PROFIEL, ...waarde }, bewaar, geladen];
}
