import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { resolveNext } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

// Odkaz z e-mailu. Podporuje obě varianty:
//  - vlastní šablona: /auth/confirm?token_hash=…&type=email
//  - výchozí šablona Supabase (PKCE): /auth/confirm?code=…&next=…
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = resolveNext(searchParams.get("next"), origin);

  const supabase = await createClient();
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  redirect(`/login?error=link&next=${encodeURIComponent(next)}`);
}
