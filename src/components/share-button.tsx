"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/** Sdílení odkazu: nativní panel (iOS/Android), na počítači zkopírování do schránky. */
export function ShareButton({ title, text, url, className }: { title: string; text: string; url: string; className: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // zavřený panel sdílení – nic
    }
  }

  return (
    <button type="button" onClick={share} className={className} aria-label="Sdílet odkaz na akci">
      <Icon name="share" className="size-[18px]" />
      {copied ? "Zkopírováno" : "Sdílet"}
    </button>
  );
}
