import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HalloweenMode } from "@/components/halloween-mode";
import { Logo } from "@/components/logo";
import { ProfileForm } from "@/components/profile-form";
import { getProfile, hasAcceptedTerms, requireUser } from "@/lib/auth";
import { themeMetadata, themeViewport } from "@/lib/halloween-meta";
import { isHalloween } from "@/lib/theme";
import { safeNext } from "@/lib/navigation";

export const generateMetadata = (): Promise<Metadata> => themeMetadata({ title: "Tvůj profil" });
export const generateViewport = themeViewport;

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const user = await requireUser();
  const { next } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (!(await hasAcceptedTerms())) redirect(`/souhlas?next=${encodeURIComponent(nextPath)}`);
  if (await getProfile()) redirect(nextPath);
  const contestOnly = await isHalloween();

  return (
    <main className="mx-auto max-w-md px-4 pt-safe pb-12">
      <div className="pt-2">
        <Logo />
      </div>
      {contestOnly ? (
        <>
          <h1 className="mt-7 text-[28px] leading-tight font-bold">Založ si profil</h1>
          <p className="mt-1.5 text-[16px] text-muted">
            Stačí jméno, věk a tvoje fotka, klidně rovnou v kostýmu. Pak nahraješ svůj kostým do soutěže a dáš jeden hlas. Datum
            narození nikomu neukazujeme, soutěž je od 15 let.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-7 text-[28px] leading-tight font-bold">Ukaž se</h1>
          <p className="mt-1.5 text-[16px] text-muted">
            Profil uvidí jen lidi ze stejné akce. Datum narození nikomu neukazujeme, jen věk. Používej svoje vlastní fotky,
            aplikace je od 15 let. Lidé do 18 let vidí jen lidi do 18 let, dospělí jen dospělé.
          </p>
        </>
      )}
      <ProfileForm userId={user.id} profile={null} redirectTo={nextPath} contestOnly={contestOnly} />
      <HalloweenMode />
    </main>
  );
}
