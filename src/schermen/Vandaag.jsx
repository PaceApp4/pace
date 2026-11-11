import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, STANDAARD_WATERKNOPPEN, useDoelen, useInstelling, useProfiel } from '../db.js';
import { MAALTIJDEN, rond, totaalVan } from '../lib/voeding.js';
import { urenMinuten, vandaag } from '../lib/datum.js';
import { importeerVanKlembord, slaapLabel, slaapScore } from '../lib/gezondheid.js';
import { kgTekst, volumeVan } from '../lib/training.js';
import Ring from '../components/Ring.jsx';
import { Voortgang } from '../components/Balk.jsx';
import DatumKiezer from '../components/DatumKiezer.jsx';
import Icoon from '../components/Icoon.jsx';
import Badge from '../components/Badge.jsx';
import GezondheidVenster from '../components/GezondheidVenster.jsx';
import { useMelding } from '../components/Melding.jsx';

const MACRO_RINGEN = [
  { sleutel: 'eiwit', label: 'Eiwitten', kleur: 'var(--pace-eiwit)' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten', kleur: 'var(--pace-koolh)' },
  { sleutel: 'vet', label: 'Vetten', kleur: 'var(--pace-vet)' },
];

function groetVoor(naam) {
  const uur = new Date().getHours();
  const deel = uur < 6 ? 'Goedenacht' : uur < 12 ? 'Goedemorgen' : uur < 18 ? 'Goedemiddag' : 'Goedenavond';
  return naam ? `${deel}, ${naam}` : deel;
}

function Gehaald() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-goed/15 px-2 py-0.5 text-[11px] font-semibold text-goed">
      <Icoon naam="vink" grootte={12} dikte={2.5} />
      Gehaald
    </span>
  );
}

// Het dashboard van de gekozen dag.
export default function Vandaag({ datum, zetDatum, naarVoeding, naarTraining }) {
  const [doelen] = useDoelen();
  const [profiel] = useProfiel();
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
  const kcalProcent = doelen.kcal ? Math.round((totaal.kcal / doelen.kcal) * 100) : 0;
  const slaap = slaapScore(dag, doelen.slaapUren);
  const stappen = dag?.stappen ?? 0;
  const stappenGehaald = doelen.stappen > 0 && stappen >= doelen.stappen;
  const bewogen = workouts.length > 0 || stappenGehaald;
  const waterGehaald = doelen.water > 0 && water >= doelen.water;

  async function plakGezondheid() {
    try {
      const aantal = await importeerVanKlembord();
      toon(aantal === 1 ? 'Stappen en slaap bijgewerkt' : `${aantal} dagen bijgewerkt`);
    } catch (fout) {
      toon(fout.message);
    }
  }

  return (
    <div className="binnenkomen space-y-3">
      <DatumKiezer
        datum={datum}
        zetDatum={zetDatum}
        groet={datum === vandaag() ? groetVoor(profiel.naam) : null}
      />

      {/* Calorieën */}
      <section className="hero">
        <div className="relative flex items-center gap-4">
          <Ring
            waarde={totaal.kcal}
            doel={doelen.kcal}
            grootte={124}
            dikte={11}
            kleur="#ffffff"
            spoor="rgb(255 255 255 / 0.2)"
            overKleur="#fecaca"
          >
            <Icoon naam="vlam" grootte={16} className="mb-0.5 opacity-80" />
            <span className="text-[26px] leading-none font-bold tracking-tight">{rond(Math.abs(kcalOver))}</span>
            <span className="mt-1 text-[11px] font-medium opacity-80">{kcalOver >= 0 ? 'kcal over' : 'kcal te veel'}</span>
          </Ring>
          <div className="grid flex-1 gap-2">
            <div className="glas px-3 py-2">
              <div className="text-[11px] font-medium opacity-80">Gegeten</div>
              <div className="text-lg leading-tight font-semibold">{rond(totaal.kcal)} kcal</div>
            </div>
            <div className="glas px-3 py-2">
              <div className="text-[11px] font-medium opacity-80">Doel · {kcalProcent}%</div>
              <div className="text-lg leading-tight font-semibold">{rond(doelen.kcal)} kcal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Macro's */}
      <div className="grid grid-cols-3 gap-2">
        {MACRO_RINGEN.map((m) => (
          <div key={m.sleutel} className="kaart tint flex flex-col items-center gap-1.5 !px-2 !py-3" style={{ '--tint': m.kleur }}>
            <Ring waarde={totaal[m.sleutel]} doel={doelen[m.sleutel]} grootte={70} dikte={7} kleur={m.kleur} spoor={`color-mix(in srgb, ${m.kleur} 18%, transparent)`}>
              <span className="text-[15px] leading-none font-bold">{rond(totaal[m.sleutel])}</span>
              <span className="text-[10px] text-zacht">/ {rond(doelen[m.sleutel])} g</span>
            </Ring>
            <span className="text-xs font-semibold">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Water: altijd zonder scrollen bereikbaar */}
      <section className="kaart tint flex items-center gap-3 !py-3" style={{ '--tint': 'var(--pace-water)' }}>
        <Badge icoon="druppel" kleur="var(--pace-water)" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span>
              <b className="font-semibold">{rond(water)}</b>
              <span className="text-xs text-zacht"> / {rond(doelen.water)} ml</span>
            </span>
            {waterGehaald && <Gehaald />}
          </div>
          <Voortgang procent={doelen.water ? (water / doelen.water) * 100 : 0} kleur="var(--pace-water)" />
        </div>
        {waterknoppen.slice(0, 2).map((ml) => (
          <button
            key={ml}
            className="knop h-11 rounded-[12px] px-3 text-sm font-bold"
            style={{ background: 'color-mix(in srgb, var(--pace-water) 22%, var(--pace-kaart))' }}
            onClick={() => db.waterlog.add({ datum, ml, tijd: Date.now() })}
          >
            +{ml}
          </button>
        ))}
        <button
          className="knop flex h-11 w-8 items-center justify-center text-zacht disabled:opacity-30"
          disabled={waterregels.length === 0}
          onClick={() => db.waterlog.delete(waterregels[waterregels.length - 1].id)}
          aria-label="Laatste water ongedaan maken"
        >
          <Icoon naam="ongedaan" grootte={18} />
        </button>
      </section>

      {/* Slaap en stappen */}
      <div className="grid grid-cols-2 gap-3">
        <button className="knop kaart tint space-y-2 text-left" style={{ '--tint': 'var(--pace-slaap)' }} onClick={() => zetGezondheidOpen(true)}>
          <div className="flex items-center gap-2">
            <Badge icoon="maan" kleur="var(--pace-slaap)" grootte={30} icoonGrootte={16} />
            <span className="text-[13px] font-semibold">Slaap</span>
          </div>
          {slaap ? (
            <div className="flex items-center gap-2.5">
              <Ring waarde={slaap.score} doel={100} grootte={46} dikte={5} kleur="var(--pace-slaap)" spoor="color-mix(in srgb, var(--pace-slaap) 18%, transparent)">
                <span className="text-sm font-bold">{slaap.score}</span>
              </Ring>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{slaapLabel(slaap.score)}</div>
                <div className="text-xs text-zacht">{dag?.slaapMin ? urenMinuten(dag.slaapMin) : 'score'}</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[22px] font-bold text-zacht">–</div>
              <div className="text-xs text-zacht">Tik om in te vullen</div>
            </div>
          )}
        </button>
        <button className="knop kaart tint space-y-2 text-left" style={{ '--tint': 'var(--pace-stappen)' }} onClick={() => zetGezondheidOpen(true)}>
          <div className="flex items-center gap-2">
            <Badge icoon="stappen" kleur="var(--pace-stappen)" grootte={30} icoonGrootte={16} />
            <span className="text-[13px] font-semibold">Stappen</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] leading-none font-bold">{rond(stappen)}</span>
            {stappenGehaald && <Gehaald />}
          </div>
          <Voortgang procent={doelen.stappen ? (stappen / doelen.stappen) * 100 : 0} kleur="var(--pace-stappen)" />
          <div className="text-xs text-zacht">doel {rond(doelen.stappen)}</div>
        </button>
      </div>
      <button
        className="knop flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-rand text-sm font-semibold text-zacht"
        onClick={plakGezondheid}
      >
        <Icoon naam="plak" grootte={18} />
        Stappen en slaap plakken uit Opdracht
      </button>

      {/* Training en beweging */}
      <section className="kaart tint space-y-3" style={{ '--tint': 'var(--pace-training)' }}>
        <div className="flex items-center gap-2.5">
          <Badge icoon="training" kleur="var(--pace-training)" />
          <h2 className="flex-1 text-[15px] font-semibold">Training</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-kaart px-2.5 py-1 text-[11px] font-semibold">
            <span className={`h-2 w-2 rounded-full ${bewogen ? 'bg-goed' : 'bg-zacht/50'}`} />
            {bewogen ? 'Voldoende bewogen' : 'Nog niet bewogen'}
          </span>
        </div>
        {workouts.length > 0 ? (
          workouts.map((w) => (
            <div key={w.id} className="flex items-center gap-2 rounded-[12px] bg-kaart px-3 py-2.5 text-sm">
              <Icoon naam="vink" grootte={16} dikte={2.5} className="text-goed" />
              <span className="font-semibold">{w.naam}</span>
              <span className="text-zacht">
                · {Math.round((w.eind - w.start) / 60000)} min · {kgTekst(Math.round(volumeVan(w)))} kg
              </span>
            </div>
          ))
        ) : (
          <button
            className="knop flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-semibold text-white"
            style={{ background: 'var(--pace-hero)' }}
            onClick={naarTraining}
          >
            <Icoon naam="play" grootte={14} />
            Workout starten
          </button>
        )}
      </section>

      {/* Maaltijden */}
      <section className="kaart !py-1.5">
        {MAALTIJDEN.map((maaltijd, i) => {
          const t = totaalVan(regels.filter((r) => r.maaltijd === maaltijd.sleutel));
          return (
            <button
              key={maaltijd.sleutel}
              className={`flex min-h-14 w-full items-center gap-3 py-2 text-left ${i > 0 ? 'border-t border-rand' : ''}`}
              onClick={naarVoeding}
            >
              <Badge icoon={maaltijd.icoon} kleur={maaltijd.kleur} />
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
