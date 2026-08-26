import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PriorityBadge } from "../ui/Badge";
import { downloadImportTemplate, parseProductsWorkbook, type ParsedProductRow } from "../../lib/excelImport";
import { useLanguage } from "../../i18n/LanguageContext";

interface ExcelImportPanelProps {
  onImport: (rows: ParsedProductRow[]) => void;
}

export function ExcelImportPanel({ onImport }: ExcelImportPanelProps) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<ParsedProductRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const { rows } = await parseProductsWorkbook(file);
      setRows(rows);
    } finally {
      setLoading(false);
    }
  };

  const validRows = rows?.filter((r) => r.valid) ?? [];

  const confirmImport = () => {
    if (!validRows.length) return;
    onImport(validRows);
    setRows(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card glow="emerald" className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> {t("excelImport")}
        </h2>
        <button
          onClick={downloadImportTemplate}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-300"
        >
          <Download className="h-3.5 w-3.5" /> {t("excelTemplate")}
        </button>
      </div>

      {!rows && (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]">
          <Upload className="h-6 w-6 text-slate-500" />
          <p className="text-sm font-semibold text-slate-300">{t("excelDropHint")}</p>
          <p className="text-xs text-slate-600">{t("excelColumnsHint")}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}

      {loading && <p className="py-6 text-center text-sm text-slate-500">{t("excelReading")}</p>}

      {rows && !loading && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-300">{fileName}</span> · {t("excelFound")} {rows.length},{" "}
              <span className="font-semibold text-emerald-400">{validRows.length} {t("excelRowsReady")}</span>
            </p>
            <button
              onClick={() => {
                setRows(null);
                setFileName("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300"
            >
              {t("excelReset")}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-semibold">Статус</th>
                  <th className="px-3 py-2 font-semibold">Название</th>
                  <th className="px-3 py-2 font-semibold">Остаток</th>
                  <th className="px-3 py-2 font-semibold">Цена</th>
                  <th className="px-3 py-2 font-semibold">Приоритет</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{r.name || <span className="text-rose-400">{r.error}</span>}</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{r.stock}</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{r.price ? `$${r.price}` : "—"}</td>
                    <td className="px-3 py-2"><PriorityBadge priority={r.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button className="mt-4 w-full" disabled={!validRows.length} onClick={confirmImport}>
            <Upload className="h-4 w-4" /> {t("excelImportButton")} {validRows.length}
          </Button>
        </div>
      )}
    </Card>
  );
}
