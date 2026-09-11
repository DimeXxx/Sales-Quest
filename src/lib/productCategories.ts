// ---------------------------------------------------------------------------
// The full list of product categories this app understands. Each has a
// fixed, vetted photo-search phrase (or `null` if no generic photo makes
// sense for it — e.g. a software license). Both the admin's category
// dropdown AND the live Wikimedia photo search read from this single list,
// so picking a category always gets you a reliable, on-topic photo instead
// of relying on guessing keywords out of a free-text field.
// ---------------------------------------------------------------------------

export interface ProductCategory {
  id: string; // stored on the product, shown to managers
  label: string; // shown in the admin dropdown (same as id here, kept separate for clarity)
  searchQuery: string | null; // null = always show the placeholder icon, never search
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "IP Camera", label: "IP Camera", searchQuery: "IP security camera" },
  { id: "PTZ Camera", label: "PTZ Camera", searchQuery: "PTZ security camera" },
  { id: "Thermal Camera", label: "Thermal Camera", searchQuery: "thermal imaging camera" },
  { id: "NVR", label: "NVR", searchQuery: "network video recorder" },
  { id: "DVR", label: "DVR", searchQuery: "digital video recorder" },
  { id: "Storage", label: "Storage (HDD)", searchQuery: "hard disk drive" },
  { id: "Access Control", label: "Access Control", searchQuery: "access control keypad" },
  { id: "Video Intercom", label: "Video Intercom", searchQuery: "video door intercom" },
  { id: "Alarm", label: "Alarm System", searchQuery: "burglar alarm control panel" },
  { id: "Network Switch", label: "Network Switch", searchQuery: "network switch PoE" },
  { id: "Power Supply", label: "Power Supply", searchQuery: "power supply unit" },
  { id: "Cable", label: "Cable & Accessories", searchQuery: "network cable" },
  { id: "Monitor", label: "Monitor / Display", searchQuery: "computer monitor" },
  { id: "Software", label: "Software / License", searchQuery: null },
  { id: "Mount", label: "Mounts & Brackets", searchQuery: null },
  { id: "General", label: "General / Other", searchQuery: null },
];

const BY_ID = new Map(PRODUCT_CATEGORIES.map((c) => [c.id.toLowerCase(), c]));

/** Case-insensitive lookup by category id/label. */
export function findCategory(id?: string): ProductCategory | undefined {
  if (!id) return undefined;
  return BY_ID.get(id.trim().toLowerCase());
}

// Common Russian/English synonyms seen in supplier spreadsheets, mapped to
// our fixed category ids — used only when importing free-text category
// columns from Excel, so a sheet that says "Камеры" or "IP-камеры" still
// lands on a real bucket instead of falling through to "General".
const SYNONYMS: { pattern: RegExp; categoryId: string }[] = [
  { pattern: /ptz/i, categoryId: "PTZ Camera" },
  { pattern: /thermal|тепловизор|термо/i, categoryId: "Thermal Camera" },
  { pattern: /видеокамер|ip.?камер|камер|camera/i, categoryId: "IP Camera" },
  { pattern: /nvr|видеорегистратор/i, categoryId: "NVR" },
  { pattern: /dvr/i, categoryId: "DVR" },
  { pattern: /hdd|жёстк|жестк|storage|диск/i, categoryId: "Storage" },
  { pattern: /домофон|интерком|intercom/i, categoryId: "Video Intercom" },
  { pattern: /access|доступ|контрол/i, categoryId: "Access Control" },
  { pattern: /alarm|сигнализ|охран|датчик|sensor|detector/i, categoryId: "Alarm" },
  { pattern: /switch|коммутатор/i, categoryId: "Network Switch" },
  { pattern: /power|блок питания|бп\b/i, categoryId: "Power Supply" },
  { pattern: /cable|кабел/i, categoryId: "Cable" },
  { pattern: /monitor|монитор|дисплей/i, categoryId: "Monitor" },
  { pattern: /software|лицензи|license/i, categoryId: "Software" },
  { pattern: /mount|кронштейн|крепление/i, categoryId: "Mount" },
];

/** Maps a free-text category (e.g. from an Excel column) onto one of our fixed buckets, or "General" if nothing matches. */
export function normalizeCategory(raw: string): string {
  if (!raw) return "General";
  if (findCategory(raw)) return findCategory(raw)!.id; // already an exact match
  for (const { pattern, categoryId } of SYNONYMS) {
    if (pattern.test(raw)) return categoryId;
  }
  return "General";
}

// Hikvision's own model-line prefixes encode the product type reliably —
// far more reliable than guessing from a marketing name or description,
// since a whole catalog of "DS-..." SKUs otherwise gives us nothing to go
// on. Order matters: longer/more specific prefixes are checked first (e.g.
// DS-2CV before the more general DS-2C., DS-PDT before DS-PD).
const SKU_PREFIXES: { pattern: RegExp; categoryId: string }[] = [
  { pattern: /^i?DS-2CV/i, categoryId: "IP Camera" }, // Wi-Fi / consumer line
  { pattern: /^i?DS-2CD/i, categoryId: "IP Camera" }, // network camera
  { pattern: /^i?DS-2CE/i, categoryId: "IP Camera" }, // Turbo HD / analog camera
  { pattern: /^i?DS-2XM/i, categoryId: "IP Camera" }, // mini/mobile camera
  { pattern: /^i?DS-2DE/i, categoryId: "PTZ Camera" },
  { pattern: /^i?DS-2TD/i, categoryId: "Thermal Camera" },
  { pattern: /^i?DS-7\d{3}.*NI/i, categoryId: "NVR" }, // e.g. DS-7608NI-K2
  { pattern: /^i?DS-7\d{3}.*(HI|HGHI|HQHI|HUHI)/i, categoryId: "DVR" },
  { pattern: /^i?DS-K1|^i?DS-K2|^i?DS-K3/i, categoryId: "Access Control" }, // terminals & controllers
  { pattern: /^i?DS-PDT|^i?DS-PD|^i?DS-PM|^i?DS-PWA|^i?DS-PHI/i, categoryId: "Alarm" }, // PIR/microwave detectors, alarm accessories
  { pattern: /^i?DS-KIS|^i?DS-KV|^i?DS-KH|^i?DS-KD/i, categoryId: "Video Intercom" }, // door stations, indoor monitors
  { pattern: /^i?DS-3/i, categoryId: "Network Switch" }, // 3E/3T switches, 3WF wireless bridges — all networking gear
  { pattern: /^i?DS-D5/i, categoryId: "Monitor" }, // display/monitor line
];

/** Best-effort category from a Hikvision-style SKU prefix, or null if it doesn't match a known line. */
export function categoryFromSku(sku: string): string | null {
  if (!sku) return null;
  for (const { pattern, categoryId } of SKU_PREFIXES) {
    if (pattern.test(sku)) return categoryId;
  }
  return null;
}
