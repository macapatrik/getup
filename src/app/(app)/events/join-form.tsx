"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { errorText, input } from "@/components/ui";
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
        <SubmitButton pendingText="…" className="gloss-ink shrink-0 rounded-[14px] px-5 text-[17px] font-semibold transition active:scale-95 disabled:opacity-50">
          Vstoupit
        </SubmitButton>
      </div>
      {state.error && <p className={errorText}>{state.error}</p>}
    </form>
  );
}
