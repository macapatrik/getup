"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnSecondary, errorText, input } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { addAttendanceAction, type AdminFormState } from "../../actions";

/** Ruční přidání uživatele na akci (jen akce, které ještě neskončily a na kterých není). */
export function AttendanceForm({ userId, events }: { userId: string; events: { id: string; name: string; starts_at: string }[] }) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(addAttendanceAction.bind(null, userId), { error: null });

  if (events.length === 0) return <p className="mt-3 text-[13px] text-muted">Je na všech otevřených akcích.</p>;

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
      <select name="event_id" required defaultValue="" aria-label="Akce" className={`${input} w-auto flex-1 rounded-[12px] py-2.5`}>
        <option value="" disabled>
          Přidat na akci…
        </option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name} · {formatDate(event.starts_at)}
          </option>
        ))}
      </select>
      <SubmitButton className={`${btnSecondary} !py-2.5`} pendingText="Přidávám…">
        Přidat
      </SubmitButton>
      {state.error && <p className={`${errorText} w-full`}>{state.error}</p>}
      {state.ok && <p className="w-full text-[14px] font-semibold text-success">{state.ok}</p>}
    </form>
  );
}
