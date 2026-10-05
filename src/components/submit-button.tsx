"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "./ui";

export function SubmitButton({
  children,
  pendingText = "Moment…",
  className = btnPrimary,
  disabled = false,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
  /** Pojmenované odeslání (víc tlačítek v jednom formuláři) */
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className} name={name} value={value}>
      {pending ? pendingText : children}
    </button>
  );
}
