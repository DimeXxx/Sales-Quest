// Mirrors src/lib/productCategories.ts's SYNONYMS/normalizeCategory — kept
// in sync manually since the server is plain CommonJS and can't import the
// frontend's TS module directly. Used only by the admin "Пересчитать
// категории" backfill action.
const KNOWN_IDS = [
  "IP Camera", "PTZ Camera", "Thermal Camera", "NVR", "DVR", "Storage",
  "Access Control", "Video Intercom", "Alarm", "Network Switch",
  "Power Supply", "Cable", "Monitor", "Software", "Mount", "General",
];

const SYNONYMS = [
  { pattern: /ptz/i, categoryId: "PTZ Camera" },
  { pattern: /thermal|тепловизор|термо/i, categoryId: "Thermal Camera" },
  { pattern: /видеокамер|ip.?камер|камер|camera/i, categoryId: "IP Camera" },
  { pattern: /nvr|видеорегистратор/i, categoryId: "NVR" },
  { pattern: /\bdvr\b/i, categoryId: "DVR" },
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

function normalizeCategory(raw) {
  if (!raw) return "General";
  const exact = KNOWN_IDS.find((id) => id.toLowerCase() === raw.trim().toLowerCase());
  if (exact) return exact;
  for (const { pattern, categoryId } of SYNONYMS) {
    if (pattern.test(raw)) return categoryId;
  }
  return "General";
}

// Hikvision model-line prefixes — mirrors src/lib/productCategories.ts's
// SKU_PREFIXES. Used by the admin "Пересчитать категории" backfill to
// reclassify products still stuck on "General" using their SKU, which is a
// much stronger signal than free-text category/name for this catalog.
const SKU_PREFIXES = [
  { pattern: /^i?DS-2CV/i, categoryId: "IP Camera" },
  { pattern: /^i?DS-2CD/i, categoryId: "IP Camera" },
  { pattern: /^i?DS-2CE/i, categoryId: "IP Camera" },
  { pattern: /^i?DS-2XM/i, categoryId: "IP Camera" },
  { pattern: /^i?DS-2DE/i, categoryId: "PTZ Camera" },
  { pattern: /^i?DS-2TD/i, categoryId: "Thermal Camera" },
  { pattern: /^i?DS-7\d{3}.*NI/i, categoryId: "NVR" },
  { pattern: /^i?DS-7\d{3}.*(HI|HGHI|HQHI|HUHI)/i, categoryId: "DVR" },
  { pattern: /^i?DS-K1|^i?DS-K2|^i?DS-K3/i, categoryId: "Access Control" },
  { pattern: /^i?DS-PDT|^i?DS-PD|^i?DS-PM|^i?DS-PWA|^i?DS-PHI/i, categoryId: "Alarm" },
  { pattern: /^i?DS-KIS|^i?DS-KV|^i?DS-KH|^i?DS-KD/i, categoryId: "Video Intercom" },
  { pattern: /^i?DS-3/i, categoryId: "Network Switch" }, // 3E/3T switches, 3WF wireless bridges — all networking gear
  { pattern: /^i?DS-D5/i, categoryId: "Monitor" }, // display/monitor line
];

function categoryFromSku(sku) {
  if (!sku) return null;
  for (const { pattern, categoryId } of SKU_PREFIXES) {
    if (pattern.test(sku)) return categoryId;
  }
  return null;
}

module.exports = { normalizeCategory, categoryFromSku, KNOWN_IDS };
