import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AdminUserDetail, Profile } from "@/lib/types";
import { PageHeader } from "../../../ui";
import { ProfileEditor } from "../profile-editor";

export const metadata: Metadata = { title: "Upravit profil" };

/** Úprava (nebo vytvoření) profilu uživatele týmem GetUp: fotky, texty, kontakty. */
export default async function AdminEditUserPage(props: PageProps<"/admin/users/[id]/edit">) {
  await requireOrganizer();
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_user", { p_user_id: id });
  const user = data as AdminUserDetail | null;
  if (!user) notFound();

  const profile = user.profile;
  const editable: Profile | null = profile
    ? {
        id: user.id,
        display_name: profile.display_name,
        birthdate: profile.birthdate,
        gender: profile.gender,
        interested_in: profile.interested_in,
        bio: profile.bio,
        photos: profile.photos,
        instagram: profile.instagram,
        snapchat: profile.snapchat,
        phone: profile.phone,
      }
    : null;

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title={profile ? `Upravit profil: ${profile.display_name}` : "Vytvořit profil"}
        subtitle={`${user.email} · fotky, texty a kontakty se uloží za uživatele`}
        back={{ href: `/admin/users/${user.id}`, label: profile?.display_name ?? user.email }}
      />
      <ProfileEditor userId={user.id} profile={editable} />
    </div>
  );
}
