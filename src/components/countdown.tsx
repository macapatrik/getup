"use client";

import { useEffect, useState } from "react";

/** Zbývající milisekundy do `deadline` (ISO), každou vteřinu znovu; před načtením v prohlížeči null (ať sedí hydratace). */
export function useCountdown(deadline: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!deadline) return;
    const end = new Date(deadline).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return deadline ? left : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Odpočet do konce hlasování: velké hodiny h:mm:ss */
export function CountdownClock({ left }: { left: number }) {
  const total = Math.ceil(left / 1000);
  const parts = [
    Math.floor(total / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ];
  const labels = ["hod", "min", "s"];
  return (
    <div
      className="flex items-start justify-center gap-2"
      role="timer"
      aria-live="off"
    >
      {parts.map((value, i) => (
        <div key={labels[i]} className="flex items-start gap-2">
          {i > 0 && (
            <span className="pt-1 text-[30px] leading-none font-black text-blood">
              :
            </span>
          )}
          <div className="text-center">
            <span className="block min-w-[2.4ch] rounded-[12px] bg-white/[0.06] px-2 py-1.5 text-[34px] leading-none font-black tabular-nums">
              {pad(value)}
            </span>
            <span className="mt-1 block text-[11px] font-bold tracking-[0.14em] text-ash uppercase">
              {labels[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
