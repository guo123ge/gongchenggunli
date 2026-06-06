"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  async function logout() {
    await signOut({
      callbackUrl: "/login?callbackUrl=%2Fdashboard",
      redirect: true,
    });
  }

  return (
    <Button type="button" variant="secondary" className={compact ? "size-10 p-0" : "w-full gap-2"} onClick={logout} aria-label="退出系统">
      <LogOut className="size-4" />
      {!compact && "退出系统"}
    </Button>
  );
}
