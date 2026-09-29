"use client";

import { useEffect, useState } from "react";
import { sendTestPushAction } from "@/app/(app)/actions";
import {
  currentEndpoint,
  detectPushState,
  disablePush,
  enablePush,
  syncPushSubscription,
  type PushState,
} from "@/lib/push-client";
import { Icon } from "./icons";
import { btnSecondary, card } from "./ui";

const DISMISS_KEY = "gt-push-prompt-dismissed";

const STATUS: Record<PushState, string> = {
  loading: "Zjišťuji…",
  unsupported: "Tenhle prohlížeč upozornění neumí.",
  install: "Nejdřív si přidej aplikaci na plochu.",
  denied: "Upozornění jsou v telefonu zakázaná.",
  off: "Dáme ti vědět, když se s někým lajknete.",
  on: "Zapnuto na tomhle zařízení.",
};

function usePush() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    detectPushState().then(setState, () => setState("unsupported"));
  }, []);

  async function run(task: () => Promise<PushState>, failure: string) {
    setBusy(true);
    setNote(null);
    try {
      setState(await task());
    } catch {
      setNote(failure);
    } finally {
      setBusy(false);
    }
  }

  return {
    state,
    busy,
    note,
    setBusy,
    setNote,
    enable: () => run(enablePush, "Upozornění se nepodařilo zapnout. Zkus to prosím znovu."),
    disable: () => run(disablePush, "Upozornění se nepodařilo vypnout. Zkus to prosím znovu."),
  };
}

/** Při otevření aplikace přiřadí odběr tohoto zařízení přihlášenému účtu. */
export function PushSync() {
  useEffect(() => {
    syncPushSubscription().catch(() => {});
  }, []);
  return null;
}

function InstallHint() {
  return (
    <p className="text-[14px] leading-snug text-muted">
      Na iPhonu fungují upozornění jen z plochy: v Safari klepni na <span className="font-semibold text-ink">Sdílet</span> →{" "}
      <span className="font-semibold text-ink">Přidat na plochu</span> a GetTogether otevři z ikony.
    </p>
  );
}

/** Nastavení upozornění v profilu. */
export function PushSettings() {
  const { state, busy, note, setBusy, setNote, enable, disable } = usePush();
  const on = state === "on";

  async function sendTest() {
    setBusy(true);
    setNote(null);
    const endpoint = await currentEndpoint();
    const result = endpoint ? await sendTestPushAction(endpoint) : { error: "Na tomhle zařízení nemáš upozornění zapnutá." };
    setNote(result.error ?? "Odesláno – upozornění by mělo během chvilky dorazit.");
    setBusy(false);
  }

  return (
    <section className={`${card} space-y-4`}>
      <div className="flex items-center gap-3">
        <span className="glass-inner grid size-10 shrink-0 place-items-center rounded-full text-accent">
          <Icon name="bell" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold">Upozornění na matche</p>
          <p className="text-[13px] text-muted">{STATUS[state]}</p>
        </div>
        {(state === "on" || state === "off") && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Upozornění na matche"
            disabled={busy}
            onClick={on ? disable : enable}
            className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-accent" : "bg-black/10"}`}
          >
            <span
              className={`absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.2)] transition-transform ${on ? "translate-x-5" : ""}`}
            />
          </button>
        )}
      </div>

      {state === "install" && <InstallHint />}
      {state === "denied" && (
        <p className="text-[14px] leading-snug text-muted">
          Povol je v <span className="font-semibold text-ink">Nastavení → Oznámení → GetTogether</span> (nebo v nastavení prohlížeče).
        </p>
      )}
      {on && (
        <button type="button" onClick={sendTest} disabled={busy} className={`${btnSecondary} w-full`}>
          Poslat zkušební upozornění
        </button>
      )}
      {note && <p className="ml-1 text-[14px] font-medium text-muted">{note}</p>}
    </section>
  );
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Nenápadná výzva na stránce matchů, dokud upozornění nejsou zapnutá. */
export function PushPrompt() {
  const { state, busy, note, enable } = usePush();
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // soukromé okno – výzva se jen znovu ukáže
    }
  }

  // Stav se zjišťuje až v prohlížeči, takže localStorage tu čteme až po hydrataci.
  if (dismissed || (state !== "off" && state !== "install") || wasDismissed()) return null;

  return (
    <div className="glass mt-5 flex items-center gap-3 rounded-[22px] py-3 pr-2 pl-4">
      <Icon name="bell" className="size-6 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        {state === "install" ? (
          <InstallHint />
        ) : (
          <p className="text-[14px] leading-snug font-medium">{note ?? "Zapni si upozornění, ať ti žádný match neuteče."}</p>
        )}
      </div>
      {state === "off" && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="gloss-ink shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition active:scale-95 disabled:opacity-60"
        >
          Zapnout
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label="Skrýt" className="grid size-8 shrink-0 place-items-center rounded-full text-muted">
        <Icon name="x" className="size-4" />
      </button>
    </div>
  );
}
