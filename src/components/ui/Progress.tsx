interface ProgressProps {
  value: number; // 0-100
  colorClassName?: string; // tailwind bg-* class for the fill
  trackClassName?: string;
  className?: string;
  height?: string; // tailwind height class, e.g. "h-1.5"
}

// Clean, thin progress bar — no glow filter. A premium SaaS product signals
// progress through crisp contrast, not light bloom.
export function Progress({
  value,
  colorClassName = "bg-cyan-400",
  trackClassName = "bg-white/[0.06]",
  className = "",
  height = "h-1.5",
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden rounded-full ${height} ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-200 ease-out ${colorClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
