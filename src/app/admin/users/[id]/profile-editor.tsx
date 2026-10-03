"use client";

import { useRouter } from "next/navigation";
import { ProfileForm, type ProfileInput } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

/** Úprava profilu kteréhokoli uživatele týmem GetUp: stejný formulář jako v Mém účtu, uložení přes RPC admin_update_profile. */
export function ProfileEditor({ userId, profile }: { userId: string; profile: Profile | null }) {
  const router = useRouter();

  async function save(data: ProfileInput) {
    const { error } = await createClient().rpc("admin_update_profile", { p_user_id: userId, p_profile: data });
    if (error) throw error;
    router.refresh();
  }

  return <ProfileForm userId={userId} profile={profile} onSave={save} />;
}
