"use client";

import { useActionState, useRef } from "react";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { btnDanger, btnSecondary, input } from "@/components/ui";
import { reportAction, type FormState } from "../../actions";

export function ChatMenu({
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
          className="grid size-10 cursor-pointer list-none place-items-center rounded-full hover:bg-surface [&::-webkit-details-marker]:hidden"
        >
          <Icon name="dots" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-56 space-y-1 rounded-2xl border border-line bg-surface-2 p-2 shadow-xl">
          <form
            action={unmatch}
            onSubmit={(e) => {
              if (!confirm(`Opravdu zrušit match s ${name}? Chat se smaže.`)) e.preventDefault();
            }}
          >
            <button type="submit" className="w-full rounded-xl px-4 py-2.5 text-left hover:bg-surface">
              Zrušit match
            </button>
          </form>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="w-full rounded-xl px-4 py-2.5 text-left text-red-300 hover:bg-red-500/10"
          >
            Nahlásit
          </button>
        </div>
      </details>

      <dialog
        ref={dialog}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-line bg-surface p-6 text-white backdrop:bg-black/70"
      >
        <form action={formAction} className="space-y-4">
          <h2 className="text-xl font-bold">Nahlásit {name}</h2>
          <p className="text-sm text-muted">
            Co se stalo? Hlášení uvidí jen tým GetUp. Match se zároveň zruší a {name} už neuvidíš.
          </p>
          <textarea name="reason" required rows={4} maxLength={1000} className={`${input} resize-none`} />
          {state.error && <p className="text-sm text-red-300">{state.error}</p>}
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
