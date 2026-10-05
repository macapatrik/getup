import { EVENT } from "./event";

/** Chromový nápis TINDER jako na plakátu: písmo Anton, růžový kovový přechod a 3D stín (utilita tp-chrome). */
export function TinderTitle({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tp-chrome inline-block -skew-x-6 leading-none uppercase ${className}`} aria-hidden>
      {EVENT.title}
    </span>
  );
}
