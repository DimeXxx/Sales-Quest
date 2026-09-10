// ---------------------------------------------------------------------------
// Pulls a real photo from the internet for a product, based on its
// category (from the shared PRODUCT_CATEGORIES registry) — no API key
// needed. Wikimedia Commons' API supports anonymous, CORS-enabled requests
// (origin=*), so this works directly from the browser.
// ---------------------------------------------------------------------------
import { findCategory } from "./productCategories";

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

// Fallback keyword scan — only used when the product's category isn't one
// of our known buckets (e.g. it's still "General" from before categories
// became a dropdown). Every match still only ever produces one of the
// fixed, vetted queries from the registry, never raw user text.
const KEYWORD_PATTERNS: { pattern: RegExp; categoryId: string }[] = [
  { pattern: /ptz/i, categoryId: "PTZ Camera" },
  { pattern: /thermal|тепловизор/i, categoryId: "Thermal Camera" },
  { pattern: /nvr|видеорегистратор|регистратор/i, categoryId: "NVR" },
  { pattern: /\bdvr\b/i, categoryId: "DVR" },
  { pattern: /домофон|intercom/i, categoryId: "Video Intercom" },
  { pattern: /access\s*control|контрол[ьяию].*доступ|keypad|access\s*terminal/i, categoryId: "Access Control" },
  { pattern: /hdd|hard\s*disk|storage|жёстк|жестк|диск/i, categoryId: "Storage" },
  {
    // Camera detection is broad on purpose: wholesale/Excel-imported catalogs
    // rarely spell out "camera" — model codes (DS-2CV/DS-2CD/IPC-), a
    // resolution spec (1080P/2MP/4MP), or "bullet"/"dome"/"indoor Wi-Fi" are
    // just as reliable a signal here.
    pattern: /camera|видеокамер|камера|ipc[-\s]|ds-2c[dv]|bullet|dome\b|colorvu|\d\s*mp\b|1080p|2k\b|4k\b/i,
    categoryId: "IP Camera",
  },
];

function resolveQuery(name: string, category?: string): string | null {
  const known = findCategory(category);
  // "General" isn't a deliberate "never search" bucket like Software/Mount —
  // it just means "no specific category was picked", so it should still
  // fall through to the name-keyword scan below rather than short-circuit.
  if (known && known.id !== "General") return known.searchQuery;

  const haystack = `${category ?? ""} ${name ?? ""}`;
  for (const { pattern, categoryId } of KEYWORD_PATTERNS) {
    if (pattern.test(haystack)) return findCategory(categoryId)?.searchQuery ?? null;
  }
  return null;
}

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
    "?action=query&generator=search&gsrnamespace=6&gsrlimit=10" +
    // No surrounding quotes: an exact-phrase match is too strict and can
    // return zero hits for a perfectly reasonable query, which — because
    // results are cached per query — then silently blanks the placeholder
    // for every product sharing that category. A normal all-terms search
    // still only ever runs one of our fixed, vetted queries (see
    // CATEGORY_QUERY), so it's just as safe, only less brittle.
    `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}` +
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
 * Resolves a real internet photo for a product. The search query is always
 * one of a small, fixed, vetted list (see CATEGORY_QUERY above) — we scan
 * the category and product name for known keywords to pick one, but never
 * search the user's raw text directly. That's what caused unrelated,
 * unprofessional photos before (a random portrait for a camera, etc.). If
 * nothing matches, the caller should show the icon placeholder instead.
 */
export function findProductPhoto(name: string, category?: string): Promise<string | null> {
  const query = resolveQuery(name, category);
  if (!query) return Promise.resolve(null);

  const key = query.toLowerCase();
  if (!cache.has(key)) {
    cache.set(key, searchCommonsOnce(query).catch(() => null));
  }
  return cache.get(key)!;
}
