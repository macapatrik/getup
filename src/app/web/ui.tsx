import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { dayAndMonth, formatDate, formatTime } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";
import { campaignFor, eventHref, eventHue } from "@/lib/web";
import { WebLink } from "./link";

// Stavební prvky webu get-up.fun v párty stylu: samolepky, tvrdé barevné stíny, pilulková tlačítka, karty akcí.

export const btnWhite =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-[#7a3ff0] px-6 py-3.5 text-[16px] font-extrabold text-white shadow-[5px_5px_0_rgb(255_255_255/0.9)] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgb(255_255_255/0.9)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgb(255_255_255/0.9)]";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-white/70 bg-party/40 px-5 py-3 text-[16px] font-extrabold text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-party active:scale-[0.97]";
export const btnIndigo =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cyan px-6 py-3.5 text-[16px] font-extrabold text-party shadow-[5px_5px_0_rgb(255_255_255/0.9)] transition hover:-translate-y-0.5 active:translate-y-0.5";

/** Samolepka: barva výplně a naklonění přes CSS proměnné. */
export function Sticker({ children, fill = "#f759f5", tilt = -3, className = "" }: { children: ReactNode; fill?: string; tilt?: number; className?: string }) {
  return (
    <span className={`gu-sticker px-3.5 py-1.5 text-[12px] ${className}`} style={{ "--gu-fill": fill, "--tilt": `${tilt}deg` } as CSSProperties}>
      {children}
    </span>
  );
}

export function SectionTitle({ kicker, title, text, center = false, fill = "#2ee7ff" }: { kicker: string; title: ReactNode; text?: string; center?: boolean; fill?: string }) {
  return (
    <div className={`reveal ${center ? "mx-auto flex max-w-2xl flex-col items-center text-center" : ""}`}>
      <Sticker fill={fill} tilt={-2}>
        {kicker}
      </Sticker>
      <h2 className="font-party mt-4 text-[34px] leading-[1.02] text-white uppercase sm:text-[48px]">{title}</h2>
      {text && <p className="mt-4 max-w-xl text-[17px] leading-snug text-white/70">{text}</p>}
    </div>
  );
}

export function Chip({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white">
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
      style={{ background: `linear-gradient(160deg, hsl(${hue} 80% 30%), hsl(${(hue + 60) % 360} 90% 55%))` }}
    >
      <div className="gu-dots absolute inset-0" aria-hidden />
      <img src="/web/getup-mark.png" alt="" className="absolute -top-4 -right-6 w-2/3 opacity-20" />
      <p className="font-party relative line-clamp-3 text-[28px] leading-[1.02] text-white uppercase drop-shadow-[4px_4px_0_rgb(20_10_46/0.8)] sm:text-[34px]">
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

/** Karta akce: široký banner se samolepkou data, název, místo a akce (vstupenky, detail). Stín v barvě akce. */
export function EventCard({ event, past = false }: { event: PublicEvent; past?: boolean }) {
  const href = eventHref(event);
  const campaign = campaignFor(event);
  const accent = campaign?.accent ?? `hsl(${eventHue(event.name)} 85% 60%)`;
  const { day, month } = dayAndMonth(event.starts_at);
  return (
    <article
      className="group gu-hard reveal flex flex-col overflow-hidden rounded-[28px] border-[3px] border-white bg-[#1d0f3f] transition duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg]"
      style={{ "--gu-shadow": accent } as CSSProperties}
    >
      <WebLink href={href} className="relative block">
        <EventVisual event={event} wide className="aspect-[16/9]" />
        <Sticker fill="#ffd23f" tilt={-6} className="absolute top-4 left-4 !text-[14px]">
          {day}. {month}
        </Sticker>
      </WebLink>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] font-extrabold tracking-[0.12em] text-cyan uppercase">
          {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
        </p>
        <h3 className="font-party mt-1.5 text-[22px] leading-tight text-white uppercase">
          <WebLink href={href}>{event.name}</WebLink>
        </h3>
        <p className="mt-1.5 text-[14px] text-white/65">{campaign?.tagline || event.description || event.venue}</p>
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
