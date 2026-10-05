"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, btnSecondary, errorText, input, label } from "@/components/ui";
import { setSwipingOpensAtAction, type AdminFormState } from "./actions";

/** Odkdy jde swipovat. Prázdné datum = otevřít hned. */
export function SwipingForm({ defaultValue, closed }: { defaultValue: string; closed: boolean }) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(setSwipingOpensAtAction, { error: null });

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-[14px] leading-snug text-muted">
        {closed
          ? "Swipování je pozastavené. Lidi se můžou registrovat, vyplnit profil a připojit k akci, karty uvidí až od zadaného času."
          : "Swipování je otevřené. Zadej čas, od kdy má jet, a do té doby se pozastaví."}
      </p>
      <div>
        <label htmlFor="opens_at" className={label}>
          Otevřít od
        </label>
        <input id="opens_at" name="opens_at" type="datetime-local" defaultValue={defaultValue} className={input} />
      </div>
      {state.error && <p className={errorText}>{state.error}</p>}
      {state.ok && <p className="text-[14px] font-semibold text-success">{state.ok}</p>}
      <div className="flex flex-wrap gap-2">
        <SubmitButton className={btnPrimary} pendingText="Ukládám…">
          Uložit
        </SubmitButton>
        <SubmitButton className={btnSecondary} pendingText="Otevírám…" name="open_now" value="1">
          Otevřít hned
        </SubmitButton>
      </div>
    </form>
  );
}
