import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';
import { rond } from '../lib/voeding.js';
import Venster from './Venster.jsx';
import ProductFormulier from './ProductFormulier.jsx';
import HoeveelheidFormulier from './HoeveelheidFormulier.jsx';

// Het venster om iets aan een maaltijd toe te voegen. Drie stappen:
// 1. 'zoeken'      - kies een product uit je eigen lijst
// 2. 'product'     - nieuw product maken of een bestaand product wijzigen
// 3. 'hoeveelheid' - hoeveel heb je gegeten?
export default function VoedingToevoegen({ datum, maaltijd, sluit }) {
  const [stap, zetStap] = useState({ naam: 'zoeken' });
  const [zoek, zetZoek] = useState('');
  const producten = useLiveQuery(() => db.producten.toArray(), []) ?? [];

  const zoekterm = zoek.trim().toLowerCase();
  const gevonden = producten
    .filter((p) => `${p.naam} ${p.merk ?? ''}`.toLowerCase().includes(zoekterm))
    .sort(
      (a, b) =>
        Number(b.favoriet) - Number(a.favoriet) ||
        (b.laatstGebruikt ?? 0) - (a.laatstGebruikt ?? 0) ||
        a.naam.localeCompare(b.naam)
    );

  async function logProduct(product, gram) {
    await db.voedingslog.add({
      datum,
      maaltijd: maaltijd.sleutel,
      productId: product.id,
      naam: product.naam,
      eenheid: product.eenheid ?? 'g',
      portie: product.portie ?? 0,
      gram,
      // We bewaren een kopie van de voedingswaarden, zodat oude dagen
      // kloppen als je het product later wijzigt of verwijdert.
      per100: { ...product.per100 },
      tijd: Date.now(),
    });
    await db.producten.update(product.id, { laatstGebruikt: Date.now(), laatsteGram: gram });
    sluit();
  }

  if (stap.naam === 'product') {
    return (
      <Venster
        titel={stap.product ? 'Product wijzigen' : 'Nieuw product'}
        sluit={sluit}
        terug={() => zetStap({ naam: 'zoeken' })}
      >
        <ProductFormulier
          product={stap.product}
          beginNaam={zoek.trim()}
          klaar={(product) =>
            // Na een nieuw product meteen door naar de hoeveelheid.
            zetStap(stap.product ? { naam: 'zoeken' } : { naam: 'hoeveelheid', product })
          }
          verwijderd={() => zetStap({ naam: 'zoeken' })}
        />
      </Venster>
    );
  }

  if (stap.naam === 'hoeveelheid') {
    const product = stap.product;
    return (
      <Venster titel={product.naam} sluit={sluit} terug={() => zetStap({ naam: 'zoeken' })}>
        <HoeveelheidFormulier
          item={product}
          beginGram={product.laatsteGram || product.portie || 100}
          knopTekst={`Toevoegen aan ${maaltijd.label.toLowerCase()}`}
          opslaan={(gram) => logProduct(product, gram)}
        />
      </Venster>
    );
  }

  return (
    <Venster titel={`${maaltijd.icoon} ${maaltijd.label}`} sluit={sluit}>
      <div className="space-y-3">
        <div className="flex items-center rounded-2xl bg-violet-50 px-3 focus-within:ring-2 focus-within:ring-violet-400">
          <span>🔍</span>
          <input
            className="w-full bg-transparent px-2 py-3 outline-none"
            type="search"
            placeholder="Zoek in je producten"
            value={zoek}
            onChange={(e) => zetZoek(e.target.value)}
          />
        </div>

        <button
          className="knop w-full rounded-2xl bg-violet-600 py-3 font-bold text-white shadow-sm"
          onClick={() => zetStap({ naam: 'product', product: null })}
        >
          ＋ Nieuw product{zoek.trim() ? ` '${zoek.trim()}'` : ''}
        </button>

        {producten.length === 0 && (
          <p className="py-6 text-center text-indigo-900/60">
            Je hebt nog geen producten. Maak je eerste product aan met de knop hierboven. Daarna
            staat het hier klaar om met twee tikken te loggen.
          </p>
        )}
        {producten.length > 0 && gevonden.length === 0 && (
          <p className="py-6 text-center text-indigo-900/60">Niets gevonden voor '{zoek}'.</p>
        )}

        <ul className="space-y-2">
          {gevonden.map((product) => (
            <li key={product.id} className="flex items-center gap-1 rounded-2xl bg-violet-50">
              <button
                className="knop min-w-0 flex-1 px-3 py-3 text-left"
                onClick={() => zetStap({ naam: 'hoeveelheid', product })}
              >
                <div className="truncate font-bold">{product.naam}</div>
                <div className="truncate text-sm text-indigo-900/60">
                  {product.merk ? `${product.merk} · ` : ''}
                  {rond(product.per100?.kcal)} kcal per 100 {product.eenheid ?? 'g'}
                </div>
              </button>
              <button
                className="knop h-11 w-10 text-xl"
                onClick={() => db.producten.update(product.id, { favoriet: !product.favoriet })}
                aria-label={product.favoriet ? 'Geen favoriet meer' : 'Maak favoriet'}
              >
                {product.favoriet ? '⭐' : '☆'}
              </button>
              <button
                className="knop mr-1 h-11 w-10 text-lg"
                onClick={() => zetStap({ naam: 'product', product })}
                aria-label="Product wijzigen"
              >
                ✏️
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Venster>
  );
}
