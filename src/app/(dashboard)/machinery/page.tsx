import Link from "next/link";
import { MachineryBoard } from "@/components/machinery/machinery-board";
import { Button } from "@/components/ui/button";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function MachineryPage() {
  const data = await readAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">机械管理</h1>
          <p className="mt-2 text-muted">覆盖进退场、保养、维修与台班记录。</p>
        </div>
        <Link href="/machinery/new"><Button>机械进场</Button></Link>
      </div>
      <MachineryBoard items={data.machinery} />
    </div>
  );
}
