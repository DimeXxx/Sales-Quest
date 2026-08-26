interface ProgressProps {
  value: number; // 0-100
  colorClassName?: string; // tailwind bg-* class for the fill
  trackClassName?: string;
  className?: string;
  height?: string; // tailwind height class, e.g. "h-2"
  glowColor?: string; // hex used for a soft drop-shadow glow on the fill
}

export function Progress({
  value,
  colorClassName = "bg-emerald-400",
  trackClassName = "bg-slate-800/80",
  className = "",
  height = "h-2",
  glowColor,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden rounded-full ${height} ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClassName}`}
        style={{ width: `${clamped}%`, filter: glowColor ? `drop-shadow(0 0 6px ${glowColor})` : undefined }}
      />
    </div>
  );
}
