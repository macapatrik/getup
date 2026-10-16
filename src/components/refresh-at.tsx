"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onResume } from "@/lib/realtime";

/**
 * Obnoví serverová data stránky v daný okamžik (např. otevření swipování), aby lidé s otevřenou appkou
 * nemuseli ručně obnovovat. Po návratu do appky (telefon odemčený, přepnutí zpět) zkontroluje znovu.
 */
export function RefreshAt({ at }: { at: string }) {
  const router = useRouter();

  useEffect(() => {
    const target = new Date(at).getTime();
    let interval: number | undefined;
    // Po čase obnovuje každých 5 s, dokud stránka tuhle komponentu nezahodí (tj. dokud server
    // ještě hlásí zavřeno) – pojistka, když hodiny v telefonu jdou napřed.
    const start = () => {
      router.refresh();
      interval ??= window.setInterval(() => router.refresh(), 5000);
    };
    const delay = target - Date.now() + 1500;
    const timer = delay < 2 ** 31 - 1 ? window.setTimeout(start, Math.max(0, delay)) : undefined;
    const off = onResume(() => {
      if (Date.now() >= target) start();
    });
    return () => {
      if (timer) window.clearTimeout(timer);
      if (interval) window.clearInterval(interval);
      off();
    };
  }, [at, router]);

  return null;
}
