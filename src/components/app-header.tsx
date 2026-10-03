import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/config";
import { Icon } from "./icons";
import { Logo } from "./logo";

/** Hlavní hlavička záložek (logo vlevo, akce vpravo). Na počítači je logo v bočním panelu. */
export function AppHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b-2 border-fill bg-white px-4 pt-safe pb-2.5 lg:hidden">
      <Link href="/events" aria-label={APP_NAME}>
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        {right ?? (
          <Link href="/profile" aria-label="Můj účet" className="grid size-10 place-items-center text-ink transition active:scale-90">
            <Icon name="settings" className="size-6" />
          </Link>
        )}
      </div>
    </header>
  );
}

/** Hlavička podstránky: šipka zpět, titulek, akce vpravo. */
export function BackHeader({
  href,
  title,
  subtitle,
  right,
}: {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="no-print sticky top-0 z-20 flex items-center gap-1 border-b-2 border-fill bg-white px-2 pt-safe pb-2.5 lg:static lg:border-0 lg:pt-0">
      <Link href={href} aria-label="Zpět" className="grid size-10 shrink-0 place-items-center text-ink transition active:scale-90">
        <Icon name="back" className="size-6" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] leading-tight font-bold">{title}</p>
        {subtitle && <p className="truncate text-[12px] font-medium text-muted">{subtitle}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-1 pr-1">{right}</div>}
    </header>
  );
}
