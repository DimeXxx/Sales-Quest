interface ActivityHeatmapProps {
  activeDays: string[]; // "YYYY-MM-DD"
}

export function ActivityHeatmap({ activeDays }: ActivityHeatmapProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const activeSet = new Set(activeDays);

  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const active = activeSet.has(dateStr);
          const isToday = d === now.getDate();
          return (
            <div
              key={i}
              title={dateStr}
              className={`flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold ${
                active ? "bg-cyan-400/25 text-cyan-200" : "bg-white/[0.03] text-[#8B98A9]"
              } ${isToday ? "ring-1 ring-cyan-400/60" : ""}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
