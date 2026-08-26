// ---------------------------------------------------------------------------
// Pulls a real photo from the internet for a product, based on its name /
// category — no API key needed. Wikimedia Commons' API supports anonymous,
// CORS-enabled requests (origin=*), so this works directly from the browser.
// Coverage is best for generic terms (e.g. "IP camera", "hard drive", "NVR")
// rather than exact SKUs, so callers should pass a search term built from
// category + a couple of words of the product name rather than the full SKU.
// ---------------------------------------------------------------------------

interface CommonsImageInfo {
  url?: string;
  thumburl?: string;
}

interface CommonsPage {
  imageinfo?: CommonsImageInfo[];
}

interface CommonsResponse {
  query?: {
    pages?: Record<string, CommonsPage>;
  };
}

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

async function searchCommons(query: string): Promise<string | null> {
  const endpoint =
    "https://commons.wikimedia.org/w/api.php" +
    "?action=query&generator=search&gsrnamespace=6&gsrlimit=1" +
    `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}` +
    "&prop=imageinfo&iiprop=url&iiurlwidth=600" +
    "&format=json&origin=*";

  const res = await fetchWithTimeout(endpoint, FETCH_TIMEOUT_MS);
  if (!res.ok) return null;
  const data = (await res.json()) as CommonsResponse;
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url || null;
}

/**
 * Resolves a real internet photo for the given search term. Results are
 * cached per query for the lifetime of the tab so switching views doesn't
 * re-fetch. Returns null (never throws) if nothing suitable was found or the
 * request failed/timed out — callers should fall back to a placeholder.
 */
export function findProductPhoto(query: string): Promise<string | null> {
  const key = query.trim().toLowerCase();
  if (!key) return Promise.resolve(null);
  if (!cache.has(key)) {
    cache.set(
      key,
      searchCommons(key).catch(() => null)
    );
  }
  return cache.get(key)!;
}
