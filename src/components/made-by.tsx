/** Podpis autora dole na úvodních obrazovkách a v Můj účet. */
export function MadeBy({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[12px] text-muted ${className}`}>
      Vytvořil <span className="font-semibold text-ink">Patrik Máca</span>
    </p>
  );
}
