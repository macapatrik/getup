"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const UNITS = [
  { key: "d", one: "den", few: "dny", many: "dní", fill: "#f759f5" },
  { key: "h", one: "hodina", few: "hodiny", many: "hodin", fill: "#2ee7ff" },
  { key: "m", one: "minuta", few: "minuty", many: "minut", fill: "#c6ff3d" },
  { key: "s", one: "sekunda", few: "sekundy", many: "sekund", fill: "#ffd23f" },
] as const;

const plural = (n: number, u: (typeof UNITS)[number]) => (n === 1 ? u.one : n >= 2 && n <= 4 ? u.few : u.many);

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(total / 86_400), h: Math.floor((total % 86_400) / 3_600), m: Math.floor((total % 3_600) / 60), s: total % 60 };
}

/** Odpočet do začátku akce: čtyři barevné samolepky. Na serveru pomlčky, čas doplní prohlížeč. */
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
      <p className={`font-party gu-rainbow text-[28px] uppercase ${className}`} aria-live="polite">
        {liveText}
      </p>
    );
  }
  const parts = remaining === null ? null : split(remaining);
  return (
    <div className={`flex gap-3 sm:gap-4 ${className}`} role="timer" aria-label="Odpočet do začátku akce">
      {UNITS.map((u, i) => {
        const value = parts ? parts[u.key] : null;
        return (
          <div
            key={u.key}
            className="flex min-w-[64px] flex-1 flex-col items-center rounded-[18px] border-[3px] border-white px-2 py-2.5 text-party shadow-[5px_5px_0_rgb(20_10_46/0.9)] sm:min-w-[84px] sm:py-3"
            style={{ background: u.fill, transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` } as CSSProperties}
          >
            <span className="font-party text-[30px] leading-none tabular-nums sm:text-[40px]">{value === null ? "--" : String(value).padStart(2, "0")}</span>
            <span className="mt-1.5 text-[11px] font-extrabold tracking-[0.14em] uppercase">{value === null ? u.many : plural(value, u)}</span>
          </div>
        );
      })}
    </div>
  );
}
