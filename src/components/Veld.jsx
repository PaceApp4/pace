// Een invoerveld met een label erboven en eventueel een eenheid erachter.
export default function Veld({
  label,
  waarde,
  wijzig,
  eenheid,
  getal = false,
  placeholder = '',
  autoFocus = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-indigo-900/70">{label}</span>
      <div className="mt-1 flex items-center rounded-2xl bg-violet-50 px-3 focus-within:ring-2 focus-within:ring-violet-400">
        <input
          className="w-full min-w-0 bg-transparent py-3 outline-none"
          type="text"
          inputMode={getal ? 'decimal' : 'text'}
          value={waarde}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => wijzig(e.target.value)}
          onFocus={(e) => getal && e.target.select()}
        />
        {eenheid && <span className="pl-2 text-sm text-indigo-900/50">{eenheid}</span>}
      </div>
    </label>
  );
}
