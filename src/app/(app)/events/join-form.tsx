"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { input } from "@/components/ui";
import { joinEventAction, type FormState } from "../actions";

export function JoinForm({ initialError }: { initialError: string | null }) {
  const [state, formAction] = useActionState<FormState, FormData>(joinEventAction, { error: initialError });

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex gap-2">
        <input
          name="code"
          required
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          placeholder="KÓD AKCE"
          aria-label="Kód akce"
          className={`${input} font-mono tracking-[0.3em] uppercase`}
        />
        <SubmitButton pendingText="…" className="shrink-0 rounded-2xl bg-party px-5 font-semibold disabled:opacity-50">
          Vstoupit
        </SubmitButton>
      </div>
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
    </form>
  );
}
