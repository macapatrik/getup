"use client";

import { useState, type FormEvent } from "react";
import { btnPrimary, input, label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError ? "Odkaz z e-mailu už neplatí. Nech si poslat nový kód." : null,
  );

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Moc pokusů za sebou. Počkej chvilku a zkus to znovu."
          : "E-mail se nepodařilo odeslat. Zkontroluj adresu.",
      );
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (error) {
      setBusy(false);
      setError("Kód nesedí nebo už vypršel.");
      return;
    }
    // Plná navigace: `next` může být route handler /j/KOD (připojení k akci).
    window.location.assign(next);
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className={label}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="ty@example.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-4`}>
          {busy ? "Posílám…" : "Poslat kód"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="mt-8 space-y-4">
      <p className="text-sm text-muted">
        Kód jsme poslali na <span className="font-medium text-white">{email}</span>. Můžeš taky kliknout na odkaz
        v e-mailu.
      </p>
      <div>
        <label htmlFor="code" className={label}>
          Kód z e-mailu
        </label>
        <input
          id="code"
          required
          autoFocus
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6,10}"
          maxLength={10}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${input} text-center text-2xl tracking-[0.4em]`}
        />
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-4`}>
        {busy ? "Ověřuji…" : "Přihlásit se"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
        }}
        className="w-full text-sm text-muted underline-offset-4 hover:underline"
      >
        Jiný e-mail / poslat znovu
      </button>
    </form>
  );
}
