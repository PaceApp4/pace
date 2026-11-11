import { db } from '../db.js';
import { STANDAARD_OEFENINGEN } from './oefeningen.js';
import { vandaag } from './datum.js';

// Maakt één JSON-bestand met alle gegevens uit de app.
export async function exporteer() {
  const data = {
    app: 'pace',
    versie: 2,
    gemaaktOp: new Date().toISOString(),
    tabellen: {},
  };
  for (const tabel of db.tables) {
    data.tabellen[tabel.name] = await tabel.toArray();
  }

  const naam = `pace-backup-${vandaag()}.json`;
  const tekst = JSON.stringify(data, null, 2);
  const bestand = new File([tekst], naam, { type: 'application/json' });

  // Op de telefoon: het deelmenu openen (bijv. 'Bewaar in Bestanden').
  const isTelefoon = /iPhone|iPad|Android/i.test(navigator.userAgent);
  if (isTelefoon && navigator.canShare && navigator.canShare({ files: [bestand] })) {
    try {
      await navigator.share({ files: [bestand], title: naam });
      return;
    } catch (fout) {
      if (fout.name === 'AbortError') return; // zelf geannuleerd
      // anders: hieronder gewoon downloaden
    }
  }

  // Op de laptop: gewoon downloaden.
  const url = URL.createObjectURL(bestand);
  const link = document.createElement('a');
  link.href = url;
  link.download = naam;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Vervangt ALLE gegevens in de app door de inhoud van een back-upbestand.
export async function importeer(bestand) {
  let data;
  try {
    data = JSON.parse(await bestand.text());
  } catch {
    throw new Error('Dit bestand kan niet gelezen worden.');
  }
  if (!data || (data.app !== 'pace' && data.app !== 'fitmaatje') || !data.tabellen) {
    throw new Error('Dit is geen Pace-back-up.');
  }

  await db.transaction('rw', db.tables, async () => {
    for (const tabel of db.tables) {
      await tabel.clear();
      const rijen = data.tabellen[tabel.name];
      if (Array.isArray(rijen) && rijen.length > 0) {
        await tabel.bulkAdd(rijen);
      }
    }
    // Oude back-up (fase 1) zonder oefeningen: de standaardlijst terugzetten.
    if (!data.tabellen.oefeningen?.length) {
      await db.oefeningen.bulkAdd(STANDAARD_OEFENINGEN);
    }
  });
}
