import Link from "next/link";
import Script from "next/script";
import { Icon } from "@/components/icons";
import { WEB_URL } from "@/lib/config";
import { OPERATOR } from "@/lib/legal";
import { HalloweenContent, ticketLink } from "./content";
import { EVENT } from "./event";
import { TicketBar } from "./ticket-bar";

// Kampaňová stránka k Halloweenu: hlavička s navigací, obsah (./content.tsx), patička a spodní lišta se vstupenkami.

const NAV = [
  { href: "#lineup", label: "Line-up" },
  { href: "#kostymy", label: "Kostýmy" },
  { href: "#seznamka", label: "Seznamka" },
  { href: "#info", label: "Info" },
];

export default function HalloweenPage() {
  return (
    <div className="pb-20 md:pb-0">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-night/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href={WEB_URL} className="font-metal text-[26px] leading-none tracking-wide text-bone">
            GET<span className="text-ember">UP</span>
          </a>
          <nav className="hidden gap-7 text-[13px] font-bold tracking-[0.16em] text-ash uppercase md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-bone">
                {item.label}
              </a>
            ))}
          </nav>
          <a {...ticketLink} className="hw-red inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[14px] font-bold transition active:scale-[0.97]">
            <Icon name="ticket" className="size-4" /> Vstupenky
          </a>
        </div>
      </header>

      <HalloweenContent />

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-[13px] text-ash sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            <span className="font-metal text-[22px] text-bone">
              GET<span className="text-ember">UP</span>
            </span>
            <span className="ml-3">Párty a akce v Českých Budějovicích</span>
          </p>
          <nav className="flex flex-wrap justify-center gap-5 font-semibold">
            <a href={EVENT.instagram} target="_blank" rel="noopener" className="transition hover:text-bone">
              Instagram
            </a>
            <a href={`mailto:${OPERATOR.email}`} className="transition hover:text-bone">
              {OPERATOR.email}
            </a>
            <Link href="/podminky" className="transition hover:text-bone">
              Podmínky
            </Link>
            <Link href="/soukromi" className="transition hover:text-bone">
              Soukromí
            </Link>
          </nav>
        </div>
      </footer>

      {/* Galerie v překryvu, ovládá public/halloween/gallery.js */}
      <Script src="/halloween/gallery.js" strategy="afterInteractive" />

      <TicketBar href={EVENT.ticketsUrl} label={`Koupit vstupenku · ${EVENT.dateLabel}`} watch="top" />
    </div>
  );
}
