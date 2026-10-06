import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { APP_NAME, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/config";
import { OPERATOR } from "@/lib/legal";
import { VENUE } from "@/lib/web";
import { SectionTitle, btnGhost, btnWhite } from "../ui";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt na GetUp: Instagram, e-mail, provozovatel a adresa Klubu K2 v Českých Budějovicích.",
  alternates: { canonical: "/kontakt" },
  openGraph: { title: "Kontakt GetUp", url: "/kontakt" },
};

const TOPICS: { icon: IconName; title: string; text: string }[] = [
  { icon: "ticket", title: "Vstupenky a slevy", text: "Předprodej jede přes Eventlook, odkaz je u každé akce. Slevu na vstup domluvíš přes zprávu na Instagramu." },
  { icon: "users", title: "Spolupráce", text: "Chceš u nás hrát, fotit, nebo spojit svou značku s našimi akcemi? Napiš, ozveme se." },
  { icon: "camera", title: "Fotky z akce", text: "Fotky a videa z každé párty dáváme na Instagram do pár dní po akci." },
];

export default function WebContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36">
      <SectionTitle kicker="Kontakt" title="Napiš nám" text="Nejrychleji přes Instagram, formálnější věci e-mailem." />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="reveal group rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-6 shadow-[8px_8px_0_#f759f5] transition hover:-translate-y-1 sm:p-8">
          <span className="grid size-12 place-items-center rounded-[12px] bg-accent/20 text-accent">
            <Icon name="instagram" className="size-6" />
          </span>
          <p className="font-party mt-5 text-[36px] leading-none text-white uppercase">Instagram</p>
          <p className="mt-2 text-[17px] font-bold text-white">{INSTAGRAM_HANDLE}</p>
          <p className="mt-1 text-[14px] text-white/60">Stories, line-upy, soutěže a slevy. Do DM nám napiš cokoli.</p>
          <span className={`${btnWhite} mt-6 !py-2.5 !text-[14px]`}>
            Sledovat <Icon name="chevron" className="size-4" />
          </span>
        </a>
        <a href={`mailto:${OPERATOR.email}`} className="reveal rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-6 shadow-[8px_8px_0_#2ee7ff] transition hover:-translate-y-1 sm:p-8">
          <span className="grid size-12 place-items-center rounded-[12px] bg-cyan/25 text-cyan">
            <Icon name="mail" className="size-6" />
          </span>
          <p className="font-party mt-5 text-[36px] leading-none text-white uppercase">E-mail</p>
          <p className="mt-2 text-[17px] font-bold text-white">{OPERATOR.email}</p>
          <p className="mt-1 text-[14px] text-white/60">Spolupráce, faktury, cokoli písemně.</p>
          <span className={`${btnGhost} mt-6 !py-2.5 !text-[14px]`}>
            Napsat e-mail <Icon name="chevron" className="size-4" />
          </span>
        </a>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="reveal rounded-[22px] border-[3px] border-white bg-[#1d0f3f] p-5 shadow-[6px_6px_0_#c6ff3d]">
            <span className="grid size-11 place-items-center rounded-[12px] bg-white/10 text-white">
              <Icon name={t.icon} className="size-6" />
            </span>
            <p className="mt-4 text-[17px] font-bold text-white">{t.title}</p>
            <p className="mt-1.5 text-[14px] leading-snug text-white/60">{t.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="reveal rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-6 shadow-[8px_8px_0_#ffd23f] sm:p-8">
          <p className="text-[13px] font-bold tracking-[0.2em] text-white/50 uppercase">Kde nás najdeš</p>
          <p className="font-party mt-2 text-[36px] leading-none text-white uppercase">{VENUE.name}</p>
          <p className="mt-2 text-[15px] text-white/70">
            {VENUE.street}
            <br />
            {VENUE.city}
          </p>
          <a href={VENUE.mapUrl} target="_blank" rel="noopener" className={`${btnGhost} mt-5 !py-2.5 !text-[14px]`}>
            <Icon name="pin" className="size-4" /> Otevřít mapu
          </a>
        </div>
        <div className="reveal rounded-[28px] border-[3px] border-white bg-[#1d0f3f] p-6 shadow-[8px_8px_0_#ffd23f] sm:p-8">
          <p className="text-[13px] font-bold tracking-[0.2em] text-white/50 uppercase">Provozovatel</p>
          <p className="mt-2 text-[17px] font-bold text-white">{OPERATOR.name}</p>
          <p className="mt-1 text-[15px] leading-snug text-white/70">
            IČO {OPERATOR.id}, {OPERATOR.vat}
            <br />
            {OPERATOR.address}
          </p>
          <a href={SITE_URL} className={`${btnGhost} mt-5 !py-2.5 !text-[14px] text-accent`}>
            <LogoMark className="size-4" /> Seznamka {APP_NAME}
          </a>
        </div>
      </div>
    </div>
  );
}
