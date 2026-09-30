"use client";

import Link from "next/link";
import { useEffect } from "react";
import { btnPrimary, btnSecondary } from "@/components/ui";

/** Chyba při vykreslení stránky – nabídneme zkusit znovu, ať nikdo neskončí na bílé obrazovce. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[30px] font-bold tracking-tight">Něco se pokazilo</p>
      <p className="mt-2 text-[16px] text-muted">Zkus to prosím znovu. Když to nepomůže, zavři aplikaci a otevři ji znovu.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>
          Zkusit znovu
        </button>
        <Link href="/events" className={btnSecondary}>
          Na úvod
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-[12px] text-faint">Kód chyby: {error.digest}</p>}
    </main>
  );
}
