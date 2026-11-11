import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

// De lokale database (IndexedDB). Alles staat alleen op jouw toestel.
export const db = new Dexie('pace');

// Per tabel: welke velden doorzoekbaar zijn. '++id' = automatisch nummer.
// Nieuwe tabellen in latere fases? Voeg dan db.version(2).stores({...}) toe.
db.version(1).stores({
  producten: '++id, naam',
  voedingslog: '++id, datum, productId',
  waterlog: '++id, datum',
  instellingen: 'sleutel',
});

export const STANDAARD_DOELEN = {
  kcal: 2200,
  eiwit: 140,
  koolhydraten: 250,
  vet: 70,
  vezels: 30,
  suiker: 60,
  water: 2000,
};

export const STANDAARD_WATERKNOPPEN = [250, 500];

// Leest één instelling en geeft ook een functie terug om hem te bewaren.
// Gebruik: const [waarde, bewaar] = useInstelling('doelen', STANDAARD_DOELEN);
export function useInstelling(sleutel, standaard) {
  const rij = useLiveQuery(() => db.instellingen.get(sleutel), [sleutel]);
  const waarde = rij ? rij.waarde : standaard;
  const bewaar = (nieuw) => db.instellingen.put({ sleutel, waarde: nieuw });
  return [waarde, bewaar];
}

// Doelen, altijd aangevuld met de standaardwaarden.
export function useDoelen() {
  const [waarde, bewaar] = useInstelling('doelen', STANDAARD_DOELEN);
  return [{ ...STANDAARD_DOELEN, ...waarde }, bewaar];
}
