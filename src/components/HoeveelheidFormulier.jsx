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
            className={`knop rounded-full px-4 py-2 min-h-11 font-semibold ${
              gram === g ? 'bg-primair text-op-primair' : 'bg-vlak'
            }`}
            onClick={() => zetTekst(String(g))}
          >
            {g} {eenheid}
            {g === item.portie ? ' (portie)' : ''}
          </button>
        ))}
      </div>

      <div className="rounded-[12px] bg-vlak p-4">
        <div className="text-2xl font-bold">{rond(w.kcal)} kcal</div>
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
              <div className="text-zacht">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="knop w-full rounded-[12px] bg-primair py-3.5 text-base font-semibold text-op-primair disabled:opacity-40"
        disabled={gram <= 0}
        onClick={() => opslaan(gram)}
      >
        {knopTekst}
      </button>
      {verwijder && (
        <button
          className="knop w-full rounded-[12px] bg-vlak py-3 font-bold text-over"
          onClick={verwijder}
        >
          Verwijderen
        </button>
      )}
    </div>
  );
}
