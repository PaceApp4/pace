// Hulpfuncties voor datums. Een datum bewaren we als tekst: '2026-11-11'.

function alsTekst(d) {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, '0');
  const dag = String(d.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

function alsDatum(tekst) {
  const [jaar, maand, dag] = tekst.split('-').map(Number);
  return new Date(jaar, maand - 1, dag);
}

export function vandaag() {
  return alsTekst(new Date());
}

// verschuif('2026-11-11', -1) geeft '2026-11-10'
export function verschuif(tekst, dagen) {
  const d = alsDatum(tekst);
  d.setDate(d.getDate() + dagen);
  return alsTekst(d);
}

// Leesbare naam: 'Vandaag', 'Gisteren' of 'wo 11 nov'
export function mooieDatum(tekst) {
  const nu = vandaag();
  if (tekst === nu) return 'Vandaag';
  if (tekst === verschuif(nu, -1)) return 'Gisteren';
  if (tekst === verschuif(nu, 1)) return 'Morgen';
  return alsDatum(tekst).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
