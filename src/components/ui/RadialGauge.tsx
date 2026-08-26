import type { LucideIcon } from "lucide-react";

interface RadialGaugeProps {
  pct: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string; // hex
  icon?: LucideIcon;
  centerLabel?: string;
}

/** Speedometer-style 270° gauge ring with a glow, used on quest cards & dashboards. */
export function RadialGauge({ pct, size = 64, stroke = 6, color = "#22D3EE", icon: Icon, centerLabel }: RadialGaugeProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arcFrac = 0.75; // 270 degrees
  const arcLen = c * arcFrac;
  const fillLen = arcLen * (Math.max(0, Math.min(100, pct)) / 100);

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#1A2333" strokeWidth={stroke} fill="none"
          strokeDasharray={`${arcLen} ${c}`} strokeLinecap="round"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${fillLen} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease", filter: `drop-shadow(0 0 5px ${color}aa)` }}
        />
      </svg>
      {Icon && <Icon className="absolute h-1/3 w-1/3 text-slate-400" strokeWidth={1.75} />}
      {centerLabel && <span className="absolute text-xs font-bold text-slate-100">{centerLabel}</span>}
    </div>
  );
}
