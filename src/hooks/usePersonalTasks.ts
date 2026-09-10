import { useCallback, useEffect, useState } from "react";
import type { PersonalTask } from "../types/sales";
import { api } from "../lib/api";
import type { ToastMessage } from "../components/ui/Toast";

interface UsePersonalTasksArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
}

export function usePersonalTasks({ pushToast }: UsePersonalTasksArgs) {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);

  const refetch = useCallback(async () => {
    const { tasks } = await api.get<{ tasks: PersonalTask[] }>("/my-personal-tasks");
    setTasks(tasks);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const submitEntry = useCallback(
    async (taskId: string, input: { label: string; amount?: number; note?: string }) => {
      await api.post(`/personal-tasks/${taskId}/entries`, input);
      pushToast("Отправлено на подтверждение", "РОП увидит это в своей панели");
      await refetch();
    },
    [refetch, pushToast]
  );

  return { tasks, submitEntry, refetch };
}
