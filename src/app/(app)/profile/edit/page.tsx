import type { Metadata } from "next";
import { BackHeader } from "@/components/app-header";
import { ProfileForm } from "@/components/profile-form";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Upravit profil" };

export default async function EditProfilePage() {
  const { user, profile } = await requireProfile();

  return (
    <main className="mx-auto max-w-md pb-nav lg:pt-6">
      <BackHeader href="/profile" title="Upravit profil" />
      <div className="px-4">
        <ProfileForm userId={user.id} profile={profile} />
      </div>
    </main>
  );
}
