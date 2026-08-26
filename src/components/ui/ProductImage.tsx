import { useState } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  accentFrom?: string; // tailwind gradient-from class
  accentTo?: string; // tailwind gradient-to class
}

/**
 * Renders the product photo, or — if the URL is missing or fails to load —
 * a stylized neon-gradient placeholder instead of a broken-image icon.
 */
export function ProductImage({ src, alt, className = "", accentFrom = "from-cyan-500/30", accentTo = "to-violet-500/30" }: ProductImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-slate-900 ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${accentFrom} ${accentTo}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
        <Package className="relative h-10 w-10 text-white/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
