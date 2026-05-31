import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="construction-grid min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-8">{children}</main>
        </div>
      </div>
      <MobileNav />
      <AiChatPanel />
    </div>
  );
}
