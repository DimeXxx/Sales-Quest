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
// with — far more reliable than searching the raw category label.
const CATEGORY_QUERY: Record<string, string> = {
  storage: "hard disk drive",
  "ip camera": "IP security camera",
  nvr: "network video recorder",
  "access control": "access control keypad",
  "ptz camera": "PTZ security camera",
};

// Software (and similar categories with no sensible product photo) is
// intentionally excluded from CATEGORY_QUERY — it always falls through to
// the placeholder icon.

// Keyword detection scanned against BOTH the category and the product name.
// Order matters: more specific patterns (PTZ, NVR, access control) are
// checked before the generic "camera" pattern so a PTZ camera doesn't get
// matched as a plain IP camera. Every match still only ever produces one of
// the fixed, vetted queries above — we never search the user's raw text
// directly, which is what caused unrelated/unprofessional photos before.
const KEYWORD_PATTERNS: { pattern: RegExp; query: string }[] = [
  { pattern: /ptz/i, query: CATEGORY_QUERY["ptz camera"] },
  { pattern: /nvr|видеорегистратор|регистратор/i, query: CATEGORY_QUERY.nvr },
  { pattern: /access\s*control|контрол[ьяию].*доступ|keypad|access\s*terminal/i, query: CATEGORY_QUERY["access control"] },
  { pattern: /hdd|hard\s*disk|storage|жёстк|жестк|диск/i, query: CATEGORY_QUERY.storage },
  { pattern: /camera|видеокамер|камера|ipc\b/i, query: CATEGORY_QUERY["ip camera"] },
];

function resolveQuery(name: string, category?: string): string | null {
  const normalizedCategory = category?.trim().toLowerCase() ?? "";
  if (normalizedCategory && normalizedCategory in CATEGORY_QUERY) {
    return CATEGORY_QUERY[normalizedCategory];
  }
  if (normalizedCategory === "software") return null; // never search for this one

  const haystack = `${category ?? ""} ${name ?? ""}`;
  for (const { pattern, query } of KEYWORD_PATTERNS) {
    if (pattern.test(haystack)) return query;
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
