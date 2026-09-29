"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { chip, iconButton } from "@/components/ui";

const ITEMS: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "Přehled", icon: "home", exact: true },
  { href: "/admin/events", label: "Akce", icon: "ticket" },
  { href: "/admin/users", label: "Uživatelé", icon: "users" },
  { href: "/admin/reports", label: "Nahlášení", icon: "flag" },
  { href: "/admin/team", label: "Tým", icon: "shield" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[12px] leading-none font-bold text-white">
      {count}
    </span>
  );
}

/** Navigace administrace: na počítači boční panel, na mobilu horní lišta se záložkami. */
export function AdminNav({ email, openReports }: { email: string; openReports: number }) {
  const pathname = usePathname();
  const isActive = (item: (typeof ITEMS)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <>
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-72 p-4 lg:block">
        <div className="glass flex h-full flex-col rounded-[28px] p-4">
          <Link href="/admin" className="px-2 pt-1">
            <Logo />
          </Link>
          <p className="mt-3 px-2 text-[12px] font-bold tracking-widest text-accent uppercase">Administrace</p>

          <nav className="mt-5 space-y-1">
            {ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition ${
                    active ? "glass-inner text-accent" : "border border-transparent text-ink/70 hover:bg-black/[0.04] hover:text-ink"
                  }`}
                >
                  <Icon name={item.icon} className="size-5" />
                  {item.label}
                  {item.href === "/admin/reports" && <CountBadge count={openReports} />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-line pt-4">
            <Link
              href="/events"
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold text-ink/70 transition hover:bg-black/[0.04] hover:text-ink"
            >
              <Icon name="back" className="size-5" /> Zpět do aplikace
            </Link>
            <p className="truncate px-3 text-[12px] text-muted">{email}</p>
          </div>
        </div>
      </aside>

      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/85 pt-safe backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 px-5 pt-1">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link href="/events" aria-label="Zpět do aplikace" className={iconButton}>
            <Icon name="x" className="size-5" />
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`${chip(isActive(item))} inline-flex shrink-0 items-center gap-1.5 !py-2 text-[14px]`}
            >
              {item.label}
              {item.href === "/admin/reports" && openReports > 0 && (
                <span className="rounded-full bg-white/90 px-1.5 text-[12px] font-bold text-accent">{openReports}</span>
              )}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
