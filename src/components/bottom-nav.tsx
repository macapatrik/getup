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

export function BottomNav({ organizer }: { organizer: boolean }) {
  const pathname = usePathname();
  // V chatu nav schováme, aby bylo víc místa pro zprávy.
  if (/^\/matches\/[^/]+/.test(pathname)) return null;

  const items = organizer ? [...ITEMS, ADMIN_ITEM] : ITEMS;

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-night/90 pb-safe backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = item.match.some((m) => pathname.startsWith(m));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 pt-2.5 pb-1 text-xs font-medium transition ${
                  active ? "text-white" : "text-muted hover:text-white"
                }`}
              >
                <Icon name={item.icon} className={`size-6 ${active ? "text-accent" : ""}`} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
