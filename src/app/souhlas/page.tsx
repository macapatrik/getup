import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MadeBy } from "@/components/made-by";
import { getConsent, hasAcceptedTerms, requireUser } from "@/lib/auth";
import { safeNext } from "@/lib/navigation";
import { ConsentForm } from "./consent-form";

export const metadata: Metadata = { title: "Než začneš" };

// Krátké shrnutí podmínek; celé znění je na /podminky.
const RULES: { icon: IconName; title: string; text: string }[] = [
  { icon: "user", title: "Jen 18+ a jen ty", text: "Jeden účet, tvoje vlastní aktuální fotky, žádné falešné profily." },
  { icon: "heart", title: "S respektem", text: "Žádné obtěžování, výhrůžky ani spam. Když se ti něco nezdá, člověka nahlas." },
  {
    icon: "shield",
    title: "Moderace a blokace",
    text: "Tým GetUp může upravit nebo smazat profil, který porušuje pravidla, a účet zablokovat. Zablokovaný účet nemůže swipovat ani se připojit k akci a ostatní ho neuvidí.",
  },
  { icon: "users", title: "Soukromí", text: "Profil vidí jen lidi ze stejné akce, tvoje kontakty jen ti, se kterými máš match." },
];

export default async function ConsentPage(props: PageProps<"/souhlas">) {
  await requireUser();
  const { next } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (await hasAcceptedTerms()) redirect(nextPath);
  const consent = await getConsent();

  return (
    <main className="mx-auto max-w-md px-4 pt-safe pb-8">
      <div className="pt-2">
        <Logo />
      </div>
      <h1 className="mt-7 text-[28px] leading-tight font-bold">Než začneš</h1>
      <p className="mt-1.5 text-[16px] text-muted">Pár pravidel, ať je to tu příjemné pro všechny.</p>

      <ul className="surface mt-6 space-y-4 rounded-[16px] p-4">
        {RULES.map((rule) => (
          <li key={rule.title} className="flex items-start gap-3.5">
            <span className="fill-accent-soft grid size-11 shrink-0 place-items-center rounded-[12px]">
              <Icon name={rule.icon} className="size-6" />
            </span>
            <div>
              <p className="text-[16px] font-bold">{rule.title}</p>
              <p className="text-[14px] leading-snug text-muted">{rule.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <ConsentForm next={nextPath} marketing={consent?.marketing ?? false} />
      <MadeBy className="mt-8" />
    </main>
  );
}
