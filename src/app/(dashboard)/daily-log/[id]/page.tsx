import { notFound } from "next/navigation";
import { LogDetail } from "@/components/daily-log/log-detail";
import { readStore } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function DailyLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readStore();
  const log = data.dailyLogs.find((item) => item.id === id);
  if (!log) notFound();
  return <LogDetail log={log} />;
}
