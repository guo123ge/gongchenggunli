import Link from "next/link";
import {
  Archive,
  ClipboardCheck,
  FileClock,
  Files,
  FolderKanban,
  Gauge,
  PackageCheck,
  ShieldAlert,
  Truck,
  WalletCards,
} from "lucide-react";
import { MODULE_LABELS, ROLE_LABELS } from "@/lib/constants";
import { canView } from "@/lib/permissions";
import type { Project } from "@/types";
import type { ModuleKey, ProjectRole } from "@/types/enums";

type SidebarUser = {
  displayName: string;
  role: ProjectRole;
};

const navItems: Array<{ key: ModuleKey; href: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "dashboard", href: "/dashboard", icon: Gauge },
  { key: "project", href: "/projects", icon: FolderKanban },
  { key: "documents", href: "/documents", icon: Files },
  { key: "daily-log", href: "/daily-log", icon: FileClock },
  { key: "material", href: "/material", icon: PackageCheck },
  { key: "machinery", href: "/machinery", icon: Truck },
  { key: "safety", href: "/safety", icon: ShieldAlert },
  { key: "archive", href: "/archive", icon: Archive },
  { key: "change-visa", href: "/change-visa", icon: WalletCards },
  { key: "review", href: "/review", icon: ClipboardCheck },
];

export function Sidebar({ currentUser, project }: { currentUser: SidebarUser; project: Project }) {
  const visibleItems = navItems.filter((item) => canView(item.key, currentUser.role));

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border bg-black/25 p-5 lg:block">
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-brand text-lg font-black text-black">管</div>
        <div>
          <p className="text-sm text-muted">施工现场协同系统</p>
          <h1 className="font-bold text-white">施工现场综合管理平台</h1>
        </div>
      </Link>

      <div className="mt-6 rounded-3xl border border-border bg-panel-soft p-4">
        <p className="text-xs text-muted">当前项目</p>
        <p className="mt-2 font-semibold leading-6 text-white">{project.name}</p>
        <p className="mt-1 text-xs text-muted">{project.code}</p>
      </div>

      <nav className="mt-6 space-y-2">
        {visibleItems.map(({ key, href, icon: Icon }) => (
          <Link key={key} href={href} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
            <Icon className="size-4 text-brand/80 transition group-hover:text-brand" />
            {MODULE_LABELS[key]}
          </Link>
        ))}
      </nav>

      <div className="mt-8 rounded-3xl border border-brand/20 bg-brand-soft/40 p-4 text-sm">
        <p className="text-muted">当前登录账号</p>
        <p className="mt-1 font-semibold text-white">
          {currentUser.displayName} / {ROLE_LABELS[currentUser.role]}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted">演示账号统一密码为 123456，菜单会按当前角色自动显示。</p>
      </div>
    </aside>
  );
}
