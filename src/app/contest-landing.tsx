import Link from "next/link";
import { HalloweenMode } from "@/components/halloween-mode";
import { Icon, type IconName } from "@/components/icons";
import { MadeBy } from "@/components/made-by";
import { COSTUME_PRIZE } from "@/lib/config";
import { EVENT } from "./halloween/event";

// Úvod halloweenské adresy (halloween.get-up.fun): jen soutěž o nejlepší kostým, žádná seznamka.
export const CONTEST_START = `/j/${EVENT.joinCode}?soutez=1`;

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "cameraPlus", title: "Nahraj svůj kostým", text: "Vyfoť se v kostýmu a přihlas se do soutěže. Fotka se hned objeví v galerii." },
  { icon: "heart", title: "Dej jeden hlas", text: "Vyber nejlepší kostým večera. Každý má jen jeden hlas a ten už nejde změnit." },
  { icon: "users", title: "Sleduj živé pořadí", text: "Hlasy naskakují v reálném čase. Vítěze vyhlásíme na hlavní stagi." },
];

const btnRed =
  "hw-red inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-4 text-[18px] font-bold transition active:scale-[0.97]";

export function ContestLanding() {
  return (
    <div className="hw min-h-dvh bg-night text-bone">
      <section className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <img src="/halloween/hero-1200.webp" alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />
        <div className="hw-fog-top absolute inset-x-0 top-0 h-24" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-56" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-safe">
          <span className="hw-outline mt-2 rounded-[10px] px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase">
            Soutěž o kostým
          </span>
          <Link href="/login?next=%2Fj%2FHALLO26%3Fsoutez%3D1" className="mt-2 rounded-[10px] bg-black/45 px-3.5 py-1.5 text-[14px] font-bold backdrop-blur">
            Přihlásit se
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-4 px-6 text-center">
          <img src="/halloween/title-900.webp" alt="Halloween" className="mx-auto w-[88%] max-w-[520px] drop-shadow-[0_8px_24px_rgb(224_20_28/0.45)]" />
          <p className="mt-1 text-[12px] font-bold tracking-[0.22em] text-bone/80 uppercase">
            {EVENT.weekday} {EVENT.dateLabel} · {EVENT.venue}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-md px-4 pb-10">
        <section className="text-center">
          <h1 className="font-metal hw-glow text-[44px] leading-[0.95] text-blood">Hlasuj o nejlepší kostým večera</h1>
          <p className="mt-5 text-[13px] font-extrabold tracking-wide text-blood uppercase">+ dárky od sponzorů</p>
          <p className="hw-glow mt-1 text-[60px] leading-none font-black tracking-tight text-blood">{COSTUME_PRIZE}</p>
          <p className="mt-2 text-[20px] leading-tight font-black uppercase">v hotovosti pro vítěze</p>
          <a href={CONTEST_START} className={`${btnRed} mt-7`}>
            <Icon name="camera" className="size-6" /> Chci soutěžit a hlasovat
          </a>
          <p className="mt-3 text-[13px] text-ash">Přihlásíš se e-mailem za minutu, bez hesla. Zdarma, od 15 let.</p>
        </section>

        <ol className="mt-10 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="hw-surface flex gap-4 rounded-[16px] p-4">
              <span className="font-metal grid size-11 shrink-0 place-items-center rounded-[12px] bg-blood text-[24px] text-white">
                {i + 1}
              </span>
              <div>
                <p className="flex items-center gap-2 text-[17px] font-bold">
                  <Icon name={step.icon} className="size-5 text-blood" /> {step.title}
                </p>
                <p className="mt-0.5 text-[14px] leading-snug text-ash">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="hw-outline mt-6 rounded-[16px] p-4 text-[13px] leading-snug text-ash">
          <span className="mb-1 block text-[15px] font-bold text-bone">Pravidla</span>
          Fotku kostýmu nahráváš jen jednou a nejde ji změnit. Pokud na ní nebudeš ty v kostýmu nebo budeš podvádět (třeba víc
          účtů), budeš ze soutěže vyřazen/a a vzdáváš se výhry. Každý účet má jeden hlas.
        </p>

        <a href={CONTEST_START} className={`${btnRed} mt-6`}>
          Začít
        </a>

        <footer className="mt-10 text-center">
          <p className="text-[12px] text-ash">
            <Link href="/podminky" className="font-semibold text-bone">
              Podmínky užití
            </Link>{" "}
            ·{" "}
            <Link href="/soukromi" className="font-semibold text-bone">
              Ochrana soukromí
            </Link>
          </p>
          <MadeBy className="mt-3" />
        </footer>
      </main>
      <HalloweenMode />
    </div>
  );
}
