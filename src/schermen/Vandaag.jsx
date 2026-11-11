import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, STANDAARD_WATERKNOPPEN, useDoelen, useInstelling } from '../db.js';
import { MAALTIJDEN, rond, totaalVan } from '../lib/voeding.js';
import { urenMinuten } from '../lib/datum.js';
import { importeerVanKlembord, slaapLabel, slaapScore } from '../lib/gezondheid.js';
import { kgTekst, volumeVan } from '../lib/training.js';
import Ring from '../components/Ring.jsx';
import { Voortgang } from '../components/Balk.jsx';
import DatumKiezer from '../components/DatumKiezer.jsx';
import Icoon from '../components/Icoon.jsx';
import GezondheidVenster from '../components/GezondheidVenster.jsx';
import { useMelding } from '../components/Melding.jsx';

const MACRO_RINGEN = [
  { sleutel: 'eiwit', label: 'Eiwitten', kleur: 'var(--pace-eiwit)' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten', kleur: 'var(--pace-koolh)' },
  { sleutel: 'vet', label: 'Vetten', kleur: 'var(--pace-vet)' },
];

// Het dashboard van de gekozen dag.
export default function Vandaag({ datum, zetDatum, naarVoeding, naarTraining }) {
  const [doelen] = useDoelen();
  const [waterknoppen] = useInstelling('waterknoppen', STANDAARD_WATERKNOPPEN);
  const [gezondheidOpen, zetGezondheidOpen] = useState(false);
  const [melding, toon] = useMelding();

  const regels =
    useLiveQuery(() => db.voedingslog.where('datum').equals(datum).toArray(), [datum]) ?? [];
  const waterregels =
    useLiveQuery(() => db.waterlog.where('datum').equals(datum).sortBy('tijd'), [datum]) ?? [];
  const dag = useLiveQuery(() => db.gezondheid.get(datum), [datum]);
  const workouts =
    useLiveQuery(() => db.workouts.where('datum').equals(datum).toArray(), [datum]) ?? [];

  const totaal = totaalVan(regels);
  const water = waterregels.reduce((som, regel) => som + regel.ml, 0);
  const kcalOver = doelen.kcal - totaal.kcal;
  const slaap = slaapScore(dag, doelen.slaapUren);
  const stappen = dag?.stappen ?? 0;
  const bewogen = workouts.length > 0 || (doelen.stappen > 0 && stappen >= doelen.stappen);

  async function plakGezondheid() {
    try {
      const aantal = await importeerVanKlembord();
      toon(aantal === 1 ? 'Stappen en slaap bijgewerkt' : `${aantal} dagen bijgewerkt`);
    } catch (fout) {
      toon(fout.message);
    }
  }

  return (
    <div className="space-y-3">
      <DatumKiezer datum={datum} zetDatum={zetDatum} />

      {/* Calorieën en macro's */}
      <section className="kaart space-y-4">
        <div className="flex items-center gap-4">
          <Ring waarde={totaal.kcal} doel={doelen.kcal} grootte={128} dikte={11} kleur="var(--pace-primair)" overKleur="#ef4444">
            <span className="text-[26px] leading-none font-bold tracking-tight">{rond(Math.abs(kcalOver))}</span>
            <span className="mt-1 text-xs font-medium text-zacht">{kcalOver >= 0 ? 'kcal over' : 'kcal te veel'}</span>
          </Ring>
          <div className="grid flex-1 grid-cols-1 gap-2.5">
            {[
              ['Gegeten', totaal.kcal],
              ['Doel', doelen.kcal],
            ].map(([label, waarde]) => (
              <div key={label}>
                <div className="text-xs font-medium text-zacht">{label}</div>
                <div className="text-lg font-semibold">{rond(waarde)} kcal</div>
              </div>
            ))}
            <div className="text-xs text-zacht">
              Vezels {rond(totaal.vezels)}/{rond(doelen.vezels)} g · Suiker {rond(totaal.suiker)} g
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-rand pt-4">
          {MACRO_RINGEN.map((m) => (
            <div key={m.sleutel} className="flex flex-col items-center gap-1.5">
              <Ring waarde={totaal[m.sleutel]} doel={doelen[m.sleutel]} grootte={76} dikte={7} kleur={m.kleur}>
                <span className="text-[15px] leading-none font-bold">{rond(totaal[m.sleutel])}</span>
                <span className="text-[11px] text-zacht">/ {rond(doelen[m.sleutel])} g</span>
              </Ring>
              <span className="text-xs font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Water: altijd zonder scrollen bereikbaar */}
      <section className="kaart flex items-center gap-3 !py-3">
        <Icoon naam="druppel" className="text-[var(--pace-water)]" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="text-sm">
            <b className="font-semibold">{rond(water)}</b>
            <span className="text-zacht"> / {rond(doelen.water)} ml</span>
          </div>
          <Voortgang procent={doelen.water ? (water / doelen.water) * 100 : 0} kleur="var(--pace-water)" />
        </div>
        {waterknoppen.slice(0, 2).map((ml) => (
          <button
            key={ml}
            className="knop h-11 rounded-[10px] bg-vlak px-3 text-sm font-semibold"
            onClick={() => db.waterlog.add({ datum, ml, tijd: Date.now() })}
          >
            +{ml}
          </button>
        ))}
        <button
          className="knop flex h-11 w-9 items-center justify-center text-zacht disabled:opacity-30"
          disabled={waterregels.length === 0}
          onClick={() => db.waterlog.delete(waterregels[waterregels.length - 1].id)}
          aria-label="Laatste water ongedaan maken"
        >
          <Icoon naam="ongedaan" grootte={18} />
        </button>
      </section>

      {/* Slaap en stappen */}
      <div className="grid grid-cols-2 gap-3">
        <button className="knop kaart space-y-1 text-left" onClick={() => zetGezondheidOpen(true)}>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-zacht">
            <Icoon naam="maan" grootte={16} />
            Slaapscore
          </div>
          {slaap ? (
            <>
              <div className="text-[22px] font-bold">{slaap.score}</div>
              <div className="text-xs text-zacht">
                {slaapLabel(slaap.score)}
                {dag?.slaapMin ? ` · ${urenMinuten(dag.slaapMin)}` : ''}
              </div>
            </>
          ) : (
            <>
              <div className="text-[22px] font-bold text-zacht">–</div>
              <div className="text-xs text-zacht">Tik om in te vullen</div>
            </>
          )}
        </button>
        <button className="knop kaart space-y-1 text-left" onClick={() => zetGezondheidOpen(true)}>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-zacht">
            <Icoon naam="stappen" grootte={16} />
            Stappen
          </div>
          <div className="text-[22px] font-bold">
            {rond(stappen)}
            <span className="text-xs font-medium text-zacht"> / {rond(doelen.stappen)}</span>
          </div>
          <Voortgang procent={doelen.stappen ? (stappen / doelen.stappen) * 100 : 0} kleur="var(--pace-stappen)" />
        </button>
      </div>
      <button
        className="knop flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-rand text-sm font-semibold"
        onClick={plakGezondheid}
      >
        <Icoon naam="plak" grootte={18} />
        Stappen en slaap plakken uit Opdracht
      </button>

      {/* Training en beweging */}
      <section className="kaart space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Training</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-vlak px-2.5 py-1 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${bewogen ? 'bg-goed' : 'bg-zacht'}`} />
            {bewogen ? 'Voldoende bewogen' : 'Nog niet voldoende bewogen'}
          </span>
        </div>
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div key={w.id} className="text-sm">
              <span className="font-semibold">{w.naam}</span>
              <span className="text-zacht">
                {' '}
                · {Math.round((w.eind - w.start) / 60000)} min · {kgTekst(Math.round(volumeVan(w)))} kg volume
              </span>
            </div>
          ))
        ) : (
          <button
            className="knop flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-primair text-sm font-semibold text-op-primair"
            onClick={naarTraining}
          >
            <Icoon naam="play" grootte={16} />
            Workout starten
          </button>
        )}
      </section>

      {/* Maaltijden */}
      <section className="kaart !py-1">
        {MAALTIJDEN.map((maaltijd, i) => {
          const t = totaalVan(regels.filter((r) => r.maaltijd === maaltijd.sleutel));
          return (
            <button
              key={maaltijd.sleutel}
              className={`flex min-h-13 w-full items-center gap-3 py-2 text-left ${i > 0 ? 'border-t border-rand' : ''}`}
              onClick={naarVoeding}
            >
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">{maaltijd.label}</span>
                <span className="block text-xs text-zacht">
                  {t.kcal > 0
                    ? `E ${rond(t.eiwit)} · K ${rond(t.koolhydraten)} · V ${rond(t.vet)}`
                    : 'Nog niets gelogd'}
                </span>
              </span>
              <span className="text-[15px] font-semibold">
                {rond(t.kcal)}
                <span className="text-xs font-medium text-zacht"> kcal</span>
              </span>
              <Icoon naam="rechts" grootte={18} className="text-zacht" />
            </button>
          );
        })}
      </section>

      {gezondheidOpen && (
        <GezondheidVenster datum={datum} dag={dag} sluit={() => zetGezondheidOpen(false)} />
      )}
      {melding}
    </div>
  );
}
