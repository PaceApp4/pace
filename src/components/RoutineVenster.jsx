import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';
import { STANDAARD_RUST } from '../lib/training.js';
import { duurTekst } from '../lib/datum.js';
import Venster from './Venster.jsx';
import Veld from './Veld.jsx';
import Icoon from './Icoon.jsx';
import OefeningKiezer from './OefeningKiezer.jsx';

const RUSTOPTIES = [60, 90, 120, 180, 240];

// Een routine maken of wijzigen: naam, oefeningen, aantal sets en rusttijd.
export default function RoutineVenster({ routine, sluit }) {
  const [naam, zetNaam] = useState(routine?.naam ?? '');
  const [regels, zetRegels] = useState(routine?.oefeningen ?? []);
  const [kiezerOpen, zetKiezerOpen] = useState(false);
  const alleOefeningen = useLiveQuery(() => db.oefeningen.toArray(), []) ?? [];
  const naamVan = (id) => alleOefeningen.find((o) => o.id === id)?.naam ?? '…';

  const wijzig = (i, velden) => zetRegels(regels.map((r, j) => (j === i ? { ...r, ...velden } : r)));
  const verplaats = (i, richting) => {
    const j = i + richting;
    if (j < 0 || j >= regels.length) return;
    const nieuw = [...regels];
    [nieuw[i], nieuw[j]] = [nieuw[j], nieuw[i]];
    zetRegels(nieuw);
  };

  async function opslaan() {
    const data = { naam: naam.trim() || 'Routine', oefeningen: regels };
    if (routine?.id) await db.routines.update(routine.id, data);
    else await db.routines.add(data);
    sluit();
  }

  if (kiezerOpen) {
    return (
      <OefeningKiezer
        sluit={() => zetKiezerOpen(false)}
        kies={(o) => {
          zetRegels([...regels, { oefeningId: o.id, sets: 3, rust: STANDAARD_RUST }]);
          zetKiezerOpen(false);
        }}
      />
    );
  }

  return (
    <Venster titel={routine ? 'Routine wijzigen' : 'Nieuwe routine'} sluit={sluit} vol>
      <div className="space-y-3">
        <Veld label="Naam" waarde={naam} wijzig={zetNaam} placeholder="bijv. Push A" />

        {regels.map((r, i) => (
          <div key={`${r.oefeningId}-${i}`} className="kaart space-y-2 !p-3">
            <div className="flex items-center gap-1">
              <span className="flex-1 text-[15px] font-semibold">{naamVan(r.oefeningId)}</span>
              <button className="flex h-9 w-9 items-center justify-center text-zacht disabled:opacity-30" disabled={i === 0} onClick={() => verplaats(i, -1)} aria-label="Omhoog">
                <Icoon naam="links" grootte={18} className="rotate-90" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center text-zacht disabled:opacity-30" disabled={i === regels.length - 1} onClick={() => verplaats(i, 1)} aria-label="Omlaag">
                <Icoon naam="rechts" grootte={18} className="rotate-90" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center text-zacht" onClick={() => zetRegels(regels.filter((_, j) => j !== i))} aria-label="Verwijderen">
                <Icoon naam="prullenbak" grootte={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zacht">Sets</span>
              <button className="knop flex h-9 w-9 items-center justify-center rounded-[8px] bg-vlak" onClick={() => wijzig(i, { sets: Math.max(1, r.sets - 1) })} aria-label="Minder sets">
                <Icoon naam="min" grootte={16} />
              </button>
              <span className="w-6 text-center font-semibold">{r.sets}</span>
              <button className="knop flex h-9 w-9 items-center justify-center rounded-[8px] bg-vlak" onClick={() => wijzig(i, { sets: r.sets + 1 })} aria-label="Meer sets">
                <Icoon naam="plus" grootte={16} />
              </button>
              <button
                className="knop ml-auto flex h-9 items-center gap-1 rounded-full bg-vlak px-3 text-xs font-semibold"
                onClick={() => wijzig(i, { rust: RUSTOPTIES[(RUSTOPTIES.indexOf(r.rust ?? STANDAARD_RUST) + 1) % RUSTOPTIES.length] })}
              >
                <Icoon naam="timer" grootte={14} />
                Rust {duurTekst(r.rust ?? STANDAARD_RUST)}
              </button>
            </div>
          </div>
        ))}

        <button
          className="knop flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-rand text-sm font-semibold"
          onClick={() => zetKiezerOpen(true)}
        >
          <Icoon naam="plus" grootte={16} />
          Oefening toevoegen
        </button>

        <button className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair" onClick={opslaan}>
          Routine opslaan
        </button>
        {routine?.id && (
          <button
            className="knop w-full rounded-[12px] bg-vlak py-3 font-semibold text-over"
            onClick={async () => {
              if (!window.confirm(`Routine ‘${routine.naam}’ verwijderen? Je workouts blijven bewaard.`)) return;
              await db.routines.delete(routine.id);
              sluit();
            }}
          >
            Routine verwijderen
          </button>
        )}
      </div>
    </Venster>
  );
}
