import { QuantityForm } from "@/components/quantity/quantity-form";
import { readAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function NewQuantityPage() {
  const data = await readAppData();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-brand">工程量</p>
        <h1 className="mt-2 text-3xl font-black text-white">新建工程量</h1>
        <p className="mt-2 text-muted">建立当前项目的实体工程量台账，后续按完成量更新进度。</p>
      </div>
      <QuantityForm project={data.project} />
    </div>
  );
}
