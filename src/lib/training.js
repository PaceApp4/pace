import { db } from '../db.js';
import { leesGetal } from './voeding.js';

// Geschat 1RM (Epley). Bij 1 herhaling is het gewoon het gewicht.
export function e1rm(kg, reps) {
  if (!kg || !reps) return 0;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

// '82,5' -> '82,5' ; 82.5 -> '82,5'
export function kgTekst(kg) {
  return (Math.round((kg || 0) * 100) / 100).toLocaleString('nl-NL');
}

// Alleen echte, afgevinkte werksets (geen opwarmsets).
export function werksets(oefening) {
  return (oefening?.sets ?? []).filter((s) => s.klaar !== false && s.type !== 'warmup' && s.reps > 0);
}

export function volumeVan(workout) {
  let totaal = 0;
  for (const o of workout.oefeningen ?? []) {
    for (const s of werksets(o)) totaal += (s.kg || 0) * s.reps;
  }
  return totaal;
}

export function aantalSets(workout) {
  return (workout.oefeningen ?? []).reduce((som, o) => som + werksets(o).length, 0);
}

// Laatste keer dat je deze oefening deed: de sets van die workout.
export async function vorigeSets(oefeningId) {
  const lijst = await db.workouts.where('oefeningIds').equals(oefeningId).sortBy('start');
  for (let i = lijst.length - 1; i >= 0; i--) {
    const o = lijst[i].oefeningen.find((x) => x.oefeningId === oefeningId);
    if (o && o.sets?.length) return o.sets.filter((s) => s.type !== 'warmup');
  }
  return [];
}

// Per sessie de beste waarden van één oefening (oud naar nieuw).
export function sessiesVan(workouts, oefeningId) {
  const uit = [];
  for (const w of [...workouts].sort((a, b) => a.start - b.start)) {
    const o = w.oefeningen.find((x) => x.oefeningId === oefeningId);
    const sets = werksets(o);
    if (!sets.length) continue;
    let zwaarste = 0;
    let beste1rm = 0;
    let volume = 0;
    let meesteReps = 0;
    for (const s of sets) {
      zwaarste = Math.max(zwaarste, s.kg || 0);
      beste1rm = Math.max(beste1rm, e1rm(s.kg, s.reps));
      volume += (s.kg || 0) * s.reps;
      meesteReps = Math.max(meesteReps, s.reps);
    }
    uit.push({ datum: w.datum, start: w.start, zwaarste, beste1rm, volume, meesteReps, sets });
  }
  return uit;
}

// Persoonlijke records van één oefening.
export function recordsVan(sessies) {
  const pr = { zwaarste: null, beste1rm: null, volume: null, meesteReps: null };
  for (const s of sessies) {
    for (const set of s.sets) {
      if (!pr.zwaarste || set.kg > pr.zwaarste.kg || (set.kg === pr.zwaarste.kg && set.reps > pr.zwaarste.reps)) {
        pr.zwaarste = { kg: set.kg, reps: set.reps, datum: s.datum };
      }
      const est = e1rm(set.kg, set.reps);
      if (!pr.beste1rm || est > pr.beste1rm.waarde) {
        pr.beste1rm = { waarde: est, kg: set.kg, reps: set.reps, datum: s.datum };
      }
      if (!pr.meesteReps || set.reps > pr.meesteReps.reps) {
        pr.meesteReps = { kg: set.kg, reps: set.reps, datum: s.datum };
      }
    }
    if (!pr.volume || s.volume > pr.volume.waarde) pr.volume = { waarde: s.volume, datum: s.datum };
  }
  return pr;
}

// Nieuwe lege set, met de waarden van de vorige keer al ingevuld als suggestie.
export function nieuweSet(vorige) {
  return { kg: vorige?.kg != null ? kgTekst(vorige.kg) : '', reps: vorige?.reps ? String(vorige.reps) : '', klaar: false };
}

// Zet een (actieve) workout om naar wat we in de database bewaren.
export function rondAf(actief, eind = Date.now()) {
  const oefeningen = actief.oefeningen
    .map((o) => ({
      oefeningId: o.oefeningId,
      naam: o.naam,
      rust: o.rust,
      sets: o.sets
        .filter((s) => s.klaar)
        .map((s) => ({ kg: leesGetal(s.kg), reps: Math.round(leesGetal(s.reps)), type: s.type ?? 'normaal' }))
        .filter((s) => s.reps > 0),
    }))
    .filter((o) => o.sets.length > 0);
  const start = actief.start;
  return {
    naam: actief.naam || 'Workout',
    datum: lokaleDatum(start),
    start,
    eind: Math.max(eind, start),
    routineId: actief.routineId ?? null,
    bron: 'pace',
    oefeningen,
    oefeningIds: [...new Set(oefeningen.map((o) => o.oefeningId))],
  };
}

export function lokaleDatum(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const STANDAARD_RUST = 90; // seconden

// Een oefening klaarzetten voor de actieve workout, met de vorige keer als suggestie.
export async function oefeningVoorWorkout(oefening, aantalSets = 3, rust = STANDAARD_RUST) {
  const vorige = await vorigeSets(oefening.id);
  const n = Math.max(aantalSets, 1);
  return {
    oefeningId: oefening.id,
    naam: oefening.naam,
    rust,
    vorige: vorige.map((s) => ({ kg: s.kg, reps: s.reps })),
    sets: Array.from({ length: n }, () => ({ kg: '', reps: '', klaar: false })),
  };
}

// Start een nieuwe workout: leeg, of vanuit een routine.
export async function startWorkout(routine = null) {
  const oefeningen = [];
  if (routine) {
    for (const r of routine.oefeningen) {
      const o = await db.oefeningen.get(r.oefeningId);
      if (o) oefeningen.push(await oefeningVoorWorkout(o, r.sets, r.rust));
    }
  }
  const actief = {
    naam: routine?.naam ?? 'Workout',
    routineId: routine?.id ?? null,
    start: Date.now(),
    oefeningen,
  };
  await db.instellingen.put({ sleutel: 'actieveWorkout', waarde: actief });
  return actief;
}
