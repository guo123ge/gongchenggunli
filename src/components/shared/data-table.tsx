import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({ columns, rows, className }: { columns: DataTableColumn<T>[]; rows: T[]; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr key={index} className="bg-panel/40 text-slate-200">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

