import { useState } from 'react';
import { useDoelen, useProfiel } from '../db.js';
import { ACTIVITEITEN, DOELEN, berekenPlan, bmi } from '../lib/plan.js';
import { rond, rond1 } from '../lib/voeding.js';
import Venster from './Venster.jsx';
import Veld, { Keuze } from './Veld.jsx';

// Profiel invullen en een voorgesteld voedingsplan overnemen.
export default function ProfielVenster({ sluit, toon }) {
  const [opgeslagen, bewaarProfiel, profielGeladen] = useProfiel();
  const [doelen, bewaarDoelen, doelenGeladen] = useDoelen();
  if (!profielGeladen || !doelenGeladen) return null;
  return (
    <Formulier
      opgeslagen={opgeslagen}
      bewaarProfiel={bewaarProfiel}
      doelen={doelen}
      bewaarDoelen={bewaarDoelen}
      sluit={sluit}
      toon={toon}
    />
  );
}

function Formulier({ opgeslagen, bewaarProfiel, doelen, bewaarDoelen, sluit, toon }) {
  const [p, zetP] = useState(opgeslagen);
  const zet = (sleutel) => (waarde) => zetP({ ...p, [sleutel]: waarde });

  const plan = berekenPlan(p);
  const huidigBmi = bmi(p.gewicht, p.lengte);
  const doel = DOELEN.find((d) => d.sleutel === p.doel);
  const activiteit = ACTIVITEITEN.find((a) => a.sleutel === p.activiteit);

  async function bewaar() {
    await bewaarProfiel(p);
    toon('Profiel opgeslagen');
  }

  async function neemOver() {
    await bewaarProfiel(p);
    await bewaarDoelen({
      ...doelen,
      kcal: plan.kcal,
      eiwit: plan.eiwit,
      koolhydraten: plan.koolhydraten,
      vet: plan.vet,
      vezels: plan.vezels,
      water: plan.water,
    });
    toon('Plan overgenomen als dagdoelen');
    sluit();
  }

  return (
    <Venster titel="Profiel en voedingsplan" sluit={sluit}>
      <div className="space-y-4">
        <Veld label="Voornaam (voor de begroeting)" waarde={p.naam} wijzig={zet('naam')} />
        <Keuze
          label="Geslacht"
          waarde={p.geslacht}
          kies={zet('geslacht')}
          opties={[
            { sleutel: 'man', label: 'Man' },
            { sleutel: 'vrouw', label: 'Vrouw' },
          ]}
        />
        <div className="grid grid-cols-3 gap-3">
          <Veld label="Leeftijd" waarde={p.leeftijd} wijzig={zet('leeftijd')} getal eenheid="jr" />
          <Veld label="Lengte" waarde={p.lengte} wijzig={zet('lengte')} getal eenheid="cm" />
          <Veld label="Gewicht" waarde={p.gewicht} wijzig={zet('gewicht')} getal eenheid="kg" />
        </div>
        {huidigBmi > 0 && <p className="-mt-2 text-xs text-zacht">BMI {rond1(huidigBmi)}</p>}

        <div>
          <Keuze label="Activiteit" waarde={p.activiteit} kies={zet('activiteit')} opties={ACTIVITEITEN} />
          {activiteit && <p className="mt-1 text-xs text-zacht">{activiteit.uitleg}</p>}
        </div>
        <div>
          <Keuze label="Streefdoel" waarde={p.doel} kies={zet('doel')} opties={DOELEN} />
          {doel && <p className="mt-1 text-xs text-zacht">{doel.uitleg}</p>}
        </div>

        {plan ? (
          <section className="kaart space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">Voorgesteld plan</h3>
              <span className="text-xs text-zacht">verbruik ± {rond(plan.verbruik)} kcal</span>
            </div>
            <div className="text-[28px] leading-none font-bold">
              {rond(plan.kcal)} <span className="text-sm font-medium text-zacht">kcal per dag</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['Eiwit', plan.eiwit, 'var(--pace-eiwit)'],
                ['Koolh.', plan.koolhydraten, 'var(--pace-koolh)'],
                ['Vet', plan.vet, 'var(--pace-vet)'],
              ].map(([label, g, kleur]) => (
                <div key={label} className="rounded-[10px] bg-vlak py-2">
                  <div className="text-lg font-bold">{g} g</div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-zacht">
                    <span className="h-2 w-2 rounded-full" style={{ background: kleur }} />
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zacht">
              Vezels {plan.vezels} g · water {rond(plan.water)} ml. Dit is een richtlijn om mee te
              beginnen; je kunt alles daarna bij Dagdoelen aanpassen.
            </p>
            <button
              className="knop w-full rounded-[12px] bg-primair py-3.5 font-semibold text-op-primair"
              onClick={neemOver}
            >
              Plan overnemen als dagdoelen
            </button>
          </section>
        ) : (
          <p className="kaart text-sm text-zacht">
            Vul leeftijd, lengte en gewicht in om een voorgesteld plan te zien.
          </p>
        )}

        <button className="knop w-full rounded-[12px] bg-vlak py-3 font-semibold" onClick={bewaar}>
          Alleen profiel opslaan
        </button>
      </div>
    </Venster>
  );
}
