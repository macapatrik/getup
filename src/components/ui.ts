// Designový systém podle šablony Romio. Utility `surface` (bílá karta s linkou), `fill-soft` (šedá výplň),
// `fill-accent` (růžové tlačítko) a `fill-accent-soft` (světle růžové) jsou v globals.css.
export const btnPrimary =
  "fill-accent inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[17px] font-bold transition active:scale-[0.97] disabled:opacity-50";

export const btnSecondary =
  "fill-accent-soft inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-[16px] font-bold transition active:scale-[0.97] disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-[12px] bg-danger/10 px-5 py-3 text-[16px] font-bold text-danger transition active:scale-[0.97] disabled:opacity-50";

export const iconButton =
  "surface grid size-11 shrink-0 place-items-center rounded-full text-ink transition active:scale-90";

export const input =
  "fill-soft w-full rounded-[24px] px-4 py-3 text-[16px] text-ink placeholder:text-muted outline-none transition focus:ring-2 focus:ring-accent/50";

/** Pole s ikonou vlevo (obal <IconField>) */
export const inputWithIcon = `${input} pl-12`;

export const label = "mb-2 block text-[14px] font-bold tracking-wide text-ink uppercase";

export const sectionTitle = "mb-3 text-[18px] font-bold text-ink";

export const card = "surface rounded-[16px] p-4";

export const largeTitle = "font-display text-[28px] leading-[1.15] font-bold";

export function chip(active: boolean) {
  return `rounded-[12px] px-4 py-2.5 text-[15px] font-semibold transition active:scale-95 ${
    active ? "fill-accent" : "fill-soft text-ink"
  }`;
}

/** Štítek přes fotku (věk, místo) */
export const photoBadge =
  "photo-chip inline-flex items-center gap-1.5 rounded-[30px] px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap";

/** Malý světle růžový štítek (akce, stav) */
export const pill = "fill-accent-soft inline-flex items-center gap-1 rounded-[10px] px-3 py-1 text-[12px] font-semibold";

export const errorText =
  "rounded-[12px] bg-danger/10 px-3.5 py-2.5 text-[15px] font-medium text-danger";
