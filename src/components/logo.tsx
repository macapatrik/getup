import { Icon } from "./icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xl font-black tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-xl bg-party">
        <Icon name="heart" className="size-5 text-white" />
      </span>
      <span>
        GetUp <span className="text-party">Match</span>
      </span>
    </span>
  );
}
