import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { formatDate, formatTime } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";
import { campaignFor, eventHref, eventHue } from "@/lib/web";
import { WebLink } from "./link";

// Stavební prvky webu get-up.fun: tlačítka, nadpisy sekcí, karty akcí a obecná grafika akce bez plakátu.

export const btnWhite = "gu-btn inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[16px] font-bold transition hover:-translate-y-0.5 active:scale-[0.97]";
export const btnGhost =
  "hw-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3.5 text-[16px] font-bold text-white transition hover:bg-white/10 active:scale-[0.97]";
export const btnIndigo =
  "inline-flex items-center justify-center gap-2 rounded-[12px] bg-indigo px-6 py-3.5 text-[16px] font-bold text-white shadow-[0_18px_40px_-16px_rgb(62_54_237/0.8)] transition hover:-translate-y-0.5 active:scale-[0.97]";

export function SectionTitle({ kicker, title, text, center = false }: { kicker: string; title: ReactNode; text?: string; center?: boolean }) {
  return (
    <div className={`reveal ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
      <p className="text-[13px] font-bold tracking-[0.22em] text-indigo-300 uppercase">{kicker}</p>
      <h2 className="font-display mt-2 text-[40px] leading-[0.95] text-white uppercase sm:text-[56px]">{title}</h2>
      {text && <p className="mt-4 max-w-xl text-[17px] leading-snug text-white/65">{text}</p>}
    </div>
  );
}

export function Chip({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white">
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </span>
  );
}

/** Grafika akce bez plakátu: barevný přechod podle názvu, značka GetUp a název velkým písmem. */
export function EventArt({ event, className = "" }: { event: Pick<PublicEvent, "name">; className?: string }) {
  const hue = eventHue(event.name);
  return (
    <div
      className={`relative flex items-end overflow-hidden p-5 ${className}`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 70% 22%), hsl(${(hue + 50) % 360} 80% 45%))` }}
    >
      <div className="gu-grid absolute inset-0" aria-hidden />
      <img src="/web/getup-mark.png" alt="" className="absolute -top-4 -right-6 w-2/3 opacity-15" />
      <p className="font-display relative line-clamp-3 text-[34px] leading-[0.95] text-white uppercase drop-shadow-[0_8px_24px_rgb(0_0_0/0.5)] sm:text-[40px]">
        {event.name}
      </p>
    </div>
  );
}

/** Plakát kampaně (na výšku), nebo široký banner jako na Eventlooku (`wide`), jinak obecná grafika. */
export function EventVisual({ event, wide = false, className = "" }: { event: PublicEvent; wide?: boolean; className?: string }) {
  const campaign = campaignFor(event);
  if (campaign) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={wide ? campaign.banner : campaign.poster}
          alt={`${wide ? "Banner" : "Plakát"} ${event.name}`}
          className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
    );
  }
  return <EventArt event={event} className={className} />;
}

/** Karta akce v seznamu: vizuál, datum, název, místo a akce (vstupenky, detail). */
export function EventCard({ event, past = false }: { event: PublicEvent; past?: boolean }) {
  const href = eventHref(event);
  const campaign = campaignFor(event);
  const accent = campaign?.accent ?? `hsl(${eventHue(event.name)} 80% 55%)`;
  return (
    <article
      className="group hw-surface reveal flex flex-col overflow-hidden rounded-[32px] transition duration-300 hover:-translate-y-1.5 hover:border-white/20"
      style={{ boxShadow: `0 30px 70px -40px ${accent}` }}
    >
      <WebLink href={href} className="block">
        <EventVisual event={event} wide className="aspect-[16/9]" />
      </WebLink>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] font-bold tracking-[0.16em] text-white/55 uppercase">
          {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
        </p>
        <h3 className="mt-1.5 text-[22px] leading-tight font-bold text-white">
          <WebLink href={href}>{event.name}</WebLink>
        </h3>
        <p className="mt-1 text-[14px] text-white/60">{campaign?.tagline || event.description || event.venue}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {!past && event.tickets_url && (
            <a href={event.tickets_url} target="_blank" rel="noopener" className={`${btnWhite} !px-4 !py-2.5 !text-[14px]`}>
              <Icon name="ticket" className="size-4" /> Vstupenky
            </a>
          )}
          <WebLink href={href} className={`${btnGhost} !px-4 !py-2.5 !text-[14px]`}>
            {past ? "Jak to bylo" : "Víc o akci"} <Icon name="chevron" className="size-4" />
          </WebLink>
        </div>
      </div>
    </article>
  );
}
