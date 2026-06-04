import Link from "next/link";
import { ClipboardCheck, FileClock, Files, FolderKanban, Gauge } from "lucide-react";

const items = [
  { href: "/dashboard", label: "首页", icon: Gauge },
  { href: "/projects", label: "项目", icon: FolderKanban },
  { href: "/documents", label: "资料", icon: Files },
  { href: "/daily-log", label: "日志", icon: FileClock },
  { href: "/review", label: "审核", icon: ClipboardCheck },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-3xl border border-border bg-panel/95 p-2 shadow-2xl backdrop-blur lg:hidden">
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-muted hover:bg-white/[0.06] hover:text-white">
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
