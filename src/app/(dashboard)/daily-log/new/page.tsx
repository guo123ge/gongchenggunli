import { LogForm } from "@/components/daily-log/log-form";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function NewDailyLogPage() {
  const data = await readAppData();
  return <LogForm project={data.project} />;
}
