import { useEffect, useRef, useState } from 'react';
import Venster from './Venster.jsx';
import Icoon from './Icoon.jsx';

// Scant een barcode met de camera (achterkant). Werkt ook om het nummer zelf in te typen.
export default function BarcodeScanner({ gevonden, sluit }) {
  const video = useRef(null);
  const [fout, zetFout] = useState('');
  const [handmatig, zetHandmatig] = useState('');
  const [bezig, zetBezig] = useState(true);

  useEffect(() => {
    let besturing = null;
    let gestopt = false;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const lezer = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 });
        besturing = await lezer.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } } },
          video.current,
          (resultaat) => {
            if (resultaat && !gestopt) {
              gestopt = true;
              besturing?.stop();
              if (navigator.vibrate) navigator.vibrate(60);
              gevonden(resultaat.getText());
            }
          }
        );
        if (gestopt) besturing.stop();
        zetBezig(false);
      } catch (e) {
        zetBezig(false);
        zetFout(
          e?.name === 'NotAllowedError'
            ? 'Geen toegang tot de camera. Sta dit toe bij Instellingen › Safari › Camera, of typ het nummer hieronder.'
            : 'De camera kon niet starten. Typ het nummer onder de barcode hieronder.'
        );
      }
    }
    start();
    return () => {
      gestopt = true;
      besturing?.stop();
    };
  }, []);

  return (
    <Venster titel="Barcode scannen" sluit={sluit}>
      <div className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-black">
          <video ref={video} className="h-full w-full object-cover" playsInline muted autoPlay />
          {!fout && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-28 w-[78%] rounded-[14px] border-2 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
              <div className="absolute h-0.5 w-[70%] animate-pulse bg-[#22c55e]" />
            </div>
          )}
          {bezig && <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Camera starten…</div>}
        </div>
        {fout ? (
          <p className="rounded-[12px] bg-vlak p-3 text-sm">{fout}</p>
        ) : (
          <p className="text-center text-sm text-zacht">Houd de barcode in het kader. Het scannen gaat vanzelf.</p>
        )}
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Barcode</span>
            <input
              inputMode="numeric"
              placeholder="Of typ het nummer"
              className="h-12 w-full rounded-[12px] border border-rand bg-kaart px-3 outline-none focus:border-primair"
              value={handmatig}
              onChange={(e) => zetHandmatig(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <button
            className="knop flex h-12 items-center gap-1.5 rounded-[12px] bg-primair px-4 font-semibold text-op-primair disabled:opacity-40"
            disabled={handmatig.length < 8}
            onClick={() => gevonden(handmatig)}
          >
            <Icoon naam="zoek" grootte={18} />
            Zoek
          </button>
        </div>
      </div>
    </Venster>
  );
}
