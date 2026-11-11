import { db } from '../db.js';
import { lokaleDatum } from './training.js';

// Importeert de CSV-export van Hevy (Profiel > Instellingen > Export & import > Export workouts).
// De kolommen worden op naam gelezen, dus de volgorde maakt niet uit.

// Eenvoudige CSV-lezer die ook komma's en regeleinden binnen "aanhalingstekens" aankan.
export function leesCsv(tekst) {
  // Komma, puntkomma of tab: kijk wat de kopregel gebruikt.
  const einde = tekst.indexOf('\n');
  const kop = einde > 0 ? tekst.slice(0, einde) : tekst;
  const tellen = (t) => kop.split(t).length;
  const scheiding = ['\t', ';', ','].sort((a, b) => tellen(b) - tellen(a))[0];
  const rijen = [];
  let rij = [];
  let veld = '';
  let tussenQuotes = false;
  const t = tekst.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (tussenQuotes) {
      if (c === '"' && t[i + 1] === '"') {
        veld += '"';
        i++;
      } else if (c === '"') tussenQuotes = false;
      else veld += c;
    } else if (c === '"') tussenQuotes = true;
    else if (c === scheiding) {
      rij.push(veld);
      veld = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      rij.push(veld);
      rijen.push(rij);
      rij = [];
      veld = '';
    } else veld += c;
  }
  if (veld || rij.length) {
    rij.push(veld);
    rijen.push(rij);
  }
  return rijen.filter((r) => r.some((v) => v.trim() !== ''));
}

const MAANDEN = {
  jan: 0, feb: 1, mar: 2, mrt: 2, apr: 3, may: 4, mei: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11,
};

// '28 Nov 2025, 17:25' of '2025-11-28 17:25:00' -> milliseconden
export function leesHevyTijd(tekst) {
  const t = String(tekst ?? '').trim();
  let m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z.]*\s+(\d{4}),?\s+(\d{1,2}):(\d{2})/);
  if (m && MAANDEN[m[2].toLowerCase()] !== undefined) {
    return new Date(+m[3], MAANDEN[m[2].toLowerCase()], +m[1], +m[4], +m[5]).getTime();
  }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
  const p = Date.parse(t);
  return Number.isFinite(p) ? p : null;
}

function getal(v) {
  const g = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(g) ? g : 0;
}

export async function importeerHevy(bestand) {
  const rijen = leesCsv(await bestand.text());
  if (rijen.length < 2) throw new Error('Het bestand is leeg.');
  const kop = rijen[0].map((k) => k.trim().toLowerCase());
  const kol = (naam) => kop.indexOf(naam);
  const k = {
    titel: kol('title'),
    start: kol('start_time'),
    eind: kol('end_time'),
    oefening: kol('exercise_title'),
    type: kol('set_type'),
    kg: kol('weight_kg'),
    lbs: kol('weight_lbs'),
    reps: kol('reps'),
  };
  if (k.start < 0 || k.oefening < 0 || k.reps < 0) {
    throw new Error('Dit lijkt geen Hevy-export (kolommen start_time, exercise_title en reps ontbreken).');
  }

  // Oefeningen opzoeken op Hevy-naam of eigen naam; onbekende worden aangemaakt.
  const bestaand = await db.oefeningen.toArray();
  const opNaam = new Map();
  for (const o of bestaand) {
    opNaam.set(o.naam.toLowerCase(), o.id);
    if (o.hevy) opNaam.set(o.hevy.toLowerCase(), o.id);
  }
  async function oefeningId(naam) {
    const sleutel = naam.toLowerCase();
    if (opNaam.has(sleutel)) return opNaam.get(sleutel);
    const id = await db.oefeningen.add({ naam, spiergroep: 'Overig', hevy: naam });
    opNaam.set(sleutel, id);
    return id;
  }

  // Rijen groeperen per workout (zelfde titel + starttijd).
  const workouts = new Map();
  for (const r of rijen.slice(1)) {
    const start = leesHevyTijd(r[k.start]);
    if (!start) continue;
    const titel = (k.titel >= 0 ? r[k.titel] : '') || 'Workout';
    const sleutel = `${start}|${titel}`;
    if (!workouts.has(sleutel)) {
      const eind = k.eind >= 0 ? leesHevyTijd(r[k.eind]) : null;
      workouts.set(sleutel, { naam: titel, start, eind: eind ?? start, oefeningen: new Map() });
    }
    const w = workouts.get(sleutel);
    const naam = r[k.oefening]?.trim();
    if (!naam) continue;
    if (!w.oefeningen.has(naam)) w.oefeningen.set(naam, []);
    const kg = k.kg >= 0 && r[k.kg] !== '' ? getal(r[k.kg]) : k.lbs >= 0 ? getal(r[k.lbs]) * 0.45359237 : 0;
    const type = k.type >= 0 && /warm/i.test(r[k.type]) ? 'warmup' : 'normaal';
    w.oefeningen.get(naam).push({ kg: Math.round(kg * 100) / 100, reps: Math.round(getal(r[k.reps])), type });
  }

  // Dubbele imports overslaan: een Hevy-workout met dezelfde starttijd bestaat al.
  const alGeimporteerd = new Set(
    (await db.workouts.toArray()).filter((w) => w.bron === 'hevy').map((w) => w.start)
  );

  let nieuw = 0;
  for (const w of workouts.values()) {
    if (alGeimporteerd.has(w.start)) continue;
    const oefeningen = [];
    for (const [naam, sets] of w.oefeningen) {
      oefeningen.push({ oefeningId: await oefeningId(naam), naam, sets });
    }
    await db.workouts.add({
      naam: w.naam,
      datum: lokaleDatum(w.start),
      start: w.start,
      eind: w.eind,
      routineId: null,
      bron: 'hevy',
      oefeningen,
      oefeningIds: [...new Set(oefeningen.map((o) => o.oefeningId))],
    });
    nieuw++;
  }
  return { nieuw, overgeslagen: workouts.size - nieuw };
}
