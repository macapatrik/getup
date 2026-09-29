// Sdílené Tailwind třídy, ať mají tlačítka a pole všude stejný vzhled.
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-party px-6 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition active:scale-[0.98] disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-2 px-5 py-2.5 font-medium text-white transition hover:border-muted active:scale-[0.98] disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-500/40 px-5 py-2.5 font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50";

export const input =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base text-white placeholder:text-muted/60 outline-none transition focus:border-accent";

export const label = "mb-2 block text-sm font-medium text-muted";

export const card = "rounded-3xl border border-line bg-surface p-5";

export function chip(active: boolean) {
  return `rounded-full border px-4 py-2 text-sm font-medium transition ${
    active ? "border-accent bg-accent/15 text-white" : "border-line bg-surface text-muted hover:border-muted"
  }`;
}
