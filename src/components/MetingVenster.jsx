import { useState } from 'react';
import { db, useProfiel } from '../db.js';
import { vandaag } from '../lib/datum.js';
import { bmi } from '../lib/plan.js';
import { leesNummer } from '../lib/gezondheid.js';
import { rond1 } from '../lib/voeding.js';
import Venster from './Venster.jsx';
import Veld from './Veld.jsx';

export const METING_VELDEN = [
  { sleutel: 'gewicht', label: 'Gewicht', eenheid: 'kg' },
  { sleutel: 'vet', label: 'Lichaamsvet', eenheid: '%' },
  { sleutel: 'skeletspier', label: 'Skeletspier', eenheid: '%' },
  { sleutel: 'spiermassa', label: 'Spiermassa', eenheid: 'kg' },
  { sleutel: 'bmi', label: 'BMI', eenheid: '' },
];

function tekst(w) {
  return w || w === 0 ? String(w).replace('.', ',') : '';
}

// Een meting van je weegschaal invoeren of wijzigen.
export default function MetingVenster({ meting, sluit }) {
  const [profiel, bewaarProfiel] = useProfiel();
  const [datum, zetDatum] = useState(meting?.datum ?? vandaag());
  const [w, zetW] = useState(() => {
    const begin = {};
    for (const v of METING_VELDEN) begin[v.sleutel] = tekst(meting?.[v.sleutel]);
    return begin;
  });
  const berekendBmi = bmi(w.gewicht.replace(',', '.'), profiel.lengte);

  async function opslaan() {
    const rij = { datum };
    for (const v of METING_VELDEN) {
      const n = leesNummer(w[v.sleutel]);
      if (n !== null) rij[v.sleutel] = n;
    }
    if (rij.bmi === undefined && berekendBmi) rij.bmi = Math.round(berekendBmi * 10) / 10;
    if (Object.keys(rij).length === 1) return;
    if (meting?.id) await db.lichaamslog.update(meting.id, rij);
    else await db.lichaamslog.add(rij);

    // Het nieuwste gewicht ook in je profiel zetten (voor het voedingsplan).
    const nieuwste = await db.lichaamslog.orderBy('datum').reverse().filter((m) => m.gewicht > 0).first();
    if (nieuwste) await bewaarProfiel({ ...profiel, gewicht: String(nieuwste.gewicht).replace('.', ',') });
    sluit();
  }

  return (
    <Venster titel={meting ? 'Meting wijzigen' : 'Nieuwe meting'} sluit={sluit}>
      <div className="space-y-3">
        <Veld label="Datum" waarde={datum} wijzig={zetDatum} type="date" />
        <div className="grid grid-cols-2 gap-3">
          {METING_VELDEN.map((v) => (
            <Veld
              key={v.sleutel}
              label={v.label}
              waarde={w[v.sleutel]}
              wijzig={(t) => zetW({ ...w, [v.sleutel]: t })}
              eenheid={v.eenheid}
              getal
              placeholder={v.sleutel === 'bmi' && berekendBmi ? rond1(berekendBmi) : ''}
            />
          ))}
        </div>
        <p className="text-xs text-zacht">
          Laat BMI leeg om hem te berekenen uit je gewicht en lengte (lengte vul je in bij Meer &gt;
          Profiel). Alleen ingevulde velden worden bewaard.
        </p>
        <button
          className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
          onClick={opslaan}
        >
          Opslaan
        </button>
        {meting?.id && (
          <button
            className="knop w-full rounded-[12px] bg-vlak py-3 font-semibold text-over"
            onClick={async () => {
              await db.lichaamslog.delete(meting.id);
              sluit();
            }}
          >
            Verwijderen
          </button>
        )}
      </div>
    </Venster>
  );
}
