import { useEffect, useRef, useState } from 'react';
import { STANDAARD_WATERKNOPPEN, useDoelen, useInstelling } from '../db.js';
import { exporteer, importeer } from '../lib/backup.js';
import { leesGetal } from '../lib/voeding.js';
import Veld from '../components/Veld.jsx';

const DOELVELDEN = [
  { sleutel: 'kcal', label: 'Calorieën', eenheid: 'kcal' },
  { sleutel: 'eiwit', label: 'Eiwit', eenheid: 'g' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten', eenheid: 'g' },
  { sleutel: 'vet', label: 'Vet', eenheid: 'g' },
  { sleutel: 'vezels', label: 'Vezels', eenheid: 'g' },
  { sleutel: 'suiker', label: 'Suiker (maximaal)', eenheid: 'g' },
  { sleutel: 'water', label: 'Water', eenheid: 'ml' },
];

// Instellingen: doelen, waterknoppen en back-up.
export default function Meer() {
  const [doelen, bewaarDoelen] = useDoelen();
  const [waterknoppen, bewaarWaterknoppen] = useInstelling(
    'waterknoppen',
    STANDAARD_WATERKNOPPEN
  );

  const [doelTekst, zetDoelTekst] = useState(null);
  const [knopTekst, zetKnopTekst] = useState(null);
  const [melding, zetMelding] = useState('');
  const bestandKiezer = useRef(null);

  // Vul de velden zodra de opgeslagen waarden geladen zijn (of veranderen).
  const doelenSleutel = JSON.stringify(doelen);
  const knoppenSleutel = JSON.stringify(waterknoppen);
  useEffect(() => {
    const tekst = {};
    for (const veld of DOELVELDEN) tekst[veld.sleutel] = String(doelen[veld.sleutel]);
    zetDoelTekst(tekst);
    zetKnopTekst(waterknoppen.map(String));
  }, [doelenSleutel, knoppenSleutel]);

  function toonMelding(tekst) {
    zetMelding(tekst);
    setTimeout(() => zetMelding(''), 3000);
  }

  async function slaDoelenOp() {
    const nieuw = {};
    for (const veld of DOELVELDEN) nieuw[veld.sleutel] = leesGetal(doelTekst[veld.sleutel]);
    await bewaarDoelen(nieuw);

    const knoppen = knopTekst.map(leesGetal).filter((ml) => ml > 0);
    await bewaarWaterknoppen(knoppen.length > 0 ? knoppen : STANDAARD_WATERKNOPPEN);
    toonMelding('✅ Opgeslagen');
  }

  async function kiesBestand(event) {
    const bestand = event.target.files[0];
    event.target.value = ''; // zodat je hetzelfde bestand nog eens kunt kiezen
    if (!bestand) return;
    const zeker = window.confirm(
      'Let op: alle gegevens in de app worden vervangen door deze back-up. Doorgaan?'
    );
    if (!zeker) return;
    try {
      await importeer(bestand);
      toonMelding('✅ Back-up teruggezet');
    } catch (fout) {
      toonMelding(`⚠️ ${fout.message}`);
    }
  }

  if (!doelTekst || !knopTekst) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Meer</h1>

      <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">🎯 Dagdoelen</h2>
        <div className="grid grid-cols-2 gap-3">
          {DOELVELDEN.map((veld) => (
            <Veld
              key={veld.sleutel}
              label={veld.label}
              waarde={doelTekst[veld.sleutel]}
              wijzig={(tekst) => zetDoelTekst({ ...doelTekst, [veld.sleutel]: tekst })}
              eenheid={veld.eenheid}
              getal
            />
          ))}
        </div>

        <h2 className="pt-2 text-lg font-bold">💧 Waterknoppen</h2>
        <p className="text-sm text-indigo-900/60">
          De hoeveelheden die je met één tik toevoegt op het dashboard.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {knopTekst.map((tekst, index) => (
            <Veld
              key={index}
              label={index === 0 ? '🥛 Glas' : '🍶 Fles'}
              waarde={tekst}
              wijzig={(nieuw) => zetKnopTekst(knopTekst.map((t, i) => (i === index ? nieuw : t)))}
              eenheid="ml"
              getal
            />
          ))}
        </div>

        <button
          className="knop w-full rounded-2xl bg-violet-600 py-4 text-lg font-bold text-white shadow-sm"
          onClick={slaDoelenOp}
        >
          Opslaan
        </button>
      </section>

      <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">💾 Back-up</h2>
        <p className="text-sm text-indigo-900/60">
          Je gegevens staan alleen op dit toestel. Maak af en toe een back-up en bewaar die
          bijvoorbeeld in Bestanden of iCloud Drive.
        </p>
        <button
          className="knop w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white shadow-sm"
          onClick={() => exporteer().catch(() => toonMelding('⚠️ Back-up maken is mislukt'))}
        >
          ⬇️ Back-up maken
        </button>
        <button
          className="knop w-full rounded-2xl bg-emerald-50 py-3 font-bold text-emerald-700"
          onClick={() => bestandKiezer.current.click()}
        >
          ⬆️ Back-up terugzetten
        </button>
        <input
          ref={bestandKiezer}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={kiesBestand}
        />
      </section>

      <p className="text-center text-xs text-indigo-900/40">Pace · fase 1</p>

      {melding && (
        <div className="animatie-pop fixed inset-x-0 bottom-28 z-50 mx-auto w-fit rounded-full bg-indigo-950 px-5 py-3 font-bold text-white shadow-lg">
          {melding}
        </div>
      )}
    </div>
  );
}
