// Een venster dat van onderaf omhoog schuift (zoals in de meeste telefoon-apps).
export default function Venster({ titel, sluit, terug, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="animatie-vervaag absolute inset-0 bg-indigo-950/40" onClick={sluit} />
      <div
        className="animatie-omhoog relative flex max-h-[92%] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          {terug && (
            <button
              className="knop h-10 w-10 rounded-full bg-violet-100 text-xl"
              onClick={terug}
              aria-label="Terug"
            >
              ‹
            </button>
          )}
          <h2 className="flex-1 truncate text-xl font-bold">{titel}</h2>
          <button
            className="knop h-10 w-10 rounded-full bg-violet-100 text-lg"
            onClick={sluit}
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-5">{children}</div>
      </div>
    </div>
  );
}
