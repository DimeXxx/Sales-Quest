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
 * Resolves a real internet photo for a product. Tries the curated category
 * phrase first (best relevance), then falls back to the raw category, then
 * to the product name. Results are cached per lookup key for the tab's
 * lifetime. Returns null (never throws) if nothing suitable was found.
 */
export function findProductPhoto(name: string, category?: string): Promise<string | null> {
  const key = `${category ?? ""}::${name}`.trim().toLowerCase();
  if (!key) return Promise.resolve(null);

  if (!cache.has(key)) {
    cache.set(key, resolve());
  }
  return cache.get(key)!;

  async function resolve(): Promise<string | null> {
    const candidates: string[] = [];

    if (category && category in CATEGORY_QUERY) {
      const mapped = CATEGORY_QUERY[category];
      if (mapped === null) return null; // explicitly no sensible photo for this category
      candidates.push(mapped);
    } else if (category) {
      candidates.push(category);
    }
    if (name) candidates.push(name);

    for (const query of candidates) {
      try {
        const found = await searchCommonsOnce(query);
        if (found) return found;
      } catch {
        // try the next candidate
      }
    }
    return null;
  }
}
