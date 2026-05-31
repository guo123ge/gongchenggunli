"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export function CommandPalette() {
  const actions = [
    { href: "/daily-log/new", label: "新建施工日志" },
    { href: "/material/stock-in/new", label: "新建材料入库" },
    { href: "/safety/hazards/new", label: "上报安全隐患" },
    { href: "/review", label: "进入审核中心" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-panel-soft p-3">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Search className="size-4" />
        <span>快捷操作</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="rounded-xl border border-border bg-panel px-3 py-2 text-sm text-slate-200 hover:border-brand/60">
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
