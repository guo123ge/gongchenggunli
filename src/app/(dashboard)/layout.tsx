import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/lib/auth";
import { readAppData } from "@/lib/app-data";
import { calculateDashboardSummary } from "@/lib/server-store";
import type { ProjectRole } from "@/types/enums";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, data] = await Promise.all([auth(), readAppData()]);
  const currentUser = {
    displayName: session?.user?.name ?? "演示用户",
    role: (session?.user?.role ?? "CON") as ProjectRole,
  };
  const summary = calculateDashboardSummary(data);

  return (
    <div className="construction-grid min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar currentUser={currentUser} project={data.project} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar currentUserName={currentUser.displayName} project={data.project} summary={summary} />
          <main className="flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-8">{children}</main>
        </div>
      </div>
      <MobileNav />
      <AiChatPanel />
    </div>
  );
}
