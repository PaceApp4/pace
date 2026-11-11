// Alles rond voedingswaarden rekenen en tonen.

export const MAALTIJDEN = [
  { sleutel: 'ontbijt', label: 'Ontbijt', icoon: '🥣' },
  { sleutel: 'lunch', label: 'Lunch', icoon: '🥪' },
  { sleutel: 'diner', label: 'Diner', icoon: '🍝' },
  { sleutel: 'snacks', label: 'Snacks', icoon: '🍎' },
];

// De voedingswaarden die we bijhouden (per 100 g of 100 ml).
export const NUTRIENTEN = [
  { sleutel: 'kcal', label: 'Calorieën', kort: 'kcal', eenheid: 'kcal' },
  { sleutel: 'eiwit', label: 'Eiwit', kort: 'Eiwit', eenheid: 'g' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten', kort: 'Koolh.', eenheid: 'g' },
  { sleutel: 'vet', label: 'Vet', kort: 'Vet', eenheid: 'g' },
  { sleutel: 'vezels', label: 'Vezels', kort: 'Vezels', eenheid: 'g' },
  { sleutel: 'suiker', label: 'Suiker', kort: 'Suiker', eenheid: 'g' },
];

export function leegTotaal() {
  const totaal = {};
  for (const n of NUTRIENTEN) totaal[n.sleutel] = 0;
  return totaal;
}

// Rekent de waarden per 100 g om naar de gegeten hoeveelheid.
export function waardenVoor(per100, gram) {
  const uit = {};
  for (const n of NUTRIENTEN) {
    uit[n.sleutel] = ((Number(per100?.[n.sleutel]) || 0) * gram) / 100;
  }
  return uit;
}

// Telt een lijst logregels bij elkaar op.
export function totaalVan(regels) {
  const totaal = leegTotaal();
  for (const regel of regels) {
    const w = waardenVoor(regel.per100, regel.gram);
    for (const n of NUTRIENTEN) totaal[n.sleutel] += w[n.sleutel];
  }
  return totaal;
}

// '12,5' of '12.5' -> 12.5 ; lege of ongeldige invoer -> 0
export function leesGetal(tekst) {
  const getal = parseFloat(String(tekst ?? '').replace(',', '.'));
  return Number.isFinite(getal) && getal >= 0 ? getal : 0;
}

// 1234.6 -> '1.235'
export function rond(getal) {
  return Math.round(getal || 0).toLocaleString('nl-NL');
}

// 12.34 -> '12,3' (voor kleine hoeveelheden)
export function rond1(getal) {
  return (Math.round((getal || 0) * 10) / 10).toLocaleString('nl-NL');
}
