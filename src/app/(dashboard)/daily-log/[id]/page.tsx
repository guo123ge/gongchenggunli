import { notFound } from "next/navigation";
import { LogDetail } from "@/components/daily-log/log-detail";
import { findDailyLog } from "@/lib/mock-data";

export default async function DailyLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = findDailyLog(id);
  if (!log) notFound();
  return <LogDetail log={log} />;
}

