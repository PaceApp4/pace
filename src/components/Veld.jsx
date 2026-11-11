// Een invoerveld met een label erboven en eventueel een eenheid erachter.
export default function Veld({
  label,
  waarde,
  wijzig,
  eenheid,
  getal = false,
  placeholder = '',
  autoFocus = false,
  type = 'text',
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zacht">{label}</span>
      <div className="mt-1 flex items-center rounded-[10px] border border-rand bg-vlak px-3 focus-within:border-primair">
        <input
          className="w-full min-w-0 bg-transparent py-2.5 outline-none"
          type={type}
          inputMode={getal ? 'decimal' : undefined}
          value={waarde}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => wijzig(e.target.value)}
          onFocus={(e) => getal && e.target.select()}
        />
        {eenheid && <span className="pl-2 text-sm text-zacht">{eenheid}</span>}
      </div>
    </label>
  );
}

// Een rij keuzeknoppen (segmenten).
export function Keuze({ label, opties, waarde, kies, kolommen }) {
  return (
    <div>
      {label && <span className="text-xs font-medium text-zacht">{label}</span>}
      <div
        className="mt-1 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${kolommen ?? opties.length}, minmax(0, 1fr))` }}
      >
        {opties.map((optie) => (
          <button
            key={optie.sleutel}
            className={`knop min-h-11 rounded-[10px] border px-2 text-sm font-semibold ${
              waarde === optie.sleutel
                ? 'border-primair bg-primair text-op-primair'
                : 'border-rand bg-vlak'
            }`}
            onClick={() => kies(optie.sleutel)}
          >
            {optie.label}
          </button>
        ))}
      </div>
    </div>
  );
}
