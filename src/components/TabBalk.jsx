export const TABS = [
  { sleutel: 'vandaag', label: 'Vandaag', icoon: '🏠' },
  { sleutel: 'voeding', label: 'Voeding', icoon: '🍽️' },
  { sleutel: 'training', label: 'Training', icoon: '🏋️' },
  { sleutel: 'voortgang', label: 'Voortgang', icoon: '📈' },
  { sleutel: 'meer', label: 'Meer', icoon: '⚙️' },
];

// De navigatiebalk onderin het scherm.
export default function TabBalk({ actief, kies }) {
  return (
    <nav
      className="border-t border-violet-100 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const isActief = tab.sleutel === actief;
          return (
            <button
              key={tab.sleutel}
              className="knop flex flex-1 flex-col items-center gap-0.5 py-2"
              onClick={() => kies(tab.sleutel)}
            >
              <span
                className={`flex h-9 w-14 items-center justify-center rounded-full text-xl ${
                  isActief ? 'bg-violet-100' : ''
                }`}
              >
                {tab.icoon}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isActief ? 'text-violet-700' : 'text-indigo-900/50'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
