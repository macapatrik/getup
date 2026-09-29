"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger } from "@/components/ui";
import { PHOTOS_BUCKET } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccount({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Opravdu smazat účet? Smažou se fotky, matche i zprávy. Nejde to vrátit.")) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    // Fotky musí pryč přes Storage API (SQL je smazat nesmí).
    const storage = supabase.storage.from(PHOTOS_BUCKET);
    const { data: files } = await storage.list(userId, { limit: 100 });
    if (files?.length) await storage.remove(files.map((f) => `${userId}/${f.name}`));

    const { error } = await supabase.rpc("delete_account");
    if (error) {
      setBusy(false);
      setError("Smazání se nepovedlo. Zkus to prosím znovu.");
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
      {error && <p className="mt-2 ml-1 text-[15px] text-danger">{error}</p>}
    </div>
  );
}
