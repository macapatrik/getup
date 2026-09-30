import Link from "next/link";
import { Icon } from "@/components/icons";
import { btnPrimary, photoBadge } from "@/components/ui";
import { OPERATOR } from "@/lib/legal";

/** 404 jako karta v balíčku, která dostala „ne“. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 pb-10 text-center">
      <div className="relative mb-10 h-[300px] w-[220px]" aria-hidden>
        <div className="absolute inset-0 translate-x-6 rotate-[9deg] rounded-[32px] bg-gradient-to-br from-accent-soft to-[#d9d6ff]" />
        <div className="absolute inset-0 -rotate-[5deg] overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo via-[#7a3ff0] to-accent text-left text-white shadow-[0_28px_50px_-20px_rgb(62_54_237/0.55)]">
          <p className="px-5 pt-5 text-[72px] leading-none font-bold tracking-tight">404</p>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[22px] leading-tight font-semibold">Stránka</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`${photoBadge} !px-2.5 !py-1 !text-[12px]`}>
                <Icon name="gender" className="size-4" /> 0 let
              </span>
              <span className={`${photoBadge} !px-2.5 !py-1 !text-[12px]`}>
                <Icon name="pin" className="size-4" /> nikde
              </span>
            </div>
          </div>
        </div>
        <span className="fill-accent absolute -top-3 -left-5 grid size-16 -rotate-12 place-items-center rounded-full border-4 border-white">
          <Icon name="x" className="size-8" />
        </span>
      </div>

      <h1 className="text-[28px] leading-tight font-bold">Tahle stránka tě swipla doleva</h1>
      <p className="mt-2 max-w-xs text-[16px] text-muted">
        Buď neexistuje, nebo si šla pro drink a už se nevrátila. Nic si z toho nedělej, na akci je lidí dost.
      </p>

      <Link href="/events" className={`${btnPrimary} mt-8 w-full max-w-xs py-3.5`}>
        <Icon name="heart" className="size-5" /> Swipovat dál
      </Link>
      <p className="mt-6 text-[12px] text-faint">
        Kdyby se to opakovalo, napiš nám na{" "}
        <a href={`mailto:${OPERATOR.email}`} className="font-semibold text-muted">
          {OPERATOR.email}
        </a>
        .
      </p>
    </main>
  );
}
