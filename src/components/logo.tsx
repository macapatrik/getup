import { APP_NAME } from "@/lib/config";
import { LOGO_HEART, LOGO_ROTATE, LOGO_SHINE, LOGO_SPARK } from "@/lib/logo-mark";

/** Značka: srdce se zábleskem a leskem. Barvu bere z `currentColor`. */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform={LOGO_ROTATE}>
        <path d={LOGO_HEART} fill="currentColor" fillRule="evenodd" />
        <path d={LOGO_SPARK} fill="currentColor" />
        <path d={LOGO_SHINE} fill="#fff" fillOpacity={0.45} />
      </g>
    </svg>
  );
}

/** Ikona aplikace: růžovo-indigový přechod s bílou značkou (přihlášení, úvod). */
export function AppIcon({ className = "size-9 rounded-[10px]", mark = "size-6" }: { className?: string; mark?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-accent to-indigo text-white shadow-[0_16px_30px_-14px_rgb(247_89_245/0.6)] ${className}`}
    >
      <LogoMark className={mark} />
    </span>
  );
}

/** Logo v hlavičce jako u Romio: značka + růžový název. */
export function Logo({ className = "", tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-accent ${className}`}>
      <LogoMark className="size-8" />
      <span className="flex flex-col">
        <span className="bg-gradient-to-r from-accent to-indigo bg-clip-text text-[20px] leading-none font-bold text-transparent">{APP_NAME}</span>
        {tagline && (
          <span className="mt-1 text-[10px] leading-none font-bold tracking-[0.2em] text-muted uppercase">by GetUp</span>
        )}
      </span>
    </span>
  );
}
