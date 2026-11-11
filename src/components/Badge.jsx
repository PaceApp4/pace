import Icoon from './Icoon.jsx';

// Gekleurd icoonvlakje, bijv. <Badge icoon="druppel" kleur="var(--pace-water)" />
export default function Badge({ icoon, kleur, grootte = 34, icoonGrootte = 18 }) {
  return (
    <span className="badge" style={{ '--tint': kleur, width: grootte, height: grootte }}>
      <Icoon naam={icoon} grootte={icoonGrootte} />
    </span>
  );
}
