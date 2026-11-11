// Voorgesteld voedingsplan op basis van je profiel.
// Formule: Mifflin-St Jeor (rustverbranding) x activiteitsfactor.
// Dit is een richtlijn om mee te beginnen, geen medisch advies.

export const ACTIVITEITEN = [
  { sleutel: 'weinig', label: 'Weinig', uitleg: 'Zittend werk, nauwelijks sport', factor: 1.2 },
  { sleutel: 'licht', label: 'Licht', uitleg: '1–3 keer per week sporten', factor: 1.375 },
  { sleutel: 'gemiddeld', label: 'Gemiddeld', uitleg: '3–5 keer per week sporten', factor: 1.55 },
  { sleutel: 'hoog', label: 'Hoog', uitleg: '6–7 keer per week of fysiek werk', factor: 1.725 },
];

export const DOELEN = [
  {
    sleutel: 'afvallen',
    label: 'Afvallen',
    uitleg: '20% onder je verbruik, veel eiwit om spieren te behouden.',
  },
  { sleutel: 'onderhouden', label: 'Op gewicht', uitleg: 'Even veel eten als je verbruikt.' },
  {
    sleutel: 'spieropbouw',
    label: 'Spieropbouw',
    uitleg: 'Rustig aankomen: ongeveer 300 kcal boven je verbruik.',
  },
];

const EIWIT_PER_KG = { afvallen: 2.2, onderhouden: 1.8, spieropbouw: 2.0 };

function getal(waarde) {
  const g = parseFloat(String(waarde ?? '').replace(',', '.'));
  return Number.isFinite(g) && g > 0 ? g : 0;
}

export function bmi(gewicht, lengteCm) {
  const w = getal(gewicht);
  const l = getal(lengteCm) / 100;
  return w && l ? w / (l * l) : 0;
}

// Geeft null terug als lengte, gewicht of leeftijd nog ontbreekt.
export function berekenPlan(profiel) {
  const gewicht = getal(profiel.gewicht);
  const lengte = getal(profiel.lengte);
  const leeftijd = getal(profiel.leeftijd);
  if (!gewicht || !lengte || !leeftijd) return null;

  const rust =
    10 * gewicht + 6.25 * lengte - 5 * leeftijd + (profiel.geslacht === 'vrouw' ? -161 : 5);
  const factor = ACTIVITEITEN.find((a) => a.sleutel === profiel.activiteit)?.factor ?? 1.55;
  const verbruik = rust * factor;

  let kcal = verbruik;
  if (profiel.doel === 'afvallen') kcal = verbruik * 0.8;
  if (profiel.doel === 'spieropbouw') kcal = verbruik + 300;
  kcal = Math.round(kcal / 10) * 10;

  const eiwit = Math.round(gewicht * (EIWIT_PER_KG[profiel.doel] ?? 1.8));
  const vet = Math.round(Math.max((kcal * 0.25) / 9, gewicht * 0.8));
  const koolhydraten = Math.max(0, Math.round((kcal - eiwit * 4 - vet * 9) / 4));

  return {
    rust: Math.round(rust),
    verbruik: Math.round(verbruik),
    kcal,
    eiwit,
    koolhydraten,
    vet,
    vezels: Math.round((kcal / 1000) * 14),
    water: Math.round((gewicht * 35) / 250) * 250,
  };
}
