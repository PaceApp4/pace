import { useId, useState } from 'react';
import { korteDatum } from '../lib/datum.js';

// Eenvoudige lijngrafiek. punten: [{ datum: '2026-11-11', waarde: 82.5 }]
// Tik op de grafiek om een punt te bekijken.
export default function LijnGrafiek({ punten, eenheid = '', kleur = 'var(--pace-primair)', hoogte = 160, opmaak }) {
  const [gekozen, zetGekozen] = useState(null);
  const kleurId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const fmt = opmaak ?? ((w) => (Math.round(w * 10) / 10).toLocaleString('nl-NL'));

  if (punten.length === 0) {
    return <p className="py-8 text-center text-sm text-zacht">Nog geen gegevens.</p>;
  }

  const breedte = 320;
  const links = 36;
  const rechts = 8;
  const boven = 10;
  const onder = 22;
  const waarden = punten.map((p) => p.waarde);
  let min = Math.min(...waarden);
  let max = Math.max(...waarden);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const marge = (max - min) * 0.1;
  min -= marge;
  max += marge;

  const x = (i) => (punten.length === 1 ? (links + breedte - rechts) / 2 : links + (i / (punten.length - 1)) * (breedte - links - rechts));
  const y = (w) => boven + (1 - (w - min) / (max - min)) * (hoogte - boven - onder);
  const pad = punten.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.waarde).toFixed(1)}`).join(' ');
  const lijnen = [min + marge, (min + max) / 2, max - marge];
  const actief = gekozen !== null ? punten[gekozen] : punten[punten.length - 1];

  function kies(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * breedte;
    let beste = 0;
    for (let i = 1; i < punten.length; i++) if (Math.abs(x(i) - px) < Math.abs(x(beste) - px)) beste = i;
    zetGekozen(beste);
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[22px] font-bold">
          {fmt(actief.waarde)}
          <span className="text-sm font-medium text-zacht"> {eenheid}</span>
        </span>
        <span className="text-xs text-zacht">{korteDatum(actief.datum)}</span>
      </div>
      <svg
        viewBox={`0 0 ${breedte} ${hoogte}`}
        className="w-full touch-none"
        role="img"
        aria-label="Grafiek"
        onPointerDown={kies}
        onPointerMove={(e) => e.buttons && kies(e)}
      >
        {lijnen.map((w) => (
          <g key={w}>
            <line x1={links} x2={breedte - rechts} y1={y(w)} y2={y(w)} stroke="var(--pace-rand)" strokeWidth="1" />
            <text x={links - 6} y={y(w) + 4} textAnchor="end" fontSize="10" fill="var(--pace-zacht)">
              {fmt(w)}
            </text>
          </g>
        ))}
        <text x={links} y={hoogte - 6} fontSize="10" fill="var(--pace-zacht)">
          {korteDatum(punten[0].datum)}
        </text>
        <text x={breedte - rechts} y={hoogte - 6} fontSize="10" textAnchor="end" fill="var(--pace-zacht)">
          {korteDatum(punten[punten.length - 1].datum)}
        </text>
        <defs>
          <linearGradient id={`vul-${kleurId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={kleur} stopOpacity="0.28" />
            <stop offset="100%" stopColor={kleur} stopOpacity="0" />
          </linearGradient>
        </defs>
        {punten.length > 1 && (
          <path
            d={`${pad} L${x(punten.length - 1).toFixed(1)},${hoogte - onder} L${x(0).toFixed(1)},${hoogte - onder} Z`}
            fill={`url(#vul-${kleurId})`}
          />
        )}
        <path d={pad} fill="none" stroke={kleur} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
        {punten.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.waarde)}
            r={p === actief ? 4.5 : punten.length > 30 ? 0 : 2.5}
            fill={p === actief ? kleur : 'var(--pace-kaart)'}
            stroke={kleur}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}
