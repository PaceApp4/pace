import Icoon from './Icoon.jsx';

// Een venster dat van onderaf omhoog schuift.
export default function Venster({ titel, sluit, terug, children, vol = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="animatie-vervaag absolute inset-0 bg-black/50" onClick={sluit} />
      <div
        className={`animatie-omhoog relative flex w-full max-w-md flex-col rounded-t-2xl border-t border-rand bg-bg ${
          vol ? 'h-[94%]' : 'max-h-[92%]'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          {terug && (
            <button
              className="knop kaart flex h-10 w-10 items-center justify-center !p-0"
              onClick={terug}
              aria-label="Terug"
            >
              <Icoon naam="links" />
            </button>
          )}
          <h2 className="flex-1 truncate text-lg font-semibold">{titel}</h2>
          <button
            className="knop kaart flex h-10 w-10 items-center justify-center !p-0"
            onClick={sluit}
            aria-label="Sluiten"
          >
            <Icoon naam="kruis" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-5">{children}</div>
      </div>
    </div>
  );
}
