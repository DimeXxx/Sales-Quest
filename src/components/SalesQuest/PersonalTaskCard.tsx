import { useState } from "react";
import { Clock, DollarSign, Plus } from "lucide-react";
import type { PersonalTask } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";

interface PersonalTaskCardProps {
  task: PersonalTask;
  onSubmitEntry: (taskId: string, input: { label: string; amount?: number; note?: string }) => void;
}

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  pending: { text: "На проверке", color: "text-amber-300" },
  approved: { text: "Подтверждено", color: "text-emerald-400" },
  rejected: { text: "Отклонено", color: "text-rose-400" },
};

export function PersonalTaskCard({ task, onSubmitEntry }: PersonalTaskCardProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const dLeft = daysLeft(task.deadline);
  const pct = Math.min(100, (task.progress / Math.max(1, task.target)) * 100);
  const isSum = task.targetType === "sum";

  const submit = () => {
    if (!label) return;
    onSubmitEntry(task.id, { label, amount: amount ? Number(amount) : undefined, note: note || undefined });
    setLabel("");
    setAmount("");
    setNote("");
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300">
            {task.type === "debt_collection" ? "Дебиторка" : "Individual KPI"}
          </span>
          <p className="mt-1 text-sm font-bold text-[#F5F7FA]">{task.title}</p>
          {task.description && <p className="text-xs text-[#8B98A9]">{task.description}</p>}
        </div>
        <span className={`flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold ${task.status === "completed" ? "text-emerald-400" : task.isExpired ? "text-rose-400" : "text-[#8B98A9]"}`}>
          <Clock className="h-3 w-3" />
          {task.status === "completed" ? "Выполнено" : task.isExpired ? "Дедлайн прошёл" : `${dLeft} дн. осталось`}
        </span>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-[#8B98A9]">
        <span>
          {isSum
            ? `$${task.progress.toLocaleString()} / $${task.target.toLocaleString()}`
            : `${task.progress} / ${task.target}${task.universeCount ? ` из ${task.universeCount}` : ""}`}
        </span>
        <span className="font-mono text-cyan-300">{Math.round(pct)}%</span>
      </div>
      <Progress value={pct} colorClassName={task.status === "completed" ? "bg-emerald-400" : "bg-cyan-400"} />

      {task.entries.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-[#223044] pt-3">
          {task.entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs">
              <span className="truncate text-[#F5F7FA]">{e.label}{e.amount ? ` · $${e.amount}` : ""}</span>
              <span className={`whitespace-nowrap font-semibold ${STATUS_LABEL[e.status].color}`}>{STATUS_LABEL[e.status].text}</span>
            </div>
          ))}
        </div>
      )}

      {task.status === "active" && !task.isExpired && (
        <div className="mt-3 space-y-2 border-t border-[#223044] pt-3">
          <div className="flex gap-2">
            <input
              placeholder={isSum ? "Комментарий к оплате" : "Название клиента"}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1 rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400"
            />
            {isSum && (
              <div className="relative w-24 shrink-0">
                <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8B98A9]" />
                <input
                  type="number"
                  placeholder="Сумма"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#223044] bg-white/[0.02] py-1.5 pl-6 pr-2 text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400"
                />
              </div>
            )}
          </div>
          <input
            placeholder="Заметка (опционально)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400"
          />
          <Button size="sm" className="w-full" onClick={submit}>
            <Plus className="h-3.5 w-3.5" /> Отправить на подтверждение
          </Button>
        </div>
      )}
    </Card>
  );
}
