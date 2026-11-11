import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';
import { duurTekst, korteDatum } from '../lib/datum.js';
import { aantalSets, kgTekst, startWorkout, volumeVan } from '../lib/training.js';
import Icoon from '../components/Icoon.jsx';
import RoutineVenster from '../components/RoutineVenster.jsx';
import WorkoutDetail from '../components/WorkoutDetail.jsx';

// Overzicht: workout starten, routines en recente workouts.
export default function Training({ actief, openWorkout }) {
  const routines = useLiveQuery(() => db.routines.toArray(), []) ?? [];
  const recent = useLiveQuery(() => db.workouts.orderBy('start').reverse().limit(8).toArray(), []) ?? [];
  const oefeningen = useLiveQuery(() => db.oefeningen.toArray(), []) ?? [];
  const [routineOpen, zetRoutineOpen] = useState(null); // {} = nieuw
  const [detail, zetDetail] = useState(null);
  const naamVan = (id) => oefeningen.find((o) => o.id === id)?.naam;

  async function start(routine) {
    if (actief) {
      openWorkout();
      return;
    }
    await startWorkout(routine);
    openWorkout();
  }

  return (
    <div className="space-y-3">
      <h1 className="text-[26px] font-bold tracking-tight">Training</h1>

      {actief ? (
        <button className="knop kaart flex w-full items-center gap-3 border-primair! text-left" onClick={openWorkout}>
          <Icoon naam="timer" className="text-primair" />
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">{actief.naam} is bezig</span>
            <span className="block text-xs text-zacht">Tik om verder te gaan</span>
          </span>
          <Icoon naam="rechts" className="text-zacht" />
        </button>
      ) : (
        <button
          className="knop flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primair font-semibold text-op-primair"
          onClick={() => start(null)}
        >
          <Icoon naam="plus" />
          Lege workout starten
        </button>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-[15px] font-semibold">Routines</h2>
          <button className="knop flex h-9 items-center gap-1 text-sm font-semibold text-primair" onClick={() => zetRoutineOpen({})}>
            <Icoon naam="plus" grootte={16} />
            Nieuw
          </button>
        </div>
        {routines.length === 0 && (
          <p className="kaart text-sm text-zacht">
            Nog geen routines. Maak er een, of rond een lege workout af en vink ‘Ook bewaren als routine’ aan.
          </p>
        )}
        {routines.map((r) => (
          <div key={r.id} className="kaart flex items-center gap-3 !py-3">
            <button className="min-w-0 flex-1 text-left" onClick={() => zetRoutineOpen(r)}>
              <span className="block text-[15px] font-semibold">{r.naam}</span>
              <span className="block truncate text-xs text-zacht">
                {r.oefeningen.map((o) => naamVan(o.oefeningId)).filter(Boolean).join(' · ') || 'Geen oefeningen'}
              </span>
            </button>
            <button
              className="knop flex h-11 items-center gap-1.5 rounded-[10px] bg-primair px-4 text-sm font-semibold text-op-primair"
              onClick={() => start(r)}
            >
              <Icoon naam="play" grootte={14} />
              Start
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="pt-1 text-[15px] font-semibold">Recente workouts</h2>
        {recent.length === 0 && <p className="kaart text-sm text-zacht">Nog geen workouts opgeslagen.</p>}
        {recent.length > 0 && (
          <div className="kaart !py-1">
            {recent.map((w, i) => (
              <button
                key={w.id}
                className={`flex min-h-13 w-full items-center gap-3 py-2 text-left ${i > 0 ? 'border-t border-rand' : ''}`}
                onClick={() => zetDetail(w)}
              >
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">{w.naam}</span>
                  <span className="block text-xs text-zacht">
                    {korteDatum(w.datum)} · {duurTekst((w.eind - w.start) / 1000)} · {aantalSets(w)} sets ·{' '}
                    {kgTekst(Math.round(volumeVan(w)))} kg
                  </span>
                </span>
                <Icoon naam="rechts" grootte={18} className="text-zacht" />
              </button>
            ))}
          </div>
        )}
      </section>

      {routineOpen && (
        <RoutineVenster routine={routineOpen.id ? routineOpen : null} sluit={() => zetRoutineOpen(null)} />
      )}
      {detail && <WorkoutDetail workout={detail} sluit={() => zetDetail(null)} />}
    </div>
  );
}
