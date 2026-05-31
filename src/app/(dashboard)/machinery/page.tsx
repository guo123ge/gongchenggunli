import Link from "next/link";
import { MachineryBoard } from "@/components/machinery/machinery-board";
import { Button } from "@/components/ui/button";
import { machinery } from "@/lib/mock-data";

export default function MachineryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-3xl font-black text-white">机械管理</h1><p className="mt-2 text-muted">在场、保养中、退场、维修与台班记录。</p></div>
        <Link href="/machinery/new"><Button>机械进场</Button></Link>
      </div>
      <MachineryBoard items={machinery} />
    </div>
  );
}

