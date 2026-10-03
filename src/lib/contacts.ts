import type { IconName } from "@/components/icons";
import type { Contacts } from "./types";

export type ContactKind = "instagram" | "snapchat" | "call" | "sms";

export type ContactLink = {
  kind: ContactKind;
  label: string;
  /** Co se ukáže pod názvem (jméno účtu, číslo) */
  detail: string;
  href: string;
  icon: IconName;
  /** Otevřít v nové záložce (Instagram, Snapchat); tel: a sms: řeší systém sám */
  external: boolean;
};

const INSTAGRAM_RE = /^[a-z0-9_](?:\.?[a-z0-9_]+)*$/;
const SNAPCHAT_RE = /^[a-z0-9][a-z0-9._-]{1,13}[a-z0-9]$/;
const PHONE_RE = /^\+[1-9][0-9]{7,14}$/;

// Srovnání vstupu je stejné jako v databázi (trigger profiles_validate): z odkazu nebo @jména
// zůstane jen jméno účtu malými písmeny, u telefonu jen číslice s předvolbou.

export function normalizeInstagram(raw: string): string | null {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return value || null;
}

export function normalizeSnapchat(raw: string): string | null {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?snapchat\.com\/add\//, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");
  return value || null;
}

/** Mezery a závorky pryč, 00 → +, české devítimístné číslo dostane +420. */
export function normalizePhone(raw: string): string | null {
  let value = raw.trim().replace(/[\s().-]/g, "").replace(/^00/, "+");
  if (/^[0-9]{9}$/.test(value)) value = `+420${value}`;
  return value || null;
}

export const isValidInstagram = (value: string) => value.length <= 30 && INSTAGRAM_RE.test(value);
export const isValidSnapchat = (value: string) => SNAPCHAT_RE.test(value);
export const isValidPhone = (value: string) => PHONE_RE.test(value);

/** +420777123456 → +420 777 123 456 (ostatní předvolby necháme být) */
export function formatPhone(phone: string) {
  const m = phone.match(/^(\+42[01])(\d{3})(\d{3})(\d{3})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : phone;
}

export function hasContact(contacts: Contacts) {
  return Boolean(contacts.instagram || contacts.snapchat || contacts.phone);
}

/** Tlačítka po matchi podle toho, co si člověk vyplnil: Instagram, Snapchat, Zavolat, SMS. */
export function contactLinks(contacts: Contacts): ContactLink[] {
  const links: ContactLink[] = [];
  if (contacts.instagram) {
    links.push({
      kind: "instagram",
      label: "Instagram",
      detail: `@${contacts.instagram}`,
      href: `https://instagram.com/${contacts.instagram}`,
      icon: "instagram",
      external: true,
    });
  }
  if (contacts.snapchat) {
    links.push({
      kind: "snapchat",
      label: "Snapchat",
      detail: contacts.snapchat,
      href: `https://snapchat.com/add/${contacts.snapchat}`,
      icon: "snapchat",
      external: true,
    });
  }
  if (contacts.phone) {
    const detail = formatPhone(contacts.phone);
    links.push({ kind: "call", label: "Zavolat", detail, href: `tel:${contacts.phone}`, icon: "phone", external: false });
    links.push({ kind: "sms", label: "SMS", detail, href: `sms:${contacts.phone}`, icon: "chat", external: false });
  }
  return links;
}
