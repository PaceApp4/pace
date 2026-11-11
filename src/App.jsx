import { useEffect, useState } from 'react';
import TabBalk from './components/TabBalk.jsx';
import Icoon from './components/Icoon.jsx';
import { useInstelling } from './db.js';
import { duurTekst, vandaag } from './lib/datum.js';
import Vandaag from './schermen/Vandaag.jsx';
import Voeding from './schermen/Voeding.jsx';
import Training from './schermen/Training.jsx';
import WorkoutBezig from './schermen/WorkoutBezig.jsx';
import Voortgang from './schermen/Voortgang.jsx';
import Meer from './schermen/Meer.jsx';

// Het hoofdonderdeel: bepaalt welk scherm zichtbaar is.
export default function App() {
  const [tab, zetTab] = useState('vandaag');
  // De gekozen dag wordt gedeeld tussen 'Vandaag' en 'Voeding'.
  const [datum, zetDatum] = useState(vandaag());
  const [actief] = useInstelling('actieveWorkout', null);
  const [workoutOpen, zetWorkoutOpen] = useState(false);
  const [nu, zetNu] = useState(Date.now());

  // Klok voor de balk 'workout bezig'.
  useEffect(() => {
    if (!actief) return;
    const t = setInterval(() => zetNu(Date.now()), 1000);
    return () => clearInterval(t);
  }, [actief]);

  // Kom je na middernacht terug in de app, spring dan naar de nieuwe dag.
  useEffect(() => {
    let laatsteDag = vandaag();
    const check = () => {
      if (document.visibilityState === 'visible' && vandaag() !== laatsteDag) {
        laatsteDag = vandaag();
        zetDatum(laatsteDag);
      }
    };
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-md px-4 pt-4 pb-8">
          {tab === 'vandaag' && (
            <Vandaag
              datum={datum}
              zetDatum={zetDatum}
              naarVoeding={() => zetTab('voeding')}
              naarTraining={() => zetTab('training')}
            />
          )}
          {tab === 'voeding' && <Voeding datum={datum} zetDatum={zetDatum} />}
          {tab === 'training' && <Training actief={actief} openWorkout={() => zetWorkoutOpen(true)} />}
          {tab === 'voortgang' && <Voortgang />}
          {tab === 'meer' && <Meer />}
        </div>
      </main>

      {actief && !workoutOpen && (
        <button
          className="flex items-center gap-3 border-t border-rand bg-kaart px-4 py-2.5 text-left"
          onClick={() => zetWorkoutOpen(true)}
        >
          <span className="h-2 w-2 rounded-full bg-goed" />
          <span className="flex-1 text-sm">
            <b className="font-semibold">{actief.naam}</b>
            <span className="text-zacht"> · {duurTekst((nu - actief.start) / 1000)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primair">
            Openen <Icoon naam="rechts" grootte={16} />
          </span>
        </button>
      )}

      <TabBalk actief={tab} kies={zetTab} />

      {actief && workoutOpen && <WorkoutBezig begin={actief} sluit={() => zetWorkoutOpen(false)} />}
    </div>
  );
}
