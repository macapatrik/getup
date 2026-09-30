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
    <main className="mx-auto max-w-md px-4 pt-safe pb-12">
      <div className="pt-2">
        <Logo />
      </div>
      <h1 className="mt-7 text-[28px] leading-tight font-bold">Ukaž se</h1>
      <p className="mt-1.5 text-[16px] text-muted">
        Profil uvidí jen lidi ze stejné akce. Datum narození nikomu neukazujeme, jen věk. Používej svoje vlastní fotky, aplikace
        je jen pro 18+.
      </p>
      <ProfileForm userId={user.id} profile={null} redirectTo={nextPath} />
    </main>
  );
}
