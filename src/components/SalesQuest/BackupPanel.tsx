import { useRef, useState } from "react";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useToasts } from "../../hooks/useToasts";
import { ToastStack } from "../ui/Toast";

export function BackupPanel() {
  const { toasts, pushToast } = useToasts();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);

  const downloadBackup = async () => {
    const res = await fetch("/api/admin/backup", { credentials: "include" });
    if (!res.ok) {
      pushToast("Не удалось скачать бэкап", "", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salesquest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushToast("Бэкап скачан");
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    setPendingFile(file);
  };

  const doRestore = async () => {
    if (!pendingFile) return;
    setRestoring(true);
    try {
      const text = await pendingFile.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        pushToast(
          "Не удалось восстановить",
          err.error === "not_a_backup" ? "Файл не похож на бэкап этой системы" : err.error ?? "",
          "error"
        );
        return;
      }
      const result = await res.json();
      pushToast("Данные восстановлены", `Аккаунтов: ${result.accounts} · Товаров: ${result.products} · Продаж: ${result.sales}`);
      setPendingFile(null);
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      pushToast("Не удалось восстановить", "Файл повреждён или это не JSON", "error");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-5">
      <ToastStack toasts={toasts} />

      <Card className="p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Download className="h-4 w-4 text-cyan-300" /> Скачать бэкап
        </h2>
        <p className="mb-4 text-xs text-[#8B98A9]">
          Полный снимок всех данных (менеджеры, товары, продажи, задачи, ачивки) в одном JSON-файле. Сохрани его в надёжном месте
          (Google Drive, локально) — это единственная страховка, если файл данных на сервере повредится.
        </p>
        <Button onClick={downloadBackup}>
          <Download className="h-4 w-4" /> Скачать бэкап сейчас
        </Button>
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Upload className="h-4 w-4 text-cyan-300" /> Восстановить из бэкапа
        </h2>
        <p className="mb-4 flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Полностью заменяет ВСЕ текущие данные содержимым файла. Перед восстановлением сервер сам сохранит копию текущих
          данных на диске — но лучше сначала скачай свежий бэкап сверху, если не уверен.
        </p>

        <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0])} />

        {!pendingFile ? (
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" /> Выбрать файл бэкапа
          </Button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/[0.06] p-3">
            <p className="flex-1 truncate text-xs text-[#F5F7FA]">{pendingFile.name}</p>
            <button onClick={() => setPendingFile(null)} className="text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]">
              Отмена
            </button>
            <ConfirmButton onConfirm={doRestore} variant="danger" size="sm" disabled={restoring}>
              {restoring ? "Восстанавливаю…" : "Восстановить (заменить всё)"}
            </ConfirmButton>
          </div>
        )}
      </Card>
    </div>
  );
}
