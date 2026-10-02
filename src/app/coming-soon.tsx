import Link from "next/link";
import { FallbackImg } from "@/components/fallback-img";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { btnPrimary, btnSecondary, pill } from "@/components/ui";
import { EVENT } from "./halloween/event";

// Lidi z ukázkových fotek (public/people), stejní jako na úvodní stránce.
const CROWD = ["klara", "matej", "nikola", "tomas", "adela"];

/** Úvodní stránka v režimu „připravujeme“ (COMING_SOON=1): bez přihlášení, jen upoutávka a odkazy. */
export function ComingSoon() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-safe pb-8">
      <header className="flex items-center justify-between pt-2">
        <Logo tagline />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <span className={pill}>
          <Icon name="clock" className="size-4" /> Připravujeme
        </span>
        <h1 className="mt-5 text-[40px] leading-[1.05] font-bold">
          Potkej lidi
          <br />
          <span className="text-accent">z&nbsp;akce.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-[16px] leading-snug text-muted">
          Seznamka jen pro návštěvníky akcí GetUp. Poprvé ji otevřeme na Halloweenu {EVENT.dateLabel.replace(/ /g, "\u00a0")} v Klubu K2.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <div className="flex">
            {CROWD.map((photo, i) => (
              <span
                key={photo}
                className={`relative block size-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-accent-soft to-[#d9d6ff] shadow-[0_6px_14px_-6px_rgb(62_54_237/0.35)] ${
                  i > 0 ? "-ml-3.5" : ""
                }`}
              >
                <FallbackImg src={`/people/${photo}.webp`} className="absolute inset-0 size-full object-cover" />
              </span>
            ))}
          </div>
          <div>
            <p className="text-[15px] leading-tight font-bold">Kdo tam jde s tebou?</p>
            <p className="text-[13px] text-muted">Uvidíš po připojení k akci.</p>
          </div>
        </div>

        <Link href="/halloween" className={`${btnPrimary} mt-10 w-full py-3.5`}>
          Halloween by GetUp
        </Link>
        <a href={EVENT.instagram} target="_blank" rel="noopener" className={`${btnSecondary} mt-3 w-full`}>
          Sledovat {EVENT.instagramHandle}
        </a>
      </section>

      <p className="text-center text-[12px] text-muted">
        Jen pro 18+ ·{" "}
        <Link href="/podminky" className="font-semibold text-accent">
          Podmínky
        </Link>{" "}
        ·{" "}
        <Link href="/soukromi" className="font-semibold text-accent">
          Soukromí
        </Link>
      </p>
    </main>
  );
}
