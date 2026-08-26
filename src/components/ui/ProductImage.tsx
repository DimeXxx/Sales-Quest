import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { findProductPhoto } from "../../lib/productImageSearch";

interface ProductImageProps {
  /** Explicit override URL — if given, used directly (with graceful fallback on load error). */
  src?: string;
  /** Product name — used to build the live internet search query when no `src` is given. */
  name: string;
  /** Product category — usually gives better search results than the exact SKU-heavy name. */
  category?: string;
  className?: string;
  accentFrom?: string; // tailwind gradient-from class, e.g. "from-sky-500/40"
  accentTo?: string; // tailwind gradient-to class
}

/**
 * Renders a product photo. If an explicit `src` is provided it's used as-is
 * (falling back to the placeholder if it fails to load). Otherwise it
 * automatically searches the internet (Wikimedia Commons, no API key needed)
 * for a photo matching the product's category/name. While searching, or if
 * nothing is found, a stylized neon placeholder is shown instead of a broken
 * image icon.
 */
export function ProductImage({ src, name, category, className = "", accentFrom = "from-cyan-500/40", accentTo = "to-violet-500/40" }: ProductImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(src ?? null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(!src);

  useEffect(() => {
    if (src) {
      setResolvedUrl(src);
      setFailed(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    const query = category ? `${category} product photo` : name;
    findProductPhoto(query).then((url) => {
      if (cancelled) return;
      if (url) {
        setResolvedUrl(url);
      } else {
        setFailed(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, category, name]);

  if (failed || (!resolvedUrl && !loading)) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-slate-900 ${className}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${accentFrom} ${accentTo}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
        <Package className="relative h-10 w-10 text-white/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
      </div>
    );
  }

  if (loading || !resolvedUrl) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
        <div className={`absolute inset-0 animate-pulse bg-gradient-to-br ${accentFrom} ${accentTo} opacity-50`} />
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
