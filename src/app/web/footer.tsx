import Link from "next/link";
import { Icon } from "@/components/icons";
import { APP_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { OPERATOR } from "@/lib/legal";
import { WebLink } from "./link";

export function WebFooter() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <img src="/web/getup-logo.png" alt="GetUp" className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-[15px] leading-snug text-white/60">
            Párty a akce v Českých Budějovicích. Tematické večery v Klubu K2, předprodej na Eventlooku a seznamka {APP_NAME} jen pro lidi
            z akce.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="hw-surface inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-white/10">
              <Icon name="instagram" className="size-4" /> {INSTAGRAM_HANDLE}
            </a>
            <a href={`mailto:${OPERATOR.email}`} className="hw-surface inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-white/10">
              <Icon name="mail" className="size-4" /> Napsat
            </a>
          </div>
        </div>
        <div>
          <p className="text-[12px] font-bold tracking-[0.2em] text-white/50 uppercase">Web</p>
          <ul className="mt-3 space-y-2 text-[15px] font-semibold">
            <li><WebLink href="/akce" className="transition hover:text-indigo-300">Akce</WebLink></li>
            <li><WebLink href="/kontakt" className="transition hover:text-indigo-300">Kontakt</WebLink></li>
            <li><a href={SITE_URL} className="inline-flex items-center gap-1.5 text-accent transition hover:text-white"><Icon name="heart" className="size-4" /> {APP_NAME}</a></li>
            <li><Link href="/podminky" className="transition hover:text-indigo-300">Podmínky {APP_NAME}</Link></li>
            <li><Link href="/soukromi" className="transition hover:text-indigo-300">Ochrana soukromí</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-bold tracking-[0.2em] text-white/50 uppercase">Provozovatel</p>
          <p className="mt-3 text-[15px] leading-snug text-white/70">
            {OPERATOR.name}
            <br />
            IČO {OPERATOR.id}
            <br />
            {OPERATOR.address}
            <br />
            <a href={`mailto:${OPERATOR.email}`} className="font-semibold text-white">{OPERATOR.email}</a>
          </p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-[12px] text-white/40 sm:px-6">© {new Date().getFullYear()} GetUp · Klub K2, Sokolský ostrov 462, České Budějovice</p>
    </footer>
  );
}
