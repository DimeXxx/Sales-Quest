import { useState } from "react";
import { Calendar, Check, ClipboardList, Trash2, Users, X } from "lucide-react";
import type { Manager, PersonalTask } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { ConfirmButton } from "../ui/ConfirmButton";

interface PersonalTasksPanelProps {
  tasks: PersonalTask[];
  managers: Manager[];
  onCreate: (input: {
    type: "debt_collection" | "individual_kpi";
    title: string;
    description: string;
    assigneeIds: string[];
    targetType: "sum" | "count";
    targetSum?: number;
    targetCount?: number;
    universeCount?: number;
    deadline: string;
    xpReward: number;
    coinReward: number;
    perEntryXp: number;
    perEntryCoins: number;
  }) => void;
  onDelete: (id: string) => void;
  onApproveEntry: (taskId: string, entryId: string) => void;
  onRejectEntry: (taskId: string, entryId: string) => void;
}

const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8B98A9]";

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function PersonalTasksPanel({ tasks, managers, onCreate, onDelete, onApproveEntry, onRejectEntry }: PersonalTasksPanelProps) {
  const [type, setType] = useState<"debt_collection" | "individual_kpi">("debt_collection");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<"sum" | "count">("sum");
  const [targetSum, setTargetSum] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [universeCount, setUniverseCount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [xpReward, setXpReward] = useState("");
  const [coinReward, setCoinReward] = useState("");
  const [perEntryXp, setPerEntryXp] = useState("");
  const [perEntryCoins, setPerEntryCoins] = useState("");

  const toggleAssignee = (id: string) =>
    setAssigneeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = () => {
    if (!title || assigneeIds.length === 0 || !deadline) return;
    onCreate({
      type,
      title,
      description,
      assigneeIds,
      targetType,
      targetSum: targetType === "sum" ? Number(targetSum) || 0 : undefined,
      targetCount: targetType === "count" ? Number(targetCount) || 0 : undefined,
      universeCount: universeCount ? Number(universeCount) : undefined,
      deadline,
      xpReward: Number(xpReward) || 0,
      coinReward: Number(coinReward) || 0,
      perEntryXp: Number(perEntryXp) || 0,
      perEntryCoins: Number(perEntryCoins) || 0,
    });
    setTitle("");
    setDescription("");
    setAssigneeIds([]);
    setTargetSum("");
    setTargetCount("");
    setUniverseCount("");
    setDeadline("");
    setXpReward("");
    setCoinReward("");
    setPerEntryXp("");
    setPerEntryCoins("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <ClipboardList className="h-4 w-4 text-cyan-300" /> Личные задачи (ДЗ / KPI)
        </h2>

        {tasks.map((t) => {
          const pending = t.entries.filter((e) => e.status === "pending");
          const dLeft = daysLeft(t.deadline);
          return (
            <Card key={t.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#F5F7FA]">{t.title}</p>
                  <p className="text-[11px] text-[#8B98A9]">{t.assigneeName} · {t.type === "debt_collection" ? "Дебиторка" : "Individual KPI"}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase ${t.status === "completed" ? "text-emerald-400" : t.isExpired ? "text-rose-400" : "text-[#8B98A9]"}`}>
                    {t.status === "completed" ? "Готово" : t.isExpired ? "Просрочено" : `${dLeft} дн.`}
                  </span>
                  <ConfirmButton onConfirm={() => onDelete(t.id)} variant="danger" size="sm" className="!p-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </ConfirmButton>
                </div>
              </div>

              <div className="mb-1 flex items-center justify-between text-xs text-[#8B98A9]">
                <span>{t.targetType === "sum" ? `$${t.progress.toLocaleString()} / $${t.target.toLocaleString()}` : `${t.progress} / ${t.target}${t.universeCount ? ` из ${t.universeCount}` : ""}`}</span>
                <span className="font-mono text-cyan-300">{Math.min(100, Math.round((t.progress / Math.max(1, t.target)) * 100))}%</span>
              </div>
              <Progress value={(t.progress / Math.max(1, t.target)) * 100} colorClassName="bg-cyan-400" />

              {pending.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[#223044] pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-300">Ожидают подтверждения</p>
                  {pending.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#F5F7FA]">{e.label}{e.amount ? ` · $${e.amount}` : ""}</p>
                        {e.note && <p className="truncate text-[11px] text-[#8B98A9]">{e.note}</p>}
                      </div>
                      <button onClick={() => onApproveEntry(t.id, e.id)} className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onRejectEntry(t.id, e.id)} className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-300 hover:bg-rose-500/20">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
        {tasks.length === 0 && <p className="py-8 text-center text-sm text-[#8B98A9]">Нет личных задач — создай справа</p>}
      </div>

      <div className="lg:col-span-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-bold text-[#F5F7FA]">Новая задача</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setType("debt_collection")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${type === "debt_collection" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] text-[#8B98A9]"}`}>
                Дебиторка
              </button>
              <button onClick={() => setType("individual_kpi")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${type === "individual_kpi" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] text-[#8B98A9]"}`}>
                Individual KPI
              </button>
            </div>

            <div>
              <label className={label}>Название</label>
              <input className={field} placeholder="Выбить $10,000 ДЗ" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className={label}>Описание</label>
              <input className={field} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className={label}><Users className="mr-1 inline h-3 w-3" /> Исполнители</label>
              <div className="flex flex-wrap gap-1.5">
                {managers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${assigneeIds.includes(m.id) ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] text-[#8B98A9]"}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTargetType("sum")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${targetType === "sum" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] text-[#8B98A9]"}`}>
                Сумма $
              </button>
              <button onClick={() => setTargetType("count")} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${targetType === "count" ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] text-[#8B98A9]"}`}>
                Кол-во клиентов
              </button>
            </div>

            {targetType === "sum" ? (
              <div>
                <label className={label}>Целевая сумма к возврату, $</label>
                <input className={field} type="number" placeholder="10000" value={targetSum} onChange={(e) => setTargetSum(e.target.value)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={label}>Цель, кол-во клиентов</label>
                  <input className={field} type="number" placeholder="10" value={targetCount} onChange={(e) => setTargetCount(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Из скольких всего (опц.)</label>
                  <input className={field} type="number" placeholder="20" value={universeCount} onChange={(e) => setUniverseCount(e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <label className={label}><Calendar className="mr-1 inline h-3 w-3" /> Дедлайн</label>
              <input className={field} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>XP за выполнение</label>
                <input className={field} type="number" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
              </div>
              <div>
                <label className={label}>Coins за выполнение</label>
                <input className={field} type="number" value={coinReward} onChange={(e) => setCoinReward(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>XP за клиента (опц.)</label>
                <input className={field} type="number" value={perEntryXp} onChange={(e) => setPerEntryXp(e.target.value)} />
              </div>
              <div>
                <label className={label}>Coins за клиента (опц.)</label>
                <input className={field} type="number" value={perEntryCoins} onChange={(e) => setPerEntryCoins(e.target.value)} />
              </div>
            </div>

            <Button className="w-full" onClick={submit}>Назначить задачу</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
