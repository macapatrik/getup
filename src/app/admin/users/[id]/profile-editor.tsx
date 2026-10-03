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

  return (
    <details className="surface group rounded-[16px]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {profile ? "Upravit profil (fotky, texty, kontakty)" : "Vytvořit profil za uživatele"}
        <span className="text-muted transition group-open:rotate-90">›</span>
      </summary>
      <div className="border-t-2 border-fill px-4 pb-5">
        <p className="mt-3 text-[13px] leading-snug text-muted">
          Fotky se nahrávají do složky uživatele, uložení projde stejnými kontrolami jako u něj. Zásah popisují podmínky
          užití (Moderace a správa účtů).
        </p>
        <ProfileForm userId={userId} profile={profile} onSave={save} />
      </div>
    </details>
  );
}
