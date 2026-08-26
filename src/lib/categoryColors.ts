// Consistent, vivid per-category accent colors used across cards, banners and charts.

export interface CategoryStyle {
  from: string; // gradient start (tailwind class)
  to: string; // gradient end (tailwind class)
  text: string;
  chipBg: string;
  hex: string; // raw hex for inline SVG/canvas usage
}

const PALETTE: CategoryStyle[] = [
  { from: "from-sky-500", to: "to-cyan-400", text: "text-sky-300", chipBg: "bg-sky-500/15", hex: "#38BDF8" },
  { from: "from-violet-500", to: "to-fuchsia-400", text: "text-violet-300", chipBg: "bg-violet-500/15", hex: "#A78BFA" },
  { from: "from-emerald-500", to: "to-teal-400", text: "text-emerald-300", chipBg: "bg-emerald-500/15", hex: "#34D399" },
  { from: "from-amber-500", to: "to-orange-400", text: "text-amber-300", chipBg: "bg-amber-500/15", hex: "#FBBF24" },
  { from: "from-rose-500", to: "to-pink-400", text: "text-rose-300", chipBg: "bg-rose-500/15", hex: "#FB7185" },
  { from: "from-indigo-500", to: "to-blue-400", text: "text-indigo-300", chipBg: "bg-indigo-500/15", hex: "#818CF8" },
];

const cache = new Map<string, CategoryStyle>();

export function getCategoryStyle(category: string): CategoryStyle {
  if (cache.has(category)) return cache.get(category)!;
  // Stable hash so the same category always maps to the same color.
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  const style = PALETTE[hash % PALETTE.length];
  cache.set(category, style);
  return style;
}
