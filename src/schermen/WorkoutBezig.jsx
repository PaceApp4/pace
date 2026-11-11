import { useEffect, useRef, useState } from 'react';
import { db } from '../db.js';
import { duurTekst, klokTijd } from '../lib/datum.js';
import { leesGetal } from '../lib/voeding.js';
import {
  STANDAARD_RUST,
  e1rm,
  kgTekst,
  oefeningVoorWorkout,
  rondAf,
  volumeVan,
  werksets,
} from '../lib/training.js';
import Icoon from '../components/Icoon.jsx';
import Venster from '../components/Venster.jsx';
import OefeningKiezer from '../components/OefeningKiezer.jsx';
import { useMelding } from '../components/Melding.jsx';

const RUSTOPTIES = [60, 90, 120, 180, 240];

// Korte pieptoon als de rusttijd voorbij is (werkt nadat je één keer iets hebt aangetikt).
let audio = null;
function maakAudioKlaar() {
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch {
    audio = null;
  }
}
function piep() {
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.4);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.4);
  } catch {
    // geen geluid mogelijk
  }
}

function alsInvoerTijd(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Het scherm tijdens het trainen (zoals in Hevy).
export default function WorkoutBezig({ begin, sluit }) {
  const [actief, zetActiefRuw] = useState(begin);
  const [nu, zetNu] = useState(Date.now());
  const [rust, zetRust] = useState(null); // { eind, duur }
  const [kiezerOpen, zetKiezerOpen] = useState(false);
  const [tijdOpen, zetTijdOpen] = useState(false);
  const [afrondOpen, zetAfrondOpen] = useState(false);
  const [records, zetRecords] = useState({}); // oefeningId -> { e1rm, kg }
  const [melding, toon] = useMelding();
  const opslaanTimer = useRef(null);
  const laatste = useRef(begin);
  const beeindigd = useRef(false); // na afronden of weggooien niets meer bewaren

  // Elke wijziging bewaren (met een kleine vertraging), zodat niets verloren gaat
  // als de iPhone de app sluit.
  function zetActief(nieuw) {
    const waarde = typeof nieuw === 'function' ? nieuw(laatste.current) : nieuw;
    laatste.current = waarde;
    zetActiefRuw(waarde);
    clearTimeout(opslaanTimer.current);
    opslaanTimer.current = setTimeout(bewaarNu, 300);
  }

  function bewaarNu() {
    clearTimeout(opslaanTimer.current);
    if (beeindigd.current) return;
    db.instellingen.put({ sleutel: 'actieveWorkout', waarde: laatste.current });
  }

  useEffect(() => {
    document.addEventListener('visibilitychange', bewaarNu);
    return () => {
      document.removeEventListener('visibilitychange', bewaarNu);
      bewaarNu(); // bij minimaliseren direct bewaren
    };
  }, []);

  // Klok
  useEffect(() => {
    const t = setInterval(() => zetNu(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Rusttimer afgelopen
  useEffect(() => {
    if (rust && nu >= rust.eind) {
      piep();
      zetRust(null);
    }
  }, [nu, rust]);

  // Records uit eerdere workouts, om PR's direct te herkennen.
  const idsSleutel = actief.oefeningen.map((o) => o.oefeningId).join(',');
  useEffect(() => {
    const ids = actief.oefeningen.map((o) => o.oefeningId);
    if (!ids.length) return;
    db.workouts
      .where('oefeningIds')
      .anyOf(ids)
      .toArray()
      .then((lijst) => {
        const r = {};
        for (const w of lijst) {
          for (const o of w.oefeningen) {
            for (const s of werksets(o)) {
              const huidig = r[o.oefeningId] ?? { e1rm: 0, kg: 0 };
              r[o.oefeningId] = {
                e1rm: Math.max(huidig.e1rm, e1rm(s.kg, s.reps)),
                kg: Math.max(huidig.kg, s.kg || 0),
              };
            }
          }
        }
        zetRecords(r);
      });
  }, [idsSleutel]);

  function wijzigOefening(index, wijziging) {
    zetActief((a) => ({
      ...a,
      oefeningen: a.oefeningen.map((o, i) => (i === index ? { ...o, ...wijziging(o) } : o)),
    }));
  }

  function wijzigSet(oi, si, velden) {
    wijzigOefening(oi, (o) => ({ sets: o.sets.map((s, i) => (i === si ? { ...s, ...velden } : s)) }));
  }

  function vinkAf(oi, si) {
    maakAudioKlaar();
    const o = actief.oefeningen[oi];
    const set = o.sets[si];
    if (set.klaar) {
      wijzigSet(oi, si, { klaar: false });
      return;
    }
    const vorige = o.vorige?.[si] ?? o.vorige?.[o.vorige.length - 1];
    const kg = set.kg !== '' ? set.kg : vorige ? kgTekst(vorige.kg) : '';
    const reps = set.reps !== '' ? set.reps : vorige ? String(vorige.reps) : '';
    if (!leesGetal(reps)) {
      toon('Vul eerst het aantal herhalingen in');
      return;
    }
    wijzigSet(oi, si, { kg, reps, klaar: true });
    const duur = o.rust ?? STANDAARD_RUST;
    zetRust({ eind: Date.now() + duur * 1000, duur });
  }

  function setToevoegen(oi) {
    wijzigOefening(oi, (o) => {
      const laatsteSet = o.sets[o.sets.length - 1];
      return { sets: [...o.sets, { kg: laatsteSet?.kg ?? '', reps: laatsteSet?.reps ?? '', klaar: false }] };
    });
  }

  function setVerwijderen(oi, si) {
    if (!window.confirm(`Set ${si + 1} verwijderen?`)) return;
    wijzigOefening(oi, (o) => ({ sets: o.sets.filter((_, i) => i !== si) }));
  }

  async function oefeningToevoegen(oefening) {
    zetKiezerOpen(false);
    const nieuw = await oefeningVoorWorkout(oefening, 3);
    zetActief((a) => ({ ...a, oefeningen: [...a.oefeningen, nieuw] }));
  }

  async function annuleren() {
    if (!window.confirm('Workout stoppen zonder op te slaan?')) return;
    beeindigd.current = true;
    clearTimeout(opslaanTimer.current);
    await db.instellingen.delete('actieveWorkout');
    sluit();
  }

  const duur = (nu - actief.start) / 1000;
  const rustOver = rust ? Math.min(rust.duur, Math.max(0, Math.ceil((rust.eind - nu) / 1000))) : 0;
  const gedaan = actief.oefeningen.reduce((som, o) => som + o.sets.filter((s) => s.klaar).length, 0);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="border-b border-rand bg-kaart px-4 pt-3 pb-3">
        <div className="mx-auto max-w-md space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button className="knop h-11 px-1 text-sm font-semibold text-zacht" onClick={sluit}>
              Minimaliseren
            </button>
            <button
              className="knop h-11 rounded-[10px] bg-primair px-4 text-sm font-semibold text-op-primair"
              onClick={() => zetAfrondOpen(true)}
            >
              Afronden
            </button>
          </div>
          <input
            aria-label="Naam van de workout"
            className="w-full bg-transparent text-[24px] font-bold tracking-tight outline-none"
            value={actief.naam}
            onChange={(e) => zetActief((a) => ({ ...a, naam: e.target.value }))}
          />
          <div className="flex items-center gap-3 text-sm text-zacht">
            <span>
              <b className="font-semibold text-tekst">{duurTekst(duur)}</b> · begonnen {klokTijd(actief.start)} · {gedaan} sets
            </span>
            <button className="knop ml-auto font-semibold text-primair" onClick={() => zetTijdOpen(true)}>
              Tijd aanpassen
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-3 px-4 pt-3 pb-40">
          {actief.oefeningen.map((o, oi) => {
            const record = records[o.oefeningId];
            return (
              <section key={`${o.oefeningId}-${oi}`} className="kaart space-y-2 !px-3">
                <div className="flex items-start gap-2 px-1">
                  <h2 className="flex-1 text-[16px] font-semibold text-primair">{o.naam}</h2>
                  <button
                    className="knop flex h-9 items-center gap-1 rounded-full bg-vlak px-3 text-xs font-semibold"
                    onClick={() => {
                      const huidig = o.rust ?? STANDAARD_RUST;
                      const volgende = RUSTOPTIES[(RUSTOPTIES.indexOf(huidig) + 1) % RUSTOPTIES.length];
                      wijzigOefening(oi, () => ({ rust: volgende }));
                    }}
                    aria-label="Rusttijd wijzigen"
                  >
                    <Icoon naam="timer" grootte={14} />
                    {duurTekst(o.rust ?? STANDAARD_RUST)}
                  </button>
                  <button
                    className="knop flex h-9 w-9 items-center justify-center text-zacht"
                    aria-label={`${o.naam} verwijderen`}
                    onClick={() => {
                      if (window.confirm(`${o.naam} uit deze workout halen?`)) {
                        zetActief((a) => ({ ...a, oefeningen: a.oefeningen.filter((_, i) => i !== oi) }));
                      }
                    }}
                  >
                    <Icoon naam="prullenbak" grootte={18} />
                  </button>
                </div>

                <div className="grid grid-cols-[30px_minmax(0,1fr)_64px_54px_44px] items-center gap-1.5 px-1 text-[11px] font-semibold text-zacht">
                  <span className="text-center">SET</span>
                  <span>VORIGE</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">REPS</span>
                  <span className="sr-only">Klaar</span>
                </div>

                {o.sets.map((s, si) => {
                  const vorige = o.vorige?.[si];
                  const kg = leesGetal(s.kg);
                  const reps = leesGetal(s.reps);
                  const isPr =
                    s.klaar && record && reps > 0 && (e1rm(kg, reps) > record.e1rm + 0.01 || kg > record.kg);
                  return (
                    <div
                      key={si}
                      className={`grid grid-cols-[30px_minmax(0,1fr)_64px_54px_44px] items-center gap-1.5 rounded-[8px] px-1 py-1 ${
                        s.klaar ? 'bg-goed/10' : ''
                      }`}
                    >
                      <button
                        className="h-10 text-center text-sm font-semibold"
                        onClick={() => setVerwijderen(oi, si)}
                        aria-label={`Set ${si + 1} verwijderen`}
                      >
                        {si + 1}
                      </button>
                      <button
                        className="flex h-10 items-center gap-1 truncate text-left text-[13px] text-zacht"
                        onClick={() => vorige && wijzigSet(oi, si, { kg: kgTekst(vorige.kg), reps: String(vorige.reps) })}
                        aria-label="Vorige waarden overnemen"
                      >
                        {vorige ? `${kgTekst(vorige.kg)} × ${vorige.reps}` : '–'}
                        {isPr && (
                          <span className="rounded bg-goed px-1 text-[10px] font-bold text-[#0a0f1f]">PR</span>
                        )}
                      </button>
                      <input
                        aria-label={`Set ${si + 1} kilo`}
                        inputMode="decimal"
                        className="h-10 w-full rounded-[8px] border border-rand bg-vlak text-center font-semibold outline-none focus:border-primair"
                        value={s.kg}
                        placeholder={vorige ? kgTekst(vorige.kg) : ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => wijzigSet(oi, si, { kg: e.target.value })}
                      />
                      <input
                        aria-label={`Set ${si + 1} herhalingen`}
                        inputMode="numeric"
                        className="h-10 w-full rounded-[8px] border border-rand bg-vlak text-center font-semibold outline-none focus:border-primair"
                        value={s.reps}
                        placeholder={vorige ? String(vorige.reps) : ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => wijzigSet(oi, si, { reps: e.target.value })}
                      />
                      <button
                        aria-label={`Set ${si + 1} afvinken`}
                        aria-pressed={s.klaar}
                        className={`flex h-10 w-11 items-center justify-center rounded-[8px] ${
                          s.klaar ? 'bg-goed text-[#0a0f1f]' : 'border-[1.5px] border-rand text-zacht'
                        }`}
                        onClick={() => vinkAf(oi, si)}
                      >
                        <Icoon naam="vink" grootte={18} dikte={2.25} />
                      </button>
                    </div>
                  );
                })}

                <button
                  className="knop flex h-11 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-rand text-sm font-semibold"
                  onClick={() => setToevoegen(oi)}
                >
                  <Icoon naam="plus" grootte={16} />
                  Set toevoegen
                </button>
              </section>
            );
          })}

          {actief.oefeningen.length === 0 && (
            <p className="py-6 text-center text-sm text-zacht">
              Voeg je eerste oefening toe. De timer loopt al.
            </p>
          )}

          <button
            className="knop flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primair font-semibold text-op-primair"
            onClick={() => {
              maakAudioKlaar();
              zetKiezerOpen(true);
            }}
          >
            <Icoon naam="plus" />
            Oefening toevoegen
          </button>
          <button className="knop h-11 w-full rounded-[12px] text-sm font-semibold text-over" onClick={annuleren}>
            Workout weggooien
          </button>
        </div>
      </main>

      {rust && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-rand bg-kaart px-4 pt-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <div className="mx-auto max-w-md space-y-2">
            <div className="flex items-center gap-3">
              <Icoon naam="timer" className="text-zacht" />
              <span className="text-[26px] font-bold">{duurTekst(rustOver)}</span>
              <span className="text-sm text-zacht">rust · doel {duurTekst(rust.duur)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-vlak">
              <div
                className="h-full rounded-full bg-primair"
                style={{ width: `${(rustOver / rust.duur) * 100}%`, transition: 'width 1s linear' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                className="knop h-11 rounded-[10px] bg-vlak text-sm font-semibold"
                onClick={() => zetRust({ ...rust, eind: rust.eind - 15000 })}
              >
                −15 s
              </button>
              <button
                className="knop h-11 rounded-[10px] bg-vlak text-sm font-semibold"
                onClick={() => zetRust({ ...rust, eind: rust.eind + 15000, duur: rust.duur + 15 })}
              >
                +15 s
              </button>
              <button className="knop h-11 rounded-[10px] bg-vlak text-sm font-semibold" onClick={() => zetRust(null)}>
                Overslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {kiezerOpen && <OefeningKiezer kies={oefeningToevoegen} sluit={() => zetKiezerOpen(false)} />}
      {tijdOpen && (
        <TijdVenster
          start={actief.start}
          sluit={() => zetTijdOpen(false)}
          bewaar={(start) => {
            zetActief((a) => ({ ...a, start }));
            zetTijdOpen(false);
          }}
        />
      )}
      {afrondOpen && (
        <AfrondVenster
          actief={actief}
          sluit={() => zetAfrondOpen(false)}
          voorOpslaan={() => {
            beeindigd.current = true;
            clearTimeout(opslaanTimer.current);
          }}
          klaar={sluit}
        />
      )}
      {melding}
    </div>
  );
}

// Starttijd aanpassen, voor als je vergat de workout te starten.
function TijdVenster({ start, bewaar, sluit }) {
  const [waarde, zetWaarde] = useState(alsInvoerTijd(start));
  return (
    <Venster titel="Starttijd aanpassen" sluit={sluit}>
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-zacht">Begonnen op</span>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-[10px] border border-rand bg-vlak px-3 py-2.5 outline-none"
            value={waarde}
            onChange={(e) => zetWaarde(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[15, 30, 60].map((min) => (
            <button
              key={min}
              className="knop h-11 rounded-[10px] bg-vlak text-sm font-semibold"
              onClick={() => zetWaarde(alsInvoerTijd(new Date(waarde).getTime() - min * 60000))}
            >
              −{min} min
            </button>
          ))}
        </div>
        <button
          className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
          onClick={() => {
            const ms = new Date(waarde).getTime();
            if (Number.isFinite(ms)) bewaar(Math.min(ms, Date.now()));
          }}
        >
          Opslaan
        </button>
      </div>
    </Venster>
  );
}

// Workout opslaan, eventueel ook als routine.
function AfrondVenster({ actief, sluit, voorOpslaan, klaar }) {
  const [alsRoutine, zetAlsRoutine] = useState(false);
  const workout = rondAf(actief);
  const minuten = Math.round((workout.eind - workout.start) / 60000);
  const sets = workout.oefeningen.reduce((som, o) => som + o.sets.length, 0);

  async function opslaan() {
    if (workout.oefeningen.length === 0) {
      if (!window.confirm('Je hebt nog geen sets afgevinkt. Workout weggooien?')) return;
      voorOpslaan();
    } else {
      voorOpslaan();
      await db.workouts.add(workout);
      if (alsRoutine) {
        await db.routines.add({
          naam: actief.naam || 'Routine',
          oefeningen: actief.oefeningen.map((o) => ({
            oefeningId: o.oefeningId,
            sets: Math.max(o.sets.filter((s) => s.klaar).length, 1),
            rust: o.rust ?? STANDAARD_RUST,
          })),
        });
      }
    }
    await db.instellingen.delete('actieveWorkout');
    klaar();
  }

  return (
    <Venster titel="Workout afronden" sluit={sluit}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Duur', `${minuten} min`],
            ['Sets', sets],
            ['Volume', `${kgTekst(Math.round(volumeVan(workout)))} kg`],
          ].map(([label, waarde]) => (
            <div key={label} className="kaart !p-3">
              <div className="text-lg font-bold">{waarde}</div>
              <div className="text-xs text-zacht">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-zacht">Alleen afgevinkte sets worden bewaard.</p>
        {!actief.routineId && workout.oefeningen.length > 0 && (
          <label className="kaart flex items-center gap-3">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--pace-primair)]"
              checked={alsRoutine}
              onChange={(e) => zetAlsRoutine(e.target.checked)}
            />
            <span className="text-sm font-medium">Ook bewaren als routine ‘{actief.naam}’</span>
          </label>
        )}
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
