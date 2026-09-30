"use client";

import { useState, type FormEvent } from "react";
import { IconField } from "@/components/field";
import { btnPrimary, errorText, input, inputWithIcon, label } from "@/components/ui";
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
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
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
      <form onSubmit={sendCode} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className={label}>
            E-mail
          </label>
          <IconField icon="mail">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="ty@example.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputWithIcon}
            />
          </IconField>
        </div>
        {error && <p className={errorText}>{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3.5`}>
          {busy ? "Posílám…" : "Poslat kód"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode} className="mt-8 space-y-5">
      <p className="text-[15px] text-muted">
        Kód jsme poslali na <span className="font-bold text-ink">{email}</span>. Můžeš taky kliknout na odkaz v e-mailu.
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
          className={`${input} text-center text-2xl font-bold tracking-[0.4em]`}
        />
      </div>
      {error && <p className={errorText}>{error}</p>}
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3.5`}>
        {busy ? "Ověřuji…" : "Přihlásit se"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
        }}
        className="w-full py-1 text-center text-[15px] font-semibold text-accent"
      >
        Jiný e-mail / poslat znovu
      </button>
    </form>
  );
}
