import { useState } from 'react';
import { leesGetal, rond, rond1, waardenVoor } from '../lib/voeding.js';
import Veld from './Veld.jsx';

// Kies hoeveel je gegeten hebt. Laat direct zien wat dat oplevert.
// 'item' heeft: naam, eenheid, per100 en eventueel portie.
export default function HoeveelheidFormulier({ item, beginGram, knopTekst, opslaan, verwijder }) {
  const [tekst, zetTekst] = useState(String(beginGram));
  const eenheid = item.eenheid ?? 'g';
  const gram = leesGetal(tekst);
  const w = waardenVoor(item.per100, gram);

  // Snelle keuzes: de standaardportie (als die er is) en een paar ronde getallen.
  const keuzes = [...new Set([item.portie, 50, 100, 150, 200, 250].filter((g) => g > 0))];

  return (
    <div className="space-y-4">
      <Veld label="Hoeveelheid" waarde={tekst} wijzig={zetTekst} eenheid={eenheid} getal />

      <div className="flex flex-wrap gap-2">
        {keuzes.map((g) => (
          <button
            key={g}
            className={`knop rounded-full px-4 py-2 font-semibold ${
              gram === g ? 'bg-violet-600 text-white' : 'bg-violet-50'
            }`}
            onClick={() => zetTekst(String(g))}
          >
            {g} {eenheid}
            {g === item.portie ? ' (portie)' : ''}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-violet-50 p-4">
        <div className="text-2xl font-extrabold">{rond(w.kcal)} kcal</div>
        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs">
          {[
            ['Eiwit', w.eiwit],
            ['Koolh.', w.koolhydraten],
            ['Vet', w.vet],
            ['Vezels', w.vezels],
            ['Suiker', w.suiker],
          ].map(([label, waarde]) => (
            <div key={label}>
              <div className="text-base font-bold">{rond1(waarde)}</div>
              <div className="text-indigo-900/60">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="knop w-full rounded-2xl bg-violet-600 py-4 text-lg font-bold text-white shadow-sm disabled:opacity-40"
        disabled={gram <= 0}
        onClick={() => opslaan(gram)}
      >
        {knopTekst}
      </button>
      {verwijder && (
        <button
          className="knop w-full rounded-2xl bg-rose-50 py-3 font-bold text-rose-600"
          onClick={verwijder}
        >
          Verwijderen
        </button>
      )}
    </div>
  );
}
