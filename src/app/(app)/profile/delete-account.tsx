"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { btnDanger, btnSecondary, errorText, input, label } from "@/components/ui";
import { errorMessage } from "@/lib/errors";
import { PHOTOS_BUCKET } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

/** Smazání účtu: nejdřív kód z e-mailu (nové ověření), teprve pak se účet smaže. Databáze to hlídá taky (GU020). */
export function DeleteAccount({ userId, email, organizer = false }: { userId: string; email: string; organizer?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Organizátor by smazáním účtu přišel i o administraci – nejdřív ho musí někdo z týmu odebrat.
  if (organizer) {
    return <p className="text-[14px] leading-snug text-muted">{errorMessage("GU016")}</p>;
  }

  async function sendCode() {
    if (!confirm("Opravdu smazat účet? Smažou se fotky, kontakty i matche. Nejde to vrátit.")) return;
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Moc pokusů za sebou. Počkej chvilku a zkus to znovu."
          : "Kód se nepodařilo poslat. Zkus to prosím znovu.",
      );
      return;
    }
    setStep("code");
  }

  async function confirmDelete(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();

    // Nové ověření kódem: vznikne čerstvá session, bez ní databáze účet nesmaže.
    const { error: otpError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (otpError) {
      setBusy(false);
      setError("Kód nesedí nebo už vypršel.");
      return;
    }

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

  if (step === "code") {
    return (
      <form onSubmit={confirmDelete} className="space-y-3">
        <p className="text-[14px] leading-snug text-muted">
          Poslali jsme kód na <span className="font-bold text-ink">{email}</span>. Zadej ho a účet smažeme natrvalo.
        </p>
        <div>
          <label htmlFor="delete-code" className={label}>
            Kód z e-mailu
          </label>
          <input
            id="delete-code"
            required
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6,10}"
            maxLength={10}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${input} text-center text-2xl font-bold tracking-[0.4em]`}
          />
        </div>
        {error && <p className={errorText}>{error}</p>}
        <button type="submit" disabled={busy || code.length < 6} className={`${btnDanger} w-full`}>
          {busy ? "Mažu…" : "Smazat účet natrvalo"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setStep("idle");
            setCode("");
            setError(null);
          }}
          className={`${btnSecondary} w-full`}
        >
          Zpět, účet nechám
        </button>
      </form>
    );
  }

  return (
    <div>
      <button type="button" onClick={sendCode} disabled={busy} className={`${btnDanger} w-full`}>
        {busy ? "Posílám kód…" : "Smazat účet"}
      </button>
      <p className="mt-2 text-[13px] leading-snug text-muted">Smazání potvrdíš kódem, který ti pošleme na e-mail.</p>
      {error && <p className={`${errorText} mt-2`}>{error}</p>}
    </div>
  );
}
