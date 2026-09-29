"use client";

import { btnSecondary } from "@/components/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btnSecondary} flex-1`}>
      Vytisknout
    </button>
  );
}
