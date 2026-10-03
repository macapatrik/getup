"use client";

import { useActionState } from "react";
import { btnDanger, errorText } from "@/components/ui";
import { deleteUserAction, type AdminFormState } from "../../actions";
import { ConfirmButton } from "../../confirm-button";

/** Úplné smazání cizího účtu týmem GetUp, s potvrzením. */
export function DeleteUserForm({ userId, name }: { userId: string; name: string }) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(deleteUserAction.bind(null, userId), { error: null });

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <ConfirmButton message={`Opravdu natrvalo smazat účet ${name}? Nejde to vrátit.`} className={`${btnDanger} w-full`}>
        Smazat účet natrvalo
      </ConfirmButton>
      {state.error && <p className={errorText}>{state.error}</p>}
    </form>
  );
}
