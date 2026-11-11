import { db } from '../db.js';

// Open Food Facts: gratis, open database met miljoenen producten (ook veel Nederlandse).
// Spelregels: max. 15 productopvragingen en 10 zoekopdrachten per minuut.
// Daarom zoeken we pas als je op 'Zoeken' tikt, niet bij elke letter.

const VELDEN = [
  'code',
  'product_name',
  'product_name_nl',
  'generic_name',
  'brands',
  'quantity',
  'product_quantity_unit',
  'serving_quantity',
  'nutriments',
  'nutriscore_grade',
  'image_front_small_url',
  'countries_tags',
].join(',');

let laatsteZoek = 0;

function getal(w) {
  const g = Number(w);
  return Number.isFinite(g) && g >= 0 ? Math.round(g * 10) / 10 : 0;
}

// Zet een Open Food Facts-product om naar een Pace-product.
export function naarPaceProduct(p) {
  const n = p.nutriments ?? {};
  const kcal = n['energy-kcal_100g'] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0);
  const isVloeibaar =
    p.product_quantity_unit === 'ml' || /\d\s*(ml|cl|l)\b/i.test(String(p.quantity ?? ''));
  return {
    naam: (p.product_name_nl || p.product_name || p.generic_name || 'Onbekend product').trim(),
    merk: String(p.brands ?? '').split(',')[0].trim(),
    barcode: p.code ?? '',
    eenheid: isVloeibaar ? 'ml' : 'g',
    portie: getal(p.serving_quantity),
    afbeelding: p.image_front_small_url ?? '',
    nutriscore: p.nutriscore_grade && p.nutriscore_grade.length === 1 ? p.nutriscore_grade : '',
    per100: {
      kcal: Math.round(getal(kcal)),
      eiwit: getal(n.proteins_100g),
      koolhydraten: getal(n.carbohydrates_100g),
      vet: getal(n.fat_100g),
      vezels: getal(n.fiber_100g),
      suiker: getal(n.sugars_100g),
    },
    bron: 'openfoodfacts',
  };
}

function heeftWaarden(p) {
  const n = p.nutriments ?? {};
  return n['energy-kcal_100g'] != null || n.energy_100g != null;
}

async function haal(url) {
  const antwoord = await fetch(url, { headers: { Accept: 'application/json' } });
  if (antwoord.status === 429) throw new Error('Even te veel zoekopdrachten. Probeer het over een minuutje opnieuw.');
  if (!antwoord.ok) throw new Error(`Open Food Facts gaf een fout (${antwoord.status}).`);
  return antwoord.json();
}

// Product opzoeken op barcode. Geeft null als het product onbekend is.
export async function zoekBarcode(code) {
  const schoon = String(code).replace(/\D/g, '');
  if (!schoon) return null;
  if (!navigator.onLine) throw new Error('Geen internet. Probeer het later of voer het product zelf in.');
  const data = await haal(`https://world.openfoodfacts.org/api/v2/product/${schoon}.json?fields=${VELDEN}`);
  if (data.status !== 1 || !data.product) return null;
  return naarPaceProduct({ ...data.product, code: data.product.code ?? schoon });
}

// Op naam zoeken. Nederlandse producten komen bovenaan.
export async function zoekOnline(term) {
  const q = term.trim();
  if (q.length < 2) return [];
  if (!navigator.onLine) throw new Error('Geen internet. Zoek in je eigen producten of voer het product zelf in.');
  const wacht = 6000 - (Date.now() - laatsteZoek);
  if (wacht > 0) throw new Error(`Even wachten: over ${Math.ceil(wacht / 1000)} s kun je weer zoeken.`);
  laatsteZoek = Date.now();

  let lijst = [];
  try {
    const data = await haal(
      `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&langs=nl,en&page_size=30&fields=${VELDEN}`
    );
    lijst = data.hits ?? data.products ?? [];
  } catch {
    // Reserve: de oudere zoekfunctie.
    const data = await haal(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30&fields=${VELDEN}`
    );
    lijst = data.products ?? [];
  }
  const nl = (p) => (Array.isArray(p.countries_tags) && p.countries_tags.includes('en:netherlands') ? 0 : 1);
  return lijst
    .filter(heeftWaarden)
    .filter((p) => p.product_name_nl || p.product_name)
    .sort((a, b) => nl(a) - nl(b))
    .map(naarPaceProduct);
}

// Bewaart een online product in je eigen lijst (of geeft het bestaande terug).
export async function bewaarInMijnProducten(product) {
  if (product.barcode) {
    const bestaand = await db.producten.filter((p) => p.barcode === product.barcode).first();
    if (bestaand) return bestaand;
  }
  const nieuw = { ...product, favoriet: false, laatstGebruikt: 0 };
  const id = await db.producten.add(nieuw);
  return { ...nieuw, id };
}

// Eerst in je eigen producten kijken, dan online.
export async function productBijBarcode(code) {
  const schoon = String(code).replace(/\D/g, '');
  const eigen = await db.producten.filter((p) => p.barcode === schoon).first();
  if (eigen) return { product: eigen, bron: 'eigen' };
  const online = await zoekBarcode(schoon);
  if (!online) return { product: null, barcode: schoon };
  return { product: await bewaarInMijnProducten(online), bron: 'online' };
}
