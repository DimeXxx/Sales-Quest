import { Check, Clock, X } from "lucide-react";
import type { Manager } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

interface PendingApprovalsPanelProps {
  pending: Manager[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingApprovalsPanel({ pending, onApprove, onReject }: PendingApprovalsPanelProps) {
  const { t } = useLanguage();

  if (pending.length === 0) {
    return (
      <Card className="p-5 text-center">
        <Clock className="mx-auto mb-2 h-6 w-6 text-[#8B98A9]" />
        <p className="text-sm text-[#8B98A9]">{t("noPendingAccounts")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {pending.map((m) => (
        <Card key={m.id} className="flex items-center gap-3 border-amber-500/30 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 text-xs font-bold text-amber-200">
            {m.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#F5F7FA]">{m.name}</p>
            <p className="truncate text-[11px] text-[#8B98A9]">{m.email}</p>
          </div>
          <Button size="sm" onClick={() => onApprove(m.id)}>
            <Check className="h-3.5 w-3.5" /> {t("approve")}
          </Button>
          <ConfirmButton onConfirm={() => onReject(m.id)} variant="danger" size="sm">
            <X className="h-3.5 w-3.5" /> {t("reject")}
          </ConfirmButton>
        </Card>
      ))}
    </div>
  );
}
