import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME } from "@/lib/config";
import { OPERATOR } from "@/lib/legal";
import { HalloweenContent } from "../halloween/content";
import { EVENT as HALLOWEEN } from "../halloween/event";
import { metalMania } from "../halloween/fonts";
import { Countdown } from "./countdown";
import { EVENT } from "./event";
import { TicketBar } from "./ticket-bar";
import { TinderTitle } from "./title";
import crowd from "../../../public/tinder/crowd.webp";
import dj from "../../../public/tinder/dj.webp";
import poster from "../../../public/tinder/poster.webp";

// Kampaňová stránka k Tinder party: grafika je z plakátu (public/tinder, podklady ze složky na Drive), fakta v ./event.ts.
// Fotky davu jsou skutečné fotky z akcí GetUp v K2 (public/halloween/gallery) přebarvené do růžova jako na plakátu.
// Pod Tinder party je celý obsah Halloweenu (../halloween/content.tsx) s odkazem v hlavičce; stejná stránka se
// vkládá na web get-up.fun (scripts/export-tinder-wordpress.mjs).

const NAV = [
  { href: "#jak", label: "Jak to funguje" },
  { href: "#aplikace", label: "Aplikace" },
  { href: "#sleva", label: "Sleva" },
  { href: "#info", label: "Info" },
  // Skok na Halloween níž na stránce (červeně jako jeho plakát)
  { href: "#halloween", label: "Halloween", accent: true },
];

const TICKER = [
  `${EVENT.weekday} ${EVENT.dateLabel}`,
  `${EVENT.venue} · ${EVENT.city}`,
  `Start ${EVENT.doors}`,
  `Hraje ${EVENT.lineup.join(", ")}`,
  `Předprodej na ${EVENT.ticketsLabel}`,
  `${APP_NAME}: jen lidi z akce`,
];

const STEPS = [
  {
    title: `Připoj se k ${EVENT.name}`,
    text: "Klikni na Připojit se, založ si účet e-mailem (bez hesla) a profil s fotkami. Rovnou jsi v akci, nic neskenuješ.",
  },
  {
    title: "Swipuj lidi z akce",
    text: `Od ${EVENT.swipingFrom} uvidíš jen ty, kdo jdou na ${EVENT.name}. Doprava lajk, doleva ne. Komu dáš lajk, nikdo neví.`,
  },
  {
    title: "Je to match! Ozvi se",
    text: `Lajknete se oba? Ukáže se vám Instagram, Snapchat nebo telefon a domluvíte se, kde se v ${EVENT.venue} potkáte.`,
  },
];

// Tři panely do Instagramu (public/tinder/post-*.webp), vedle sebe dávají jeden souvislý obrázek
const POSTS = [1, 2, 3];

const ticketLink = { href: EVENT.ticketsUrl, target: "_blank", rel: "noopener" } as const;
const joinHref = `/j/${EVENT.joinCode}`;

function SectionTitle({ kicker, title, className = "" }: { kicker: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[13px] font-bold tracking-[0.22em] text-accent uppercase">{kicker}</p>
      <h2 className="font-display mt-2 text-[40px] leading-[0.95] text-white uppercase sm:text-[56px]">{title}</h2>
    </div>
  );
}

/** Kolečko s křížkem / srdcem jako v nápisu na plakátu („aplikace ✕ pouze s lidmi ♥ z akce“). */
function Dot({ icon, className }: { icon: IconName; className: string }) {
  return (
    <span className={`mx-1 inline-grid size-[1.15em] place-items-center rounded-full align-[-0.2em] text-white ${className}`} aria-hidden>
      <Icon name={icon} className="size-[0.7em]" />
    </span>
  );
}

function Claim({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[20px] leading-[1.25] font-extrabold tracking-[0.04em] text-white uppercase sm:text-[24px] ${className}`}>
      Naše swipovací
      <Dot icon="x" className="bg-[#ff4b4b]" />
      aplikace
      <Dot icon="heart" className="bg-[#27d98a]" />
      pouze s lidmi z akce
    </p>
  );
}

function Highlight({ value, label, text }: { value: string; label: string; text: string }) {
  return (
    <div className="tp-surface rounded-[16px] p-5 sm:p-6">
      <p className="font-display tp-glow text-[44px] leading-none text-accent sm:text-[52px]">{value}</p>
      <p className="mt-2 text-[15px] font-bold tracking-[0.12em] text-white uppercase">{label}</p>
      <p className="mt-2 text-[14px] leading-snug text-white/65">{text}</p>
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
    <div className="tp-surface flex flex-col rounded-[16px] p-5">
      <span className="grid size-11 place-items-center rounded-[12px] bg-accent/15 text-accent">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 text-[13px] font-bold tracking-[0.2em] text-white/60 uppercase">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-[17px] leading-snug font-bold text-white first-of-type:mt-1">
          {line}
        </p>
      ))}
      {link && (
        <a
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
          className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-bold text-accent"
        >
          {link.label} <Icon name="chevron" className="size-4" />
        </a>
      )}
    </div>
  );
}

/** Avatar jen s iniciálou – fotky lidí z aplikace tu neukazujeme. */
function Initial({ letter, flip = false, className = "" }: { letter: string; flip?: boolean; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-2 border-white font-bold text-accent ${
        flip ? "bg-gradient-to-tl" : "bg-gradient-to-br"
      } from-accent-soft to-[#d9d6ff] ${className}`}
    >
      {letter}
    </span>
  );
}

/** Telefon s obrazovkou „Je to match!“ jako na plakátu: stejné prvky jako v aplikaci, jen zmenšené. */
function MatchPhone() {
  const contacts = [
    { icon: "instagram" as const, label: "Instagram", detail: "@natalie" },
    { icon: "snapchat" as const, label: "Snapchat", detail: "natalie" },
  ];
  return (
    <div className="relative mx-auto w-[248px] animate-[hw-float_7s_ease-in-out_infinite] motion-reduce:animate-none sm:w-[272px]">
      <div className="absolute inset-x-6 bottom-2 h-32 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative rounded-[46px] bg-[#1c1c1e] p-[9px] shadow-[0_40px_80px_-30px_rgb(247_89_245/0.7)] ring-1 ring-white/10">
        <div className="match-bg relative aspect-[9/19] overflow-hidden rounded-[38px] bg-white text-ink">
          <div className="absolute top-2.5 left-1/2 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
          <div className="flex h-full flex-col items-center px-4 pt-16 pb-5 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-gradient-to-b from-[#ff9be9] to-accent shadow-[0_24px_40px_-20px_rgb(247_89_245/0.8)]">
              <Icon name="heart" className="heartbeat size-10 text-white" />
            </span>
            <div className="-mt-4 flex">
              <Initial letter="P" className="-mr-2.5 size-12 border-[3px] text-[18px]" />
              <Initial letter="N" flip className="size-12 border-[3px] text-[18px]" />
            </div>
            <p className="mt-3 text-[22px] leading-tight font-bold">Je to match!</p>
            <p className="mt-1 text-[12px] text-muted">Ty a Natalie jste se lajkli. Ozvi se.</p>
            <div className="mt-4 grid w-full grid-cols-2 gap-2 text-left">
              {contacts.map((c) => (
                <span key={c.label} className="liquid-glass-light flex items-center gap-2 rounded-[14px] p-2">
                  <span className="fill-accent-soft grid size-8 shrink-0 place-items-center rounded-full">
                    <Icon name={c.icon} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] leading-tight font-bold">{c.label}</span>
                    <span className="block truncate text-[10px] leading-tight text-muted">{c.detail}</span>
                  </span>
                </span>
              ))}
            </div>
            <span className="fill-accent mt-auto w-full rounded-[12px] py-2.5 text-[13px] font-bold">Zobrazit profil</span>
            <span className="mt-2.5 text-[12px] font-bold text-accent">Swipovat dál</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TinderPage() {
  return (
    <div className="pb-20 md:pb-0">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/5 bg-plum/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="font-display text-[26px] leading-none tracking-wide text-white">
            GET<span className="text-accent">UP</span>
          </a>
          <nav className="hidden gap-7 text-[13px] font-bold tracking-[0.16em] text-white/60 uppercase md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className={`transition hover:text-white ${item.accent ? "text-ember" : ""}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {/* Na mobilu není navigace, skok na Halloween je proto vedle tlačítka se vstupenkami */}
            <a
              href="#halloween"
              className="hw-outline inline-flex items-center gap-1 rounded-[12px] px-3 py-2 text-[12px] font-bold tracking-[0.12em] text-white uppercase md:hidden"
            >
              Halloween <Icon name="chevron" className="size-3.5 rotate-90" />
            </a>
            <a {...ticketLink} className="tp-pink inline-flex items-center gap-2 rounded-[12px] px-4 py-2 text-[14px] font-bold transition active:scale-[0.97]">
              <Icon name="ticket" className="size-4" /> Vstupenky
            </a>
          </div>
        </div>
      </header>

      {/* Úvod: na mobilu plakát přes celou šířku, který se dole rozpouští do stránky; na širokém displeji chromový nápis
          z plakátu vlevo, plakát jako karta vpravo a přebarvený dav v pozadí */}
      <section id="top" className="relative overflow-hidden">
        <Image src={crowd} alt="" fill priority sizes="100vw" className="hidden object-cover object-center opacity-60 lg:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-plum via-plum/75 to-plum/15 lg:block" />
        <div className="tp-fog-bottom absolute inset-x-0 bottom-0 hidden h-56 lg:block" />

        <div className="relative mx-auto max-w-6xl lg:grid lg:min-h-[100svh] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-10 lg:px-6 lg:pt-20 lg:pb-16">
          <div className="relative pt-16 lg:order-2 lg:pt-0">
            <Image
              src={poster}
              alt={`Plakát ${EVENT.name}: ${EVENT.claim}, ${EVENT.dateLabel}, ${EVENT.venue} ${EVENT.city}, start ${EVENT.doors}`}
              priority
              sizes="(min-width: 1024px) 400px, 100vw"
              className="w-full lg:mx-auto lg:max-w-[400px] lg:rotate-2 lg:rounded-[32px] lg:shadow-[0_40px_80px_-30px_rgb(247_89_245/0.6)]"
            />
            {/* Mobil: spodek plakátu (logo GetUp) se rozpustí do stránky, datum a místo zůstanou čitelné */}
            <div className="tp-fog-bottom absolute inset-x-0 bottom-0 h-44 lg:hidden" />
          </div>

          <div className="relative -mt-12 px-4 pb-14 text-center sm:px-6 lg:order-1 lg:mt-0 lg:px-0 lg:pb-0 lg:text-left">
            <a {...ticketLink} className="tp-outline hidden items-center gap-2 rounded-[12px] px-4 py-1.5 text-[13px] font-bold tracking-[0.18em] text-white uppercase lg:inline-flex">
              Předprodej na <span className="font-script text-[22px] leading-none tracking-normal text-rose normal-case">{EVENT.ticketsLabel}</span>
            </a>

            {/* Na mobilu je nápis na plakátu nad tím, nadpis tu zůstává jen pro čtečky a vyhledávače */}
            <h1 className="lg:mt-6">
              <span className="hidden lg:block">
                <TinderTitle className="text-[160px] xl:text-[190px]" />
              </span>
              <span className="sr-only">
                {EVENT.name}: {EVENT.claim}
              </span>
            </h1>

            <p className="hidden items-center gap-2 text-[26px] font-bold text-white lg:flex">
              <LogoMark className="size-7 text-accent" /> {APP_NAME.toLowerCase()}
            </p>
            <Claim className="mt-5 hidden max-w-xl lg:block" />

            <p className="font-display mt-6 hidden flex-wrap items-baseline gap-x-3 text-[40px] leading-none text-white lg:flex">
              <span className="whitespace-nowrap">{EVENT.dateLabel}</span>
              <span className="text-accent">·</span>
              <span className="whitespace-nowrap">
                {EVENT.venue} <span className="text-accent">·</span> {EVENT.doors}
              </span>
            </p>
            <p className="text-[13px] font-bold tracking-[0.16em] text-white/60 uppercase lg:mt-2 lg:text-[14px]">
              {EVENT.weekday} · <span className="lg:hidden">start {EVENT.doors} · </span>
              {EVENT.venueStreet}, {EVENT.city} · jen 18+
            </p>

            <Countdown target={EVENT.startsAt} className="mx-auto mt-6 max-w-md lg:mx-0 lg:mt-8" />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:mt-8 lg:justify-start">
              <a {...ticketLink} className="tp-pink inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]">
                <Icon name="ticket" className="size-5" /> Koupit vstupenku
              </a>
              <a
                href={joinHref}
                className="tp-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[17px] font-bold text-white transition hover:bg-white/10 active:scale-[0.97]"
              >
                <LogoMark className="size-5 text-accent" /> Připojit se v {APP_NAME}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Běžící pásek s klíčovými údaji */}
      <div className="overflow-hidden bg-accent py-3" aria-hidden>
        <div className="flex w-max animate-[hw-marquee_36s_linear_infinite] motion-reduce:animate-none">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {TICKER.map((t) => (
                <span key={t} className="font-display flex items-center gap-6 px-6 text-[22px] tracking-wide text-white uppercase">
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
          <Highlight
            value={EVENT.swipingFrom}
            label="startuje swipování"
            text={`Profil si založ už teď. Lajkovat lidi z akce začneš ${EVENT.swipingFrom}, ať máš fotky a kontakt hotové.`}
          />
          <Highlight value="0 Kč" label={`${APP_NAME} je zdarma`} text="Běží v prohlížeči, nic neinstaluješ. Pro návštěvníky akcí GetUp nestojí nic." />
          <Highlight value={EVENT.doors} label={`start v ${EVENT.venue}`} text={`${EVENT.weekday} ${EVENT.dateLabel}, ${EVENT.venueStreet}, ${EVENT.city}.`} />
        </div>
      </section>

      {/* Jak to funguje */}
      <section id="jak" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Jak to funguje" title={`Tři kroky k rande v ${EVENT.venue}`} />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="tp-surface relative overflow-hidden rounded-[32px] p-6 sm:p-8">
              <div className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/20 blur-3xl" />
              <span className="font-display relative grid size-12 place-items-center rounded-[12px] bg-accent text-[26px] text-white">{i + 1}</span>
              <p className="relative mt-5 text-[20px] leading-tight font-bold text-white">{step.title}</p>
              <p className="relative mt-2 text-[15px] leading-snug text-white/65">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* GetCrush: seznamka pro návštěvníky akce, tlačítko připojí rovnou k Tinder party (/j/KÓD), bez QR kódu */}
      <section id="aplikace" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#3a0b33] via-[#1b0818] to-[#1b0818] p-6 sm:p-10">
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 size-72 rounded-full bg-indigo/30 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="order-1 md:order-2">
              <MatchPhone />
            </div>

            <div className="order-2 text-center md:order-1 md:text-left">
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-2 rounded-[10px] bg-white/10 px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-accent uppercase">
                  <LogoMark className="size-4" /> {APP_NAME} by GetUp
                </span>
                <span className="tp-outline inline-flex items-center rounded-[10px] px-3 py-1.5 text-[12px] font-bold tracking-[0.16em] text-white uppercase">
                  Swipování od {EVENT.swipingFrom}
                </span>
              </div>
              <h2 className="font-display mt-4 text-[40px] leading-[0.95] text-white uppercase sm:text-[56px]">
                Seznamka jen pro lidi z {EVENT.name}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[17px] leading-snug text-white/75 md:mx-0">
                V {APP_NAME} uvidíš jen lidi, kteří jdou na {EVENT.name} do {EVENT.venue}. Profil si založ už teď, od {EVENT.swipingFrom} lajkuj, a když se
                lajknete oba, ukážou se vám kontakty a domluvíte se, kde se potkáte.
              </p>
              <a
                href={joinHref}
                className="tp-pink mt-6 inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]"
              >
                <Icon name="heart" className="size-5" /> Připojit se k {EVENT.name}
              </a>
              <p className="mt-3 text-[12px] text-white/55">Zdarma, jen 18+. Nic neskenuješ: po registraci jsi rovnou v akci.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Atmosféra */}
      <section className="relative h-[72vh] min-h-[480px] overflow-hidden">
        <Image src={dj} alt={`Párty GetUp v ${EVENT.venue}`} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-plum/40" />
        <div className="tp-fog-top absolute inset-x-0 top-0 h-40" />
        <div className="tp-fog-bottom absolute inset-x-0 bottom-0 h-72" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
            <p className="font-script text-[34px] leading-none text-rose sm:text-[44px]">Hraje {EVENT.lineup.join(", ")}</p>
            <p className="font-display tp-glow mt-3 max-w-3xl text-[40px] leading-[0.95] text-white uppercase sm:text-[64px]">
              Akce, kvůli které {APP_NAME} vznikl.
            </p>
            <p className="mt-4 max-w-xl text-[17px] leading-snug text-white/80">
              {EVENT.name} je první večer, kde jede naše seznamka naostro. Celé Budějce v {EVENT.venue} a všichni v jedné aplikaci.
            </p>
          </div>
        </div>
      </section>

      {/* Sleva na vstup přes zprávy na Instagramu */}
      <section id="sleva" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="tp-surface relative overflow-hidden rounded-[32px] p-6 text-center sm:p-10">
          <div className="absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <span className="relative mx-auto grid size-14 place-items-center rounded-[16px] bg-accent/15 text-accent">
            <Icon name="instagram" className="size-7" />
          </span>
          <p className="relative mt-5 text-[13px] font-bold tracking-[0.22em] text-accent uppercase">Sleva na vstup</p>
          <h2 className="font-display relative mt-2 text-[40px] leading-[0.95] text-white uppercase sm:text-[56px]">
            Získej slevu, <span className="font-script text-rose normal-case">napiš nám do DM</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-[17px] leading-snug text-white/75">
            Pošli nám zprávu na Instagramu {EVENT.instagramHandle} a domluvíme ti slevu na vstup. Sleduj i naše stories, všechno důležité k akci
            jde tam.
          </p>
          <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={EVENT.instagramDm}
              target="_blank"
              rel="noopener"
              className="tp-pink inline-flex items-center justify-center gap-2 rounded-[12px] px-7 py-3.5 text-[17px] font-bold transition active:scale-[0.97]"
            >
              <Icon name="send" className="size-5" /> Napsat na Instagram
            </a>
            <a
              href={EVENT.instagram}
              target="_blank"
              rel="noopener"
              className="tp-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[17px] font-bold text-white transition hover:bg-white/10 active:scale-[0.97]"
            >
              <Icon name="instagram" className="size-5" /> Sledovat {EVENT.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      {/* Plakát, panely do Instagramu a sdílení */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle kicker="Vezmi partu" title="Pošli to dál" />
          <p className="mt-4 max-w-xl text-[17px] leading-snug text-white/65">
            Hoď plakát do stories nebo do skupiny a domluvte se dopředu. Tři panely vedle sebe dávají na Instagramu jeden souvislý obrázek.
          </p>
        </div>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:px-6 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-3 lg:gap-4 lg:overflow-visible">
          {POSTS.map((n) => (
            <div key={n} className="relative aspect-[4/5] w-[78vw] shrink-0 snap-center overflow-hidden rounded-[16px] bg-[#1b0818] sm:w-[340px] lg:w-auto">
              <Image
                src={`/tinder/post-${n}.webp`}
                alt={`${EVENT.name}, panel ${n} ze 3 do Instagramu`}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 340px, 78vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mx-auto mt-7 flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:px-6">
          <a
            href="/tinder/poster.webp"
            download="tinder-party-getup-2026.webp"
            className="tp-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[16px] font-bold text-white transition hover:bg-white/10 active:scale-[0.97]"
          >
            <Icon name="download" className="size-5" /> Stáhnout plakát
          </a>
          <a
            href="/tinder/banner.webp"
            download="tinder-party-getup-2026-banner.webp"
            className="tp-surface inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[16px] font-bold text-white transition hover:bg-white/10 active:scale-[0.97]"
          >
            <Icon name="share" className="size-5" /> Stáhnout banner
          </a>
        </div>
      </section>

      {/* Praktické info */}
      <section id="info" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle kicker="Info" title="Kdy, kde a jak" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon="clock" title="Kdy" lines={[`${EVENT.weekday} ${EVENT.dateLabel}`, `start ${EVENT.doors}`, `hraje ${EVENT.lineup.join(", ")}`]} />
          <InfoTile
            icon="pin"
            title="Kde"
            lines={[EVENT.venue, `${EVENT.venueStreet}, ${EVENT.city}`]}
            link={{ href: EVENT.mapUrl, label: "Otevřít mapu", external: true }}
          />
          <InfoTile
            icon="ticket"
            title="Vstupenky"
            lines={[`Předprodej na ${EVENT.ticketsLabel}`, "Slevu domluvíš v DM na Instagramu."]}
            link={{ href: EVENT.ticketsUrl, label: "Koupit vstupenku", external: true }}
          />
          <InfoTile
            icon="heart"
            title="Seznamka"
            lines={[`${APP_NAME} zdarma`, `swipování od ${EVENT.swipingFrom}, jen 18+`]}
            link={{ href: joinHref, label: "Připojit se" }}
          />
        </div>
      </section>

      {/* Halloween by GetUp pod Tinder party: stejný obsah jako /halloween (kotvy s předponou hw-), vlastní tmavý motiv a písmo */}
      <section id="halloween" className={`hw ${metalMania.variable} scroll-mt-16 bg-night text-bone`}>
        <div className="bg-blood px-4 py-2.5 text-center">
          <p className="font-metal text-[20px] tracking-wide text-white uppercase">
            Další akce GetUp: {HALLOWEEN.name} · {HALLOWEEN.weekday} {HALLOWEEN.dateLabel}
          </p>
        </div>
        <HalloweenContent idPrefix="hw-" />
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-[13px] text-white/60 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            <span className="font-display text-[22px] text-white">
              GET<span className="text-accent">UP</span>
            </span>
            <span className="ml-3">Párty a akce v Českých Budějovicích</span>
          </p>
          <nav className="flex flex-wrap justify-center gap-5 font-semibold">
            <a href={EVENT.instagram} target="_blank" rel="noopener" className="transition hover:text-white">
              Instagram
            </a>
            <a href={`mailto:${OPERATOR.email}`} className="transition hover:text-white">
              {OPERATOR.email}
            </a>
            <Link href="/podminky" className="transition hover:text-white">
              Podmínky
            </Link>
            <Link href="/soukromi" className="transition hover:text-white">
              Soukromí
            </Link>
          </nav>
        </div>
      </footer>

      {/* Galerie Halloweenu v překryvu, ovládá public/halloween/gallery.js */}
      <Script src="/halloween/gallery.js" strategy="afterInteractive" />

      <TicketBar href={EVENT.ticketsUrl} label={`Koupit vstupenku · ${EVENT.dateLabel}`} watch="top" hideIn="halloween" />
    </div>
  );
}
