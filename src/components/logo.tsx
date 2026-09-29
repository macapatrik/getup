import { Icon } from "./icons";

export function AppIcon({ className = "size-9 rounded-[10px]", heart = "size-5" }: { className?: string; heart?: string }) {
  return (
    <span className={`gloss grid shrink-0 place-items-center ${className}`}>
      <Icon name="heart" className={`${heart} text-white drop-shadow-sm`} />
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight ${className}`}>
      <AppIcon />
      <span>
        GetUp <span className="text-gradient">Match</span>
      </span>
    </span>
  );
}
