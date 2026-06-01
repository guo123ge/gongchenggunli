import { notFound } from "next/navigation";
import { LogDetail } from "@/components/daily-log/log-detail";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function DailyLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await readAppData();
  const log = data.dailyLogs.find((item) => item.id === id);
  if (!log) notFound();
  return <LogDetail log={log} />;
}
