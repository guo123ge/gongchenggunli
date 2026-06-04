export function RectificationFlow() {
  const steps = ["隐患上报", "整改通知", "责任人回复", "安全员复查", "关闭归档"];
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step} className="rounded-2xl border border-border bg-panel-soft p-3">
          <p className="text-xs text-brand">第 {index + 1} 步</p>
          <p className="mt-1 font-semibold text-white">{step}</p>
        </div>
      ))}
    </div>
  );
}
