import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';
import { SPIERGROEPEN } from '../lib/oefeningen.js';
import Venster from './Venster.jsx';
import Icoon from './Icoon.jsx';
import Veld, { Keuze } from './Veld.jsx';

// Kies een oefening uit de bibliotheek of maak een nieuwe.
export default function OefeningKiezer({ kies, sluit }) {
  const oefeningen = useLiveQuery(() => db.oefeningen.toArray(), []) ?? [];
  const [zoek, zetZoek] = useState('');
  const [groep, zetGroep] = useState('Alle');
  const [nieuw, zetNieuw] = useState(null); // { naam, spiergroep }

  const term = zoek.trim().toLowerCase();
  const lijst = oefeningen
    .filter((o) => groep === 'Alle' || o.spiergroep === groep)
    .filter((o) => !term || `${o.naam} ${o.hevy ?? ''}`.toLowerCase().includes(term))
    .sort((a, b) => a.naam.localeCompare(b.naam));

  if (nieuw) {
    return (
      <Venster titel="Nieuwe oefening" sluit={sluit} terug={() => zetNieuw(null)}>
        <div className="space-y-4">
          <Veld label="Naam" waarde={nieuw.naam} wijzig={(t) => zetNieuw({ ...nieuw, naam: t })} autoFocus />
          <Keuze
            label="Spiergroep"
            kolommen={3}
            waarde={nieuw.spiergroep}
            kies={(g) => zetNieuw({ ...nieuw, spiergroep: g })}
            opties={SPIERGROEPEN.map((g) => ({ sleutel: g, label: g }))}
          />
          <button
            className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair disabled:opacity-40"
            disabled={!nieuw.naam.trim()}
            onClick={async () => {
              const o = { naam: nieuw.naam.trim(), spiergroep: nieuw.spiergroep };
              const id = await db.oefeningen.add(o);
              kies({ ...o, id });
            }}
          >
            Toevoegen
          </button>
        </div>
      </Venster>
    );
  }

  return (
    <Venster titel="Oefening kiezen" sluit={sluit} vol>
      <div className="space-y-3">
        <label className="flex items-center gap-2 rounded-[12px] border border-rand bg-kaart px-3 focus-within:border-primair">
          <Icoon naam="zoek" grootte={18} className="text-zacht" />
          <span className="sr-only">Zoeken</span>
          <input
            className="w-full bg-transparent py-3 outline-none"
            type="search"
            placeholder="Zoek oefening"
            value={zoek}
            onChange={(e) => zetZoek(e.target.value)}
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {['Alle', ...SPIERGROEPEN].map((g) => (
            <button
              key={g}
              className={`h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold ${
                groep === g ? 'border-primair bg-primair text-op-primair' : 'border-rand bg-kaart'
              }`}
              onClick={() => zetGroep(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          className="knop flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-rand text-sm font-semibold"
          onClick={() => zetNieuw({ naam: zoek.trim(), spiergroep: groep === 'Alle' ? 'Overig' : groep })}
        >
          <Icoon naam="plus" grootte={16} />
          Nieuwe oefening{zoek.trim() ? ` ‘${zoek.trim()}’` : ''}
        </button>
        <ul className="kaart divide-y divide-rand !py-0">
          {lijst.map((o) => (
            <li key={o.id}>
              <button className="flex min-h-13 w-full items-center gap-3 py-2 text-left" onClick={() => kies(o)}>
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">{o.naam}</span>
                  <span className="block text-xs text-zacht">{o.spiergroep}</span>
                </span>
                <Icoon naam="plus" grootte={18} className="text-zacht" />
              </button>
            </li>
          ))}
          {lijst.length === 0 && <li className="py-4 text-center text-sm text-zacht">Niets gevonden.</li>}
        </ul>
      </div>
    </Venster>
  );
}
