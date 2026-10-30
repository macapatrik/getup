import { metalMania } from "../../../../halloween/fonts";

/** Okamžitá odezva po klepnutí na záložku soutěže, než dorazí data (hlavička jako na stránce, pod ní kostra). */
export default function Loading() {
  return (
    <main className={`hw ${metalMania.variable} relative mx-auto min-h-dvh max-w-md bg-night pb-nav text-bone lg:pt-6`}>
      <section className="relative h-[280px] overflow-hidden">
        <img src="/halloween/hero-800.webp" alt="" className="absolute inset-0 size-full object-cover object-[72%_center]" />
        <div className="hw-fog-top absolute inset-x-0 top-0 h-24" />
        <div className="hw-fog-bottom absolute inset-x-0 bottom-0 h-40" />
        <div className="absolute inset-x-0 bottom-3 px-6 text-center">
          <img src="/halloween/title-600.webp" alt="Halloween" className="mx-auto w-[86%] drop-shadow-[0_8px_24px_rgb(224_20_28/0.45)]" />
        </div>
      </section>
      <div className="space-y-4 px-4 pt-4" aria-busy="true" aria-label="Načítám soutěž">
        <div className="mx-auto h-14 w-48 animate-pulse rounded-[12px] bg-white/[0.06]" />
        <div className="h-64 animate-pulse rounded-[24px] bg-white/[0.05]" />
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-[3/4] animate-pulse rounded-[16px] bg-white/[0.05]" />
          <div className="aspect-[3/4] animate-pulse rounded-[16px] bg-white/[0.05]" />
        </div>
      </div>
    </main>
  );
}
