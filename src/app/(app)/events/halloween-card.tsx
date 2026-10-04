import Link from "next/link";
import { FallbackImg } from "@/components/fallback-img";
import { Icon } from "@/components/icons";
import { btnPrimary } from "@/components/ui";
import { daysUntilStart, eventStatus, formatTime, peopleLabel } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { EVENT } from "../../halloween/event";

/**
 * Halloween ve stylu plakátu. Bez `event` je to pozvánka (jedno klepnutí na /j/KÓD, bez QR kódu),
 * po připojení stejná karta s odpočtem, počtem lidí a tlačítkem Swipovat.
 */
export function HalloweenCard({ event, attendees = 0 }: { event?: EventRow; attendees?: number }) {
  const startsAt = event?.starts_at ?? EVENT.startsAt;
  const status = event ? eventStatus(event) : "upcoming";
  const days = daysUntilStart(startsAt);
  const when =
    days <= 0 ? `dnes ve ${formatTime(startsAt)}` : days === 1 ? `zítra ve ${formatTime(startsAt)}` : `za ${days} ${days < 5 ? "dny" : "dní"}`;
  const badge = !event ? `Pozvánka · ${when}` : status === "live" ? "Právě teď" : status === "after" ? "Po akci" : `Jdeš tam · ${when}`;
  const text = !event
    ? "Připoj se a uvidíš všechny, kdo na Halloween jdou. Nic neskenuješ, stačí jedno klepnutí."
    : status === "live"
      ? "Lidi jsou tady. Swipuj a domluvte se, kde se potkáte."
      : status === "after"
        ? "Akce skončila, swipovat můžeš ještě 24 hodin."
        : "Swipuj už teď, ať víš, koho na Halloweenu potkáš.";

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-night text-white shadow-[0_24px_40px_-20px_rgb(224_20_28/0.45)]">
      <FallbackImg src="/halloween/hero-800.webp" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/20 via-night/55 to-night" aria-hidden />
      <div className="relative p-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-white/15 px-3 py-1 text-[12px] font-bold tracking-wide uppercase backdrop-blur-sm">
            {status === "live" ? (
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            ) : (
              <Icon name={event ? "check" : "ticket"} className="size-4" />
            )}
            {badge}
          </span>
          {event && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-white/85">
              <Icon name="users" className="size-4" /> {peopleLabel(attendees)}
            </span>
          )}
        </div>
        <img src="/halloween/title-600.webp" alt={EVENT.name} className="mt-4 w-[78%] max-w-[300px] drop-shadow-[0_6px_18px_rgb(0_0_0/0.6)]" />
        <p className="mt-1 text-[15px] font-bold">by GetUp</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="photo-chip inline-flex items-center gap-1.5 rounded-[30px] px-3 py-1 text-[12px] font-medium">
            <Icon name="calendar" className="size-4" /> <span className="capitalize">{EVENT.weekday}</span> {EVENT.dateLabel}, {EVENT.doors}
          </span>
          <span className="photo-chip inline-flex items-center gap-1.5 rounded-[30px] px-3 py-1 text-[12px] font-medium">
            <Icon name="pin" className="size-4" /> {EVENT.venue}
          </span>
        </div>
        <p className="mt-4 text-[14px] leading-snug text-white/85">{text}</p>
        {event ? (
          <Link href={`/e/${event.id}`} className={`${btnPrimary} mt-4 w-full py-3.5`}>
            <Icon name="heart" className="size-5" /> Swipovat
          </Link>
        ) : (
          // Plná navigace: /j/KÓD je route handler, který připojí a přesměruje na swipování.
          <a href={`/j/${EVENT.joinCode}`} className={`${btnPrimary} mt-4 w-full py-3.5`}>
            <Icon name="heart" className="size-5" /> Připojit se
          </a>
        )}
      </div>
    </div>
  );
}
