import { useState } from "react";
import type { PersonalTask } from "../../types/sales";
import { Button } from "../ui/Button";

const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8B98A9]";

export interface PersonalTaskEditInput {
  title: string;
  description: string;
  targetSum?: number;
  targetCount?: number;
  universeCount?: number;
  deadline: string;
  xpReward: number;
  coinReward: number;
  perEntryXp: number;
  perEntryCoins: number;
}

interface PersonalTaskEditFormProps {
  task: PersonalTask;
  onSubmit: (input: PersonalTaskEditInput) => void;
}

/** Type, assignee, and target metric (sum vs count) stay fixed once a task exists — those are structural and changing them mid-flight would make existing entries meaningless. Everything else is editable. */
export function PersonalTaskEditForm({ task, onSubmit }: PersonalTaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [targetSum, setTargetSum] = useState(String(task.targetSum ?? ""));
  const [targetCount, setTargetCount] = useState(String(task.targetCount ?? ""));
  const [universeCount, setUniverseCount] = useState(String(task.universeCount ?? ""));
  const [deadline, setDeadline] = useState(task.deadline.slice(0, 10));
  const [xpReward, setXpReward] = useState(String(task.xpReward));
  const [coinReward, setCoinReward] = useState(String(task.coinReward));
  const [perEntryXp, setPerEntryXp] = useState(String(task.perEntryXp || ""));
  const [perEntryCoins, setPerEntryCoins] = useState(String(task.perEntryCoins || ""));

  const submit = () => {
    if (!title || !deadline) return;
    onSubmit({
      title,
      description,
      targetSum: task.targetType === "sum" ? Number(targetSum) || 0 : undefined,
      targetCount: task.targetType === "count" ? Number(targetCount) || 0 : undefined,
      universeCount: universeCount ? Number(universeCount) : undefined,
      deadline,
      xpReward: Number(xpReward) || 0,
      coinReward: Number(coinReward) || 0,
      perEntryXp: Number(perEntryXp) || 0,
      perEntryCoins: Number(perEntryCoins) || 0,
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#8B98A9]">
        {task.assigneeName} · {task.type === "debt_collection" ? "Дебиторка" : "Individual KPI"} ·{" "}
        {task.targetType === "sum" ? "цель — сумма" : "цель — кол-во клиентов"}
      </p>

      <div>
        <label className={label}>Название</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className={label}>Описание</label>
        <input className={field} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {task.targetType === "sum" ? (
        <div>
          <label className={label}>Целевая сумма к возврату, $</label>
          <input className={field} type="number" value={targetSum} onChange={(e) => setTargetSum(e.target.value)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Цель, кол-во клиентов</label>
            <input className={field} type="number" value={targetCount} onChange={(e) => setTargetCount(e.target.value)} />
          </div>
          <div>
            <label className={label}>Из скольких всего (опц.)</label>
            <input className={field} type="number" value={universeCount} onChange={(e) => setUniverseCount(e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className={label}>Дедлайн</label>
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

      <Button className="w-full" onClick={submit}>Сохранить</Button>
    </div>
  );
}
