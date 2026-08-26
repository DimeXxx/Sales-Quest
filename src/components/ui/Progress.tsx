interface ProgressProps {
  value: number; // 0-100
  colorClassName?: string; // tailwind bg-* class for the fill
  trackClassName?: string;
  className?: string;
  height?: string; // tailwind height class, e.g. "h-2"
}

export function Progress({
  value,
  colorClassName = "bg-emerald-400",
  trackClassName = "bg-white/5",
  className = "",
  height = "h-2",
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden rounded-full ${height} ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
