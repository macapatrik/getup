"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { APP_NAME, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { WebLink } from "./link";

const NAV = [
  { href: "/akce", label: "Akce" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Hlavička webu get-up.fun: logo, navigace, odkaz na seznamku a na nejbližší akci. Na mobilu rozbalovací menu. */
export function WebHeader({ cta }: { cta: { href: string; label: string } | null }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-night/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <WebLink href="/" className="flex items-center" aria-label="GetUp, úvodní stránka" onClick={() => setOpen(false)}>
          <img src="/web/getup-logo.png" alt="GetUp" className="h-9 w-auto" />
        </WebLink>
        <nav className="hidden items-center gap-7 text-[13px] font-bold tracking-[0.16em] text-white/60 uppercase md:flex">
          {NAV.map((item) => (
            <WebLink key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </WebLink>
          ))}
          <a href={SITE_URL} className="inline-flex items-center gap-1.5 text-accent transition hover:text-white">
            <Icon name="heart" className="size-4" /> {APP_NAME}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {cta && (
            <WebLink href={cta.href} className="gu-btn inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[14px] font-bold transition active:scale-[0.97]">
              <Icon name="ticket" className="size-4" /> <span className="hidden sm:inline">{cta.label}</span>
              <span className="sm:hidden">Akce</span>
            </WebLink>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            className="hw-surface grid size-10 place-items-center rounded-[12px] text-white md:hidden"
          >
            <Icon name={open ? "x" : "dots"} className="size-5" />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/5 bg-night/95 px-4 py-4 md:hidden">
          <ul className="space-y-1 text-[17px] font-bold">
            <li>
              <WebLink href="/" onClick={() => setOpen(false)} className="block rounded-[12px] px-3 py-3 hover:bg-white/5">
                Domů
              </WebLink>
            </li>
            {NAV.map((item) => (
              <li key={item.href}>
                <WebLink href={item.href} onClick={() => setOpen(false)} className="block rounded-[12px] px-3 py-3 hover:bg-white/5">
                  {item.label}
                </WebLink>
              </li>
            ))}
            <li>
              <a href={SITE_URL} className="flex items-center gap-2 rounded-[12px] px-3 py-3 text-accent hover:bg-white/5">
                <Icon name="heart" className="size-5" /> {APP_NAME}: seznamka z akce
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-[12px] px-3 py-3 hover:bg-white/5">
                <Icon name="instagram" className="size-5" /> Instagram
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
