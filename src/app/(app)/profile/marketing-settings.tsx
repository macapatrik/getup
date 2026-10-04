"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Switch } from "@/components/switch";
import { card } from "@/components/ui";
import { setMarketingAction } from "../actions";

/** Souhlas s novinkami e-mailem z obrazovky /souhlas – tady se dá kdykoli vypnout nebo zapnout. */
export function MarketingSettings({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    setOn(next);
    setError(null);
    startTransition(async () => {
      const result = await setMarketingAction(next);
      if (result.error) {
        setOn(!next);
        setError(result.error);
      }
    });
  }

  return (
    <section className={`${card} space-y-3`}>
      <div className="flex items-center gap-3">
        <span className="fill-accent-soft grid size-10 shrink-0 place-items-center rounded-full">
          <Icon name="mail" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold">Novinky e-mailem</p>
          <p className="text-[13px] text-muted">{on ? "Pozvánky na akce GetUp a novinky" : "Vypnuto"}</p>
        </div>
        <Switch checked={on} label="Novinky e-mailem" disabled={pending} onChange={change} />
      </div>
      {error && <p className="ml-1 text-[14px] font-medium text-danger">{error}</p>}
    </section>
  );
}
