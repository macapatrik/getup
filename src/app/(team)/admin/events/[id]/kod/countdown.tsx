"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Odpočet do změny kódu; po změně a každých 20 s (počet ověřených lidí) obnoví stránku. */
export function Countdown({ changesAt }: { changesAt: string }) {
  const router = useRouter();
  const target = new Date(changesAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const poll = window.setInterval(() => router.refresh(), 20_000);
    const change = window.setTimeout(() => router.refresh(), Math.max(0, target - Date.now()) + 1000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(poll);
      window.clearTimeout(change);
    };
  }, [target, router]);

  const left = Math.max(0, Math.round((target - now) / 1000));
  return (
    <p suppressHydrationWarning className="mt-3 text-[clamp(14px,1.8vw,24px)] font-semibold text-ash tabular-nums">
      Nový kód za {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
    </p>
  );
}
