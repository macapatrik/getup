import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ProfileForm } from "@/components/profile-form";
import { getProfile, requireUser } from "@/lib/auth";
import { safeNext } from "@/lib/navigation";

export const metadata: Metadata = { title: "Tvůj profil" };

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const user = await requireUser();
  const { next } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (await getProfile()) redirect(nextPath);

  return (
    <main className="mx-auto max-w-md px-5 pt-safe pb-12">
      <div className="pt-3">
        <Logo />
      </div>
      <h1 className="mt-8 font-display text-[34px] font-bold tracking-tight">Ukaž se</h1>
      <p className="mt-2 text-[17px] text-muted">
        Profil uvidí jen lidi ze stejné akce. Datum narození nikomu neukazujeme, jen věk.
      </p>
      <ProfileForm userId={user.id} profile={null} redirectTo={nextPath} />
    </main>
  );
}
