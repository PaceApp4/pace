import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, useDoelen } from '../db.js';
import { MAALTIJDEN, rond, rond1, totaalVan, waardenVoor } from '../lib/voeding.js';
import DatumKiezer from '../components/DatumKiezer.jsx';
import Venster from '../components/Venster.jsx';
import VoedingToevoegen from '../components/VoedingToevoegen.jsx';
import HoeveelheidFormulier from '../components/HoeveelheidFormulier.jsx';
import { Voortgang } from '../components/Balk.jsx';
import Icoon from '../components/Icoon.jsx';

// Het voedingsdagboek: per maaltijd zien en loggen wat je gegeten hebt.
export default function Voeding({ datum, zetDatum }) {
  const [doelen] = useDoelen();
  const [toevoegenAan, zetToevoegenAan] = useState(null); // de gekozen maaltijd
  const [bewerkRegel, zetBewerkRegel] = useState(null); // de regel die je aantikt

  const regels =
    useLiveQuery(() => db.voedingslog.where('datum').equals(datum).sortBy('tijd'), [datum]) ?? [];
  const totaal = totaalVan(regels);

  return (
    <div className="space-y-3">
      <DatumKiezer titel="Voeding" datum={datum} zetDatum={zetDatum} />

      {/* Dagtotaal */}
      <section className="kaart grid grid-cols-4 gap-3">
        {[
          ['kcal', totaal.kcal, doelen.kcal, '', 'var(--pace-primair)'],
          ['Eiwit', totaal.eiwit, doelen.eiwit, ' g', 'var(--pace-eiwit)'],
          ['Koolh.', totaal.koolhydraten, doelen.koolhydraten, ' g', 'var(--pace-koolh)'],
          ['Vet', totaal.vet, doelen.vet, ' g', 'var(--pace-vet)'],
        ].map(([label, waarde, doel, eenheid, kleur]) => (
          <div key={label} className="min-w-0 space-y-1.5">
            <div className="text-xs font-medium text-zacht">{label}</div>
            <div className="text-[15px] font-bold">
              {rond(waarde)}
              <span className="text-[11px] font-medium text-zacht">
                {' '}
                / {rond(doel)}
                {eenheid}
              </span>
            </div>
            <Voortgang procent={doel ? (waarde / doel) * 100 : 0} kleur={kleur} hoogte={4} />
          </div>
        ))}
      </section>

      {/* Eén kaart per maaltijd */}
      {MAALTIJDEN.map((maaltijd) => {
        const eigenRegels = regels.filter((r) => r.maaltijd === maaltijd.sleutel);
        const t = totaalVan(eigenRegels);
        return (
          <section key={maaltijd.sleutel} className="kaart !pb-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h2 className="text-[15px] font-semibold">{maaltijd.label}</h2>
                <p className="text-xs text-zacht">
                  {rond(t.kcal)} kcal · E {rond(t.eiwit)} · K {rond(t.koolhydraten)} · V {rond(t.vet)}
                </p>
              </div>
              <button
                className="knop flex h-11 w-11 items-center justify-center rounded-[10px] bg-primair text-op-primair"
                onClick={() => zetToevoegenAan(maaltijd)}
                aria-label={`Toevoegen aan ${maaltijd.label}`}
              >
                <Icoon naam="plus" />
              </button>
            </div>

            {eigenRegels.length > 0 && (
              <ul className="mt-2 divide-y divide-rand border-t border-rand">
                {eigenRegels.map((regel) => {
                  const w = waardenVoor(regel.per100, regel.gram);
                  return (
                    <li key={regel.id}>
                      <button
                        className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
                        onClick={() => zetBewerkRegel(regel)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-medium">{regel.naam}</div>
                          <div className="text-xs text-zacht">
                            {rond1(regel.gram)} {regel.eenheid ?? 'g'} · E {rond(w.eiwit)} · K {rond(w.koolhydraten)} · V {rond(w.vet)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {rond(w.kcal)}
                          <span className="text-xs font-medium text-zacht"> kcal</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {toevoegenAan && (
        <VoedingToevoegen
          datum={datum}
          maaltijd={toevoegenAan}
          sluit={() => zetToevoegenAan(null)}
        />
      )}

      {bewerkRegel && (
        <Venster titel={bewerkRegel.naam} sluit={() => zetBewerkRegel(null)}>
          <HoeveelheidFormulier
            item={bewerkRegel}
            beginGram={bewerkRegel.gram}
            knopTekst="Opslaan"
            opslaan={async (gram) => {
              await db.voedingslog.update(bewerkRegel.id, { gram });
              zetBewerkRegel(null);
            }}
            verwijder={async () => {
              await db.voedingslog.delete(bewerkRegel.id);
              zetBewerkRegel(null);
            }}
          />
        </Venster>
      )}
    </div>
  );
}
