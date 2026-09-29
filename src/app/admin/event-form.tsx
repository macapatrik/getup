"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, errorText, input, label } from "@/components/ui";
import type { AdminFormState } from "./actions";

type EventDefaults = { name: string; venue: string; starts_at: string; ends_at: string };

/** Založení i úprava akce. Časy se zadávají v české zóně (datetime-local). */
export function EventForm({
  action,
  defaults,
  submitLabel,
  pendingText,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  defaults?: EventDefaults;
  submitLabel: string;
  pendingText: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={label}>
          Název
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={defaults?.name}
          placeholder="Halloween by GetUp.fun"
          className={input}
        />
      </div>
      <div>
        <label htmlFor="venue" className={label}>
          Místo
        </label>
        <input id="venue" name="venue" maxLength={120} defaultValue={defaults?.venue} placeholder="Klub K2, České Budějovice" className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="starts_at" className={label}>
            Začátek
          </label>
          <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={defaults?.starts_at} className={input} />
        </div>
        <div>
          <label htmlFor="ends_at" className={label}>
            Konec
          </label>
          <input id="ends_at" name="ends_at" type="datetime-local" required defaultValue={defaults?.ends_at} className={input} />
        </div>
      </div>
      <p className="ml-1 text-[13px] text-muted">Čas v české zóně. Po konci akce je swipování otevřené ještě 24 hodin.</p>
      {state.error && <p className={errorText}>{state.error}</p>}
      {state.ok && <p className="ml-1 text-[15px] font-semibold text-green-700">✓ {state.ok}</p>}
      <SubmitButton className={`${btnPrimary} w-full sm:w-auto`} pendingText={pendingText}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
