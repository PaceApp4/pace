import { rond } from '../lib/voeding.js';

// Kale voortgangsbalk.
export function Voortgang({ procent, kleur = 'var(--pace-primair)', hoogte = 6 }) {
  const p = Math.max(0, Math.min(procent, 100));
  return (
    <div className="overflow-hidden rounded-full" style={{ height: hoogte, background: 'var(--pace-spoor)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${p}%`, background: kleur, transition: 'width 0.6s ease' }}
      />
    </div>
  );
}

// Balk met label, bijv. 'Vezels 18 / 30 g'.
export default function Balk({ label, waarde, doel, eenheid = 'g', kleur }) {
  const procent = doel > 0 ? (waarde / doel) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-zacht">
          <b className="font-semibold text-tekst">{rond(waarde)}</b> / {rond(doel)} {eenheid}
        </span>
      </div>
      <Voortgang procent={procent} kleur={kleur} />
    </div>
  );
}
