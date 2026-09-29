import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { btnPrimary } from "@/components/ui";
import { getUser } from "@/lib/auth";

const STEPS = [
  { title: "Naskenuj QR kód na akci", text: "Najdeš ho u vstupu, na baru nebo na vstupence od GetUp." },
  { title: "Swipuj lidi z koncertu", text: "Uvidíš jen ty, kdo jsou na stejné akci jako ty." },
  { title: "Match = chat", text: "Když se lajknete oba, můžete si hned napsat a najít se u pódia." },
];

export default async function Home() {
  if (await getUser()) redirect("/events");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-10 pb-8">
      <Logo />

      <section className="mt-14 flex-1">
        <p className="text-sm font-semibold tracking-widest text-accent uppercase">Party × seznamka</p>
        <h1 className="mt-3 text-5xl leading-[1.05] font-black">
          Potkej lidi <span className="text-party">z&nbsp;koncertu</span>.
        </h1>
        <p className="mt-5 text-lg text-muted">
          Ta holka nebo kluk z první řady? Teď si můžete napsat. Bez trapných pohledů přes celý sál.
        </p>

        <ol className="mt-10 space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 font-bold text-accent">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Link href="/login" className={`${btnPrimary} mt-10 w-full py-4 text-lg`}>
        Začít
      </Link>
      <p className="mt-4 text-center text-xs text-muted">Jen pro 18+. Pokračováním souhlasíš s pravidly komunity.</p>
    </main>
  );
}
