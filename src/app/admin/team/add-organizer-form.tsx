"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, errorText, input } from "@/components/ui";
import { addOrganizerAction, type AdminFormState } from "../actions";

export function AddOrganizerForm() {
  const [state, formAction] = useActionState<AdminFormState, FormData>(addOrganizerAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required placeholder="kolega@get-up.fun" className={`${input} !py-3`} />
        <SubmitButton className={`${btnPrimary} !py-3 !text-[15px] shrink-0`} pendingText="Přidávám…">
          Přidat do týmu
        </SubmitButton>
      </div>
      <p className="ml-1 text-[13px] text-muted">Kolega se musí nejdřív aspoň jednou přihlásit do aplikace stejným e-mailem.</p>
      {state.error && <p className={errorText}>{state.error}</p>}
      {state.ok && <p className="ml-1 text-[15px] font-semibold text-green-700">✓ {state.ok}</p>}
    </form>
  );
}
