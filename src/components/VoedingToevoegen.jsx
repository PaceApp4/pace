import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db.js';
import { rond } from '../lib/voeding.js';
import { bewaarInMijnProducten, productBijBarcode, zoekOnline } from '../lib/openfoodfacts.js';
import Venster from './Venster.jsx';
import Icoon from './Icoon.jsx';
import ProductFormulier from './ProductFormulier.jsx';
import HoeveelheidFormulier from './HoeveelheidFormulier.jsx';
import BarcodeScanner from './BarcodeScanner.jsx';

const NUTRISCORE = { a: '#038141', b: '#85bb2f', c: '#e6a100', d: '#e67e22', e: '#e63e11' };

function ProductRegel({ product, kies, extra }) {
  return (
    <li className="flex items-center gap-1 rounded-[14px] border border-rand bg-kaart">
      <button className="knop flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left" onClick={kies}>
        {product.afbeelding ? (
          <img src={product.afbeelding} alt="" className="h-11 w-11 shrink-0 rounded-[10px] bg-vlak object-contain" />
        ) : (
          <span className="badge h-11 w-11 text-sm font-bold" style={{ '--tint': 'var(--pace-primair)' }}>
            {product.naam.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{product.naam}</span>
          <span className="block truncate text-xs text-zacht">
            {product.merk ? `${product.merk} · ` : ''}
            {rond(product.per100?.kcal)} kcal · E {rond(product.per100?.eiwit)} · K {rond(product.per100?.koolhydraten)} · V{' '}
            {rond(product.per100?.vet)} per 100 {product.eenheid ?? 'g'}
          </span>
        </span>
        {product.nutriscore && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white uppercase"
            style={{ background: NUTRISCORE[product.nutriscore] ?? '#888' }}
            title="Nutri-Score"
          >
            {product.nutriscore}
          </span>
        )}
      </button>
      {extra}
    </li>
  );
}

// Het venster om iets aan een maaltijd toe te voegen:
// zoeken in je eigen producten, online zoeken (Open Food Facts) of een barcode scannen.
export default function VoedingToevoegen({ datum, maaltijd, sluit }) {
  const [stap, zetStap] = useState({ naam: 'zoeken' });
  const [bron, zetBron] = useState('eigen');
  const [zoek, zetZoek] = useState('');
  const [online, zetOnline] = useState({ status: 'leeg', lijst: [], fout: '' });
  const producten = useLiveQuery(() => db.producten.toArray(), []) ?? [];

  const zoekterm = zoek.trim().toLowerCase();
  const gevonden = producten
    .filter((p) => `${p.naam} ${p.merk ?? ''} ${p.barcode ?? ''}`.toLowerCase().includes(zoekterm))
    .sort(
      (a, b) =>
        Number(b.favoriet) - Number(a.favoriet) ||
        (b.laatstGebruikt ?? 0) - (a.laatstGebruikt ?? 0) ||
        a.naam.localeCompare(b.naam)
    );

  async function zoekInOpenFoodFacts() {
    zetBron('online');
    zetOnline({ status: 'bezig', lijst: [], fout: '' });
    try {
      const lijst = await zoekOnline(zoek);
      zetOnline({ status: 'klaar', lijst, fout: '' });
    } catch (fout) {
      zetOnline({ status: 'fout', lijst: [], fout: fout.message });
    }
  }

  async function barcodeGevonden(code) {
    zetStap({ naam: 'laden', code });
    try {
      const { product, barcode } = await productBijBarcode(code);
      if (product) zetStap({ naam: 'hoeveelheid', product });
      else zetStap({ naam: 'onbekend', barcode });
    } catch (fout) {
      zetStap({ naam: 'onbekend', barcode: code, fout: fout.message });
    }
  }

  async function logProduct(product, gram) {
    await db.voedingslog.add({
      datum,
      maaltijd: maaltijd.sleutel,
      productId: product.id,
      naam: product.naam,
      eenheid: product.eenheid ?? 'g',
      portie: product.portie ?? 0,
      gram,
      // Kopie van de voedingswaarden, zodat oude dagen kloppen als je het product later wijzigt.
      per100: { ...product.per100 },
      tijd: Date.now(),
    });
    await db.producten.update(product.id, { laatstGebruikt: Date.now(), laatsteGram: gram });
    sluit();
  }

  if (stap.naam === 'scan') {
    return <BarcodeScanner gevonden={barcodeGevonden} sluit={() => zetStap({ naam: 'zoeken' })} />;
  }

  if (stap.naam === 'laden') {
    return (
      <Venster titel="Product opzoeken" sluit={sluit}>
        <p className="py-10 text-center text-zacht">Barcode {stap.code} opzoeken…</p>
      </Venster>
    );
  }

  if (stap.naam === 'onbekend') {
    return (
      <Venster titel="Product niet gevonden" sluit={sluit} terug={() => zetStap({ naam: 'zoeken' })}>
        <div className="space-y-4">
          <p className="text-sm text-zacht">
            {stap.fout ?? `Barcode ${stap.barcode} staat nog niet in Open Food Facts.`} Voer het product één keer
            zelf in vanaf het etiket; daarna herkent Pace deze barcode meteen.
          </p>
          <button
            className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
            onClick={() => zetStap({ naam: 'product', product: null, barcode: stap.barcode })}
          >
            Product invoeren
          </button>
        </div>
      </Venster>
    );
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
          beginNaam={stap.barcode ? '' : zoek.trim()}
          barcode={stap.barcode}
          klaar={(product) => zetStap(stap.product ? { naam: 'zoeken' } : { naam: 'hoeveelheid', product })}
          verwijderd={() => zetStap({ naam: 'zoeken' })}
        />
      </Venster>
    );
  }

  if (stap.naam === 'hoeveelheid') {
    const product = stap.product;
    return (
      <Venster titel={product.naam} sluit={sluit} terug={() => zetStap({ naam: 'zoeken' })}>
        {product.merk && <p className="-mt-2 mb-3 text-sm text-zacht">{product.merk}</p>}
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
    <Venster titel={maaltijd.label} sluit={sluit} vol>
      <div className="space-y-3">
        <div className="flex gap-2">
          <form
            className="flex flex-1 items-center gap-2 rounded-[14px] border border-rand bg-kaart px-3 focus-within:border-primair"
            onSubmit={(e) => {
              e.preventDefault();
              if (bron === 'online') zoekInOpenFoodFacts();
            }}
          >
            <Icoon naam="zoek" grootte={18} className="text-zacht" />
            <label className="sr-only" htmlFor="zoek-product">
              Zoek product
            </label>
            <input
              id="zoek-product"
              className="w-full bg-transparent py-3 outline-none"
              type="search"
              enterKeyHint="search"
              placeholder="Zoek product of merk"
              value={zoek}
              onChange={(e) => zetZoek(e.target.value)}
            />
          </form>
          <button
            className="knop flex h-12 w-12 items-center justify-center rounded-[14px] text-white"
            style={{ background: 'var(--pace-hero)' }}
            onClick={() => zetStap({ naam: 'scan' })}
            aria-label="Barcode scannen"
          >
            <Icoon naam="barcode" grootte={22} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-[14px] bg-vlak p-1">
          {[
            ['eigen', 'Mijn producten'],
            ['online', 'Online zoeken'],
          ].map(([sleutel, label]) => (
            <button
              key={sleutel}
              className={`h-10 rounded-[11px] text-sm font-semibold ${bron === sleutel ? 'bg-kaart shadow-sm' : 'text-zacht'}`}
              onClick={() => zetBron(sleutel)}
            >
              {label}
            </button>
          ))}
        </div>

        {bron === 'eigen' && (
          <>
            <button
              className="knop flex min-h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-rand text-sm font-semibold"
              onClick={() => zetStap({ naam: 'product', product: null })}
            >
              <Icoon naam="plus" grootte={16} />
              Zelf invoeren{zoek.trim() ? ` ‘${zoek.trim()}’` : ''}
            </button>
            {producten.length === 0 && (
              <p className="py-4 text-center text-sm text-zacht">
                Nog geen eigen producten. Scan een barcode of zoek online; wat je kiest komt hier te staan.
              </p>
            )}
            {producten.length > 0 && gevonden.length === 0 && (
              <div className="space-y-2 py-2 text-center">
                <p className="text-sm text-zacht">Niet in je eigen producten.</p>
                <button className="knop text-sm font-semibold text-primair" onClick={zoekInOpenFoodFacts}>
                  Zoek ‘{zoek.trim()}’ online
                </button>
              </div>
            )}
            <ul className="space-y-2">
              {gevonden.map((product) => (
                <ProductRegel
                  key={product.id}
                  product={product}
                  kies={() => zetStap({ naam: 'hoeveelheid', product })}
                  extra={
                    <>
                      <button
                        className="knop flex h-11 w-9 items-center justify-center"
                        onClick={() => db.producten.update(product.id, { favoriet: !product.favoriet })}
                        aria-label={product.favoriet ? 'Geen favoriet meer' : 'Maak favoriet'}
                      >
                        <Icoon naam="ster" className={product.favoriet ? 'fill-current text-[#f59e0b]' : 'text-zacht'} />
                      </button>
                      <button
                        className="knop mr-1 flex h-11 w-9 items-center justify-center"
                        onClick={() => zetStap({ naam: 'product', product })}
                        aria-label="Product wijzigen"
                      >
                        <Icoon naam="potlood" className="text-zacht" />
                      </button>
                    </>
                  }
                />
              ))}
            </ul>
          </>
        )}

        {bron === 'online' && (
          <>
            <button
              className="knop flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-primair text-sm font-semibold text-op-primair disabled:opacity-40"
              disabled={zoek.trim().length < 2 || online.status === 'bezig'}
              onClick={zoekInOpenFoodFacts}
            >
              <Icoon naam="wereld" grootte={18} />
              {online.status === 'bezig' ? 'Zoeken…' : `Zoek${zoek.trim() ? ` ‘${zoek.trim()}’` : ''} in Open Food Facts`}
            </button>
            {online.status === 'fout' && <p className="rounded-[12px] bg-vlak p-3 text-sm">{online.fout}</p>}
            {online.status === 'klaar' && online.lijst.length === 0 && (
              <p className="py-4 text-center text-sm text-zacht">Niets gevonden. Probeer een ander woord of scan de barcode.</p>
            )}
            <ul className="space-y-2">
              {online.lijst.map((product, i) => (
                <ProductRegel
                  key={`${product.barcode}-${i}`}
                  product={product}
                  kies={async () => zetStap({ naam: 'hoeveelheid', product: await bewaarInMijnProducten(product) })}
                />
              ))}
            </ul>
            <p className="pt-1 text-center text-[11px] text-zacht">Gegevens: Open Food Facts (ODbL)</p>
          </>
        )}
      </div>
    </Venster>
  );
}
