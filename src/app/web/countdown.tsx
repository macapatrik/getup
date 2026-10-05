"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { key: "d", one: "den", few: "dny", many: "dní" },
  { key: "h", one: "hodina", few: "hodiny", many: "hodin" },
  { key: "m", one: "minuta", few: "minuty", many: "minut" },
  { key: "s", one: "sekunda", few: "sekundy", many: "sekund" },
] as const;

const plural = (n: number, u: (typeof UNITS)[number]) => (n === 1 ? u.one : n >= 2 && n <= 4 ? u.few : u.many);

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(total / 86_400), h: Math.floor((total % 86_400) / 3_600), m: Math.floor((total % 3_600) / 60), s: total % 60 };
}

/** Odpočet do začátku akce (web get-up.fun). Na serveru pomlčky, čas doplní prohlížeč. */
export function Countdown({ target, liveText, className = "" }: { target: string; liveText: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    queueMicrotask(() => setNow(Date.now()));
    return () => clearInterval(id);
  }, []);

  const remaining = now === null ? null : new Date(target).getTime() - now;
  if (remaining !== null && remaining <= 0) {
    return (
      <p className={`font-display text-[28px] text-white uppercase ${className}`} aria-live="polite">
        {liveText}
      </p>
    );
  }
  const parts = remaining === null ? null : split(remaining);
  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`} role="timer" aria-label="Odpočet do začátku akce">
      {UNITS.map((u) => {
        const value = parts ? parts[u.key] : null;
        return (
          <div key={u.key} className="hw-surface flex min-w-[64px] flex-1 flex-col items-center rounded-[12px] px-2 py-2.5 sm:min-w-[84px] sm:py-3">
            <span className="font-display text-[32px] leading-none text-white tabular-nums sm:text-[42px]">
              {value === null ? "--" : String(value).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-[11px] font-bold tracking-[0.18em] text-white/60 uppercase">{value === null ? u.many : plural(value, u)}</span>
          </div>
        );
      })}
    </div>
  );
}
