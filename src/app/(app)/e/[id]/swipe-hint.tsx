"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { btnPrimary } from "@/components/ui";

const HINT_KEY = "gt-swipe-hint"; // v localStorage: návod ke swipování už člověk na tomhle zařízení viděl
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function seenHint() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false; // bez úložiště se návod ukáže pokaždé, nevadí
  }
}

/** Jestli ukázat návod (jen poprvé na zařízení) a jak ho zavřít. Na serveru se neukazuje. */
export function useSwipeHint(enabled: boolean) {
  const seen = useSyncExternalStore(subscribe, seenHint, () => true);
  return {
    show: enabled && !seen,
    dismiss() {
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        // nic – příště se ukáže znovu
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const badge = "fill-accent absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full shadow-none";

/** Návod při prvním swipování: kartu stačí táhnout, tlačítka dole dělají to samé. */
export function SwipeHint({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Jak swipovat"
    >
      <div className="surface w-full max-w-sm animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)] rounded-[32px] p-6 text-center">
        {/* Malá karta, která se sama houpe doprava (srdce) a doleva (křížek) */}
        <div className="relative mx-auto flex h-44 w-full items-center justify-center overflow-hidden">
          <span className={`${badge} left-1 animate-[swipe-demo-nope_3.6s_ease-in-out_infinite]`} aria-hidden>
            <Icon name="x" className="size-5" />
          </span>
          <span className={`${badge} right-1 animate-[swipe-demo-like_3.6s_ease-in-out_infinite]`} aria-hidden>
            <Icon name="heart" className="size-5" />
          </span>
          <div
            className="relative h-36 w-24 animate-[swipe-demo_3.6s_ease-in-out_infinite] overflow-hidden rounded-[16px] bg-gradient-to-br from-accent-soft via-[#e6c9ff] to-indigo/70 shadow-[0_18px_40px_-18px_rgb(62_54_237/0.5)]"
            aria-hidden
          >
            <div className="photo-fade absolute inset-x-0 bottom-0 h-1/2" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
              <span className="block h-2.5 w-14 rounded-full bg-white/90" />
              <span className="block h-2 w-9 rounded-full bg-white/60" />
            </div>
          </div>
        </div>

        <h2 className="mt-2 text-[24px] leading-tight font-bold">Stačí táhnout</h2>
        <p className="mt-2 text-[15px] leading-snug text-muted">
          Kartu přetáhni doprava, když se ti někdo líbí, a doleva, když ne. Tlačítka dole dělají to samé. Klepnutím na
          kartu otevřeš celý profil.
        </p>
        <button type="button" onClick={onClose} className={`${btnPrimary} mt-5 w-full py-3.5`}>
          Jasně, jdu na to
        </button>
      </div>
    </div>,
    document.body,
  );
}
