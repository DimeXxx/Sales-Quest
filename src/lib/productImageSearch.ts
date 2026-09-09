// ---------------------------------------------------------------------------
// Pulls a real photo from the internet for a product, based on its name /
// category — no API key needed. Wikimedia Commons' API supports anonymous,
// CORS-enabled requests (origin=*), so this works directly from the browser.
//
// Full-text search on Commons is loose: a vague query like "Storage product
// photo" ranks on the word "photo" and returns unrelated art/travel shots.
// To keep results actually relevant we (1) use curated, specific phrase
// queries for the known product categories instead of generic filler words,
// (2) reject results that are vector/icon files or too small to be real
// product photography, and (3) fall back to a second, narrower query before
// giving up — callers should treat `null` as "show the placeholder".
// ---------------------------------------------------------------------------

interface CommonsImageInfo {
  url?: string;
  thumburl?: string;
  width?: number;
  height?: number;
}

interface CommonsPage {
  imageinfo?: CommonsImageInfo[];
}

interface CommonsResponse {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
}

// Specific, unambiguous phrase queries for the categories this app ships
// with — far more reliable than searching the raw category label. A
// category mapped to `null` intentionally skips the search entirely (no
// generic photo makes sense for it, e.g. software), always showing the
// stylized placeholder instead.
const CATEGORY_QUERY: Record<string, string | null> = {
  Storage: "hard disk drive",
  "IP Camera": "IP security camera",
  NVR: "network video recorder",
  "Access Control": "access control keypad",
  "PTZ Camera": "PTZ security camera",
  Software: null,
};

const MIN_WIDTH = 400;
const MIN_HEIGHT = 250;
const REJECTED_EXTENSIONS = /\.(svg|pdf|tif|tiff|ogv|webm)$/i;

const cache = new Map<string, Promise<string | null>>();
const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function searchCommonsOnce(query: string): Promise<string | null> {
  const endpoint =
    "https://commons.wikimedia.org/w/api.php" +
    "?action=query&generator=search&gsrnamespace=6&gsrlimit=5" +
    `&gsrsearch=${encodeURIComponent(`"${query}" filetype:bitmap`)}` +
    "&prop=imageinfo&iiprop=url|size&iiurlwidth=600" +
    "&format=json&origin=*";

  const res = await fetchWithTimeout(endpoint, FETCH_TIMEOUT_MS);
  if (!res.ok) return null;
  const data = (await res.json()) as CommonsResponse;
  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const url = info.url ?? "";
    if (REJECTED_EXTENSIONS.test(url)) continue;
    if ((info.width ?? 0) < MIN_WIDTH || (info.height ?? 0) < MIN_HEIGHT) continue;
    if (info.thumburl) return info.thumburl;
    if (info.url) return info.url;
  }
  return null;
}

/**
 * Resolves a real internet photo for a product — but ONLY for the curated
 * categories above. Earlier versions also fell back to searching the raw
 * category label or the product name directly, which occasionally matched
 * something completely unrelated and unprofessional (a random portrait, an
 * unrelated object, etc.) for uncategorized or Excel-imported products.
 * That fallback is intentionally removed: any category not in the curated
 * map returns null immediately, so the caller shows the safe icon
 * placeholder instead of gambling on a loose text match.
 */
export function findProductPhoto(_name: string, category?: string): Promise<string | null> {
  const mapped = category ? CATEGORY_QUERY[category] : undefined;
  if (!mapped) return Promise.resolve(null); // unknown category, or explicitly null (e.g. Software) — always use the placeholder

  const key = mapped.toLowerCase();
  if (!cache.has(key)) {
    cache.set(key, searchCommonsOnce(mapped).catch(() => null));
  }
  return cache.get(key)!;
}
