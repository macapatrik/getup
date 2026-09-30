import Link from "next/link";
import { redirect } from "next/navigation";
import { FallbackImg } from "@/components/fallback-img";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { btnPrimary, btnSecondary, photoBadge } from "@/components/ui";
import { getUser } from "@/lib/auth";

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "qr", title: "Připoj se k akci", text: "Naskenuj QR kód u vstupu přímo v aplikaci, nebo klikni na odkaz ze vstupenky." },
  { icon: "heart", title: "Swipuj lidi z akce", text: "Uvidíš jen ty, kdo jdou na stejnou akci jako ty. Klidně už týdny předem." },
  { icon: "chat", title: "Match = chat", text: "Lajknete se oba? Napište si a domluvte se, kde se na akci potkáte." },
];

// Ilustrační fotky (vygenerované přes Higgsfield) stahuje do public/people skript
// scripts/download-photos.mjs při buildu. Když chybí, ukáže se jen barevný přechod.
const HERO = [
  { photo: "veronika", name: "Veronika", age: 27, rotate: "-rotate-[9deg] -translate-x-[44%]", tint: "from-accent-soft to-[#d9d6ff]" },
  { photo: "jakub", name: "Jakub", age: 26, rotate: "rotate-[9deg] translate-x-[44%]", tint: "from-[#d9d6ff] to-accent-soft" },
  { photo: "tereza", name: "Tereza", age: 24, rotate: "", tint: "from-accent-soft to-[#c9c5ff]" },
];

const CROWD = ["klara", "matej", "nikola", "tomas", "adela"];

function Avatar({ photo, className = "" }: { photo: string; className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-accent-soft to-[#d9d6ff] shadow-[0_6px_14px_-6px_rgb(62_54_237/0.35)] ${className}`}
    >
      <FallbackImg src={`/people/${photo}.webp`} className="absolute inset-0 size-full object-cover" />
    </span>
  );
}

export default async function Home() {
  if (await getUser()) redirect("/events");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-safe pb-8">
      <header className="flex items-center justify-between pt-2">
        <Logo tagline />
        <Link href="/login" className={`${btnSecondary} !px-4 !py-2 !text-[14px]`}>
          Přihlásit se
        </Link>
      </header>

      <section className="mt-9 text-center">
        <span className="fill-accent-soft inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13px] font-bold">
          <Icon name="ticket" className="size-4" /> Pro návštěvníky akcí GetUp
        </span>
        <h1 className="mt-5 text-[40px] leading-[1.05] font-bold">
          Potkej lidi
          <br />
          <span className="text-accent">z&nbsp;koncertu.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-[16px] leading-snug text-muted">
          Ta holka nebo kluk z první řady? Teď si můžete napsat.
        </p>
      </section>

      <div className="relative mx-auto mt-10 h-[330px] w-[210px]">
        {HERO.map((p, i) => (
          <div
            key={p.name}
            className={`absolute inset-0 overflow-hidden rounded-[32px] bg-gradient-to-br shadow-[0_24px_50px_-18px_rgb(62_54_237/0.45)] ${p.tint} ${p.rotate} ${
              i < 2 ? "scale-[0.88] opacity-95" : ""
            }`}
          >
            <FallbackImg src={`/people/${p.photo}.webp`} className="absolute inset-0 size-full object-cover" />
            {i === 2 && (
              <>
                <div className="photo-fade absolute inset-x-0 bottom-0 h-1/2" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-left text-white">
                  <p className="text-[19px] leading-tight font-semibold">{p.name}</p>
                  <div className="mt-2 flex gap-1.5">
                    <span className={`${photoBadge} !px-2.5 !py-1 !text-[12px]`}>
                      <Icon name="gender" className="size-3.5" /> {p.age} let
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="surface absolute -top-5 -right-16 flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 shadow-[0_12px_30px_-14px_rgb(0_0_0/0.25)]">
          <span className="relative flex">
            <Avatar photo="patrik" className="size-8" />
            <Avatar photo="tereza" className="-ml-2.5 size-8" />
            <span className="fill-accent absolute -bottom-1 left-1/2 grid size-4 -translate-x-1/2 place-items-center rounded-full border border-white shadow-none">
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
          <p className="text-[15px] leading-tight font-bold">Kdo je na akci s tebou?</p>
          <p className="text-[13px] text-muted">Uvidíš po naskenování QR kódu.</p>
        </div>
      </div>

      <ol className="surface mt-8 space-y-4 rounded-[16px] p-4">
        {STEPS.map((step) => (
          <li key={step.title} className="flex items-center gap-3.5">
            <span className="fill-accent-soft grid size-11 shrink-0 place-items-center rounded-[12px]">
              <Icon name={step.icon} className="size-6" />
            </span>
            <div>
              <p className="text-[16px] font-bold">{step.title}</p>
              <p className="text-[14px] leading-snug text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link href="/login" className={`${btnPrimary} mt-8 w-full py-3.5`}>
        Začít
      </Link>
      <p className="mt-4 text-center text-[12px] text-muted">
        Jen pro 18+. Pokračováním souhlasíš s{" "}
        <Link href="/podminky" className="font-semibold text-accent">
          podmínkami užití
        </Link>{" "}
        a{" "}
        <Link href="/soukromi" className="font-semibold text-accent">
          ochranou soukromí
        </Link>
        .
      </p>
    </main>
  );
}
