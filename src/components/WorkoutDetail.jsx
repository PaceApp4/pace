import { db } from '../db.js';
import { klokTijd, langeDatum } from '../lib/datum.js';
import { aantalSets, kgTekst, volumeVan } from '../lib/training.js';
import Venster from './Venster.jsx';

// Een opgeslagen workout bekijken of verwijderen.
export default function WorkoutDetail({ workout, sluit }) {
  const minuten = Math.round((workout.eind - workout.start) / 60000);
  return (
    <Venster titel={workout.naam} sluit={sluit}>
      <div className="space-y-3">
        <p className="text-sm text-zacht">
          {langeDatum(workout.datum)} · {klokTijd(workout.start)} · {minuten} min · {aantalSets(workout)} sets ·{' '}
          {kgTekst(Math.round(volumeVan(workout)))} kg
          {workout.bron === 'hevy' ? ' · uit Hevy' : ''}
        </p>
        {workout.oefeningen.map((o, i) => (
          <section key={i} className="kaart space-y-1 !p-3">
            <h3 className="text-[15px] font-semibold">{o.naam}</h3>
            {o.sets.map((s, j) => (
              <div key={j} className="flex text-sm">
                <span className="w-8 text-zacht">{s.type === 'warmup' ? 'W' : j + 1}</span>
                <span>
                  {kgTekst(s.kg)} kg × {s.reps}
                </span>
              </div>
            ))}
          </section>
        ))}
        <button
          className="knop w-full rounded-[12px] bg-vlak py-3 font-semibold text-over"
          onClick={async () => {
            if (!window.confirm('Deze workout verwijderen?')) return;
            await db.workouts.delete(workout.id);
            sluit();
          }}
        >
          Workout verwijderen
        </button>
      </div>
    </Venster>
  );
}
