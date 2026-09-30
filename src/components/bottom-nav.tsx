"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { Logo } from "./logo";

type NavItem = { href: string; label: string; icon: IconName; match: string[] };

// Pět záložek jako u Romio: domů (akce), swipování, matche, zprávy, účet.
const ITEMS: NavItem[] = [
  { href: "/events", label: "Akce", icon: "home", match: ["/events"] },
  { href: "/swipe", label: "Swipování", icon: "compass", match: ["/swipe", "/e/"] },
  { href: "/matches", label: "Matche", icon: "heartOutline", match: ["/matches"] },
  { href: "/messages", label: "Zprávy", icon: "chat", match: ["/messages"] },
  { href: "/profile", label: "Můj účet", icon: "user", match: ["/profile"] },
];

// Čistě zákaznická navigace – administrace týmu je jen na /admin a odsud na ni nic neodkazuje.
function useNav() {
  const pathname = usePathname();
  return { pathname, items: ITEMS, isActive: (item: NavItem) => item.match.some((m) => pathname.startsWith(m)) };
}

/** Spodní lišta (telefon a tablet): jen ikony, aktivní je růžová s tečkou. */
export function BottomNav() {
  const { pathname, items, isActive } = useNav();
  // V chatu lištu schováme, aby bylo víc místa pro zprávy.
  if (/^\/matches\/[^/]+/.test(pathname)) return null;

  return (
    <nav className="no-print bar fixed inset-x-0 bottom-0 z-30 lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 pt-3 pb-safe">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 px-3 py-0.5 transition active:scale-90 ${active ? "text-accent" : "text-ink"}`}
              >
                <Icon name={item.icon} className="size-6" />
                <span className={`size-2 rounded-full ${active ? "bg-accent" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Boční panel na počítači (webový portál) */
export function SideNav() {
  const { items, isActive } = useNav();

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 border-r-2 border-fill bg-white p-5 lg:block">
      <Link href="/events" className="px-2 pt-1">
        <Logo tagline />
      </Link>
      <nav className="mt-8 space-y-1">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[16px] font-semibold transition ${
                active ? "fill-accent-soft" : "text-ink hover:bg-fill"
              }`}
            >
              <Icon name={item.icon} className="size-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="absolute right-5 bottom-6 left-5 text-[12px] leading-snug text-muted">
        Seznamka pro návštěvníky akcí GetUp. Tvoje data vidíš jen ty.
      </p>
    </aside>
  );
}
