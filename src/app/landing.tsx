import Link from "next/link";
import type { ReactNode } from "react";
import { FallbackImg } from "@/components/fallback-img";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MadeBy } from "@/components/made-by";
import { btnPrimary, btnSecondary } from "@/components/ui";
import { APP_NAME } from "@/lib/config";
import { isJoinable } from "@/lib/events";
import { EVENT } from "./halloween/event";

// Skutečné fotky z akcí GetUp (stejné jako na /halloween). Konkrétní lidi z aplikace tu neukazujeme.
const GALLERY = ["215", "113", "146", "068", "203", "256"];

// Odkaz /j/KÓD připojí k akci hned po přihlášení a vyplnění profilu, bez skenování QR kódu.
const JOIN_HREF = `/j/${EVENT.joinCode}`;

// Liquid glass: světlá skleněná bublina na bílém pozadí a tmavší na fotce v telefonu.
const glassPill = "liquid-glass-light inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold text-accent";
const glassChip = "liquid-glass inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium";

const steps = (joinable: boolean): { icon: IconName; title: string; text: string }[] => [
  {
    icon: "qr",
    title: "Připoj se k akci",
    text: joinable
      ? `Na ${EVENT.name} tě připojíme rovnou po registraci, nic neskenuješ. Účet založíš e-mailem za minutu, bez hesla.`
      : "Naskenuj QR kód u vstupu nebo klikni na odkaz ze vstupenky. Účet založíš e-mailem za minutu, bez hesla.",
  },
  {
    icon: "heart",
    title: "Swipuj lidi z akce",
    text: "Uvidíš jen ty, kdo jdou na stejnou akci jako ty. Klidně už týdny předem. Komu dáváš lajk, nikdo neví.",
  },
  {
    icon: "instagram",
    title: "Match = kontakt",
    text: "Lajknete se oba? Ukáže se vám Instagram, Snapchat nebo telefon a domluvíte se, kde se na akci potkáte.",
  },
];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "users", title: "Jen lidi z tvé akce", text: "Žádní lidi odnikud. Každý, koho uvidíš, jde tam, kam ty." },
  { icon: "ticket", title: "Zdarma", text: "Pro návštěvníky akcí GetUp nestojí nic." },
  {
    icon: "user",
    title: "Soukromí",
    text: "Profil vidí jen lidi ze stejné akce, kontakty jen tvoje matche. Místo data narození jen věk.",
  },
  {
    icon: "shield",
    title: "Bezpečí",
    text: "Nevhodné chování nahlásíš z matche. Tým GetUp profily kontroluje a účty porušující pravidla blokuje.",
  },
  { icon: "compass", title: "Bez instalace", text: "Běží v prohlížeči, na plochu telefonu si ji přidáš jedním klepnutím." },
  { icon: "bell", title: "Upozornění na match", text: "Když se lajknete, hned ti to pípne. Nic ti neuteče." },
];

const faq = (joinable: boolean): { q: string; a: string }[] => [
  { q: "Kolik to stojí?", a: `Nic. Pro návštěvníky akcí GetUp je ${APP_NAME} zdarma.` },
  {
    q: "Kdo uvidí můj profil?",
    a: "Jen lidi připojení ke stejné akci, kteří hledají někoho jako ty. Kontakty uvidí jen ten, s kým máš match. Na akci se můžeš i úplně skrýt.",
  },
  {
    q: "Musím si něco instalovat?",
    a: `Ne. ${APP_NAME} běží v prohlížeči. Na iPhonu si ho přes Sdílet → Přidat na plochu uložíš jako aplikaci.`,
  },
  {
    q: "Jak se připojím k akci?",
    a: joinable
      ? `Na ${EVENT.name} stačí kliknout na Začít, připojíme tě hned po registraci. Na další akce naskenuješ QR kód u vstupu, klikneš na odkaz ze vstupenky, nebo v aplikaci zadáš kód akce.`
      : "Naskenuj QR kód u vstupu, klikni na odkaz ze vstupenky, nebo v aplikaci zadej kód akce.",
  },
  {
    q: "Proč tu není chat?",
    a: "Chaty po dvou zprávách umírají. Po matchi dostanete rovnou kontakty a domluvíte se tam, kde si běžně píšete.",
  },
  {
    q: "Co když mě někdo obtěžuje?",
    a: "Zruš match a člověka nahlas. Tým GetUp nahlášení řeší a účet, který porušuje pravidla, zablokuje.",
  },
];

/** Avatar jen s iniciálou – na úvodu neukazujeme fotky skutečných ani vymyšlených lidí. */
function Initial({ letter, flip = false, className = "" }: { letter: string; flip?: boolean; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-2 border-white font-bold text-accent shadow-[0_6px_14px_-6px_rgb(62_54_237/0.35)] ${
        flip ? "bg-gradient-to-tl" : "bg-gradient-to-br"
      } from-accent-soft to-[#d9d6ff] ${className}`}
    >
      {letter}
    </span>
  );
}

function SectionHead({ badge, title, text, center = false }: { badge: string; title: ReactNode; text?: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : "text-center lg:text-left"}>
      <span className={glassPill}>{badge}</span>
      <h2 className="mt-3 text-[30px] leading-[1.1] font-bold lg:text-[38px]">{title}</h2>
      {text && <p className={`mt-3 text-[16px] leading-snug text-muted ${center ? "mx-auto max-w-md" : "mx-auto max-w-md lg:mx-0"}`}>{text}</p>}
    </div>
  );
}

/** Akční tlačítka: v režimu „připravujeme“ vedou na akci a Instagram, jinak na přihlášení (případně rovnou na akci). */
function Ctas({ comingSoon, startHref, secondary }: { comingSoon: boolean; startHref: string; secondary: "how" | "instagram" }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {comingSoon ? (
        <Link href="/halloween" className={`${btnPrimary} py-3.5 sm:px-8`}>
          {EVENT.name}
        </Link>
      ) : (
        <a href={startHref} className={`${btnPrimary} py-3.5 sm:px-10`}>
          Začít
        </a>
      )}
      {comingSoon || secondary === "instagram" ? (
        <a href={EVENT.instagram} target="_blank" rel="noopener" className={`${btnSecondary} py-3.5`}>
          <Icon name="instagram" className="size-5" /> Sledovat {EVENT.instagramHandle}
        </a>
      ) : (
        <a href="#jak" className={`${btnSecondary} py-3.5`}>
          Jak to funguje
        </a>
      )}
    </div>
  );
}

/** Telefon s ukázkou swipování – stejné prvky jako v aplikaci, jen zmenšené. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[248px] sm:w-[272px]">
      <div className="rounded-[46px] bg-ink p-[9px] shadow-[0_40px_80px_-30px_rgb(62_54_237/0.6)]">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[38px] bg-white">
          <div className="absolute top-2.5 left-1/2 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-ink" />
          <div className="flex h-full flex-col px-3 pt-11 pb-3">
            <div className="flex items-center gap-1.5">
              <Icon name="back" className="size-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[13px] leading-tight font-bold">{EVENT.name}</p>
                <p className="truncate text-[10px] font-medium text-muted">
                  {EVENT.venue}, {EVENT.city}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <span className="fill-accent-soft inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-[10px] font-semibold">
                <Icon name="clock" className="size-3" /> {EVENT.dateLabel}
              </span>
              <span className="fill-soft inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-[10px] font-semibold text-muted">
                <Icon name="users" className="size-3" /> 19 lidí
              </span>
            </div>
            <div className="relative mt-2.5 flex-1 overflow-hidden rounded-[24px] bg-gradient-to-br from-accent-soft to-[#d9d6ff]">
              <FallbackImg src="/halloween/gallery/113-800.webp" className="absolute inset-0 size-full scale-125 object-cover blur-[6px]" />
              <div className="photo-fade absolute inset-x-0 bottom-0 h-2/3" />
              <span className="absolute top-[38%] left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center liquid-glass rounded-full">
                <Icon name="user" className="size-7" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-3 pb-8 text-white">
                <p className="text-[17px] leading-tight font-semibold">Lidi z tvé akce</p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/80">Uvidíš je hned po připojení</p>
                <div className="mt-1.5 flex gap-1.5">
                  <span className={glassChip}>
                    <Icon name="pin" className="size-3" /> {EVENT.venue}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative -mt-5 flex items-center justify-center gap-3">
              <span className="shadow-indigo grid size-9 place-items-center rounded-full bg-white text-indigo">
                <Icon name="x" className="size-4" />
              </span>
              <span className="shadow-indigo grid size-12 place-items-center rounded-full bg-white text-accent">
                <Icon name="heart" className="heartbeat size-6" />
              </span>
              <span className="shadow-indigo grid size-9 place-items-center rounded-full bg-white text-indigo">
                <Icon name="info" className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lajk, match a kontakt: srdce tepne, pak naskočí „Je to match!“ a po něm Instagram, obě ze strany telefonu */}
      <div className="liquid-glass-light bubble-pop absolute top-[27%] -left-8 flex origin-right items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 [--pop-delay:0.5s] sm:-left-16">
        <span className="relative flex">
          <Initial letter="P" className="size-8 text-[13px]" />
          <Initial letter="T" flip className="-ml-2.5 size-8 text-[13px]" />
          <span className="fill-accent absolute -bottom-1 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full border border-white">
            <Icon name="heart" className="size-2.5" />
          </span>
        </span>
        <span className="text-[13px] font-bold">Je to match!</span>
      </div>

      <div className="liquid-glass-light bubble-pop absolute top-[50%] -right-8 flex origin-left items-center gap-2.5 rounded-[16px] py-2 pr-3.5 pl-2 [--pop-delay:1.9s] [--pop-tilt:3deg] sm:-right-16">
        <span className="fill-accent-soft grid size-8 place-items-center rounded-full">
          <Icon name="instagram" className="size-4" />
        </span>
        <span className="text-left">
          <span className="block text-[12px] leading-tight font-bold">Instagram</span>
          <span className="block text-[11px] leading-tight text-muted">@tereza.k</span>
        </span>
      </div>
    </div>
  );
}

/** Ukázka obrazovky „Je to match!“ s kontakty protějšku. */
function MatchMock() {
  return (
    <div className="match-bg surface mx-auto w-full max-w-sm rounded-[32px] px-5 pt-8 pb-6 text-center shadow-[0_30px_60px_-30px_rgb(247_89_245/0.45)]">
      <span className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-b from-[#ff9be9] to-accent shadow-[0_30px_50px_-24px_rgb(247_89_245/0.75)]">
        <Icon name="heart" className="size-12 text-white" />
      </span>
      <div className="-mt-5 flex justify-center">
        <Initial letter="P" className="-mr-3 size-16 border-4 text-[24px]" />
        <Initial letter="T" flip className="size-16 border-4 text-[24px]" />
      </div>
      <p className="mt-4 text-[26px] leading-tight font-bold">Je to match!</p>
      <p className="mt-1 text-[14px] text-muted">Ty a Tereza jste se lajkli. Ozvi se.</p>
      <div className="mt-5 grid grid-cols-2 gap-2.5 text-left">
        {[
          { icon: "instagram" as const, label: "Instagram", detail: "@tereza.k" },
          { icon: "snapchat" as const, label: "Snapchat", detail: "terka.k" },
        ].map((c) => (
          <span key={c.label} className="liquid-glass-light flex items-center gap-2.5 rounded-[16px] p-2.5">
            <span className="fill-accent-soft grid size-9 shrink-0 place-items-center rounded-full">
              <Icon name={c.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] leading-tight font-bold">{c.label}</span>
              <span className="block truncate text-[12px] leading-tight text-muted">{c.detail}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Úvodní stránka pro nepřihlášené. V režimu „připravujeme“ (COMING_SOON=1) bez přihlášení, jen s odkazy na akci. */
export function Landing({ comingSoon }: { comingSoon: boolean }) {
  const joinable = isJoinable(EVENT.startsAt);
  const startHref = joinable ? JOIN_HREF : "/login";

  return (
    // overflow-x-clip: skvrny za úvodem jdou přes celou šířku okna a nesmí přidat vodorovný posuvník
    <div className="overflow-x-clip">
      <main className="mx-auto max-w-md px-4 pt-safe pb-10 lg:max-w-5xl lg:px-8">
        <header className="flex items-center justify-between pt-2">
          <Logo tagline />
          {comingSoon ? (
            <span className={glassPill}>
              <Icon name="clock" className="size-4" /> Připravujeme
            </span>
          ) : (
            <Link href="/login" className={`${btnSecondary} !px-4 !py-2 !text-[14px]`}>
              Přihlásit se
            </Link>
          )}
        </header>

        {/* Úvod */}
        <section className="relative isolate mt-10 lg:mt-16 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
          {/* Barevné skvrny za sklem. Přes celou šířku okna a bez ořezu, ať nemají ostrou hranu (vodorovně ořízne obal stránky). */}
          <div aria-hidden className="pointer-events-none absolute -top-48 -bottom-10 left-1/2 -z-10 w-screen -translate-x-1/2">
            <span className="absolute top-[14%] left-[8%] size-72 rounded-full bg-accent/25 blur-3xl lg:left-[18%]" />
            <span className="absolute top-[38%] right-[-10%] size-80 rounded-full bg-[#b9b4ff]/45 blur-3xl" />
            <span className="absolute bottom-[6%] left-[-12%] size-64 rounded-full bg-[#ff9be9]/30 blur-3xl" />
          </div>
          <div className="text-center lg:text-left">
            <span className={glassPill}>
              <Icon name="ticket" className="size-4" /> Seznamka pro návštěvníky akcí GetUp
            </span>
            <h1 className="mt-5 text-[44px] leading-[1.02] font-bold lg:text-[64px]">
              Potkej lidi
              <br />
              <span className="text-accent">z&nbsp;akce.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[17px] leading-snug text-muted lg:mx-0 lg:max-w-md lg:text-[19px]">
              Uvidíš jen lidi, kteří jdou na stejnou akci jako ty. Swipuj už před akcí, a když se lajknete oba, ukážou se vám
              kontakty a potkáte se na místě.
            </p>
            <div className="mx-auto mt-7 max-w-sm lg:mx-0 lg:max-w-none">
              <Ctas comingSoon={comingSoon} startHref={startHref} secondary="how" />
            </div>
            <p className="mt-4 text-[13px] font-medium text-muted">
              {comingSoon
                ? `Spouštíme na Halloweenu ${EVENT.dateLabel.replace(/ /g, " ")} v Klubu K2.`
                : joinable
                  ? `Zdarma · jen 18+ · rovnou tě připojíme na ${EVENT.name}`
                  : "Zdarma · jen 18+ · bez instalace"}
            </p>
          </div>

          <div className="mt-14 lg:mt-0">
            <PhoneMock />
          </div>
        </section>

        <section className="mt-16 lg:mt-24">
          <p className="text-center text-[15px] font-bold">Akce GetUp, kde se potkáte</p>
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
            {GALLERY.map((photo) => (
              <span
                key={photo}
                className="relative block aspect-[3/4] w-36 shrink-0 snap-start overflow-hidden rounded-[16px] bg-coal sm:w-44 lg:w-auto"
              >
                <FallbackImg src={`/halloween/gallery/${photo}-800.webp`} className="absolute inset-0 size-full object-cover" />
              </span>
            ))}
          </div>
        </section>

        {/* Jak to funguje */}
        <section id="jak" className="mt-20 scroll-mt-6 lg:mt-28">
          <SectionHead badge="Jak to funguje" title="Tři kroky k rande na akci" center />
          <ol className="mt-8 grid gap-3 lg:grid-cols-3 lg:gap-5">
            {steps(joinable).map((step, i) => (
              <li key={step.title} className="surface relative rounded-[16px] p-5">
                <span className="absolute top-4 right-5 text-[40px] leading-none font-bold text-accent-soft">{i + 1}</span>
                <span className="fill-accent-soft grid size-12 place-items-center rounded-[12px]">
                  <Icon name={step.icon} className="size-6" />
                </span>
                <p className="mt-4 text-[18px] font-bold">{step.title}</p>
                <p className="mt-1 text-[15px] leading-snug text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Po matchi */}
        <section className="mt-20 lg:mt-28 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          <SectionHead
            badge="Po matchi"
            title={
              <>
                Žádný chat.
                <br />
                <span className="text-accent">Rovnou kontakt.</span>
              </>
            }
            text="Chaty po dvou zprávách umírají. Když se lajknete oba, uvidíte na sebe Instagram, Snapchat nebo telefon, který si každý sám vyplní. Domluvíte se, kde se na akci potkáte."
          />
          <div className="mt-8 lg:mt-0">
            <MatchMock />
          </div>
        </section>

        {/* Proč */}
        <section className="mt-20 lg:mt-28">
          <SectionHead badge={`Proč ${APP_NAME}`} title="Seznamka, která dává smysl" center />
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="surface rounded-[16px] p-4 lg:p-5">
                <span className="fill-accent-soft grid size-10 place-items-center rounded-full">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <p className="mt-3 text-[16px] leading-tight font-bold">{f.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted lg:text-[14px]">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Nejbližší akce */}
        {joinable && (
          <section className="mt-20 lg:mt-28">
            <SectionHead badge="Nejbližší akce" title={`Poprvé na ${EVENT.name}`} center />
            <div className="surface mx-auto mt-8 grid max-w-3xl overflow-hidden rounded-[32px] sm:grid-cols-[220px_1fr]">
              <div className="relative h-56 bg-coal sm:h-auto">
                <FallbackImg src="/halloween/poster-540.webp" className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[24px] leading-tight font-bold">{EVENT.name}</p>
                <ul className="mt-3 space-y-2 text-[15px] text-muted">
                  <li className="flex items-center gap-2">
                    <Icon name="calendar" className="size-5 shrink-0 text-accent" />
                    <span className="capitalize">{EVENT.weekday}</span> {EVENT.dateLabel} od {EVENT.doors}
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="pin" className="size-5 shrink-0 text-accent" />
                    {EVENT.venue}, {EVENT.city}
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="users" className="size-5 shrink-0 text-accent" />
                    {EVENT.stages.map((s) => s.genre).join(" · ")}
                  </li>
                </ul>
                <p className="mt-4 text-[14px] leading-snug">
                  {comingSoon
                    ? `Na akci uvidíš v ${APP_NAME} všechny, kdo tam jdou.`
                    : `V ${APP_NAME} uvidíš všechny, kdo tam jdou. Klikni na Připojit se a po registraci jsi rovnou v akci, nic neskenuješ.`}
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  {!comingSoon && (
                    <a href={JOIN_HREF} className={`${btnPrimary} !py-3 !text-[16px]`}>
                      <Icon name="heart" className="size-5" /> Připojit se
                    </a>
                  )}
                  <a
                    href={EVENT.ticketsUrl}
                    target="_blank"
                    rel="noopener"
                    className={`${comingSoon ? btnPrimary : btnSecondary} !py-3 !text-[16px]`}
                  >
                    <Icon name="ticket" className="size-5" /> Vstupenky
                  </a>
                  <Link href="/halloween" className="inline-flex items-center justify-center px-2 py-3 text-[15px] font-bold text-accent">
                    Víc o akci
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Otázky */}
        <section className="mt-20 lg:mt-28">
          <SectionHead badge="Otázky" title="Na co se lidi ptají" center />
          <div className="mx-auto mt-8 max-w-3xl space-y-2.5">
            {faq(joinable).map((item) => (
              <details key={item.q} className="surface group rounded-[16px] px-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[16px] font-bold">
                  {item.q}
                  <Icon name="chevron" className="size-4 shrink-0 text-muted transition group-open:rotate-90" />
                </summary>
                <p className="-mt-1 pb-4 text-[15px] leading-snug text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Závěr */}
        <section className="match-bg surface mt-20 rounded-[32px] px-5 py-10 text-center lg:mt-28 lg:py-14">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-b from-[#ff9be9] to-accent shadow-[0_24px_40px_-20px_rgb(247_89_245/0.75)]">
            <Icon name="heart" className="size-8 text-white" />
          </span>
          <h2 className="mt-5 text-[30px] leading-[1.1] font-bold lg:text-[40px]">
            Uvidíme se <span className="text-accent">na akci?</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[16px] leading-snug text-muted">
            {comingSoon
              ? `${APP_NAME} otevíráme na Halloweenu. Sleduj nás, ať ti spuštění neuteče.`
              : "Založ si profil, připoj se k akci a začni swipovat."}
          </p>
          <div className="mx-auto mt-7 max-w-sm sm:max-w-none sm:[&>div]:justify-center">
            <Ctas comingSoon={comingSoon} startHref={startHref} secondary="instagram" />
          </div>
        </section>

        <footer className="mt-10 text-center">
          <p className="text-[12px] text-muted">
            Jen pro 18+ ·{" "}
            <Link href="/podminky" className="font-semibold text-accent">
              Podmínky užití
            </Link>{" "}
            ·{" "}
            <Link href="/soukromi" className="font-semibold text-accent">
              Ochrana soukromí
            </Link>
          </p>
          <MadeBy className="mt-3" />
        </footer>
      </main>
    </div>
  );
}
