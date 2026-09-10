import { Check, Sparkles, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  title: string;
  subtitle?: string;
  kind?: "success" | "error" | "levelup";
}

export function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="pointer-events-none fixed top-5 right-5 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const kind = toast.kind ?? "success";
  const tone =
    kind === "error"
      ? { border: "border-rose-500/40", icon: "bg-rose-500/20 text-rose-400", Icon: X }
      : kind === "levelup"
      ? { border: "border-violet-500/40", icon: "bg-violet-500/20 text-violet-300", Icon: Sparkles }
      : { border: "border-emerald-500/40", icon: "bg-emerald-500/20 text-emerald-400", Icon: Check };

  return (
    <div
      className={`pointer-events-auto flex min-w-[240px] items-center gap-3 rounded-xl border ${tone.border} bg-[#111923]/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-[toastIn_0.3s_ease-out]`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
        <tone.Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#F5F7FA]">{toast.title}</p>
        {toast.subtitle && <p className="text-xs text-[#8B98A9]">{toast.subtitle}</p>}
      </div>
    </div>
  );
}
