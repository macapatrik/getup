"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/** Sdílení odkazu: nativní panel (iOS/Android), na počítači zkopírování do schránky. */
export function ShareButton({
  title,
  text,
  url,
  className,
  iconOnly = false,
}: {
  title: string;
  text: string;
  url: string;
  className: string;
  iconOnly?: boolean;
}) {
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
    <button type="button" onClick={share} className={className} aria-label={copied ? "Odkaz zkopírován" : "Sdílet odkaz na akci"}>
      <Icon name={copied && iconOnly ? "check" : "share"} className={iconOnly ? "size-6" : "size-[18px]"} />
      {!iconOnly && (copied ? "Zkopírováno" : "Sdílet")}
    </button>
  );
}
