"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger, errorText } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { PHOTOS_BUCKET } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccount({ userId, organizer = false }: { userId: string; organizer?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organizátor by smazáním účtu přišel i o administraci – nejdřív ho musí někdo z týmu odebrat.
  if (organizer) {
    return <p className="text-[14px] leading-snug text-muted">{errorMessage("GU016")}</p>;
  }

  async function onDelete() {
    if (!confirm("Opravdu smazat účet? Smažou se fotky, matche i zprávy. Nejde to vrátit.")) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    // Pojistka i tady: kdyby byl uživatel mezitím přidán do týmu, fotky nemažeme.
    const { data: isOrganizer } = await supabase.rpc("is_organizer");
    if (isOrganizer === true) {
      setBusy(false);
      setError(errorMessage("GU016"));
      return;
    }

    // Fotky musí pryč přes Storage API (SQL je smazat nesmí).
    const storage = supabase.storage.from(PHOTOS_BUCKET);
    const { data: files } = await storage.list(userId, { limit: 100 });
    if (files?.length) await storage.remove(files.map((f) => `${userId}/${f.name}`));

    const { error } = await supabase.rpc("delete_account");
    if (error) {
      setBusy(false);
      setError(errorMessage(error, "Smazání se nepovedlo. Zkus to prosím znovu."));
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={onDelete} disabled={busy} className={`${btnDanger} w-full`}>
        {busy ? "Mažu…" : "Smazat účet"}
      </button>
      {error && <p className={`${errorText} mt-2`}>{error}</p>}
    </div>
  );
}
