import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/** Pole s ikonou vlevo jako u Romio. Vnitřní <input> použije třídu `inputWithIcon`. */
export function IconField({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink">
        <Icon name={icon} className="size-6" />
      </span>
      {children}
    </div>
  );
}
