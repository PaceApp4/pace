import { langeDatum, mooieDatum, vandaag, verschuif } from '../lib/datum.js';
import Icoon from './Icoon.jsx';

// Kop van een scherm met de datum en pijltjes om een dag terug of vooruit te gaan.
export default function DatumKiezer({ titel, datum, zetDatum, groet }) {
  const isVandaag = datum === vandaag();

  return (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {groet && <div className="text-[13px] font-semibold text-primair">{groet}</div>}
        <button className="text-[13px] font-medium text-zacht" onClick={() => zetDatum(vandaag())}>
          {langeDatum(datum)}
          {!isVandaag && <span className="ml-2 font-semibold text-primair">Naar vandaag</span>}
        </button>
        <h1 className="text-[26px] leading-tight font-bold tracking-tight">
          {titel ?? mooieDatum(datum)}
        </h1>
      </div>
      <div className="flex gap-2">
        <button
          className="knop kaart flex h-11 w-11 items-center justify-center !rounded-[14px] !p-0"
          onClick={() => zetDatum(verschuif(datum, -1))}
          aria-label="Vorige dag"
        >
          <Icoon naam="links" />
        </button>
        <button
          className="knop kaart flex h-11 w-11 items-center justify-center !rounded-[14px] !p-0"
          onClick={() => zetDatum(verschuif(datum, 1))}
          aria-label="Volgende dag"
        >
          <Icoon naam="rechts" />
        </button>
      </div>
    </header>
  );
}
