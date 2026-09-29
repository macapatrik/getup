"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const ITEMS: { href: string; label: string; icon: IconName; match: string[] }[] = [
  { href: "/events", label: "Akce", icon: "ticket", match: ["/events", "/e/"] },
  { href: "/matches", label: "Matche", icon: "chat", match: ["/matches"] },
  { href: "/profile", label: "Profil", icon: "user", match: ["/profile"] },
];

const ADMIN_ITEM = { href: "/admin", label: "GetUp", icon: "qr" as const, match: ["/admin"] };

// Plovoucí skleněná lišta ve stylu iOS 26
export function BottomNav({ organizer }: { organizer: boolean }) {
  const pathname = usePathname();
  // V chatu lištu schováme, aby bylo víc místa pro zprávy.
  if (/^\/matches\/[^/]+/.test(pathname)) return null;

  const items = organizer ? [...ITEMS, ADMIN_ITEM] : ITEMS;

  return (
    <nav className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-30 px-5 pb-safe">
      <ul className="glass pointer-events-auto mx-auto mb-1 flex max-w-sm gap-1 rounded-full p-1.5">
        {items.map((item) => {
          const active = item.match.some((m) => pathname.startsWith(m));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold transition ${
                  active ? "bg-white text-accent shadow-[0_2px_10px_rgb(0_0_0/0.08)]" : "text-ink/60 hover:text-ink"
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
