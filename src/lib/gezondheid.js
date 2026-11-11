import { db } from '../db.js';
import { vandaag } from './datum.js';

// Stappen en slaap komen uit Apple Gezondheid (waar de Zepp-app ze naartoe stuurt).
// Een Opdracht op je iPhone zet ze als tekst op het klembord, bijvoorbeeld:
//
//   PACE
//   datum=2026-11-11
//   stappen=6412
//   slaap=452      (minuten geslapen)
//   diep=80        (minuten diepe slaap, mag weg)
//   rem=95         (minuten REM-slaap, mag weg)
//   wakker=20      (minuten wakker, mag weg)
//   score=82       (slaapscore, als je die zelf invult)
//
// Meerdere dagen mag: begin dan elke dag met een nieuwe 'datum='.

const SLEUTELS = {
  datum: 'datum',
  stappen: 'stappen',
  steps: 'stappen',
  slaap: 'slaapMin',
  slaapmin: 'slaapMin',
  sleep: 'slaapMin',
  diep: 'diepMin',
  deep: 'diepMin',
  rem: 'remMin',
  wakker: 'wakkerMin',
  awake: 'wakkerMin',
  kern: 'kernMin',
  core: 'kernMin',
  score: 'slaapscore',
  slaapscore: 'slaapscore',
};

// '6.412' -> 6412 ; '7,5' -> 7.5 ; '1.234,5' -> 1234.5
export function leesNummer(tekst) {
  let t = String(tekst ?? '').replace(/\s/g, '').replace(/[^\d.,-]/g, '');
  if (!t) return null;
  if (t.includes('.') && t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (t.includes(',')) t = t.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const g = parseFloat(t);
  return Number.isFinite(g) ? g : null;
}

const MAANDEN = { jan: 1, feb: 2, mrt: 3, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dec: 12 };

function leesDatum(tekst) {
  const t = String(tekst).trim().toLowerCase();
  let m = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/); // 11-11-2026
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/(\d{1,2})\s+([a-z]{3})[a-z.]*\s+(\d{4})/); // 11 nov. 2026
  if (m && MAANDEN[m[2]]) return `${m[3]}-${String(MAANDEN[m[2]]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

// Slaapfase uit Apple Gezondheid (Nederlands of Engels) -> ons veld.
function faseVeld(naam) {
  const n = String(naam).toLowerCase();
  if (/diep|deep/.test(n)) return 'diep';
  if (/rem/.test(n)) return 'rem';
  if (/kern|core|licht|light/.test(n)) return 'kern';
  if (/wakker|awake|wake/.test(n)) return 'wakker';
  if (/bed/.test(n)) return 'inBed';
  if (/slaap|slapend|asleep|sleep|unspecified/.test(n)) return 'slaap';
  return null;
}

// Telt losse slaapstukken ('fase=Kern;min=35') op tot totalen per dag.
function rondFasesAf(dag) {
  const f = dag._fases;
  delete dag._fases;
  delete dag._fase;
  if (!f) return;
  const geslapen = (f.diep ?? 0) + (f.rem ?? 0) + (f.kern ?? 0) + (f.slaap ?? 0);
  if (geslapen > 0) dag.slaapMin = Math.round(geslapen);
  else if (f.inBed) dag.slaapMin = Math.round(Math.max(0, f.inBed - (f.wakker ?? 0)));
  if (f.diep != null) dag.diepMin = Math.round(f.diep);
  if (f.rem != null) dag.remMin = Math.round(f.rem);
  if (f.kern != null) dag.kernMin = Math.round(f.kern);
  if (f.wakker != null) dag.wakkerMin = Math.round(f.wakker);
}

// Zet de tekst van het klembord om in een lijst dagen.
export function leesGezondheidTekst(tekst) {
  const dagen = [];
  let huidig = null;
  const nieuweDag = (datum) => {
    huidig = { datum };
    dagen.push(huidig);
  };
  const delen = String(tekst).split(/[\n;&|]+/);
  for (const deel of delen) {
    const [ruwSleutel, ...rest] = deel.split(/[=:]/);
    if (!rest.length) continue;
    const sleutel = ruwSleutel.trim().toLowerCase();
    const waarde = rest.join(':').trim();

    if (sleutel === 'datum' || sleutel === 'date') {
      const datum = leesDatum(waarde);
      if (datum) nieuweDag(datum);
      continue;
    }
    if (!huidig) nieuweDag(vandaag());

    // Losse slaapstukken uit de Opdracht
    if (sleutel === 'fase') {
      huidig._fase = faseVeld(waarde);
      continue;
    }
    if (sleutel === 'min' || sleutel === 'minuten') {
      const n = leesNummer(waarde);
      if (huidig._fase && n !== null && n > 0) {
        huidig._fases = huidig._fases ?? {};
        huidig._fases[huidig._fase] = (huidig._fases[huidig._fase] ?? 0) + n;
      }
      huidig._fase = null;
      continue;
    }

    const veld = SLEUTELS[sleutel];
    if (!veld) continue;
    const n = leesNummer(waarde);
    if (n !== null) huidig[veld] = veld === 'stappen' ? Math.round(n) : n;
  }
  dagen.forEach(rondFasesAf);
  return dagen.filter((d) => Object.keys(d).length > 1);
}

// Slaat de dagen op. Bestaande waarden van die dag blijven staan als ze niet in de import zitten.
export async function bewaarGezondheid(dagen, bron = 'import') {
  for (const dag of dagen) {
    const oud = (await db.gezondheid.get(dag.datum)) ?? {};
    await db.gezondheid.put({ ...oud, ...dag, bron, bijgewerkt: Date.now() });
  }
}

// Leest het klembord en slaat op. Geeft het aantal dagen terug.
export async function importeerVanKlembord() {
  if (!navigator.clipboard?.readText) {
    throw new Error('Plakken wordt hier niet ondersteund.');
  }
  const tekst = await navigator.clipboard.readText();
  const dagen = leesGezondheidTekst(tekst);
  if (dagen.length === 0) {
    throw new Error('Geen stappen of slaap gevonden op het klembord. Draai eerst de Opdracht.');
  }
  await bewaarGezondheid(dagen, 'apple-gezondheid');
  return dagen.length;
}

// Slaapscore 0–100. Een zelf ingevulde (Zepp-)score gaat altijd voor.
export function slaapScore(dag, doelUren = 8) {
  if (!dag) return null;
  if (dag.slaapscore) return { score: Math.round(dag.slaapscore), bron: 'ingevuld' };
  const slaap = dag.slaapMin;
  if (!slaap) return null;

  const duur = Math.min(slaap / (doelUren * 60), 1);
  let score;
  if (dag.diepMin != null && dag.remMin != null) {
    const diep = Math.min(dag.diepMin / slaap / 0.18, 1);
    const rem = Math.min(dag.remMin / slaap / 0.22, 1);
    score = 100 * (0.6 * duur + 0.2 * diep + 0.2 * rem);
  } else {
    score = 100 * duur;
  }
  score -= Math.min(dag.wakkerMin ?? 0, 60) / 6; // max 10 punten aftrek voor wakker liggen
  return { score: Math.max(0, Math.round(score)), bron: 'berekend' };
}

export function slaapLabel(score) {
  if (score >= 85) return 'Goed';
  if (score >= 70) return 'Redelijk';
  return 'Kort of onrustig';
}
