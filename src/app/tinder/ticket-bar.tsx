"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

/** Mobil: tlačítko na vstupenky přilepené dole, vyjede až po odscrollování úvodu (tam už tlačítko je). */
export function TicketBar({ href, label, watch }: { href: string; label: string; watch: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(watch);
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), { threshold: 0.12 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [watch]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-plum via-plum/90 to-plum/0 p-3 pb-safe transition-transform duration-300 md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!shown}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener"
        tabIndex={shown ? 0 : -1}
        className="tp-pink flex items-center justify-center gap-2 rounded-[12px] py-3.5 text-[17px] font-bold"
      >
        <Icon name="ticket" className="size-5" /> {label}
      </a>
    </div>
  );
}
