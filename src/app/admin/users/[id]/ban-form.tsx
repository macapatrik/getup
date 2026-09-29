"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { btnDanger, btnSecondary, errorText, input, label } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { setBanAction, type AdminFormState } from "../../actions";

/** Zablokování / odblokování účtu */
export function BanForm({ userId, ban }: { userId: string; ban: { reason: string; created_at: string } | null }) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(setBanAction.bind(null, userId, !ban), { error: null });

  return (
    <form action={formAction} className="space-y-3">
      {ban ? (
        <>
          <p className="text-[15px]">
            <span className="font-semibold text-danger">Zablokovaný</span> od {formatDateTime(ban.created_at)}
          </p>
          {ban.reason && <p className="glass-inner rounded-[14px] px-4 py-3 text-[15px]">„{ban.reason}“</p>}
          <p className="text-[13px] text-muted">Po odblokování se zase ukáže ostatním na svých akcích.</p>
        </>
      ) : (
        <>
          <p className="text-[14px] text-muted">
            Zablokovaný účet zmizí z balíčků i z matchů ostatních a nemůže swipovat, psát ani se připojit k akci.
          </p>
          <div>
            <label htmlFor="reason" className={label}>
              Důvod (vidí jen tým)
            </label>
            <textarea id="reason" name="reason" rows={2} maxLength={500} required className={`${input} resize-none`} />
          </div>
        </>
      )}
      {state.error && <p className={errorText}>{state.error}</p>}
      {state.ok && <p className="text-[15px] font-semibold text-green-700">✓ {state.ok}</p>}
      <SubmitButton className={ban ? btnSecondary : btnDanger} pendingText="Moment…">
        {ban ? "Odblokovat účet" : "Zablokovat účet"}
      </SubmitButton>
    </form>
  );
}
