// Designový systém ve stylu Apple. Utility `glass` (bílá karta), `glass-inner` (šedá výplň), `gloss-ink` (černé tlačítko) jsou v globals.css.
export const btnPrimary =
  "gloss-ink inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[17px] font-semibold transition active:scale-[0.97] disabled:opacity-50";

export const btnSecondary =
  "glass-inner inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-ink transition active:scale-[0.97] disabled:opacity-50";

export const btnDanger =
  "glass-inner inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-danger transition active:scale-[0.97] disabled:opacity-50";

export const iconButton =
  "glass grid size-10 shrink-0 place-items-center rounded-full text-ink transition active:scale-90";

export const input =
  "glass-inner w-full rounded-[14px] px-4 py-3.5 text-[17px] text-ink placeholder:text-faint outline-none transition focus:bg-white focus:ring-2 focus:ring-ink/80";

export const label = "mb-2 ml-1 block text-[13px] font-medium text-muted";

export const sectionTitle = "mb-2 ml-1 text-[13px] font-semibold tracking-wide text-muted uppercase";

export const card = "glass rounded-[20px] p-5";

export const largeTitle = "font-display text-[34px] leading-[1.1] font-bold tracking-tight";

export function chip(active: boolean) {
  return `rounded-full px-4 py-2.5 text-[15px] font-semibold transition active:scale-95 ${
    active ? "gloss-ink" : "glass-inner text-ink"
  }`;
}

export const errorText =
  "rounded-2xl bg-danger/10 px-3.5 py-2.5 text-[15px] font-medium text-danger";
