// Stavební kousky administrace (serverové komponenty).
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { card, sectionTitle } from "@/components/ui";
import { STATUS_LABELS, formatNumber, type EventStatus } from "@/lib/format";
import { photoUrl } from "@/lib/photos";

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pt-5 pb-6 lg:pt-2">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="no-print mb-1.5 inline-flex items-center gap-0.5 text-[15px] font-medium text-ink">
            <Icon name="back" className="size-4" /> {back.label}
          </Link>
        )}
        <h1 className="font-display text-[30px] leading-tight font-bold tracking-tight lg:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="no-print flex shrink-0 flex-wrap gap-2">{action}</div>}
    </header>
  );
}

export function StatTile({ label, value, hint, alert }: { label: string; value?: number; hint?: string; alert?: boolean }) {
  return (
    <div className={`${card} !p-4`}>
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className={`mt-1 font-display text-[30px] leading-none font-bold tracking-tight ${alert ? "text-danger" : ""}`}>
        {value === undefined ? "–" : formatNumber(value)}
      </p>
      {hint && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export function Avatar({ photo, name, className = "size-10" }: { photo?: string | null; name?: string | null; className?: string }) {
  if (photo) return <img src={photoUrl(photo)} alt="" className={`${className} shrink-0 rounded-full object-cover`} />;
  return (
    <span className={`${className} grid shrink-0 place-items-center rounded-full bg-fill text-[15px] font-semibold text-muted`}>
      {(name ?? "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

const BADGE_TONES = {
  neutral: "bg-fill text-muted",
  accent: "bg-fill text-ink",
  danger: "bg-danger/10 text-danger",
  info: "bg-fill text-muted",
  success: "bg-success/15 text-green-700",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

const STATUS_TONES: Record<EventStatus, keyof typeof BADGE_TONES> = {
  upcoming: "info",
  live: "accent",
  after: "accent",
  closed: "neutral",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function SectionTitle({ title, href, linkLabel = "Zobrazit vše" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h2 className={`${sectionTitle} mb-0`}>{title}</h2>
      {href && (
        <Link href={href} className="text-[14px] font-semibold text-ink">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className={`${card} text-center text-[15px] text-muted`}>{children}</p>;
}

/** Skleněný seznam s řádky oddělenými linkou */
export const list = "surface overflow-hidden rounded-[16px] divide-y divide-line";
export const row = "flex items-center gap-3 px-4 py-3 transition hover:bg-black/[0.03] active:bg-black/5";
