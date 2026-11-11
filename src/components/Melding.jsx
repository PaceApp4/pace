import { useRef, useState } from 'react';

// Korte melding onderin het scherm. Gebruik: const [melding, toon] = useMelding();
export function useMelding() {
  const [tekst, zetTekst] = useState('');
  const timer = useRef(null);
  function toon(nieuw) {
    zetTekst(nieuw);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => zetTekst(''), 3500);
  }
  const element = tekst ? (
    <div
      role="status"
      className="animatie-vervaag fixed inset-x-4 bottom-28 z-[60] mx-auto w-fit max-w-sm rounded-[12px] border border-rand bg-kaart px-4 py-3 text-sm font-semibold"
    >
      {tekst}
    </div>
  ) : null;
  return [element, toon];
}
