"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { btnPrimary, errorText } from "@/components/ui";
import { acceptTermsAction, type ConsentState } from "./actions";

function Checkbox({ name, defaultChecked, onChange, children }: {
  name: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="surface flex cursor-pointer items-start gap-3 rounded-[16px] p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <span className="grid size-6 shrink-0 place-items-center rounded-[8px] border-2 border-fill text-transparent transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50">
        <Icon name="check" className="size-4" />
      </span>
      <span className="text-[15px] leading-snug">{children}</span>
    </label>
  );
}

export function ConsentForm({ next, marketing }: { next: string; marketing: boolean }) {
  const [state, formAction] = useActionState<ConsentState, FormData>(acceptTermsAction.bind(null, next), { error: null });
  const [terms, setTerms] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <Checkbox name="terms" onChange={setTerms}>
        Je mi 18 let a souhlasím s{" "}
        <Link href="/podminky" className="font-semibold text-accent">
          podmínkami užití
        </Link>
        , včetně moderace a blokace účtu. Beru na vědomí{" "}
        <Link href="/soukromi" className="font-semibold text-accent">
          zásady ochrany soukromí
        </Link>
        .
      </Checkbox>
      <Checkbox name="marketing" defaultChecked={marketing}>
        Chci dostávat e-mailem pozvánky na akce GetUp a novinky.{" "}
        <span className="text-muted">Nepovinné, vypneš to kdykoli v Můj účet.</span>
      </Checkbox>
      {state.error && <p className={errorText}>{state.error}</p>}
      <div className="pt-3">
        <SubmitButton disabled={!terms} className={`${btnPrimary} w-full py-3.5`} pendingText="Ukládám…">
          Pokračovat
        </SubmitButton>
      </div>
    </form>
  );
}
