import { FallbackImg } from "@/components/fallback-img";
import { Icon } from "@/components/icons";
import { btnPrimary } from "@/components/ui";
import { daysUntilStart } from "@/lib/format";
import { EVENT } from "../../halloween/event";

/** Pozvánka na Halloween ve stylu plakátu: jedním klepnutím se připojíš (po připojení ji nahradí karta akce). */
export function InviteCard() {
  const days = daysUntilStart(EVENT.startsAt);
  const when = days <= 0 ? "dnes" : days === 1 ? "zítra" : `za ${days} ${days < 5 ? "dny" : "dní"}`;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-night text-white shadow-[0_24px_40px_-20px_rgb(224_20_28/0.45)]">
      <FallbackImg src="/halloween/hero-800.webp" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/20 via-night/55 to-night" aria-hidden />
      <div className="relative p-5 pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-white/15 px-3 py-1 text-[12px] font-bold tracking-wide uppercase backdrop-blur-sm">
          <Icon name="ticket" className="size-4" /> Pozvánka · {when}
        </span>
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
        <p className="mt-4 text-[14px] leading-snug text-white/85">
          Připoj se a uvidíš všechny, kdo na Halloween jdou. Nic neskenuješ, stačí jedno klepnutí.
        </p>
        {/* Plná navigace: /j/KÓD je route handler, který připojí a přesměruje na swipování. */}
        <a href={`/j/${EVENT.joinCode}`} className={`${btnPrimary} mt-4 w-full py-3.5`}>
          <Icon name="heart" className="size-5" /> Připojit se
        </a>
      </div>
    </div>
  );
}
