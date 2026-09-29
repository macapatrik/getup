import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { PushSettings } from "@/components/push-settings";
import { SubmitButton } from "@/components/submit-button";
import { btnSecondary, card, largeTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { signOutAction } from "../actions";
import { DeleteAccount } from "./delete-account";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { user, profile } = await requireProfile();

  return (
    <main className="px-5 pt-safe">
      <h1 className={`${largeTitle} pt-6`}>Tvůj profil</h1>
      <ProfileForm userId={user.id} profile={profile} />
      <PushSettings />

      <section className={`${card} mt-10 space-y-4`}>
        <p className="ml-1 text-[15px] text-muted">
          Přihlášen/a jako <span className="font-medium text-ink">{user.email}</span>
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
