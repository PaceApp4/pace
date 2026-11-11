import { rond } from '../lib/voeding.js';

// Een horizontale voortgangsbalk met label, bijv. 'Eiwit 80 / 140 g'.
export default function Balk({ label, waarde, doel, eenheid = 'g', kleur = '#8b5cf6' }) {
  const procent = doel > 0 ? Math.min((waarde / doel) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-indigo-900/60">
          {rond(waarde)} / {rond(doel)} {eenheid}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-indigo-900/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${procent}%`,
            backgroundColor: kleur,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}
