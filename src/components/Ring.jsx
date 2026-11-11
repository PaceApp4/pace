// Een voortgangsring. De inhoud (children) komt in het midden te staan.
export default function Ring({
  waarde,
  doel,
  grootte = 160,
  dikte = 14,
  kleur = '#8b5cf6',
  achtergrond = '#ede9fe',
  children,
}) {
  const straal = (grootte - dikte) / 2;
  const omtrek = 2 * Math.PI * straal;
  const deel = doel > 0 ? Math.min(waarde / doel, 1) : 0;

  return (
    <div className="relative shrink-0" style={{ width: grootte, height: grootte }}>
      <svg width={grootte} height={grootte} className="-rotate-90">
        <circle
          cx={grootte / 2}
          cy={grootte / 2}
          r={straal}
          fill="none"
          stroke={achtergrond}
          strokeWidth={dikte}
        />
        <circle
          cx={grootte / 2}
          cy={grootte / 2}
          r={straal}
          fill="none"
          stroke={kleur}
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
