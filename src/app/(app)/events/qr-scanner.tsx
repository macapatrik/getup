"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { btnPrimary, btnSecondary } from "@/components/ui";

const CODE_RE = /^[A-Z0-9]{4,12}$/;

/** Z obsahu QR kódu vytáhne kód akce: odkaz …/j/KÓD, nebo rovnou KÓD. */
export function codeFromQr(text: string): string | null {
  const trimmed = text.trim();
  const link = trimmed.match(/\/j\/([A-Za-z0-9]{4,12})(?:[/?#]|$)/);
  if (link) return link[1].toUpperCase();
  const plain = trimmed.toUpperCase();
  return CODE_RE.test(plain) ? plain : null;
}

// Rychlá nativní detekce (Chrome/Android); jinde se donačte jsQR.
type Detector = { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> };
type DetectorWindow = Window & { BarcodeDetector?: new (options: { formats: string[] }) => Detector };

function nativeDetector(): Detector | null {
  try {
    const Ctor = (window as DetectorWindow).BarcodeDetector;
    return Ctor ? new Ctor({ formats: ["qr_code"] }) : null;
  } catch {
    return null;
  }
}

/** Tlačítko „Naskenovat QR kód“ – otevře foťák přímo v aplikaci. `compact` = jen ikona do hlavičky. */
export function QrScanButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Naskenovat QR kód"
          className="grid size-10 place-items-center text-ink transition active:scale-90"
        >
          <Icon name="qr" className="size-6" />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${btnPrimary} w-full`}>
          <Icon name="camera" className="size-5" /> Naskenovat QR kód
        </button>
      )}
      {open && <Scanner onClose={() => setOpen(false)} />}
    </>
  );
}

function Scanner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    let lastScan = 0;
    const detector = nativeDetector();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let jsqr: typeof import("jsqr").default | null = null;

    function stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    }

    async function readFrame(v: HTMLVideoElement): Promise<string | null> {
      if (detector) return (await detector.detect(v))[0]?.rawValue ?? null;
      if (!ctx) return null;
      const scale = Math.min(1, 640 / v.videoWidth);
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      jsqr ??= (await import("jsqr")).default;
      return jsqr(image.data, image.width, image.height, { inversionAttempts: "dontInvert" })?.data ?? null;
    }

    async function scan(now: number) {
      if (stopped) return;
      const v = video.current;
      if (v && v.readyState >= 2 && v.videoWidth > 0 && now - lastScan > 120) {
        lastScan = now;
        let text: string | null = null;
        try {
          text = await readFrame(v);
        } catch {
          // snímek se nepovedlo přečíst – zkusíme další
        }
        const code = text ? codeFromQr(text) : null;
        if (code) {
          setFound(code);
          stop();
          router.push(`/j/${code}`);
          return;
        }
      }
      frame = requestAnimationFrame(scan);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (stopped || !video.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.current.srcObject = stream;
        await video.current.play();
        frame = requestAnimationFrame(scan);
      } catch (e) {
        const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
        setError(
          denied
            ? "Bez přístupu k foťáku to nejde. Povol ho v nastavení, nebo opiš kód ručně."
            : "Foťák se nepodařilo spustit. Opiš kód ručně.",
        );
      }
    })();

    return stop;
  }, [router]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Skenování QR kódu">
      <video ref={video} playsInline muted autoPlay className="absolute inset-0 size-full object-cover" />

      {/* Rámeček – ztmavené okolí, průhledný střed */}
      {!error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="size-[68vw] max-w-[320px] rounded-[32px] border-2 border-white/90 shadow-[0_0_0_100vmax_rgb(0_0_0/0.45)]" />
        </div>
      )}

      <div className="relative flex items-center justify-between px-5 pt-safe">
        <p className="mt-2 text-[17px] font-semibold">{found ? "Připojuji…" : "Namiř na QR kód akce"}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="mt-2 grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur"
        >
          <Icon name="x" className="size-5" />
        </button>
      </div>

      <div className="relative mt-auto px-6 pb-safe text-center">
        {error ? (
          <div className="mb-4 rounded-[16px] bg-white/10 p-4 backdrop-blur">
            <p className="text-[15px] leading-snug">{error}</p>
            <button type="button" onClick={onClose} className={`${btnSecondary} mt-3 !bg-white !text-ink`}>
              Opsat kód
            </button>
          </div>
        ) : (
          <p className="mb-4 text-[14px] text-white/80">QR kód je u vstupu, na baru nebo na vstupence od GetUp.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
