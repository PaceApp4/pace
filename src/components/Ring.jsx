// Een voortgangsring. De inhoud (children) komt in het midden te staan.
// Boven 100% kleurt de ring rood (over doel).
export default function Ring({ waarde, doel, grootte = 160, dikte = 12, kleur, children, overKleur, spoor = 'var(--pace-spoor)' }) {
  const straal = (grootte - dikte) / 2;
  const omtrek = 2 * Math.PI * straal;
  const deel = doel > 0 ? Math.min(waarde / doel, 1) : 0;
  const isOver = overKleur && doel > 0 && waarde > doel;

  return (
    <div className="relative shrink-0" style={{ width: grootte, height: grootte }}>
      <svg width={grootte} height={grootte} className="-rotate-90" aria-hidden="true">
        <circle
          cx={grootte / 2}
          cy={grootte / 2}
          r={straal}
          fill="none"
          stroke={spoor}
          strokeWidth={dikte}
        />
        <circle
          cx={grootte / 2}
          cy={grootte / 2}
          r={straal}
          fill="none"
          stroke={isOver ? overKleur : kleur}
          strokeWidth={dikte}
          strokeLinecap="round"
          strokeDasharray={omtrek}
          strokeDashoffset={omtrek * (1 - deel)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
