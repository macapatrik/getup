import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./logo";
import { largeTitle } from "./ui";

/** Obal právních stránek: logo, nadpis, prostý text v kartě. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-5 pt-safe pb-16">
      <header className="flex items-center justify-between pt-3">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/login" className="glass rounded-full px-4 py-2 text-[15px] font-semibold">
          Přihlásit se
        </Link>
      </header>
      <h1 className={`${largeTitle} mt-10`}>{title}</h1>
      <p className="mt-2 text-[14px] text-muted">Platné od {updated}</p>
      <article className="glass mt-6 rounded-[20px] px-5 py-2 text-[16px] leading-relaxed [&_h2]:mt-6 [&_h2]:mb-1.5 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-bold [&_li]:mt-1 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:font-semibold [&_a]:underline">
        {children}
      </article>
      <p className="mt-6 text-center text-[13px] text-muted">
        <Link href="/podminky" className="underline">
          Podmínky užití
        </Link>{" "}
        ·{" "}
        <Link href="/soukromi" className="underline">
          Ochrana soukromí
        </Link>
      </p>
    </main>
  );
}
