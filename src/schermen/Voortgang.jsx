import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, useDoelen } from '../db.js';
import { alsTekst, korteDatum, langeDatum, vandaag, verschuif } from '../lib/datum.js';
import { e1rm, kgTekst, recordsVan, sessiesVan, volumeVan, werksets } from '../lib/training.js';
import { rond, rond1 } from '../lib/voeding.js';
import { Keuze } from '../components/Veld.jsx';
import Icoon from '../components/Icoon.jsx';
import Venster from '../components/Venster.jsx';
import LijnGrafiek from '../components/LijnGrafiek.jsx';
import WorkoutDetail from '../components/WorkoutDetail.jsx';
import MetingVenster, { METING_VELDEN } from '../components/MetingVenster.jsx';

export default function Voortgang() {
  const [deel, zetDeel] = useState('kalender');
  return (
    <div className="space-y-3">
      <h1 className="text-[26px] font-bold tracking-tight">Voortgang</h1>
      <Keuze
        waarde={deel}
        kies={zetDeel}
        opties={[
          { sleutel: 'kalender', label: 'Kalender' },
          { sleutel: 'oefeningen', label: 'Oefeningen' },
          { sleutel: 'lichaam', label: 'Lichaam' },
        ]}
      />
      {deel === 'kalender' && <Kalender />}
      {deel === 'oefeningen' && <Oefeningen />}
      {deel === 'lichaam' && <Lichaam />}
    </div>
  );
}

/* ---------------- Kalender ---------------- */

const WEEKDAGEN = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function Kalender() {
  const [doelen] = useDoelen();
  const [maand, zetMaand] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [gekozen, zetGekozen] = useState(vandaag());
  const [detail, zetDetail] = useState(null);

  const eerste = alsTekst(maand);
  const laatste = alsTekst(new Date(maand.getFullYear(), maand.getMonth() + 1, 0));
  const workouts =
    useLiveQuery(() => db.workouts.where('datum').between(verschuif(eerste, -60), laatste, true, true).toArray(), [eerste]) ?? [];
  const gezondheid =
    useLiveQuery(() => db.gezondheid.where('datum').between(verschuif(eerste, -60), laatste, true, true).toArray(), [eerste]) ?? [];

  const workoutDagen = new Set(workouts.map((w) => w.datum));
  const stappenPerDag = new Map(gezondheid.map((g) => [g.datum, g.stappen ?? 0]));
  const bewogen = (dag) => workoutDagen.has(dag) || (doelen.stappen > 0 && (stappenPerDag.get(dag) ?? 0) >= doelen.stappen);

  // Rooster: maandag als eerste dag van de week.
  const begin = (maand.getDay() + 6) % 7;
  const aantalDagen = new Date(maand.getFullYear(), maand.getMonth() + 1, 0).getDate();
  const vakjes = [...Array(begin).fill(null), ...Array.from({ length: aantalDagen }, (_, i) => alsTekst(new Date(maand.getFullYear(), maand.getMonth(), i + 1)))];

  const dagenInMaand = vakjes.filter(Boolean);
  const aantalWorkouts = workouts.filter((w) => w.datum >= eerste && w.datum <= laatste).length;
  const aantalBewogen = dagenInMaand.filter((d) => d <= vandaag() && bewogen(d)).length;

  // Reeks: aaneengesloten dagen voldoende bewogen tot en met vandaag (of gisteren).
  let reeks = 0;
  let dag = bewogen(vandaag()) ? vandaag() : verschuif(vandaag(), -1);
  while (bewogen(dag) && reeks < 60) {
    reeks++;
    dag = verschuif(dag, -1);
  }

  const maandNaam = maand.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  const dagWorkouts = workouts.filter((w) => w.datum === gekozen);
  const dagStappen = stappenPerDag.get(gekozen);

  return (
    <>
      <section className="kaart space-y-3">
        <div className="flex items-center justify-between">
          <button className="knop flex h-10 w-10 items-center justify-center rounded-[10px] bg-vlak" onClick={() => zetMaand(new Date(maand.getFullYear(), maand.getMonth() - 1, 1))} aria-label="Vorige maand">
            <Icoon naam="links" />
          </button>
          <h2 className="text-[15px] font-semibold capitalize">{maandNaam}</h2>
          <button className="knop flex h-10 w-10 items-center justify-center rounded-[10px] bg-vlak" onClick={() => zetMaand(new Date(maand.getFullYear(), maand.getMonth() + 1, 1))} aria-label="Volgende maand">
            <Icoon naam="rechts" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAGEN.map((d) => (
            <span key={d} className="pb-1 text-[11px] font-semibold text-zacht uppercase">
              {d}
            </span>
          ))}
          {vakjes.map((d, i) => {
            if (!d) return <span key={`leeg-${i}`} />;
            const getraind = workoutDagen.has(d);
            const genoeg = d <= vandaag() && bewogen(d);
            return (
              <button
                key={d}
                className="flex h-11 flex-col items-center justify-center gap-0.5"
                onClick={() => zetGekozen(d)}
                aria-label={`${langeDatum(d)}${getraind ? ', workout' : ''}${genoeg ? ', voldoende bewogen' : ''}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    getraind ? 'bg-primair font-semibold text-op-primair' : ''
                  } ${d === gekozen ? 'ring-2 ring-tekst/40' : ''} ${d === vandaag() && !getraind ? 'font-bold text-primair' : ''}`}
                >
                  {Number(d.slice(8))}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${genoeg ? 'bg-goed' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-rand pt-3 text-xs text-zacht">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primair" /> Workout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-goed" /> Voldoende bewogen ({rond(doelen.stappen)} stappen of workout)
          </span>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Workouts', aantalWorkouts],
          ['Dagen bewogen', aantalBewogen],
          ['Reeks', `${reeks} d`],
        ].map(([label, waarde]) => (
          <div key={label} className="kaart !p-3">
            <div className="text-lg font-bold">{waarde}</div>
            <div className="text-xs text-zacht">{label}</div>
          </div>
        ))}
      </div>

      <section className="kaart space-y-2">
        <h2 className="text-[15px] font-semibold">{langeDatum(gekozen)}</h2>
        <p className="text-sm text-zacht">
          {dagStappen != null ? `${rond(dagStappen)} stappen` : 'Geen stappen bekend'}
          {bewogen(gekozen) ? ' · voldoende bewogen' : ''}
        </p>
        {dagWorkouts.map((w) => (
          <button key={w.id} className="knop flex w-full items-center gap-3 rounded-[10px] bg-vlak px-3 py-2.5 text-left" onClick={() => zetDetail(w)}>
            <span className="flex-1 text-sm">
              <b className="font-semibold">{w.naam}</b>
              <span className="text-zacht">
                {' '}
                · {Math.round((w.eind - w.start) / 60000)} min · {kgTekst(Math.round(volumeVan(w)))} kg
              </span>
            </span>
            <Icoon naam="rechts" grootte={16} className="text-zacht" />
          </button>
        ))}
      </section>
      {detail && <WorkoutDetail workout={detail} sluit={() => zetDetail(null)} />}
    </>
  );
}

/* ---------------- Oefeningen ---------------- */

function Oefeningen() {
  const workouts = useLiveQuery(() => db.workouts.toArray(), []) ?? [];
  const oefeningen = useLiveQuery(() => db.oefeningen.toArray(), []) ?? [];
  const [gekozen, zetGekozen] = useState(null);

  // Per oefening: laatste keer en beste geschatte 1RM.
  const perOefening = new Map();
  for (const w of workouts) {
    for (const o of w.oefeningen) {
      const sets = werksets(o);
      if (!sets.length) continue;
      const info = perOefening.get(o.oefeningId) ?? { laatst: '', beste: 0, sessies: 0 };
      info.sessies++;
      if (w.datum > info.laatst) info.laatst = w.datum;
      for (const s of sets) info.beste = Math.max(info.beste, e1rm(s.kg, s.reps));
      perOefening.set(o.oefeningId, info);
    }
  }
  const lijst = [...perOefening.entries()]
    .map(([id, info]) => ({ id, ...info, naam: oefeningen.find((o) => o.id === id)?.naam ?? 'Onbekend' }))
    .sort((a, b) => b.laatst.localeCompare(a.laatst));

  const week = verschuif(vandaag(), -6);
  const dezeWeek = workouts.filter((w) => w.datum >= week);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Workouts 7 d', dezeWeek.length],
          ['Volume 7 d', `${kgTekst(Math.round(dezeWeek.reduce((s, w) => s + volumeVan(w), 0) / 100) / 10)} t`],
          ['Totaal', workouts.length],
        ].map(([label, waarde]) => (
          <div key={label} className="kaart !p-3">
            <div className="text-lg font-bold">{waarde}</div>
            <div className="text-xs text-zacht">{label}</div>
          </div>
        ))}
      </div>

      {lijst.length === 0 ? (
        <p className="kaart text-sm text-zacht">
          Nog geen trainingen. Na je eerste workout (of een Hevy-import via Meer) zie je hier per
          oefening je grafieken en records.
        </p>
      ) : (
        <div className="kaart !py-1">
          {lijst.map((o, i) => (
            <button
              key={o.id}
              className={`flex min-h-13 w-full items-center gap-3 py-2 text-left ${i > 0 ? 'border-t border-rand' : ''}`}
              onClick={() => zetGekozen(o)}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{o.naam}</span>
                <span className="block text-xs text-zacht">
                  {o.sessies}× · laatst {korteDatum(o.laatst)}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold">{kgTekst(Math.round(o.beste))} kg</span>
                <span className="block text-[11px] text-zacht">e1RM</span>
              </span>
              <Icoon naam="rechts" grootte={18} className="text-zacht" />
            </button>
          ))}
        </div>
      )}
      {gekozen && <OefeningDetail oefening={gekozen} workouts={workouts} sluit={() => zetGekozen(null)} />}
    </>
  );
}

const MAATSTAVEN = [
  { sleutel: 'beste1rm', label: 'Geschat 1RM', eenheid: 'kg' },
  { sleutel: 'zwaarste', label: 'Zwaarste', eenheid: 'kg' },
  { sleutel: 'volume', label: 'Volume', eenheid: 'kg' },
];

function OefeningDetail({ oefening, workouts, sluit }) {
  const [maat, zetMaat] = useState('beste1rm');
  const sessies = sessiesVan(workouts, oefening.id);
  const pr = recordsVan(sessies);
  const m = MAATSTAVEN.find((x) => x.sleutel === maat);

  return (
    <Venster titel={oefening.naam} sluit={sluit} vol>
      <div className="space-y-3">
        <Keuze waarde={maat} kies={zetMaat} opties={MAATSTAVEN} />
        <section className="kaart">
          <LijnGrafiek
            punten={sessies.map((s) => ({ datum: s.datum, waarde: s[maat] }))}
            eenheid={m.eenheid}
            opmaak={(w) => kgTekst(maat === 'volume' ? Math.round(w) : Math.round(w * 10) / 10)}
          />
        </section>

        <section className="kaart space-y-2">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold">
            <Icoon naam="trofee" grootte={18} className="text-primair" />
            Records
          </h3>
          {[
            ['Geschat 1RM', pr.beste1rm && `${kgTekst(Math.round(pr.beste1rm.waarde * 10) / 10)} kg`, pr.beste1rm && `${kgTekst(pr.beste1rm.kg)} × ${pr.beste1rm.reps}`, pr.beste1rm?.datum],
            ['Zwaarste gewicht', pr.zwaarste && `${kgTekst(pr.zwaarste.kg)} kg`, pr.zwaarste && `× ${pr.zwaarste.reps}`, pr.zwaarste?.datum],
            ['Meeste herhalingen', pr.meesteReps && `${pr.meesteReps.reps} reps`, pr.meesteReps && `met ${kgTekst(pr.meesteReps.kg)} kg`, pr.meesteReps?.datum],
            ['Meeste volume', pr.volume && `${kgTekst(Math.round(pr.volume.waarde))} kg`, 'in één sessie', pr.volume?.datum],
          ].map(([label, waarde, extra, datum]) =>
            waarde ? (
              <div key={label} className="flex items-baseline justify-between border-t border-rand pt-2 text-sm first-of-type:border-0">
                <span className="text-zacht">{label}</span>
                <span className="text-right">
                  <b className="font-semibold">{waarde}</b> <span className="text-zacht">{extra}</span>
                  <span className="block text-[11px] text-zacht">{korteDatum(datum)}</span>
                </span>
              </div>
            ) : null
          )}
        </section>

        <section className="kaart space-y-2">
          <h3 className="text-[15px] font-semibold">Geschiedenis</h3>
          {[...sessies].reverse().slice(0, 15).map((s) => (
            <div key={s.start} className="border-t border-rand pt-2 text-sm first-of-type:border-0">
              <div className="text-xs font-semibold text-zacht">{korteDatum(s.datum)}</div>
              <div>{s.sets.map((x) => `${kgTekst(x.kg)}×${x.reps}`).join('  ·  ')}</div>
            </div>
          ))}
        </section>
      </div>
    </Venster>
  );
}

/* ---------------- Lichaam ---------------- */

function Lichaam() {
  const metingen = useLiveQuery(() => db.lichaamslog.orderBy('datum').toArray(), []) ?? [];
  const [maat, zetMaat] = useState('gewicht');
  const [bewerk, zetBewerk] = useState(null); // {} = nieuw

  const nieuwste = metingen[metingen.length - 1];
  const vorigeVan = (sleutel) => {
    const met = metingen.filter((m) => m[sleutel] != null);
    return met.length >= 2 ? met[met.length - 2][sleutel] : null;
  };
  const veld = METING_VELDEN.find((v) => v.sleutel === maat);

  return (
    <>
      <button
        className="knop flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primair font-semibold text-op-primair"
        onClick={() => zetBewerk({})}
      >
        <Icoon naam="plus" />
        Meting toevoegen
      </button>

      {nieuwste ? (
        <section className="kaart space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">Laatste meting</h2>
            <span className="text-xs text-zacht">{korteDatum(nieuwste.datum)}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {METING_VELDEN.map((v) => {
              const laatsteWaarde = [...metingen].reverse().find((m) => m[v.sleutel] != null)?.[v.sleutel];
              const vorige = vorigeVan(v.sleutel);
              const verschil = laatsteWaarde != null && vorige != null ? laatsteWaarde - vorige : null;
              return (
                <div key={v.sleutel}>
                  <div className="text-xs text-zacht">{v.label}</div>
                  <div className="text-[17px] font-semibold">
                    {laatsteWaarde != null ? rond1(laatsteWaarde) : '–'}
                    <span className="text-xs font-medium text-zacht"> {v.eenheid}</span>
                  </div>
                  {verschil != null && Math.abs(verschil) >= 0.05 && (
                    <div className="text-[11px] text-zacht">
                      {verschil > 0 ? '+' : '−'}
                      {rond1(Math.abs(verschil))} sinds vorige
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="kaart text-sm text-zacht">
          Nog geen metingen. Voer de waarden van je weegschaal in: gewicht, lichaamsvet, skeletspier,
          spiermassa en BMI.
        </p>
      )}

      {metingen.length > 0 && (
        <>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {METING_VELDEN.map((v) => (
              <button
                key={v.sleutel}
                className={`h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold ${
                  maat === v.sleutel ? 'border-primair bg-primair text-op-primair' : 'border-rand bg-kaart'
                }`}
                onClick={() => zetMaat(v.sleutel)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <section className="kaart">
            <LijnGrafiek
              punten={metingen.filter((m) => m[maat] != null).map((m) => ({ datum: m.datum, waarde: m[maat] }))}
              eenheid={veld.eenheid}
            />
          </section>

          <section className="kaart !py-1">
            {[...metingen].reverse().map((m, i) => (
              <button
                key={m.id}
                className={`flex min-h-12 w-full items-center gap-3 py-2 text-left ${i > 0 ? 'border-t border-rand' : ''}`}
                onClick={() => zetBewerk(m)}
              >
                <span className="w-20 text-sm font-semibold">{korteDatum(m.datum)}</span>
                <span className="flex-1 truncate text-xs text-zacht">
                  {METING_VELDEN.filter((v) => m[v.sleutel] != null)
                    .map((v) => `${v.label} ${rond1(m[v.sleutel])}${v.eenheid ? ` ${v.eenheid}` : ''}`)
                    .join(' · ')}
                </span>
                <Icoon naam="potlood" grootte={16} className="text-zacht" />
              </button>
            ))}
          </section>
        </>
      )}

      {bewerk && <MetingVenster meting={bewerk.id ? bewerk : null} sluit={() => zetBewerk(null)} />}
    </>
  );
}
