"use client";

import { useActionState, useRef } from "react";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { btnDanger, btnSecondary, errorText, input } from "@/components/ui";
import { reportAction, type FormState } from "../../actions";

/** Menu na stránce matche: zrušit match, nahlásit. */
export function MatchMenu({
  matchId,
  name,
  unmatch,
}: {
  matchId: string;
  name: string;
  unmatch: () => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState<FormState, FormData>(reportAction.bind(null, matchId), {
    error: null,
  });

  return (
    <>
      <details className="relative">
        <summary
          aria-label="Možnosti"
          className="grid size-10 cursor-pointer list-none place-items-center text-ink [&::-webkit-details-marker]:hidden"
        >
          <Icon name="dots" className="size-6" />
        </summary>
        <div className="surface absolute right-0 z-20 mt-1 w-56 rounded-[16px] p-1.5 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.3)]">
          <form
            action={unmatch}
            onSubmit={(e) => {
              if (!confirm(`Opravdu zrušit match s ${name}? Už neuvidíte svoje kontakty.`)) e.preventDefault();
            }}
          >
            <button type="submit" className="w-full rounded-[12px] px-4 py-3 text-left text-[15px] font-semibold hover:bg-fill">
              Zrušit match
            </button>
          </form>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="w-full rounded-[12px] px-4 py-3 text-left text-[15px] font-semibold text-danger hover:bg-danger/10"
          >
            Nahlásit
          </button>
        </div>
      </details>

      <dialog
        ref={dialog}
        className="surface m-auto w-[calc(100%-2rem)] max-w-sm rounded-[16px] p-6 text-ink backdrop:bg-black/20 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="space-y-4">
          <h2 className="text-[22px] font-bold">Nahlásit {name}</h2>
          <p className="text-[15px] text-muted">
            Co se stalo? Hlášení uvidí jen tým GetUp. Match se zároveň zruší a {name} už neuvidíš.
          </p>
          <textarea name="reason" required rows={4} maxLength={1000} className={`${input} resize-none rounded-[16px]`} />
          {state.error && <p className={errorText}>{state.error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className={btnSecondary}>
              Zpět
            </button>
            <SubmitButton className={btnDanger} pendingText="Odesílám…">
              Nahlásit
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
