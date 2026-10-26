import Link from "next/link";
import { FallbackImg } from "@/components/fallback-img";
import { Icon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME } from "@/lib/config";
import { daysUntilStart, eventStatus, formatDayMonth, formatTime, peopleLabel } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { EVENT } from "../../halloween/event";

// Červené tlačítko jako na stránce /halloween (Koupit vstupenku).
const button = "hw-red mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] py-3.5 text-[17px] font-bold transition active:scale-[0.97]";
const chip = "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[12px] font-medium backdrop-blur";

/**
 * Halloween ve stylu plakátu (smrtka, rudý nápis). Bez `event` je to pozvánka (jedno klepnutí na /j/KÓD, bez QR kódu),
 * po připojení stejná karta s odpočtem, počtem lidí, tlačítkem Swipovat a odkazem na soutěž o kostým.
 */
export function HalloweenCard({
  event,
  attendees = 0,
  opensAt = null,
  contest = false,
}: {
  event?: EventRow;
  attendees?: number;
  opensAt?: Date | null;
  contest?: boolean;
}) {
  const startsAt = event?.starts_at ?? EVENT.startsAt;
  const status = event ? eventStatus(event) : "upcoming";
  const days = daysUntilStart(startsAt);
  const when =
    days <= 0 ? `dnes ve ${formatTime(startsAt)}` : days === 1 ? `zítra ve ${formatTime(startsAt)}` : `za ${days} ${days < 5 ? "dny" : "dní"}`;
  const badge = !event ? `Pozvánka · ${when}` : status === "live" ? "Právě teď" : status === "after" ? "Po akci" : `Jdeš tam · ${when}`;
  const paused = Boolean(event && opensAt && status === "upcoming");
  const text = !event
    ? "Připoj se a uvidíš všechny, kdo na Halloween jdou. Nic neskenuješ, stačí jedno klepnutí."
    : status === "live"
      ? "Noc je tady. Swipuj, a až se lajknete, najděte se pod maskou."
      : status === "after"
        ? "Halloween skončil, swipovat můžeš ještě 24 hodin."
        : paused
          ? `Swipování startuje ${formatDayMonth(opensAt!.toISOString())}. Dej si do profilu fotku, ať tě poznají i bez masky.`
          : "Swipuj už teď, ať víš, koho na Halloweenu potkáš.";

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-blood/40 bg-night text-bone shadow-[0_24px_40px_-20px_rgb(224_20_28/0.7)]">
      <FallbackImg src="/halloween/hero-800.webp" className="absolute inset-0 size-full object-cover object-[70%_center] opacity-70" />
      <div className="hw-fog-bottom absolute inset-0" aria-hidden />
      <div className="relative p-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className={`${chip} !text-[12px] font-bold tracking-wide uppercase`}>
            {status === "live" ? (
              <span className="size-1.5 animate-pulse rounded-full bg-blood" />
            ) : (
              <Icon name={event ? "check" : "ticket"} className="size-4" />
            )}
            {badge}
          </span>
          {event && (
            <span className={`${chip} shrink-0 font-semibold`}>
              <Icon name="users" className="size-4" /> {peopleLabel(attendees)}
            </span>
          )}
        </div>
        <p className="mt-16">
          <img src="/halloween/title-600.webp" alt="" className="w-[78%] max-w-[300px] drop-shadow-[0_10px_30px_rgb(224_20_28/0.45)]" />
          <span className="sr-only">{EVENT.name}</span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] font-bold">
          <LogoMark className="size-5 text-blood" /> {APP_NAME} by GetUp
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={chip}>
            <Icon name="calendar" className="size-4" /> <span className="capitalize">{EVENT.weekday}</span> {EVENT.dateLabel}, {EVENT.doors}
          </span>
          <span className={chip}>
            <Icon name="pin" className="size-4" /> {EVENT.venue}
          </span>
        </div>
        <p className="mt-4 text-[14px] leading-snug text-bone/85">{text}</p>
        {event ? (
          <>
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
            {contest && (
              <Link
                href={`/e/${event.id}/kostymy`}
                className="hw-outline mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-[15px] font-bold transition active:scale-[0.97]"
              >
                <Icon name="camera" className="size-5" /> Soutěž o kostým · {EVENT.prize}
              </Link>
            )}
          </>
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
