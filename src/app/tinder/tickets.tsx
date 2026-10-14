"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME } from "@/lib/config";

const SCRIPT = "https://cdn.eventlook.cz/eventlook.js";

type EventlookGlobal = {
  mount: (target: Element | string, options: Record<string, unknown>) => void;
  unmount?: (target: Element | string) => void;
};

declare global {
  interface Window {
    Eventlook?: EventlookGlobal;
  }
}

/** Jednou vložený skript Eventlooku; další volání jen počkají na totéž načtení. */
function loadEventlook() {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.Eventlook) return Promise.resolve(window.Eventlook);
  return new Promise<EventlookGlobal>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
    const done = () => (window.Eventlook ? resolve(window.Eventlook) : reject(new Error("Eventlook se nenačetl")));
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("Eventlook se nenačetl")), { once: true });
  });
}

/**
 * Prodej vstupenek přímo na stránce (vložený formulář Eventlooku, příručka cdn.eventlook.cz/docs/embed-guide-cs.pdf).
 * Platební brána vrátí návštěvníka zpět sem, skript si z adresy přečte id platby a ukáže potvrzení; pod formulářem
 * je hned vstup do GetCrush, aby si člověk s lístkem v ruce rovnou založil profil.
 */
export function Tickets({ slug, joinHref, fallbackUrl }: { slug: string; joinHref: string; fallbackUrl: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // Po návratu z platební brány má adresa parametry: odscrollujeme na formulář s potvrzením a zvýrazníme vstup do appky.
  const [returned, setReturned] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let cancelled = false;
    loadEventlook()
      .then((eventlook) => {
        if (cancelled) return;
        eventlook.mount(el, {
          event: slug,
          lang: "cs",
          theme: { mode: "dark", primaryColor: "#f759f5", background: "#130611", paper: "#1f0a1b", radius: 12 },
          stickyHeaderTop: 64,
          autoscrollAfterViewChange: true,
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      window.Eventlook?.unmount?.(el);
    };
  }, [slug]);

  useEffect(() => {
    if (window.location.search.length <= 1) return;
    const timer = window.setTimeout(() => {
      setReturned(true);
      document.getElementById("vstupenky")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="tp-surface rounded-[16px] p-2 sm:p-4">
        <div ref={box} className="min-h-[320px]" />
        {failed && (
          <div className="p-4 text-center">
            <p className="text-[15px] text-white/80">Formulář se nepodařilo načíst. Vstupenky koupíš přímo na Eventlooku.</p>
            <a href={fallbackUrl} target="_blank" rel="noopener" className="tp-pink mt-4 inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[16px] font-bold">
              <Icon name="ticket" className="size-5" /> Koupit na Eventlook.cz
            </a>
          </div>
        )}
      </div>

      <aside
        className={`tp-surface self-start rounded-[16px] p-6 transition-shadow lg:sticky lg:top-24 ${
          returned ? "shadow-[0_0_0_2px_#f759f5,0_24px_60px_-20px_rgb(247_89_245/0.8)]" : ""
        }`}
      >
        <p className="text-[13px] font-bold tracking-[0.22em] text-accent uppercase">{returned ? "Lístek máš" : "Po koupi lístku"}</p>
        <h3 className="font-display mt-2 text-[32px] leading-[0.95] text-white uppercase">Udělej si profil v {APP_NAME}</h3>
        <ol className="mt-4 space-y-2 text-[15px] leading-snug text-white/80">
          <li>1. Klikni na tlačítko, zadej e-mail a opiš kód.</li>
          <li>2. Přidej fotku a kontakt (Instagram, Snapchat nebo telefon).</li>
          <li>3. V pátek ve 22:00 uvidíš, kdo je na party s tebou.</li>
        </ol>
        <a href={joinHref} className="tp-pink mt-5 flex items-center justify-center gap-2 rounded-[12px] py-3.5 text-[17px] font-bold transition active:scale-[0.97]">
          <LogoMark className="size-5" /> Vstup do {APP_NAME}
        </a>
        <p className="mt-3 text-center text-[12px] text-white/50">Zdarma, jen pro lidi z akce, 18+.</p>
      </aside>
    </div>
  );
}
