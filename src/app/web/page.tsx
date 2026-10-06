import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { daysUntilStart, formatDate, formatDayMonth, formatNumber, formatTime } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";
import { VENUE, campaignFor, eventHref, getPublicEvents, splitEvents, weekdayOf } from "@/lib/web";
import { Countdown } from "./countdown";
import { WebLink } from "./link";
import { Chip, EventCard, EventVisual, SectionTitle, btnGhost, btnIndigo, btnWhite } from "./ui";

export const revalidate = 300;

// Úvodní stránka webu get-up.fun: nejbližší akce s odpočtem, další akce, seznamka GetCrush, fotky, kde nás najdeš.

// Skutečné fotky z akcí GetUp v K2 (public/halloween/gallery)
const GALLERY = ["215", "113", "146", "218", "203", "256", "068", "133"];

const HOW: { icon: IconName; title: string; text: string }[] = [
  { icon: "ticket", title: "Předprodej na Eventlooku", text: "Lístky v předprodeji jsou levnější a máš jistotu, že se dostaneš dovnitř. Odkaz je u každé akce." },
  { icon: "shield", title: "Jen 18+", text: "Na akce pouštíme od 18 let, občanku měj s sebou. Šatna a bar jsou v K2 samozřejmost." },
  { icon: "instagram", title: "Sleduj stories", text: `Line-up, soutěže a slevy na vstup posíláme na Instagram ${INSTAGRAM_HANDLE}. Napiš nám do DM.` },
];

/** Plakáty nejbližších akcí naskládané přes sebe (jen široký displej), každý se vznáší a září barvou své kampaně. */
function PosterWall({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="relative hidden h-[600px] lg:block" aria-hidden>
      {events.slice(0, 2).map((event, i) => {
        const accent = campaignFor(event)?.accent ?? "#3e36ed";
        const place = i === 0 ? "right-0 top-4 z-10 rotate-[5deg] animate-[hw-float_7s_ease-in-out_infinite]" : "left-0 top-28 -rotate-[7deg] animate-[hw-float_9s_ease-in-out_1.5s_infinite]";
        return (
          <div
            key={event.id}
            className={`absolute w-[290px] overflow-hidden rounded-[24px] ring-1 ring-white/15 motion-reduce:animate-none ${place}`}
            style={{ boxShadow: `0 50px 100px -30px ${accent}` }}
          >
            <EventVisual event={event} className="aspect-[9/16]" />
          </div>
        );
      })}
    </div>
  );
}

/** Běžící pásek s nejbližšími akcemi a základními fakty. */
function Ticker({ events }: { events: PublicEvent[] }) {
  const items = [
    ...events.slice(0, 3).map((e) => `${e.name} · ${formatDayMonth(e.starts_at)}`),
    `${VENUE.name} · ${VENUE.city}`,
    "Předprodej na Eventlooku",
    `Seznamka ${APP_NAME} jen pro lidi z akce`,
    "Jen 18+",
  ];
  return (
    <div className="overflow-hidden bg-indigo py-3" aria-hidden>
      <div className="flex w-max animate-[hw-marquee_40s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((t) => (
              <span key={t} className="font-display flex items-center gap-6 px-6 text-[22px] tracking-wide text-white uppercase">
                {t}
                <span className="size-2 rounded-full bg-white/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight({ event }: { event: PublicEvent }) {
  const campaign = campaignFor(event);
  const href = eventHref(event);
  const accent = campaign?.accent ?? "#3e36ed";
  return (
    <section id="akce" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
      <div className="reveal hw-surface relative overflow-hidden rounded-[32px]" style={{ boxShadow: `0 40px 100px -40px ${accent}` }}>
        <div className="absolute -top-24 -left-24 size-72 rounded-full blur-3xl" style={{ background: accent, opacity: 0.35 }} aria-hidden />
        <div className="relative grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <WebLink href={href} className="group block">
            <EventVisual event={event} className="aspect-[4/5] h-full md:aspect-auto md:min-h-[520px]" />
          </WebLink>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="text-[13px] font-bold tracking-[0.22em] uppercase" style={{ color: accent }}>
              Nejbližší akce · za {daysUntilStart(event.starts_at)} dní
            </p>
            <h2 className="font-display gu-chrome mt-3 text-[44px] leading-[0.95] uppercase sm:text-[64px]">{event.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip icon="calendar">
                <span className="capitalize">{weekdayOf(event.starts_at)}</span> {formatDate(event.starts_at)}
              </Chip>
              <Chip icon="clock">od {formatTime(event.starts_at)}</Chip>
              <Chip icon="pin">{event.venue || VENUE.name}</Chip>
            </div>
            <p className="mt-5 max-w-lg text-[17px] leading-snug text-white/70">
              {event.description || campaign?.tagline || `${VENUE.name}, ${VENUE.street}, ${VENUE.city}.`}
            </p>
            <Countdown target={event.starts_at} liveText={`Právě teď v ${VENUE.name}`} className="mt-7 max-w-md" />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {event.tickets_url && (
                <a href={event.tickets_url} target="_blank" rel="noopener" className={btnWhite}>
                  <Icon name="ticket" className="size-5" /> Koupit vstupenku
                </a>
              )}
              <WebLink href={href} className={btnGhost}>
                Víc o akci <Icon name="chevron" className="size-4" />
              </WebLink>
              <a href={`${SITE_URL}/j/${event.join_code}`} className={`${btnGhost} text-accent`}>
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
      {/* Úvod: dav z K2, značka, slogan a plakáty nejbližších akcí */}
      <section className="relative overflow-hidden pt-16">
        <img src="/halloween/gallery/215.webp" alt="" className="absolute inset-0 size-full object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/40 to-night" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo/40 via-transparent to-accent/20 mix-blend-screen" aria-hidden />
        <div className="gu-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <span className="blob-drift absolute top-[10%] left-[5%] size-80 rounded-full bg-indigo/40 blur-3xl" />
          <span className="blob-drift absolute right-[8%] bottom-[10%] size-96 rounded-full bg-accent/25 blur-3xl [--drift-delay:-7s]" />
        </div>
        <div className="relative mx-auto grid min-h-[92svh] w-full max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pb-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <div className="rise-in flex flex-wrap gap-2">
              <Chip icon="pin">
                {VENUE.name} · {VENUE.city}
              </Chip>
              {next && (
                <Chip icon="calendar">
                  {next.name} · {formatDayMonth(next.starts_at)}
                </Chip>
              )}
            </div>
            <img src="/web/getup-mark.png" alt="" className="rise-in mt-6 h-16 w-auto drop-shadow-[0_12px_30px_rgb(0_0_0/0.6)] [--rise-delay:0.04s] sm:h-20" />
            <h1 className="rise-in font-display mt-5 max-w-4xl text-[48px] leading-[0.9] text-white uppercase [--rise-delay:0.08s] sm:text-[88px] lg:text-[92px]">
              Párty v Českých
              <br />
              <span className="gu-chrome">Budějovicích.</span>
            </h1>
            <p className="rise-in mt-6 max-w-xl text-[18px] leading-snug text-white/75 [--rise-delay:0.16s] sm:text-[21px]">
              GetUp dělá tematické večery v Klubu K2: Halloween, Tinder party, Semafor, X-mas a další. Předprodej na Eventlooku, seznamka{" "}
              {APP_NAME} jen pro lidi z akce.
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

      <Ticker events={upcoming} />

      {next ? (
        <Spotlight event={next} />
      ) : (
        <section id="akce" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionTitle kicker="Akce" title="Další akci právě chystáme" text="Sleduj Instagram, první se to dozvíš tam." />
        </section>
      )}

      {/* Čísla */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [formatNumber(events.length), `akcí od roku ${since}`],
            ["K2", `${VENUE.street}, ${VENUE.city}`],
            ["18+", "vstup jen pro dospělé"],
          ].map(([value, label]) => (
            <div key={label} className="hw-surface reveal rounded-[16px] p-5">
              <p className="font-display gu-chrome text-[52px] leading-none">{value}</p>
              <p className="mt-2 text-[14px] font-semibold text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Další akce */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle kicker="Program" title="Co dál chystáme" />
            <WebLink href="/akce" className={`${btnGhost} reveal`}>
              Všechny akce <Icon name="chevron" className="size-4" />
            </WebLink>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* GetCrush */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="reveal relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3a0b33] via-[#1b0818] to-night p-6 sm:p-10">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-accent/25 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-[10px] bg-white/10 px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-accent uppercase">
                <LogoMark className="size-4" /> {APP_NAME} by GetUp
              </span>
              <h2 className="font-display mt-4 text-[40px] leading-[0.95] text-white uppercase sm:text-[56px]">Seznamka jen pro lidi z akce</h2>
              <p className="mt-4 max-w-lg text-[17px] leading-snug text-white/75">
                Připoj se k akci, swipuj lidi, kteří tam jdou taky, a když se lajknete oba, ukážou se vám kontakty. Žádný chat do prázdna,
                potkáte se rovnou v K2. Zdarma, bez instalace, jen 18+.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE_URL}
                  className="tp-pink inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]"
                >
                  <Icon name="heart" className="size-5" /> Otevřít {APP_NAME}
                </a>
                <WebLink href="/tinder" className={btnGhost}>
                  Tinder party 16. 10. <Icon name="chevron" className="size-4" />
                </WebLink>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="grid size-28 place-items-center rounded-full bg-gradient-to-b from-[#ff9be9] to-accent shadow-[0_30px_60px_-24px_rgb(247_89_245/0.8)] sm:size-36">
                <LogoMark className="size-16 text-white sm:size-20" />
              </span>
              <span className="-mt-4 rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-ink shadow-[0_12px_30px_-14px_rgb(0_0_0/0.6)]">Je to match!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fotky */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle kicker="Atmosféra" title="Jak to u nás vypadá" text="Fotky z posledních akcí v K2. Další najdeš na Instagramu." />
        </div>
        <div className="no-scrollbar mt-8 flex snap-x gap-3 overflow-x-auto px-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
          {GALLERY.map((n, i) => (
            <div
              key={n}
              className={`reveal relative aspect-[4/5] w-44 shrink-0 snap-start overflow-hidden rounded-[16px] bg-coal transition duration-300 sm:w-56 lg:w-auto lg:hover:-translate-y-1.5 lg:hover:shadow-[0_30px_60px_-24px_rgb(62_54_237/0.6)] ${
                i % 2 ? "lg:hover:rotate-[1.5deg]" : "lg:hover:-rotate-[1.5deg]"
              }`}
            >
              <img src={`/halloween/gallery/${n}-800.webp`} alt="Párty GetUp v Klubu K2" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 hover:scale-110" />
            </div>
          ))}
        </div>
      </section>

      {/* Jak to u nás chodí + kde */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Info" title="Jak to u nás chodí" />
        <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {HOW.map((item) => (
              <div key={item.title} className="hw-surface reveal rounded-[16px] p-5">
                <span className="grid size-11 place-items-center rounded-[12px] bg-indigo/25 text-indigo-300">
                  <Icon name={item.icon} className="size-6" />
                </span>
                <p className="mt-4 text-[17px] font-bold text-white">{item.title}</p>
                <p className="mt-1.5 text-[14px] leading-snug text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
          <a
            href={VENUE.mapUrl}
            target="_blank"
            rel="noopener"
            className="hw-surface reveal group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[32px] p-6"
          >
            <img src="/halloween/gallery/218-800.webp" alt="" className="absolute inset-0 size-full object-cover opacity-40 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" aria-hidden />
            <div className="relative">
              <p className="text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">Kde nás najdeš</p>
              <p className="font-display mt-2 text-[40px] leading-none text-white uppercase">{VENUE.name}</p>
              <p className="mt-1 text-[15px] text-white/75">
                {VENUE.street}, {VENUE.city}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-indigo-300">
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
          className="reveal group relative block overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo via-[#7a3ff0] to-accent p-8 shadow-[0_40px_100px_-40px_rgb(247_89_245/0.8)] transition duration-300 hover:-translate-y-1 sm:p-12"
        >
          <span className="absolute -top-20 -right-20 size-72 rounded-full bg-white/15 blur-3xl transition duration-700 group-hover:scale-150" aria-hidden />
          <p className="relative text-[13px] font-bold tracking-[0.22em] text-white/80 uppercase">Instagram</p>
          <p className="font-display relative mt-2 text-[44px] leading-[0.95] text-white uppercase sm:text-[80px]">Sleduj {INSTAGRAM_HANDLE}</p>
          <p className="relative mt-3 max-w-xl text-[17px] leading-snug text-white/85">
            Stories z akcí, line-upy, soutěže a slevy na vstup. Napiš nám do DM, odpovídáme rychle.
          </p>
          <span className={`${btnWhite} relative mt-6`}>
            <Icon name="instagram" className="size-5" /> Otevřít Instagram
          </span>
        </a>
      </section>

      {/* Historie */}
      {past.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
          <div className="reveal hw-surface flex flex-col items-start justify-between gap-4 rounded-[32px] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-[13px] font-bold tracking-[0.22em] text-indigo-300 uppercase">Archiv</p>
              <p className="font-display mt-1 text-[32px] leading-none text-white uppercase sm:text-[40px]">
                {formatNumber(past.length)} proběhlých párty
              </p>
              <p className="mt-2 text-[15px] text-white/60">
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
