import Link from "next/link";
import { FallbackImg } from "@/components/fallback-img";
import { Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME } from "@/lib/config";
import { daysUntilStart, eventStatus, formatDayMonth, formatTime, peopleLabel } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { EVENT } from "../../tinder/event";
import { anton } from "../../tinder/fonts";
import { TinderTitle } from "../../tinder/title";

// Růžové tlačítko jako na stránce /tinder (Koupit vstupenku).
const button = "tp-pink mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] py-3.5 text-[17px] font-bold transition active:scale-[0.97]";

/**
 * Tinder party ve stylu plakátu. Bez `event` je to pozvánka (jedno klepnutí na /j/KÓD, bez QR kódu),
 * po připojení stejná karta s odpočtem, počtem lidí a tlačítkem Swipovat (dokud tým swipování neotevře, ukáže datum).
 */
export function TinderCard({ event, attendees = 0, opensAt = null }: { event?: EventRow; attendees?: number; opensAt?: Date | null }) {
  const startsAt = event?.starts_at ?? EVENT.startsAt;
  const status = event ? eventStatus(event) : "upcoming";
  const days = daysUntilStart(startsAt);
  const when =
    days <= 0 ? `dnes ve ${formatTime(startsAt)}` : days === 1 ? `zítra ve ${formatTime(startsAt)}` : `za ${days} ${days < 5 ? "dny" : "dní"}`;
  const badge = !event ? `Pozvánka · ${when}` : status === "live" ? "Právě teď" : status === "after" ? "Po akci" : `Jdeš tam · ${when}`;
  const paused = Boolean(event && opensAt && status === "upcoming");
  const text = !event
    ? `Připoj se a uvidíš všechny, kdo na ${EVENT.name} jdou. Nic neskenuješ, stačí jedno klepnutí.`
    : status === "live"
      ? "Lidi jsou tady. Swipuj a domluvte se, kde se potkáte."
      : status === "after"
        ? "Akce skončila, swipovat můžeš ještě 24 hodin."
        : paused
          ? `Swipování startuje ${formatDayMonth(opensAt!.toISOString())}. Dolaď si profil, ať máš fotky a kontakt hotové.`
          : `Swipuj už teď, ať víš, koho na ${EVENT.name} potkáš.`;

  return (
    <div className={`${anton.variable} relative overflow-hidden rounded-[32px] bg-plum text-white shadow-[0_24px_40px_-20px_rgb(247_89_245/0.45)]`}>
      <FallbackImg src="/tinder/crowd-800.webp" className="absolute inset-0 size-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-plum/10 via-plum/55 to-plum" aria-hidden />
      <div className="relative p-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-wide uppercase">
            {status === "live" ? (
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            ) : (
              <Icon name={event ? "check" : "ticket"} className="size-4" />
            )}
            {badge}
          </span>
          {event && (
            <span className="liquid-glass inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold">
              <Icon name="users" className="size-4" /> {peopleLabel(attendees)}
            </span>
          )}
        </div>
        <p className="mt-4">
          <TinderTitle className="text-[64px]" />
          <span className="sr-only">{EVENT.name}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[15px] font-bold">
          <LogoMark className="size-5 text-accent" /> {APP_NAME} by GetUp
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium">
            <Icon name="calendar" className="size-4" /> <span className="capitalize">{EVENT.weekday}</span> {EVENT.dateLabel}, {EVENT.doors}
          </span>
          <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium">
            <Icon name="pin" className="size-4" /> {EVENT.venue}
          </span>
        </div>
        <p className="mt-4 text-[14px] leading-snug text-white/85">{text}</p>
        {event ? (
          <Link href={`/e/${event.id}`} className={button}>
            {paused ? (
              <>
                <Icon name="clock" className="size-5" /> Od {formatDayMonth(opensAt!.toISOString())}
              </>
            ) : (
              <>
                <Icon name="heart" className="size-5" /> Swipovat
              </>
            )}
          </Link>
        ) : (
          // Plná navigace: /j/KÓD je route handler, který připojí a přesměruje na swipování.
          <a href={`/j/${EVENT.joinCode}`} className={button}>
            <Icon name="heart" className="size-5" /> Připojit se
          </a>
        )}
      </div>
    </div>
  );
}
