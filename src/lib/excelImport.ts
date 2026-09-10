import type { Priority } from "../types/sales";
import { normalizeCategory } from "./productCategories";

export interface ParsedProductRow {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  stockAgeDays: number;
  marginPercent: number;
  cashBonus: number;
  priority: Priority;
  valid: boolean;
  error?: string;
}

// Column header aliases — matched case-insensitively, RU + EN.
const HEADER_ALIASES: Record<keyof Omit<ParsedProductRow, "valid" | "error" | "priority">, string[]> = {
  name: ["name", "название", "наименование", "товар", "продукт"],
  sku: ["sku", "артикул", "код"],
  description: ["description", "описание", "desc"],
  category: ["category", "категория"],
  price: ["price", "цена", "стоимость"],
  stock: ["stock", "остаток", "qty", "quantity", "количество"],
  stockAgeDays: ["stockagedays", "stock age", "возраст остатка", "дней на складе", "age"],
  marginPercent: ["margin", "маржа", "margin %", "маржа %"],
  cashBonus: ["cash bonus", "денежный бонус", "$ бонус", "бонус $", "бонус за шт", "бонус", "cashbonus"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parses a number from a cell that might contain currency symbols, commas, or spaces (e.g. "$189", "1 200", "189,00"). */
function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[^0-9.,-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function findColumn(headers: string[], aliases: string[]): string | undefined {
  const normalized = headers.map(normalizeHeader);
  // Exact match first (most reliable), then fall back to "header contains
  // alias" so variants like "Цена, $" or "Price (USD)" still match "цена"/"price".
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return headers[idx];
  }
  for (const alias of aliases) {
    const idx = normalized.findIndex((h) => h.includes(alias));
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

function guessPriority(stock: number, marginPercent: number, hasMargin: boolean): Priority {
  // Stock volume drives the tier — that's the app's core "clear the overstock"
  // signal and is always available. Margin only matters if the sheet
  // actually had that column; a MISSING margin must never be treated as a
  // 0% margin (that used to force everything to "critical").
  if (stock >= 100) return "critical";
  if (stock >= 40 || (hasMargin && marginPercent >= 25)) return "high";
  return "normal";
}

export async function parseProductsWorkbook(file: File): Promise<{ rows: ParsedProductRow[]; sheetName: string }> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (raw.length === 0) return { rows: [], sheetName };

  const headers = Object.keys(raw[0]);
  const colMap = {
    name: findColumn(headers, HEADER_ALIASES.name),
    sku: findColumn(headers, HEADER_ALIASES.sku),
    description: findColumn(headers, HEADER_ALIASES.description),
    category: findColumn(headers, HEADER_ALIASES.category),
    price: findColumn(headers, HEADER_ALIASES.price),
    stock: findColumn(headers, HEADER_ALIASES.stock),
    stockAgeDays: findColumn(headers, HEADER_ALIASES.stockAgeDays),
    marginPercent: findColumn(headers, HEADER_ALIASES.marginPercent),
    cashBonus: findColumn(headers, HEADER_ALIASES.cashBonus),
  };

  const rows: ParsedProductRow[] = raw.map((r) => {
    const name = colMap.name ? String(r[colMap.name] ?? "").trim() : "";
    const sku = colMap.sku ? String(r[colMap.sku] ?? "").trim() : "";
    const description = colMap.description ? String(r[colMap.description] ?? "").trim() : "";
    const category = normalizeCategory(colMap.category ? String(r[colMap.category] ?? "").trim() : "");
    const price = colMap.price ? parseNumber(r[colMap.price]) : 0;
    const stock = colMap.stock ? parseNumber(r[colMap.stock]) : 0;
    const stockAgeDays = colMap.stockAgeDays ? parseNumber(r[colMap.stockAgeDays]) : 0;
    const marginPercent = colMap.marginPercent ? parseNumber(r[colMap.marginPercent]) : 0;
    const hasMargin = Boolean(colMap.marginPercent);
    const cashBonus = colMap.cashBonus ? parseNumber(r[colMap.cashBonus]) : 0;

    const priority = guessPriority(stock, marginPercent, hasMargin);
    const valid = Boolean(name && stock >= 0);

    return {
      name,
      sku: sku || `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      description: description || "Импортировано из Excel",
      category: category || "General",
      price,
      stock,
      stockAgeDays,
      marginPercent,
      cashBonus,
      priority,
      valid,
      error: valid ? undefined : "Не найдено название или остаток",
    };
  });

  return { rows, sheetName };
}

/** Generates a starter .xlsx template so the ROP knows the expected columns. */
export async function downloadImportTemplate() {
  const XLSX = await import("xlsx");
  const sample = [
    {
      Название: "Hikvision DS-2CD1043G0-I",
      Артикул: "IPC-1043G0",
      Описание: "2MP IP-камера с ИК-подсветкой до 30м",
      Категория: "IP Camera",
      Цена: 62,
      Остаток: 45,
      "Дней на складе": 60,
      "Маржа %": 16,
      "Денежный бонус $": 5,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample);
  ws["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 36 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "sales-quest-import-template.xlsx");
}
