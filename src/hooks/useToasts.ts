import { useCallback, useRef, useState } from "react";
import type { ToastMessage } from "../components/ui/Toast";

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const pushToast = useCallback((title: string, subtitle?: string, kind: ToastMessage["kind"] = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, title, subtitle, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return { toasts, pushToast };
}
