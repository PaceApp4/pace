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

function leesDatum(tekst) {
  const t = String(tekst).trim();
  let m = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/); // 11-11-2026
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

// Zet de tekst van het klembord om in een lijst dagen.
export function leesGezondheidTekst(tekst) {
  const dagen = [];
  let huidig = null;
  const delen = String(tekst).split(/[\n;&|]+/);
  for (const deel of delen) {
    const [ruwSleutel, ...rest] = deel.split(/[=:]/);
    if (!rest.length) continue;
    const veld = SLEUTELS[ruwSleutel.trim().toLowerCase()];
    if (!veld) continue;
    const waarde = rest.join(':').trim();
    if (veld === 'datum') {
      const datum = leesDatum(waarde);
      if (!datum) continue;
      huidig = { datum };
      dagen.push(huidig);
      continue;
    }
    if (!huidig) {
      huidig = { datum: vandaag() };
      dagen.push(huidig);
    }
    const n = leesNummer(waarde);
    if (n !== null) huidig[veld] = veld === 'stappen' ? Math.round(n) : n;
  }
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
