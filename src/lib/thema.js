// Licht of donker. 'auto' volgt de instelling van je iPhone.
const SLEUTEL = 'pace-thema';
const KLEUR_BALK = { licht: '#f8fafc', donker: '#111827' };
const media = window.matchMedia('(prefers-color-scheme: dark)');

export function leesThemaKeuze() {
  try {
    return localStorage.getItem(SLEUTEL) || 'auto';
  } catch {
    return 'auto';
  }
}

function pasToe() {
  const keuze = leesThemaKeuze();
  const thema = keuze === 'auto' ? (media.matches ? 'donker' : 'licht') : keuze;
  document.documentElement.dataset.thema = thema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', KLEUR_BALK[thema]);
}

export function zetThemaKeuze(keuze) {
  try {
    localStorage.setItem(SLEUTEL, keuze);
  } catch {
    // niets aan te doen
  }
  pasToe();
}

export function startThema() {
  pasToe();
  media.addEventListener('change', pasToe);
}
