import { useState } from 'react';
import { db } from '../db.js';
import { NUTRIENTEN, leesGetal } from '../lib/voeding.js';
import Veld from './Veld.jsx';

// Formulier om een eigen product te maken of te wijzigen.
// 'product' is leeg (null) bij een nieuw product.
export default function ProductFormulier({ product, beginNaam = '', barcode = '', klaar, verwijderd }) {
  const [naam, zetNaam] = useState(product?.naam ?? beginNaam);
  const [merk, zetMerk] = useState(product?.merk ?? '');
  const [eenheid, zetEenheid] = useState(product?.eenheid ?? 'g');
  const [portie, zetPortie] = useState(product?.portie ? String(product.portie) : '');
  const [waarden, zetWaarden] = useState(() => {
    const begin = {};
    for (const n of NUTRIENTEN) {
      const w = product?.per100?.[n.sleutel];
      begin[n.sleutel] = w || w === 0 ? String(w).replace('.', ',') : '';
    }
    return begin;
  });
  const [fout, zetFout] = useState('');

  async function opslaan() {
    if (!naam.trim()) {
      zetFout('Vul een naam in.');
      return;
    }
    const per100 = {};
    for (const n of NUTRIENTEN) per100[n.sleutel] = leesGetal(waarden[n.sleutel]);

    const gegevens = {
      naam: naam.trim(),
      merk: merk.trim(),
      eenheid,
      portie: leesGetal(portie),
      per100,
      barcode: product?.barcode || barcode || '',
    };

    if (product) {
      await db.producten.update(product.id, gegevens);
      klaar({ ...product, ...gegevens });
    } else {
      const id = await db.producten.add({ ...gegevens, favoriet: false, laatstGebruikt: 0 });
      klaar({ ...gegevens, id, favoriet: false, laatstGebruikt: 0 });
    }
  }

  async function verwijder() {
    if (!window.confirm(`'${product.naam}' verwijderen? Wat je al gelogd hebt blijft staan.`)) {
      return;
    }
    await db.producten.delete(product.id);
    verwijderd();
  }

  return (
    <div className="space-y-3">
      {(product?.barcode || barcode) && (
        <p className="text-xs text-zacht">Barcode {product?.barcode || barcode}</p>
      )}
      <Veld label="Naam" waarde={naam} wijzig={zetNaam} placeholder="bijv. Magere kwark" />
      <Veld label="Merk (mag leeg blijven)" waarde={merk} wijzig={zetMerk} />

      <div>
        <span className="text-sm font-semibold text-zacht">Gemeten in</span>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {[
            { sleutel: 'g', label: 'Gram (g)' },
            { sleutel: 'ml', label: 'Milliliter (ml)' },
          ].map((keuze) => (
            <button
              key={keuze.sleutel}
              className={`knop rounded-[12px] py-3 font-semibold ${
                eenheid === keuze.sleutel ? 'bg-primair text-op-primair' : 'bg-vlak'
              }`}
              onClick={() => zetEenheid(keuze.sleutel)}
            >
              {keuze.label}
            </button>
          ))}
        </div>
      </div>

      <Veld
        label="Standaardportie (mag leeg blijven)"
        waarde={portie}
        wijzig={zetPortie}
        eenheid={eenheid}
        getal
        placeholder="bijv. 150"
      />

      <h3 className="pt-2 font-bold">Voedingswaarden per 100 {eenheid}</h3>
      <div className="grid grid-cols-2 gap-3">
        {NUTRIENTEN.map((n) => (
          <Veld
            key={n.sleutel}
            label={n.label}
            waarde={waarden[n.sleutel]}
            wijzig={(tekst) => zetWaarden({ ...waarden, [n.sleutel]: tekst })}
            eenheid={n.eenheid}
            getal
            placeholder="0"
          />
        ))}
      </div>

      {fout && <p className="font-semibold text-over">{fout}</p>}

      <button
        className="knop w-full rounded-[12px] bg-primair py-3.5 text-base font-semibold text-op-primair"
        onClick={opslaan}
      >
        Opslaan
      </button>
      {product && (
        <button
          className="knop w-full rounded-[12px] bg-vlak py-3 font-bold text-over"
          onClick={verwijder}
        >
          Product verwijderen
        </button>
      )}
    </div>
  );
}
