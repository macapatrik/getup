import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { daysUntilStart, formatDate, formatDayMonth, formatNumber, formatTime } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";
import { VENUE, campaignFor, eventHref, getPublicEvents, splitEvents, weekdayOf } from "@/lib/web";
import { Countdown } from "./countdown";
import { WebLink } from "./link";
import { Chip, EventCard, EventVisual, SectionTitle, Sticker, btnGhost, btnIndigo, btnWhite } from "./ui";

export const revalidate = 300;

// Úvodní stránka webu get-up.fun v párty stylu: samolepky, křivé pásky s programem, plakáty, polaroidy a barevný odpočet.

// Skutečné fotky z akcí GetUp v K2 (public/halloween/gallery) s popiskem na polaroidu
const GALLERY: { id: string; note: string; tilt: number }[] = [
  { id: "215", note: "ruce nahoru", tilt: -4 },
  { id: "113", note: "parta z K2", tilt: 3 },
  { id: "146", note: "před stagí", tilt: -2 },
  { id: "218", note: "DJ stage", tilt: 4 },
  { id: "203", note: "úsměvy", tilt: -3 },
  { id: "256", note: "na parketu", tilt: 2 },
  { id: "068", note: "u baru", tilt: -5 },
  { id: "133", note: "celá parta", tilt: 3 },
];

const HOW: { icon: IconName; title: string; text: string; fill: string }[] = [
  { icon: "ticket", title: "Lístek si kup dopředu", text: "Předprodej na Eventlooku je levnější a dovnitř se dostaneš bez fronty. Odkaz je u každé akce.", fill: "#f759f5" },
  { icon: "shield", title: "Jen 18+", text: "Na akce pouštíme od 18 let, občanku měj s sebou. Šatna a bar jsou v K2 samozřejmost.", fill: "#c6ff3d" },
  { icon: "instagram", title: "Sleduj stories", text: `Line-up, soutěže a slevy na vstup posíláme na Instagram ${INSTAGRAM_HANDLE}. Napiš nám do DM.`, fill: "#2ee7ff" },
];

const style = (vars: Record<string, string>) => vars as CSSProperties;

/** Plakáty nejbližších akcí naskládané přes sebe (jen široký displej), každý se vznáší a má tvrdý stín v barvě kampaně. */
function PosterWall({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="relative hidden h-[600px] lg:block" aria-hidden>
      {events.slice(0, 2).map((event, i) => {
        const accent = campaignFor(event)?.accent ?? "#2ee7ff";
        const place = i === 0 ? "right-2 top-4 z-10 rotate-[6deg] animate-[hw-float_7s_ease-in-out_infinite]" : "left-0 top-28 -rotate-[8deg] animate-[hw-float_9s_ease-in-out_1.5s_infinite]";
        return (
          <div
            key={event.id}
            className={`gu-hard absolute w-[280px] overflow-hidden rounded-[22px] border-[3px] border-white motion-reduce:animate-none ${place}`}
            style={style({ "--gu-shadow": accent })}
          >
            <EventVisual event={event} className="aspect-[9/16]" />
          </div>
        );
      })}
      <LogoMark className="gu-bounce absolute top-0 left-24 size-12 text-accent [--tilt:-12deg]" />
      <LogoMark className="gu-bounce absolute right-0 bottom-24 size-9 text-cyan [animation-delay:-1.2s] [--tilt:14deg]" />
      <Sticker fill="#c6ff3d" tilt={8} className="absolute -right-4 top-[46%] !text-[14px]">
        Jen 18+
      </Sticker>
    </div>
  );
}

/** Jeden běžící pásek (text se opakuje dvakrát, ať smyčka nemá mezeru). */
function Ribbon({ items, className, speed }: { items: string[]; className: string; speed: string }) {
  return (
    <div className={`overflow-hidden border-y-[3px] border-white py-2.5 ${className}`} aria-hidden>
      <div className="flex w-max motion-reduce:animate-none" style={{ animation: `hw-marquee ${speed} linear infinite` }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((t) => (
              <span key={t} className="font-party flex items-center gap-5 px-5 text-[18px] uppercase">
                {t}
                <LogoMark className="size-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dva křivé běžící pásky s programem, jako přelepené pásky na plakátu. */
function Ribbons({ events }: { events: PublicEvent[] }) {
  const items = [
    ...events.slice(0, 3).map((e) => `${e.name} · ${formatDayMonth(e.starts_at)}`),
    `${VENUE.name} · ${VENUE.city}`,
    "Předprodej na Eventlooku",
    `Seznamka ${APP_NAME} jen pro lidi z akce`,
    "Jen 18+",
  ];
  return (
    <div className="relative -my-6 h-32 overflow-visible">
      <Ribbon items={items} className="absolute inset-x-[-5%] top-4 -rotate-2 bg-accent text-white" speed="42s" />
      <Ribbon items={items} className="absolute inset-x-[-5%] top-14 rotate-[1.5deg] bg-cyan text-party" speed="55s" />
    </div>
  );
}

function Spotlight({ event }: { event: PublicEvent }) {
  const campaign = campaignFor(event);
  const href = eventHref(event);
  const accent = campaign?.accent ?? "#2ee7ff";
  const days = daysUntilStart(event.starts_at);
  return (
    <section id="akce" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 pb-14 sm:px-6 sm:pb-20">
      <div className="reveal gu-hard relative overflow-visible rounded-[32px] border-[3px] border-white bg-[#1d0f3f]" style={style({ "--gu-shadow": accent })}>
        <Sticker fill="#ffd23f" tilt={-6} className="absolute -top-5 left-6 z-10 !text-[14px]">
          Nejbližší akce
        </Sticker>
        <Sticker fill="#c6ff3d" tilt={5} className="absolute -top-5 right-6 z-10 !text-[14px]">
          {days <= 0 ? "Dnes" : days === 1 ? "Zítra" : `Za ${days} ${days < 5 ? "dny" : "dní"}`}
        </Sticker>
        <div className="grid overflow-hidden rounded-[29px] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <WebLink href={href} className="group block">
            <EventVisual event={event} className="aspect-[4/5] h-full md:aspect-auto md:min-h-[520px]" />
          </WebLink>
          <div className="gu-dots flex flex-col justify-center p-6 sm:p-10">
            <h2 className="font-party text-[36px] leading-[1.02] text-white uppercase sm:text-[56px]">{event.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip icon="calendar">
                <span className="capitalize">{weekdayOf(event.starts_at)}</span> {formatDate(event.starts_at)}
              </Chip>
              <Chip icon="clock">od {formatTime(event.starts_at)}</Chip>
              <Chip icon="pin">{event.venue || VENUE.name}</Chip>
            </div>
            <p className="mt-5 max-w-lg text-[17px] leading-snug text-white/75">
              {event.description || campaign?.tagline || `${VENUE.name}, ${VENUE.street}, ${VENUE.city}.`}
            </p>
            <Countdown target={event.starts_at} liveText={`Právě teď v ${VENUE.name}`} className="mt-8 max-w-md" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {event.tickets_url && (
                <a href={event.tickets_url} target="_blank" rel="noopener" className={btnWhite}>
                  <Icon name="ticket" className="size-5" /> Koupit vstupenku
                </a>
              )}
              <WebLink href={href} className={btnGhost}>
                Víc o akci <Icon name="chevron" className="size-4" />
              </WebLink>
              <a href={`${SITE_URL}/j/${event.join_code}`} className={`${btnGhost} !border-accent text-accent hover:!bg-accent hover:!text-white`}>
                <LogoMark className="size-5" /> Seznamka z akce
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function WebHome() {
  const events = await getPublicEvents();
  const { upcoming, past } = splitEvents(events);
  const [next, ...rest] = upcoming;
  const since = events.length ? new Date(events[events.length - 1].starts_at).getFullYear() : new Date().getFullYear();

  return (
    <div>
      {/* Úvod: dav z K2, samolepky, hravý nadpis a plakáty nejbližších akcí */}
      <section className="relative overflow-hidden pt-16">
        <img src="/halloween/gallery/215.webp" alt="" className="absolute inset-0 size-full object-cover object-center opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-party/70 via-party/30 to-party" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a3ff0]/50 via-transparent to-accent/30 mix-blend-screen" aria-hidden />
        <div className="gu-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid min-h-[92svh] w-full max-w-6xl items-center gap-10 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <div className="rise-in flex flex-wrap gap-3">
              <Sticker fill="#2ee7ff" tilt={-4}>
                <Icon name="pin" className="size-3.5" /> {VENUE.name} · {VENUE.city}
              </Sticker>
              {next && (
                <Sticker fill="#ffd23f" tilt={3}>
                  <Icon name="calendar" className="size-3.5" /> {next.name} · {formatDayMonth(next.starts_at)}
                </Sticker>
              )}
            </div>
            <img src="/web/getup-mark.png" alt="" className="rise-in mt-7 h-14 w-auto drop-shadow-[0_12px_30px_rgb(0_0_0/0.6)] [--rise-delay:0.04s] sm:h-20" />
            <h1 className="rise-in font-party mt-5 max-w-4xl text-[40px] leading-[1] text-white uppercase [--rise-delay:0.08s] sm:text-[72px] lg:text-[80px]">
              Nejlepší párty
              <br />
              <span className="gu-rainbow">v Budějcích.</span>
              <br />
              <span className="gu-outline">Jdeš taky?</span>
            </h1>
            <p className="rise-in mt-6 max-w-xl text-[18px] leading-snug text-white/80 [--rise-delay:0.16s] sm:text-[21px]">
              Tematické večery v Klubu K2: Halloween, Tinder party, Semafor, X-mas a další. Předprodej na Eventlooku a seznamka {APP_NAME}{" "}
              jen pro lidi z akce, ať víš, koho tam potkáš.
            </p>
            <div className="rise-in mt-8 flex flex-col gap-3 sm:flex-row [--rise-delay:0.24s]">
              {next ? (
                <WebLink href={eventHref(next)} className={btnWhite}>
                  <Icon name="ticket" className="size-5" /> {next.name}
                </WebLink>
              ) : (
                <WebLink href="/akce" className={btnWhite}>
                  <Icon name="calendar" className="size-5" /> Akce
                </WebLink>
              )}
              <a href="#akce" className={btnGhost}>
                Program <Icon name="chevron" className="size-4 rotate-90" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={btnGhost}>
                <Icon name="instagram" className="size-5" /> {INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
          <div className="rise-in [--rise-delay:0.2s]">
            <PosterWall events={upcoming} />
          </div>
        </div>
      </section>

      <Ribbons events={upcoming} />

      {next ? (
        <Spotlight event={next} />
      ) : (
        <section id="akce" className="mx-auto max-w-6xl px-4 pt-20 pb-14 sm:px-6">
          <SectionTitle kicker="Akce" title="Další akci právě chystáme" text="Sleduj Instagram, první se to dozvíš tam." />
        </section>
      )}

      {/* Čísla jako samolepky */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            [formatNumber(events.length), `akcí od roku ${since}`, "#f759f5", -2],
            ["K2", `${VENUE.street}, ${VENUE.city}`, "#2ee7ff", 1.5],
            ["18+", "vstup jen pro dospělé", "#c6ff3d", -1],
          ].map(([value, label, fill, tilt]) => (
            <div
              key={label}
              className="reveal rounded-[22px] border-[3px] border-white p-5 text-party shadow-[6px_6px_0_rgb(255_255_255/0.9)] transition hover:gu-wiggle"
              style={{ background: fill as string, transform: `rotate(${tilt}deg)` }}
            >
              <p className="font-party text-[48px] leading-none">{value}</p>
              <p className="mt-2 text-[14px] font-extrabold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Další akce */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle kicker="Program" title="Co dál chystáme" fill="#ffd23f" />
            <WebLink href="/akce" className={`${btnGhost} reveal`}>
              Všechny akce <Icon name="chevron" className="size-4" />
            </WebLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {rest.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* GetCrush */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="reveal gu-hard relative overflow-visible rounded-[32px] border-[3px] border-white bg-gradient-to-br from-[#5a0f6b] via-[#2a0a4f] to-[#1d0f3f] p-6 sm:p-10" style={style({ "--gu-shadow": "#f759f5" })}>
          <Sticker fill="#f759f5" tilt={-5} className="absolute -top-5 left-6 !text-[14px] !text-white">
            <LogoMark className="size-4" /> {APP_NAME} by GetUp
          </Sticker>
          <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <h2 className="font-party mt-2 text-[34px] leading-[1.02] text-white uppercase sm:text-[48px]">
                Seznamka jen pro lidi <span className="gu-rainbow">z akce</span>
              </h2>
              <p className="mt-4 max-w-lg text-[17px] leading-snug text-white/80">
                Připoj se k akci, swipuj lidi, kteří tam jdou taky, a když se lajknete oba, ukážou se vám kontakty. Žádný chat do prázdna,
                potkáte se rovnou v K2. Zdarma, bez instalace, jen 18+.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={SITE_URL} className={btnWhite}>
                  <Icon name="heart" className="size-5" /> Otevřít {APP_NAME}
                </a>
                <WebLink href="/tinder" className={btnGhost}>
                  Tinder party 16. 10. <Icon name="chevron" className="size-4" />
                </WebLink>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="gu-bounce grid size-28 place-items-center rounded-full border-[3px] border-white bg-gradient-to-b from-[#ff9be9] to-accent shadow-[6px_6px_0_rgb(255_255_255/0.9)] sm:size-36">
                <LogoMark className="size-16 text-white sm:size-20" />
              </span>
              <Sticker fill="#ffffff" tilt={-3} className="-mt-3 !text-[13px]">
                Je to match!
              </Sticker>
            </div>
          </div>
        </div>
      </section>

      {/* Fotky jako polaroidy */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle kicker="Atmosféra" title="Jak to u nás vypadá" text="Fotky z posledních akcí v K2. Další najdeš na Instagramu." fill="#f759f5" />
        </div>
        <div className="no-scrollbar mt-10 flex snap-x gap-5 overflow-x-auto px-6 pt-2 pb-6 sm:px-8 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
          {GALLERY.map((photo) => (
            <figure
              key={photo.id}
              className="reveal w-44 shrink-0 snap-start rounded-[6px] bg-white p-2 pb-3 text-party shadow-[0_24px_50px_-20px_rgb(0_0_0/0.8)] transition duration-300 hover:z-10 hover:scale-[1.04] hover:rotate-0 sm:w-56 lg:w-auto"
              style={{ transform: `rotate(${photo.tilt}deg)` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-coal">
                <img src={`/halloween/gallery/${photo.id}-800.webp`} alt="Párty GetUp v Klubu K2" loading="lazy" className="absolute inset-0 size-full object-cover" />
              </div>
              <figcaption className="font-script mt-2 text-center text-[20px] leading-none">{photo.note}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Jak to u nás chodí + kde */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Info" title="Jak to u nás chodí" fill="#c6ff3d" />
        <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="grid gap-5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {HOW.map((item, i) => (
              <div
                key={item.title}
                className="reveal gu-hard rounded-[22px] border-[3px] border-white bg-[#1d0f3f] p-5 transition hover:-translate-y-1"
                style={style({ "--gu-shadow": item.fill, transform: `rotate(${i % 2 ? 1 : -1}deg)` })}
              >
                <span className="grid size-11 place-items-center rounded-full border-[3px] border-white text-party" style={{ background: item.fill }}>
                  <Icon name={item.icon} className="size-6" />
                </span>
                <p className="font-party mt-4 text-[17px] leading-tight text-white uppercase">{item.title}</p>
                <p className="mt-2 text-[14px] leading-snug text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
          <a
            href={VENUE.mapUrl}
            target="_blank"
            rel="noopener"
            className="reveal gu-hard group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[28px] border-[3px] border-white p-6"
            style={style({ "--gu-shadow": "#2ee7ff" })}
          >
            <img src="/halloween/gallery/218-800.webp" alt="" className="absolute inset-0 size-full object-cover opacity-50 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-party via-party/40 to-transparent" aria-hidden />
            <Sticker fill="#2ee7ff" tilt={-4} className="absolute top-5 left-5">
              Kde nás najdeš
            </Sticker>
            <div className="relative">
              <p className="font-party text-[40px] leading-none text-white uppercase">{VENUE.name}</p>
              <p className="mt-1 text-[15px] text-white/80">
                {VENUE.street}, {VENUE.city}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-extrabold text-cyan">
                Otevřít mapu <Icon name="chevron" className="size-4" />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener"
          className="reveal group relative block overflow-hidden rounded-[32px] border-[3px] border-white bg-gradient-to-r from-[#7a3ff0] via-accent to-[#ff8a3d] p-8 shadow-[8px_8px_0_rgb(255_255_255/0.9)] transition duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg] sm:p-12"
        >
          <span className="gu-dots absolute inset-0" aria-hidden />
          <span className="absolute -top-20 -right-20 size-72 rounded-full bg-white/20 blur-3xl transition duration-700 group-hover:scale-150" aria-hidden />
          <Sticker fill="#ffffff" tilt={-3} className="relative">
            <Icon name="instagram" className="size-3.5" /> Instagram
          </Sticker>
          <p className="font-party relative mt-4 text-[36px] leading-[1] text-white uppercase sm:text-[64px]">Sleduj {INSTAGRAM_HANDLE}</p>
          <p className="relative mt-3 max-w-xl text-[17px] leading-snug text-white/90">
            Stories z akcí, line-upy, soutěže a slevy na vstup. Napiš nám do DM, odpovídáme rychle.
          </p>
          <span className={`${btnGhost} relative mt-6 !border-white !bg-white !text-party`}>
            Otevřít Instagram <Icon name="chevron" className="size-4" />
          </span>
        </a>
      </section>

      {/* Historie */}
      {past.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
          <div className="reveal gu-hard flex flex-col items-start justify-between gap-4 rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-6 sm:flex-row sm:items-center sm:p-8" style={style({ "--gu-shadow": "#ffd23f" })}>
            <div>
              <Sticker fill="#ffd23f" tilt={-3}>
                Archiv
              </Sticker>
              <p className="font-party mt-3 text-[28px] leading-none text-white uppercase sm:text-[36px]">{formatNumber(past.length)} proběhlých párty</p>
              <p className="mt-2 text-[15px] text-white/65">
                Naposledy {past[0].name}, {formatDate(past[0].starts_at)}.
              </p>
            </div>
            <WebLink href="/akce#archiv" className={btnIndigo}>
              Projít archiv <Icon name="chevron" className="size-4" />
            </WebLink>
          </div>
        </section>
      )}
    </div>
  );
}
