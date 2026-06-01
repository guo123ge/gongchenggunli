import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AppProviders } from "./providers";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

export const metadata: Metadata = {
  title: "施工现场综合管理平台",
  description: "施工日志、材料、机械、安全、档案、变更签证一体化管理平台",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full dark">
      <body className="min-h-full bg-background text-foreground antialiased">
        <AppProviders>
          <ServiceWorkerRegister />
          {children}
          <Toaster position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
