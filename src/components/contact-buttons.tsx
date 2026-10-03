import { contactLinks, type ContactLink } from "@/lib/contacts";
import type { Contacts } from "@/lib/types";
import { Icon } from "./icons";

function ContactButton({ link }: { link: ContactLink }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      className="surface flex w-[calc(50%-5px)] items-center gap-3 rounded-[16px] p-3 text-left transition active:scale-[0.97]"
    >
      <span className="fill-accent-soft grid size-11 shrink-0 place-items-center rounded-full">
        <Icon name={link.icon} className="size-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] leading-tight font-bold text-ink">{link.label}</span>
        <span className="mt-0.5 block text-[13px] leading-tight break-all text-muted">{link.detail}</span>
      </span>
    </a>
  );
}

/** Tlačítka Instagram / Snapchat / Zavolat / SMS podle toho, co si člověk vyplnil v profilu. Ukazují se až po matchi. */
export function ContactButtons({ person, name }: { person: Contacts; name: string }) {
  const links = contactLinks(person);
  if (links.length === 0) {
    return (
      <p className="fill-soft rounded-[16px] px-4 py-3.5 text-center text-[15px] text-muted">
        {name} si zatím nevyplnil/a žádný kontakt. Najděte se na akci.
      </p>
    );
  }
  return (
    // Dlaždice se centrují: jedna uprostřed, dvě vedle sebe, lichá poslední uprostřed.
    <div className="flex w-full flex-wrap justify-center gap-2.5">
      {links.map((link) => (
        <ContactButton key={link.kind} link={link} />
      ))}
    </div>
  );
}
