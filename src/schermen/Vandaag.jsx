import { useLiveQuery } from 'dexie-react-hooks';
import { db, STANDAARD_WATERKNOPPEN, useDoelen, useInstelling } from '../db.js';
import { MAALTIJDEN, rond, totaalVan } from '../lib/voeding.js';
import Ring from '../components/Ring.jsx';
import Balk from '../components/Balk.jsx';
import DatumKiezer from '../components/DatumKiezer.jsx';

// Het dashboard: calorieën, macro's en water van de gekozen dag.
export default function Vandaag({ datum, zetDatum, naarVoeding }) {
  const [doelen] = useDoelen();
  const [waterknoppen] = useInstelling('waterknoppen', STANDAARD_WATERKNOPPEN);

  const regels =
    useLiveQuery(() => db.voedingslog.where('datum').equals(datum).toArray(), [datum]) ?? [];
  const waterregels =
    useLiveQuery(() => db.waterlog.where('datum').equals(datum).toArray(), [datum]) ?? [];

  const totaal = totaalVan(regels);
  const water = waterregels.reduce((som, regel) => som + regel.ml, 0);
  const kcalOver = doelen.kcal - totaal.kcal;
  const waterGehaald = doelen.water > 0 && water >= doelen.water;

  function voegWaterToe(ml) {
    db.waterlog.add({ datum, ml, tijd: Date.now() });
  }

  function laatsteWaterOngedaan() {
    const laatste = waterregels[waterregels.length - 1];
    if (laatste) db.waterlog.delete(laatste.id);
  }

  return (
    <div className="space-y-4">
      <DatumKiezer datum={datum} zetDatum={zetDatum} />

      {/* Calorieën en macro's */}
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <Ring waarde={totaal.kcal} doel={doelen.kcal} kleur="#8b5cf6" achtergrond="#ede9fe">
            <span className="text-3xl font-extrabold">{rond(Math.abs(kcalOver))}</span>
            <span className="text-xs font-semibold text-indigo-900/60">
              {kcalOver >= 0 ? 'kcal over' : 'kcal te veel'}
            </span>
          </Ring>
          <div className="flex-1 space-y-2 text-sm">
            <div className="rounded-2xl bg-violet-50 px-3 py-2">
              <div className="text-indigo-900/60">Gegeten</div>
              <div className="text-lg font-bold">{rond(totaal.kcal)} kcal</div>
            </div>
            <div className="rounded-2xl bg-pink-50 px-3 py-2">
              <div className="text-indigo-900/60">Doel</div>
              <div className="text-lg font-bold">{rond(doelen.kcal)} kcal</div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Balk label="Eiwit" waarde={totaal.eiwit} doel={doelen.eiwit} kleur="#f43f5e" />
          <Balk
            label="Koolhydraten"
            waarde={totaal.koolhydraten}
            doel={doelen.koolhydraten}
            kleur="#f59e0b"
          />
          <Balk label="Vet" waarde={totaal.vet} doel={doelen.vet} kleur="#0ea5e9" />
          <div className="grid grid-cols-2 gap-4">
            <Balk label="Vezels" waarde={totaal.vezels} doel={doelen.vezels} kleur="#10b981" />
            <Balk label="Suiker" waarde={totaal.suiker} doel={doelen.suiker} kleur="#d946ef" />
          </div>
        </div>
      </section>

      {/* Water */}
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-5">
          <Ring
            waarde={water}
            doel={doelen.water}
            grootte={136}
            dikte={12}
            kleur="#0ea5e9"
            achtergrond="#e0f2fe"
          >
            <span className="text-2xl">💧</span>
            <span className="text-lg font-extrabold">{rond(water)}</span>
            <span className="text-[11px] font-semibold text-indigo-900/60">
              van {rond(doelen.water)} ml
            </span>
          </Ring>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Water</h2>
            {waterGehaald ? (
              <div
                key="gehaald"
                className="animatie-pop mt-1 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700"
              >
                🎉 Doel gehaald!
              </div>
            ) : (
              <p className="text-sm text-indigo-900/60">
                Nog {rond(doelen.water - water)} ml te gaan
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {waterknoppen.map((ml, index) => (
                <button
                  key={index}
                  className="knop rounded-full bg-sky-500 px-4 py-2 font-bold text-white shadow-sm"
                  onClick={() => voegWaterToe(ml)}
                >
                  {index === 0 ? '🥛' : '🍶'} +{ml}
                </button>
              ))}
              {waterregels.length > 0 && (
                <button
                  className="knop rounded-full bg-sky-100 px-3 py-2 font-bold text-sky-700"
                  onClick={laatsteWaterOngedaan}
                  aria-label="Laatste water ongedaan maken"
                >
                  ↩
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Maaltijden in het kort */}
      <section className="grid grid-cols-2 gap-3">
        {MAALTIJDEN.map((maaltijd) => {
          const kcal = totaalVan(regels.filter((r) => r.maaltijd === maaltijd.sleutel)).kcal;
          return (
            <button
              key={maaltijd.sleutel}
              className="knop rounded-3xl bg-white p-4 text-left shadow-sm"
              onClick={naarVoeding}
            >
              <div className="text-2xl">{maaltijd.icoon}</div>
              <div className="mt-1 font-bold">{maaltijd.label}</div>
              <div className="text-sm text-indigo-900/60">{rond(kcal)} kcal</div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
