"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { TERMS_VERSION } from "@/lib/legal";
import { safeNext } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export type ConsentState = { error: string | null };

export async function acceptTermsAction(next: string, _prev: ConsentState, formData: FormData): Promise<ConsentState> {
  await requireUser();
  if (formData.get("terms") !== "on") return { error: "Bez souhlasu s podmínkami aplikaci používat nejde." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_terms", {
    p_version: TERMS_VERSION,
    p_marketing: formData.get("marketing") === "on",
  });
  if (error) return { error: errorMessage(error) };

  // Plná navigace přes redirect: `next` může být route handler /j/KOD (připojení k akci).
  redirect(safeNext(next));
}
