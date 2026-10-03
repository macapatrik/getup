import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { FallbackImg } from "@/components/fallback-img";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME } from "@/lib/config";
import { OPERATOR } from "@/lib/legal";
import { Countdown } from "./countdown";
import { EVENT } from "./event";
import { TicketBar } from "./ticket-bar";
import crowd from "../../../public/halloween/gallery/215.webp";
import hero from "../../../public/halloween/hero.webp";
import poster from "../../../public/halloween/poster.webp";
import reaper from "../../../public/halloween/reaper.webp";
import title from "../../../public/halloween/title.webp";

// Kampaňová stránka k Halloweenu: podklady jsou z plakátu (public/halloween), fakta v ./event.ts.

const NAV = [
  { href: "#lineup", label: "Line-up" },
  { href: "#kostymy", label: "Kostýmy" },
  { href: "#seznamka", label: "Seznamka" },
  { href: "#info", label: "Info" },
];

const TICKER = [
  `${EVENT.weekday} ${EVENT.dateLabel}`,
  `${EVENT.venue} · ${EVENT.city}`,
  "2 stage",
  `Nejlepší kostým vyhraje ${EVENT.prize}`,
  `Start ${EVENT.doors}`,
  `Předprodej na ${EVENT.ticketsLabel}`,
];

const CONTEST_STEPS = [
  { title: "Přijď v kostýmu", text: "Čím víc si s ním vyhraješ, tím líp. Rekvizity, masky, líčení, všechno se počítá." },
  { title: "Užij si noc", text: "Porota chodí mezi lidmi na obou stagích, nemusíš se nikde hlásit." },
  { title: "Vyhlášení na hlavní stagi", text: `Nejlepší kostým večera si odnáší ${EVENT.prize}.` },
];

const CROWD = ["klara", "matej", "nikola", "tomas", "adela"];

// Fotky z Halloweenu 2025 (public/halloween/gallery, vybrané ze složky na Drive)
const GALLERY = ["058", "068", "092", "113", "121", "133", "146", "203", "207", "218", "256", "262"];

const ticketLink = { href: EVENT.ticketsUrl, target: "_blank", rel: "noopener" } as const;

function SectionTitle({ kicker, title, className = "" }: { kicker: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[13px] font-bold tracking-[0.22em] text-ember uppercase">{kicker}</p>
      <h2 className="font-metal mt-2 text-[40px] leading-[0.95] text-bone sm:text-[56px]">{title}</h2>
    </div>
  );
}

function Highlight({ value, label, text }: { value: string; label: string; text: string }) {
  return (
    <div className="hw-surface rounded-[16px] p-5 sm:p-6">
      <p className="font-metal hw-glow text-[44px] leading-none text-ember sm:text-[52px]">{value}</p>
      <p className="mt-2 text-[15px] font-bold tracking-[0.12em] text-bone uppercase">{label}</p>
      <p className="mt-2 text-[14px] leading-snug text-ash">{text}</p>
    </div>
  );
}

function InfoTile({
  icon,
  title,
  lines,
  link,
}: {
  icon: IconName;
  title: string;
  lines: string[];
  link?: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="hw-surface flex flex-col rounded-[16px] p-5">
      <span className="grid size-11 place-items-center rounded-[12px] bg-blood/15 text-ember">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 text-[13px] font-bold tracking-[0.2em] text-ash uppercase">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-[17px] leading-snug font-bold text-bone first-of-type:mt-1">
          {line}
        </p>
      ))}
      {link && (
        <a
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
          className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-bold text-ember"
        >
          {link.label} <Icon name="chevron" className="size-4" />
        </a>
      )}
    </div>
  );
}

function Avatar({ photo, className = "" }: { photo: string; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full border-2 border-coal bg-gradient-to-br from-accent-soft to-[#d9d6ff] ${className}`}>
      <FallbackImg src={`/people/${photo}.webp`} className="absolute inset-0 size-full object-cover" />
    </span>
  );
}

export default function HalloweenPage() {
  return (
    <div className="pb-20 md:pb-0">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-night/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="font-metal text-[26px] leading-none tracking-wide text-bone">
            GET<span className="text-ember">UP</span>
          </a>
          <nav className="hidden gap-7 text-[13px] font-bold tracking-[0.16em] text-ash uppercase md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-bone">
                {item.label}
              </a>
            ))}
          </nav>
          <a {...ticketLink} className="hw-red inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[14px] font-bold transition active:scale-[0.97]">
            <Icon name="ticket" className="size-4" /> Vstupenky
          </a>
        </div>
      </header>

      {/* Úvod: celoobrazovkový hřbitov z plakátu, titulek, odpočet a dvě akce */}
      <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover object-[68%_center] lg:object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/25 to-night/40 lg:bg-gradient-to-r lg:from-night/85 lg:via-night/35 lg:to-night/5" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-56" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pt-28 pb-20 sm:px-6 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pt-24">
          <div className="text-center lg:text-left">
            <a {...ticketLink} className="hw-outline inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[12px] font-bold tracking-[0.18em] text-bone uppercase sm:text-[13px]">
              Předprodej na <span className="text-ember">{EVENT.ticketsLabel}</span>
            </a>

            <h1 className="mt-7">
              <Image
                src={title}
                alt="Halloween"
                priority
                sizes="(min-width: 1024px) 680px, 100vw"
                className="mx-auto w-full max-w-[680px] drop-shadow-[0_18px_40px_rgb(224_20_28/0.45)] lg:mx-0"
              />
              <span className="sr-only">Halloween by GetUp</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[19px] leading-snug font-semibold text-bone sm:text-[23px] lg:mx-0">
              Nejlepší akce roku je zpátky.{" "}
              <span className="text-ash">Jedna noc, dvě stage a {EVENT.prize} pro nejlepší kostým.</span>
            </p>

            <p className="font-metal mt-6 flex flex-wrap items-baseline justify-center gap-x-3 text-[30px] leading-none text-bone sm:text-[40px] lg:justify-start">
              <span className="whitespace-nowrap">{EVENT.dateLabel}</span>
              <span className="hidden text-ember sm:inline">·</span>
              <span className="whitespace-nowrap">
                {EVENT.venue} <span className="text-ember">·</span> {EVENT.doors}
              </span>
            </p>
            <p className="mt-2 text-[14px] font-bold tracking-[0.16em] text-ash uppercase">
              {EVENT.weekday} · {EVENT.venueStreet}, {EVENT.city}
            </p>

            <Countdown target={EVENT.startsAt} className="mx-auto mt-8 max-w-md lg:mx-0" />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a {...ticketLink} className="hw-red inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]">
                <Icon name="ticket" className="size-5" /> Koupit vstupenku
              </a>
              <a
                href="#seznamka"
                className="hw-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[17px] font-bold text-bone transition hover:bg-white/8 active:scale-[0.97]"
              >
                <Icon name="users" className="size-5" /> Kdo tam jde se mnou?
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Běžící pásek s klíčovými údaji */}
      <div className="overflow-hidden bg-blood py-3" aria-hidden>
        <div className="flex w-max animate-[hw-marquee_36s_linear_infinite] motion-reduce:animate-none">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {TICKER.map((t) => (
                <span key={t} className="font-metal flex items-center gap-6 px-6 text-[22px] tracking-wide text-white uppercase">
                  {t}
                  <span className="size-2 rounded-full bg-white/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tři věci, které musíš vědět */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <Highlight value={EVENT.prize} label="za nejlepší kostým" text="Soutěž o nejlepší kostým večera. Přijď v masce, porota tě najde na parketu." />
          <Highlight value="2 stage" label="Mainstream / Rap a Techno" text="Dva parkety, dva zvuky. Přecházíš, jak se ti zrovna chce." />
          <Highlight value={EVENT.doors} label={`start v ${EVENT.venue}`} text={`${EVENT.weekday} ${EVENT.dateLabel}, ${EVENT.venueStreet}, ${EVENT.city}.`} />
        </div>
      </section>

      {/* Line-up */}
      <section id="lineup" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Line-up" title="Máme 2 stage" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {EVENT.stages.map((stage) => (
            <div key={stage.label} className="hw-surface relative overflow-hidden rounded-[32px] p-6 sm:p-8">
              <div className="absolute -top-16 -right-16 size-48 rounded-full bg-blood/20 blur-3xl" />
              <div className="relative flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold tracking-[0.2em] text-ash uppercase">{stage.label}</span>
                <span className="hw-outline rounded-[12px] px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] text-bone uppercase">{stage.genre}</span>
              </div>
              <ul className="relative mt-6 space-y-2">
                {stage.acts.map((act) => (
                  <li key={act} className="font-metal text-[42px] leading-none text-bone sm:text-[52px]">
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Kostýmová soutěž */}
      <section id="kostymy" className="relative scroll-mt-20 overflow-hidden py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative mx-auto w-full max-w-[360px] animate-[hw-float_7s_ease-in-out_infinite] motion-reduce:animate-none">
            <div className="absolute inset-x-8 bottom-4 h-28 rounded-full bg-blood/45 blur-3xl" />
            <Image src={reaper} alt="" sizes="(min-width: 768px) 360px, 80vw" className="relative w-full" />
          </div>
          <div>
            <SectionTitle kicker="Kostýmová soutěž" title={`Nejlepší kostým vyhraje ${EVENT.prize}`} />
            <p className="mt-5 max-w-lg text-[17px] leading-snug text-ash">
              Na Halloween by GetUp se v kostýmu nechodí jen tak. Každý rok to tu vypadá jako konkurz na horor a ten nejlepší si
              odnáší {EVENT.prize}.
            </p>
            <ol className="mt-7 space-y-4">
              {CONTEST_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-metal grid size-11 shrink-0 place-items-center rounded-[12px] bg-blood text-[24px] text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[17px] font-bold text-bone">{step.title}</p>
                    <p className="text-[15px] leading-snug text-ash">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Atmosféra */}
      <section className="relative h-[72vh] min-h-[480px] overflow-hidden">
        <Image src={crowd} alt={`${EVENT.name} v ${EVENT.venue}`} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-night/45" />
        <div className="hw-fog-top absolute inset-x-0 top-0 h-40" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-72" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
            <p className="font-metal hw-glow max-w-3xl text-[40px] leading-[0.95] text-bone sm:text-[64px]">
              Jedna noc v roce, na kterou se čeká celý rok.
            </p>
            <p className="mt-4 max-w-xl text-[17px] leading-snug text-bone/80">
              Halloween je naše největší akce. Loni masky, dvě stage a celé Budějce v jednom klubu. Letos navíc {EVENT.prize} pro
              nejlepší kostým.
            </p>
          </div>
        </div>
      </section>

      {/* Fotky z loňského ročníku */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle kicker="Halloween 2025" title="Jak to vypadalo loni" />
          <p className="mt-4 max-w-xl text-[17px] leading-snug text-ash">
            Kostýmy, dva parkety a soutěž o nejlepší masku. Letos výhra roste na {EVENT.prize}.
          </p>
        </div>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-4 lg:gap-4 lg:overflow-visible">
          {GALLERY.map((n, i) => (
            <button
              key={n}
              type="button"
              data-hw-photo={i}
              aria-label={`Zvětšit fotku ${i + 1} z ${GALLERY.length}`}
              className="group relative aspect-[3/2] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[16px] bg-coal sm:w-[360px] lg:w-auto"
            >
              <Image src={`/halloween/gallery/${n}.webp`} alt="Halloween by GetUp 2025 v Klubu K2" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 360px, 78vw" className="object-cover transition duration-300 group-hover:scale-105" />
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-[13px] text-ash">Klepni na fotku, listuje se tažením nebo šipkami.</p>

        {/* Překryv s velkými fotkami (ovládá public/halloween/gallery.js) */}
        <div id="hw-lightbox" className="fixed inset-0 z-[55] hidden flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Fotky z Halloweenu 2025" aria-hidden="true">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <span data-hw-count className="text-[14px] font-bold tracking-[0.2em] text-ash">
              1 / {GALLERY.length}
            </span>
            <button type="button" data-hw-close aria-label="Zavřít" className="hw-surface grid size-11 place-items-center rounded-full text-bone transition hover:bg-white/10">
              <Icon name="x" className="size-5" />
            </button>
          </div>
          <div data-hw-strip className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden">
            {GALLERY.map((n, i) => (
              <div key={n} data-hw-slide className="relative h-full w-full shrink-0 snap-center">
                <Image src={`/halloween/gallery/${n}.webp`} alt={`Halloween by GetUp 2025, fotka ${i + 1}`} fill sizes="100vw" className="pointer-events-none object-contain p-2 sm:p-6" />
              </div>
            ))}
          </div>
          <div className="hidden items-center justify-center gap-4 px-4 py-4 sm:flex">
            <button type="button" data-hw-prev aria-label="Předchozí fotka" className="hw-surface grid size-12 place-items-center rounded-full text-bone transition hover:bg-white/10">
              <Icon name="back" className="size-5" />
            </button>
            <button type="button" data-hw-next aria-label="Další fotka" className="hw-surface grid size-12 place-items-center rounded-full text-bone transition hover:bg-white/10">
              <Icon name="chevron" className="size-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Plakát a sdílení */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="relative mx-auto w-full max-w-[300px] -rotate-3 overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgb(224_20_28/0.55)]">
          <Image src={poster} alt={`Plakát ${EVENT.name} ${EVENT.dateLabel}`} sizes="300px" className="w-full" />
        </div>
        <div>
          <SectionTitle kicker="Vezmi partu" title="Pošli to dál" />
          <p className="mt-5 max-w-lg text-[17px] leading-snug text-ash">
            Hoď plakát do stories nebo do skupiny a domluvte kostýmy dopředu. Novinky, soutěže a line-up najdeš na Instagramu{" "}
            <a href={EVENT.instagram} target="_blank" rel="noopener" className="font-bold text-bone">
              {EVENT.instagramHandle}
            </a>
            .
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/halloween/poster.webp"
              download="halloween-by-getup-2026.webp"
              className="hw-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[16px] font-bold text-bone transition hover:bg-white/8 active:scale-[0.97]"
            >
              <Icon name="download" className="size-5" /> Stáhnout plakát
            </a>
            <a
              href={EVENT.instagram}
              target="_blank"
              rel="noopener"
              className="hw-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[16px] font-bold text-bone transition hover:bg-white/8 active:scale-[0.97]"
            >
              <Icon name="share" className="size-5" /> Sledovat {EVENT.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      {/* GetCrush: seznamka pro návštěvníky akce (teaser, spouštíme před akcí) */}
      <section id="seznamka" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#2b0b3d] via-coal to-coal p-6 sm:p-10">
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 size-72 rounded-full bg-indigo/30 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="order-1 flex flex-col items-center md:order-2">
              <div className="flex">
                {CROWD.map((photo, i) => (
                  <Avatar key={photo} photo={photo} className={`size-14 sm:size-20 ${i > 0 ? "-ml-4" : ""}`} />
                ))}
              </div>
              <div className="-mt-4 flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-ink shadow-[0_12px_30px_-14px_rgb(0_0_0/0.6)]">
                <span className="relative flex">
                  <Avatar photo="patrik" className="size-8 !border-white" />
                  <Avatar photo="tereza" className="-ml-2.5 size-8 !border-white" />
                  <span className="fill-accent absolute -bottom-1 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full border border-white shadow-none">
                    <Icon name="heart" className="size-2.5" />
                  </span>
                </span>
                <span className="text-[13px] font-bold">Je to match!</span>
              </div>
            </div>

            <div className="order-2 text-center md:order-1 md:text-left">
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-2 rounded-[10px] bg-white/10 px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-accent uppercase">
                  <LogoMark className="size-4" /> {APP_NAME} by GetUp
                </span>
                <span className="hw-outline inline-flex items-center rounded-[10px] px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-bone uppercase">
                  Připravujeme
                </span>
              </div>
              <h2 className="font-metal mt-4 text-[40px] leading-[0.95] text-bone sm:text-[56px]">Seznamka jen pro lidi z Halloweenu</h2>
              <p className="mx-auto mt-4 max-w-lg text-[17px] leading-snug text-bone/80 md:mx-0">
                Chystáme pro vás {APP_NAME}: aplikaci, ve které uvidíš jen ty, kdo jdou na stejnou akci. Lajk, match, chat a
                domluva, kde se v K2 potkáte. Spouštíme před Halloweenem.
              </p>
              <a
                href={EVENT.instagram}
                target="_blank"
                rel="noopener"
                className="fill-accent mt-6 inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]"
              >
                <Icon name="heart" className="size-5" /> Sledovat novinky
              </a>
              <p className="mt-3 text-[12px] text-ash">Jen pro 18+. Spuštění oznámíme na Instagramu {EVENT.instagramHandle}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Praktické info */}
      <section id="info" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Info" title="Kdy, kde a jak" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon="clock" title="Kdy" lines={[`${EVENT.weekday} ${EVENT.dateLabel}`, `start ${EVENT.doors}`]} />
          <InfoTile
            icon="pin"
            title="Kde"
            lines={[EVENT.venue, `${EVENT.venueStreet}, ${EVENT.city}`]}
            link={{ href: EVENT.mapUrl, label: "Otevřít mapu", external: true }}
          />
          <InfoTile
            icon="ticket"
            title="Vstupenky"
            lines={[`Předprodej na ${EVENT.ticketsLabel}`, "V předprodeji máš místo jisté."]}
            link={{ href: EVENT.ticketsUrl, label: "Koupit vstupenku", external: true }}
          />
          <InfoTile icon="users" title="Kostým" lines={["Přijď v masce", `nejlepší bere ${EVENT.prize}`]} link={{ href: "#kostymy", label: "Jak to funguje" }} />
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-[13px] text-ash sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            <span className="font-metal text-[22px] text-bone">
              GET<span className="text-ember">UP</span>
            </span>
            <span className="ml-3">Párty a akce v Českých Budějovicích</span>
          </p>
          <nav className="flex flex-wrap justify-center gap-5 font-semibold">
            <a href={EVENT.instagram} target="_blank" rel="noopener" className="transition hover:text-bone">
              Instagram
            </a>
            <a href={`mailto:${OPERATOR.email}`} className="transition hover:text-bone">
              {OPERATOR.email}
            </a>
            <Link href="/podminky" className="transition hover:text-bone">
              Podmínky
            </Link>
            <Link href="/soukromi" className="transition hover:text-bone">
              Soukromí
            </Link>
          </nav>
        </div>
      </footer>

      {/* Galerie v překryvu, ovládá public/halloween/gallery.js */}
      <Script src="/halloween/gallery.js" strategy="afterInteractive" />

      <TicketBar href={EVENT.ticketsUrl} label={`Koupit vstupenku · ${EVENT.dateLabel}`} watch="top" />
    </div>
  );
}
