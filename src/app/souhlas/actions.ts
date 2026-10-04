"use server";

import { requireUser } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { TERMS_VERSION } from "@/lib/legal";
import { safeNext } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export type ConsentState = { error: string | null; next?: string };

export async function acceptTermsAction(next: string, _prev: ConsentState, formData: FormData): Promise<ConsentState> {
  await requireUser();
  if (formData.get("terms") !== "on") return { error: "Bez souhlasu s podmínkami aplikaci používat nejde." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_terms", {
    p_version: TERMS_VERSION,
    p_marketing: formData.get("marketing") === "on",
  });
  if (error) return { error: errorMessage(error) };

  // Dál naviguje formulář plným načtením: `next` může být route handler /j/KOD (připojení k akci).
  return { error: null, next: safeNext(next) };
}
