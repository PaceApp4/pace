// Hulpfuncties voor datums. Een datum bewaren we als tekst: '2026-11-11'.

export function alsTekst(d) {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, '0');
  const dag = String(d.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

export function alsDatum(tekst) {
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
  return korteDatum(tekst);
}

// 'wo 11 nov'
export function korteDatum(tekst) {
  return alsDatum(tekst).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// 'Woensdag 11 november'
export function langeDatum(tekst) {
  const t = alsDatum(tekst).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Tijdstip als '14:05'
export function klokTijd(ms) {
  return new Date(ms).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

// Seconden als '1:05:09' of '32:14'
export function duurTekst(seconden) {
  const s = Math.max(0, Math.floor(seconden));
  const u = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return u > 0 ? `${u}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

// Minuten als '7u 32m'
export function urenMinuten(minuten) {
  const m = Math.round(minuten || 0);
  return `${Math.floor(m / 60)}u ${String(m % 60).padStart(2, '0')}m`;
}
