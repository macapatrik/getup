"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, errorText, input, label } from "@/components/ui";
import { createEventAction, type FormState } from "../actions";

export function CreateEventForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createEventAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={label}>
          Název
        </label>
        <input id="name" name="name" required maxLength={120} placeholder="GetUp Open Air 2026" className={input} />
      </div>
      <div>
        <label htmlFor="venue" className={label}>
          Místo
        </label>
        <input id="venue" name="venue" maxLength={120} placeholder="Lucerna, Praha" className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="starts_at" className={label}>
            Začátek
          </label>
          <input id="starts_at" name="starts_at" type="datetime-local" required className={input} />
        </div>
        <div>
          <label htmlFor="ends_at" className={label}>
            Konec
          </label>
          <input id="ends_at" name="ends_at" type="datetime-local" required className={input} />
        </div>
      </div>
      <p className="ml-1 text-[13px] text-muted">Čas v české zóně. Po konci akce je swipování otevřené ještě 24 hodin.</p>
      {state.error && <p className={errorText}>{state.error}</p>}
      <SubmitButton className={`${btnPrimary} w-full`} pendingText="Zakládám…">
        Založit a vygenerovat QR
      </SubmitButton>
    </form>
  );
}
