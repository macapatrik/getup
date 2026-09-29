// Designový systém (iOS 26 Liquid Glass). Utility `glass`, `gloss` apod. jsou v globals.css.
export const btnPrimary =
  "gloss inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[17px] font-semibold transition active:scale-[0.97] disabled:opacity-50";

export const btnSecondary =
  "glass inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold text-ink transition active:scale-[0.97] disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-200/40 bg-red-500/30 px-5 py-3 text-[15px] font-semibold text-white shadow-[inset_0_1px_0.5px_rgb(255_255_255/0.5)] backdrop-blur-xl transition active:scale-[0.97] disabled:opacity-50";

export const iconButton =
  "glass grid size-10 shrink-0 place-items-center rounded-full text-ink transition active:scale-90";

export const input =
  "glass-inner w-full rounded-2xl px-4 py-3.5 text-[17px] text-white placeholder:text-faint outline-none transition focus:border-white/60 focus:ring-4 focus:ring-white/15";

export const label = "mb-2 ml-1 block text-[13px] font-medium text-muted";

export const sectionTitle = "mb-2 ml-1 text-[13px] font-semibold tracking-wide text-muted uppercase";

export const card = "glass rounded-[28px] p-5";

export const largeTitle = "font-display text-[34px] leading-[1.1] font-bold tracking-tight";

export function chip(active: boolean) {
  return `rounded-full px-4 py-2.5 text-[15px] font-semibold transition active:scale-95 ${
    active ? "gloss" : "glass text-ink"
  }`;
}

export const errorText =
  "rounded-2xl border border-red-200/30 bg-red-500/25 px-3.5 py-2.5 text-[15px] font-medium text-white backdrop-blur-xl";
