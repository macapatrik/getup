"use client";

import { useActionState } from "react";
import { IconField } from "@/components/field";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { errorText, inputWithIcon } from "@/components/ui";
import { joinEventAction, type FormState } from "../actions";

export function JoinForm({ initialError }: { initialError: string | null }) {
  const [state, formAction] = useActionState<FormState, FormData>(joinEventAction, { error: initialError });

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <IconField icon="ticket">
            <input
              name="code"
              required
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={12}
              placeholder="Kód akce"
              aria-label="Kód akce"
              className={`${inputWithIcon} font-mono tracking-[0.2em] uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case`}
            />
          </IconField>
        </div>
        <SubmitButton
          pendingText="…"
          className="fill-accent grid size-12 shrink-0 place-items-center rounded-[12px] transition active:scale-95 disabled:opacity-50"
        >
          <span className="sr-only">Vstoupit</span>
          <Icon name="chevron" className="size-6" />
        </SubmitButton>
      </div>
      {state.error && <p className={errorText}>{state.error}</p>}
    </form>
  );
}
