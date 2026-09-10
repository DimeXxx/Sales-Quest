import { useState } from "react";
import { Target } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

export interface TeamChallengeInput {
  title: string;
  description: string;
  targetSku: string;
  targetQuantity: number;
  deadline: string; // ISO
  reward: string;
}

interface TeamChallengeFormProps {
  initial?: TeamChallengeInput;
  onSubmit: (input: TeamChallengeInput) => void;
  submitLabel: string;
}

function toDatetimeLocal(iso?: string): string {
  const d = iso ? new Date(iso) : new Date(Date.now() + 48 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TeamChallengeForm({ initial, onSubmit, submitLabel }: TeamChallengeFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [targetSku, setTargetSku] = useState(initial?.targetSku ?? "");
  const [targetQuantity, setTargetQuantity] = useState(String(initial?.targetQuantity ?? ""));
  const [deadline, setDeadline] = useState(toDatetimeLocal(initial?.deadline));
  const [reward, setReward] = useState(initial?.reward ?? "");

  const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";

  const submit = () => {
    if (!title || !targetSku || !targetQuantity) return;
    onSubmit({
      title,
      description,
      targetSku,
      targetQuantity: Number(targetQuantity) || 0,
      deadline: new Date(deadline).toISOString(),
      reward,
    });
  };

  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
        <Target className="h-4 w-4 text-cyan-300" /> {t("bossFight")}
      </h2>
      <div className="space-y-3">
        <input className={field} placeholder="Название (напр. Слить остаток X)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={field} placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="SKU товара" value={targetSku} onChange={(e) => setTargetSku(e.target.value)} />
          <input className={field} type="number" placeholder="Цель, шт" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
        </div>
        <input className={field} type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <input className={field} placeholder="Награда (напр. 🍕 Пицца для отдела)" value={reward} onChange={(e) => setReward(e.target.value)} />
        <Button className="w-full" onClick={submit}>{submitLabel}</Button>
      </div>
    </Card>
  );
}
