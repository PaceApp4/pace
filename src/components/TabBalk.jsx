import Icoon from './Icoon.jsx';

export const TABS = [
  { sleutel: 'vandaag', label: 'Vandaag', icoon: 'home' },
  { sleutel: 'voeding', label: 'Voeding', icoon: 'voeding' },
  { sleutel: 'training', label: 'Training', icoon: 'training' },
  { sleutel: 'voortgang', label: 'Voortgang', icoon: 'grafiek' },
  { sleutel: 'meer', label: 'Meer', icoon: 'meer' },
];

// De navigatiebalk onderin het scherm.
export default function TabBalk({ actief, kies }) {
  return (
    <nav
      aria-label="Hoofdmenu"
      className="border-t border-rand bg-kaart"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md px-1.5">
        {TABS.map((tab) => {
          const isActief = tab.sleutel === actief;
          return (
            <button
              key={tab.sleutel}
              aria-current={isActief ? 'page' : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 border-t-2 text-[11px] ${
                isActief
                  ? 'border-primair font-semibold text-actief'
                  : 'border-transparent font-medium text-zacht'
              }`}
              onClick={() => kies(tab.sleutel)}
            >
              <Icoon naam={tab.icoon} grootte={22} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
