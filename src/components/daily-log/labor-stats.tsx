import type { DailyLog } from "@/types";

export function LaborStats({ log }: { log: DailyLog }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {log.laborDetail.map((item) => (
        <div key={item.type} className="rounded-2xl border border-border bg-panel/60 p-4">
          <p className="text-sm text-muted">{item.type}</p>
          <p className="mt-2 text-2xl font-black text-white">{item.count}</p>
        </div>
      ))}
    </div>
  );
}

