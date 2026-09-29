"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Odesílací tlačítko s potvrzením (mazání, blokace apod.). */
export function ConfirmButton({ message, className, children }: { message: string; className: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Moment…" : children}
    </button>
  );
}
