import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProfileForm } from "@/components/profile-form";
import { largeTitle } from "@/components/ui";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Upravit profil" };

export default async function EditProfilePage() {
  const { user, profile } = await requireProfile();

  return (
    <main className="mx-auto max-w-md px-5 pt-safe lg:pt-6">
      <Link href="/profile" className="inline-flex items-center gap-0.5 pt-4 text-[17px] font-medium text-ink">
        <Icon name="back" className="size-5" /> Můj účet
      </Link>
      <h1 className={`${largeTitle} pt-2`}>Upravit profil</h1>
      <ProfileForm userId={user.id} profile={profile} />
    </main>
  );
}
