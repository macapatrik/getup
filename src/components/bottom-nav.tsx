"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { Logo } from "./logo";

type NavItem = { href: string; label: string; icon: IconName; match: string[] };

const ITEMS: NavItem[] = [
  { href: "/events", label: "Akce", icon: "ticket", match: ["/events", "/e/"] },
  { href: "/matches", label: "Matche", icon: "chat", match: ["/matches"] },
  { href: "/profile", label: "Účet", icon: "user", match: ["/profile"] },
];

// Čistě zákaznická navigace – administrace týmu je jen na /admin a odsud na ni nic neodkazuje.
function useNav() {
  const pathname = usePathname();
  return { pathname, items: ITEMS, isActive: (item: NavItem) => item.match.some((m) => pathname.startsWith(m)) };
}

// Plovoucí skleněná lišta ve stylu iOS 26 (telefon a tablet)
export function BottomNav() {
  const { pathname, items, isActive } = useNav();
  // V chatu lištu schováme, aby bylo víc místa pro zprávy.
  if (/^\/matches\/[^/]+/.test(pathname)) return null;

  return (
    <nav className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-safe lg:hidden">
      <ul className="glass-bar pointer-events-auto mx-auto mb-1 flex max-w-sm gap-1 rounded-full p-1.5">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition ${
                  active ? "glass-inner text-ink" : "border border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                <Icon name={item.icon} className="size-[26px]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Boční panel na počítači (webový portál)
export function SideNav() {
  const { items, isActive } = useNav();

  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 p-4 lg:block">
      <div className="glass flex h-full flex-col rounded-[20px] p-4">
        <Link href="/events" className="px-2 pt-1">
          <Logo />
        </Link>
        <nav className="mt-8 space-y-1">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[15px] font-semibold transition ${
                  active ? "glass-inner text-ink" : "border border-transparent text-ink/70 hover:bg-black/[0.04] hover:text-ink"
                }`}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label === "Účet" ? "Můj účet" : item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-3 text-[12px] leading-snug text-muted">Seznamka pro návštěvníky akcí GetUp. Tvoje data vidíš jen ty.</p>
      </div>
    </aside>
  );
}
