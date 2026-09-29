import Link from "next/link";
import { redirect } from "next/navigation";
import { FallbackImg } from "@/components/fallback-img";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { btnPrimary, card } from "@/components/ui";
import { getUser } from "@/lib/auth";

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "qr", title: "Naskenuj QR kód na akci", text: "U vstupu, na baru nebo na vstupence od GetUp." },
  { icon: "heart", title: "Swipuj lidi z koncertu", text: "Uvidíš jen ty, kdo jsou na stejné akci jako ty." },
  { icon: "chat", title: "Match = chat", text: "Lajknete se oba? Napište si a najděte se u pódia." },
];

// Ilustrační fotky (vygenerované přes Higgsfield) stahuje do public/people skript
// scripts/download-photos.mjs při buildu. Když chybí, ukáže se jen barevný přechod.
const HERO = [
  { photo: "veronika", name: "Veronika", age: 27, rotate: "-rotate-[9deg] -translate-x-[44%]", tint: "from-sky-300 to-violet-300" },
  { photo: "jakub", name: "Jakub", age: 26, rotate: "rotate-[9deg] translate-x-[44%]", tint: "from-amber-200 to-orange-300" },
  { photo: "tereza", name: "Tereza", age: 24, rotate: "", tint: "from-pink-300 to-orange-200" },
];

const CROWD = ["klara", "matej", "nikola", "tomas", "adela"];

function Avatar({ photo, className = "" }: { photo: string; className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-pink-200 to-orange-200 shadow-[0_6px_14px_-6px_rgb(40_20_80/0.45)] ${className}`}
    >
      <FallbackImg src={`/people/${photo}.webp`} className="absolute inset-0 size-full object-cover" />
    </span>
  );
}

export default async function Home() {
  if (await getUser()) redirect("/events");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-safe pb-8">
      <header className="flex items-center justify-between pt-3">
        <Logo />
        <Link href="/login" className="glass rounded-full px-4 py-2 text-[15px] font-semibold">
          Přihlásit se
        </Link>
      </header>

      <section className="mt-10 text-center">
        <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold">
          <Icon name="ticket" className="size-4 text-accent" /> Pro návštěvníky akcí GetUp
        </span>
        <h1 className="mt-5 font-display text-[44px] leading-[1.02] font-bold tracking-tight">
          Potkej lidi
          <br />
          <span className="text-gradient">z&nbsp;koncertu.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-[17px] leading-snug text-muted">
          Ta holka nebo kluk z první řady? Teď si můžete napsat.
        </p>
      </section>

      <div className="relative mx-auto mt-10 h-[330px] w-[210px]">
        {HERO.map((p, i) => (
          <div
            key={p.name}
            className={`absolute inset-0 overflow-hidden rounded-[30px] border-[3px] border-white bg-gradient-to-br shadow-[0_24px_50px_-18px_rgb(40_20_80/0.45)] ${p.tint} ${p.rotate} ${
              i < 2 ? "scale-[0.88] opacity-95" : ""
            }`}
          >
            <FallbackImg src={`/people/${p.photo}.webp`} className="absolute inset-0 size-full object-cover" />
            {i === 2 && (
              <div className="glass-photo absolute inset-x-2.5 bottom-2.5 rounded-[20px] px-3.5 py-2.5 text-left">
                <p className="font-display text-[19px] font-bold">
                  {p.name} <span className="font-normal">{p.age}</span>
                </p>
                <p className="text-[12px] text-white/85">📍 GetUp Open Air</p>
              </div>
            )}
          </div>
        ))}
        <div className="glass absolute -top-5 -right-16 flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5">
          <span className="relative flex">
            <Avatar photo="patrik" className="size-8" />
            <Avatar photo="tereza" className="-ml-2.5 size-8" />
            <span className="gloss absolute -bottom-1 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full border border-white">
              <Icon name="heart" className="size-2.5" />
            </span>
          </span>
          <span className="text-[13px] font-bold">Je to match!</span>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <div className="flex">
          {CROWD.map((photo, i) => (
            <Avatar key={photo} photo={photo} className={`size-12 ${i > 0 ? "-ml-3.5" : ""}`} />
          ))}
        </div>
        <div>
          <p className="text-[15px] leading-tight font-semibold">Kdo je na akci s tebou?</p>
          <p className="text-[13px] text-muted">Uvidíš po naskenování QR kódu.</p>
        </div>
      </div>

      <ol className={`${card} mt-8 space-y-4 p-4`}>
        {STEPS.map((step) => (
          <li key={step.title} className="flex items-center gap-3.5">
            <span className="gloss grid size-11 shrink-0 place-items-center rounded-[13px]">
              <Icon name={step.icon} className="size-6" />
            </span>
            <div>
              <p className="text-[16px] font-semibold">{step.title}</p>
              <p className="text-[14px] leading-snug text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link href="/login" className={`${btnPrimary} mt-8 w-full py-4`}>
        Začít
      </Link>
      <p className="mt-4 text-center text-[12px] text-muted">Jen pro 18+. Pokračováním souhlasíš s pravidly komunity.</p>
    </main>
  );
}
