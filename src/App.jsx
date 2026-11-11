import { useState } from 'react';
import TabBalk from './components/TabBalk.jsx';
import { vandaag } from './lib/datum.js';
import Vandaag from './schermen/Vandaag.jsx';
import Voeding from './schermen/Voeding.jsx';
import Training from './schermen/Training.jsx';
import Voortgang from './schermen/Voortgang.jsx';
import Meer from './schermen/Meer.jsx';

// Het hoofdonderdeel: bepaalt welk scherm zichtbaar is.
export default function App() {
  const [tab, zetTab] = useState('vandaag');
  // De gekozen dag wordt gedeeld tussen 'Vandaag' en 'Voeding'.
  const [datum, zetDatum] = useState(vandaag());

  return (
    <div className="flex h-full flex-col">
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-md px-4 pt-4 pb-8">
          {tab === 'vandaag' && (
            <Vandaag datum={datum} zetDatum={zetDatum} naarVoeding={() => zetTab('voeding')} />
          )}
          {tab === 'voeding' && <Voeding datum={datum} zetDatum={zetDatum} />}
          {tab === 'training' && <Training />}
          {tab === 'voortgang' && <Voortgang />}
          {tab === 'meer' && <Meer />}
        </div>
      </main>
      <TabBalk actief={tab} kies={zetTab} />
    </div>
  );
}
