import { LOGO_LEFT, LOGO_LEFT_OPACITY, LOGO_RIGHT, LOGO_RIGHT_OPACITY } from "@/lib/logo-mark";

export function LogoMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`drop-shadow-sm ${className}`} aria-hidden>
      <path d={LOGO_LEFT} fill="white" fillOpacity={LOGO_LEFT_OPACITY} />
      <path d={LOGO_RIGHT} fill="white" fillOpacity={LOGO_RIGHT_OPACITY} />
    </svg>
  );
}

export function AppIcon({ className = "size-9 rounded-[10px]", mark = "size-6" }: { className?: string; mark?: string }) {
  return (
    <span className={`gloss grid shrink-0 place-items-center ${className}`}>
      <LogoMark className={mark} />
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AppIcon className="size-10 rounded-[12px]" mark="size-7" />
      <span className="flex flex-col">
        <span className="font-display text-[21px] leading-none font-bold tracking-tight">
          Get<span className="text-gradient">Together</span>
        </span>
        <span className="mt-1 text-[10px] leading-none font-semibold tracking-[0.2em] text-muted uppercase">
          by GetUp
        </span>
      </span>
    </span>
  );
}
