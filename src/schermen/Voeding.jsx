import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, useDoelen } from '../db.js';
import { MAALTIJDEN, rond, rond1, totaalVan, waardenVoor } from '../lib/voeding.js';
import DatumKiezer from '../components/DatumKiezer.jsx';
import Venster from '../components/Venster.jsx';
import VoedingToevoegen from '../components/VoedingToevoegen.jsx';
import HoeveelheidFormulier from '../components/HoeveelheidFormulier.jsx';

// Het voedingsdagboek: per maaltijd zien en loggen wat je gegeten hebt.
export default function Voeding({ datum, zetDatum }) {
  const [doelen] = useDoelen();
  const [toevoegenAan, zetToevoegenAan] = useState(null); // de gekozen maaltijd
  const [bewerkRegel, zetBewerkRegel] = useState(null); // de regel die je aantikt

  const regels =
    useLiveQuery(() => db.voedingslog.where('datum').equals(datum).sortBy('tijd'), [datum]) ?? [];
  const totaal = totaalVan(regels);

  return (
    <div className="space-y-4">
      <DatumKiezer datum={datum} zetDatum={zetDatum} />

      {/* Dagtotaal */}
      <section className="rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 p-4 text-white shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold">{rond(totaal.kcal)} kcal</span>
          <span className="text-sm opacity-90">doel {rond(doelen.kcal)}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs">
          {[
            ['Eiwit', totaal.eiwit],
            ['Koolh.', totaal.koolhydraten],
            ['Vet', totaal.vet],
            ['Vezels', totaal.vezels],
            ['Suiker', totaal.suiker],
          ].map(([label, waarde]) => (
            <div key={label} className="rounded-xl bg-white/20 py-1.5">
              <div className="text-base font-bold">{rond(waarde)} g</div>
              <div className="opacity-90">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Eén kaart per maaltijd */}
      {MAALTIJDEN.map((maaltijd) => {
        const eigenRegels = regels.filter((r) => r.maaltijd === maaltijd.sleutel);
        const maaltijdTotaal = totaalVan(eigenRegels);
        return (
          <section key={maaltijd.sleutel} className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{maaltijd.icoon}</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold leading-tight">{maaltijd.label}</h2>
                <p className="text-sm text-indigo-900/60">
                  {rond(maaltijdTotaal.kcal)} kcal · {rond(maaltijdTotaal.eiwit)} g eiwit
                </p>
              </div>
              <button
                className="knop h-11 w-11 rounded-full bg-violet-600 text-2xl font-bold text-white shadow-sm"
                onClick={() => zetToevoegenAan(maaltijd)}
                aria-label={`Toevoegen aan ${maaltijd.label}`}
              >
                +
              </button>
            </div>

            {eigenRegels.length > 0 && (
              <ul className="mt-3 divide-y divide-violet-100">
                {eigenRegels.map((regel) => {
                  const w = waardenVoor(regel.per100, regel.gram);
                  return (
                    <li key={regel.id}>
                      <button
                        className="flex w-full items-center gap-3 py-2 text-left"
                        onClick={() => zetBewerkRegel(regel)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{regel.naam}</div>
                          <div className="text-sm text-indigo-900/60">
                            {rond1(regel.gram)} {regel.eenheid ?? 'g'}
                          </div>
                        </div>
                        <div className="font-bold">{rond(w.kcal)} kcal</div>
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
