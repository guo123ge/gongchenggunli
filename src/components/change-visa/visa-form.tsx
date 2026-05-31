import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantityTable } from "./quantity-table";
import { CostSummary } from "./cost-summary";

export function VisaForm() {
  return (
    <Card>
      <CardHeader><div><CardTitle>工程签证</CardTitle><CardDescription>工程量逐行录入，自动计算合价和总金额。</CardDescription></div></CardHeader>
      <QuantityTable />
      <div className="mt-4"><CostSummary /></div>
      <div className="mt-6 flex justify-end"><Button>提交签证</Button></div>
    </Card>
  );
}

