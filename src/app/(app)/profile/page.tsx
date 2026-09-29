import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { SubmitButton } from "@/components/submit-button";
import { btnSecondary, card } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { signOutAction } from "../actions";
import { DeleteAccount } from "./delete-account";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { user, profile } = await requireProfile();

  return (
    <main className="px-5 pt-8">
      <h1 className="text-3xl font-black">Tvůj profil</h1>
      <ProfileForm userId={user.id} profile={profile} />

      <section className={`${card} mt-10 space-y-4`}>
        <p className="text-sm text-muted">
          Přihlášen/a jako <span className="text-white">{user.email}</span>
        </p>
        <form action={signOutAction}>
          <SubmitButton className={`${btnSecondary} w-full`} pendingText="Odhlašuji…">
            Odhlásit se
          </SubmitButton>
        </form>
        <DeleteAccount userId={user.id} />
      </section>
    </main>
  );
}
