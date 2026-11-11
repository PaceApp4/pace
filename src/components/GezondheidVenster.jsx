import { useState } from 'react';
import { db } from '../db.js';
import { langeDatum } from '../lib/datum.js';
import { leesNummer } from '../lib/gezondheid.js';
import Venster from './Venster.jsx';
import Veld from './Veld.jsx';

function tekst(waarde) {
  return waarde || waarde === 0 ? String(waarde).replace('.', ',') : '';
}

// Stappen en slaap van één dag zelf invullen of corrigeren.
export default function GezondheidVenster({ datum, dag, sluit }) {
  const slaap = dag?.slaapMin ?? 0;
  const [stappen, zetStappen] = useState(tekst(dag?.stappen));
  const [uren, zetUren] = useState(slaap ? String(Math.floor(slaap / 60)) : '');
  const [minuten, zetMinuten] = useState(slaap ? String(Math.round(slaap % 60)) : '');
  const [diep, zetDiep] = useState(tekst(dag?.diepMin));
  const [rem, zetRem] = useState(tekst(dag?.remMin));
  const [score, zetScore] = useState(tekst(dag?.slaapscore));

  async function opslaan() {
    const n = (t) => {
      const g = leesNummer(t);
      return g === null ? undefined : g;
    };
    const u = n(uren) ?? 0;
    const m = n(minuten) ?? 0;
    const nieuw = {
      ...(dag ?? {}),
      datum,
      stappen: n(stappen) !== undefined ? Math.round(n(stappen)) : undefined,
      slaapMin: u || m ? u * 60 + m : undefined,
      diepMin: n(diep),
      remMin: n(rem),
      slaapscore: n(score),
      bron: dag?.bron ?? 'handmatig',
      bijgewerkt: Date.now(),
    };
    await db.gezondheid.put(nieuw);
    sluit();
  }

  return (
    <Venster titel={langeDatum(datum)} sluit={sluit}>
      <div className="space-y-4">
        <Veld label="Stappen" waarde={stappen} wijzig={zetStappen} getal placeholder="bijv. 8500" />
        <div>
          <h3 className="mb-1 text-sm font-semibold">Slaap</h3>
          <div className="grid grid-cols-2 gap-3">
            <Veld label="Uren" waarde={uren} wijzig={zetUren} getal eenheid="u" />
            <Veld label="Minuten" waarde={minuten} wijzig={zetMinuten} getal eenheid="m" />
            <Veld label="Diepe slaap (mag leeg)" waarde={diep} wijzig={zetDiep} getal eenheid="min" />
            <Veld label="REM-slaap (mag leeg)" waarde={rem} wijzig={zetRem} getal eenheid="min" />
          </div>
        </div>
        <Veld
          label="Slaapscore uit Zepp (mag leeg; dan rekent Pace zelf)"
          waarde={score}
          wijzig={zetScore}
          getal
          placeholder="0–100"
        />
        <button
          className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
          onClick={opslaan}
        >
          Opslaan
        </button>
      </div>
    </Venster>
  );
}
