import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface ConfirmButtonProps {
  onConfirm: () => void;
  children: ReactNode;
  variant?: "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

/**
 * First click arms the button and shows a "Точно?/Sigur?" confirmation
 * label for 3 seconds; a second click within that window fires onConfirm.
 * Letting the window elapse disarms it again. Used for destructive reset
 * actions so a stray click can't wipe data — no native browser confirm().
 */
export function ConfirmButton({ onConfirm, children, variant = "danger", size = "sm", className = "", disabled = false }: ConfirmButtonProps) {
  const { t } = useLanguage();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
    >
      {armed ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" /> {t("confirmAgain")}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
