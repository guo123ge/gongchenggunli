export function Checklist() {
  const items = ["脚手架连墙件", "临边洞口防护", "基坑排水", "临电三级配电", "塔吊限位装置"];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-panel/60 p-3 text-sm">
          <input type="checkbox" defaultChecked className="size-4" />
          {item}
        </label>
      ))}
    </div>
  );
}

