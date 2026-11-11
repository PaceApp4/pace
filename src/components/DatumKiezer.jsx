import { mooieDatum, vandaag, verschuif } from '../lib/datum.js';

// Pijltjes om een dag terug of vooruit te gaan.
export default function DatumKiezer({ datum, zetDatum }) {
  const isVandaag = datum === vandaag();

  return (
    <div className="flex items-center justify-between">
      <button
        className="knop h-11 w-11 rounded-full bg-white text-xl shadow-sm"
        onClick={() => zetDatum(verschuif(datum, -1))}
        aria-label="Vorige dag"
      >
        ‹
      </button>
      <button
        className="knop rounded-full px-4 py-2 text-lg font-bold"
        onClick={() => zetDatum(vandaag())}
      >
        {mooieDatum(datum)}
        {!isVandaag && (
          <span className="ml-2 text-sm font-semibold text-violet-600">↩ vandaag</span>
        )}
      </button>
      <button
        className="knop h-11 w-11 rounded-full bg-white text-xl shadow-sm"
        onClick={() => zetDatum(verschuif(datum, 1))}
        aria-label="Volgende dag"
      >
        ›
      </button>
    </div>
  );
}
