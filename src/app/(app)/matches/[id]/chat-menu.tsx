"use client";

import { useActionState, useRef } from "react";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { btnDanger, btnSecondary, errorText, iconButton, input } from "@/components/ui";
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
          className={`${iconButton} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
        >
          <Icon name="dots" className="size-5" />
        </summary>
        <div className="glass absolute right-0 z-20 mt-2 w-56 rounded-[20px] p-1.5">
          <form
            action={unmatch}
            onSubmit={(e) => {
              if (!confirm(`Opravdu zrušit match s ${name}? Chat se smaže.`)) e.preventDefault();
            }}
          >
            <button type="submit" className="w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium hover:bg-black/5">
              Zrušit match
            </button>
          </form>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium text-danger hover:bg-danger/10"
          >
            Nahlásit
          </button>
        </div>
      </details>

      <dialog
        ref={dialog}
        className="glass m-auto w-[calc(100%-2rem)] max-w-sm rounded-[28px] p-6 text-ink backdrop:bg-black/25 backdrop:backdrop-blur-sm"
      >
        <form action={formAction} className="space-y-4">
          <h2 className="font-display text-[22px] font-bold">Nahlásit {name}</h2>
          <p className="text-[15px] text-muted">
            Co se stalo? Hlášení uvidí jen tým GetUp. Match se zároveň zruší a {name} už neuvidíš.
          </p>
          <textarea name="reason" required rows={4} maxLength={1000} className={`${input} resize-none`} />
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
