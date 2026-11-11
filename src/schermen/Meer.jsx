import { useEffect, useRef, useState } from 'react';
import { STANDAARD_WATERKNOPPEN, useDoelen, useInstelling, useProfiel } from '../db.js';
import { exporteer, importeer } from '../lib/backup.js';
import { importeerHevy } from '../lib/hevy.js';
import { leesThemaKeuze, zetThemaKeuze } from '../lib/thema.js';
import { leesGetal, rond } from '../lib/voeding.js';
import { DOELEN } from '../lib/plan.js';
import Veld, { Keuze } from '../components/Veld.jsx';
import Icoon from '../components/Icoon.jsx';
import Badge from '../components/Badge.jsx';
import ProfielVenster from '../components/ProfielVenster.jsx';
import OpdrachtUitleg from '../components/OpdrachtUitleg.jsx';
import { useMelding } from '../components/Melding.jsx';

const DOELVELDEN = [
  { sleutel: 'kcal', label: 'Calorieën', eenheid: 'kcal' },
  { sleutel: 'eiwit', label: 'Eiwit', eenheid: 'g' },
  { sleutel: 'koolhydraten', label: 'Koolhydraten', eenheid: 'g' },
  { sleutel: 'vet', label: 'Vet', eenheid: 'g' },
  { sleutel: 'vezels', label: 'Vezels', eenheid: 'g' },
  { sleutel: 'suiker', label: 'Suiker (max.)', eenheid: 'g' },
  { sleutel: 'water', label: 'Water', eenheid: 'ml' },
  { sleutel: 'stappen', label: 'Stappen', eenheid: '' },
  { sleutel: 'slaapUren', label: 'Slaap', eenheid: 'uur' },
];

function Kop({ children, icoon, kleur }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
      {icoon && <Badge icoon={icoon} kleur={kleur} grootte={30} icoonGrootte={16} />}
      {children}
    </h2>
  );
}

// Instellingen: profiel, doelen, weergave, import en back-up.
export default function Meer() {
  const [doelen, bewaarDoelen] = useDoelen();
  const [profiel] = useProfiel();
  const [waterknoppen, bewaarWaterknoppen] = useInstelling('waterknoppen', STANDAARD_WATERKNOPPEN);
  const [doelTekst, zetDoelTekst] = useState(null);
  const [knopTekst, zetKnopTekst] = useState(null);
  const [thema, zetThema] = useState(leesThemaKeuze());
  const [profielOpen, zetProfielOpen] = useState(false);
  const [melding, toon] = useMelding();
  const backupKiezer = useRef(null);
  const hevyKiezer = useRef(null);

  // Vul de velden zodra de opgeslagen waarden geladen zijn (of veranderen).
  const doelenSleutel = JSON.stringify(doelen);
  const knoppenSleutel = JSON.stringify(waterknoppen);
  useEffect(() => {
    const tekst = {};
    for (const veld of DOELVELDEN) tekst[veld.sleutel] = String(doelen[veld.sleutel]).replace('.', ',');
    zetDoelTekst(tekst);
    zetKnopTekst(waterknoppen.map(String));
  }, [doelenSleutel, knoppenSleutel]);

  async function slaDoelenOp() {
    const nieuw = { ...doelen };
    for (const veld of DOELVELDEN) nieuw[veld.sleutel] = leesGetal(doelTekst[veld.sleutel]);
    await bewaarDoelen(nieuw);
    const knoppen = knopTekst.map(leesGetal).filter((ml) => ml > 0);
    await bewaarWaterknoppen(knoppen.length > 0 ? knoppen : STANDAARD_WATERKNOPPEN);
    toon('Doelen opgeslagen');
  }

  async function kiesBackup(event) {
    const bestand = event.target.files[0];
    event.target.value = '';
    if (!bestand) return;
    if (!window.confirm('Let op: alle gegevens in de app worden vervangen door deze back-up. Doorgaan?')) return;
    try {
      await importeer(bestand);
      toon('Back-up teruggezet');
    } catch (fout) {
      toon(fout.message);
    }
  }

  async function kiesHevy(event) {
    const bestand = event.target.files[0];
    event.target.value = '';
    if (!bestand) return;
    try {
      const { nieuw, overgeslagen } = await importeerHevy(bestand);
      toon(`${nieuw} workouts geïmporteerd${overgeslagen ? `, ${overgeslagen} stonden er al in` : ''}`);
    } catch (fout) {
      toon(fout.message);
    }
  }

  if (!doelTekst || !knopTekst) return null;
  const doelNaam = DOELEN.find((d) => d.sleutel === profiel.doel)?.label;

  return (
    <div className="binnenkomen space-y-3">
      <h1 className="text-[26px] font-bold tracking-tight">Meer</h1>

      <button className="knop kaart flex w-full items-center gap-3 text-left" onClick={() => zetProfielOpen(true)}>
        <Badge icoon="lichaam" kleur="var(--pace-roze)" />
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">Profiel en voedingsplan</span>
          <span className="block text-xs text-zacht">
            {profiel.gewicht && profiel.lengte
              ? `${profiel.lengte} cm · ${profiel.gewicht} kg · ${doelNaam}`
              : 'Vul lengte, gewicht en je doel in'}
          </span>
        </span>
        <Icoon naam="rechts" grootte={18} className="text-zacht" />
      </button>

      <section className="kaart space-y-3">
        <Kop icoon="vlam" kleur="var(--pace-primair)">Dagdoelen</Kop>
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
        <p className="text-xs text-zacht">
          Voldoende bewogen = {rond(leesGetal(doelTekst.stappen))} stappen of een workout op die dag.
        </p>
        <h3 className="pt-1 text-sm font-semibold">Waterknoppen</h3>
        <div className="grid grid-cols-2 gap-3">
          {knopTekst.slice(0, 2).map((tekst, index) => (
            <Veld
              key={index}
              label={`Knop ${index + 1}`}
              waarde={tekst}
              wijzig={(nieuw) => zetKnopTekst(knopTekst.map((t, i) => (i === index ? nieuw : t)))}
              eenheid="ml"
              getal
            />
          ))}
        </div>
        <button
          className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
          onClick={slaDoelenOp}
        >
          Doelen opslaan
        </button>
      </section>

      <section className="kaart space-y-3">
        <Kop icoon="maan" kleur="var(--pace-slaap)">Weergave</Kop>
        <Keuze
          waarde={thema}
          kies={(k) => {
            zetThema(k);
            zetThemaKeuze(k);
          }}
          opties={[
            { sleutel: 'auto', label: 'Automatisch' },
            { sleutel: 'licht', label: 'Licht' },
            { sleutel: 'donker', label: 'Donker' },
          ]}
        />
      </section>

      <section className="kaart space-y-2">
        <Kop icoon="stappen" kleur="var(--pace-stappen)">Apple Gezondheid en Zepp</Kop>
        <p className="text-sm text-zacht">
          Zepp stuurt je stappen en slaap naar Apple Gezondheid. Een Opdracht haalt ze daar op en
          zet ze op het klembord; op Vandaag tik je dan op ‘Stappen en slaap plakken’.
        </p>
        <details className="group rounded-[12px] bg-vlak p-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
            Zo maak je de Opdracht (eenmalig, ±10 min)
            <Icoon naam="rechts" grootte={16} className="transition-transform group-open:rotate-90" />
          </summary>
          <div className="pt-3">
            <OpdrachtUitleg />
          </div>
        </details>
      </section>

      <section className="kaart space-y-3">
        <Kop icoon="training" kleur="var(--pace-training)">Hevy-gegevens importeren</Kop>
        <p className="text-sm text-zacht">
          In Hevy: Profiel › tandwiel (Instellingen) › Export &amp; Import Data › Export workouts.
          Bewaar het bestand in Bestanden en kies het hier. Al geïmporteerde workouts worden
          overgeslagen, dus je kunt later gerust opnieuw importeren.
        </p>
        <button
          className="knop flex w-full items-center justify-center gap-2 rounded-[12px] bg-vlak py-3 font-semibold"
          onClick={() => hevyKiezer.current.click()}
        >
          <Icoon naam="bestand" grootte={18} />
          CSV-bestand kiezen
        </button>
        <input ref={hevyKiezer} type="file" accept=".csv,text/csv" className="hidden" onChange={kiesHevy} />
      </section>

      <section className="kaart space-y-3">
        <Kop icoon="bestand" kleur="var(--pace-water)">Back-up</Kop>
        <p className="text-sm text-zacht">
          Je gegevens staan alleen op dit toestel. Maak af en toe een back-up en bewaar die in
          Bestanden of iCloud Drive.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="knop rounded-[12px] bg-primair py-3 font-semibold text-op-primair"
            onClick={() => exporteer().catch(() => toon('Back-up maken is mislukt'))}
          >
            Back-up maken
          </button>
          <button className="knop rounded-[12px] bg-vlak py-3 font-semibold" onClick={() => backupKiezer.current.click()}>
            Terugzetten
          </button>
        </div>
        <input ref={backupKiezer} type="file" accept=".json,application/json" className="hidden" onChange={kiesBackup} />
      </section>

      <p className="pt-2 text-center text-xs text-zacht">Pace · versie 2</p>

      {profielOpen && <ProfielVenster sluit={() => zetProfielOpen(false)} toon={toon} />}
      {melding}
    </div>
  );
}
