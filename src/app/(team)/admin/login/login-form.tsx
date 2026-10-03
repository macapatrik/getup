"use client";

import { useState, type FormEvent } from "react";
import { IconField } from "@/components/field";
import { btnPrimary, errorText, input, inputWithIcon, label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      setError(
        error.status === 429
          ? "Moc pokusů za sebou. Počkej chvilku a zkus to znovu."
          : "E-mail nebo heslo nesedí.",
      );
      return;
    }
    // Plná navigace, ať server vidí novou session.
    window.location.assign(next);
  }

  return (
    <form onSubmit={signIn} className="mt-6 space-y-5">
      <div>
        <label htmlFor="admin-email" className={label}>
          E-mail
        </label>
        <IconField icon="mail">
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            inputMode="email"
            placeholder="info@get-up.fun"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputWithIcon}
          />
        </IconField>
      </div>
      <div>
        <label htmlFor="admin-password" className={label}>
          Heslo
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      </div>
      {error && <p className={errorText}>{error}</p>}
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-3.5`}>
        {busy ? "Přihlašuji…" : "Přihlásit se"}
      </button>
    </form>
  );
}
