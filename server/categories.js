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
  { pattern: /alarm|сигнализ|охран/i, categoryId: "Alarm" },
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

module.exports = { normalizeCategory, KNOWN_IDS };
